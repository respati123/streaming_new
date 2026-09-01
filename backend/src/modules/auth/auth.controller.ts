import { env } from '@core/config/env';
import { authMiddleware } from '@core/middlewares/auth.middleware';
import { validate } from '@core/middlewares/validate.middleware';
import type { AppEnvironment } from '@core/types/context.types';
import { sendCreated, sendSuccess } from '@core/utils/response.util';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { loginSchema, registerSchema } from './auth.schema';
import { type AuthService, authService } from './auth.service';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/v1/auth';
const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;

export function createAuthController(service: AuthService = authService) {
  const router = new Hono<AppEnvironment>();

  /**
   * POST /api/v1/auth/register
   * Register a new user account and attach HTTP-Only refresh cookie
   */
  router.post('/register', validate('json', registerSchema), async (c) => {
    const body = c.req.valid('json');
    const result = await service.register(body);

    setCookie(c, REFRESH_COOKIE_NAME, result.tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: SEVEN_DAYS_IN_SECONDS,
      path: REFRESH_COOKIE_PATH,
    });

    return sendCreated(c, result, 'success.registrationSuccessful');
  });

  /**
   * POST /api/v1/auth/login
   * Authenticate user and attach HTTP-Only refresh cookie
   */
  router.post('/login', validate('json', loginSchema), async (c) => {
    const body = c.req.valid('json');
    const result = await service.login(body);

    setCookie(c, REFRESH_COOKIE_NAME, result.tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: SEVEN_DAYS_IN_SECONDS,
      path: REFRESH_COOKIE_PATH,
    });

    return sendSuccess(c, result, 'success.loginSuccessful');
  });

  /**
   * POST /api/v1/auth/refresh
   * Rotate and issue new access & refresh tokens (supports HTTP-Only cookie and JSON body)
   */
  router.post('/refresh', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const refreshToken =
      getCookie(c, REFRESH_COOKIE_NAME) ||
      body.refreshToken ||
      c.req.header('x-refresh-token') ||
      '';

    if (!refreshToken) {
      throw new HTTPException(400, { message: 'Refresh token is required' });
    }

    const tokens = await service.refreshTokens(refreshToken);

    setCookie(c, REFRESH_COOKIE_NAME, tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: SEVEN_DAYS_IN_SECONDS,
      path: REFRESH_COOKIE_PATH,
    });

    return sendSuccess(c, tokens, 'success.tokensRefreshed');
  });

  /**
   * POST /api/v1/auth/logout
   * Invalidate active refresh token in database & clear HTTP-Only cookie
   */
  router.post('/logout', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const refreshToken =
      getCookie(c, REFRESH_COOKIE_NAME) ||
      body.refreshToken ||
      c.req.header('x-refresh-token') ||
      '';

    if (refreshToken) {
      await service.logout(refreshToken);
    }

    deleteCookie(c, REFRESH_COOKIE_NAME, {
      path: REFRESH_COOKIE_PATH,
    });

    return sendSuccess(c, null, 'success.loggedOut');
  });

  /**
   * GET /api/v1/auth/me
   * Retrieve current authenticated user profile
   */
  router.get('/me', authMiddleware, async (c) => {
    const currentUser = c.get('user');
    if (!currentUser) {
      return c.json({ success: false, message: 'Unauthorized' }, 401);
    }
    const profile = await service.getProfile(currentUser.id);
    return sendSuccess(c, profile, 'success.userProfileRetrieved');
  });

  return router;
}

export const authController = createAuthController();
