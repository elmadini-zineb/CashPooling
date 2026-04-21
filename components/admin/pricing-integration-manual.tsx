'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Plus, Trash2 } from "lucide-react"

interface PricingIntegrationManualProps {
  onSuccess: (summary: string) => void
  onError: (error: string) => void
}

interface Threshold {
  id: string
  minAmount: number
  maxAmount: number | null
  rate: number
}

export function PricingIntegrationManual({ onSuccess, onError }: PricingIntegrationManualProps) {
  const [pricingType, setPricingType] = useState<"fixed" | "variable">("fixed")
  const [currency, setCurrency] = useState("MAD")

  // Fixed Pricing
  const [fixedAmount, setFixedAmount] = useState(1000)
  const [fixedBilling, setFixedBilling] = useState("monthly")

  // Variable Pricing
  const [baseRate, setBaseRate] = useState(0.5)
  const [minFee, setMinFee] = useState(100)
  const [maxFee, setMaxFee] = useState(5000)
  const [thresholds, setThresholds] = useState<Threshold[]>([
    { id: "1", minAmount: 0, maxAmount: 1000000, rate: 0.5 },
    { id: "2", minAmount: 1000001, maxAmount: 5000000, rate: 0.35 },
    { id: "3", minAmount: 5000001, maxAmount: null, rate: 0.25 },
  ])

  const handleAddThreshold = () => {
    setThresholds([
      ...thresholds,
      {
        id: Date.now().toString(),
        minAmount: 0,
        maxAmount: null,
        rate: 0.3,
      },
    ])
  }

  const handleRemoveThreshold = (id: string) => {
    setThresholds(thresholds.filter((t) => t.id !== id))
  }

  const handleUpdateThreshold = (id: string, field: keyof Threshold, value: any) => {
    setThresholds(
      thresholds.map((t) =>
        t.id === id
          ? {
              ...t,
              [field]: field === "minAmount" || field === "maxAmount" || field === "rate" ? parseFloat(value) || 0 : value,
            }
          : t
      )
    )
  }

  const handleSave = () => {
    if (pricingType === "fixed" && fixedAmount <= 0) {
      onError("Montant fixe doit être supérieur à 0")
      return
    }

    if (pricingType === "variable" && thresholds.length === 0) {
      onError("Ajoutez au moins un seuil variable")
      return
    }

    let summary = ""
    if (pricingType === "fixed") {
      summary = `Tarification manuelle fixe: ${fixedAmount} ${currency}/${fixedBilling}`
    } else {
      summary = `Tarification manuelle variable: ${baseRate}% (${thresholds.length} seuils)`
    }

    onSuccess(summary)
  }

  return (
    <div className="space-y-6">
      {/* Type Selection */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">Paramètres généraux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Currency */}
          <div>
            <Label htmlFor="currency" className="text-sm font-medium text-slate-700 mb-2 block">
              Devise
            </Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MAD">MAD (Dirham)</SelectItem>
                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                <SelectItem value="USD">USD (Dollar)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pricing Type */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-3 block">Type de tarification</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="fixed"
                  checked={pricingType === "fixed"}
                  onChange={(e) => setPricingType(e.target.value as "fixed" | "variable")}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-700">Fixe</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="variable"
                  checked={pricingType === "variable"}
                  onChange={(e) => setPricingType(e.target.value as "fixed" | "variable")}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-700">Variable</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fixed Pricing */}
      {pricingType === "fixed" && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Tarification fixe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fixed-amount" className="text-sm font-medium text-slate-700 mb-2 block">
                  Montant ({currency})
                </Label>
                <Input
                  id="fixed-amount"
                  type="number"
                  min="0"
                  step="10"
                  value={fixedAmount}
                  onChange={(e) => setFixedAmount(parseFloat(e.target.value) || 0)}
                  className="bg-white border-slate-300"
                />
              </div>
              <div>
                <Label htmlFor="fixed-billing" className="text-sm font-medium text-slate-700 mb-2 block">
                  Fréquence
                </Label>
                <Select value={fixedBilling} onValueChange={setFixedBilling}>
                  <SelectTrigger className="bg-white border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="quarterly">Trimestriel</SelectItem>
                    <SelectItem value="yearly">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-slate-50 rounded border border-slate-200">
              <p className="text-sm text-slate-700">
                <strong>Résumé:</strong> {fixedAmount.toLocaleString("fr-FR")} {currency} par {fixedBilling === "monthly" ? "mois" : fixedBilling === "quarterly" ? "trimestre" : "an"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variable Pricing */}
      {pricingType === "variable" && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Tarification variable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Base Settings */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="base-rate" className="text-sm font-medium text-slate-700 mb-2 block">
                  Taux de base (%)
                </Label>
                <Input
                  id="base-rate"
                  type="number"
                  min="0"
                  step="0.1"
                  value={baseRate}
                  onChange={(e) => setBaseRate(parseFloat(e.target.value) || 0)}
                  className="bg-white border-slate-300"
                />
              </div>
              <div>
                <Label htmlFor="min-fee" className="text-sm font-medium text-slate-700 mb-2 block">
                  Frais min ({currency})
                </Label>
                <Input
                  id="min-fee"
                  type="number"
                  min="0"
                  step="10"
                  value={minFee}
                  onChange={(e) => setMinFee(parseFloat(e.target.value) || 0)}
                  className="bg-white border-slate-300"
                />
              </div>
              <div>
                <Label htmlFor="max-fee" className="text-sm font-medium text-slate-700 mb-2 block">
                  Frais max ({currency})
                </Label>
                <Input
                  id="max-fee"
                  type="number"
                  min="0"
                  step="10"
                  value={maxFee}
                  onChange={(e) => setMaxFee(parseFloat(e.target.value) || 0)}
                  className="bg-white border-slate-300"
                />
              </div>
            </div>

            {/* Thresholds */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-slate-700">Seuils variables</Label>
                <Button
                  onClick={handleAddThreshold}
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter seuil
                </Button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {thresholds.map((threshold, idx) => (
                  <div key={threshold.id} className="flex gap-2 items-end p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="flex-1">
                      <Label className="text-xs text-slate-600">Min ({currency})</Label>
                      <Input
                        type="number"
                        value={threshold.minAmount}
                        onChange={(e) => handleUpdateThreshold(threshold.id, "minAmount", e.target.value)}
                        className="bg-white border-slate-300 text-sm h-8 mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-slate-600">Max ({currency})</Label>
                      <Input
                        type="number"
                        value={threshold.maxAmount || ""}
                        placeholder="Illimité"
                        onChange={(e) =>
                          handleUpdateThreshold(threshold.id, "maxAmount", e.target.value ? parseFloat(e.target.value) : null)
                        }
                        className="bg-white border-slate-300 text-sm h-8 mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-slate-600">Taux (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={threshold.rate}
                        onChange={(e) => handleUpdateThreshold(threshold.id, "rate", e.target.value)}
                        className="bg-white border-slate-300 text-sm h-8 mt-1"
                      />
                    </div>
                    <Button
                      onClick={() => handleRemoveThreshold(threshold.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        Enregistrer cette configuration manuelle
      </Button>

      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          Configuration manuelle: définissez les paramètres de tarification directement. Idéal pour les tarifications simples et claires.
        </AlertDescription>
      </Alert>
    </div>
  )
}
