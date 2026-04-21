"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import type { Account, HierarchicalAccount, PoolingMode, SecondaryAccountConfig, CoverageMode, NotionalPoolingConfig } from "@/lib/types"
import { HierarchyManager } from "@/lib/hierarchy-manager"
import { Plus, Trash2, AlertCircle, Layers, Info, CreditCard, Calculator } from "lucide-react"

interface HierarchyBuilderProps {
  accounts: Account[]
  centralizerAccount: Account | null
  onHierarchyChange: (hierarchy: HierarchicalAccount | null, isNotional: boolean, notionalConfig: NotionalPoolingConfig | null) => void
}

interface IntermediateNode {
  account: Account
  parentId: string
  isCompensated: boolean
}

interface SecondaryNode {
  account: Account
  parentId: string
  mode: PoolingMode
  targetBalance?: number
  minBalance?: number
  maxBalance?: number
  isActive: boolean
  debitCoverageEnabled: boolean
  debitCoverageMode: CoverageMode
  debitCoveragePriority: number
  debitCoverageMinAmount?: number
}

export function HierarchyBuilder({ accounts, centralizerAccount, onHierarchyChange }: HierarchyBuilderProps) {
  const [intermediates, setIntermediates] = useState<IntermediateNode[]>([])
  const [secondaries, setSecondaries] = useState<SecondaryNode[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isNotionalPooling, setIsNotionalPooling] = useState(false)
  const [allowOperationsOnConsolidated, setAllowOperationsOnConsolidated] = useState(true)

  const availableAccounts = accounts.filter(
    (acc) =>
      acc.id !== centralizerAccount?.id &&
      !intermediates.some((int) => int.account.id === acc.id) &&
      !secondaries.some((sec) => sec.account.id === acc.id),
  )

  const getAvailableParents = () => {
    if (!centralizerAccount) return []
    return [
      { id: centralizerAccount.id, label: `Centralisateur - ${centralizerAccount.accountNumber}`, level: 0 },
      ...intermediates.map((int) => ({
        id: int.account.id,
        label: `Intermédiaire - ${int.account.accountNumber}`,
        level: 1,
      })),
    ]
  }

  const addIntermediate = () => {
    if (!centralizerAccount || availableAccounts.length === 0) return

    setIntermediates([
      ...intermediates,
      {
        account: availableAccounts[0],
        parentId: centralizerAccount.id,
        isCompensated: false,
      },
    ])
  }

  const updateIntermediate = (index: number, updates: Partial<IntermediateNode>) => {
    const updated = [...intermediates]
    updated[index] = { ...updated[index], ...updates }
    setIntermediates(updated)
  }

  const removeIntermediate = (index: number) => {
    const removed = intermediates[index]
    setSecondaries(secondaries.filter((sec) => sec.parentId !== removed.account.id))
    setIntermediates(intermediates.filter((_, i) => i !== index))
  }

  const addSecondary = () => {
    if (!centralizerAccount || availableAccounts.length === 0) return

    setSecondaries([
      ...secondaries,
      {
        account: availableAccounts[0],
        parentId: centralizerAccount.id,
        mode: "ZBA",
        isActive: true,
        debitCoverageEnabled: false,
        debitCoverageMode: "full",
        debitCoveragePriority: secondaries.length + 1,
      },
    ])
  }

  const updateSecondary = (index: number, updates: Partial<SecondaryNode>) => {
    const updated = [...secondaries]
    updated[index] = { ...updated[index], ...updates }
    setSecondaries(updated)
  }

  const removeSecondary = (index: number) => {
    setSecondaries(secondaries.filter((_, i) => i !== index))
  }

  const buildAndValidate = () => {
    if (!centralizerAccount) {
      setErrors(["Aucun compte centralisateur sélectionné"])
      onHierarchyChange(null, isNotionalPooling, null)
      return
    }

    // For notional pooling, we don't use ZBA/TBA/FBA modes - accounts just participate without leveling
    const secondaryConfigs: Array<{ account: Account; parentId: string; config: SecondaryAccountConfig }> =
      secondaries.map((sec) => ({
        account: sec.account,
        parentId: sec.parentId,
        config: {
          accountId: sec.account.id,
          account: sec.account,
          // In notional pooling, mode is not relevant but we set a default
          mode: isNotionalPooling ? "ZBA" : sec.mode,
          targetBalance: isNotionalPooling ? undefined : sec.targetBalance,
          minBalance: isNotionalPooling ? undefined : sec.minBalance,
          maxBalance: isNotionalPooling ? undefined : sec.maxBalance,
          isActive: sec.isActive,
          // Debit coverage doesn't apply in notional pooling
          debitCoverage: isNotionalPooling ? undefined : (sec.debitCoverageEnabled
            ? {
                enabled: true,
                mode: sec.debitCoverageMode,
                priority: sec.debitCoveragePriority,
                minCoverageAmount: sec.debitCoverageMinAmount,
              }
            : undefined),
        },
      }))

    const intermediateConfigs = intermediates
      .filter((int) => !isNotionalPooling && int.isCompensated)
      .map((int) => ({
        account: int.account,
        parentId: int.parentId,
        config: {
          accountId: int.account.id,
          account: int.account,
          mode: "ZBA" as PoolingMode,
          isActive: true,
        },
      }))

    const hierarchy = HierarchyManager.buildHierarchy(centralizerAccount, intermediates, [
      ...secondaryConfigs,
      ...intermediateConfigs,
    ])

    const validationErrors = HierarchyManager.validateHierarchy(hierarchy)
    setErrors(validationErrors)

    // Build notional config if enabled
    const notionalConfig: NotionalPoolingConfig | null = isNotionalPooling ? {
      enabled: true,
      virtualMirrorAccountNumber: `VM-${centralizerAccount.accountNumber}`,
      consolidatedBalance: 0,
      allowOperationsOnConsolidated,
    } : null

    if (validationErrors.length === 0) {
      onHierarchyChange(hierarchy, isNotionalPooling, notionalConfig)
    } else {
      onHierarchyChange(null, isNotionalPooling, null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Notional Pooling Toggle */}
      {centralizerAccount && (
        <Card className="border-purple-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Cash Pooling Notionnel</CardTitle>
                  <CardDescription>Compensation virtuelle sans mouvement réel de fonds</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="notional-toggle" className="text-sm text-slate-600">
                  {isNotionalPooling ? "Activé" : "Désactivé"}
                </Label>
                <Switch 
                  id="notional-toggle" 
                  checked={isNotionalPooling} 
                  onCheckedChange={setIsNotionalPooling} 
                />
              </div>
            </div>
          </CardHeader>

          {isNotionalPooling && (
            <CardContent className="space-y-4">
              <Alert className="bg-purple-50 border-purple-200">
                <Info className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800 text-sm">
                  Le Cash Pooling Notionnel permet une compensation virtuelle des soldes créditeurs et débiteurs sans
                  transfert réel de fonds. Les notions ZBA/FBA/TBA et les seuils par compte ne s'appliquent pas.
                </AlertDescription>
              </Alert>

              {/* Virtual Mirror Account Info */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-purple-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-900">Compte Miroir Virtuel</p>
                    <p className="font-mono text-lg font-bold text-purple-700 mt-1">
                      VM-{centralizerAccount.accountNumber}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      Ce compte virtuel consolidera les soldes de {secondaries.length} compte(s) secondaire(s)
                    </p>
                  </div>
                </div>
              </div>

              {/* Consolidation Features */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Fonctionnalités de consolidation
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <p className="text-sm font-medium text-slate-800">Consolidation temps réel</p>
                      <p className="text-xs text-slate-500">Les soldes sont consolidés automatiquement</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-300">Automatique</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <p className="text-sm font-medium text-slate-800">Autoriser opérations sur solde consolidé</p>
                      <p className="text-xs text-slate-500">Les opérations seront autorisées selon le solde global</p>
                    </div>
                    <Switch
                      checked={allowOperationsOnConsolidated}
                      onCheckedChange={setAllowOperationsOnConsolidated}
                    />
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Fonctionnement</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <span>Les soldes créditeurs et débiteurs sont consolidés virtuellement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <span>Aucun mouvement réel de fonds entre les comptes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Les autorisations d'opérations sont basées sur le solde consolidé</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {centralizerAccount && (
        <Card className="bg-gradient-to-r from-cyan-50 to-orange-50 border-cyan-200">
          <CardHeader>
            <CardTitle className="text-lg">Compte Centralisateur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono font-medium">{centralizerAccount.accountNumber}</p>
                <p className="text-sm text-slate-600">{centralizerAccount.clientName}</p>
              </div>
              <Badge className="bg-cyan-500">{centralizerAccount.currency}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Comptes de Rattachement (Intermédiaires)</CardTitle>
              <CardDescription>Comptes pour regrouper et tracer les flux</CardDescription>
            </div>
            <Button
              onClick={addIntermediate}
              size="sm"
              disabled={!centralizerAccount || availableAccounts.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {intermediates.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Aucun compte intermédiaire ajouté</p>
          ) : (
            intermediates.map((intermediate, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4 bg-orange-50/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Compte intermédiaire</Label>
                        <Select
                          value={intermediate.account.id}
                          onValueChange={(value) => {
                            const account = accounts.find((a) => a.id === value)
                            if (account) updateIntermediate(index, { account })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={intermediate.account.id}>
                              {intermediate.account.accountNumber}
                            </SelectItem>
                            {availableAccounts.map((acc) => (
                              <SelectItem key={acc.id} value={acc.id}>
                                {acc.accountNumber} - {acc.clientName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Rattaché à</Label>
                        <Select
                          value={intermediate.parentId}
                          onValueChange={(value) => updateIntermediate(index, { parentId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableParents()
                              .filter((p) => p.id !== intermediate.account.id)
                              .map((parent) => (
                                <SelectItem key={parent.id} value={parent.id}>
                                  {parent.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* Only show compensated checkbox for real pooling */}
                    {!isNotionalPooling && (
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          id={`compensated-${index}`}
                          checked={intermediate.isCompensated}
                          onCheckedChange={(checked) => updateIntermediate(index, { isCompensated: checked as boolean })}
                        />
                        <label
                          htmlFor={`compensated-${index}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Compte compensé (participe au nivellement)
                        </label>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeIntermediate(index)} className="ml-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Comptes Secondaires</CardTitle>
              <CardDescription>
                {isNotionalPooling 
                  ? "Comptes participant au Cash Pooling Notionnel (consolidation virtuelle)"
                  : "Comptes participant au Cash Pooling avec configuration du nivellement"
                }
              </CardDescription>
            </div>
            <Button onClick={addSecondary} size="sm" disabled={!centralizerAccount || availableAccounts.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {secondaries.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Aucun compte secondaire ajouté</p>
          ) : (
            secondaries.map((secondary, index) => (
              <div key={index} className={`border rounded-lg p-4 space-y-4 ${isNotionalPooling ? 'bg-purple-50/30' : 'bg-slate-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Compte secondaire</Label>
                        <Select
                          value={secondary.account.id}
                          onValueChange={(value) => {
                            const account = accounts.find((a) => a.id === value)
                            if (account) updateSecondary(index, { account })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={secondary.account.id}>{secondary.account.accountNumber}</SelectItem>
                            {availableAccounts.map((acc) => (
                              <SelectItem key={acc.id} value={acc.id}>
                                {acc.accountNumber} - {acc.clientName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Rattaché à</Label>
                        <Select
                          value={secondary.parentId}
                          onValueChange={(value) => updateSecondary(index, { parentId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableParents().map((parent) => (
                              <SelectItem key={parent.id} value={parent.id}>
                                {parent.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Only show ZBA/TBA/FBA configuration for real pooling (not notional) */}
                    {!isNotionalPooling && (
                      <>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Mode de nivellement</Label>
                            <Select
                              value={secondary.mode}
                              onValueChange={(value: PoolingMode) =>
                                updateSecondary(index, {
                                  mode: value,
                                  targetBalance: undefined,
                                  minBalance: undefined,
                                  maxBalance: undefined,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ZBA">ZBA (Zéro)</SelectItem>
                                <SelectItem value="TBA">TBA (Cible)</SelectItem>
                                <SelectItem value="FBA">FBA (Plage)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {secondary.mode === "TBA" && (
                            <div className="space-y-2 col-span-3">
                              <Label>Montant cible (MAD)</Label>
                              <Input
                                type="number"
                                value={secondary.targetBalance || ""}
                                onChange={(e) =>
                                  updateSecondary(index, { targetBalance: Number.parseFloat(e.target.value) || undefined })
                                }
                                placeholder="Ex: 10000"
                              />
                            </div>
                          )}
                          {secondary.mode === "FBA" && (
                            <>
                              <div className="space-y-2 col-span-1">
                                <Label>Min (MAD)</Label>
                                <Input
                                  type="number"
                                  value={secondary.minBalance || ""}
                                  onChange={(e) =>
                                    updateSecondary(index, { minBalance: Number.parseFloat(e.target.value) || undefined })
                                  }
                                  placeholder="Ex: 5000"
                                />
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label>Max (MAD)</Label>
                                <Input
                                  type="number"
                                  value={secondary.maxBalance || ""}
                                  onChange={(e) =>
                                    updateSecondary(index, { maxBalance: Number.parseFloat(e.target.value) || undefined })
                                  }
                                  placeholder="Ex: 20000"
                                />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="border-t pt-3 mt-3">
                          <div className="flex items-center space-x-2 mb-3">
                            <Checkbox
                              id={`debit-coverage-${index}`}
                              checked={secondary.debitCoverageEnabled}
                              onCheckedChange={(checked) =>
                                updateSecondary(index, { debitCoverageEnabled: checked as boolean })
                              }
                            />
                            <label
                              htmlFor={`debit-coverage-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Activer la couverture automatique des soldes débiteurs
                            </label>
                          </div>

                          {secondary.debitCoverageEnabled && (
                            <div className="grid grid-cols-3 gap-4 pl-6">
                              <div className="space-y-2">
                                <Label>Mode de couverture</Label>
                                <Select
                                  value={secondary.debitCoverageMode}
                                  onValueChange={(value: CoverageMode) =>
                                    updateSecondary(index, { debitCoverageMode: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="full">Total</SelectItem>
                                    <SelectItem value="partial">Partiel</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-slate-500">
                                  {secondary.debitCoverageMode === "full"
                                    ? "Couverture totale requise"
                                    : "Couverture jusqu'aux fonds disponibles"}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label>Priorité</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={secondary.debitCoveragePriority}
                                  onChange={(e) =>
                                    updateSecondary(index, {
                                      debitCoveragePriority: Number.parseInt(e.target.value) || 1,
                                    })
                                  }
                                  placeholder="1"
                                />
                                <p className="text-xs text-slate-500">1 = Priorité la plus haute</p>
                              </div>
                              <div className="space-y-2">
                                <Label>Montant min. (MAD)</Label>
                                <Input
                                  type="number"
                                  value={secondary.debitCoverageMinAmount || ""}
                                  onChange={(e) =>
                                    updateSecondary(index, {
                                      debitCoverageMinAmount: Number.parseFloat(e.target.value) || undefined,
                                    })
                                  }
                                  placeholder="Optionnel"
                                />
                                <p className="text-xs text-slate-500">Seuil min. pour déclencher</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* For notional pooling, show simplified info */}
                    {isNotionalPooling && (
                      <div className="bg-purple-100/50 rounded-lg p-3 text-sm text-purple-700">
                        Ce compte participera à la consolidation virtuelle des soldes
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeSecondary(index)} className="ml-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Button onClick={buildAndValidate} className="w-full" size="lg" disabled={!centralizerAccount}>
        Valider la structure et continuer
      </Button>
    </div>
  )
}
