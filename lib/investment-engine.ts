import type {
  CashPoolingContract,
  InvestmentConfig,
  InvestmentOrder,
  InvestmentPortfolio,
  InvestmentOrderType,
  InvestmentOrderStatus,
} from "./types"

export class InvestmentEngine {
  /**
   * Check if investment should be triggered based on master account balance
   */
  static shouldTriggerInvestment(
    masterBalance: number,
    investmentConfig: InvestmentConfig,
    portfolio?: InvestmentPortfolio,
  ): { shouldInvest: boolean; reason: string } {
    if (!investmentConfig.enabled) {
      return { shouldInvest: false, reason: "Placement OPCVM désactivé" }
    }

    // Check if effective date has passed
    if (new Date() < investmentConfig.effectiveDate) {
      return {
        shouldInvest: false,
        reason: `Configuration applicable à partir du ${investmentConfig.effectiveDate.toLocaleDateString("fr-FR")}`,
      }
    }

    // Check if surplus threshold is exceeded
    if (masterBalance <= investmentConfig.surplusThreshold) {
      return {
        shouldInvest: false,
        reason: `Solde (${masterBalance.toLocaleString("fr-FR")} MAD) sous le seuil d'excédent (${investmentConfig.surplusThreshold.toLocaleString("fr-FR")} MAD)`,
      }
    }

    const surplus = masterBalance - investmentConfig.surplusThreshold

    return {
      shouldInvest: true,
      reason: `Excédent détecté: ${surplus.toLocaleString("fr-FR")} MAD au-dessus du seuil`,
    }
  }

  /**
   * Calculate investment amount based on configuration
   */
  static calculateInvestmentAmount(
    masterBalance: number,
    investmentConfig: InvestmentConfig,
  ): { amount: number; reason: string } {
    const surplus = masterBalance - investmentConfig.surplusThreshold

    if (surplus <= 0) {
      return { amount: 0, reason: "Aucun excédent à investir" }
    }

    let amount = 0
    let reason = ""

    if (investmentConfig.investmentMode === "total") {
      // Total mode: invest entire surplus
      amount = surplus
      reason = `Placement total de l'excédent (${amount.toLocaleString("fr-FR")} MAD)`
    } else {
      // Partial mode: invest quota percentage of surplus
      amount = Math.floor((surplus * investmentConfig.investmentQuota) / 100)
      reason = `Placement partiel: ${investmentConfig.investmentQuota}% de l'excédent (${amount.toLocaleString("fr-FR")} MAD sur ${surplus.toLocaleString("fr-FR")} MAD)`
    }

    // Check minimum investment
    if (investmentConfig.opcvmFund && amount < investmentConfig.opcvmFund.minInvestment) {
      return {
        amount: 0,
        reason: `Montant insuffisant (${amount.toLocaleString("fr-FR")} MAD) - minimum requis: ${investmentConfig.opcvmFund.minInvestment.toLocaleString("fr-FR")} MAD`,
      }
    }

    return { amount, reason }
  }

  /**
   * Check if redemption should be triggered (in case of deficit)
   */
  static shouldTriggerRedemption(
    masterBalance: number,
    investmentConfig: InvestmentConfig,
    portfolio?: InvestmentPortfolio,
  ): { shouldRedeem: boolean; amount: number; reason: string } {
    if (!investmentConfig.enabled || !investmentConfig.autoRedemptionEnabled) {
      return { shouldRedeem: false, amount: 0, reason: "Rachat automatique désactivé" }
    }

    if (!portfolio || portfolio.totalShares <= 0) {
      return { shouldRedeem: false, amount: 0, reason: "Aucune part OPCVM détenue" }
    }

    // Check if there's a deficit (negative balance)
    if (masterBalance >= 0) {
      return { shouldRedeem: false, amount: 0, reason: "Aucun déficit détecté" }
    }

    const deficit = Math.abs(masterBalance)
    const maxRedemptionAmount = portfolio.currentValue

    // Redeem up to available portfolio value
    const redemptionAmount = Math.min(deficit, maxRedemptionAmount)

    return {
      shouldRedeem: true,
      amount: redemptionAmount,
      reason: `Déficit de ${deficit.toLocaleString("fr-FR")} MAD - rachat de ${redemptionAmount.toLocaleString("fr-FR")} MAD (limite: ${maxRedemptionAmount.toLocaleString("fr-FR")} MAD)`,
    }
  }

