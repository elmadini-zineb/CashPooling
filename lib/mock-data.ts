import type { Client, Account, CashPoolingContract, SecondaryAccountConfig, OPCVMFund, Subscriber, Amendment, AuditLogEntry, HierarchicalAccount, PoolingMode } from "./types"
import { HierarchyManager } from "./hierarchy-manager"

export const mockClients: Client[] = [
  {
    id: "client-1",
    name: "Groupe Industriel ABC",
    type: "group",
    createdAt: new Date("2023-01-15"),
  },
  {
    id: "client-2",
    name: "Entreprise XYZ SA",
    type: "individual",
    createdAt: new Date("2023-03-20"),
  },
  {
    id: "client-3",
    name: "Holding DEF",
    type: "group",
    createdAt: new Date("2023-05-10"),
  },
]

export const mockAccounts: Account[] = [
  // Client 1 - Groupe Vortex Global (MAD) - Main parent account
  {
    id: "acc-1",
    accountNumber: "FR7630001007941234567890185",
    iban: "FR7630001007941234567890185",
    clientId: "client-1",
    clientName: "Groupe Vortex Global",
    companyName: "Groupe Vortex Global S.A.",
    balance: 150000,
    currency: "MAD",
    status: "active",
    accountType: "Compte courant",
    registrationNumber: "RC001234",
    businessIdentifier: "ICE00123456789",
    taxIdentifier: "ID0123456",
    createdAt: new Date("2023-01-16"),
    linkedAccountIds: ["acc-1-int-1", "acc-1-int-2", "acc-2", "acc-3"],
  },
  {
    id: "acc-1-int-1",
    accountNumber: "FR7630001007941234567890200",
    iban: "FR7630001007941234567890200",
    clientId: "client-1",
    clientName: "Filiale Technix Solutions",
    companyName: "Technix Solutions SARL",
    balance: 30000,
    currency: "MAD",
    status: "active",
    accountType: "Compte rattachement",
    registrationNumber: "RC005678",
    businessIdentifier: "ICE00123456790",
    taxIdentifier: "ID0123457",
    createdAt: new Date("2023-01-17"),
    parentAccountId: "acc-1",
    linkedAccountIds: ["acc-1-sec-1"],
  },
  {
    id: "acc-1-int-2",
    accountNumber: "FR7630001007941234567890201",
    iban: "FR7630001007941234567890201",
    clientId: "client-1",
    clientName: "Filiale Nexus Commerce",
    companyName: "Nexus Commerce EURL",
    balance: 25000,
    currency: "MAD",
    status: "active",
    accountType: "Compte rattachement",
    registrationNumber: "RC009012",
    businessIdentifier: "ICE00123456791",
    taxIdentifier: "ID0123458",
    createdAt: new Date("2023-01-17"),
    parentAccountId: "acc-1",
    linkedAccountIds: ["acc-1-sec-2"],
  },
  {
    id: "acc-2",
    accountNumber: "FR7630001007941234567890186",
    iban: "FR7630001007941234567890186",
    clientId: "client-1",
    clientName: "Filiale Apex Industries",
    companyName: "Apex Industries Ltd",
    balance: 45000,
    currency: "MAD",
    status: "active",
    accountType: "Compte épargne",
    registrationNumber: "RC003456",
    businessIdentifier: "ICE00123456792",
    taxIdentifier: "ID0123459",
    createdAt: new Date("2023-01-16"),
    parentAccountId: "acc-1",
  },
  {
    id: "acc-3",
    accountNumber: "FR7630001007941234567890187",
    iban: "FR7630001007941234567890187",
    clientId: "client-1",
    clientName: "Filiale Horizon Logistics",
    companyName: "Horizon Logistics Inc",
    balance: 23000,
    currency: "MAD",
    status: "active",
    accountType: "Compte dépôt",
    registrationNumber: "RC007890",
    businessIdentifier: "ICE00123456793",
    taxIdentifier: "ID0123460",
    createdAt: new Date("2023-02-01"),
    parentAccountId: "acc-1",
  },
  {
    id: "acc-1-sec-1",
    accountNumber: "FR7630001007941234567890202",
    iban: "FR7630001007941234567890202",
    clientId: "client-1",
    clientName: "Compte auxiliaire Technix - Production",
    companyName: "Technix Solutions SARL - Production",
    balance: 12000,
    currency: "MAD",
    status: "active",
    accountType: "Compte opérationnel",
    registrationNumber: "RC005678",
    businessIdentifier: "ICE00123456790",
    taxIdentifier: "ID0123457",
    createdAt: new Date("2023-02-15"),
    parentAccountId: "acc-1-int-1",
  },
  {
    id: "acc-1-sec-2",
    accountNumber: "FR7630001007941234567890203",
    iban: "FR7630001007941234567890203",
    clientId: "client-1",
    clientName: "Compte auxiliaire Nexus - Distribution",
    companyName: "Nexus Commerce EURL - Distribution",
    balance: 18000,
    currency: "MAD",
    status: "active",
    accountType: "Compte opérationnel",
    registrationNumber: "RC009012",
    businessIdentifier: "ICE00123456791",
    taxIdentifier: "ID0123458",
    createdAt: new Date("2023-03-01"),
    parentAccountId: "acc-1-int-2",
  },
  {
    id: "acc-4",
    accountNumber: "FR7630001007941234567890188",
    iban: "FR7630001007941234567890188",
    clientId: "client-1",
    clientName: "Groupe Vortex Global",
    companyName: "Groupe Vortex Global S.A.",
    balance: 50000,
    currency: "USD",
    status: "active",
    accountType: "Compte courant",
    registrationNumber: "RC001234",
    businessIdentifier: "ICE00123456789",
    taxIdentifier: "ID0123456",
    createdAt: new Date("2023-03-10"),
  },
  // Client 2 - Groupe Stellium Dynamics
  {
    id: "acc-5",
    accountNumber: "FR7630001007941234567890189",
    iban: "FR7630001007941234567890189",
    clientId: "client-2",
    clientName: "Groupe Stellium Dynamics",
    companyName: "Stellium Dynamics S.P.A.",
    balance: 80000,
    currency: "MAD",
    status: "active",
    accountType: "Compte courant",
    registrationNumber: "RC002345",
    businessIdentifier: "ICE00234567890",
    taxIdentifier: "ID0234567",
    createdAt: new Date("2023-03-15"),
    linkedAccountIds: ["acc-5-1", "acc-5-2"],
  },
  {
    id: "acc-5-1",
    accountNumber: "FR7630001007941234567890204",
    iban: "FR7630001007941234567890204",
    clientId: "client-2",
    clientName: "Branche Quantum Tech",
    companyName: "Quantum Tech Division",
    balance: 35000,
    currency: "MAD",
    status: "active",
    accountType: "Compte épargne",
    registrationNumber: "RC006789",
    businessIdentifier: "ICE00234567891",
    taxIdentifier: "ID0234568",
    createdAt: new Date("2023-03-20"),
    parentAccountId: "acc-5",
  },
  {
    id: "acc-5-2",
    accountNumber: "FR7630001007941234567890205",
    iban: "FR7630001007941234567890205",
    clientId: "client-2",
    clientName: "Branche Prism Services",
    companyName: "Prism Services Group",
    balance: 20000,
    currency: "MAD",
    status: "active",
    accountType: "Compte dépôt",
    registrationNumber: "RC010123",
    businessIdentifier: "ICE00234567892",
    taxIdentifier: "ID0234569",
    createdAt: new Date("2023-04-01"),
    parentAccountId: "acc-5",
  },
  {
    id: "acc-6",
    accountNumber: "FR7630001007941234567890190",
    iban: "FR7630001007941234567890190",
    clientId: "client-2",
    clientName: "Groupe Stellium Dynamics",
    companyName: "Stellium Dynamics S.P.A.",
    balance: 15000,
    currency: "MAD",
    status: "inactive",
    accountType: "Compte courant",
    registrationNumber: "RC002345",
    businessIdentifier: "ICE00234567890",
    taxIdentifier: "ID0234567",
    createdAt: new Date("2023-04-10"),
  },
  // Client 3 - Groupe Catalyst Ventures
  {
    id: "acc-7",
    accountNumber: "FR7630001007941234567890191",
    iban: "FR7630001007941234567890191",
    clientId: "client-3",
    clientName: "Groupe Catalyst Ventures",
    companyName: "Catalyst Ventures Holding",
    balance: 200000,
    currency: "MAD",
    status: "active",
    accountType: "Compte courant",
    registrationNumber: "RC004567",
    businessIdentifier: "ICE00345678901",
    taxIdentifier: "ID0345678",
    createdAt: new Date("2023-04-15"),
    linkedAccountIds: ["acc-7-1", "acc-7-2", "acc-7-3"],
  },
  {
    id: "acc-7-1",
    accountNumber: "FR7630001007941234567890206",
    iban: "FR7630001007941234567890206",
    clientId: "client-3",
    clientName: "Division Zenith Partners",
    companyName: "Zenith Partners LLP",
    balance: 55000,
    currency: "MAD",
    status: "active",
    accountType: "Compte épargne",
    registrationNumber: "RC008901",
    businessIdentifier: "ICE00345678902",
    taxIdentifier: "ID0345679",
    createdAt: new Date("2023-04-20"),
    parentAccountId: "acc-7",
  },
  {
    id: "acc-7-2",
    accountNumber: "FR7630001007941234567890207",
    iban: "FR7630001007941234567890207",
    clientId: "client-3",
    clientName: "Division Nexis Capital",
    companyName: "Nexis Capital Fund",
    balance: 65000,
    currency: "MAD",
    status: "active",
    accountType: "Compte dépôt",
    registrationNumber: "RC012345",
    businessIdentifier: "ICE00345678903",
    taxIdentifier: "ID0345680",
    createdAt: new Date("2023-05-01"),
    parentAccountId: "acc-7",
  },
  {
    id: "acc-7-3",
    accountNumber: "FR7630001007941234567890208",
    iban: "FR7630001007941234567890208",
    clientId: "client-3",
    clientName: "Division Orion Solutions",
    companyName: "Orion Solutions Inc",
    balance: 45000,
    currency: "MAD",
    status: "active",
    accountType: "Compte courant",
    registrationNumber: "RC014567",
    businessIdentifier: "ICE00345678904",
    taxIdentifier: "ID0345681",
    createdAt: new Date("2023-05-15"),
    parentAccountId: "acc-7",
  },
]

