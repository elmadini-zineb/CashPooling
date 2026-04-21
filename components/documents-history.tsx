"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { CashPoolingContract, Amendment, AuditLogEntry } from "@/lib/types"
import { getAmendmentsByConvention, getAuditLogsByEntity } from "@/lib/mock-data"
import { ChevronLeft, FileText, Download, Eye, Calendar, Archive } from "lucide-react"
import { useRouter } from "next/navigation"

interface DocumentsHistoryProps {
  contract: CashPoolingContract
}

export function DocumentsHistory({ contract }: DocumentsHistoryProps) {
  const router = useRouter()
  const amendments = getAmendmentsByConvention(contract.id)
  const auditLogs = getAuditLogsByEntity("convention", contract.id)

  const getAmendmentStatusColor = (status: string): string => {
    switch (status) {
      case "pending_signature":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "signed":
        return "bg-emerald-100 text-emerald-800 border-emerald-300"
      case "active":
        return "bg-green-100 text-green-800 border-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300"
      case "archived":
        return "bg-slate-100 text-slate-800 border-slate-300"
      default:
        return "bg-slate-100 text-slate-800 border-slate-300"
    }
  }

  const getAmendmentStatusLabel = (status: string): string => {
    switch (status) {
      case "pending_signature":
        return "En attente de signature"
      case "signed":
        return "Signé"
      case "active":
        return "Actif"
      case "rejected":
        return "Rejeté"
      case "archived":
        return "Archivé"
      default:
        return status
    }
  }

  // Separate amendments by status
  const activeAmendments = amendments.filter(
    (a) => a.status === "active" || a.status === "signed" || a.status === "pending_signature"
  )
  const rejectedAmendments = amendments.filter((a) => a.status === "rejected")
  const archivedAmendments = amendments.filter((a) => a.status === "archived")

  // Sort each group by creation date (newest first)
  const sortedActiveAmendments = activeAmendments.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
  const sortedRejectedAmendments = rejectedAmendments.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
  const sortedArchivedAmendments = archivedAmendments.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  const handleDownload = (documentName: string) => {
    console.log("[v0] Downloading document:", documentName)
    // Mock download functionality
    alert(`Téléchargement de ${documentName} en cours...`)
  }

  const handleView = (documentName: string) => {
    console.log("[v0] Viewing document:", documentName)
    // Mock view functionality
    alert(`Visualisation de ${documentName}...`)
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/conventions/${contract.id}`)}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour à la convention
        </Button>
      </div>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documents de la convention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Contract - Always first */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3 flex-1">
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{contract.contractNumber}.pdf</p>
                <p className="text-xs text-slate-600">Convention de Cash Pooling</p>
                <p className="text-xs text-slate-500 mt-1">
                  Créé le {contract.createdAt.toLocaleDateString("fr-FR")} par {contract.createdBy}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 border border-green-300 text-xs">
                Actif
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleView(contract.contractNumber)}
                className="gap-2"
                title="Visualiser le document"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(contract.contractNumber)}
                className="gap-2"
                title="Télécharger le document"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active/Pending Amendments */}
          {sortedActiveAmendments.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <p className="text-sm font-semibold text-slate-900 mb-3">Avenants actifs et en cours</p>
              <div className="space-y-2">
                {sortedActiveAmendments.map((amendment) => (
                  <div
                    key={amendment.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {amendment.amendmentNumber}.pdf
                        </p>
                        <p className="text-xs text-slate-600 truncate">{amendment.subject}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Créé le {amendment.createdAt.toLocaleDateString("fr-FR")} par{" "}
                          {amendment.createdBy}
                          {amendment.signedAt &&
                            ` • Signé le ${amendment.signedAt.toLocaleDateString("fr-FR")}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge
                        className={`border text-xs ${getAmendmentStatusColor(
                          amendment.status
                        )}`}
                      >
                        {getAmendmentStatusLabel(amendment.status)}
                      </Badge>
                      {amendment.pdfUrl && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(amendment.amendmentNumber)}
                            title="Visualiser le document"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(amendment.amendmentNumber)}
                            title="Télécharger le document"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Amendments */}
          {sortedRejectedAmendments.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-red-600">●</span> Avenants rejetés
              </p>
              <div className="space-y-2 bg-red-50 p-3 rounded-lg border border-red-100">
                {sortedRejectedAmendments.map((amendment) => (
                  <div
                    key={amendment.id}
                    className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-white hover:bg-slate-50 transition-colors opacity-75"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate line-through">
                          {amendment.amendmentNumber}.pdf
                        </p>
                        <p className="text-xs text-slate-600 truncate">{amendment.subject}</p>
                        <p className="text-xs text-red-600 mt-1">
                          Motif: {amendment.rejectionReason || "Non spécifié"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Rejeté le {amendment.createdAt.toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <Badge className="border bg-red-100 text-red-800 border-red-300 text-xs">
                      Rejeté
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Archived Amendments */}
          {sortedArchivedAmendments.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Archive className="h-4 w-4 text-slate-600" /> Documents archivés
              </p>
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {sortedArchivedAmendments.map((amendment) => (
                  <div
                    key={amendment.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors opacity-60"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-700 truncate">
                          {amendment.amendmentNumber}.pdf
                        </p>
                        <p className="text-xs text-slate-600 truncate">{amendment.subject}</p>
                        <p className="text-xs text-slate-500">
                          Archivé le {amendment.createdAt.toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <Badge className="border bg-slate-100 text-slate-800 border-slate-300 text-xs">
                      Archivé
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {amendments.length === 0 && (
            <div className="text-center py-6">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Aucun avenant pour cette convention</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique des actions (Audit Trail)</CardTitle>
        </CardHeader>
        <CardContent>
          {auditLogs.length > 0 ? (
            <div className="space-y-4">
              {auditLogs
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((log, index) => (
                  <div key={log.id} className="relative pb-4">
                    {index !== auditLogs.length - 1 && (
                      <div className="absolute left-4 top-8 h-12 w-0.5 bg-slate-200" />
                    )}

                    <div className="flex gap-4">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 ring-4 ring-white border border-blue-200">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>

                      <div className="flex-1 pt-1">
                        <p className="font-semibold text-slate-900">{log.action}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          {log.createdAt.toLocaleDateString("fr-FR")} à{" "}
                          {log.createdAt.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-slate-500">Responsable: {log.userEmail}</p>

                        {Object.keys(log.details).length > 0 && (
                          <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                            {Object.entries(log.details).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span>{" "}
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : String(value)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600">Aucune action enregistrée</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
