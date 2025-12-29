# Scripts utilitaires

Ce dossier contient des scripts utilitaires pour la gestion de la base de données.

## Débloquer tous les utilisateurs

Si des employés (massothérapeutes, esthéticiennes, etc.) ont été bloqués et ne peuvent plus se connecter, utilisez ce script pour les débloquer.

### En local

```bash
npm run unblock-users
```

### Sur le VPS

1. **Connectez-vous au VPS via SSH:**
   ```bash
   ssh user@votre-vps-ip
   ```

2. **Allez dans le dossier du projet:**
   ```bash
   cd /chemin/vers/spa-backend
   ```

3. **Exécutez le script:**
   ```bash
   npm run unblock-users
   ```

### Ce que fait le script

- 🔍 Recherche tous les utilisateurs avec `isActive = false`
- 📋 Affiche la liste des utilisateurs bloqués
- 🔓 Met à jour tous les utilisateurs bloqués pour `isActive = true`
- ✅ Affiche le statut final de tous les utilisateurs

### Exemple de sortie

```
🔍 Recherche des utilisateurs bloqués...

⚠️  2 utilisateur(s) bloqué(s) trouvé(s):

   1. Lotfi Carrier (masso1@spa.com) - MASSOTHERAPEUTE
   2. Tanya Roy (masso2@spa.com) - MASSOTHERAPEUTE

🔓 Déblocage en cours...

✅ 2 utilisateur(s) débloqué(s) avec succès!

=== 📋 Statut final de tous les utilisateurs ===

   1. Lotfi Carrier (MASSOTHERAPEUTE) - ✅ ACTIF
   2. Tanya Roy (MASSOTHERAPEUTE) - ✅ ACTIF
   3. Martin Carrier (ADMIN) - ✅ ACTIF
```

## Notes importantes

- ⚠️ Ce script débloque **TOUS** les utilisateurs bloqués
- ✅ Il est sécuritaire de l'exécuter plusieurs fois
- 💾 Les modifications sont permanentes dans la base de données
- 🔐 Assurez-vous que votre fichier `.env` contient la bonne `DATABASE_URL`