// Global contracts storage
let globalContracts: CashPoolingContract[] = []

// Mock user for authentication
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

export const mockUser = mockUsers[0]

export function addContract(contract: CashPoolingContract): void {
  globalContracts.push(contract)
  
  // Log the contract creation
  addAuditLog({
    id: `audit-create-${Date.now()}`,
    entityType: "contract",
    entityId: contract.id,
    action: `Convention ${contract.contractNumber} créée`,
    userEmail: contract.createdBy,
    userName: "Chargé de clientèle",
    userRole: "Chargé de clientèle",
    details: { clientName: contract.clientName, contractNumber: contract.contractNumber },
    createdAt: new Date(),
    changesSummary: "Création de la convention",
  })
}

export function getAllContracts(): CashPoolingContract[] {
  return [...globalContracts]
}

export function updateContractStatus(
  contractId: string,
  newStatus: "active" | "suspended" | "terminated" | "registered",
): boolean {
  const contract = globalContracts.find((c) => c.id === contractId)
  if (contract) {
    const oldStatus = contract.status
    contract.status = newStatus

    // Log the status change
    const statusMap: Record<string, string> = {
      active: "Actif",
      suspended: "Suspendue",
      terminated: "Terminée",
      registered: "Enregistrée",
    }

    addAuditLog({
      id: `audit-status-${Date.now()}`,
      entityType: "contract",
      entityId: contractId,
      action: `Convention ${contract.contractNumber} - Statut modifié en ${statusMap[newStatus]}`,
      userEmail: "adria@admin.com",
      userName: "Chargé de clientèle",
      userRole: "Chargé de clientèle",
      details: { oldStatus, newStatus, contractNumber: contract.contractNumber },
      createdAt: new Date(),
      changesSummary: `Statut: ${statusMap[oldStatus]} → ${statusMap[newStatus]}`,
    })

    return true
  }
  return false
}

