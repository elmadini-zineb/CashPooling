export type AccountStatus = "active" | "inactive" | "closed"
export type ContractStatus = "draft" | "active" | "suspended" | "terminated" | "registered"
export type ClientType = "individual" | "group"

export interface Client {
  id: string
  name: string
  type: ClientType
  createdAt: Date
}

export interface Account {
  id: string
  accountNumber: string
  iban: string
  clientId: string
  clientName: string
  companyName: string // Raison sociale
  balance: number
  currency: string
  status: AccountStatus
  accountType: string
  registrationNumber?: string // RC (Registre de Commerce)
  businessIdentifier?: string // ICE (Identifiant Commun de l'Entreprise)
  taxIdentifier?: string // Identifiant fiscal
  createdAt: Date
  parentAccountId?: string // ID of the parent account (e.g., holding company)
  linkedAccountIds?: string[] // IDs of related accounts (e.g., subsidiaries)
}

export interface OPCVMFund {
  id: string
  name: string
  isin: string
  fundType: string
  currency: string
  minInvestment: number
  isActive: boolean
}

export type InvestmentMode = "partial" | "total"
export type InvestmentOrderType = "subscription" | "redemption"
export type InvestmentOrderStatus = "pending" | "executed" | "failed"

export type PeriodicityType = "DAILY" | "WEEKLY" | "MONTHLY" | "REAL_TIME" | "CUSTOM"
export type PeriodicityUnit = "DAY" | "WEEK" | "MONTH"

export interface InvestmentConfig {
  enabled: boolean
  surplusThreshold: number
  investmentMode: InvestmentMode
  investmentQuota: number // Percentage for partial mode (1-100)
  opcvmFundId: string
  opcvmFund?: OPCVMFund
  autoRedemptionEnabled: boolean
  effectiveDate: Date
  scheduling: SchedulingConfig // Orders generated based on this schedule
}

export interface InvestmentOrder {
  id: string
  contractId: string
  contractNumber: string
  orderType: InvestmentOrderType
  amount: number
  shares?: number
  opcvmFundId: string
  opcvmFundName: string
  status: InvestmentOrderStatus
  reason: string
  createdAt: Date
  executedAt?: Date
  masterAccountBalanceBefore: number
  masterAccountBalanceAfter: number
}

export interface InvestmentPortfolio {
  contractId: string
  opcvmFundId: string
  totalShares: number
  averagePurchasePrice: number
  currentValue: number
  lastUpdated: Date
}

export interface CashPoolingContract {
  id: string
  contractNumber: string
  masterAccountId: string
  masterAccount?: Account
  secondaryAccounts: Account[]
  pricingAccountId?: string // ID du compte de tarification (compte de facturation)
  clientId: string
  clientName: string
  status: ContractStatus
  currency: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  poolingConfig?: PoolingConfiguration
  investmentConfig?: InvestmentConfig // Added investment config to contract
  notionalConfig?: NotionalPoolingConfig // Added notional config to contract
  pricingConfig?: PricingConfig // Added pricing config to contract
  periodicityType?: PeriodicityType
  periodicityFrequency?: number
  periodicityUnit?: PeriodicityUnit
  periodicityExecutionTime?: string
  subscriberId?: string
  subscriberName?: string
}

export type PoolingMode = "ZBA" | "TBA" | "FBA"
export type BalancingFrequency = "daily" | "weekly" | "monthly" | "end_of_month" | "future_date"
export type BalancingStatus = "pending" | "executed" | "failed" | "skipped"

export type CoverageMode = "full" | "partial" | "none"

export interface DebitCoverageConfig {
  enabled: boolean
  mode: CoverageMode
  priority: number
  minCoverageAmount?: number
}

export interface SchedulingConfig {
  frequency: BalancingFrequency
  executionTime?: string // Time of day (HH:MM format)
  weeklyDay?: number // 1-5 for weekly (Monday to Friday)
  monthlyDay?: number // 1-30 for monthly
  futureDate?: Date // For one-time future execution
}

export interface PoolingConfiguration {
  mode: PoolingMode
  scheduling: SchedulingConfig
  targetBalance?: number
  minBalance?: number
  maxBalance?: number
  isActive: boolean
}

export interface SecondaryAccountConfig {
  accountId: string
  account: Account
  mode: PoolingMode
  targetBalance?: number
  minBalance?: number
  maxBalance?: number
  isActive: boolean
  debitCoverage?: DebitCoverageConfig
}

