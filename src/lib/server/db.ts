import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { getSecret } from 'astro:env/server';
import schema from './schema.sql?raw';

// Neon Postgres, provisioned from Vercel → Storage. The integration sets DATABASE_URL
// (and POSTGRES_URL) on the project; nothing else to configure.

export type Row = Record<string, unknown>;
/** Run one SQL statement with $1, $2… placeholders and get its rows. */
export type Query = (text: string, params?: unknown[]) => Promise<Row[]>;

export const connectionString = () => getSecret('DATABASE_URL') || getSecret('POSTGRES_URL') || '';

/** Secret used to salt anonymous visitor ids and sign admin sessions. */
export const serverSecret = () => getSecret('SESSION_SECRET') || connectionString();

let sql: NeonQueryFunction<false, false> | null | undefined;
let schemaReady: Promise<void> | undefined;

function client() {
  if (sql !== undefined) return sql;
  const url = connectionString();
  sql = url ? neon(url) : null;
  return sql;
}

/** Create the tables on first contact with an empty database (statements are idempotent). */
async function ensureSchema(sql: NeonQueryFunction<false, false>) {
  const [row] = await sql.query(`select to_regclass('public.testimonials') as t`);
  if (row?.t) return;
  const statements = schema
    .split(/;\s*\n/)
    .map((s) => s.replace(/^\s*--.*$/gm, '').trim())
    .filter(Boolean);
  for (const statement of statements) await sql.query(statement);
}

/**
 * The database, or null when DATABASE_URL isn't set (the site then runs without
 * analytics / lead storage, and the admin dashboard shows setup instructions).
 */
export async function db(): Promise<Query | null> {
  const sql = client();
  if (!sql) return null;
  schemaReady ??= ensureSchema(sql).catch((e) => {
    schemaReady = undefined; // try again on the next request
    throw e;
  });
  await schemaReady;
  return (text, params = []) => sql.query(text, params as any[]) as Promise<Row[]>;
}

/** Is a database configured at all? (Cheap: doesn't connect.) */
export const dbConfigured = () => Boolean(connectionString());

/** Postgres returns timestamptz as Date objects; normalise to ISO strings. */
export const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : v == null ? '' : String(v));
