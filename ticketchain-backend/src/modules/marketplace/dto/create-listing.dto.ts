import { IsString, IsNotEmpty } from 'class-validator';

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  ticketId: string;

  @IsString()
  @IsNotEmpty()
  askingPriceEth: string;
}
