"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { HierarchicalAccount, PricingConfig, Account } from "@/lib/types"
import { Info, Check, Zap, BarChart3 } from "lucide-react"

interface StepPricingProps {
  hierarchy: HierarchicalAccount
  accounts: Account[]
  centralizerAccount: Account
  onComplete: (config: PricingConfig, pricingAccountId: string) => void
  onBack: () => void
  initialConfig?: PricingConfig
  initialPricingAccountId?: string
}

interface PricingCode {
  id: "reporting" | "transactional" | "combined"
  label: string
  subtitle: string
  icon: React.ReactNode
  standardAmount: number
  lot: "1" | "2"
}

const PRICING_CODES: PricingCode[] = [
  {
    id: "reporting",
    label: "Reporting",
    subtitle: "Services de reporting uniquement",
    icon: <BarChart3 className="w-6 h-6" />,
    standardAmount: 400,
    lot: "1",
  },
  {
    id: "transactional",
    label: "Transactionnel",
    subtitle: "Opérations de paiement et virements",
    icon: <Zap className="w-6 h-6" />,
    standardAmount: 600,
    lot: "2",
  },
  {
    id: "combined",
    label: "Reporting + Transactionnel",
    subtitle: "Offre combinée complète",
    icon: <BarChart3 className="w-6 h-6" />,
    standardAmount: 900,
    lot: "2",
  },
]

const CURRENT_LOT = "1" // In Lot 1, only Reporting is active

