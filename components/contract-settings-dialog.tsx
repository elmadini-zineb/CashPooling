"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, UserCheck, AlertCircle } from "lucide-react"
import type { CashPoolingContract, Subscriber } from "@/lib/types"
import { getAllSubscribers, updateContractStatus, assignContractToSubscriber } from "@/lib/mock-data"

interface ContractSettingsDialogProps {
  contract: CashPoolingContract | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function ContractSettingsDialog({ contract, isOpen, onClose, onUpdate }: ContractSettingsDialogProps) {
  const [newStatus, setNewStatus] = useState<string>(contract?.status || "registered")
  const [subscribers, setSubscribers] = useState<Subscriber[]>(getAllSubscribers())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubscriber, setSelectedSubscriber] = useState<string | null>(
    (contract as any)?.assignedSubscriberId || null,
  )

  const handleSaveStatus = () => {
    if (contract && newStatus) {
      const success = updateContractStatus(
        contract.id,
        newStatus as "active" | "suspended" | "terminated" | "registered",
      )
      if (success) {
        onUpdate()
        onClose()
      }
    }
  }

  const handleAssignSubscriber = () => {
    if (contract && selectedSubscriber) {
      const success = assignContractToSubscriber(contract.id, selectedSubscriber)
      if (success) {
        onUpdate()
        onClose()
      }
    }
  }

  const filteredSubscribers = subscribers.filter((sub) => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      suspended: "secondary",
      terminated: "destructive",
      registered: "outline",
    }

    const labels: Record<string, string> = {
      active: "Actif",
      suspended: "Suspendu",
      terminated: "Résilié",
      registered: "Enregistré",
    }

    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {labels[status] || status}
      </Badge>
    )
  }

  if (!contract) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Paramètres du contrat {contract.contractNumber}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status">Modifier le statut</TabsTrigger>
            <TabsTrigger value="assign">Affecter à un abonné</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-slate-600">
                <strong>Contrat:</strong> {contract.contractNumber}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Client:</strong> {contract.clientName}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Statut actuel:</strong> {getStatusBadge(contract.status)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nouveau statut</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registered">Enregistré</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="terminated">Résilié</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-900">
                La modification du statut prendra effet immédiatement et sera enregistrée dans l'historique du contrat.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Annuler
              </Button>
              <Button onClick={handleSaveStatus} className="flex-1 bg-gradient-to-r from-orange-500 to-cyan-500">
                Enregistrer
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="assign" className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-slate-600">
                <strong>Contrat:</strong> {contract.contractNumber}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Client:</strong> {contract.clientName}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Rechercher un abonné par intitulé</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par nom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {filteredSubscribers.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <UserCheck className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm">Aucun abonné trouvé</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredSubscribers.map((subscriber) => (
                    <div
                      key={subscriber.id}
                      onClick={() => setSelectedSubscriber(subscriber.id)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedSubscriber === subscriber.id
                          ? "bg-gradient-to-r from-orange-50 to-cyan-50 border-l-4 border-orange-500"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{subscriber.name}</p>
                          <p className="text-sm text-slate-600">{subscriber.email}</p>
                          {subscriber.company && <p className="text-xs text-slate-500 mt-1">{subscriber.company}</p>}
                        </div>
                        {subscriber.isActive && (
                          <Badge variant="default" className="bg-green-500">
                            Actif
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedSubscriber && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <UserCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-900">
                  Abonné sélectionné: <strong>{subscribers.find((s) => s.id === selectedSubscriber)?.name}</strong>
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Annuler
              </Button>
              <Button
                onClick={handleAssignSubscriber}
                disabled={!selectedSubscriber}
                className="flex-1 bg-gradient-to-r from-orange-500 to-cyan-500"
              >
                Affecter l'abonné
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
