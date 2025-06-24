import { injectable, inject } from "inversify";
import crypto from "crypto";
import { Email } from "../../domain/value-objects/Email.vo";
import { Password } from "../../domain/value-objects/Password.vo";
import type { IUserRepository } from "../interfaces/IUserRepository";
import type { IPasswordHasher } from "../interfaces/IPasswordHasher";
import type { IEmailService } from "../interfaces/IEmailService";
import {
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
  ResetPasswordDto,
  ResetPasswordResponseDto,
} from "../dtos/PasswordReset.dto";

@injectable()
export class ForgotPasswordUseCase {
  constructor(
    @inject("IUserRepository") private readonly userRepository: IUserRepository,
    @inject("IEmailService") private readonly emailService: IEmailService
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    try {
      // Validate email format
      const email = new Email(dto.email);

      // Find user by email
      const user = await this.userRepository.findByEmail(email);

      // Always return success for security (don't reveal if email exists)
      if (!user) {
        return {
          success: true,
          message:
            "If your email is registered, you will receive a password reset link.",
        };
      }

      // Check if user is active
      if (!user.isUserActive()) {
        return {
          success: true,
          message:
            "If your email is registered, you will receive a password reset link.",
        };
      }

      // Generate password reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Set reset token with 1 hour expiry
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await this.userRepository.setPasswordResetToken(
        user.getId().getValue(),
        hashedToken,
        expiresAt
      );

      // Send password reset email with the original token (not hashed)
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await this.emailService.sendPasswordResetEmail(
        email.getValue(),
        resetUrl
      );

      return {
        success: true,
        message:
          "If your email is registered, you will receive a password reset link.",
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        message: "Failed to process password reset request",
      };
    }
  }
}

@injectable()
export class ResetPasswordUseCase {
  constructor(
    @inject("IUserRepository") private readonly userRepository: IUserRepository,
    @inject("IPasswordHasher") private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    try {
      if (!dto.token) {
        return {
          success: false,
          message: "Reset token is required",
        };
      }

      if (dto.password !== dto.confirmPassword) {
        return {
          success: false,
          message: "Passwords do not match",
        };
      }

      // Validate password format
      new Password(dto.password);

      // Hash the token to compare with stored hash
      const hashedToken = crypto
        .createHash("sha256")
        .update(dto.token)
        .digest("hex");

      // Find user with the reset token
      const user =
        await this.userRepository.findByPasswordResetToken(hashedToken);

      if (!user) {
        return {
          success: false,
          message: "Invalid or expired reset token",
        };
      }

      // Hash the new password
      const hashedPassword = await this.passwordHasher.hash(dto.password);

      // Update user password in the database directly
      // Note: In a clean architecture, we might want to handle this differently
      // For now, we'll update through the repository
      await this.updateUserPassword(user.getId().getValue(), hashedPassword);

      // Clear password reset token
      await this.userRepository.clearPasswordResetToken(
        user.getId().getValue()
      );

      return {
        success: true,
        message: "Password reset successfully",
        data: {
          userId: user.getId().getValue(),
          email: user.getEmail().getValue(),
        },
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message: "Failed to reset password",
      };
    }
  }

  private async updateUserPassword(
    userId: string,
    hashedPassword: string
  ): Promise<void> {
    // This would ideally be a method in the repository
    // For now, we'll access the UserModel directly
    const { UserModel } = await import(
      "../../infrastructure/database/UserModel"
    );
    await UserModel.findByIdAndUpdate(userId, { passwordHash: hashedPassword });
  }
}
