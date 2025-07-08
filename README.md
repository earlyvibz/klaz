# Schooling Monorepo

pnpm workspace monorepo setup.

## Structure

```
├── packages/          # Shared packages
│   └── shared/        # Example shared utilities
├── apps/              # Applications
│   └── front/         # Frontend
    └── backend/       # Backend
├── package.json       # Root config
└── pnpm-workspace.yaml # Workspace config
```

## Setup

```bash
pnpm install
```

## Scripts

```bash
pnpm dev      # Run all packages in dev mode
pnpm build    # Build all packages
pnpm test     # Test all packages
pnpm lint     # Lint all packages
```

## Adding packages

Create new packages in `packages/` or `apps/` directories. They'll be automatically discovered by the workspace.
