"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConditionalPricingSelector } from "@/components/admin/conditional-pricing-selector"
import { CompanyDiscountsManager } from "@/components/admin/company-discounts-manager"
import { BankSettingsForm } from "@/components/admin/bank-settings-form"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { AlertCircle, Settings, BarChart3, TrendingUp, Percent } from "lucide-react"
import { mockBankSettings } from "@/lib/mock-data"

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("pricing")

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(storedUser)
    if (parsedUser.role !== "Admin") {
      router.push("/dashboard")
      return
    }

    setUser(parsedUser)
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem("user")
    router.push("/login")
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader 
          userName={user.name}
          userRole={user.role}
          bankName={mockBankSettings.bankName}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Information Alert */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Interface Administrateur</strong> - Gestion exclusivement réservée aux administrateurs. 
                Vous pouvez configurer la tarification avancée et les paramètres de votre banque partenaire.
              </AlertDescription>
            </Alert>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-slate-900 text-sm font-medium flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-600" />
                    Tarification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-900">Avancée</p>
                  <p className="text-xs text-slate-500 mt-1">3 modèles disponibles</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-slate-900 text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Modèle Actif
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-900">Variable</p>
                  <p className="text-xs text-slate-500 mt-1">Basé sur critères</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-slate-900 text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    Banque
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-900 truncate">{mockBankSettings.bankName}</p>
                  <p className="text-xs text-slate-500 mt-1">Mise à jour OK</p>
                </CardContent>
              </Card>
            </div>

            {/* Content Sections */}
            <div>
              {activeTab === "pricing" && (
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle>Tarification Cash Pooling</CardTitle>
                    <CardDescription>
                      Configurez la source de tarification pour votre service Cash Pooling
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ConditionalPricingSelector />
                  </CardContent>
                </Card>
              )}

              {activeTab === "discounts" && (
                <CompanyDiscountsManager />
              )}

              {activeTab === "settings" && (
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle>Paramètres de la Banque</CardTitle>
                    <CardDescription>
                      Gérez les informations générales et la configuration de votre banque
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BankSettingsForm />
                  </CardContent>
                </Card>
              )}

              {activeTab === "analytics" && (
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle>Analytics & Statistiques</CardTitle>
                    <CardDescription>
                      Visualisez les statistiques de vos configurations et utilisations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">Fonctionnalité coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
