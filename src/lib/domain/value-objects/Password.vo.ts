export class Password {
  private readonly value: string;

  constructor(password: string) {
    if (!this.isValid(password)) {
      throw new Error("Password does not meet security requirements");
    }
    this.value = password;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Password): boolean {
    return this.value === other.value;
  }

  private isValid(password: string): boolean {
    if (!password || typeof password !== "string") {
      return false;
    }

    // Password requirements:
    // - At least 8 characters
    // - At least one uppercase letter
    // - At least one lowercase letter
    // - At least one number
    // - At least one special character
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }

  public getStrength(): "weak" | "medium" | "strong" {
    const length = this.value.length;
    const hasUpperCase = /[A-Z]/.test(this.value);
    const hasLowerCase = /[a-z]/.test(this.value);
    const hasNumbers = /\d/.test(this.value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.value);

    const score = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    ].filter(Boolean).length;

    if (length >= 12 && score === 4) return "strong";
    if (length >= 8 && score >= 3) return "medium";
    return "weak";
  }

  public static getRequirements(): string[] {
    return [
      "At least 8 characters long",
      "At least one uppercase letter",
      "At least one lowercase letter",
      "At least one number",
      'At least one special character (!@#$%^&*(),.?":{}|<>)',
    ];
  }
}
