export interface LogoutUserDto {
  userId: string;
  refreshToken?: string;
  logoutFromAllDevices?: boolean;
}

export interface LogoutUserResponseDto {
  success: boolean;
  message: string;
}
