import { describe, expect, it } from 'vitest';
import { loginSchema } from './auth.schema';

describe('Auth Schema (Zod Validation)', () => {
  it('should validate valid email and password format', () => {
    const validData = {
      email: 'user@example.com',
      password: 'secretPassword123',
      rememberMe: true,
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email format', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'password123',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('valid email');
    }
  });

  it('should reject short password under 6 characters', () => {
    const invalidData = {
      email: 'user@example.com',
      password: '123',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at least 6 characters');
    }
  });
});
