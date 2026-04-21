"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAllContracts } from "@/lib/mock-data"
import type { CashPoolingContract } from "@/lib/types"
import { ContractSimulationHistory } from "@/components/contract-simulation-history"

export default function ContractSimulationHistoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [contracts, setContracts] = useState<CashPoolingContract[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setContracts(getAllContracts())
  }, [])

  useEffect(() => {
    const contractId = searchParams.get("contractId")
    if (contractId) {
      setSelectedId(contractId)
    }
  }, [searchParams])

  const selectedContract = useMemo(
    () => contracts.find((contract) => contract.id === selectedId) ?? null,
    [contracts, selectedId],
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Historique des simulations</h1>
            <p className="text-sm text-slate-500">Consultez et exportez les simulations réalisées par contrat.</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/contracts")}>Retour aux contrats</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Choisir un contrat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Recherche par contrat</label>
                <Input
                  placeholder="Entrez l'ID du contrat ou sélectionnez dans la liste"
                  value={selectedId ?? ""}
                  onChange={(event) => setSelectedId(event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Contrats disponibles</label>
                <div className="mt-2 grid gap-2">
                  {contracts.slice(0, 10).map((contract) => (
                    <Button
                      key={contract.id}
                      variant={contract.id === selectedId ? "secondary" : "outline"}
                      onClick={() => setSelectedId(contract.id)}
                    >
                      {contract.contractNumber} - {contract.clientName}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedContract ? (
          <ContractSimulationHistory contract={selectedContract} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Aucun contrat sélectionné</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Sélectionnez un contrat pour afficher son historique de simulation.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
