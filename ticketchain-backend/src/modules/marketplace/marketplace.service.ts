import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { ethers } from 'ethers';
import { DRIZZLE, DrizzleDB } from '../../database/database';
import {
  listings,
  tickets,
  transactions,
  events,
  users,
} from '../../database/schema';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { ConfirmSaleDto } from './dto/confirm-sale.dto';

@Injectable()
export class MarketplaceService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private blockchain: BlockchainService,
  ) {}

  async findAllActive() {
    return this.db
      .select({
        id: listings.id,
        ticketId: listings.ticketId,
        sellerId: listings.sellerId,
        askingPriceEth: listings.askingPriceEth,
        status: listings.status,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        tokenId: tickets.tokenId,
        sellerAddress: users.walletAddress,
        eventId: events.id,
        eventTitle: events.title,
        eventDate: events.eventDate,
        eventVenue: events.venue,
      })
      .from(listings)
      .leftJoin(tickets, eq(listings.ticketId, tickets.id))
      .leftJoin(users, eq(listings.sellerId, users.id))
      .leftJoin(events, eq(tickets.eventId, events.id))
      .where(eq(listings.status, 'active'));
  }

  async findOne(listingId: string) {
    const [listing] = await this.db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async createListing(sellerId: string, dto: CreateListingDto) {
    // Verify ticket exists and belongs to seller
    const [ticket] = await this.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, dto.ticketId))
      .limit(1);

    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.ownerId !== sellerId) {
      throw new ForbiddenException('You do not own this ticket');
    }
    if (ticket.isUsed) {
      throw new BadRequestException('Cannot list a used ticket');
    }
    if (ticket.isListed) {
      throw new BadRequestException('Ticket is already listed');
    }

    // Validate asking price against on-chain max resale price
    const [event] = await this.db
      .select()
      .from(events)
      .where(eq(events.id, ticket.eventId))
      .limit(1);

    if (event && event.maxResaleMultiplierBps && ticket.purchasePriceEth) {
      const maxResaleEth =
        (parseFloat(ticket.purchasePriceEth) * event.maxResaleMultiplierBps) /
        10000;
      if (parseFloat(dto.askingPriceEth) > maxResaleEth) {
        throw new BadRequestException(
          `Asking price exceeds max resale price of ${maxResaleEth} ETH`,
        );
      }
    }

    // Create listing
    const [listing] = await this.db
      .insert(listings)
      .values({
        ticketId: dto.ticketId,
        sellerId,
        askingPriceEth: dto.askingPriceEth,
        status: 'active',
      })
      .returning();

    // Mark ticket as listed
    await this.db
      .update(tickets)
      .set({ isListed: true, updatedAt: new Date() })
      .where(eq(tickets.id, dto.ticketId));

    return listing;
  }

  async cancelListing(listingId: string, userId: string) {
    const listing = await this.findOne(listingId);
    if (listing.sellerId !== userId) {
      throw new ForbiddenException('You do not own this listing');
    }
    if (listing.status !== 'active') {
      throw new BadRequestException('Listing is not active');
    }

    const [updated] = await this.db
      .update(listings)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(listings.id, listingId))
      .returning();

    // Unmark ticket as listed
    await this.db
      .update(tickets)
      .set({ isListed: false, updatedAt: new Date() })
      .where(eq(tickets.id, listing.ticketId));

    return updated;
  }

  async confirmResalePurchase(
    listingId: string,
    buyerUserId: string,
    dto: ConfirmSaleDto,
  ) {
    const listing = await this.findOne(listingId);
    if (listing.status !== 'active') {
      throw new BadRequestException('Listing is not active');
    }

    // Verify on-chain transaction
    await this.blockchain.verifyTransaction(dto.txHash);

    // Check if tx already recorded
    const existing = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.txHash, dto.txHash))
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('Transaction already recorded');
    }

    // Update listing
    const [updatedListing] = await this.db
      .update(listings)
      .set({ status: 'sold', updatedAt: new Date() })
      .where(eq(listings.id, listingId))
      .returning();

    // Transfer ticket ownership
    await this.db
      .update(tickets)
      .set({
        ownerId: buyerUserId,
        isListed: false,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, listing.ticketId));

    // Record transaction
    await this.db.insert(transactions).values({
      ticketId: listing.ticketId,
      fromUserId: listing.sellerId,
      toUserId: buyerUserId,
      type: 'resale',
      priceEth: listing.askingPriceEth,
      txHash: dto.txHash,
    });

    return updatedListing;
  }
}
