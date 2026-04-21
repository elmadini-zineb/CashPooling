import type {
  CashPoolingContract,
  BalancingOperation,
  BalancingTransaction,
  SecondaryAccountConfig,
  BalancingStatus,
} from "./types"

export class PoolingEngine {
  /**
   * Execute balancing for a contract
   */
  static executeBalancing(
    contract: CashPoolingContract,
    secondaryConfigs: SecondaryAccountConfig[],
    masterAccountBalance: number,
  ): BalancingOperation {
    // Validation: Check if contract is active
    if (contract.status === "suspended") {
      return {
        id: `bal-${Date.now()}`,
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        executedAt: new Date(),
        status: "skipped",
        operations: [],
        totalAmount: 0,
        errorMessage: "Contrat suspendu - nivellement non autorisé",
      }
    }

    if (contract.status !== "active") {
      return {
        id: `bal-${Date.now()}`,
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        executedAt: new Date(),
        status: "skipped",
        operations: [],
        totalAmount: 0,
        errorMessage: "Contrat inactif - statut: " + contract.status,
      }
    }

    const transactions: BalancingTransaction[] = []
    let currentMasterBalance = masterAccountBalance

    const debitCoverageConfigs = secondaryConfigs
      .filter(
        (c) =>
          c.debitCoverage?.enabled &&
          c.isActive &&
          c.account.status === "active" &&
          c.account.balance < 0 && // Only negative balances
          (c.debitCoverage.minCoverageAmount === undefined ||
            Math.abs(c.account.balance) >= c.debitCoverage.minCoverageAmount),
      )
      .sort((a, b) => (a.debitCoverage!.priority || 999) - (b.debitCoverage!.priority || 999))

    for (const config of debitCoverageConfigs) {
      const transaction = this.calculateDebitCoverage(config, currentMasterBalance)
      transactions.push(transaction)
      currentMasterBalance -= transaction.transferAmount
    }

    const regularConfigs = secondaryConfigs.filter(
      (c) => !debitCoverageConfigs.find((dc) => dc.accountId === c.accountId),
    )

    for (const config of regularConfigs) {
      // Skip if account is not active
      if (!config.isActive || config.account.status !== "active") {
        transactions.push({
          id: `txn-${Date.now()}-${config.accountId}`,
          secondaryAccountId: config.accountId,
          secondaryAccountNumber: config.account.accountNumber,
          mode: config.mode,
          balanceBefore: config.account.balance,
          balanceAfter: config.account.balance,
          transferAmount: 0,
          status: "skipped",
          reason: "Compte inactif ou configuration désactivée",
        })
        continue
      }

      const transaction = this.calculateBalancing(config, currentMasterBalance)
      transactions.push(transaction)

      // Update master balance for next iteration
      currentMasterBalance -= transaction.transferAmount
    }

    const totalAmount = transactions.reduce((sum, txn) => sum + Math.abs(txn.transferAmount), 0)
    const hasErrors = transactions.some((txn) => txn.status === "failed")

    return {
      id: `bal-${Date.now()}`,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      executedAt: new Date(),
      status: hasErrors ? "failed" : "executed",
      operations: transactions,
      totalAmount,
    }
  }

  private static calculateDebitCoverage(config: SecondaryAccountConfig, masterBalance: number): BalancingTransaction {
    const { account, debitCoverage } = config
    const debitAmount = Math.abs(account.balance) // Positive amount needed

    if (!debitCoverage) {
      return {
        id: `txn-${Date.now()}-${config.accountId}`,
        secondaryAccountId: config.accountId,
        secondaryAccountNumber: account.accountNumber,
        mode: config.mode,
        balanceBefore: account.balance,
        balanceAfter: account.balance,
        transferAmount: 0,
        status: "failed",
        reason: "Configuration de couverture débitrice manquante",
        isDebitCoverage: true,
      }
    }

    let transferAmount = 0
    let coveredAmount = 0
    let status: BalancingStatus = "executed"
    let reason = ""
    let insufficientFunds = false

    if (debitCoverage.mode === "full") {
      // Full coverage: try to cover entire debit
      if (masterBalance >= debitAmount) {
        transferAmount = debitAmount
        coveredAmount = debitAmount
        reason = `Couverture totale du solde débiteur (${debitAmount.toLocaleString("fr-FR")} MAD) - Priorité ${debitCoverage.priority}`
      } else {
        // Insufficient funds
        transferAmount = masterBalance
        coveredAmount = masterBalance
        insufficientFunds = true
        status = "failed"
        reason = `Fonds insuffisants: couverture partielle de ${masterBalance.toLocaleString("fr-FR")} MAD sur ${debitAmount.toLocaleString("fr-FR")} MAD requis - Priorité ${debitCoverage.priority}`
      }
    } else if (debitCoverage.mode === "partial") {
      // Partial coverage: cover up to available funds
      transferAmount = Math.min(debitAmount, masterBalance)
      coveredAmount = transferAmount

      if (transferAmount === debitAmount) {
        reason = `Couverture totale du solde débiteur (${debitAmount.toLocaleString("fr-FR")} MAD) - Priorité ${debitCoverage.priority}`
      } else {
        insufficientFunds = transferAmount < debitAmount
        reason = `Couverture partielle de ${transferAmount.toLocaleString("fr-FR")} MAD sur ${debitAmount.toLocaleString("fr-FR")} MAD - Priorité ${debitCoverage.priority}`
      }
    } else {
      // None: no coverage
      reason = "Couverture débitrice désactivée"
    }

    return {
      id: `txn-${Date.now()}-${config.accountId}`,
      secondaryAccountId: config.accountId,
      secondaryAccountNumber: account.accountNumber,
      mode: config.mode,
      balanceBefore: account.balance,
      balanceAfter: account.balance + transferAmount,
      transferAmount,
      status,
      reason,
      isDebitCoverage: true,
      coveredAmount,
      insufficientFunds,
    }
  }

