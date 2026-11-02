import type { APIRoute } from 'astro';
import { isAdmin, SESSION_COOKIE } from '../../../lib/server/auth';
import { db, iso } from '../../../lib/server/db';

export const prerender = false;

const COLS = ['created_at', 'status', 'stage', 'email', 'first_name', 'last_name', 'phone', 'intention', 'geometric', 'abstract', 'eastern', 'message', 'source', 'medium', 'utm_campaign', 'referrer_host', 'landing_path', 'city', 'region', 'country', 'device'] as const;

// Quote every cell; neutralise spreadsheet formula injection (=, +, -, @).
const cell = (v: unknown) => {
  let s = v == null ? '' : v instanceof Date ? iso(v) : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export const GET: APIRoute = async ({ cookies, url }) => {
  if (!(await isAdmin(cookies.get(SESSION_COOKIE)?.value))) return new Response('Unauthorized', { status: 401 });
  const q = await db();
  if (!q) return new Response('Database not configured', { status: 503 });
  const days = Math.min(3650, Math.max(1, Number(url.searchParams.get('days')) || 3650));
  const since = new Date(Date.now() - days * 864e5).toISOString();
  let data: Record<string, unknown>[];
  try {
    data = await q(`select ${COLS.join(', ')} from leads where created_at >= $1 order by created_at desc`, [since]);
  } catch (e) {
    return new Response(e instanceof Error ? e.message : 'Query failed', { status: 500 });
  }
  const rows = [COLS.join(','), ...data.map((r) => COLS.map((c) => cell(r[c])).join(','))];
  return new Response('﻿' + rows.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="sat-manav-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
};
