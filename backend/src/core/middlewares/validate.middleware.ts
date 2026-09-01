import { ErrorCode } from '@core/constants/error-codes.constant';
import { t } from '@core/i18n/i18n';
import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@core/i18n/i18n.types';
import type { ApiErrorResponse } from '@core/types/api.types';
import type { AppEnvironment } from '@core/types/context.types';
import { type Hook, zValidator as honoZValidator } from '@hono/zod-validator';
import type { Context, Env, ValidationTargets } from 'hono';
import type { ZodSchema, z } from 'zod';

/**
 * Standardized Zod Validator Middleware for Hono
 * Ensures validation failures always return the standard ApiErrorResponse envelope with localized messages and code: VALIDATION_ERROR.
 */
export function validate<
  T extends ZodSchema,
  Target extends keyof ValidationTargets,
  E extends Env = AppEnvironment,
  P extends string = string,
>(target: Target, schema: T, hook?: Hook<z.TypeOf<T>, E, P, Target>) {
  return honoZValidator(target, schema, (result, c) => {
    if (!result.success) {
      const requestId = (c.get as (key: string) => string | undefined)('requestId') || 'unknown';
      const language = ((c.get as (key: string) => SupportedLanguage | undefined)('language') ||
        DEFAULT_LANGUAGE) as SupportedLanguage;

      const responsePayload: ApiErrorResponse = {
        success: false,
        message: t(language, 'errors.validationFailed'),
        statusCode: 400,
        code: ErrorCode.VALIDATION_ERROR,
        errors: result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
        requestId,
      };

      return c.json(responsePayload, 400);
    }

    if (hook) {
      return hook(result, c as unknown as Context<E, P>);
    }
  });
}
