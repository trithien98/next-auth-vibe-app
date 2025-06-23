# Code Patterns and Standards (Clean Architecture)

## File Organization Patterns

### Clean Architecture Directory Structure

```
src/
├── app/                           # Frameworks & Drivers Layer
│   ├── (auth)/                   # Auth page routes
│   ├── (dashboard)/              # Protected page routes
│   ├── api/                      # API route handlers
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── users/                # User management endpoints
│   │   └── admin/                # Admin endpoints
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # UI Components Layer
│   ├── ui/                       # shadcn/ui components
│   ├── auth/                     # Authentication components
│   ├── dashboard/                # Dashboard components
│   └── common/                   # Shared components
├── lib/                          # Core Application Layers
│   ├── domain/                   # Enterprise Business Rules
│   │   ├── entities/             # Domain entities
│   │   │   ├── User.entity.ts
│   │   │   ├── Role.entity.ts
│   │   │   └── Permission.entity.ts
│   │   ├── aggregates/           # Domain aggregates
│   │   │   └── UserAggregate.ts
│   │   └── value-objects/        # Domain value objects
│   │       ├── Email.vo.ts
│   │       ├── UserId.vo.ts
│   │       └── Password.vo.ts
│   ├── application/              # Application Business Rules
│   │   ├── use-cases/            # Use case implementations
│   │   │   ├── auth/
│   │   │   │   ├── RegisterUser.usecase.ts
│   │   │   │   ├── LoginUser.usecase.ts
│   │   │   │   └── LogoutUser.usecase.ts
│   │   │   └── users/
│   │   │       ├── GetUser.usecase.ts
│   │   │       └── UpdateUser.usecase.ts
│   │   ├── services/             # Application services
│   │   │   ├── EmailService.ts
│   │   │   ├── TokenService.ts
│   │   │   └── PasswordService.ts
│   │   └── interfaces/           # Port definitions (contracts)
│   │       ├── repositories/
│   │       │   ├── UserRepository.interface.ts
│   │       │   └── SessionRepository.interface.ts
│   │       └── services/
│   │           ├── EmailService.interface.ts
│   │           └── CacheService.interface.ts
│   ├── adapters/                 # Interface Adapters Layer
│   │   ├── controllers/          # Request/Response handling
│   │   │   ├── AuthController.ts
│   │   │   ├── UserController.ts
│   │   │   └── AdminController.ts
│   │   ├── repositories/         # Data access implementations
│   │   │   ├── MongoUserRepository.ts
│   │   │   └── RedisSessionRepository.ts
│   │   └── presenters/           # Response formatting
│   │       ├── AuthPresenter.ts
│   │       └── UserPresenter.ts
│   └── infrastructure/           # Frameworks & Drivers Layer
│       ├── database/             # Database implementations
│       │   ├── mongodb/
│       │   │   ├── connection.ts
│       │   │   └── models/
│       │   └── migrations/
│       ├── cache/                # Cache implementations
│       │   ├── redis/
│       │   │   └── connection.ts
│       │   └── localforage/
│       └── external/             # External service integrations
│           ├── email/
│           └── notifications/
├── hooks/                        # Custom React hooks
├── stores/                       # Client state management
├── types/                        # Shared TypeScript types
└── middleware.ts                 # Next.js middleware
```

## Naming Conventions

### Files and Directories

- **Entities**: PascalCase with `.entity.ts` suffix (`User.entity.ts`)
- **Value Objects**: PascalCase with `.vo.ts` suffix (`Email.vo.ts`)
- **Use Cases**: PascalCase with `.usecase.ts` suffix (`RegisterUser.usecase.ts`)
- **Repositories**: PascalCase with `.repository.ts` suffix (`UserRepository.ts`)
- **Controllers**: PascalCase with `Controller.ts` suffix (`AuthController.ts`)
- **Services**: PascalCase with `Service.ts` suffix (`EmailService.ts`)
- **Interfaces**: PascalCase with `.interface.ts` suffix (`UserRepository.interface.ts`)
- **Components**: PascalCase (`UserProfile.tsx`)
- **Pages**: lowercase with hyphens (`user-settings/page.tsx`)
- **Hooks**: camelCase starting with `use` (`useAuth.ts`)

## Clean Architecture Code Patterns

### 1. Domain Layer Patterns

#### Entity Pattern

