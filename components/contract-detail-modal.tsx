'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { X, Eye, Edit2, Download } from 'lucide-react'
import type { CashPoolingContract } from '@/lib/types'
import { ContractPreview } from './contract-preview'
import { AuditTrailModal } from './audit-trail-modal'
import { getAuditLogsByEntity, getAmendmentsByConvention } from '@/lib/mock-data'

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
  
  // Get amendments for this contract
  const amendments = getAmendmentsByConvention(contract.id)

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
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="fixed top-6 right-6 z-51 h-10 w-10 rounded-md hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Main content */}
          <div className="w-full h-full p-8">
            {/* Header */}
            <div className="pb-6 border-b mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold">{contract.contractNumber}</h1>
                  <p className="text-lg text-slate-500 mt-2">{contract.clientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <Badge className={`${getStatusColor(contract.status)} text-base px-4 py-2`}>
                  {getStatusLabel(contract.status)}
                </Badge>
                <span className="text-base text-slate-600">{contract.currency}</span>
                <span className="text-base text-slate-600">Créé le {new Date(contract.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="details" className="mt-8 w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="details" className="text-base">Détails du contrat</TabsTrigger>
              <TabsTrigger value="amendments" className="text-base">Avenants ({amendments.length})</TabsTrigger>
              <TabsTrigger value="audit" className="text-base">Piste d'audit</TabsTrigger>
              <TabsTrigger value="simulation" className="text-base">Historique simulation</TabsTrigger>
            </TabsList>

            {/* Détails du contrat */}
            <TabsContent value="details" className="mt-6 space-y-6">
              {/* Section 1: Informations générales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Informations générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Client/Groupe</p>
                      <p className="text-lg font-semibold">{contract.clientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Devise</p>
                      <p className="text-lg font-semibold">{contract.currency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Statut</p>
                      <Badge className={`${getStatusColor(contract.status)} text-base px-4 py-2`}>
                        {getStatusLabel(contract.status)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Date de création</p>
                      <p className="text-lg font-semibold">{new Date(contract.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Compte centralisateur</p>
                      <p className="text-lg font-semibold">{contract.masterAccount?.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Comptes secondaires</p>
                      <Badge variant="secondary" className="text-base px-3 py-2">
                        {contract.secondaryAccounts.length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 2: Configuration de tarification */}
              {contract.pricingConfig && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Configuration de tarification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Type de tarification</p>
                        <p className="text-lg font-semibold capitalize">{contract.pricingConfig.pricingCodeType || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Fréquence de facturation</p>
                        <p className="text-lg font-semibold capitalize">{contract.pricingConfig.billingFrequency || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Tarif préférentiel</p>
                        <p className="text-lg font-semibold">
                          {contract.pricingConfig.hasPreferentialRate 
                            ? `${contract.pricingConfig.preferentialRate} DH` 
                            : 'Non applicable'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Frais d'ouverture</p>
                        <p className="text-lg font-semibold">{contract.pricingConfig.openingFees || 0} DH</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Abonnement mensuel</p>
                        <p className="text-lg font-semibold">{contract.pricingConfig.monthlySubscription || 0} DH</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Frais génération de contrat</p>
                        <p className="text-lg font-semibold">{contract.pricingConfig.contractGenerationFees || 0} DH</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 3: Détails complets du contrat */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Détails complets</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContractPreview contract={contract} user={user} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Historique des avenants */}
            <TabsContent value="amendments" className="mt-6">
              <div className="space-y-4">
                {amendments.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-slate-500">
                      Aucun avenant associé à ce contrat
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Historique des avenants</CardTitle>
                      <CardDescription>
                        {amendments.length} document(s) triés du plus récent au plus ancien
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead>Type/Nom</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Motif</TableHead>
                            <TableHead>Responsable</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right w-32">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {amendments
                            .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
                            .map((amendment) => (
                              <TableRow key={amendment.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-semibold text-slate-900">{amendment.amendmentNumber}</p>
                                    <p className="text-xs text-slate-600 mt-1">{amendment.subject}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-sm font-medium">{new Date(amendment.effectiveDate).toLocaleDateString('fr-FR')}</p>
                                    <p className="text-xs text-slate-500">Effectif</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-slate-700">
                                  {amendment.reason}
                                </TableCell>
                                <TableCell className="text-sm text-slate-700">
                                  {amendment.createdBy || 'N/A'}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={
                                    amendment.status === 'signed' ? 'default' :
                                    amendment.status === 'pending_signature' ? 'secondary' :
                                    amendment.status === 'rejected' ? 'destructive' :
                                    'outline'
                                  }>
                                    {amendment.status === 'signed' && 'Signé'}
                                    {amendment.status === 'pending_signature' && 'En attente'}
                                    {amendment.status === 'rejected' && 'Rejeté'}
                                    {amendment.status === 'draft' && 'Brouillon'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {/* Voir détails */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-blue-100"
                                      title="Voir détails"
                                    >
                                      <Eye className="h-4 w-4 text-blue-600" />
                                    </Button>

                                    {/* Modifier */}
                                    {amendment.status === 'draft' && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-orange-100"
                                        title="Modifier"
                                      >
                                        <Edit2 className="h-4 w-4 text-orange-600" />
                                      </Button>
                                    )}

                                    {/* Télécharger */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-green-100"
                                      title="Télécharger"
                                    >
                                      <Download className="h-4 w-4 text-green-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                      <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Conservation légale:</span> Tous les documents sont conservés à titre d'audit et ne peuvent pas être supprimés.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
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
          </div>

          {/* Audit Modal */}
          <AuditTrailModal
            contractId={contract.id}
            contractNumber={contract.contractNumber}
            isOpen={isAuditModalOpen}
            onClose={() => setIsAuditModalOpen(false)}
          />
        </div>
      )}
    </>
  )
}
