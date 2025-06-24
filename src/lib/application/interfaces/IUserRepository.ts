import { User } from "../../domain/entities/User.entity";
import { UserId } from "../../domain/value-objects/UserId.vo";
import { Email } from "../../domain/value-objects/Email.vo";

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByVerificationToken(token: string): Promise<User | null>;
  findByPasswordResetToken(token: string): Promise<User | null>;
  save(user: User, password?: string): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
  exists(email: Email): Promise<boolean>;
  verifyPassword(email: Email, password: string): Promise<boolean>;
  setVerificationToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void>;
  clearVerificationToken(userId: string): Promise<void>;
  setPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void>;
  clearPasswordResetToken(userId: string): Promise<void>;
}
