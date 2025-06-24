export interface VerifyEmailDto {
  token: string;
}

export interface VerifyEmailResponseDto {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    email: string;
  };
}
