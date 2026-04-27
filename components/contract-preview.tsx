import type { CashPoolingContract } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
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
                  {idx + 1}. {account.accountNumber}
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
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Numéro de compte</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Rôle</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Statut</th>
              </tr>
            </thead>
            <tbody>
              {/* Master Account */}
              <tr className="border border-slate-300 hover:bg-slate-50">
                <td className="border border-slate-300 p-2 font-mono text-xs">{contract.masterAccount?.accountNumber}</td>
                <td className="border border-slate-300 p-2 font-semibold text-slate-900">Centralisateur</td>
                <td className="border border-slate-300 p-2">
                  <Badge className="bg-green-100 text-green-800">Actif</Badge>
                </td>
              </tr>
              {/* Secondary Accounts */}
              {contract.secondaryAccounts.map((account) => (
                <tr key={account.id} className="border border-slate-300 hover:bg-slate-50">
                  <td className="border border-slate-300 p-2 font-mono text-xs">{account.accountNumber}</td>
                  <td className="border border-slate-300 p-2 font-semibold text-slate-900">Secondaire</td>
                  <td className="border border-slate-300 p-2">
                    <Badge className="bg-green-100 text-green-800">Actif</Badge>
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
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Compte</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Mode</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-900">Paramètres</th>
              </tr>
            </thead>
            <tbody>
              {contract.secondaryAccounts.map((account, idx) => (
                <tr key={account.id} className="border border-slate-300 hover:bg-slate-50">
                  <td className="border border-slate-300 p-2 font-mono text-xs">{account.accountNumber}</td>
                  <td className="border border-slate-300 p-2 font-semibold">ZBA</td>
                  <td className="border border-slate-300 p-2">Solde cible : 0,00 {contract.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
