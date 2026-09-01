import { describe, expect, it } from 'bun:test';
import { loginSchema, refreshTokenSchema, registerSchema } from './auth.schema';

describe('Auth Validation Schemas (Zod)', () => {
  it('should validate correct registration payload', () => {
    const valid = {
      email: 'alex@example.com',
      name: 'Alex Rivera',
      password: 'Password123',
    };

    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should reject invalid password without uppercase or numbers', () => {
    const invalid = {
      email: 'alex@example.com',
      name: 'Alex Rivera',
      password: 'passwordonly',
    };

    const result = registerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should validate login schema with valid email', () => {
    const valid = {
      email: 'alex@example.com',
      password: 'anyPassword',
    };

    const result = loginSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should validate refresh token schema', () => {
    const valid = {
      refreshToken: 'some-jwt-refresh-token-string',
    };

    const result = refreshTokenSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
