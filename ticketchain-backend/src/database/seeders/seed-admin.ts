import { ethers } from 'ethers';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../schema';

type DB = ReturnType<typeof drizzle<typeof schema>>;

export async function seedAdmin(db: DB): Promise<void> {
  const rawAddress = process.env.ADMIN_WALLET_ADDRESS;
  if (!rawAddress) {
    console.error('  [seed-admin] ADMIN_WALLET_ADDRESS is not set — skipping.');
    return;
  }

  let walletAddress: string;
  try {
    walletAddress = ethers.getAddress(rawAddress.toLowerCase());
  } catch {
    console.error(
      '  [seed-admin] ADMIN_WALLET_ADDRESS is not a valid Ethereum address — skipping.',
    );
    return;
  }

  const [existing] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.walletAddress, walletAddress))
    .limit(1);

  if (existing) {
    await db
      .update(schema.users)
      .set({ role: 'admin', updatedAt: new Date() })
      .where(eq(schema.users.walletAddress, walletAddress));
    console.log(
      `  [seed-admin] ✅  Promoted existing user to admin: ${walletAddress}`,
    );
  } else {
    await db.insert(schema.users).values({ walletAddress, role: 'admin' });
    console.log(`  [seed-admin] ✅  Created new admin user: ${walletAddress}`);
  }
}
