import { query } from './db';

export type Row = { name: string; [k: string]: string | number };
export type Stats = {
  since: string;
  totals: { visitors: number; pageviews: number; visits: number; leads: number; completed: number };
  previous: { visitors: number; pageviews: number; leads: number; completed: number };
  daily: { day: string; visitors: number; pageviews: number; leads_email: number; leads_details: number }[];
  sources: { source: string; visits: number; visitors: number; leads: number; completed: number }[];
  referrers: Row[]; campaigns: Row[]; pages: Row[]; landing: Row[]; countries: Row[]; cities: Row[]; devices: Row[]; browsers: Row[];
};

// Dashboard aggregates for the last $1 calendar days in time zone $2, computed in one round trip.
const SQL = `
with bounds as (
  select (now() at time zone $2::text)::date - ($1::int - 1) as d0,
         (now() at time zone $2::text)::date as d1
),
starts as (
  select (b.d0::timestamp at time zone $2::text) as t0,
         ((b.d0 - $1::int)::timestamp at time zone $2::text) as tprev
  from bounds b
),
pv as (select p.*, (p.created_at at time zone $2::text)::date as d from pageviews p, starts s where p.created_at >= s.t0),
ld as (select l.*, (l.created_at at time zone $2::text)::date as d from leads l, starts s where l.created_at >= s.t0),
prev_pv as (select p.* from pageviews p, starts s where p.created_at >= s.tprev and p.created_at < s.t0),
prev_ld as (select l.* from leads l, starts s where l.created_at >= s.tprev and l.created_at < s.t0),
days as (select generate_series(b.d0, b.d1, interval '1 day')::date as d from bounds b),
daily as (
  select days.d as day,
    (select count(distinct visitor) from pv where pv.d = days.d)::int as visitors,
    (select count(*) from pv where pv.d = days.d)::int as pageviews,
    (select count(*) from ld where ld.d = days.d and ld.stage = 'email')::int as leads_email,
    (select count(*) from ld where ld.d = days.d and ld.stage = 'details')::int as leads_details
  from days
),
src_visits as (
  select source, count(*)::int as visits, count(distinct visitor)::int as visitors
  from pv where source is not null group by source
),
src_leads as (
  select coalesce(source, 'Direct') as source, count(*)::int as leads,
         (count(*) filter (where stage = 'details'))::int as completed
  from ld group by 1
),
sources as (
  select coalesce(v.source, l.source) as source,
         coalesce(v.visits, 0) as visits, coalesce(v.visitors, 0) as visitors,
         coalesce(l.leads, 0) as leads, coalesce(l.completed, 0) as completed
  from src_visits v full join src_leads l on l.source = v.source
)
select jsonb_build_object(
  'since', (select t0 from starts),
  'totals', jsonb_build_object(
    'visitors', (select count(distinct visitor) from pv),
    'pageviews', (select count(*) from pv),
    'visits', (select count(*) from pv where source is not null),
    'leads', (select count(*) from ld),
    'completed', (select count(*) from ld where stage = 'details')
  ),
  'previous', jsonb_build_object(
    'visitors', (select count(distinct visitor) from prev_pv),
    'pageviews', (select count(*) from prev_pv),
    'leads', (select count(*) from prev_ld),
    'completed', (select count(*) from prev_ld where stage = 'details')
  ),
  'daily', (select coalesce(jsonb_agg(to_jsonb(daily) order by day), '[]'::jsonb) from daily),
  'sources', (select coalesce(jsonb_agg(to_jsonb(s) order by s.visits desc, s.leads desc), '[]'::jsonb)
              from (select * from sources order by visits desc, leads desc limit 20) s),
  'referrers', (select coalesce(jsonb_agg(to_jsonb(r) order by r.visits desc), '[]'::jsonb) from (
      select referrer_host as name, count(*)::int as visits from pv
      where source is not null and referrer_host is not null
      group by referrer_host order by visits desc limit 15) r),
  'campaigns', (select coalesce(jsonb_agg(to_jsonb(c) order by c.visits desc), '[]'::jsonb) from (
      select utm_campaign as name, count(*)::int as visits from pv
      where utm_campaign is not null group by utm_campaign order by visits desc limit 15) c),
  'pages', (select coalesce(jsonb_agg(to_jsonb(x) order by x.views desc), '[]'::jsonb) from (
      select path as name, count(*)::int as views, count(distinct visitor)::int as visitors from pv
      group by path order by views desc limit 15) x),
  'landing', (select coalesce(jsonb_agg(to_jsonb(x) order by x.visits desc), '[]'::jsonb) from (
      select path as name, count(*)::int as visits from pv where source is not null
      group by path order by visits desc limit 10) x),
  'countries', (select coalesce(jsonb_agg(to_jsonb(x) order by x.visitors desc), '[]'::jsonb) from (
      select coalesce(country, 'Unknown') as name, count(distinct visitor)::int as visitors from pv
      group by 1 order by visitors desc limit 15) x),
  'cities', (select coalesce(jsonb_agg(to_jsonb(x) order by x.visitors desc), '[]'::jsonb) from (
      select concat_ws(', ', city, region, country) as name, count(distinct visitor)::int as visitors from pv
      where city is not null group by 1 order by visitors desc limit 15) x),
  'devices', (select coalesce(jsonb_agg(to_jsonb(x) order by x.visitors desc), '[]'::jsonb) from (
      select coalesce(device, 'Unknown') as name, count(distinct visitor)::int as visitors from pv
      group by 1 order by visitors desc) x),
  'browsers', (select coalesce(jsonb_agg(to_jsonb(x) order by x.visitors desc), '[]'::jsonb) from (
      select coalesce(browser, 'Other') as name, count(distinct visitor)::int as visitors from pv
      group by 1 order by visitors desc limit 8) x)
) as stats`;

export async function adminStats(days: number, tz: string): Promise<Stats> {
  const rows = await query<{ stats: Stats }>(SQL, [days, tz]);
  return rows[0].stats;
}
