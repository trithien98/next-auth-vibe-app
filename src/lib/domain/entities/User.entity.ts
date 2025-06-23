import { UserId } from "../value-objects/UserId.vo";
import { Email } from "../value-objects/Email.vo";
import { Role } from "./Role.entity";
import { Permission } from "./Permission.entity";

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  lastLoginAt?: Date;
}

interface UserData {
  id: string;
  email: string;
  profile: UserProfile;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  constructor(
    private readonly id: UserId,
    private readonly email: Email,
    private profile: UserProfile,
    private roles: Role[] = [],
    private isActive: boolean = true,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date()
  ) {
    this.validateInputs();
  }

  // Getters
  public getId(): UserId {
    return this.id;
  }

  public getEmail(): Email {
    return this.email;
  }

  public getProfile(): UserProfile {
    return { ...this.profile }; // Return copy to maintain immutability
  }

  public getRoles(): Role[] {
    return [...this.roles]; // Return copy to maintain immutability
  }

  public isUserActive(): boolean {
    return this.isActive;
  }

  public getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  public getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  // Business Logic Methods
  public assignRole(role: Role): void {
    if (!this.hasRole(role)) {
      this.roles.push(role);
      this.updateTimestamp();
    }
  }

  public removeRole(role: Role): void {
    this.roles = this.roles.filter((r) => !r.equals(role));
    this.updateTimestamp();
  }

  public hasRole(role: Role): boolean {
    return this.roles.some((r) => r.equals(role));
  }

  public hasRoleByName(roleName: string): boolean {
    return this.roles.some((r) => r.getName() === roleName);
  }

  public hasPermission(permission: Permission): boolean {
    return this.roles.some((role) => role.hasPermission(permission));
  }

  public canPerform(resource: string, action: string): boolean {
    return this.roles.some((role) => role.canPerform(resource, action));
  }

  public updateProfile(updates: Partial<UserProfile>): void {
    this.profile = { ...this.profile, ...updates };
    this.updateTimestamp();
  }

  public verifyEmail(): void {
    this.profile.isEmailVerified = true;
    this.updateTimestamp();
  }

  public enableTwoFactor(): void {
    this.profile.isTwoFactorEnabled = true;
    this.updateTimestamp();
  }

  public disableTwoFactor(): void {
    this.profile.isTwoFactorEnabled = false;
    this.updateTimestamp();
  }

  public recordLogin(): void {
    this.profile.lastLoginAt = new Date();
    this.updateTimestamp();
  }

  public activate(): void {
    this.isActive = true;
    this.updateTimestamp();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updateTimestamp();
  }

  public getFullName(): string {
    return `${this.profile.firstName} ${this.profile.lastName}`.trim();
  }

  public getHighestRoleLevel(): number {
    if (this.roles.length === 0) return 0;
    return Math.max(...this.roles.map((role) => role.getLevel()));
  }

  public isAdmin(): boolean {
    return this.hasRoleByName("Admin") || this.getHighestRoleLevel() >= 10;
  }

  public isManager(): boolean {
    return this.hasRoleByName("Manager") || this.getHighestRoleLevel() >= 5;
  }

  private validateInputs(): void {
    if (!this.profile.firstName?.trim()) {
      throw new Error("First name cannot be empty");
    }
    if (!this.profile.lastName?.trim()) {
      throw new Error("Last name cannot be empty");
    }
  }

  private updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  public toPlainObject(): UserData & {
    roles: ReturnType<Role["toPlainObject"]>[];
  } {
    return {
      id: this.id.getValue(),
      email: this.email.getValue(),
      profile: { ...this.profile },
      roles: this.roles.map((r) => r.toPlainObject()),
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPlainObject(obj: UserData & { roles?: Role[] }): User {
    return new User(
      new UserId(obj.id),
      new Email(obj.email),
      obj.profile,
      obj.roles || [],
      obj.isActive,
      obj.createdAt,
      obj.updatedAt
    );
  }

  // Factory methods for common user types
  public static createNewUser(
    email: string,
    firstName: string,
    lastName: string
  ): User {
    return new User(
      UserId.generate(),
      new Email(email),
      {
        firstName,
        lastName,
        isEmailVerified: false,
        isTwoFactorEnabled: false,
      },
      [Role.createUserRole()] // Default role
    );
  }
}
