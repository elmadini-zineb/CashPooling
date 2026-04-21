"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CashPoolingContract, SecondaryAccountConfig, BalancingOperation, PoolingMode } from "@/lib/types"
import { PoolingEngine } from "@/lib/pooling-engine"
import { ArrowDownIcon, ArrowUpIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon } from "lucide-react"

interface PoolingSimulatorProps {
  contract: CashPoolingContract
  initialConfigs?: SecondaryAccountConfig[]
}

export function PoolingSimulator({ contract, initialConfigs = [] }: PoolingSimulatorProps) {
  const [configs, setConfigs] = useState<SecondaryAccountConfig[]>(
    initialConfigs.length > 0
      ? initialConfigs
      : contract.secondaryAccounts.map((acc) => ({
          accountId: acc.id,
          account: acc,
          mode: "ZBA" as PoolingMode,
          isActive: true,
        })),
  )
  const [masterBalance, setMasterBalance] = useState(contract.masterAccount?.balance || 0)
  const [result, setResult] = useState<BalancingOperation | null>(null)

  const handleModeChange = (accountId: string, mode: PoolingMode) => {
    setConfigs((prev) =>
      prev.map((config) =>
        config.accountId === accountId
          ? {
              ...config,
              mode,
              targetBalance: mode === "TBA" ? 10000 : undefined,
              minBalance: mode === "FBA" ? 5000 : undefined,
              maxBalance: mode === "FBA" ? 50000 : undefined,
            }
          : config,
      ),
    )
  }

  const handleConfigChange = (accountId: string, field: string, value: number) => {
    setConfigs((prev) =>
      prev.map((config) =>
        config.accountId === accountId
          ? {
              ...config,
              [field]: value,
            }
          : config,
      ),
    )
  }

  const handleToggleActive = (accountId: string) => {
    setConfigs((prev) =>
      prev.map((config) =>
        config.accountId === accountId
          ? {
              ...config,
              isActive: !config.isActive,
            }
          : config,
      ),
    )
  }

  const handleExecute = () => {
    const operation = PoolingEngine.executeBalancing(contract, configs, masterBalance)
    setResult(operation)
  }

  const handleReset = () => {
    setResult(null)
    setMasterBalance(contract.masterAccount?.balance || 0)
  }

  return (
    <div className="space-y-6">
      {/* Contract Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contrat {contract.contractNumber}</CardTitle>
          <CardDescription>
            {contract.clientName} - Statut:{" "}
            <Badge
              variant={contract.status === "active" ? "default" : "secondary"}
              className={contract.status === "active" ? "bg-green-100 text-green-700" : ""}
            >
              {contract.status}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Compte Centralisateur</p>
                <p className="font-mono text-sm text-orange-900 mt-1">{contract.masterAccount?.accountNumber}</p>
              </div>
              <div className="text-right">
                <Label htmlFor="master-balance" className="text-sm text-orange-700">
                  Solde actuel
                </Label>
                <Input
                  id="master-balance"
                  type="number"
                  value={masterBalance}
                  onChange={(e) => setMasterBalance(Number(e.target.value))}
                  className="w-40 mt-1 text-right font-semibold"
                />
                <p className="text-xs text-orange-600 mt-1">{contract.currency}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration des comptes secondaires</CardTitle>
          <CardDescription>Définissez le mode de nivellement pour chaque compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {configs.map((config) => (
            <div
              key={config.accountId}
              className={`border rounded-lg p-4 ${config.isActive ? "bg-white" : "bg-slate-50 opacity-60"}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-mono text-sm font-medium text-slate-900">{config.account.accountNumber}</p>
                  <p className="text-sm text-slate-600">{config.account.accountType}</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    Solde: {config.account.balance.toLocaleString("fr-FR")} {config.account.currency}
                  </p>
                </div>
                <Button
                  variant={config.isActive ? "outline" : "secondary"}
                  size="sm"
                  onClick={() => handleToggleActive(config.accountId)}
                >
                  {config.isActive ? "Actif" : "Inactif"}
                </Button>
              </div>

              {config.isActive && (
                <div className="grid md:grid-cols-2 gap-4 pt-3 border-t">
                  <div>
                    <Label htmlFor={`mode-${config.accountId}`}>Mode de nivellement</Label>
                    <Select
                      value={config.mode}
                      onValueChange={(value) => handleModeChange(config.accountId, value as PoolingMode)}
                    >
                      <SelectTrigger id={`mode-${config.accountId}`} className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ZBA">ZBA - Zero Balance Account</SelectItem>
                        <SelectItem value="TBA">TBA - Target Balance Account</SelectItem>
                        <SelectItem value="FBA">FBA - Flexible Balance Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {config.mode === "TBA" && (
                    <div>
                      <Label htmlFor={`target-${config.accountId}`}>Montant cible (MAD)</Label>
                      <Input
                        id={`target-${config.accountId}`}
                        type="number"
                        value={config.targetBalance || 0}
                        onChange={(e) => handleConfigChange(config.accountId, "targetBalance", Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  )}

                  {config.mode === "FBA" && (
                    <>
                      <div>
                        <Label htmlFor={`min-${config.accountId}`}>Seuil minimum (MAD)</Label>
                        <Input
                          id={`min-${config.accountId}`}
                          type="number"
                          value={config.minBalance || 0}
                          onChange={(e) => handleConfigChange(config.accountId, "minBalance", Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`max-${config.accountId}`}>Seuil maximum (MAD)</Label>
                        <Input
                          id={`max-${config.accountId}`}
                          type="number"
                          value={config.maxBalance || 0}
                          onChange={(e) => handleConfigChange(config.accountId, "maxBalance", Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleExecute} size="lg" className="flex-1">
          Exécuter le nivellement
        </Button>
        {result && (
          <Button onClick={handleReset} variant="outline" size="lg">
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Résultat de l'exécution
              {result.status === "executed" && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
              {result.status === "failed" && <XCircleIcon className="w-5 h-5 text-red-600" />}
              {result.status === "skipped" && <AlertCircleIcon className="w-5 h-5 text-amber-600" />}
            </CardTitle>
            <CardDescription>
              {result.executedAt.toLocaleString("fr-FR")} - Montant total: {result.totalAmount.toLocaleString("fr-FR")}{" "}
              {contract.currency}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{result.errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {result.operations.map((txn) => (
                <div
                  key={txn.id}
                  className={`border rounded-lg p-4 ${
                    txn.status === "executed"
                      ? "bg-green-50 border-green-200"
                      : txn.status === "failed"
                        ? "bg-red-50 border-red-200"
                        : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {txn.mode}
                        </Badge>
                        <Badge
                          variant={txn.status === "executed" ? "default" : "secondary"}
                          className={
                            txn.status === "executed"
                              ? "bg-green-100 text-green-700"
                              : txn.status === "failed"
                                ? "bg-red-100 text-red-700"
                                : ""
                          }
                        >
                          {txn.status}
                        </Badge>
                      </div>
                      <p className="font-mono text-sm text-slate-900">{txn.secondaryAccountNumber}</p>
                    </div>
                    {txn.transferAmount !== 0 && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          {txn.transferAmount > 0 ? (
                            <ArrowDownIcon className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowUpIcon className="w-4 h-4 text-cyan-600" />
                          )}
                          <span className="font-semibold text-slate-900">
                            {Math.abs(txn.transferAmount).toLocaleString("fr-FR")} MAD
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {txn.transferAmount > 0 ? "Depuis centralisateur" : "Vers centralisateur"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
                    <div>
                      <span className="text-slate-600">Solde avant:</span>{" "}
                      <span className="font-medium">{txn.balanceBefore.toLocaleString("fr-FR")} MAD</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Solde après:</span>{" "}
                      <span className="font-medium">{txn.balanceAfter.toLocaleString("fr-FR")} MAD</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 mt-2 italic">{txn.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
