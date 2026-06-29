import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class VerifySignatureDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address' })
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}
