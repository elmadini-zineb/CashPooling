"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Account, HierarchicalAccount, InvestmentConfig, NotionalPoolingConfig, PeriodicityType } from "@/lib/types"
import { HierarchyBuilder } from "@/components/hierarchy-builder"
import { InvestmentConfigPanel } from "@/components/investment-config-panel"
import { ContractPeriodicityPanel } from "@/components/contract-periodicity-panel"
import { mockOPCVMFunds } from "@/lib/mock-data"
import { NetworkIcon, TrendingUp, DollarSign, Info } from "lucide-react"

interface StepStructureProps {
  accounts: Account[]
  centralizerAccount: Account
  onComplete: (
    hierarchy: HierarchicalAccount,
    investmentConfig: InvestmentConfig | null,
    notionalConfig: NotionalPoolingConfig | null,
    pricingAccountId?: string,
    periodicity?: {
      periodicityType: PeriodicityType
      frequency?: number
      unit?: "DAY" | "WEEK" | "MONTH"
      executionTime?: string
      dailyInterval?: number
      weeklyInterval?: number
      weekDays?: string[]
      monthlyInterval?: number
      monthlyDay?: number
      recurrenceStartDate?: Date
      recurrenceEndType?: "none" | "after-occurrences" | "on-date"
      recurrenceEndOccurrences?: number
      recurrenceEndDate?: Date
    },
  ) => void
  onBack: () => void
  initialHierarchy: HierarchicalAccount | null
  initialInvestmentConfig: InvestmentConfig | null
  initialNotionalConfig: NotionalPoolingConfig | null
  initialPricingAccountId?: string
}

