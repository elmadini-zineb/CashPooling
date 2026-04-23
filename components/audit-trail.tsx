'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Download, Filter, Calendar, FileDown } from 'lucide-react'
import type { AuditLogEntry } from '@/lib/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { exportAuditToCSV, exportAuditToPDF } from '@/lib/audit-export'
import { getAuditLogsByEntity } from '@/lib/mock-data'

interface AuditTrailProps {
  contractId: string
  contractNumber: string
}

export function AuditTrail({ contractId, contractNumber }: AuditTrailProps) {
  const [auditLogs] = useState<AuditLogEntry[]>(() => {
    return getAuditLogsByEntity('contract', contractId)
  })

  const [filterEventType, setFilterEventType] = useState<string>('all')
  const [filterUser, setFilterUser] = useState<string>('')
  const [filterStartDate, setFilterStartDate] = useState<string>('')
  const [filterEndDate, setFilterEndDate] = useState<string>('')

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (filterEventType !== 'all') {
        const eventTypes = ['création', 'modification', 'activation', 'suspension', 'levée', 'terminée']
        const matchingType = eventTypes.find((type) => filterEventType === type && log.action.toLowerCase().includes(type))
        if (!matchingType) return false
      }

      if (filterUser && !log.userEmail.toLowerCase().includes(filterUser.toLowerCase())) {
        return false
      }

      if (filterStartDate) {
        const start = new Date(filterStartDate)
        if (log.createdAt < start) return false
      }

      if (filterEndDate) {
        const end = new Date(filterEndDate)
        end.setHours(23, 59, 59, 999)
        if (log.createdAt > end) return false
      }

      return true
    })
  }, [auditLogs, filterEventType, filterUser, filterStartDate, filterEndDate])

  const getEventBadgeColor = (action: string): string => {
    if (action.includes('créée')) return 'bg-blue-100 text-blue-800'
    if (action.includes('modifiée')) return 'bg-yellow-100 text-yellow-800'
    if (action.includes('activée') || action.includes('Activation')) return 'bg-green-100 text-green-800'
    if (action.includes('suspendue')) return 'bg-orange-100 text-orange-800'
    if (action.includes('levée')) return 'bg-purple-100 text-purple-800'
    if (action.includes('terminée')) return 'bg-red-100 text-red-800'
    return 'bg-slate-100 text-slate-800'
  }

  const getEventType = (action: string): string => {
    if (action.includes('créée')) return 'Création'
    if (action.includes('modifiée')) return 'Modification'
    if (action.includes('activée')) return 'Activation'
    if (action.includes('suspendue')) return 'Suspension'
    if (action.includes('levée')) return 'Levée de suspension'
    if (action.includes('terminée')) return 'Termination'
    return 'Autre'
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Alert className="border-slate-200 bg-slate-50">
        <AlertCircle className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-700">
          Cette piste d'audit est immuable et enregistre toutes les modifications apportées à cette convention. 
          Toutes les actions sont tracées avec l'utilisateur responsable et la date/heure.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Event Type Filter */}
            <div>
              <label className="text-sm font-medium">Type d'événement</label>
              <Select value={filterEventType} onValueChange={setFilterEventType}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les événements</SelectItem>
                  <SelectItem value="création">Création</SelectItem>
                  <SelectItem value="modification">Modification</SelectItem>
                  <SelectItem value="activation">Activation</SelectItem>
                  <SelectItem value="suspension">Suspension</SelectItem>
                  <SelectItem value="levée">Levée de suspension</SelectItem>
                  <SelectItem value="terminée">Termination</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Filter */}
            <div>
              <label className="text-sm font-medium">Utilisateur</label>
              <Input
                type="email"
                placeholder="Email utilisateur"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Start Date Filter */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                À partir du
              </label>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Jusqu'au
              </label>
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          {/* Results count and export */}
          <div className="flex items-center justify-between">
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
                CSV
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
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique chronologique</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Aucun événement trouvé avec les filtres sélectionnés.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log, index) => (
                <div key={log.id} className="flex gap-4 pb-4 border-b border-slate-200 last:border-b-0">
                  {/* Timeline Dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${getEventBadgeColor(log.action).split(' ')[0]} ring-2 ring-white`} />
                    {index < filteredLogs.length - 1 && <div className="w-0.5 h-12 bg-slate-200 mt-2" />}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 py-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getEventBadgeColor(log.action)}`}>
                            {getEventType(log.action)}
                          </Badge>
                          <p className="font-semibold text-slate-900">{log.action}</p>
                        </div>

                        {log.changesSummary && (
                          <p className="text-sm text-slate-600 mt-1">{log.changesSummary}</p>
                        )}

                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                          <div>
                            <span className="font-medium">Par:</span> {log.userName || log.userEmail}
                          </div>
                          {log.userRole && (
                            <div>
                              <span className="font-medium">Rôle:</span> {log.userRole}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Date:</span> {log.createdAt.toLocaleDateString('fr-FR')} à{' '}
                            {log.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {log.approvedBy && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200 text-xs">
                            <span className="font-medium">Approuvé par:</span> {log.approvedBy}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
