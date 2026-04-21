# Guide de Démarrage Rapide - Interface Admin

## 🚀 Accès Rapide

### URL Admin
```
http://localhost:3000/admin
```

### Compte de Test
```
Email:    admin@banque.fr
Password: 123456
```

---

## 📋 Tâches Courantes

### Tâche 1: Configurer la Tarification Adria

1. **Connexion**: admin@banque.fr / 123456
2. **Navigation**: Onglet "Tarification"
3. **Sélection**: Cliquer sur "Moteur Adria"
4. **Ajouter une règle**:
   - Cliquer "+ Ajouter une Règle"
   - Remplir les champs:
     - **Nom**: ex "Frais d'administration"
     - **Type**: Montant Fixe, Pourcentage ou Échelonné
     - **Valeur**: ex 250 ou 0.75
     - **Min/Max** (optionnel): ex 50000 - 500000
   - Cliquer "Ajouter"
5. **Gestion**:
   - **Modifier**: Cliquer ✏️
   - **Supprimer**: Cliquer 🗑️
   - **Actif/Inactif**: Cliquer le bouton

### Tâche 2: Configurer Moteur Externe

1. **Connexion**: admin@banque.fr / 123456
2. **Navigation**: Onglet "Tarification"
3. **Sélection**: Cliquer sur "Moteur Externe"
4. **Configuration**:
   - **Nom du Fournisseur**: ex "Pricing Engine Pro"
   - **URL API**: https://api.provider.com/pricing
   - **Clé API**: Votre clé sécurisée
5. **Sauvegarde**: Automatique
6. **Note**: Les règles Adria ne sont plus visibles

### Tâche 3: Mettre à Jour Paramètres Banque

1. **Connexion**: admin@banque.fr / 123456
2. **Navigation**: Onglet "Paramètres Banque"
3. **Sections à remplir**:
   - **Infos Bancaires**: Nom, Code, SWIFT, Devise
   - **Contact Principal**: Nom, Email, Téléphone
   - **Adresse**: Rue, Ville, CP, Pays, Fuseau horaire
4. **Sauvegarde**: Cliquer "Enregistrer les modifications"
5. **Confirmation**: Message de succès s'affiche

---

## 🔍 Éléments de l'Interface

### Header
```
[Logo] Administration Adria
       Gestion de la tarification et paramètres
                              [Nom] [Rôle] [Déconnexion]
```

### Alert Informatif
```
Interface Administrateur - Seuls les administrateurs peuvent 
accéder à cette section...
```

### Tabs
```
[Tarification] [Paramètres Banque]
```

### Tarification - Moteur Adria
```
Sélection Source:
├─ [Moteur Adria] ← Sélectionné
└─ Moteur Externe

Règles de Tarification:
├─ [+ Ajouter une Règle]
└─ Table:
   ├─ Nom | Type | Valeur | Plage | Statut | Actions
   ├─ Frais de souscription | Fixe | 500 MAD | N/A | Actif | ✏️ 🗑️
   └─ ...
```

### Tarification - Moteur Externe
```
Sélection Source:
├─ Moteur Adria
└─ [Moteur Externe] ← Sélectionné

Configuration Fournisseur:
├─ Nom du Fournisseur: [____________________]
├─ URL de l'API: [____________________]
└─ Clé API: [*****]
```

### Paramètres Banque
```
Informations Bancaires Générales
├─ Nom de la Banque: [Banque CIH]
├─ Code Bancaire: [CIHMMA2C]
├─ Code SWIFT: [CIHMMA2CXXX]
└─ Devise: [MAD ▼]

Informations de Contact Principal
├─ Nom du Contact: [Mohamed Hassani]
├─ Email du Contact: [contact@banquecih.ma]
└─ Téléphone: [+212 5 37 71 01 01]

Adresse
├─ Adresse: [Twin Center, 2 Boulevard Ghandi]
├─ Ville: [Casablanca]
├─ Code Postal: [20000]
├─ Pays: [Morocco]
└─ Fuseau Horaire: [Africa/Casablanca ▼]

Informations Système (Lecture seule)
├─ Date de création: 15 janvier 2024
└─ Dernière mise à jour: 27 mars 2024

[Enregistrer les modifications]
```

---

## 📊 États Possibles

### Tarification
```
Moteur Adria (par défaut):
  ✅ Admin ajoute/modifie/supprime des règles
  ✅ Règles peuvent être actif/inactif
  ✅ Chaque règle a un type: flat, percentage, tiered

Moteur Externe:
  ✅ Admin configure un fournisseur tiers
  ✅ API endpoint + clé de sécurité
  ✅ Pas de gestion manuelle des règles
  ⚠️ Nécessite connectivité Internet
```

### Paramètres Banque
```
✅ Tous les champs éditables
✅ Données sauvegardées après "Enregistrer"
✅ Timestamps de création/modification automatiques
ℹ️ Infos système en lecture seule
```

---

## ⚡ Raccourcis et Astuces

### Navigation Clavier
```
Tab           → Passer au champ suivant
Shift + Tab   → Champ précédent
Enter         → Soumettre formulaire
Escape        → Fermer dialog
```

