import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/infrastructure/config/container";
import { JwtTokenService } from "@/lib/infrastructure/services/JwtTokenService";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Refresh token is required",
        },
        { status: 400 }
      );
    }

    const jwtTokenService = container.get<JwtTokenService>("IJwtTokenService");
    const result = await jwtTokenService.refreshTokens(body.refreshToken);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired refresh token",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Tokens refreshed successfully",
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresAt: result.expiresAt.getTime(),
          refreshExpiresAt: result.refreshExpiresAt.getTime(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
