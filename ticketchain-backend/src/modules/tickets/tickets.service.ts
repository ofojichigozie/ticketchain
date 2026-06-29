import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DRIZZLE, DrizzleDB } from '../../database/database';
import { tickets, events, transactions, users } from '../../database/schema';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ConfirmPurchaseDto } from './dto/confirm-purchase.dto';
import { ethers } from 'ethers';

@Injectable()
export class TicketsService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private blockchain: BlockchainService,
  ) {}

  async confirmPurchase(userId: string, dto: ConfirmPurchaseDto) {
    // Verify the on-chain transaction
    const receipt = await this.blockchain.verifyTransaction(dto.txHash);

    // Check if tx already recorded
    const existing = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.txHash, dto.txHash))
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('Transaction already recorded');
    }

    // Get event details
    const [event] = await this.db
      .select()
      .from(events)
      .where(eq(events.id, dto.eventId))
      .limit(1);

    if (!event) throw new NotFoundException('Event not found');

    // Parse minted ticket info from logs
    const mintedLogs = this.blockchain.parseTicketMintedLogs(receipt);
    if (mintedLogs.length === 0) {
      throw new BadRequestException('No ticket mint found in transaction');
    }

    const mintLog = mintedLogs[0]!;
    const tokenId = Number(mintLog.args[0]); // tokenId
    const priceEth = ethers.formatEther(mintLog.args[3]); // originalPrice

    // Create ticket record
    const [ticket] = await this.db
      .insert(tickets)
      .values({
        tokenId,
        eventId: dto.eventId,
        ownerId: userId,
        originalBuyerId: userId,
        purchasePriceEth: priceEth,
      })
      .returning();

    // Create transaction record
    await this.db.insert(transactions).values({
      ticketId: ticket.id,
      toUserId: userId,
      type: 'purchase',
      priceEth,
      txHash: dto.txHash,
    });

    // Increment tickets sold
    await this.db
      .update(events)
      .set({
        ticketsSold: (event.ticketsSold || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(events.id, dto.eventId));

    return ticket;
  }

  async getMyTickets(userId: string) {
    const rows = await this.db
      .select({
        id: tickets.id,
        tokenId: tickets.tokenId,
        eventId: tickets.eventId,
        ownerId: tickets.ownerId,
        purchasePriceEth: tickets.purchasePriceEth,
        maxResaleMultiplierBps: events.maxResaleMultiplierBps,
        isUsed: tickets.isUsed,
        isListed: tickets.isListed,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        ownerAddress: users.walletAddress,
        eventTitle: events.title,
        eventDate: events.eventDate,
        eventVenue: events.venue,
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.ownerId, users.id))
      .leftJoin(events, eq(tickets.eventId, events.id))
      .where(eq(tickets.ownerId, userId));

    return rows.map((t) => ({
      ...t,
      status: t.isUsed ? 'used' : t.isListed ? 'listed' : 'owned',
    }));
  }

  async getTicket(id: string) {
    const [ticket] = await this.db
      .select({
        id: tickets.id,
        tokenId: tickets.tokenId,
        eventId: tickets.eventId,
        ownerId: tickets.ownerId,
        purchasePriceEth: tickets.purchasePriceEth,
        maxResaleMultiplierBps: events.maxResaleMultiplierBps,
        isUsed: tickets.isUsed,
        isListed: tickets.isListed,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        ownerAddress: users.walletAddress,
        eventTitle: events.title,
        eventDate: events.eventDate,
        eventVenue: events.venue,
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.ownerId, users.id))
      .leftJoin(events, eq(tickets.eventId, events.id))
      .where(eq(tickets.id, id))
      .limit(1);

    if (!ticket) throw new NotFoundException('Ticket not found');

    const fromUser = alias(users, 'fromUser');
    const toUser = alias(users, 'toUser');

    const history = await this.db
      .select({
        id: transactions.id,
        ticketId: transactions.ticketId,
        fromUserId: transactions.fromUserId,
        toUserId: transactions.toUserId,
        type: transactions.type,
        priceEth: transactions.priceEth,
        txHash: transactions.txHash,
        createdAt: transactions.createdAt,
        fromAddress: fromUser.walletAddress,
        toAddress: toUser.walletAddress,
      })
      .from(transactions)
      .leftJoin(fromUser, eq(transactions.fromUserId, fromUser.id))
      .leftJoin(toUser, eq(transactions.toUserId, toUser.id))
      .where(eq(transactions.ticketId, id));

    return {
      ...ticket,
      status: ticket.isUsed ? 'used' : ticket.isListed ? 'listed' : 'owned',
      history,
    };
  }

  async getEventTickets(eventId: string) {
    return this.db.select().from(tickets).where(eq(tickets.eventId, eventId));
  }

  async markAsUsed(ticketId: string, organizerUserId: string) {
    const [ticket] = await this.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId))
      .limit(1);

    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.isUsed) throw new BadRequestException('Ticket already used');

    // Verify caller is the organizer of the event
    const [event] = await this.db
      .select()
      .from(events)
      .where(eq(events.id, ticket.eventId))
      .limit(1);

    if (!event || event.organizerId !== organizerUserId) {
      throw new ForbiddenException(
        'Only the event organizer can mark tickets as used',
      );
    }

    const [updated] = await this.db
      .update(tickets)
      .set({ isUsed: true, updatedAt: new Date() })
      .where(eq(tickets.id, ticketId))
      .returning();

    return updated;
  }
}
