Welcome to Klaz frontend!

This is a React-based frontend application built with modern web technologies.

## Getting Started

To get started with this project, you'll need to have Node.js and pnpm installed on your machine.

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Start the development server:

```bash
pnpm run dev
```

The application will be available at `http://localhost:3000`.

### Build

To build the application for production:

```bash
pnpm run build
```

## Tech Stack

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Router** - File-based routing
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components

## Project Structure

```
src/
├── components/     # Reusable UI components
├── routes/         # File-based routing
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
└── styles.css      # Global styles
```

## Routing

This project uses [TanStack Router](https://tanstack.com/router). The initial setup is a file based router. Which means that the routes are managed as files in `src/routes`.

### Creating a new route

To create a new route, create a new file in the `src/routes` directory. For example, to create a route for `/about`, create a file called `about.tsx` in the `src/routes` directory.

TanStack will automatically generate the content of the route file for you.

### Navigation

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";

function MyComponent() {
  return <Link to="/about">About</Link>;
}
```

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Layouts

You can create layouts by creating a route file that renders an `<Outlet />` component. This will render the child routes inside the layout.

```tsx
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
```

The `<TanStackRouterDevtools />` component is not required so you can remove it if you don't want it in your layout.

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Development

### Linting and Formatting

This project uses Biome for linting and formatting:

```bash
# Check for issues
pnpm run check

# Format code
pnpm run format

# Lint code
pnpm run lint
```

### Testing

```bash
pnpm run test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 🏢 Développement Multi-Tenant

Ce projet supporte le multi-tenant par subdomain uniquement (ex: `hec.klaz.com`).

### Configuration initiale

1. **Configurer les subdomains locaux** (une seule fois) :
```bash
./scripts/setup-hosts.sh
```

### Développement

```bash
npm run dev  # Lance avec --host pour accepter tous les subdomains
```

### Accès aux différents modes

- **http://localhost:5173** → Mode global (super-admin)
- **http://hec.localhost:5173** → Tenant "hec"
- **http://essec.localhost:5173** → Tenant "essec"
- **http://insead.localhost:5173** → Tenant "insead"

### Fonctionnement

Le système détecte automatiquement le subdomain et :
1. **Frontend** : Configure le contexte tenant via `useTenant()`
2. **API calls** : Ajoute automatiquement le header `X-Tenant-Slug`
3. **Backend** : Reçoit le tenant context via le middleware

### Utilisation dans le code

```tsx
import { useTenant, TenantGuard } from '@/hooks/tenant';

function MyComponent() {
  const { isTenantMode, school, slug } = useTenant();

  if (isTenantMode) {
    return <p>École: {school?.name} (slug: {slug})</p>;
  }

  return <p>Mode global (super-admin)</p>;
}

// Avec guard
<TenantGuard requireTenant>
  <SchoolSpecificContent />
</TenantGuard>
```

### Dev Tools

En développement, un bouton "🏢 Tenant Info" apparaît en bas à droite pour voir :
- Le hostname actuel
- Le subdomain détecté
- Le mode (tenant vs global)
