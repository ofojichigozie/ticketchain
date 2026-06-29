import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck() {
    return {
      uptime: process.uptime(),
      message: 'TicketChain API is running',
    };
  }
}
