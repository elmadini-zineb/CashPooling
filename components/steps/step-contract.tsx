"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { CashPoolingContract, HierarchicalAccount } from "@/lib/types"
import { ContractPreview } from "@/components/contract-preview"
import { CheckCircle2, Download } from "lucide-react"
import { ContractPDFGenerator } from "@/lib/contract-pdf-generator"
import { addContract } from "@/lib/mock-data"
import { useEffect } from "react"

interface StepContractProps {
  contract: CashPoolingContract
  hierarchy: HierarchicalAccount | null
  user: any
  onReset: () => void
}

export function StepContract({ contract, hierarchy, user, onReset }: StepContractProps) {
  useEffect(() => {
    addContract(contract)
  }, [contract])

  const handleDownloadPDF = () => {
    const pdfBlob = ContractPDFGenerator.generateContractPDF(contract, hierarchy)
    ContractPDFGenerator.downloadPDF(pdfBlob, `${contract.contractNumber}.pdf`)
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-orange-50 border-orange-200">
        <CheckCircle2 className="h-5 w-5 text-orange-600" />
        <AlertDescription className="text-orange-800 font-medium">
          ✓ Contrat généré avec succès - Référence: <strong>{contract.contractNumber}</strong>
          <br />
          <span className="text-sm">
            Statut initial: Suspendu - Vous pouvez modifier le statut dans la section "Gestion des Contrats"
          </span>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Étape 4: Contrat Cash Pooling</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractPreview contract={contract} user={user} />

          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Button onClick={onReset} size="lg" className="flex-1">
              Nouvelle souscription
            </Button>
            <Button variant="outline" size="lg" onClick={handleDownloadPDF} className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Télécharger le contrat (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
