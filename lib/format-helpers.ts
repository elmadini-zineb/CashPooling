import type { PeriodicityType, PeriodicityUnit, SchedulingConfig } from "./types"

export function formatSchedulingFrequency(scheduling: SchedulingConfig): string {
  switch (scheduling.frequency) {
    case "daily":
      return scheduling.executionTime ? `Quotidienne à ${scheduling.executionTime}` : "Quotidienne"

    case "weekly":
      const weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]
      const dayName = scheduling.weeklyDay ? weekDays[scheduling.weeklyDay - 1] : ""
      return scheduling.executionTime
        ? `Hebdomadaire - ${dayName} à ${scheduling.executionTime}`
        : `Hebdomadaire - ${dayName}`

    case "monthly":
      return scheduling.executionTime
        ? `Mensuelle - Jour ${scheduling.monthlyDay} à ${scheduling.executionTime}`
        : `Mensuelle - Jour ${scheduling.monthlyDay}`

    case "end_of_month":
      return scheduling.executionTime ? `Fin de mois à ${scheduling.executionTime}` : "Fin de mois"

    case "future_date":
      if (scheduling.futureDate) {
        return `Date future: ${scheduling.futureDate.toLocaleDateString("fr-FR")}`
      }
      return "À date future"

    default:
      return "Non définie"
  }
}

export function formatContractPeriodicity(
  periodicityType?: PeriodicityType,
  frequency?: number,
  unit?: PeriodicityUnit,
  executionTime?: string,
): string {
  switch (periodicityType) {
    case "DAILY":
      return executionTime ? `Quotidienne à ${executionTime}` : "Quotidienne"
    case "WEEKLY":
      return executionTime ? `Hebdomadaire à ${executionTime}` : "Hebdomadaire"
    case "MONTHLY":
      return executionTime ? `Mensuelle à ${executionTime}` : "Mensuelle"
    case "REAL_TIME":
      return "Temps réel"
    case "CUSTOM": {
      if (!frequency || !unit) return "Personnalisée"
      const unitLabel = unit === "DAY" ? "jour(s)" : unit === "WEEK" ? "semaine(s)" : "mois"
      return executionTime
        ? `Toutes les ${frequency} ${unitLabel} à ${executionTime}`
        : `Toutes les ${frequency} ${unitLabel}`
    }
    default:
      return "Périodicité non définie"
  }
}

export const formatScheduling = formatSchedulingFrequency
