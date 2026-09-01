import { db } from '@core/database';
import { type NewUserTable, type UserTable, user } from '@core/database/schema';
import { eq } from 'drizzle-orm';

export class AuthRepository {
  /**
   * Find user by email address
   */
  async findByEmail(email: string): Promise<UserTable | undefined> {
    return db.query.user.findFirst({
      where: eq(user.email, email.toLowerCase().trim()),
    });
  }

  /**
   * Find user by primary ID
   */
  async findById(id: string): Promise<UserTable | undefined> {
    return db.query.user.findFirst({
      where: eq(user.id, id),
    });
  }

  /**
   * Create a new user record
   */
  async create(data: NewUserTable): Promise<UserTable> {
    const [created] = await db
      .insert(user)
      .values({
        ...data,
        email: data.email ? data.email.toLowerCase().trim() : 'anonymous@stream.viewer',
      })
      .returning();
    return created;
  }

  /**
   * Save a newly issued refresh token in database (Stub for legacy compatibility)
   */
  async saveRefreshToken(_userId: string, _tokenHash: string, _expiresAt: Date): Promise<void> {
    // Handled by Better Auth session
  }

  /**
   * Find active valid refresh token record
   */
  async findValidRefreshToken(_tokenHash: string) {
    return null;
  }

  /**
   * Revoke a specific refresh token (used in token rotation or logout)
   */
  async revokeRefreshToken(_tokenHash: string): Promise<void> {
    // Handled by Better Auth session
  }

  /**
   * Revoke all refresh tokens for a user (used on password change or security logout)
   */
  async revokeAllUserTokens(_userId: string): Promise<void> {
    // Handled by Better Auth session
  }
}

export const authRepository = new AuthRepository();
