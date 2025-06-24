export interface ForgotPasswordDto {
  email: string;
}

export interface ForgotPasswordResponseDto {
  success: boolean;
  message: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponseDto {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    email: string;
  };
}
