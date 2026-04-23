'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Pause, CheckCircle } from 'lucide-react'
import type { CashPoolingContract } from '@/lib/types'
import { suspendContract, liftSuspension, terminateContract } from '@/lib/mock-data'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ContractActionsProps {
  contract: CashPoolingContract
  onActionComplete?: () => void
}

export function ContractActions({ contract, onActionComplete }: ContractActionsProps) {
  const [suspensionReason, setSuspensionReason] = useState('')
  const [terminationReason, setTerminationReason] = useState('')
  const [terminationDate, setTerminationDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSuspend = async () => {
    if (!suspensionReason.trim()) return

    setIsLoading(true)
    try {
      suspendContract(contract.id, suspensionReason, 'adria@admin.com', 'Adria Manager', 'Chargé de clientèle')
      setSuspensionReason('')
      onActionComplete?.()
    } finally {
      setIsLoading(false)
    }
  }

  const handleLiftSuspension = async () => {
    setIsLoading(true)
    try {
      liftSuspension(contract.id, 'adria@admin.com', 'Adria Manager', 'Chargé de clientèle')
      onActionComplete?.()
    } finally {
      setIsLoading(false)
    }
  }

  const handleTerminate = async () => {
    if (!terminationReason.trim() || !terminationDate) return

    setIsLoading(true)
    try {
      terminateContract(contract.id, new Date(terminationDate), terminationReason, 'adria@admin.com', 'Adria Manager', 'Chargé de clientèle')
      setTerminationReason('')
      setTerminationDate('')
      onActionComplete?.()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {contract.status === 'suspended' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <p className="font-semibold">Convention suspendue</p>
            <p className="text-sm mt-1">{contract.suspensionReason}</p>
            {contract.suspensionDate && (
              <p className="text-xs text-yellow-700 mt-1">
                Depuis le {contract.suspensionDate.toLocaleDateString('fr-FR')}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {contract.status === 'terminated' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <p className="font-semibold">Convention terminée</p>
            <p className="text-sm mt-1">{contract.terminationReason}</p>
            <p className="text-xs text-red-700 mt-1">
              Fin le {contract.endDate.toLocaleDateString('fr-FR')}
            </p>
          </AlertDescription>
        </Alert>
      )}

      {contract.status === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions contractuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {/* Suspend */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Pause className="h-4 w-4" />
                    Suspendre
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Suspendre la convention</DialogTitle>
                    <DialogDescription>
                      Fournissez une raison pour la suspension. Cela enregistrera un événement d'audit et suspendra la convention.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="suspension-reason">Raison de la suspension</Label>
                      <Textarea
                        id="suspension-reason"
                        placeholder="Ex: Non-respect des obligations contractuelles..."
                        value={suspensionReason}
                        onChange={(e) => setSuspensionReason(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSuspend}
                        disabled={!suspensionReason.trim() || isLoading}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {isLoading ? 'Suspension...' : 'Confirmer la suspension'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Terminate */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Terminer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Terminer la convention</DialogTitle>
                    <DialogDescription>
                      Spécifiez la date de fin et la raison de la termination.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="termination-date">Date de fin</Label>
                      <Input
                        id="termination-date"
                        type="date"
                        value={terminationDate}
                        onChange={(e) => setTerminationDate(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="termination-reason">Raison de la termination</Label>
                      <Textarea
                        id="termination-reason"
                        placeholder="Ex: Accord mutuel, résiliation par le client..."
                        value={terminationReason}
                        onChange={(e) => setTerminationReason(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleTerminate}
                        disabled={!terminationReason.trim() || !terminationDate || isLoading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isLoading ? 'Termination...' : 'Confirmer la termination'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {contract.status === 'suspended' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions contractuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleLiftSuspension}
              disabled={isLoading}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              {isLoading ? 'Levée en cours...' : 'Lever la suspension'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
