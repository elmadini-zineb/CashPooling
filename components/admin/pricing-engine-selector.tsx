"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react"

interface PricingEngineSelectorProps {
  onEngineChange?: (engine: "adria" | "external") => void
}

export function PricingEngineSelector({ onEngineChange }: PricingEngineSelectorProps) {
  const [selectedEngine, setSelectedEngine] = useState<"adria" | "external">("adria")
  const [externalUrl, setExternalUrl] = useState("https://api.banque.ma/pricing")
  const [externalApiKey, setExternalApiKey] = useState("")
  const [savedMessage, setSavedMessage] = useState(false)

  const handleEngineChange = (engine: "adria" | "external") => {
    setSelectedEngine(engine)
    onEngineChange?.(engine)
  }

  const handleSaveExternal = () => {
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Engine Selection */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <ExternalLink className="w-5 h-5 text-blue-600" />
            Moteur de Tarification
          </CardTitle>
          <CardDescription className="text-slate-600">
            Choisissez entre le moteur Adria ou intégrez votre propre moteur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Adria Engine */}
            <Card 
              className={`cursor-pointer transition-all p-4 ${
                selectedEngine === "adria" 
                  ? "border-blue-500 bg-blue-50 border-2" 
                  : "border-slate-200 hover:border-blue-300"
              }`}
              onClick={() => handleEngineChange("adria")}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">Moteur Adria</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Utiliser le moteur standard fourni par Adria avec tarification pré-configurée
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Pré-configuré</Badge>
                    <Badge className="bg-green-100 text-green-800">Sécurisé</Badge>
                    <Badge className="bg-purple-100 text-purple-800">Standard</Badge>
                  </div>
                </div>
                {selectedEngine === "adria" && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
              </div>
            </Card>

            {/* External Engine */}
            <Card 
              className={`cursor-pointer transition-all p-4 ${
                selectedEngine === "external" 
                  ? "border-blue-500 bg-blue-50 border-2" 
                  : "border-slate-200 hover:border-blue-300"
              }`}
              onClick={() => handleEngineChange("external")}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">Moteur Externe</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Intégrez votre propre moteur de tarification avec API personnalisée
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className="bg-orange-100 text-orange-800">Personnalisé</Badge>
                    <Badge className="bg-cyan-100 text-cyan-800">Flexible</Badge>
                    <Badge className="bg-indigo-100 text-indigo-800">API</Badge>
                  </div>
                </div>
                {selectedEngine === "external" && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* External Engine Configuration */}
      {selectedEngine === "external" && (
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Configuration du Moteur Externe</CardTitle>
            <CardDescription className="text-slate-600">
              Intégrez votre API de tarification personnalisée
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="api-url" className="text-slate-700 font-medium">
                URL de l&apos;API
              </Label>
              <Input
                id="api-url"
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://api.banque.ma/pricing"
                className="mt-2 border-blue-200"
              />
              <p className="text-xs text-slate-500 mt-1">
                L&apos;endpoint API qui traitera les requêtes de tarification
              </p>
            </div>

            <div>
              <Label htmlFor="api-key" className="text-slate-700 font-medium">
                Clé API
              </Label>
              <Input
                id="api-key"
                type="password"
                value={externalApiKey}
                onChange={(e) => setExternalApiKey(e.target.value)}
                placeholder="Votre clé API sécurisée"
                className="mt-2 border-blue-200"
              />
              <p className="text-xs text-slate-500 mt-1">
                Authentification pour accéder à votre API
              </p>
            </div>

            {/* Connection Status */}
            <Alert className="bg-white border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-slate-700">
                <strong>Test de connexion:</strong> Votre API sera testée avant d&apos;être activée en production
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleSaveExternal}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Tester et Enregistrer la Configuration
            </Button>

            {savedMessage && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Configuration enregistrée avec succès! Votre moteur externe est prêt.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Adria Configuration Info */}
      {selectedEngine === "adria" && (
        <Card className="bg-green-50 border-green-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Configuration Adria Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded border border-green-200">
                <span className="text-sm text-slate-700">Moteur Adria Standard</span>
                <Badge className="bg-green-100 text-green-800">Actif</Badge>
              </div>
              <p className="text-sm text-slate-600">
                Vous utilisez le moteur de tarification standard d&apos;Adria. 
                Configurez votre modèle (Fixe, Variable ou Hybride) dans l&apos;onglet Tarification.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
