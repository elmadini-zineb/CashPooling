"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, Plus, Trash2, AlertCircle } from "lucide-react"
import type { CashPoolingContract, Account } from "@/lib/types"

interface AmendmentSectionsProps {
  contract: CashPoolingContract
  modifyLeveling: boolean
  modifyDebitCoverage: boolean
  modifySecondaryAccounts: boolean
  modifyIntermediateAccounts: boolean
  modifyEndDate: boolean
  newEndDate: Date
  onEndDateChange: (date: Date) => void
  levelingModes: any
  onLevelingChange: (modes: any) => void
  levelingErrors: any
  debitCoverageMode: string
  debitCoveragePriorities: any
  onDebitCoverageChange: (mode: string, priorities?: any) => void
  accountsToAdd: Account[]
  accountsToRemove: string[]
  onAccountsChange: (toAdd: Account[], toRemove: string[]) => void
  intermediateAccountsToAdd: Account[]
  intermediateAccountsToRemove: string[]
  onIntermediateAccountsChange: (toAdd: Account[], toRemove: string[]) => void
}

export function AmendmentSections({
  contract,
  modifyLeveling,
  modifyDebitCoverage,
  modifySecondaryAccounts,
  modifyIntermediateAccounts,
  modifyEndDate,
  newEndDate,
  onEndDateChange,
  levelingModes,
  onLevelingChange,
  levelingErrors,
  debitCoverageMode,
  debitCoveragePriorities,
  onDebitCoverageChange,
  accountsToAdd,
  accountsToRemove,
  onAccountsChange,
  intermediateAccountsToAdd,
  intermediateAccountsToRemove,
  onIntermediateAccountsChange,
}: AmendmentSectionsProps) {
  const [expandedSections, setExpandedSections] = useState({
    leveling: true,
    coverage: true,
    secondaryAccounts: true,
    intermediateAccounts: true,
  })

  const [newSecondaryAccount, setNewSecondaryAccount] = useState<string>("")
  const [newIntermediateAccount, setNewIntermediateAccount] = useState<string>("")
  const [newAccountLevelingMode, setNewAccountLevelingMode] = useState<string>("ZBA")
  const [newAccountDebitPriority, setNewAccountDebitPriority] = useState<boolean>(false)
  const [newAccountDebitPriorityValue, setNewAccountDebitPriorityValue] = useState<string>("1")
  const [newAccountDebitMinAmount, setNewAccountDebitMinAmount] = useState<string>("0")
  const [newAccountIntermediateIds, setNewAccountIntermediateIds] = useState<string[]>([])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const CollapsibleSection = ({
    title,
    icon,
    isExpanded,
    onToggle,
    children,
    error,
  }: {
    title: string
    icon?: string
    isExpanded: boolean
    onToggle: () => void
    children: React.ReactNode
    error?: string
  }) => (
    <div className={`border ${error ? "border-red-200" : "border-slate-200"} rounded-lg overflow-hidden`}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full px-4 py-3 ${error ? "bg-red-50 hover:bg-red-100" : "bg-slate-50 hover:bg-slate-100"} flex items-center justify-between font-medium text-sm ${error ? "text-red-900" : "text-slate-900"} transition-colors`}
      >
        <span className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
          {error && <AlertCircle className="h-4 w-4 ml-2 text-red-600" />}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>
      {isExpanded && (
        <div className="p-4 bg-white space-y-4">
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 ml-2">{error}</AlertDescription>
            </Alert>
          )}
          {children}
        </div>
      )}
    </div>
  )

  // Helper to get all available accounts (secondary accounts)
  const allSecondaryAccounts = contract.secondaryAccounts || []
  const selectedSecondaryAccountIds = new Set([
    ...allSecondaryAccounts.map(a => a.id),
    ...accountsToAdd.map(a => a.id),
    ...accountsToRemove,
  ])

  // Validation for secondary accounts
  const secondaryAccountsError = (() => {
    const totalAccounts = allSecondaryAccounts.filter(a => !accountsToRemove.includes(a.id)).length + accountsToAdd.length
    if (modifySecondaryAccounts && totalAccounts === 0) {
      return "La convention doit conserver au minimum un compte secondaire"
    }
    return undefined
  })()

  // Helper to get all available accounts (intermediate accounts)
  const allIntermediateAccounts = contract.linkedAccountIds?.map(id => ({
    id,
    accountNumber: `ACC-${id}`,
    iban: "—",
    clientName: contract.clientName,
    balance: 0,
  } as Account)) || []

  return (
    <div className="space-y-4">
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
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300">FBA</Badge>
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
                                newMode === "TBA"
                                  ? { targetBalance: 0 }
                                  : newMode === "FBA"
                                    ? { minThreshold: 100000, maxThreshold: 800000 }
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
          </div>
        </CollapsibleSection>
      )}

      {/* COUVERTURE DEBITRICE */}
      {modifyDebitCoverage && (
        <CollapsibleSection
          title="Couverture débitrice et priorités"
          icon="🔐"
          isExpanded={expandedSections.coverage}
          onToggle={() => toggleSection("coverage")}
        >
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Type de couverture</Label>
              <select
                value={debitCoverageMode}
                onChange={(e) => onDebitCoverageChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm mt-1.5"
              >
                <option value="full">Couverture complète (tous les comptes)</option>
                <option value="partial">Couverture partielle (sélective)</option>
              </select>
              <p className="text-xs text-slate-600 mt-2">
                {debitCoverageMode === "full"
                  ? "Tous les comptes secondaires couvriront les débits du compte centralisateur"
                  : "Vous pouvez sélectionner les comptes par ordre de priorité"}
              </p>
            </div>

            {/* Afficher tous les comptes secondaires disponibles */}
            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-semibold text-slate-900">Comptes secondaires</p>
              <div className="space-y-2 bg-slate-50 p-3 rounded-md max-h-48 overflow-y-auto">
                {allSecondaryAccounts.map((account, idx) => (
                  <div key={account.id} className="flex items-center gap-3 p-2 bg-white rounded border border-slate-200">
                    <Badge variant="outline" className="bg-blue-50">
                      {idx + 1}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{account.accountNumber}</p>
                      <p className="text-xs text-slate-600">{account.iban}</p>
                    </div>
                    {debitCoverageMode === "partial" && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={debitCoveragePriorities[account.id]?.priority || idx + 1}
                          onChange={(e) => {
                            const newPriorities = {
                              ...debitCoveragePriorities,
                              [account.id]: {
                                ...debitCoveragePriorities[account.id],
                                priority: Number(e.target.value),
                              },
                            }
                            onDebitCoverageChange(debitCoverageMode, newPriorities)
                          }}
                          className="w-16"
                          placeholder="Priorité"
                        />
                        <Input
                          type="number"
                          value={debitCoveragePriorities[account.id]?.minAmount || 0}
                          onChange={(e) => {
                            const newPriorities = {
                              ...debitCoveragePriorities,
                              [account.id]: {
                                ...debitCoveragePriorities[account.id],
                                minAmount: Number(e.target.value),
                              },
                            }
                            onDebitCoverageChange(debitCoverageMode, newPriorities)
                          }}
                          className="w-24"
                          placeholder="Montant min"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* COMPTES SECONDAIRES */}
      {modifySecondaryAccounts && (
        <CollapsibleSection
          title="Gestion des comptes secondaires"
          icon="🏦"
          isExpanded={expandedSections.secondaryAccounts}
          onToggle={() => toggleSection("secondaryAccounts")}
          error={secondaryAccountsError}
        >
          <div className="space-y-4">
            {/* Comptes existants */}
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Comptes existants</p>
              <div className="space-y-2">
                {allSecondaryAccounts.map((account) => (
                  <div
                    key={account.id}
                    className={`flex items-center gap-3 p-3 border rounded-md ${
                      accountsToRemove.includes(account.id)
                        ? "bg-red-50 border-red-200 opacity-60"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{account.accountNumber}</p>
                      <p className="text-xs text-slate-600">{account.iban}</p>
                    </div>
                    <Button
                      type="button"
                      variant={accountsToRemove.includes(account.id) ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (accountsToRemove.includes(account.id)) {
                          onAccountsChange(
                            accountsToAdd,
                            accountsToRemove.filter(id => id !== account.id)
                          )
                        } else {
                          onAccountsChange(
                            accountsToAdd,
                            [...accountsToRemove, account.id]
                          )
                        }
                      }}
                    >
                      {accountsToRemove.includes(account.id) ? "Restaurer" : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>
              {allSecondaryAccounts.length === 0 && (
                <p className="text-sm text-slate-600 italic">Aucun compte secondaire existant</p>
              )}
            </div>

            {/* Ajouter des comptes avec configuration */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-slate-900 mb-3">Ajouter et configurer des comptes</p>
              
              {/* Form d'ajout */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-md mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Numéro de compte ou IBAN"
                    value={newSecondaryAccount}
                    onChange={(e) => setNewSecondaryAccount(e.target.value)}
                  />
                  <select
                    value={newAccountLevelingMode}
                    onChange={(e) => setNewAccountLevelingMode(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="ZBA">Mode ZBA</option>
                    <option value="TBA">Mode TBA</option>
                    <option value="FBA">Mode FBA</option>
                  </select>
                </div>

                {/* Priorité débitrice */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAccountDebitPriority}
                      onChange={(e) => setNewAccountDebitPriority(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Activer la priorité débitrice</span>
                  </label>
                  {newAccountDebitPriority && (
                    <div className="ml-6 space-y-2">
                      <Input
                        type="number"
                        placeholder="Priorité (1-10)"
                        min="1"
                        max="10"
                        value={newAccountDebitPriorityValue}
                        onChange={(e) => setNewAccountDebitPriorityValue(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Montant minimum"
                        value={newAccountDebitMinAmount}
                        onChange={(e) => setNewAccountDebitMinAmount(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Comptes intermédiaires à rattacher */}
                {allIntermediateAccounts.length > 0 && (
                  <div className="space-y-2 border-t pt-3">
                    <p className="text-sm font-medium text-slate-900">Rattacher à des comptes intermédiaires</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {allIntermediateAccounts.map((intermediateAccount) => (
                        <label key={intermediateAccount.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newAccountIntermediateIds.includes(intermediateAccount.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewAccountIntermediateIds([...newAccountIntermediateIds, intermediateAccount.id])
                              } else {
                                setNewAccountIntermediateIds(newAccountIntermediateIds.filter(id => id !== intermediateAccount.id))
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{intermediateAccount.accountNumber} ({intermediateAccount.iban})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={() => {
                    if (newSecondaryAccount.trim()) {
                      const newAccount: Account = {
                        id: `new-secondary-${Date.now()}`,
                        accountNumber: newSecondaryAccount,
                        iban: "—",
                        clientId: contract.clientId,
                        clientName: contract.clientName,
                        companyName: contract.clientName,
                        balance: 0,
                        currency: "MAD",
                        status: "active",
                        accountType: "secondary",
                        createdAt: new Date(),
                        levelingMode: newAccountLevelingMode,
                        debitPriority: newAccountDebitPriority ? Number(newAccountDebitPriorityValue) : undefined,
                        debitMinAmount: newAccountDebitPriority ? Number(newAccountDebitMinAmount) : undefined,
                        linkedIntermediateAccounts: newAccountIntermediateIds,
                      }
                      onAccountsChange([...accountsToAdd, newAccount], accountsToRemove)
                      setNewSecondaryAccount("")
                      setNewAccountLevelingMode("ZBA")
                      setNewAccountDebitPriority(false)
                      setNewAccountDebitPriorityValue("1")
                      setNewAccountDebitMinAmount("0")
                      setNewAccountIntermediateIds([])
                    }
                  }}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter le compte avec configuration
                </Button>
              </div>

              {/* Afficher les comptes ajoutés avec leur configuration */}
              {accountsToAdd.length > 0 && (
                <div className="space-y-3 bg-green-50 p-4 rounded-md">
                  <p className="text-sm font-semibold text-slate-900">Comptes à ajouter</p>
                  {accountsToAdd.map((account) => (
                    <div key={account.id} className="bg-white rounded border-2 border-green-200 p-3 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{account.accountNumber}</p>
                          <p className="text-xs text-slate-600">Nouveau compte</p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            onAccountsChange(
                              accountsToAdd.filter(a => a.id !== account.id),
                              accountsToRemove
                            )
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Configuration du compte */}
                      <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                        <div>
                          <p className="text-slate-600">Mode de nivellement</p>
                          <p className="font-semibold text-slate-900">{account.levelingMode || "ZBA"}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Priorité débitrice</p>
                          <p className="font-semibold text-slate-900">
                            {account.debitPriority ? `P${account.debitPriority}` : "Aucune"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Montant minimum</p>
                          <p className="font-semibold text-slate-900">
                            {account.debitMinAmount ? `${account.debitMinAmount} DH` : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Comptes intermédiaires rattachés */}
                      {account.linkedIntermediateAccounts && account.linkedIntermediateAccounts.length > 0 && (
                        <div className="p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs font-medium text-slate-900 mb-1">Rattaché à:</p>
                          <div className="flex flex-wrap gap-1">
                            {account.linkedIntermediateAccounts.map((intermediateId) => {
                              const intermediateAccount = allIntermediateAccounts.find(a => a.id === intermediateId)
                              return (
                                <span key={intermediateId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {intermediateAccount?.accountNumber}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* COMPTES INTERMEDIAIRES */}
      {modifyIntermediateAccounts && (
        <CollapsibleSection
          title="Gestion des comptes intermédiaires"
          icon="🔗"
          isExpanded={expandedSections.intermediateAccounts}
          onToggle={() => toggleSection("intermediateAccounts")}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Les comptes intermédiaires sont les comptes liés utilisés pour les opérations de transit ou de compensation.
            </p>

            {/* Comptes existants */}
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Comptes intermédiaires existants</p>
              <div className="space-y-2">
                {allIntermediateAccounts.length > 0 ? (
                  allIntermediateAccounts.map((account) => (
                    <div
                      key={account.id}
                      className={`flex items-center gap-3 p-3 border rounded-md ${
                        intermediateAccountsToRemove.includes(account.id)
                          ? "bg-red-50 border-red-200 opacity-60"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{account.accountNumber}</p>
                        <p className="text-xs text-slate-600">{account.iban}</p>
                      </div>
                      <Button
                        type="button"
                        variant={intermediateAccountsToRemove.includes(account.id) ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (intermediateAccountsToRemove.includes(account.id)) {
                            onIntermediateAccountsChange(
                              intermediateAccountsToAdd,
                              intermediateAccountsToRemove.filter(id => id !== account.id)
                            )
                          } else {
                            onIntermediateAccountsChange(
                              intermediateAccountsToAdd,
                              [...intermediateAccountsToRemove, account.id]
                            )
                          }
                        }}
                      >
                        {intermediateAccountsToRemove.includes(account.id) ? "Restaurer" : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600 italic">Aucun compte intermédiaire existant</p>
                )}
              </div>
            </div>

            {/* Ajouter des comptes */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-slate-900 mb-2">Ajouter des comptes intermédiaires</p>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Numéro de compte ou IBAN"
                  value={newIntermediateAccount}
                  onChange={(e) => setNewIntermediateAccount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (newIntermediateAccount.trim()) {
                      const newAccount: Account = {
                        id: `new-intermediate-${Date.now()}`,
                        accountNumber: newIntermediateAccount,
                        iban: "—",
                        clientId: contract.clientId,
                        clientName: contract.clientName,
                        companyName: contract.clientName,
                        balance: 0,
                        currency: "MAD",
                        status: "active",
                        accountType: "intermediate",
                        createdAt: new Date(),
                      }
                      onIntermediateAccountsChange([...intermediateAccountsToAdd, newAccount], intermediateAccountsToRemove)
                      setNewIntermediateAccount("")
                    }
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </div>
              {intermediateAccountsToAdd.length > 0 && (
                <div className="space-y-2 bg-green-50 p-3 rounded-md">
                  {intermediateAccountsToAdd.map((account) => (
                    <div key={account.id} className="flex items-center gap-3 p-2 bg-white rounded border border-green-200">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{account.accountNumber}</p>
                        <p className="text-xs text-slate-600">Nouveau compte</p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          onIntermediateAccountsChange(
                            intermediateAccountsToAdd.filter(a => a.id !== account.id),
                            intermediateAccountsToRemove
                          )
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* End Date Section */}
      {modifyEndDate && (
        <CollapsibleSection title="Date de fin de la convention" icon="📅">
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                La date de fin de la convention sera modifiée à partir de la date effective de l&apos;avenant.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              {/* Current End Date */}
              <div>
                <Label className="text-sm font-medium">Date actuelle</Label>
                <div className="mt-2 p-3 bg-slate-100 rounded-lg">
                  <p className="text-sm font-semibold">
                    {contract.endDate.toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* New End Date */}
              <div>
                <Label htmlFor="end-date" className="text-sm font-medium">
                  Nouvelle date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newEndDate instanceof Date ? newEndDate.toISOString().split("T")[0] : ""}
                  onChange={(e) => onEndDateChange(new Date(e.target.value))}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Comparison Badge */}
            {newEndDate !== contract.endDate && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  +{Math.ceil((new Date(newEndDate).getTime() - contract.endDate.getTime()) / (1000 * 60 * 60 * 24))} jours
                </Badge>
                <p className="text-sm text-green-700">
                  Durée supplémentaire
                </p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  )
}
