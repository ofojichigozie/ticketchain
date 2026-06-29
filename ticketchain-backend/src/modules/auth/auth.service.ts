import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { DRIZZLE, DrizzleDB } from '../../database/database';
import { users } from '../../database/schema';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private jwtService: JwtService,
  ) {}

  async getNonce(walletAddress: string): Promise<{ nonce: string }> {
    const normalizedAddress = ethers.getAddress(walletAddress);
    const nonce = uuidv4();

    const existing = await this.db
      .select()
      .from(users)
      .where(eq(users.walletAddress, normalizedAddress))
      .limit(1);

    if (existing.length > 0) {
      await this.db
        .update(users)
        .set({ nonce, updatedAt: new Date() })
        .where(eq(users.walletAddress, normalizedAddress));
    } else {
      await this.db.insert(users).values({
        walletAddress: normalizedAddress,
        nonce,
      });
    }

    return { nonce };
  }

  async verifySignature(
    walletAddress: string,
    signature: string,
  ): Promise<{
    accessToken: string;
    user: {
      id: string;
      walletAddress: string;
      username: string | null;
      email: string | null;
      role: string;
      avatarUrl: string | null;
      createdAt: Date;
    };
  }> {
    const normalizedAddress = ethers.getAddress(walletAddress);

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.walletAddress, normalizedAddress))
      .limit(1);

    if (!user || !user.nonce) {
      throw new UnauthorizedException(
        'Nonce not found. Request a nonce first.',
      );
    }

    // Recover signer from the signature
    const message = `Sign this message to authenticate with TicketChain.\n\nNonce: ${user.nonce}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== normalizedAddress.toLowerCase()) {
      throw new UnauthorizedException('Signature verification failed');
    }

    // Invalidate nonce after use
    await this.db
      .update(users)
      .set({ nonce: null, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    const payload = {
      sub: user.id,
      address: normalizedAddress,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    };
  }

  async getMe(userId: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        walletAddress: users.walletAddress,
        username: users.username,
        email: users.email,
        role: users.role,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user;
  }
}
