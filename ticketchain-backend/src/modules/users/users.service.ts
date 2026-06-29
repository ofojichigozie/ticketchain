import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../../database/database';
import { users } from '../../database/schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async getProfile(userId: string) {
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

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const [updated] = await this.db
      .update(users)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!updated) throw new NotFoundException('User not found');

    const { nonce, ...safe } = updated;
    return safe;
  }

  async getPublicProfile(userId: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        walletAddress: users.walletAddress,
        username: users.username,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getAllUsers() {
    return this.db
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
      .orderBy(users.createdAt);
  }

  async updateRole(userId: string, dto: UpdateRoleDto) {
    const [updated] = await this.db
      .update(users)
      .set({ role: dto.role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        walletAddress: users.walletAddress,
        role: users.role,
      });

    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }
}
