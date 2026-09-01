import { db } from '@core/database';
import { type NewUserTable, refreshTokens, type UserTable, users } from '@core/database/schema';
import { and, eq, gt } from 'drizzle-orm';

export class AuthRepository {
  /**
   * Find user by email address
   */
  async findByEmail(email: string): Promise<UserTable | undefined> {
    return db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });
  }

  /**
   * Find user by primary ID
   */
  async findById(id: string): Promise<UserTable | undefined> {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  /**
   * Create a new user record
   */
  async create(data: NewUserTable): Promise<UserTable> {
    const [created] = await db
      .insert(users)
      .values({
        ...data,
        email: data.email ? data.email.toLowerCase().trim() : null,
      })
      .returning();
    return created;
  }

  /**
   * Save a newly issued refresh token in database
   */
  async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await db.insert(refreshTokens).values({
      userId,
      tokenHash,
      expiresAt,
    });
  }

  /**
   * Find active valid refresh token record
   */
  async findValidRefreshToken(tokenHash: string) {
    return db.query.refreshTokens.findFirst({
      where: and(
        eq(refreshTokens.tokenHash, tokenHash),
        eq(refreshTokens.isRevoked, false),
        gt(refreshTokens.expiresAt, new Date())
      ),
      with: {
        user: true,
      },
    });
  }

  /**
   * Revoke a specific refresh token (used in token rotation or logout)
   */
  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.tokenHash, tokenHash));
  }

  /**
   * Revoke all refresh tokens for a user (used on password change or security logout)
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await db.update(refreshTokens).set({ isRevoked: true }).where(eq(refreshTokens.userId, userId));
  }
}

export const authRepository = new AuthRepository();
