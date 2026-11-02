import type { Query, Row } from './db';

// Dashboard numbers for /admin, computed in SQL. Pure: takes a query function so it
// can be tested against any Postgres.

export type Named = { name: string; [k: string]: string | number };
export type Stats = {
  since: string;
  totals: { visitors: number; pageviews: number; visits: number; leads: number; completed: number };
  previous: { visitors: number; pageviews: number; leads: number; completed: number };
  daily: { day: string; visitors: number; pageviews: number; leads_email: number; leads_details: number }[];
  sources: { source: string; visits: number; visitors: number; leads: number; completed: number }[];
  referrers: Named[]; campaigns: Named[]; pages: Named[]; landing: Named[]; countries: Named[]; cities: Named[]; devices: Named[]; browsers: Named[];
};

const n = (v: unknown) => Number(v) || 0;
const named = (rows: Row[], key: string): Named[] => rows.map((r) => ({ name: String(r.name), [key]: n(r[key]) }));

/** A "visit" is an entry page view (the first page of a session, which carries attribution). */
const ranked = (col: string, metric: string, where = 'true', table = 'pageviews', limit = 10) =>
  `select ${col} as name, ${metric} from ${table} where created_at >= $1 and ${col} is not null and ${col} <> '' and ${where} group by ${col} order by 2 desc, 1 limit ${limit}`;

export async function adminStats(q: Query, days: number, tz: string): Promise<Stats> {
  // Range: today (in the site's timezone) plus the previous `days - 1` full days; "previous" is the same length before it.
  const [range] = await q(
    `select (date_trunc('day', now() at time zone $2) - ($1::int - 1) * interval '1 day') at time zone $2 as since,
            (date_trunc('day', now() at time zone $2) - ($1::int * 2 - 1) * interval '1 day') at time zone $2 as prev_since`,
    [days, tz],
  );
  const since = range.since as Date;
  const prev = range.prev_since as Date;
  const sinceIso = since.toISOString();

  const period = (from: Date, to: Date | null) =>
    q(
      `select
         (select count(distinct visitor) from pageviews where created_at >= $1 and ($2::timestamptz is null or created_at < $2)) as visitors,
         (select count(*) from pageviews where created_at >= $1 and ($2::timestamptz is null or created_at < $2)) as pageviews,
         (select count(*) from pageviews where source is not null and created_at >= $1 and ($2::timestamptz is null or created_at < $2)) as visits,
         (select count(*) from leads where created_at >= $1 and ($2::timestamptz is null or created_at < $2)) as leads,
         (select count(*) from leads where stage = 'details' and created_at >= $1 and ($2::timestamptz is null or created_at < $2)) as completed`,
      [from.toISOString(), to?.toISOString() ?? null],
    ).then(([r]) => r);

  const [cur, prv, daily, sources, referrers, campaigns, pages, landing, countries, cities, devices, browsers] = await Promise.all([
    period(since, null),
    period(prev, since),
    q(
      `with d as (select generate_series(date_trunc('day', $1::timestamptz at time zone $2), date_trunc('day', now() at time zone $2), interval '1 day') as day)
       select to_char(d.day, 'YYYY-MM-DD') as day,
              (select count(distinct visitor) from pageviews p where date_trunc('day', p.created_at at time zone $2) = d.day) as visitors,
              (select count(*) from pageviews p where date_trunc('day', p.created_at at time zone $2) = d.day) as pageviews,
              (select count(*) from leads l where l.stage = 'email' and date_trunc('day', l.created_at at time zone $2) = d.day) as leads_email,
              (select count(*) from leads l where l.stage = 'details' and date_trunc('day', l.created_at at time zone $2) = d.day) as leads_details
       from d order by d.day`,
      [sinceIso, tz],
    ),
    q(
      `with v as (select source, count(*) as visits, count(distinct visitor) as visitors from pageviews where created_at >= $1 and source is not null group by source),
            l as (select coalesce(source, 'Direct') as source, count(*) as leads, count(*) filter (where stage = 'details') as completed from leads where created_at >= $1 group by 1)
       select coalesce(v.source, l.source) as source, coalesce(v.visits, 0) as visits, coalesce(v.visitors, 0) as visitors, coalesce(l.leads, 0) as leads, coalesce(l.completed, 0) as completed
       from v full outer join l on l.source = v.source
       order by visits desc, leads desc, source`,
      [sinceIso],
    ),
    q(ranked('referrer_host', 'count(*) as visits', 'source is not null'), [sinceIso]),
    q(ranked('utm_campaign', 'count(*) as visits', 'source is not null'), [sinceIso]),
    q(ranked('path', 'count(*) as views'), [sinceIso]),
    q(ranked('path', 'count(*) as visits', 'source is not null'), [sinceIso]),
    q(ranked('country', 'count(distinct visitor) as visitors'), [sinceIso]),
    q(ranked('city', 'count(distinct visitor) as visitors'), [sinceIso]),
    q(ranked('device', 'count(distinct visitor) as visitors'), [sinceIso]),
    q(ranked('browser', 'count(distinct visitor) as visitors'), [sinceIso]),
  ]);

  return {
    since: sinceIso,
    totals: { visitors: n(cur.visitors), pageviews: n(cur.pageviews), visits: n(cur.visits), leads: n(cur.leads), completed: n(cur.completed) },
    previous: { visitors: n(prv.visitors), pageviews: n(prv.pageviews), leads: n(prv.leads), completed: n(prv.completed) },
    daily: daily.map((r) => ({ day: String(r.day), visitors: n(r.visitors), pageviews: n(r.pageviews), leads_email: n(r.leads_email), leads_details: n(r.leads_details) })),
    sources: sources.map((r) => ({ source: String(r.source), visits: n(r.visits), visitors: n(r.visitors), leads: n(r.leads), completed: n(r.completed) })),
    referrers: named(referrers, 'visits'),
    campaigns: named(campaigns, 'visits'),
    pages: named(pages, 'views'),
    landing: named(landing, 'visits'),
    countries: named(countries, 'visitors'),
    cities: named(cities, 'visitors'),
    devices: named(devices, 'visitors'),
    browsers: named(browsers, 'visitors'),
  };
}
