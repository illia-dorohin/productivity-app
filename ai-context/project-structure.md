# Project Structure

## Monorepo Layout

```
productivity-app/
├── ai-context/                # Documentation for AI agents (NOT deployed)
│   ├── app-concept.md         # Product concept, features, hierarchy
│   ├── project-structure.md   # This file — folder structure
│   ├── tech-stack.md          # Stack decisions, libraries, versions
│   ├── data-model.md          # MongoDB schemas, relationships
│   └── api-design.md          # REST API endpoints, contracts
│
├── frontend/                  # Angular 21 SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/          # Singleton services, guards, interceptors
│   │   │   │   ├── auth/      # Google auth service, guard
│   │   │   │   ├── api/       # HTTP services for backend communication
│   │   │   │   └── models/    # TypeScript interfaces / types
│   │   │   ├── features/      # Feature modules (lazy-loaded)
│   │   │   │   ├── daily-rating/
│   │   │   │   ├── reports/
│   │   │   │   ├── tasks/
│   │   │   │   ├── notes/
│   │   │   │   └── settings/
│   │   │   ├── shared/        # Reusable components, pipes, directives
│   │   │   └── app.routes.ts
│   │   ├── environments/
│   │   └── styles/            # Global styles, variables, mixins
│   ├── Dockerfile
│   └── package.json
│
├── backend/                   # NestJS API
│   ├── src/
│   │   ├── auth/              # Google OAuth, JWT, guards
│   │   ├── metrics/           # Rating categories, hierarchy, weights
│   │   ├── ratings/           # Daily ratings CRUD, aggregation
│   │   ├── reports/           # Weekly/monthly report generation
│   │   ├── tasks/             # Tasks CRUD
│   │   ├── notes/             # Notes CRUD
│   │   ├── common/            # Shared DTOs, decorators, filters, pipes
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml         # Local development (frontend + backend + mongo)
├── docker-compose.prod.yml    # Production build
└── .cursor/rules/             # Cursor AI rules
```

## Key Conventions

- **Feature-based structure** on both frontend and backend
- **Lazy loading** for all Angular feature modules
- **Each backend module** is self-contained: controller, service, schema, DTOs
- `ai-context/` is never deployed — it's documentation for AI agents only
