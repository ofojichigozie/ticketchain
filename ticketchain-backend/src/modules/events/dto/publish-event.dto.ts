import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class PublishEventDto {
  @IsString()
  @IsNotEmpty()
  txHash: string;

  @IsNumber()
  onChainEventId: number;
}
