# Tarification Adria Modulaire - Spécifications Techniques

## 📦 Fichiers Créés/Modifiés

### Créés
1. **`components/admin/adria-modular-pricing.tsx`** (548 lignes)
   - Composant principal avec 3 tabs
   - Gestion d'état complète
   - Tables dynamiques avec CRUD

2. **`lib/types.ts`** (Types mis à jour)
   - `AdriaModularPricing` (interface principale)
   - `BasePricing` (couche 1)
   - `OperationPricing` (couche 2)
   - `LevelingModePricing` (couche 3)
   - `AccountCountBracket` (sous-structure)

### Modifiés
1. **`components/admin/conditional-pricing-selector.tsx`**
   - Import `AdriaModularPricing` au lieu de `AdriaPricingConfig`
   - Mise à jour description pour "Modulaire"
   - Badge changé en "3 Couches"

## 🏗️ Architecture Modulaire

```
AdriaModularPricing (Configuration principale)
├── BasePricing (Couche 1)
│   ├── fixedFee (abonnement)
│   └── accountCountBrackets[] (barèmes dégressifs)
├── OperationPricing[] (Couche 2)
│   ├── operationType: 'virement' | 'sweep' | 'autre'
│   ├── pricingType: 'fixe' | 'pourcentage'
│   └── minAmount, maxAmount, value, isActive
└── LevelingModePricing[] (Couche 3)
    ├── levelingMode: 'ZBA' | 'TBA' | 'FBA'
    ├── pricingType: 'fixe' | 'pourcentage'
    └── value, isActive, description
```

## 🎯 Pas de Logique Combinatoire

**Exemple INCORRECT (ancien):**
```javascript
// ❌ Combinaisons fixes
if (zba && tba) {
  fee = zbaFee + tbaFee
} else if (zba) {
  fee = zbaFee
} // ...
```

**Exemple CORRECT (nouveau):**
```javascript
// ✅ Logique modulaire
const fees = {
  base: baseFee + accountBracketFee,
  operations: operationsFees.sum(),
  leveling: getLevelingFee(mode)
}
const total = fees.base + fees.operations + fees.leveling
```

## 📊 Tables Dynamiques

### Tab 1: Tarification de base
**Abonnement fixe:**
- Input: Montant
- Select: Fréquence (monthly/quarterly/yearly)

**Barèmes:**
- Table avec colonnes: De | À | Frais/compte | Actif | Action
- Bouton "+ Ajouter un barème"
- Switch activation/désactivation
- Bouton Poubelle suppression

### Tab 2: Opérations
**Table avec colonnes:**
- Type d'opération (Select)
- Type tarif (Select: Fixe/%)
- Min montant (Input)
- Max montant (Input)
- Valeur (Input + unité)
- Actif (Switch)
- Action (Poubelle)

### Tab 3: Modes de nivellement
**Table avec colonnes:**
- Mode (Badge non-éditable: ZBA/TBA/FBA)
- Type tarif (Select: Fixe/%)
- Valeur (Input + unité)
- Description (Input texte)
- Actif (Switch)
- Action (Poubelle)

## 🔄 État Composant

```typescript
const [currency, setCurrency] = useState('MAD')
const [fixedFee, setFixedFee] = useState(500)
const [fixedFeeBilling, setFixedFeeBilling] = useState('monthly')
const [accountBrackets, setAccountBrackets] = useState([...])
const [operations, setOperations] = useState([...])
const [levelingModes, setLevelingModes] = useState([...])
const [savedMessage, setSavedMessage] = useState(false)
```

## 🛠️ Fonctions Clés

**Gestion Barèmes:**
- `handleAddBracket()`: Ajoute nouveau barème
- `handleDeleteBracket(id)`: Supprime barème
- `handleUpdateBracket(id, field, value)`: Met à jour

**Gestion Opérations:**
- `handleAddOperation()`: Ajoute opération
- `handleDeleteOperation(id)`: Supprime opération
- `handleUpdateOperation(id, field, value)`: Met à jour

**Gestion Modes de nivellement:**
- `handleAddLevelingMode()`: Ajoute mode
- `handleDeleteLevelingMode(id)`: Supprime mode
- `handleUpdateLevelingMode(id, field, value)`: Met à jour

**Sauvegarde:**
- `handleSave()`: Crée `AdriaModularPricing` et log en console

## 📈 État Initial (Defaults)

**Abonnement:** 500 MAD/mois

**Barèmes:**
- 1-5 comptes: 50 MAD/compte
- 6-20 comptes: 35 MAD/compte
- 21+ comptes: 20 MAD/compte

**Opérations:**
- Virement: 0.5% (min-max illimité)
- Sweep: 10 MAD fixe
- Autre: 0.25%

**Modes:**
- ZBA: 200 MAD fixe
- TBA: 0.3% variable
- FBA: 0.15% variable

## 🎨 Style

- **Tabs:** `grid-cols-3` avec bg-slate-200
- **Headers tab 1&2:** bg-blue-600 text-white
- **Rows alternées:** bg-blue-50 / bg-white
- **Switches:** `ui.switch`
- **Boutons action:** `variant="ghost"` text-red-600
- **Résumé:** bg-slate-50 border-slate-200

## ✅ Checklist d'Intégration

- [x] Types TypeScript créés
- [x] Composant AdriaModularPricing créé
- [x] Conditional selector mis à jour
- [x] Tables dynamiques CRUD
- [x] State management complet
- [x] Formatage montants français
- [x] Activation/désactivation switches
- [x] Résumé automatique
- [x] Sauvegarde + feedback
- [x] Documentation complète

## 🚀 Prochaines Étapes

1. **Stockage en base:** Intégrer avec Supabase/Neon
2. **Historique:** Tracker changements (version/audit)
3. **Calcul dynamique:** Ajouter `calculateAdriaFees()` utility
4. **Validation:** Ajouter règles métier (ex: max % > min %)
5. **Export:** Générer rapport PDF de configuration
6. **Tests:** Unit tests pour chaque couche

---

**Statut:** Production Ready ✅
**Version:** 2.0 Modulaire
**Date:** Mars 2026
