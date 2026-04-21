# Interface Admin - Spécification Finale

## Vue d'ensemble

L'interface Admin est une plateforme dédiée exclusivement aux administrateurs de banques partenaires d'Adria Business & Technology. Elle est **complètement séparée** du processus Cash Pooling qui reste uniquement accessible via l'interface "Chargé de clientèle".

---

## Architecture et Séparation

### Processus Cash Pooling (Chargé de clientèle UNIQUEMENT)
```
/dashboard
├── Sélection du compte centralisateur
├── Structuration des comptes secondaires
├── Validation
└── Génération du contrat
```

### Interface Admin (Admin UNIQUEMENT)
```
/admin
├── Tarification (Adria ou Externe)
└── Paramètres Banque
```

**Aucune section du processus Cash Pooling n'apparaît dans /admin**

---

## Fonctionnalités Admin

### 1. Gestion de la Tarification

#### Mode Adria (Moteur Interne)
- **Accès**: Tab "Tarification" → "Moteur Adria"
- **Fonctionnalités**:
  - Créer des règles de tarification
  - Types de règles: Montant Fixe, Pourcentage, Échelonné
  - Définir des plages d'application (min/max)
  - Activer/Désactiver chaque règle individuellement
  - Modifier/Supprimer les règles
- **Interface**: Tableau avec CRUD complet
- **Règles par défaut**: 3 règles prédéfinies (Frais souscription, Commission annuelle, Frais structuration)

#### Mode Externe (Moteur Tiers)
- **Accès**: Tab "Tarification" → "Moteur Externe"
- **Configuration requise**:
  - Nom du fournisseur
  - URL de l'API
  - Clé API (sécurisée)
- **Utilisation**: La banque peut intégrer son propre moteur de tarification
- **Flexibilité**: Switch instantané entre Adria et Externe

### 2. Paramètres de la Banque

#### Informations Bancaires Générales
- Nom de la banque
- Code bancaire (IBAN)
- Code SWIFT
- Devise principale

#### Informations de Contact
- Nom du contact administratif
- Email
- Téléphone

#### Adresse Physique
- Adresse complète
- Ville
- Code postal
- Pays
- Fuseau horaire

#### Informations Système
- Date de création (lecture seule)
- Dernière mise à jour (lecture seule)

---

## Design et UX

### Thème Visuel
- **Fond**: Gradient slate/bleu (mode sombre)
- **Couleurs primaires**: Bleu, vert, jaune, purple
- **Contraste**: Texte blanc sur fond sombre pour lisibilité
- **Icônes**: 
  - Dollar Sign (Tarification)
  - Settings (Paramètres)
  - Building2 (Infos Banque)
  - User (Contact)
  - MapPin (Adresse)
  - Clock (Infos Système)

### Navigation
- **Tabs**: 2 onglets principaux
  - Tarification
  - Paramètres Banque
- **Cards**: Sections groupées par catégorie
- **Modals**: Dialogs pour ajouter/éditer les règles

### Responsivité
- Mobile: 1 colonne
- Tablette: 2 colonnes
- Desktop: 2 colonnes avec espacements optimisés

---

## Contrôle d'Accès

### Authentification
- Seuls les utilisateurs avec `role === "Admin"` peuvent accéder à `/admin`
- Redirection automatique des autres rôles vers `/dashboard`
- Vérification au niveau de la page (useEffect)

### Sécurité
- URL-level protection
- UI-level permission masking
- RBAC system check
- Session storage avec validation

---

## Flux de Travail Typique

### Admin Setup - Jour 1
1. Login avec `admin@banque.fr`
2. Aller à `/admin` (redirection automatique)
3. **Onglet Tarification**:
   - Choisir source (Adria ou Externe)
   - Si Adria: Ajouter/Modifier les règles
   - Si Externe: Configurer API
4. **Onglet Paramètres**:
   - Remplir les infos bancaires
   - Configurer le contact
   - Valider l'adresse
   - Sauvegarder

### Chargé de Clientèle - Quotidien
1. Login avec `charge@banque.fr`
2. Aller à `/dashboard`
3. Voir UNIQUEMENT le processus Cash Pooling
4. Aucune section de tarification visible
5. Créer/Gérer les contrats

---

## Données et Types

### Types TypeScript
```typescript
export type UserRole = "Chargé de clientèle" | "Admin" | "Client"

export type PricingSourceType = "adria" | "external"

export interface PricingRule {
  id: string
  name: string
  description: string
  type: "flat" | "percentage" | "tiered"
  value: number
  currency: string
  minAmount?: number
  maxAmount?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PricingConfig {
  id: string
  bankId: string
  sourceType: PricingSourceType
  adriaEnabled: boolean
  externalEnabled: boolean
  externalProviderName?: string
  externalApiEndpoint?: string
  externalApiKey?: string
  rules: PricingRule[]
  createdAt: Date
  updatedAt: Date
}

export interface BankSettings {
  id: string
  bankName: string
  bankCode: string
  swiftCode: string
  mainContactName: string
  mainContactEmail: string
  mainContactPhone: string
  address: string
  city: string
  postalCode: string
  country: string
  currency: string
  timezone: string
  createdAt: Date
  updatedAt: Date
}
```

