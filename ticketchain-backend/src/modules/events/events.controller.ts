import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PublishEventDto } from './dto/publish-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(@Query('status') status?: string) {
    const events = await this.eventsService.findAll(status);
    return ApiResponse.success(events, 'Events retrieved successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyEvents(@CurrentUser() user: { userId: string }) {
    const events = await this.eventsService.getOrganizerEvents(user.userId);
    return ApiResponse.success(events, 'Your events retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const event = await this.eventsService.findOne(id);
    return ApiResponse.success(event, 'Event retrieved successfully');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizer')
  @Post()
  async create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateEventDto,
  ) {
    const event = await this.eventsService.create(user.userId, dto);
    return ApiResponse.success(event, 'Event created successfully');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizer')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateEventDto,
  ) {
    const event = await this.eventsService.update(id, user.userId, dto);
    return ApiResponse.success(event, 'Event updated successfully');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizer')
  @Patch(':id/publish')
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: PublishEventDto,
  ) {
    const event = await this.eventsService.publish(id, user.userId, dto);
    return ApiResponse.success(event, 'Event published successfully');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizer')
  @Delete(':id')
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    const event = await this.eventsService.cancel(id, user.userId);
    return ApiResponse.success(event, 'Event cancelled successfully');
  }
}
