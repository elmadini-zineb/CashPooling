"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { Account } from "@/lib/types"
import { CheckCircle2, Search, CheckCircle, AlertCircle, XCircle } from "lucide-react"

interface SearchQuery {
  id: string
  term: string
  results: Account[]
  executed: boolean
}

interface StepSelectionProps {
  accounts: Account[]
  onComplete: (account: Account) => void
  initialAccount: Account | null
}

export function StepSelection({ accounts, onComplete, initialAccount }: StepSelectionProps) {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(initialAccount)
  const [searchQueries, setSearchQueries] = useState<SearchQuery[]>([
    { id: "search-1", term: "", results: [], executed: false },
  ])

  const executeSearch = (queryId: string) => {
    const query = searchQueries.find((q) => q.id === queryId)
    if (!query || !query.term.trim()) return

    // Search by multiple criteria: clientId, clientName, accountNumber
    const search = query.term.toLowerCase()
    const results = accounts.filter((account) => {
      return (
        account.clientId.toLowerCase().includes(search) ||
        account.clientName.toLowerCase().includes(search) ||
        account.accountNumber.toLowerCase().includes(search)
      )
    })

    setSearchQueries((prev) =>
      prev.map((q) => (q.id === queryId ? { ...q, results, executed: true } : q))
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, queryId: string) => {
    if (e.key === "Enter") {
      executeSearch(queryId)
    }
  }

  const addSearchQuery = () => {
    const newId = `search-${Date.now()}`
    setSearchQueries((prev) => [...prev, { id: newId, term: "", results: [], executed: false }])
  }

  const removeSearchQuery = (queryId: string) => {
    setSearchQueries((prev) => prev.filter((q) => q.id !== queryId))
  }

  const updateSearchTerm = (queryId: string, term: string) => {
    setSearchQueries((prev) => prev.map((q) => (q.id === queryId ? { ...q, term } : q)))
  }

  const handleSelect = (account: Account) => {
    setSelectedAccount(account)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "inactive":
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      case "closed":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-slate-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif"
      case "inactive":
        return "Inactif"
      case "closed":
        return "Clôturé"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-700"
      case "inactive":
        return "text-orange-700"
      case "closed":
        return "text-red-700"
      default:
        return "text-slate-700"
    }
  }

  const handleContinue = () => {
    if (selectedAccount) {
      onComplete(selectedAccount)
    }
  }

  const getRelatedAccounts = () => {
    if (!selectedAccount || !selectedAccount.linkedAccountIds) return []
    return accounts.filter((acc) => selectedAccount.linkedAccountIds?.includes(acc.id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Étape 1: Sélection du compte centralisateur</CardTitle>
        <CardDescription>
          Sélectionnez le compte qui servira de centralisateur pour la souscription Cash Pooling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Queries */}
        <div className="space-y-3">
          {searchQueries.map((query, index) => (
            <div key={query.id} className="space-y-2">
              <div className="flex items-center gap-2 justify-between">
              <label className="text-sm font-medium text-slate-700">
                {index === 0 ? "Rechercher un compte (par référence, intitulé ou numéro)" : `Recherche ${index + 1}`}
                </label>
                {index > 0 && (
                  <Button
                    onClick={() => removeSearchQuery(query.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕ Supprimer
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Ex: CLT12345, Acme Corp, ACC12345..."
                    value={query.term}
                    onChange={(e) => updateSearchTerm(query.id, e.target.value)}
                    className="h-11 pl-10"
                    onKeyDown={(e) => handleKeyDown(e, query.id)}
                  />
                </div>
                <Button
                  onClick={() => executeSearch(query.id)}
                  disabled={!query.term.trim()}
                  className="h-11 px-6 bg-[#E65300] hover:bg-[#cc4a00] text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </Button>
              </div>

              {/* Add search button after first search */}
              {index === 0 && query.executed && (
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={addSearchQuery}
                    variant="outline"
                    size="sm"
                    className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 bg-white"
                  >
                    + Ajouter une recherche
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Results Section - Horizontal Layout (Side by Side) */}
        {searchQueries.some((q) => q.executed) && (
          <div className="overflow-x-auto">
            <div className="flex gap-4" style={{ minWidth: `${searchQueries.filter((q) => q.executed).length * 450}px` }}>
              {searchQueries.map((query) =>
                !query.executed ? null : (
                  <div key={query.id} className="flex-shrink-0 w-[430px]">
                    <div className="bg-slate-50 p-3 rounded-t-lg border border-slate-200 border-b-0">
                      <div className="text-xs font-semibold text-slate-700">
                        Résultats: <span className="text-slate-900">"{query.term}"</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {query.results.length} compte{query.results.length !== 1 ? "s" : ""} trouvé{query.results.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    
                    <div className="border border-slate-200 border-t-0 rounded-b-lg overflow-y-auto max-h-96 bg-white">
                      {query.results.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-slate-500">Aucun résultat</p>
                        </div>
                      ) : (
                        <div className="space-y-0">
                          {query.results.map((account) => {
                            const isSelected = selectedAccount?.id === account.id
                            return (
                              <button
                                key={account.id}
                                onClick={() => handleSelect(account)}
                                className={`w-full px-4 py-3 text-left border-b last:border-b-0 transition-colors text-xs ${
                                  isSelected
                                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                {/* Status badge - top line */}
                                <div className="flex items-center gap-2 mb-2">
                                  {getStatusIcon(account.status)}
                                  <span className={`text-xs font-semibold ${getStatusColor(account.status)}`}>
                                    {getStatusLabel(account.status)}
                                  </span>
                                </div>

                                {/* Client ID */}
                                <div className="font-semibold text-slate-900 mb-1">{account.clientId}</div>

                                {/* Account Number */}
                                <div className="text-slate-600 mb-1 font-mono text-xs">{account.accountNumber}</div>

                                {/* Client Name */}
                                <div className="text-slate-500 truncate mb-2">{account.clientName}</div>

                                {/* Selected indicator */}
                                {isSelected && (
                                  <div className="mt-2 text-blue-600 font-medium flex items-center gap-1">
                                    ✓ Sélectionné
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {searchQueries.every((q) => !q.executed) && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600 font-medium mb-1">Recherchez un compte</p>
            <p className="text-xs text-slate-500">Utilisez le champ ci-dessus pour rechercher par numéro de compte, identifiant ou nom de client</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleContinue} disabled={!selectedAccount} size="lg" className="flex-1">
            Continuer vers la structuration
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
