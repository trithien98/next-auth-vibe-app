import { ObjectId } from "mongodb";

export class UserId {
  private readonly value: string;

  constructor(id: string) {
    if (!id || id.trim().length === 0) {
      throw new Error("UserId cannot be empty");
    }
    this.value = id.trim();
  }

  public static generate(): UserId {
    // Generate a new MongoDB ObjectId
    return new UserId(new ObjectId().toString());
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
