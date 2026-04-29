"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Trash2, AlertTriangle } from "lucide-react"

interface SecondaryAccount {
  id: string
  number: string
  name: string
  currentAttachment: string
  currentAttachmentName: string
}

interface IntermediateAccount {
  id: string
  number: string
  name: string
}

interface SecondaryAccountAttachmentProps {
  amendmentNumber: string
  conventionNumber: string
  centralizatorAccount: {
    number: string
    name: string
  }
  secondaryAccounts: SecondaryAccount[]
  intermediateAccounts: IntermediateAccount[]
}

export function SecondaryAccountAttachment({
  amendmentNumber,
  conventionNumber,
  centralizatorAccount,
  secondaryAccounts,
  intermediateAccounts,
}: SecondaryAccountAttachmentProps) {
  const [newAttachments, setNewAttachments] = useState<Record<string, string>>({})
  const [deletionAttempts, setDeletionAttempts] = useState<Record<string, boolean>>({})
  const [blockingAlerts, setBlockingAlerts] = useState<Record<string, string>>({})

  const handleAttachmentChange = (accountId: string, newValue: string) => {
    setNewAttachments((prev) => ({
      ...prev,
      [accountId]: newValue,
    }))
    setBlockingAlerts((prev) => ({
      ...prev,
      [accountId]: "",
    }))
  }

  const handleDeleteSecondaryAccount = (account: SecondaryAccount) => {
    const newAttachment = newAttachments[account.id] || account.currentAttachment
    const isDirectToCenter = newAttachment === "centralisateur"

    if (!isDirectToCenter) {
      setBlockingAlerts((prev) => ({
        ...prev,
        [account.id]: `Ce compte secondaire est rattaché au compte intermédiaire ${newAttachment}. Veuillez modifier son rattachement avant de procéder à la suppression.`,
      }))
      return
    }

    // Check if it's the last secondary account
    const remainingAccounts = secondaryAccounts.filter((a) => a.id !== account.id)
    if (remainingAccounts.length === 0) {
      setBlockingAlerts((prev) => ({
        ...prev,
        [account.id]: "La convention doit conserver au moins 1 compte secondaire (RG-A3).",
      }))
      return
    }

    // If all checks pass, mark as deleted
    setDeletionAttempts((prev) => ({
      ...prev,
      [account.id]: true,
    }))
  }

  const isSecondaryAccountDeleted = (accountId: string) => deletionAttempts[accountId] || false

  // Get list of intermediates with linked secondary accounts
  const getLinkedSecondaryAccounts = (intermediateId: string) => {
    return secondaryAccounts.filter((account) => {
      const attachment = newAttachments[account.id] || account.currentAttachment
      return attachment === intermediateId && !isSecondaryAccountDeleted(account.id)
    })
  }

  // Get attachment options for a secondary account
  const getAttachmentOptions = () => {
    const options = [
      { id: "centralisateur", label: `Centralisateur (direct)` },
      ...intermediateAccounts.map((acc) => ({
        id: acc.number,
        label: `${acc.number} — ${acc.name}`,
      })),
    ]
    return options
  }

  const visibleSecondaryAccounts = secondaryAccounts.filter((acc) => !isSecondaryAccountDeleted(acc.id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Modification des rattachements</h1>
        <p className="text-slate-600">
          Avenant {amendmentNumber} — Convention {conventionNumber}
        </p>
      </div>

      {/* Info Banner */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 ml-2">
          Les modifications seront appliquées uniquement après validation de l'avenant par le valideur.
        </AlertDescription>
      </Alert>

      {/* Structure Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Arbre de la structure actuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 font-mono text-sm">
            {/* Centralizateur */}
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-400" />
                <span className="font-semibold">{centralizatorAccount.number}</span>
                <span className="text-slate-600">— {centralizatorAccount.name}</span>
                <Badge className="ml-2 bg-slate-200 text-slate-800">Non modifiable</Badge>
              </div>
            </div>

            {/* Intermédiaires et comptes secondaires */}
            <div className="ml-6 space-y-3">
              {intermediateAccounts.map((intermediate) => {
                const linkedAccounts = getLinkedSecondaryAccounts(intermediate.number)
                return (
                  <div key={intermediate.id}>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="font-semibold">{intermediate.number}</span>
                        <span className="text-slate-600">— {intermediate.name}</span>
                      </div>
                    </div>
                    {linkedAccounts.length > 0 && (
                      <div className="ml-6 space-y-2">
                        {linkedAccounts.map((account) => (
                          <div key={account.id} className="flex items-center gap-2">
                            <div className="text-slate-400">↳</div>
                            <span className="text-slate-600">{account.number} — {account.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Secondary accounts directly to centralizateur */}
              {secondaryAccounts
                .filter((acc) => {
                  const attachment = newAttachments[acc.id] || acc.currentAttachment
                  return attachment === "centralisateur" && !isSecondaryAccountDeleted(acc.id)
                })
                .map((account) => (
                  <div key={account.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="text-slate-400">↳</div>
                    <span className="text-slate-600">{account.number} — {account.name}</span>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Accounts Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comptes secondaires — gestion des rattachements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Compte secondaire</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Rattachement actuel</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Nouveau rattachement</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleSecondaryAccounts.map((account) => {
                  const newAttachment = newAttachments[account.id] || account.currentAttachment
                  const hasAlert = blockingAlerts[account.id]
                  const isLastAccount = visibleSecondaryAccounts.length === 1
                  const isDirectToCenter = newAttachment === "centralisateur"

                  return (
                    <tbody key={account.id}>
                      <tr className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-slate-900">{account.number}</p>
                            <p className="text-sm text-slate-600">{account.name}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{account.currentAttachmentName}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={newAttachment}
                            onChange={(e) => handleAttachmentChange(account.id, e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            {getAttachmentOptions().map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteSecondaryAccount(account)}
                            disabled={isLastAccount && isDirectToCenter}
                            title={
                              isLastAccount && isDirectToCenter
                                ? "Dernier compte secondaire — suppression impossible"
                                : "Supprimer le compte"
                            }
                            className={`p-2 rounded transition ${
                              isLastAccount && isDirectToCenter
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "hover:bg-red-100 text-red-600"
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                      {hasAlert && (
                        <tr className="bg-red-50 border-b border-slate-200">
                          <td colSpan={4} className="py-3 px-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-red-900">{hasAlert}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Intermediate Accounts Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comptes intermédiaires — gestion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Compte intermédiaire</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Comptes secondaires rattachés</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {intermediateAccounts.map((intermediate) => {
                  const linkedAccounts = getLinkedSecondaryAccounts(intermediate.number)
                  const canDelete = linkedAccounts.length === 0
                  const tooltip = canDelete
                    ? "Supprimer le compte"
                    : `Suppression bloquée : ${linkedAccounts.length} compte(s) secondaire(s) rattaché(s). Modifiez leur rattachement avant de supprimer.`

                  return (
                    <tr key={intermediate.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-slate-900">{intermediate.number}</p>
                          <p className="text-sm text-slate-600">{intermediate.name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-2">
                          {linkedAccounts.length > 0 ? (
                            linkedAccounts.map((account) => (
                              <Badge key={account.id} variant="outline">
                                {account.number}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-slate-500 text-sm">Aucun compte</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          disabled={!canDelete}
                          title={tooltip}
                          className={`p-2 rounded transition ${
                            canDelete
                              ? "hover:bg-red-100 text-red-600"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button variant="outline">Annuler</Button>
        <div className="flex gap-3">
          <Button variant="outline">Aperçu</Button>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">Enregistrer les modifications</Button>
        </div>
      </div>
    </div>
  )
}
