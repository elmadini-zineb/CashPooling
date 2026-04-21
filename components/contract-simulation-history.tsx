"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { downloadSimulationCSV, downloadSimulationPDF } from "@/lib/simulation-export"
import { clearSimulationHistory, getSimulationHistory } from "@/lib/simulation-history"
import type { CashPoolingContract, SimulationHistoryEntry } from "@/lib/types"

function formatAmount(value: number) {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "MAD", maximumFractionDigits: 0 })
}

interface ContractSimulationHistoryProps {
  contract: CashPoolingContract
}

export function ContractSimulationHistory({ contract }: ContractSimulationHistoryProps) {
  const [historyEntries, setHistoryEntries] = useState<SimulationHistoryEntry[]>([])

  useEffect(() => {
    setHistoryEntries(getSimulationHistory(contract.id))
  }, [contract.id])

  const handleClearHistory = () => {
    clearSimulationHistory(contract.id)
    setHistoryEntries([])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Historique des simulations</CardTitle>
          <CardDescription>
            Historisation et export des simulations réalisées pour le contrat {contract.contractNumber}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-600">
                Les simulations sont conservées localement et peuvent être exportées en CSV ou PDF.
              </p>
            </div>
            <Button variant="outline" onClick={handleClearHistory}>
              Effacer l’historique
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Journal des exécutions</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Date</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Total transféré</TableHead>
                <TableHead>Solde central final</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyEntries.length > 0 ? (
                historyEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.createdAt).toLocaleString("fr-FR")}</TableCell>
                    <TableCell>{entry.mode}</TableCell>
                    <TableCell>{formatAmount(entry.totalTransferred)}</TableCell>
                    <TableCell>{formatAmount(entry.centralFinalBalance)}</TableCell>
                    <TableCell className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => downloadSimulationCSV(entry)}>
                        CSV
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => downloadSimulationPDF(entry)}>
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                    Aucune simulation enregistrée pour ce contrat.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
