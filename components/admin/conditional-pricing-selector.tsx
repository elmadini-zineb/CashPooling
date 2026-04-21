'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, AlertCircle, Lock, Unlock } from "lucide-react"
import { AdriaModularPricing } from "./adria-modular-pricing"
import { CustomPricingConfig } from "./custom-pricing-config"

type PricingOption = "adria" | "custom"

export function ConditionalPricingSelector() {
  const [pricingOption, setPricingOption] = useState<PricingOption>("adria")
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Tarification Cash Pooling</strong> - Choisissez entre la tarification standard d'Adria ou intégrez votre propre moteur de tarification.
        </AlertDescription>
      </Alert>

      {/* Pricing Option Selection */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">Choisir la source de tarification</CardTitle>
          <CardDescription>Sélectionnez le modèle de tarification pour votre service Cash Pooling</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={pricingOption} onValueChange={(value) => setPricingOption(value as PricingOption)}>
            <div className="space-y-4">
              {/* Option 1: Adria Pricing */}
              <div className="border-2 border-slate-200 rounded-lg p-4 cursor-pointer transition-all hover:border-blue-300"
                onClick={() => setPricingOption("adria")}
              >
                <div className="flex items-start gap-4">
                  <RadioGroupItem value="adria" id="adria" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="adria" className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-slate-900">Tarification Adria Modulaire</span>
                        <Badge className="bg-blue-100 text-blue-700 text-xs">Recommandé</Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Tarification flexible avec 3 couches: Tarification de base, Par opération, et Par mode de nivellement. Modulaire et scalable.
                      </p>
                    </Label>
                    <div className="flex items-center gap-1 mt-3 text-xs text-slate-500">
                      <Lock className="w-3 h-3" />
                      Lecture seule
                    </div>
                  </div>
                  {pricingOption === "adria" && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </div>

              {/* Option 2: Custom Pricing */}
              <div className="border-2 border-slate-200 rounded-lg p-4 cursor-pointer transition-all hover:border-blue-300"
                onClick={() => setPricingOption("custom")}
              >
                <div className="flex items-start gap-4">
                  <RadioGroupItem value="custom" id="custom" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="custom" className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-slate-900">Intégrer votre moteur de tarification</span>
                        <Badge className="bg-orange-100 text-orange-700 text-xs">Avancé</Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Définissez votre propre tarification : fixe, variable ou hybride avec seuils et plafonds personnalisés.
                      </p>
                    </Label>
                    <div className="flex items-center gap-1 mt-3 text-xs text-slate-500">
                      <Unlock className="w-3 h-3" />
                      Champs modifiables
                    </div>
                  </div>
                  {pricingOption === "custom" && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Separator className="bg-slate-200" />

      {/* Conditional Content Based on Selection */}
      {pricingOption === "adria" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">Tarification Adria Modulaire</h3>
            <Badge className="bg-blue-100 text-blue-700 text-xs">3 Couches</Badge>
          </div>
          <AdriaModularPricing />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">Tarification Personnalisée</h3>
            <Badge className="bg-orange-100 text-orange-700 text-xs">Éditable</Badge>
          </div>
          <CustomPricingConfig onSave={handleSave} />
        </div>
      )}

      {/* Save Button (only for custom) */}
      {pricingOption === "custom" && (
        <div className="flex gap-3 justify-end pt-6">
          <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Enregistrer la tarification
          </Button>
        </div>
      )}

      {/* Save Feedback */}
      {isSaved && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Tarification personnalisée enregistrée avec succès.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
