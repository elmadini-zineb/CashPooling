"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { UnifiedSubscriptionFlow } from "@/components/unified-subscription-flow"
import { FileText, FileCheck, AlertCircle, Calculator, History, Link2 } from "lucide-react"
import { getRoleDescription, canAccessPricing } from "@/lib/rbac"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
    } else {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      
      // Redirect Admin users to admin dashboard
      if (parsedUser.role === "Admin") {
        router.push("/admin")
      }
    }
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem("user")
    router.push("/login")
  }

  const handleViewContracts = () => {
    router.push("/contracts")
  }

  const handleViewAmendmentsHistory = () => {
    router.push("/amendments-history")
  }

  const handleViewAttachmentManagement = () => {
    router.push("/amendment-attachment")
  }

  const handleViewConventions = () => {
    router.push("/conventions")
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
              <div className="border-l pl-3 ml-2">
                <h1 className="text-xl font-bold text-slate-900">Cash Pooling Manager</h1>
                <p className="text-sm text-slate-500">Gestion complète des souscriptions</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push("/simulation")} className="gap-2 bg-transparent">
                <Calculator className="h-4 w-4" />
                Simulation
              </Button>
              <Button variant="outline" onClick={handleViewAmendmentsHistory} className="gap-2 bg-transparent">
                <History className="h-4 w-4" />
                Historique Avenants
              </Button>
              <Button variant="outline" onClick={handleViewAttachmentManagement} className="gap-2 bg-transparent">
                <Link2 className="h-4 w-4" />
                Rattachements
              </Button>
              <Button variant="outline" onClick={handleViewConventions} className="gap-2 bg-transparent">
                <FileCheck className="h-4 w-4" />
                Conventions
              </Button>
              <Button variant="outline" onClick={handleViewContracts} className="gap-2 bg-transparent">
                <FileText className="h-4 w-4" />
                Voir les contrats
              </Button>
              <div className="text-right border-l pl-4">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {user.role}
                  </Badge>
                  <p className="text-xs text-slate-500">{getRoleDescription(user.role)}</p>
                </div>
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
        {/* Role-based notice */}
        {!canAccessPricing(user?.role) && user?.role === "Chargé de clientèle" && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Rôle : Chargé de clientèle</strong> - Vous ne pouvez pas accéder à la section &quot;Tarification&quot;. Cette gestion est réservée aux administrateurs.
            </AlertDescription>
          </Alert>
        )}
        <UnifiedSubscriptionFlow user={user} />
      </main>
    </div>
  )
}