  /**
   * Execute investment order
   */
  static executeInvestmentOrder(
    contract: CashPoolingContract,
    orderType: InvestmentOrderType,
    amount: number,
    masterBalance: number,
    portfolio?: InvestmentPortfolio,
  ): InvestmentOrder {
    if (!contract.investmentConfig) {
      return this.createFailedOrder(
        contract,
        orderType,
        amount,
        masterBalance,
        "Configuration d'investissement manquante",
      )
    }

    const config = contract.investmentConfig

    if (!config.opcvmFund) {
      return this.createFailedOrder(contract, orderType, amount, masterBalance, "OPCVM non défini")
    }

    // Validate currency match
    if (config.opcvmFund.currency !== contract.currency) {
      return this.createFailedOrder(
        contract,
        orderType,
        amount,
        masterBalance,
        `Devise incompatible: OPCVM en ${config.opcvmFund.currency}, contrat en ${contract.currency}`,
      )
    }

    const status: InvestmentOrderStatus = "executed"
    let reason = ""
    let newBalance = masterBalance

    if (orderType === "subscription") {
      // Subscription: invest surplus
      if (amount > masterBalance) {
        return this.createFailedOrder(
          contract,
          orderType,
          amount,
          masterBalance,
          `Fonds insuffisants: ${masterBalance.toLocaleString("fr-FR")} MAD disponibles`,
        )
      }

      newBalance = masterBalance - amount
      reason = `Souscription de ${amount.toLocaleString("fr-FR")} MAD en ${config.opcvmFund.name}`
    } else {
      // Redemption: sell shares to cover deficit
      if (!portfolio || portfolio.currentValue <= 0) {
        return this.createFailedOrder(contract, orderType, amount, masterBalance, "Aucune part OPCVM à racheter")
      }

      const maxRedemption = portfolio.currentValue
      if (amount > maxRedemption) {
        amount = maxRedemption
        reason = `Rachat partiel de ${amount.toLocaleString("fr-FR")} MAD - limite du portefeuille atteinte`
      } else {
        reason = `Rachat de ${amount.toLocaleString("fr-FR")} MAD en ${config.opcvmFund.name}`
      }

      newBalance = masterBalance + amount
    }

    // Calculate shares (simplified: 1 MAD = 1 share for demonstration)
    const shares = amount

    return {
      id: `inv-${Date.now()}`,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      orderType,
      amount,
      shares,
      opcvmFundId: config.opcvmFund.id,
      opcvmFundName: config.opcvmFund.name,
      status,
      reason,
      createdAt: new Date(),
      executedAt: new Date(),
      masterAccountBalanceBefore: masterBalance,
      masterAccountBalanceAfter: newBalance,
    }
  }

  private static createFailedOrder(
    contract: CashPoolingContract,
    orderType: InvestmentOrderType,
    amount: number,
    masterBalance: number,
    reason: string,
  ): InvestmentOrder {
    return {
      id: `inv-${Date.now()}`,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      orderType,
      amount,
      opcvmFundId: contract.investmentConfig?.opcvmFundId || "",
      opcvmFundName: contract.investmentConfig?.opcvmFund?.name || "N/A",
      status: "failed",
      reason,
      createdAt: new Date(),
      masterAccountBalanceBefore: masterBalance,
      masterAccountBalanceAfter: masterBalance,
    }
  }

  /**
   * Validate investment configuration
   */
  static validateInvestmentConfig(config: InvestmentConfig): string[] {
    const errors: string[] = []

    if (config.enabled) {
      if (config.surplusThreshold <= 0) {
        errors.push("Le seuil d'excédent doit être supérieur à 0")
      }

      if (config.investmentMode === "partial") {
        if (config.investmentQuota <= 0 || config.investmentQuota > 100) {
          errors.push("La quotité d'investissement doit être entre 1 et 100%")
        }
      }

      if (!config.opcvmFundId) {
        errors.push("Un OPCVM doit être sélectionné")
      }

      if (config.opcvmFund && !config.opcvmFund.isActive) {
        errors.push("L'OPCVM sélectionné n'est pas actif")
      }
    }

    return errors
  }
}
