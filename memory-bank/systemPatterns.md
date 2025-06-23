# System Patterns: Architecture & Design Decisions

## Overall Architecture

### High-Level System Design

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Data Layer    │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (MongoDB)     │
│                 │    │                 │    │   (Redis)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LocalForage   │    │   JWT + Auth    │    │   Audit Logs    │
│   (Tokens)      │    │   Middleware    │    │   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Container Architecture

- **Application Container**: Next.js app with Bun runtime
- **Database Container**: MongoDB 6.0 with initialization scripts
- **Cache Container**: Redis 7.0 for sessions and token blacklisting
- **Email Container**: MailDev for development email testing

## Key Technical Decisions

### Authentication Strategy

**Decision**: JWT with refresh token rotation
**Rationale**:

- Stateless authentication scales well
- Short-lived access tokens limit exposure
- Refresh rotation prevents token theft abuse
- Redis blacklist enables immediate revocation

**Implementation Pattern**:

```typescript
// Access Token: 1 day expiry, stored in LocalForage
// Refresh Token: 7 days expiry, HttpOnly cookie
// Automatic refresh on 401 with request queuing
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
