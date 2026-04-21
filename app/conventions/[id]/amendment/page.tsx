"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AmendmentForm } from "@/components/amendment-form"
import { getContractById } from "@/lib/mock-data"
import type { CashPoolingContract } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function AmendmentPage() {
  const params = useParams()
  const router = useRouter()
  const [contract, setContract] = useState<CashPoolingContract | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params?.id as string
    if (id) {
      const foundContract = getContractById(id)
      if (foundContract) {
        setContract(foundContract)
      }
      setLoading(false)
    }
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Convention non trouvée</h2>
          <p className="text-slate-600 mb-4">La convention que vous recherchez n'existe pas.</p>
          <Button onClick={() => router.push("/conventions")}>Retour aux conventions</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Générer un Avenant</h1>
          </div>
          <p className="text-sm text-slate-600 ml-12">{contract.contractNumber} - {contract.clientName}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AmendmentForm contract={contract} />
      </main>
    </div>
  )
}
