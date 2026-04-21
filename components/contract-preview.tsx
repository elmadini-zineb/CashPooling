import type { CashPoolingContract } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, CreditCard } from "lucide-react"
import { formatSchedulingFrequency, formatContractPeriodicity } from "@/lib/format-helpers"

interface ContractPreviewProps {
  contract: CashPoolingContract
  user: any
}

export function ContractPreview({ contract, user }: ContractPreviewProps) {
  const formattedDate = contract.createdAt.toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  })

  const totalBalance = [contract.masterAccount!, ...contract.secondaryAccounts].reduce(
    (sum, acc) => sum + acc.balance,
    0,
  )

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-orange-50 border-b">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">Contrat Cash Pooling</CardTitle>
            <p className="text-sm text-slate-600 mt-2">
              Référence: <span className="font-mono font-semibold">{contract.contractNumber}</span>
            </p>
          </div>
          <Badge className="bg-green-600 text-white text-base px-4 py-1.5">{contract.status.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        {/* Header Info */}
        <div className="grid md:grid-cols-2 gap-6 pb-6 border-b">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Client / Groupe</p>
            <p className="text-lg font-semibold text-slate-900">{contract.clientName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Devise du contrat</p>
            <Badge variant="secondary" className="text-lg px-4 py-1.5">
              {contract.currency}
            </Badge>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Date de création</p>
            <p className="text-sm text-slate-700">{formattedDate}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Créé par</p>
            <p className="text-sm text-slate-700">{user.name}</p>
            <p className="text-xs text-slate-500">{contract.createdBy}</p>
          </div>
        </div>

        {/* Master Account */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Compte Centralisateur</h3>
          <div className="bg-cyan-50 border-2 border-cyan-200 rounded-lg p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-base font-bold text-cyan-900">{contract.masterAccount?.accountNumber}</p>
                <p className="text-sm text-cyan-700 mt-2">{contract.masterAccount?.accountType}</p>
                <Badge className="mt-3 bg-green-100 text-green-800 border-green-300">
                  {contract.masterAccount?.status}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-xs text-cyan-600 mb-1">Solde</p>
                <p className="text-2xl font-bold text-cyan-900">
                  {contract.masterAccount?.balance.toLocaleString("fr-FR")} {contract.currency}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Accounts */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Comptes Secondaires ({contract.secondaryAccounts.length})
          </h3>
          <div className="space-y-3">
            {contract.secondaryAccounts.map((account, index) => (
              <div key={account.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-mono text-sm font-semibold text-slate-900">{account.accountNumber}</p>
                      <p className="text-sm text-slate-600 mt-1">{account.accountType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Solde</p>
                    <p className="text-base font-semibold text-slate-900">
                      {account.balance.toLocaleString("fr-FR")} {contract.currency}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {contract.periodicityType && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Périodicité d'exécution</p>
            <p className="text-sm font-semibold text-slate-900 mt-2">
              {formatContractPeriodicity(
                contract.periodicityType,
                contract.periodicityFrequency,
                contract.periodicityUnit,
                contract.periodicityExecutionTime,
              )}
            </p>
          </div>
        )}

        {contract.investmentConfig?.enabled && (
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600" />
              Placement OPCVM Automatique
            </h3>
            <div className="bg-cyan-50 border-2 border-cyan-200 rounded-lg p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide mb-1">Seuil d'excédent</p>
                  <p className="text-lg font-bold text-cyan-900">
                    {contract.investmentConfig.surplusThreshold.toLocaleString("fr-FR")} {contract.currency}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide mb-1">Mode de placement</p>
                  <p className="text-lg font-bold text-cyan-900">
                    {contract.investmentConfig.investmentMode === "total"
                      ? "Total (100%)"
                      : `Partiel (${contract.investmentConfig.investmentQuota}%)`}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide mb-1">OPCVM cible</p>
                <p className="text-base font-bold text-cyan-900">{contract.investmentConfig.opcvmFund?.name}</p>
                <p className="text-xs text-cyan-600 mt-1">
                  {contract.investmentConfig.opcvmFund?.fundType} • ISIN: {contract.investmentConfig.opcvmFund?.isin} •
                  Min: {contract.investmentConfig.opcvmFund?.minInvestment.toLocaleString("fr-FR")}{" "}
                  {contract.investmentConfig.opcvmFund?.currency}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-cyan-200">
                <Clock className="w-4 h-4 text-cyan-600" />
                <div>
                  <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">Fréquence d'exécution</p>
                  <p className="text-sm font-semibold text-cyan-900 mt-0.5">
                    {formatSchedulingFrequency(contract.investmentConfig.scheduling)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Badge
                  variant={contract.investmentConfig.autoRedemptionEnabled ? "default" : "outline"}
                  className="bg-orange-100 text-orange-800 border-orange-300"
                >
                  {contract.investmentConfig.autoRedemptionEnabled
                    ? "Rachat automatique activé"
                    : "Rachat automatique désactivé"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Configuration */}
        {contract.pricingConfig && (
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Tarification
            </h3>
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Type de tarification</p>
                  <p className="text-lg font-bold text-emerald-900">
                    {contract.pricingConfig.type === "fixed"
                      ? "Fixe"
                      : contract.pricingConfig.type === "variable"
                        ? "Variable"
                        : "Hybride"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Périodicité de facturation</p>
                  <p className="text-lg font-bold text-emerald-900">
                    {contract.pricingConfig.billingFrequency === "monthly"
                      ? "Mensuelle"
                      : contract.pricingConfig.billingFrequency === "quarterly"
                        ? "Trimestrielle"
                        : "Annuelle"}
                  </p>
                </div>
              </div>

              {/* Fixed Pricing Details */}
              {contract.pricingConfig.type === "fixed" && (
                <div className="grid md:grid-cols-3 gap-4 pt-3 border-t border-emerald-200">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Frais d'ouverture</p>
                    <p className="text-base font-bold text-emerald-900">
                      {contract.pricingConfig.openingFees?.toLocaleString("fr-FR")} {contract.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Abonnement mensuel</p>
                    <p className="text-base font-bold text-emerald-900">
                      {contract.pricingConfig.monthlySubscription?.toLocaleString("fr-FR")} {contract.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Frais du contrat</p>
                    <p className="text-base font-bold text-emerald-900">
                      {contract.pricingConfig.contractGenerationFees?.toLocaleString("fr-FR")} {contract.currency}
                    </p>
                  </div>
                </div>
              )}

              {/* Variable Pricing Details */}
              {contract.pricingConfig.type === "variable" && (
                <div className="grid md:grid-cols-3 gap-4 pt-3 border-t border-emerald-200">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Taux sur montant nivelé</p>
                    <p className="text-base font-bold text-emerald-900">{contract.pricingConfig.leveledAmountRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Frais par opération</p>
                    <p className="text-base font-bold text-emerald-900">
                      {contract.pricingConfig.levelingOperationFees?.toLocaleString("fr-FR")} {contract.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Frais/compte secondaire</p>
                    <p className="text-base font-bold text-emerald-900">
                      {contract.pricingConfig.secondaryAccountFees?.toLocaleString("fr-FR")} {contract.currency}
                    </p>
                  </div>
                </div>
              )}

              {/* Hybrid Pricing Details */}
              {contract.pricingConfig.type === "hybrid" && (
                <div className="space-y-4 pt-3 border-t border-emerald-200">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Abonnement mensuel fixe</p>
                      <p className="text-base font-bold text-emerald-900">
                        {contract.pricingConfig.monthlyBase?.toLocaleString("fr-FR")} {contract.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Frais d'ouverture</p>
                      <p className="text-base font-bold text-emerald-900">
                        {contract.pricingConfig.hybridOpeningFees?.toLocaleString("fr-FR")} {contract.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Comptes inclus</p>
                      <p className="text-base font-bold text-emerald-900">{contract.pricingConfig.accountsIncluded}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 pt-2">
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Taux variable</p>
                      <p className="text-base font-bold text-emerald-900">{contract.pricingConfig.hybridLeveledAmountRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Seuil de déclenchement</p>
                      <p className="text-base font-bold text-emerald-900">
                        {contract.pricingConfig.variableTriggerThreshold?.toLocaleString("fr-FR")} {contract.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Frais/compte extra/mois</p>
                      <p className="text-base font-bold text-emerald-900">
                        {contract.pricingConfig.hybridSecondaryAccountFees?.toLocaleString("fr-FR")} {contract.currency}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-gradient-to-r from-slate-50 to-cyan-50 border-2 border-slate-300 rounded-lg p-5">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Total des comptes</p>
              <p className="text-2xl font-bold text-slate-900">{contract.secondaryAccounts.length + 1}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Solde cumulé</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalBalance.toLocaleString("fr-FR")} {contract.currency}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Statut</p>
              <Badge className="bg-green-600 text-white text-base px-3 py-1">ACTIF</Badge>
            </div>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="pt-6 border-t">
          <p className="text-xs text-slate-500 leading-relaxed">
            Ce contrat de Cash Pooling a été généré automatiquement et est conforme aux règles bancaires en vigueur.
            Tous les comptes participants ont été validés selon les critères suivants : unicité du compte
            centralisateur, appartenance au même client ou groupe, cohérence des devises, statut actif des comptes, et
            absence de doublons. L'ensemble des opérations est horodaté et historisé dans le système d'audit.
            {contract.investmentConfig?.enabled &&
              " Les placements OPCVM sont déclenchés automatiquement selon la fréquence définie, et toute modification des seuils s'applique uniquement aux opérations futures."}
          </p>
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-xs text-slate-400">Document généré le {formattedDate}</p>
            <p className="text-xs text-slate-400 font-mono">ID: {contract.id}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
