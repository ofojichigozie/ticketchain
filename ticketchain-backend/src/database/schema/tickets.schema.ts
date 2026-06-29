import {
  pgTable,
  uuid,
  integer,
  numeric,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { events } from './events.schema';

export const tickets = pgTable('tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  tokenId: integer('token_id').notNull(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id),
  originalBuyerId: uuid('original_buyer_id')
    .notNull()
    .references(() => users.id),
  purchasePriceEth: numeric('purchase_price_eth', { precision: 18, scale: 8 }),
  isUsed: boolean('is_used').default(false).notNull(),
  isListed: boolean('is_listed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
