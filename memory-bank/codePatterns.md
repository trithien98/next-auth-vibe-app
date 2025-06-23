# Code Patterns and Standards

## File Organization Patterns

### Next.js 14 App Router Structure

```
src/
├── app/                     # App Router pages
│   ├── (auth)/             # Route groups for auth pages
│   ├── (dashboard)/        # Protected dashboard routes
│   ├── api/                # API routes
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # Reusable components
│   ├── ui/                 # shadcn/ui components
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard components
│   └── common/             # Shared components
├── lib/                    # Utility libraries
│   ├── auth/               # Authentication utilities
│   ├── db/                 # Database utilities
│   ├── storage/            # LocalForage utilities
│   └── utils.ts            # General utilities
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand stores
├── types/                  # TypeScript type definitions
└── middleware.ts           # Next.js middleware
```

## Naming Conventions

### Files and Directories

- **Components**: PascalCase (`UserProfile.tsx`)
- **Pages**: lowercase with hyphens (`user-settings/page.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types**: PascalCase with `.types.ts` suffix (`User.types.ts`)
- **Hooks**: camelCase starting with `use` (`useAuth.ts`)

### Code Patterns

#### Component Structure

```typescript
// Component template
interface ComponentNameProps {
  // Props interface
}

export default function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // Component logic
  return (
    // JSX
  );
}
```

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
```

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
