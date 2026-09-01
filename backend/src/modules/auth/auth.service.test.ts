import { describe, expect, it } from 'bun:test';
import type { UserTable } from '@core/database/schema';
import type { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

describe('AuthService Unit Tests', () => {
  it('should register a new user and return user and token pair', async () => {
    const mockUsers: UserTable[] = [];

    const mockRepo: Partial<AuthRepository> = {
      findByEmail: async (email) => mockUsers.find((u) => u.email === email),
      create: async (data) => {
        const user: UserTable = {
          id: data.id || 'user-id-123',
          email: data.email || 'test@example.com',
          emailVerified: false,
          name: data.name,
          image: null,
          role: data.role || 'viewer',
          youtubeChannelId: null,
          youtubeHandle: null,
          youtubeChannelTitle: null,
          points: 0,
          tier: 'bronze',
          totalChatCount: 0,
          totalDonationAmount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockUsers.push(user);
        return user;
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
  });

  it('should authenticate user and issue tokens', async () => {
    const existingUser: UserTable = {
      id: 'usr-999',
      email: 'john@example.com',
      emailVerified: true,
      name: 'John Doe',
      image: null,
      role: 'admin',
      youtubeChannelId: null,
      youtubeHandle: null,
      youtubeChannelTitle: null,
      points: 100,
      tier: 'silver',
      totalChatCount: 5,
      totalDonationAmount: 50000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockRepo: Partial<AuthRepository> = {
      findByEmail: async (email) => (email === existingUser.email ? existingUser : undefined),
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
