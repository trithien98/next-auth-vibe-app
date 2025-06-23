interface PermissionData {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export class Permission {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly description: string,
    private readonly resource: string,
    private readonly action: string
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

  public getResource(): string {
    return this.resource;
  }

  public getAction(): string {
    return this.action;
  }

  public equals(other: Permission): boolean {
    return this.id === other.id;
  }

  public canPerform(resource: string, action: string): boolean {
    return this.resource === resource && this.action === action;
  }

  public getKey(): string {
    return `${this.resource}:${this.action}`;
  }

  private validateInputs(): void {
    if (!this.id?.trim()) {
      throw new Error("Permission ID cannot be empty");
    }
    if (!this.name?.trim()) {
      throw new Error("Permission name cannot be empty");
    }
    if (!this.resource?.trim()) {
      throw new Error("Permission resource cannot be empty");
    }
    if (!this.action?.trim()) {
      throw new Error("Permission action cannot be empty");
    }
  }

  public toPlainObject(): PermissionData & { key: string } {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      resource: this.resource,
      action: this.action,
      key: this.getKey(),
    };
  }

  public static fromPlainObject(obj: PermissionData): Permission {
    return new Permission(
      obj.id,
      obj.name,
      obj.description,
      obj.resource,
      obj.action
    );
  }
}
