export class UserId {
  private readonly value: string;

  constructor(id: string) {
    if (!id || id.trim().length === 0) {
      throw new Error("UserId cannot be empty");
    }
    this.value = id.trim();
  }

  public static generate(): UserId {
    // Generate a new UUID-like string
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2);
    return new UserId(`${timestamp}${randomPart}`);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: UserId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
