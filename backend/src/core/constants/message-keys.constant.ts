/**
 * Structured Message Keys for IDE Autocomplete & Dot-Notation
 * Developers can use either MessageKeys.AUTH.LOGIN_SUCCESS or string literals 'success.loginSuccessful'
 */
export const MessageKeys = {
  ERRORS: {
    INTERNAL_SERVER_ERROR: 'errors.internalServerError',
    VALIDATION_FAILED: 'errors.validationFailed',
    UNAUTHORIZED: 'errors.unauthorized',
    FORBIDDEN: 'errors.forbidden',
    NOT_FOUND: 'errors.notFound',
    ROUTE_NOT_FOUND: 'errors.routeNotFound',
    RATE_LIMIT_EXCEEDED: 'errors.rateLimitExceeded',
    AUTH_RATE_LIMIT_EXCEEDED: 'errors.authRateLimitExceeded',
    INVALID_CREDENTIALS: 'errors.invalidCredentials',
    TOKEN_EXPIRED: 'errors.tokenExpired',
    TOKEN_INVALID: 'errors.tokenInvalid',
    TOKEN_REVOKED: 'errors.tokenRevoked',
    DUPLICATE_EMAIL: 'errors.duplicateEmail',
    USER_NOT_FOUND: 'errors.userNotFound',
    PRODUCT_NOT_FOUND: 'errors.productNotFound',
    BAD_REQUEST: 'errors.badRequest',
    DATABASE_UNAVAILABLE: 'errors.databaseUnavailable',
  },
  SUCCESS: {
    HEALTH_CHECK: 'success.healthCheck',
    REGISTRATION_SUCCESSFUL: 'success.registrationSuccessful',
    LOGIN_SUCCESSFUL: 'success.loginSuccessful',
    TOKENS_REFRESHED: 'success.tokensRefreshed',
    LOGGED_OUT: 'success.loggedOut',
    USER_PROFILE_RETRIEVED: 'success.userProfileRetrieved',
    PRODUCTS_RETRIEVED: 'success.productsRetrieved',
    PRODUCT_STATISTICS_RETRIEVED: 'success.productStatisticsRetrieved',
    PRODUCT_DETAILS_RETRIEVED: 'success.productDetailsRetrieved',
    PRODUCT_CREATED: 'success.productCreated',
    PRODUCT_UPDATED: 'success.productUpdated',
    PRODUCT_DELETED: 'success.productDeleted',
  },
} as const;
