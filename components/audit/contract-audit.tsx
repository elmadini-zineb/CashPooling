"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Download, Eye, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuditEntry {
  id: string
  contractNumber: string
  dateTime: string
  status: "Succès" | "Échec"
  actionType: "CBS_TARIF_SEND" | "Activation" | "Création" | "Modification" | "Suspension" | "Résiliation"
  modifier: string
  description: string
}

export function ContractAuditPage() {
  const [filterContractNumber, setFilterContractNumber] = useState("")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")
  const [filterEventType, setFilterEventType] = useState("all")
  const [filterUser, setFilterUser] = useState("")

  const auditEntries: AuditEntry[] = [
    {
      id: "1",
      contractNumber: "AD-2026-0087",
      dateTime: "29/04/2026 14:12:48",
      status: "Succès",
      actionType: "CBS_TARIF_SEND",
      modifier: "valideur valideur",
      description: "Envoi tarif CBS réussi du contrat AD-2026-0087",
    },
    {
      id: "2",
      contractNumber: "AD-2026-0087",
      dateTime: "29/04/2026 14:12:48",
      status: "Succès",
      actionType: "Activation",
      modifier: "valideur valideur",
      description: "Activation du contrat AD-2026-0087",
    },
    {
      id: "3",
      contractNumber: "AD-2026-0087",
      dateTime: "29/04/2026 14:11:48",
      status: "Succès",
      actionType: "Création",
      modifier: "charge affaires",
      description: "Création du contrat AD-2026-0087",
    },
  ]

  const getActionTypeBadgeVariant = (actionType: string) => {
    switch (actionType) {
      case "Création":
      case "Activation":
        return "secondary"
      case "CBS_TARIF_SEND":
        return "outline"
      default:
        return "default"
    }
  }

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case "Création":
        return "text-green-600 bg-green-50 border-green-200"
      case "Activation":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "CBS_TARIF_SEND":
        return "text-slate-600 bg-slate-50 border-slate-200"
      default:
        return "text-slate-600 bg-slate-50 border-slate-200"
    }
  }

  const handleReset = () => {
    setFilterContractNumber("")
    setFilterDateFrom("")
    setFilterDateTo("")
    setFilterEventType("all")
    setFilterUser("")
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Piste d'audit — Contrats</h1>
            <p className="text-sm text-slate-600 mt-1">Historique complet de toutes les opérations sur les contrats Cash Pooling</p>
          </div>
        </div>
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-900">
            La piste d'audit est en lecture seule. Aucune ligne ne peut être modifiée ou supprimée.
          </AlertDescription>
        </Alert>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4">
              {/* Contract Number */}
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-2">N° Contrat</label>
                <input
                  type="text"
                  placeholder="AD-2026-..."
                  value={filterContractNumber}
                  onChange={(e) => setFilterContractNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Date From */}
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-2">Du</label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-2">Au</label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-2">Type d'événement</label>
                <select
                  value={filterEventType}
                  onChange={(e) => setFilterEventType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">Tous les événements</option>
                  <option value="Création">Création</option>
                  <option value="Activation">Activation</option>
                  <option value="Modification">Modification</option>
                  <option value="Suspension">Suspension</option>
                  <option value="Résiliation">Résiliation</option>
                  <option value="CBS_TARIF_SEND">CBS_TARIF_SEND</option>
                </select>
              </div>

              {/* User */}
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-2">Utilisateur</label>
                <input
                  type="text"
                  placeholder="ID ou nom..."
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-start pt-2">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
                Filtrer
              </Button>
              <Button variant="outline" size="icon" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export and Table */}
      <div className="space-y-4">
        {/* Export Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50">
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>

        {/* Data Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">N° Contrat</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date / Heure</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type d'action</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Modificateur</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Détails</th>
              </tr>
            </thead>
            <tbody>
              {auditEntries.map((entry, index) => (
                <tr key={entry.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm">
                    <a href="#" className="text-blue-600 hover:underline font-medium">
                      {entry.contractNumber}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{entry.dateTime}</td>
                  <td className="px-6 py-4 text-sm">
                    <Badge className="bg-green-100 text-green-700 border-0 font-medium">
                      {entry.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge 
                      variant="outline" 
                      className={cn(getActionTypeColor(entry.actionType), "border")}
                    >
                      {entry.actionType}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{entry.modifier}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{entry.description}</td>
                  <td className="px-6 py-4 text-sm">
                    <button className="p-2 hover:bg-blue-100 rounded transition">
                      <Eye className="h-4 w-4 text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
