import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/infrastructure/config/container";
import { ForgotPasswordUseCase } from "@/lib/application/use-cases/PasswordReset.usecase";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    const forgotPasswordUseCase = container.get<ForgotPasswordUseCase>(
      "ForgotPasswordUseCase"
    );
    const result = await forgotPasswordUseCase.execute({
      email: body.email,
    });

    const statusCode = result.success ? 200 : 400;
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
