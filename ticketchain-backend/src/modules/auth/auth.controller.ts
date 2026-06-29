import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetNonceDto } from './dto/get-nonce.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('nonce')
  async getNonce(@Body() dto: GetNonceDto) {
    const nonce = await this.authService.getNonce(dto.walletAddress);
    return ApiResponse.success(nonce, 'Nonce generated successfully');
  }

  @Post('verify')
  async verify(@Body() dto: VerifySignatureDto) {
    const authResult = await this.authService.verifySignature(
      dto.walletAddress,
      dto.signature,
    );
    return ApiResponse.success(authResult, 'Wallet verified successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: { userId: string }) {
    const profile = await this.authService.getMe(user.userId);
    return ApiResponse.success(profile, 'Profile retrieved');
  }
}
