"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Download, Check, X, Home, AlertCircle, Filter, FileText, File } from "lucide-react"
import { downloadSimulationCSV, downloadSimulationPDF } from "@/lib/simulation-export"
import type { SimulationHistoryEntry } from "@/lib/types"

function formatAmount(value: number) {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "MAD", maximumFractionDigits: 0 })
}

function getSummaryLabel(entry: SimulationHistoryEntry) {
  if (entry.failedCount > 0) {
    return "Failed"
  }
  if (entry.partialCount > 0) {
    return "Partial"
  }
  return "Success"
}

export default function SimulationHistoryPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<SimulationHistoryEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<SimulationHistoryEntry | null>(null)
  const [filterDate, setFilterDate] = useState<string>("")
  const [filterUser, setFilterUser] = useState<string>("all")
  const [filterContract, setFilterContract] = useState<string>("all")

  const searchParams = useSearchParams()

  useEffect(() => {
    const history = getAllSimulationHistory()
    setEntries(history)

    const contractId = searchParams.get("contractId")
    if (contractId) {
      const firstMatch = history.find((entry) => entry.contractId === contractId)
      if (firstMatch) {
        setSelectedEntry(firstMatch)
      }
    }
  }, [searchParams])

  const selectedParameters = useMemo(() => {
    if (!selectedEntry || !selectedEntry.parameters) {
      return "Mode inconnu"
    }

    const params = selectedEntry.parameters
    const parts = [params.mode]
    if (params.targetBalance !== undefined) {
      parts.push(`Target ${params.targetBalance.toLocaleString("fr-FR")} MAD`)
    }
    if (params.minBalance !== undefined) {
      parts.push(`Min ${params.minBalance.toLocaleString("fr-FR")} MAD`)
    }
    if (params.maxBalance !== undefined) {
      parts.push(`Max ${params.maxBalance.toLocaleString("fr-FR")} MAD`)
    }
    return parts.join(" / ")
  }, [selectedEntry])

  const handleReRun = () => {
    if (!selectedEntry || !selectedEntry.parameters) {
      return
    }

    if (typeof window === "undefined") {
      return
    }

    window.sessionStorage.setItem(
      "pendingSimulationReplay",
      JSON.stringify({
        contractId: selectedEntry.contractId,
        parameters: selectedEntry.parameters,
      }),
    )
    router.push("/contracts")
  }

  // Get unique users
  const getUniqueUsers = () => {
    const users = new Set(entries.map((e) => e.user))
    return Array.from(users).sort()
  }

  // Get unique contracts
  const getUniqueContracts = () => {
    const contracts = new Set(entries.map((e) => e.contractNumber))
    return Array.from(contracts).sort()
  }

  // Filter entries
  const getFilteredEntries = () => {
    return entries.filter((entry) => {
      // Date filter
      if (filterDate) {
        const filterDateObj = new Date(filterDate)
        const entryDate = new Date(entry.createdAt)
        if (filterDateObj.toDateString() !== entryDate.toDateString()) {
          return false
        }
      }

      // User filter
      if (filterUser !== "all" && entry.user !== filterUser) {
        return false
      }

      // Contract filter
      if (filterContract !== "all" && entry.contractNumber !== filterContract) {
        return false
      }

      return true
    })
  }

  const filteredEntries = getFilteredEntries()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Simulation History</h1>
            <p className="text-sm text-slate-500">
              Toutes les simulations sont enregistrées en lecture seule, triées par date.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push("/contracts")}>Retour aux contrats</Button>
            <Button variant="secondary" onClick={() => setEntries(getAllSimulationHistory())}>Rafraîchir</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Liste des simulations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-slate-600" />
                <h3 className="font-semibold text-slate-900">Filtres</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date Filter */}
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-2">Date</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* User Filter */}
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-2">Utilisateur</label>
                  <select
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les utilisateurs</option>
                    {getUniqueUsers().map((user) => (
                      <option key={user} value={user}>
                        {user}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contract Filter */}
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-2">Contrat</label>
                  <select
                    value={filterContract}
                    onChange={(e) => setFilterContract(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les contrats</option>
                    {getUniqueContracts().map((contract) => (
                      <option key={contract} value={contract}>
                        {contract}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reset Filters Button */}
              {(filterDate || filterUser !== "all" || filterContract !== "all") && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterDate("")
                      setFilterUser("all")
                      setFilterContract("all")
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </div>

            {/* Results Info */}
            <div className="mb-4">
              <p className="text-sm text-slate-600">
                <span className="font-semibold">{filteredEntries.length}</span> simulation(s) trouvée(s)
                {(filterDate || filterUser !== "all" || filterContract !== "all") && (
                  <span> (sur {entries.length} au total)</span>
                )}
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Date / Heure</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Contrat</TableHead>
                    <TableHead>Résumé</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => (
                      <TableRow
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className="cursor-pointer hover:bg-slate-50 transition"
                      >
                        <TableCell className="font-medium">{new Date(entry.createdAt).toLocaleString("fr-FR")}</TableCell>
                        <TableCell>{entry.user}</TableCell>
                        <TableCell>{entry.contractNumber}</TableCell>
                        <TableCell>
                          <Badge className="capitalize" variant={getSummaryLabel(entry) === "Success" ? "secondary" : getSummaryLabel(entry) === "Partial" ? "default" : "destructive"}>
                            {getSummaryLabel(entry)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <button
                              onClick={(event) => {
                                event.stopPropagation()
                                downloadSimulationPDF(entry)
                              }}
                              className="p-1.5 hover:bg-blue-100 rounded transition"
                              title="Exporter PDF"
                            >
                              <FileText className="h-4 w-4 text-blue-600" />
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation()
                                downloadSimulationCSV(entry)
                              }}
                              className="p-1.5 hover:bg-green-100 rounded transition"
                              title="Exporter CSV"
                            >
                              <File className="h-4 w-4 text-green-600" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        Aucune simulation historique disponible.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {selectedEntry ? (
          <Card>
            <CardHeader>
              <CardTitle>Détails de la simulation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Simulation ID</p>
                  <p className="mt-1 font-semibold text-slate-900">{selectedEntry.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="mt-1 font-semibold text-slate-900">{new Date(selectedEntry.createdAt).toLocaleString("fr-FR")}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Utilisateur</p>
                  <p className="mt-1 font-semibold text-slate-900">{selectedEntry.user}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Contrat</p>
                  <p className="mt-1 font-semibold text-slate-900">{`${selectedEntry.contractNumber} / ${selectedEntry.contractName}`}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-slate-500">Mode</p>
                  <p className="mt-1 font-semibold text-slate-900">{selectedEntry.parameters?.mode ?? "Mode inconnu"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Cible</p>
                  <p className="mt-1 font-semibold text-slate-900">{selectedEntry.parameters?.targetBalance ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Seuil min / max</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedEntry.parameters?.minBalance ?? "-"} / {selectedEntry.parameters?.maxBalance ?? "-"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Résumé</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    Total transféré {formatAmount(selectedEntry.totalTransferred)} — Succès {selectedEntry.successCount} / Partiel {selectedEntry.partialCount} / Échoué {selectedEntry.failedCount}
                  </p>
                </div>
                <Button variant="secondary" onClick={handleReRun}>
                  Re-run Simulation
                </Button>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                <p className="font-semibold">Paramètres complets</p>
                <p className="mt-2">{selectedParameters}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  )
}
