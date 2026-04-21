"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Layers, Info, Calculator, CreditCard } from "lucide-react"
import type { NotionalPoolingConfig, Account } from "@/lib/types"

interface NotionalPoolingConfigProps {
  config: NotionalPoolingConfig | null
  centralizerAccount: Account
  secondaryAccountsCount: number
  onChange: (config: NotionalPoolingConfig | null) => void
}

export function NotionalPoolingConfigPanel({
  config,
  centralizerAccount,
  secondaryAccountsCount,
  onChange,
}: NotionalPoolingConfigProps) {
  const [localConfig, setLocalConfig] = useState<NotionalPoolingConfig>(
    config || {
      enabled: false,
      consolidatedBalance: 0,
      allowOperationsOnConsolidated: true,
    },
  )

  useEffect(() => {
    if (config) {
      setLocalConfig(config)
    }
  }, [config])

  const handleToggle = (enabled: boolean) => {
    const newConfig: NotionalPoolingConfig = {
      ...localConfig,
      enabled,
      virtualMirrorAccountNumber: enabled ? `VM-${centralizerAccount.accountNumber}` : undefined,
    }
    setLocalConfig(newConfig)
    onChange(enabled ? newConfig : null)
  }

  const handleAllowOperationsToggle = (allow: boolean) => {
    const newConfig = { ...localConfig, allowOperationsOnConsolidated: allow }
    setLocalConfig(newConfig)
    if (localConfig.enabled) {
      onChange(newConfig)
    }
  }

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Cash Pooling Notionnel</CardTitle>
              <CardDescription>Compensation virtuelle sans mouvement réel</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="notional-toggle" className="text-sm text-slate-600">
              {localConfig.enabled ? "Activé" : "Désactivé"}
            </Label>
            <Switch id="notional-toggle" checked={localConfig.enabled} onCheckedChange={handleToggle} />
          </div>
        </div>
      </CardHeader>

      {localConfig.enabled && (
        <CardContent className="space-y-4">
          <Alert className="bg-purple-50 border-purple-200">
            <Info className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800 text-sm">
              Le Cash Pooling Notionnel permet une compensation virtuelle des soldes créditeurs et débiteurs sans
              transfert réel de fonds. Un compte miroir virtuel sera créé pour la consolidation.
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
                  {localConfig.virtualMirrorAccountNumber || `VM-${centralizerAccount.accountNumber}`}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Ce compte virtuel consolidera les soldes de {secondaryAccountsCount} compte(s) secondaire(s)
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
                  checked={localConfig.allowOperationsOnConsolidated}
                  onCheckedChange={handleAllowOperationsToggle}
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
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  4
                </span>
                <span>Facilite le rapprochement et la traçabilité des flux</span>
              </li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
