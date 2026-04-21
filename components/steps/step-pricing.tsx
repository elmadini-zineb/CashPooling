"use client"

import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { HierarchicalAccount, PricingConfig } from "@/lib/types"
import { Info } from "lucide-react"

interface StepPricingProps {
  hierarchy: HierarchicalAccount
  onComplete: (config: PricingConfig) => void
  onBack: () => void
}

export function StepPricing({ hierarchy, onComplete, onBack }: StepPricingProps) {
  const defaultPricingConfig: PricingConfig = {
    type: "fixed",
    billingFrequency: "monthly",
    openingFees: 0,
    monthlySubscription: 0,
    contractGenerationFees: 0,
  }

  const handleContinue = () => {
    onComplete(defaultPricingConfig)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Étape 3: Tarification</CardTitle>
        <CardDescription>La tarification est incluse automatiquement dans le contrat généré.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-orange-600 mt-1" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Mode de tarification : Report simple (aligné EBICS)</p>
              <p className="text-sm text-slate-600 mt-2">
                La tarification sera incluse automatiquement dans le contrat généré. Aucun paramètre de tarification n'est modifiable dans le MVP.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mode</p>
              <p className="text-base font-semibold text-slate-900">Report simple</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Périodicité</p>
              <p className="text-base font-semibold text-slate-900">Mensuelle</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={onBack} variant="outline" size="lg">
            Retour
          </Button>
          <Button onClick={handleContinue} size="lg" className="flex-1">
            Continuer vers validation
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
