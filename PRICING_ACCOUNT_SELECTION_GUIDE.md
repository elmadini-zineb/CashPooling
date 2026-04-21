# Guide Sélection du Compte de Tarification

## Vue d'ensemble

La fonctionnalité de sélection du compte de tarification (compte de facturation) permet aux Chargés de clientèle de définir le compte qui sera utilisé pour facturer les frais du service Cash Pooling.

## Emplacement

La sélection du compte de tarification se trouve dans l'**Étape 2: Structuration** du flux de souscription unifié, dans un nouvel onglet dédié **"Tarification"**.

## Composants Implémentés

### 1. **PricingAccountSelector** (`components/pricing-account-selector.tsx`)
Composant réutilisable pour la sélection du compte de tarification.

**Fonctionnalités:**
- Affichage des comptes disponibles (centralisateur + secondaires)
- Sélection via boutons radio
- Badge de statut "Défini" quand un compte est sélectionné
- Validation automatique que le compte fait partie de la sélection
- Par défaut: compte centralisateur sélectionné automatiquement
- Résumé du compte sélectionné avec tous les détails

### 2. **StepStructure** (`components/steps/step-structure.tsx`)
Modificat ions pour intégrer la sélection du compte de tarification.

**Changements:**
- Ajout d'un nouvel onglet "Tarification" (icône dollar)
- Passage du `pricingAccountId` dans le callback `onComplete`
- Validation obligatoire du compte de tarification avant de continuer

### 3. **UnifiedSubscriptionFlow** (`components/unified-subscription-flow.tsx`)
Gestion du flux avec le compte de tarification.

**Changements:**
- Ajout du state `pricingAccountId`
- Passage du `pricingAccountId` initial à StepStructure
- Sauvegarde du `pricingAccountId` dans le contrat généré
- Réinitialisation lors du reset du flux

### 4. **CashPoolingContract** (`lib/types.ts`)
Ajout du champ `pricingAccountId` à l'interface.

```typescript
export interface CashPoolingContract {
  // ... autres champs
  pricingAccountId?: string // ID du compte de tarification (compte de facturation)
}
```

## Flux Utilisateur

1. **Sélection** (Étape 1): L'utilisateur sélectionne le compte centralisateur
2. **Structuration** (Étape 2):
   - Tab "Hiérarchie & Nivellement": Configuration de la structure
   - Tab "Tarification": **NOUVEAU** - Sélection du compte de facturation
   - Tab "Placement OPCVM": Configuration des placements
3. **Tarification** (Étape 3): Configuration des modèles de tarification (pour admins)
4. **Validation** (Étape 4): Vérification du contrat
5. **Contrat** (Étape 5): Génération et signature du contrat avec le compte de tarification

## Règles de Sélection

- **Un seul compte autorisé**: Un seul compte de tarification par contrat
- **Sélection obligatoire**: Le compte doit être choisi avant de passer à l'étape suivante
- **Comptes disponibles**: 
  - Le compte centralisateur
  - Les comptes secondaires sélectionnés dans la structuration
- **Par défaut**: Le compte centralisateur est présélectionné automatiquement

## UX/UI

- **Design cohérent**: Couleur bleu pour le compte sélectionné
- **Badge de statut**: Indication visuelle "Défini" quand un compte est sélectionné
- **Résumé**: Affichage des détails du compte sélectionné
- **Validation visuell e**: Border colorée pour le compte sélectionné
- **Messages informatifs**: Alerts pour guider l'utilisateur

## Validation

- **Avant continuer**: Le bouton "Continuer" est désactivé si aucun compte de tarification n'est sélectionné
- **Message d'erreur**: Alert bleue expliquant que le compte doit faire partie de la sélection

## Stockage et Persistence

Le `pricingAccountId` est:
1. Stocké dans le state du flux
2. Passé à StepStructure lors de la reprise du flux
3. Intégré dans l'objet `CashPoolingContract` généré
4. Disponible pour les étapes suivantes et le contrat final

## Utilisation dans le Contrat

Le `pricingAccountId` est maintenant disponible dans le contrat généré et peut être utilisé pour:
- La facturation automatique
- Le suivi des frais
- Les rapports de tarification
- La gestion des factures
