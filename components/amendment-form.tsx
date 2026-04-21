"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { CashPoolingContract, PricingConfig } from "@/lib/types"
import { addAmendment, generateAmendmentNumber, getAllAmendments, addAuditLog, getAmendmentsByConvention } from "@/lib/mock-data"
  // Vérifier s'il existe déjà un avenant en attente pour cette convention
  const hasPendingAmendment = getAmendmentsByConvention(contract.id).some(a => a.status === "pending_signature")

import { ChevronLeft, AlertCircle } from "lucide-react"

interface AmendmentFormProps {
  contract: CashPoolingContract
}

export function AmendmentForm({ contract }: AmendmentFormProps) {
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [reason, setReason] = useState("")
  const [effectiveDate, setEffectiveDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split("T")[0]
  )

  // Section selection
  const [modifyPricing, setModifyPricing] = useState(true)
  const [modifyLeveling, setModifyLeveling] = useState(false)
  const [modifyDebitCoverage, setModifyDebitCoverage] = useState(false)
  const [modifySecondaryAccounts, setModifySecondaryAccounts] = useState(false)

  // Référence auto-générée
  const nextAmendmentNumber = useMemo(() => generateAmendmentNumber(contract.id), [contract.id])
  const autoReference = `AVN-${contract.contractNumber}-${nextAmendmentNumber}`

  // Pricing state with pre-filled values
  const originalPricing = contract.pricingConfig || {
    type: "variable",
    billingFrequency: "monthly",
    leveledAmountRate: 0.05,
    levelingOperationFees: 8,
    return (
      <Card className="max-w-3xl mx-auto mt-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}><ChevronLeft /></Button>
            <CardTitle>Générer un avenant</CardTitle>
          </div>
          <CardDescription>Remplissez les champs obligatoires pour générer un avenant numéroté</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Référence auto-générée */}
          <div className="flex items-center gap-2">
            <Label>Référence avenant :</Label>
            <span className="font-mono text-blue-700 text-base">{autoReference}</span>
          </div>
          {/* Bloc info validité contrat original */}
          <Alert className="bg-slate-50 border-blue-200 text-blue-900">
            <AlertDescription>
              Le contrat original reste <span className="font-semibold">valide</span> jusqu'à la date d'effet de l'avenant :
              <span className="ml-2 text-blue-700 font-bold">{new Date(effectiveDate).toLocaleDateString("fr-FR")}</span>
            </AlertDescription>
          </Alert>

          {/* Champs obligatoires */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Objet <span className="text-red-500">*</span></Label>
              <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} required maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motif <span className="text-red-500">*</span></Label>
              <Textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} required maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Date d'effet <span className="text-red-500">*</span></Label>
              <Input id="effectiveDate" type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} required />
            </div>
          </div>


          {/* Section modifiable : ancienne/nouvelle valeur */}
          {modifyPricing && (
            <div className="space-y-2">
              <Label>Tarification</Label>
              <div className="flex gap-4 items-center">
                <span className="line-through text-red-600">{originalPricing.type}</span>
                <span className="text-green-700 font-semibold">{billingFrequency}</span>
                {renderChangeIndicator(originalPricing.billingFrequency, billingFrequency)}
                {renderChangeIndicator(originalPricing.leveledAmountRate, leveledAmountRate, "percent")}
                {renderChangeIndicator(originalPricing.secondaryAccountFees, secondaryAccountFees, "currency")}
              </div>
            </div>
          )}

          {modifyLeveling && (
            <div className="space-y-2">
              <Label>Mode de nivellement par compte secondaire</Label>
              {/* Exemple pour Casablanca */}
              <div className="flex gap-4 items-center">
                <span className="line-through text-red-600">{originalLevelingModes.casablanca.mode}</span>
                <span className="text-green-700 font-semibold">{levelingModes.casablanca.mode}</span>
                {renderChangeIndicator(originalLevelingModes.casablanca.mode, levelingModes.casablanca.mode)}
              </div>
              {/* Répéter pour chaque compte secondaire... */}
            </div>
          )}

          {modifyDebitCoverage && (
            <div className="space-y-2">
              <Label>Couverture débitrice</Label>
              <div className="flex gap-4 items-center">
                <span className="line-through text-red-600">Full</span>
                <span className="text-green-700 font-semibold">{debitCoverageMode}</span>
                {renderChangeIndicator("Full", debitCoverageMode)}
              </div>
            </div>
          )}

          {modifySecondaryAccounts && (
            <div className="space-y-2">
              <Label>Comptes secondaires</Label>
              {/* Comptes à retirer */}
              {accountsToRemove.length > 0 && (
                <div className="text-red-600 text-sm">Retrait : {accountsToRemove.map(id => originalAccounts.find(a => a.id === id)?.name).join(", ")}</div>
              )}
              {/* Comptes à ajouter */}
              {accountsToAdd.length > 0 && (
                <div className="text-green-700 text-sm">Ajout : {accountsToAdd.map(a => a.name).join(", ")}</div>
              )}
              {/* Alerte si aucun compte secondaire */}
              {accountsToRemove.length === originalAccounts.length && accountsToAdd.length === 0 && (
                <Alert className="bg-orange-50 border-orange-200 text-orange-900 mt-2">
                  <AlertDescription>La convention doit conserver au minimum un compte secondaire.</AlertDescription>
                </Alert>
              )}
              {/* Alerte recalcul frais */}
              {(modifyPricing && (originalPricing.type === "variable" || originalPricing.type === "hybrid") && (accountsToAdd.length > 0 || accountsToRemove.length > 0)) && (
                <Alert className="bg-blue-50 border-blue-200 text-blue-900 mt-2">
                  <AlertDescription>Les frais seront recalculés automatiquement suite à la modification des comptes secondaires.</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Compte centralisateur en lecture seule avec info-bulle */}
          <div className="space-y-2">
            <Label>Compte centralisateur</Label>
            <div className="flex items-center gap-2">
              <Input value={contract.masterAccount?.iban || ""} readOnly className="w-80 bg-slate-100" />
              <span className="text-xs text-slate-500" title="Pour changer le centralisateur, il faut créer une nouvelle convention.">🔒 Non modifiable via avenant</span>
            </div>
          </div>

          {/* Bouton Générer */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" disabled={isLoading || hasPendingAmendment} onClick={() => {}} className="bg-blue-600 hover:bg-blue-700">
              Générer l'avenant
            </Button>
          </div>
          {hasPendingAmendment && (
            <Alert className="bg-blue-50 border-blue-200 text-blue-900 mt-2">
              <AlertDescription>Un avenant est déjà en attente de signature pour cette convention. Vous ne pouvez pas en générer un nouveau tant que le précédent n'est pas signé ou rejeté.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
    if (modifyLeveling) {
      if (levelingModes.casablanca.mode !== originalLevelingModes.casablanca.mode) return true
      if (levelingModes.rabat.mode !== originalLevelingModes.rabat.mode) return true
      if (levelingModes.tanger.mode !== originalLevelingModes.tanger.mode) return true
      // Check params changes too
      if (JSON.stringify(levelingModes) !== JSON.stringify(originalLevelingModes)) return true
    }
    
    if (modifyDebitCoverage) {
      if (debitCoverageMode !== "full") return true
      if (JSON.stringify(debitCoveragePriorities) !== JSON.stringify({
        casablanca: { priority: 1, minAmount: 0 },
        rabat: { priority: 2, minAmount: 0 },
        tanger: { priority: 3, minAmount: 0 },
      })) return true
    }
    
    return false
  }, [modifyPricing, billingFrequency, leveledAmountRate, operationFeesZBA, operationFeesTBA, operationFeesFBA, secondaryAccountFees, originalPricing, modifyLeveling, levelingModes, modifyDebitCoverage, debitCoverageMode, debitCoveragePriorities])

  // Validate leveling modes
  const validateLevelingModes = useMemo(() => {
    const errors: Record<string, string> = {}
    
    if (modifyLeveling) {
      // Rabat - TBA validation
      if (levelingModes.rabat.mode === "TBA") {
        const targetBalance = levelingModes.rabat.params?.targetBalance || 0
        if (!targetBalance || targetBalance <= 0) {
          errors.rabatTBA = "Le solde cible est obligatoire et doit être supérieur à 0."
        }
      }
      
      // Tanger - FBA validation
      if (levelingModes.tanger.mode === "FBA") {
        const minThreshold = levelingModes.tanger.params?.minThreshold || 0
        const maxThreshold = levelingModes.tanger.params?.maxThreshold || 0
        if (minThreshold >= maxThreshold) {
          errors.tangerFBA = "Le seuil minimum doit être strictement inférieur au seuil maximum."
        }
      }
    }
    
    return errors
  }, [modifyLeveling, levelingModes])

  // Validate debit coverage priorities
  const validateDebitCoverage = useMemo(() => {
    const errors: string[] = []
    
    if (modifyDebitCoverage && debitCoverageMode === "partial") {
      const priorities = [debitCoveragePriorities.casablanca.priority, debitCoveragePriorities.rabat.priority, debitCoveragePriorities.tanger.priority]
      const uniquePriorities = new Set(priorities)
      if (uniquePriorities.size !== priorities.length) {
        errors.push("Les valeurs de priorité doivent être uniques.")
      }
    }
    
    return errors
  }, [modifyDebitCoverage, debitCoverageMode, debitCoveragePriorities])

  // Validate secondary accounts
  const validateSecondaryAccounts = useMemo(() => {
    const errors: string[] = []
    
    if (modifySecondaryAccounts) {
      // Check if all accounts are marked for removal
      if (accountsToRemove.length === originalAccounts.length && accountsToAdd.length === 0) {
        errors.push("La convention doit conserver au minimum un compte secondaire.")
      }
      
      // Check for duplicate accounts (in both removal and addition lists)
      accountsToAdd.forEach((addedAccount) => {
        if (accountsToRemove.includes(addedAccount.id)) {
          errors.push(`Ce compte est déjà présent dans la convention: ${addedAccount.name}`)
        }
      })
      
      // Validate TBA target balance
      accountsToAdd.forEach((account) => {
        if (account.mode === "TBA") {
          if (!account.params?.targetBalance || account.params.targetBalance <= 0) {
            errors.push(`Le solde cible est obligatoire pour le mode TBA: ${account.name}`)
          }
        }
      })
      
      // Validate FBA thresholds
      accountsToAdd.forEach((account) => {
        if (account.mode === "FBA") {
          const min = account.params?.minThreshold || 0
          const max = account.params?.maxThreshold || 0
          if (min >= max) {
            errors.push(`Le seuil minimum doit être strictement inférieur au seuil maximum: ${account.name}`)
          }
        }
      })
    }
    
    return errors
  }, [modifySecondaryAccounts, accountsToRemove, accountsToAdd, originalAccounts.length])

  // Check if form is valid for submission
  const isFormValid = useMemo(() => {
    const hasSelection = modifyPricing || modifyLeveling || modifyDebitCoverage || modifySecondaryAccounts
    const hasRequiredFields = subject.trim() && reason.trim()
    const noValidationErrors = Object.keys(validateLevelingModes).length === 0 && validateDebitCoverage.length === 0 && validateSecondaryAccounts.length === 0
    return hasSelection && hasRequiredFields && hasChanges && noValidationErrors
  }, [modifyPricing, modifyLeveling, modifyDebitCoverage, modifySecondaryAccounts, subject, reason, hasChanges, validateLevelingModes, validateDebitCoverage, validateSecondaryAccounts])

  const renderChangeIndicator = (oldValue: any, newValue: any, format: string = "") => {
    if (oldValue === newValue) return null
    
    let formattedOld = oldValue
    let formattedNew = newValue
    
    if (format === "percent") {
      formattedOld = `${oldValue}%`
      formattedNew = `${newValue}%`
    } else if (format === "currency") {
      formattedOld = `${oldValue} MAD`
      formattedNew = `${newValue} MAD`
    }
    
    return (
      <div className="ml-2 inline-flex items-center gap-1 text-sm">
        <span className="line-through text-slate-400">{formattedOld}</span>
        <span className="text-slate-400">→</span>
        <span className="font-semibold text-green-600">{formattedNew}</span>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) {
      alert("Veuillez remplir tous les champs obligatoires et modifier au moins une valeur")
      return
    }

    setIsLoading(true)

    try {
      const amendments = getAllAmendments()
      const amendmentNumber = generateAmendmentNumber(contract.contractNumber, amendments)

      const newPricingConfig: PricingConfig = {
        type: "variable",
        billingFrequency: billingFrequency as any,
        leveledAmountRate: leveledAmountRate,
        levelingOperationFees: operationFeesZBA,
        secondaryAccountFees: secondaryAccountFees,
      }

      const newAmendment = {
        id: `amendment-${Date.now()}`,
        conventionId: contract.id,
        conventionReference: contract.contractNumber,
        amendmentNumber,
        subject,
        reason,
        effectiveDate: new Date(effectiveDate),
        status: "draft" as const,
        previousPricingConfig: originalPricing,
        newPricingConfig,
        createdBy: "adria@admin.com",
        createdAt: new Date(),
      }

      addAmendment(newAmendment)

      addAuditLog({
        id: `audit-${Date.now()}`,
        entityType: "amendment" as const,
        entityId: newAmendment.id,
        action: `Avenant ${amendmentNumber} généré`,
        userEmail: "adria@admin.com",
        details: { subject },
        createdAt: new Date(),
      })

      router.push(`/conventions/${contract.id}/amendment/${newAmendment.id}`)
    } catch (error) {
      console.error("Error creating amendment:", error)
      alert("Erreur lors de la création de l'avenant")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 ml-2">
          Vous modifiez la convention <span className="font-semibold">{contract.contractNumber} — {contract.clientName}</span>. Un avenant officiel sera généré et devra être signé par le client avant prise d'effet.
        </AlertDescription>
      </Alert>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/conventions/${contract.id}`)}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour à la convention
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required Fields Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations de l'avenant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subject" className="text-sm font-medium">
                Objet de l'avenant *
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Modification des paramètres de tarification"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="reason" className="text-sm font-medium">
                Motif de la modification *
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Décrivez le contexte et la raison de cette modification"
                className="mt-1.5 min-h-32"
              />
            </div>

            <div>
              <Label htmlFor="effectiveDate" className="text-sm font-medium">
                Date d'effet *
              </Label>
              <Input
                id="effectiveDate"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-slate-500 mt-1">
                Par défaut : 1er jour du mois suivant
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Que souhaitez-vous modifier ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="modify-pricing"
                checked={modifyPricing}
                onCheckedChange={(checked) => setModifyPricing(checked as boolean)}
              />
              <Label htmlFor="modify-pricing" className="font-medium cursor-pointer">
                Tarification
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="modify-leveling"
                checked={modifyLeveling}
                onCheckedChange={(checked) => setModifyLeveling(checked as boolean)}
              />
              <Label htmlFor="modify-leveling" className="font-medium cursor-pointer">
                Mode de nivellement
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="modify-debit"
                checked={modifyDebitCoverage}
                onCheckedChange={(checked) => setModifyDebitCoverage(checked as boolean)}
              />
              <Label htmlFor="modify-debit" className="font-medium cursor-pointer">
                Couverture débitrice
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="modify-accounts"
                checked={modifySecondaryAccounts}
                onCheckedChange={(checked) => setModifySecondaryAccounts(checked as boolean)}
              />
              <Label htmlFor="modify-accounts" className="font-medium cursor-pointer">
                Comptes secondaires
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Configuration Section */}
        {modifyPricing && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tarification</CardTitle>
              <CardDescription>
                Les valeurs pré-remplies correspondent à la configuration actuelle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  Périodicité de facturation
                </Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <select
                    value={billingFrequency}
                    onChange={(e) => setBillingFrequency(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm flex-1"
                  >
                    <option value="monthly">Mensuelle</option>
                    <option value="quarterly">Trimestrielle</option>
                    <option value="annual">Annuelle</option>
                  </select>
                  {renderChangeIndicator(originalPricing.billingFrequency, billingFrequency)}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Taux sur montant nivelé
                </Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={leveledAmountRate}
                      onChange={(e) => setLeveledAmountRate(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-slate-600 font-medium">%</span>
                  </div>
                  {renderChangeIndicator(originalPricing.leveledAmountRate || 0.05, leveledAmountRate, "percent")}
                </div>
              </div>

              {/* Mode-specific operation fees */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <p className="text-sm font-semibold text-slate-900">Frais par opération de nivellement</p>
                
                <div>
                  <Label className="text-sm font-medium">
                    Frais par sweep automatique (MAD)
                  </Label>
                  <p className="text-xs text-slate-600 mb-1.5">Compte MT Casablanca — mode ZBA</p>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={operationFeesZBA}
                      onChange={(e) => setOperationFeesZBA(Number(e.target.value))}
                      className="flex-1"
                    />
                    {renderChangeIndicator(8, operationFeesZBA, "currency")}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Frais par ajustement vers solde cible (MAD)
                  </Label>
                  <p className="text-xs text-slate-600 mb-1.5">Compte MT Rabat — mode TBA</p>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={operationFeesTBA}
                      onChange={(e) => setOperationFeesTBA(Number(e.target.value))}
                      className="flex-1"
                    />
                    {renderChangeIndicator(12, operationFeesTBA, "currency")}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Frais par opération dans la plage (MAD)
                  </Label>
                  <p className="text-xs text-slate-600 mb-1.5">Compte MT Tanger — mode FBA</p>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={operationFeesFBA}
                      onChange={(e) => setOperationFeesFBA(Number(e.target.value))}
                      className="flex-1"
                    />
                    {renderChangeIndicator(6, operationFeesFBA, "currency")}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Frais par compte secondaire/mois
                </Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <Input
                    type="number"
                    value={secondaryAccountFees}
                    onChange={(e) => setSecondaryAccountFees(Number(e.target.value))}
                    className="flex-1"
                  />
                  {renderChangeIndicator(originalPricing.secondaryAccountFees || 200, secondaryAccountFees, "currency")}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other sections (placeholders) */}
        {modifyLeveling && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mode de nivellement</CardTitle>
              <CardDescription>Configurez le mode de nivellement pour chaque compte secondaire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border border-slate-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Compte secondaire</th>
                      <th className="px-4 py-2 text-left font-semibold">Mode actuel</th>
                      <th className="px-4 py-2 text-left font-semibold">Nouveau mode</th>
                      <th className="px-4 py-2 text-left font-semibold">Paramètres associés</th>
                    </tr>
                  </thead>
                  <tbody className="border border-t-0 border-slate-200">
                    {/* MT Casablanca - ZBA */}
                    <tr className="border-b border-slate-200">
                      <td className="px-4 py-3">MT Casablanca</td>
                      <td className="px-4 py-3">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">ZBA</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={levelingModes.casablanca.mode}
                          onChange={(e) => {
                            const newMode = e.target.value as "ZBA" | "TBA" | "FBA"
                            setLevelingModes(prev => ({
                              ...prev,
                              casablanca: { mode: newMode, params: {} }
                            }))
                          }}
                          className="px-3 py-1 border border-slate-300 rounded text-sm"
                        >
                          <option value="ZBA">ZBA</option>
                          <option value="TBA">TBA</option>
                          <option value="FBA">FBA</option>
                        </select>
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>

                    {/* MT Rabat - TBA */}
                    <tr className="border-b border-slate-200">
                      <td className="px-4 py-3">MT Rabat</td>
                      <td className="px-4 py-3">
                        <Badge className="bg-green-100 text-green-800 border-green-300">TBA</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={levelingModes.rabat.mode}
                          onChange={(e) => {
                            const newMode = e.target.value as "ZBA" | "TBA" | "FBA"
                            setLevelingModes(prev => ({
                              ...prev,
                              rabat: { mode: newMode, params: newMode === "TBA" ? { targetBalance: 500000 } : newMode === "FBA" ? { minThreshold: 0, maxThreshold: 0 } : {} }
                            }))
                            setLevelingErrors(prev => ({ ...prev, rabatTBA: "" }))
                          }}
                          className="px-3 py-1 border border-slate-300 rounded text-sm"
                        >
                          <option value="ZBA">ZBA</option>
                          <option value="TBA">TBA</option>
                          <option value="FBA">FBA</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {levelingModes.rabat.mode === "TBA" && (
                          <Input
                            type="number"
                            value={levelingModes.rabat.params?.targetBalance || ""}
                            onChange={(e) => {
                              setLevelingModes(prev => ({
                                ...prev,
                                rabat: { ...prev.rabat, params: { targetBalance: Number(e.target.value) } }
                              }))
                            }}
                            placeholder="Solde cible"
                            className="w-32"
                          />
                        )}
                        {levelingModes.rabat.mode === "FBA" && (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={levelingModes.rabat.params?.minThreshold || ""}
                              onChange={(e) => {
                                setLevelingModes(prev => ({
                                  ...prev,
                                  rabat: { ...prev.rabat, params: { ...prev.rabat.params, minThreshold: Number(e.target.value) } }
                                }))
                              }}
                              placeholder="Min"
                              className="w-24"
                            />
                            <Input
                              type="number"
                              value={levelingModes.rabat.params?.maxThreshold || ""}
                              onChange={(e) => {
                                setLevelingModes(prev => ({
                                  ...prev,
                                  rabat: { ...prev.rabat, params: { ...prev.rabat.params, maxThreshold: Number(e.target.value) } }
                                }))
                              }}
                              placeholder="Max"
                              className="w-24"
                            />
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* MT Tanger - FBA */}
                    <tr>
                      <td className="px-4 py-3">MT Tanger</td>
                      <td className="px-4 py-3">
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300">FBA</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={levelingModes.tanger.mode}
                          onChange={(e) => {
                            const newMode = e.target.value as "ZBA" | "TBA" | "FBA"
                            setLevelingModes(prev => ({
                              ...prev,
                              tanger: { mode: newMode, params: newMode === "FBA" ? { minThreshold: 100000, maxThreshold: 800000 } : newMode === "TBA" ? { targetBalance: 0 } : {} }
                            }))
                          }}
                          className="px-3 py-1 border border-slate-300 rounded text-sm"
                        >
                          <option value="ZBA">ZBA</option>
                          <option value="TBA">TBA</option>
                          <option value="FBA">FBA</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {levelingModes.tanger.mode === "FBA" && (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={levelingModes.tanger.params?.minThreshold || ""}
                              onChange={(e) => {
                                setLevelingModes(prev => ({
                                  ...prev,
                                  tanger: { ...prev.tanger, params: { ...prev.tanger.params, minThreshold: Number(e.target.value) } }
                                }))
                                setLevelingErrors(prev => ({ ...prev, tangerFBA: "" }))
                              }}
                              placeholder="Min"
                              className="w-24"
                            />
                            <Input
                              type="number"
                              value={levelingModes.tanger.params?.maxThreshold || ""}
                              onChange={(e) => {
                                setLevelingModes(prev => ({
                                  ...prev,
                                  tanger: { ...prev.tanger, params: { ...prev.tanger.params, maxThreshold: Number(e.target.value) } }
                                }))
                                setLevelingErrors(prev => ({ ...prev, tangerFBA: "" }))
                              }}
                              placeholder="Max"
                              className="w-24"
                            />
                          </div>
                        )}
                        {levelingModes.tanger.mode === "TBA" && (
                          <Input
                            type="number"
                            value={levelingModes.tanger.params?.targetBalance || ""}
                            onChange={(e) => {
                              setLevelingModes(prev => ({
                                ...prev,
                                tanger: { ...prev.tanger, params: { targetBalance: Number(e.target.value) } }
                              }))
                            }}
                            placeholder="Solde cible"
                            className="w-32"
                          />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Validation errors */}
              {validateLevelingModes.rabatTBA && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 ml-2">
                    {validateLevelingModes.rabatTBA}
                  </AlertDescription>
                </Alert>
              )}
              {validateLevelingModes.tangerFBA && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 ml-2">
                    {validateLevelingModes.tangerFBA}
                  </AlertDescription>
                </Alert>
              )}

              <p className="text-xs text-slate-600 italic pt-2">
                Le changement de mode de nivellement prend effet à la date d'effet de l'avenant et peut impacter les opérations automatiques de nivellement.
              </p>
            </CardContent>
          </Card>
        )}

        {modifyDebitCoverage && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Couverture débitrice</CardTitle>
              <CardDescription>Configurez le mode de couverture du débit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">Mode de couverture</Label>
                  {debitCoverageMode !== "full" && (
                    <span className="text-xs text-slate-600">
                      <span className="line-through text-slate-400">Full</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className="font-semibold text-green-600">Partial</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Full Coverage Card */}
                  <Card
                    className={`cursor-pointer transition-all ${
                      debitCoverageMode === "full"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => setDebitCoverageMode("full")}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="coverage-mode"
                          value="full"
                          checked={debitCoverageMode === "full"}
                          onChange={(e) => setDebitCoverageMode("full")}
                          className="mt-1"
                        />
                        <div>
                          <Label className="font-semibold cursor-pointer">Full</Label>
                          <p className="text-xs text-slate-600 mt-1">
                            Couverture totale du débit depuis le compte centralisateur
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Partial Coverage Card */}
                  <Card
                    className={`cursor-pointer transition-all ${
                      debitCoverageMode === "partial"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => setDebitCoverageMode("partial")}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="coverage-mode"
                          value="partial"
                          checked={debitCoverageMode === "partial"}
                          onChange={(e) => setDebitCoverageMode("partial")}
                          className="mt-1"
                        />
                        <div>
                          <Label className="font-semibold cursor-pointer">Partial</Label>
                          <p className="text-xs text-slate-600 mt-1">
                            Couverture selon les fonds disponibles avec gestion des priorités
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Priorities Table for Partial Coverage */}
              {debitCoverageMode === "partial" && (
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <p className="text-sm font-semibold text-slate-900">Tableau des priorités</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border border-slate-200">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Compte secondaire</th>
                          <th className="px-4 py-2 text-left font-semibold">Priorité</th>
                          <th className="px-4 py-2 text-left font-semibold">Montant minimum à maintenir (MAD)</th>
                        </tr>
                      </thead>
                      <tbody className="border border-t-0 border-slate-200">
                        {["casablanca", "rabat", "tanger"].map((account, idx) => {
                          const accountNames: Record<string, string> = {
                            casablanca: "MT Casablanca",
                            rabat: "MT Rabat",
                            tanger: "MT Tanger",
                          }
                          return (
                            <tr key={account} className="border-b border-slate-200">
                              <td className="px-4 py-3">{accountNames[account]}</td>
                              <td className="px-4 py-3">
                                <Input
                                  type="number"
                                  value={debitCoveragePriorities[account as keyof typeof debitCoveragePriorities].priority}
                                  onChange={(e) => {
                                    setDebitCoveragePriorities(prev => ({
                                      ...prev,
                                      [account]: { ...prev[account as keyof typeof prev], priority: Number(e.target.value) }
                                    }))
                                    setDebitCoverageErrors([])
                                  }}
                                  min="1"
                                  max="3"
                                  className="w-16"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="number"
                                  value={debitCoveragePriorities[account as keyof typeof debitCoveragePriorities].minAmount}
                                  onChange={(e) => {
                                    setDebitCoveragePriorities(prev => ({
                                      ...prev,
                                      [account]: { ...prev[account as keyof typeof prev], minAmount: Number(e.target.value) }
                                    }))
                                  }}
                                  placeholder="0"
                                  className="w-32"
                                />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Priority Validation Errors */}
                  {validateDebitCoverage.map((error, idx) => (
                    <Alert key={idx} className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700 ml-2">
                        {error}
                      </AlertDescription>
                    </Alert>
                  ))}

                  <p className="text-xs text-slate-600 italic pt-2">
                    La priorité 1 est couverte en premier en cas de déficit. Les valeurs de priorité doivent être uniques et comprises entre 1 et 3.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {modifySecondaryAccounts && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comptes secondaires</CardTitle>
              <CardDescription>Gérez les comptes secondaires rattachés à la convention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Validation Errors */}
              {validateSecondaryAccounts.map((error, idx) => (
                <Alert key={idx} className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 ml-2">
                    {error}
                  </AlertDescription>
                </Alert>
              ))}

              {/* Two-column layout */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Current Accounts Subsection */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-900">Comptes actuels</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 border border-slate-200">
                        <tr>
                          <th className="px-2 py-2 text-left font-semibold">Compte</th>
                          <th className="px-2 py-2 text-left font-semibold">IBAN</th>
                          <th className="px-2 py-2 text-left font-semibold">Mode</th>
                          <th className="px-2 py-2 text-left font-semibold">Statut</th>
                          <th className="px-2 py-2 text-center font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="border border-t-0 border-slate-200">
                        {originalAccounts.map((account) => {
                          const isMarkedForRemoval = accountsToRemove.includes(account.id)
                          return (
                            <tr
                              key={account.id}
                              className={`border-b border-slate-200 transition-colors ${
                                isMarkedForRemoval ? "bg-red-50" : ""
                              }`}
                            >
                              <td className={`px-2 py-2 ${isMarkedForRemoval ? "line-through text-red-600" : ""}`}>
                                {account.name}
                              </td>
                              <td className="px-2 py-2 font-mono text-xs">{account.iban}</td>
                              <td className="px-2 py-2">
                                <Badge
                                  className={
                                    account.mode === "ZBA"
                                      ? "bg-blue-100 text-blue-800 border-blue-300"
                                      : account.mode === "TBA"
                                        ? "bg-green-100 text-green-800 border-green-300"
                                        : "bg-orange-100 text-orange-800 border-orange-300"
                                  }
                                >
                                  {account.mode}
                                </Badge>
                              </td>
                              <td className="px-2 py-2">
                                {isMarkedForRemoval ? (
                                  <Badge className="bg-red-100 text-red-800 border-red-300">À retirer</Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-800 border-green-300">Actif</Badge>
                                )}
                              </td>
                              <td className="px-2 py-2 text-center">
                                {!isMarkedForRemoval ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-300 hover:bg-red-50 h-6 text-xs"
                                    onClick={() => setAccountsToRemove([...accountsToRemove, account.id])}
                                  >
                                    Retirer
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="text-slate-600 border-slate-300 h-6 text-xs"
                                    onClick={() =>
                                      setAccountsToRemove(accountsToRemove.filter((id) => id !== account.id))
                                    }
                                  >
                                    Annuler
                                  </Button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Warning for marked removals */}
                  {accountsToRemove.length > 0 && (
                    <Alert className="bg-red-50 border-red-200 mt-3">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700 ml-2 text-xs">
                        Attention : le retrait prend effet à la date d'effet de l'avenant.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Divider */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -ml-px" />

                {/* Add Accounts Subsection */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-900">Ajouter un compte</h3>

                  {/* Search */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Rechercher un compte par IBAN ou nom"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="bg-blue-50 text-blue-600 border-blue-300 hover:bg-blue-100"
                    >
                      Rechercher
                    </Button>
                  </div>

                  {/* Search Results */}
                  {searchQuery && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableAccounts
                        .filter(
                          (acc) =>
                            !accountsToAdd.find((a) => a.id === acc.id) &&
                            (acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              acc.iban.includes(searchQuery))
                        )
                        .map((account) => (
                          <Card key={account.id} className="p-3 border-slate-200">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{account.name}</p>
                                <p className="text-xs text-slate-600">{account.iban} • MAD</p>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  setAccountsToAdd([...accountsToAdd, account])
                                  setSearchQuery("")
                                }}
                                className="bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                              >
                                Sélectionner
                              </Button>
                            </div>
                          </Card>
                        ))}
                    </div>
                  )}

                  {/* Added Accounts */}
                  {accountsToAdd.length > 0 && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 space-y-3">
                      <p className="font-semibold text-sm text-green-900">Comptes à ajouter</p>

                      {accountsToAdd.map((account) => (
                        <Card key={account.id} className="bg-white p-3 border-slate-200">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-sm">{account.name}</p>
                                <p className="text-xs text-slate-600">{account.iban}</p>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50 h-6 text-xs"
                                onClick={() =>
                                  setAccountsToAdd(accountsToAdd.filter((a) => a.id !== account.id))
                                }
                              >
                                Retirer
                              </Button>
                            </div>

                            {/* Mode and Parameters */}
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs font-medium">Mode de nivellement *</Label>
                                <select
                                  value={account.mode}
                                  onChange={(e) => {
                                    const newMode = e.target.value as "ZBA" | "TBA" | "FBA"
                                    const newAccounts = accountsToAdd.map((a) =>
                                      a.id === account.id
                                        ? {
                                            ...a,
                                            mode: newMode,
                                            params:
                                              newMode === "TBA"
                                                ? { targetBalance: 0 }
                                                : newMode === "FBA"
                                                  ? { minThreshold: 0, maxThreshold: 0 }
                                                  : {},
                                          }
                                        : a
                                    )
                                    setAccountsToAdd(newAccounts)
                                  }}
                                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                                >
                                  <option value="ZBA">ZBA</option>
                                  <option value="TBA">TBA</option>
                                  <option value="FBA">FBA</option>
                                </select>
                              </div>

                              {/* Dynamic Parameters */}
                              {account.mode === "TBA" && (
                                <div>
                                  <Label className="text-xs font-medium">Solde cible MAD *</Label>
                                  <Input
                                    type="number"
                                    value={account.params?.targetBalance || ""}
                                    onChange={(e) => {
                                      const newAccounts = accountsToAdd.map((a) =>
                                        a.id === account.id
                                          ? {
                                              ...a,
                                              params: {
                                                ...a.params,
                                                targetBalance: Number(e.target.value),
                                              },
                                            }
                                          : a
                                      )
                                      setAccountsToAdd(newAccounts)
                                    }}
                                    placeholder="0"
                                    className="h-8 text-xs"
                                  />
                                </div>
                              )}

                              {account.mode === "FBA" && (
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <Label className="text-xs font-medium">Seuil minimum MAD *</Label>
                                    <Input
                                      type="number"
                                      value={account.params?.minThreshold || ""}
                                      onChange={(e) => {
                                        const newAccounts = accountsToAdd.map((a) =>
                                          a.id === account.id
                                            ? {
                                                ...a,
                                                params: {
                                                  ...a.params,
                                                  minThreshold: Number(e.target.value),
                                                },
                                              }
                                            : a
                                        )
                                        setAccountsToAdd(newAccounts)
                                      }}
                                      placeholder="0"
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <Label className="text-xs font-medium">Seuil maximum MAD *</Label>
                                    <Input
                                      type="number"
                                      value={account.params?.maxThreshold || ""}
                                      onChange={(e) => {
                                        const newAccounts = accountsToAdd.map((a) =>
                                          a.id === account.id
                                            ? {
                                                ...a,
                                                params: {
                                                  ...a.params,
                                                  maxThreshold: Number(e.target.value),
                                                },
                                              }
                                            : a
                                        )
                                        setAccountsToAdd(newAccounts)
                                      }}
                                      placeholder="0"
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}

                      <Alert className="bg-green-50 border-green-200">
                        <AlertCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700 ml-2 text-xs">
                          Les nouveaux comptes seront rattachés à la convention à la date d'effet de l'avenant.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Génération..." : "Générer l'avenant"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/conventions/${contract.id}`)}
          >
            Annuler
          </Button>
        </div>

        {!isFormValid && (modifyPricing || modifyLeveling || modifyDebitCoverage || modifySecondaryAccounts) && (
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded">
            Le bouton sera activé quand vous aurez modifié au moins une valeur par rapport à la configuration actuelle.
          </p>
        )}
      </form>
    </div>
  )
}
