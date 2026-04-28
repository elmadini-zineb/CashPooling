'use client'

import { Contract, Amendment } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, X, ChevronRight } from 'lucide-react'

interface ContractDetailModalProps {
  contract: Contract | null
  isOpen: boolean
  onClose: () => void
  selectedAmendment: Amendment | null
  isAmendmentDetailOpen: boolean
  setIsAmendmentDetailOpen: (value: boolean) => void
}

export function ContractDetailModal({
  contract,
  isOpen,
  onClose,
  selectedAmendment,
  isAmendmentDetailOpen,
  setIsAmendmentDetailOpen,
}: ContractDetailModalProps) {
  if (!contract && !selectedAmendment) return null

  return (
    <>
      {/* Contract Detail Modal */}
      {contract && isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détail du Contrat</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Référence</p>
                    <p className="font-semibold">{contract.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Client</p>
                    <p className="font-semibold">{contract.clientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Banque</p>
                    <p className="font-semibold">{contract.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Devise</p>
                    <p className="font-semibold">{contract.currency}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comptes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-2 font-semibold">Compte principal</p>
                    <p className="font-mono text-sm">{contract.mainAccount?.accountNumber}</p>
                  </div>
                  {contract.secondaryAccounts && contract.secondaryAccounts.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-600 mb-2 font-semibold">Comptes secondaires</p>
                      <div className="space-y-1">
                        {contract.secondaryAccounts.map(acc => (
                          <p key={acc.id} className="font-mono text-sm">{acc.accountNumber}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tarification</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Type de tarification</p>
                    <p className="font-semibold">{contract.pricingConfig?.pricingCodeType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Abonnement mensuel</p>
                    <p className="font-semibold">{contract.pricingConfig?.monthlySubscription?.toLocaleString('fr-FR') || '—'} €</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Tarif préférentiel</p>
                    <p className="font-semibold">{contract.pricingConfig?.preferentialRate || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Tarif standard</p>
                    <p className="font-semibold">{contract.pricingConfig?.standardRate || '—'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Périodicité</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Type</p>
                    <p className="font-semibold">
                      {contract.periodicityType === "daily" && "Quotidienne"}
                      {contract.periodicityType === "weekly" && "Hebdomadaire"}
                      {contract.periodicityType === "monthly" && "Mensuelle"}
                      {contract.periodicityType === "quarterly" && "Trimestrielle"}
                      {contract.periodicityType === "annual" && "Annuelle"}
                      {contract.periodicityType === "custom" && "Personnalisée"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Fréquence</p>
                    <p className="font-semibold">
                      Tous les {contract.periodicityFrequency} {contract.periodicityUnit === "days" && "jour(s)"}
                      {contract.periodicityUnit === "weeks" && "semaine(s)"}
                      {contract.periodicityUnit === "months" && "mois"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Heure d'exécution</p>
                    <p className="font-semibold">{contract.periodicityExecutionTime || 'Non définie'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Date de fin</p>
                    <p className="font-semibold">{contract.endDate ? new Date(contract.endDate).toLocaleDateString('fr-FR') : '—'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avenants ({contract.amendments?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {contract.amendments && contract.amendments.length > 0 ? (
                    <div className="space-y-3">
                      {contract.amendments.map(amendment => (
                        <button
                          key={amendment.id}
                          onClick={() => {
                            setSelectedAmendment(amendment)
                            setIsAmendmentDetailOpen(true)
                          }}
                          className="w-full p-3 bg-slate-50 rounded border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition text-left flex justify-between items-start cursor-pointer"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono font-semibold text-slate-900">{amendment.amendmentNumber}</span>
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
                                {amendment.status === 'active' && 'Actif'}
                                {amendment.status === 'generated' && 'Généré'}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">{amendment.reason}</p>
                            <p className="text-xs text-slate-500 mt-1">Date d'effet: {new Date(amendment.effectiveDate).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400 ml-4 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600 text-sm italic">Aucun avenant pour ce contrat</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Amendment Detail Modal */}
      {selectedAmendment && isAmendmentDetailOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-auto shadow-2xl">
            {/* HEADER */}
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
              {/* Objet et Motif */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-1 h-8 bg-blue-600 rounded"></div>
                  OBJET ET MOTIF
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">Objet</label>
                    <div className="p-4 bg-white border-2 border-blue-200 rounded-lg text-slate-700 min-h-24 shadow-sm">
                      {selectedAmendment.subject || selectedAmendment.reason || 'Non spécifié'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">Motif</label>
                    <div className="p-4 bg-white border-2 border-blue-200 rounded-lg text-slate-700 min-h-24 shadow-sm">
                      {selectedAmendment.reason || 'Non spécifié'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modifications Apportées */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-1 h-8 bg-orange-600 rounded"></div>
                  MODIFICATIONS APPORTÉES
                </h2>

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
                      {/* Tarification */}
                      {selectedAmendment.modifyPricing && selectedAmendment.previousPricingConfig && selectedAmendment.newPricingConfig && (
                        <>
                          <tr className="border-b border-slate-200 hover:bg-blue-50 transition">
                            <td className="border-r border-slate-300 p-4 font-semibold text-slate-900">Tarification</td>
                            <td className="border-r border-slate-300 p-4 text-slate-700">Type</td>
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
                        </>
                      )}

                      {/* Nivellement */}
                      {selectedAmendment.modifyLeveling && selectedAmendment.levelingChanges && (
                        <>
                          {Object.entries(selectedAmendment.levelingChanges).map(([city, changes]: any) =>
                            changes && (
                              <tr key={`leveling-${city}`} className="border-b border-slate-200 hover:bg-blue-50 transition">
                                <td className="border-r border-slate-300 p-4 font-semibold text-slate-900 capitalize">{city}</td>
                                <td className="border-r border-slate-300 p-4 text-slate-700">Mode</td>
                                <td className="border-r border-slate-300 p-4">
                                  <div className="space-y-1">
                                    <div className="line-through text-red-600 font-medium">{changes.oldMode}</div>
                                    {changes.oldParams && (
                                      <div className="text-red-500 text-xs mt-1 p-2 bg-red-50 rounded">
                                        {changes.oldParams.min && <div>Min: {changes.oldParams.min}</div>}
                                        {changes.oldParams.max && <div>Max: {changes.oldParams.max}</div>}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="space-y-1">
                                    <div className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded inline-block">{changes.newMode}</div>
                                    {changes.params && (
                                      <div className="text-green-700 text-xs mt-1 p-2 bg-green-50 rounded">
                                        {changes.params.min && <div>Min: {changes.params.min}</div>}
                                        {changes.params.max && <div>Max: {changes.params.max}</div>}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          )}
                        </>
                      )}

                      {/* Message si aucune modification */}
                      {!selectedAmendment.modifyPricing && !selectedAmendment.modifyLeveling && !selectedAmendment.modifyDebitCoverage && !selectedAmendment.modifySecondaryAccounts && !selectedAmendment.modifyIntermediateAccounts && !selectedAmendment.modifyEndDate && (
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
    </>
  )
}
