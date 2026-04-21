"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type {
  CashPoolingContract,
  PoolingMode,
  Account,
  SimulationMovement,
  SimulationAccountImpact,
  SimulationParameters,
} from "@/lib/types"
import { saveSimulationHistory } from "@/lib/simulation-history"
import { downloadSimulationCSV, downloadSimulationPDF } from "@/lib/simulation-export"

type SimulationStatus = "Success" | "Partial" | "Failed" | "Ignored"

type SimulationSummary = {
  totalTransferred: number
  successCount: number
  partialCount: number
  failedCount: number
  centralInitialBalance: number
  centralFinalBalance: number
}

interface ContractSimulationDialogProps {
  contract: CashPoolingContract | null
  open: boolean
  onOpenChange: (open: boolean) => void
  presetParameters?: SimulationParameters
}

const contractModeLabels: Record<PoolingMode, string> = {
  ZBA: "ZBA - Zero Balance Account",
  TBA: "TBA - Target Balance Account",
  FBA: "FBA - Flexible Balance Account",
}

function formatAmount(value: number) {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "MAD", maximumFractionDigits: 0 })
}

function getCurrentSimulationUser() {
  if (typeof window === "undefined") {
    return "Utilisateur inconnu"
  }

  try {
    const storedUser = window.sessionStorage.getItem("user")
    if (!storedUser) {
      return "Utilisateur inconnu"
    }
    const parsed = JSON.parse(storedUser)
    return parsed.name ?? "Utilisateur inconnu"
  } catch {
    return "Utilisateur inconnu"
  }
}

function getStatusBadgeVariant(status: SimulationStatus | "Ignored") {
  switch (status) {
    case "Success":
      return "secondary"
    case "Partial":
      return "default"
    case "Failed":
      return "destructive"
    case "Ignored":
      return "outline"
    default:
      return "outline"
  }
}

function getImpactBadgeVariant(status: SimulationAccountImpact["status"]) {
  switch (status) {
    case "Covered":
      return "secondary"
    case "Partial":
      return "default"
    case "Not Covered":
      return "destructive"
    case "Ignored":
      return "outline"
    default:
      return "outline"
  }
}

