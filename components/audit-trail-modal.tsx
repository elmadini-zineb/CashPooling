'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Download, Filter, RefreshCw, FileDown } from 'lucide-react'
import type { AuditLogEntry } from '@/lib/types'
import { getAuditLogsByEntity } from '@/lib/mock-data'
import { exportAuditToCSV, exportAuditToPDF } from '@/lib/audit-export'

interface AuditTrailModalProps {
  contractId: string
  contractNumber: string
  isOpen: boolean
  onClose: () => void
}

export function AuditTrailModal({ contractId, contractNumber, isOpen, onClose }: AuditTrailModalProps) {
  const [auditLogs] = useState<AuditLogEntry[]>(() => {
    return getAuditLogsByEntity('contract', contractId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  })

  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [eventType, setEventType] = useState('all')

  const filteredLogs = auditLogs.filter((log) => {
    if (dateFrom && new Date(dateFrom) > log.createdAt) return false
    if (dateTo && new Date(dateTo) < log.createdAt) return false
    if (eventType !== 'all') {
      const logType = log.action.toLowerCase()
      if (!logType.includes(eventType.toLowerCase())) return false
    }
    return true
  })

  const getEventTypeColor = (log: AuditLogEntry): string => {
    const action = log.action.toLowerCase()
    if (action.includes('créé')) return 'bg-green-100 text-green-800'
    if (action.includes('modifié') || action.includes('modifiée')) return 'bg-blue-100 text-blue-800'
    if (action.includes('signé') || action.includes('activé')) return 'bg-purple-100 text-purple-800'
    if (action.includes('suspendue') || action.includes('suspension')) return 'bg-orange-100 text-orange-800'
    if (action.includes('rejeté')) return 'bg-red-100 text-red-800'
    if (action.includes('levée')) return 'bg-yellow-100 text-yellow-800'
    return 'bg-slate-100 text-slate-800'
  }

  const getEventTypeLabel = (action: string): string => {
    const lower = action.toLowerCase()
    if (lower.includes('créé')) return 'Création'
    if (lower.includes('modifié') || lower.includes('modifiée')) return 'Modification'
    if (lower.includes('signé') || lower.includes('activé')) return 'Signature'
    if (lower.includes('suspendue')) return 'Suspension'
    if (lower.includes('rejeté')) return 'Rejet'
    if (lower.includes('levée')) return 'Levée'
    return 'Action'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du contrat {contractNumber}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="audit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Détails du contrat</TabsTrigger>
            <TabsTrigger value="audit">Piste d'Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <p className="text-slate-600">Les détails du contrat s'affichent ici.</p>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            {/* Read-only banner */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                La piste d'audit est en lecture seule. Aucune ligne ne peut être modifiée ou supprimée.
              </AlertDescription>
            </Alert>

            {/* Filters */}
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Du</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Au</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Type d'événement</label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les événements</SelectItem>
                    <SelectItem value="creation">Création</SelectItem>
                    <SelectItem value="modification">Modification</SelectItem>
                    <SelectItem value="signature">Signature</SelectItem>
                    <SelectItem value="suspension">Suspension</SelectItem>
                    <SelectItem value="rejet">Rejet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Filter className="h-4 w-4" />
                  Filtrer
                </Button>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Export buttons */}
            <div className="flex gap-2 justify-between items-center">
              <p className="text-sm text-slate-600">
                {filteredLogs.length} événement{filteredLogs.length !== 1 ? 's' : ''} trouvé{filteredLogs.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => exportAuditToCSV(filteredLogs, contractNumber)}
                  disabled={filteredLogs.length === 0}
                >
                  <FileDown className="h-4 w-4" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => exportAuditToPDF(filteredLogs, contractNumber)}
                  disabled={filteredLogs.length === 0}
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>

            {/* Audit logs table */}
            {selectedLog ? (
              // Detail view
              <div className="space-y-4">
                <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                  ← Retour à la liste
                </Button>
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Détails — {getEventTypeLabel(selectedLog.action)}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Date / Heure</p>
                        <p className="text-sm text-slate-900">{selectedLog.createdAt.toLocaleString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Utilisateur</p>
                        <p className="text-sm text-slate-900">{selectedLog.userEmail || selectedLog.userName || 'ANONYMOUS'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Adresse IP</p>
                        <p className="text-sm text-slate-600">0:0:0:0:0:0:0:1</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Statut</p>
                        <Badge className="bg-green-500">Succès</Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-1">Description</p>
                      <p className="text-sm text-slate-900">{selectedLog.action}</p>
                    </div>

                    {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-3">Champs modifiés</p>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <tbody>
                              {Object.entries(selectedLog.details).map(([key, value], idx) => (
                                <tr
                                  key={key}
                                  className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}
                                >
                                  <td className="px-4 py-2 font-medium text-slate-700 w-32">{key}</td>
                                  <td className="px-4 py-2 text-slate-600">{String(value)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              // List view
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Date / Heure</TableHead>
                      <TableHead className="font-semibold">Type d'action</TableHead>
                      <TableHead className="font-semibold">Utilisateur</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <TableRow
                          key={log.id}
                          className="cursor-pointer hover:bg-slate-50"
                          onClick={() => setSelectedLog(log)}
                        >
                          <TableCell className="text-sm">
                            {log.createdAt.toLocaleString('fr-FR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge className={getEventTypeColor(log)}>
                              {getEventTypeLabel(log.action)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {log.userEmail || log.userName || 'ANONYMOUS'}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">{log.action}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                          Aucun événement trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
