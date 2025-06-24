import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/infrastructure/config/container";
import { VerifyEmailUseCase } from "@/lib/application/use-cases/VerifyEmail.usecase";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.token) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification token is required",
        },
        { status: 400 }
      );
    }

    const verifyEmailUseCase =
      container.get<VerifyEmailUseCase>("VerifyEmailUseCase");
    const result = await verifyEmailUseCase.execute({
      token: body.token,
    });

    const statusCode = result.success ? 200 : 400;
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// GET method for email verification via URL query parameter
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification token is required",
        },
        { status: 400 }
      );
    }

    const verifyEmailUseCase =
      container.get<VerifyEmailUseCase>("VerifyEmailUseCase");
    const result = await verifyEmailUseCase.execute({ token });

    const statusCode = result.success ? 200 : 400;
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
