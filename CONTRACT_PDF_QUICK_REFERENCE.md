# Cash Pooling Contract PDF Generator - Quick Reference

## 📌 Quick Start

### Import
```typescript
import { ContractPDFGenerator } from '@/lib/contract-pdf-generator'
```

### Basic Usage
```typescript
const blob = ContractPDFGenerator.generateContractPDF(contract)
ContractPDFGenerator.downloadPDF(blob, 'contract.pdf')
```

### With Users
```typescript
const blob = ContractPDFGenerator.generateContractPDF(contract, {
  users: [
    {
      id: 'user-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@example.com',
      phone: '+212612345678',
      accountType: 'admin',
      accountNumber: 'FR76...',
      profile: 'Administrateur'
    }
  ]
})
ContractPDFGenerator.downloadPDF(blob, 'contract.pdf')
```

---

## 📄 Generated Pages

| Page | Content | Sections |
|------|---------|----------|
| 1 | Identification | Logo, Header, Client ID, Accounts |
| 2 | Leveling & Pricing | Parameters, Pricing (3 layers), Discounts |
| 3 | Investment | OPCVM placement (if enabled) |
| 4 | Limits | Operation limits (Web/Mobile) |
| 5+ | Users | One page per authorized user |
| Final | Conditions | Legal conditions + final signatures |

---

## 🎨 Design

**Colors:**
- Primary: #2563EB (Blue)
- Secondary: #DBE6FE (Light blue)
- Text: #000000 (Black)
- Gray: #949394

**Badges:**
- 🟦 Registered (Grey)
- 🟩 Actif (Green)
- 🟧 Suspendu (Orange)
- 🟥 Clôturé (Red)

---

## 💾 Output

Files are automatically saved with:
```
Convention-CP-{contractNumber}-{timestamp}.pdf
```

---

## ✅ What's Included

- ✅ Professional 5+ page PDF
- ✅ Blue color scheme
- ✅ All sections with proper formatting
- ✅ Dynamic page numbers
- ✅ Action bar (top of pages)
- ✅ Signature blocks
- ✅ User contracts
- ✅ OPCVM section (conditional)
- ✅ French formatting (numbers, dates)
- ✅ No external storage needed

---

## 🔧 Existing Integration

Already compatible with:
- `app/contracts/page.tsx`
- `components/steps/step-contract.tsx`
- `components/contract-pdf-preview.tsx`

**No migration needed** - just use the new features!

---

## 📞 Support

For detailed documentation, see:
- `CONTRACT_PDF_GENERATOR_V2.md` - Full documentation
- `CONTRACT_PDF_IMPLEMENTATION_COMPLETE.md` - Implementation details

