import type { CashPoolingContract } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    <div className="space-y-6 bg-white">
      {/* HEADER */}
      <div className="border-b-2 border-slate-900 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">CONVENTION DE CASH POOLING</h1>
            <div className="flex gap-8 mt-3 text-sm">
              <div>
                <span className="font-semibold">Identifiant :</span> {contract.contractNumber}
              </div>
              <div>
                <span className="font-semibold">Date :</span> {new Date(contract.createdAt).toLocaleDateString("fr-FR")}
              </div>
              <div>
                <span className="font-semibold">Statut :</span>
                <Badge className="ml-2 bg-green-600">{contract.status.toUpperCase()}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1 - IDENTIFICATION CLIENT */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 border-b-2 border-slate-300 pb-2">
          SECTION 1 — IDENTIFICATION CLIENT
        </h2>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-slate-600 font-medium">Numéro tiers</p>
            <p className="font-mono font-semibold text-slate-900">{contract.clientId}</p>
          </div>
          <div>
            <p className="text-slate-600 font-medium">Intitulé</p>
            <p className="font-semibold text-slate-900">{contract.clientName}</p>
          </div>
          <div>
            <p className="text-slate-600 font-medium">Nombre de comptes</p>
            <p className="font-semibold text-slate-900">{contract.secondaryAccounts.length + 1}</p>
          </div>
          <div>
            <p className="text-slate-600 font-medium">Devise</p>
            <p className="font-semibold text-slate-900">{contract.currency}</p>
          </div>
          <div>
            <p className="text-slate-600 font-medium">Compte de tarification</p>
            <p className="font-mono font-semibold text-slate-900">{contract.masterAccount?.accountNumber}</p>
          </div>
        </div>

        {/* Master Account */}
        <div className="mt-4 p-4 bg-slate-50 border border-slate-300 rounded">
          <p className="text-sm font-bold text-slate-900 mb-2">Compte Centralisateur :</p>
          <p className="font-mono text-sm text-slate-900">
            {contract.masterAccount?.accountNumber} — {contract.masterAccount?.clientName}
          </p>
        </div>

        {/* Secondary Accounts List */}
        {contract.secondaryAccounts.length > 0 && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-300 rounded">
            <p className="text-sm font-bold text-slate-900 mb-2">Comptes Secondaires :</p>
            <ul className="space-y-1">
              {contract.secondaryAccounts.map((account, idx) => (
                <li key={account.id} className="font-mono text-sm text-slate-900">
                  {idx + 1}. {account.accountNumber} — {account.clientName}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SECTION 2 - COMPTES AU SEIN DE LA STRUCTURE */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 border-b-2 border-slate-300 pb-2">
          SECTION 2 — COMPTES AU SEIN DE LA STRUCTURE
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 border border-slate-300">
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Numéro de compte (IBAN)</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Intitulé</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Rôle</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Mode de nivellement</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Statut</th>
              </tr>
            </thead>
            <tbody>
              {/* Master Account */}
              <tr className="border border-slate-300 hover:bg-slate-50">
                <td className="border border-slate-300 p-2 font-mono text-xs">{contract.masterAccount?.accountNumber}</td>
                <td className="border border-slate-300 p-2">{contract.masterAccount?.clientName}</td>
                <td className="border border-slate-300 p-2 font-semibold text-slate-900">Centralisateur</td>
                <td className="border border-slate-300 p-2">—</td>
                <td className="border border-slate-300 p-2">
                  <Badge className="bg-green-100 text-green-800 border-green-300">Actif</Badge>
                </td>
              </tr>
              {/* Secondary Accounts */}
              {contract.secondaryAccounts.map((account) => (
                <tr key={account.id} className="border border-slate-300 hover:bg-slate-50">
                  <td className="border border-slate-300 p-2 font-mono text-xs">{account.accountNumber}</td>
                  <td className="border border-slate-300 p-2">{account.clientName}</td>
                  <td className="border border-slate-300 p-2 font-semibold text-slate-900">Secondaire</td>
                  <td className="border border-slate-300 p-2">ZBA</td>
                  <td className="border border-slate-300 p-2">
                    <Badge className="bg-green-100 text-green-800 border-green-300">Actif</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3 - PARAMÈTRES DE NIVELLEMENT */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 border-b-2 border-slate-300 pb-2">
          SECTION 3 — PARAMÈTRES DE NIVELLEMENT
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 border border-slate-300">
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Compte (IBAN)</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Mode</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Paramètres</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Couverture débitrice</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Priorité</th>
              </tr>
            </thead>
            <tbody>
              {contract.secondaryAccounts.map((account, idx) => (
                <tr key={account.id} className="border border-slate-300 hover:bg-slate-50">
                  <td className="border border-slate-300 p-2 font-mono text-xs">{account.accountNumber}</td>
                  <td className="border border-slate-300 p-2 font-semibold">ZBA</td>
                  <td className="border border-slate-300 p-2">Solde cible : 0,00 {contract.currency}</td>
                  <td className="border border-slate-300 p-2">Full</td>
                  <td className="border border-slate-300 p-2 text-center font-semibold">{idx + 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4 - TARIFICATION */}
      {contract.pricingConfig && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b-2 border-slate-300 pb-2">
            SECTION 4 — TARIFICATION
          </h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-600 font-medium">Mode de tarification</p>
              <p className="font-semibold text-slate-900">
                {contract.pricingConfig.type === "fixed"
                  ? "Report simple (EBICS)"
                  : contract.pricingConfig.type === "variable"
                    ? "Tarification variable"
                    : "Tarification hybride"}
              </p>
            </div>
            <div>
              <p className="text-slate-600 font-medium">Devise</p>
              <p className="font-semibold text-slate-900">{contract.currency}</p>
            </div>
            <div>
              <p className="text-slate-600 font-medium">Compte de tarification</p>
              <p className="font-mono font-semibold text-slate-900 text-xs">{contract.masterAccount?.accountNumber}</p>
            </div>
          </div>

          {/* Détail de la tarification */}
          <div className="mt-4 p-4 bg-slate-50 border border-slate-300 rounded">
            <p className="text-sm font-bold text-slate-900 mb-3">Détail de la tarification</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Frais d'ouverture</p>
                <p className="font-semibold text-slate-900">
                  {contract.pricingConfig.openingFees?.toLocaleString("fr-FR") || "0,00"} {contract.currency}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Abonnement mensuel</p>
                <p className="font-semibold text-slate-900">
                  {contract.pricingConfig.monthlySubscription?.toLocaleString("fr-FR") || "0,00"} {contract.currency}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Frais de contrat</p>
                <p className="font-semibold text-slate-900">
                  {contract.pricingConfig.contractGenerationFees?.toLocaleString("fr-FR") || "0,00"} {contract.currency}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 italic mt-3">
              Note : Ce contrat utilise la tarification simple standard sans calcul tarifaire avancé.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 5 - PLAFONDS & SEUILS */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 border-b-2 border-slate-300 pb-2">
          SECTION 6 — PLAFONDS & SEUILS DES OPÉRATIONS
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 border border-slate-300">
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Opération</th>
                <th className="border border-slate-300 p-2 text-center font-bold text-slate-900">Web Min</th>
                <th className="border border-slate-300 p-2 text-center font-bold text-slate-900">Web Max</th>
                <th className="border border-slate-300 p-2 text-center font-bold text-slate-900">Web/j</th>
                <th className="border border-slate-300 p-2 text-center font-bold text-slate-900">Mobile Min</th>
                <th className="border border-slate-300 p-2 text-center font-bold text-slate-900">Mobile Max</th>
                <th className="border border-slate-300 p-2 text-center font-bold text-slate-900">Mobile/j</th>
              </tr>
            </thead>
            <tbody>
              {[
                "Sweep ZBA",
                "Ajustement TBA",
                "Opération FBA",
                "Couverture débitrice",
                "Placement OPCVM",
              ].map((operation) => (
                <tr key={operation} className="border border-slate-300 hover:bg-slate-50">
                  <td className="border border-slate-300 p-2 font-semibold">{operation}</td>
                  <td className="border border-slate-300 p-2 text-center">1,00</td>
                  <td className="border border-slate-300 p-2 text-center">Illimité</td>
                  <td className="border border-slate-300 p-2 text-center">999</td>
                  <td className="border border-slate-300 p-2 text-center">1,00</td>
                  <td className="border border-slate-300 p-2 text-center">Illimité</td>
                  <td className="border border-slate-300 p-2 text-center">999</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONDITIONS GÉNÉRALES */}
      <div className="space-y-3 border-t-2 border-slate-300 pt-6">
        <h2 className="text-lg font-bold text-slate-900 border-b-2 border-slate-300 pb-2">
          CONDITIONS GÉNÉRALES & SIGNATURE FINALE
        </h2>
        <ul className="text-sm text-slate-700 space-y-2 list-disc list-inside">
          <li>
            Je (Nous), soussigné(s), reconnais (sons) avoir pris connaissance des conditions générales et déclare (ons) y adhérer
            sans aucune restriction ni réserve.
          </li>
          <li>
            A cet effet, je (nous) autorise (ons) la banque à effectuer sur le compte de tarification précisé ci-dessus les
            prélèvements prévus au titre des conditions tarifaires du service Cash Pooling.
          </li>
          <li>
            Je (Nous) mandate (ons) les personnes désignées comme utilisateurs habilités à l'effet d'effectuer sur les comptes
            ci-dessus indiqués les opérations et fonctionnalités incluses dans la présente convention.
          </li>
          <li>Les conditions particulières et générales relatives au token vous seront remis à la livraison.</li>
        </ul>
      </div>

      {/* SIGNATURE SECTION */}
      <div className="grid grid-cols-3 gap-8 pt-6 border-t-2 border-slate-300">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-bold text-slate-900 mb-2">Signature du représentant légal</p>
            <p className="text-xs text-slate-600 italic mb-3">A précéder de la mention "lu et approuvé"</p>
            <div className="h-16 border-b border-slate-300"></div>
            <p className="text-xs text-slate-600 mt-2">Fait à ........ le ../../....</p>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-bold text-slate-900 mb-2">Signature de l'abonné</p>
            <p className="text-xs text-slate-600 italic mb-3">A précéder de la mention "lu et approuvé"</p>
            <div className="h-16 border-b border-slate-300"></div>
            <p className="text-xs text-slate-600 mt-2">Fait à ........ le ../../....</p>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-bold text-slate-900 mb-2">Signature et cachet du CAF</p>
            <p className="text-xs text-slate-600 italic mb-3">A précéder de la mention "lu et approuvé"</p>
            <div className="h-16 border-b border-slate-300"></div>
            <p className="text-xs text-slate-600 mt-2">Fait à ........ le ../../....</p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-6 border-t text-xs text-slate-500 text-center">
        <p>Page 1 / 1</p>
        <p className="mt-2">Document généré le {formattedDate}</p>
      </div>
    </div>
  )
}
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
