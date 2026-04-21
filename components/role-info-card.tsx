"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"
import type { UserRole } from "@/lib/types"
import { getRoleDescription, hasPermission } from "@/lib/rbac"

interface RoleInfoCardProps {
  role: UserRole
}

export function RoleInfoCard({ role }: RoleInfoCardProps) {
  const permissions = {
    "Chargé de clientèle": [
      { name: "Voir les contrats", allowed: true },
      { name: "Gérer les contrats", allowed: true },
      { name: "Voir les conventions", allowed: true },
      { name: "Gérer les amendements", allowed: true },
      { name: "Voir tous les comptes", allowed: true },
      { name: "Accéder à la tarification", allowed: false },
      { name: "Gérer la tarification", allowed: false },
      { name: "Gérer tous les paramètres", allowed: false },
    ],
    "Admin": [
      { name: "Voir les contrats", allowed: true },
      { name: "Gérer les contrats", allowed: true },
      { name: "Voir les conventions", allowed: true },
      { name: "Gérer les amendements", allowed: true },
      { name: "Voir tous les comptes", allowed: true },
      { name: "Accéder à la tarification", allowed: true },
      { name: "Gérer la tarification", allowed: true },
      { name: "Gérer tous les paramètres", allowed: true },
    ],
    "Client": [
      { name: "Voir ses données", allowed: true },
      { name: "Voir ses contrats", allowed: true },
      { name: "Voir les contrats", allowed: false },
      { name: "Gérer les contrats", allowed: false },
      { name: "Voir les conventions", allowed: false },
      { name: "Gérer les amendements", allowed: false },
      { name: "Voir tous les comptes", allowed: false },
      { name: "Accéder à la tarification", allowed: false },
    ],
  }

  const roleColors = {
    "Chargé de clientèle": "bg-blue-100 text-blue-800",
    "Admin": "bg-red-100 text-red-800",
    "Client": "bg-green-100 text-green-800",
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{role}</CardTitle>
            <CardDescription className="text-sm mt-1">{getRoleDescription(role)}</CardDescription>
          </div>
          <Badge className={`${roleColors[role]} text-xs font-semibold`}>{role}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700 mb-3">Permissions :</p>
          <div className="grid grid-cols-1 gap-2">
            {permissions[role].map((permission) => (
              <div
                key={permission.name}
                className="flex items-center gap-2 text-sm p-2 rounded-md bg-slate-50"
              >
                {permission.allowed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                )}
                <span className={permission.allowed ? "text-slate-700" : "text-slate-500"}>
                  {permission.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
