import type { UserRole } from "./types"

export type Permission = 
  | "view_pricing"
  | "manage_pricing"
  | "view_contracts"
  | "manage_contracts"
  | "view_amendments"
  | "manage_amendments"
  | "view_all_accounts"
  | "manage_all_settings"
  | "view_own_data"

const rolePermissions: Record<UserRole, Permission[]> = {
  "Chargé de clientèle": [
    "view_contracts",
    "manage_contracts",
    "view_amendments",
    "manage_amendments",
    "view_all_accounts",
  ],
  "Admin": [
    "view_pricing",
    "manage_pricing",
    "view_contracts",
    "manage_contracts",
    "view_amendments",
    "manage_amendments",
    "view_all_accounts",
    "manage_all_settings",
  ],
  "Client": [
    "view_own_data",
    "view_contracts",
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

export function canAccessPricing(role: UserRole): boolean {
  return hasPermission(role, "view_pricing")
}

export function canManagePricing(role: UserRole): boolean {
  return hasPermission(role, "manage_pricing")
}

export function canViewContracts(role: UserRole): boolean {
  return hasPermission(role, "view_contracts")
}

export function canManageContracts(role: UserRole): boolean {
  return hasPermission(role, "manage_contracts")
}

export function canViewAllAccounts(role: UserRole): boolean {
  return hasPermission(role, "view_all_accounts")
}

export function canManageAllSettings(role: UserRole): boolean {
  return hasPermission(role, "manage_all_settings")
}

export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    "Chargé de clientèle": "Gère les contrats et souscriptions pour les clients",
    "Admin": "Administrateur avec accès complet, y compris la tarification",
    "Client": "Accès aux propres informations et contrats",
  }
  return descriptions[role] ?? ""
}
