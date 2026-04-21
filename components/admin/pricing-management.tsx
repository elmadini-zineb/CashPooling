"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { mockPricingConfig } from "@/lib/mock-data"
import { PricingConfig, PricingRule } from "@/lib/types"
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Settings } from "lucide-react"
import { toast } from "sonner"

export function PricingManagement() {
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(mockPricingConfig)
  const [showAddRule, setShowAddRule] = useState(false)
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "flat" as "flat" | "percentage" | "tiered",
    value: 0,
    minAmount: "",
    maxAmount: "",
  })

  const handleSourceChange = (source: "adria" | "external") => {
    if (source === "adria") {
      setPricingConfig({
        ...pricingConfig,
        sourceType: "adria",
        adriaEnabled: true,
        externalEnabled: false,
      })
      toast.success("Source de tarification changée vers Adria")
    } else {
      setPricingConfig({
        ...pricingConfig,
        sourceType: "external",
        adriaEnabled: false,
        externalEnabled: true,
      })
      toast.success("Source de tarification changée vers externe")
    }
  }

  const handleExternalProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name
    const value = e.target.value
    setPricingConfig({
      ...pricingConfig,
      [field]: value,
    })
  }

  const handleAddRule = () => {
    if (!formData.name || formData.value <= 0) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    const newRule: PricingRule = {
      id: `rule-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      value: formData.value,
      currency: "MAD",
      minAmount: formData.minAmount ? parseFloat(formData.minAmount) : undefined,
      maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : undefined,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (editingRule) {
      setPricingConfig({
        ...pricingConfig,
        rules: pricingConfig.rules.map((r) =>
          r.id === editingRule.id ? { ...newRule, id: editingRule.id } : r
        ),
      })
      toast.success("Règle de tarification mise à jour")
      setEditingRule(null)
    } else {
      setPricingConfig({
        ...pricingConfig,
        rules: [...pricingConfig.rules, newRule],
      })
      toast.success("Règle de tarification ajoutée")
    }

    setFormData({
      name: "",
      description: "",
      type: "flat",
      value: 0,
      minAmount: "",
      maxAmount: "",
    })
    setShowAddRule(false)
  }

  const handleEditRule = (rule: PricingRule) => {
    setEditingRule(rule)
    setFormData({
      name: rule.name,
      description: rule.description,
      type: rule.type,
      value: rule.value,
      minAmount: rule.minAmount?.toString() || "",
      maxAmount: rule.maxAmount?.toString() || "",
    })
    setShowAddRule(true)
  }

  const handleDeleteRule = (ruleId: string) => {
    setPricingConfig({
      ...pricingConfig,
      rules: pricingConfig.rules.filter((r) => r.id !== ruleId),
    })
    toast.success("Règle de tarification supprimée")
  }

  const handleToggleRuleActive = (ruleId: string) => {
    setPricingConfig({
      ...pricingConfig,
      rules: pricingConfig.rules.map((r) =>
        r.id === ruleId ? { ...r, isActive: !r.isActive } : r
      ),
    })
  }

  return (
    <div className="space-y-6">
      {/* Pricing Source Selection */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Settings className="w-5 h-5 text-blue-600" />
            Source de Tarification
          </CardTitle>
          <CardDescription className="text-slate-600">
            Choisissez votre source de tarification : utiliser le moteur Adria ou intégrer un moteur externe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Adria Option */}
            <Card
              className={`cursor-pointer transition-all ${
                pricingConfig.sourceType === "adria"
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-blue-300 bg-slate-50"
              }`}
              onClick={() => handleSourceChange("adria")}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      Moteur Adria
                      {pricingConfig.sourceType === "adria" && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Utiliser le moteur de tarification standard Adria avec des règles prédéfinies.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* External Option */}
            <Card
              className={`cursor-pointer transition-all ${
                pricingConfig.sourceType === "external"
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-blue-300 bg-slate-50"
              }`}
              onClick={() => handleSourceChange("external")}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      Moteur Externe
                      {pricingConfig.sourceType === "external" && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Intégrer un moteur de tarification externe avec API personnalisée.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* External Provider Configuration */}
          {pricingConfig.sourceType === "external" && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base text-slate-900">Configuration du Fournisseur Externe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="provider-name">Nom du Fournisseur</Label>
                  <Input
                    id="provider-name"
                    name="externalProviderName"
                    placeholder="Ex: Pricing Engine Pro"
                    value={pricingConfig.externalProviderName || ""}
                    onChange={handleExternalProviderChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="provider-api">URL de l&apos;API</Label>
                  <Input
                    id="provider-api"
                    name="externalApiEndpoint"
                    type="url"
                    placeholder="https://api.pricing-provider.com"
                    value={pricingConfig.externalApiEndpoint || ""}
                    onChange={handleExternalProviderChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="provider-key">Clé API</Label>
                  <Input
                    id="provider-key"
                    name="externalApiKey"
                    type="password"
                    placeholder="Votre clé API sécurisée"
                    value={pricingConfig.externalApiKey || ""}
                    onChange={handleExternalProviderChange}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Pricing Rules */}
      {pricingConfig.sourceType === "adria" && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-slate-900">Règles de Tarification Adria</CardTitle>
              <CardDescription className="text-slate-600">
                Gérez les règles de tarification du moteur Adria
              </CardDescription>
            </div>
            <Dialog open={showAddRule} onOpenChange={setShowAddRule}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingRule(null)
                    setFormData({
                      name: "",
                      description: "",
                      type: "flat",
                      value: 0,
                      minAmount: "",
                      maxAmount: "",
                    })
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une Règle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingRule ? "Modifier la règle" : "Ajouter une nouvelle règle"}
                  </DialogTitle>
                  <DialogDescription>
                    Définissez les paramètres de la règle de tarification
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rule-name">Nom de la Règle *</Label>
                    <Input
                      id="rule-name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ex: Frais de souscription"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rule-description">Description</Label>
                    <Textarea
                      id="rule-description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Description de la règle de tarification"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rule-type">Type *</Label>
                      <select
                        id="rule-type"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as "flat" | "percentage" | "tiered",
                          })
                        }
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
                      >
                        <option value="flat">Montant Fixe</option>
                        <option value="percentage">Pourcentage</option>
                        <option value="tiered">Échelonné</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="rule-value">Valeur *</Label>
                      <Input
                        id="rule-value"
                        type="number"
                        step="0.01"
                        value={formData.value}
                        onChange={(e) =>
                          setFormData({ ...formData, value: parseFloat(e.target.value) })
                        }
                        placeholder="0.00"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rule-min">Montant Minimum</Label>
                      <Input
                        id="rule-min"
                        type="number"
                        value={formData.minAmount}
                        onChange={(e) =>
                          setFormData({ ...formData, minAmount: e.target.value })
                        }
                        placeholder="Optionnel"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="rule-max">Montant Maximum</Label>
                      <Input
                        id="rule-max"
                        type="number"
                        value={formData.maxAmount}
                        onChange={(e) =>
                          setFormData({ ...formData, maxAmount: e.target.value })
                        }
                        placeholder="Optionnel"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleAddRule} className="flex-1">
                      {editingRule ? "Mettre à jour" : "Ajouter"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowAddRule(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {pricingConfig.rules.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Aucune règle de tarification configurée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Valeur</TableHead>
                      <TableHead>Plage</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingConfig.rules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{rule.name}</p>
                            <p className="text-xs text-slate-500">{rule.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {rule.type === "flat"
                              ? "Fixe"
                              : rule.type === "percentage"
                                ? "Pourcentage"
                                : "Échelonné"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {rule.value}
                          {rule.type === "percentage" ? "%" : ` ${rule.currency}`}
                        </TableCell>
                        <TableCell>
                          {rule.minAmount || rule.maxAmount ? (
                            <span className="text-sm">
                              {rule.minAmount ? `${rule.minAmount}` : "∞"} -{" "}
                              {rule.maxAmount ? `${rule.maxAmount}` : "∞"}
                            </span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleRuleActive(rule.id)}
                            className={rule.isActive ? "text-green-600" : "text-slate-400"}
                          >
                            {rule.isActive ? "Actif" : "Inactif"}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRule(rule)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
