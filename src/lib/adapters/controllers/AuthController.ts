import { injectable, inject } from "inversify";
import { NextRequest, NextResponse } from "next/server";
import type { RegisterUserUseCase } from "../../application/use-cases/RegisterUser.usecase";
import type { LoginUserUseCase } from "../../application/use-cases/LoginUser.usecase";
import type { LogoutUserUseCase } from "../../application/use-cases/LogoutUser.usecase";

@injectable()
export class AuthController {
  constructor(
    @inject("RegisterUserUseCase")
    private readonly registerUserUseCase: RegisterUserUseCase,
    @inject("LoginUserUseCase")
    private readonly loginUserUseCase: LoginUserUseCase,
    @inject("LogoutUserUseCase")
    private readonly logoutUserUseCase: LogoutUserUseCase
  ) {}

  async register(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();

      // Basic validation
      if (!body.email || !body.password || !body.firstName || !body.lastName) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Missing required fields: email, password, firstName, lastName",
          },
          { status: 400 }
        );
      }

      const result = await this.registerUserUseCase.execute({
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
        phoneNumber: body.phoneNumber,
      });

      const statusCode = result.success ? 201 : 400;
      return NextResponse.json(result, { status: statusCode });
    } catch (error) {
      console.error("Registration error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Internal server error",
        },
        { status: 500 }
      );
    }
  }

  async login(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();

      // Basic validation
      if (!body.email || !body.password) {
        return NextResponse.json(
          {
            success: false,
            message: "Missing required fields: email, password",
          },
          { status: 400 }
        );
      }

      const result = await this.loginUserUseCase.execute({
        email: body.email,
        password: body.password,
        rememberMe: body.rememberMe,
      });

      const statusCode = result.success ? 200 : 401;
      const response = NextResponse.json(result, { status: statusCode });

      // Set HTTP-only cookies for tokens if login successful
      if (result.success && result.accessToken && result.refreshToken) {
        response.cookies.set("accessToken", result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60, // 15 minutes
        });

        response.cookies.set("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });
      }

      return response;
    } catch (error) {
      console.error("Login error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Internal server error",
        },
        { status: 500 }
      );
    }
  }

  async logout(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();

      // Get user ID from token or session
      // This would typically be extracted from the JWT token
      if (!body.userId) {
        return NextResponse.json(
          {
            success: false,
            message: "User ID is required",
          },
          { status: 400 }
        );
      }

      const refreshToken = request.cookies.get("refreshToken")?.value;

      const result = await this.logoutUserUseCase.execute({
        userId: body.userId,
        refreshToken,
      });

      const response = NextResponse.json(result, {
        status: result.success ? 200 : 400,
      });

      // Clear cookies
      if (result.success) {
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
      }

      return response;
    } catch (error) {
      console.error("Logout error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Internal server error",
        },
        { status: 500 }
      );
    }
  }
}
