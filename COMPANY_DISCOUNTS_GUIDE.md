# Remises Personnalisées par Entreprise - Guide Complet

## Vue d'Ensemble

La fonctionnalité "Remises personnalisées" permet à la banque d'appliquer des réductions spécifiques à certaines entreprises sans modifier la tarification standard globale.

**Principe clé**: La tarification standard reste intouchée. Les remises sont appliquées uniquement au niveau de chaque entreprise.

## Accès

1. Module Admin → Navigation latérale
2. Cliquer sur "Remises" (icône %)
3. La section "Remises personnalisées" s'affiche

## Sections Principales

### 1. Alerte Informatif
Message bleu expliquant que les remises ne modifient pas la tarification globale.

### 2. Barre de Recherche et Filtres
- **Recherche**: Par référence client (CLI001) ou intitulé (Marjane Holding)
- **Filtres par portée**:
  - Toutes les portées
  - Globale (sur le total)
  - Abonnement fixe
  - Tarification variable
  - Mode de nivellement

### 3. Formulaire d'Ajout de Remise

#### Champs Requis
- **Référence client** (CLI001)
- **Intitulé client** (Marjane Holding)
- **Type de remise**:
  - Pourcentage (%) - Ex: 5%
  - Montant fixe (MAD) - Ex: 500 MAD
- **Valeur** - Montant ou pourcentage
- **Portée de la remise** - Où s'applique la remise
- **Statut** - Actif / Inactif

#### Champs Optionnels
- **Description** - Raison de la remise (client VIP, promo temporaire)
- **Valide à partir du** - Date de début
- **Valide jusqu'au** - Date de fin (pour les promotions)

#### Aperçu du Calcul
Le formulaire affiche en temps réel:
- Tarification standard: 5 000,00 MAD
- Remise appliquée: -X MAD ou -X%
- **Total final**: 4 750,00 MAD (exemple)

### 4. Liste des Remises

Chaque remise affiche:
- **Nom et référence client**
- **Statut**: Actif / Inactif / Expiré
- **Type et valeur**: 5% ou 500 MAD
- **Portée**: Globale, Abonnement fixe, etc.
- **Total final**: Impact financier
- **Description** (si présente)
- **Validité**: Dates de début et fin

#### Actions disponibles
- **Modifier** - Éditer la remise
- **Activer/Désactiver** - Changer le statut
- **Supprimer** - Supprimer définitivement

## Types de Remises

### Pourcentage (%)
- **Exemple**: 5% de réduction
- **Calcul**: 5 000 MAD × (1 - 5%) = 4 750 MAD
- **Usage**: Remises proportionnelles

### Montant Fixe (MAD)
- **Exemple**: 500 MAD de réduction
- **Calcul**: 5 000 MAD - 500 MAD = 4 500 MAD
- **Usage**: Remises forfaitaires ou promotions

## Portées de Remise

### 1. Globale
Réduit le total de tous les frais.

### 2. Abonnement Fixe
S'applique uniquement sur l'abonnement mensuel/trimestriel/annuel.

### 3. Tarification Variable
Affecte uniquement les frais d'opération et de sweep.

### 4. Mode de Nivellement
Cible spécifiquement les frais ZBA, TBA ou FBA.

## Exemple Pratique

### Scénario: Client VIP Marjane Holding

**Configuration**:
- Référence: CLI001
- Intitulé: Marjane Holding
- Type: Pourcentage (%)
- Valeur: 5%
- Portée: Globale
- Valide de: 01/01/2026 à (sans limite)
- Description: Remise client VIP

**Calcul du tarif**:
```
Tarification standard:     5 000,00 MAD
Remise appliquée (-5%):      -250,00 MAD
─────────────────────────────────────
Total final:              4 750,00 MAD
```

### Scénario: Promotion Temporaire Acima Group

**Configuration**:
- Référence: CLI002
- Intitulé: Acima Group
- Type: Montant fixe (MAD)
- Valeur: 500 MAD
- Portée: Tarification variable
- Valide de: 01/01/2026 à 31/01/2026
- Description: Promo janvier - Réduction virements

**Calcul du tarif**:
```
Tarification variable standard:  1 000,00 MAD
Remise appliquée (-500 MAD):       -500,00 MAD
──────────────────────────────────────────────
Tarif variable final:             500,00 MAD
(+ tarifs fixes inchangés)
```

## Bonnes Pratiques

### ✅ À Faire
- **Documenter** chaque remise (description)
- **Dater** les remises temporaires
- **Activer/Désactiver** au lieu de supprimer
- **Vérifier** les dates de validité régulièrement
- **Classer** logiquement par type (VIP, promo, contrat)

### ❌ À Éviter
- Modifier la tarification standard directement
- Laisser des remises sans description
- Oublier de désactiver les promotions expirées
- Appliquer des remises incompatibles entre elles
- Supprimer l'historique de remises

## Historique et Audit

**Chaque modification enregistre**:
- Date et heure du changement
- Valeur précédente et nouvelle
- Admin qui a effectué le changement
- Raison du changement

Accès via: En développement (section historique)

## Limitations et Règles

1. **Une remise par entreprise par portée** - Pour éviter les doubles remises
2. **Validation des dates** - La date fin doit être après la date début
3. **Valeur positive** - La remise ne peut pas dépasser 100%
4. **Tarif minimum** - Le total final ne peut pas être négatif

## Dépannage

### Q: Je ne vois pas une remise après l'ajout
**R**: Vérifiez que le filtre est réglé sur "Toutes les portées"

### Q: Comment désactiver temporairement une remise?
**R**: Utilisez le bouton "Désactiver" au lieu de supprimer

### Q: Puis-je modifier une remise active?
**R**: Oui, cliquez sur "Modifier" et apportez vos changements

### Q: Qu'arrive-t-il aux remises expirées?
**R**: Elles affichent un badge "Expiré" mais restent dans l'historique

## Flux Complet

```
1. Cliquer "Ajouter une remise"
2. Remplir les champs requis
3. Vérifier l'aperçu du calcul
4. Cliquer "Ajouter la remise"
5. La remise apparaît dans la liste
6. (Optionnel) Activer/Désactiver/Modifier au besoin
```

---

**Version**: 1.0 | **Dernière mise à jour**: Mars 2026
