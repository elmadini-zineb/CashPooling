"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DollarSign, Check, AlertCircle } from "lucide-react"
import type { PricingModel, PricingModelType } from "@/lib/types"

interface AdvancedPricingConfigProps {
  onSave?: (model: PricingModel) => void
}

export function AdvancedPricingConfig({ onSave }: AdvancedPricingConfigProps) {
  const [pricingType, setPricingType] = useState<PricingModelType>("fixed")
  const [savedMessage, setSavedMessage] = useState(false)
  
  // Fixed Pricing State
  const [fixedAmount, setFixedAmount] = useState(100)
  const [fixedCurrency, setFixedCurrency] = useState("MAD")
  const [fixedBilling, setFixedBilling] = useState("monthly")

  // Variable Pricing State
  const [variableRate, setVariableRate] = useState(0.5)
  const [variableCriteria, setVariableCriteria] = useState("transfer_amount")
  const [variableMinFee, setVariableMinFee] = useState(50)
  const [variableMaxFee, setVariableMaxFee] = useState(5000)
  const [variableFeePerOp, setVariableFeePerOp] = useState(10)

  // Hybrid Pricing State
  const [hybridFixed, setHybridFixed] = useState(500)
  const [hybridFixedBilling, setHybridFixedBilling] = useState("monthly")
  const [hybridRate, setHybridRate] = useState(0.25)
  const [hybridMinFee, setHybridMinFee] = useState(25)
  const [hybridMaxFee, setHybridMaxFee] = useState(3000)

  const handleSave = () => {
    let model: PricingModel

    if (pricingType === "fixed") {
      model = {
        type: "fixed",
        amount: fixedAmount,
        currency: fixedCurrency,
        billingCycle: fixedBilling as "monthly" | "quarterly" | "yearly",
      }
    } else if (pricingType === "variable") {
      model = {
        type: "variable",
        ratePercentage: variableRate,
        criteria: variableCriteria as "transfer_amount" | "number_of_sweeps" | "volume_threshold",
        minFee: variableMinFee,
        maxFee: variableMaxFee,
        feePerOperation: variableFeePerOp,
      }
    } else {
      model = {
        type: "hybrid",
        fixedPart: {
          amount: hybridFixed,
          currency: fixedCurrency,
          billingCycle: hybridFixedBilling as "monthly" | "quarterly" | "yearly",
        },
        variablePart: {
          ratePercentage: hybridRate,
          criteria: variableCriteria as "transfer_amount" | "number_of_sweeps" | "volume_threshold",
          minFee: hybridMinFee,
          maxFee: hybridMaxFee,
        },
      }
    }

    onSave?.(model)
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Pricing Model Type Selection */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Modèle de Tarification
          </CardTitle>
          <CardDescription className="text-slate-600">
            Choisissez le type de tarification qui correspond à votre stratégie commerciale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGroup 
            type="single" 
            value={pricingType}
            onValueChange={(value) => value && setPricingType(value as PricingModelType)}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <ToggleGroupItem 
                value="fixed" 
                asChild 
                className="w-full h-auto p-0 border-0"
              >
                <Card 
                  className={`cursor-pointer transition-all p-4 ${
                    pricingType === "fixed" 
                      ? "border-blue-500 bg-blue-50 border-2" 
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <h3 className="font-semibold text-slate-900">Tarification Fixe</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Montant fixe par période (mois, trimestre, année)
                  </p>
                  {pricingType === "fixed" && (
                    <Check className="w-5 h-5 text-green-600 mt-2" />
                  )}
                </Card>
              </ToggleGroupItem>
            </div>

            <div>
              <ToggleGroupItem 
                value="variable" 
                asChild 
                className="w-full h-auto p-0 border-0"
              >
                <Card 
                  className={`cursor-pointer transition-all p-4 ${
                    pricingType === "variable" 
                      ? "border-blue-500 bg-blue-50 border-2" 
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <h3 className="font-semibold text-slate-900">Tarification Variable</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Basée sur taux (%), critères et opérations
                  </p>
                  {pricingType === "variable" && (
                    <Check className="w-5 h-5 text-green-600 mt-2" />
                  )}
                </Card>
              </ToggleGroupItem>
            </div>

            <div>
              <ToggleGroupItem 
                value="hybrid" 
                asChild 
                className="w-full h-auto p-0 border-0"
              >
                <Card 
                  className={`cursor-pointer transition-all p-4 ${
                    pricingType === "hybrid" 
                      ? "border-blue-500 bg-blue-50 border-2" 
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <h3 className="font-semibold text-slate-900">Tarification Hybride</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Combinaison fixe + variable
                  </p>
                  {pricingType === "hybrid" && (
                    <Check className="w-5 h-5 text-green-600 mt-2" />
                  )}
                </Card>
              </ToggleGroupItem>
            </div>
          </ToggleGroup>
        </CardContent>
      </Card>

      {/* Configuration Forms */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Configuration</CardTitle>
          <CardDescription className="text-slate-600">
            Configurez les paramètres de votre modèle de tarification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* FIXED PRICING */}
          {pricingType === "fixed" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fixed-amount" className="text-slate-700 font-medium">
                    Montant
                  </Label>
                  <Input
                    id="fixed-amount"
                    type="number"
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(Number(e.target.value))}
                    placeholder="100"
                    className="mt-2 border-slate-300"
                  />
                </div>
                <div>
                  <Label htmlFor="fixed-currency" className="text-slate-700 font-medium">
                    Devise
                  </Label>
                  <Select value={fixedCurrency} onValueChange={setFixedCurrency}>
                    <SelectTrigger id="fixed-currency" className="mt-2 border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAD">Dirham Marocain (MAD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="USD">Dollar Américain (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="fixed-billing" className="text-slate-700 font-medium">
                    Cycle de Facturation
                  </Label>
                  <Select value={fixedBilling} onValueChange={setFixedBilling}>
                    <SelectTrigger id="fixed-billing" className="mt-2 border-slate-300">
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
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Résumé:</strong> {fixedAmount} {fixedCurrency} par {
                    fixedBilling === "monthly" ? "mois" : 
                    fixedBilling === "quarterly" ? "trimestre" : "an"
                  }
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* VARIABLE PRICING */}
          {pricingType === "variable" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="var-rate" className="text-slate-700 font-medium">
                    Taux (%)
                  </Label>
                  <Input
                    id="var-rate"
                    type="number"
                    step="0.01"
                    value={variableRate}
                    onChange={(e) => setVariableRate(Number(e.target.value))}
                    placeholder="0.5"
                    className="mt-2 border-slate-300"
                  />
                </div>
                <div>
                  <Label htmlFor="var-criteria" className="text-slate-700 font-medium">
                    Critère
                  </Label>
                  <Select value={variableCriteria} onValueChange={setVariableCriteria}>
                    <SelectTrigger id="var-criteria" className="mt-2 border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transfer_amount">Montant Transféré</SelectItem>
                      <SelectItem value="number_of_sweeps">Nombre de Sweeps</SelectItem>
                      <SelectItem value="volume_threshold">Seuil de Volume</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="var-min-fee" className="text-slate-700 font-medium">
                    Frais Min.
                  </Label>
                  <Input
                    id="var-min-fee"
                    type="number"
                    value={variableMinFee}
                    onChange={(e) => setVariableMinFee(Number(e.target.value))}
                    placeholder="50"
                    className="mt-2 border-slate-300"
                  />
                </div>
                <div>
                  <Label htmlFor="var-max-fee" className="text-slate-700 font-medium">
                    Frais Max.
                  </Label>
                  <Input
                    id="var-max-fee"
                    type="number"
                    value={variableMaxFee}
                    onChange={(e) => setVariableMaxFee(Number(e.target.value))}
                    placeholder="5000"
                    className="mt-2 border-slate-300"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="var-fee-per-op" className="text-slate-700 font-medium">
                    Frais par Opération
                  </Label>
                  <Input
                    id="var-fee-per-op"
                    type="number"
                    step="0.01"
                    value={variableFeePerOp}
                    onChange={(e) => setVariableFeePerOp(Number(e.target.value))}
                    placeholder="10"
                    className="mt-2 border-slate-300"
                  />
                </div>
              </div>

              {/* Summary */}
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Résumé:</strong> {variableRate}% basé sur {
                    variableCriteria === "transfer_amount" ? "Montant Transféré" :
                    variableCriteria === "number_of_sweeps" ? "Nombre de Sweeps" :
                    "Seuil de Volume"
                  } (Min: {variableMinFee} MAD, Max: {variableMaxFee} MAD)
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* HYBRID PRICING */}
          {pricingType === "hybrid" && (
            <div className="space-y-6">
              <Tabs defaultValue="fixed" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                  <TabsTrigger value="fixed">Partie Fixe</TabsTrigger>
                  <TabsTrigger value="variable">Partie Variable</TabsTrigger>
                </TabsList>

                <TabsContent value="fixed" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="hybrid-fixed-amount" className="text-slate-700 font-medium">
                        Montant Fixe
                      </Label>
                      <Input
                        id="hybrid-fixed-amount"
                        type="number"
                        value={hybridFixed}
                        onChange={(e) => setHybridFixed(Number(e.target.value))}
                        placeholder="500"
                        className="mt-2 border-slate-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hybrid-fixed-billing" className="text-slate-700 font-medium">
                        Cycle de Facturation
                      </Label>
                      <Select value={hybridFixedBilling} onValueChange={setHybridFixedBilling}>
                        <SelectTrigger id="hybrid-fixed-billing" className="mt-2 border-slate-300">
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
                </TabsContent>

                <TabsContent value="variable" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="hybrid-var-rate" className="text-slate-700 font-medium">
                        Taux (%)
                      </Label>
                      <Input
                        id="hybrid-var-rate"
                        type="number"
                        step="0.01"
                        value={hybridRate}
                        onChange={(e) => setHybridRate(Number(e.target.value))}
                        placeholder="0.25"
                        className="mt-2 border-slate-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hybrid-min-fee" className="text-slate-700 font-medium">
                        Frais Min.
                      </Label>
                      <Input
                        id="hybrid-min-fee"
                        type="number"
                        value={hybridMinFee}
                        onChange={(e) => setHybridMinFee(Number(e.target.value))}
                        placeholder="25"
                        className="mt-2 border-slate-300"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="hybrid-max-fee" className="text-slate-700 font-medium">
                        Frais Max.
                      </Label>
                      <Input
                        id="hybrid-max-fee"
                        type="number"
                        value={hybridMaxFee}
                        onChange={(e) => setHybridMaxFee(Number(e.target.value))}
                        placeholder="3000"
                        className="mt-2 border-slate-300"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Summary */}
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Résumé:</strong> {hybridFixed} MAD/
                  {hybridFixedBilling === "monthly" ? "mois" : hybridFixedBilling === "quarterly" ? "trimestre" : "an"} 
                  + {hybridRate}% variable (Min: {hybridMinFee} MAD, Max: {hybridMaxFee} MAD)
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Enregistrer la Configuration
        </Button>
        {savedMessage && (
          <Alert className="flex-1 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Configuration enregistrée avec succès!
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
