'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { CashPoolingContract } from '@/lib/types'
import { ContractPreview } from './contract-preview'
import { AuditTrailModal } from './audit-trail-modal'
import { getAuditLogsByEntity } from '@/lib/mock-data'

interface ContractDetailModalProps {
  contract: CashPoolingContract | null
  isOpen: boolean
  onClose: () => void
  user: any
}

export function ContractDetailModal({ contract, isOpen, onClose, user }: ContractDetailModalProps) {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)

  if (!contract) return null

  // Get audit logs for this contract
  const auditLogs = getAuditLogsByEntity('contract', contract.id)
  const recentLogs = auditLogs.slice(0, 5) // Show last 5 events

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      terminated: 'bg-red-100 text-red-800',
      registered: 'bg-blue-100 text-blue-800',
      draft: 'bg-slate-100 text-slate-800',
    }
    return colors[status] || 'bg-slate-100 text-slate-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Actif',
      suspended: 'Suspendu',
      terminated: 'Résilié',
      registered: 'Enregistré',
      draft: 'Brouillon',
    }
    return labels[status] || status
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">{contract.contractNumber}</DialogTitle>
                <p className="text-sm text-slate-500 mt-1">{contract.clientName}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <Badge className={getStatusColor(contract.status)}>
                {getStatusLabel(contract.status)}
              </Badge>
              <span className="text-sm text-slate-600">{contract.currency}</span>
              <span className="text-sm text-slate-600">Créé le {new Date(contract.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </DialogHeader>

          {/* Tabs for different views */}
          <Tabs defaultValue="details" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Détails du contrat</TabsTrigger>
              <TabsTrigger value="audit">Piste d'audit</TabsTrigger>
              <TabsTrigger value="simulation">Historique simulation</TabsTrigger>
            </TabsList>

            {/* Détails du contrat */}
            <TabsContent value="details" className="mt-6">
              <ContractPreview contract={contract} user={user} />
            </TabsContent>

            {/* Piste d'audit */}
            <TabsContent value="audit" className="mt-6">
              <div className="space-y-4">
                {auditLogs.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-slate-500">
                      Aucun événement d'audit trouvé pour ce contrat
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Événements récents ({auditLogs.length} total)</CardTitle>
                        <CardDescription>Derniers changements effectués sur ce contrat</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {recentLogs.map((log) => (
                          <div key={log.id} className="pb-3 border-b last:border-b-0 last:pb-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-medium text-sm text-slate-900">{log.action}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(log.createdAt).toLocaleDateString('fr-FR')} à {new Date(log.createdAt).toLocaleTimeString('fr-FR')}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">Par: {log.userName || log.userEmail}</p>
                              </div>
                              {log.changesSummary && (
                                <Badge variant="outline" className="text-xs whitespace-nowrap">
                                  {log.changesSummary}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Button
                      variant="outline"
                      onClick={() => setIsAuditModalOpen(true)}
                      className="w-full"
                    >
                      Voir la piste d'audit complète ({auditLogs.length} événements)
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Historique simulation */}
            <TabsContent value="simulation" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historique des simulations</CardTitle>
                  <CardDescription>Historique des simulations effectuées sur ce contrat</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = `/simulation-history?contractId=${contract.id}`}
                    className="w-full"
                  >
                    Voir l'historique complet
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Audit Trail Modal */}
      <AuditTrailModal
        contractId={contract.id}
        contractNumber={contract.contractNumber}
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </>
  )
}
