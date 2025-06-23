import { Permission } from "./Permission.entity";

interface RoleData {
  id: string;
  name: string;
  description: string;
  level: number;
}

export class Role {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly description: string,
    private readonly level: number, // Higher level = more privileges
    private permissions: Permission[] = []
  ) {
    this.validateInputs();
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public getLevel(): number {
    return this.level;
  }

  public getPermissions(): Permission[] {
    return [...this.permissions]; // Return copy to maintain immutability
  }

  public equals(other: Role): boolean {
    return this.id === other.id;
  }

  public addPermission(permission: Permission): void {
    if (!this.hasPermission(permission)) {
      this.permissions.push(permission);
    }
  }

  public removePermission(permission: Permission): void {
    this.permissions = this.permissions.filter((p) => !p.equals(permission));
  }

  public hasPermission(permission: Permission): boolean {
    return this.permissions.some((p) => p.equals(permission));
  }

  public canPerform(resource: string, action: string): boolean {
    return this.permissions.some((p) => p.canPerform(resource, action));
  }

  public isHigherLevelThan(other: Role): boolean {
    return this.level > other.level;
  }

  public isLowerLevelThan(other: Role): boolean {
    return this.level < other.level;
  }

  public isSameLevelAs(other: Role): boolean {
    return this.level === other.level;
  }

  private validateInputs(): void {
    if (!this.id?.trim()) {
      throw new Error("Role ID cannot be empty");
    }
    if (!this.name?.trim()) {
      throw new Error("Role name cannot be empty");
    }
    if (typeof this.level !== "number" || this.level < 0) {
      throw new Error("Role level must be a non-negative number");
    }
  }

  public toPlainObject(): RoleData & {
    permissions: ReturnType<Permission["toPlainObject"]>[];
  } {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      level: this.level,
      permissions: this.permissions.map((p) => p.toPlainObject()),
    };
  }

  public static fromPlainObject(
    obj: RoleData,
    permissions: Permission[] = []
  ): Role {
    return new Role(obj.id, obj.name, obj.description, obj.level, permissions);
  }

  // Predefined role types
  public static createUserRole(): Role {
    return new Role("role_user", "User", "Basic user with limited access", 1);
  }

  public static createManagerRole(): Role {
    return new Role(
      "role_manager",
      "Manager",
      "Manager with elevated privileges",
      5
    );
  }

  public static createAdminRole(): Role {
    return new Role(
      "role_admin",
      "Admin",
      "Administrator with full system access",
      10
    );
  }
}
