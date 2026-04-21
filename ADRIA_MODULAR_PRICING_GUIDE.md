# Tarification Adria Modulaire - Guide Complet

## 📋 Vue d'ensemble

La tarification Adria a été refactorisée pour être **modulaire, flexible et scalable**. Elle est basée sur **3 couches indépendantes** qui peuvent être configurées séparément.

## 🏗️ Architecture à 3 Couches

### 1️⃣ Tarification de Base
Configuration fondamentale du service Cash Pooling.

**Éléments:**
- **Abonnement fixe**: Montant récurrent indépendant des opérations
  - Montant configuré (ex: 500 MAD)
  - Fréquence: Mensuel, Trimestriel ou Annuel
  
- **Barèmes par nombre de comptes**: Tarif dégressif
  - Min/Max comptes avec frais par compte
  - Exemple:
    - 1-5 comptes: 50 MAD/compte
    - 6-20 comptes: 35 MAD/compte
    - 21+ comptes: 20 MAD/compte

**Avantages:**
- Dégressive par palier
- Scalable avec croissance client
- Configuration simple

### 2️⃣ Tarification par Opération
Frais spécifiques pour chaque type d'opération.

**Types d'opération:**
- **Virement**: Transfert de fonds entre comptes
- **Sweep**: Nettoyage automatique des comptes
- **Autre**: Autres opérations bancaires

**Configuration par opération:**
```
Type: Virement
Tarif: Pourcentage
Min/Max montant: 0 / Illimité
Valeur: 0.5%
Statut: Actif
```

**Flexibilité:**
- Tarif fixe ou variable (%)
- Seuils min/max montants
- Activation/désactivation par opération

### 3️⃣ Tarification par Mode de Nivellement
Frais additionnels selon le mode de nivellement choisi.

**Modes supportés:**
- **ZBA** (Zero Balance Account): Solde zéro quotidien → Frais: 200 MAD/mois (fixe)
- **TBA** (Target Balance Account): Solde cible → Frais: 0.3% (variable)
- **FBA** (Full Balance Account): Solde complet → Frais: 0.15% (variable)

**Caractéristiques:**
- Type fixe ou pourcentage
- Activation/désactivation par mode
- Description optionnelle

## 🎯 Principes de Conception

### ✅ Modulaire
Chaque couche est **indépendante** et configurable séparément.
- Base ≠ Opération ≠ Nivellement

### ✅ Pas de Logique Combinatoire
**Aucun calcul basé sur des cas/combinaisons** (ex: ZBA + TBA + FBA).
- Chaque couche s'ajoute simplement
- Logique additive: Base + Opération + Nivellement

### ✅ Scalable
Ajouter/retirer des éléments sans impacter le reste:
- Ajouter un nouveau barème
- Ajouter une opération
- Modifier un mode

### ✅ Flexible
- Activation/désactivation rapide
- Modification en temps réel
- Historique (créatedAt/updatedAt)

## 💾 Structure TypeScript

```typescript
interface AdriaModularPricing {
  id: string
  currency: string
  basePricing: BasePricing
  operationPricings: OperationPricing[]
  levelingModePricings: LevelingModePricing[]
  createdAt: Date
  updatedAt: Date
}
```

## 🖥️ Interface Utilisateur

### Tabs Séparés
- **Tarification de base**: Abonnement + Barèmes
- **Opérations**: Virements, Sweeps, Autres
- **Modes de nivellement**: ZBA, TBA, FBA

### Caractéristiques
- ✅ Tables dynamiques avec ajout/suppression
- ✅ Switches pour activation/désactivation
- ✅ Résumé automatique de configuration
- ✅ Bouton d'enregistrement centralisé

## 📊 Calcul des Frais (Exemple)

Pour un client avec:
- 10 comptes
- 5 virements de 100 000 MAD chacun
- Mode ZBA

**Calcul:**
```
1. Tarification de base:
   - Abonnement: 500 MAD
   - Barème (6-20 comptes): 10 × 35 = 350 MAD
   Sous-total: 850 MAD

2. Opération (Virement):
   - 5 virements × 0.5% × 100 000
   = 5 × 500 = 2 500 MAD

3. Mode de nivellement (ZBA):
   - 200 MAD (fixe)

TOTAL MENSUEL: 850 + 2 500 + 200 = 3 550 MAD
```

## 🔄 Utilisation en Admin

1. **Accéder** à Admin > Tarification
2. **Sélectionner** "Tarification Adria Modulaire"
3. **Configurer** les 3 couches:
   - Base: Abonnement + Barèmes
   - Opérations: Frais par type
   - Nivellement: Frais additionnels
4. **Ajouter/retirer** lignes avec +/Poubelle
5. **Activer/désactiver** avec les switches
6. **Enregistrer** avec le bouton final

## 🚀 Avantages pour Adria

1. **Transparence**: 3 sections claires et séparées
2. **Flexibilité**: Modification rapide sans code
3. **Scalabilité**: Ajouter nouvelles lignes facilement
4. **Modularité**: Chaque couche indépendante
5. **Maintenance**: Logique simple et compréhensible

## 📝 Notes Importantes

- Les montants sont formatés avec séparateur français (50 000,00)
- La devise est unique pour toute la configuration
- L'activation/désactivation est instantanée (switch)
- Chaque ligne a un ID unique pour tracking
- Les valeurs sont sauvegardées en base de données

## 🔧 API d'Utilisation

Pour récupérer les frais applicables:

```typescript
function calculateAdriaFees(
  config: AdriaModularPricing,
  numAccounts: number,
  operations: Operation[],
  levelingMode: 'ZBA' | 'TBA' | 'FBA'
): PricingResult {
  // Couche 1: Base
  const baseFee = config.basePricing.fixedFee
  const accountFee = getAccountBracketFee(config, numAccounts)
  
  // Couche 2: Opérations
  const operationFees = operations
    .map(op => calculateOperationFee(config, op))
    .reduce((a, b) => a + b, 0)
  
  // Couche 3: Nivellement
  const levelingFee = calculateLevelingFee(config, levelingMode)
  
  return {
    base: baseFee + accountFee,
    operations: operationFees,
    leveling: levelingFee,
    total: baseFee + accountFee + operationFees + levelingFee
  }
}
```

---

**Dernier mise à jour**: Mars 2026
**Version**: 2.0 (Modulaire)