export interface BalancingOperation {
  id: string
  contractId: string
  contractNumber: string
  executedAt: Date
  status: BalancingStatus
  operations: BalancingTransaction[]
  totalAmount: number
  errorMessage?: string
}

export interface BalancingTransaction {
  id: string
  secondaryAccountId: string
  secondaryAccountNumber: string
  mode: PoolingMode
  balanceBefore: number
  balanceAfter: number
  transferAmount: number
  targetBalance?: number
  minBalance?: number
  maxBalance?: number
  status: BalancingStatus
  reason: string
  isDebitCoverage?: boolean
  coveredAmount?: number
  insufficientFunds?: boolean
}

export interface SimulationMovement {
  id: string
  source: string
  destination: string
  amount: number
  operationType: "ZBA" | "TBA" | "FBA" | "Coverage"
  status: "Success" | "Partial" | "Failed" | "Ignored"
  reason: string
}

export interface SimulationAccountImpact {
  account: Account
  initialBalance: number
  finalBalance: number
  netChange: number
  status: "Covered" | "Partial" | "Not Covered" | "Ignored"
  reason: string
}

export interface SimulationParameters {
  mode: PoolingMode
  targetBalance?: number
  minBalance?: number
  maxBalance?: number
}

export interface SimulationHistoryEntry {
  id: string
  contractId: string
  contractNumber: string
  contractName: string
  user: string
  createdAt: string
  parameters: SimulationParameters
  centralInitialBalance: number
  centralFinalBalance: number
  totalTransferred: number
  successCount: number
  partialCount: number
  failedCount: number
  movements: SimulationMovement[]
  impacts: SimulationAccountImpact[]
  logEntries: string[]
}

export interface ValidationError {
  field: string
  message: string
}

export interface AuditLogEntry {
  id: string
  entityType: "convention" | "amendment" | "contract"
  entityId: string
  action: string
  userEmail: string
  details: Record<string, any>
  createdAt: Date
}

export type AccountRole = "centralizer" | "intermediate" | "secondary"

export interface HierarchicalAccount {
  id: string
  account: Account
  role: AccountRole
  parentAccountId?: string
  children?: HierarchicalAccount[]
  poolingConfig?: SecondaryAccountConfig
  isCompensated?: boolean
  level: number
}

export interface MultiLevelContract extends CashPoolingContract {
  accountHierarchy: HierarchicalAccount
  intermediateAccounts: Account[]
  flattenedSecondaryAccounts: SecondaryAccountConfig[]
}

export interface Subscriber {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  isActive: boolean
  createdAt: Date
}

export interface NotionalPoolingConfig {
  enabled: boolean
  virtualMirrorAccountNumber?: string
  consolidatedBalance: number
  lastConsolidationAt?: Date
  allowOperationsOnConsolidated: boolean
}

export interface VirtualMirrorAccount {
  id: string
  accountNumber: string
  contractId: string
  consolidatedCreditBalance: number
  consolidatedDebitBalance: number
  netConsolidatedBalance: number
  linkedAccounts: string[]
  lastUpdatedAt: Date
}

export type PricingType = "fixed" | "variable" | "hybrid"
export type BillingFrequency = "monthly" | "quarterly" | "annual"

export interface PricingConfig {
  type: PricingType
  billingFrequency: BillingFrequency
  // Fixed pricing
  openingFees?: number
  monthlySubscription?: number
  contractGenerationFees?: number
  // Variable pricing
  leveledAmountRate?: number
  levelingOperationFees?: number
  secondaryAccountFees?: number
  // Hybrid pricing
  monthlyBase?: number
  hybridOpeningFees?: number
  accountsIncluded?: number
  hybridLeveledAmountRate?: number
  variableTriggerThreshold?: number
  hybridSecondaryAccountFees?: number
}

export type AmendmentStatus = "draft" | "generated" | "pending_signature" | "signed" | "active" | "rejected"

export interface Amendment {
  id: string
  conventionId: string
  conventionReference: string
  amendmentNumber: string // AVN-CP2026001-001 format
  subject: string
  reason: string
  effectiveDate: Date
  status: AmendmentStatus
  
  // Sections being modified
  modifyPricing: boolean
  modifyLeveling: boolean
  modifyDebitCoverage: boolean
  modifySecondaryAccounts: boolean
  modifyIntermediateAccounts: boolean
  
  // Pricing modifications
  previousPricingConfig: PricingConfig
  newPricingConfig: PricingConfig
  
