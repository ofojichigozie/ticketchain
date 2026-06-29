import { pgTable, uuid, numeric, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { tickets } from './tickets.schema';

export const listingStatusEnum = pgEnum('listing_status', [
  'active',
  'sold',
  'cancelled',
]);

export const listings = pgTable('listings', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketId: uuid('ticket_id')
    .notNull()
    .references(() => tickets.id),
  sellerId: uuid('seller_id')
    .notNull()
    .references(() => users.id),
  askingPriceEth: numeric('asking_price_eth', {
    precision: 18,
    scale: 8,
  }).notNull(),
  status: listingStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
