'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Loader2, Copy } from "lucide-react"

interface PricingIntegrationAPIProps {
  onSuccess: (summary: string) => void
  onError: (error: string) => void
}

export function PricingIntegrationAPI({ onSuccess, onError }: PricingIntegrationAPIProps) {
  const [apiUrl, setApiUrl] = useState("")
  const [method, setMethod] = useState<"GET" | "POST">("GET")
  const [headers, setHeaders] = useState('{\n  "Authorization": "Bearer YOUR_API_KEY"\n}')
  const [testResponse, setTestResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleTestConnection = async () => {
    if (!apiUrl.trim()) {
      setErrorMessage("Veuillez entrer une URL d'API")
      setTestStatus("error")
      return
    }

    setIsLoading(true)
    setTestStatus("idle")
    setErrorMessage("")

    try {
      // Parse headers
      let parsedHeaders: Record<string, string> = {}
      try {
        parsedHeaders = JSON.parse(headers)
      } catch {
        throw new Error("En-têtes JSON invalides")
      }

      // Make API call
      const response = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...parsedHeaders,
        },
      })

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setTestResponse(data)
      setTestStatus("success")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur de connexion"
      setErrorMessage(message)
      setTestStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    if (!apiUrl.trim()) {
      onError("URL d'API manquante")
      return
    }

    const summary = `API (${method}) - ${apiUrl}`
    onSuccess(summary)
  }

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">Configuration API</CardTitle>
          <CardDescription>Connectez votre moteur de tarification via une API REST</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL */}
          <div>
            <Label htmlFor="api-url" className="text-sm font-medium text-slate-700 mb-2 block">
              URL de l'API
            </Label>
            <Input
              id="api-url"
              placeholder="https://api.example.com/pricing"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="bg-white border-slate-300"
            />
            <p className="text-xs text-slate-500 mt-1">Endpoint complet de votre API de tarification</p>
          </div>

          {/* Method */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="api-method" className="text-sm font-medium text-slate-700 mb-2 block">
                Méthode HTTP
              </Label>
              <Select value={method} onValueChange={(value) => setMethod(value as "GET" | "POST")}>
                <SelectTrigger className="bg-white border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Headers */}
          <div>
            <Label htmlFor="api-headers" className="text-sm font-medium text-slate-700 mb-2 block">
              En-têtes (JSON)
            </Label>
            <Textarea
              id="api-headers"
              placeholder='{"Authorization": "Bearer YOUR_API_KEY"}'
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              className="bg-white border-slate-300 font-mono text-xs min-h-32"
            />
            <p className="text-xs text-slate-500 mt-1">Incluez les clés API ou tokens d'authentification</p>
          </div>

          {/* Error Message */}
          {testStatus === "error" && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Test Button */}
          <Button
            onClick={handleTestConnection}
            disabled={isLoading || !apiUrl.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Test en cours...
              </>
            ) : (
              "Tester la connexion"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Test Response */}
      {testStatus === "success" && testResponse && (
        <Card className="bg-white border-green-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-slate-900">Réponse API</CardTitle>
              <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Succès
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 rounded p-4 max-h-64 overflow-auto">
              <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words">
                {JSON.stringify(testResponse, null, 2)}
              </pre>
            </div>
            <Button onClick={handleSave} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
              Enregistrer cette configuration API
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          L'API doit retourner une réponse JSON avec la structure de tarification. Format attendu: <code className="bg-blue-100 px-1 rounded">{"{ \"pricing\": {...} }"}</code>
        </AlertDescription>
      </Alert>
    </div>
  )
}
