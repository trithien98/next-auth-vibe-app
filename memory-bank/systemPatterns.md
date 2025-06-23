# System Patterns: Clean Architecture & Design Decisions

## Overall Architecture

### Clean Architecture Overview

The backend follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frameworks & Drivers                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  │   Next.js API   │  │    MongoDB      │  │     Redis       │
│  │    Routes       │  │    Database     │  │     Cache       │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                Interface Adapters Layer                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  │  Controllers    │  │  Repositories   │  │   Presenters    │
│  │  (API Routes)   │  │ (Data Access)   │  │ (Response DTOs) │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                Application Business Rules                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  │  Use Cases      │  │    Services     │  │   Interactors   │
│  │ (Auth, RBAC)    │  │ (Email, JWT)    │  │  (Workflows)    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                Enterprise Business Rules                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  │    Entities     │  │  Domain Models  │  │  Business Logic │
│  │ (User, Role)    │  │   (Aggregates)  │  │    (Rules)      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure (Clean Architecture)

```
src/
├── app/api/                    # Frameworks & Drivers Layer
│   ├── auth/                   # Authentication endpoints
│   ├── users/                  # User management endpoints
│   └── admin/                  # Admin endpoints
├── lib/
│   ├── adapters/               # Interface Adapters Layer
│   │   ├── controllers/        # Request/Response handling
│   │   ├── repositories/       # Data access abstractions
│   │   └── presenters/         # Response formatting
│   ├── application/            # Application Business Rules
│   │   ├── use-cases/          # Use case implementations
│   │   ├── services/           # Application services
│   │   └── interfaces/         # Port definitions
│   ├── domain/                 # Enterprise Business Rules
│   │   ├── entities/           # Core business entities
│   │   ├── aggregates/         # Domain aggregates
│   │   └── value-objects/      # Domain value objects
│   └── infrastructure/         # Frameworks & Drivers
│       ├── database/           # Database implementations
│       ├── cache/              # Cache implementations
│       └── external/           # External service integrations
```

### Container Architecture

- **Application Container**: Next.js app with Bun runtime
- **Database Container**: MongoDB 6.0 with initialization scripts
- **Cache Container**: Redis 7.0 for sessions and token blacklisting
- **Email Container**: MailDev for development email testing

## Clean Architecture Layers

### 1. Enterprise Business Rules (Domain Layer)

**Purpose**: Core business logic and entities
**Dependencies**: None (pure business logic)

```typescript
// Example: User Entity
export class User {
  constructor(
    private readonly id: UserId,
    private readonly email: Email,
    private readonly profile: UserProfile,
    private roles: Role[]
  ) {}

  public assignRole(role: Role): void {
    // Business rule: Users can have multiple roles
    if (!this.hasRole(role)) {
      this.roles.push(role);
    }
  }

  public hasPermission(permission: Permission): boolean {
    // Business rule: Permission inheritance from roles
    return this.roles.some((role) => role.hasPermission(permission));
  }
}
```

### 2. Application Business Rules (Use Cases Layer)

**Purpose**: Application-specific business rules
**Dependencies**: Domain entities only

```typescript
// Example: User Registration Use Case
export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepositoryInterface,
    private emailService: EmailServiceInterface,
    private passwordHasher: PasswordHasherInterface
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // 1. Validate business rules
    // 2. Create user entity
    // 3. Hash password
    // 4. Save to repository
    // 5. Send verification email
    // 6. Return result
  }
}
```

### 3. Interface Adapters Layer

**Purpose**: Convert data between use cases and external concerns
**Dependencies**: Use cases and domain entities

```typescript
// Example: User Controller
export class UserController {
  constructor(
    private registerUseCase: RegisterUserUseCase,
    private loginUseCase: LoginUserUseCase
  ) {}

  async register(request: NextRequest): Promise<NextResponse> {
    // 1. Parse and validate request
    // 2. Convert to use case input
    // 3. Execute use case
    // 4. Format response
    // 5. Return HTTP response
  }
}

// Example: User Repository Implementation
export class MongoUserRepository implements UserRepositoryInterface {
  async save(user: User): Promise<void> {
    // Convert domain entity to MongoDB document
    // Save to database
  }

  async findByEmail(email: Email): Promise<User | null> {
    // Query MongoDB
    // Convert document to domain entity
    // Return entity
  }
}
```

### 4. Frameworks & Drivers Layer

**Purpose**: External frameworks, tools, and devices
**Dependencies**: Interface adapters only

```typescript
// Example: Next.js API Route
export async function POST(request: NextRequest) {
  const userController = new UserController();
  // Dependency injection

  return userController.register(request);
}
```

## Key Technical Decisions

### Authentication Strategy

**Decision**: JWT with refresh token rotation + Clean Architecture
**Rationale**:

- Stateless authentication scales well
- Clean separation between auth logic and infrastructure
- Testable business rules
- Short-lived access tokens limit exposure
- Refresh rotation prevents token theft abuse
- Redis blacklist enables immediate revocation

