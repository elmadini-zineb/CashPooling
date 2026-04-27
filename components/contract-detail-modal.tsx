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
                                  {new Date(log.createdAt).toLocaleDateString('fr-FR')} ���� {new Date(log.createdAt).toLocaleTimeString('fr-FR')}
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
              <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-auto shadow-2xl">
                {/* HEADER - Design amélioré */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-700 text-white p-8 shadow-lg">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h1 className="text-3xl font-bold">AVENANT À LA CONVENTION DE TRÉSORERIE</h1>
                      <p className="text-blue-100 text-sm mt-2">Document officiel – Non modifiable</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-white bg-opacity-20 backdrop-blur px-4 py-2 rounded-lg">
                        <p className="text-blue-100 text-xs font-medium">Numéro</p>
                        <p className="text-white font-mono font-bold text-lg">{selectedAmendment.amendmentNumber}</p>
                      </div>
                      <button
                        onClick={() => setIsAmendmentDetailOpen(false)}
                        className="h-10 w-10 rounded-full hover:bg-white hover:bg-opacity-20 flex items-center justify-center transition"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  {/* Informations générales en header */}
                  <div className="grid grid-cols-3 gap-6 text-sm pt-4 border-t border-blue-300 border-opacity-50">
                    <div>
                      <p className="text-blue-200">Référence convention</p>
                      <p className="font-mono font-semibold text-white text-lg">{selectedAmendment.conventionReference}</p>
                    </div>
                    <div>
                      <p className="text-blue-200">Client</p>
                      <p className="font-semibold text-white">{selectedAmendment.clientName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-blue-200">Date d'effet</p>
                      <p className="font-semibold text-white">{new Date(selectedAmendment.effectiveDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-8 space-y-8 bg-gradient-to-b from-slate-50 to-white">
                  {/* Section "Objet et Motif" */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-1 h-8 bg-blue-600 rounded"></div>
                      OBJET ET MOTIF
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-6">
                      {/* Objet */}
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-2">Objet</label>
                        <div className="p-4 bg-white border-2 border-blue-200 rounded-lg text-slate-700 min-h-24 shadow-sm">
                          {selectedAmendment.subject || selectedAmendment.reason || 'Non spécifié'}
                        </div>
                      </div>

                      {/* Motif */}
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-2">Motif</label>
                        <div className="p-4 bg-white border-2 border-blue-200 rounded-lg text-slate-700 min-h-24 shadow-sm">
                          {selectedAmendment.reason || 'Non spécifié'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section "Modifications Apportées" */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-1 h-8 bg-orange-600 rounded"></div>
                      MODIFICATIONS APPORTÉES
                    </h2>

                    {/* Tableau des modifications */}
                    <div className="overflow-x-auto border-2 border-slate-200 rounded-lg shadow-sm">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-300">
                            <th className="border-r border-slate-300 p-4 text-left font-bold text-slate-900">Section</th>
                            <th className="border-r border-slate-300 p-4 text-left font-bold text-slate-900">Champ</th>
                            <th className="border-r border-slate-300 p-4 text-left font-bold text-red-700">Valeur Actuelle</th>
                            <th className="p-4 text-left font-bold text-green-700">Nouvelle Valeur</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Modifications de tarification */}
                          {selectedAmendment.modifyPricing && selectedAmendment.previousPricingConfig && selectedAmendment.newPricingConfig && (
                            <>
                              <tr className="border-b border-slate-200 hover:bg-blue-50 transition">
                                <td className="border-r border-slate-300 p-4 font-semibold text-slate-900">Tarification</td>
                                <td className="border-r border-slate-300 p-4 text-slate-700">Type de tarification</td>
                                <td className="border-r border-slate-300 p-4">
                                  <span className="line-through text-red-600 font-medium">
                                    {selectedAmendment.previousPricingConfig?.pricingCodeType || '—'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded">
                                    {selectedAmendment.newPricingConfig?.pricingCodeType || '—'}
                                  </span>
                                </td>
                              </tr>
                              {selectedAmendment.previousPricingConfig?.monthlySubscription !== selectedAmendment.newPricingConfig?.monthlySubscription && (
                                <tr className="border-b border-slate-200 hover:bg-blue-50 transition">
                                  <td className="border-r border-slate-300 p-4 font-semibold text-slate-900">Tarification</td>
                                  <td className="border-r border-slate-300 p-4 text-slate-700">Abonnement mensuel</td>
                                  <td className="border-r border-slate-300 p-4">
                                    <span className="line-through text-red-600 font-medium">
                                      {selectedAmendment.previousPricingConfig?.monthlySubscription?.toLocaleString('fr-FR') || '—'} €
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded">
                                      {selectedAmendment.newPricingConfig?.monthlySubscription?.toLocaleString('fr-FR') || '—'} €
                                    </span>
                                  </td>
                                </tr>
                              )}

                          {/* Modifications de comptes intermédiaires */}
                          {selectedAmendment.modifyIntermediateAccounts && selectedAmendment.intermediateAccountsChanges && (
                            <>
                              {selectedAmendment.intermediateAccountsChanges.accountsToAdd && selectedAmendment.intermediateAccountsChanges.accountsToAdd.length > 0 && (
                                <tr className="border-b border-slate-200 hover:bg-blue-50 transition">
                                  <td className="border-r border-slate-300 p-4 font-semibold text-slate-900">Comptes intermédiaires</td>
                                  <td className="border-r border-slate-300 p-4 text-slate-700">Comptes à ajouter</td>
                                  <td className="border-r border-slate-300 p-4">—</td>
                                  <td className="p-4">
                                    <div className="space-y-1.5">
                                      {selectedAmendment.intermediateAccountsChanges.accountsToAdd.map(acc => (
                                        <div key={acc.id} className="text-green-600 font-semibold text-xs bg-green-50 px-3 py-1.5 rounded inline-block">
                                          {acc.accountNumber}
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
          )}
        </div>
      )}
    </>
  )
}

                                  <td className="border-r border-slate-300 p-4 font-semibold text-slate-900">Comptes intermédiaires</td>
                                  <td className="border-r border-slate-300 p-4 text-slate-700">Comptes à supprimer</td>
                                  <td className="border-r border-slate-300 p-4">
                                    <div className="space-y-1.5">
                                      {selectedAmendment.intermediateAccountsChanges.accountsToRemove.map(id => (
                                        <div key={id} className="text-red-600 line-through text-xs bg-red-50 px-3 py-1.5 rounded inline-block">
                                          {id}
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="p-4">—</td>
                                </tr>
                              )}
                            </>
                          )}

                          {/* Modifications de date de fin */}
                          {selectedAmendment.modifyEndDate && (
                            <tr className="border-b border-slate-200 hover:bg-blue-50 transition">
                              <td className="border-r border-slate-300 p-4 font-semibold text-slate-900">Contrat</td>
                              <td className="border-r border-slate-300 p-4 text-slate-700">Date de fin</td>
                              <td className="border-r border-slate-300 p-4">
                                <span className="line-through text-red-600 font-medium">
                                  {selectedAmendment.previousEndDate ? new Date(selectedAmendment.previousEndDate).toLocaleDateString('fr-FR') : '—'}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded">
                                  {selectedAmendment.newEndDate ? new Date(selectedAmendment.newEndDate).toLocaleDateString('fr-FR') : '—'}
                                </span>
                              </td>
                            </tr>
                          )}

                          {/* Message si aucune modification */}
                          {!selectedAmendment.modifyPricing && 
                           !selectedAmendment.modifyLeveling && 
                           !selectedAmendment.modifyDebitCoverage && 
                           !selectedAmendment.modifySecondaryAccounts && 
                           !selectedAmendment.modifyIntermediateAccounts && 
                           !selectedAmendment.modifyEndDate && (
                            <tr>
                              <td colSpan={4} className="p-6 text-center text-slate-600 italic">
                                Aucune modification enregistrée pour cet avenant.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* FOOTER - Design amélioré */}
                <div className="sticky bottom-0 bg-gradient-to-r from-slate-100 to-slate-50 border-t-2 border-slate-300 p-6 flex justify-end gap-4 shadow-lg">
                  <Button
                    variant="outline"
                    onClick={() => setIsAmendmentDetailOpen(false)}
                    className="border-2 border-slate-300 hover:bg-slate-100"
                  >
                    Fermer
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6">
                    <Download className="h-4 w-4" />
                    Télécharger l'avenant
                  </Button>
                </div>
              </div>
            </div>
          )}
                              {selectedAmendment.intermediateAccountsChanges.accountsToRemove && selectedAmendment.intermediateAccountsChanges.accountsToRemove.length > 0 && (
                                <tr className="border-b border-slate-200 hover:bg-blue-50 transition">
                                  <td className="border-r border-slate-300 p-4 font-semibold text-slate-900">Comptes intermédiaires</td>
                                  <td className="border-r border-slate-300 p-4 text-slate-700">Comptes à supprimer</td>
                                  <td className="border-r border-slate-300 p-4">
                                    <div className="space-y-1.5">
                                      {selectedAmendment.intermediateAccountsChanges.accountsToRemove.map(id => (
                                        <div key={id} className="text-red-600 line-through text-xs bg-red-50 px-3 py-1.5 rounded inline-block">
                                          {id}
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="p-4">—</td>
                                </tr>
                              )}
                            </>
                          )}

                          {/* Modifications de date de fin */}
                          {selectedAmendment.modifyEndDate && (
                            <tr className="border-b border-slate-200 hover:bg-blue-50 transition">
                              <td className="border-r border-slate-300 p-4 font-semibold text-slate-900">Contrat</td>
                              <td className="border-r border-slate-300 p-4 text-slate-700">Date de fin</td>
                              <td className="border-r border-slate-300 p-4">
                                <span className="line-through text-red-600 font-medium">
                                  {selectedAmendment.previousEndDate ? new Date(selectedAmendment.previousEndDate).toLocaleDateString('fr-FR') : '—'}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded">
                                  {selectedAmendment.newEndDate ? new Date(selectedAmendment.newEndDate).toLocaleDateString('fr-FR') : '—'}
                                </span>
                              </td>
                            </tr>
                          )}

                          {/* Message si aucune modification */}
                          {!selectedAmendment.modifyPricing && 
                           !selectedAmendment.modifyLeveling && 
                           !selectedAmendment.modifyDebitCoverage && 
                           !selectedAmendment.modifySecondaryAccounts && 
                           !selectedAmendment.modifyIntermediateAccounts && 
                           !selectedAmendment.modifyEndDate && (
                            <tr>
                              <td colSpan={4} className="p-6 text-center text-slate-600 italic">
                                Aucune modification enregistrée pour cet avenant.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* FOOTER - Design amélioré */}
                <div className="sticky bottom-0 bg-gradient-to-r from-slate-100 to-slate-50 border-t-2 border-slate-300 p-6 flex justify-end gap-4 shadow-lg">
                  <Button
                    variant="outline"
                    onClick={() => setIsAmendmentDetailOpen(false)}
                    className="border-2 border-slate-300 hover:bg-slate-100"
                  >
                    Fermer
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6">
                    <Download className="h-4 w-4" />
                    Télécharger l'avenant
                  </Button>
                </div>
              </div>
            </div>
          )}
                              {selectedAmendment.accountsChanges.accountsToRemove && selectedAmendment.accountsChanges.accountsToRemove.length > 0 && (
                                <tr className="border-b border-slate-300 hover:bg-slate-50">
                                  <td className="border-r border-slate-300 p-3 font-semibold text-slate-900">Comptes secondaires</td>
                                  <td className="border-r border-slate-300 p-3">Comptes à supprimer</td>
                                  <td className="border-r border-slate-300 p-3">
                                    <div className="space-y-1">
                                      {selectedAmendment.accountsChanges.accountsToRemove.map(id => (
                                        <div key={id} className="text-red-600 line-through text-xs">
                                          {id}
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="p-3">—</td>
                                </tr>
                              )}
                            </>
                          )}

                          {/* Modifications de comptes intermédiaires */}
                          {selectedAmendment.modifyIntermediateAccounts && selectedAmendment.intermediateAccountsChanges && (
                            <>
                              {selectedAmendment.intermediateAccountsChanges.accountsToAdd && selectedAmendment.intermediateAccountsChanges.accountsToAdd.length > 0 && (
                                <tr className="border-b border-slate-300 hover:bg-slate-50">
                                  <td className="border-r border-slate-300 p-3 font-semibold text-slate-900">Comptes intermédiaires</td>
                                  <td className="border-r border-slate-300 p-3">Comptes à ajouter</td>
                                  <td className="border-r border-slate-300 p-3">—</td>
                                  <td className="p-3">
                                    <div className="space-y-1">
                                      {selectedAmendment.intermediateAccountsChanges.accountsToAdd.map(acc => (
                                        <div key={acc.id} className="text-green-600 font-semibold text-xs">
                                          {acc.accountNumber}
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                              {selectedAmendment.intermediateAccountsChanges.accountsToRemove && selectedAmendment.intermediateAccountsChanges.accountsToRemove.length > 0 && (
                                <tr className="border-b border-slate-300 hover:bg-slate-50">
                                  <td className="border-r border-slate-300 p-3 font-semibold text-slate-900">Comptes intermédiaires</td>
                                  <td className="border-r border-slate-300 p-3">Comptes à supprimer</td>
                                  <td className="border-r border-slate-300 p-3">
                                    <div className="space-y-1">
                                      {selectedAmendment.intermediateAccountsChanges.accountsToRemove.map(id => (
                                        <div key={id} className="text-red-600 line-through text-xs">
                                          {id}
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="p-3">—</td>
                                </tr>
                              )}
                            </>
                          )}

                          {/* Modifications de date de fin */}
                          {selectedAmendment.modifyEndDate && (
                            <tr className="border-b border-slate-300 hover:bg-slate-50">
                              <td className="border-r border-slate-300 p-3 font-semibold text-slate-900">Contrat</td>
                              <td className="border-r border-slate-300 p-3">Date de fin</td>
                              <td className="border-r border-slate-300 p-3">
                                <span className="line-through text-red-600">
                                  {selectedAmendment.previousEndDate ? new Date(selectedAmendment.previousEndDate).toLocaleDateString('fr-FR') : '—'}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="text-green-600 font-semibold">
                                  {selectedAmendment.newEndDate ? new Date(selectedAmendment.newEndDate).toLocaleDateString('fr-FR') : '—'}
                                </span>
                              </td>
                            </tr>
                          )}

                          {/* Message si aucune modification */}
                          {!selectedAmendment.modifyPricing && 
                           !selectedAmendment.modifyLeveling && 
                           !selectedAmendment.modifyDebitCoverage && 
                           !selectedAmendment.modifySecondaryAccounts && 
                           !selectedAmendment.modifyIntermediateAccounts && 
                           !selectedAmendment.modifyEndDate && (
                            <tr>
                              <td colSpan={4} className="p-6 text-center text-slate-600 italic">
                                Aucune modification enregistrée pour cet avenant.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="sticky bottom-0 bg-slate-50 border-t p-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsAmendmentDetailOpen(false)}
                  >
                    Fermer
                  </Button>
                  <Button className="gap-2">
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

