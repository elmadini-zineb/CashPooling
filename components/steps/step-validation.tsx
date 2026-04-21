"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Account, HierarchicalAccount, InvestmentConfig, NotionalPoolingConfig, PricingConfig, PeriodicityType, PeriodicityUnit } from "@/lib/types"
import { HierarchyManager } from "@/lib/hierarchy-manager"
import { AlertCircle, CheckCircle2, Shield, TrendingUp, Clock, Layers, CreditCard } from "lucide-react"
import { HierarchyVisualizer } from "@/components/hierarchy-visualizer"
import { formatSchedulingFrequency, formatContractPeriodicity } from "@/lib/format-helpers"

interface StepValidationProps {
  centralizerAccount: Account
  hierarchy: HierarchicalAccount
  investmentConfig: InvestmentConfig | null
  notionalConfig: NotionalPoolingConfig | null
  pricingConfig?: PricingConfig | null
  periodicityType?: PeriodicityType
  periodicityFrequency?: number
  periodicityUnit?: PeriodicityUnit
  periodicityExecutionTime?: string
  onComplete: () => void
  onBack: () => void
  validationErrors: string[]
}

export function StepValidation({
  centralizerAccount,
  hierarchy,
  investmentConfig,
  notionalConfig,
  pricingConfig,
  periodicityType,
  periodicityFrequency,
  periodicityUnit,
  periodicityExecutionTime,
  onComplete,
  onBack,
  validationErrors,
}: StepValidationProps) {
  const poolableAccounts = HierarchyManager.flattenToPoolableAccounts(hierarchy)
  const accountCounts = HierarchyManager.getAccountCountByRole(hierarchy)
  const depth = HierarchyManager.getDepth(hierarchy)

  const debitCoverageAccounts = poolableAccounts.filter((config) => config.debitCoverage?.enabled)

  return (
    <div className="space-y-6">
      {validationErrors.length === 0 ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            Validation réussie - La configuration est conforme aux règles métier
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            <strong>Erreurs de validation:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
        <CardTitle>Étape 4: Validation et récapitulatif</CardTitle>
        <CardDescription>Vérifiez la configuration avant de générer le contrat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
              <p className="text-sm text-cyan-700 font-medium">Centralisateur</p>
              <p className="text-2xl font-bold text-cyan-900">{accountCounts.centralizer}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-orange-700 font-medium">Intermédiaires</p>
              <p className="text-2xl font-bold text-orange-900">{accountCounts.intermediate}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-700 font-medium">Secondaires</p>
              <p className="text-2xl font-bold text-slate-900">{accountCounts.secondary}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700 font-medium">À niveler</p>
              <p className="text-2xl font-bold text-green-900">{poolableAccounts.length}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Couverture
              </p>
              <p className="text-2xl font-bold text-blue-900">{debitCoverageAccounts.length}</p>
            </div>
            <div
              className={`rounded-lg p-4 border ${notionalConfig?.enabled ? "bg-purple-50 border-purple-200" : "bg-slate-50 border-slate-200"}`}
            >
              <p
                className={`text-sm font-medium flex items-center gap-1 ${notionalConfig?.enabled ? "text-purple-700" : "text-slate-500"}`}
              >
                <Layers className="w-3 h-3" />
                Notionnel
              </p>
              <p className={`text-2xl font-bold ${notionalConfig?.enabled ? "text-purple-900" : "text-slate-400"}`}>
                {notionalConfig?.enabled ? "Oui" : "Non"}
              </p>
            </div>
          </div>

          {/* Centralizer Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Compte Centralisateur</h3>
            <div className="bg-gradient-to-r from-cyan-50 to-orange-50 border border-cyan-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-medium text-slate-900">{centralizerAccount.accountNumber}</p>
                  <p className="text-sm text-slate-700 mt-1">{centralizerAccount.clientName}</p>
                  <p className="text-xs text-slate-500 mt-1">{centralizerAccount.accountType}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-900">
                    {centralizerAccount.balance.toLocaleString("fr-FR")} {centralizerAccount.currency}
                  </p>
                  <Badge className="mt-1 bg-green-100 text-green-700 border-green-300">
                    {centralizerAccount.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {notionalConfig?.enabled && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                Cash Pooling Notionnel
              </h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-purple-700 font-medium">Compte Miroir Virtuel</p>
                    <p className="text-lg font-mono font-semibold text-purple-900">
                      {notionalConfig.virtualMirrorAccountNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-700 font-medium">Comptes consolidés</p>
                    <p className="text-lg font-semibold text-purple-900">{poolableAccounts.length} comptes</p>
                  </div>
                  <div className="col-span-2">
                    <Badge
                      variant={notionalConfig.allowOperationsOnConsolidated ? "default" : "outline"}
                      className="bg-purple-100 text-purple-700 border-purple-300"
                    >
                      {notionalConfig.allowOperationsOnConsolidated
                        ? "Opérations autorisées sur solde consolidé"
                        : "Opérations non autorisées sur solde consolidé"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <p className="text-sm text-purple-700">
                    Les soldes créditeurs et débiteurs seront compensés virtuellement sans mouvement réel de fonds. La
                    consolidation s'effectue en temps réel.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hierarchy Visualization */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Structure hiérarchique (Profondeur: {depth} niveaux)</h3>
            <HierarchyVisualizer hierarchy={hierarchy} />
          </div>

          {/* Pooling Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Configuration du nivellement</h3>
            <div className="space-y-2">
              {poolableAccounts.map((config) => (
                <div key={config.accountId} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-mono text-sm font-medium text-slate-900">{config.account.accountNumber}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{config.account.clientName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {config.mode}
                      </Badge>
                      {config.mode === "TBA" && config.targetBalance !== undefined && (
                        <span className="text-xs text-slate-600">Cible: {config.targetBalance} MAD</span>
                      )}
                      {config.mode === "FBA" && (
                        <span className="text-xs text-slate-600">
                          [{config.minBalance} - {config.maxBalance}] MAD
                        </span>
                      )}
                      {config.debitCoverage?.enabled && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Priorité {config.debitCoverage.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Configuration Summary */}
          {investmentConfig?.enabled && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-600" />
                Placement OPCVM Automatique
              </h3>
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-cyan-700 font-medium">Seuil d'excédent</p>
                    <p className="text-lg font-semibold text-cyan-900">
                      {investmentConfig.surplusThreshold.toLocaleString("fr-FR")} {centralizerAccount.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-cyan-700 font-medium">Mode de placement</p>
                    <p className="text-lg font-semibold text-cyan-900">
                      {investmentConfig.investmentMode === "total"
                        ? "Total"
                        : `Partiel (${investmentConfig.investmentQuota}%)`}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-cyan-700 font-medium">OPCVM cible</p>
                    <p className="text-sm font-semibold text-cyan-900 mt-1">{investmentConfig.opcvmFund?.name}</p>
                    <p className="text-xs text-cyan-600">
                      {investmentConfig.opcvmFund?.fundType} - Min:{" "}
                      {investmentConfig.opcvmFund?.minInvestment.toLocaleString("fr-FR")}{" "}
                      {investmentConfig.opcvmFund?.currency}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-cyan-700 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Fréquence d'exécution
                    </p>
                    <p className="text-sm font-semibold text-cyan-900 mt-1">
                      {formatSchedulingFrequency(investmentConfig.scheduling)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Badge variant={investmentConfig.autoRedemptionEnabled ? "default" : "outline"} className="mt-2">
                      {investmentConfig.autoRedemptionEnabled
                        ? "Rachat automatique activé"
                        : "Rachat automatique désactivé"}
                    </Badge>
                  </div>
                </div>
              </div>

            </div>
          )}

          {periodicityType && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Périodicité d'exécution</p>
              <p className="text-sm font-semibold text-slate-900 mt-2">
                {formatContractPeriodicity(periodicityType, periodicityFrequency, periodicityUnit, periodicityExecutionTime)}
              </p>
            </div>
          )}

          {/* Pricing Configuration Summary */}
          {pricingConfig?.type && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Tarification
              </h3>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-emerald-700 font-medium">Type de tarification</p>
                    <p className="text-lg font-semibold text-emerald-900 capitalize">
                      {pricingConfig.type === "fixed"
                        ? "Fixe"
                        : pricingConfig.type === "variable"
                          ? "Variable"
                          : "Hybride"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-700 font-medium">Périodicité de facturation</p>
                    <p className="text-lg font-semibold text-emerald-900">
                      {pricingConfig.billingFrequency === "monthly"
                        ? "Mensuelle"
                        : pricingConfig.billingFrequency === "quarterly"
                          ? "Trimestrielle"
                          : "Annuelle"}
                    </p>
                  </div>

                  {pricingConfig.type === "fixed" && (
                    <>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Frais d'ouverture</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {pricingConfig.openingFees?.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Abonnement mensuel</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {pricingConfig.monthlySubscription?.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-emerald-700 font-medium">Frais de génération du contrat</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {pricingConfig.contractGenerationFees?.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                    </>
                  )}

                  {pricingConfig.type === "variable" && (
                    <>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Taux sur montant nivelé</p>
                        <p className="text-lg font-semibold text-emerald-900">{pricingConfig.leveledAmountRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Frais par opération</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {pricingConfig.levelingOperationFees?.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-emerald-700 font-medium">Frais par compte secondaire/mois</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {pricingConfig.secondaryAccountFees?.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                    </>
                  )}

                  {pricingConfig.type === "hybrid" && (
                    <>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Abonnement mensuel fixe</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {pricingConfig.monthlyBase?.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Frais d'ouverture</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {pricingConfig.hybridOpeningFees?.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Comptes inclus au forfait</p>
                        <p className="text-lg font-semibold text-emerald-900">{pricingConfig.accountsIncluded}</p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Taux sur montant nivelé</p>
                        <p className="text-lg font-semibold text-emerald-900">{pricingConfig.hybridLeveledAmountRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Seuil de déclenchement</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {pricingConfig.variableTriggerThreshold?.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Frais compte secondaire supplémentaire</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {pricingConfig.hybridSecondaryAccountFees?.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Debit Coverage Section */}
          {debitCoverageAccounts.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Couverture automatique des soldes débiteurs
              </h3>
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800 text-sm">
                  {debitCoverageAccounts.length} compte(s) bénéficient d'une couverture automatique en cas de solde
                  débiteur. Les comptes seront traités par ordre de priorité avant le nivellement standard.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                {debitCoverageAccounts
                  .sort((a, b) => (a.debitCoverage!.priority || 999) - (b.debitCoverage!.priority || 999))
                  .map((config) => (
                    <div
                      key={config.accountId}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-mono text-sm font-medium text-slate-900">{config.account.accountNumber}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{config.account.clientName}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Badge variant="outline" className="bg-white">
                          Priorité {config.debitCoverage!.priority}
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          {config.debitCoverage!.mode === "full" ? "Couverture totale" : "Couverture partielle"}
                        </Badge>
                        {config.debitCoverage!.minCoverageAmount && (
                          <span className="text-xs text-slate-600">
                            Min: {config.debitCoverage!.minCoverageAmount} MAD
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={onBack} variant="outline" size="lg">
              Retour
            </Button>
            <Button onClick={onComplete} disabled={validationErrors.length > 0} size="lg" className="flex-1">
              Générer le contrat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
