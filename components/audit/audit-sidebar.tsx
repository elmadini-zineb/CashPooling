"use client"

import { cn } from "@/lib/utils"
import { Shield, FileText, AlertCircle, Menu } from "lucide-react"
import { useState } from "react"

interface AuditSidebarProps {
  activeItem: string
  onItemChange: (item: string) => void
}

export function AuditSidebar({ activeItem, onItemChange }: AuditSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const menuItems = [
    { id: "contracts", label: "Contrats", parent: false },
    { id: "amendments", label: "Avenants", parent: false },
  ]

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">AUDIT</h2>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemChange(item.id)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium",
              activeItem === item.id
                ? "bg-orange-50 text-orange-600 border-l-4 border-orange-500"
                : "text-slate-700 hover:bg-slate-50"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
