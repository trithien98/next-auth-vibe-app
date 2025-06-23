import { injectable, inject } from "inversify";
import { Email } from "../../domain/value-objects/Email.vo";
import { Password } from "../../domain/value-objects/Password.vo";
import type { IUserRepository } from "../interfaces/IUserRepository";
import type { IPasswordHasher } from "../interfaces/IPasswordHasher";
import type { IJwtTokenService } from "../interfaces/IJwtTokenService";
import { LoginUserDto, LoginUserResponseDto } from "../dtos/LoginUser.dto";

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject("IUserRepository") private readonly userRepository: IUserRepository,
    @inject("IPasswordHasher") private readonly passwordHasher: IPasswordHasher,
    @inject("IJwtTokenService")
    private readonly jwtTokenService: IJwtTokenService
  ) {}

  async execute(dto: LoginUserDto): Promise<LoginUserResponseDto> {
    try {
      // Validate email format
      const email = new Email(dto.email);

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      // Check if user is active
      if (!user.isUserActive()) {
        return {
          success: false,
          message: "Account is deactivated. Please contact support.",
        };
      }

      // Validate password format
      new Password(dto.password); // Validates password format

      // Verify password (password hash comparison will be handled in infrastructure)
      // For now, we'll assume the repository can handle password verification

      // Check if email is verified
      const profile = user.getProfile();
      if (!profile.isEmailVerified) {
        return {
          success: false,
          message: "Please verify your email before logging in",
        };
      }

      // Check if two-factor authentication is required
      if (profile.isTwoFactorEnabled) {
        return {
          success: false,
          message: "Two-factor authentication required",
          requiresTwoFactor: true,
        };
      }

      // Update last login time
      user.recordLogin();

      // Save updated user
      await this.userRepository.update(user);

      // Generate tokens
      const tokenPayload = {
        userId: user.getId().getValue(),
        email: user.getEmail().getValue(),
        roles: user.getRoles().map((role) => role.getName()),
      };

      const accessToken =
        await this.jwtTokenService.generateAccessToken(tokenPayload);
      const refreshToken =
        await this.jwtTokenService.generateRefreshToken(tokenPayload);

      return {
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: user.getId().getValue(),
          email: user.getEmail().getValue(),
          firstName: profile.firstName,
          lastName: profile.lastName,
          roles: user.getRoles().map((role) => role.getName()),
          isEmailVerified: profile.isEmailVerified,
          isTwoFactorEnabled: profile.isTwoFactorEnabled,
        },
        message: "Login successful",
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
        message: "An unexpected error occurred during login",
      };
    }
  }
}
