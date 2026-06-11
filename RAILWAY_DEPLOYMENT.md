# Configuration Railway pour Triomphe

## Variables d'environnement requises

### Base de données
```
DATABASE_URL=postgresql://user:password@host:port/triomphe
```

### JWT
```
JWT_SECRET=your_super_secret_key_here_change_this
JWT_EXPIRE=7d
```

### API
```
NODE_ENV=production
PORT=8000
API_URL=https://your-railway-domain.com/api
```

### Frontend
```
VITE_API_URL=/api
```

## Déploiement sur Railway

1. **Connexion à Railway**
   ```bash
   railway login
   ```

2. **Créer un nouveau projet**
   ```bash
   railway init
   ```

3. **Ajouter PostgreSQL**
   - Sur le dashboard Railway
   - Ajouter un plugin PostgreSQL
   - Les variables d'environnement seront automatiquement ajoutées

4. **Configurer les variables d'environnement**
   - Allez à Settings > Variables
   - Ajoutez JWT_SECRET, API_URL, etc.

5. **Déployer**
   ```bash
   railway up
   ```

6. **Obtenir l'URL publique**
   ```bash
   railway status
   ```

## Structure du projet sur Railway

```
Triomphe/
├── server/          # API Node.js/Express
│   ├── src/
│   ├── package.json
│   └── Procfile
├── client/          # Frontend React
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── railway.toml     # Configuration Railway
```

## Fonctionnalités activées

✅ **Offline-first** - Fonctionne hors réseau
✅ **Progressive Web App** - Installable comme app native
✅ **Synchronisation automatique** - Auto-sync au reconnexion
✅ **Base de données PostgreSQL** - Persistent et sécurisée
✅ **HTTPS automatique** - Certificats SSL gratuits
✅ **Scalabilité** - Auto-scaling selon la charge

## Commandes utiles

```bash
# Logs en temps réel
railway logs

# Vérifier le statut
railway status

# Variables d'environnement
railway variables

# Redéployer
railway up --force
```

## Vérification après déploiement

1. Vérifiez que l'API répond: `https://your-domain.com/api/health`
2. Vérifiez que le frontend charge: `https://your-domain.com`
3. Testez l'authentification
4. Testez la fonctionnalité hors ligne
