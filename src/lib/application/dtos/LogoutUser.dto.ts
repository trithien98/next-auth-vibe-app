export interface LogoutUserDto {
  userId: string;
  refreshToken?: string;
}

export interface LogoutUserResponseDto {
  success: boolean;
  message: string;
}
