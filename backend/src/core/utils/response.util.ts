import { t } from "@core/i18n/i18n";
import {
  DEFAULT_LANGUAGE,
  type MessageKey,
  type SupportedLanguage,
  type TranslationParams,
} from "@core/i18n/i18n.types";
import type { ApiResponse, PaginationMeta } from "@core/types/api.types";
import type { AppEnvironment } from "@core/types/context.types";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Send a standardized, multi-language JSON success response.
 * messageOrKey supports full TypeScript IDE autocompletion for translation keys
 * (e.g. 'success.loginSuccessful', 'success.productCreated') as well as custom strings.
 */
export function sendSuccess<TData>(
  c: Context<AppEnvironment>,
  data: TData,
  messageOrKey: MessageKey = "success.healthCheck",
  statusCode: number = 200,
  meta?: PaginationMeta,
  params?: TranslationParams,
) {
  const requestId = c.get("requestId");
  const language: SupportedLanguage = c.get("language") || DEFAULT_LANGUAGE;

  const translatedMessage = t(language, messageOrKey, params);
  const finalMessage =
    translatedMessage === messageOrKey && !messageOrKey.includes(".")
      ? messageOrKey
      : translatedMessage;

  const payload: ApiResponse<TData> = {
    success: true,
    message: finalMessage,
    data,
    ...(meta && { meta }),
    ...(requestId && { requestId }),
  };

  return c.json(payload, statusCode as ContentfulStatusCode);
}

/**
 * Send a standardized 201 Created JSON success response with automatic localization and IDE autocomplete.
 */
export function sendCreated<TData>(
  c: Context<AppEnvironment>,
  data: TData,
  messageOrKey: MessageKey = "success.productCreated",
  params?: TranslationParams,
) {
  return sendSuccess(c, data, messageOrKey, 201, undefined, params);
}