export function StepPricing({ hierarchy, accounts, centralizerAccount, onComplete, onBack, initialConfig, initialPricingAccountId }: StepPricingProps) {
  const [selectedPricingCode, setSelectedPricingCode] = useState<"reporting" | "transactional" | "combined" | null>(
    initialConfig?.pricingCodeType || "reporting"
  )
  const [hasPreferentialRate, setHasPreferentialRate] = useState(initialConfig?.hasPreferentialRate || false)
  const [preferentialRate, setPreferentialRate] = useState(initialConfig?.preferentialRate || 400)
  const [pricingAccountId, setPricingAccountId] = useState<string>(initialPricingAccountId || centralizerAccount.id)

  // Organiser les comptes: d'abord ceux du client sélectionné, puis les autres
  const clientAccounts = accounts.filter(a => a.clientId === centralizerAccount.clientId)
  const otherAccounts = accounts.filter(a => a.clientId !== centralizerAccount.clientId)
  const organizedAccounts = [...clientAccounts, ...otherAccounts]

  const selectedCode = useMemo(
    () => PRICING_CODES.find((code) => code.id === selectedPricingCode),
    [selectedPricingCode]
  )

  const standardAmount = useMemo(
    () => (selectedCode ? selectedCode.standardAmount : 400),
    [selectedCode]
  )

  const isPreferentialRateValid = useMemo(() => {
    if (!hasPreferentialRate) return true
    return preferentialRate > 0 && preferentialRate < standardAmount
  }, [hasPreferentialRate, preferentialRate, standardAmount])

  const appliedAmount = hasPreferentialRate ? preferentialRate : standardAmount

  const handleContinue = () => {
    if (!selectedPricingCode) return

    const config: PricingConfig = {
      type: "fixed",
      billingFrequency: "monthly",
      openingFees: 0,
      monthlySubscription: 0,
      contractGenerationFees: 0,
      pricingCodeType: selectedPricingCode,
      preferentialRate: hasPreferentialRate ? preferentialRate : undefined,
      hasPreferentialRate,
      radical: "RAD123", // This would come from the centralizer account
    }

    onComplete(config, pricingAccountId)
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Compte de facturation - PREMIER */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compte de facturation</CardTitle>
          <CardDescription>Sélectionnez le compte à utiliser pour la facturation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* Comptes du client sélectionné */}
            {clientAccounts.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                  Comptes du client: {centralizerAccount.clientName}
                </Label>
                <select
                  value={pricingAccountId}
                  onChange={(e) => setPricingAccountId(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-blue-300 rounded-md bg-blue-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {clientAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountNumber} - {account.iban}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Autres comptes */}
            {otherAccounts.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-slate-400 rounded-full"></span>
                  Autres comptes
                </Label>
                <select
                  value={pricingAccountId}
                  onChange={(e) => setPricingAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {otherAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountNumber} - {account.iban} ({account.clientName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <p className="text-xs text-slate-500 pt-2 border-t">
              Compte sélectionné: <span className="font-semibold text-slate-900">{organizedAccounts.find(a => a.id === pricingAccountId)?.accountNumber || "—"}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Code Tarif Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Code tarif</CardTitle>
          <CardDescription>Sélectionnez le service approprié pour cette convention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {PRICING_CODES.map((code) => {
              const isDisabled = CURRENT_LOT === "1" && code.lot === "2"
              const isSelected = selectedPricingCode === code.id

              return (
                <button
                  key={code.id}
                  onClick={() => !isDisabled && setSelectedPricingCode(code.id)}
                  disabled={isDisabled}
                  className={`relative rounded-lg border-2 p-4 text-left transition-all ${
                    isSelected && !isDisabled
                      ? "border-blue-500 bg-blue-50"
                      : isDisabled
                        ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                        : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                  }`}
                >
                  {/* Lot 2 Badge */}
                  {code.lot === "2" && CURRENT_LOT === "1" && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                        Lot 2
                      </Badge>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`text-2xl ${isDisabled ? "text-slate-400" : isSelected ? "text-blue-600" : "text-slate-600"}`}>
                      {code.icon}
                    </div>
                    {isSelected && !isDisabled && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className={`font-semibold mb-1 ${isDisabled ? "text-slate-500" : "text-slate-900"}`}>
                    {code.label}
                  </h3>
                  <p className={`text-sm ${isDisabled ? "text-slate-400" : "text-slate-600"}`}>
                    {code.subtitle}
                  </p>

                  {/* Tooltip for Lot 2 disabled */}
                  {isDisabled && (
                    <p className="text-xs text-amber-700 mt-2 italic">
                      Disponible lors du déploiement Lot 2
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lot 1 Info Banner */}
      {CURRENT_LOT === "1" && (
        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">
            En production actuelle (Lot 1), seul le reporting est disponible. Les services transactionnels seront disponibles lors du déploiement Lot 2.
          </AlertDescription>
        </Alert>
      )}

      {/* Section 3: Tarif Préférentiel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tarif préférentiel</CardTitle>
          <CardDescription>Optionnel - Appliquer un tarif réduit pour ce client</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="preferential-rate"
              checked={hasPreferentialRate}
              onCheckedChange={(checked) => setHasPreferentialRate(checked as boolean)}
            />
            <Label htmlFor="preferential-rate" className="font-medium cursor-pointer">
              Appliquer un tarif préférentiel
            </Label>
          </div>

          {hasPreferentialRate && (
            <div className="space-y-4 mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferential-amount" className="text-sm font-medium">
                    Montant du tarif préférentiel
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="preferential-amount"
                      type="number"
                      min="1"
                      max={standardAmount - 1}
                      value={preferentialRate}
                      onChange={(e) => setPreferentialRate(parseFloat(e.target.value) || 0)}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold text-slate-600">DH</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Doit être entre 1 et {standardAmount - 1} DH
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-600">Montant standard</Label>
                  <div className="mt-2 p-3 bg-white rounded border border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">{standardAmount} DH</p>
                  </div>
                </div>
              </div>

              {!isPreferentialRateValid && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800 text-sm">
                    Le tarif préférentiel doit être supérieur à 0 et inférieur à {standardAmount} DH
                  </AlertDescription>
                </Alert>
              )}

              {/* Lot 1 vs Lot 2 Banner */}
              <Alert className={CURRENT_LOT === "1" ? "border-blue-200 bg-blue-50" : "border-green-200 bg-green-50"}>
                <Info className={`h-4 w-4 ${CURRENT_LOT === "1" ? "text-blue-600" : "text-green-600"}`} />
                <AlertDescription className={`text-sm ${CURRENT_LOT === "1" ? "text-blue-800" : "text-green-800"}`}>
                  {CURRENT_LOT === "1"
                    ? "En production actuelle (Lot 1), ce montant est uniquement appliqué au PDF du contrat. L'ajustement dans la queue CIH est effectué manuellement."
                    : "Ce montant sera transmis directement à la queue CIH pour traitement automatique."}
                </AlertDescription>
              </Alert>

              <p className="text-xs text-slate-500">
                Ce montant sera transmis directement à la queue CIH (Lot 2)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Récapitulatif Tarifaire */}
      <Card className="border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">Récapitulatif tarifaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-sm font-medium text-slate-600">Code tarif sélectionné</span>
            <span className="text-sm font-semibold text-slate-900">{selectedCode?.label || "—"}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-sm font-medium text-slate-600">Montant appliqué</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">{appliedAmount} DH</span>
              {hasPreferentialRate && (
                <Badge className="bg-green-100 text-green-800">Tarif préférentiel</Badge>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium text-slate-600">Envoi queue CIH</span>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-white">
                radical: RAD123
              </Badge>
              <Badge variant="outline" className="bg-white">
                code: {selectedPricingCode}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={onBack} variant="outline" size="lg">
          Précédent
        </Button>
        <Button
          onClick={handleContinue}
          size="lg"
          className="flex-1"
          disabled={!selectedPricingCode || !isPreferentialRateValid}
        >
          Continuer vers validation
        </Button>
      </div>
    </div>
  )
}
