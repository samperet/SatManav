import { Pool, type QueryResultRow } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { getSecret } from 'astro:env/server';
import { SCHEMA } from './schema';

// Postgres attached to the Vercel project (Neon, via Vercel Storage), which injects DATABASE_URL.
export const dbUrl = () => getSecret('DATABASE_URL') || getSecret('POSTGRES_URL') || '';
export const dbConfigured = () => Boolean(dbUrl());

let pool: Pool | null | undefined;
let ready: Promise<void> | null = null;

function getPool(): Pool | null {
  if (pool !== undefined) return pool;
  const url = dbUrl();
  if (!url) return (pool = null);
  // Neon's URL says sslmode=require; pin full certificate verification explicitly so a future
  // pg release (which will weaken "require") can't silently downgrade it.
  const connectionString = url.replace(/sslmode=(prefer|require|verify-ca)\b/, 'sslmode=verify-full');
  pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 10_000 });
  attachDatabasePool(pool); // release idle clients before Vercel suspends the function
  return pool;
}

/** Run a parameterised query (always pass values as params, never interpolate). */
export async function query<T extends QueryResultRow = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const p = getPool();
  if (!p) throw new Error('DATABASE_URL is not set');
  ready ??= p.query(SCHEMA).then(
    () => undefined,
    (err) => {
      ready = null;
      throw err;
    },
  );
  await ready;
  return (await p.query<T>(text, params)).rows;
}
