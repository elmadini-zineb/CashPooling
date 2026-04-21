'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Check, AlertCircle, X } from "lucide-react"

interface RemiseConfig {
  id: string
  clientId: string
  clientName: string
  type: "percentage" | "fixed_amount"
  value: number
  reason?: string
  status: "validated" | "pending"
  createdAt: Date
  updatedAt: Date
}

interface PricingInfo {
  type: "standard_adria" | "external"
  value: number
  currency: string
}

const MOCK_COMPANIES = [
  { id: "CLI001", name: "Marjane Holding" },
  { id: "CLI002", name: "Acima Group" },
  { id: "CLI003", name: "Sonasid Maroc" },
  { id: "CLI004", name: "OCP Group" },
  { id: "CLI005", name: "BMCE Bank" },
]

export function CompanyDiscountsManager() {
  const [remises, setRemises] = useState<RemiseConfig[]>([
    {
      id: "1",
      clientId: "CLI001",
      clientName: "Marjane Holding",
      type: "percentage",
      value: 5,
      reason: "Client VIP",
      status: "validated",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])

  // Mock pricing configuration
  const [pricingConfig] = useState<PricingInfo>({
    type: "standard_adria",
    value: 50000,
    currency: "MAD",
  })

  // Form state
  const [selectedCompany, setSelectedCompany] = useState("")
  const [remiseType, setRemiseType] = useState<"percentage" | "fixed_amount">("percentage")
  const [remiseValue, setRemiseValue] = useState("")
  const [reason, setReason] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Validation state
  const canApplyRemise = pricingConfig.type !== null

  // Filtered companies for dropdown
  const filteredCompanies = MOCK_COMPANIES.filter(
    (company) =>
      company.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      company.id.toLowerCase().includes(searchInput.toLowerCase())
  )

  // Calculate remise finale
  const calculateRemiseFinal = () => {
    if (!remiseValue) return 0
    const value = parseFloat(remiseValue)
    if (remiseType === "percentage") {
      return (pricingConfig.value * value) / 100
    }
    return value
  }

  const remiseFinal = calculateRemiseFinal()

  // Get selected company object
  const getSelectedCompanyObj = () => {
    return MOCK_COMPANIES.find((c) => c.id === selectedCompany)
  }

  const handleSelectCompany = (companyId: string) => {
    const company = MOCK_COMPANIES.find((c) => c.id === companyId)
    if (company) {
      setSelectedCompany(companyId)
      setSearchInput(company.name)
      setShowDropdown(false)
    }
  }

  const handleSaveRemise = () => {
    if (!selectedCompany || !remiseValue) {
      alert("Veuillez remplir tous les champs requis")
      return
    }

    const company = getSelectedCompanyObj()
    if (!company) return

    if (editingId) {
      setRemises(
        remises.map((r) =>
          r.id === editingId
            ? {
                ...r,
                clientId: company.id,
                clientName: company.name,
                type: remiseType,
                value: parseFloat(remiseValue),
                reason,
                updatedAt: new Date(),
              }
            : r
        )
      )
      setEditingId(null)
    } else {
      const newRemise: RemiseConfig = {
        id: Date.now().toString(),
        clientId: company.id,
        clientName: company.name,
        type: remiseType,
        value: parseFloat(remiseValue),
        reason,
        status: "validated",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setRemises([...remises, newRemise])
    }

    // Reset form
    resetForm()
  }

  const resetForm = () => {
    setSelectedCompany("")
    setSearchInput("")
    setRemiseType("percentage")
    setRemiseValue("")
    setReason("")
    setEditingId(null)
  }

  const handleEditRemise = (remise: RemiseConfig) => {
    setSelectedCompany(remise.clientId)
    setSearchInput(remise.clientName)
    setRemiseType(remise.type)
    setRemiseValue(remise.value.toString())
    setReason(remise.reason || "")
    setEditingId(remise.id)
    setShowDropdown(false)
  }

  const handleDeleteRemise = (id: string) => {
    setRemises(remises.filter((r) => r.id !== id))
  }

  const handleCancel = () => {
    resetForm()
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Application de remises par entreprise</h2>
        <p className="text-sm text-slate-500 mt-1">Gérez les remises personnalisées pour chaque client</p>
      </div>

      {/* Warning Banner if no pricing configured */}
      {!canApplyRemise && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Veuillez d'abord configurer une tarification avant d'appliquer une remise.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Card */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Ajouter une remise</CardTitle>
          <CardDescription>Configurez une remise personnalisée pour une entreprise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Search Field */}
          <div className="space-y-2">
            <Label htmlFor="company-search" className="text-sm font-medium">
              Entreprise <span className="text-red-600">*</span>
            </Label>
            <div className="relative">
              <Input
                id="company-search"
                type="text"
                placeholder="Rechercher par nom ou identifiant client"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  setShowDropdown(true)
                  if (!e.target.value) setSelectedCompany("")
                }}
                onFocus={() => setShowDropdown(true)}
                disabled={!canApplyRemise}
                className="h-10 pl-4"
              />
              {showDropdown && filteredCompanies.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                  {filteredCompanies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleSelectCompany(company.id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors text-sm border-b border-slate-100 last:border-b-0"
                    >
                      <div className="font-medium text-slate-900">{company.name}</div>
                      <div className="text-xs text-slate-500">{company.id}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Remise Configuration Form */}
          <div className="grid grid-cols-2 gap-4">
            {/* Type de remise */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type de remise</Label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="remise-type"
                    value="percentage"
                    checked={remiseType === "percentage"}
                    onChange={(e) => {
                      setRemiseType(e.target.value as "percentage" | "fixed_amount")
                      setRemiseValue("")
                    }}
                    disabled={!canApplyRemise}
                  />
                  <span className="text-sm text-slate-700">Pourcentage (%)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="remise-type"
                    value="fixed_amount"
                    checked={remiseType === "fixed_amount"}
                    onChange={(e) => {
                      setRemiseType(e.target.value as "percentage" | "fixed_amount")
                      setRemiseValue("")
                    }}
                    disabled={!canApplyRemise}
                  />
                  <span className="text-sm text-slate-700">Montant fixe (MAD)</span>
                </label>
              </div>
            </div>

            {/* Valeur de la remise */}
            <div className="space-y-2">
              <Label htmlFor="remise-value" className="text-sm font-medium">
                Valeur de la remise <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="remise-value"
                  type="number"
                  min="0"
                  max={remiseType === "percentage" ? "100" : undefined}
                  placeholder={remiseType === "percentage" ? "ex: 10" : "ex: 500,00"}
                  value={remiseValue}
                  onChange={(e) => setRemiseValue(e.target.value)}
                  disabled={!canApplyRemise}
                  className="h-10 pl-4 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-medium text-sm">
                  {remiseType === "percentage" ? "%" : "MAD"}
                </span>
              </div>
              {remiseType === "percentage" && parseFloat(remiseValue) > 100 && (
                <p className="text-xs text-red-600">Le pourcentage ne peut pas dépasser 100%</p>
              )}
            </div>
          </div>

          {/* Remise Finale Display */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Remise finale calculée</Label>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="text-center">
                {remiseValue ? (
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      −{" "}
                      {remiseType === "percentage"
                        ? `${formatAmount(remiseFinal)} MAD`
                        : `${formatAmount(remiseFinal)} MAD`}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {remiseType === "percentage"
                        ? `${parseFloat(remiseValue)}% de ${formatAmount(pricingConfig.value)} MAD`
                        : "Montant fixe"}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm">Entrez une valeur pour voir la remise calculée</div>
                )}
              </div>
            </div>
          </div>

          {/* Motif de la remise */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Motif de la remise
            </Label>
            <Textarea
              id="reason"
              placeholder="Justification interne (optionnel)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={!canApplyRemise}
              className="min-h-24 resize-none text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleSaveRemise}
              disabled={!canApplyRemise || !selectedCompany || !remiseValue}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {editingId ? "Mettre à jour la remise" : "Enregistrer la remise"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="px-6"
            >
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card and Remises List */}
      {remises.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Remises configurées</h3>
          {remises.map((remise) => (
            <Card key={remise.id} className="border-slate-200">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {/* Company Info */}
                  <div>
                    <div className="text-xs text-slate-500 font-medium mb-1">Entreprise sélectionnée</div>
                    <div className="text-sm font-semibold text-slate-900">{remise.clientName}</div>
                    <div className="text-xs text-slate-500">{remise.clientId}</div>
                  </div>

                  {/* Pricing Type */}
                  <div>
                    <div className="text-xs text-slate-500 font-medium mb-1">Type de tarification active</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {pricingConfig.type === "standard_adria" ? "Standard Adria" : "Moteur externe"}
                    </div>
                  </div>

                  {/* Applied Discount */}
                  <div>
                    <div className="text-xs text-slate-500 font-medium mb-1">Remise appliquée</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {remise.type === "percentage" ? `${remise.value} %` : `${formatAmount(remise.value)} MAD`}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                  {/* Remise Finale Amount */}
                  <div>
                    <div className="text-xs text-slate-500 font-medium mb-1">Remise finale (montant total déduit)</div>
                    <div className="text-lg font-bold text-slate-900">
                      −{" "}
                      {remise.type === "percentage"
                        ? formatAmount((pricingConfig.value * remise.value) / 100)
                        : formatAmount(remise.value)}{" "}
                      MAD
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <div className="text-xs text-slate-500 font-medium mb-1">Statut</div>
                    <Badge
                      className={`${
                        remise.status === "validated"
                          ? "bg-green-100 text-green-800 border-0"
                          : "bg-orange-100 text-orange-800 border-0"
                      }`}
                    >
                      {remise.status === "validated" ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Validé
                        </span>
                      ) : (
                        "En attente"
                      )}
                    </Badge>
                  </div>

                  {/* Reason */}
                  {remise.reason && (
                    <div>
                      <div className="text-xs text-slate-500 font-medium mb-1">Motif</div>
                      <div className="text-sm text-slate-700">{remise.reason}</div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditRemise(remise)}
                    className="text-xs"
                  >
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteRemise(remise.id)}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
