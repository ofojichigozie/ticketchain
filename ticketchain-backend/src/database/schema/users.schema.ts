import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'attendee',
  'organizer',
  'admin',
]);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  walletAddress: varchar('wallet_address', { length: 42 }).notNull().unique(),
  username: varchar('username', { length: 50 }).unique(),
  email: varchar('email', { length: 255 }),
  role: userRoleEnum('role').default('attendee').notNull(),
  avatarUrl: text('avatar_url'),
  nonce: varchar('nonce', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
