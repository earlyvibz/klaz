# 📋 **Rapport complet : Pipeline de déploiement Klaz**

## 🏗️ **1. Architecture du projet**

### **Structure monorepo PNPM**
```
klaz/
├── apps/
│   ├── backend/     # AdonisJS API
│   └── front/       # React (Vite)
├── packages/
│   └── shared/      # Code partagé
└── .github/
    └── workflows/   # CI/CD
```

**Pourquoi cette structure ?**
- **Code partagé** : Types, utilitaires communs
- **Développement simplifié** : `pnpm dev` lance tout
- **Gestion des dépendances** : PNPM workspaces pour éviter la duplication

---

## 🔗 **2. Problématique : Type Safety avec Tuyau**

### **Le défi**
```typescript
// Frontend veut utiliser :
import { api } from '@klaz/backend/api'

// Mais en déploiement séparé, pas d'accès au backend !
```

**Tuyau** génère automatiquement des types TypeScript depuis ton backend AdonisJS :
- **Où** : `apps/backend/.adonisjs/`
- **Quoi** : Types des routes, validations, réponses
- **Comment** : `node ace tuyau:generate`

### **Problème initial**
Chaque app a son propre Dockerfile → le frontend ne voit pas les types du backend.

---

## 📦 **3. Solution : pnpm deploy**

### **Concept**
```bash
pnpm --filter @klaz/backend deploy .deploy/backend --legacy
```

**Ce que ça fait :**
1. **Copie** le code de l'app + dépendances
2. **Résout** les workspace dependencies
3. **Crée** un package standalone dans `.deploy/`

### **Avantages**
- ✅ **Portable** : Fonctionne sans le monorepo
- ✅ **Optimisé** : Seulement ce qui est nécessaire
- ✅ **Types inclus** : `.adonisjs/` copié automatiquement

### **Notre workflow pnpm deploy**
```bash
# 1. Clean previous builds
pnpm deploy:clean

# 2. Build backend + génère types Tuyau
pnpm deploy:build

# 3. Deploy apps vers .deploy/
pnpm deploy:backend   # → .deploy/backend/
pnpm deploy:frontend  # → .deploy/frontend/

# 4. Build frontend (avec types backend disponibles)
pnpm deploy:frontend:build

# 5. Génère les Dockerfiles optimisés
pnpm deploy:dockerfiles
```

---

## 🐳 **4. Dockerfiles : Stratégie simplifiée**

### **Avant pnpm deploy (complexe)**
```dockerfile
# Multi-stage, gestion workspace, problèmes de types...
FROM node:20-alpine AS builder
COPY package.json pnpm-*.yaml ./
COPY apps/backend apps/backend
COPY apps/frontend apps/frontend  # 😱 Pourquoi le front dans le back ?
RUN pnpm install
RUN pnpm --filter @klaz/backend build
# ... 50 lignes de complexité
```

### **Après pnpm deploy (simple)**
```dockerfile
# Backend - ultra simple !
FROM node:20-slim
WORKDIR /app
COPY . .                           # Tout est déjà buildé
CMD ["node", "build/bin/server.js"]

# Frontend - juste du nginx
FROM nginx:alpine
COPY dist /usr/share/nginx/html
```

### **Pourquoi c'est mieux ?**
- ✅ **Simplicité** : Pas de build dans Docker
- ✅ **Rapidité** : Images plus petites, build plus rapide
- ✅ **Fiabilité** : Moins de points de failure
- ✅ **Debugging** : Plus facile à comprendre

---

## 🗄️ **5. GitHub Container Registry (GHCR)**

### **Qu'est-ce que c'est ?**
Le **Docker Hub de GitHub** - stockage d'images Docker intégré.

### **Pourquoi GHCR vs Docker Hub ?**
| Critère | GHCR | Docker Hub |
|---------|------|------------|
| **Intégration GitHub** | ✅ Native | ❌ Config manuelle |
| **Privé gratuit** | ✅ Illimité | ❌ 1 repo seulement |
| **Permissions** | ✅ Via GitHub | ❌ Séparé |
| **CI/CD** | ✅ `GITHUB_TOKEN` | ❌ Credentials |

