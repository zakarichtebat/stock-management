# Stock Management App

Application complète de gestion de stock avec backend NestJS et frontend Vue.js.

## Structure du projet

```
stock-management/
├── stock-management-api/      # Backend (NestJS + Prisma)
├── stock-management-frontend/ # Frontend (Vue.js)
└── README.md
```

## Technologies utilisées

### Backend (stock-management-api)

- **NestJS** - Framework Node.js
- **Prisma** - ORM pour la base de données
- **SQLite** - Base de données
- **Swagger** - Documentation API
- **TypeScript** - Language de programmation

### Frontend (stock-management-frontend)

- **Vue.js 3** - Framework JavaScript
- **Vite** - Build tool
- **JavaScript** - Language de programmation

## Installation et démarrage

### Backend (API)

```bash
cd stock-management-api
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

L'API sera disponible sur `http://localhost:3000`
Documentation Swagger: `http://localhost:3000/api`

### Frontend

```bash
cd stock-management-frontend
npm install
npm run dev
```

Le frontend sera disponible sur `http://localhost:5173`

## Fonctionnalités

- ✅ CRUD complet pour les produits
- ✅ Interface utilisateur intuitive
- ✅ API RESTful documentée
- ✅ Gestion des stocks en temps réel
- ✅ Validation des données

## API Endpoints

- `GET /products` - Lister tous les produits
- `GET /products/:id` - Obtenir un produit spécifique
- `POST /products` - Créer un nouveau produit
- `PUT /products/:id` - Mettre à jour un produit
- `DELETE /products/:id` - Supprimer un produit

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT.
