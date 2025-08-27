#!/bin/bash

# Script pour configurer les subdomains locaux pour le développement multi-tenant
# Usage: ./scripts/setup-hosts.sh

echo "🔧 Configuration des subdomains locaux pour Klaz..."

# Vérifier si l'utilisateur est admin/sudo
if [[ $EUID -eq 0 ]]; then
   echo "⚠️  Ne pas exécuter ce script en tant que root/sudo"
   exit 1
fi

# Backup du fichier hosts existant
echo "📋 Sauvegarde du fichier /etc/hosts..."
sudo cp /etc/hosts /etc/hosts.backup.$(date +%Y%m%d_%H%M%S)

# Ajouter les entrées pour les subdomains de test
echo "➕ Ajout des subdomains de test..."

SUBDOMAINS=("admin" "auth" "hec" "essec" "insead" "polytechnique" "centrale")

for subdomain in "${SUBDOMAINS[@]}"; do
    if ! grep -q "$subdomain.klaz-local.fr" /etc/hosts; then
        echo "0.0.0.0    $subdomain.klaz-local.fr" | sudo tee -a /etc/hosts > /dev/null
        echo "✅ Ajouté: $subdomain.klaz-local.fr"
    else
        echo "ℹ️  Déjà présent: $subdomain.klaz-local.fr"
    fi
done

echo ""
echo "🎉 Configuration terminée !"
echo ""
echo "📋 Vous pouvez maintenant utiliser :"
echo "   • http://klaz-local.fr:80 (landing page)"
echo "   • http://admin.klaz-local.fr:80 (interface admin - SUPERADMIN)"
echo "   • http://hec.klaz-local.fr:80 (école HEC)"
echo "   • http://essec.klaz-local.fr:80 (école ESSEC)"
echo ""
echo "🚀 Lancez votre app avec: npm run dev"
echo ""
echo "💡 Le subdomain sera automatiquement détecté et envoyé"
echo "   au backend via le header X-Tenant-Slug"
