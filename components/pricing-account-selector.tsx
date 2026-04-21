"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import type { Account } from "@/lib/types"

interface PricingAccountSelectorProps {
  allClientAccounts: Account[]
  masterAccount: Account
  selectedPricingAccountId?: string
  onSelectPricingAccount: (accountId: string) => void
}

export function PricingAccountSelector({
  allClientAccounts,
  masterAccount,
  selectedPricingAccountId,
  onSelectPricingAccount,
}: PricingAccountSelectorProps) {
  // Use all client accounts for selection
  const availableAccounts = useMemo(() => {
    return allClientAccounts
  }, [allClientAccounts])

  // Validate that selected account is in available accounts
  const isValidSelection = useMemo(() => {
    if (!selectedPricingAccountId) return false
    return availableAccounts.some((acc) => acc.id === selectedPricingAccountId)
  }, [selectedPricingAccountId, availableAccounts])

  // Get selected account details
  const selectedAccount = useMemo(() => {
    return availableAccounts.find((acc) => acc.id === selectedPricingAccountId)
  }, [selectedPricingAccountId, availableAccounts])

  return (
    <Card className="border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base text-slate-900">Compte de tarification</CardTitle>
            <CardDescription className="text-sm">
              Sélectionnez le compte qui sera utilisé pour la facturation des frais du service
            </CardDescription>
          </div>
          {isValidSelection && (
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Défini
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Information Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            Choisissez le compte qui sera utilisé pour la facturation des frais du service. Vous pouvez sélectionner n'importe quel compte du client.
          </AlertDescription>
        </Alert>

        {/* No accounts available */}
        {availableAccounts.length === 0 && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-sm">
              Aucun compte disponible. Veuillez d&apos;abord sélectionner un compte centralisateur et des comptes secondaires.
            </AlertDescription>
          </Alert>
        )}

        {/* Account Selection Radio Group */}
        {availableAccounts.length > 0 && (
          <RadioGroup value={selectedPricingAccountId || ""} onValueChange={onSelectPricingAccount}>
            <div className="space-y-3">
              {availableAccounts.map((account) => (
                <div
                  key={account.id}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedPricingAccountId === account.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                  onClick={() => onSelectPricingAccount(account.id)}
                >
                  <RadioGroupItem value={account.id} id={`pricing-account-${account.id}`} />
                  <Label
                    htmlFor={`pricing-account-${account.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="font-semibold text-slate-900">{account.accountNumber}</p>
                        <p className="text-sm text-slate-600">{account.clientId}</p>
                      </div>
                      <div className="text-right">
                        {account.id === masterAccount.id && (
                          <Badge variant="secondary" className="bg-slate-100">
                            Centralisateur
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{account.clientName}</p>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {/* Selected Account Summary */}
        {selectedAccount && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
            <p className="text-xs font-semibold text-slate-600 mb-2 uppercase">Compte sélectionné pour la facturation</p>
            <div className="space-y-1">
              <p className="font-semibold text-slate-900">{selectedAccount.accountNumber}</p>
              <p className="text-sm text-slate-700">{selectedAccount.clientId} - {selectedAccount.clientName}</p>
              <p className="text-xs text-slate-600 mt-2">
                {selectedAccount.id === masterAccount.id ? "Compte centralisateur" : "Compte secondaire"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
