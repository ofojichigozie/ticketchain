import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE');

export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

export function createDrizzleClient(databaseUrl: string): DrizzleDB {
  const pool = new Pool({ connectionString: databaseUrl });
  return drizzle(pool, { schema });
}
