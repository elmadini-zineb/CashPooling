"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Clock, User, Shield } from "lucide-react"

interface AdminHeaderProps {
  userName: string
  userRole: string
  bankName?: string
}

export function AdminHeader({ userName, userRole, bankName }: AdminHeaderProps) {
  const currentTime = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Administration Adria</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestion centralisée de la tarification et des paramètres bancaires
          </p>
        </div>

        {/* User Info Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-4 min-w-fit">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-900">{userName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                {userRole}
              </Badge>
            </div>

            {bankName && (
              <div className="text-xs text-slate-600 pt-2 border-t border-blue-200">
                Banque: <span className="font-semibold">{bankName}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-blue-200">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-600">{currentTime}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
