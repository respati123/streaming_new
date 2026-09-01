import { env } from '@core/config/env';
import { logger } from '@core/logger/logger';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@core/middlewares/auth.middleware';
import type { AuthUser } from '@core/types/context.types';
import { hashPassword, verifyPassword } from '@core/utils/password.util';
import { HTTPException } from 'hono/http-exception';
import { type AuthRepository, authRepository } from './auth.repository';
import type { AuthResponse, LoginDTO, RegisterDTO, TokenPair } from './auth.types';

export class AuthService {
  constructor(private repo: AuthRepository = authRepository) {}

  /**
   * Register a new user and generate access/refresh token pair
   */
  async register(dto: RegisterDTO): Promise<AuthResponse> {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) {
      throw new HTTPException(409, {
        message: 'An account with this email address already exists.',
      });
    }

    const hashedPassword = await hashPassword(dto.password);

    const userRecord = await this.repo.create({
      email: dto.email,
      name: dto.name,
      passwordHash: hashedPassword,
      role: 'user',
    });

    const authUser: AuthUser = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role as 'admin' | 'user',
    };

    const tokens = await this.generateTokenPair(authUser);

    logger.info('New user registered successfully', { userId: authUser.id, email: authUser.email });

    return {
      user: authUser,
      tokens,
    };
  }

  /**
   * Login user with credentials and issue token pair
   */
  async login(dto: LoginDTO): Promise<AuthResponse> {
    const userRecord = await this.repo.findByEmail(dto.email);
    if (!userRecord) {
      throw new HTTPException(401, { message: 'Invalid email or password.' });
    }

    if (!userRecord.passwordHash) {
      throw new HTTPException(401, {
        message: 'This account was registered using Google OAuth. Please login with Google.',
      });
    }

    const isPasswordValid = await verifyPassword(dto.password, userRecord.passwordHash);
    if (!isPasswordValid) {
      throw new HTTPException(401, { message: 'Invalid email or password.' });
    }

    const authUser: AuthUser = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role as 'admin' | 'user',
    };

    const tokens = await this.generateTokenPair(authUser);

    logger.info('User logged in successfully', { userId: authUser.id, email: authUser.email });

    return {
      user: authUser,
      tokens,
    };
  }

  /**
   * Refresh Token Rotation: Validates old token, revokes it, and issues new token pair
   */
  async refreshTokens(rawRefreshToken: string): Promise<TokenPair> {
    let userId: string;
    try {
      userId = await verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new HTTPException(401, { message: 'Invalid or expired refresh token.' });
    }

    // Lookup token in DB by hash
    const tokenHash = await this.hashToken(rawRefreshToken);
    const tokenRecord = await this.repo.findValidRefreshToken(tokenHash);

    if (!tokenRecord?.user) {
      // If token was already revoked, potential reuse attack: revoke all user tokens
      await this.repo.revokeAllUserTokens(userId);
      throw new HTTPException(401, {
        message: 'Invalid refresh token. Token may have been revoked.',
      });
    }

    // Revoke old token (Rotation)
    await this.repo.revokeRefreshToken(tokenHash);

    const authUser: AuthUser = {
      id: tokenRecord.user.id,
      email: tokenRecord.user.email,
      name: tokenRecord.user.name,
      role: tokenRecord.user.role as 'admin' | 'user',
    };

    const newTokens = await this.generateTokenPair(authUser);

    logger.info('Refresh token rotated successfully', { userId: authUser.id });

    return newTokens;
  }

  /**
   * Logout user by revoking refresh token
   */
  async logout(rawRefreshToken: string): Promise<void> {
    if (!rawRefreshToken) return;
    try {
      const tokenHash = await this.hashToken(rawRefreshToken);
      await this.repo.revokeRefreshToken(tokenHash);
    } catch (err) {
      logger.warn('Failed to revoke refresh token during logout', {}, err as Error);
    }
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<AuthUser> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new HTTPException(404, { message: 'User not found.' });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'admin' | 'user',
    };
  }

  private async generateTokenPair(user: AuthUser): Promise<TokenPair> {
    const accessToken = await signAccessToken(user);
    const { token: refreshToken, expiresAt } = await signRefreshToken(user.id);

    // Store hash of refresh token
    const tokenHash = await this.hashToken(refreshToken);
    await this.repo.saveRefreshToken(user.id, tokenHash, expiresAt);

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    };
  }

  private async hashToken(token: string): Promise<string> {
    const hasher = new Bun.CryptoHasher('sha256');
    hasher.update(token);
    return hasher.digest('hex');
  }
}

export const authService = new AuthService();
