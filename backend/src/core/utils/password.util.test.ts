import { describe, expect, it } from 'bun:test';
import { hashPassword, verifyPassword } from './password.util';

describe('Password Util (Argon2id)', () => {
  it('should hash a password and verify matching hash correctly', async () => {
    const rawPassword = 'superSecretPassword123!';
    const hash = await hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash.length).toBeGreaterThan(20);
    expect(hash).not.toBe(rawPassword);

    const isMatch = await verifyPassword(rawPassword, hash);
    expect(isMatch).toBe(true);
  });

  it('should return false for incorrect password verification', async () => {
    const rawPassword = 'correctPassword';
    const hash = await hashPassword(rawPassword);

    const isMatch = await verifyPassword('wrongPassword', hash);
    expect(isMatch).toBe(false);
  });
});
