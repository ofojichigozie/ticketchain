import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DRIZZLE, createDrizzleClient } from './database';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('DATABASE_URL');
        return createDrizzleClient(url);
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
