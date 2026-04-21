'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Zap, Upload, Settings } from "lucide-react"
import { PricingIntegrationAPI } from "./pricing-integration-api"
import { PricingIntegrationFile } from "./pricing-integration-file"
import { PricingIntegrationManual } from "./pricing-integration-manual"

type IntegrationMode = "api" | "file" | "manual"

interface IntegrationConfig {
  mode: IntegrationMode
  status: "not_configured" | "configured" | "error"
  lastUpdate?: Date
  summary?: string
}

export function CustomPricingIntegration() {
  const [activeMode, setActiveMode] = useState<IntegrationMode>("api")
  const [integrationConfig, setIntegrationConfig] = useState<IntegrationConfig>({
    mode: "api",
    status: "not_configured",
  })
  const [successMessage, setSuccessMessage] = useState("")

  const handleIntegrationSuccess = (mode: IntegrationMode, summary: string) => {
    setIntegrationConfig({
      mode,
      status: "configured",
      lastUpdate: new Date(),
      summary,
    })
    setSuccessMessage(`Intégration ${mode === "api" ? "API" : mode === "file" ? "Fichier" : "Manuelle"} configurée avec succès`)
    setTimeout(() => setSuccessMessage(""), 4000)
  }

  const handleIntegrationError = (error: string) => {
    setIntegrationConfig({
      ...integrationConfig,
      status: "error",
    })
    setSuccessMessage(`Erreur: ${error}`)
    setTimeout(() => setSuccessMessage(""), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Intégration du moteur de tarification</strong> - Intégrez votre propre logique de tarification via API, fichier ou configuration manuelle.
        </AlertDescription>
      </Alert>

      {/* Success Message */}
      {successMessage && (
        <Alert className={`${integrationConfig.status === "configured" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <AlertCircle className={`h-4 w-4 ${integrationConfig.status === "configured" ? "text-green-600" : "text-red-600"}`} />
          <AlertDescription className={integrationConfig.status === "configured" ? "text-green-800" : "text-red-800"}>
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Status */}
      {integrationConfig.status !== "not_configured" && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-slate-900">Configuration Actuelle</CardTitle>
              <Badge className={integrationConfig.status === "configured" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                {integrationConfig.status === "configured" ? "Configurée" : "Erreur"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Mode</p>
              <p className="text-sm text-slate-900 capitalize">{integrationConfig.mode === "api" ? "API" : integrationConfig.mode === "file" ? "Fichier" : "Manuel"}</p>
            </div>
            {integrationConfig.lastUpdate && (
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Dernière mise à jour</p>
                <p className="text-sm text-slate-900">{integrationConfig.lastUpdate.toLocaleString("fr-FR")}</p>
              </div>
            )}
            {integrationConfig.summary && (
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Résumé</p>
                <p className="text-sm text-slate-900">{integrationConfig.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Integration Mode Tabs */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">Mode d'intégration</CardTitle>
          <CardDescription>Choisissez comment intégrer votre moteur de tarification</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as IntegrationMode)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="api" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">API</span>
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Fichier</span>
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Manuel</span>
              </TabsTrigger>
            </TabsList>

            {/* API Mode */}
            <TabsContent value="api" className="space-y-4">
              <PricingIntegrationAPI
                onSuccess={(summary) => handleIntegrationSuccess("api", summary)}
                onError={handleIntegrationError}
              />
            </TabsContent>

            {/* File Mode */}
            <TabsContent value="file" className="space-y-4">
              <PricingIntegrationFile
                onSuccess={(summary) => handleIntegrationSuccess("file", summary)}
                onError={handleIntegrationError}
              />
            </TabsContent>

            {/* Manual Mode */}
            <TabsContent value="manual" className="space-y-4">
              <PricingIntegrationManual
                onSuccess={(summary) => handleIntegrationSuccess("manual", summary)}
                onError={handleIntegrationError}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
