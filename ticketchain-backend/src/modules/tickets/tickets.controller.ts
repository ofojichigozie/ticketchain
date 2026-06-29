import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ConfirmPurchaseDto } from './dto/confirm-purchase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('confirm-purchase')
  async confirmPurchase(
    @CurrentUser() user: { userId: string },
    @Body() dto: ConfirmPurchaseDto,
  ) {
    const ticket = await this.ticketsService.confirmPurchase(user.userId, dto);
    return ApiResponse.success(ticket, 'Ticket purchase confirmed');
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-tickets')
  async getMyTickets(@CurrentUser() user: { userId: string }) {
    const tickets = await this.ticketsService.getMyTickets(user.userId);
    return ApiResponse.success(tickets, 'Tickets retrieved successfully');
  }

  @Get(':id')
  async getTicket(@Param('id') id: string) {
    const ticket = await this.ticketsService.getTicket(id);
    return ApiResponse.success(ticket, 'Ticket details retrieved');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizer')
  @Patch(':id/mark-used')
  async markAsUsed(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    const ticket = await this.ticketsService.markAsUsed(id, user.userId);
    return ApiResponse.success(ticket, 'Ticket marked as used');
  }
}
