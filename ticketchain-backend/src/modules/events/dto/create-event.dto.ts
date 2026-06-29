import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  venue?: string;

  @IsDateString()
  eventDate: string;

  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @IsNumber()
  @Min(1)
  totalTickets: number;

  @IsString()
  @IsNotEmpty()
  basePriceEth: string;

  @IsNumber()
  @Min(10000)
  maxResaleMultiplierBps: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxTicketsPerWallet?: number;
}
