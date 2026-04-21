"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { HierarchicalAccount } from "@/lib/types"
import { ChevronRight, Building2, GitBranch, Coins } from "lucide-react"
import { HierarchyManager } from "@/lib/hierarchy-manager"

interface HierarchyVisualizerProps {
  hierarchy: HierarchicalAccount
}

export function HierarchyVisualizer({ hierarchy }: HierarchyVisualizerProps) {
  const depth = HierarchyManager.getDepth(hierarchy)
  const counts = HierarchyManager.getAccountCountByRole(hierarchy)
  const poolableAccounts = HierarchyManager.flattenToPoolableAccounts(hierarchy)

  const renderNode = (node: HierarchicalAccount) => {
    const isPoolable =
      (node.role === "secondary" && node.poolingConfig) || (node.role === "intermediate" && node.isCompensated)
    return (
      <div key={node.id} className="space-y-2">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border ${
            node.role === "centralizer"
              ? "bg-gradient-to-r from-cyan-50 to-orange-50 border-cyan-300"
              : node.role === "intermediate"
                ? "bg-orange-50 border-orange-200"
                : "bg-slate-50 border-slate-200"
          }`}
          style={{ marginLeft: `${node.level * 32}px` }}
        >
          {node.level > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
          {node.role === "centralizer" && <Building2 className="w-5 h-5 text-cyan-600" />}
          {node.role === "intermediate" && <GitBranch className="w-5 h-5 text-orange-600" />}
          {node.role === "secondary" && <Coins className="w-5 h-5 text-slate-600" />}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm font-medium">{node.account.accountNumber}</p>
              <Badge
                variant="outline"
                className={
                  node.role === "centralizer"
                    ? "bg-cyan-100 text-cyan-700 border-cyan-300"
                    : node.role === "intermediate"
                      ? "bg-orange-100 text-orange-700 border-orange-300"
                      : "bg-slate-100 text-slate-700 border-slate-300"
                }
              >
                {node.role === "centralizer"
                  ? "Centralisateur"
                  : node.role === "intermediate"
                    ? "Intermédiaire"
                    : "Secondaire"}
              </Badge>
              {isPoolable && (
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  {node.poolingConfig?.mode || "ZBA"}
                </Badge>
              )}
              {node.role === "intermediate" && node.isCompensated && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">Compensé</Badge>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {node.account.clientName} • {node.account.balance.toLocaleString("fr-FR")} {node.account.currency}
            </p>
          </div>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="space-y-2">{node.children.map((child) => renderNode(child))}</div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualisation de la Hiérarchie</CardTitle>
        <CardDescription>Structure multi-niveaux du Cash Pooling</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-600 font-medium">Profondeur</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{depth}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p className="text-xs text-orange-600 font-medium">Intermédiaires</p>
            <p className="text-2xl font-bold text-orange-900 mt-1">{counts.intermediate}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-600 font-medium">Secondaires</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{counts.secondary}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-xs text-green-600 font-medium">À niveler</p>
            <p className="text-2xl font-bold text-green-900 mt-1">{poolableAccounts.length}</p>
          </div>
        </div>
        <div className="space-y-2">{renderNode(hierarchy)}</div>
      </CardContent>
    </Card>
  )
}
