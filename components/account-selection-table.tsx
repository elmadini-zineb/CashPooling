"use client"

import React, { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Search } from "lucide-react"
import type { Account } from "@/lib/types"

interface AccountSelectionTableProps {
  results: Account[]
  selectedAccountId: string | null
  onSelectAccount: (account: Account) => void
  searchTerm: string
  resultCount: number
  onSearchHistoryClick: (term: string) => void
}

interface GroupedByClient {
  clientId: string
  clientName: string
  companyName: string
  accounts: Account[]
}

export function AccountSelectionTable({
  results,
  selectedAccountId,
  onSelectAccount,
  searchTerm,
  resultCount,
}: AccountSelectionTableProps) {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())
  const [filterText, setFilterText] = useState("")

  // Group results by clientId
  const groupedResults = useMemo(() => {
    const groups: Record<string, GroupedByClient> = {}

    results.forEach((account) => {
      if (!groups[account.clientId]) {
        groups[account.clientId] = {
          clientId: account.clientId,
          clientName: account.clientName,
          companyName: account.companyName,
          accounts: [],
        }
      }
      groups[account.clientId].accounts.push(account)
    })

    // Apply filter to all fields
    const filtered = Object.values(groups).filter((group) => {
      const lowerFilter = filterText.toLowerCase()
      return (
        group.clientId.toLowerCase().includes(lowerFilter) ||
        group.clientName.toLowerCase().includes(lowerFilter) ||
        group.accounts.some(
          (acc) =>
            acc.accountNumber.toLowerCase().includes(lowerFilter) ||
            acc.companyName.toLowerCase().includes(lowerFilter)
        )
      )
    })

    return filtered.sort((a, b) => a.clientId.localeCompare(b.clientId))
  }, [results, filterText])

  const toggleClient = (clientId: string) => {
    const newExpanded = new Set(expandedClients)
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId)
    } else {
      newExpanded.add(clientId)
    }
    setExpandedClients(newExpanded)
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
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text

    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, idx) =>
      regex.test(part) ? (
        <mark key={idx} className="bg-yellow-300 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-8 h-8 text-slate-400 mx-auto mb-3" />
        {searchTerm ? (
          <>
            <p className="text-slate-700 font-medium">Aucun client trouvé</p>
            <p className="text-slate-500 text-sm mt-1">
              Aucun client ne correspond à la référence "{searchTerm}"
            </p>
          </>
        ) : (
          <>
            <p className="text-slate-700 font-medium">Effectuez une recherche</p>
            <p className="text-slate-500 text-sm mt-1">
              Entrez une référence client pour voir les comptes disponibles
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Comptes disponibles</h3>
          <p className="text-xs text-slate-600 mt-1">
            {resultCount} client{resultCount !== 1 ? "s" : ""} · {results.length} compte{results.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filter input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Filtrer par référence client, intitulé ou numéro de compte..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="pl-9 text-sm"
        />
      </div>

      {/* Grouped results by client */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {groupedResults.map((group) => {
          const isExpanded = expandedClients.has(group.clientId)

          return (
            <Card key={group.clientId} className="overflow-hidden border border-slate-200">
              {/* Client Header */}
              <div
                onClick={() => toggleClient(group.clientId)}
                className="bg-gradient-to-r from-blue-50 to-slate-50 p-4 cursor-pointer hover:from-blue-100 hover:to-slate-100 transition-colors border-b border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {highlightText(group.clientId, searchTerm)}
                      </h4>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {group.accounts.length} compte{group.accounts.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-1">{group.companyName}</p>
                  </div>
                </div>
              </div>

              {/* Accounts list */}
              {isExpanded && (
                <div className="divide-y divide-slate-200 bg-white">
                  {group.accounts.map((account) => {
                    const isSelected = selectedAccountId === account.id

                    return (
                      <div
                        key={account.id}
                        className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm font-semibold text-slate-900">
                              {account.accountNumber}
                            </span>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {account.accountType}
                            </Badge>
                            <Badge className={`text-xs flex-shrink-0 border-0 ${getStatusColor(account.status)}`}>
                              {getStatusLabel(account.status)}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600">
                            {account.companyName}
                          </p>
                          {account.balance !== undefined && (
                            <p className="text-xs text-slate-700 font-medium mt-1">
                              Solde: {account.balance.toLocaleString("fr-FR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{" "}
                              {account.currency}
                            </p>
                          )}
                        </div>

                        {/* Selection button */}
                        <Button
                          onClick={() => onSelectAccount(account)}
                          size="sm"
                          className={`ml-4 flex-shrink-0 ${
                            isSelected
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {isSelected ? "✓ Sélectionné" : "Sélectionner"}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Empty filter results */}
      {groupedResults.length === 0 && results.length > 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm">Aucun résultat ne correspond au filtre</p>
        </div>
      )}
    </div>
  )
}
