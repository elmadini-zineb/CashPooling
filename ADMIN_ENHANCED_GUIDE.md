# Interface Admin Améliorée - Guide Complet

## Vue d'ensemble

L'interface Admin a été complètement rénovée avec une architecture moderne incluant:
- **Sidebar navigation** - Menu latéral collapsible
- **Header informatif** - Affichage des données utilisateur et banque
- **Gestion avancée de tarification** - 3 modèles dynamiques (Fixe, Variable, Hybride)
- **Sélecteur de moteur** - Switch Adria/Externe
- **Design professionnel** - Theme blanc moderne avec accents bleus

---

## Architecture

### Composants Créés

#### 1. **AdminSidebar** (`admin-sidebar.tsx`)
Navigation collapsible avec 3 sections principales:
- **Tarification** - Gestion des modèles de prix
- **Paramètres** - Configuration banque
- **Analytics** - Statistiques (coming soon)

Features:
- Menu expansible/réductible
- Icons descriptifs
- Descriptions courtes
- Logout button

#### 2. **AdminHeader** (`admin-header.tsx`)
Affichage en haut de l'interface:
- Titre et description
- Informations utilisateur (nom, rôle)
- Données banque
- Heure actuelle

#### 3. **AdvancedPricingConfig** (`advanced-pricing-config.tsx`)
Gestion complète de tarification avec 3 modèles:

**Tarification Fixe:**
- Montant fixe
- Devise (MAD, EUR, USD)
- Cycle facturation (mensuel, trimestriel, annuel)

**Tarification Variable:**
- Taux (%)
- Critères (Montant Transféré, Nombre de Sweeps, Seuil de Volume)
- Frais min/max
- Frais par opération

**Tarification Hybride:**
- Combinaison fixe + variable
- Tabs pour configuration séparée
- Prévisualisation du modèle

#### 4. **PricingEngineSelector** (`pricing-engine-selector.tsx`)
Switch entre moteurs:

**Moteur Adria:**
- Pré-configuré
- Sécurisé
- Standard

**Moteur Externe:**
- URL API personnalisée
- Clé API
- Test de connexion avant activation

---

## Types TypeScript

### PricingModelType
```typescript
type PricingModelType = "fixed" | "variable" | "hybrid"
```

### FixedPricingModel
```typescript
interface FixedPricingModel {
  type: "fixed"
  amount: number
  currency: string
  billingCycle: "monthly" | "quarterly" | "yearly"
}
```

### VariablePricingModel
```typescript
interface VariablePricingModel {
  type: "variable"
  ratePercentage: number
  criteria: "transfer_amount" | "number_of_sweeps" | "volume_threshold"
  minFee?: number
  maxFee?: number
  feePerOperation?: number
  minAmount?: number
  maxAmount?: number
}
```

### HybridPricingModel
```typescript
interface HybridPricingModel {
  type: "hybrid"
  fixedPart: {
    amount: number
    currency: string
    billingCycle: "monthly" | "quarterly" | "yearly"
  }
  variablePart: {
    ratePercentage: number
    criteria: "transfer_amount" | "number_of_sweeps" | "volume_threshold"
    minFee?: number
    maxFee?: number
    feePerOperation?: number
  }
}
```

---

## Flow Utilisateur

### 1. Accès Admin
- Connexion avec compte Admin
- Redirection automatique vers `/admin`
- Affichage du dashboard personnalisé

### 2. Configuration Tarification
1. Cliquer sur "Tarification" dans la sidebar
2. Choisir le type de modèle (Fixe/Variable/Hybride)
3. Les champs se remplissent dynamiquement
4. Configurer les paramètres
5. Voir le résumé automatique
6. Cliquer "Enregistrer la Configuration"
7. Message de succès s'affiche

### 3. Configuration Moteur
1. Dans l'onglet Tarification, sélectionner le moteur
2. **Adria:** Configuration directe des modèles
3. **Externe:** Fournir URL API + Clé
4. Tester la connexion
5. Activer le moteur

### 4. Paramètres Banque
1. Cliquer sur "Paramètres" dans la sidebar
2. Modifier les informations générales
3. Sauvegarder les changements

---

## Sécurité

### Access Control
- URL-level: Redirection si non-Admin
- Role verification: Vérification du rôle à chaque accès
- Session-based: Authentication via sessionStorage

### Données Sensibles
- Clé API: Stockée de manière sécurisée
- HTTPS: Recommandé en production
- Validation: Tous les inputs validés

### Restriction Processus Cash Pooling
- ZÉRO lien vers processus Cash Pooling
- Pas d'imports vers composants Cash Pooling
- Admin ne voit QUE tarification + paramètres

---

## Design Decisions

### Layout
- **Sidebar + Main Content** - Séparation claire
- **Flexbox primary** - Layout responsive
- **Light theme** - Blanc avec accents bleus
- **Mobile optimized** - Sidebar collapsible

### Color Scheme
- Primary: Bleu (#0B5FFF / #2563EB)
- Success: Vert (#22C55E)
- Warning: Jaune (#EAB308)
- Error: Rouge (#EF4444)
- Neutral: Slate 100-900

### Typography
- Sans-serif: Inter/Geist
- Sizes: 12px (xs) à 32px (2xl)
- Weights: 400-700 (medium to bold)

---

## Features Bonus

### Dynamic Fields
Les champs changent automatiquement selon le type sélectionné:
```
Fixe:      Amount, Currency, BillingCycle
Variable:  Rate, Criteria, MinFee, MaxFee, FeePerOp
Hybride:   Combinaison des deux
```

### Auto-Summary
Chaque modèle affiche un résumé en temps réel:
- Montant et devise
- Conditions et critères
- Frais min/max

### Toggle Group
Sélection visuelle claire avec checkmarks verts

### Tabs for Hybrid
Configuration séparée pour partie fixe et variable

---

## Intégration Future

### Database
- Stocker les configurations en base de données
- Historique des changements
- Audit trail

### API
- Endpoints pour CRUD tarification
- Validation backend
- Rate limiting

### Notifications
- Webhook sur changements tarification
- Email notifications
- Logs en temps réel

---

## Troubleshooting

### Admin ne voit pas les composants
- Vérifier le rôle dans sessionStorage
- Recharger la page
- Vérifier la route `/admin`

### Les champs ne changent pas
- Vérifier la sélection du type
- Rafraîchir la page
- Vérifier la console pour erreurs

### Clé API non acceptée
- Vérifier le format
- Tester l'URL endpoint
- Vérifier la documentation de l'API

---

## Checklist Déploiement

- [ ] Types TypeScript compilent sans erreur
- [ ] Admin page accessible via `/admin`
- [ ] Non-Admin redirigé vers `/dashboard`
- [ ] Sidebar navigation fonctionne
- [ ] Tarification dynamique change les champs
- [ ] Résumés s'affichent correctement
- [ ] Messages de succès apparaissent
- [ ] Moteur Adria/Externe switchable
- [ ] CSS responsive sur mobile
- [ ] Pas de console errors

---

## Support

Pour toute question ou problème:
1. Vérifier cette documentation
2. Consulter les commentaires de code
3. Vérifier la console du navigateur
4. Contacter Adria Business & Technology
