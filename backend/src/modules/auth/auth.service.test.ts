import { describe, expect, it } from 'bun:test';
import type { UserTable } from '@core/database/schema';
import { hashPassword } from '@core/utils/password.util';
import type { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

describe('AuthService Unit Tests', () => {
  it('should register a new user and return user and token pair', async () => {
    const mockUsers: UserTable[] = [];
    const mockTokens: Array<{ userId: string; tokenHash: string; expiresAt: Date }> = [];

    const mockRepo: Partial<AuthRepository> = {
      findByEmail: async (email) => mockUsers.find((u) => u.email === email),
      create: async (data) => {
        const user: UserTable = {
          id: 'user-id-123',
          email: data.email || null,
          name: data.name,
          passwordHash: data.passwordHash || null,
          role: data.role || 'viewer',
          avatarUrl: null,
          googleId: null,
          youtubeChannelId: null,
          youtubeHandle: null,
          youtubeTitle: null,
          totalMessagesSent: '0',
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockUsers.push(user);
        return user;
      },
      saveRefreshToken: async (userId, tokenHash, expiresAt) => {
        mockTokens.push({ userId, tokenHash, expiresAt });
      },
    };

    const service = new AuthService(mockRepo as AuthRepository);

    const result = await service.register({
      email: 'test@example.com',
      name: 'Test User',
      password: 'Password123',
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.user.name).toBe('Test User');
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
    expect(mockTokens.length).toBe(1);
  });

  it('should authenticate user with valid password and issue tokens', async () => {
    const hashedPassword = await hashPassword('SecretPassword123');
    const existingUser: UserTable = {
      id: 'usr-999',
      email: 'john@example.com',
      name: 'John Doe',
      passwordHash: hashedPassword,
      role: 'admin',
      avatarUrl: null,
      googleId: null,
      youtubeChannelId: null,
      youtubeHandle: null,
      youtubeTitle: null,
      totalMessagesSent: '0',
      firstSeenAt: new Date(),
      lastSeenAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockRepo: Partial<AuthRepository> = {
      findByEmail: async (email) => (email === existingUser.email ? existingUser : undefined),
      saveRefreshToken: async () => {},
    };

    const service = new AuthService(mockRepo as AuthRepository);

    const result = await service.login({
      email: 'john@example.com',
      password: 'SecretPassword123',
    });

    expect(result.user.id).toBe('usr-999');
    expect(result.tokens.accessToken).toBeDefined();
  });
});
