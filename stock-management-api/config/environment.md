# Variables d'environnement

Créez un fichier `.env` à la racine du projet backend avec les variables suivantes :

```env
# Base de données
DATABASE_URL="mysql://username:password@localhost:3306/stock_management"

# JWT Secret pour l'authentification
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Port de l'application
PORT=3000

# Environment
NODE_ENV=development
```

## Description des variables

- **DATABASE_URL** : URL de connexion à la base de données MySQL
- **JWT_SECRET** : Clé secrète pour signer les tokens JWT (doit être changée en production)
- **PORT** : Port sur lequel l'application écoute
- **NODE_ENV** : Environnement d'exécution (development, production, test)
