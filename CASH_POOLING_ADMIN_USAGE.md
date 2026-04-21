# Guide d'Utilisation - Admin Cash Pooling

## Accès à l'Interface Admin

### URL
```
/admin
```

### Authentification
- Accès réservé aux utilisateurs avec rôle **Admin**
- Redirection automatique si utilisateur non autorisé

### Sidebar Navigation
3 onglets principaux:
1. **Tarification** - Configuration du modèle tarifaire
2. **Paramètres** - Informations de la banque
3. **Analytics** (Coming Soon)

---

## 1. Configuration Tarification Cash Pooling

### Étape 1: Sélectionner la Source de Tarification

Deux options disponibles:

#### Option 1: Adria (Recommandé)
- ✅ **Recommandé par défaut**
- Tarification standard CIH Bank
- Mode consultation seule
- Pré-rempli selon les modes de nivellement (ZBA, TBA, FBA)
- Aucune modification possible

**Cas d'usage**: Utiliser la tarification standard sans personnalisation

#### Option 2: Personnalisé
- Créer une tarification custom
- Tous les champs éditables
- Support API externe optionnelle
- Flexibilité complète

**Cas d'usage**: Adapter la tarification à des clients/marchés spécifiques

### Étape 2: Configurer selon le Choix

#### Si Adria sélectionné:
1. La tarification s'affiche automatiquement
2. Vous pouvez consulter les détails
3. Cliquez sur le bouton "Appliquer Adria" pour valider

**Détails affichés:**
- Mode de nivellement (ZBA, TBA, FBA)
- Type de tarification (Fixe, Variable, Hybride)
- Plafonds et seuils

#### Si Personnalisé sélectionné:
1. **Sélectionner le Mode de Nivellement:**
   - ZBA: Montant fixe récupéré quotidiennement
   - TBA: Target Balance Arrangement
   - FBA: Fixed Balance Arrangement

2. **Sélectionner le Type de Tarification:**
   - **Fixe**: Montant unique (ex: 1000 MAD/mois)
   - **Variable**: Taux (%) appliqué à un critère
   - **Hybride**: Partie fixe + Partie variable

3. **Remplir les Paramètres:**
   ```
   Type Fixe:
   - Montant (ex: 1000)
   - Devise (MAD/EUR/USD)
   - Fréquence (Mensuel/Trimestriel/Annuel)

   Type Variable:
   - Taux % (ex: 0.15%)
   - Frais min (ex: 500)
   - Frais max (ex: 50000)
   - Frais/opération (ex: 10)

   Type Hybride:
   - Partie fixe (voir Type Fixe)
   - Partie variable (voir Type Variable)
   ```

4. **Résumé:**
   - Vérifier le résumé visuel
   - Les montants sont formatés: 50 000 000,00

5. **Enregistrer:**
   - Cliquer "Enregistrer la tarification"
   - Message de confirmation apparaît
   - Configuration sauvegardée en base de données

---

## 2. Montants et Formatage

### Format Standard
```
50 000 000,00 MAD
1 000,50 EUR
10,99 USD
```

### Règles de Formatage
- Séparateur de milliers: espace
- Séparateur décimal: virgule
- 2 décimales obligatoires
- Locale: Français (fr-FR)

---

## 3. Modes de Nivellement (Adria)

### ZBA - Zero Balance Account
```
Mode: Zéro Balance Arrangement
- Solde: Ramené à 0 chaque jour
- Sweeps quotidiens
- Frais: Par sweep quotidien
- Exemple: 5 sweeps/jour × 10 MAD = 50 MAD/jour
```

Configuration:
```
Nombre de sweeps quotidiens: [__5__]
Taux de frais: [_0.15_%]
```

### TBA - Target Balance Arrangement
```
Mode: Target Balance Arrangement
- Montant cible: Maintenu dans une fourchette
- Exemple: Maintenir 1M MAD ± 100k
- Frais: Sur montant excédentaire
```