export function StepStructure({
  accounts,
  centralizerAccount,
  onComplete,
  onBack,
  initialInvestmentConfig,
  initialPricingAccountId,
}: StepStructureProps) {
  const [localHierarchy, setLocalHierarchy] = useState<HierarchicalAccount | null>(null)
  const [localInvestmentConfig, setLocalInvestmentConfig] = useState<InvestmentConfig | null>(initialInvestmentConfig)
  const [localNotionalConfig, setLocalNotionalConfig] = useState<NotionalPoolingConfig | null>(null)
  const [localPricingAccountId, setLocalPricingAccountId] = useState<string | undefined>(initialPricingAccountId || centralizerAccount.id)
  const [localPeriodicity, setLocalPeriodicity] = useState<{
    periodicityType: PeriodicityType
    frequency?: number
    unit?: "DAY" | "WEEK" | "MONTH"
    executionTime?: string
    dailyInterval?: number
    weeklyInterval?: number
    weekDays?: string[]
    monthlyInterval?: number
    monthlyDay?: number
    recurrenceStartDate?: Date
    recurrenceEndType?: "none" | "after-occurrences" | "on-date"
    recurrenceEndOccurrences?: number
    recurrenceEndDate?: Date
  }>({
    periodicityType: "WEEKLY",
    executionTime: undefined,
    weeklyInterval: 1,
    weekDays: ["MON", "FRI"],
    recurrenceStartDate: new Date(),
    recurrenceEndType: "none",
  })
  const [periodicityError, setPeriodicityError] = useState<string | null>(null)
  const [isNotionalPooling, setIsNotionalPooling] = useState(false)
  const [activeTab, setActiveTab] = useState("hierarchy")

  const handleContinue = () => {
    let isValidPeriodicity = true
    let errorMessage = ""

    // Validate based on periodicity type
    if (localPeriodicity.periodicityType === "DAILY") {
      if (!localPeriodicity.dailyInterval || localPeriodicity.dailyInterval <= 0) {
        isValidPeriodicity = false
        errorMessage = "Veuillez spécifier l'intervalle quotidien (nombre de jours)."
      }
    } else if (localPeriodicity.periodicityType === "WEEKLY") {
      if (!localPeriodicity.weeklyInterval || localPeriodicity.weeklyInterval <= 0) {
        isValidPeriodicity = false
        errorMessage = "Veuillez spécifier l'intervalle hebdomadaire (nombre de semaines)."
      }
      if (!localPeriodicity.weekDays || localPeriodicity.weekDays.length === 0) {
        isValidPeriodicity = false
        errorMessage = "Veuillez sélectionner au moins un jour de la semaine."
      }
    } else if (localPeriodicity.periodicityType === "MONTHLY") {
      if (!localPeriodicity.monthlyInterval || localPeriodicity.monthlyInterval <= 0) {
        isValidPeriodicity = false
        errorMessage = "Veuillez spécifier l'intervalle mensuel (nombre de mois)."
      }
      if (!localPeriodicity.monthlyDay || localPeriodicity.monthlyDay < 1 || localPeriodicity.monthlyDay > 31) {
        isValidPeriodicity = false
        errorMessage = "Veuillez sélectionner un jour valide du mois (1-31)."
      }
    } else if (localPeriodicity.periodicityType === "CUSTOM") {
      if (!localPeriodicity.frequency || localPeriodicity.frequency <= 0 || !localPeriodicity.unit) {
        isValidPeriodicity = false
        errorMessage = "La périodicité personnalisée nécessite une fréquence et une unité."
      }
    }

    // Validate recurrence range
    if (isValidPeriodicity) {
      if (!localPeriodicity.recurrenceStartDate) {
        isValidPeriodicity = false
        errorMessage = "Veuillez spécifier la date de début de la récurrence."
      }
      if (
        localPeriodicity.recurrenceEndType === "after-occurrences" &&
        (!localPeriodicity.recurrenceEndOccurrences || localPeriodicity.recurrenceEndOccurrences <= 0)
      ) {
        isValidPeriodicity = false
        errorMessage = "Veuillez spécifier le nombre d'occurrences."
      }
      if (localPeriodicity.recurrenceEndType === "on-date" && !localPeriodicity.recurrenceEndDate) {
        isValidPeriodicity = false
        errorMessage = "Veuillez spécifier la date de fin."
      }
    }

    if (!isValidPeriodicity) {
      setPeriodicityError(errorMessage)
      return
    }

    setPeriodicityError(null)

    if (localHierarchy && localPricingAccountId) {
      onComplete(localHierarchy, localInvestmentConfig, localNotionalConfig, localPricingAccountId, localPeriodicity)
    }
  }

  const handleHierarchyChange = (
    hierarchy: HierarchicalAccount | null, 
    isNotional: boolean, 
    notionalConfig: NotionalPoolingConfig | null
  ) => {
    setLocalHierarchy(hierarchy)
    setIsNotionalPooling(isNotional)
    setLocalNotionalConfig(notionalConfig)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Étape 2: Structurer la hiérarchie et le nivellement</CardTitle>
        <CardDescription>
          Configurez la structure multi-niveaux{isNotionalPooling ? " (Pooling Notionnel)" : ", les paramètres de nivellement"} et les placements OPCVM
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hierarchy" className="flex items-center gap-2">
              <NetworkIcon className="w-4 h-4" />
              Hiérarchie & Nivellement
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Tarification
            </TabsTrigger>
            <TabsTrigger value="investment" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Placement OPCVM
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hierarchy" className="mt-6 space-y-6">
            <HierarchyBuilder
              accounts={accounts}
              centralizerAccount={centralizerAccount}
              onHierarchyChange={handleHierarchyChange}
            />
            <ContractPeriodicityPanel
              value={localPeriodicity}
              onChange={setLocalPeriodicity}
              error={periodicityError ?? undefined}
            />
          </TabsContent>

          <TabsContent value="pricing" className="mt-6">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-orange-600 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Tarification</p>
                  <p className="text-sm text-slate-600">Mode de tarification : Report simple (aligné EBICS)</p>
                </div>
              </div>
              <p className="text-sm text-slate-700">
                La tarification sera incluse automatiquement dans le contrat généré.
                Aucun paramètre de tarification n'est modifiable dans cette étape du MVP.
              </p>
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mode de tarification</p>
                  <p className="text-base font-semibold text-slate-900">Report simple (EBICS)</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Devise</p>
                  <p className="text-base font-semibold text-slate-900">{centralizerAccount.currency}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="investment" className="mt-6">
            <InvestmentConfigPanel
              config={localInvestmentConfig}
              currency={centralizerAccount.currency}
              availableFunds={mockOPCVMFunds}
              onChange={setLocalInvestmentConfig}
            />
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={onBack} variant="outline" size="lg">
            Retour
          </Button>
          <Button onClick={handleContinue} disabled={!localHierarchy} size="lg" className="flex-1">
            Continuer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
