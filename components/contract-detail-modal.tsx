'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { X, Eye, Edit2, Download, CheckCircle2, XCircle } from 'lucide-react'
import type { CashPoolingContract, Amendment } from '@/lib/types'
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
  const [selectedAmendment, setSelectedAmendment] = useState<Amendment | null>(null)
  const [isAmendmentDetailOpen, setIsAmendmentDetailOpen] = useState(false)
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
  const [amendmentToSign, setAmendmentToSign] = useState<Amendment | null>(null)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [amendmentToReject, setAmendmentToReject] = useState<Amendment | null>(null)

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
                                      onClick={() => {
                                        setSelectedAmendment(amendment)
                                        setIsAmendmentDetailOpen(true)
                                      }}
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

                                    {/* Marquer comme signé */}
                                    {amendment.status === 'pending_signature' && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-green-100"
                                        title="Marquer comme signé"
                                        onClick={() => {
                                          setAmendmentToSign(amendment)
                                          setIsSignatureModalOpen(true)
                                        }}
                                      >
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                      </Button>
                                    )}

                                    {/* Rejeter l'avenant */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`h-8 w-8 p-0 ${
                                        amendment.status === 'signed' || amendment.status === 'active'
                                          ? 'opacity-50 cursor-not-allowed hover:bg-transparent'
                                          : 'hover:bg-red-100'
                                      }`}
                                      title={
                                        amendment.status === 'signed' || amendment.status === 'active'
                                          ? 'Impossible de rejeter un avenant signé ou actif'
                                          : 'Rejeter l\'avenant'
                                      }
                                      onClick={() => {
                                        if (amendment.status !== 'signed' && amendment.status !== 'active') {
                                          setAmendmentToReject(amendment)
                                          setIsRejectModalOpen(true)
                                        }
                                      }}
                                      disabled={amendment.status === 'signed' || amendment.status === 'active'}
                                    >
                                      <XCircle className={`h-4 w-4 ${amendment.status === 'signed' || amendment.status === 'active' ? 'text-slate-400' : 'text-red-600'}`} />
                                    </Button>

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

          {/* Rejection Confirmation Modal */}
          {amendmentToReject && isRejectModalOpen && (
            <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-md">
                {/* Header */}
                <div className="border-b p-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-red-600">Rejeter l'avenant</h2>
                    <p className="text-slate-600 mt-1 text-sm">Avenant {amendmentToReject.amendmentNumber}</p>
                  </div>
                  <button
                    onClick={() => setIsRejectModalOpen(false)}
                    className="h-8 w-8 rounded hover:bg-slate-100 flex items-center justify-center"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-900">
                      Êtes-vous sûr de vouloir rejeter cet avenant? Cette action est définitive et enregistrée dans la piste d'audit.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Motif du rejet (optionnel)</label>
                      <textarea
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Décrivez les raisons du rejet..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-xs text-amber-900 font-semibold mb-1">Important</p>
                    <p className="text-xs text-amber-800">
                      Cette action modifiera le statut de l'avenant à "Rejeté" et notifiera les parties concernées.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t p-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsRejectModalOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="gap-2 bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      console.log('[v0] Amendment rejected:', amendmentToReject.id)
                      setIsRejectModalOpen(false)
                      setAmendmentToReject(null)
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                    Confirmer le rejet
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Audit Modal */}
          <AuditTrailModal
            contractId={contract.id}
            contractNumber={contract.contractNumber}
            isOpen={isAuditModalOpen}
            onClose={() => setIsAuditModalOpen(false)}
          />

          {/* Signature Confirmation Modal */}
          {amendmentToSign && isSignatureModalOpen && (
            <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-md">
                {/* Header */}
                <div className="border-b p-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Marquer comme signé</h2>
                    <p className="text-slate-600 mt-1 text-sm">Avenant {amendmentToSign.amendmentNumber}</p>
                  </div>
                  <button
                    onClick={() => setIsSignatureModalOpen(false)}
                    className="h-8 w-8 rounded hover:bg-slate-100 flex items-center justify-center"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      Cet avenant sera marqué comme signé. Cette action est définitive et enregistrée dans la piste d'audit.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">Date de signature</p>
                      <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded">
                        {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">Signé par</p>
                      <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded">
                        {user?.name || user?.email || 'Utilisateur courant'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-xs text-amber-900 font-semibold mb-1">Important</p>
                    <p className="text-xs text-amber-800">
                      Vous confirmez que vous êtes autorisé à signer cet avenant et que toutes les informations sont correctes.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t p-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsSignatureModalOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      // In a real app, this would update the amendment status in the database
                      console.log('[v0] Amendment signed:', amendmentToSign.id)
                      setIsSignatureModalOpen(false)
                      setAmendmentToSign(null)
                      // You could refresh the amendments list here
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmer la signature
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Amendment Detail Modal */}
          {selectedAmendment && isAmendmentDetailOpen && (
            <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedAmendment.amendmentNumber}</h2>
                    <p className="text-slate-600 mt-2">{selectedAmendment.subject}</p>
                  </div>
                  <button
                    onClick={() => setIsAmendmentDetailOpen(false)}
                    className="h-8 w-8 rounded hover:bg-slate-100 flex items-center justify-center"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Récapitulatif de l'avenant */}
                  <Card className="bg-gradient-to-r from-blue-50 to-slate-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-xl text-blue-900">Récapitulatif de l'avenant</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-blue-700 font-semibold mb-2">Numéro avenant</p>
                          <p className="text-lg font-bold text-slate-900">{selectedAmendment.amendmentNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 font-semibold mb-2">Convention associée</p>
                          <p className="text-lg font-bold text-slate-900">{selectedAmendment.conventionReference}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 font-semibold mb-2">Motif</p>
                          <p className="text-base text-slate-700">{selectedAmendment.reason}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 font-semibold mb-2">Date effective</p>
                          <p className="text-base text-slate-900 font-semibold">{new Date(selectedAmendment.effectiveDate).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Informations générales */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Informations générales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Numéro avenant</p>
                          <p className="text-lg font-semibold">{selectedAmendment.amendmentNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Convention</p>
                          <p className="text-lg font-semibold">{selectedAmendment.conventionReference}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Date effective</p>
                          <p className="text-lg font-semibold">{new Date(selectedAmendment.effectiveDate).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Statut</p>
                          <Badge variant={
                            selectedAmendment.status === 'signed' ? 'default' :
                            selectedAmendment.status === 'pending_signature' ? 'secondary' :
                            selectedAmendment.status === 'rejected' ? 'destructive' :
                            'outline'
                          }>
                            {selectedAmendment.status === 'signed' && 'Signé'}
                            {selectedAmendment.status === 'pending_signature' && 'En attente'}
                            {selectedAmendment.status === 'rejected' && 'Rejeté'}
                            {selectedAmendment.status === 'draft' && 'Brouillon'}
                            {selectedAmendment.status === 'active' && 'Actif'}
                            {selectedAmendment.status === 'generated' && 'Généré'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Motif et description */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Raison de l'avenant</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700">{selectedAmendment.reason}</p>
                    </CardContent>
                  </Card>

                  {/* Sections modifiées */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Sections modifiées</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedAmendment.modifyPricing && (
                          <Badge variant="outline" className="w-fit">Tarification</Badge>
                        )}
                        {selectedAmendment.modifyLeveling && (
                          <Badge variant="outline" className="w-fit">Nivellement</Badge>
                        )}
                        {selectedAmendment.modifyDebitCoverage && (
                          <Badge variant="outline" className="w-fit">Couverture débitrice</Badge>
                        )}
                        {selectedAmendment.modifySecondaryAccounts && (
                          <Badge variant="outline" className="w-fit">Comptes secondaires</Badge>
                        )}
                        {selectedAmendment.modifyIntermediateAccounts && (
                          <Badge variant="outline" className="w-fit">Comptes intermédiaires</Badge>
                        )}
                        {selectedAmendment.modifyEndDate && (
                          <Badge variant="outline" className="w-fit">Date fin</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Modification de tarification */}
                  {selectedAmendment.modifyPricing && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Modifications tarification</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm text-slate-600 mb-2 font-semibold">Avant</p>
                            <div className="space-y-2 text-sm">
                              <p><span className="text-slate-600">Type:</span> {selectedAmendment.previousPricingConfig?.pricingCodeType || 'N/A'}</p>
                              <p><span className="text-slate-600">Tarif préférentiel:</span> {selectedAmendment.previousPricingConfig?.preferentialRate || '—'}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 mb-2 font-semibold">Après</p>
                            <div className="space-y-2 text-sm">
                              <p><span className="text-slate-600">Type:</span> {selectedAmendment.newPricingConfig?.pricingCodeType || 'N/A'}</p>
                              <p><span className="text-slate-600">Tarif préférentiel:</span> {selectedAmendment.newPricingConfig?.preferentialRate || '—'}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Modifications de nivellement */}
                  {selectedAmendment.modifyLeveling && selectedAmendment.levelingChanges && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Modifications nivellement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(selectedAmendment.levelingChanges).map(([city, changes]: any) => (
                            changes && (
                              <div key={city} className="p-3 bg-slate-50 rounded">
                                <p className="font-semibold text-slate-900 mb-2 capitalize">{city}</p>
                                <div className="text-sm space-y-1">
                                  <p><span className="text-slate-600">Mode ancien:</span> {changes.oldMode}</p>
                                  <p><span className="text-slate-600">Mode nouveau:</span> {changes.newMode}</p>
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-50 border-t p-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsAmendmentDetailOpen(false)}
                  >
                    Fermer
                  </Button>
                  <Button
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger l'avenant
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