Configuration:
```
Montant cible: [_1000000_]
Écart autorisé: [_100000_]
Taux frais: [_0.05_%]
```

### FBA - Fixed Balance Arrangement
```
Mode: Fixed Balance Arrangement
- Montant fixe à équilibrer
- Frais fixes mensuels
- Pas de surcharge de trésorerie
```

Configuration:
```
Montant total: [_5000000_]
Frais mensuels: [_5000_]
```

---

## 4. Paramètres de la Banque

### Onglet "Paramètres"
Gérer les informations de la banque:
- **Infos générales**: Nom, Code, SWIFT, Devise, Fuseau horaire
- **Contact**: Nom, Email, Téléphone
- **Adresse**: Rue, Ville, Code postal, Pays

### Modification
1. Cliquer sur un champ
2. Modifier la valeur
3. Cliquer "Enregistrer les paramètres"

---

## 5. Contrat Cash Pooling

### Génération du Contrat
Le contrat est généré automatiquement lors de la conclusion d'un arrangement:

**Inclus dans le contrat:**
1. **Page 1:** Identification client + Tarification appliquée
2. **Page 2:** Comptes bancaires + Profils de signature
3. **Page 3:** Acceptations + Signatures client
4. **Pages 4-N:** 1 page par utilisateur du Cash Pooling

### Format Contrat
- Format A4 (210mm × 297mm)
- Couleurs CIH Bank: Orange + Noir + Blanc
- Logo CIH Bank en haut
- Prêt à imprimer ou sauvegarder en PDF
- Tous les montants formatés: 50 000 000,00

### Sections Contrat
```
Page 1 - Identification Client
├── Infos contrat (Numéro, Date)
├── Identification client
└── Plafonds & seuils (9 types d'opérations)

Page 2 - Comptes et Profils
├── Tableau des comptes
└── Profils de signature

Page 3 - Signatures Contrat
├── 3 acceptations (checkboxes)
└── Signatures: Représentant légal + CAF

Pages 4-N - Utilisateurs
├── Identification utilisateur
├── Profil utilisateur
├── Comptes autorisés
├── Opérations personnalisées
└── Signatures: Représentant légal + Abonné + CAF
```

---

## 6. Restrictions Importantes

### Admin Interface = TARIFICATION + PARAMÈTRES UNIQUEMENT

**❌ NON Disponible en Admin:**
- Sélection de comptes
- Structuration (centralisation/regroupement)
- Validation de contrats
- Gestion utilisateurs
- Configuration modes de nivellement par client

**Objectif:** Isoler complètement la gestion administrative (tarification, infos banque) de la gestion métier (arrangements Cash Pooling).

---

## 7. FAQ

### Q: Puis-je modifier la tarification Adria?
**R:** Non, l'option Adria est consultation seule. Choisissez "Personnalisé" pour modifications.

### Q: Comment connecter mon API tarifaire?
**R:** Dans "Personnalisé" → "Configuration API", entrez l'endpoint et les credentials.

### Q: Les montants s'affichent comment?
**R:** Format français: 50 000 000,00 (espaces milliers, virgule décimale)

### Q: Quand le contrat est-il généré?
**R:** Automatiquement lors de la création d'un arrangement Cash Pooling (pas accessible en Admin).

### Q: Puis-je imprimer le contrat en PDF?
**R:** Oui, accédez au contrat depuis l'étape "Contrat" du client, puis imprimez/sauvegardez en PDF.

---

## 8. Support et Escalade

Pour toute question ou problème:
1. Consulter cette documentation
2. Vérifier la checklist de vérification: `FINAL_VERIFICATION_CHECKLIST.md`
3. Contacter support: support@cihbank.com
4. Créer un ticket: [Jira/Support]

---

**Version:** 1.0
**Dernière mise à jour:** Mars 2026
**Statut:** Production Ready