### Types de Tarification Expliqués

| Type | Exemple | Cas d'usage |
|------|---------|------------|
| **Fixe (flat)** | 500 MAD | Frais uniques, abonnements |
| **Pourcentage (%)** | 0.5% | Commissions variables |
| **Échelonné (tiered)** | 200 MAD | Selon tranches de montant |

### Validation Rapide

```
Avant d'ajouter une règle:
✓ Nom rempli
✓ Type sélectionné
✓ Valeur > 0
✓ Min/Max cohérents (min < max)

Avant d'enregistrer paramètres:
✓ Nom banque rempli
✓ Email contact valide
✓ Code SWIFT au bon format
✓ Devise sélectionnée
```

---

## 🔐 Sécurité

### Points Importants
```
🔒 Seul Admin peut:
   ├─ Accéder à /admin
   ├─ Modifier tarification
   ├─ Changer paramètres banque
   └─ Voir clés API

❌ Chargé de clientèle:
   ├─ N'a pas accès à /admin
   ├─ Ne voit pas l'onglet Tarification
   ├─ Ne peut pas modifier frais
   └─ Message explique les restrictions

❌ Client:
   └─ N'a pas d'interface admin
```

### Bonnes Pratiques
```
1. Clé API: Changez régulièrement
2. Contact: Maintenez à jour
3. Logs: Consultez historique modifications
4. Sauvegarde: Validez avant de soumettre
5. Déconnexion: Logout après utilisation
```

---

## 🐛 Dépannage

### Problème: "Accès refusé" à /admin
**Solution**: Vérifier que le compte a le rôle "Admin"
```
Compte correct: admin@banque.fr (rôle: Admin)
Compte incorrect: charge@banque.fr (rôle: Chargé)
```

### Problème: Règle n'est pas sauvegardée
**Solution**: Vérifier les validations
```
✓ Nom saisi
✓ Type sélectionné
✓ Valeur numérique valide
✓ Message toast de confirmation
```

### Problème: API externe ne répond pas
**Solution**: Vérifier la configuration
```
✓ URL correcte (https://)
✓ Clé API valide
✓ Serveur API accessible
✓ Format de réponse compatibe
```

### Problème: Données non sauvegardées
**Solution**: Cliquer le bouton approprié
```
Tarification:  Basculer source (auto-save)
Paramètres:    "Enregistrer les modifications" (obligatoire)
```

---

## 📱 Responsive Design

### Sur Mobile
```
✅ Interface s'adapte automatiquement
✅ Tabs stackent verticalement
✅ Formulaires sur pleine largeur
✅ Boutons optimisés pour touch
```

### Sur Tablette
```
✅ Layout 2 colonnes où possible
✅ Spacing lisible
✅ Forms avec bonne hauteur inputs
```

### Sur Desktop
```
✅ Layout optimal multi-colonnes
✅ Dialogs centrés et dimensionnés
✅ Tables avec scroll horizontal si besoin
```

---

## 🔗 Liens Utiles

| Page | URL | Accès |
|------|-----|-------|
| Admin Dashboard | /admin | Admin seulement |
| Login | /login | Tous |
| Chargé Dashboard | /dashboard | Chargé, Client |
| Cash Pooling | /dashboard | Chargé seulement |

---

## 📞 Support

### Questions Fréquentes

**Q: Comment révoquer un moteur externe?**
R: Basculer vers "Moteur Adria", les données Adria restent sauvegardées.

**Q: Puis-je avoir les deux moteurs actifs?**
R: Non, seul un moteur peut être actif à la fois.

**Q: Les tarifs s'appliquent rétroactivement?**
R: Non, seuls les nouveaux contrats utilisent la nouvelle tarification.

**Q: Quelle devise pour les règles Adria?**
R: Actuellement MAD, extensible à d'autres devises.

**Q: Peut-on supprimer une règle activement utilisée?**
R: Oui, à desactiver d'abord si possible (bonne pratique).

---

## ✅ Checklist Initiale

Après première connexion Admin:

- [ ] Vérifier accès à /admin
- [ ] Onglet Tarification visible
- [ ] Onglet Paramètres visible
- [ ] Ajouter 1 règle Adria test
- [ ] Remplir paramètres banque
- [ ] Enregistrer
- [ ] Déconnexion/Reconnexion = données persistent
- [ ] Vérifier Chargé n'a pas accès admin

---

## 🎓 Prochaines Étapes

1. **Tester les deux interfaces**:
   - Admin@banque.fr → /admin
   - charge@banque.fr → /dashboard

2. **Configurer tarification**:
   - Ajouter règles Adria
   - Ou configurer moteur externe

3. **Remplir paramètres banque**:
   - Infos généales
   - Contact principal
   - Localisation

4. **Valider séparation**:
   - Chargé ne voit pas tarification
   - Client accès limité
   - Admin accès complet

---

Version: 1.0  
Dernière mise à jour: 27 Mars 2024  
Plateforme: Adria Cash Pooling v2.0
