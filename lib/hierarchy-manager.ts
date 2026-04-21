import type { Account, HierarchicalAccount, AccountRole, SecondaryAccountConfig } from "./types"

export class HierarchyManager {
  /**
   * Build a hierarchical tree structure from accounts
   */
  static buildHierarchy(
    centralizer: Account,
    intermediates: Array<{ account: Account; parentId: string; isCompensated: boolean }>,
    secondaries: Array<{ account: Account; parentId: string; config: SecondaryAccountConfig }>,
  ): HierarchicalAccount {
    // Create centralizer node
    const root: HierarchicalAccount = {
      id: centralizer.id,
      account: centralizer,
      role: "centralizer",
      level: 0,
      children: [],
    }

    // Create a map for quick lookup
    const nodeMap = new Map<string, HierarchicalAccount>()
    nodeMap.set(centralizer.id, root)

    // Create intermediate nodes
    for (const { account, parentId, isCompensated } of intermediates) {
      const parent = nodeMap.get(parentId)
      if (!parent) continue

      const intermediateNode: HierarchicalAccount = {
        id: account.id,
        account,
        role: "intermediate",
        parentAccountId: parentId,
        level: parent.level + 1,
        children: [],
        isCompensated,
      }

      nodeMap.set(account.id, intermediateNode)
      parent.children = parent.children || []
      parent.children.push(intermediateNode)
    }

    // Create secondary nodes
    for (const { account, parentId, config } of secondaries) {
      const parent = nodeMap.get(parentId)
      if (!parent) continue

      const secondaryNode: HierarchicalAccount = {
        id: account.id,
        account,
        role: "secondary",
        parentAccountId: parentId,
        level: parent.level + 1,
        poolingConfig: config,
      }

      nodeMap.set(account.id, secondaryNode)
      parent.children = parent.children || []
      parent.children.push(secondaryNode)
    }

    return root
  }

  /**
   * Flatten hierarchy to get all leaf accounts (secondary + compensated intermediates)
   */
  static flattenToPoolableAccounts(hierarchy: HierarchicalAccount): SecondaryAccountConfig[] {
    const poolableAccounts: SecondaryAccountConfig[] = []

    const traverse = (node: HierarchicalAccount) => {
      // If it's a secondary account with pooling config
      if (node.role === "secondary" && node.poolingConfig) {
        poolableAccounts.push(node.poolingConfig)
      }

      // If it's an intermediate account that is compensated
      if (node.role === "intermediate" && node.isCompensated && node.poolingConfig) {
        poolableAccounts.push(node.poolingConfig)
      }

      // Traverse children
      if (node.children) {
        for (const child of node.children) {
          traverse(child)
        }
      }
    }

    traverse(hierarchy)
    return poolableAccounts
  }

  /**
   * Get all intermediate accounts
   */
  static getIntermediateAccounts(hierarchy: HierarchicalAccount): Account[] {
    const intermediates: Account[] = []

    const traverse = (node: HierarchicalAccount) => {
      if (node.role === "intermediate") {
        intermediates.push(node.account)
      }

      if (node.children) {
        for (const child of node.children) {
          traverse(child)
        }
      }
    }

    traverse(hierarchy)
    return intermediates
  }

  /**
   * Calculate the balancing path (trace des flux)
   */
  static calculateBalancingPath(hierarchy: HierarchicalAccount): Array<{ from: string; to: string; level: number }> {
    const paths: Array<{ from: string; to: string; level: number }> = []

    const traverse = (node: HierarchicalAccount) => {
      if (node.children) {
        for (const child of node.children) {
          paths.push({
            from: child.account.accountNumber,
            to: node.account.accountNumber,
            level: child.level,
          })
          traverse(child)
        }
      }
    }

    traverse(hierarchy)
    return paths
  }

  /**
   * Validate hierarchy structure
   */
  static validateHierarchy(hierarchy: HierarchicalAccount): string[] {
    const errors: string[] = []
    const accountIds = new Set<string>()

    const traverse = (node: HierarchicalAccount, path: string[] = []) => {
      // Check for duplicate accounts
      if (accountIds.has(node.id)) {
        errors.push(`Compte ${node.account.accountNumber} apparaît plusieurs fois dans la hiérarchie`)
      }
      accountIds.add(node.id)

      // Check for circular references
      if (path.includes(node.id)) {
        errors.push(`Référence circulaire détectée pour le compte ${node.account.accountNumber}`)
      }

      // Validate currency consistency
      if (node.role !== "centralizer" && node.account.currency !== hierarchy.account.currency) {
        errors.push(
          `Devise incohérente: ${node.account.accountNumber} (${node.account.currency}) vs centralisateur (${hierarchy.account.currency})`,
        )
      }

      // Validate account status
      if (node.account.status !== "active") {
        errors.push(`Compte ${node.account.accountNumber} n'est pas actif (statut: ${node.account.status})`)
      }

      // Validate intermediate accounts
      if (node.role === "intermediate") {
        if (node.isCompensated && !node.poolingConfig) {
          errors.push(
            `Compte intermédiaire compensé ${node.account.accountNumber} doit avoir une configuration de pooling`,
          )
        }
      }

      // Validate secondary accounts
      if (node.role === "secondary" && !node.poolingConfig) {
        errors.push(`Compte secondaire ${node.account.accountNumber} doit avoir une configuration de pooling`)
      }

      // Traverse children
      if (node.children) {
        for (const child of node.children) {
          traverse(child, [...path, node.id])
        }
      }
    }

    traverse(hierarchy)
    return errors
  }

  /**
   * Get hierarchy depth
   */
  static getDepth(hierarchy: HierarchicalAccount): number {
    let maxDepth = 0

    const traverse = (node: HierarchicalAccount, currentDepth: number) => {
      maxDepth = Math.max(maxDepth, currentDepth)

      if (node.children) {
        for (const child of node.children) {
          traverse(child, currentDepth + 1)
        }
      }
    }

    traverse(hierarchy, 0)
    return maxDepth
  }

  /**
   * Get account count by role
   */
  static getAccountCountByRole(hierarchy: HierarchicalAccount): Record<AccountRole, number> {
    const counts: Record<AccountRole, number> = {
      centralizer: 0,
      intermediate: 0,
      secondary: 0,
    }

    const traverse = (node: HierarchicalAccount) => {
      counts[node.role]++

      if (node.children) {
        for (const child of node.children) {
          traverse(child)
        }
      }
    }

    traverse(hierarchy)
    return counts
  }
}
