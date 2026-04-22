'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ChevronLeft, Download } from 'lucide-react'
import type { Amendment, CashPoolingContract } from '@/lib/types'

interface AmendmentPreviewProps {
  amendment: Amendment
  contract: CashPoolingContract
  onModify: () => void
  onGenerateAndSend: () => void
  isGenerating?: boolean
}

export function AmendmentPreview({
  amendment,
  contract,
  onModify,
  onGenerateAndSend,
  isGenerating = false,
}: AmendmentPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Official Header */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">AVENANT À LA CONVENTION DE TRÉSORERIE</h2>
                <p className="text-sm text-slate-600 mt-2">Document officiel - Non modifiable</p>
              </div>
              <Badge className="bg-blue-600">{amendment.amendmentNumber}</Badge>
            </div>

            {/* Convention Info */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Référence Convention</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{contract.contractNumber}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Client</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{contract.clientName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Date d'effet</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  {amendment.effectiveDate.toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Amendment Subject and Reason */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Objet et Motif</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Objet</p>
            <p className="text-sm text-slate-900">{amendment.subject}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Motif</p>
            <p className="text-sm text-slate-900">{amendment.reason}</p>
          </div>
        </CardContent>
      </Card>

      {/* Modifications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Modifications Apportées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Section</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Champ</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Valeur Actuelle</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Nouvelle Valeur</th>
                </tr>
              </thead>
              <tbody>
                {/* Leveling Changes */}
                {amendment.modifyLeveling && amendment.levelingChanges && (
                  <>
                    {Object.entries(amendment.levelingChanges).map(([city, changes]: [string, any]) => (
                      <tr key={city} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">Nivellement</td>
                        <td className="px-4 py-3 text-slate-600">{city.charAt(0).toUpperCase() + city.slice(1)}</td>
                        <td className="px-4 py-3">
                          <span className="line-through text-red-600">{changes.oldMode}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-green-600">{changes.newMode}</span>
                        </td>
                      </tr>
                    ))}
                  </>
                )}

                {/* Debit Coverage Changes */}
                {amendment.modifyDebitCoverage && amendment.debitCoverageChanges && (
                  <tr className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">Couverture Débitrice</td>
                    <td className="px-4 py-3 text-slate-600">Mode de couverture</td>
                    <td className="px-4 py-3">
                      <span className="line-through text-red-600">{amendment.debitCoverageChanges.oldMode}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-green-600">{amendment.debitCoverageChanges.newMode}</span>
                    </td>
                  </tr>
                )}

                {/* Secondary Accounts Changes */}
                {amendment.modifySecondaryAccounts && amendment.accountsChanges && (
                  <>
                    {amendment.accountsChanges.accountsToAdd.length > 0 && (
                      <tr className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">Comptes Secondaires</td>
                        <td className="px-4 py-3 text-slate-600">Comptes à ajouter</td>
                        <td className="px-4 py-3">-</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-green-600">
                            {amendment.accountsChanges.accountsToAdd.map((acc) => acc.accountNumber).join(', ')}
                          </span>
                        </td>
                      </tr>
                    )}
                    {amendment.accountsChanges.accountsToRemove.length > 0 && (
                      <tr className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">Comptes Secondaires</td>
                        <td className="px-4 py-3 text-slate-600">Comptes à supprimer</td>
                        <td className="px-4 py-3">
                          <span className="line-through text-red-600">
                            {amendment.accountsChanges.accountsToRemove.join(', ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">-</td>
                      </tr>
                    )}
                  </>
                )}

                {/* Intermediate Accounts Changes */}
                {amendment.modifyIntermediateAccounts && amendment.intermediateAccountsChanges && (
                  <>
                    {amendment.intermediateAccountsChanges.accountsToAdd.length > 0 && (
                      <tr className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">Comptes Intermédiaires</td>
                        <td className="px-4 py-3 text-slate-600">Comptes à ajouter</td>
                        <td className="px-4 py-3">-</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-green-600">
                            {amendment.intermediateAccountsChanges.accountsToAdd.map((acc) => acc.accountNumber).join(', ')}
                          </span>
                        </td>
                      </tr>
                    )}
                    {amendment.intermediateAccountsChanges.accountsToRemove.length > 0 && (
                      <tr className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">Comptes Intermédiaires</td>
                        <td className="px-4 py-3 text-slate-600">Comptes à supprimer</td>
                        <td className="px-4 py-3">
                          <span className="line-through text-red-600">
                            {amendment.intermediateAccountsChanges.accountsToRemove.join(', ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">-</td>
                      </tr>
                    )}
                  </>
                )}

                {/* End Date Changes */}
                {amendment.modifyEndDate && amendment.endDateChanges && (
                  <tr className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">Date de Fin</td>
                    <td className="px-4 py-3 text-slate-600">Date de fin de la convention</td>
                    <td className="px-4 py-3">
                      <span className="line-through text-red-600">
                        {amendment.endDateChanges.oldEndDate.toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-green-600">
                        {amendment.endDateChanges.newEndDate.toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                  </tr>
                )}

                {/* No changes row */}
                {!amendment.modifyLeveling &&
                  !amendment.modifyDebitCoverage &&
                  !amendment.modifySecondaryAccounts &&
                  !amendment.modifyIntermediateAccounts &&
                  !amendment.modifyEndDate && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        Aucune modification à afficher
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Signature Zones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Zones de Signature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Manager Signature */}
            <div className="border-t-2 border-slate-800 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-8">Signature Chargé d'Affaires</p>
              <p className="text-xs text-slate-600">{amendment.createdBy}</p>
              <p className="text-xs text-slate-600 mt-1">{amendment.createdAt.toLocaleDateString('fr-FR')}</p>
            </div>

            {/* Client Signature */}
            <div className="border-t-2 border-slate-800 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-8">Signature Client</p>
              <p className="text-xs text-slate-600">[À signer électroniquement]</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          Ce document sera généré en PDF non modifiable et envoyé automatiquement au client. Vérifiez tous les détails avant de confirmer.
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onModify}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Modifier encore
        </Button>
        <Button
          onClick={onGenerateAndSend}
          disabled={isGenerating}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? 'Génération en cours...' : 'Générer et envoyer'}
        </Button>
      </div>
    </div>
  )
}
