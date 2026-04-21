# Refactorisation Structure Contrat PDF

## Aperçu
Le contrat généré suit désormais la structure du modèle "BUSINESS ONLINE Module Cash" fourni par Bank of Africa.

## Structure Nouvelle

### PAGE 1 - En-tête et Identification Client
- **Header**: "BUSINESS ONLINE Module Cash"
- **Identification client**:
  - Numéro tiers
  - Nombres d'abonnés
  - Intitulé (nom du client)
  - Compte facturation
  - Adresse
  - Agence client
  - Identifiant contrat
  - Date de création

### Plafonds & Seuils Opérations
Configuration des limites pour:
- Virements Compte à compte
- Virements de masse
- Virements vers bénéficiaire
- Virements permanents
- Demandes chéquiers et LCN
- Bénéficiaires domestiques et MAD

### Comptes au sein de la Banque
Tableau listant:
- Numéro de compte
- Intitulé (client name)

### PAGES 2+ - Profils Utilisateurs
Pour chaque utilisateur/abonné:

1. **Identification utilisateur**
   - Prénom / Nom
   - Email principal
   - Type de pièce d'identité (CIN, Passeport, etc.)
   - Numéro de pièce
   - Téléphone principal
   - Login utilisateur
   - Qualité / Contrat (Tous les services)

2. **Plafonds & Seuils Abonné**
   - Même structure que les plafonds client
   - Personnalisés par utilisateur

3. **Comptes de l'Utilisateur**
   - Liste des comptes accessibles
   - Numéro de compte et Intitulé

4. **Signatures**
   - Signature du représentant légal
   - Signature de l'abonné
   - Signature et cachet du CAF

### PAGE FINALE
- Déclaration de conformité
- Conditions générales et particulières
- Signature finale et cachet

## Classe: ContractPDFGenerator

### Méthodes Publiques

**`generateContractPDF(contract, hierarchy): Blob`**
- Génère le PDF complet
- Paramètres:
  - `contract`: CashPoolingContract
  - `hierarchy`: HierarchicalAccount | null
- Retourne: Blob du PDF

**`downloadPDF(pdfBlob, fileName): void`**
- Déclenche le téléchargement
- Paramètres:
  - `pdfBlob`: Blob du PDF
  - `fileName`: Nom du fichier (ex: "CONTRAT-001.pdf")

## Changements Implémentés

1. **Nouveau générateur**: `/lib/contract-pdf-generator.ts` (259 lignes)
2. **Mise à jour**: `/components/steps/step-contract.tsx` - Import et utilisation du nouveau générateur
3. **Compatible avec**: Tous les types de Cash Pooling (ZBA, TBA, FBA, Notionnel, Physique)

## Format & Style

- Police: Helvetica
- Couleur header: Bleu (0, 102, 153)
- Marges: 12mm
- Gestion automatique des sauts de page
- Formatage des nombres: Locale FR (ex: "50 000 000,00")

## Intégration

La génération est appelée depuis `StepContract`:
```typescript
const handleDownloadPDF = () => {
  const pdfBlob = ContractPDFGenerator.generateContractPDF(contract, hierarchy)
  ContractPDFGenerator.downloadPDF(pdfBlob, `${contract.contractNumber}.pdf`)
}
```

## Note
Les champs marqués "[À remplir]" ou "[À confirmer]" doivent être remplis ultérieurement selon les processus métier de la banque.
