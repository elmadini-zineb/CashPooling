"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AmendmentSections } from "@/components/amendment-sections"
import type { CashPoolingContract, PricingConfig, Account, Amendment } from "@/lib/types"
import {
  addAmendment,
  generateAmendmentNumber,
  getAllAmendments,
  addAuditLog,
  getAmendmentsByConvention,
} from "@/lib/mock-data"
import { ChevronLeft, AlertCircle } from "lucide-react"

interface AmendmentFormProps {
  contract: CashPoolingContract
}

export function AmendmentForm({ contract }: AmendmentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Required fields
  const [subject, setSubject] = useState("")
  const [reason, setReason] = useState("")
  const [effectiveDate, setEffectiveDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      .toISOString()
      .split("T")[0]
  )

  // Section selection - removed modifyPricing
  const [modifyLeveling, setModifyLeveling] = useState(false)
  const [modifyDebitCoverage, setModifyDebitCoverage] = useState(false)
  const [modifySecondaryAccounts, setModifySecondaryAccounts] = useState(false)
  const [modifyIntermediateAccounts, setModifyIntermediateAccounts] = useState(false)
  const [modifyEndDate, setModifyEndDate] = useState(false)
  const [newEndDate, setNewEndDate] = useState(contract.endDate)

  // Leveling state
  const [levelingModes, setLevelingModes] = useState({
    casablanca: { mode: "ZBA", params: {} },
    rabat: { mode: "TBA", params: { targetBalance: 500000 } },
    tanger: { mode: "FBA", params: { minThreshold: 100000, maxThreshold: 800000 } },
  })
  const [levelingErrors, setLevelingErrors] = useState<Record<string, string>>({})

  // Debit coverage state
  const [debitCoverageMode, setDebitCoverageMode] = useState("full")
  const [debitCoveragePriorities, setDebitCoveragePriorities] = useState({
    casablanca: { priority: 1, minAmount: 0 },
    rabat: { priority: 2, minAmount: 0 },
    tanger: { priority: 3, minAmount: 0 },
  })

  // Secondary accounts state
  const [accountsToAdd, setAccountsToAdd] = useState<Account[]>([])
  const [accountsToRemove, setAccountsToRemove] = useState<string[]>([])
  
  // Intermediate accounts state
  const [intermediateAccountsToAdd, setIntermediateAccountsToAdd] = useState<Account[]>([])
  const [intermediateAccountsToRemove, setIntermediateAccountsToRemove] = useState<string[]>([])

  // Auto-generated reference
  const nextAmendmentNumber = useMemo(
    () => {
      const amendments = getAllAmendments()
      const count = amendments.filter((a) => a.conventionId === contract.id).length
      return String(count + 1).padStart(3, "0")
    },
    [contract.id]
  )

  const hasPendingAmendment = useMemo(
    () => getAmendmentsByConvention(contract.id).some((a) => a.status === "pending_signature"),
    [contract.id]
  )

  const autoReference = `AVN-${contract.contractNumber}-${nextAmendmentNumber}`

  // Handle pricing changes
  // Handle debit coverage change
  const handleDebitCoverageChange = (mode: string, priorities?: any) => {
    setDebitCoverageMode(mode)
    if (priorities) {
      setDebitCoveragePriorities(priorities)
    }
  }

  // Handle accounts change
  const handleAccountsChange = (toAdd: Account[], toRemove: string[]) => {
    setAccountsToAdd(toAdd)
    setAccountsToRemove(toRemove)
  }

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

  // Validate debit coverage
  const validateDebitCoverage = useMemo(() => {
    const errors: string[] = []

    if (modifyDebitCoverage && debitCoverageMode === "partial") {
      const priorities = [
        debitCoveragePriorities.casablanca.priority,
        debitCoveragePriorities.rabat.priority,
        debitCoveragePriorities.tanger.priority,
      ]
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
      if (
        accountsToRemove.length === contract.secondaryAccounts.length &&
        accountsToAdd.length === 0
      ) {
        errors.push("La convention doit conserver au minimum un compte secondaire.")
      }

      // Check for duplicate accounts
      accountsToAdd.forEach((addedAccount) => {
        if (accountsToRemove.includes(addedAccount.id)) {
          errors.push(`Ce compte est déjà présent dans la convention: ${addedAccount.accountNumber}`)
        }
      })
    }

    return errors
  }, [modifySecondaryAccounts, accountsToRemove, accountsToAdd, contract.secondaryAccounts])

  // Check if there are actual changes
  const hasChanges = useMemo(() => {
    if (modifyLeveling) {
      return true
    }

    if (modifyDebitCoverage) {
      return true
    }

    if (modifySecondaryAccounts && (accountsToAdd.length > 0 || accountsToRemove.length > 0)) {
      return true
    }

    if (modifyIntermediateAccounts && (intermediateAccountsToAdd.length > 0 || intermediateAccountsToRemove.length > 0)) {
      return true
    }

    if (modifyEndDate && newEndDate !== contract.endDate) {
      return true
    }

    return false
  }, [
    modifyLeveling,
    modifyDebitCoverage,
    modifySecondaryAccounts,
    modifyIntermediateAccounts,
    modifyEndDate,
    accountsToAdd,
    accountsToRemove,
    intermediateAccountsToAdd,
    intermediateAccountsToRemove,
    newEndDate,
    contract.endDate,
  ])

  // Form validation
  const isFormValid = useMemo(() => {
    const hasSelection =
      modifyLeveling || modifyDebitCoverage || modifySecondaryAccounts || modifyIntermediateAccounts || modifyEndDate
    const hasRequiredFields = subject.trim() && reason.trim()
    const noValidationErrors =
      Object.keys(validateLevelingModes).length === 0 &&
      validateDebitCoverage.length === 0 &&
      validateSecondaryAccounts.length === 0

    return hasSelection && hasRequiredFields && hasChanges && noValidationErrors
  }, [
    modifyLeveling,
    modifyDebitCoverage,
    modifySecondaryAccounts,
    modifyIntermediateAccounts,
    modifyEndDate,
    subject,
    reason,
    hasChanges,
    validateLevelingModes,
    validateDebitCoverage,
    validateSecondaryAccounts,
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) {
      alert("Veuillez remplir tous les champs obligatoires et effectuer au moins une modification.")
      return
    }

    setIsLoading(true)

    try {
      const newPricingConfig: PricingConfig = {
        id: `pricing-${Date.now()}`,
        bankId: "bank-1",
        sourceType: "adria",
        adriaEnabled: true,
        externalEnabled: false,
        rules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const newAmendment: Amendment = {
        id: `amendment-${Date.now()}`,
        conventionId: contract.id,
        conventionReference: contract.contractNumber,
        amendmentNumber: autoReference,
        subject,
        reason,
        effectiveDate: new Date(effectiveDate),
        status: "pending_signature",
        modifyLeveling,
        modifyDebitCoverage,
        modifySecondaryAccounts,
        modifyIntermediateAccounts,
        modifyEndDate,
        modifyPricing: false,
        previousPricingConfig: contract.pricingConfig || newPricingConfig,
        newPricingConfig,
        levelingChanges: modifyLeveling ? levelingModes : undefined,
        debitCoverageChanges: modifyDebitCoverage
          ? {
              oldMode: "full",
              newMode: debitCoverageMode as any,
              newPriorities: debitCoveragePriorities,
            }
          : undefined,
        accountsChanges: modifySecondaryAccounts
          ? {
              accountsToAdd,
              accountsToRemove,
            }
          : undefined,
        intermediateAccountsChanges: modifyIntermediateAccounts
          ? {
              accountsToAdd: intermediateAccountsToAdd,
              accountsToRemove: intermediateAccountsToRemove,
            }
          : undefined,
        endDateChanges: modifyEndDate
          ? {
              oldEndDate: contract.endDate,
              newEndDate: new Date(newEndDate),
            }
          : undefined,
        createdBy: "adria@admin.com",
        createdAt: new Date(),
      }

      addAmendment(newAmendment)

      addAuditLog({
        id: `audit-${Date.now()}`,
        entityType: "amendment",
        entityId: newAmendment.id,
        action: `Avenant ${autoReference} généré et en attente de signature`,
        userEmail: "adria@admin.com",
        details: { subject, modifyLeveling, modifyDebitCoverage, modifySecondaryAccounts, modifyIntermediateAccounts, modifyEndDate },
        createdAt: new Date(),
      })

      router.push(`/conventions/${contract.id}/amendment/${newAmendment.id}/preview`)
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
          Vous modifiez la convention{" "}
          <span className="font-semibold">
            {contract.contractNumber} — {contract.clientName}
          </span>
          . Un avenant officiel sera généré et devra être signé par le client avant prise
          d&apos;effet.
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
            <CardTitle className="text-base">Informations de l&apos;avenant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="font-medium">Référence avenant :</Label>
              <span className="font-mono text-blue-700 text-sm">{autoReference}</span>
            </div>

            <div>
              <Label htmlFor="subject" className="text-sm font-medium">
                Objet de l&apos;avenant <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Modification des paramètres de tarification"
                className="mt-1.5"
                maxLength={120}
              />
            </div>

            <div>
              <Label htmlFor="reason" className="text-sm font-medium">
                Motif de la modification <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Décrivez le contexte et la raison de cette modification"
                className="mt-1.5 min-h-24"
                maxLength={500}
              />
            </div>

            <div>
              <Label htmlFor="effectiveDate" className="text-sm font-medium">
                Date d&apos;effet <span className="text-red-500">*</span>
              </Label>
              <Input
                id="effectiveDate"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-slate-500 mt-1">
                Le contrat original reste valide jusqu&apos;à cette date
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
                id="modify-coverage"
                checked={modifyDebitCoverage}
                onCheckedChange={(checked) => setModifyDebitCoverage(checked as boolean)}
              />
              <Label htmlFor="modify-coverage" className="font-medium cursor-pointer">
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
            <div className="flex items-center gap-3">
              <Checkbox
                id="modify-intermediate-accounts"
                checked={modifyIntermediateAccounts}
                onCheckedChange={(checked) => setModifyIntermediateAccounts(checked as boolean)}
              />
              <Label htmlFor="modify-intermediate-accounts" className="font-medium cursor-pointer">
                Comptes intermédiaires
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="modify-end-date"
                checked={modifyEndDate}
                onCheckedChange={(checked) => setModifyEndDate(checked as boolean)}
              />
              <Label htmlFor="modify-end-date" className="font-medium cursor-pointer">
                Date de fin de la convention
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Amendment Sections */}
        <AmendmentSections
          contract={contract}
          modifyLeveling={modifyLeveling}
          modifyDebitCoverage={modifyDebitCoverage}
          modifySecondaryAccounts={modifySecondaryAccounts}
          modifyIntermediateAccounts={modifyIntermediateAccounts}
          modifyEndDate={modifyEndDate}
          newEndDate={newEndDate}
          onEndDateChange={setNewEndDate}
          levelingModes={levelingModes}
          onLevelingChange={setLevelingModes}
          levelingErrors={levelingErrors}
          debitCoverageMode={debitCoverageMode}
          debitCoveragePriorities={debitCoveragePriorities}
          onDebitCoverageChange={handleDebitCoverageChange}
          accountsToAdd={accountsToAdd}
          accountsToRemove={accountsToRemove}
          onAccountsChange={handleAccountsChange}
          intermediateAccountsToAdd={intermediateAccountsToAdd}
          intermediateAccountsToRemove={intermediateAccountsToRemove}
          onIntermediateAccountsChange={(toAdd, toRemove) => {
            setIntermediateAccountsToAdd(toAdd)
            setIntermediateAccountsToRemove(toRemove)
          }}
        />

        {/* Master Account (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compte centralisateur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                value={contract.masterAccount?.iban || ""}
                readOnly
                className="flex-1 bg-slate-100"
              />
              <span className="text-xs text-slate-500">Non modifiable via avenant</span>
            </div>
          </CardContent>
        </Card>

        {/* Validation Errors */}
        {validateSecondaryAccounts.length > 0 && (
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-700">
              {validateSecondaryAccounts.join(" ")}
            </AlertDescription>
          </Alert>
        )}

        {/* Pending Amendment Alert */}
        {hasPendingAmendment && (
          <Alert className="bg-orange-50 border-orange-200">
            <AlertDescription className="text-orange-700">
              Un avenant est déjà en attente de signature. Vous ne pouvez pas en générer un nouveau
              tant que le précédent n&apos;est pas signé ou rejeté.
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !isFormValid || hasPendingAmendment}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Génération en cours..." : "Générer l'avenant"}
          </Button>
        </div>
      </form>
    </div>
  )
}
