# Development Guide

## Project Structure

```
src/
├── app/                  # Next.js App Router (Pages & API)
│   ├── api/              # API Route Handlers
│   ├── channels/         # Channels Page
│   └── page.tsx          # Home Page
├── components/           # React Components
│   ├── features/         # Feature-specific components (VideoList, etc.)
│   ├── layout/           # Layout components (Navbar, Layout)
│   └── ui/               # Reusable UI components (shadcn/ui)
├── lib/                  # Core Application Logic
│   ├── db/               # Database config & migrations
│   ├── domain/           # Types & Interfaces
│   ├── repositories/     # Data Access Layer
│   └── services/         # Business Logic Layer
```

## Adding New Features

Follow this workflow to add features (e.g., "Add Notes to Videos"):

1. **Domain**: Update `Video` interface in `src/lib/domain/models.ts`.
2. **Database**:
   - Create a new migration by adding a SQL file or updating schema (for PoC).
   - Update `schema.sql` (since we use it on init).
3. **Repository**: Update `VideoRepository` methods to handle the new field.
4. **Service**: Update `VideoService` if logic is needed.
5. **API**: Update `route.ts` handlers and Zod validation schemas.
6. **UI**: Update `VideoCard` or other components to display the new feature.

## Testing

- **Unit Tests**: Place alongside source files or in `__tests__`.
- **Integration Tests**: Test API endpoints using Supertest or Next.js testing utils.

## Code Style

- Use **TypeScript** for type safety.
- Use **Prettier** for formatting.
- Use **ESLint** for linting.
- Follow **Clean Architecture** boundaries (e.g., UI shouldn't call DB directly).
