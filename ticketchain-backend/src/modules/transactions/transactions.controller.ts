import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserTransactions(@CurrentUser() user: { userId: string }) {
    const transactions = await this.transactionsService.getUserTransactions(
      user.userId,
    );
    return ApiResponse.success(transactions, 'Transaction history retrieved');
  }

  @Get(':ticketId')
  async getTicketHistory(@Param('ticketId') ticketId: string) {
    const transactions =
      await this.transactionsService.getTicketHistory(ticketId);
    return ApiResponse.success(
      transactions,
      'Ticket transfer history retrieved',
    );
  }
}
