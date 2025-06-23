import { injectable } from "inversify";
import jwt from "jsonwebtoken";
import type {
  IJwtTokenService,
  TokenPayload,
} from "../../application/interfaces/IJwtTokenService";

@injectable()
export class JwtTokenService implements IJwtTokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry = "15m";
  private readonly refreshTokenExpiry = "7d";

  constructor() {
    this.accessTokenSecret =
      process.env.JWT_ACCESS_SECRET || "fallback-access-secret";
    this.refreshTokenSecret =
      process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret";
  }

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: "next-auth-based",
      audience: "next-auth-based-users",
    });
  }

  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
      issuer: "next-auth-based",
      audience: "next-auth-based-users",
    });
  }

  async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: "next-auth-based",
        audience: "next-auth-based-users",
      }) as TokenPayload;

      return decoded;
    } catch (error) {
      console.error("Access token verification failed:", error);
      return null;
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: "next-auth-based",
        audience: "next-auth-based-users",
      }) as TokenPayload;

      return decoded;
    } catch (error) {
      console.error("Refresh token verification failed:", error);
      return null;
    }
  }

  async getTokenExpirationTime(token: string): Promise<Date | null> {
    try {
      const decoded = jwt.decode(token) as { exp?: number };
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      console.error("Token decoding failed:", error);
      return null;
    }
  }
}
