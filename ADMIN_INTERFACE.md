# Interface Administrative - Adria Cash Pooling

## Vue d'ensemble

L'interface administrative est réservée aux **administrateurs de banque partenaire (Admin)**. Elle fournit des outils complets pour gérer la tarification et les paramètres généraux de la banque, complètement séparée du processus de Cash Pooling qui est géré par le Chargé de clientèle.

## Accès et Navigation

### URL
- **Route Admin :** `/admin`
- **Redirection automatique :** Les utilisateurs avec le rôle "Admin" sont automatiquement redirigés de `/dashboard` vers `/admin`

### Authentification
- Seuls les utilisateurs avec le rôle **"Admin"** peuvent accéder à cette interface
- Tentative d'accès non-autorisé = redirection vers `/dashboard`

---

## Fonctionnalités Principales

### 1. Gestion de la Tarification

#### Vue d'ensemble
- Choisir la **source de tarification** (Adria ou Externe)
- Configurer les **règles de tarification** si Adria est sélectionné
- Intégrer un **moteur externe** si préféré

#### Option 1: Moteur Adria
- **Activation :** Basculer vers "Moteur Adria"
- **Règles de tarification :** Gérer un ensemble de règles prédéfinies ou personnalisées
  - **Types de règles :**
    - **Montant Fixe (flat) :** Frais constants (ex: 500 MAD)
    - **Pourcentage (percentage) :** Frais basés sur un pourcentage (ex: 0.5%)
    - **Échelonné (tiered) :** Frais variables selon tranches

- **Paramètres par règle :**
  - Nom et description
  - Type et valeur
  - Montants minimum/maximum (optionnels)
  - Statut Actif/Inactif

- **Opérations :**
  - ✅ Ajouter une nouvelle règle
  - ✅ Modifier une règle existante
  - ✅ Supprimer une règle
  - ✅ Activer/Désactiver une règle

#### Option 2: Moteur Externe
- **Activation :** Basculer vers "Moteur Externe"
- **Configuration requise :**
  - **Nom du Fournisseur :** Identifier le prestataire (ex: "Pricing Engine Pro")
  - **URL de l'API :** Endpoint REST de l'API externe
  - **Clé API :** Authentification sécurisée pour l'API

- **Avantages :**
  - Intégration avec systèmes de tarification existants
  - Flexibilité maximale
  - Pas de gestion manuelle des règles

### 2. Paramètres de la Banque

Gérez les informations générales et de contact de votre banque partenaire.

#### Informations Bancaires Générales
- **Nom de la Banque :** Raison sociale officielle
- **Code Bancaire :** Code IBAN identifiant (ex: CIHMMA2C)
- **Code SWIFT :** Code international (ex: CIHMMA2CXXX)
- **Devise Principale :** MAD, EUR, USD, GBP, etc.

#### Informations de Contact Principal
- **Nom du Contact :** Responsable administratif
- **Email du Contact :** Adresse email de communication
- **Téléphone du Contact :** Numéro de téléphone direct

#### Adresse
- **Adresse :** Adresse physique complète
- **Ville :** Ville où se situe la banque
- **Code Postal :** Code postal
- **Pays :** Pays d'implantation
- **Fuseau Horaire :** Pour la coordination des opérations

#### Audit Système
- **Date de création :** Timestamp de création du compte
- **Dernière mise à jour :** Dernière modification

---

## Architecture de Rôles

### Séparation des Responsabilités

| Rôle | Processus Cash Pooling | Tarification | Paramètres Banque | Interface |
|------|------------------------|--------------|-------------------|-----------|
| **Chargé de clientèle** | ✅ Complète | ❌ Masquée | ❌ Pas d'accès | `/dashboard` |
| **Admin** | ❌ Pas affiché | ✅ Gestion complète | ✅ Gestion complète | `/admin` |
| **Client** | ❌ Accès limité | ❌ Pas d'accès | ❌ Accès personnel seulement | `/dashboard` (limité) |

### Permissions Spécifiques

#### Admin
- `manage_pricing` - Modifier la tarification
- `manage_all_settings` - Gérer tous les paramètres
- `view_pricing` - Visualiser la tarification

#### Chargé de clientèle
- Voir tous les comptes
- Gérer les contrats
- Voir les amendements
- **PAS D'accès à la tarification**
- **PAS D'accès aux paramètres admin**

#### Client
- Voir les propres contrats
- Accès limité aux données personnelles
- **PAS D'accès à l'administration**

---

## Types de Données

### PricingConfig
```typescript
interface PricingConfig {
  id: string
  bankId: string
  sourceType: "adria" | "external"
  adriaEnabled: boolean
  externalEnabled: boolean
  externalProviderName?: string
  externalApiEndpoint?: string
  externalApiKey?: string
  rules: PricingRule[]
  createdAt: Date
  updatedAt: Date
}
```