```typescript
// lib/domain/entities/User.entity.ts
import { UserId } from "../value-objects/UserId.vo";
import { Email } from "../value-objects/Email.vo";
import { Role } from "./Role.entity";

export class User {
  constructor(
    private readonly id: UserId,
    private readonly email: Email,
    private profile: UserProfile,
    private roles: Role[] = [],
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date()
  ) {}

  public getId(): UserId {
    return this.id;
  }

  public getEmail(): Email {
    return this.email;
  }

  public assignRole(role: Role): void {
    // Business rule: Users can have multiple roles but not duplicates
    if (!this.hasRole(role)) {
      this.roles.push(role);
      this.updatedAt = new Date();
    }
  }

  public hasRole(role: Role): boolean {
    return this.roles.some((r) => r.equals(role));
  }

  public hasPermission(permission: Permission): boolean {
    // Business rule: Permission inheritance from roles
    return this.roles.some((role) => role.hasPermission(permission));
  }

  public updateProfile(profile: Partial<UserProfile>): void {
    this.profile = { ...this.profile, ...profile };
    this.updatedAt = new Date();
  }

  public toPlainObject() {
    return {
      id: this.id.getValue(),
      email: this.email.getValue(),
      profile: this.profile,
      roles: this.roles.map((r) => r.toPlainObject()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
```

#### Value Object Pattern

```typescript
// lib/domain/value-objects/Email.vo.ts
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

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
```

### 2. Application Layer Patterns

#### Use Case Pattern

```typescript
// lib/application/use-cases/auth/RegisterUser.usecase.ts
import { User } from "../../domain/entities/User.entity";
import { Email } from "../../domain/value-objects/Email.vo";
import { UserRepositoryInterface } from "../interfaces/repositories/UserRepository.interface";
import { EmailServiceInterface } from "../interfaces/services/EmailService.interface";
import { PasswordServiceInterface } from "../interfaces/services/PasswordService.interface";

export interface RegisterUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterUserOutput {
  userId: string;
  success: boolean;
  message: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly emailService: EmailServiceInterface,
    private readonly passwordService: PasswordServiceInterface
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    try {
      // 1. Validate business rules
      const email = new Email(input.email);

      // 2. Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new Error("User already exists with this email");
      }

      // 3. Hash password
      const hashedPassword = await this.passwordService.hash(input.password);

      // 4. Create user entity
      const user = new User(UserId.generate(), email, {
        firstName: input.firstName,
        lastName: input.lastName,
        isEmailVerified: false,
      });

      // 5. Save user
      await this.userRepository.save(user, hashedPassword);

      // 6. Send verification email
      await this.emailService.sendVerificationEmail(
        email.getValue(),
        user.getId().getValue()
      );

      return {
        userId: user.getId().getValue(),
        success: true,
        message:
          "User registered successfully. Please check your email for verification.",
      };
    } catch (error) {
      return {
        userId: "",
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
      };
    }
  }
}
```

#### Service Pattern

```typescript
// lib/application/services/TokenService.ts
import { TokenServiceInterface } from "../interfaces/services/TokenService.interface";
import { User } from "../../domain/entities/User.entity";

export class TokenService implements TokenServiceInterface {
  constructor(
    private readonly jwtSecret: string,
    private readonly refreshSecret: string
  ) {}

  generateAccessToken(user: User): string {
    // Implementation here
  }

  generateRefreshToken(user: User): string {
    // Implementation here
  }

  verifyAccessToken(token: string): any {
    // Implementation here
  }

  verifyRefreshToken(token: string): any {
    // Implementation here
  }
}
```

### 3. Interface Adapters Layer Patterns

#### Controller Pattern

```typescript
// lib/adapters/controllers/AuthController.ts
import { NextRequest, NextResponse } from "next/server";
import { RegisterUserUseCase } from "../../application/use-cases/auth/RegisterUser.usecase";
import { LoginUserUseCase } from "../../application/use-cases/auth/LoginUser.usecase";
import { AuthPresenter } from "../presenters/AuthPresenter";

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly authPresenter: AuthPresenter
  ) {}

  async register(request: NextRequest): Promise<NextResponse> {
    try {
      // 1. Parse and validate request
      const body = await request.json();
      const { email, password, firstName, lastName } = body;

      // 2. Execute use case
      const result = await this.registerUserUseCase.execute({
        email,
        password,
        firstName,
        lastName,
      });

      // 3. Format response
      return this.authPresenter.presentRegistrationResult(result);
    } catch (error) {
      return this.authPresenter.presentError(error);
    }
  }

  async login(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { email, password } = body;

      const result = await this.loginUserUseCase.execute({
        email,
        password,
      });

      return this.authPresenter.presentLoginResult(result);
    } catch (error) {
      return this.authPresenter.presentError(error);
    }
  }
}
```

#### Repository Implementation Pattern

