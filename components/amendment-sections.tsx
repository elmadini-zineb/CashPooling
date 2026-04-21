"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronDown } from "lucide-react"
import type { CashPoolingContract, Account } from "@/lib/types"

interface AmendmentSectionsProps {
  contract: CashPoolingContract
  modifyPricing: boolean
  modifyLeveling: boolean
  modifyDebitCoverage: boolean
  modifySecondaryAccounts: boolean
  // Pricing state
  billingFrequency: string
  leveledAmountRate: number
  operationFeesZBA: number
  operationFeesTBA: number
  operationFeesFBA: number
  secondaryAccountFees: number
  onPricingChange: (field: string, value: any) => void
  // Leveling state
  levelingModes: any
  onLevelingChange: (modes: any) => void
  levelingErrors: any
  // Debit coverage state
  debitCoverageMode: string
  debitCoveragePriorities: any
  onDebitCoverageChange: (mode: string, priorities?: any) => void
  // Secondary accounts state
  accountsToAdd: Account[]
  accountsToRemove: string[]
  onAccountsChange: (toAdd: Account[], toRemove: string[]) => void
}

export function AmendmentSections({
  contract,
  modifyPricing,
  modifyLeveling,
  modifyDebitCoverage,
  modifySecondaryAccounts,
  billingFrequency,
  leveledAmountRate,
  operationFeesZBA,
  operationFeesTBA,
  operationFeesFBA,
  secondaryAccountFees,
  onPricingChange,
  levelingModes,
  onLevelingChange,
  levelingErrors,
  debitCoverageMode,
  debitCoveragePriorities,
  onDebitCoverageChange,
  accountsToAdd,
  accountsToRemove,
  onAccountsChange,
}: AmendmentSectionsProps) {
  const [expandedSections, setExpandedSections] = useState({
    pricing: true,
    leveling: true,
    coverage: true,
    accounts: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const renderChangeIndicator = (oldValue: any, newValue: any, format: string = "") => {
    if (oldValue === newValue) return null

    let formattedOld = oldValue
    let formattedNew = newValue

    if (format === "percent") {
      formattedOld = `${oldValue}%`
      formattedNew = `${newValue}%`
    } else if (format === "currency") {
      formattedOld = `${oldValue} MAD`
      formattedNew = `${newValue} MAD`
    }

    return (
      <div className="ml-2 inline-flex items-center gap-1 text-sm">
        <span className="line-through text-slate-400">{formattedOld}</span>
        <span className="text-slate-400">→</span>
        <span className="font-semibold text-green-600">{formattedNew}</span>
      </div>
    )
  }

  const originalPricing = contract.pricingConfig || {
    type: "variable",
    billingFrequency: "monthly",
    leveledAmountRate: 0.05,
    levelingOperationFees: 8,
    secondaryAccountFees: 200,
  }

  const CollapsibleSection = ({
    title,
    icon,
    isExpanded,
    onToggle,
    children,
  }: {
    title: string
    icon?: string
    isExpanded: boolean
    onToggle: () => void
    children: React.ReactNode
  }) => (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-medium text-sm text-slate-900 transition-colors"
      >
        <span className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>
      {isExpanded && <div className="p-4 bg-white space-y-4">{children}</div>}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* TARIFICATION */}
      {modifyPricing && (
        <CollapsibleSection
          title="Tarification"
          icon="💰"
          isExpanded={expandedSections.pricing}
          onToggle={() => toggleSection("pricing")}
        >
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Périodicité de facturation</Label>
              <div className="flex items-center gap-3 mt-1.5">
                <select
                  value={billingFrequency}
                  onChange={(e) => onPricingChange("billingFrequency", e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm flex-1"
                >
                  <option value="monthly">Mensuelle</option>
                  <option value="quarterly">Trimestrielle</option>
                  <option value="annual">Annuelle</option>
                </select>
                {renderChangeIndicator(
                  originalPricing.billingFrequency,
                  billingFrequency
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Taux sur montant nivelé</Label>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={leveledAmountRate}
                    onChange={(e) => onPricingChange("leveledAmountRate", Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-slate-600 font-medium">%</span>
                </div>
                {renderChangeIndicator(
                  originalPricing.leveledAmountRate || 0.05,
                  leveledAmountRate,
                  "percent"
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200">
              <p className="text-sm font-semibold text-slate-900">
                Frais par opération de nivellement
              </p>

              <div>
                <Label className="text-sm font-medium">
                  Frais par sweep automatique (MAD)
                </Label>
                <p className="text-xs text-slate-600 mb-1.5">Compte MT Casablanca — mode ZBA</p>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={operationFeesZBA}
                    onChange={(e) => onPricingChange("operationFeesZBA", Number(e.target.value))}
                    className="flex-1"
                  />
                  {renderChangeIndicator(8, operationFeesZBA, "currency")}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Frais par ajustement vers solde cible (MAD)
                </Label>
                <p className="text-xs text-slate-600 mb-1.5">Compte MT Rabat — mode TBA</p>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={operationFeesTBA}
                    onChange={(e) => onPricingChange("operationFeesTBA", Number(e.target.value))}
                    className="flex-1"
                  />
                  {renderChangeIndicator(12, operationFeesTBA, "currency")}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Frais par opération dans la plage (MAD)
                </Label>
                <p className="text-xs text-slate-600 mb-1.5">Compte MT Tanger — mode FBA</p>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={operationFeesFBA}
                    onChange={(e) => onPricingChange("operationFeesFBA", Number(e.target.value))}
                    className="flex-1"
                  />
                  {renderChangeIndicator(6, operationFeesFBA, "currency")}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Frais par compte secondaire/mois</Label>
              <div className="flex items-center gap-3 mt-1.5">
                <Input
                  type="number"
                  value={secondaryAccountFees}
                  onChange={(e) => onPricingChange("secondaryAccountFees", Number(e.target.value))}
                  className="flex-1"
                />
                {renderChangeIndicator(
                  originalPricing.secondaryAccountFees || 200,
                  secondaryAccountFees,
                  "currency"
                )}
              </div>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* NIVELLEMENT */}
      {modifyLeveling && (
        <CollapsibleSection
          title="Mode de nivellement par compte secondaire"
          icon="⚖️"
          isExpanded={expandedSections.leveling}
          onToggle={() => toggleSection("leveling")}
        >
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border border-slate-200">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Compte secondaire</th>
                    <th className="px-4 py-2 text-left font-semibold">Mode actuel</th>
                    <th className="px-4 py-2 text-left font-semibold">Nouveau mode</th>
                    <th className="px-4 py-2 text-left font-semibold">Paramètres</th>
                  </tr>
                </thead>
                <tbody className="border border-t-0 border-slate-200">
                  {/* MT Casablanca - ZBA */}
                  <tr className="border-b border-slate-200">
                    <td className="px-4 py-3">MT Casablanca</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">ZBA</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={levelingModes.casablanca.mode}
                        onChange={(e) => {
                          const newMode = e.target.value as "ZBA" | "TBA" | "FBA"
                          onLevelingChange({
                            ...levelingModes,
                            casablanca: { mode: newMode, params: {} },
                          })
                        }}
                        className="px-3 py-1 border border-slate-300 rounded text-sm"
                      >
                        <option value="ZBA">ZBA</option>
                        <option value="TBA">TBA</option>
                        <option value="FBA">FBA</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">—</td>
                  </tr>

                  {/* MT Rabat - TBA */}
                  <tr className="border-b border-slate-200">
                    <td className="px-4 py-3">MT Rabat</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-green-100 text-green-800 border-green-300">TBA</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={levelingModes.rabat.mode}
                        onChange={(e) => {
                          const newMode = e.target.value as "ZBA" | "TBA" | "FBA"
                          onLevelingChange({
                            ...levelingModes,
                            rabat: {
                              mode: newMode,
                              params:
                                newMode === "TBA"
                                  ? { targetBalance: 500000 }
                                  : newMode === "FBA"
                                    ? { minThreshold: 0, maxThreshold: 0 }
                                    : {},
                            },
                          })
                        }}
                        className="px-3 py-1 border border-slate-300 rounded text-sm"
                      >
                        <option value="ZBA">ZBA</option>
                        <option value="TBA">TBA</option>
                        <option value="FBA">FBA</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {levelingModes.rabat.mode === "TBA" && (
                        <Input
                          type="number"
                          value={levelingModes.rabat.params?.targetBalance || ""}
                          onChange={(e) => {
                            onLevelingChange({
                              ...levelingModes,
                              rabat: {
                                ...levelingModes.rabat,
                                params: { targetBalance: Number(e.target.value) },
                              },
                            })
                          }}
                          placeholder="Solde cible"
                          className="w-32"
                        />
                      )}
                      {levelingModes.rabat.mode === "FBA" && (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={levelingModes.rabat.params?.minThreshold || ""}
                            onChange={(e) => {
                              onLevelingChange({
                                ...levelingModes,
                                rabat: {
                                  ...levelingModes.rabat,
                                  params: {
                                    ...levelingModes.rabat.params,
                                    minThreshold: Number(e.target.value),
                                  },
                                },
                              })
                            }}
                            placeholder="Min"
                            className="w-24"
                          />
                          <Input
                            type="number"
                            value={levelingModes.rabat.params?.maxThreshold || ""}
                            onChange={(e) => {
                              onLevelingChange({
                                ...levelingModes,
                                rabat: {
                                  ...levelingModes.rabat,
                                  params: {
                                    ...levelingModes.rabat.params,
                                    maxThreshold: Number(e.target.value),
                                  },
                                },
                              })
                            }}
                            placeholder="Max"
                            className="w-24"
                          />
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* MT Tanger - FBA */}
                  <tr>
                    <td className="px-4 py-3">MT Tanger</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                        FBA
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={levelingModes.tanger.mode}
                        onChange={(e) => {
                          const newMode = e.target.value as "ZBA" | "TBA" | "FBA"
                          onLevelingChange({
                            ...levelingModes,
                            tanger: {
                              mode: newMode,
                              params:
                                newMode === "FBA"
                                  ? { minThreshold: 100000, maxThreshold: 800000 }
                                  : newMode === "TBA"
                                    ? { targetBalance: 0 }
                                    : {},
                            },
                          })
                        }}
                        className="px-3 py-1 border border-slate-300 rounded text-sm"
                      >
                        <option value="ZBA">ZBA</option>
                        <option value="TBA">TBA</option>
                        <option value="FBA">FBA</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {levelingModes.tanger.mode === "FBA" && (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={levelingModes.tanger.params?.minThreshold || ""}
                            onChange={(e) => {
                              onLevelingChange({
                                ...levelingModes,
                                tanger: {
                                  ...levelingModes.tanger,
                                  params: {
                                    ...levelingModes.tanger.params,
                                    minThreshold: Number(e.target.value),
                                  },
                                },
                              })
                            }}
                            placeholder="Min"
                            className="w-24"
                          />
                          <Input
                            type="number"
                            value={levelingModes.tanger.params?.maxThreshold || ""}
                            onChange={(e) => {
                              onLevelingChange({
                                ...levelingModes,
                                tanger: {
                                  ...levelingModes.tanger,
                                  params: {
                                    ...levelingModes.tanger.params,
                                    maxThreshold: Number(e.target.value),
                                  },
                                },
                              })
                            }}
                            placeholder="Max"
                            className="w-24"
                          />
                        </div>
                      )}
                      {levelingModes.tanger.mode === "TBA" && (
                        <Input
                          type="number"
                          value={levelingModes.tanger.params?.targetBalance || ""}
                          onChange={(e) => {
                            onLevelingChange({
                              ...levelingModes,
                              tanger: {
                                ...levelingModes.tanger,
                                params: { targetBalance: Number(e.target.value) },
                              },
                            })
                          }}
                          placeholder="Solde cible"
                          className="w-32"
                        />
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {levelingErrors && (
              <div className="space-y-2">
                {levelingErrors.rabatTBA && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-700">
                      {levelingErrors.rabatTBA}
                    </AlertDescription>
                  </Alert>
                )}
                {levelingErrors.tangerFBA && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-700">
                      {levelingErrors.tangerFBA}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* COUVERTURE DÉBITRICE */}
      {modifyDebitCoverage && (
        <CollapsibleSection
          title="Couverture débitrice"
          icon="🔒"
          isExpanded={expandedSections.coverage}
          onToggle={() => toggleSection("coverage")}
        >
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Mode de couverture</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => onDebitCoverageChange("full")}
                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                    debitCoverageMode === "full"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-semibold text-sm">Full</div>
                  <p className="text-xs text-slate-600 mt-1">
                    Couverture totale du débit depuis le compte centralisateur
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onDebitCoverageChange("partial")}
                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                    debitCoverageMode === "partial"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-semibold text-sm">Partial</div>
                  <p className="text-xs text-slate-600 mt-1">
                    Couverture sélective par priorité de compte
                  </p>
                </button>
              </div>
            </div>

            {debitCoverageMode === "partial" && (
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <p className="text-sm font-semibold">Priorités par compte</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium w-32">MT Casablanca</Label>
                    <Input
                      type="number"
                      value={debitCoveragePriorities.casablanca.priority}
                      onChange={(e) =>
                        onDebitCoverageChange("partial", {
                          ...debitCoveragePriorities,
                          casablanca: {
                            ...debitCoveragePriorities.casablanca,
                            priority: Number(e.target.value),
                          },
                        })
                      }
                      placeholder="Priorité (1-3)"
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium w-32">MT Rabat</Label>
                    <Input
                      type="number"
                      value={debitCoveragePriorities.rabat.priority}
                      onChange={(e) =>
                        onDebitCoverageChange("partial", {
                          ...debitCoveragePriorities,
                          rabat: {
                            ...debitCoveragePriorities.rabat,
                            priority: Number(e.target.value),
                          },
                        })
                      }
                      placeholder="Priorité (1-3)"
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium w-32">MT Tanger</Label>
                    <Input
                      type="number"
                      value={debitCoveragePriorities.tanger.priority}
                      onChange={(e) =>
                        onDebitCoverageChange("partial", {
                          ...debitCoveragePriorities,
                          tanger: {
                            ...debitCoveragePriorities.tanger,
                            priority: Number(e.target.value),
                          },
                        })
                      }
                      placeholder="Priorité (1-3)"
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* COMPTES SECONDAIRES */}
      {modifySecondaryAccounts && (
        <CollapsibleSection
          title="Comptes secondaires"
          icon="👥"
          isExpanded={expandedSections.accounts}
          onToggle={() => toggleSection("accounts")}
        >
          <div className="space-y-4">
            {accountsToRemove.length > 0 && (
              <div>
                <p className="text-sm font-medium text-red-600 mb-2">Comptes à retirer</p>
                <div className="space-y-1">
                  {accountsToRemove.map((accountId) => {
                    const account = contract.secondaryAccounts.find((a) => a.id === accountId)
                    return (
                      <div
                        key={accountId}
                        className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center justify-between"
                      >
                        <span className="line-through">{account?.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() =>
                            onAccountsChange(
                              accountsToAdd,
                              accountsToRemove.filter((id) => id !== accountId)
                            )
                          }
                          className="text-red-600 hover:text-red-700 font-semibold"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {accountsToAdd.length > 0 && (
              <div>
                <p className="text-sm font-medium text-green-600 mb-2">Comptes à ajouter</p>
                <div className="space-y-1">
                  {accountsToAdd.map((account) => (
                    <div
                      key={account.id}
                      className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-center justify-between"
                    >
                      <span className="font-semibold">{account.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() =>
                          onAccountsChange(
                            accountsToAdd.filter((a) => a.id !== account.id),
                            accountsToRemove
                          )
                        }
                        className="text-green-600 hover:text-green-700 font-semibold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {accountsToRemove.length === 0 && accountsToAdd.length === 0 && (
              <Alert className="bg-slate-50 border-slate-200">
                <AlertDescription className="text-slate-600">
                  Aucune modification de compte pour le moment.
                </AlertDescription>
              </Alert>
            )}

            {accountsToRemove.length === contract.secondaryAccounts.length &&
              accountsToAdd.length === 0 && (
                <Alert className="bg-orange-50 border-orange-200">
                  <AlertDescription className="text-orange-700 font-semibold">
                    ⚠️ La convention doit conserver au minimum un compte secondaire.
                  </AlertDescription>
                </Alert>
              )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  )
}
