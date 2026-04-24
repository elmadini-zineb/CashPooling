"use client"

import { useState } from "react"
import type {
  Account,
  HierarchicalAccount,
  CashPoolingContract,
  InvestmentConfig,
  NotionalPoolingConfig,
  PeriodicityType,
  PricingConfig,
} from "@/lib/types"
import { mockAccounts } from "@/lib/mock-data"
import { generateContractNumber } from "@/lib/validation"
import { HierarchyManager } from "@/lib/hierarchy-manager"
import { canAccessPricing } from "@/lib/rbac"
import { StepSelection } from "./steps/step-selection"
import { StepStructure } from "./steps/step-structure"
import { StepPricing } from "./steps/step-pricing"
import { StepValidation } from "./steps/step-validation"
import { StepContract } from "./steps/step-contract"

interface UnifiedSubscriptionFlowProps {
  user: any
}

type FlowStep = "selection" | "structure" | "pricing" | "validation" | "contract"

export function UnifiedSubscriptionFlow({ user }: UnifiedSubscriptionFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>("selection")
  const [centralizerAccount, setCentralizerAccount] = useState<Account | null>(null)
  const [hierarchy, setHierarchy] = useState<HierarchicalAccount | null>(null)
  const [pricingAccountId, setPricingAccountId] = useState<string | undefined>(undefined)
  const [investmentConfig, setInvestmentConfig] = useState<InvestmentConfig | null>(null)
  const [notionalConfig, setNotionalConfig] = useState<NotionalPoolingConfig | null>(null)
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null)
  const [contractPeriodicity, setContractPeriodicity] = useState<{
    periodicityType: PeriodicityType
    frequency?: number
    unit?: "DAY" | "WEEK" | "MONTH"
    executionTime?: string
  } | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [generatedContract, setGeneratedContract] = useState<CashPoolingContract | null>(null)

  const defaultReportPricingConfig: PricingConfig = {
    type: "fixed",
    billingFrequency: "monthly",
    openingFees: 0,
    monthlySubscription: 0,
    contractGenerationFees: 0,
  }

  // Build steps dynamically based on user role
  const baseSteps: Array<{ key: FlowStep; label: string; number: number }> = [
    { key: "selection", label: "Sélection", number: 1 },
    { key: "structure", label: "Structuration", number: 2 },
  ]

  const pricingStep = { key: "pricing" as const, label: "Tarification", number: 3 }
  const afterPricingSteps: Array<{ key: FlowStep; label: string; number: number }> = [
    { key: "validation", label: "Validation", number: 4 },
    { key: "contract", label: "Contrat", number: 5 },
  ]

  const canAccessPricingStep = canAccessPricing(user?.role)
  
  // Adjust step numbers based on whether pricing is visible
  const steps = [
    ...baseSteps,
    ...(canAccessPricingStep ? [pricingStep] : []),
    ...afterPricingSteps.map((step) => ({
      ...step,
      number: step.number - (canAccessPricingStep ? 0 : 1),
    })),
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)

  const handleSelectionComplete = (account: Account) => {
    setCentralizerAccount(account)
    setCurrentStep("structure")
  }

  const handleStructureComplete = (
    validatedHierarchy: HierarchicalAccount,
    validatedInvestmentConfig: InvestmentConfig | null,
    validatedNotionalConfig: NotionalPoolingConfig | null,
    periodicity?: {
      periodicityType: PeriodicityType
      frequency?: number
      unit?: "DAY" | "WEEK" | "MONTH"
      executionTime?: string
    },
  ) => {
    setHierarchy(validatedHierarchy)
    setInvestmentConfig(validatedInvestmentConfig)
    setNotionalConfig(validatedNotionalConfig)
    if (periodicity) {
      setContractPeriodicity(periodicity)
    }

    const errors = HierarchyManager.validateHierarchy(validatedHierarchy)
    setValidationErrors(errors)

    if (errors.length === 0) {
      // Skip pricing step if user doesn't have access
      if (canAccessPricingStep) {
        setCurrentStep("pricing")
      } else {
        setCurrentStep("validation")
      }
    }
  }

  const handlePricingComplete = (config: PricingConfig, accountId: string) => {
    setPricingConfig(config)
    setPricingAccountId(accountId)
    setCurrentStep("validation")
  }

  const handleValidationComplete = () => {
    if (!centralizerAccount || !hierarchy) return

    const allSecondaryAccounts = HierarchyManager.flattenToPoolableAccounts(hierarchy)

    const contract: CashPoolingContract = {
      id: `contract-${Date.now()}`,
      contractNumber: generateContractNumber(),
      masterAccountId: centralizerAccount.id,
      masterAccount: centralizerAccount,
      secondaryAccounts: allSecondaryAccounts.map((config) => config.account),
      pricingAccountId: pricingAccountId,
      clientId: centralizerAccount.clientId,
      clientName: centralizerAccount.clientName,
      status: "registered", // Changed from "suspended" to "registered"
      currency: centralizerAccount.currency,
      createdBy: user?.email || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      investmentConfig: investmentConfig || undefined,
      notionalConfig: notionalConfig || undefined,
      pricingConfig: pricingConfig || defaultReportPricingConfig,
      periodicityType: contractPeriodicity?.periodicityType,
      periodicityFrequency: contractPeriodicity?.frequency,
      periodicityUnit: contractPeriodicity?.unit,
      periodicityExecutionTime: contractPeriodicity?.executionTime,
    }

    setGeneratedContract(contract)
    setCurrentStep("contract")
  }

  const handleReset = () => {
    setCentralizerAccount(null)
    setHierarchy(null)
    setPricingAccountId(undefined)
    setInvestmentConfig(null)
    setNotionalConfig(null)
    setPricingConfig(null)
    setValidationErrors([])
    setGeneratedContract(null)
    setCurrentStep("selection")
  }

  const handleBack = () => {
    const stepMap: Record<FlowStep, FlowStep> = {
      selection: "selection",
      structure: "selection",
      pricing: "structure",
      validation: canAccessPricingStep ? "pricing" : "structure",
      contract: "validation",
    }
    setCurrentStep(stepMap[currentStep])
  }

  return (
    <div className="space-y-6">
      {/* Progress Stepper */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    currentStepIndex > index
                      ? "bg-green-500 text-white"
                      : currentStepIndex === index
                        ? "bg-gradient-to-r from-orange-500 to-cyan-500 text-white"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {currentStepIndex > index ? "✓" : step.number}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{step.label}</p>
                  <p className="text-xs text-slate-500">Étape {step.number}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-slate-200 relative">
                  <div
                    className={`absolute inset-0 h-full transition-all ${
                      currentStepIndex > index ? "bg-green-500" : "bg-slate-200"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === "selection" && (
        <StepSelection
          accounts={mockAccounts}
          onComplete={handleSelectionComplete}
          initialAccount={centralizerAccount}
        />
      )}

      {currentStep === "structure" && centralizerAccount && (
        <StepStructure
          accounts={mockAccounts}
          centralizerAccount={centralizerAccount}
          onComplete={handleStructureComplete}
          onBack={handleBack}
          initialHierarchy={hierarchy}
          initialInvestmentConfig={investmentConfig}
          initialNotionalConfig={notionalConfig}
        />
      )}

      {currentStep === "pricing" && hierarchy && centralizerAccount && (
        <StepPricing
          hierarchy={hierarchy}
          accounts={mockAccounts}
          centralizerAccount={centralizerAccount}
          onComplete={handlePricingComplete}
          onBack={handleBack}
          initialConfig={pricingConfig}
          initialPricingAccountId={pricingAccountId}
        />
      )}

      {currentStep === "validation" && centralizerAccount && hierarchy && (
        <StepValidation
          centralizerAccount={centralizerAccount}
          hierarchy={hierarchy}
          investmentConfig={investmentConfig}
          notionalConfig={notionalConfig}
          pricingConfig={pricingConfig}
          periodicityType={contractPeriodicity?.periodicityType}
          periodicityFrequency={contractPeriodicity?.frequency}
          periodicityUnit={contractPeriodicity?.unit}
          periodicityExecutionTime={contractPeriodicity?.executionTime}
          onComplete={handleValidationComplete}
          onBack={handleBack}
          validationErrors={validationErrors}
        />
      )}

      {currentStep === "contract" && generatedContract && (
        <StepContract contract={generatedContract} hierarchy={hierarchy} user={user} onReset={handleReset} />
      )}
    </div>
  )
}
