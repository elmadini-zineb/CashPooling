# Refactorisation des Résultats de Recherche - Étape Sélection

## Objectif
Réorganiser l'affichage des résultats de recherche dans l'étape "Sélection du compte centralisateur" pour mettre en avant la **référence client** plutôt que le **numéro de compte**.

## Logique Métier
**Avant:** Compte → Informations client  
**Après:** Client (référence) → Liste de comptes

## Changements Effectués

### 1. Nouveau Composant: `AccountSearchResults`
**Fichier:** `/components/account-search-results.tsx`

Composant dédié à l'affichage des résultats groupés par client.

**Fonctionnalités:**
- Groupe automatique par `clientId` (référence client)
- Affichage hierarchique: Client (card) → Comptes (tableau)
- Radio button pour sélectionner un compte
- Support du collapse/expand par client
- Tableau responsive avec colonnes: Numéro, Type, Solde, Statut, Devise
- Compteur de clients et comptes trouvés

**Props:**
```typescript
{
  results: Account[]              // Résultats de la recherche
  selectedAccountId: string | null // ID du compte sélectionné
  onSelectAccount: (account: Account) => void
  searchTerm: string              // Terme de recherche
  resultCount: number             // Nombre de clients uniques
}
```

### 2. Mise à Jour: `StepSelection`
**Fichier:** `/components/steps/step-selection.tsx`

**Modifications:**
- Import du nouveau composant `AccountSearchResults`
- Remplacement de la logique d'affichage des résultats bruts
- Suppression des variables inutilisées liées aux tooltips individuels
- Simplification du code (moins de 200 lignes économisées)
- Support du multi-recherche: chaque colonne utilise `AccountSearchResults`

**Avant:** 
- Affichage linéaire par compte
- Compte = premier niveau de lecture

**Après:**
- Affichage hiérarchique par client
- Client = premier niveau de lecture
- Comptes du client = second niveau

## Structure d'Affichage

### Pour une recherche unique:
```
┌─────────────────────────────────────┐
│ 2 clients trouvés avec 5 comptes     │
├─────────────────────────────────────┤
│ ▼ Référence: CLIENT-001  [5 comptes] │
│   └─ Raison Sociale Client 1        │
│   ┌─────────────────────────────────┐
│   │ ◯ | N° Compte | Type | Solde... │
│   │ ◯ | N° Compte | Type | Solde... │
│   └─────────────────────────────────┘
│ ▼ Référence: CLIENT-002  [3 comptes] │
│   └─ Raison Sociale Client 2        │
│   ┌─────────────────────────────────┐
│   │ ◯ | N° Compte | Type | Solde... │
│   └─────────────────────────────────┘
└─────────────────────────────────────┘
```

### Pour plusieurs recherches:
Les colonnes affichent les résultats en grid avec même structure par colonne.

## Critères de Recherche
**Inchangés** - La recherche utilise toujours:
- Numéro de compte
- Identifiant client
- Intitulé client

Les critères ne sont pas modifiés, seul l'**affichage** des résultats est reorganisé.

## Étapes d'Utilisation

1. **Rechercher:** Entrer un terme (compte, identifiant ou intitulé)
2. **Voir résultats:** Groupés par référence client
3. **Sélectionner:** Cliquer le radio button d'un compte
4. **Continuer:** Bouton "Continuer vers la structuration"

## Avantages

✅ **Meilleure lisibilité:** Client en évidence  
✅ **Logique métier:** Hiérarchie Client → Comptes  
✅ **UX intuitive:** Expand/collapse par client  
✅ **Informations claires:** Tableau des comptes avec statuts  
✅ **Responsive:** Fonctionne sur mobile/tablet/desktop  
✅ **Performance:** Un seul rendu pour multi-recherche  

## Notes Techniques

- Groupement basé sur `account.clientId` (clé unique)
- Tri alphabétique par clientId
- Tri des comptes conservé par ordre d'apparition
- Radio button gère la sélection simple (un compte = une sélection)
- Compte inactif = désactivé visuellement et en interaction

## Conformité avec les Exigences

✓ Résultats regroupés par référence client  
✓ Référence client = élément principal affiché (titre de la card)  
✓ Comptes affichés sous forme de tableau avec colonnes: Numéro, Type, Solde, Statut  
✓ Sélection avec radio button  
✓ Interface claire et logique métier (Client → Comptes)  
✓ Critères de recherche inchangés  
✓ Affichage principal par référence client (PAS par numéro de compte)  
