# Stock Management Frontend

## Vue d'ensemble

Interface utilisateur moderne développée avec Vue.js 3 pour le système de gestion de stock. Le frontend offre une interface intuitive pour gérer les produits, suivre les stocks, et analyser les données.

## Fonctionnalités Principales

### 🔐 Authentification

- **Connexion sécurisée** avec email/mot de passe
- **Inscription** de nouveaux utilisateurs
- **Gestion des sessions** avec JWT
- **Protection des routes** authentifiées
- **Déconnexion automatique** en cas d'expiration

### 📦 Gestion des Produits

- **Liste complète** avec vue grille et tableau
- **Recherche avancée** avec filtres multiples
- **Création** de nouveaux produits avec aperçu temps réel
- **Modification** des produits existants
- **Détails complets** avec informations étendues
- **Gestion du stock** en temps réel (ajout/retrait)
- **Statut actif/inactif** des produits

### 🚨 Système d'Alertes

- **Stock faible** avec seuils personnalisables
- **Expiration proche** (30 jours)
- **Produits expirés** avec gestion
- **Actions rapides** de réapprovisionnement
- **Notifications visuelles** intuitives

### 📊 Dashboard et Statistiques

- **Vue d'ensemble** avec métriques clés
- **Graphiques** de répartition des stocks
- **Top produits** par stock et valeur
- **Analyse financière** avec marges
- **Recommandations** intelligentes
- **Répartition par catégorie**

### 🎨 Interface Utilisateur

- **Design moderne** et responsive
- **Navigation intuitive** avec menu fixe
- **Thème cohérent** avec dégradés
- **Animations fluides** et transitions
- **Compatibilité mobile** optimisée
- **Icônes emoji** pour une meilleure UX

## Structure du Projet

```
src/
├── components/           # Composants réutilisables
├── views/               # Pages principales
│   ├── LoginView.vue    # Page de connexion
│   ├── RegisterView.vue # Page d'inscription
│   ├── DashboardView.vue # Dashboard principal
│   ├── ProductsView.vue  # Liste des produits
│   ├── ProductCreateView.vue # Création de produit
│   ├── ProductDetailView.vue # Détails du produit
│   ├── AlertsView.vue   # Système d'alertes
│   ├── StatsView.vue    # Statistiques détaillées
│   ├── HomeView.vue     # Page d'accueil
│   └── NotFoundView.vue # Page 404
├── stores/              # Gestion d'état Pinia
│   ├── auth.js         # Store d'authentification
│   └── products.js     # Store des produits
├── services/           # Services API
│   └── api.js         # Configuration Axios
├── router/            # Configuration des routes
│   └── index.js       # Router Vue.js
├── App.vue           # Composant racine
├── main.js          # Point d'entrée
└── style.css       # Styles globaux
```

## Technologies Utilisées

- **Vue.js 3** - Framework JavaScript moderne
- **Composition API** - Logique réactive optimisée
- **Pinia** - Gestion d'état officielle pour Vue 3
- **Vue Router 4** - Routage côté client
- **Axios** - Client HTTP pour API REST
- **CSS3** - Styles modernes avec Grid et Flexbox
- **Responsive Design** - Compatible tous écrans

## Installation et Configuration

### Prérequis

- Node.js 16+ et npm
- Backend API fonctionnel (port 3000)

### Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Construire pour production
npm run build
```

### Configuration API

Le frontend est configuré pour communiquer avec l'API backend sur `http://localhost:3000`. Modifiez `src/services/api.js` si nécessaire.

## Fonctionnalités Détaillées

### 🔐 Authentification

- **JWT automatique** : Token ajouté automatiquement aux requêtes
- **Redirection intelligente** : Retour à la page demandée après connexion
- **Gestion d'erreurs** : Messages clairs en cas de problème
- **Persistance** : Session maintenue entre les visites

### 📦 Gestion Produits

#### Recherche et Filtres

- Nom du produit (recherche textuelle)
- Catégorie et fournisseur
- Fourchette de prix (min/max)
- Statut (actif/inactif)
- Stock faible uniquement

#### Création de Produits

- **Formulaire en sections** : Organisation claire
- **Validation temps réel** : Erreurs affichées immédiatement
- **Aperçu en direct** : Prévisualisation du produit
- **Calcul automatique** : Marge et pourcentages
- **Dates intelligentes** : Date d'entrée pré-remplie

#### Vue Détaillée

- **Informations complètes** : Tous les champs disponibles
- **Gestion stock rapide** : Boutons +/- et modal
- **Alertes contextuelles** : Stock faible, expiration
- **Calculs automatiques** : Valeur totale, marge
- **Actions directes** : Modifier, supprimer, ajuster

### 🚨 Système d'Alertes

#### Types d'Alertes

1. **Stock Faible** : Produits sous le seuil minimum
2. **Expiration Proche** : Produits expirant dans 30 jours
3. **Produits Expirés** : Dépassement de date limite

#### Actions Disponibles

- **Réapprovisionnement rapide** : +10 unités automatiques
- **Marquage expiré** : Désactivation du produit
- **Visualisation détaillée** : Accès aux informations complètes

### 📊 Dashboard et Analytics

#### Métriques Clés

