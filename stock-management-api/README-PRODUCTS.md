# 📦 Gestion des Produits - Stock Management API

## Fonctionnalités implémentées

### ✅ **Gestion complète des produits**

- Ajouter un produit avec toutes les informations
- Modifier / supprimer un produit
- Rechercher des produits avec filtres avancés
- Gestion des stocks (mise à jour, ajustement)
- Alertes stock faible et produits expirés
- Statistiques détaillées

---

## 🗂️ **Structure du produit**

### Informations principales

- **Nom** : Nom du produit
- **Quantité** : Stock disponible
- **Date d'entrée** : Date d'ajout en stock
- **Date d'expiration** : Date limite de consommation
- **Prix d'achat** : Coût d'acquisition
- **Prix de vente** : Prix de vente client

### Informations complémentaires

- **Description** : Détails du produit
- **Catégorie** : Classification du produit
- **Fournisseur** : Nom du fournisseur
- **Code-barres** : Identifiant unique (optionnel)
- **Stock minimum** : Seuil d'alerte (défaut: 5)
- **Actif** : Statut du produit

---

## 🔗 **Endpoints disponibles**

### **Gestion de base**

#### 📝 Ajouter un produit

```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "quantity": 50,
  "entryDate": "2025-01-15",
  "expirationDate": "2025-12-31",
  "purchasePrice": 800.50,
  "salePrice": 1200.00,
  "description": "Smartphone dernière génération",
  "category": "Électronique",
  "supplier": "Apple Inc.",
  "barcode": "1234567890123",
  "minStock": 10
}
```

#### 📋 Lister tous les produits

```http
GET /products
Authorization: Bearer <token>
```

#### 🔍 Récupérer un produit

```http
GET /products/:id
Authorization: Bearer <token>
```

#### ✏️ Mettre à jour un produit

```http
PATCH /products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nouveau nom",
  "quantity": 75,
  "salePrice": 1300.00
}
```

#### 🗑️ Supprimer un produit

```http
DELETE /products/:id
Authorization: Bearer <token>
```

---

### **Recherche avancée**

#### 🔍 Rechercher avec filtres

```http
GET /products/search?name=iPhone&category=Électronique&minPrice=500&maxPrice=1500
Authorization: Bearer <token>
```

**Paramètres de recherche :**

- `name` : Recherche par nom
- `category` : Recherche par catégorie
- `supplier` : Recherche par fournisseur
- `barcode` : Recherche par code-barres
- `minPrice` / `maxPrice` : Fourchette de prix
- `isActive` : Produits actifs seulement
- `lowStock` : Produits en stock faible
- `expiringInDays` : Produits expirant dans X jours

---

### **Gestion des stocks**

#### 📊 Mise à jour du stock

```http
PATCH /products/:id/stock
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 100
}
```

#### ⚖️ Ajustement du stock

```http
PATCH /products/:id/adjust-stock
Authorization: Bearer <token>
Content-Type: application/json

{
  "adjustment": -5  // Réduction de 5 unités
}
```

---

### **Alertes et monitoring**

#### ⚠️ Produits en stock faible

```http
GET /products/low-stock
Authorization: Bearer <token>
```

#### ⏰ Produits proches d'expiration

```http
GET /products/expiring?days=30
Authorization: Bearer <token>
```

#### 💀 Produits expirés

```http
GET /products/expired
Authorization: Bearer <token>
```

#### 📈 Statistiques

```http
GET /products/stats
Authorization: Bearer <token>
```

**Réponse statistiques :**

```json
{
  "total": 150,
  "active": 145,
  "lowStock": 12,
  "expiring": 8,
  "expired": 3
}
```

---

## 🛡️ **Sécurité**

- **Authentification JWT** : Tous les endpoints protégés
- **Validation** : Données d'entrée validées
- **Permissions** : Seuls les utilisateurs authentifiés peuvent accéder
- **Codes-barres uniques** : Prévention des doublons

---

## 📋 **Exemples d'utilisation**

### Ajouter un produit alimentaire

```json
{
  "name": "Lait entier 1L",
  "quantity": 24,
  "entryDate": "2025-01-06",
  "expirationDate": "2025-01-20",
  "purchasePrice": 0.8,
  "salePrice": 1.2,
  "category": "Produits laitiers",
  "supplier": "Lactalis",
  "minStock": 6
}
```

### Rechercher des produits électroniques chers

```
GET /products/search?category=Électronique&minPrice=1000&isActive=true
```

### Obtenir les produits expirant dans 7 jours

```
GET /products/expiring?days=7
```

---

## 📊 **Fonctionnalités futures**

### Prochaines implémentations

- 🔔 **Notifications automatiques** pour stocks faibles
- 📤 **Import/Export** de produits en masse
- 🏷️ **Gestion des catégories** avancée
- 📱 **Scanner code-barres** pour ajout rapide
- 📈 **Historique des mouvements** de stock
- 🎯 **Prévisions de réapprovisionnement**

---

## 🎯 **Statut du développement**

- ✅ **Authentification** - Terminé
- ✅ **Gestion des produits** - Terminé
- ✅ **Recherche avancée** - Terminé
- ✅ **Alertes expiration** - Terminé
- ✅ **Gestion des stocks** - Terminé
- ⏳ **Génération de factures** - À venir
- ⏳ **Gestion des fournisseurs** - À venir
- ⏳ **Gestion des clients** - À venir
- ⏳ **Commandes et ventes** - À venir

Le module de gestion des produits est maintenant **100% fonctionnel** ! 🚀
