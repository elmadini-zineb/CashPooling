"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Download, Check, X, Home } from "lucide-react"
import { getAllAmendments } from "@/lib/mock-data"
import { Amendment } from "@/lib/types"

export default function AmendmentsHistoryPage() {
  const router = useRouter()
  const [amendments, setAmendments] = useState<Amendment[]>([])
  const [user, setUser] = useState<any>(null)
  const [selectedAmendment, setSelectedAmendment] = useState<Amendment | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
    } else {
      setUser(JSON.parse(storedUser))
      setAmendments(getAllAmendments())
    }
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem("user")
    router.push("/login")
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="border-l pl-3 ml-2">
                <h1 className="text-xl font-bold text-slate-900">Historique des Avenants</h1>
                <p className="text-sm text-slate-500">Tous les avenants du système</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push("/dashboard")} className="gap-2">
                <Home className="h-4 w-4" />
                Tableau de bord
              </Button>
              <div className="text-right border-l pl-4">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {user.role}
                </Badge>
              </div>
              <Button variant="outline" onClick={handleLogout} size="sm">
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Tous les avenants</CardTitle>
            <p className="text-sm text-slate-600 mt-2">
              {amendments.length} document(s) triés du plus récent au plus ancien
            </p>
          </CardHeader>
          <CardContent>
            {amendments.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-3 text-left font-semibold text-slate-900">Type/Nom</th>
                      <th className="p-3 text-left font-semibold text-slate-900">Contrat</th>
                      <th className="p-3 text-left font-semibold text-slate-900">Date</th>
                      <th className="p-3 text-left font-semibold text-slate-900">Motif</th>
                      <th className="p-3 text-left font-semibold text-slate-900">Responsable</th>
                      <th className="p-3 text-left font-semibold text-slate-900">Statut</th>
                      <th className="p-3 text-left font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amendments.map((amendment) => (
                      <tr key={amendment.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setSelectedAmendment(amendment)
                              setShowDetail(true)
                            }}
                            className="font-mono font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {amendment.amendmentNumber}
                          </button>
                          <p className="text-xs text-slate-500 mt-1">{amendment.subject}</p>
                        </td>
                        <td className="p-3 text-slate-600">
                          <span className="font-mono text-xs">{amendment.conventionReference}</span>
                        </td>
                        <td className="p-3">
                          <p className="font-medium">{new Date(amendment.effectiveDate).toLocaleDateString('fr-FR')}</p>
                          <p className="text-xs text-slate-500">Effectif</p>
                        </td>
                        <td className="p-3 text-slate-600">{amendment.reason}</td>
                        <td className="p-3 text-slate-600">{amendment.createdBy || 'N/A'}</td>
                        <td className="p-3">
                          <Badge variant={
                            amendment.status === 'signed' ? 'default' :
                            amendment.status === 'pending_signature' ? 'secondary' :
                            amendment.status === 'rejected' ? 'destructive' :
                            amendment.status === 'active' ? 'default' :
                            'outline'
                          }>
                            {amendment.status === 'signed' && 'Signé'}
                            {amendment.status === 'pending_signature' && 'En attente'}
                            {amendment.status === 'rejected' && 'Rejeté'}
                            {amendment.status === 'draft' && 'Brouillon'}
                            {amendment.status === 'active' && 'Actif'}
                            {amendment.status === 'generated' && 'Généré'}
                          </Badge>
                        </td>
                        <td className="p-3 flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedAmendment(amendment)
                              setShowDetail(true)
                            }}
                            className="p-1.5 hover:bg-blue-100 rounded transition"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </button>
                          {amendment.status === 'pending_signature' && (
                            <button className="p-1.5 hover:bg-green-100 rounded transition" title="Approuver">
                              <Check className="h-4 w-4 text-green-600" />
                            </button>
                          )}
                          {amendment.status !== 'signed' && amendment.status !== 'active' && (
                            <button className="p-1.5 hover:bg-red-100 rounded transition" title="Rejeter">
                              <X className="h-4 w-4 text-red-600" />
                            </button>
                          )}
                          <button className="p-1.5 hover:bg-slate-100 rounded transition" title="Télécharger">
                            <Download className="h-4 w-4 text-slate-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 text-sm">Aucun avenant trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Amendment Detail Modal */}
      {selectedAmendment && showDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-700 text-white p-8 shadow-lg flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">Détails de l'avenant</h1>
                <p className="text-blue-100 text-sm mt-2">Référence: {selectedAmendment.amendmentNumber}</p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="h-10 w-10 rounded-full hover:bg-white hover:bg-opacity-20 flex items-center justify-center transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600 font-semibold mb-1">Numéro d'avenant</p>
                  <p className="font-mono font-bold text-lg">{selectedAmendment.amendmentNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-semibold mb-1">Convention</p>
                  <p className="font-mono text-lg">{selectedAmendment.conventionReference}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-semibold mb-1">Date d'effet</p>
                  <p className="text-lg">{new Date(selectedAmendment.effectiveDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-semibold mb-1">Statut</p>
                  <Badge variant={selectedAmendment.status === 'active' ? 'default' : 'secondary'}>
                    {selectedAmendment.status === 'active' ? 'Actif' : selectedAmendment.status}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-slate-600 font-semibold mb-2">Sujet</p>
                <p className="text-slate-700">{selectedAmendment.subject}</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-slate-600 font-semibold mb-2">Motif</p>
                <p className="text-slate-700">{selectedAmendment.reason}</p>
              </div>

              {selectedAmendment.modifyPricing && selectedAmendment.newPricingConfig && (
                <div className="border-t pt-4">
                  <p className="text-sm text-slate-600 font-semibold mb-3">Modifications de tarification</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-red-50 rounded">
                      <p className="text-xs text-red-700 font-semibold mb-1">Ancienne tarification</p>
                      {selectedAmendment.previousPricingConfig && (
                        <div className="space-y-1 text-red-600">
                          <div>Type: {selectedAmendment.previousPricingConfig.type}</div>
                          {selectedAmendment.previousPricingConfig.monthlySubscription && (
                            <div>Abonnement: {selectedAmendment.previousPricingConfig.monthlySubscription}€</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-xs text-green-700 font-semibold mb-1">Nouvelle tarification</p>
                      <div className="space-y-1 text-green-600">
                        <div>Type: {selectedAmendment.newPricingConfig.type}</div>
                        {selectedAmendment.newPricingConfig.monthlySubscription && (
                          <div>Abonnement: {selectedAmendment.newPricingConfig.monthlySubscription}€</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedAmendment.modifyLeveling && selectedAmendment.levelingChanges && (
                <div className="border-t pt-4">
                  <p className="text-sm text-slate-600 font-semibold mb-3">Modifications de nivellement</p>
                  <div className="space-y-3">
                    {Object.entries(selectedAmendment.levelingChanges).map(([city, changes]: any) => (
                      <div key={city} className="p-3 bg-slate-50 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">{city}</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-slate-600 font-semibold">Ancien mode</p>
                            <p className="text-red-600">{changes.oldMode}</p>
                          </div>
                          <div>
                            <p className="text-slate-600 font-semibold">Nouveau mode</p>
                            <p className="text-green-600">{changes.newMode}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t p-6 flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowDetail(false)}>
                Fermer
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Download className="h-4 w-4" />
                Télécharger
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