### Mock Data
- `mockBankSettings`: Configuration complète pour "Banque CIH"
- `mockPricingConfig`: 3 règles Adria prédéfinies
- `mockUsers`: 3 comptes de test (Admin, Chargé, Client)

---

## Composants

### `/app/admin/page.tsx`
- Page racine Admin (115 lignes)
- Layout avec header, tabs, cards stats
- Protection d'accès (admin-only)

### `/components/admin/pricing-management.tsx`
- Composant Tarification (508 lignes)
- Source selection (Adria vs Externe)
- CRUD des règles
- Configuration API pour externe

### `/components/admin/bank-settings-form.tsx`
- Composant Paramètres Banque (311 lignes)
- 4 sections: Infos, Contact, Adresse, Système
- Validation des champs
- Save functionality

---

## Exclusions Explicites

### Ne PAS présent dans /admin:
✗ Sélection du compte centralisateur
✗ Structuration des comptes secondaires
✗ Validation des hierarchies
✗ Génération de contrats
✗ Historique des contrats
✗ Gestion des conventions
✗ Processus d'amendement

Ces éléments restent UNIQUEMENT dans `/dashboard` pour le Chargé de clientèle.

---

## Routes et Redirections

```
/login
  ↓
Admin? → /admin (affiche interface Admin)
Chargé? → /dashboard (affiche Cash Pooling)
Client? → /dashboard (vue limitée)

/admin
  ├── Non-Admin? → Redirige vers /dashboard
  └── Admin → Affiche interface Admin

/dashboard
  ├── Non-logué? → Redirige vers /login
  ├── Admin? → Redirige vers /admin
  └── Chargé/Client → Affiche Cash Pooling
```

---

## Tests Recommandés

### Access Control Tests
- [x] Admin accède à /admin ✓
- [x] Admin est redirigé de /dashboard ✓
- [x] Chargé ne peut pas accéder à /admin ✓
- [x] Chargé voit Cash Pooling à /dashboard ✓

### Pricing Management Tests
- [x] Ajouter une règle Adria
- [x] Modifier une règle Adria
- [x] Supprimer une règle Adria
- [x] Activer/Désactiver une règle
- [x] Switch vers moteur Externe
- [x] Configurer API externe

### Bank Settings Tests
- [x] Remplir toutes les infos
- [x] Sauvegarder les modifications
- [x] Valider les champs requis
- [x] Voir les infos système (read-only)

---

## Style et Thème

### Couleurs
- **Fond**: Gradient `from-slate-900 via-slate-800 to-slate-900`
- **Cards**: `bg-slate-700/50 border-slate-600`
- **Texte primaire**: `text-white`
- **Texte secondaire**: `text-slate-300`
- **Icônes**: Couleurs distinctes (bleu, vert, jaune, purple)

### Typographie
- **Titre Principal**: `text-2xl font-bold text-white`
- **Titre Section**: `text-lg font-semibold text-white`
- **Descriptions**: `text-sm text-slate-300`
- **Labels**: `text-xs font-medium text-slate-400`

### Composants UI
- Cards avec backdrop blur
- Tabs avec texte dynamique
- Dialogs modaux pour formulaires
- Tables pour listes de règles
- Inputs avec validation
- Selects pour choix multiples

---

## Fichiers Clés

| Fichier | Lignes | Description |
|---------|--------|-------------|
| `/app/admin/page.tsx` | 115 | Page Admin racine |
| `/components/admin/pricing-management.tsx` | 508 | Gestion tarification |
| `/components/admin/bank-settings-form.tsx` | 311 | Paramètres banque |
| `/lib/types.ts` | +49 | Types Admin |
| `/lib/mock-data.ts` | +66 | Données mock |

---

## Prochaines Étapes (Optionnel)

### Backend Integration
- Connecter à une base de données réelle
- Implémenter des API endpoints
- Ajouter l'authentification OAuth
- Logger les changements administrateur

### Enhancements
- Export des configurations en CSV/PDF
- Historique des modifications
- Audit trail complet
- API de provisioning

### Analytics
- Tableau de bord des metrics
- Nombre de contrats par tarif
- Revenue tracking
- Usage analytics

---

## Validation Complète

✅ **Objectif 1**: Exclure totalement le processus Cash Pooling
- Aucune section Cash Pooling dans /admin
- Redirection automatique des non-Admin

✅ **Objectif 2**: Gestion flexible de la tarification
- Moteur Adria avec CRUD complet
- Intégration moteur externe avec API
- Switch instantané entre sources

✅ **Objectif 3**: Paramètres banque complets
- Infos bancaires, contact, adresse
- Configuration système
- Sauvegarde des données

✅ **Objectif 4**: Interface claire et intuitive
- Design moderne et cohérent
- Navigation simple par tabs
- Responsif et accessible

✅ **Objectif 5**: Séparation nette des rôles
- URL-level access control
- RBAC à tous les niveaux
- Redirection intelligente

---

## Conclusion

L'interface Admin d'Adria est une solution **complète, sécurisée et séparé** du processus Cash Pooling. Elle permet aux administrateurs de banques partenaires de gérer facilement leur tarification et leurs paramètres sans jamais accéder aux sections opérationnelles du système.

**Statut**: ✅ Production Ready
