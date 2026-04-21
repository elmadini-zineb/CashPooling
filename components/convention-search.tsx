"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAllContracts, getAmendmentsByConvention } from "@/lib/mock-data"
import { Eye, FileText, AlertCircle } from "lucide-react"
import Link from "next/link"
import type { CashPoolingContract } from "@/lib/types"

export function ConventionSearch() {
  // Champs de recherche multi-critères
  const [clientName, setClientName] = useState("")
  const [contractRef, setContractRef] = useState("")
  const [iban, setIban] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

  const allContracts = getAllContracts()

  const filteredContracts = useMemo(() => {
    return allContracts.filter((contract) => {
      // Critères individuels
      const matchesClient = !clientName || contract.clientName.toLowerCase().includes(clientName.toLowerCase())
      const matchesRef = !contractRef || contract.contractNumber.toLowerCase().includes(contractRef.toLowerCase())
      const matchesIban = !iban || (contract.masterAccount?.iban || "").toLowerCase().includes(iban.toLowerCase())
      const matchesStatus = statusFilter === "all" || contract.status === statusFilter
      const contractDate = new Date(contract.createdAt)
      const matchesDateFrom = !dateFrom || contractDate >= new Date(dateFrom)
      const matchesDateTo = !dateTo || contractDate <= new Date(dateTo)
      return matchesClient && matchesRef && matchesIban && matchesStatus && matchesDateFrom && matchesDateTo
    })
  }, [clientName, contractRef, iban, statusFilter, dateFrom, dateTo, allContracts])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      active: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Actif",
      },
      suspended: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        label: "Suspendu",
      },
      terminated: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Clôturé",
      },
      registered: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Enregistré",
      },
    }
    const config = statusConfig[status] || statusConfig.registered
    return (
      <Badge className={`${config.bg} ${config.text} border-0`}>
        {config.label}
      </Badge>
    )
  }

  const getPricingTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      fixed: "Fixe",
      variable: "Variable",
      hybrid: "Hybride",
    }
    return typeLabels[type] || type
  }

  const hasActivePendingAmendment = (contract: CashPoolingContract) => {
    const amendments = getAmendmentsByConvention(contract.id)
    return amendments.some((a) => a.status === "pending_signature")
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher des Conventions</CardTitle>
          <CardDescription>Filtrez par référence, client, statut ou date</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Filtres multi-critères */}
          <div className="grid md:grid-cols-5 gap-4">
            {/* Nom du client */}
            <div className="space-y-2">
              <Label htmlFor="clientName" className="font-medium">Nom du client</Label>
              <Input id="clientName" type="text" placeholder="Ex: Maroc Telecom" value={clientName} onChange={e => setClientName(e.target.value)} />
            </div>
            {/* Référence convention */}
            <div className="space-y-2">
              <Label htmlFor="contractRef" className="font-medium">Référence convention</Label>
              <Input id="contractRef" type="text" placeholder="Ex: CP-2026-001" value={contractRef} onChange={e => setContractRef(e.target.value)} />
            </div>
            {/* IBAN centralisateur */}
            <div className="space-y-2">
              <Label htmlFor="iban" className="font-medium">IBAN centralisateur</Label>
              <Input id="iban" type="text" placeholder="Ex: MA640001100090000000013000" value={iban} onChange={e => setIban(e.target.value)} />
            </div>
            {/* Statut */}
            <div className="space-y-2">
              <Label htmlFor="status" className="font-medium">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                  <SelectItem value="terminated">Clôturé</SelectItem>
                  <SelectItem value="registered">Enregistré</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Période (date range) */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="font-medium">Période</Label>
              <div className="flex gap-2">
                <Input id="dateFrom" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-1/2" />
                <Input id="dateTo" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-1/2" />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="pt-2 text-sm text-slate-600">
            {filteredContracts.length} convention{filteredContracts.length !== 1 ? "s" : ""} trouvée{filteredContracts.length !== 1 ? "s" : ""}
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredContracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
              <p className="text-slate-600 font-medium">Aucune convention ne correspond à vos critères</p>
              <p className="text-slate-500 text-sm mt-1">Essayez de modifier vos filtres de recherche</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Compte Centralisateur</TableHead>
                    <TableHead>Comptes Secondaires</TableHead>
                    <TableHead>Tarification</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => {
                    const hasPendingAmendment = hasActivePendingAmendment(contract)
                    const canGenerateAmendment = contract.status === "active" && !hasPendingAmendment

                    return (
                      <TableRow key={contract.id}>
                        <TableCell className="font-semibold text-slate-900">
                          {contract.contractNumber}
                        </TableCell>
                        <TableCell>{contract.clientName}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {contract.masterAccount?.iban.substring(0, 20)}...
                        </TableCell>
                        <TableCell className="text-center">{contract.secondaryAccounts.length}</TableCell>
                        <TableCell>{getPricingTypeLabel(contract.pricingConfig?.type || "N/A")}</TableCell>
                        <TableCell>{getStatusBadge(contract.status)}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {formatDate(contract.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={`/conventions/${contract.id}`}>
                              <Button variant="outline" size="sm" className="gap-2">
                                <Eye className="w-4 h-4" />
                                Consulter
                              </Button>
                            </Link>
                            {/* Actions contextuelles selon statut et avenant en cours */}
                            {contract.status === "active" && hasPendingAmendment && (
                              <Badge className="bg-blue-100 text-blue-800 border-0 h-9 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Avenant en cours
                              </Badge>
                            )}
                            {contract.status === "active" && !hasPendingAmendment && (
                              <Link href={`/conventions/${contract.id}/amendment`}>
                                <Button variant="default" size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                                  <FileText className="w-4 h-4" />
                                  Générer un avenant
                                </Button>
                              </Link>
                            )}
                            {/* SUSPENDUE ou CLÔTURÉE : uniquement consulter */}
                            {/* (déjà géré par absence du bouton "Générer un avenant") */}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
