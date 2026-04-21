# LIMITES STRICTES DE L'INTERFACE ADMIN
## Définition Formelle du Périmètre

**Document de Référence**: Définit exactement ce qui DOIT et NE DOIT PAS être dans l'Admin

---

## TABLEAU COMPARATIF - ADMIN vs CASH POOLING

### INTERFACE ADMIN (`/admin`)

#### ✅ AUTORISÉ - Tarification
```
Fonctionnalité          │ Status  │ Détail
────────────────────────┼─────────┼──────────────────────
Moteur Adria            │ ✅      │ Tarification standard
Moteur Externe          │ ✅      │ API personnalisée
CRUD Règles Tarif       │ ✅      │ Créer/Lire/Modifier/Supprimer
Types de règles         │ ✅      │ Fixe, Pourcentage, Échelonné
Montants min/max        │ ✅      │ Paramètres rules
Activation/Désactivation│ ✅      │ Basculer règle actif/inactif
Configuration API       │ ✅      │ Endpoint, clé, provider
```

#### ✅ AUTORISÉ - Paramètres Banque
```
Fonctionnalité          │ Status  │ Détail
────────────────────────┼─────────┼──────────────────────
Nom banque              │ ✅      │ Champ texte
Code bancaire           │ ✅      │ Code identifiant
Code SWIFT              │ ✅      │ Code international
Devise                  │ ✅      │ MAD, EUR, USD, GBP
Fuseau horaire          │ ✅      │ Sélection timezone
Contact principal       │ ✅      │ Nom, email, téléphone
Adresse                 │ ✅      │ Rue, ville, code postal
Pays                    │ ✅      │ Champ pays
```

#### ❌ INTERDIT - Processus Cash Pooling

```
Fonctionnalité          │ Status  │ Raison
────────────────────────┼─────────┼──────────────────────
Sélection compte        │ ❌      │ Rôle Chargé UNIQUEMENT
Structuration comptes   │ ❌      │ Rôle Chargé UNIQUEMENT
Hierarchy configuration │ ❌      │ Rôle Chargé UNIQUEMENT
Validation comptes      │ ❌      │ Rôle Chargé UNIQUEMENT
Génération contrat      │ ❌      │ Rôle Chargé UNIQUEMENT
Conventions management  │ ❌      │ Rôle Chargé UNIQUEMENT
Amendments              │ ❌      │ Rôle Chargé UNIQUEMENT
Pooling simulation      │ ❌      │ Rôle Chargé UNIQUEMENT
Investment config       │ ❌      │ Rôle Chargé UNIQUEMENT
Notional pooling        │ ❌      │ Rôle Chargé UNIQUEMENT
Scheduling              │ ❌      │ Rôle Chargé UNIQUEMENT
```

---

### INTERFACE DASHBOARD (`/dashboard` - Chargé de clientèle)

#### ✅ AUTORISÉ - Processus Cash Pooling
```
Fonctionnalité          │ Status  │ Détail
────────────────────────┼─────────┼──────────────────────
Sélection compte        │ ✅      │ Étape 1
Structuration comptes   │ ✅      │ Étape 2
Validation              │ ✅      │ Étape 3
Génération contrat      │ ✅      │ Étape 4
Conventions             │ ✅      │ Gestion complète
Amendments              │ ✅      │ Suivi amendements
Pooling simulation      │ ✅      │ Configuration
Investment config       │ ✅      │ Paramètres investissement
Notional pooling        │ ✅      │ Options pooling
Scheduling              │ ✅      │ Configuration calendrier
```

#### ❌ INTERDIT - Paramètres Admin
```
Fonctionnalité          │ Status  │ Raison
────────────────────────┼─────────┼──────────────────────
Gestion tarification    │ ❌      │ Rôle Admin UNIQUEMENT
Configuration moteur    │ ❌      │ Rôle Admin UNIQUEMENT
Paramètres banque       │ ❌      │ Rôle Admin UNIQUEMENT
Infos contacts bank     │ ❌      │ Rôle Admin UNIQUEMENT
Configuration devise    │ ❌      │ Rôle Admin UNIQUEMENT
```

---

## CHECKLIST D'INTÉGRITÉ

### À Vérifier Régulièrement

```
❌ DOIT ÊTRE ABSENT de /admin:
  □ Composant UnifiedSubscriptionFlow
  □ Tous les step-*.tsx (selection, structure, pricing, validation, contract)
  □ Composant HierarchyBuilder
  □ Composant HierarchyVisualizer
  □ Composant PoolingSimulator
  □ Composant InvestmentConfigPanel
  □ Composant NotionalPoolingConfig
  □ Composant SchedulingConfig
  □ Composant ContractPreview
  □ Composant AmendmentTracking
  □ Composant AmendmentForm
  □ Tout composant du workflow Cash Pooling

✅ DOIT ÊTRE PRÉSENT dans /admin:
  □ PricingManagement component
  □ BankSettingsForm component
  □ Tarification tab actif
  □ Paramètres Banque tab actif
  □ Zéro autre onglets supplémentaires
  □ Protection d'accès Admin role
  □ Redirection non-Admin vers /dashboard
  
✅ DOIT ÊTRE ABSENT de /dashboard (Admin):
  □ Lien vers admin interface
  □ Options d'administration
  □ Configuration tarification
  □ Paramètres système (sauf si Chargé a besoin)
```

---

## RÈGLES DE CONCEPTION

