# Offline First Architecture
Triomphe fonctionne complètement **hors réseau** grâce à :

## Technologies
- **Progressive Web App (PWA)** - Fonctionne sans internet
- **IndexedDB** - Base de données locale via Dexie
- **Service Workers** - Cache intelligent
- **Sync en arrière-plan** - Synchronise automatiquement

## Fonctionnement

### En ligne ✅
- Toutes les données sont synchronisées en temps réel
- Les modifications sont sauvegardées sur le serveur
- Vue complète du tableau de bord

### Hors ligne 🚫
- Les données sont stockées localement (IndexedDB)
- Les modifications sont mises en attente de synchronisation
- Quand la connexion revient, synchronisation automatique
- Interface complète fonctionnelle

## Utilisation

### Installation comme App
1. Ouvrez la plateforme sur navigateur
2. Cliquez sur le menu d'installation (généralement en haut à droite)
3. "Installer l'app" ou "Add to Home Screen"
4. L'app fonctionne hors ligne complètement

### Mode Hors Ligne
- Travaillez normalement sans connexion internet
- Les ventes et produits sont sauvegardés localement
- Un message indique le mode hors ligne
- À la reconnexion, tous les changements se synchronisent automatiquement
- Aucune perte de données

## Données Synchronisées
- ✅ Produits (ajouter, modifier, supprimer)
- ✅ Ventes (enregistrement complet)
- ✅ Factures (création et stockage)
- ✅ Agents (gestion complète)
- ✅ Profil utilisateur

## Limitations Hors Ligne
- 📊 Tableau de bord affiche données en cache
- 📱 Envoi WhatsApp nécessite internet
- 💳 Paiements en ligne nécessitent internet
- 🌐 Imports/Exports nécessitent internet

## Architecture Technique

### Client (React + Vite)
```
src/
├── utils/
│   ├── offlineDB.js    # Dexie + IndexedDB
│   └── api.js          # Axios avec offline fallback
├── pages/
│   ├── Login.jsx       # Auth avec cache offline
│   └── Inventory.jsx   # Gestion stock offline
└── main.jsx            # Service Worker registration
```

### Service Worker
- Cache stratégie: Network First
- TTL: 7 jours pour API, 1 jour pour assets
- Sync en arrière-plan quand online

### IndexedDB (Dexie)
```javascript
{
  products: 'id',           // Cache produits
  sales: 'id, created_at',  // Ventes
  agents: 'id',             // Agents
  invoices: 'id',           // Factures
  pendingSync: '++id'       // Queue de sync
}
```

## Synchronisation

Lorsque l'utilisateur revient en ligne:
1. Service Worker détecte `online` event
2. Appel `syncDataToServer()`
3. Parcourt `pendingSync` table
4. Envoie chaque modification au serveur
5. Supprime de la queue une fois confirmé
6. UI affiche message de sync complète

## Performance

- **Offline First = Instant** - Pas d'attente réseau
- **Sync asynchrone** - L'utilisateur peut continuer à travailler
- **Gestion de conflits** - Last-write-wins strategy
- **Données comprimées** - IndexedDB optimisé

## Sécurité

- 🔐 Token JWT stocké en localStorage
- 🔒 HTTPS obligatoire en production
- 🛡️ Validation côté serveur obligatoire
- 🔑 Pas de données sensibles en cache

## Test Mode Offline

```javascript
// Chrome DevTools > Network > Offline
// Ou simper avec:
// window.dispatchEvent(new Event('offline'))
```

Travaillez, créez des ventes, modifiez des produits, puis:
```javascript
// Retour online
window.dispatchEvent(new Event('online'))
```

Les modifications se synchronisent automatiquement!
