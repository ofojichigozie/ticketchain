import * as dotenv from 'dotenv';
import * as path from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../schema';
import { seedAdmin } from './seed-admin';

dotenv.config({
  override: true,
  path: path.resolve(
    __dirname,
    '../../../',
    `.env.${process.env.NODE_ENV ?? 'development'}`,
  ),
});

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌  DATABASE_URL is not set.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  console.log('🌱  Running seeders...\n');
  await seedAdmin(db);
  console.log('\n✅  All seeders complete.');

  await pool.end();
}

main().catch((err) => {
  console.error('❌  Seeder failed:', err);
  process.exit(1);
});
