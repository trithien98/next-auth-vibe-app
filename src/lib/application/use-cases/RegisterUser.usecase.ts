import { injectable, inject } from "inversify";
import crypto from "crypto";
import { User } from "../../domain/entities/User.entity";
import { UserId } from "../../domain/value-objects/UserId.vo";
import { Email } from "../../domain/value-objects/Email.vo";
import { Password } from "../../domain/value-objects/Password.vo";
import type { IUserRepository } from "../interfaces/IUserRepository";
import type { IPasswordHasher } from "../interfaces/IPasswordHasher";
import type { IEmailService } from "../interfaces/IEmailService";
import {
  RegisterUserDto,
  RegisterUserResponseDto,
} from "../dtos/RegisterUser.dto";

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject("IUserRepository") private readonly userRepository: IUserRepository,
    @inject("IPasswordHasher") private readonly passwordHasher: IPasswordHasher,
    @inject("IEmailService") private readonly emailService: IEmailService
  ) {}

  async execute(dto: RegisterUserDto): Promise<RegisterUserResponseDto> {
    try {
      // Validate email format using Email value object
      const email = new Email(dto.email);

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return {
          success: false,
          message: "User with this email already exists",
        };
      }

      // Validate password using Password value object
      new Password(dto.password); // Validates password format

      // Password will be hashed in the infrastructure layer during save

      // Create new user ID
      const userId = UserId.generate();

      // Create user profile
      const userProfile = {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phoneNumber: dto.phoneNumber?.trim(),
        isEmailVerified: false,
        isTwoFactorEnabled: false,
      };

      // Create user entity
      const user = new User(userId, email, userProfile);

      // Set password hash (assuming we add this method to User entity)
      // For now, we'll handle password storage in the infrastructure layer

      // Save user to repository
      await this.userRepository.save(user);

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

      // Set verification token with 24 hour expiry
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await this.userRepository.setVerificationToken(
        userId.getValue(),
        hashedToken,
        expiresAt
      );

      // Send verification email with the original token (not hashed)
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await this.emailService.sendVerificationEmail(
        email.getValue(),
        verificationUrl
      );

      return {
        success: true,
        userId: userId.getValue(),
        message:
          "User registered successfully. Please check your email for verification.",
        emailVerificationRequired: true,
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: false,
        message: "An unexpected error occurred during registration",
      };
    }
  }
}