### PricingRule
```typescript
interface PricingRule {
  id: string
  name: string
  description: string
  type: "flat" | "percentage" | "tiered"
  value: number
  currency: string
  minAmount?: number
  maxAmount?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### BankSettings
```typescript
interface BankSettings {
  id: string
  bankName: string
  bankCode: string
  swiftCode: string
  mainContactName: string
  mainContactEmail: string
  mainContactPhone: string
  address: string
  city: string
  postalCode: string
  country: string
  currency: string
  timezone: string
  createdAt: Date
  updatedAt: Date
}
```

---

## Comptes de Test

| Rôle | Email | Mot de passe | Interface |
|------|-------|--------------|-----------|
| Chargé de clientèle | charge@banque.fr | 123456 | `/dashboard` |
| **Admin** | **admin@banque.fr** | **123456** | **`/admin`** |
| Client | client@banque.fr | 123456 | `/dashboard` (limité) |

---

## Cas d'Usage

### Scénario 1: Configuration initiale pour une nouvelle banque
1. Admin se connecte avec admin@banque.fr
2. Va à l'onglet "Paramètres Banque"
3. Remplit les informations bancaires générales
4. Configure le contact principal
5. Valide l'adresse et le fuseau horaire
6. Clique "Enregistrer les modifications"

### Scénario 2: Mise en place de la tarification Adria
1. Admin va à l'onglet "Tarification"
2. Sélectionne "Moteur Adria"
3. Ajoute les règles de tarification (frais, commissions, etc.)
4. Chaque règle peut être activée/désactivée individuellement
5. Les modifications sont sauvegardées automatiquement

### Scénario 3: Intégration d'un moteur externe
1. Admin va à l'onglet "Tarification"
2. Sélectionne "Moteur Externe"
3. Entre le nom du fournisseur (ex: "Pricing Engine Pro")
4. Configure l'URL de l'API
5. Ajoute la clé API sécurisée
6. Le système utilise l'API externe pour les calculs de tarification

---

## Flux de Navigation

```
Login (admin@banque.fr)
  ↓
  → Page Admin (/admin)
      ├─ Tarification
      │  ├─ Moteur Adria
      │  │  └─ Gestion des règles
      │  └─ Moteur Externe
      │     └─ Configuration API
      └─ Paramètres Banque
         ├─ Infos générales
         ├─ Contact principal
         ├─ Adresse
         └─ Fuseau horaire
```

---

## Sécurité et Bonnes Pratiques

### Sécurité des Clés API
- Les clés API pour moteurs externes doivent être masquées
- Utiliser HTTPS pour toutes les communications
- Limiter les accès aux utilisateurs Admin uniquement

### Audit
- Toutes les modifications sont timestampées
- Historique des changements disponible
- Notifications en cas de mise à jour

### Validation
- Validation côté client et serveur
- Pas de données vides critiques
- Vérification des formats (email, SWIFT, etc.)

---

## Intégration avec le Processus Cash Pooling

### Point important: Séparation des Responsabilités

**L'interface Admin NE DOIT PAS gérer :**
- La sélection du compte centralisateur
- La structuration des comptes secondaires
- La validation des contrats
- La génération des documents

**Ces fonctions restent dans `/dashboard` pour le Chargé de clientèle**

### Impact de la Tarification Admin

La tarification configurée par l'Admin s'applique **automatiquement** lors de :
- Création d'un nouveau contrat Cash Pooling
- Application de tarifs aux frais de service
- Calcul des commissions

---

## Support et Maintenance

### Interface Admin minimale
- Pas de gestion du cycle de vie des contrats
- Pas d'actions de support (annulation, suspension)
- Strictement configuration et paramètres

### Pour les contrats existants
- Les modifications de tarification s'appliquent aux nouveaux contrats
- Les contrats existants conservent leur tarification originelle
- Possible de faire des ajustements manuels si besoin

---

## Évolution Future

Fonctionnalités envisagées pour les prochaines versions :
- 📊 Dashboard analytique (KPIs, revenus)
- 📈 Historique des modifications
- 🔄 Audit trail complet
- 📧 Notifications personnalisées
- 📋 Rapports automatisés
- 🔌 API pour intégrations

---

## Questions Fréquentes

**Q: Peut-on revenir d'un moteur externe à Adria ?**
R: Oui, le basculement est instantané. Les règles Adria restent sauvegardées.

**Q: Que se passe-t-il si l'API externe est hors ligne ?**
R: À implémenter selon besoins - fallback vers Adria ou message d'erreur.

**Q: Les Chargés de clientèle voient-ils les paramètres admin ?**
R: Non, l'onglet Tarification est masqué pour eux au niveau UI et API.

**Q: Comment tester différents scénarios de tarification ?**
R: Utiliser les comptes de test pour simuler différentes configurations.