**Implementation Pattern**:

```typescript
// Domain: Authentication entity
export class Authentication {
  constructor(
    private readonly userId: UserId,
    private readonly accessToken: AccessToken,
    private readonly refreshToken: RefreshToken
  ) {}
}

// Use Case: Login user
export class LoginUserUseCase {
  async execute(input: LoginInput): Promise<LoginOutput> {
    // Business logic here
  }
}

// Controller: HTTP handling
export class AuthController {
  async login(request: NextRequest): Promise<NextResponse> {
    // HTTP-specific logic here
  }
}
```

### State Management Pattern

**Decision**: Zustand with persistence
**Rationale**:

- Lightweight compared to Redux
- Excellent TypeScript support
- Built-in persistence for auth state
- Easy to test and debug

**Implementation Pattern**:

```typescript
// Separate stores for different concerns
// Auth store: user, permissions, tokens
// UI store: theme, notifications, sidebar state
// Persist only non-sensitive data
```

### Data Storage Strategy

**Decision**: LocalForage for client-side storage
**Rationale**:

- Automatic fallback: IndexedDB → WebSQL → localStorage
- Larger storage capacity than localStorage
- Asynchronous API for better performance
- Cross-browser compatibility

**Implementation Pattern**:

```typescript
// Separate instances for tokens vs user data
// Automatic encryption for sensitive data
// Graceful fallback handling
```

## Design Patterns in Use

### Frontend Patterns

#### Route Protection Pattern

```typescript
// Higher-order component for protected routes
withAuth(Component, requiredPermission?)
// Route guards at page level
// Permission checks at component level
```

#### HTTP Client Pattern

```typescript
// Axios interceptors for token management
// Automatic retry logic for 401s
// Request queuing during token refresh
// Centralized error handling
```

#### State Management Pattern

```typescript
// Store slices for different domains
// Actions return promises for async operations
// Selectors for computed state
// Persistence middleware for auth state
```

### Backend Patterns

#### Middleware Chain Pattern

```typescript
// Request → Auth → Permission → Rate Limit → Handler
// Composable middleware for different protection levels
// Early return on authorization failures
```

#### Repository Pattern

```typescript
// Abstract data access layer
// Consistent error handling
// Transaction support
// Audit logging integration
```

#### Service Layer Pattern

```typescript
// Business logic separated from routes
// Reusable across different endpoints
// Centralized validation
// Error transformation
```

## Component Relationships

### Authentication Flow

```
User Input → Form Validation → API Client → Auth Middleware →
JWT Service → Database → Redis → Response → State Update → UI Update
```

### Permission System

```
Route Access → Permission Check → Role Service → Cache → Database →
Permission Resolution → UI Rendering
```

### Admin Operations

```
Admin Action → Permission Validation → Service Layer → Database →
Audit Logging → Cache Invalidation → Response
```

## Critical Implementation Paths

### User Registration Path

1. Form validation (client-side)
2. API endpoint validation (server-side)
3. Email uniqueness check
4. Password hashing (bcrypt)
5. User creation with default role
6. Email verification token generation
7. Email sending (development: MailDev)
8. Response with success message

### Login Path

1. Credential validation
2. Rate limiting check
3. Password verification
4. 2FA check (if enabled)
5. Token generation (access + refresh)
6. Session creation in Redis
7. Token storage (LocalForage + Cookie)
8. Permission loading and caching

### Token Refresh Path

1. 401 response triggers interceptor
2. Request queuing mechanism
3. Refresh token validation
4. New token generation
5. Token storage update
6. Queued request retry
7. Failure handling and logout

## Security Patterns

### Defense in Depth

- **Input Validation**: Zod schemas at API boundaries
- **Authentication**: JWT with secure signing
- **Authorization**: Permission-based access control
- **Rate Limiting**: Redis-based request throttling
- **Audit Logging**: All sensitive operations tracked
- **Token Security**: Rotation, expiry, blacklisting

### Error Handling

- **Consistent API responses**: Standard error format
- **Security considerations**: No information leakage
- **User experience**: Friendly error messages
- **Logging**: Detailed errors for debugging

### Data Protection

- **Encryption at rest**: Sensitive database fields
- **Secure transmission**: HTTPS enforced
- **Token storage**: Secure client-side storage
- **Session management**: Redis-based with expiry

## Development Patterns

### Docker Development

- **Multi-stage builds**: Development and production targets
- **Service orchestration**: Docker Compose for local development
- **Volume mounting**: Live code reloading
- **Environment consistency**: Same stack across developers

### Testing Strategy

- **Unit tests**: Component and function testing
- **Integration tests**: API endpoint testing
- **E2E tests**: Critical user journey testing
- **Security tests**: Authentication and authorization testing

### Code Quality

- **TypeScript strict**: Full type safety
- **ESLint configuration**: Consistent code style
- **Prettier formatting**: Automated code formatting
- **Conventional commits**: Clear change history
