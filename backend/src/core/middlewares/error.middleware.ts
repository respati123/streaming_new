import { env } from '@core/config/env';
import { ErrorCode } from '@core/constants/error-codes.constant';
import { t } from '@core/i18n/i18n';
import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@core/i18n/i18n.types';
import { logger } from '@core/logger/logger';
import type { ApiErrorResponse } from '@core/types/api.types';
import type { AppEnvironment } from '@core/types/context.types';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ZodError } from 'zod';

export function errorHandler(err: Error, c: Context<AppEnvironment>) {
  const requestId = c.get('requestId') || 'unknown';
  const language: SupportedLanguage = c.get('language') || DEFAULT_LANGUAGE;

  let statusCode = 500;
  let message = t(language, 'errors.internalServerError');
  let code: string = ErrorCode.INTERNAL_SERVER_ERROR;
  let errors: ApiErrorResponse['errors'];

  if (err instanceof HTTPException) {
    statusCode = err.status;
    message = err.message || t(language, 'errors.internalServerError');
    if (statusCode === 401) {
      code = ErrorCode.UNAUTHORIZED;
      if (!err.message || err.message === 'Unauthorized') {
        message = t(language, 'errors.unauthorized');
      }
    } else if (statusCode === 403) {
      code = ErrorCode.FORBIDDEN;
      if (!err.message || err.message === 'Forbidden') {
        message = t(language, 'errors.forbidden');
      }
    } else if (statusCode === 404) {
      code = ErrorCode.NOT_FOUND;
      if (!err.message || err.message === 'Not Found') {
        message = t(language, 'errors.notFound');
      }
    } else if (statusCode === 409) {
      code = ErrorCode.BAD_REQUEST;
    } else if (statusCode === 429) {
      code = ErrorCode.RATE_LIMIT_EXCEEDED;
      if (!err.message) {
        message = t(language, 'errors.rateLimitExceeded');
      }
    } else if (statusCode === 400) {
      code = ErrorCode.BAD_REQUEST;
      if (!err.message) {
        message = t(language, 'errors.badRequest');
      }
    }
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = t(language, 'errors.validationFailed');
    code = ErrorCode.VALIDATION_ERROR;
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  } else if (err.name === 'UnauthorizedError' || err.message.includes('Unauthorized')) {
    statusCode = 401;
    message = t(language, 'errors.unauthorized');
    code = ErrorCode.UNAUTHORIZED;
  } else if (err.name === 'ForbiddenError' || err.message.includes('Forbidden')) {
    statusCode = 403;
    message = t(language, 'errors.forbidden');
    code = ErrorCode.FORBIDDEN;
  } else if (err.name === 'NotFoundError' || err.message.includes('Not Found')) {
    statusCode = 404;
    message = t(language, 'errors.notFound');
    code = ErrorCode.NOT_FOUND;
  } else {
    message = err.message || t(language, 'errors.internalServerError');
    code = ErrorCode.INTERNAL_SERVER_ERROR;
  }

  logger.error(
    `Unhandled Error [${statusCode}] (${code}) [${language}]: ${message}`,
    { requestId, statusCode, code, language },
    err
  );

  const responsePayload: ApiErrorResponse = {
    success: false,
    message,
    statusCode,
    code,
    ...(errors && { errors }),
    requestId,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  return c.json(responsePayload, statusCode as ContentfulStatusCode);
}
