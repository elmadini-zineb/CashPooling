import type { Account, ValidationError } from "./types"

export function validateCashPoolingSubscription(
  masterAccount: Account | null,
  secondaryAccounts: Account[],
): ValidationError[] {
  const errors: ValidationError[] = []

  // Validation 1: Master account must be selected
  if (!masterAccount) {
    errors.push({
      field: "masterAccount",
      message: "Le compte centralisateur est obligatoire",
    })
    return errors
  }

  // Validation 2: Master account must be active
  if (masterAccount.status !== "active") {
    errors.push({
      field: "masterAccount",
      message: "Le compte centralisateur doit être actif",
    })
  }

  // Validation 3: At least one secondary account required
  if (secondaryAccounts.length === 0) {
    errors.push({
      field: "secondaryAccounts",
      message: "Au moins un compte secondaire est requis",
    })
    return errors
  }

  // Validation 4: All secondary accounts must have same currency as master
  const masterCurrency = masterAccount.currency
  const currencyMismatches = secondaryAccounts.filter((acc) => acc.currency !== masterCurrency)

  if (currencyMismatches.length > 0) {
    errors.push({
      field: "secondaryAccounts",
      message: `Tous les comptes doivent être en ${masterCurrency}. Comptes incompatibles: ${currencyMismatches.map((a) => a.accountNumber).join(", ")}`,
    })
  }

  // Validation 5: All secondary accounts must belong to same client/group
  const masterClientId = masterAccount.clientId
  const clientMismatches = secondaryAccounts.filter((acc) => acc.clientId !== masterClientId)

  if (clientMismatches.length > 0) {
    errors.push({
      field: "secondaryAccounts",
      message: "Tous les comptes doivent appartenir au même client ou groupe",
    })
  }

  // Validation 6: All secondary accounts must be active
  const inactiveAccounts = secondaryAccounts.filter((acc) => acc.status !== "active")

  if (inactiveAccounts.length > 0) {
    errors.push({
      field: "secondaryAccounts",
      message: `Certains comptes secondaires ne sont pas actifs: ${inactiveAccounts.map((a) => a.accountNumber).join(", ")}`,
    })
  }

  // Validation 7: Master account cannot be in secondary accounts
  if (secondaryAccounts.some((acc) => acc.id === masterAccount.id)) {
    errors.push({
      field: "secondaryAccounts",
      message: "Le compte centralisateur ne peut pas être un compte secondaire",
    })
  }

  // Validation 8: No duplicate accounts in secondary list
  const accountIds = secondaryAccounts.map((acc) => acc.id)
  const duplicates = accountIds.filter((id, index) => accountIds.indexOf(id) !== index)

  if (duplicates.length > 0) {
    errors.push({
      field: "secondaryAccounts",
      message: "Des comptes sont présents plusieurs fois dans la liste",
    })
  }

  return errors
}

export function generateContractNumber(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `CP-${timestamp}-${random}`
}
