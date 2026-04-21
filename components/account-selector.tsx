"use client"

import { useState } from "react"
import type { Account } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertCircle, XCircle } from "lucide-react"

interface AccountSelectorProps {
  accounts: Account[]
  masterAccount: Account | null
  secondaryAccounts: Account[]
  onMasterAccountChange: (account: Account | null) => void
  onSecondaryAccountsChange: (accounts: Account[]) => void
}

export function AccountSelector({
  accounts,
  masterAccount,
  secondaryAccounts,
  onMasterAccountChange,
  onSecondaryAccountsChange,
}: AccountSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAccounts = accounts.filter(
    (account) =>
      account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.clientName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleSecondaryAccount = (account: Account) => {
    const isSelected = secondaryAccounts.some((acc) => acc.id === account.id)
    if (isSelected) {
      onSecondaryAccountsChange(secondaryAccounts.filter((acc) => acc.id !== account.id))
    } else {
      onSecondaryAccountsChange([...secondaryAccounts, account])
    }
  }

  const getAccountStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-300"
      case "inactive":
        return "bg-orange-100 text-orange-700 border-orange-300"
      case "closed":
        return "bg-red-100 text-red-700 border-red-300"
      default:
        return "bg-slate-100 text-slate-700 border-slate-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "inactive":
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      case "closed":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif"
      case "inactive":
        return "Inactif"
      case "closed":
        return "Clôturé"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Rechercher un compte</label>
        <Input
          type="text"
          placeholder="Numéro de compte ou nom du client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11"
        />
      </div>

      {/* Master Account Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Compte Centralisateur
            <span className="text-red-500 ml-1">*</span>
          </h3>
          {masterAccount && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMasterAccountChange(null)}
              className="text-slate-500 hover:text-slate-700"
            >
              Désélectionner
            </Button>
          )}
        </div>
        {masterAccount ? (
          <div className="bg-cyan-50 border-2 border-cyan-300 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-mono text-sm font-semibold text-cyan-900">{masterAccount.accountNumber}</p>
                <p className="text-sm text-cyan-700 mt-1">{masterAccount.clientName}</p>
                <p className="text-xs text-cyan-600 mt-1">{masterAccount.accountType}</p>
              </div>
              <div className="text-right space-y-2">
                <p className="text-lg font-bold text-cyan-900">
                  {masterAccount.balance.toLocaleString("fr-FR")} {masterAccount.currency}
                </p>
                <Badge className={getAccountStatusColor(masterAccount.status)}>{masterAccount.status}</Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-500">
            Sélectionnez un compte centralisateur ci-dessous
          </div>
        )}
      </div>

      {/* Secondary Accounts Selection */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">
          Comptes Secondaires
          <span className="text-red-500 ml-1">*</span>
          {secondaryAccounts.length > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({secondaryAccounts.length} sélectionné{secondaryAccounts.length > 1 ? "s" : ""})
            </span>
          )}
        </h3>
        {secondaryAccounts.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            {secondaryAccounts.map((account) => (
              <Badge
                key={account.id}
                variant="secondary"
                className="px-3 py-1.5 text-xs font-mono cursor-pointer hover:bg-slate-300"
                onClick={() => toggleSecondaryAccount(account)}
              >
                {account.accountNumber}
                <span className="ml-2">×</span>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Available Accounts List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-700">Comptes disponibles</h3>
        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
          {filteredAccounts.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Aucun compte trouvé</p>
          ) : (
            filteredAccounts.map((account) => {
              const isMaster = masterAccount?.id === account.id
              const isSecondary = secondaryAccounts.some((acc) => acc.id === account.id)

              return (
                <div
                  key={account.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isMaster
                      ? "border-cyan-300 bg-cyan-50"
                      : isSecondary
                        ? "border-green-300 bg-green-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left side: Account info with status indicator */}
                    <div className="flex-1 min-w-0">
                      {/* Status row at top */}
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(account.status)}
                        <span className={`text-xs font-semibold ${
                          account.status === "active" ? "text-green-700" :
                          account.status === "inactive" ? "text-orange-700" :
                          "text-red-700"
                        }`}>
                          {getStatusLabel(account.status)}
                        </span>
                      </div>

                      {/* Account number and badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <p className="font-mono text-sm font-semibold text-slate-900">{account.accountNumber}</p>
                        <Badge variant="outline" className="text-xs">
                          {account.currency}
                        </Badge>
                      </div>

                      {/* Client name */}
                      <p className="text-sm text-slate-700 font-medium">{account.clientName}</p>
                      
                      {/* Account type */}
                      <p className="text-xs text-slate-500 mt-1">{account.accountType}</p>
                    </div>

                    {/* Right side: Balance and buttons */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-base font-bold text-slate-900 whitespace-nowrap">
                          {account.balance.toLocaleString("fr-FR")}
                        </p>
                        <p className="text-xs text-slate-500">{account.currency}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant={isMaster ? "default" : "outline"}
                          onClick={() => onMasterAccountChange(isMaster ? null : account)}
                          disabled={isSecondary || account.status !== "active"}
                          className="whitespace-nowrap text-xs"
                        >
                          {isMaster ? "✓ Centralisateur" : "Centralisateur"}
                        </Button>
                        <Button
                          size="sm"
                          variant={isSecondary ? "default" : "outline"}
                          onClick={() => toggleSecondaryAccount(account)}
                          disabled={isMaster || account.status !== "active"}
                          className="whitespace-nowrap text-xs"
                        >
                          {isSecondary ? "✓ Secondaire" : "Secondaire"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
