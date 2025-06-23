export interface RegisterUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface RegisterUserResponseDto {
  success: boolean;
  userId?: string;
  message: string;
  emailVerificationRequired?: boolean;
}
