import { env } from '@core/config/env';
import type { AppEnvironment, AuthUser } from '@core/types/context.types';
import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as jose from 'jose';

const ACCESS_SECRET = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

/**
 * Signs a short-lived JWT Access Token (e.g. 15 minutes)
 */
export async function signAccessToken(user: AuthUser): Promise<string> {
  return new jose.SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(env.APP_NAME)
    .setExpirationTime(env.JWT_ACCESS_EXPIRES_IN)
    .sign(ACCESS_SECRET);
}

/**
 * Signs a long-lived JWT Refresh Token (e.g. 7 days)
 */
export async function signRefreshToken(
  userId: string
): Promise<{ token: string; expiresAt: Date }> {
  const token = await new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(env.APP_NAME)
    .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN)
    .sign(REFRESH_SECRET);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return { token, expiresAt };
}

/**
 * Verifies JWT Access Token and returns payload
 */
export async function verifyAccessToken(token: string): Promise<AuthUser> {
  const { payload } = await jose.jwtVerify(token, ACCESS_SECRET, {
    issuer: env.APP_NAME,
  });

  return {
    id: payload.id as string,
    email: payload.email as string,
    name: payload.name as string,
    role: payload.role as 'admin' | 'user',
  };
}

/**
 * Verifies JWT Refresh Token and returns userId (sub)
 */
export async function verifyRefreshToken(token: string): Promise<string> {
  const { payload } = await jose.jwtVerify(token, REFRESH_SECRET, {
    issuer: env.APP_NAME,
  });

  if (!payload.sub) {
    throw new Error('Invalid refresh token payload');
  }

  return payload.sub;
}

/**
 * Hono Auth Guard Middleware.
 * Extracts Bearer token, verifies signature and expiration, and binds user to context.
 */
export async function authMiddleware(c: Context<AppEnvironment>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPException(401, {
      message: 'Authentication required. Missing or malformed Bearer token.',
    });
  }

  const token = authHeader.substring(7).trim();

  try {
    const user = await verifyAccessToken(token);
    c.set('user', user);
    await next();
  } catch (_err: unknown) {
    throw new HTTPException(401, { message: 'Invalid, malformed, or expired access token.' });
  }
}
