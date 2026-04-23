"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { CashPoolingContract } from "@/lib/types"
import { getAmendmentsByConvention } from "@/lib/mock-data"
import { ChevronLeft, FileText, Plus, AlertCircle, History } from "lucide-react"
import { ContractActions } from "./contract-actions"

interface ConventionDetailViewProps {
  contract: CashPoolingContract
}

export function ConventionDetailView({ contract }: ConventionDetailViewProps) {
  const router = useRouter()
  const amendments = getAmendmentsByConvention(contract.id)
  const pendingAmendment = amendments.find((a) => a.status === "pending_signature")

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-300"
      case "suspended":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "registered":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-slate-100 text-slate-800 border-slate-300"
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "active":
        return "Actif"
      case "suspended":
        return "Suspendu"
      case "registered":
        return "Enregistré"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/conventions")}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour aux conventions
        </Button>
      </div>

      {/* Pending Amendment Alert */}
      {pendingAmendment && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">Avenant en attente de signature</p>
              <p className="text-sm text-yellow-800 mt-1">{pendingAmendment.amendmentNumber} - {pendingAmendment.subject}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/conventions/${contract.id}/amendment/${pendingAmendment.id}`)}
                className="mt-3"
              >
                Consulter l'avenant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{contract.contractNumber}</CardTitle>
              <CardDescription>{contract.clientName}</CardDescription>
            </div>
            <Badge className={`border ${getStatusColor(contract.status)}`}>
              {getStatusLabel(contract.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Client</p>
              <p className="text-lg font-semibold text-slate-900">{contract.clientName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Devise</p>
              <p className="text-lg font-semibold text-slate-900">{contract.currency}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Date de création</p>
              <p className="text-lg font-semibold text-slate-900">{contract.createdAt.toLocaleDateString("fr-FR")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Créé par</p>
              <p className="text-lg font-semibold text-slate-900">{contract.createdBy}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Master Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compte Centralisateur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Numéro de compte</p>
              <p className="text-base font-semibold text-slate-900">{contract.masterAccount?.accountNumber}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">IBAN</p>
              <p className="text-base font-semibold text-slate-900 font-mono">{contract.masterAccount?.iban}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Libellé</p>
              <p className="text-base font-semibold text-slate-900">{contract.masterAccount?.label}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Type</p>
              <p className="text-base font-semibold text-slate-900">{contract.masterAccount?.accountType}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comptes Secondaires ({contract.secondaryAccounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro de compte</TableHead>
                <TableHead>IBAN</TableHead>
                <TableHead>Libellé</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contract.secondaryAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-mono text-sm">{account.accountNumber}</TableCell>
                  <TableCell className="font-mono text-sm">{account.iban}</TableCell>
                  <TableCell>{account.label}</TableCell>
                  <TableCell>{account.accountType}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pricing Configuration */}
      {contract.pricingConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuration de Tarification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Type</p>
                <p className="text-lg font-semibold text-emerald-900 capitalize">
                  {contract.pricingConfig.type === "fixed"
                    ? "Fixe"
                    : contract.pricingConfig.type === "variable"
                      ? "Variable"
                      : "Hybride"}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Périodicité</p>
                <p className="text-lg font-semibold text-blue-900">
                  {contract.pricingConfig.billingFrequency === "monthly"
                    ? "Mensuelle"
                    : contract.pricingConfig.billingFrequency === "quarterly"
                      ? "Trimestrielle"
                      : "Annuelle"}
                </p>
              </div>
            </div>

            {/* Fixed Pricing */}
            {contract.pricingConfig.type === "fixed" && (
              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Frais d'ouverture</p>
                  <p className="text-lg font-bold text-slate-900">
                    {contract.pricingConfig.openingFees?.toLocaleString("fr-FR")} {contract.currency}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Abonnement mensuel</p>
                  <p className="text-lg font-bold text-slate-900">
                    {contract.pricingConfig.monthlySubscription?.toLocaleString("fr-FR")} {contract.currency}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Frais du contrat</p>
                  <p className="text-lg font-bold text-slate-900">
                    {contract.pricingConfig.contractGenerationFees?.toLocaleString("fr-FR")} {contract.currency}
                  </p>
                </div>
              </div>
            )}

            {/* Variable Pricing */}
            {contract.pricingConfig.type === "variable" && (
              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Taux sur montant nivelé</p>
                  <p className="text-lg font-bold text-slate-900">{contract.pricingConfig.leveledAmountRate}%</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Frais par opération</p>
                  <p className="text-lg font-bold text-slate-900">
                    {contract.pricingConfig.levelingOperationFees?.toLocaleString("fr-FR")} {contract.currency}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Frais/compte secondaire</p>
                  <p className="text-lg font-bold text-slate-900">
                    {contract.pricingConfig.secondaryAccountFees?.toLocaleString("fr-FR")} {contract.currency}
                  </p>
                </div>
              </div>
            )}

            {/* Hybrid Pricing */}
            {contract.pricingConfig.type === "hybrid" && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Abonnement fixe</p>
                    <p className="text-lg font-bold text-slate-900">
                      {contract.pricingConfig.monthlyBase?.toLocaleString("fr-FR")} {contract.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Frais d'ouverture</p>
                    <p className="text-lg font-bold text-slate-900">
                      {contract.pricingConfig.hybridOpeningFees?.toLocaleString("fr-FR")} {contract.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Comptes inclus</p>
                    <p className="text-lg font-bold text-slate-900">{contract.pricingConfig.accountsIncluded}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Taux variable</p>
                    <p className="text-lg font-bold text-slate-900">{contract.pricingConfig.hybridLeveledAmountRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Seuil de déclenchement</p>
                    <p className="text-lg font-bold text-slate-900">
                      {contract.pricingConfig.variableTriggerThreshold?.toLocaleString("fr-FR")} {contract.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Frais/compte extra</p>
                    <p className="text-lg font-bold text-slate-900">
                      {contract.pricingConfig.hybridSecondaryAccountFees?.toLocaleString("fr-FR")} {contract.currency}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Amendments History */}
      {amendments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historique des Avenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {amendments.map((amendment) => (
                <button
                  key={amendment.id}
                  onClick={() => router.push(`/conventions/${contract.id}/amendment/${amendment.id}`)}
                  className="w-full text-left p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{amendment.amendmentNumber}</p>
                      <p className="text-sm text-slate-600">{amendment.subject}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Créé le {amendment.createdAt.toLocaleDateString("fr-FR")} par {amendment.createdBy}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`border ${
                          amendment.status === "pending_signature"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                            : amendment.status === "signed"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : amendment.status === "active"
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : "bg-slate-100 text-slate-800 border-slate-300"
                        }`}
                      >
                        {amendment.status === "pending_signature"
                          ? "En attente"
                          : amendment.status === "signed"
                            ? "Signé"
                            : amendment.status === "active"
                              ? "Actif"
                              : amendment.status}
                      </Badge>
                      <FileText className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Actions */}
      <ContractActions contract={contract} onActionComplete={() => window.location.reload()} />

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {!pendingAmendment && contract.status === "active" && (
          <Button
            onClick={() => router.push(`/conventions/${contract.id}/amendment`)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Générer un avenant
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => router.push(`/conventions/${contract.id}/documents`)}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Voir les documents
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/conventions/${contract.id}/audit`)}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          Piste d'audit
        </Button>
      </div>
    </div>
  )
}
