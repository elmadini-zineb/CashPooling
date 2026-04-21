import jsPDF from "jspdf"
import type { SimulationHistoryEntry } from "./types"

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadSimulationCSV(entry: SimulationHistoryEntry) {
  const metadata = [
    ["Simulation ID", entry.id],
    ["Date", new Date(entry.createdAt).toLocaleString("fr-FR")],
    ["Utilisateur", entry.user],
    ["Contrat", `${entry.contractNumber} - ${entry.contractName}`],
    ["Mode", entry.parameters?.mode ?? ""],
    ["Montant cible", entry.parameters?.targetBalance ?? ""],
    ["Seuil minimum", entry.parameters?.minBalance ?? ""],
    ["Seuil maximum", entry.parameters?.maxBalance ?? ""],
    ["Solde central initial", entry.centralInitialBalance.toString()],
    ["Solde central final", entry.centralFinalBalance.toString()],
    ["Total transféré", entry.totalTransferred.toString()],
    ["Succès", entry.successCount.toString()],
    ["Partiel", entry.partialCount.toString()],
    ["Échoué", entry.failedCount.toString()],
    [],
    ["Accounts Summary"],
    ["Account Name", "Initial Balance", "Final Balance", "Status", "Reason"],
  ]

  const rows: string[][] = []

  entry.impacts.forEach((impact) => {
    rows.push([
      impact.account.companyName,
      impact.initialBalance.toString(),
      impact.finalBalance.toString(),
      impact.status,
      impact.reason,
    ])
  })

  rows.push([], ["Transfers"], ["Source", "Destination", "Montant", "Type", "Statut", "Commentaire"])

  entry.movements.forEach((movement) => {
    rows.push([
      movement.source,
      movement.destination,
      movement.amount.toString(),
      movement.operationType,
      movement.status,
      movement.reason,
    ])
  })

  const sanitized = (cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`
  const lines = [
    ...metadata.map((row) => row.map(sanitized).join(",")),
    ...rows.map((row) => row.map(sanitized).join(",")),
  ]

  const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" })
  downloadBlob(blob, `simulation-${entry.contractNumber}-${entry.id}.csv`)
}

export function downloadSimulationPDF(entry: SimulationHistoryEntry) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" })
  const margin = 40
  const pageWidth = pdf.internal.pageSize.getWidth()
  let y = margin

  const addText = (text: string, size = 10, options: { bold?: boolean; color?: string } = {}) => {
    pdf.setFont("helvetica", options.bold ? "bold" : "normal")
    pdf.setFontSize(size)
    if (options.color) {
      pdf.setTextColor(options.color)
    } else {
      pdf.setTextColor(0, 0, 0)
    }
    pdf.text(text, margin, y)
    y += size + 6
    if (y > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage()
      y = margin
    }
  }

  addText("Cash Pooling Simulation Report", 16, { bold: true })
  addText(`Simulation ID: ${entry.id}`, 10)
  addText(`Date: ${new Date(entry.createdAt).toLocaleString("fr-FR")}`, 10)
  addText(`Utilisateur: ${entry.user}`, 10)
  addText(`Contrat: ${entry.contractNumber} - ${entry.contractName}`, 10)
  addText(`Mode: ${entry.parameters.mode}`, 10)

  if (entry.parameters.targetBalance !== undefined) {
    addText(`Montant cible: ${entry.parameters.targetBalance.toLocaleString("fr-FR")} MAD`, 10)
  }
  if (entry.parameters.minBalance !== undefined) {
    addText(`Seuil minimum: ${entry.parameters.minBalance.toLocaleString("fr-FR")} MAD`, 10)
  }
  if (entry.parameters.maxBalance !== undefined) {
    addText(`Seuil maximum: ${entry.parameters.maxBalance.toLocaleString("fr-FR")} MAD`, 10)
  }

  addText(``, 10)
  addText("Résumé", 12, { bold: true })
  addText(`Total transféré: ${entry.totalTransferred.toLocaleString("fr-FR")} MAD`, 10)
  addText(`Solde central initial: ${entry.centralInitialBalance.toLocaleString("fr-FR")} MAD`, 10)
  addText(`Solde central final: ${entry.centralFinalBalance.toLocaleString("fr-FR")} MAD`, 10)
  addText(`Succès: ${entry.successCount} | Partiel: ${entry.partialCount} | Échoué: ${entry.failedCount}`, 10)
  addText(``, 10)

  addText("Accounts Summary", 12, { bold: true })
  addText("Compte | Solde initial | Solde final | Statut", 10, { bold: true })
  entry.impacts.forEach((impact) => {
    addText(
      `${impact.account.companyName} | ${impact.initialBalance.toLocaleString("fr-FR")} MAD | ${impact.finalBalance.toLocaleString("fr-FR")} MAD | ${impact.status}`,
      9,
    )
  })
  addText(``, 10)

  addText("Transfers", 12, { bold: true })
  addText("Source | Destination | Montant | Type | Statut | Commentaire", 10, { bold: true })
  entry.movements.forEach((movement) => {
    addText(`Source: ${movement.source}`, 9, { bold: true })
    addText(`Destination: ${movement.destination}`, 9)
    addText(`Montant: ${movement.amount.toLocaleString("fr-FR")} MAD`, 9)
    addText(`Type: ${movement.operationType}`, 9)
    addText(`Statut: ${movement.status}`, 9)
    addText(`Commentaire: ${movement.reason}`, 9)
    addText(``, 8)
  })
  entry.movements.forEach((movement) => {
    addText(`Source: ${movement.source}`, 9, { bold: true })
    addText(`Destination: ${movement.destination}`, 9)
    addText(`Montant: ${movement.amount.toLocaleString("fr-FR")} MAD`, 9)
    addText(`Type: ${movement.operationType}`, 9)
    addText(`Statut: ${movement.status}`, 9)
    addText(`Commentaire: ${movement.reason}`, 9)
    addText(``, 8)
  })

  addText("Impact par compte", 12, { bold: true })
  entry.impacts.forEach((impact) => {
    addText(`Compte: ${impact.account.companyName}`, 9, { bold: true })
    addText(`Solde initial: ${impact.initialBalance.toLocaleString("fr-FR")} MAD`, 9)
    addText(`Solde final: ${impact.finalBalance.toLocaleString("fr-FR")} MAD`, 9)
    addText(`Variation nette: ${impact.netChange.toLocaleString("fr-FR")} MAD`, 9)
    addText(`Statut: ${impact.status}`, 9)
    addText(`Commentaire: ${impact.reason}`, 9)
    addText(``, 8)
  })

  addText("Journal de simulation", 12, { bold: true })
  entry.logEntries.forEach((line) => {
    addText(`- ${line}`, 9)
  })

  const blob = pdf.output("blob")
  downloadBlob(blob, `simulation-${entry.contractNumber}-${entry.id}.pdf`)
}
