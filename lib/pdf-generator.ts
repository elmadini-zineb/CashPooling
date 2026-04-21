import jsPDF from "jspdf"
import type { CashPoolingContract, HierarchicalAccount } from "./types"
import { HierarchyManager } from "./hierarchy-manager"
import { formatScheduling } from "./format-helpers"

export class PDFGenerator {
  static generateContractPDF(contract: CashPoolingContract, hierarchy: HierarchicalAccount | null): Blob {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15
    let yPos = margin

    const allSecondaryAccounts = hierarchy ? HierarchyManager.flattenToPoolableAccounts(hierarchy) : []

    // Helper function to add text with automatic page break
    const addText = (text: string, fontSize = 10, isBold = false, color: [number, number, number] = [0, 0, 0]) => {
      if (yPos > pageHeight - 20) {
        pdf.addPage()
        yPos = margin
      }
      pdf.setFontSize(fontSize)
      pdf.setFont("helvetica", isBold ? "bold" : "normal")
      pdf.setTextColor(...color)
      pdf.text(text, margin, yPos)
      yPos += fontSize / 2 + 3
    }

    const addLine = () => {
      pdf.setDrawColor(200, 200, 200)
      pdf.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 5
    }

    const addSectionTitle = (title: string) => {
      addText(title, 14, true, [0, 102, 204])
      yPos += 2
    }

    const addSubsectionTitle = (title: string) => {
      addText(title, 11, true, [51, 51, 51])
      yPos += 1
    }

    // Header
    pdf.setFillColor(230, 83, 0) // Orange
    pdf.rect(0, 0, pageWidth, 30, "F")
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("FICHE CLIENT – SOUSCRIPTION CASH POOLING", pageWidth / 2, 18, { align: "center" })

    yPos = 40

    // Title
    addText(`Référence Contrat: ${contract.contractNumber}`, 12, true, [230, 83, 0])
    addText(`Date de création: ${new Date(contract.createdAt).toLocaleDateString("fr-FR")}`, 10)
    yPos += 3
    addLine()

    // 1. INFORMATIONS GÉNÉRALES DU CLIENT
    addSectionTitle("1. INFORMATIONS GÉNÉRALES DU CLIENT")
    addText(`Raison sociale: ${contract.clientName}`)
    addText(`Forme juridique: Société Anonyme (SA)`)
    addText(`Identifiant Client: ${contract.clientId}`)
    addText(`Devise: ${contract.currency}`)
    addText(`Statut du contrat: ${this.formatStatus(contract.status)}`)
    addText(`Adresse du siège social: Adresse à confirmer`)
    yPos += 5
    addLine()

    // 2. REPRÉSENTANTS LÉGAUX
    addSectionTitle("2. REPRÉSENTANTS LÉGAUX")
    addText(`Nom & Prénom: À confirmer par le client`)
    addText(`Fonction: Directeur Général`)
    addText(`Pièce d'identité: À confirmer`)
    addText(`Pouvoirs de signature: Signature unique`)
    yPos += 5
    addLine()

    // 3. STRUCTURE CASH POOLING
    addSectionTitle("3. GROUPE / STRUCTURE CASH POOLING")
    
    const poolingType = contract.notionalConfig?.enabled ? "Cash pooling notionnel" : "Cash pooling physique"
    addText(`Type de cash pooling: ☑ ${poolingType}`)
    
    if (hierarchy) {
      addText(`Société tête de groupe (Leader): ${hierarchy.account.clientName}`)
    }
    
    yPos += 3
    addSubsectionTitle("Sociétés participantes:")
    allSecondaryAccounts.slice(0, 5).forEach((config) => {
      addText(`• ${config.account.clientName}`, 9)
    })
    
    addText(`Pays concernés: Maroc`)
    addText(`Devise du cash pooling: ${contract.currency}`)
    yPos += 5
    addLine()

    // 4. COMPTES BANCAIRES CONCERNÉS
    addSectionTitle("4. COMPTES BANCAIRES CONCERNÉS")
    
    // Table header
    const colWidth = (pageWidth - 2 * margin) / 5
    const tableStartY = yPos
    
    pdf.setFillColor(0, 102, 204)
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "bold")
    
