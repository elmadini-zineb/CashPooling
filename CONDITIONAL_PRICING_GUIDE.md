# Guide Interface Tarification Conditionnelle - Admin

## Vue d'ensemble

L'interface Admin de tarification offre une sélection conditionnelle entre deux sources de tarification pour le service Cash Pooling.

## Architecture

### Composants

1. **ConditionalPricingSelector** (composant principal)
   - Gère le choix entre Adria ou Personnalisé
   - Affichage dynamique basé sur la sélection
   - Inclut boutons Save et feedback

2. **AdriaPricingConfig** (mode lecture seule)
   - Configuration pré-définie d'Adria
   - Tous les champs disabled
   - Badge "Lecture seule"
   - Support ZBA/TBA/FBA
   - 3 types de tarification (Fixe/Variable/Hybride)

3. **CustomPricingConfig** (mode éditable)
   - Formulaire complet modifiable
   - Support des 3 types de tarification
   - Résumés dynamiques
   - Validation et sauvegarde

## Fonctionnalités

### Option 1: Suivre la tarification standard d'Adria
- Description: "Utilise la tarification pré-configurée d'Adria"
- Badge: "Recommandé" (bleu)
- Icône: Lock (lecture seule)
- Contenu: AdriaPricingConfig en mode readOnly
- Pas de bouton Save (consultation uniquement)

### Option 2: Intégrer votre moteur de tarification
- Description: "Définissez votre propre tarification"
- Badge: "Avancé" (orange)
- Icône: Unlock (éditable)
- Contenu: CustomPricingConfig avec 3 types
- Bouton "Enregistrer la tarification"

## Types de Tarification

### Tarification Fixe
- Montant unique + Fréquence (Mensuel/Trimestriel/Annuel)
- Exemple: 500 MAD/mois

### Tarification Variable
- Taux (%) + Frais min/max + Frais par opération
- Exemple: 0.5% + 50-5000 MAD

### Tarification Hybride
- Partie fixe (montant + fréquence) + Partie variable (taux + frais)
- Exemple: 250 MAD/mois + 0.25% + 25-3000 MAD

## Points de Conformité

✓ Admin gère UNIQUEMENT la tarification et paramètres bancaires
✓ Aucun cycle Cash Pooling (Sélection/Structuration/Validation/Contrat)
✓ Choix initial clair via radio buttons
✓ Affichage conditionnel sans confusion
✓ Résumés visuels des configurations
✓ Style bancaire bleu #003087 + blanc + tables alternées

## Flux Utilisateur

1. Admin accède à l'onglet "Tarification"
2. Sélectionne source de tarification (Adria ou Personnalisée)
3. Si Adria : Consulte tarification pré-remplie (non modifiable)
4. Si Personnalisée : Remplit formulaire avec choix de type
5. Clique "Enregistrer la tarification"
6. Message de succès s'affiche

## Structure des Fichiers

```
components/admin/
  ├── conditional-pricing-selector.tsx  (151 lignes)
  ├── custom-pricing-config.tsx         (324 lignes)
  ├── adria-pricing-config.tsx          (updated avec readOnly prop)

app/admin/
  └── page.tsx                          (updated import)
```

## API & State

### ConditionalPricingSelector
- State: `pricingOption` ("adria" | "custom"), `isSaved`
- Props: none
- Callbacks: `handleSave()` pour feedback

### CustomPricingConfig
- State: `pricingType`, `currency`, tous les montants/taux
- Props: `onSave` (callback)
- Callbacks: Logging des valeurs sauvegardées

### AdriaPricingConfig
- Props: `readOnly` (boolean, default: false)
- Comportement: Si readOnly, tous les champs/sélecteurs sont disabled

## Remarques Importantes

- Le composant Admin n'interfère pas avec le cycle Cash Pooling
- La tarification personnalisée n'est sauvegardée que via le bouton Enregistrer
- Les messages de succès disparaissent automatiquement après 3 secondes
- Le design suit le style bancaire (#003087 bleu, blanc, tables alternées)