export function getContractById(id: string): CashPoolingContract | undefined {
  return globalContracts.find((c) => c.id === id)
}

export const mockSecondaryConfigs: SecondaryAccountConfig[] = [
  {
    accountId: "acc-2",
    account: mockAccounts[1],
    mode: "ZBA",
    isActive: true,
  },
  {
    accountId: "acc-3",
    account: mockAccounts[2],
    mode: "TBA",
    targetBalance: 20000,
    isActive: true,
  },
]

// Mock Bank Settings
export const mockBankSettings: BankSettings = {
  id: "bank-001",
  bankName: "Banque CIH",
  bankCode: "CIHMMA2C",
  swiftCode: "CIHMMA2CXXX",
  mainContactName: "Mohamed Hassani",
  mainContactEmail: "contact@banquecih.ma",
  mainContactPhone: "+212 5 37 71 01 01",
  address: "Twin Center, 2 Boulevard Ghandi",
  city: "Casablanca",
  postalCode: "20000",
  country: "Morocco",
  currency: "MAD",
  timezone: "Africa/Casablanca",
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-03-27"),
}

// Mock Pricing Configuration
export const mockPricingConfig: PricingConfig = {
  id: "pricing-001",
  bankId: "bank-001",
  sourceType: "adria",
  adriaEnabled: true,
  externalEnabled: false,
  rules: [
    {
      id: "rule-1",
      name: "Frais de souscription",
      description: "Frais fixes pour chaque souscription de cash pooling",
      type: "flat",
      value: 500,
      currency: "MAD",
      isActive: true,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: "rule-2",
      name: "Commission annuelle",
      description: "Commission annuelle basée sur le montant total du pool",
      type: "percentage",
      value: 0.5,
      currency: "MAD",
      minAmount: 100000,
      isActive: true,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: "rule-3",
      name: "Frais de structuration",
      description: "Frais pour la structuration des comptes secondaires",
      type: "tiered",
      value: 200,
      currency: "MAD",
      isActive: true,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    },
  ],
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-03-27"),
}