### RÈGLE 1: Aucun Mélange de Responsabilités
```
Admin dashboard DOIT faire:
  ✅ Tarification
  ✅ Paramètres banque

Admin dashboard NE DOIT PAS faire:
  ❌ Créer comptes de pooling
  ❌ Valider hierarchy
  ❌ Générer contrats
  ❌ Gérer conventions
  ❌ Traiter amendments
```

### RÈGLE 2: Séparation Physique du Code
```
Structure OBLIGATOIRE:

/components/admin/
  ├── pricing-management.tsx
  └── bank-settings-form.tsx

/components/steps/ (Zéro accès Admin)
  ├── step-selection.tsx
  ├── step-structure.tsx
  ├── step-pricing.tsx
  ├── step-validation.tsx
  └── step-contract.tsx

/components/ (partagés UI uniquement)
  └── ui/ (Button, Card, Tabs, etc)
```

### RÈGLE 3: Routes Distinctes
```
/admin → Admin UNIQUEMENT
  └─ if (role !== "Admin") → redirect /dashboard

/dashboard → Cash Pooling
  └─ if (role !== "Chargé") → limited view
```

### RÈGLE 4: Zéro Imports Croisés
```
❌ INTERDIT:
  // Dans admin/pricing-management.tsx
  import { HierarchyBuilder } from '@/components/hierarchy-builder'
  
❌ INTERDIT:
  // Dans admin/bank-settings-form.tsx
  import { StepStructure } from '@/components/steps/step-structure'

✅ AUTORISÉ:
  // Dans admin/pricing-management.tsx
  import { Card } from '@/components/ui/card'
  import { mockPricingConfig } from '@/lib/mock-data'
```

### RÈGLE 5: Types Séparés (si pertinent)
```
Recommandé:
  - PricingConfig type ✅
  - BankSettings type ✅
  - HierarchicalAccount type ✅ (mais non importé Admin)
  - Zéro type cross-import problématique
```

---

## IMPACT DES CHANGEMENTS

### Si Admin devait changer:

**Scenario 1: Ajouter onglet Tarification?**
```
✅ ACCEPTABLE
Raison: Reste dans scope Admin
Action: Ajouter tab + composant
```

**Scenario 2: Ajouter "Gestion Conventions"?**
```
❌ INACCEPTABLE
Raison: Viole périmètre Admin
Action: REFUSER, Conventions = Chargé
Remède: Créer onglet séparé dans /dashboard
```

**Scenario 3: Ajouter "Validation Comptes"?**
```
❌ INACCEPTABLE
Raison: Viole périmètre Admin
Action: REFUSER, Validation = Chargé
Remède: Garder dans /dashboard uniquement
```

**Scenario 4: Ajouter "Export Règles Tarif"?**
```
✅ ACCEPTABLE
Raison: Reste admin paramétrage
Action: Ajouter fonction dans PricingManagement
```

---

## VALIDATION DE CONFORMITÉ

### Signature de Conformité

```
Interface Admin DOIT:
  [✅] Afficher UNIQUEMENT Tarification et Paramètres
  [✅] Interdire accès non-Admin
  [✅] Zéro composant Cash Pooling
  [✅] Zéro import processus
  [✅] Zéro affichage workflow

Interface Dashboard DOIT:
  [✅] Afficher UNIQUEMENT Cash Pooling (si Chargé)
  [✅] Interdire tarification sauf Admin
  [✅] Afficher workflow complet
  [✅] Gestion conventions/amendements
```

### Indicateurs Problématiques

```
🚨 RED FLAGS (arrêter, refaire):
  1. "StepSelection" visible dans Admin
  2. "HierarchyBuilder" accessible Admin
  3. "Onglet Processus" dans /admin
  4. Import de components steps dans admin/
  5. "Gestion Conventions" visible Admin
  6. "Génération Contrat" dans Admin interface

✅ GREEN LIGHTS (tout va bien):
  1. /admin affiche UNIQUEMENT 2 tabs
  2. Dashboard affiche steps complets
  3. Zéro mélange UI
  4. Routes distinctes (/admin vs /dashboard)
  5. Redirection automatique par rôle
```

---

## DOCUMENTATION POUR FUTURS DÉVELOPPEURS

### Pour ajouter une fonctionnalité Admin:

```
1. Déterminer si c'est Admin ou Chargé
2. Si Admin:
   - Créer composant dans /components/admin/
   - Ajouter onglet dans /app/admin/page.tsx
   - Utiliser types Admin uniquement
   - Vérifier zéro import Cash Pooling

3. Si Chargé:
   - Créer composant dans /components/ (normal)
   - Ajouter dans /dashboard/page.tsx
   - Zéro accès Admin
```

### Pour ajouter une fonctionnalité Chargé:

```
1. Créer dans /components/steps/ ou pertinent
2. Importer dans UnifiedSubscriptionFlow
3. Ajouter étape dans flow
4. JAMAIS importer dans /components/admin/
5. JAMAIS afficher dans /app/admin/
```

---

## RÉVISIONS DE DOCUMENT

| Version | Date | Changements |
|---------|------|-------------|
| 1.0 | 27-Mar-2026 | Version initiale |
| | | - Scope Admin défini |
| | | - Scope Chargé défini |
| | | - Règles de séparation |
| | | - Checklist conformité |

---

**Status Final**: ✅ DOCUMENT ACTIF ET VALIDÉ  
**Révision Requise**: Si scope Admin change  
**Référence**: Pour tous futurs développements
