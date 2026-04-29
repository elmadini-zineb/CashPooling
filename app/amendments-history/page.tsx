"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Download, Check, X, Home, AlertCircle, Filter } from "lucide-react"
import { getAllAmendments } from "@/lib/mock-data"
import { Amendment } from "@/lib/types"

export default function AmendmentsHistoryPage() {
  const router = useRouter()
  const [amendments, setAmendments] = useState<Amendment[]>([])
  const [user, setUser] = useState<any>(null)
  const [selectedAmendment, setSelectedAmendment] = useState<Amendment | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [amendmentToSign, setAmendmentToSign] = useState<Amendment | null>(null)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [amendmentToReject, setAmendmentToReject] = useState<Amendment | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterContract, setFilterContract] = useState<string>("all")
  const [filterDateFrom, setFilterDateFrom] = useState<string>("")
  const [filterDateTo, setFilterDateTo] = useState<string>("")

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

  const handleOpenSignatureModal = (amendment: Amendment) => {
    setAmendmentToSign(amendment)
    setShowSignatureModal(true)
  }

  const handleConfirmSignature = () => {
    if (amendmentToSign) {
      // Update amendment status to signed
      amendmentToSign.status = 'signed'
      amendmentToSign.signedAt = new Date()
      amendmentToSign.signedBy = user?.email || 'user@example.com'
      setAmendments([...amendments])
      setShowSignatureModal(false)
      setAmendmentToSign(null)
    }
  }

  const handleOpenRejectionModal = (amendment: Amendment) => {
    setAmendmentToReject(amendment)
    setRejectionReason("")
    setShowRejectionModal(true)
  }

  const handleConfirmRejection = () => {
    if (!rejectionReason.trim()) {
      alert("La raison du rejet est obligatoire")
      return
    }
    if (amendmentToReject) {
      // Update amendment status to rejected
      amendmentToReject.status = 'rejected'
      amendmentToReject.rejectionReason = rejectionReason
      setAmendments([...amendments])
      setShowRejectionModal(false)
      setAmendmentToReject(null)
      setRejectionReason("")
    }
  }

  // Filter amendments based on criteria
  const getFilteredAmendments = () => {
    return amendments.filter((amendment) => {
      // Status filter
      if (filterStatus !== "all" && amendment.status !== filterStatus) {
        return false
      }

      // Contract filter
      if (filterContract !== "all" && amendment.conventionReference !== filterContract) {
        return false
      }

      // Date range filter
      const amendmentDate = new Date(amendment.effectiveDate)
      if (filterDateFrom) {
        const dateFrom = new Date(filterDateFrom)
        if (amendmentDate < dateFrom) return false
      }
      if (filterDateTo) {
        const dateTo = new Date(filterDateTo)
        dateTo.setHours(23, 59, 59, 999)
        if (amendmentDate > dateTo) return false
      }

      return true
    })
  }

  // Get unique contracts from amendments
  const getUniqueContracts = () => {
    const contracts = new Set(amendments.map((a) => a.conventionReference))
    return Array.from(contracts).sort()
  }

  const filteredAmendments = getFilteredAmendments()

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
            {/* Filters */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-slate-600" />
                <h3 className="font-semibold text-slate-900">Filtres</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-2">Statut</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending_signature">En attente</option>
                    <option value="signed">Signé</option>
                    <option value="rejected">Rejeté</option>
                    <option value="active">Actif</option>
                    <option value="draft">Brouillon</option>
                  </select>
                </div>

                {/* Contract Filter */}
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-2">Contrat</label>
                  <select
                    value={filterContract}
                    onChange={(e) => setFilterContract(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les contrats</option>
                    {getUniqueContracts().map((contract) => (
                      <option key={contract} value={contract}>
                        {contract}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date From Filter */}
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-2">Date du</label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Date To Filter */}
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-2">Date au</label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Reset Filters Button */}
              {(filterStatus !== "all" || filterContract !== "all" || filterDateFrom || filterDateTo) && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterStatus("all")
                      setFilterContract("all")
                      setFilterDateFrom("")
                      setFilterDateTo("")
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </div>

            {/* Results Info */}
            <div className="mb-4">
              <p className="text-sm text-slate-600">
                <span className="font-semibold">{filteredAmendments.length}</span> avenant(s) trouvé(s)
                {(filterStatus !== "all" || filterContract !== "all" || filterDateFrom || filterDateTo) && (
                  <span> (sur {amendments.length} au total)</span>
                )}
              </p>
            </div>

            {filteredAmendments.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-3 text-left font-semibold text-slate-900">Type/Nom</th>
                      <th className="p-3 text-left font-semibold text-slate-900">Contrat</th>
                      <th className="p-3 text-left font-semibold text-slate-900">Date</th>
                      <th className="p-3 text-left font-semibold text-slate-900">Responsable</th>
                      <th className="p-3 text-left font-semibold text-slate-900">Statut</th>
                      <th className="p-3 text-left font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAmendments.map((amendment) => (
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
                            <button 
                              onClick={() => handleOpenSignatureModal(amendment)}
                              className="p-1.5 hover:bg-green-100 rounded transition" 
                              title="Signer l'avenant"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </button>
                          )}
                          {amendment.status !== 'signed' && amendment.status !== 'active' && (
                            <button 
                              onClick={() => handleOpenRejectionModal(amendment)}
                              className="p-1.5 hover:bg-red-100 rounded transition" 
                              title="Rejeter l'avenant"
                            >
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

      {/* Signature Confirmation Modal */}
      {showSignatureModal && amendmentToSign && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 flex items-start gap-4">
              <div className="p-3 bg-blue-500 rounded-full">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Confirmer la signature</h2>
                <p className="text-blue-100 text-sm mt-1">Êtes-vous sûr de vouloir signer cet avenant ?</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 font-semibold mb-2">Avenant</p>
                <p className="font-mono font-bold text-lg">{amendmentToSign.amendmentNumber}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 font-semibold mb-2">Convention</p>
                <p className="font-mono">{amendmentToSign.conventionReference}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 font-semibold mb-2">Sujet</p>
                <p className="text-slate-700">{amendmentToSign.subject}</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Note:</span> Cette action marquera l'avenant comme signé et ne peut pas être annulée.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border-t p-6 flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowSignatureModal(false)
                  setAmendmentToSign(null)
                }}
              >
                Annuler
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
                onClick={handleConfirmSignature}
              >
                <Check className="h-4 w-4" />
                Confirmer la signature
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Confirmation Modal */}
      {showRejectionModal && amendmentToReject && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
            <div className="bg-gradient-to-r from-red-900 to-red-700 text-white p-6 flex items-start gap-4">
              <div className="p-3 bg-red-500 rounded-full">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Confirmer le rejet</h2>
                <p className="text-red-100 text-sm mt-1">Êtes-vous sûr de vouloir rejeter cet avenant ?</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 font-semibold mb-2">Avenant</p>
                <p className="font-mono font-bold text-lg">{amendmentToReject.amendmentNumber}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 font-semibold mb-2">Convention</p>
                <p className="font-mono">{amendmentToReject.conventionReference}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 font-semibold mb-2">Sujet</p>
                <p className="text-slate-700">{amendmentToReject.subject}</p>
              </div>

              <div>
                <label className="text-sm text-slate-600 font-semibold mb-2 block">Raison du rejet <span className="text-red-600">*</span></label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Expliquez pourquoi vous rejetez cet avenant..."
                  className={`w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                    rejectionReason.trim() 
                      ? 'border-slate-300 focus:ring-red-500' 
                      : 'border-red-300 focus:ring-red-500'
                  }`}
                  rows={3}
                />
                {!rejectionReason.trim() && (
                  <p className="text-xs text-red-600 mt-1">La raison est obligatoire</p>
                )}
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-900">
                  <span className="font-semibold">Attention:</span> Cette action marquera l'avenant comme rejeté et ne peut pas être annulée.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border-t p-6 flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRejectionModal(false)
                  setAmendmentToReject(null)
                  setRejectionReason("")
                }}
              >
                Annuler
              </Button>
              <Button 
                className={`text-white gap-2 ${
                  rejectionReason.trim()
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-300 cursor-not-allowed'
                }`}
                onClick={handleConfirmRejection}
                disabled={!rejectionReason.trim()}
              >
                <X className="h-4 w-4" />
                Confirmer le rejet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