export function ContractSimulationDialog({ contract, open, onOpenChange, presetParameters }: ContractSimulationDialogProps) {
  const contractType = useMemo<PoolingMode>(() => {
    return contract?.poolingConfig?.mode ?? "ZBA"
  }, [contract])

  const [targetBalance, setTargetBalance] = useState<string>("")
  const [minThreshold, setMinThreshold] = useState<string>("")
  const [maxThreshold, setMaxThreshold] = useState<string>("")
  const [result, setResult] = useState<SimulationSummary | null>(null)
  const [movements, setMovements] = useState<SimulationMovement[]>([])
  const [impacts, setImpacts] = useState<SimulationAccountImpact[]>([])
  const [logEntries, setLogEntries] = useState<string[]>([])

  useEffect(() => {
    if (!contract) {
      setTargetBalance("")
      setMinThreshold("")
      setMaxThreshold("")
      setResult(null)
      setMovements([])
      setImpacts([])
      setLogEntries([])
      return
    }

    setResult(null)
    setMovements([])
    setImpacts([])
    setLogEntries([])
    setTargetBalance(contract.poolingConfig?.targetBalance?.toString() ?? "")
    setMinThreshold(contract.poolingConfig?.minBalance?.toString() ?? "")
    setMaxThreshold(contract.poolingConfig?.maxBalance?.toString() ?? "")

    if (contract && presetParameters) {
      setTargetBalance(presetParameters.targetBalance?.toString() ?? "")
      setMinThreshold(presetParameters.minBalance?.toString() ?? "")
      setMaxThreshold(presetParameters.maxBalance?.toString() ?? "")
    }
  }, [contract, presetParameters])

  const secondaryAccounts = useMemo(() => {
    if (!contract) {
      return [] as Account[]
    }

    return contract.secondaryAccounts.map((account, index) => ({
      ...account,
      priority: index + 1,
    }))
  }, [contract])

  const activeAccounts = useMemo(
    () => secondaryAccounts.filter((account) => account.status === "active"),
    [secondaryAccounts],
  )

  const inputErrors = useMemo(() => {
    const errors: string[] = []

    if (contractType === "TBA") {
      if (!targetBalance.trim() || Number(targetBalance) <= 0) {
        errors.push("Le montant cible est requis et doit être supérieur à zéro.")
      }
    }

    if (contractType === "FBA") {
      if (maxThreshold.trim().length === 0 || Number(maxThreshold) <= 0) {
        errors.push("Le seuil maximum est requis et doit être supérieur à zéro.")
      }
      if (minThreshold.trim().length === 0 || Number(minThreshold) < 0) {
        errors.push("Le seuil minimum est requis et doit être supérieur ou égal à zéro.")
      }
      if (Number(maxThreshold) < Number(minThreshold)) {
        errors.push("Le seuil maximum doit être supérieur ou égal au seuil minimum.")
      }
    }

    return errors
  }, [contractType, minThreshold, maxThreshold, targetBalance])

  const canRunSimulation = contract !== null && inputErrors.length === 0

  const handleRunSimulation = () => {
    if (!contract) {
      return
    }

    const log: string[] = []
    const masterBalance = contract.masterAccount?.balance ?? 0
    let currentCentralBalance = masterBalance
    const centralInitialBalance = masterBalance
    const movementRows: SimulationMovement[] = []
    const accountImpactRows: AccountImpact[] = []

    const activeSecondaryAccounts = contract.secondaryAccounts.filter((account) => account.status === "active")
    const ignoredSecondaryAccounts = contract.secondaryAccounts.filter((account) => account.status !== "active")

    log.push("Démarrage de la simulation du contrat")
    log.push(`Solde central initial: ${formatAmount(centralInitialBalance)}`)
    log.push(`${ignoredSecondaryAccounts.length} compte(s) secondaire(s) inactif(s) ignoré(s)`)
    log.push(`Comptes actifs pris en compte: ${activeSecondaryAccounts.length}`)

    const orderedAccounts = activeSecondaryAccounts
      .map((account) => ({ account, priority: account.priority }))
      .sort((a, b) => a.priority - b.priority)

    orderedAccounts.forEach(({ account, priority }, index) => {
      log.push(`Compte ${index + 1} traité: ${account.companyName} (${account.accountNumber.slice(-6)}) - priorité ${priority}`)
    })

    orderedAccounts.forEach(({ account }) => {
      const initialBalance = account.balance
      const accountLabel = `${account.companyName} (${account.accountNumber.slice(-6)})`
      let transferAmount = 0
      let finalBalance = initialBalance
      let operationType: SimulationMovement["operationType"] = contractType
      let status: SimulationStatus = "Success"
      let reason = "Aucune action requise"
      let source = accountLabel
      let destination = "Aucun mouvement"

      const targetBalance = contract.poolingConfig?.targetBalance ?? 0
      const minBalance = contract.poolingConfig?.minBalance ?? 0
      const maxBalance = contract.poolingConfig?.maxBalance ?? 0

      if (contractType === "ZBA") {
        if (initialBalance !== 0) {
          transferAmount = Math.abs(initialBalance)
          finalBalance = 0
          destination = contract.masterAccount?.accountNumber ?? "Compte central"
          source = accountLabel
          operationType = "ZBA"
          reason = initialBalance > 0
            ? `Sweep de ${formatAmount(transferAmount)} vers le compte central pour atteindre zéro`
            : `Couverture de ${formatAmount(transferAmount)} depuis le compte central pour atteindre zéro`

          if (initialBalance < 0) {
            if (currentCentralBalance >= transferAmount) {
              currentCentralBalance -= transferAmount
              status = "Success"
            } else if (currentCentralBalance > 0) {
              transferAmount = currentCentralBalance
              currentCentralBalance = 0
              finalBalance = initialBalance + transferAmount
              status = "Partial"
              reason = `Couverture partielle de ${formatAmount(transferAmount)}: fonds centraux insuffisants`
            } else {
              transferAmount = 0
              finalBalance = initialBalance
              status = "Failed"
              reason = "Couverture impossible: aucun fonds centraux disponibles"
            }
          }

          if (initialBalance > 0) {
            currentCentralBalance += transferAmount
            status = "Success"
          }
        }
      } else if (contractType === "TBA") {
        const required = targetBalance - initialBalance
        operationType = "TBA"

        if (required > 0) {
          destination = accountLabel
          source = contract.masterAccount?.accountNumber ?? "Compte central"
          transferAmount = Math.min(required, currentCentralBalance)
          finalBalance = initialBalance + transferAmount

          if (transferAmount === required) {
            status = "Success"
            currentCentralBalance -= transferAmount
            reason = `Transfert complet de ${formatAmount(transferAmount)} vers la cible TBA`
          } else if (transferAmount > 0) {
            status = "Partial"
            currentCentralBalance = 0
            reason = `Transfert partiel de ${formatAmount(transferAmount)} vers la cible TBA`
          } else {
            status = "Failed"
            reason = "Pas de fonds centraux disponibles pour la cible TBA"
          }
        } else if (required < 0) {
          transferAmount = Math.abs(required)
          destination = contract.masterAccount?.accountNumber ?? "Compte central"
          source = accountLabel
          finalBalance = targetBalance
          currentCentralBalance += transferAmount
          status = "Success"
          reason = `Sweep complet de ${formatAmount(transferAmount)} vers le compte central pour atteindre la cible TBA`
        }
      } else if (contractType === "FBA") {
        if (initialBalance < minBalance) {
          operationType = "Coverage"
          const required = minBalance - initialBalance
          destination = accountLabel
          source = contract.masterAccount?.accountNumber ?? "Compte central"
          transferAmount = Math.min(required, currentCentralBalance)
          finalBalance = initialBalance + transferAmount

          if (transferAmount === required) {
            status = "Success"
            currentCentralBalance -= transferAmount
            reason = `Couverture complète de ${formatAmount(transferAmount)} vers le minimum FBA`
          } else if (transferAmount > 0) {
            status = "Partial"
            currentCentralBalance = 0
            reason = `Couverture partielle de ${formatAmount(transferAmount)} vers le minimum FBA`
          } else {
            status = "Failed"
            reason = "Pas de fonds centraux disponibles pour la couverture FBA"
          }
        } else if (initialBalance > maxBalance) {
          operationType = "FBA"
          transferAmount = initialBalance - maxBalance
          source = accountLabel
          destination = contract.masterAccount?.accountNumber ?? "Compte central"
          finalBalance = maxBalance
          currentCentralBalance += transferAmount
          status = "Success"
          reason = `Sweep de ${formatAmount(transferAmount)} vers le central pour respecter le maximum FBA`
        }
      }

      if (transferAmount > 0) {
        movementRows.push({
          id: `${account.id}-${operationType}-${movementRows.length}`,
          source,
          destination,
          amount: transferAmount,
          operationType,
          status,
          reason,
        })
      }

      const impactStatus: AccountImpact["status"] = account.status !== "active"
        ? "Ignored"
        : status === "Success"
        ? "Covered"
        : status === "Partial"
        ? "Partial"
        : status === "Failed"

      accountImpactRows.push({
        account,
        initialBalance,
        finalBalance,
        netChange: finalBalance - initialBalance,
        status: account.status !== "active" ? "Ignored" : impactStatus,
        reason: account.status !== "active" ? "Compte inactif ignoré" : reason,
      })
    })

    ignoredSecondaryAccounts.forEach((account) => {
      if (!accountImpactRows.find((impact) => impact.account.id === account.id)) {
        accountImpactRows.push({
          account,
          initialBalance: account.balance,
          finalBalance: account.balance,
          netChange: 0,
          status: "Ignored",
          reason: "Compte inactif ignoré",
        })
      }
    })

    const summary: SimulationSummary = {
      totalTransferred: movementRows.reduce((sum, row) => sum + row.amount, 0),
      successCount: movementRows.filter((row) => row.status === "Success").length,
      partialCount: movementRows.filter((row) => row.status === "Partial").length,
      failedCount: movementRows.filter((row) => row.status === "Failed").length,
      centralInitialBalance,
      centralFinalBalance: currentCentralBalance,
    }

    log.push(`Simulation terminée : ${movementRows.length} mouvement(s) calculé(s)`)
    log.push(`Solde central final : ${formatAmount(currentCentralBalance)}`)

    const historyEntryId = `${contract.id}-${Date.now()}`
    const simulationUser = getCurrentSimulationUser()
    const historyParameters: SimulationParameters = {
      mode: contractType,
      targetBalance: contractType === "TBA" ? Number(targetBalance) : undefined,
      minBalance: contractType === "FBA" ? Number(minThreshold) : undefined,
      maxBalance: contractType === "FBA" ? Number(maxThreshold) : undefined,
    }

    saveSimulationHistory(contract.id, {
      id: historyEntryId,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      contractName: contract.clientName,
      user: simulationUser,
      createdAt: new Date().toISOString(),
      parameters: historyParameters,
      centralInitialBalance,
      centralFinalBalance: currentCentralBalance,
      totalTransferred: summary.totalTransferred,
      successCount: summary.successCount,
      partialCount: summary.partialCount,
      failedCount: summary.failedCount,
      movements: movementRows,
      impacts: accountImpactRows,
      logEntries: log,
    })

    setLogEntries(log)
    setMovements(movementRows)
    setImpacts(accountImpactRows)
    setResult(summary)
  }

  const openable = Boolean(contract)

  return (
    <Dialog open={openable && open} onOpenChange={onOpenChange}>
      <DialogContent className="inset-0 m-0 h-screen w-screen max-w-none max-h-none min-w-[720px] rounded-none overflow-y-auto top-0 left-0 translate-x-0 translate-y-0 sm:max-w-none">
        <DialogHeader>
          <DialogTitle>Simuler le contrat {contract?.contractNumber}</DialogTitle>
          <DialogDescription>
            {contract?.clientName} — Type de contrat : {contractType}
          </DialogDescription>
        </DialogHeader>

        {contract ? (
          <div className="space-y-6">
            <div className={contractType === "ZBA" ? "grid gap-4" : "grid gap-4 lg:grid-cols-2"}>
              <Card>
                <CardHeader>
                  <CardTitle>Informations du contrat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-900">Type de contrat</span>
                      <Badge variant="secondary">{contractModeLabels[contractType]}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-900">Compte central</span>
                      <span className="font-mono text-slate-900">{contract.masterAccount?.accountNumber}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-900">Solde central actuel</span>
                      <span className="font-medium text-slate-900">{formatAmount(contract.masterAccount?.balance ?? 0)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-900">Contrat</span>
                      <span className="capitalize">{contract.status}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-900">Comptes secondaires</span>
                      <span>{contract.secondaryAccounts.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {contractType !== "ZBA" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Paramètres de simulation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {contractType === "TBA" && (
                      <div>
                        <Label htmlFor="simulation-target">Target Balance</Label>
                        <Input
                          id="simulation-target"
                          type="number"
                          value={targetBalance}
                          onChange={(event) => setTargetBalance(event.target.value)}
                          placeholder="Entrez le montant cible"
                          className="mt-1"
                          min={0}
                        />
                      </div>
                    )}

                    {contractType === "FBA" && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="simulation-min">Minimum Threshold</Label>
                          <Input
                            id="simulation-min"
                            type="number"
                            value={minThreshold}
                            onChange={(event) => setMinThreshold(event.target.value)}
                            placeholder="Seuil minimum"
                            className="mt-1"
                            min={0}
                          />
                        </div>
                        <div>
                          <Label htmlFor="simulation-max">Maximum Threshold</Label>
                          <Input
                            id="simulation-max"
                            type="number"
                            value={maxThreshold}
                            onChange={(event) => setMaxThreshold(event.target.value)}
                            placeholder="Seuil maximum"
                            className="mt-1"
                            min={0}
                          />
                        </div>
                      </div>
                    )}

                    {inputErrors.length > 0 && (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        <p className="font-semibold">Erreurs de saisie</p>
                        <ul className="mt-2 list-disc pl-5 space-y-1">
                          {inputErrors.map((error) => (
                            <li key={error}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Comptes secondaires</CardTitle>
                <CardDescription>
                  Les comptes inactifs sont grisées et ignorées dans la simulation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Compte</TableHead>
                        <TableHead>Solde</TableHead>
                        <TableHead>Couverture</TableHead>
                        <TableHead>Priorité</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contract.secondaryAccounts.map((account, index) => {
                        const isActive = account.status === "active"
                        return (
                          <TableRow
                            key={account.id}
                            className={isActive ? "" : "bg-slate-100 text-slate-500"}
                          >
                            <TableCell>{account.accountNumber}</TableCell>
                            <TableCell>{formatAmount(account.balance)}</TableCell>
                            <TableCell>
                              <Badge variant={isActive ? "secondary" : "outline"} className="capitalize">
                                {isActive ? "Actif" : "Inactif"}
                              </Badge>
                            </TableCell>
                            <TableCell>{index + 1}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-600">Contrat simulé isolément en lecture seule.</p>
              </div>
              <Button onClick={handleRunSimulation} disabled={!canRunSimulation} className="w-full sm:w-auto">
                Lancer la simulation
              </Button>
            </div>

            {result && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">La simulation est terminée. Exportez le rapport si besoin.</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="gap-2 w-full sm:w-auto">
                      <FileText className="h-4 w-4" />
                      Exporter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onSelect={() => downloadSimulationPDF({
                      id: `${contract.id}-${Date.now()}`,
                      contractId: contract.id,
                      contractNumber: contract.contractNumber,
                      contractName: contract.clientName,
                      user: getCurrentSimulationUser(),
                      createdAt: new Date().toISOString(),
                      parameters: {
                        mode: contractType,
                        targetBalance: contractType === "TBA" ? Number(targetBalance) : undefined,
                        minBalance: contractType === "FBA" ? Number(minThreshold) : undefined,
                        maxBalance: contractType === "FBA" ? Number(maxThreshold) : undefined,
                      },
                      centralInitialBalance: result.centralInitialBalance,
                      centralFinalBalance: result.centralFinalBalance,
                      totalTransferred: result.totalTransferred,
                      successCount: result.successCount,
                      partialCount: result.partialCount,
                      failedCount: result.failedCount,
                      movements,
                      impacts,
                      logEntries,
                    })}>
                      Exporter PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => downloadSimulationCSV({
                      id: `${contract.id}-${Date.now()}`,
                      contractId: contract.id,
                      contractNumber: contract.contractNumber,
                      contractName: contract.clientName,
                      user: getCurrentSimulationUser(),
                      createdAt: new Date().toISOString(),
                      parameters: {
                        mode: contractType,
                        targetBalance: contractType === "TBA" ? Number(targetBalance) : undefined,
                        minBalance: contractType === "FBA" ? Number(minThreshold) : undefined,
                        maxBalance: contractType === "FBA" ? Number(maxThreshold) : undefined,
                      },
                      centralInitialBalance: result.centralInitialBalance,
                      centralFinalBalance: result.centralFinalBalance,
                      totalTransferred: result.totalTransferred,
                      successCount: result.successCount,
                      partialCount: result.partialCount,
                      failedCount: result.failedCount,
                      movements,
                      impacts,
                      logEntries,
                    })}>
                      Exporter CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Résumé</CardTitle>
                    <CardDescription>Vue d'ensemble des opérations simulées.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Total transféré</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">{formatAmount(result.totalTransferred)}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Solde central initial</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">{formatAmount(result.centralInitialBalance)}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Solde central final</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">{formatAmount(result.centralFinalBalance)}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Succès / Partiel / Échoué</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">{result.successCount} / {result.partialCount} / {result.failedCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mouvements simulés</CardTitle>
                    <CardDescription>Historique détaillé des transferts proposés.</CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>Source compte</TableHead>
                          <TableHead>Destination compte</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Explication</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {movements.length > 0 ? (
                          movements.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell>{row.source}</TableCell>
                              <TableCell>{row.destination}</TableCell>
                              <TableCell>{formatAmount(row.amount)}</TableCell>
                              <TableCell className="capitalize">{row.operationType}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(row.status)}>{row.status}</Badge>
                              </TableCell>
                              <TableCell>{row.reason}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-slate-500">
                              Aucun mouvement de transfert n'a été généré.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Impact par compte</CardTitle>
                    <CardDescription>Visualisez l'impact de la simulation sur chaque compte secondaire.</CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>Compte</TableHead>
                          <TableHead>Solde initial</TableHead>
                          <TableHead>Solde final</TableHead>
                          <TableHead>Variation nette</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Commentaire</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {impacts.map((row) => (
                          <TableRow key={row.account.id}>
                            <TableCell>{row.account.companyName}</TableCell>
                            <TableCell>{formatAmount(row.initialBalance)}</TableCell>
                            <TableCell>{formatAmount(row.finalBalance)}</TableCell>
                            <TableCell>{formatAmount(row.netChange)}</TableCell>
                            <TableCell>
                              <Badge variant={getImpactBadgeVariant(row.status)}>{row.status}</Badge>
                            </TableCell>
                            <TableCell>{row.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Journal de la simulation</CardTitle>
                    <CardDescription>Traçage détaillé des étapes d'exécution.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 font-mono text-sm text-slate-700">
                    {logEntries.map((entry, index) => (
                      <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        {entry}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500">Sélectionnez un contrat pour démarrer la simulation.</div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
