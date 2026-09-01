import type { AppEnvironment } from '@core/types/context.types';
import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

export function requireRoles(...allowedRoles: string[]) {
  return async (c: Context<AppEnvironment>, next: Next) => {
    const user = c.get('user');

    if (!user) {
      throw new HTTPException(401, { message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(user.role)) {
      throw new HTTPException(403, {
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Your role is '${user.role}'.`,
      });
    }

    await next();
  };
}
