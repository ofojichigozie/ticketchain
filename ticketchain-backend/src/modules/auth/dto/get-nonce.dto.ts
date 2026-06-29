import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class GetNonceDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address' })
  walletAddress: string;
}
