"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { updateAmendmentStatus, addAuditLog } from "@/lib/mock-data"
import type { Amendment, CashPoolingContract } from "@/lib/types"
import { signAmendment, rejectAmendment, addAuditLog } from "@/lib/mock-data"
import { ChevronLeft, CheckCircle2, XCircle, Clock } from "lucide-react"

interface AmendmentTrackingProps {
  amendment: Amendment
  contract: CashPoolingContract
}

export function AmendmentTracking({ amendment, contract }: AmendmentTrackingProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionForm, setShowRejectionForm] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleSign = async () => {
    setIsLoading(true)
    try {
      signAmendment(amendment.id, "client@example.com")

      addAuditLog({
        id: `audit-${Date.now()}`,
        entityType: "amendment",
        entityId: amendment.id,
        action: `Avenant ${amendment.amendmentNumber} signé`,
        userEmail: "adria@admin.com",
        details: { signedAt: new Date() },
        createdAt: new Date(),
      })

      router.refresh()
    } catch (error) {
      console.error("Error signing amendment:", error)
      alert("Erreur lors de la signature")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Veuillez fournir un motif de rejet")
      return
    }

    setIsLoading(true)
    try {
      rejectAmendment(amendment.id, rejectionReason)

      addAuditLog({
        id: `audit-${Date.now()}`,
        entityType: "amendment",
        entityId: amendment.id,
        action: `Avenant ${amendment.amendmentNumber} rejeté`,
        userEmail: "adria@admin.com",
        details: { rejectionReason },
        createdAt: new Date(),
      })

      router.refresh()
    } catch (error) {
      console.error("Error rejecting amendment:", error)
      alert("Erreur lors du rejet")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmActivation = async () => {
    setShowConfirmDialog(false)
    setIsLoading(true)
    try {
      updateAmendmentStatus(amendment.id, "active")
      addAuditLog({
        id: `audit-${Date.now()}`,
        entityType: "amendment",
        entityId: amendment.id,
        action: `Avenant ${amendment.amendmentNumber} activé`,
        userEmail: "adria@admin.com",
        details: {},
        createdAt: new Date(),
      })
      router.refresh()
    } catch (e) {
      console.error(e)
      alert("Erreur lors de l'activation")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending_signature":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "signed":
        return "bg-emerald-100 text-emerald-800 border-emerald-300"
      case "active":
        return "bg-green-100 text-green-800 border-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-slate-100 text-slate-800 border-slate-300"
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "pending_signature":
        return "En attente de signature"
      case "signed":
        return "Signé"
      case "active":
        return "Actif"
      case "rejected":
        return "Rejeté"
      default:
        return status
    }
  }

  // Map amendment status to 4-step lifecycle
  const getProgressStep = (): number => {
    switch (amendment.status) {
      case "generated":
        return 1
      case "pending_signature":
        return 2
      case "signed":
        return 3
      case "active":
        return 4
      case "rejected":
        return 0 // Special case
      default:
        return 0
    }
  }

  const progressStep = getProgressStep()
  const steps = [
    { label: "Généré", status: "generated" },
    { label: "En attente", status: "pending_signature" },
    { label: "Confirmée", status: "signed" },
    { label: "Actif", status: "active" },
  ]

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/conventions/${contract.id}`)}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour à la convention
        </Button>
      </div>

      {/* Amendment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{amendment.amendmentNumber}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">{amendment.subject}</p>
            </div>
            <Badge className={`border ${getStatusColor(amendment.status)}`}>
              {getStatusLabel(amendment.status)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 4-Step Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progression de l'avenant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {amendment.status !== "rejected" ? (
              <>
                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-8">
                  {steps.map((step, index) => {
                    const isCompleted = progressStep > index + 1
                    const isActive = progressStep === index + 1
                    return (
                      <div key={step.status} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : isActive
                                ? "bg-blue-500 text-white ring-2 ring-blue-200"
                                : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {isCompleted ? "✓" : index + 1}
                        </div>
                        <p className={`text-xs font-medium mt-2 text-center ${isActive ? "text-blue-600" : "text-slate-600"}`}>
                          {step.label}
                        </p>
                        {index < steps.length - 1 && (
                          <div
                            className={`absolute h-1 w-24 mt-5 ${
                              isCompleted ? "bg-green-500" : "bg-slate-300"
                            }`}
                            style={{ marginLeft: "56px" }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Progress Timeline Details */}
                <div className="space-y-4 border-t pt-4">
                  {/* Step 1: Generated */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 bg-green-100 border-green-300">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Généré</p>
                      <p className="text-sm text-slate-600">
                        {amendment.createdAt.toLocaleDateString("fr-FR")} à{" "}
                        {amendment.createdAt.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">par {amendment.createdBy}</p>
                    </div>
                  </div>

                  {/* Step 2: Pending Signature */}
                  {progressStep >= 2 && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${progressStep >= 2 ? "bg-green-100 border-green-300" : "bg-slate-100 border-slate-300"}`}>
                          {progressStep >= 2 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">En attente de signature</p>
                        <p className="text-sm text-slate-600">Le client doit signer l'avenant</p>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Signed */}
                  {progressStep >= 3 && amendment.signedAt && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 bg-green-100 border-green-300">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Confirmée par signature</p>
                        <p className="text-sm text-slate-600">
                          {amendment.signedAt.toLocaleDateString("fr-FR")} à{" "}
                          {amendment.signedAt.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">par {amendment.signedBy}</p>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Active */}
                  {progressStep >= 4 && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 bg-green-100 border-green-300">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Actif</p>
                        <p className="text-sm text-slate-600">
                          À partir du {amendment.effectiveDate.toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Rejection Case */
              <div className="flex gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-red-900">Avenant rejeté</p>
                  <p className="text-sm text-red-700 mt-1">{amendment.rejectionReason}</p>
                  <p className="text-xs text-red-600 mt-2">La convention revient au statut Actif</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Amendment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détails de l'avenant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Motif
            </p>
            <p className="text-slate-900">{amendment.reason}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Date d'effet
            </p>
            <p className="text-slate-900">
              {amendment.effectiveDate.toLocaleDateString("fr-FR")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparaison de tarification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Configuration actuelle</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-slate-600">Type:</p>
                  <p className="font-medium text-slate-900">
                    {amendment.previousPricingConfig.type === "fixed"
                      ? "Fixe"
                      : amendment.previousPricingConfig.type === "variable"
                        ? "Variable"
                        : "Hybride"}
                  </p>
                </div>
                {amendment.previousPricingConfig.monthlySubscription && (
                  <div>
                    <p className="text-slate-600">Abonnement:</p>
                    <p className="font-medium text-slate-900">
                      {amendment.previousPricingConfig.monthlySubscription} {contract.currency}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Nouvelle configuration</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-slate-600">Type:</p>
                  <p className="font-medium text-emerald-600">
                    {amendment.newPricingConfig.type === "fixed"
                      ? "Fixe"
                      : amendment.newPricingConfig.type === "variable"
                        ? "Variable"
                        : "Hybride"}
                  </p>
                </div>
                {amendment.newPricingConfig.monthlySubscription && (
                  <div>
                    <p className="text-slate-600">Abonnement:</p>
                    <p className="font-medium text-emerald-600">
                      {amendment.newPricingConfig.monthlySubscription} {contract.currency}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {amendment.status === "pending_signature" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6 space-y-4">
            {!showRejectionForm ? (
              <div className="flex gap-3">
                <Button
                  onClick={handleSign}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isLoading ? "Signature..." : "Signer l'avenant"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowRejectionForm(true)}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Rejeter
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Motif du rejet..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm min-h-24"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleReject}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isLoading ? "Envoi..." : "Confirmer le rejet"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectionForm(false)
                      setRejectionReason("")
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {amendment.status === "signed" && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-6">
            <p className="text-emerald-900">
              Cet avenant a été signé et sera activé le{" "}
              <span className="font-semibold">
                {amendment.effectiveDate.toLocaleDateString("fr-FR")}
              </span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
