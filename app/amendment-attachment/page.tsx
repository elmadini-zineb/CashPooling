"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SecondaryAccountAttachment } from "@/components/secondary-account-attachment"
import { ChevronLeft } from "lucide-react"

export default function AttachmentManagementPage() {
  const router = useRouter()

  // Mock data
  const mockData = {
    amendmentNumber: "AVN-CP-17761-001",
    conventionNumber: "CP-CP-17761",
    centralizatorAccount: {
      number: "FR763...185",
      name: "Groupe Vortex Global",
    },
    intermediateAccounts: [
      {
        id: "int-001",
        number: "INT-001",
        name: "Intermédiaire Paris",
      },
      {
        id: "int-002",
        number: "INT-002",
        name: "Intermédiaire Lyon",
      },
    ],
    secondaryAccounts: [
      {
        id: "sec-001",
        number: "FR763...200",
        name: "Filiale Technix",
        currentAttachment: "INT-001",
        currentAttachmentName: "INT-001 — Intermédiaire Paris",
      },
      {
        id: "sec-002",
        number: "FR763...305",
        name: "Filiale LogisPro",
        currentAttachment: "INT-002",
        currentAttachmentName: "INT-002 — Intermédiaire Lyon",
      },
      {
        id: "sec-003",
        number: "FR763...410",
        name: "Filiale Sud",
        currentAttachment: "centralisateur",
        currentAttachmentName: "Centralisateur (direct)",
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Gestion des Rattachements</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SecondaryAccountAttachment
          amendmentNumber={mockData.amendmentNumber}
          conventionNumber={mockData.conventionNumber}
          centralizatorAccount={mockData.centralizatorAccount}
          intermediateAccounts={mockData.intermediateAccounts}
          secondaryAccounts={mockData.secondaryAccounts}
        />
      </main>
    </div>
  )
}