    const headers = ["Rôle", "Société", "N° de compte", "Devise", "Solde"]
    headers.forEach((header, i) => {
      pdf.text(header, margin + i * colWidth + 2, yPos)
    })
    
    yPos += 7
    pdf.setTextColor(0, 0, 0)
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8)
    
    // Master account row
    pdf.setFillColor(240, 248, 255)
    pdf.rect(margin, yPos - 4, pageWidth - 2 * margin, 5, "F")
    pdf.text("Compte pivot", margin + 2, yPos)
    pdf.text(contract.masterAccount?.clientName || "N/A", margin + colWidth + 2, yPos)
    pdf.text(contract.masterAccount?.accountNumber.substring(0, 10) || "N/A", margin + 2 * colWidth + 2, yPos)
    pdf.text(contract.currency, margin + 3 * colWidth + 2, yPos)
    pdf.text(contract.masterAccount?.balance.toLocaleString("fr-FR") || "0", margin + 4 * colWidth + 2, yPos)
    yPos += 6

    // Secondary accounts rows
    allSecondaryAccounts.forEach((config, index) => {
      if (index >= 3) return // Limit to 3 rows in this section
      if (yPos > pageHeight - 30) {
        pdf.addPage()
        yPos = margin
      }
      
      pdf.text("Compte participant", margin + 2, yPos)
      pdf.text(config.account.clientName, margin + colWidth + 2, yPos)
      pdf.text(config.account.accountNumber.substring(0, 10), margin + 2 * colWidth + 2, yPos)
      pdf.text(config.account.currency, margin + 3 * colWidth + 2, yPos)
      pdf.text(config.account.balance.toLocaleString("fr-FR"), margin + 4 * colWidth + 2, yPos)
      yPos += 6
    })

    yPos += 5
    addLine()

    // 5. MODALITÉS DU CASH POOLING
    addSectionTitle("5. MODALITÉS DU CASH POOLING")
    
    if (!contract.notionalConfig?.enabled) {
      addText(`Périodicité de centralisation: Quotidienne`)
      addText(`Heure de traitement: 18h00`)
      addText(`Seuil minimum: 0 ${contract.currency}`)
      addText(`Gestion des soldes débiteurs: ${allSecondaryAccounts.some(acc => acc.debitCoverage?.enabled) ? "Autorisée" : "Désactivée"}`)
      addText(`Taux d'intérêt créditeur: Selon tarification CIH Bank`)
      addText(`Taux d'intérêt débiteur: Selon tarification CIH Bank`)
    } else {
      addText(`Type: Cash Pooling Notionnel`)
      addText(`Consolidation: Temps réel`)
      addText(`Compte miroir: Activé`)
      addText(`Autorisation opérations: Basée sur solde consolidé`)
    }

    if (contract.investmentConfig?.enabled) {
      yPos += 3
      addSubsectionTitle("Configuration des placements OPCVM:")
      addText(`OPCVM: ${contract.investmentConfig.opcvmFund?.name || "N/A"}`)
      addText(`ISIN: ${contract.investmentConfig.opcvmFund?.isin || "N/A"}`)
      addText(`Seuil d'excédent: ${contract.investmentConfig.surplusThreshold.toLocaleString("fr-FR")} ${contract.currency}`)
      addText(`Mode investissement: ${contract.investmentConfig.investmentMode === "total" ? "Total" : `Partiel (${contract.investmentConfig.investmentQuota}%)`}`)
      addText(`Rachat automatique: ${contract.investmentConfig.autoRedemptionEnabled ? "Activé" : "Désactivé"}`)
      addText(`Fréquence: ${formatScheduling(contract.investmentConfig.scheduling)}`)
    }

    yPos += 5
    addLine()

    // 6. CONDITIONS CONTRACTUELLES
    addSectionTitle("6. CONDITIONS CONTRACTUELLES")
    addText(`Date d'effet souhaitée: ${new Date(contract.createdAt).toLocaleDateString("fr-FR")}`)
    addText(`Durée du contrat: 1 an renouvelable`)
    addText(`Frais de mise en place: Selon tarification bancaire`)
    addText(`Facturation: Mensuelle`)
    addText(`Créé par: ${contract.createdBy}`)
    yPos += 5
    addLine()

    // 7. VALIDATION & CONFORMITÉ
    addSectionTitle("7. VALIDATION & CONFORMITÉ")
    addText(`KYC à jour: Oui`)
    addText(`Conformité réglementaire: Validée`)
    addText(`Accord du client: Oui`)
    yPos += 5
    addLine()

    // 8. TERMS
    addSectionTitle("8. CONDITIONS GÉNÉRALES")
    pdf.setFontSize(9)
    const terms = [
      "Le présent contrat établit les conditions de gestion du Cash Pooling entre le compte",
      "centralisateur et les comptes secondaires désignés ci-dessus.",
      "",
      "Les opérations de nivellement s'effectuent automatiquement selon la périodicité et les",
      "paramètres définis. Toute modification de ces paramètres s'applique uniquement aux",
      "opérations futures.",
      "",
      "Le client peut à tout moment demander la suspension ou la résiliation du présent contrat",
      "sous réserve d'un préavis de trente (30) jours.",
      "",
      "Les tarifs appliqués sont conformes à la tarification bancaire en vigueur chez CIH Bank.",
    ]

    terms.forEach((line) => {
      if (yPos > pageHeight - 30) {
        pdf.addPage()
        yPos = margin
      }
      if (line.trim() === "") {
        yPos += 2
      } else {
        pdf.text(line, margin, yPos)
        yPos += 4
      }
    })

    yPos += 8
    addLine()

    // 9. SIGNATURES
    addSectionTitle("9. SIGNATURES")
    yPos += 5
    pdf.setFontSize(10)
    pdf.text("Lieu & Date: Casablanca, le _______________", margin, yPos)
    yPos += 10
    pdf.text("CIH Bank", margin + 15, yPos)
    pdf.text("Client", pageWidth - margin - 50, yPos)
    yPos += 8
    pdf.line(margin, yPos, margin + 50, yPos)
    pdf.line(pageWidth - margin - 50, yPos, pageWidth - margin, yPos)
    yPos += 3
    pdf.text("Signature", margin + 15, yPos)
    pdf.text("Signature", pageWidth - margin - 50, yPos)

    // Footer
    yPos = pageHeight - 10
    pdf.setFontSize(7)
    pdf.setTextColor(150, 150, 150)
    pdf.text("CIH BANK - Document généré électroniquement - Contrat Cash Pooling", pageWidth / 2, yPos, {
      align: "center",
    })

    return pdf.output("blob")
  }

  private static formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      registered: "Enregistré",
      active: "Actif",
      suspended: "Suspendu",
      terminated: "Résilié",
      draft: "Brouillon",
    }
    return statusMap[status] || status
  }

  private static addHierarchyToPDF(
    pdf: jsPDF,
    node: HierarchicalAccount,
    level: number,
    margin: number,
    startY: number,
    pageWidth: number,
    pageHeight: number,
  ) {
    const roleLabel =
      node.role === "centralizer" ? "Centralisateur" : node.role === "intermediate" ? "Intermédiaire" : "Secondaire"

    const indent = margin + level * 8
    pdf.setFontSize(9)
    pdf.text(`• ${node.account.clientName} (${roleLabel})`, indent, startY)
    startY += 5
    pdf.text(`  N°: ${node.account.accountNumber}`, indent, startY)
    startY += 5

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        if (startY > pageHeight - 30) {
          pdf.addPage()
          startY = margin
        }
        this.addHierarchyToPDF(pdf, child, level + 1, margin, startY, pageWidth, pageHeight)
        startY += 10
      })
    }
  }

  static downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
