# Système Multi-Tenant

Le système multi-tenant permet à chaque école d'avoir son propre sous-domaine avec des données isolées.

## Architecture

- **Backend**: Middleware tenant qui résout l'école via le subdomain
- **Frontend**: Détection automatique du tenant et configuration API
- **Database**: Shared database avec `schoolId` pour isoler les données

## Configuration DNS

Pour le développement local, ajouter à `/etc/hosts`:
```
127.0.0.1 voltaire.localhost
127.0.0.1 jean-moulin.localhost
127.0.0.1 marie-curie.localhost
```

## Utilisation Backend

### Contrôleurs
```typescript
// Automatiquement scopé au tenant
const students = await User.forCurrentTenant()
  .where("role", "STUDENT")
  .get();

// Créer un utilisateur pour le tenant actuel
const user = await User.createForCurrentTenant({
  email: "test@example.com",
  role: "STUDENT"
});

// Obtenir les infos du tenant actuel
const tenant = TenantController.requireTenant();
```

### Routes
```typescript
// Routes avec middleware tenant
router
  .group(() => {
    router.get("/students", [StudentsController, "index"]);
    router.get("/tenant/current", [TenantController, "current"]);
  })
  .use(middleware.tenant());
```

### API Endpoints Tenant
- `GET /tenant/current` - Infos du tenant actuel (require tenant)
- `GET /tenant/info` - Info générale (tenant ou mode global)

## Utilisation Frontend

### Hook tenant
```typescript
import { useTenant } from '@/hooks/tenant/useTenant';

function MyComponent() {
  const { slug, isTenantMode, isLoading } = useTenant();

  if (isLoading) return <div>Loading...</div>;

  if (isTenantMode) {
    return <div>École: {slug}</div>;
  }

  return <div>Mode global</div>;
}
```

### API Client
```typescript
import { apiClient } from '@/lib/api';

// Appel API automatiquement configuré pour le tenant
const students = await apiClient.get('/students');

// Obtenir les infos du tenant actuel
const tenantInfo = await apiClient.get('/tenant/current');
```

## URLs d'exemple

- `http://localhost:3000` - Mode global (super admin)
- `http://voltaire.localhost:3000` - École Voltaire
- `http://jean-moulin.localhost:3000` - Collège Jean Moulin
- `http://marie-curie.localhost:3000` - Lycée Marie Curie

## Base de données

Exécuter le seeder pour créer les écoles de test:
```bash
cd apps/backend
node ace db:seed --files=tenant_schools_seeder.ts
```
