"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, CircleDollarSign, AlertCircle, CheckCircle2, Info } from "lucide-react"
import type { InvestmentConfig, OPCVMFund } from "@/lib/types"
import { InvestmentEngine } from "@/lib/investment-engine"
import { SchedulingConfigComponent } from "@/components/scheduling-config"

interface InvestmentConfigPanelProps {
  config: InvestmentConfig | null
  currency: string
  availableFunds: OPCVMFund[]
  onChange: (config: InvestmentConfig) => void
}

export function InvestmentConfigPanel({ config, currency, availableFunds, onChange }: InvestmentConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState<InvestmentConfig>(
    config || {
      enabled: false,
      surplusThreshold: 100000,
      investmentMode: "partial",
      investmentQuota: 80,
      opcvmFundId: "",
      autoRedemptionEnabled: true,
      effectiveDate: new Date(),
      scheduling: {
        frequency: "daily",
        executionTime: "09:00",
      },
    },
  )

  const compatibleFunds = availableFunds.filter((fund) => fund.currency === currency && fund.isActive)

  const handleUpdate = (updates: Partial<InvestmentConfig>) => {
    const updated = { ...localConfig, ...updates }

    // Update OPCVM fund reference
    if (updates.opcvmFundId) {
      updated.opcvmFund = compatibleFunds.find((f) => f.id === updates.opcvmFundId)
    }

    setLocalConfig(updated)
    onChange(updated)
  }

  const validationErrors = localConfig.enabled ? InvestmentEngine.validateInvestmentConfig(localConfig) : []

  return (
    <Card className="border-cyan-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>Placement OPCVM Automatique</CardTitle>
            <CardDescription>Optimisez vos excédents de trésorerie</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            <CircleDollarSign className="w-5 h-5 text-cyan-600" />
            <div>
              <Label className="text-sm font-medium">Activer les placements automatiques</Label>
              <p className="text-xs text-slate-500">Gérer automatiquement vos excédents de trésorerie</p>
            </div>
          </div>
          <Switch checked={localConfig.enabled} onCheckedChange={(enabled) => handleUpdate({ enabled })} />
        </div>

        {localConfig.enabled && (
          <>
            {/* Info Alert */}
            <Alert className="border-cyan-200 bg-cyan-50">
              <Info className="h-4 w-4 text-cyan-600" />
              <AlertDescription className="text-sm text-cyan-900">
                Les placements sont déclenchés uniquement lorsque le solde du compte centralisateur dépasse le seuil
                d'excédent défini.
              </AlertDescription>
            </Alert>

            {/* Surplus Threshold */}
            <div className="space-y-2">
              <Label htmlFor="surplusThreshold">
                Seuil d'excédent <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="surplusThreshold"
                  type="number"
                  min="0"
                  step="1000"
                  value={localConfig.surplusThreshold}
                  onChange={(e) => handleUpdate({ surplusThreshold: Number(e.target.value) })}
                  className="flex-1"
                />
                <div className="flex items-center px-3 bg-slate-100 rounded-md text-sm font-medium text-slate-600">
                  {currency}
                </div>
              </div>
              <p className="text-xs text-slate-500">Montant minimum à partir duquel les placements sont déclenchés</p>
            </div>

            {/* Investment Mode */}
            <div className="space-y-2">
              <Label htmlFor="investmentMode">
                Mode de placement <span className="text-red-500">*</span>
              </Label>
              <Select
                value={localConfig.investmentMode}
                onValueChange={(value: "partial" | "total") => handleUpdate({ investmentMode: value })}
              >
                <SelectTrigger id="investmentMode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partial">Partiel - Investir une quotité définie</SelectItem>
                  <SelectItem value="total">Total - Investir tout l'excédent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Investment Quota (for partial mode) */}
            {localConfig.investmentMode === "partial" && (
              <div className="space-y-2">
                <Label htmlFor="investmentQuota">
                  Quotité d'investissement <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="investmentQuota"
                    type="number"
                    min="1"
                    max="100"
                    value={localConfig.investmentQuota}
                    onChange={(e) => handleUpdate({ investmentQuota: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <div className="flex items-center px-3 bg-slate-100 rounded-md text-sm font-medium text-slate-600">
                    %
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Pourcentage de l'excédent à investir (1-100%). Le reste demeure sur le compte centralisateur.
                </p>
              </div>
            )}

            {/* OPCVM Selection */}
            <div className="space-y-2">
              <Label htmlFor="opcvmFund">
                OPCVM cible <span className="text-red-500">*</span>
              </Label>
              <Select value={localConfig.opcvmFundId} onValueChange={(value) => handleUpdate({ opcvmFundId: value })}>
                <SelectTrigger id="opcvmFund">
                  <SelectValue placeholder="Sélectionner un OPCVM..." />
                </SelectTrigger>
                <SelectContent>
                  {compatibleFunds.map((fund) => (
                    <SelectItem key={fund.id} value={fund.id}>
                      <div>
                        <div className="font-medium">{fund.name}</div>
                        <div className="text-xs text-slate-500">
                          {fund.fundType} - Min: {fund.minInvestment.toLocaleString("fr-FR")} {fund.currency}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">Un seul OPCVM par contrat</p>
            </div>

            {/* Auto Redemption */}
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <Label className="text-sm font-medium text-orange-900">Rachat automatique en cas de déficit</Label>
                  <p className="text-xs text-orange-700">Racheter des parts OPCVM si le solde devient négatif</p>
                </div>
              </div>
              <Switch
                checked={localConfig.autoRedemptionEnabled}
                onCheckedChange={(autoRedemptionEnabled) => handleUpdate({ autoRedemptionEnabled })}
              />
            </div>

            {/* Scheduling Configuration */}
            <SchedulingConfigComponent
              config={localConfig.scheduling}
              onChange={(scheduling) => handleUpdate({ scheduling })}
              label="Fréquence des ordres OPCVM"
            />

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, idx) => (
                      <li key={idx} className="text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Success */}
            {validationErrors.length === 0 && localConfig.opcvmFundId && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-900">
                  Configuration valide - Les placements seront exécutés automatiquement selon vos paramètres
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
