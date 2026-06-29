import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../database/database';
import { events } from '../../database/schema';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PublishEventDto } from './dto/publish-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private blockchain: BlockchainService,
  ) {}

  async findAll(status?: string) {
    if (status) {
      return this.db
        .select()
        .from(events)
        .where(eq(events.status, status as any))
        .orderBy(desc(events.createdAt));
    }
    return this.db
      .select()
      .from(events)
      .where(eq(events.status, 'published'))
      .orderBy(desc(events.createdAt));
  }

  async findOne(id: string) {
    const [event] = await this.db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(organizerId: string, dto: CreateEventDto) {
    const [event] = await this.db
      .insert(events)
      .values({
        organizerId,
        title: dto.title,
        description: dto.description,
        venue: dto.venue,
        eventDate: new Date(dto.eventDate),
        bannerUrl: dto.bannerUrl,
        totalTickets: dto.totalTickets,
        basePriceEth: dto.basePriceEth,
        maxResaleMultiplierBps: dto.maxResaleMultiplierBps,
        maxTicketsPerWallet: dto.maxTicketsPerWallet ?? 0,
        status: 'draft',
      })
      .returning();

    return event;
  }

  async update(id: string, organizerId: string, dto: UpdateEventDto) {
    const event = await this.findOne(id);
    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('You do not own this event');
    }
    if (event.status !== 'draft') {
      throw new BadRequestException('Cannot update a published event');
    }

    const updateData: any = { ...dto, updatedAt: new Date() };
    if (dto.eventDate) updateData.eventDate = new Date(dto.eventDate);

    const [updated] = await this.db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();

    return updated;
  }

  async publish(id: string, organizerId: string, dto: PublishEventDto) {
    const event = await this.findOne(id);
    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('You do not own this event');
    }
    if (event.status !== 'draft') {
      throw new BadRequestException('Event is already published or cancelled');
    }

    // Verify transaction on-chain
    await this.blockchain.verifyTransaction(dto.txHash);

    const [updated] = await this.db
      .update(events)
      .set({
        status: 'published',
        onChainEventId: dto.onChainEventId,
        txHash: dto.txHash,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    return updated;
  }

  async cancel(id: string, organizerId: string) {
    const event = await this.findOne(id);
    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('You do not own this event');
    }

    const [updated] = await this.db
      .update(events)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();

    return updated;
  }

  async getOrganizerEvents(organizerId: string) {
    return this.db
      .select()
      .from(events)
      .where(eq(events.organizerId, organizerId))
      .orderBy(desc(events.createdAt));
  }
}