### **Notre naming convention**
```
ghcr.io/TON_USERNAME/klaz/backend:dev      # Env dev
ghcr.io/TON_USERNAME/klaz/backend:staging  # Env staging
ghcr.io/TON_USERNAME/klaz/backend:latest   # Env prod

ghcr.io/TON_USERNAME/klaz/frontend:dev
ghcr.io/TON_USERNAME/klaz/frontend:staging
ghcr.io/TON_USERNAME/klaz/frontend:latest
```

---

## ⚙️ **6. GitHub Actions : Le chef d'orchestre**

### **Déclencheurs**
```yaml
on:
  push:
    branches: [dev, staging, main]
```

**Stratégie par branche :**
- `dev` → `:dev` tags
- `staging` → `:staging` tags
- `main` → `:latest` tags (prod)

### **Étapes du workflow**

#### **1. Setup environnement**
```yaml
- uses: pnpm/action-setup@v2
- uses: actions/setup-node@v4
- run: pnpm install --no-frozen-lockfile
```

#### **2. Résolution du problème Tuyau en CI**
```yaml
# Problème : tuyau:generate a besoin d'env vars
# Solution : .env temporaire depuis .env.example
- run: cp .env.example .env
- run: pnpm deploy:all  # Inclut tuyau:generate
- run: rm -f .env       # Cleanup sécurisé
```

#### **3. Build & Push Docker**
```yaml
# Build avec architecture forcée (Mac ARM → Linux x86)
- uses: docker/build-push-action@v5
  with:
    platforms: linux/amd64  # 🔑 Crucial pour VPS !
    push: true
    tags: ghcr.io/.../backend:dev
```

#### **4. Déploiement Coolify**
```yaml
# Webhook déclenche redéploiement automatique
- run: |
    curl --request GET "${{ secrets.COOLIFY_WEBHOOK_BACKEND_DEV }}" \
      --header "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}"
```

---

## 🚀 **7. Coolify : Plateforme de déploiement**

### **Qu'est-ce que Coolify ?**
**Alternative open-source à Vercel/Railway** qui tourne sur ton VPS.

### **Avantages**
- ✅ **Contrôle total** : Ton infrastructure
- ✅ **Coût** : Juste le VPS
- ✅ **Flexibilité** : Docker, webhooks, monitoring
- ✅ **Multi-env** : dev/staging/prod sur le même serveur

### **Configuration par service**

#### **Backend**
```
Source: ghcr.io/TON_USERNAME/klaz/backend:dev
Port: 3333
Environment:
  NODE_ENV=development  # Important pour pino-pretty
  HOST=0.0.0.0         # Écoute externe
  PORT=3333
  DB_HOST=...
```

#### **Frontend**
```
Source: ghcr.io/TON_USERNAME/klaz/frontend:dev
Port: 80 (Nginx)
Domaine: dev.tondomaine.com
```

---

## 🔄 **8. Workflow complet**

### **Développement local**
```bash
git checkout dev
# ... develop ...
git commit -m "feat: nouvelle feature"
git push origin dev
```

### **CI/CD automatique**
```
1. 🔍 GitHub détecte push sur dev
2. 🏗️  GitHub Actions démarre
3. 📦 pnpm deploy:all (build + types)
4. 🐳 Docker build (linux/amd64)
5. 📤 Push vers GHCR
6. 🔔 Webhook → Coolify
7. 🚀 Coolify pull + restart
8. ✅ Service live sur dev.tondomaine.com
```

### **Multi-environnements**
```bash
# Dev
git push origin dev → :dev tags → dev.domain.com

# Staging
git push origin staging → :staging tags → staging.domain.com

# Production
git push origin main → :latest tags → domain.com
```

---

## 🔧 **9. Points techniques cruciaux**

### **Architecture CPU**
```yaml
# Problème : Mac ARM64 → VPS x86_64
platforms: linux/amd64  # Force x86 build
```

