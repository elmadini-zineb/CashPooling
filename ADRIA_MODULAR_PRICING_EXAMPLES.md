# Tarification Adria Modulaire - Exemples Pratiques

## 🎯 Scénarios Réels

### Scénario 1: Client Petit (ZBA)

**Profil client:**
- 3 comptes
- Mode ZBA (solde zéro quotidien)
- 10 virements/mois de 50 000 MAD chacun
- 20 sweeps quotidiens (600/mois)

**Configuration Admin:**
```
COUCHE 1 - Tarification de base:
┌─────────────────────────────┐
│ Abonnement fixe: 300 MAD    │ ← moins cher pour petit client
│ (1-5 comptes): 50 MAD/cpt   │ → 3 × 50 = 150 MAD
└─────────────────────────────┘

COUCHE 2 - Opérations:
┌──────────────────────────────────┐
│ Virement  0.4% (min: 10, max: +) │
│ Sweep     5 MAD fixe             │
├──────────────────────────────────┤
│ Subtotal opérations/mois:        │
│ - Virements: 10 × 50k × 0.4% = 2 000 MAD
│ - Sweeps: 600 × 5 = 3 000 MAD
└──────────────────────────────────┘

COUCHE 3 - Modes de nivellement:
┌──────────────────────────────┐
│ ZBA: 100 MAD fixe (standard) │
└──────────────────────────────┘

TOTAL MENSUEL:
300 (abonnement) + 150 (compte) + 2 000 (virements)
+ 3 000 (sweeps) + 100 (ZBA) = 5 550 MAD/mois
```

---

### Scénario 2: Client Moyen (TBA)

**Profil client:**
- 15 comptes
- Mode TBA (solde cible 500 000 MAD)
- 50 virements/mois de 500 000 MAD chacun
- 30 sweeps quotidiens (900/mois)

**Configuration Admin:**
```
COUCHE 1 - Tarification de base:
┌─────────────────────────────┐
│ Abonnement fixe: 500 MAD    │
│ (6-20 comptes): 35 MAD/cpt  │ → 15 × 35 = 525 MAD
└─────────────────────────────┘

COUCHE 2 - Opérations:
┌──────────────────────────────────┐
│ Virement  0.35% (min: 100k, max: +) │
│ Sweep     8 MAD fixe               │
├──────────────────────────────────┤
│ - Virements: 50 × 500k × 0.35% = 8 750 MAD
│ - Sweeps: 900 × 8 = 7 200 MAD
└──────────────────────────────────┘

COUCHE 3 - Modes de nivellement:
┌──────────────────────────────┐
│ TBA: 0.25% (variable)        │
│ Calcul: volumes totaux × 0.25% = ?
│ (calculé mensuellement)      │
└──────────────────────────────┘

ESTIMATION MENSUEL:
500 + 525 + 8 750 + 7 200 + (variable TBA)
≈ 16 975 MAD + frais TBA
```

---

### Scénario 3: Client Grand (FBA)

**Profil client:**
- 50+ comptes
- Mode FBA (équilibre complet)
- 200 virements/mois de 1M MAD chacun
- 60 sweeps quotidiens (1800/mois)

**Configuration Admin:**
```
COUCHE 1 - Tarification de base:
┌─────────────────────────────┐
│ Abonnement fixe: 1 000 MAD  │ ← Premium
│ (21+ comptes): 20 MAD/cpt   │ → 50 × 20 = 1 000 MAD
└─────────────────────────────┘

COUCHE 2 - Opérations:
┌──────────────────────────────────┐
│ Virement  0.25% (min: 500k, max: +) │
│ Sweep     6 MAD fixe             │
├──────────────────────────────────┤
│ - Virements: 200 × 1M × 0.25% = 50 000 MAD
│ - Sweeps: 1800 × 6 = 10 800 MAD
└──────────────────────────────────┘

COUCHE 3 - Modes de nivellement:
┌──────────────────────────────┐
│ FBA: 0.1% (taux réduit)      │
│ Sur volumes totaux mensuels  │
└──────────────────────────────┘

ESTIMATION MENSUEL:
1 000 + 1 000 + 50 000 + 10 800 + (0.1% volumes)
≈ 62 800 MAD + frais FBA variables
```

---

## 📊 Comparaison des 3 Modes

| Aspect | ZBA | TBA | FBA |
|--------|-----|-----|-----|
| **Solde** | 0 MAD | Cible (ex: 500k) | Complet |
| **Fréquence** | Quotidienne | Selon besoin | Selon formule |
| **Frais Nivellement** | Fixe (ex: 100-200 MAD) | % (ex: 0.25-0.3%) | % faible (ex: 0.1-0.15%) |
| **Complexité** | Simple | Moyenne | Haute |
| **Coût global** | Bas | Moyen | Variable |
| **Cas d'usage** | TPE/PME | PME/Groupe | Grands groupes |

