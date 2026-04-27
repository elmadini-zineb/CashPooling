import type { CashPoolingContract } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface ContractPreviewProps {
  contract: CashPoolingContract
  user: any
}

export function ContractPreview({ contract, user }: ContractPreviewProps) {
  const formattedDate = contract.createdAt.toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  })

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
