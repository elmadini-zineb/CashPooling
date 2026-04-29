"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuditSidebar } from "@/components/audit/audit-sidebar"
import { ContractAuditPage } from "@/components/audit/contract-audit"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

export default function AuditPage() {
  const router = useRouter()
  const [activeItem, setActiveItem] = useState("contracts")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(storedUser))
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem("user")
    router.push("/login")
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <AuditSidebar activeItem={activeItem} onItemChange={setActiveItem} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Audit</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-semibold text-slate-900">
                  {activeItem === "contracts" ? "Contrats" : "Avenants"}
                </span>
              </div>
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="font-semibold text-slate-900">{user.name}</p>
              <p className="text-slate-500">{user.role}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              Déconnexion
            </Button>
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {activeItem === "contracts" && <ContractAuditPage />}
          {activeItem === "amendments" && (
            <div className="text-center text-slate-500 py-12">
              <p>Page Piste d'audit Avenants - À venir</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
