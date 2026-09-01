import type { AuthUser } from '@core/types/context.types';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: TokenPair;
}

export interface RegisterDTO {
  email: string;
  name: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
