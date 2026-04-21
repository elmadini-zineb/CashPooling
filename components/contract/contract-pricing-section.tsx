'use client'

import type { PricingConfig, AdriaModularPricing } from "@/lib/types"

interface ContractPricingSectionProps {
  pricingConfig?: PricingConfig
  adriaPricing?: AdriaModularPricing
  currency: string
  formatAmount: (amount: number) => string
}

export function ContractPricingSection({
  pricingConfig,
  adriaPricing,
  currency,
  formatAmount,
}: ContractPricingSectionProps) {
  // MVP simple pricing report
  if (pricingConfig?.type === "fixed" && !pricingConfig.sourceType) {
    return (
      <div className="w-full mb-8">
        <h3 className="text-sm font-bold text-black mb-4">Tarification appliquée</h3>

        <div className="overflow-hidden rounded border border-slate-300">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-orange-600 text-white">
                <th className="p-3 text-left">Élément</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-right">Montant ({currency})</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-orange-50 border-b border-slate-200">
                <td className="p-3 font-semibold text-black">Mode de tarification</td>
                <td className="p-3 text-slate-700">Report simple (EBICS)</td>
                <td className="p-3 text-right font-semibold text-slate-900">-</td>
              </tr>
              <tr className="bg-white border-b border-slate-200">
                <td className="p-3 font-semibold text-black">Frais d'ouverture</td>
                <td className="p-3 text-slate-700">Montant fixe d'entrée</td>
                <td className="p-3 text-right font-semibold text-slate-900">{formatAmount(pricingConfig.openingFees || 0)}</td>
              </tr>
              <tr className="bg-orange-50 border-b border-slate-200">
                <td className="p-3 font-semibold text-black">Abonnement mensuel</td>
                <td className="p-3 text-slate-700">Prix standard mensuel</td>
                <td className="p-3 text-right font-semibold text-slate-900">{formatAmount(pricingConfig.monthlySubscription || 0)}</td>
              </tr>
              <tr className="bg-white border-slate-200">
                <td className="p-3 font-semibold text-black">Frais du contrat</td>
                <td className="p-3 text-slate-700">Frais de génération du contrat</td>
                <td className="p-3 text-right font-semibold text-slate-900">{formatAmount(pricingConfig.contractGenerationFees || 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
          <p>Note: Ce contrat utilise une tarification simple, sans configuration tarifaire avancée. Les montants sont exprimés dans la devise du compte centralisateur.</p>
        </div>
      </div>
    )
  }

  // Case 1: Tarification standard Adria
  if (pricingConfig?.sourceType === "adria" && adriaPricing) {
    const baseFee = adriaPricing.basePricing?.fixedFee || 0
    const accountBrackets = adriaPricing.basePricing?.accountCountBrackets || []
    const operationPricings = adriaPricing.operationPricings || []
    const levelingPricings = adriaPricing.levelingModePricings || []

    // Calcul du coût par nombre de comptes (exemple: 5 comptes)
    let accountTierCost = 0
    if (accountBrackets.length > 0 && accountBrackets[0].isActive) {
      accountTierCost = accountBrackets[0].feePerAccount * 5 // 5 comptes par défaut
    }

    // Coût opérations (moyenne des virements)
    const virementsOp = operationPricings.find(op => op.operationType === "virement" && op.isActive)
    const virementsValue = virementsOp?.value || 0

    // Coût par mode de nivellement (prendre le premier actif ou ZBA)
    const modeZBA = levelingPricings.find(m => m.levelingMode === "ZBA" && m.isActive)
    const modeCost = modeZBA?.value || 0

    const totalMonthly = baseFee + accountTierCost + (virementsValue * 10) + modeCost // 10 virements/mois

    return (
      <div className="w-full mb-8">
        <h3 className="text-sm font-bold text-black mb-4">Tarification appliquée</h3>
        
        <div className="overflow-hidden rounded border border-slate-300">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-orange-600 text-white">
                <th className="p-3 text-left">Type de tarification</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-right">Montant ({currency})</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-orange-50 border-b border-slate-200">
                <td className="p-3 font-semibold text-black">Abonnement fixe</td>
                <td className="p-3 text-slate-700">Tarification mensuelle de base</td>
                <td className="p-3 text-right font-semibold text-slate-900">{formatAmount(baseFee)}</td>
              </tr>
              <tr className="bg-white border-b border-slate-200">
                <td className="p-3 font-semibold text-black">Tarification par comptes</td>
                <td className="p-3 text-slate-700">5 comptes secondaires @ {formatAmount(accountBrackets[0]?.feePerAccount || 0)}/compte</td>
                <td className="p-3 text-right font-semibold text-slate-900">{formatAmount(accountTierCost)}</td>
              </tr>
              <tr className="bg-orange-50 border-b border-slate-200">
                <td className="p-3 font-semibold text-black">Tarification par opération</td>
                <td className="p-3 text-slate-700">Virements (10/mois estimés)</td>
                <td className="p-3 text-right font-semibold text-slate-900">{formatAmount(virementsValue * 10)}</td>
              </tr>
              <tr className="bg-white border-b border-slate-200">
                <td className="p-3 font-semibold text-black">Tarification par mode (ZBA)</td>
                <td className="p-3 text-slate-700">Nivellement quotidien à solde zéro</td>
                <td className="p-3 text-right font-semibold text-slate-900">{formatAmount(modeCost)}</td>
              </tr>
              <tr className="bg-orange-600 text-white">
                <td className="p-3 font-bold">TOTAL MENSUEL</td>
                <td className="p-3"></td>
                <td className="p-3 text-right font-bold text-lg">{formatAmount(totalMonthly)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
          <p>Note: La tarification Adria est modulaire et s'adapte à votre configuration. Les montants affichés sont estimatifs basés sur une utilisation standard (5 comptes, 10 virements/mois).</p>
        </div>
      </div>
    )
  }

  // Case 2: Tarification externe
  if (pricingConfig?.sourceType === "external") {
    return (
      <div className="w-full mb-8">
        <h3 className="text-sm font-bold text-black mb-4">Tarification appliquée</h3>
        
        <div className="overflow-hidden rounded border border-slate-300">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-orange-600 text-white">
                <th className="p-3 text-left">Type de tarification</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-right">Détail</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-orange-50 border-b border-slate-200">
                <td className="p-3 font-semibold text-black">Tarification externe</td>
                <td className="p-3 text-slate-700">Tarification personnalisée - {pricingConfig.externalProviderName || "Moteur externe"}</td>
                <td className="p-3 text-right font-semibold text-slate-900">Voir détails ci-dessous</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 bg-slate-50 p-4 rounded border border-slate-200 text-xs">
          <p className="font-semibold text-black mb-2">Détails de la tarification:</p>
          <ul className="space-y-1 text-slate-700 ml-4">
            <li>• Fournisseur: <span className="font-semibold">{pricingConfig.externalProviderName || "Non spécifié"}</span></li>
            <li>• Type: Tarification dynamique et flexible selon votre moteur</li>
            <li>• Montant: À calculer par le système de tarification externe</li>
            <li>• Conditions: Selon les règles définies par le moteur de tarification</li>
          </ul>
        </div>

        <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
          <p>Note: La tarification est gérée par le système externe {pricingConfig.externalProviderName || "configuré"}. Les détails précis seront fournis selon la configuration de votre moteur de tarification.</p>
        </div>
      </div>
    )
  }

  // No pricing configured
  return (
    <div className="w-full mb-8">
      <h3 className="text-sm font-bold text-black mb-4">Tarification appliquée</h3>
      
      <div className="bg-slate-50 p-4 rounded border border-slate-300 text-xs text-slate-600">
        <p>Aucune tarification n'a été configurée pour ce contrat. Veuillez configurer la tarification dans l'interface Admin.</p>
      </div>
    </div>
  )
}
