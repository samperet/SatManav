import type { APIRoute } from 'astro';
import { isAdmin, SESSION_COOKIE } from '../../../lib/server/auth';
import { dbConfigured, query } from '../../../lib/server/db';

export const prerender = false;

const COLS = ['created_at', 'status', 'stage', 'email', 'first_name', 'last_name', 'phone', 'intention', 'geometric', 'abstract', 'eastern', 'message', 'source', 'medium', 'utm_campaign', 'referrer_host', 'landing_path', 'city', 'region', 'country', 'device'] as const;

// Quote every cell; neutralise spreadsheet formula injection (=, +, -, @).
const cell = (v: unknown) => {
  let s = v == null ? '' : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export const GET: APIRoute = async ({ cookies, url }) => {
  if (!(await isAdmin(cookies.get(SESSION_COOKIE)?.value))) return new Response('Unauthorized', { status: 401 });
  if (!dbConfigured()) return new Response('Database not configured', { status: 503 });
  const days = Math.min(3650, Math.max(1, Number(url.searchParams.get('days')) || 3650));
  let rows: Record<string, unknown>[];
  try {
    rows = await query(`select ${COLS.join(', ')} from leads where created_at >= now() - make_interval(days => $1) order by created_at desc`, [days]);
  } catch (err) {
    console.error('[leads.csv]', err);
    return new Response('Could not load leads', { status: 500 });
  }
  const lines = [COLS.join(','), ...rows.map((r) => COLS.map((c) => cell(r[c])).join(','))];
  return new Response('﻿' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="sat-manav-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
};
