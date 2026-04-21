"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DollarSign, Settings, BarChart3, ChevronDown, Percent } from "lucide-react"

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}

export function AdminSidebar({ activeTab, onTabChange, onLogout }: AdminSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const menuItems = [
    {
      id: "pricing",
      label: "Tarification",
      icon: DollarSign,
      description: "Gérer les modèles de tarification"
    },
    {
      id: "discounts",
      label: "Remises",
      icon: Percent,
      description: "Remises par entreprise"
    },
    {
      id: "settings",
      label: "Paramètres",
      icon: Settings,
      description: "Configuration de la banque"
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      description: "Statistiques et rapports"
    }
  ]

  return (
    <aside className={cn(
      "flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300",
      isExpanded ? "w-64" : "w-20"
    )}>
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        {isExpanded && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">Adria Admin</p>
              <p className="text-xs text-slate-400">Tarification</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform",
            isExpanded ? "rotate-90" : ""
          )} />
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size={isExpanded ? "lg" : "sm"}
              className={cn(
                "w-full justify-start gap-3 transition-colors",
                isActive 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </div>
              )}
            </Button>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700">
        <Button
          variant="outline"
          size={isExpanded ? "lg" : "sm"}
          className="w-full text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white"
          onClick={onLogout}
        >
          {isExpanded ? "Déconnexion" : "×"}
        </Button>
      </div>
    </aside>
  )
}
