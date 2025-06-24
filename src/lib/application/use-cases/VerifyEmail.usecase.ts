import { injectable, inject } from "inversify";
import crypto from "crypto";
import type { IUserRepository } from "../interfaces/IUserRepository";
import {
  VerifyEmailDto,
  VerifyEmailResponseDto,
} from "../dtos/VerifyEmail.dto";

@injectable()
export class VerifyEmailUseCase {
  constructor(
    @inject("IUserRepository") private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    try {
      if (!dto.token) {
        return {
          success: false,
          message: "Verification token is required",
        };
      }

      // Hash the token to compare with stored hash
      const hashedToken = crypto
        .createHash("sha256")
        .update(dto.token)
        .digest("hex");

      // Find user with the verification token
      const user =
        await this.userRepository.findByVerificationToken(hashedToken);

      if (!user) {
        return {
          success: false,
          message: "Invalid or expired verification token",
        };
      }

      // Check if email is already verified
      if (user.getProfile().isEmailVerified) {
        return {
          success: false,
          message: "Email is already verified",
        };
      }

      // Verify the email
      user.verifyEmail();

      // Clear verification token and expiry
      await this.userRepository.clearVerificationToken(user.getId().getValue());

      // Save the user
      await this.userRepository.save(user);

      return {
        success: true,
        message: "Email verified successfully",
        data: {
          userId: user.getId().getValue(),
          email: user.getEmail().getValue(),
        },
      };
    } catch (error) {
      console.error("Email verification error:", error);
      return {
        success: false,
        message: "Failed to verify email",
      };
    }
  }
}
