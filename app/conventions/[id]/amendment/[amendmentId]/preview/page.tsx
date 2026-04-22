'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { AmendmentPreview } from '@/components/amendment-preview'
import { getAmendmentById, getContractById, addAuditLog, generatePDF } from '@/lib/mock-data'
import type { Amendment, CashPoolingContract } from '@/lib/types'

export default function AmendmentPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [amendment, setAmendment] = useState<Amendment | null>(null)
  const [contract, setContract] = useState<CashPoolingContract | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const id = params?.id as string
    const amendmentId = params?.amendmentId as string
    if (id && amendmentId) {
      const foundAmendment = getAmendmentById(amendmentId)
      const foundContract = getContractById(id)
      if (foundAmendment) {
        setAmendment(foundAmendment)
      }
      if (foundContract) {
        setContract(foundContract)
      }
      setLoading(false)
    }
  }, [params])

  const handleModify = () => {
    const id = params?.id as string
    router.push(`/conventions/${id}/amendment`)
  }

  const handleGenerateAndSend = async () => {
    if (!amendment || !contract) return

    setIsGenerating(true)
    try {
      // Generate PDF
      const pdfUrl = await generatePDF(amendment, contract)
      
      // Update amendment with PDF URL
      const updatedAmendment = {
        ...amendment,
        pdfUrl,
        status: 'pending_signature' as const,
      }
      
      // Log the action
      addAuditLog({
        id: `audit-${Date.now()}`,
        entityType: 'amendment',
        entityId: amendment.id,
        action: `PDF généré pour l'avenant ${amendment.amendmentNumber} et en attente de signature du client`,
        userEmail: 'adria@admin.com',
        details: { pdfUrl },
        createdAt: new Date(),
      })

      // Navigate to tracking page
      setTimeout(() => {
        router.push(`/conventions/${params?.id}/amendment/${amendment.id}`)
      }, 1000)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Erreur lors de la génération du PDF')
    } finally {
      setIsGenerating(false)
    }
  }

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

  if (!amendment || !contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Avenant non trouvé</h2>
          <p className="text-slate-600 mb-4">L'avenant que vous recherchez n'existe pas.</p>
          <Button onClick={() => router.push('/conventions')}>Retour aux conventions</Button>
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
            <h1 className="text-2xl font-bold text-slate-900">Prévisualisation de l'Avenant</h1>
          </div>
          <p className="text-sm text-slate-600 ml-12">{amendment.amendmentNumber} - {contract.clientName}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AmendmentPreview
          amendment={amendment}
          contract={contract}
          onModify={handleModify}
          onGenerateAndSend={handleGenerateAndSend}
          isGenerating={isGenerating}
        />
      </main>
    </div>
  )
}