- Nombre total de produits
- Produits actifs vs inactifs
- Alertes stock faible
- Produits expirant bientôt

#### Analyses Avancées

- **Répartition par statut** : Graphiques en barres
- **État des stocks** : Santé globale de l'inventaire
- **Top produits** : Par quantité et valeur
- **Analyse financière** : Valeurs d'achat/vente, marges
- **Répartition catégories** : Distribution des produits

#### Recommandations

- Alertes automatiques sur les problèmes
- Suggestions d'actions correctives
- Liens directs vers les solutions

## Responsive Design

### Points de Rupture

- **Mobile** : < 768px - Layout en colonne unique
- **Tablette** : 768px - 1024px - Grilles adaptées
- **Desktop** : > 1024px - Layout complet

### Adaptations Mobiles

- Navigation en menu vertical
- Cartes empilées verticalement
- Boutons pleine largeur
- Formulaires simplifiés
- Modales adaptées

## API Integration

### Configuration Axios

```javascript
// Base URL configurée
const API_BASE_URL = 'http://localhost:3000'

// Intercepteurs automatiques
- Token JWT ajouté aux headers
- Gestion d'erreurs globale
- Redirection en cas d'expiration
```

### Services Disponibles

- **Authentication** : login, register, refresh
- **Products** : CRUD, search, stock management
- **Statistics** : metrics, analytics, reports

## Gestion d'État (Pinia)

### Store Authentification

```javascript
// État global
- token: JWT token
- user: Informations utilisateur
- loading: État de chargement
- error: Gestion d'erreurs

// Actions disponibles
- login(credentials)
- register(userData)
- logout()
- checkAuth()
```

### Store Produits

```javascript
// État global
- products: Liste des produits
- currentProduct: Produit sélectionné
- searchResults: Résultats de recherche
- stats: Statistiques globales

// Actions disponibles
- fetchProducts()
- createProduct(data)
- updateProduct(id, data)
- deleteProduct(id)
- searchProducts(filters)
- updateStock(id, quantity)
```

## Sécurité

### Protection des Routes

- **Guards automatiques** : Vérification d'authentification
- **Redirection** : Vers login si non connecté
- **Token validation** : Vérification côté client et serveur

### Gestion des Erreurs

- **Intercepteurs HTTP** : Gestion centralisée
- **Messages utilisateur** : Erreurs explicites
- **Fallbacks** : États de secours en cas d'échec

## Performance

### Optimisations

- **Lazy loading** : Chargement différé des vues
- **Composants réactifs** : Re-rendu optimisé
- **Debouncing** : Recherche avec délai
- **Mise en cache** : Données persistantes

### Bundle Optimization

- **Tree shaking** : Code inutilisé supprimé
- **Code splitting** : Chargement par route
- **Minification** : CSS et JS optimisés

## Développement

### Structure Recommandée

```javascript
// Composition API pattern
export default {
  setup() {
    // État réactif
    const state = reactive({});

    // Computed properties
    const computed = computed(() => {});

    // Methods
    const methods = () => {};

    // Lifecycle
    onMounted(() => {});

    return { state, computed, methods };
  },
};
```

### Bonnes Pratiques

- **Nommage cohérent** : PascalCase pour composants
- **Props typées** : Validation des propriétés
- **Émissions documentées** : Events explicites
- **Styles scopés** : CSS isolé par composant

## Tests

### Tests Recommandés

- **Composants** : Vue Test Utils
- **Stores** : Tests unitaires Pinia
- **API** : Mock des services
- **E2E** : Cypress pour parcours utilisateur

## Déploiement

### Build de Production

```bash
npm run build
```

### Variables d'Environnement

```javascript
// .env.production
VITE_API_URL=https://api.votre-domaine.com
VITE_APP_NAME=Stock Management
```

### Serveur Web

- **Static hosting** : Netlify, Vercel
- **Serveur traditionnel** : Apache, Nginx
- **SPA routing** : Configuration requise

## Maintenance

### Mises à Jour

- **Dépendances** : npm audit et updates réguliers
- **Vue.js** : Suivi des versions LTS
- **API compatibility** : Synchronisation backend

### Monitoring

- **Erreurs client** : Sentry ou similaire
- **Analytics** : Google Analytics
- **Performance** : Web Vitals

## Support

### Compatibilité Navigateurs

- **Modernes** : Chrome 80+, Firefox 75+, Safari 13+
- **Edge** : 80+ (Chromium)
- **Mobile** : iOS Safari 13+, Chrome Mobile 80+

### Accessibilité

- **ARIA labels** : Navigation assistée
- **Contraste** : Ratios WCAG conformes
- **Clavier** : Navigation complète au clavier
- **Screen readers** : Structure sémantique

---

## Démarrage Rapide

1. **Clone et installation**

```bash
git clone [repository]
cd stock-management-frontend
npm install
```

2. **Configuration environnement**

```bash
cp .env.example .env.local
# Éditer les variables si nécessaire
```

3. **Lancement développement**

```bash
npm run dev
```

4. **Accès application**

```
http://localhost:5173
```

5. **Compte de test**

```
Email: admin@stockmanagement.com
Mot de passe: admin123
```

L'application frontend est maintenant prête à être utilisée avec toutes les fonctionnalités de gestion de stock modernes !
