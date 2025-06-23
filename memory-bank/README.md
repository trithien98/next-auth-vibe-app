# Cline Memory Bank

This directory contains the **complete project documentation** using the Cline Memory Bank methodology. This replaces traditional documentation folders and provides a comprehensive system for maintaining persistent project context across development sessions.

## 📁 Memory Bank Structure

### Core Context Files

- **`projectbrief.md`** - Project overview, requirements, and success criteria
- **`productContext.md`** - Business context, user stories, and feature specifications
- **`activeContext.md`** - Current development state, recent changes, and immediate next steps
- **`systemPatterns.md`** - High-level architecture patterns and design principles

### Development Support Files

- **`progress.md`** - Implementation roadmap, sprint tracking, and completion status
- **`decisions.md`** - Architecture Decision Records (ADRs) documenting key technical choices
- **`codePatterns.md`** - Code standards, naming conventions, and implementation templates
- **`integrations.md`** - External dependencies, API integrations, and service connections
- **`testing.md`** - Testing strategy, patterns, and framework decisions

## 🎯 How to Use the Memory Bank

### For AI Assistants (Cline)

1. **Start each session** by reading `activeContext.md` to understand current state
2. **Reference relevant files** based on the task:
   - Planning work? Check `progress.md`
   - Making architecture decisions? Review `decisions.md`
   - Writing code? Follow patterns in `codePatterns.md`
   - Testing features? Consult `testing.md`
3. **Update context** after significant changes:
   - Update `activeContext.md` with recent changes and next steps
   - Add new decisions to `decisions.md`
   - Mark progress in `progress.md`

### For Developers

1. **Onboarding**: Read files in order: `projectbrief.md` → `productContext.md` → `activeContext.md`
2. **Daily work**: Check `activeContext.md` and `progress.md` for current priorities
3. **Code reviews**: Reference `codePatterns.md` for standards compliance
4. **Architecture changes**: Document decisions in `decisions.md`

### For Project Handoffs

1. **Receiving project**: All context is preserved in the Memory Bank
2. **Transferring project**: Ensure all files are current and comprehensive
3. **Team collaboration**: Memory Bank serves as single source of truth

## 🔄 Maintenance Guidelines

### Update Frequency

- **`activeContext.md`**: After every significant development session
- **`progress.md`**: When completing tasks or changing priorities
- **`decisions.md`**: When making architecture or technology decisions
- **Other files**: As needed when patterns or context change

### Content Guidelines

- **Be specific**: Include exact file paths, command examples, and concrete next steps
- **Stay current**: Remove outdated information promptly
- **Cross-reference**: Link related concepts between files
- **Version awareness**: Update when technology versions change

## 🧠 Memory Bank Philosophy

### Persistent Context

The Memory Bank ensures that project knowledge persists beyond individual development sessions, enabling:

- **Seamless handoffs** between team members
- **Consistent AI assistance** across different sessions
- **Historical decision tracking** for future reference
- **Onboarding acceleration** for new team members

### Living Documentation

Unlike static documentation, the Memory Bank evolves with the project:

- **Real-time updates** reflect current development state
- **Decision evolution** is tracked over time
- **Pattern refinement** improves as the project grows
- **Context preservation** maintains institutional knowledge

## 🚀 Getting Started

### Initial Setup

1. Review all Memory Bank files to understand current project state
2. Verify all decisions and patterns align with your development approach
3. Update `activeContext.md` with your current session goals
4. Begin development following the established patterns

### During Development

1. Follow code patterns from `codePatterns.md`
2. Reference integration points in `integrations.md`
3. Update progress in `progress.md` as you complete tasks
4. Document new decisions in `decisions.md`

### Session End

1. Update `activeContext.md` with what was accomplished
2. Note any blockers or changes needed for next session
3. Ensure progress tracking is current in `progress.md`

## 📋 Quick Reference

### Current Project State

- **Phase**: Environment Setup and Core Implementation
- **Technology Stack**: Next.js 14, Bun, LocalForage, Docker Compose
- **Next Priority**: Initialize Next.js project structure
- **Recent Focus**: Complete Memory Bank implementation

### Key Decisions

- Package Manager: Bun (for performance)
- Client Storage: LocalForage (for security)
- Development Environment: Docker Compose (for consistency)
- Database: MongoDB + Redis (for flexibility + performance)

### Important Files to Reference

- Start here: `activeContext.md`
- For planning: `progress.md`
- For coding: `codePatterns.md`
- For architecture: `systemPatterns.md` and `decisions.md`

---

**Note**: This Memory Bank follows the Cline AI methodology for maintaining persistent project context. Keep it updated and comprehensive for maximum effectiveness.
