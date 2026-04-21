"use client"

import React, { useState } from "react"
import type { CashPoolingContract, HierarchicalAccount, Amendment } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, CheckCircle } from "lucide-react"

interface ContractPDFPreviewProps {
  contract: CashPoolingContract
  hierarchy: HierarchicalAccount | null
  onBack: () => void
}

export function ContractPDFPreview({
  contract,
  hierarchy,
  onBack,
}: ContractPDFPreviewProps) {
  // Optionally render an amendment preview when `amendment` prop is passed
  // Backwards compatible: if not provided, behave as before
}

export function AmendmentPDFPreview({ contract, amendment, onBack }: { contract: CashPoolingContract; amendment: Amendment; onBack: () => void }) {
  const [isSending, setIsSending] = useState(false)
  const formatDate = (d: Date) => new Date(d).toLocaleDateString("fr-FR")
  const handleGenerateAndSend = async () => {
    setIsSending(true)
    try {
      const { updateAmendmentStatus, addAuditLog } = await import("@/lib/mock-data")
      // Mark as generated -> pending_signature
      updateAmendmentStatus(amendment.id, "generated")
      updateAmendmentStatus(amendment.id, "pending_signature")
      addAuditLog({
        id: `audit-${Date.now()}`,
        entityType: "amendment",
        entityId: amendment.id,
        action: `Avenant ${amendment.amendmentNumber} généré et envoyé`,
        userEmail: "adria@admin.com",
        details: {},
        createdAt: new Date(),
      })
      alert("Avenant généré et envoyé pour signature.")
      onBack()
    } catch (e) {
      console.error(e)
      alert("Erreur lors de l'envoi de l'avenant")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded shadow-sm max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="w-12 h-12 bg-orange-600 text-white flex items-center justify-center font-bold rounded">AD</div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">AVENANT — {amendment.amendmentNumber}</h2>
          <div className="text-sm text-slate-600">Date : {formatDate(amendment.createdAt)}</div>
        </div>
        <div className="text-right text-sm text-slate-600">
          <div>Réf. Convention : {amendment.conventionReference}</div>
          <div>Effective : {formatDate(amendment.effectiveDate)}</div>
        </div>
      </div>

      {/* Tableau des modifications (ex: tarification) */}
      <div className="mb-6">
        <h3 className="font-semibold">Tableau des modifications</h3>
        <table className="w-full text-sm mt-2 border-collapse">
          <thead>
            <tr className="text-left text-xs text-slate-700">
              <th className="p-2">Champ</th>
              <th className="p-2">Ancienne valeur</th>
              <th className="p-2">Nouvelle valeur</th>
            </tr>
          </thead>
          <tbody>
            {/* Example: pricing changes - render only changed fields */}
            {Object.keys(amendment.previousPricingConfig || {}).map((key) => {
              // @ts-ignore
              const oldVal = amendment.previousPricingConfig?.[key]
              // @ts-ignore
              const newVal = amendment.newPricingConfig?.[key]
              if (JSON.stringify(oldVal) === JSON.stringify(newVal)) return null
              return (
                <tr key={key} className="align-top">
                  <td className="p-2 font-medium text-slate-700">{key}</td>
                  <td className="p-2 text-red-600 line-through">{String(oldVal)}</td>
                  <td className="p-2 text-green-700 font-semibold">{String(newVal)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Date d'effet en évidence */}
      <div className="mb-6 p-4 bg-slate-50 border-l-4 border-orange-600">
        <div className="text-sm text-slate-600">Date d'effet</div>
        <div className="text-xl font-bold text-orange-600">{formatDate(amendment.effectiveDate)}</div>
      </div>

      {/* Zones de signature */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="border p-4 text-center">
          <div className="text-xs text-slate-500">Signature client</div>
          <div className="h-16 mt-4 border-t border-slate-300" />
        </div>
        <div className="border p-4 text-center">
          <div className="text-xs text-slate-500">Responsable banque</div>
          <div className="h-16 mt-4 border-t border-slate-300" />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Modifier encore</Button>
        <Button onClick={handleGenerateAndSend} className="bg-blue-600 hover:bg-blue-700" disabled={isSending}>{isSending ? "Envoi..." : "Générer et envoyer l'avenant"}</Button>
      </div>
    </div>
  )
}
  const [isDownloading, setIsDownloading] = useState(false)
  const contractRef = React.useRef<HTMLDivElement>(null)

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + " %"
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "registered":
        return "bg-slate-100 text-slate-800"
      case "suspended":
        return "bg-orange-100 text-orange-800"
      case "terminated":
      case "closed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      console.log('[v0] PDF download initiated for contract:', contract.contractNumber)
      const { generateContractPDF } = await import('@/lib/contract-pdf-generator')
      await generateContractPDF(contract)
      console.log('[v0] PDF download completed')
    } catch (error) {
      console.error('[v0] PDF download error:', error)
      alert('Erreur lors de la génération du PDF. Consultez la console pour plus de détails.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Floating Action Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm">
        <Button onClick={onBack} variant="outline" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            size="sm"
            className="gap-2 bg-orange-600 hover:bg-orange-700"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? "Génération..." : "Télécharger en PDF"}
          </Button>
          <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4" />
            Activer le contrat
          </Button>
        </div>
      </div>

      {/* Contract Preview */}
      <div
        ref={contractRef}
        className="bg-white p-12 space-y-8 text-sm"
        style={{ maxWidth: "1000px", margin: "0 auto" }}
      >
        {/* ===== PAGE 1: IDENTIFICATION & STRUCTURE ===== */}
        <div className="space-y-8 min-h-screen">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-300 pb-6">
            <div>
            <div className="w-12 h-12 bg-orange-600 text-white flex items-center justify-center font-bold rounded">
              ADRIA
            </div>
            </div>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold">CONVENTION DE CASH POOLING</h1>
              <div className="mt-2 flex justify-center gap-2">
                <Badge className={getStatusColor(contract.status)}>
                  {contract.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p className="font-mono font-bold">CP-{contract.contractNumber}</p>
              <p>{new Date(contract.createdAt).toLocaleDateString("fr-FR")}</p>
            </div>
          </div>

          {/* Section 1: Identification Client */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white bg-orange-600 p-3 rounded">
              SECTION 1 — IDENTIFICATION CLIENT
            </h2>
            <div className="bg-slate-50 p-6 rounded border-l-4 border-orange-600 space-y-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-semibold text-slate-600">Numéro tiers</p>
                  <p className="font-mono">{contract.clientId}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">Intitulé</p>
                  <p>{contract.clientName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">Nombre de comptes</p>
                  <p>{1 + contract.secondaryAccounts.length}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">Compte de tarification</p>
                  <p className="font-mono text-xs">
                    {contract.masterAccount?.iban || "FR76..."}
                  </p>
                  <p className="text-xs">{contract.masterAccount?.clientName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">Adresse</p>
                  <p className="text-xs">Adresse du client</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">Agence client</p>
                  <p>76501</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Comptes au sein de la structure */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white bg-orange-600 p-3 rounded">
              SECTION 2 — COMPTES AU SEIN DE LA STRUCTURE
            </h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-orange-600 text-white">
                  <th className="border border-orange-600 p-2 text-left">Numéro de compte (IBAN)</th>
                  <th className="border border-orange-600 p-2 text-left">Intitulé</th>
                  <th className="border border-orange-600 p-2 text-left">Rôle</th>
                  <th className="border border-orange-600 p-2 text-left">Mode de nivellement</th>
                  <th className="border border-orange-600 p-2 text-left">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white hover:bg-slate-50">
                  <td className="border border-slate-300 p-2 font-mono text-xs">
                    {contract.masterAccount?.iban}
                  </td>
                  <td className="border border-slate-300 p-2">{contract.masterAccount?.clientName}</td>
                  <td className="border border-slate-300 p-2">
                    <Badge className="bg-orange-100 text-orange-800 text-xs">Centralisateur</Badge>
                  </td>
                  <td className="border border-slate-300 p-2">—</td>
                  <td className="border border-slate-300 p-2">
                    <Badge className="bg-green-100 text-green-800 text-xs">Actif</Badge>
                  </td>
                </tr>
                {contract.secondaryAccounts.map((acc, idx) => {
                  const modes = ["ZBA", "TBA", "FBA", ""]
                  return (
                    <tr key={acc.id} className="bg-white hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 font-mono text-xs">
                        {acc.iban}
                      </td>
                      <td className="border border-slate-300 p-2">{acc.clientName}</td>
                      <td className="border border-slate-300 p-2">
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          Secondaire
                        </Badge>
                      </td>
                      <td className="border border-slate-300 p-2">{modes[idx % modes.length]}</td>
                      <td className="border border-slate-300 p-2">
                        <Badge className="bg-green-100 text-green-800 text-xs">Actif</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="text-right text-xs text-slate-500 border-t pt-4 mt-12">
            Page 1 / 6
          </div>
        </div>

        {/* ===== PAGE BREAK ===== */}
        <div className="page-break h-12"></div>

        {/* ===== PAGE 2: PARAMÈTRES & TARIFICATION ===== */}
        <div className="space-y-8 min-h-screen">
          {/* Section 3: Paramètres de nivellement */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white bg-orange-600 p-3 rounded">
              SECTION 3 — PARAMÈTRES DE NIVELLEMENT
            </h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-orange-600 text-white">
                  <th className="border border-orange-600 p-2 text-left">Compte (IBAN)</th>
                  <th className="border border-orange-600 p-2 text-left">Mode</th>
                  <th className="border border-orange-600 p-2 text-left">Paramètres</th>
                  <th className="border border-orange-600 p-2 text-left">Couverture</th>
                  <th className="border border-orange-600 p-2 text-left">Priorité</th>
                </tr>
              </thead>
              <tbody>
                {contract.secondaryAccounts.map((acc, idx) => {
                  const modes = ["ZBA", "TBA", "FBA"]
                  const thresholds = [
                    "Solde cible : 0,00 MAD",
                    "Solde cible : 50 000,00 MAD",
                    "Seuil min : 10 000,00 MAD / Seuil max : 100 000,00 MAD",
                  ]
                  const coverages = ["Full", "Partial", "Full"]
                  return (
                    <tr key={acc.id} className="bg-white hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 font-mono text-xs">
                        {acc.iban}
                      </td>
                      <td className="border border-slate-300 p-2">{modes[idx % modes.length]}</td>
                      <td className="border border-slate-300 p-2">{thresholds[idx % thresholds.length]}</td>
                      <td className="border border-slate-300 p-2">{coverages[idx % coverages.length]}</td>
                      <td className="border border-slate-300 p-2 font-semibold">{idx + 1}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Section 4: Tarification */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white bg-orange-600 p-3 rounded">
              SECTION 4 — TARIFICATION
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Left Card */}
              <div className="bg-slate-50 p-4 rounded border-l-4 border-orange-600">
                <p className="font-semibold text-slate-700 mb-3">Mode & Compte de tarification</p>
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="font-semibold text-slate-600">Mode de tarification</p>
                    <p>Report simple (EBICS)</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Compte de tarification</p>
                    <p className="font-mono">{contract.masterAccount?.iban}</p>
                    <p className="text-slate-600">{contract.masterAccount?.clientName}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Devise</p>
                    <p>{contract.currency}</p>
                  </div>
                </div>
              </div>

              {/* Right Card */}
              <div className="bg-slate-50 p-4 rounded border-l-4 border-orange-600">
                <p className="font-semibold text-slate-700 mb-3">Détail de la tarification</p>
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="font-semibold text-slate-600">Frais d'ouverture</p>
                    <p className="ml-2">{contract.pricingConfig?.openingFees?.toLocaleString("fr-FR") || "0,00"} {contract.currency}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Abonnement mensuel</p>
                    <p className="ml-2">{contract.pricingConfig?.monthlySubscription?.toLocaleString("fr-FR") || "0,00"} {contract.currency}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Frais de contrat</p>
                    <p className="ml-2">{contract.pricingConfig?.contractGenerationFees?.toLocaleString("fr-FR") || "0,00"} {contract.currency}</p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-600 bg-white p-3 rounded border border-slate-200">
                  <p>Note: Ce contrat utilise la tarification simple standard. Les montants sont exprimés dans la devise du compte centralisateur.</p>
                </div>
              </div>
                    <p className="ml-2">ZBA : 200,00 MAD | TBA : 0,30 % | FBA : 0,15 %</p>
                  </div>
                  <div className="bg-orange-50 p-2 rounded border border-orange-200">
                    <p className="font-semibold text-slate-600">Remise appliquée</p>
                    <p className="text-blue-700 font-semibold">10 % — Remise fidélité</p>
                    <p className="text-green-700 font-semibold">− 50,00 MAD</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 border-t pt-4 mt-12">
            Page 2 / 6
          </div>
        </div>

        {/* ===== PAGE BREAK ===== */}
        <div className="page-break h-12"></div>

        {/* ===== PAGE 3: OPCVM PLACEMENT ===== */}
        <div className="space-y-8 min-h-screen">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white bg-orange-600 p-3 rounded">
              SECTION 5 — PLACEMENT OPCVM
            </h2>
            {contract.investmentConfig?.enabled ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded border-l-4 border-orange-600">
                    <p className="font-semibold text-slate-700 mb-3">Configuration générale</p>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="font-semibold text-slate-600">Mode de placement</p>
                        <p className="capitalize">
                          {contract.investmentConfig.investmentMode === "total" ? "Total" : "Partiel"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-600">Seuil d'excédent</p>
                        <p className="font-mono">{formatAmount(contract.investmentConfig.surplusThreshold)} {contract.currency}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-600">Quota de placement</p>
                        <p>{contract.investmentConfig.investmentQuota}%</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-600">Rachat automatique</p>
                        <p>{contract.investmentConfig.autoRedemptionEnabled ? "Activé" : "Désactivé"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded border-l-4 border-orange-600">
                    <p className="font-semibold text-slate-700 mb-3">OPCVM sélectionné</p>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="font-semibold text-slate-600">Dénomination</p>
                        <p>{contract.investmentConfig.opcvmFund?.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-600">Code ISIN</p>
                        <p className="font-mono">{contract.investmentConfig.opcvmFund?.isin || "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-600">Type de fonds</p>
                        <p>{contract.investmentConfig.opcvmFund?.fundType || "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-600">Devise</p>
                        <p>{contract.investmentConfig.opcvmFund?.currency || contract.currency}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded border border-orange-200">
                  <p className="font-semibold text-slate-700 mb-2">Conditions de placement</p>
                  <ul className="text-xs text-slate-600 space-y-1 ml-4 list-disc">
                    <li>Les placements sont effectués automatiquement quand le solde du compte centralisateur dépasse le seuil d'excédent</li>
                    <li>Les ordres de souscription sont générés selon la fréquence de programmation définie</li>
                    <li>Le rachat automatique est {contract.investmentConfig.autoRedemptionEnabled ? "activé" : "désactivé"} pour les besoins de liquidités</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded border-l-4 border-orange-600">
                <p className="text-sm text-slate-600">Aucun placement OPCVM n'a été configuré pour cette convention.</p>
              </div>
            )}
          </div>

          <div className="text-right text-xs text-slate-500 border-t pt-4 mt-12">
            Page 3 / 6
          </div>
        </div>

        {/* ===== PAGE BREAK ===== */}
        <div className="page-break h-12"></div>

        {/* ===== PAGE 4: PLAFONDS & SEUILS ===== */}
        <div className="space-y-8 min-h-screen">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white bg-orange-600 p-3 rounded">
              SECTION 6 — PLAFONDS & SEUILS DES OPÉRATIONS
            </h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-orange-600 text-white">
                  <th className="border border-orange-600 p-2 text-left">Opération</th>
                  <th colSpan={3} className="border border-orange-600 p-2 text-center">
                    Web
                  </th>
                  <th colSpan={3} className="border border-orange-600 p-2 text-center">
                    Mobile
                  </th>
                </tr>
                <tr className="bg-orange-600 text-white">
                  <th className="border border-orange-600 p-2"></th>
                  <th className="border border-orange-600 p-2 text-center">Min</th>
                  <th className="border border-orange-600 p-2 text-center">Max</th>
                  <th className="border border-orange-600 p-2 text-center">Nb/jour</th>
                  <th className="border border-orange-600 p-2 text-center">Min</th>
                  <th className="border border-orange-600 p-2 text-center">Max</th>
                  <th className="border border-orange-600 p-2 text-center">Nb/jour</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "Sweep ZBA",
                  "Ajustement TBA",
                  "Opération FBA",
                  "Couverture débitrice",
                  "Placement OPCVM",
                ].map((op) => (
                  <tr key={op} className="bg-white hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 font-semibold">{op}</td>
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
            <div className="text-xs text-slate-600 space-y-1 mt-3 bg-slate-50 p-3 rounded">
              <p>Max demande chéquiers : 999 | Max demande LCN : 999</p>
              <p>Nb Max bénéficiaires domestiques : 999 | Nb Max bénéficiaires MAD : 999</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 border-t pt-4 mt-12">
            Page 4 / 6
          </div>
        </div>

        {/* ===== PAGE BREAK ===== */}
        <div className="page-break h-12"></div>

        {/* ===== PAGE 5+: USER CONTRACTS ===== */}
        <div className="space-y-8 min-h-screen">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white bg-orange-600 p-3 rounded">
              SECTION 7 — PROFILS DES UTILISATEURS HABILITÉS
            </h2>
            <div className="bg-slate-50 p-6 rounded border-l-4 border-orange-600 space-y-4">
              <div className="text-xs space-y-3">
                <p className="text-slate-700 font-semibold">Utilisateurs autorisés à opérer sur les comptes :</p>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-orange-100">
                      <th className="border border-slate-300 p-2 text-left font-semibold">Nom Complet</th>
                      <th className="border border-slate-300 p-2 text-left font-semibold">Email</th>
                      <th className="border border-slate-300 p-2 text-left font-semibold">Profil</th>
                      <th className="border border-slate-300 p-2 text-left font-semibold">Comptes autorisés</th>
                      <th className="border border-slate-300 p-2 text-center font-semibold">Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="border border-slate-300 p-2">À définir</td>
                      <td className="border border-slate-300 p-2">À définir</td>
                      <td className="border border-slate-300 p-2"><Badge className="bg-orange-100 text-orange-800 text-xs">Admin</Badge></td>
                      <td className="border border-slate-300 p-2">Tous les comptes</td>
                      <td className="border border-slate-300 p-2 text-center">_______</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border border-slate-300 p-2">À définir</td>
                      <td className="border border-slate-300 p-2">À définir</td>
                      <td className="border border-slate-300 p-2"><Badge className="bg-orange-100 text-orange-800 text-xs">Opérateur</Badge></td>
                      <td className="border border-slate-300 p-2">Comptes secondaires</td>
                      <td className="border border-slate-300 p-2 text-center">_______</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border border-slate-300 p-2">À définir</td>
                      <td className="border border-slate-300 p-2">À définir</td>
                      <td className="border border-slate-300 p-2"><Badge className="bg-slate-100 text-slate-800 text-xs">Lecteur</Badge></td>
                      <td className="border border-slate-300 p-2">Consultation uniquement</td>
                      <td className="border border-slate-300 p-2 text-center">_______</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-orange-50 p-3 rounded border border-orange-200 text-xs text-slate-700">
                <p className="font-semibold mb-1">Note importante :</p>
                <p>Les noms et emails des utilisateurs autorisés devront être fournis par le client et confirmés lors de la signature du contrat. Chaque utilisateur recevra les accès et credentials de connexion après la mise en production de la convention.</p>
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 border-t pt-4 mt-12">
            Page 5 / 6
          </div>
        </div>

        {/* ===== PAGE BREAK ===== */}
        <div className="page-break h-12"></div>
        <div className="space-y-8 min-h-screen">
          <h2 className="text-lg font-bold text-white bg-orange-600 p-3 rounded">
            SECTION 8 — CONDITIONS GÉNÉRALES & SIGNATURE FINALE
          </h2>

          <div className="bg-slate-50 p-6 rounded border-l-4 border-orange-600 space-y-3 text-sm">
            <p>
              • Je (Nous), soussigné(s), reconnais (sons) avoir pris connaissance des conditions
              générales et déclare (ons) y adhérer sans aucune restriction ni réserve.
            </p>
            <p>
              • A cet effet, je (nous) autorise (ons) la banque à effectuer sur le compte de
              tarification précisé ci-dessus les prélèvements prévus au titre des conditions
              tarifaires du service Cash Pooling.
            </p>
            <p>
              • Je (Nous) mandate (ons) les personnes désignées comme utilisateurs habilités à
              l&apos;effet d&apos;effectuer sur les comptes ci-dessus indiqués les opérations et
              fonctionnalités incluses dans la présente convention. Toute modification ou
              changement doit être dûment notifié à la Banque selon les modalités convenues.
            </p>
            <p>
              • Les conditions particulières et générales relatives au token vous seront remis à la
              livraison.
            </p>
          </div>

          {/* Final Signature Block */}
          <div className="grid grid-cols-3 gap-4 text-xs mt-8">
            <div className="text-center border-t-2 border-slate-400 pt-6">
              <p className="font-semibold mb-2">Signature du représentant légal</p>
              <p className="text-slate-600 text-xs mb-4">Lu et approuvé</p>
              <p className="text-slate-500 mt-4">Fait à .... le ../../......</p>
            </div>
            <div className="text-center border-t-2 border-slate-400 pt-6">
              <p className="font-semibold mb-2">Signature de l&apos;abonné</p>
              <p className="text-slate-600 text-xs mb-4">Lu et approuvé</p>
              <p className="text-slate-500 mt-4">Fait à .... le ../../......</p>
            </div>
            <div className="text-center border-t-2 border-slate-400 pt-6">
              <p className="font-semibold mb-2">Signature et cachet du CAF</p>
              <p className="text-slate-600 text-xs mb-4">Lu et approuvé</p>
              <p className="text-slate-500 mt-4">Fait à .... le ../../......</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 border-t pt-4 mt-12">
            Page 6 / 6
          </div>
        </div>
      </div>
    </div>
  )
}
