'use client'

import Image from "next/image"
import type { CashPoolingContract, HierarchicalAccount, AdriaModularPricing } from "@/lib/types"
import { useRef, useState, useEffect } from "react"
import { ContractPricingSection } from "./contract-pricing-section"

interface BusinessOnlineContractFormProps {
  contract: CashPoolingContract
  hierarchy: HierarchicalAccount
  adriaPricing?: AdriaModularPricing
}

export function BusinessOnlineContractForm({ contract, hierarchy, adriaPricing }: BusinessOnlineContractFormProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [mockAdriaData] = useState<AdriaModularPricing | undefined>(adriaPricing)

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" })
  }

  return (
    <div ref={printRef} className="bg-white print:bg-white">
      {/* PAGE 1: Header & Identification Client */}
      <div className="w-full h-screen flex flex-col p-12 border-b-4 border-orange-500 page-break" style={{ width: "210mm", height: "297mm", margin: "0 auto" }}>
        {/* Header avec Logo */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-orange-500">
          {/* Logo CIH Banque */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image 
              src="/logo-chi-bank.jpg" 
              alt="CIH Banque Logo"
              width={100}
              height={100}
              priority
              className="object-contain"
            />
          </div>
          
          <div className="flex-1 ml-8">
            <h1 className="text-3xl font-bold text-black mb-1">BUSINESS ONLINE</h1>
            <p className="text-xl font-semibold text-orange-600">Module Cash Pooling</p>
          </div>
        </div>

        {/* Informations Contrat */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-bold text-black uppercase mb-2">Identifiant contrat</p>
            <p className="text-sm font-mono text-slate-900">{contract.contractNumber}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-black uppercase mb-2">Date de création</p>
            <p className="text-sm text-slate-900">{formatDate(contract.createdAt)}</p>
          </div>
        </div>

        {/* Section Identification Client */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-black mb-6 pb-2 border-b-3 border-orange-500">Identification Client</h2>
          
          <div className="grid grid-cols-2 gap-6 text-sm mb-8">
            <div>
              <p className="text-xs font-bold text-black uppercase mb-1">Numéro tiers</p>
              <p className="text-slate-900">{contract.clientId}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-black uppercase mb-1">Référence client</p>
              <p className="text-slate-900">{contract.clientName}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-black uppercase mb-1">Intitulé client</p>
              <p className="text-slate-900">{contract.clientName}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-black uppercase mb-1">Nombre d'abonnés</p>
              <p className="text-slate-900">{hierarchy.children?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-black uppercase mb-1">Compte de facturation</p>
              <p className="text-slate-900 font-mono">{contract.masterAccount?.accountNumber}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-black uppercase mb-1">Devise</p>
              <p className="text-slate-900">{contract.currency}</p>
            </div>
          </div>
        </div>

        {/* Table Plafonds & seuils opérations */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-black mb-4">Plafonds & seuils opérations</h3>
          <div className="overflow-hidden rounded border border-slate-300">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-orange-600 text-white">
                  <th className="p-3 text-left">Opération</th>
                  <th className="p-3 text-right">Min unitaire</th>
                  <th className="p-3 text-right">Max unitaire</th>
                  <th className="p-3 text-right">Quotidien</th>
                  <th className="p-3 text-right">Nombre/jour</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "Virement compte à compte",
                  "Virement vers bénéficiaire",
                  "Virement instantané",
                  "Virement permanent",
                  "Mise à disposition",
                  "Virement multiple",
                  "Virement de masse",
                  "Virement multidevise",
                  "Mise à disposition en masse"
                ].map((op, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-orange-50" : "bg-white"}>
                    <td className="p-3">{op}</td>
                    <td className="p-3 text-right">-</td>
                    <td className="p-3 text-right">-</td>
                    <td className="p-3 text-right">-</td>
                    <td className="p-3 text-right">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section Tarification appliquée */}
        <ContractPricingSection 
          pricingConfig={contract.pricingConfig}
          adriaPricing={mockAdriaData}
          currency={contract.currency}
          formatAmount={formatAmount}
        />

        {/* Footer */}
        <div className="mt-auto flex justify-between items-center text-xs text-black border-t-2 border-orange-500 pt-4">
          <span className="font-semibold">CIH BANK</span>
          <span>Page 1 / {Math.ceil((hierarchy.children?.length || 0) + 3)}</span>
        </div>
      </div>

      {/* PAGE 2: Comptes bancaires & Profils de signature */}
      <div className="w-full h-screen flex flex-col p-12 border-b-4 border-orange-500" style={{ width: "210mm", height: "297mm", margin: "0 auto" }}>
        <h2 className="text-lg font-bold text-black mb-6 pb-2 border-b-3 border-orange-500">Comptes bancaires</h2>
        
        <div className="overflow-hidden rounded border border-slate-300 mb-8">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-orange-600 text-white">
                <th className="p-3 text-left">Numéro de compte</th>
                <th className="p-3 text-left">Intitulé</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-right">Solde</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-orange-50">
                <td className="p-3 font-mono">{contract.masterAccount?.accountNumber}</td>
                <td className="p-3">{contract.masterAccount?.clientName}</td>
                <td className="p-3">Compte centralisateur</td>
                <td className="p-3 text-right">{formatAmount(contract.masterAccount?.balance || 0)}</td>
              </tr>
              {contract.secondaryAccounts.map((acc, idx) => (
                <tr key={acc.id} className={idx % 2 === 0 ? "bg-white" : "bg-orange-50"}>
                  <td className="p-3 font-mono">{acc.accountNumber}</td>
                  <td className="p-3">{acc.clientName}</td>
                  <td className="p-3">Compte secondaire</td>
                  <td className="p-3 text-right">{formatAmount(acc.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-lg font-bold text-black mb-6 pb-2 border-b-3 border-orange-500">Profils de signature</h2>
        
        <div className="overflow-hidden rounded border border-slate-300">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-orange-600 text-white">
                <th className="p-3 text-left">Profil</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-right">Rang</th>
                <th className="p-3 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-orange-50">
                <td className="p-3">Signature 1</td>
                <td className="p-3">Représentant légal</td>
                <td className="p-3 text-right">1</td>
                <td className="p-3">Pouvoir de signature complet</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-auto flex justify-between items-center text-xs text-black border-t-2 border-orange-500 pt-4">
          <span className="font-semibold">CIH BANK</span>
          <span>Page 2 / {Math.ceil((hierarchy.children?.length || 0) + 3)}</span>
        </div>
      </div>

      {/* PAGE 3: Signatures niveau contrat */}
      <div className="w-full h-screen flex flex-col p-12 border-b-4 border-orange-500" style={{ width: "210mm", height: "297mm", margin: "0 auto" }}>
        <h2 className="text-lg font-bold text-black mb-8 pb-2 border-b-3 border-orange-500">Déclarations et acceptations</h2>

        <div className="space-y-4 mb-8 text-sm">
          <div className="flex gap-3">
            <input type="checkbox" id="cond1" className="mt-1" />
            <label htmlFor="cond1">J'accepte les conditions générales d'utilisation du service Business Online Module Cash Pooling.</label>
          </div>
          <div className="flex gap-3">
            <input type="checkbox" id="cond2" className="mt-1" />
            <label htmlFor="cond2">J'autorise la banque à débiter mon compte pour les frais d'utilisation du service.</label>
          </div>
          <div className="flex gap-3">
            <input type="checkbox" id="cond3" className="mt-1" />
            <label htmlFor="cond3">Je donne mandat aux utilisateurs nommés ci-dessus pour effectuer les opérations dans le cadre du Cash Pooling.</label>
          </div>
        </div>

        <h3 className="text-sm font-bold text-black mb-6">Signatures</h3>

        <div className="grid grid-cols-2 gap-12">
          <div className="border-t-2 border-orange-500 pt-12 text-xs">
            <p className="font-bold mb-6 text-black">Signature du représentant légal</p>
            <div className="space-y-4">
              <div>
                <p className="text-slate-600 mb-1">Fait à ________________</p>
                <p className="text-slate-600">le ___/___/______</p>
              </div>
              <div>
                <p className="font-semibold">Lu et approuvé</p>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-orange-500 pt-12 text-xs">
            <p className="font-bold mb-6 text-black">Signature et cachet du CAF</p>
            <div className="space-y-4">
              <div>
                <p className="text-slate-600 mb-1">Fait à ________________</p>
                <p className="text-slate-600">le ___/___/______</p>
              </div>
              <div>
                <p className="font-semibold">Cachet et signature</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto flex justify-between items-center text-xs text-black border-t-2 border-orange-500 pt-4">
          <span className="font-semibold">CIH BANK</span>
          <span>Page 3 / {Math.ceil((hierarchy.children?.length || 0) + 3)}</span>
        </div>
      </div>

      {/* PAGES 4+: Contrat utilisateur (répétable) */}
      {hierarchy.children?.map((child, idx) => (
        <div key={child.id} className="w-full h-screen flex flex-col p-12 border-b-4 border-orange-500" style={{ width: "210mm", height: "297mm", margin: "0 auto" }}>
          <h2 className="text-lg font-bold text-black mb-6 pb-2 border-b-3 border-orange-500">Contrat utilisateur n° {idx + 1}</h2>

          {/* Identification utilisateur */}
          <div className="grid grid-cols-2 gap-6 text-sm mb-8">
            <div>
              <p className="text-xs font-bold text-black uppercase mb-1">Nom</p>
              <p className="text-slate-900">Dupont</p>
            </div>
            <div>
              <p className="text-xs font-bold text-black uppercase mb-1">Prénom</p>
              <p className="text-slate-900">Jean</p>
            </div>
            <div>
              <p className="text-xs font-bold text-black uppercase mb-1">Email principal</p>
              <p className="text-slate-900">jean.dupont@example.com</p>
            </div>
            <div>
              <p className="text-xs font-bold text-black uppercase mb-1">Téléphone principal</p>
              <p className="text-slate-900">+212 5XX XXX XXX</p>
            </div>
            <div>
              <p className="text-xs font-bold text-black uppercase mb-1">Type pièce d'identité</p>
              <p className="text-slate-900">CIN</p>
            </div>
            <div>
              <p className="text-xs font-bold text-black uppercase mb-1">Numéro pièce</p>
              <p className="text-slate-900">AB123456</p>
            </div>
          </div>

          {/* Profil utilisateur */}
          <div className="grid grid-cols-2 gap-6 text-sm mb-8">
            <div>
              <p className="text-xs font-bold text-black uppercase mb-1">Login utilisateur</p>
              <p className="text-slate-900 font-mono">jean.dupont</p>
            </div>
            <div>
              <p className="text-xs font-bold text-black uppercase mb-1">Qualité / contrat</p>
              <p className="text-slate-900">Administrateur</p>
            </div>
          </div>

          {/* Comptes de l'utilisateur */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-black mb-4">Comptes autorisés</h3>
            <div className="overflow-hidden rounded border border-slate-300">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-orange-600 text-white">
                    <th className="p-3 text-left">Numéro de compte</th>
                    <th className="p-3 text-left">Intitulé</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-orange-50">
                    <td className="p-3 font-mono">{child.account?.accountNumber}</td>
                    <td className="p-3">{child.account?.clientName}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures utilisateur */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-black mb-6">Signatures</h3>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="border-t-2 border-orange-500 pt-8">
                <p className="font-bold mb-4 text-black">Représentant légal</p>
                <div className="space-y-2">
                  <p className="text-slate-600">Fait à ________</p>
                  <p className="text-slate-600">le ___/___/____</p>
                </div>
              </div>
              <div className="border-t-2 border-orange-500 pt-8">
                <p className="font-bold mb-4 text-black">Abonné</p>
                <div className="space-y-2">
                  <p className="text-slate-600">Fait à ________</p>
                  <p className="text-slate-600">le ___/___/____</p>
                </div>
              </div>
              <div className="border-t-2 border-orange-500 pt-8">
                <p className="font-bold mb-4 text-black">CAF</p>
                <div className="space-y-2">
                  <p className="text-slate-600">Fait à ________</p>
                  <p className="text-slate-600">le ___/___/____</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto flex justify-between items-center text-xs text-black border-t-2 border-orange-500 pt-4">
            <span className="font-semibold">CIH BANK</span>
            <span>Page {idx + 4} / {Math.ceil((hierarchy.children?.length || 0) + 3)}</span>
          </div>
        </div>
      ))}

      {/* CSS for printing */}
      <style jsx>{`
        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .page-break {
            page-break-after: always;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}