```typescript
// lib/adapters/repositories/MongoUserRepository.ts
import { UserRepositoryInterface } from '../../application/interfaces/repositories/UserRepository.interface';
import { User } from '../../domain/entities/User.entity';
import { Email } from '../../domain/value-objects/Email.vo';
import { UserId } from '../../domain/value-objects/UserId.vo';
import { UserModel } from '../../infrastructure/database/mongodb/models/User.model';

export class MongoUserRepository implements UserRepositoryInterface {
  async save(user: User, hashedPassword?: string): Promise<void> {
    const userData = user.toPlainObject();

    const userDoc = new UserModel({
      _id: userData.id,
      email: userData.email,
      password: hashedPassword,
      profile: userData.profile,
      roles: userData.roles,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    });

    await userDoc.save();
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userDoc = await UserModel.findOne({
      email: email.getValue()
    }).populate('roles');

    if (!userDoc) {
      return null;
    }

    return this.toDomainEntity(userDoc);
  }

  async findById(id: UserId): Promise<User | null> {
    const userDoc = await UserModel.findById(id.getValue())
      .populate('roles');

    if (!userDoc) {
      return null;
    }

    return this.toDomainEntity(userDoc);
  }

  private toDomainEntity(userDoc: any): User {
    return new User(
      new UserId(userDoc._id.toString()),
      new Email(userDoc.email),
      userDoc.profile,
      userDoc.roles?.map(role => /* convert to Role entities */),
      userDoc.createdAt,
      userDoc.updatedAt
    );
  }
}
```

### 4. Frameworks & Drivers Layer Patterns

#### API Route Pattern (Next.js)

```typescript
// app/api/auth/register/route.ts
import { NextRequest } from "next/server";
import { AuthController } from "@/lib/adapters/controllers/AuthController";
import { containerRegistry } from "@/lib/infrastructure/di/container";

export async function POST(request: NextRequest) {
  const authController =
    containerRegistry.resolve<AuthController>("AuthController");
  return authController.register(request);
}
```

#### Dependency Injection Pattern

```typescript
// lib/infrastructure/di/container.ts
import { Container } from "inversify";
import { RegisterUserUseCase } from "../../application/use-cases/auth/RegisterUser.usecase";
import { MongoUserRepository } from "../../adapters/repositories/MongoUserRepository";
import { EmailService } from "../../application/services/EmailService";

const container = new Container();

// Repositories
container
  .bind<UserRepositoryInterface>("UserRepository")
  .to(MongoUserRepository);

// Services
container.bind<EmailServiceInterface>("EmailService").to(EmailService);

// Use Cases
container
  .bind<RegisterUserUseCase>("RegisterUserUseCase")
  .to(RegisterUserUseCase);

// Controllers
container.bind<AuthController>("AuthController").to(AuthController);

export { container as containerRegistry };
```

export default function ComponentName({ prop1, prop2 }: ComponentNameProps) {
// Component logic
return (
// JSX
);
}

````

#### API Route Pattern

```typescript
// API route template
import { NextRequest } from "next/server";
import { z } from "zod";

const RequestSchema = z.object({
  // Request validation schema
});

export async function POST(request: NextRequest) {
  try {
    // Validation, logic, response
  } catch (error) {
    // Error handling
  }
}
````

#### Custom Hook Pattern

```typescript
// Custom hook template
export function useCustomHook() {
  // Hook logic
  return {
    // Return object
  };
}
```

## Authentication Patterns

### JWT Token Management

```typescript
// Token storage pattern with LocalForage
import localforage from "localforage";

class TokenManager {
  private static instance: TokenManager;
  private storage = localforage.createInstance({
    name: "auth-tokens",
    storeName: "tokens",
  });

  async setTokens(accessToken: string, refreshToken: string) {
    // Storage logic
  }

  async getAccessToken(): Promise<string | null> {
    // Retrieval logic
  }
}
```

### Route Protection Pattern

```typescript
// Middleware pattern for route protection
export function middleware(request: NextRequest) {
  // Authentication check
  // Role-based access control
  // Redirect logic
}
```

## Database Patterns

### Mongoose Model Pattern

```typescript
// User model template
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Schema definition
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
```

### Data Access Pattern

```typescript
// Repository pattern for data access
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    // Database query logic
  }
}
```

## Error Handling Patterns

### API Error Response

```typescript
// Standardized error response
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
  }
}
```

### Client Error Handling

```typescript
// Error boundary pattern
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  // Error boundary logic
}
```

## Security Patterns

### Input Validation

```typescript
// Zod validation pattern
const UserRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### Rate Limiting

```typescript
// Rate limiting pattern
export function rateLimit(requests: number, windowMs: number) {
  // Rate limiting logic
}
```

## State Management Patterns

### Zustand Store Pattern

```typescript
// Zustand store template
interface AuthState {
  // State interface
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Store implementation
}));
```

## Testing Patterns

### Component Testing

```typescript
// Component test template
describe("ComponentName", () => {
  it("should render correctly", () => {
    // Test implementation
  });
});
```

### API Testing

```typescript
// API test template
describe("/api/endpoint", () => {
  it("should handle valid requests", async () => {
    // Test implementation
  });
});
```
