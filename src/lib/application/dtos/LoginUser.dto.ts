export interface LoginUserDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginUserResponseDto {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
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