### **Variables d'environnement en CI**
```yaml
# Sécurisé : pas d'env vars hardcodées
- run: cp .env.example .env    # Temp file
- run: pnpm deploy:all         # Build avec env
- run: rm -f .env              # Cleanup
```

### **Optimisation pnpm deploy**
```json
// apps/backend/package.json
"files": [
  "build/",        // Code compilé
  ".adonisjs/",    // Types Tuyau
  "adonisrc.minimal.ts"  // Config simplifiée
]
```

---

## 📊 **10. Avantages de cette architecture**

### **Développement**
- ✅ **Type safety** complète (frontend ↔ backend)
- ✅ **Hot reload** en local
- ✅ **Monorepo** simplifié

### **Déploiement**
- ✅ **Zero-downtime** : Pull nouvelle image
- ✅ **Rollback** facile : Tag précédent
- ✅ **Multi-env** : Branches → Environnements

### **Maintenance**
- ✅ **Images légères** : Build externe
- ✅ **Debugging** : Logs Coolify + GitHub Actions
- ✅ **Sécurité** : Registry privé, env vars sécurisées

---

## 🎯 **11. Récap : Pourquoi chaque élément ?**

| Composant | Problème résolu | Alternative rejetée |
|-----------|----------------|-------------------|
| **pnpm deploy** | Types Tuyau cross-apps | Docker multi-stage complexe |
| **GHCR** | Registry privé intégré | Docker Hub limité |
| **GitHub Actions** | CI/CD automatisé | Déploiement manuel |
| **Dockerfiles simples** | Build rapide/fiable | Build dans Docker |
| **linux/amd64** | Compatibilité VPS | Erreurs exec format |
| **Coolify webhooks** | Déploiement instantané | Pull manuel |

---

## 🚀 **12. Next steps**

1. **Monitoring** : Logs, métriques, alertes
2. **Tests** : E2E dans la CI
3. **Sécurité** : Scan vulnérabilités images
4. **Performance** : Cache Docker layers
5. **Backup** : Base de données, images

---

## 🔧 **13. Configuration files principales**

### **package.json (root)**
```json
{
  "scripts": {
    "deploy:clean": "rm -rf .deploy",
    "tuyau:generate": "pnpm --filter @klaz/backend exec node ace tuyau:generate",
    "deploy:build": "pnpm --filter @klaz/backend build && pnpm --filter @klaz/backend exec node ace tuyau:generate",
    "deploy:backend": "pnpm --filter @klaz/backend --prod deploy .deploy/backend --legacy",
    "deploy:frontend": "pnpm --filter front deploy .deploy/frontend --legacy",
    "deploy:frontend:build": "cd .deploy/frontend && pnpm build",
    "deploy:dockerfiles": "bash scripts/create-dockerfiles.sh",
    "deploy:all": "pnpm deploy:clean && pnpm deploy:build && pnpm deploy:backend && pnpm deploy:frontend && pnpm deploy:frontend:build && pnpm deploy:dockerfiles",
    "deploy:dev": "pnpm deploy:all && pnpm docker:build && pnpm deploy:tag:dev && pnpm deploy:push:dev"
  }
}
```

### **GitHub Actions workflow**
```yaml
name: Deploy
on:
  push:
    branches: [dev, staging, main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Setup environment for Tuyau generation
        working-directory: ./apps/backend
        run: cp .env.example .env

      - name: Build project
        run: pnpm deploy:all

      - name: Cleanup temporary .env
        working-directory: ./apps/backend
        run: rm -f .env
```

### **Backend Dockerfile (généré)**
```dockerfile
FROM node:20-slim
WORKDIR /app
COPY . .
EXPOSE 3333
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333
CMD ["node", "build/bin/server.js"]
```

### **Frontend Dockerfile (généré)**
```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
RUN echo 'server {
  listen 80;
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

**Cette pipeline est maintenant robuste, automatisée et type-safe ! 🎉**

*Généré le : $(date)*
