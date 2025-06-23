# Next.js Authentication & RBAC Boilerplate

A production-ready fullstack authentication and role-based access control (RBAC) boilerplate using Next.js 14, featuring secure token management, comprehensive permissions system, and modern development tooling.

## 🚀 Quick Start

```bash
# Install dependencies with Bun (recommended)
bun install

# Start development environment with Docker Compose
docker-compose up

# Or start locally (requires MongoDB and Redis)
bun dev
```

## 📖 Documentation

All project documentation is maintained in the **Memory Bank** located in `/memory-bank/`. Start with:

- **[Memory Bank README](./memory-bank/README.md)** - How to use the documentation system
- **[Active Context](./memory-bank/activeContext.md)** - Current development state and next steps
- **[Project Brief](./memory-bank/projectbrief.md)** - Project overview and requirements
- **[Setup Guide](./memory-bank/integrations.md)** - Environment setup and dependencies

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, MongoDB, Redis
- **Auth**: JWT with refresh tokens, LocalForage storage
- **Development**: Bun, Docker Compose, ESLint, Prettier
- **Security**: 2FA, RBAC, rate limiting, CSRF protection

## 📁 Memory Bank Structure

This project uses the **Cline Memory Bank methodology** for documentation:

```
memory-bank/
├── README.md           # Documentation system guide
├── activeContext.md    # Current development state
├── projectbrief.md     # Project overview
├── progress.md         # Implementation roadmap
├── systemPatterns.md   # Architecture patterns
├── codePatterns.md     # Code standards
├── decisions.md        # Architecture decisions
├── integrations.md     # Dependencies & setup
└── testing.md          # Testing strategy
```

## 🛠️ Development

The Memory Bank contains comprehensive guides for:

- Environment setup with Docker Compose
- Database configuration (MongoDB + Redis)
- Authentication implementation patterns
- Security best practices
- Testing strategies

Refer to `/memory-bank/activeContext.md` for current development priorities and next steps.

---

**Note**: This project follows the Cline Memory Bank methodology for maintaining persistent development context.
