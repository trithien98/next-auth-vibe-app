export interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    deviceId?: string;
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
  sessionId: string;
}

export interface IJwtTokenService {
  generateAccessToken(payload: TokenPayload): Promise<string>;
  generateRefreshToken(payload: TokenPayload): Promise<string>;
  generateTokenPair(
    payload: TokenPayload,
    sessionInfo?: SessionInfo
  ): Promise<TokenPair>;
  verifyAccessToken(token: string): Promise<TokenPayload | null>;
  verifyRefreshToken(token: string): Promise<TokenPayload | null>;
  refreshTokens(
    refreshToken: string
  ): Promise<Omit<TokenPair, "sessionId"> | null>;
  invalidateSession(refreshToken: string): Promise<boolean>;
  invalidateAllUserSessions(userId: string): Promise<boolean>;
  getTokenExpirationTime(token: string): Promise<Date | null>;
  cleanupExpiredSessions(): Promise<void>;
}
