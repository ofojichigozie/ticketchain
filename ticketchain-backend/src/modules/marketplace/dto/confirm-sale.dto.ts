import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmSaleDto {
  @IsString()
  @IsNotEmpty()
  txHash: string;
}