export const mockOPCVMFunds: OPCVMFund[] = [
  {
    id: "opcvm-1",
    name: "CIH Trésorerie MAD",
    isin: "MA0000012345",
    fundType: "Monétaire",
    currency: "MAD",
    minInvestment: 10000,
    isActive: true,
  },
  {
    id: "opcvm-2",
    name: "CIH Liquidité Plus",
    isin: "MA0000012346",
    fundType: "Court Terme",
    currency: "MAD",
    minInvestment: 25000,
    isActive: true,
  },
  {
    id: "opcvm-3",
    name: "CIH Obligations",
    isin: "MA0000012347",
    fundType: "Obligataire",
    currency: "MAD",
    minInvestment: 50000,
    isActive: true,
  },
  {
    id: "opcvm-4",
    name: "CIH Actions Maroc",
    isin: "MA0000012348",
    fundType: "Actions",
    currency: "MAD",
    minInvestment: 100000,
    isActive: true,
  },
]

export const mockSubscribers: Subscriber[] = [
  {
    id: "sub-1",
    name: "Mohamed Alami",
    email: "m.alami@example.com",
    phone: "+212 6 12 34 56 78",
    company: "Groupe Industriel ABC",
    isActive: true,
    createdAt: new Date("2023-06-01"),
  },
  {
    id: "sub-2",
    name: "Fatima Bennani",
    email: "f.bennani@example.com",
    phone: "+212 6 23 45 67 89",
    company: "Entreprise XYZ SA",
    isActive: true,
    createdAt: new Date("2023-07-15"),
  },
  {
    id: "sub-3",
    name: "Ahmed Tazi",
    email: "a.tazi@example.com",
    phone: "+212 6 34 56 78 90",
    company: "Holding DEF",
    isActive: true,
    createdAt: new Date("2023-08-20"),
  },
  {
    id: "sub-4",
    name: "Laila Idrissi",
    email: "l.idrissi@example.com",
    phone: "+212 6 45 67 89 01",
    company: "Société Commerce International",
    isActive: true,
    createdAt: new Date("2023-09-10"),
  },
]

export function assignContractToSubscriber(contractId: string, subscriberId: string): boolean {
  const contract = globalContracts.find((c) => c.id === contractId)
  if (contract) {
    ;(contract as any).assignedSubscriberId = subscriberId
    contract.updatedAt = new Date()
    return true
  }
  return false
}

export function getAllSubscribers(): Subscriber[] {
  return [...mockSubscribers]
}

// Mock amendments storage
let globalAmendments: Amendment[] = []

// Helper function to generate amendment number
export function generateAmendmentNumber(conventionReference: string, existingAmendments: Amendment[]): string {
  const filteredAmendments = existingAmendments.filter((a) => a.conventionReference === conventionReference)
  const nextSeq = filteredAmendments.length + 1
  return `AVN-${conventionReference}-${String(nextSeq).padStart(3, "0")}`
}

export function addAmendment(amendment: Amendment): void {
  globalAmendments.push(amendment)
  
  // Log the amendment creation
  addAuditLog({
    id: `audit-amendment-${Date.now()}`,
    entityType: "amendment",
    entityId: amendment.id,
    action: `Avenant ${amendment.amendmentNumber} généré et en attente de signature`,
    userEmail: amendment.createdBy,
    userName: "Chargé de clientèle",
    userRole: "Chargé de clientèle",
    details: { subject: amendment.subject, reason: amendment.reason, conventionReference: amendment.conventionReference },
    createdAt: new Date(),
    changesSummary: `Avenant en attente de signature`,
  })
}

export function getAllAmendments(): Amendment[] {
  return [...globalAmendments]
}

export function getAmendmentsByConvention(conventionId: string): Amendment[] {
  return globalAmendments.filter((a) => a.conventionId === conventionId)
}

export function getAmendmentById(amendmentId: string): Amendment | undefined {
  return globalAmendments.find((a) => a.id === amendmentId)
}

export function updateAmendmentStatus(amendmentId: string, status: "draft" | "generated" | "pending_signature" | "signed" | "active" | "rejected"): boolean {
  const amendment = globalAmendments.find((a) => a.id === amendmentId)
  if (amendment) {
    amendment.status = status
    return true
  }
  return false
}

