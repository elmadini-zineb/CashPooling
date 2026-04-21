"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, Play, Activity, ShieldCheck, ListChecks } from "lucide-react"
import { mockAccounts } from "@/lib/mock-data"
import { validateCashPoolingSubscription } from "@/lib/validation"
import type { Account, CoverageMode, PoolingMode } from "@/lib/types"

const simulationModes: PoolingMode[] = ["ZBA", "TBA", "FBA"]
const coverageModes: CoverageMode[] = ["full", "partial", "none"]

const coverageModeLabels: Record<CoverageMode, string> = {
  full: "Couverture totale",
  partial: "Couverture partielle",
  none: "Couverture désactivée",
}

const accountPriorities: Record<string, number> = {
  "acc-5-1": 1,
  "acc-5-2": 2,
}

const transferTargets: Record<PoolingMode, number> = {
  ZBA: 30000,
  TBA: 22000,
  FBA: 18000,
}

type SimulationStatus = "Success" | "Partial" | "Failed" | "Ignored"

type SimulationRow = {
  sourceAccount: Account
  mode: PoolingMode
  initialBalance: number
  requestedAmount: number
  transferAmount: number
  finalBalance: number
  direction: string
  status: SimulationStatus
  reason: string
}

type SimulationSummary = {
  totalTransferred: number
  successCount: number
  partialCount: number
  failedCount: number
  centralFinalBalance: number
}

function getStatusBadgeVariant(status: SimulationStatus) {
  switch (status) {
    case "Success":
      return "secondary"
    case "Partial":
      return "default"
    case "Failed":
      return "destructive"
    default:
      return "outline"
  }
}

function formatAmount(value: number) {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "MAD", maximumFractionDigits: 0 })
}

