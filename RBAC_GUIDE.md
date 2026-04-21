# Guide du Contrôle d'Accès Basé sur les Rôles (RBAC)

## Vue d'ensemble

L'application implémente un système de contrôle d'accès basé sur les rôles (RBAC) avec trois rôles distincts :

### 1. Chargé de clientèle (Account Manager)
- **Accès complet** à toutes les interfaces habituelles
- **Pas d'accès** à la section "Tarification" 
- **Permissions** : Gérer les contrats, consulter les conventions, gérer les amendements
- **Restriction** : La tarification doit être gérée uniquement par l'Admin

### 2. Admin
- **Accès complet** à toutes les fonctionnalités
- **Gestion de la tarification** incluse
- **Permissions** : Tous les paramètres, tous les contrats, tarification
- **Responsabilité** : Configuration complète du système

### 3. Client
- **Accès restreint** à ses propres informations
- **Consultation seule** de ses contrats et informations de compte
- **Permissions** : Voir ses données, consulter ses contrats
- **Restriction** : Pas de modification ni de gestion

## Implémentation Technique

### Fichiers modifiés

#### 1. `lib/types.ts`
Ajout de nouveaux types :
```typescript
export type UserRole = "Chargé de clientèle" | "Admin" | "Client"

export interface User {
  email: string
  name: string
  role: UserRole
  password?: string
}
```

#### 2. `lib/rbac.ts` (Nouveau)
Fichier centralisé pour la gestion des permissions :
- `hasPermission(role, permission)` : Vérifier une permission spécifique
- `canAccessPricing(role)` : Vérifier l'accès à la tarification
- `canManagePricing(role)` : Vérifier la gestion de la tarification
- `getRoleDescription(role)` : Obtenir la description du rôle

#### 3. `lib/mock-data.ts`
Mise à jour des utilisateurs de test :
```typescript
export const mockUsers = [
  {
    email: "charge@banque.fr",
    password: "123456",
    name: "Mouad Laadidioui",
    role: "Chargé de clientèle",
  },
  {
    email: "admin@banque.fr",
    password: "123456",
    name: "Admin User",
    role: "Admin",
  },
  {
    email: "client@banque.fr",
    password: "123456",
    name: "Client User",
    role: "Client",
  },
]
```

#### 4. `app/login/page.tsx`
- Support de plusieurs utilisateurs
- Affichage de tous les comptes de test disponibles
- Authentification basée sur le rôle

#### 5. `components/unified-subscription-flow.tsx`
Conditionnalité de l'étape "Tarification" :
- L'étape "Tarification" est **masquée** pour le rôle "Chargé de clientèle"
- L'étape "Tarification" est **visible** pour l'Admin
- Le Client n'a pas accès à ce flux

#### 6. `app/dashboard/page.tsx`
- Affichage du badge de rôle
- Description du rôle sous le nom de l'utilisateur
- Alerte informative pour les "Chargés de clientèle" indiquant qu'ils n'ont pas accès à la tarification

## Comptes de Test

### Chargé de clientèle
- **Email** : charge@banque.fr
- **Mot de passe** : 123456
- **Accès** : Tous les contrats SAUF la tarification

### Admin
- **Email** : admin@banque.fr
- **Mot de passe** : 123456
- **Accès** : Tous les paramètres incluant la tarification

### Client
- **Email** : client@banque.fr
- **Mot de passe** : 123456
- **Accès** : Données personnelles et contrats uniquement

## Flux de l'Application

### Pour Chargé de clientèle
```
Login
  ↓
Dashboard (avec alerte RBAC)
  ↓
Sélection → Structuration → Validation → Contrat
(Tarification est MASQUÉE)
```

### Pour Admin
```
Login
  ↓
Dashboard (accès complet)
  ↓
Sélection → Structuration → Tarification → Validation → Contrat
(Tarification est VISIBLE)
```

### Pour Client
```
Login
  ↓
Dashboard (accès limité)
  ↓
Affichage de ses propres données uniquement
```

## Ajouter une Nouvelle Permission

1. Ajouter le type de permission dans `lib/rbac.ts` :
```typescript
export type Permission = 
  | "view_pricing"
  | "manage_pricing"
  | "YOUR_NEW_PERMISSION"  // Ajouter ici
```

2. Ajouter la permission aux rôles appropriés :
```typescript
const rolePermissions: Record<UserRole, Permission[]> = {
  "Chargé de clientèle": [
    // ... permissions existantes
    // "YOUR_NEW_PERMISSION" // Ajouter si nécessaire
  ],
  // ...
}
```

3. Créer une fonction helper :
```typescript
export function canDoSomething(role: UserRole): boolean {
  return hasPermission(role, "YOUR_NEW_PERMISSION")
}
```

4. Utiliser dans les composants :
```typescript
import { canDoSomething } from "@/lib/rbac"

if (canDoSomething(user?.role)) {
  // Afficher le contenu
}
```

## Sécurité

⚠️ **Note importante** : Cette implémentation utilise `sessionStorage` pour le stockage côté client. 
Pour une application en production :
- Implémenter une authentification serveur
- Utiliser des tokens JWT ou des sessions sécurisées
- Valider les permissions côté serveur
- Ne jamais faire confiance aux permissions côté client seul

## Avenir

### Améliorations possibles
1. Support de rôles personnalisés
2. Permissions granulaires par contrat
3. Gestion des délégations de rôles
4. Audit des actions par rôle
5. Intégration LDAP/Active Directory