export function signAmendment(amendmentId: string, signedBy: string): boolean {
  const amendment = globalAmendments.find((a) => a.id === amendmentId)
  if (amendment) {
    amendment.status = "signed"
    amendment.signedAt = new Date()
    amendment.signedBy = signedBy
    
    // Log the amendment signature
    addAuditLog({
      id: `audit-sign-${Date.now()}`,
      entityType: "amendment",
      entityId: amendment.id,
      action: `Avenant ${amendment.amendmentNumber} signé et activé`,
      userEmail: signedBy,
      userName: "Client",
      userRole: "Client",
      details: { amendmentNumber: amendment.amendmentNumber, conventionReference: amendment.conventionReference },
      createdAt: new Date(),
      changesSummary: `Avenant signé - Statut: En attente → Activé`,
    })
    
    return true
  }
  return false
}

export function rejectAmendment(amendmentId: string, rejectionReason: string): boolean {
  const amendment = globalAmendments.find((a) => a.id === amendmentId)
  if (amendment) {
    amendment.status = "rejected"
    amendment.rejectionReason = rejectionReason
    
    // Log the amendment rejection
    addAuditLog({
      id: `audit-reject-${Date.now()}`,
      entityType: "amendment",
      entityId: amendment.id,
      action: `Avenant ${amendment.amendmentNumber} rejeté`,
      userEmail: "adria@admin.com",
      userName: "Client",
      userRole: "Client",
      details: { rejectionReason, amendmentNumber: amendment.amendmentNumber, conventionReference: amendment.conventionReference },
      createdAt: new Date(),
      changesSummary: `Avenant rejeté - Motif: ${rejectionReason}`,
    })
    
    return true
  }
  return false
}

// Mock audit logs storage
let globalAuditLogs: AuditLogEntry[] = []

export function addAuditLog(log: AuditLogEntry): void {
  globalAuditLogs.push(log)
}

export function getAllAuditLogs(): AuditLogEntry[] {
  return [...globalAuditLogs]
}

export function getAuditLogsByEntity(entityType: string, entityId: string): AuditLogEntry[] {
  return globalAuditLogs.filter((log) => log.entityType === entityType && log.entityId === entityId)
}