export default function SimulationPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [selectedCentralAccountId, setSelectedCentralAccountId] = useState<string>("")
  const [coverageMode, setCoverageMode] = useState<CoverageMode>("full")
  const [accountConfigs, setAccountConfigs] = useState<Record<string, {
    mode: PoolingMode
    tbaTarget: string
    fbaMinThreshold: string
    fbaMaxThreshold: string
  }>>({})
  const [runLog, setRunLog] = useState<string[]>([])
  const [summary, setSummary] = useState<SimulationSummary | null>(null)
  const [details, setDetails] = useState<SimulationRow[]>([])
  const [hasRun, setHasRun] = useState(false)

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(storedUser))
  }, [router])

  const centralAccountOptions = useMemo(
    () => mockAccounts.filter((account) => account.status === "active" && !account.parentAccountId),
    [],
  )

  const centralAccount = useMemo(() => {
    return mockAccounts.find((account) => account.id === selectedCentralAccountId) || null
  }, [selectedCentralAccountId])

  const allPreviewAccounts = useMemo(() => {
    if (!centralAccount) {
      return [] as Account[]
    }

    return mockAccounts.filter(
      (account) =>
        account.clientId === centralAccount.clientId &&
        account.id !== centralAccount.id,
    )
  }, [centralAccount])

  useEffect(() => {
    if (!centralAccount) {
      setAccountConfigs({})
      return
    }

    setAccountConfigs((current) => {
      const next: typeof current = {}
      allPreviewAccounts.forEach((account) => {
        next[account.id] = current[account.id] ?? {
          mode: "ZBA",
          tbaTarget: "",
          fbaMinThreshold: "",
          fbaMaxThreshold: "",
        }
      })
      return next
    })
  }, [centralAccount, allPreviewAccounts])

  const activeSecondaryAccounts = useMemo(
    () => allPreviewAccounts.filter((account) => account.status === "active"),
    [allPreviewAccounts],
  )

  const validationErrors = useMemo(() => {
    return validateCashPoolingSubscription(centralAccount, activeSecondaryAccounts)
  }, [centralAccount, activeSecondaryAccounts])

  const structureValid = validationErrors.length === 0

  const isSimulationInputValid = useMemo(() => {
    return activeSecondaryAccounts.every((account) => {
      const config = accountConfigs[account.id]
      if (!config) {
        return false
      }

      if (config.mode === "TBA") {
        return Number(config.tbaTarget) > 0
      }

      if (config.mode === "FBA") {
        const minValue = Number(config.fbaMinThreshold)
        const maxValue = Number(config.fbaMaxThreshold)
        return minValue >= 0 && maxValue > 0 && maxValue >= minValue
      }

      return true
    })
  }, [activeSecondaryAccounts, accountConfigs])

  const canRunSimulation = Boolean(centralAccount) && structureValid && isSimulationInputValid

  const runSimulation = () => {
    if (!centralAccount || !canRunSimulation) {
      return
    }

    const log: string[] = []
    log.push("Démarrage de la simulation Cash Pooling")
    log.push("Vérification de la structure du groupe et des comptes")

    const inactiveAccounts = allPreviewAccounts.filter((account) => account.status !== "active")
    if (inactiveAccounts.length > 0) {
      log.push(`Filtrage des comptes inactifs (${inactiveAccounts.length})`)
    } else {
      log.push("Aucun compte inactif détecté")
    }

    const orderedAccounts = [...activeSecondaryAccounts]
      .map((account) => ({ account, priority: accountPriorities[account.id] ?? 99 }))
      .sort((a, b) => a.priority - b.priority)
      .map((entry) => entry.account)

    log.push("Application des règles de priorité")
    orderedAccounts.forEach((account, index) => {
      log.push(`Compte ${account.clientName} (priorité ${accountPriorities[account.id] ?? index + 1}) prêt à simuler`)
    })

    log.push("Vérification des fonds du compte central")
    const centralReserveThreshold = 25000
    if (centralAccount.balance < centralReserveThreshold) {
      log.push(`Attention : le compte central est inférieur au seuil opérationnel de ${formatAmount(centralReserveThreshold)}`)
    } else {
      log.push(`Solde central suffisant pour les opérations de simulation (${formatAmount(centralAccount.balance)})`)
    }

    const rows: SimulationRow[] = []
    let totalTransferred = 0
    let successCount = 0
    let partialCount = 0
    let failedCount = 0
    let availableCentralBalance = centralAccount.balance

    orderedAccounts.forEach((account) => {
      const config = accountConfigs[account.id] ?? {
        mode: "ZBA",
        tbaTarget: "",
        fbaMinThreshold: "",
        fbaMaxThreshold: "",
      }

      const tbaAmount = Math.max(0, Number(config.tbaTarget))
      const fbaMin = Math.max(0, Number(config.fbaMinThreshold))
      const fbaMax = Math.max(0, Number(config.fbaMaxThreshold))

      const initialBalance = account.balance
      let requestedAmount = 0
      let transferAmount = 0
      let finalBalance = initialBalance
      let direction = "Aucun"
      let status: SimulationStatus = "Success"
      let reason = "Aucun ajustement requis"

      if (config.mode === "ZBA") {
        requestedAmount = initialBalance
        direction = "Vers central"
        finalBalance = 0
        reason = "Solde ramené à zéro pour ZBA"
      } else if (config.mode === "TBA") {
        if (initialBalance < tbaAmount) {
          requestedAmount = tbaAmount - initialBalance
          direction = "Depuis central"
          finalBalance = tbaAmount
          reason = "Approvisionnement à la cible TBA"
        } else if (initialBalance > tbaAmount) {
          requestedAmount = initialBalance - tbaAmount
          direction = "Vers central"
          finalBalance = tbaAmount
          reason = "Récupération de l'excédent vers le central pour TBA"
        } else {
          requestedAmount = 0
          direction = "Aucun"
          finalBalance = initialBalance
          reason = "Déjà à la cible TBA"
        }
      } else if (config.mode === "FBA") {
        if (initialBalance < fbaMin) {
          if (coverageMode === "none") {
            requestedAmount = 0
            direction = "Aucun"
            finalBalance = initialBalance
            reason = "Couverture désactivée — aucun top-up FBA"
          } else {
            requestedAmount = fbaMin - initialBalance
            direction = "Depuis central"
            finalBalance = fbaMin
            reason = "Top-up vers le minimum FBA"
          }
        } else if (initialBalance > fbaMax) {
          requestedAmount = initialBalance - fbaMax
          direction = "Vers central"
          finalBalance = fbaMax
          reason = "Sweep vers le central pour respecter le maximum FBA"
        } else {
          requestedAmount = 0
          direction = "Aucun"
          finalBalance = initialBalance
          reason = "Solde dans la fourchette FBA"
        }
      }

      if (direction === "Depuis central" && requestedAmount > 0) {
        if (availableCentralBalance >= requestedAmount) {
          transferAmount = requestedAmount
          availableCentralBalance -= transferAmount
          status = "Success"
          reason = `Transfert de ${formatAmount(transferAmount)} depuis le central vers le compte`
        } else if (availableCentralBalance > 0) {
          transferAmount = availableCentralBalance
          availableCentralBalance = 0
          finalBalance = initialBalance + transferAmount
          status = "Partial"
          reason = `Transfert partiel de ${formatAmount(transferAmount)}: fonds centraux insuffisants`
        } else {
          transferAmount = 0
          finalBalance = initialBalance
          status = "Failed"
          reason = "Aucun fonds centraux disponibles pour l'opération"
        }
      } else if (direction === "Vers central" && requestedAmount > 0) {
        transferAmount = requestedAmount
        availableCentralBalance += transferAmount
        status = "Success"
        reason = `Transfert de ${formatAmount(transferAmount)} vers le compte central`
      } else {
        transferAmount = 0
        status = "Success"
      }

      if (status === "Success") successCount += 1
      if (status === "Partial") partialCount += 1
      if (status === "Failed") failedCount += 1

      totalTransferred += Math.abs(transferAmount)
      rows.push({
        sourceAccount: account,
        mode: config.mode,
        initialBalance,
        requestedAmount,
        transferAmount,
        finalBalance,
        direction,
        status,
        reason,
      })
    })

    const centralFinalBalance = availableCentralBalance
    log.push("Calcul des montants de transfert et des soldes finaux")
    log.push("Simulation terminée")

    setRunLog(log)
    setDetails(rows)
    setSummary({
      totalTransferred,
      successCount,
      partialCount,
      failedCount,
      centralFinalBalance,
    })
    setHasRun(true)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Simulation</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Cash Pooling Simulation</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Exécutez une simulation isolée des opérations de cash pooling et visualisez les impacts de chaque mode.
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            className="gap-2"
            onClick={runSimulation}
            disabled={!canRunSimulation}
          >
            <Play className="h-4 w-4" />
            Lancer la simulation
          </Button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <section className="space-y-4">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Simulation Control Panel
                </CardTitle>
                <CardDescription>
                  Vérifiez le statut de la structure et contrôlez les paramètres avant d&apos;exécuter.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <Label className="mb-3">Sélection de la structure</Label>
                    <Select value={selectedCentralAccountId} onValueChange={setSelectedCentralAccountId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez une structure" />
                      </SelectTrigger>
                      <SelectContent>
                        {centralAccountOptions.map((option) => (
                          <SelectItem value={option.id} key={option.id}>
                            {option.companyName} — {option.accountNumber.slice(-5)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Compte central</p>
                    {centralAccount ? (
                      <>
                        <p className="mt-3 text-base font-semibold text-slate-900">{centralAccount.clientName}</p>
                        <p className="text-sm text-slate-600">{centralAccount.accountType}</p>
                        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                          <div>
                            <p className="text-slate-500">Solde courant</p>
                            <p className="text-lg font-semibold text-slate-900">{formatAmount(centralAccount.balance)}</p>
                          </div>
                          <Badge variant={centralAccount.status === "active" ? "secondary" : "outline"}>
                            {centralAccount.status.toUpperCase()}
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <p className="mt-3 text-sm text-slate-600">Sélectionnez une structure pour afficher le compte central.</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Structure</p>
                      <Badge variant={structureValid ? "secondary" : "destructive"}>
                        {structureValid ? "Validée" : "Non validée"}
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-700">
                      {validationErrors.length === 0 ? (
                        <p>La structure est prête pour une simulation isolée.</p>
                      ) : (
                        validationErrors.map((error) => (
                          <p key={error.field} className="text-sm text-rose-600">• {error.message}</p>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <Label className="mb-3">Mode de couverture</Label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {coverageModes.map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setCoverageMode(mode)}
                          className={`min-w-0 rounded-2xl border px-4 py-3 text-sm font-semibold break-words whitespace-normal text-left transition ${coverageMode === mode ? "border-slate-900 bg-slate-900 text-white shadow" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
                        >
                          {coverageModeLabels[mode]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <Label className="mb-3">Mode de nivellement</Label>
                    <p className="text-sm text-slate-600">Choisissez un mode pour chaque compte dans la section &quot;Accounts Preview&quot;.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <ListChecks className="h-5 w-5 text-slate-600" />
                  Accounts Preview
                </CardTitle>
                <CardDescription>Affichage en lecture seule des comptes concernés par la simulation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Compte central</p>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div>
                        {centralAccount ? (
                          <>
                            <p className="font-semibold text-slate-900">{centralAccount.companyName}</p>
                            <p className="text-sm text-slate-600">{centralAccount.accountNumber}</p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-600">Sélectionnez une structure pour afficher les informations du compte central.</p>
                        )}
                      </div>
                      <Badge variant="secondary">Central</Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {allPreviewAccounts.map((account) => {
                      const isInactive = account.status !== "active"
                      const config = accountConfigs[account.id] ?? {
                        mode: "ZBA",
                        tbaTarget: "",
                        fbaMinThreshold: "",
                        fbaMaxThreshold: "",
                      }
                      const accountInvalid = config.mode === "TBA"
                        ? Number(config.tbaTarget) <= 0
                        : config.mode === "FBA"
                        ? Number(config.fbaMaxThreshold) <= 0 || Number(config.fbaMinThreshold) < 0 || Number(config.fbaMaxThreshold) < Number(config.fbaMinThreshold)
                        : false

                      return (
                        <div
                          key={account.id}
                          className={`rounded-2xl border px-4 py-4 transition ${isInactive ? "border-slate-200 bg-slate-100 text-slate-400 opacity-70" : "border-slate-200 bg-white"}`}
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">{account.companyName}</p>
                              <p className="text-sm text-slate-600">{account.accountNumber}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-700">{formatAmount(account.balance)}</span>
                              <Badge variant={account.status === "active" ? "secondary" : "outline"}>
                                {account.status === "active" ? "Active" : "Inactive"}
                              </Badge>
                              {account.status === "active" && accountPriorities[account.id] && (
                                <Badge variant="outline">Priorité {accountPriorities[account.id]}</Badge>
                              )}
                            </div>
                          </div>

                          {account.status === "active" ? (
                            <div className="mt-4 grid gap-4">
                              <div>
                                <Label className="mb-3">Mode de nivellement</Label>
                                <RadioGroup
                                  value={config.mode}
                                  onValueChange={(value) =>
                                    setAccountConfigs((current) => ({
                                      ...current,
                                      [account.id]: {
                                        ...current[account.id],
                                        mode: value as PoolingMode,
                                      },
                                    }))
                                  }
                                  className="grid grid-cols-3 gap-2"
                                >
                                  {simulationModes.map((mode) => (
                                    <label
                                      key={`${account.id}-${mode}`}
                                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-300"
                                    >
                                      <RadioGroupItem value={mode} />
                                      {mode}
                                    </label>
                                  ))}
                                </RadioGroup>
                              </div>

                              {config.mode === "TBA" && (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                  <Label className="mb-3">Target Balance Amount</Label>
                                  <Input
                                    value={config.tbaTarget}
                                    onChange={(event) =>
                                      setAccountConfigs((current) => ({
                                        ...current,
                                        [account.id]: {
                                          ...current[account.id],
                                          tbaTarget: event.target.value,
                                        },
                                      }))
                                    }
                                    placeholder="Entrez le montant cible"
                                    type="number"
                                    min="0"
                                  />
                                  {accountInvalid && (
                                    <p className="mt-2 text-xs text-rose-600">Veuillez saisir un montant cible supérieur à zéro.</p>
                                  )}
                                </div>
                              )}

                              {config.mode === "FBA" && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <Label className="mb-3">Minimum Threshold</Label>
                                    <Input
                                      value={config.fbaMinThreshold}
                                      onChange={(event) =>
                                        setAccountConfigs((current) => ({
                                          ...current,
                                          [account.id]: {
                                            ...current[account.id],
                                            fbaMinThreshold: event.target.value,
                                          },
                                        }))
                                      }
                                      placeholder="Montant minimum"
                                      type="number"
                                      min="0"
                                    />
                                  </div>
                                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <Label className="mb-3">Maximum Threshold</Label>
                                    <Input
                                      value={config.fbaMaxThreshold}
                                      onChange={(event) =>
                                        setAccountConfigs((current) => ({
                                          ...current,
                                          [account.id]: {
                                            ...current[account.id],
                                            fbaMaxThreshold: event.target.value,
                                          },
                                        }))
                                      }
                                      placeholder="Montant maximum"
                                      type="number"
                                      min="0"
                                    />
                                  </div>
                                  {accountInvalid && (
                                    <p className="text-xs text-rose-600">Le seuil maximum doit être supérieur ou égal au seuil minimum et supérieur à zéro.</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                              Ce compte est inactif et sera ignoré dans la simulation.
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Activity className="h-5 w-5 text-slate-600" />
                  Résultats de la simulation
                </CardTitle>
                <CardDescription>Les résultats s&apos;affichent après exécution de la simulation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasRun && summary ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Transferts totaux</p>
                        <p className="mt-3 text-2xl font-semibold text-slate-900">{formatAmount(summary.totalTransferred)}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Opérations réussies</p>
                        <p className="mt-3 text-2xl font-semibold text-slate-900">{summary.successCount}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Opérations partielle / échouées</p>
                        <p className="mt-3 text-2xl font-semibold text-slate-900">{summary.partialCount} / {summary.failedCount}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2 lg:col-span-3">
                        <p className="text-sm text-slate-500">Solde final compte central</p>
                        <p className="mt-3 text-2xl font-semibold text-slate-900">{formatAmount(summary.centralFinalBalance)}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-4 flex flex-col gap-2">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Détails des comptes</p>
                        <p className="text-sm text-slate-600">Visualisez le mouvement de fonds, le mode appliqué et le solde final de chaque compte.</p>
                      </div>
                      <div className="overflow-x-auto">
                        <Table className="min-w-full divide-y divide-slate-200">
                          <TableHeader>
                            <TableRow className="bg-slate-50">
                              <TableHead className="px-4 py-3 text-left uppercase tracking-[0.12em] text-slate-500">Source</TableHead>
                              <TableHead className="px-4 py-3 text-left uppercase tracking-[0.12em] text-slate-500">Mode</TableHead>
                              <TableHead className="px-4 py-3 text-right uppercase tracking-[0.12em] text-slate-500">Solde initial</TableHead>
                              <TableHead className="px-4 py-3 text-right uppercase tracking-[0.12em] text-slate-500">Demandé</TableHead>
                              <TableHead className="px-4 py-3 text-right uppercase tracking-[0.12em] text-slate-500">Transféré</TableHead>
                              <TableHead className="px-4 py-3 text-right uppercase tracking-[0.12em] text-slate-500">Solde final</TableHead>
                              <TableHead className="px-4 py-3 text-center uppercase tracking-[0.12em] text-slate-500">Statut</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {details.map((row) => (
                              <TableRow key={row.sourceAccount.id} className="border-b border-slate-200 last:border-b-0">
                                <TableCell className="px-4 py-3">
                                  <div className="text-sm font-medium text-slate-900">{row.sourceAccount.companyName}</div>
                                  <div className="text-xs text-slate-500">{row.sourceAccount.accountNumber}</div>
                                  <div className="mt-1 text-xs text-slate-500">{row.reason}</div>
                                </TableCell>
                                <TableCell className="px-4 py-3 capitalize text-slate-700">{row.mode}</TableCell>
                                <TableCell className="px-4 py-3 text-right text-slate-700">{formatAmount(row.initialBalance)}</TableCell>
                                <TableCell className="px-4 py-3 text-right text-slate-700">{formatAmount(row.requestedAmount)}</TableCell>
                                <TableCell className="px-4 py-3 text-right text-slate-700">
                                  {row.direction === "Depuis central" ? "+" : row.direction === "Vers central" ? "-" : ""}
                                  {formatAmount(Math.abs(row.transferAmount))}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-right text-slate-700">{formatAmount(row.finalBalance)}</TableCell>
                                <TableCell className="px-4 py-3 text-center">
                                  <Badge variant={getStatusBadgeVariant(row.status)}>{row.status}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <TableCaption>
                        Les comptes inactifs sont exclus du calcul principal.
                      </TableCaption>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                    <p className="text-base font-semibold text-slate-900">Aucune simulation exécutée pour le moment</p>
                    <p className="mt-2 text-sm">Cliquez sur « Lancer la simulation » pour afficher les résultats.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Calculator className="h-5 w-5 text-slate-600" />
                  Simulation Log
                </CardTitle>
                <CardDescription>Traçage des étapes de la simulation en lecture seule.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-tight text-slate-700">
                  {runLog.length > 0 ? (
                    runLog.map((line, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-slate-500" />
                        <span>{line}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500">La journalisation de la simulation apparaîtra ici après la première exécution.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}
