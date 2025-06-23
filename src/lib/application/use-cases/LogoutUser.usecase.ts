import { injectable, inject } from "inversify";
import { UserId } from "../../domain/value-objects/UserId.vo";
import type { IUserRepository } from "../interfaces/IUserRepository";
import type { IJwtTokenService } from "../interfaces/IJwtTokenService";
import { LogoutUserDto, LogoutUserResponseDto } from "../dtos/LogoutUser.dto";

@injectable()
export class LogoutUserUseCase {
  constructor(
    @inject("IUserRepository") private readonly userRepository: IUserRepository,
    @inject("IJwtTokenService")
    private readonly jwtTokenService: IJwtTokenService
  ) {}

  async execute(dto: LogoutUserDto): Promise<LogoutUserResponseDto> {
    try {
      // Validate user ID
      const userId = new UserId(dto.userId);

      // Find user to ensure they exist
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // If refresh token is provided, verify it's valid
      if (dto.refreshToken) {
        const tokenPayload = await this.jwtTokenService.verifyRefreshToken(
          dto.refreshToken
        );
        if (!tokenPayload) {
          return {
            success: false,
            message: "Invalid refresh token",
          };
        }

        // Ensure the token belongs to the requesting user
        if (tokenPayload.userId !== userId.getValue()) {
          return {
            success: false,
            message: "Token does not belong to user",
          };
        }
      }

      // In a real implementation, we would:
      // 1. Invalidate the refresh token (add to blacklist or remove from storage)
      // 2. Optionally invalidate all sessions for the user
      // 3. Clear any session data stored in Redis

      // For now, we just return success since the actual token invalidation
      // would be handled in the infrastructure layer

      return {
        success: true,
        message: "Logout successful",
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
        message: "An unexpected error occurred during logout",
      };
    }
  }
}
