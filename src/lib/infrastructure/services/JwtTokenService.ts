import { injectable } from "inversify";
import jwt from "jsonwebtoken";
import { SessionModel } from "../database/SessionModel";
import type {
  IJwtTokenService,
  TokenPayload,
} from "../../application/interfaces/IJwtTokenService";

export interface SessionInfo {
  sessionId: string;
  userId: string;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    deviceId?: string;
  };
}

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

  async generateTokenPair(
    payload: TokenPayload,
    sessionInfo?: SessionInfo
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    refreshExpiresAt: Date;
    sessionId: string;
  }> {
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    const accessExpiresAt = new Date();
    accessExpiresAt.setMinutes(accessExpiresAt.getMinutes() + 15); // 15 minutes

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7); // 7 days

    // Create session record
    const session = new SessionModel({
      userId: payload.userId,
      refreshToken,
      accessToken,
      expiresAt: accessExpiresAt,
      refreshExpiresAt: refreshExpiresAt,
      deviceInfo: sessionInfo?.deviceInfo,
      isActive: true,
      lastUsedAt: new Date(),
    });

    await session.save();

    return {
      accessToken,
      refreshToken,
      expiresAt: accessExpiresAt,
      refreshExpiresAt: refreshExpiresAt,
      sessionId: session._id.toString(),
    };
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
      // First verify the JWT token
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: "next-auth-based",
        audience: "next-auth-based-users",
      }) as TokenPayload;

      // Then check if session exists and is active
      const session = await SessionModel.findOne({
        refreshToken: token,
        isActive: true,
        refreshExpiresAt: { $gt: new Date() },
      });

      if (!session) {
        return null;
      }

      // Update last used time
      session.lastUsedAt = new Date();
      await session.save();

      return decoded;
    } catch (error) {
      console.error("Refresh token verification failed:", error);
      return null;
    }
  }

  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    refreshExpiresAt: Date;
  } | null> {
    try {
      // Verify the refresh token
      const payload = await this.verifyRefreshToken(refreshToken);
      if (!payload) {
        return null;
      }

      // Find and invalidate the old session
      const oldSession = await SessionModel.findOne({
        refreshToken,
        isActive: true,
      });

      if (!oldSession) {
        return null;
      }

      // Mark old session as inactive
      oldSession.isActive = false;
      await oldSession.save();

      // Generate new token pair
      const newTokens = await this.generateTokenPair(payload, {
        sessionId: oldSession._id.toString(),
        userId: payload.userId,
        deviceInfo: oldSession.deviceInfo,
      });

      return newTokens;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  }

  async invalidateSession(refreshToken: string): Promise<boolean> {
    try {
      const session = await SessionModel.findOne({
        refreshToken,
        isActive: true,
      });

      if (!session) {
        return false;
      }

      session.isActive = false;
      await session.save();

      return true;
    } catch (error) {
      console.error("Session invalidation failed:", error);
      return false;
    }
  }

  async invalidateAllUserSessions(userId: string): Promise<boolean> {
    try {
      await SessionModel.updateMany(
        { userId, isActive: true },
        { isActive: false }
      );

      return true;
    } catch (error) {
      console.error("User sessions invalidation failed:", error);
      return false;
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

  async cleanupExpiredSessions(): Promise<void> {
    try {
      await SessionModel.deleteMany({
        refreshExpiresAt: { $lt: new Date() },
      });
    } catch (error) {
      console.error("Session cleanup failed:", error);
    }
  }
}
