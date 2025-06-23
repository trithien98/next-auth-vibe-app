export interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

export interface IJwtTokenService {
  generateAccessToken(payload: TokenPayload): Promise<string>;
  generateRefreshToken(payload: TokenPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<TokenPayload | null>;
  verifyRefreshToken(token: string): Promise<TokenPayload | null>;
  getTokenExpirationTime(token: string): Promise<Date | null>;
}
