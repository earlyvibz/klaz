# Tests Frontend

## Structure

```
tests/
├── units/          # Tests unitaires (Vitest + JSDOM)
│   ├── auth-hooks.test.tsx
│   ├── auth-provider.test.tsx
│   └── ...
├── e2e/            # Tests E2E (Playwright)
│   ├── auth.spec.ts
│   └── ...
├── setup.ts        # Configuration Vitest
└── README.md
```

## Technologies

- **Vitest + JSDOM** : Tests unitaires rapides
- **Playwright** : Tests E2E fiables avec vrais navigateurs

## Scripts disponibles

### Tests unitaires
```bash
npm run test:unit          # Tests unitaires en mode watch
npm run test:unit:ui       # Interface UI pour les tests unitaires
```

### Tests E2E
```bash
npm run test:e2e           # Tests E2E (headless)
npm run test:e2e:ui        # Interface UI Playwright
npm run test:e2e:headed    # Tests E2E avec navigateur visible
```

### Tous les tests
```bash
npm run test:all           # Tests unitaires + E2E
```

## Pourquoi cette approche ?

| Test Type | Technologie | Avantages |
|-----------|-------------|-----------|
| **Unitaires** | Vitest + JSDOM | Très rapides, retry-ability, hot reload |
| **E2E** | Playwright | Navigateurs réels, API complète, debugging excellent |

## Tests actuels

### Unitaires (57 tests ✅)
- Tests des hooks d'authentification
- Tests du provider d'auth
- Tests de logique métier
- Tests de composants isolés

### E2E
- Tests du flow de connexion
- Tests du flow d'inscription
- Tests des routes protégées
- Tests de navigation

## Usage

1. **Développement** : `npm run test:unit` (rapide, feedback immédiat)
2. **CI/CD** : `npm run test:all` (couverture complète)
3. **Debugging E2E** : `npm run test:e2e:ui` (interface visuelle)

## Navigation dans Playwright

```typescript
// ✅ API Playwright complète
await page.goto('/auth/login')
await page.waitForURL('**/home')
await page.getByLabel('Email :').fill('test@test.com')
await expect(page.getByText('Connexion')).toBeVisible()
```

## Migration depuis Vitest Browser Mode

Vitest Browser Mode était expérimental et buggy. Playwright offre :
- API stable et complète
- Debugging avancé (traces, screenshots, vidéos)
- Documentation excellente
- Outils de développement intégrés
