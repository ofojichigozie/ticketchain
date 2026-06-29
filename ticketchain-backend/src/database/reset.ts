import 'dotenv/config';
import { Pool } from 'pg';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
};

const log = {
  info: (msg: string) => console.log(msg),
  success: (msg: string) => console.log(`${c.green}${msg}${c.reset}`),
  warning: (msg: string) => console.log(`${c.yellow}${msg}${c.reset}`),
  error: (msg: string) => console.log(`${c.red}${msg}${c.reset}`),
};

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function confirm(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await new Promise<string>((resolve) =>
    rl.question('Are you sure you want to continue? (yes/no): ', resolve),
  );
  rl.close();
  return answer.toLowerCase() === 'yes';
}

async function reset() {
  console.log(`${c.yellow}Database Reset${c.reset}`);
  console.log('==============\n');

  if (!process.env.DATABASE_URL) {
    log.error('DATABASE_URL is not set.');
    process.exit(1);
  }

  log.warning('WARNING: This will delete ALL data in the database!');
  if (!(await confirm())) {
    log.warning('Aborted.');
    process.exit(0);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Discover and drop all tables dynamically
    console.log(`\n${c.yellow}Step 1: Dropping tables...${c.reset}`);
    const { rows: tables } = await pool.query<{ tablename: string }>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
    );
    if (tables.length === 0) {
      log.info('  No tables found.');
    } else {
      for (const { tablename } of tables) {
        await pool.query(`DROP TABLE IF EXISTS "${tablename}" CASCADE`);
        log.info(`  Dropped: ${tablename}`);
      }
      log.success('  Done.');
    }

    // Discover and drop all custom enum types dynamically
    console.log(`\n${c.yellow}Step 2: Dropping enums...${c.reset}`);
    const { rows: types } = await pool.query<{ typname: string }>(
      `SELECT typname FROM pg_type
       WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
       AND typtype = 'e'`,
    );
    if (types.length === 0) {
      log.info('  No enums found.');
    } else {
      for (const { typname } of types) {
        await pool.query(`DROP TYPE IF EXISTS "${typname}" CASCADE`);
        log.info(`  Dropped: ${typname}`);
      }
      log.success('  Done.');
    }

    // Drop migrations tracking table
    await pool.query(`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE`);

    // Apply migration files in order
    console.log(`\n${c.yellow}Step 3: Applying migrations...${c.reset}`);
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      log.info(`  Applying: ${file}`);
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      const statements = sql
        .split('--> statement-breakpoint')
        .map((s) => s.trim())
        .filter(Boolean);
      for (const statement of statements) {
        await pool.query(statement);
      }
    }
    log.success('  Done.');
  } catch (err: unknown) {
    log.error(
      `Database error: ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(1);
  } finally {
    await pool.end();
  }

  console.log('');
  log.success('Database reset complete. Ready to use.');
}

reset().catch((err: unknown) => {
  log.error(
    `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
  );
  process.exit(1);
});
