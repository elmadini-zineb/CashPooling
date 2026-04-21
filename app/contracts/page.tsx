"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Search, Eye, Download, Filter, Settings } from "lucide-react"
import { getAllContracts } from "@/lib/mock-data"
import type { CashPoolingContract, SimulationParameters } from "@/lib/types"
import { ContractPreview } from "@/components/contract-preview"
import { PDFGenerator } from "@/lib/pdf-generator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ContractSettingsDialog } from "@/components/contract-settings-dialog"
import { ContractSimulationDialog } from "@/components/contract-simulation-dialog"

export default function ContractsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [contracts, setContracts] = useState<CashPoolingContract[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedContract, setSelectedContract] = useState<CashPoolingContract | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [settingsContract, setSettingsContract] = useState<CashPoolingContract | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [simulationContract, setSimulationContract] = useState<CashPoolingContract | null>(null)
  const [isSimulationOpen, setIsSimulationOpen] = useState(false)
  const [simulationPreset, setSimulationPreset] = useState<SimulationParameters | null>(null)

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
    } else {
      setUser(JSON.parse(storedUser))
      setContracts(getAllContracts())
    }
  }, [router])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const pending = window.sessionStorage.getItem("pendingSimulationReplay")
    if (!pending) {
      return
    }

    try {
      const replay = JSON.parse(pending) as { contractId: string; parameters: SimulationParameters }
      const contract = getAllContracts().find((item) => item.id === replay.contractId)
      if (contract) {
        setSimulationContract(contract)
        setSimulationPreset(replay.parameters)
        setIsSimulationOpen(true)
      }
    } catch {
      // ignore invalid replay payload
    } finally {
      window.sessionStorage.removeItem("pendingSimulationReplay")
    }
  }, [contracts])

  const handleLogout = () => {
    sessionStorage.removeItem("user")
    router.push("/login")
  }

  const handleBack = () => {
    router.push("/dashboard")
  }

  const handleViewContract = (contract: CashPoolingContract) => {
    setSelectedContract(contract)
    setIsDialogOpen(true)
  }

  const handleDownloadPDF = (contract: CashPoolingContract) => {
    const pdfBlob = PDFGenerator.generateContractPDF(contract, null)
    PDFGenerator.downloadPDF(pdfBlob, `${contract.contractNumber}.pdf`)
  }

  const handleOpenSettings = (contract: CashPoolingContract) => {
    setSettingsContract(contract)
    setIsSettingsOpen(true)
  }

  const handleOpenSimulation = (contract: CashPoolingContract, preset?: SimulationParameters | null) => {
    setSimulationContract(contract)
    setSimulationPreset(preset ?? null)
    setIsSimulationOpen(true)
  }

  const handleContractsUpdate = () => {
    setContracts(getAllContracts())
  }

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.clientName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || contract.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      suspended: "secondary",
      terminated: "destructive",
      draft: "secondary",
      registered: "outline", // Added registered status variant
    }

    const labels: Record<string, string> = {
      active: "Actif",
      suspended: "Suspendu",
      terminated: "Résilié",
      draft: "Brouillon",
      registered: "Enregistré", // Added registered label
    }

    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {labels[status] || status}
      </Badge>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Gestion des Contrats</h1>
                <p className="text-sm text-slate-500">Consultation et téléchargement</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push("/simulation-history")}>Simulation History</Button>
              <div className="text-right border-l pl-4">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
              <Button variant="outline" onClick={handleLogout} size="sm">
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBack} className="gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Liste des Contrats Cash Pooling</span>
              <Badge variant="secondary" className="text-base">
                {filteredContracts.length} contrat(s)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par référence ou client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="registered">Enregistré</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="suspended">Suspendu</SelectItem>
                    <SelectItem value="terminated">Résilié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contracts Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Référence</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Devise</TableHead>
                    <TableHead>Compte centralisateur</TableHead>
                    <TableHead>Comptes secondaires</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        Aucun contrat trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContracts.map((contract, index) => (
                      <TableRow key={`${contract.id}-${index}`} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                        <TableCell>{contract.clientName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{contract.currency}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {contract.masterAccount?.accountNumber.slice(-8)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{contract.secondaryAccounts.length}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(contract.status)}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(contract.createdAt).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenSettings(contract)}
                              className="gap-1"
                            >
                              <Settings className="h-4 w-4" />
                              Paramètres
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewContract(contract)}
                              className="gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              Voir
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenSimulation(contract)}
                              className="gap-1"
                            >
                              Simuler
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/simulation-history?contractId=${contract.id}`)}
                              className="gap-1"
                            >
                              Historique
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPDF(contract)}
                              className="gap-1"
                            >
                              <Download className="h-4 w-4" />
                              PDF
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Contract Preview Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du contrat {selectedContract?.contractNumber}</DialogTitle>
          </DialogHeader>
          {selectedContract && <ContractPreview contract={selectedContract} user={user} />}
        </DialogContent>
      </Dialog>

      <ContractSimulationDialog
        contract={simulationContract}
        open={isSimulationOpen}
        onOpenChange={setIsSimulationOpen}
        presetParameters={simulationPreset ?? undefined}
      />

      <ContractSettingsDialog
        contract={settingsContract}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdate={handleContractsUpdate}
      />
    </div>
  )
}