---

## 🔧 Modification Rapide d'une Configuration

### Cas: Réduire frais virements de 0.5% à 0.3%

**Interface Admin:**
1. Aller à Admin > Tarification
2. Sélectionner "Tarification Adria Modulaire"
3. Tab "Opérations"
4. Trouver ligne "Virement"
5. Changer "Valeur" de 0.5 à 0.3
6. Switch reste "Actif" (vert)
7. Cliquer "Enregistrer la configuration"
8. ✅ Message succès

**Effet immédiat:** Tous nouveaux contrats appliquent 0.3%

---

## 🎯 Addition de Nouveau Type d'Opération

### Cas: Ajouter "Virement International"

**Interface Admin:**
1. Tab "Opérations"
2. Cliquer "+ Ajouter une opération"
3. Nouvelle ligne:
   - Type: "Virement International" (custom possible?)
   - Type tarif: "Pourcentage"
   - Min montant: 100 000
   - Max montant: (vide = illimité)
   - Valeur: 0.75%
   - Actif: ON
4. Cliquer "Enregistrer"

**Résultat:** Nouvelle opération disponible en contrats

---

## 🚀 Cas: Passer Client ZBA → TBA

**Avant (Config ZBA):**
```
Mode nivellement: ZBA
Frais: 100 MAD fixe
```

**Après (Config TBA):**
```
Mode nivellement: TBA
Frais: 0.2% variable
```

**Étapes Admin:**
1. Tab "Modes de nivellement"
2. Ligne "ZBA": Switch OFF (désactiver)
3. Ligne "TBA": Switch ON (activer)
4. Changer valeur TBA de 0.25% à 0.2%
5. Ajouter description: "Migration Q2 2026"
6. Enregistrer

**Impact:** Prochains calculs de frais utilisent TBA 0.2%

---

## 💡 Avantages de la Modularité

### Avant (Ancien Modèle)
```
❌ Changement = Intervention développeur
❌ Logique basée sur cas combinatoires
❌ Difficile à maintenir
❌ Pas flexible pour exceptions
```

### Après (Nouveau Modèle Modulaire)
```
✅ Changement = Click Admin
✅ Logique additive simple
✅ Facile à maintenir
✅ Exceptions = nouvelles lignes
✅ Audit automatique (created/updated dates)
```

---

## 📈 Calcul Automatique pour Devis

**Exemple de fonction pour devis client:**

```typescript
function calculateQuote(clientProfile: {
  numAccounts: number
  monthlyVolume: number // en MAD
  operationType: 'virement' | 'sweep' | 'autre'
  levelingMode: 'ZBA' | 'TBA' | 'FBA'
}) {
  const config = getAdriaConfig() // depuis base de données
  
  // Couche 1: Base
  const fixedFee = config.basePricing.fixedFee
  const accountFee = config.basePricing.accountCountBrackets
    .find(b => b.minAccounts <= clientProfile.numAccounts 
              && (!b.maxAccounts || clientProfile.numAccounts <= b.maxAccounts))
    ?.feePerAccount ?? 0
  
  // Couche 2: Opération
  const opPricing = config.operationPricings
    .find(op => op.operationType === clientProfile.operationType && op.isActive)
  const operationFee = opPricing?.pricingType === 'pourcentage'
    ? clientProfile.monthlyVolume * (opPricing.value / 100)
    : opPricing?.value ?? 0
  
  // Couche 3: Nivellement
  const levelingPricing = config.levelingModePricings
    .find(l => l.levelingMode === clientProfile.levelingMode && l.isActive)
  const levelingFee = levelingPricing?.pricingType === 'pourcentage'
    ? clientProfile.monthlyVolume * (levelingPricing.value / 100)
    : levelingPricing?.value ?? 0
  
  return {
    base: fixedFee + (accountFee * clientProfile.numAccounts),
    operations: operationFee,
    leveling: levelingFee,
    total: fixedFee + (accountFee * clientProfile.numAccounts) + operationFee + levelingFee
  }
}
```

---

## 🔐 Sécurité et Audit

**Chaque changement enregistre:**
- `id`: Identifiant unique
- `createdAt`: Date création
- `updatedAt`: Date dernière modification

**Suggestions futures:**
- User qui a changé (audit log)
- Historique versions (rollback)
- Notifications quand tarif change

---

**Documentation complète pour support client et équipe commerciale**