// PDF Generation function
export async function generatePDF(amendment: Amendment, contract: CashPoolingContract): Promise<string> {
  // Simulate PDF generation - in production this would use a library like pdfkit or similar
  try {
    // For mock purposes, generate a simple data URL
    const pdfContent = `
      Avenant à la Convention de Trésorerie
      Référence: ${amendment.amendmentNumber}
      Convention: ${contract.contractNumber}
      Client: ${contract.clientName}
      Date d'effet: ${amendment.effectiveDate.toLocaleDateString('fr-FR')}
      
      Modifications apportées:
      ${
        amendment.modifyLeveling
          ? `- Modification du mode de nivellement`
          : ''
      }
      ${
        amendment.modifyDebitCoverage
          ? `- Modification de la couverture débitrice`
          : ''
      }
      ${
        amendment.modifySecondaryAccounts
          ? `- Modification des comptes secondaires`
          : ''
      }
      ${
        amendment.modifyIntermediateAccounts
          ? `- Modification des comptes intermédiaires`
          : ''
      }
      ${
        amendment.modifyEndDate
          ? `- Modification de la date de fin`
          : ''
      }
      
      Objet: ${amendment.subject}
      Motif: ${amendment.reason}
    `

    // Create a data URL (in production, this would be an actual PDF blob)
    const base64 = Buffer.from(pdfContent).toString('base64')
    const pdfUrl = `data:application/pdf;base64,${base64}`

    // Update amendment with PDF URL
    const foundAmendment = globalAmendments.find((a) => a.id === amendment.id)
    if (foundAmendment) {
      foundAmendment.pdfUrl = pdfUrl
    }

    return pdfUrl
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}

// Contract action functions with audit logging

export function suspendContract(contractId: string, reason: string, userEmail: string, userName: string, userRole: any): string {
  const contract = globalContracts.find((c) => c.id === contractId)
  if (!contract) throw new Error("Contract not found")

  const suspensionId = `suspend-${Date.now()}`
  contract.status = "suspended"
  contract.suspensionReason = reason
  contract.suspensionDate = new Date()

  addAuditLog({
    id: suspensionId,
    entityType: "contract",
    entityId: contractId,
    action: `Convention ${contract.contractNumber} suspendue`,
    userEmail,
    userName,
    userRole,
    details: { reason, contractNumber: contract.contractNumber, clientName: contract.clientName },
    createdAt: new Date(),
    changesSummary: `Statut: Actif → Suspendue`,
  })

  return suspensionId
}

export function liftSuspension(contractId: string, userEmail: string, userName: string, userRole: any, linkedEventId?: string): string {
  const contract = globalContracts.find((c) => c.id === contractId)
  if (!contract) throw new Error("Contract not found")

  const liftId = `lift-${Date.now()}`
  contract.status = "active"
  contract.suspensionReason = undefined
  contract.suspensionDate = undefined

  addAuditLog({
    id: liftId,
    entityType: "contract",
    entityId: contractId,
    action: `Levée de suspension de la convention ${contract.contractNumber}`,
    userEmail,
    userName,
    userRole,
    details: { contractNumber: contract.contractNumber, clientName: contract.clientName },
    createdAt: new Date(),
    linkedEventId,
    changesSummary: `Statut: Suspendue → Actif`,
  })

  return liftId
}

export function terminateContract(contractId: string, endDate: Date, reason: string, userEmail: string, userName: string, userRole: any): void {
  const contract = globalContracts.find((c) => c.id === contractId)
  if (!contract) throw new Error("Contract not found")

  contract.status = "terminated"
  contract.endDate = endDate
  contract.terminationReason = reason

  addAuditLog({
    id: `terminate-${Date.now()}`,
    entityType: "contract",
    entityId: contractId,
    action: `Convention ${contract.contractNumber} terminée`,
    userEmail,
    userName,
    userRole,
    details: { endDate: endDate.toLocaleDateString("fr-FR"), reason, contractNumber: contract.contractNumber },
    createdAt: new Date(),
    changesSummary: `Statut: Actif → Terminée (${endDate.toLocaleDateString("fr-FR")})`,
  })
}

export function logContractModification(
  contractId: string,
  previousValues: Record<string, any>,
  newValues: Record<string, any>,
  userEmail: string,
  userName: string,
  userRole: any
): void {
  const contract = globalContracts.find((c) => c.id === contractId)
  if (!contract) throw new Error("Contract not found")

  const changedFields = Object.keys(newValues).filter((key) => previousValues[key] !== newValues[key])

  addAuditLog({
    id: `modify-${Date.now()}`,
    entityType: "contract",
    entityId: contractId,
    action: `Convention ${contract.contractNumber} modifiée`,
    userEmail,
    userName,
    userRole,
    details: { changedFields, contractNumber: contract.contractNumber },
    createdAt: new Date(),
    changesSummary: `Modification de ${changedFields.length} champ(s): ${changedFields.join(", ")}`,
  })
}

export function getAuditLogsByDateRange(startDate: Date, endDate: Date): AuditLogEntry[] {
  return globalAuditLogs.filter((log) => log.createdAt >= startDate && log.createdAt <= endDate)
}

export function getAuditLogsByEventType(eventType: string): AuditLogEntry[] {
  return globalAuditLogs.filter((log) => log.details.eventType === eventType || log.action.includes(eventType))
}

export function getAuditLogsByUser(userEmail: string): AuditLogEntry[] {
  return globalAuditLogs.filter((log) => log.userEmail === userEmail)
}

// Initialize with sample amendments and audit logs
export function initializeSampleData(): void {
  // Clear existing data
  globalContracts = []
  globalAmendments = []
  globalAuditLogs = []

  // Create sample contracts
  const sampleContracts: CashPoolingContract[] = [
    {
      id: "contract-1",
      contractNumber: "CP-2026-001",
      masterAccountId: "acc-1",
      masterAccount: mockAccounts[0],
      secondaryAccounts: [mockAccounts[1], mockAccounts[2], mockAccounts[3]],
      clientId: "client-1",
      clientName: "Groupe Vortex Global",
      status: "active",
      currency: "MAD",
      createdBy: "adria@admin.com",
      createdAt: new Date("2026-01-15"),
      updatedAt: new Date("2026-01-15"),
      endDate: new Date("2027-01-15"),
      poolingConfig: {
        mode: "TBA",
        scheduling: { frequency: "monthly" },
        targetBalance: 20000,
        isActive: true,
      },
      pricingConfig: {
        type: "variable",
        billingFrequency: "monthly",
        leveledAmountRate: 0.15,
        levelingOperationFees: 8,
        secondaryAccountFees: 50,
      },
    },
    {
      id: "contract-2",
      contractNumber: "CP-2026-002",
      masterAccountId: "acc-5",
      masterAccount: mockAccounts[7],
      secondaryAccounts: [mockAccounts[8], mockAccounts[9]],
      clientId: "client-2",
      clientName: "Groupe Stellium Dynamics",
      status: "suspended",
      currency: "MAD",
      createdBy: "adria@admin.com",
      createdAt: new Date("2026-02-02"),
      updatedAt: new Date("2026-02-02"),
      endDate: new Date("2027-02-02"),
      suspensionReason: "Non-respect des obligations contractuelles",
      suspensionDate: new Date("2026-03-01"),
      poolingConfig: {
        mode: "FBA",
        scheduling: { frequency: "monthly" },
        minBalance: 5000,
        maxBalance: 35000,
        isActive: true,
      },
      pricingConfig: {
        type: "fixed",
        billingFrequency: "monthly",
        openingFees: 5000,
        monthlySubscription: 2000,
        contractGenerationFees: 1500,
      },
    },
    {
      id: "contract-3",
      contractNumber: "CP-2025-018",
      masterAccountId: "acc-7",
      masterAccount: mockAccounts[12],
      secondaryAccounts: [mockAccounts[13], mockAccounts[14], mockAccounts[15]],
      clientId: "client-3",
      clientName: "Groupe Catalyst Ventures",
      status: "active",
      currency: "MAD",
      createdBy: "adria@admin.com",
      createdAt: new Date("2025-11-10"),
      updatedAt: new Date("2025-11-10"),
      endDate: new Date("2026-11-10"),
      poolingConfig: {
        mode: "ZBA",
        scheduling: { frequency: "monthly" },
        isActive: true,
      },
      pricingConfig: {
        type: "hybrid",
        billingFrequency: "monthly",
        monthlyBase: 1500,
        hybridOpeningFees: 3000,
        accountsIncluded: 3,
        hybridLeveledAmountRate: 0.1,
        variableTriggerThreshold: 500000,
        hybridSecondaryAccountFees: 75,
      },
    },
  ]

  sampleContracts.forEach((contract) => addContract(contract))

  // Create sample amendments
  const sampleAmendments: Amendment[] = [
    {
      id: "amendment-1",
      conventionId: "contract-3",
      conventionReference: "CP-2025-018",
      amendmentNumber: "AVN-CP2025018-001",
      subject: "Modification des paramètres de tarification",
      reason: "Ajustement des frais selon les nouvelles conditions commerciales",
      effectiveDate: new Date("2026-04-01"),
      status: "pending_signature",
      previousPricingConfig: {
        type: "hybrid",
        billingFrequency: "monthly",
        monthlyBase: 1500,
        hybridOpeningFees: 3000,
        accountsIncluded: 3,
        hybridLeveledAmountRate: 0.1,
        variableTriggerThreshold: 500000,
        hybridSecondaryAccountFees: 75,
      },
      newPricingConfig: {
        type: "hybrid",
        billingFrequency: "monthly",
        monthlyBase: 1800,
        hybridOpeningFees: 3000,
        accountsIncluded: 4,
        hybridLeveledAmountRate: 0.12,
        variableTriggerThreshold: 400000,
        hybridSecondaryAccountFees: 100,
      },
      pdfUrl: "https://example.com/amendments/AVN-CP2025018-001.pdf",
      createdBy: "adria@admin.com",
      createdAt: new Date("2026-03-19"),
    },
    {
      id: "amendment-2",
      conventionId: "contract-3",
      conventionReference: "CP-2025-018",
      amendmentNumber: "AVN-CP2025018-000",
      subject: "Modification tarification",
      reason: "Réajustement suite à augmentation du volume",
      effectiveDate: new Date("2026-03-01"),
      status: "active",
      previousPricingConfig: {
        type: "hybrid",
        billingFrequency: "monthly",
        monthlyBase: 1200,
        hybridOpeningFees: 2500,
        accountsIncluded: 2,
        hybridLeveledAmountRate: 0.08,
        variableTriggerThreshold: 600000,
        hybridSecondaryAccountFees: 50,
      },
      newPricingConfig: {
        type: "hybrid",
        billingFrequency: "monthly",
        monthlyBase: 1500,
        hybridOpeningFees: 3000,
        accountsIncluded: 3,
        hybridLeveledAmountRate: 0.1,
        variableTriggerThreshold: 500000,
        hybridSecondaryAccountFees: 75,
      },
      pdfUrl: "https://example.com/amendments/AVN-CP2025018-000.pdf",
      createdBy: "adria@admin.com",
      createdAt: new Date("2026-02-10"),
      signedAt: new Date("2026-02-12"),
      signedBy: "client@example.com",
    },
  ]

  sampleAmendments.forEach((amendment) => addAmendment(amendment))

  // Create sample audit logs
  const sampleAuditLogs: AuditLogEntry[] = [
    // Contract 1 logs
    {
      id: "audit-contract-1-creation",
      entityType: "contract",
      entityId: "contract-1",
      action: "Convention CP-2026-001 créée",
      userEmail: "adria@admin.com",
      userName: "Adria Manager",
      userRole: "Chargé de clientèle",
      details: { clientName: "Groupe Vortex Global" },
      createdAt: new Date("2026-01-15"),
      changesSummary: "Création de la convention",
    },
    {
      id: "audit-contract-1-activation",
      entityType: "contract",
      entityId: "contract-1",
      action: "Convention CP-2026-001 activée",
      userEmail: "adria@admin.com",
      userName: "Adria Manager",
      userRole: "Chargé de clientèle",
      details: { status: "active" },
      createdAt: new Date("2026-01-16"),
      changesSummary: "Statut: Brouillon → Actif",
    },
    // Contract 2 logs (suspended)
    {
      id: "audit-contract-2-creation",
      entityType: "contract",
      entityId: "contract-2",
      action: "Convention CP-2026-002 créée",
      userEmail: "adria@admin.com",
      userName: "Adria Manager",
      userRole: "Chargé de clientèle",
      details: { clientName: "Groupe Stellium Dynamics" },
      createdAt: new Date("2026-02-02"),
      changesSummary: "Création de la convention",
    },
    {
      id: "audit-contract-2-activation",
      entityType: "contract",
      entityId: "contract-2",
      action: "Convention CP-2026-002 activée",
      userEmail: "adria@admin.com",
      userName: "Adria Manager",
      userRole: "Chargé de clientèle",
      details: { status: "active" },
      createdAt: new Date("2026-02-03"),
      changesSummary: "Statut: Brouillon → Actif",
    },
    {
      id: "audit-contract-2-suspension",
      entityType: "contract",
      entityId: "contract-2",
      action: "Convention CP-2026-002 suspendue",
      userEmail: "adria@admin.com",
      userName: "Adria Manager",
      userRole: "Chargé de clientèle",
      details: { reason: "Non-respect des obligations contractuelles" },
      createdAt: new Date("2026-03-01"),
      changesSummary: "Statut: Actif → Suspendue",
    },
    // Amendment logs
    {
      id: "audit-1",
      entityType: "amendment",
      entityId: "amendment-1",
      action: "Avenant AVN-CP2025018-001 généré",
      userEmail: "adria@admin.com",
      userName: "Adria Manager",
      userRole: "Chargé de clientèle",
      details: { subject: "Modification des paramètres de tarification" },
      createdAt: new Date("2026-03-19"),
      changesSummary: "Avenant en attente de signature",
    },
    {
      id: "audit-2",
      entityType: "convention",
      entityId: "contract-3",
      action: "Consultation de la convention",
      userEmail: "adria@admin.com",
      userName: "Adria Manager",
      userRole: "Chargé de clientèle",
      details: {},
      createdAt: new Date("2026-03-19"),
      changesSummary: "Consultation de la convention",
    },
    {
      id: "audit-3",
      entityType: "amendment",
      entityId: "amendment-2",
      action: "Avenant AVN-CP2025018-000 activé après signature",
      userEmail: "adria@admin.com",
      userName: "Adria Manager",
      userRole: "Chargé de clientèle",
      details: { signedAt: new Date("2026-02-12") },
      createdAt: new Date("2026-02-12"),
      changesSummary: "Avenant signé et activé",
    },
    {
      id: "audit-4",
      entityType: "amendment",
      entityId: "amendment-2",
      action: "Avenant AVN-CP2025018-000 généré",
      userEmail: "adria@admin.com",
      userName: "Adria Manager",
      userRole: "Chargé de clientèle",
      details: { subject: "Modification tarification" },
      createdAt: new Date("2026-02-10"),
      changesSummary: "Avenant en attente de signature",
    },
    {
      id: "audit-5",
      entityType: "convention",
      entityId: "contract-3",
      action: "Convention CP-2025-018 créée",
      userEmail: "adria@admin.com",
      userName: "Adria Manager",
      userRole: "Chargé de clientèle",
      details: { clientName: "Groupe Catalyst Ventures" },
      createdAt: new Date("2025-11-10"),
      changesSummary: "Création de la convention",
    },
  ]

  sampleAuditLogs.forEach((log) => addAuditLog(log))
}

// Helper function to extract unique leveling modes from hierarchy
export function extractLevelingModes(hierarchy: HierarchicalAccount): PoolingMode[] {
  const modes = new Set<PoolingMode>()
  const poolableAccounts = HierarchyManager.flattenToPoolableAccounts(hierarchy)
  
  poolableAccounts.forEach((account) => {
    if (account.mode) {
      modes.add(account.mode)
    }
  })
  
  return Array.from(modes)
}
