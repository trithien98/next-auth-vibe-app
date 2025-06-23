export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new Error("Invalid email format");
    }
    this.value = email.toLowerCase().trim();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  public getDomain(): string {
    return this.value.split("@")[1];
  }

  public getLocalPart(): string {
    return this.value.split("@")[0];
  }

  private isValid(email: string): boolean {
    if (!email || typeof email !== "string") {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();

    return (
      emailRegex.test(trimmedEmail) &&
      trimmedEmail.length <= 254 && // RFC 5321 limit
      trimmedEmail.split("@")[0].length <= 64 && // Local part limit
      trimmedEmail.split("@")[1].length <= 253 // Domain part limit
    );
  }

  public toString(): string {
    return this.value;
  }
}
