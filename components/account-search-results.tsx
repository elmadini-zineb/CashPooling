"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { Account } from "@/lib/types"

interface GroupedResult {
  clientId: string
  clientName: string
  companyName: string
  accounts: Account[]
}

interface AccountSearchResultsProps {
  results: Account[]
  selectedAccountId: string | null
  onSelectAccount: (account: Account) => void
  searchTerm: string
  resultCount: number
}

export function AccountSearchResults({
  results,
  selectedAccountId,
  onSelectAccount,
  searchTerm,
  resultCount,
}: AccountSearchResultsProps) {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())

  // Group results by client
  const groupedResults: GroupedResult[] = React.useMemo(() => {
    const groups: Record<string, GroupedResult> = {}

    results.forEach((account) => {
      const key = account.clientId
      if (!groups[key]) {
        groups[key] = {
          clientId: account.clientId,
          clientName: account.clientName,
          companyName: account.companyName,
          accounts: [],
        }
      }
      groups[key].accounts.push(account)
    })

    // Sort by clientId and return as array
    return Object.values(groups).sort((a, b) => a.clientId.localeCompare(b.clientId))
  }, [results])

  const toggleClientExpanded = (clientId: string) => {
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

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm mb-2">Aucun compte trouvé pour : <span className="font-semibold">"{searchTerm}"</span></p>
        <p className="text-slate-400 text-xs">Essayez une autre recherche en utilisant un numéro de compte, identifiant client ou intitulé client.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-lg">
        <span className="text-slate-700 font-semibold">{resultCount}</span> client{resultCount > 1 ? "s" : ""} trouvé{resultCount > 1 ? "s" : ""} avec <span className="font-semibold text-slate-700">{results.length}</span> compte{results.length > 1 ? "s" : ""}
      </div>

      {/* Grouped Results */}
      <div className="space-y-3">
        {groupedResults.map((group) => {
          const isExpanded = expandedClients.has(group.clientId)

          return (
            <Card
              key={group.clientId}
              className="overflow-hidden border border-slate-200 hover:border-slate-300 transition-all"
            >
              {/* Client Header - Always Visible */}
              <div
                onClick={() => toggleClientExpanded(group.clientId)}
                className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 cursor-pointer hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Expand/Collapse Icon */}
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-600" />
                      )}
                    </div>

                    {/* Client Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-sm">Référence: {group.clientId}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {group.accounts.length} compte{group.accounts.length > 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 truncate">{group.companyName}</p>
                    </div>
                  </div>

                  {/* Account Count Badge on Right */}
                  <div className="flex-shrink-0 ml-2">
                    <Badge className="bg-blue-100 text-blue-800 border-0">
                      {group.accounts.length}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Accounts List - Shown when Expanded */}
              {isExpanded && (
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table className="text-xs">
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead className="h-8 p-3 w-12 text-center">
                            <span className="text-slate-600">Sél.</span>
                          </TableHead>
                          <TableHead className="h-8 p-3 text-slate-700 font-semibold">Numéro de Compte</TableHead>
                          <TableHead className="h-8 p-3 text-slate-700 font-semibold">Type</TableHead>
                          <TableHead className="h-8 p-3 text-slate-700 font-semibold">Solde</TableHead>
                          <TableHead className="h-8 p-3 text-slate-700 font-semibold">Statut</TableHead>
                          <TableHead className="h-8 p-3 text-slate-700 font-semibold">Devise</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.accounts.map((account) => {
                          const isSelected = selectedAccountId === account.id
                          const isActive = account.status === "active"

                          return (
                            <TableRow
                              key={account.id}
                              className={`cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-blue-50 border-l-2 border-l-blue-600"
                                  : isActive
                                    ? "hover:bg-slate-50"
                                    : "opacity-60"
                              }`}
                              onClick={() => isActive && onSelectAccount(account)}
                            >
                              {/* Radio Button */}
                              <TableCell className="p-3 text-center">
                                <div className="flex justify-center">
                                  <input
                                    type="radio"
                                    checked={isSelected}
                                    onChange={() => onSelectAccount(account)}
                                    disabled={!isActive}
                                    className="cursor-pointer"
                                  />
                                </div>
                              </TableCell>

                              {/* Account Number */}
                              <TableCell className="p-3 font-mono text-slate-900">
                                {account.accountNumber}
                              </TableCell>

                              {/* Account Type */}
                              <TableCell className="p-3 text-slate-700">
                                {account.accountType}
                              </TableCell>

                              {/* Balance */}
                              <TableCell className="p-3 text-slate-900 font-medium text-right">
                                {account.balance.toLocaleString("fr-FR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </TableCell>

                              {/* Status */}
                              <TableCell className="p-3">
                                <Badge
                                  className={`text-xs border-0 ${
                                    account.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : account.status === "inactive"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {getStatusLabel(account.status)}
                                </Badge>
                              </TableCell>

                              {/* Currency */}
                              <TableCell className="p-3 text-slate-700 font-medium">
                                {account.currency}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
