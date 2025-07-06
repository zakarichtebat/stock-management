# 🔐 Authentification Backend - Stock Management API

## Installation des dépendances

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-local passport-jwt bcrypt @types/bcrypt @types/passport-local @types/passport-jwt
```

## Configuration

1. **Variables d'environnement**
   - Créez un fichier `.env` à la racine du projet
   - Consultez `config/environment.md` pour les variables nécessaires

2. **Migration de la base de données**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Endpoints d'authentification

### 🔑 Inscription d'un administrateur

```http
POST /auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "motdepasse123",
  "name": "John Doe",
  "role": "ADMIN"
}
```

### 🔓 Connexion

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "motdepasse123"
}
```

**Réponse :**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "John Doe",
    "role": "ADMIN",
    "isActive": true
  }
}
```

### 👤 Profil utilisateur

```http
GET /auth/profile
Authorization: Bearer <token>
```

### ✅ Validation du token

```http
POST /auth/validate-token
Authorization: Bearer <token>
```

## Endpoints de gestion des utilisateurs

### 👥 Lister tous les utilisateurs

```http
GET /users
Authorization: Bearer <token>
```

### 👤 Récupérer un utilisateur

```http
GET /users/:id
Authorization: Bearer <token>
```

### ✏️ Mettre à jour un utilisateur

```http
PATCH /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nouveau nom",
  "email": "nouvel@email.com"
}
```

### 🗑️ Supprimer un utilisateur

```http
DELETE /users/:id
Authorization: Bearer <token>
```

## Sécurité

- **Hashage des mots de passe** : bcrypt avec salt de 10 rounds
- **JWT** : Tokens avec expiration de 24h
- **Validation** : Tous les endpoints utilisateurs protégés par JWT
- **Roles** : ADMIN et SUPER_ADMIN disponibles

## Utilisation du token

Après connexion, utilisez le token dans l'en-tête Authorization :

```
Authorization: Bearer <votre-token-jwt>
```

## Documentation Swagger

Accédez à la documentation interactive : `http://localhost:3000/api`

## Prochaines étapes

1. ✅ Authentification backend implémentée
2. ⏳ Gestion des produits avec contrôle d'accès
3. ⏳ Alertes produits proches d'expiration
4. ⏳ Génération de factures et devis
5. ⏳ Statistiques en temps réel
6. ⏳ Rapports PDF/Excel
7. ⏳ Gestion des fournisseurs et clients
8. ⏳ Gestion des commandes et ventes
