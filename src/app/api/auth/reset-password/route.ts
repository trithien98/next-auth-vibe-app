import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/infrastructure/config/container";
import { ResetPasswordUseCase } from "@/lib/application/use-cases/PasswordReset.usecase";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.token || !body.password || !body.confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Token, password, and confirm password are required",
        },
        { status: 400 }
      );
    }

    const resetPasswordUseCase = container.get<ResetPasswordUseCase>(
      "ResetPasswordUseCase"
    );
    const result = await resetPasswordUseCase.execute({
      token: body.token,
      password: body.password,
      confirmPassword: body.confirmPassword,
    });

    const statusCode = result.success ? 200 : 400;
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
