# 🏪 Triomphe - Plateforme de Gestion de Boutique

Une plateforme complète et moderne pour gérer votre boutique en ligne, intégrée à **Railway** pour un déploiement facile.

## ✨ Fonctionnalités

### 📊 Tableau de Bord
- Vue d'ensemble des ventes du jour
- Calcul automatique des bénéfices
- Alertes pour les produits en stock faible
- Statistiques en temps réel

### 🛒 Gestion des Ventes
- Interface simple pour enregistrer les ventes
- Panier interactif avec ajustement des quantités
- Déduction automatique du stock
- Suivi des transactions

### 📦 Inventaire/Stock
- Tableau complet des produits
- Ajouter, modifier, supprimer des produits
- Suivi du prix d'achat et prix de vente
- Calcul automatique de la marge bénéficiaire
- Gestion des catégories

### 🔐 Authentification
- Inscription et connexion sécurisées
- JWT pour l'authentification
- Données isolées par utilisateur

## 🛠️ Stack Technologique

### Backend
- **Node.js** avec Express.js
- **PostgreSQL** pour la base de données
- **JWT** pour l'authentification
- **Bcrypt** pour le hash des mots de passe

### Frontend
- **React 18** avec Vite
- **React Router** pour la navigation
- **Axios** pour les requêtes API
- **Lucide React** pour les icônes
- **CSS personnalisé** pour le design

## 📋 Configuration Pré-requise

### Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
# Server
PORT=5000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key_here

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/triomphe_db
```

## 🚀 Déploiement sur Railway

### Étapes de Déploiement

1. **Connectez-vous à Railway** : https://railway.app

2. **Créez un nouveau projet**
   - Cliquez sur "New Project"
   - Sélectionnez "Deploy from GitHub"
   - Connectez votre repository GitHub

3. **Configurez les Services**

   #### Service 1: PostgreSQL Database
   - Cliquez sur "Add Services"
   - Sélectionnez "PostgreSQL"
   - Railway crée automatiquement l'URL de connexion

   #### Service 2: Node.js Backend
   - Cliquez sur "Add Services"
   - Sélectionnez "GitHub Repo"
   - Sélectionnez votre repository
   - Configure les variables d'environnement:
     - `DATABASE_URL` (copié depuis PostgreSQL)
     - `JWT_SECRET` (générez une clé sécurisée)
     - `NODE_ENV=production`

4. **Variables d'Environnement Railway**

   Dans votre projet Railway, allez à "Settings" > "Variables" et ajoutez:

   ```
   JWT_SECRET=your_secure_secret_key_here
   NODE_ENV=production
   ```

   Railway génère automatiquement `DATABASE_URL` pour PostgreSQL.

5. **Déployer**
   - Le déploiement démarre automatiquement
   - Attendez que tous les services soient en ligne (✓)
   - Vérifiez les logs pour les erreurs

## 🌐 Utilisation en Production

Une fois déployé sur Railway :

1. Accédez à l'URL publique de votre application
2. Créez un compte
3. Commencez à gérer votre boutique

## 📝 Scripts Disponibles

### Backend
```bash
npm install              # Installer les dépendances
npm start               # Démarrer le serveur
npm run dev             # Mode développement
```

### Frontend
```bash
cd client
npm install             # Installer les dépendances
npm run dev             # Démarrer le serveur Vite (port 3000)
npm run build           # Build pour production
```

## 🗄️ Structure de la Base de Données

### Tables

**users**
- id (UUID)
- name (VARCHAR)
- email (VARCHAR, unique)
- password (VARCHAR - hashé)
- created_at, updated_at

**products**
- id (UUID)
- user_id (FK users)
- name, description
- purchase_price, selling_price
- stock_quantity
- category
- image_url
- created_at, updated_at

**sales**
- id (UUID)
- user_id (FK users)
- total_amount, total_cost, profit
- created_at

**sale_items**
- id (UUID)
- sale_id (FK sales)
- product_id (FK products)
- quantity, unit_price, total_price

## 🔧 Troubleshooting

### "Erreur de connexion à la base de données"
- Vérifiez que `DATABASE_URL` est correctement configuré
- Assurez-vous que PostgreSQL est accessible
- Vérifiez les logs dans Railway

### "Produits ne s'affichent pas"
- Vérifiez que vous êtes connecté
- Assurez-vous que les tables de base de données sont créées
- Consultez les logs du serveur

### "Erreurs CORS"
- Le backend autorise les requêtes du frontend
- Vérifiez les en-têtes de la requête

## 📧 Support

Pour toute question ou problème, consultez la documentation de Railway:
https://docs.railway.app

## 📄 Licence

Ce projet est sous licence ISC.
