'use client'

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Upload, Trash2 } from "lucide-react"

interface PricingIntegrationFileProps {
  onSuccess: (summary: string) => void
  onError: (error: string) => void
}

interface FileData {
  name: string
  size: number
  type: "json" | "csv"
  content: any
  uploadedAt: Date
}

export function PricingIntegrationFile({ onSuccess, onError }: PricingIntegrationFileProps) {
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [uploadError, setUploadError] = useState("")
  const [preview, setPreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    setUploadError("")
    setPreview("")

    // Validate file type
    const fileName = file.name.toLowerCase()
    let fileType: "json" | "csv" | null = null

    if (fileName.endsWith(".json")) {
      fileType = "json"
    } else if (fileName.endsWith(".csv")) {
      fileType = "csv"
    } else {
      setUploadError("Format de fichier non supporté. Utilisez JSON ou CSV.")
      onError("Format de fichier invalide")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Le fichier dépasse 5MB")
      onError("Fichier trop volumineux")
      return
    }

    try {
      const text = await file.text()

      let parsedContent: any
      if (fileType === "json") {
        parsedContent = JSON.parse(text)
      } else {
        // Simple CSV to object conversion
        const lines = text.split("\n").filter((line) => line.trim())
        const headers = lines[0].split(",").map((h) => h.trim())
        parsedContent = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim())
          return headers.reduce((obj: Record<string, string>, header, idx) => {
            obj[header] = values[idx] || ""
            return obj
          }, {})
        })
      }

      // Generate preview
      const previewText =
        fileType === "json"
          ? JSON.stringify(parsedContent, null, 2).substring(0, 500)
          : JSON.stringify(parsedContent.slice(0, 3), null, 2)

      setFileData({
        name: file.name,
        size: file.size,
        type: fileType,
        content: parsedContent,
        uploadedAt: new Date(),
      })
      setPreview(previewText)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur de lecture du fichier"
      setUploadError(message)
      onError(message)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleSave = () => {
    if (!fileData) {
      onError("Aucun fichier n'a été sélectionné")
      return
    }

    const summary = `Fichier ${fileData.type.toUpperCase()} - ${fileData.name}`
    onSuccess(summary)
  }

  const handleClear = () => {
    setFileData(null)
    setPreview("")
    setUploadError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">Importer un fichier</CardTitle>
          <CardDescription>Chargez votre fichier de tarification (JSON ou CSV)</CardDescription>
        </CardHeader>
        <CardContent>
          {!fileData ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-900 mb-1">
                Glissez-déposez votre fichier ici
              </p>
              <p className="text-xs text-slate-500">ou cliquez pour sélectionner (JSON, CSV - max 5MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0])
                  }
                }}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded">
                <div>
                  <p className="text-sm font-medium text-slate-900">{fileData.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(fileData.size / 1024).toFixed(2)} KB • {fileData.type.toUpperCase()}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Valide
                </Badge>
              </div>

              {/* Preview */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Aperçu</p>
                <div className="bg-slate-50 rounded p-4 max-h-48 overflow-auto border border-slate-200">
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words">
                    {preview}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  Enregistrer cette configuration
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          )}

          {uploadError && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{uploadError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          Format JSON attendu: <code className="bg-blue-100 px-1 rounded">{`{ "pricing": [...] }`}</code>
          <br />
          Format CSV: en-têtes + lignes de données avec les colonnes de tarification
        </AlertDescription>
      </Alert>
    </div>
  )
}
