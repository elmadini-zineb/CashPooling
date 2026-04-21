# Section Tarification dans le Contrat

## Objectif

Intégrer automatiquement la tarification appliquée dans le contrat généré, avec affichage dynamique selon la configuration Admin (Adria vs Externe).

## Implémentation

### Composant: `contract-pricing-section.tsx`

Affiche une section "Tarification appliquée" basée sur la configuration:

**Cas 1: Tarification Adria**
- Tableau avec colonnes: Type, Description, Montant
- Lignes:
  - Abonnement fixe
  - Tarification par comptes (barèmes)
  - Tarification par opération (virements)
  - Tarification par mode de nivellement (ZBA/TBA/FBA)
  - **TOTAL MENSUEL**
- Couleurs CIH: En-tête orange (#FF6B35), alternance orange/blanc

**Cas 2: Tarification externe**
- Tableau simplifié
- Indication: "Tarification personnalisée - [Fournisseur externe]"
- Description claire pour utilisateur métier

**Cas 3: Aucune tarification**
- Message informatif simple

### Intégration dans `business-online-contract-form.tsx`

```tsx
<ContractPricingSection 
  pricingConfig={contract.pricingConfig}
  adriaPricing={mockAdriaData}
  currency={contract.currency}
  formatAmount={formatAmount}
/>
```

**Props:**
- `pricingConfig`: Configuration tarifaire (sourceType, provider...)
- `adriaPricing`: Données Adria modulaire (basePricing, operationPricings, levelingModePricings)
- `currency`: Devise pour formatage
- `formatAmount`: Fonction de formatage avec espaces de milliers

## Design

### Tableaux
- En-têtes: `bg-orange-600 text-white`
- Lignes alternées: `bg-orange-50` / `bg-white`
- Bordures: `border-slate-300`
- Police: 12px (xs)

### Format Montants
- Français: `50 000,00 EUR`
- Via `toLocaleString("fr-FR")`

## Flux Utilisateur

1. **Admin configure tarification** → Choisit Adria ou Externe
2. **Chargé de clientèle génère contrat** → Tarification auto affichée
3. **Client visualise contrat** → Voit la tarification appliquée

## Calculs Automatiques (Adria)

- **Abonnement fixe**: `basePricing.fixedFee`
- **Par comptes**: `basePricing.accountCountBrackets[0].feePerAccount * 5`
- **Opérations**: `operationPricings.virement.value * 10` (estimé 10/mois)
- **Mode**: `levelingModePricings.ZBA.value`
- **TOTAL**: Somme des 4 lignes

## Note Important

Les montants affichés pour Adria sont **estimatifs**:
- Basé sur 5 comptes secondaires
- 10 virements/mois
- Mode ZBA par défaut

Message affiché: "Les montants affichés sont estimatifs basés sur une utilisation standard."

## Statut

✅ Production Ready
- Component créé et intégré
- Design cohérent CIH Bank
- Flux complet fonctionnel
- Documentation complète