  /**
   * Calculate balancing for a single secondary account
   */
  private static calculateBalancing(config: SecondaryAccountConfig, masterBalance: number): BalancingTransaction {
    const { account, mode } = config
    const currentBalance = account.balance

    let transferAmount = 0
    let targetBalance = currentBalance
    let reason = ""

    switch (mode) {
      case "ZBA": {
        // ZBA: Zero Balance Account - solde cible à zéro
        transferAmount = -currentBalance
        targetBalance = 0
        reason =
          transferAmount > 0
            ? `Transfert de ${Math.abs(transferAmount)} MAD depuis le compte centralisateur`
            : transferAmount < 0
              ? `Transfert de ${Math.abs(transferAmount)} MAD vers le compte centralisateur`
              : "Solde déjà à zéro"
        break
      }

      case "TBA": {
        // TBA: Target Balance Account - maintenir un solde cible
        if (config.targetBalance === undefined) {
          return {
            id: `txn-${Date.now()}-${config.accountId}`,
            secondaryAccountId: config.accountId,
            secondaryAccountNumber: account.accountNumber,
            mode,
            balanceBefore: currentBalance,
            balanceAfter: currentBalance,
            transferAmount: 0,
            targetBalance: config.targetBalance,
            status: "failed",
            reason: "Montant cible non défini pour le mode TBA",
          }
        }

        transferAmount = config.targetBalance - currentBalance
        targetBalance = config.targetBalance
        reason =
          transferAmount > 0
            ? `Ajustement de ${Math.abs(transferAmount)} MAD pour atteindre le solde cible de ${config.targetBalance} MAD`
            : transferAmount < 0
              ? `Retrait de ${Math.abs(transferAmount)} MAD pour atteindre le solde cible de ${config.targetBalance} MAD`
              : `Solde déjà au niveau cible de ${config.targetBalance} MAD`
        break
      }

      case "FBA": {
        // FBA: Flexible Balance Account - respect des seuils min/max
        if (config.minBalance === undefined || config.maxBalance === undefined) {
          return {
            id: `txn-${Date.now()}-${config.accountId}`,
            secondaryAccountId: config.accountId,
            secondaryAccountNumber: account.accountNumber,
            mode,
            balanceBefore: currentBalance,
            balanceAfter: currentBalance,
            transferAmount: 0,
            minBalance: config.minBalance,
            maxBalance: config.maxBalance,
            status: "failed",
            reason: "Seuils Min/Max non définis pour le mode FBA",
          }
        }

        // Validation: Min <= Max
        if (config.minBalance > config.maxBalance) {
          return {
            id: `txn-${Date.now()}-${config.accountId}`,
            secondaryAccountId: config.accountId,
            secondaryAccountNumber: account.accountNumber,
            mode,
            balanceBefore: currentBalance,
            balanceAfter: currentBalance,
            transferAmount: 0,
            minBalance: config.minBalance,
            maxBalance: config.maxBalance,
            status: "failed",
            reason: `Seuils invalides: Min (${config.minBalance}) > Max (${config.maxBalance})`,
          }
        }

        if (currentBalance < config.minBalance) {
          // Below minimum - add funds to reach minimum
          transferAmount = config.minBalance - currentBalance
          targetBalance = config.minBalance
          reason = `Solde en dessous du minimum (${config.minBalance} MAD) - ajustement de ${transferAmount} MAD`
        } else if (currentBalance > config.maxBalance) {
          // Above maximum - remove funds to reach maximum
          transferAmount = config.maxBalance - currentBalance
          targetBalance = config.maxBalance
          reason = `Solde au-dessus du maximum (${config.maxBalance} MAD) - retrait de ${Math.abs(transferAmount)} MAD`
        } else {
          // Within range - no action needed
          transferAmount = 0
          targetBalance = currentBalance
          reason = `Solde dans la plage acceptable [${config.minBalance} - ${config.maxBalance} MAD]`
        }
        break
      }
    }

    return {
      id: `txn-${Date.now()}-${config.accountId}`,
      secondaryAccountId: config.accountId,
      secondaryAccountNumber: account.accountNumber,
      mode,
      balanceBefore: currentBalance,
      balanceAfter: currentBalance + transferAmount,
      transferAmount,
      targetBalance: mode === "TBA" ? config.targetBalance : undefined,
      minBalance: mode === "FBA" ? config.minBalance : undefined,
      maxBalance: mode === "FBA" ? config.maxBalance : undefined,
      status: "executed",
      reason,
    }
  }

  /**
   * Validate pooling configuration
   */
  static validatePoolingConfig(config: SecondaryAccountConfig): string[] {
    const errors: string[] = []

    if (config.mode === "TBA" && config.targetBalance === undefined) {
      errors.push("Le montant cible est obligatoire pour le mode TBA")
    }

    if (config.mode === "FBA") {
      if (config.minBalance === undefined) {
        errors.push("Le seuil minimum est obligatoire pour le mode FBA")
      }
      if (config.maxBalance === undefined) {
        errors.push("Le seuil maximum est obligatoire pour le mode FBA")
      }
      if (config.minBalance !== undefined && config.maxBalance !== undefined && config.minBalance > config.maxBalance) {
        errors.push("Le seuil minimum doit être inférieur ou égal au seuil maximum")
      }
    }

    if (config.debitCoverage?.enabled) {
      if (config.debitCoverage.priority === undefined || config.debitCoverage.priority < 1) {
        errors.push("La priorité de couverture doit être >= 1")
      }
    }

    return errors
  }
}
