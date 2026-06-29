import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const eventStatusEnum = pgEnum('event_status', [
  'draft',
  'published',
  'cancelled',
  'completed',
]);

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  onChainEventId: integer('on_chain_event_id'),
  organizerId: uuid('organizer_id')
    .notNull()
    .references(() => users.id),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description'),
  venue: varchar('venue', { length: 255 }),
  eventDate: timestamp('event_date').notNull(),
  bannerUrl: text('banner_url'),
  totalTickets: integer('total_tickets').notNull(),
  ticketsSold: integer('tickets_sold').default(0).notNull(),
  basePriceEth: numeric('base_price_eth', {
    precision: 18,
    scale: 8,
  }).notNull(),
  maxResaleMultiplierBps: integer('max_resale_multiplier_bps'),
  maxTicketsPerWallet: integer('max_tickets_per_wallet').default(0).notNull(),
  contractAddress: varchar('contract_address', { length: 42 }),
  status: eventStatusEnum('status').default('draft').notNull(),
  txHash: varchar('tx_hash', { length: 66 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
