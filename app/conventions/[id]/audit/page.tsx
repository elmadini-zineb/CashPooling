'use client'

import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { getContractById } from '@/lib/mock-data'
import { AuditTrail } from '@/components/audit-trail'

export default function AuditTrailPage() {
  const params = useParams()
  const router = useRouter()
  const contractId = params.id as string

  const contract = getContractById(contractId)

  if (!contract) {
    return (
      <div className="space-y-4 p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour
        </Button>
        <Card className="p-6">
          <p className="text-red-600">Convention non trouvée</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold mt-4">Piste d'audit</h1>
          <p className="text-slate-600">{contract.contractNumber} - {contract.clientName}</p>
        </div>
      </div>

      <AuditTrail contractId={contractId} contractNumber={contract.contractNumber} />
    </div>
  )
}
