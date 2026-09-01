import { env } from '@core/config/env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export interface LogContext {
  requestId?: string;
  userId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  clientIp?: string;
  [key: string]: unknown;
}

class StructuredLogger {
  private currentLevelPriority: number;

  constructor() {
    this.currentLevelPriority = LOG_LEVEL_PRIORITY[env.LOG_LEVEL as LogLevel] ?? 1;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= this.currentLevelPriority;
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    const timestamp = new Date().toISOString();

    const logObject = {
      timestamp,
      level: level.toUpperCase(),
      appName: env.APP_NAME,
      environment: env.NODE_ENV,
      message,
      ...(context && { ...context }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: env.NODE_ENV === 'development' ? error.stack : undefined,
        },
      }),
    };

    if (env.NODE_ENV === 'development') {
      const colorMap: Record<LogLevel, string> = {
        debug: '\x1b[34m',
        info: '\x1b[32m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
      };
      const reset = '\x1b[0m';
      const color = colorMap[level] || reset;
      const reqId = context?.requestId ? `[${context.requestId.slice(0, 8)}] ` : '';
      console.log(
        `${color}${timestamp} [${level.toUpperCase()}]${reset} ${reqId}${message}`,
        context && Object.keys(context).length > (context.requestId ? 1 : 0) ? context : '',
        error ? error : ''
      );
    } else {
      console.log(JSON.stringify(logObject));
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog('debug')) {
      this.formatLog('debug', message, context);
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog('info')) {
      this.formatLog('info', message, context);
    }
  }

  warn(message: string, context?: LogContext, error?: Error) {
    if (this.shouldLog('warn')) {
      this.formatLog('warn', message, context, error);
    }
  }

  error(message: string, context?: LogContext, error?: Error) {
    if (this.shouldLog('error')) {
      this.formatLog('error', message, context, error);
    }
  }
}

export const logger = new StructuredLogger();