  // Leveling modifications (if applicable)
  levelingChanges?: {
    casablanca?: { oldMode: string; newMode: string; params?: any }
    rabat?: { oldMode: string; newMode: string; params?: any }
    tanger?: { oldMode: string; newMode: string; params?: any }
  }
  
  // Debit coverage modifications (if applicable)
  debitCoverageChanges?: {
    oldMode: CoverageMode
    newMode: CoverageMode
    oldPriorities?: any
    newPriorities?: any
  }
  
  // Secondary accounts modifications (if applicable)
  accountsChanges?: {
    accountsToAdd: Account[]
    accountsToRemove: string[] // IDs
  }
  
  // Intermediate accounts modifications (if applicable)
  intermediateAccountsChanges?: {
    accountsToAdd: Account[]
    accountsToRemove: string[] // IDs
  }
  
  pdfUrl?: string
  createdBy: string // Manager email
  createdAt: Date
  signedAt?: Date
  signedBy?: string
  rejectionReason?: string
}

export interface PricingChange {
  field: string
  oldValue: any
  newValue: any
  changed: boolean
}

export type UserRole = "Chargé de clientèle" | "Admin" | "Client"

export interface User {
  email: string
  name: string
  role: UserRole
  password?: string
}

// Pricing Configuration Types
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

// Cash Pooling Leveling Mode Type
export type LevelingMode = "ZBA" | "TBA" | "FBA"

// COUCHE 1: Tarification de base
export interface BasePricing {
  id: string
  // Abonnement fixe
  fixedFee: number
  fixedFeeCurrency: string
  fixedFeeBillingCycle: "monthly" | "quarterly" | "yearly"
  
  // Tarif par nombre de comptes (barèmes)
  accountCountBrackets: AccountCountBracket[]
}

export interface AccountCountBracket {
  id: string
  minAccounts: number
  maxAccounts: number | null // null = illimité
  feePerAccount: number
  isActive: boolean
}

// COUCHE 2: Tarification par opération
export interface OperationPricing {
  id: string
  operationType: "virement" | "sweep" | "autre"
  pricingType: "fixe" | "pourcentage"
  minAmount: number
  maxAmount: number | null // null = illimité
  value: number // montant fixe ou pourcentage
  isActive: boolean
}

// COUCHE 3: Tarification par mode de nivellement
export interface LevelingModePricing {
  id: string
  levelingMode: LevelingMode
  pricingType: "fixe" | "pourcentage"
  value: number
  isActive: boolean
  description?: string
}

// Configuration complète Adria modulaire
export interface AdriaModularPricing {
  id: string
  currency: string
  basePricing: BasePricing
  operationPricings: OperationPricing[]
  levelingModePricings: LevelingModePricing[]
  createdAt: Date
  updatedAt: Date
}

// Ancien modèle conservé pour rétrocompatibilité
export type PricingModelType = "fixed" | "variable" | "hybrid"

export interface FixedPricingModel {
  type: "fixed"
  amount: number
  currency: string
  billingCycle: "monthly" | "quarterly" | "yearly"
}

export interface VariablePricingModel {
  type: "variable"
  ratePercentage: number
  minFee?: number
  maxFee?: number
  feePerOperation?: number
  numberOfSweeps?: number
  targetAmount?: number
  allowedVariance?: number
  totalLeveledAmount?: number
}

export interface HybridPricingModel {
  type: "hybrid"
  fixedPart: {
    amount: number
    currency: string
    billingCycle: "monthly" | "quarterly" | "yearly"
  }
  variablePart: {
    ratePercentage: number
    minFee?: number
    maxFee?: number
    feePerOperation?: number
  }
}

export type PricingModel = FixedPricingModel | VariablePricingModel | HybridPricingModel

// Discount Types - Remises personnalisées par entreprise
export type DiscountType = "percentage" | "fixed_amount"
export type DiscountScope = "global" | "fixed_subscription" | "variable_operation" | "leveling_mode"

export interface CompanyDiscount {
  id: string
  clientId: string // Référence client
  clientName: string // Intitulé client
  discountType: DiscountType // Pourcentage ou Montant fixe
  discountValue: number // Valeur en % ou MAD
  scope: DiscountScope // Portée de la remise
  isActive: boolean
  validFrom: Date
  validUntil?: Date // Optional: pour les promotions temporaires
  description?: string
  createdAt: Date
  updatedAt: Date
  createdBy?: string // Admin qui a créé la remise
}

export interface DiscountHistory {
  id: string
  clientId: string
  discountId: string
  previousValue: number
  newValue: number
  reason?: string
  changedAt: Date
  changedBy?: string
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
