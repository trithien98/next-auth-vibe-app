export interface LoginUserDto {
  email: string;
  password: string;
  rememberMe?: boolean;
  userAgent?: string;
  ipAddress?: string;
  deviceId?: string;
}

export interface LoginUserResponseDto {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  refreshExpiresAt?: Date;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    isEmailVerified: boolean;
    isTwoFactorEnabled: boolean;
  };
  message: string;
  requiresTwoFactor?: boolean;
}
