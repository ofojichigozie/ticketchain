import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../database/database';
import { transactions } from '../../database/schema';

@Injectable()
export class TransactionsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async getUserTransactions(userId: string) {
    // Get transactions where user is sender or receiver
    const allTx = await this.db.select().from(transactions);
    return allTx.filter(
      (tx) => tx.fromUserId === userId || tx.toUserId === userId,
    );
  }

  async getTicketHistory(ticketId: string) {
    return this.db
      .select()
      .from(transactions)
      .where(eq(transactions.ticketId, ticketId));
  }
}
