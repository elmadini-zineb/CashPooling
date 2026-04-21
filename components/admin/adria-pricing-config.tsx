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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DollarSign, Check, AlertCircle, Info, Zap, Lock } from "lucide-react"
import type { LevelingMode, PricingModelType } from "@/lib/types"

interface AdriaPricingConfigProps {
  readOnly?: boolean
}

export function AdriaPricingConfig({ readOnly = false }: AdriaPricingConfigProps) {
  const [levelingMode, setLevelingMode] = useState<LevelingMode>("ZBA")
  const [pricingType, setPricingType] = useState<PricingModelType>("fixed")
  const [currency, setCurrency] = useState("MAD")
  const [savedMessage, setSavedMessage] = useState(false)

  // Fixed Pricing State
  const [fixedAmount, setFixedAmount] = useState(500)
  const [fixedBilling, setFixedBilling] = useState("monthly")

  // Variable Pricing State
  const [variableRate, setVariableRate] = useState(0.5)
  const [variableMinFee, setVariableMinFee] = useState(50)
  const [variableMaxFee, setVariableMaxFee] = useState(5000)
  const [variableFeePerOp, setVariableFeePerOp] = useState(10)

  // ZBA specific
  const [numberOfSweeps, setNumberOfSweeps] = useState(5)

  // TBA specific
  const [targetAmount, setTargetAmount] = useState(100000)
  const [allowedVariance, setAllowedVariance] = useState(10000)

  // FBA specific
  const [totalLeveledAmount, setTotalLeveledAmount] = useState(500000)

  // Hybrid Pricing State
  const [hybridFixed, setHybridFixed] = useState(250)
  const [hybridFixedBilling, setHybridFixedBilling] = useState("monthly")
  const [hybridRate, setHybridRate] = useState(0.25)
  const [hybridMinFee, setHybridMinFee] = useState(25)
  const [hybridMaxFee, setHybridMaxFee] = useState(3000)

  const handleSave = () => {
    console.log("[v0] Saving pricing config:", {
      levelingMode,
      pricingType,
      currency,
      fixed: { amount: fixedAmount, billing: fixedBilling },
      variable: { rate: variableRate, minFee: variableMinFee, maxFee: variableMaxFee },
    })
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 3000)
  }

  const getLevelingModeDescription = (mode: LevelingMode) => {
    const descriptions = {
      ZBA: "Compte à solde zéro - Les fonds excédentaires sont automatiquement transférés quotidiennement",
      TBA: "Compte avec solde cible - Un montant cible est maintenu, l'excédent est transféré",
      FBA: "Compte avec solde complet - Tous les fonds sont équilibrés selon une formule",
    }
    return descriptions[mode]
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {savedMessage && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Configuration de tarification Adria sauvegardée avec succès
          </AlertDescription>
        </Alert>
      )}

      {/* Step 1: Leveling Mode Selection */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Zap className="w-5 h-5 text-blue-600" />
            1. Mode de Nivellement
          </CardTitle>
          <CardDescription className="text-slate-600">
            Sélectionnez le mode de nivellement des comptes pour ce contrat de Cash Pooling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["ZBA", "TBA", "FBA"].map((mode) => (
              <TooltipProvider key={mode}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setLevelingMode(mode as LevelingMode)}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        levelingMode === mode
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-slate-50 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">{mode}</span>
                        {levelingMode === mode && (
                          <Check className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 text-left">
                        {mode === "ZBA" && "Solde zéro"}
                        {mode === "TBA" && "Solde cible"}
                        {mode === "FBA" && "Solde complet"}
                      </p>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    {getLevelingModeDescription(mode as LevelingMode)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Pricing Type Selection */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <DollarSign className="w-5 h-5 text-green-600" />
            2. Type de Tarification
          </CardTitle>
          <CardDescription className="text-slate-600">
            Choisissez le type de tarification pour le mode <Badge variant="secondary">{levelingMode}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGroup 
            type="single" 
            value={pricingType}
            onValueChange={(value) => value && setPricingType(value as PricingModelType)}
            className="justify-start"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem 
                    value="fixed"
                    className="data-[state=on]:bg-blue-600 data-[state=on]:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Fixe
                    </span>
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Montant fixe par période</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem 
                    value="variable"
                    className="data-[state=on]:bg-blue-600 data-[state=on]:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Variable
                    </span>
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Tarif selon critères spécifiques</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem 
                    value="hybrid"
                    className="data-[state=on]:bg-blue-600 data-[state=on]:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Hybride
                    </span>
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Combinaison fixe + variable</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </ToggleGroup>
        </CardContent>
      </Card>

      {/* Step 3: Pricing Configuration - Dynamic based on Type and Mode */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <DollarSign className="w-5 h-5 text-purple-600" />
            3. Configuration de Tarification
          </CardTitle>
          <CardDescription className="text-slate-600">
            Paramètres spécifiques au mode <Badge>{levelingMode}</Badge> et type <Badge variant="secondary">{pricingType}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* FIXED PRICING */}
          {pricingType === "fixed" && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-slate-900">Tarification Fixe</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fixed-amount">Montant</Label>
                  <Input
                    id="fixed-amount"
                    type="number"
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(Number(e.target.value))}
                    placeholder="500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAD">MAD (Dirham)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      <SelectItem value="USD">USD (Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fixed-billing">Fréquence</Label>
                  <Select value={fixedBilling} onValueChange={setFixedBilling}>
                    <SelectTrigger id="fixed-billing">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensuelle</SelectItem>
                      <SelectItem value="quarterly">Trimestrielle</SelectItem>
                      <SelectItem value="yearly">Annuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Summary */}
              <Alert className="bg-white border-blue-300">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-slate-700">
                  Tarif fixe de <strong>{fixedAmount} {currency}</strong> par période <strong>{fixedBilling === "monthly" ? "mensuelle" : fixedBilling === "quarterly" ? "trimestrielle" : "annuelle"}</strong>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* VARIABLE PRICING */}
          {pricingType === "variable" && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-slate-900">Tarification Variable</h4>

              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variable-rate">Taux (%)</Label>
                  <Input
                    id="variable-rate"
                    type="number"
                    step="0.1"
                    value={variableRate}
                    onChange={(e) => setVariableRate(Number(e.target.value))}
                    placeholder="0.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fee-per-op">Frais par opération</Label>
                  <Input
                    id="fee-per-op"
                    type="number"
                    value={variableFeePerOp}
                    onChange={(e) => setVariableFeePerOp(Number(e.target.value))}
                    placeholder="10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-fee">Frais minimum</Label>
                  <Input
                    id="min-fee"
                    type="number"
                    value={variableMinFee}
                    onChange={(e) => setVariableMinFee(Number(e.target.value))}
                    placeholder="50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-fee">Frais maximum</Label>
                  <Input
                    id="max-fee"
                    type="number"
                    value={variableMaxFee}
                    onChange={(e) => setVariableMaxFee(Number(e.target.value))}
                    placeholder="5000"
                  />
                </div>
              </div>

              {/* Mode-specific fields */}
              {levelingMode === "ZBA" && (
                <div className="space-y-2 pt-4 border-t border-green-300">
                  <Label htmlFor="num-sweeps">Nombre de sweeps quotidiens</Label>
                  <Input
                    id="num-sweeps"
                    type="number"
                    value={numberOfSweeps}
                    onChange={(e) => setNumberOfSweeps(Number(e.target.value))}
                    placeholder="5"
                  />
                  <p className="text-xs text-slate-600">Nombre de fois que le compte est ramené à zéro par jour</p>
                </div>
              )}

              {levelingMode === "TBA" && (
                <div className="space-y-4 pt-4 border-t border-green-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="target-amount">Montant cible</Label>
                      <Input
                        id="target-amount"
                        type="number"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(Number(e.target.value))}
                        placeholder="100000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="allowed-variance">Écart autorisé</Label>
                      <Input
                        id="allowed-variance"
                        type="number"
                        value={allowedVariance}
                        onChange={(e) => setAllowedVariance(Number(e.target.value))}
                        placeholder="10000"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">Écart toléré autour du montant cible avant transfert</p>
                </div>
              )}

              {levelingMode === "FBA" && (
                <div className="space-y-2 pt-4 border-t border-green-300">
                  <Label htmlFor="total-leveled">Montant total à équilibrer</Label>
                  <Input
                    id="total-leveled"
                    type="number"
                    value={totalLeveledAmount}
                    onChange={(e) => setTotalLeveledAmount(Number(e.target.value))}
                    placeholder="500000"
                  />
                  <p className="text-xs text-slate-600">Montant total qui sera équilibré selon la formule FBA</p>
                </div>
              )}

              {/* Summary */}
              <Alert className="bg-white border-green-300">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-slate-700">
                  Taux: <strong>{variableRate}%</strong> + <strong>{variableFeePerOp} {currency}</strong>/opération
                  (min: <strong>{variableMinFee}</strong>, max: <strong>{variableMaxFee}</strong>)
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* HYBRID PRICING */}
          {pricingType === "hybrid" && (
            <div className="space-y-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-slate-900">Tarification Hybride</h4>

              {/* Fixed Part */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-slate-700">Partie Fixe</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hybrid-fixed">Montant fixe</Label>
                    <Input
                      id="hybrid-fixed"
                      type="number"
                      value={hybridFixed}
                      onChange={(e) => setHybridFixed(Number(e.target.value))}
                      placeholder="250"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hybrid-fixed-billing">Fréquence</Label>
                    <Select value={hybridFixedBilling} onValueChange={setHybridFixedBilling}>
                      <SelectTrigger id="hybrid-fixed-billing">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensuelle</SelectItem>
                        <SelectItem value="quarterly">Trimestrielle</SelectItem>
                        <SelectItem value="yearly">Annuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Variable Part */}
              <div className="space-y-3 pt-4 border-t border-purple-300">
                <h5 className="text-sm font-medium text-slate-700">Partie Variable</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hybrid-rate">Taux (%)</Label>
                    <Input
                      id="hybrid-rate"
                      type="number"
                      step="0.1"
                      value={hybridRate}
                      onChange={(e) => setHybridRate(Number(e.target.value))}
                      placeholder="0.25"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hybrid-min-fee">Frais minimum</Label>
                    <Input
                      id="hybrid-min-fee"
                      type="number"
                      value={hybridMinFee}
                      onChange={(e) => setHybridMinFee(Number(e.target.value))}
                      placeholder="25"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hybrid-max-fee">Frais maximum</Label>
                    <Input
                      id="hybrid-max-fee"
                      type="number"
                      value={hybridMaxFee}
                      onChange={(e) => setHybridMaxFee(Number(e.target.value))}
                      placeholder="3000"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <Alert className="bg-white border-purple-300">
                <AlertCircle className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-slate-700">
                  <strong>{hybridFixed} {currency}</strong> fixe + <strong>{hybridRate}%</strong> variable
                  (frais: min <strong>{hybridMinFee}</strong>, max <strong>{hybridMaxFee}</strong>)
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Check className="w-4 h-4" />
          Sauvegarder la Configuration
        </Button>
      </div>

      {/* Configuration Summary */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Résumé de la Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-600">Mode de Nivellement</p>
              <p className="text-lg font-semibold text-slate-900">{levelingMode}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Type de Tarification</p>
              <p className="text-lg font-semibold text-slate-900 capitalize">{pricingType}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Devise</p>
              <p className="text-lg font-semibold text-slate-900">{currency}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
