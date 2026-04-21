# Guide d'Intégration - Moteur de Tarification Personnalisé

## Vue d'ensemble

L'interface "Intégration du moteur de tarification" permet à la banque Admin d'intégrer sa propre logique de calcul de tarification pour le service Cash Pooling via trois modes distincts: **API**, **Fichier**, et **Manuel**.

## Architecture

### Composants Créés

1. **`custom-pricing-integration.tsx`** (154 lignes) - Composant parent qui gère les 3 modes
2. **`pricing-integration-api.tsx`** (201 lignes) - Mode API avec test connexion
3. **`pricing-integration-file.tsx`** (224 lignes) - Mode Fichier avec upload et aperçu
4. **`pricing-integration-manual.tsx`** (330 lignes) - Mode Manuel avec formulaires

### État Global

Chaque mode d'intégration rapporte à un état central qui maintient:
- Mode actif (API/Fichier/Manuel)
- Statut (non_configurée/configurée/erreur)
- Date de dernière mise à jour
- Résumé de configuration
- Messages de succès/erreur

---

## Mode 1: Intégration API

### Utilisation

Connectez votre moteur de tarification via une API REST.

### Fonctionnalités

- **Configuration**:
  - URL de l'API (endpoint complet)
  - Méthode HTTP (GET ou POST)
  - Headers JSON (Authorization, clés API, etc.)

- **Test de connexion**:
  - Bouton "Tester la connexion"
  - Affiche la réponse API complète
  - Valide la structure JSON

- **Feedback UX**:
  - Loader pendant le test
  - Message d'erreur détaillé en cas d'échec
  - Badge "Succès" en vert si OK
  - Affichage réponse formatée

### Format API Attendu

```json
{
  "pricing": {
    "type": "variable",
    "rate": 0.5,
    "minFee": 100,
    "maxFee": 5000
  }
}
```

### Exemple d'Utilisation

```
URL: https://api.example.com/v1/pricing
Méthode: POST
Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs...",
  "Content-Type": "application/json"
}
```

---

## Mode 2: Intégration Fichier

### Utilisation

Importez votre tarification via fichier JSON ou CSV.

### Fonctionnalités

- **Upload**:
  - Glisser-déposer ou cliquer pour sélectionner
  - Support JSON et CSV
  - Limite 5MB

- **Validation**:
  - Parse JSON/CSV
  - Affichage d'erreurs claires
  - Badge "Valide" en vert si OK

- **Aperçu**:
  - Affiche les premières lignes
  - Scrollable si contenu long
  - Format pretty-print JSON

### Format Fichier

**JSON:**
```json
{
  "pricing": [
    {
      "id": "fixed-100",
      "type": "fixed",
      "amount": 1000,
      "currency": "MAD",
      "billing": "monthly"
    }
  ]
}
```

**CSV:**
```csv
type,rate,minFee,maxFee,currency
variable,0.5,100,5000,MAD
fixed,0,1000,1000,MAD
```

### Limite de Fichier

- Taille maximale: 5MB
- Formats: JSON, CSV
- Encodage: UTF-8

---

## Mode 3: Intégration Manuel

### Utilisation

Configurez la tarification directement via formulaire.

### Fonctionnalités

- **Type de tarification**:
  - Radio buttons: Fixe ou Variable
  - Interface dynamique selon sélection

- **Tarification Fixe**:
  - Montant (nombre)
  - Fréquence (Mensuel/Trimestriel/Annuel)
  - Résumé automatique

- **Tarification Variable**:
  - Taux de base (%)
  - Frais minimum et maximum
  - Seuils variables (CRUD):
    - Min/Max montant (MAD)
    - Taux applicable (%)
    - Ajouter/Supprimer lignes
  - Affichage scrollable si > 3 seuils

### Exemple de Configuration

**Fixe:**
```
Montant: 1 000 MAD
Fréquence: Mensuel
Résumé: 1 000,00 MAD / mois
```

**Variable:**
```
Taux base: 0.5%
Frais min: 100 MAD
Frais max: 5 000 MAD
Seuils:
  0 - 1 000 000: 0.5%
  1 000 001 - 5 000 000: 0.35%
  5 000 001+: 0.25%
```

---

## Gestion d'État

### Configuration Actuelle (affichée après succès)

- Mode d'intégration (API/Fichier/Manuel)
- Statut (Configurée ou Erreur)
- Date/heure de dernière mise à jour
- Résumé de configuration

### Messages de Feedback

**Succès** (vert):
- "Intégration API configurée avec succès"
- "Intégration Fichier configurée avec succès"
- "Intégration Manuelle configurée avec succès"

**Erreur** (rouge):
- Messages détaillés d'erreur API
- Erreurs de parsing fichier
- Validation manuelle échouée

---

## UX/UI Design

### Layout

- **Alert informatif** en haut (bleu)
- **Tabs** pour sélection mode (Zap/Upload/Settings icons)
- **Cards** pour chaque section
- **Résumé** dans cards gris pâle

### Couleurs

- Primaire: Bleu #003087 (CIH Bank)
- Succès: Vert #059669
- Erreur: Rouge #DC2626
- Fond: Blanc/Gris pâle

### Responsive

- Grid 2-3 colonnes selon espace
- Inputs full-width sur mobile
- Scrollable pour contenu long

---

## Intégration dans Admin

Le composant `CustomPricingConfig` a été refactorisé pour utiliser `CustomPricingIntegration`.

### Import

```tsx
import { CustomPricingConfig } from "@/components/admin/custom-pricing-config"
```

### Utilisation

```tsx
<CustomPricingConfig onSave={() => {
  // Callback optionnel après sauvegarde
}} />
```

---

## Prochaines Étapes

1. **Persistance**: Enregistrer en base de données
2. **Validation**: Ajouter schémas Zod pour validation
3. **Retry Logic**: Gérer les erreurs API avec retry automatique
4. **Webhooks**: Support webhooks pour recharger tarifs
5. **Historique**: Logger tous les changements de tarification

---

## Support

Pour toute question sur l'intégration, consultez:
- Endpoint API attendu
- Format fichier exact
- Seuils de tarification applicables
