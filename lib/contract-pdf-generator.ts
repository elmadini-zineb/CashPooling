import jsPDF from 'jspdf'
import type { CashPoolingContract, Account, AdriaModularPricing } from '@/lib/types'

interface ContractGenerationOptions {
  pricing?: AdriaModularPricing
  users?: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    accountType: string
    accountNumber: string
    profile: string
    threshold?: number
  }>
}

class ContractPDFGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private currentY: number
  private margin = 12
  private readonly BLUE_COLOR = [255, 107, 53] // #FF6B35 Orange Adria
  private readonly BLUE_LIGHT = [255, 237, 220] // Light orange for backgrounds
  private readonly TEXT_COLOR = [0, 0, 0]
  private readonly GRAY_COLOR = [148, 163, 184]
  private readonly TABLE_BORDER = [226, 232, 240]
  private totalPages = 5
  private currentPageNum = 0
  private options: ContractGenerationOptions = {}

  constructor(options?: ContractGenerationOptions) {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.currentY = this.margin
    this.options = options || {}
    
    // Calculate total pages based on users
    this.totalPages = 4 + (options?.users?.length || 0) + 1 // Pages 1-4 + user pages + final conditions
  }

  private getStatusBadgeColor(status: string): [number, number, number] {
    switch (status) {
      case 'registered': return [156, 163, 175] // Grey
      case 'active': return [34, 197, 94] // Green
      case 'suspended': return [249, 115, 22] // Orange
      case 'terminated': return [239, 68, 68] // Red
      default: return [156, 163, 175]
    }
  }

  private drawContractHeader(contract: CashPoolingContract) {
    // Title
    this.doc.setTextColor(...this.TEXT_COLOR)
    this.doc.setFont('Helvetica', 'bold')
    this.doc.setFontSize(13)
    this.doc.text('CONVENTION DE CASH POOLING', this.pageWidth / 2, this.currentY + 5, {
      align: 'center',
    })

    // Status badge (top right)
    const badgeColor = this.getStatusBadgeColor(contract.status)
    this.doc.setFillColor(...badgeColor)
    this.doc.rect(this.pageWidth - this.margin - 30, this.currentY + 2, 30, 6, 'F')
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFont('Helvetica', 'bold')
    this.doc.setFontSize(7)
    const statusLabel = contract.status === 'registered' ? 'Registered' : 
                       contract.status === 'active' ? 'Actif' :
                       contract.status === 'suspended' ? 'Suspendu' : 'Clôturé'
    this.doc.text(statusLabel, this.pageWidth - this.margin - 15, this.currentY + 5, { align: 'center' })

    // Contract info
    this.doc.setFontSize(7.5)
    this.doc.setFont('Helvetica', 'normal')
    this.doc.setTextColor(...this.TEXT_COLOR)
    const contratId = `CP-${contract.contractNumber.substring(0, 8)}`
    const today = new Date()
    const dateStr = today.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    
    this.doc.text(`Identifiant : ${contratId}`, this.margin, this.currentY + 5)
    this.doc.text(`Date : ${dateStr}`, this.margin, this.currentY + 9)

    this.currentY = this.currentY + 15
  }

  private drawSectionHeader(title: string) {
    // Orange background rectangle
    this.doc.setFillColor(...this.BLUE_COLOR)
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 7, 'F')

    // White text
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFont('Helvetica', 'bold')
    this.doc.setFontSize(10)
    this.doc.text(title, this.margin + 3, this.currentY + 4.5)

    this.currentY += 8
  }

  private drawCardHeader(title: string) {
    this.doc.setFillColor(...this.BLUE_COLOR)
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 6, 'F')
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFont('Helvetica', 'bold')
    this.doc.setFontSize(9)
    this.doc.text(title, this.margin + 2, this.currentY + 4)
    this.currentY += 5
  }

  private drawText(text: string, options: { size?: number; bold?: boolean; x?: number } = {}) {
    const { size = 9, bold = false, x = this.margin } = options
    this.doc.setTextColor(...this.TEXT_COLOR)
    this.doc.setFont('Helvetica', bold ? 'bold' : 'normal')
    this.doc.setFontSize(size)

    const maxWidth = this.pageWidth - 2 * this.margin - (x - this.margin)
    const splitText = this.doc.splitTextToSize(text, maxWidth)
    
    this.doc.text(splitText, x, this.currentY)
    const lineHeight = size * 0.35
    this.currentY += splitText.length * lineHeight + 0.8
  }

  private drawTable(headers: string[], rows: string[][], columnWidths: number[]) {
    const startY = this.currentY
    const rowHeight = 6.5
    const cellPadding = 1

    // Center table horizontally
    const totalWidth = columnWidths.reduce((a, b) => a + b, 0)
    const availableWidth = this.pageWidth - 2 * this.margin
    const tableStartX = this.margin + (availableWidth - totalWidth) / 2

    // Table header
    this.doc.setFillColor(...this.BLUE_COLOR)
    this.doc.setLineWidth(0.3)
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFont('Helvetica', 'bold')
    this.doc.setFontSize(7.5)

    let xPos = tableStartX
    for (let i = 0; i < headers.length; i++) {
      // Draw header cell
      this.doc.setDrawColor(...this.BLUE_COLOR)
      this.doc.rect(xPos, startY, columnWidths[i], rowHeight, 'F')
      this.doc.rect(xPos, startY, columnWidths[i], rowHeight)
      
      // Draw header text
      const headerText = headers[i]
      this.doc.text(headerText, xPos + cellPadding, startY + 4, {
        maxWidth: columnWidths[i] - 2 * cellPadding,
        overflow: 'ellipsis'
      })
      xPos += columnWidths[i]
    }

    // Table rows
    this.doc.setTextColor(...this.TEXT_COLOR)
    this.doc.setFont('Helvetica', 'normal')
    this.doc.setFontSize(7.5)
    this.doc.setDrawColor(...this.TABLE_BORDER)
    this.doc.setLineWidth(0.2)

    let currentRowY = startY + rowHeight
    for (const row of rows) {
      xPos = tableStartX
      for (let i = 0; i < row.length; i++) {
        // Draw cell border
        this.doc.rect(xPos, currentRowY, columnWidths[i], rowHeight)
        
        // Draw cell text
        const cellText = row[i] || ''
        this.doc.text(cellText, xPos + cellPadding, currentRowY + 4, {
          maxWidth: columnWidths[i] - 2 * cellPadding,
          overflow: 'ellipsis'
        })
        xPos += columnWidths[i]
      }
      currentRowY += rowHeight
    }

    this.currentY = currentRowY + 2
  }

  private drawSignatureBlock(signatories: string[] = ['Representant legal', 'Abone', 'CAF (Cachet)']) {
    const blockStartY = this.currentY
    const totalWidth = this.pageWidth - 2 * this.margin
    const signatoryWidth = totalWidth / 3
    const padding = 3

    for (let i = 0; i < 3; i++) {
      const xPos = this.margin + i * signatoryWidth

      // Signature line
      this.doc.setDrawColor(...this.GRAY_COLOR)
      this.doc.setLineWidth(0.3)
      this.doc.line(xPos + padding, blockStartY + 8, xPos + signatoryWidth - padding, blockStartY + 8)

      // Label
      this.doc.setTextColor(...this.TEXT_COLOR)
      this.doc.setFont('Helvetica', 'bold')
      this.doc.setFontSize(8)
      this.doc.text(signatories[i], xPos + signatoryWidth / 2, blockStartY + 13, { align: 'center' })

      // Prefix text
      this.doc.setFont('Helvetica', 'normal')
      this.doc.setFontSize(7)
      this.doc.text('A preceder de la mention', xPos + signatoryWidth / 2, blockStartY + 17, { align: 'center' })
      this.doc.text('"lu et approuve"', xPos + signatoryWidth / 2, blockStartY + 19.5, { align: 'center' })

      // Date placeholder
      this.doc.setFontSize(7)
      this.doc.text('Fait a .... le ../../....', xPos + signatoryWidth / 2, blockStartY + 24, { align: 'center' })
    }

    this.currentY = blockStartY + 28
  }

  private formatAmount(amount: number, currency: string = 'MAD'): string {
    return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currency
  }

  private formatPercentage(percentage: number): string {
    return percentage.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %'
  }

  private checkPageBreak(requiredSpace: number = 20) {
    if (this.currentY + requiredSpace > this.pageHeight - 15) {
      this.addPage()
    }
  }

  private addPage() {
    this.currentPageNum++
    this.doc.addPage()
    this.currentY = this.margin
  }

  private drawPageNumber() {
    this.doc.setTextColor(...this.GRAY_COLOR)
    this.doc.setFontSize(8)
    this.doc.setFont('Helvetica', 'normal')
    this.doc.text(
      `Page ${this.currentPageNum} / ${this.totalPages}`,
      this.pageWidth - this.margin - 30,
      this.pageHeight - 10
    )
  }

  private drawFloatingActionBar() {
    // Removed: floating action bars are UI elements, not PDF content
  }

  public generatePage1(contract: CashPoolingContract) {
    this.currentPageNum = 1
    this.currentY = this.margin

    // Contract header with logo and status
    this.drawContractHeader(contract)

    // Section 1: Identification Client
    this.drawSectionHeader('SECTION 1 — IDENTIFICATION CLIENT')
    this.checkPageBreak(30)

    const tierNum = contract.clientId || 'N/A'
    const numComptes = (contract.secondaryAccounts?.length || 0) + 1
    const pricingAccount = contract.masterAccount?.iban || 'FR763000...'

    // Add spacing
    this.currentY += 2

    // Card content
    this.doc.setFillColor(...this.BLUE_LIGHT)
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 1, 'F')

    const infos = [
      ['Numéro tiers', tierNum],
      ['Intitulé', contract.clientName],
      ['Nombre de comptes', numComptes.toString()],
      ['Compte de tarification', pricingAccount],
      ['Adresse', 'Adresse du client'],
      ['Agence client', '76501'],
    ]

    const colWidth = (this.pageWidth - 2 * this.margin) / 2
    let isFirstCol = true
    let rowStartY = this.currentY

    for (let i = 0; i < infos.length; i += 2) {
      const label1 = infos[i][0]
      const value1 = infos[i][1]
      const label2 = infos[i + 1]?.[0] || ''
      const value2 = infos[i + 1]?.[1] || ''

      // Left column
      this.doc.setFont('Helvetica', 'bold')
      this.doc.setFontSize(7.5)
      this.doc.setTextColor(...this.TEXT_COLOR)
      this.doc.text(label1, this.margin + 2, this.currentY)

      this.doc.setFont('Helvetica', 'normal')
      this.doc.setFontSize(7.5)
      this.doc.text(value1, this.margin + 2, this.currentY + 3)

      // Right column (if exists)
      if (label2) {
        this.doc.setFont('Helvetica', 'bold')
        this.doc.text(label2, this.margin + colWidth + 2, this.currentY)
        
        this.doc.setFont('Helvetica', 'normal')
        this.doc.text(value2, this.margin + colWidth + 2, this.currentY + 3)
      }

      this.currentY += 7
    }

    this.currentY += 5

    // Display Master Account
    this.doc.setFont('Helvetica', 'bold')
    this.doc.setFontSize(8)
    this.doc.setTextColor(...this.TEXT_COLOR)
    this.doc.text('Compte Centralisateur:', this.margin + 2, this.currentY)
    this.currentY += 4

    if (contract.masterAccount) {
      this.doc.setFont('Helvetica', 'normal')
      this.doc.setFontSize(7.5)
      this.doc.text(`${contract.masterAccount.accountNumber} - ${contract.masterAccount.clientName}`, this.margin + 4, this.currentY)
      this.currentY += 3
    }

    // Display Secondary Accounts
    if (contract.secondaryAccounts && contract.secondaryAccounts.length > 0) {
      this.doc.setFont('Helvetica', 'bold')
      this.doc.setFontSize(8)
      this.doc.text('Comptes Secondaires:', this.margin + 2, this.currentY)
      this.currentY += 4

      contract.secondaryAccounts.forEach((acc, idx) => {
        this.doc.setFont('Helvetica', 'normal')
        this.doc.setFontSize(7.5)
        this.doc.text(`${idx + 1}. ${acc.accountNumber} - ${acc.clientName}`, this.margin + 4, this.currentY)
        this.currentY += 3
      })
    }

    this.currentY += 3

    // Section 2: Comptes au sein de la structure (Table)
    this.drawSectionHeader('SECTION 2 — COMPTES AU SEIN DE LA STRUCTURE')
    this.checkPageBreak(40)

    const accountHeaders = ['Numéro de compte (IBAN)', 'Intitulé', 'Rôle', 'Mode de nivellement', 'Statut']
    const accountRows: string[][] = []

    if (contract.masterAccount) {
      accountRows.push([
        contract.masterAccount.iban?.substring(0, 20) || 'FR763...185',
        contract.masterAccount.clientName,
        'Centralisateur',
        '—',
        'Actif',
      ])
    }

    if (contract.secondaryAccounts) {
      const modes = ['ZBA', 'TBA', 'FBA', 'ZBA', 'TBA']
      contract.secondaryAccounts.forEach((acc, idx) => {
        accountRows.push([
          acc.iban?.substring(0, 20) || '',
          acc.clientName,
          idx === 0 ? 'Secondaire' : idx === contract.secondaryAccounts.length - 1 ? 'Intermédiaire' : 'Secondaire',
          modes[idx % modes.length],
          'Actif',
        ])
      })
    }

    const accountColumnWidths = [40, 40, 24, 24, 22]
    this.drawTable(accountHeaders, accountRows, accountColumnWidths)

    this.drawPageNumber()
  }

  public generatePage2(contract: CashPoolingContract) {
    this.addPage()
    this.currentY = this.margin

    // Section 3: Paramètres de nivellement
    this.drawSectionHeader('SECTION 3 — PARAMÈTRES DE NIVELLEMENT')
    this.checkPageBreak(40)

    const levelingHeaders = ['Compte (IBAN)', 'Mode', 'Paramètres', 'Couverture débitrice', 'Priorité']
    const levelingRows: string[][] = []

    if (contract.secondaryAccounts) {
      const modes = ['ZBA', 'TBA', 'FBA', 'ZBA', 'TBA']
      const params = ['Solde cible : 0,00 MAD', 'Solde cible : 50 000,00 MAD', 'Seuil min : 10 000,00 MAD / Seuil max : 100 000,00 MAD']
      const coverage = ['Full', 'Partial', 'Full', 'Partial', 'Full']

      contract.secondaryAccounts.forEach((acc, idx) => {
        levelingRows.push([
          acc.iban?.substring(0, 15) || '',
          modes[idx % modes.length],
          params[idx % params.length],
          coverage[idx % coverage.length],
          (idx + 1).toString(),
        ])
      })
    }

    const levelingColumnWidths = [35, 20, 45, 30, 20]
    this.drawTable(levelingHeaders, levelingRows, levelingColumnWidths)

    this.currentY += 3

    // Section 4: Tarification (Two columns)
    this.drawSectionHeader('SECTION 4 — TARIFICATION')
    this.checkPageBreak(40)

    const colWidth = (this.pageWidth - 3 * this.margin) / 2
    const leftX = this.margin
    const rightX = this.margin + colWidth + this.margin

    // Left Card: Mode & Compte de tarification
    this.doc.setFillColor(...this.BLUE_LIGHT)
    this.doc.rect(leftX, this.currentY - 2, colWidth, 1, 'F')
    this.doc.setTextColor(...this.TEXT_COLOR)
    this.doc.setFont('Helvetica', 'bold')
    this.doc.setFontSize(8)
    this.doc.text('Mode & Compte de tarification', leftX + 2, this.currentY + 1)
    this.currentY += 4

    this.doc.setFont('Helvetica', 'normal')
    this.doc.setFontSize(7.5)
    this.doc.text('Mode de tarification :', leftX + 2, this.currentY)
    this.doc.setFont('Helvetica', 'bold')
    this.doc.text('Report simple (EBICS)', leftX + 2, this.currentY + 3)
    
    this.doc.setFont('Helvetica', 'normal')
    this.doc.text('Compte de tarification :', leftX + 2, this.currentY + 6)
    this.doc.setFont('Helvetica', 'bold')
    const pricingAccountIban = contract.masterAccount?.iban || 'FR763...185'
    this.doc.text(pricingAccountIban.substring(0, 20) + ' — ' + (contract.masterAccount?.clientName || 'Groupe Vortex Global'), leftX + 2, this.currentY + 9)
    
    this.doc.setFont('Helvetica', 'normal')
    this.doc.text('Devise :', leftX + 2, this.currentY + 12)
    this.doc.setFont('Helvetica', 'bold')
    this.doc.text(contract.currency || 'MAD', leftX + 2, this.currentY + 15)

    // Right Card: Détail de la tarification
    const pricingStartY = this.currentY - 2
    this.doc.setFillColor(...this.BLUE_LIGHT)
    this.doc.rect(rightX, pricingStartY, colWidth, 1, 'F')
    this.doc.setTextColor(...this.TEXT_COLOR)
    this.doc.setFont('Helvetica', 'bold')
    this.doc.setFontSize(8)
    this.doc.text('Détail de la tarification', rightX + 2, this.currentY + 1)

    let pricingY = this.currentY + 4
    this.doc.setFont('Helvetica', 'bold')
    this.doc.setFontSize(7.5)
    this.doc.text('Détail de la tarification', rightX + 2, pricingY)

    this.doc.setFont('Helvetica', 'normal')
    this.doc.setFontSize(7)
    pricingY += 4
    this.doc.text(`Frais d'ouverture : ${this.formatAmount(contract.pricingConfig?.openingFees || 0)} ${contract.currency || 'MAD'}`, rightX + 4, pricingY)
    pricingY += 3
    this.doc.text(`Abonnement mensuel : ${this.formatAmount(contract.pricingConfig?.monthlySubscription || 0)} ${contract.currency || 'MAD'}`, rightX + 4, pricingY)
    pricingY += 3
    this.doc.text(`Frais de contrat : ${this.formatAmount(contract.pricingConfig?.contractGenerationFees || 0)} ${contract.currency || 'MAD'}`, rightX + 4, pricingY)

    pricingY += 4
    this.doc.setFont('Helvetica', 'italic')
    this.doc.setFontSize(6.5)
    this.doc.text('Note: Ce contrat utilise la tarification simple standard sans calcul tarifaire avancé.', rightX + 4, pricingY)

    this.currentY = Math.max(this.currentY + 20, pricingStartY + 55)
    this.currentY += 1

    // Discounts box
    this.doc.setFillColor(253, 230, 138) // Yellow/Amber light
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 'F')
    this.doc.setTextColor(...this.TEXT_COLOR)
    this.doc.setFont('Helvetica', 'bold')
    this.doc.setFontSize(8)
    this.doc.text('Remises appliquées', this.margin + 2, this.currentY + 3)

    this.doc.setFont('Helvetica', 'normal')
    this.doc.setFontSize(7)
    this.doc.text('Remise fidelite: 10 %', this.margin + 2, this.currentY + 6)
    this.doc.text('Remise finale: - 50,00 MAD', this.margin + 2, this.currentY + 8.5)

    this.currentY += 11

    this.drawPageNumber()
  }

  public generatePage3(contract: CashPoolingContract) {
    this.addPage()
    this.currentY = this.margin

    // Only show if investment is enabled
    if (contract.investmentConfig?.enabled) {
      this.drawSectionHeader('SECTION 5 — PLACEMENT OPCVM')
      this.checkPageBreak(35)

      const investConfig = contract.investmentConfig
      const fund = investConfig.opcvmFund

      const params = [
        ['OPCVM sélectionné', fund?.name || 'OPCVM Atlas Trésorerie'],
        ['Devise', fund?.currency || contract.currency || 'MAD'],
        ['Seuil d\'excédent', this.formatAmount(investConfig.surplusThreshold, '')],
        ['Mode de placement', investConfig.investmentMode === 'partial' ? 'Partial' : 'Total'],
        ['Quotité', investConfig.investmentQuota + '%'],
        ['Rachat automatique', investConfig.autoRedemptionEnabled ? 'Activé' : 'Désactivé'],
      ]

      for (const [label, value] of params) {
        this.doc.setFont('Helvetica', 'bold')
        this.doc.setFontSize(8)
        this.doc.text(label, this.margin + 2, this.currentY)

        this.doc.setFont('Helvetica', 'normal')
        this.doc.setFontSize(8)
        this.doc.text(value, this.margin + 35, this.currentY)

        this.currentY += 4
      }

      this.currentY += 2
    } else {
      this.doc.setFontSize(9)
      this.doc.text('Le placement OPCVM n\'a pas été activé pour cette convention.', this.margin + 2, this.currentY)
      this.currentY += 8
    }

    this.drawPageNumber()
  }

  public generatePage4(contract: CashPoolingContract) {
    this.addPage()
    this.currentY = this.margin

    // Section 6: Plafonds & Seuils (Limits)
    this.drawSectionHeader('SECTION 6 — PLAFONDS & SEUILS DES OPÉRATIONS')
    this.checkPageBreak(35)

    // Web and Mobile columns side by side
    const limitHeaders = ['Opération', 'Web Min', 'Web Max', 'Web/j', 'Mobile Min', 'Mobile Max', 'Mobile/j']
    const limitRows = [
      ['Sweep ZBA', '1,00', 'Illimité', '999', '1,00', 'Illimité', '999'],
      ['Ajustement TBA', '1,00', 'Illimité', '999', '1,00', 'Illimité', '999'],
      ['Opération FBA', '1,00', 'Illimité', '999', '1,00', 'Illimité', '999'],
      ['Couverture débitrice', '1,00', 'Illimité', '999', '1,00', 'Illimité', '999'],
      ['Placement OPCVM', '1,00', 'Illimité', '999', '1,00', 'Illimité', '999'],
    ]

    const limitColumnWidths = [30, 18, 18, 12, 18, 18, 12]
    this.drawTable(limitHeaders, limitRows, limitColumnWidths)

    this.currentY += 2

    this.drawPageNumber()
  }

  public generateUserContractPages(users?: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    accountType: string
    accountNumber: string
    profile: string
    threshold?: number
  }>, contract?: CashPoolingContract) {
    if (!users || users.length === 0) return

    users.forEach((user, userIdx) => {
      this.addPage()
      this.currentY = this.margin

      const userPageNum = 5 + userIdx

      // Title
      this.doc.setFont('Helvetica', 'bold')
      this.doc.setFontSize(12)
      this.doc.setTextColor(...this.TEXT_COLOR)
      this.doc.text(`CONTRAT UTILISATEUR N° ${userIdx + 1}`, this.pageWidth / 2, this.currentY, { align: 'center' })
      this.currentY += 8

      // Card 1: Identification utilisateur
      this.drawCardHeader('IDENTIFICATION UTILISATEUR')
      this.checkPageBreak(30)

      const userInfos = [
        ['Nom', user.lastName || '[À remplir]'],
        ['Prénom', user.firstName || '[À remplir]'],
        ['Email principal', user.email || '[À remplir]'],
        ['Téléphone principal', user.phone || '[À remplir]'],
        ['Type pièce d\'identité', 'CIN'],
        ['Numéro pièce', '[À remplir]'],
      ]

      for (const [label, value] of userInfos) {
        this.doc.setFont('Helvetica', 'bold')
        this.doc.setFontSize(7.5)
        this.doc.text(label, this.margin + 2, this.currentY)
        this.doc.setFont('Helvetica', 'normal')
        this.doc.text(value, this.margin + 35, this.currentY)
        this.currentY += 4
      }

      this.currentY += 3

      // Card 2: Profil utilisateur
      this.drawCardHeader('PROFIL UTILISATEUR')
      this.checkPageBreak(20)

      const profileInfos = [
        ['Login d\'utilisateur', '[À remplir]'],
        ['Qualité / contrat', 'Utilisateur'],
        ['Date validité profils métiers', '01-01-2050'],
        ['Profil signature', '—'],
        ['Profils métiers', 'Tous les services'],
      ]

      for (const [label, value] of profileInfos) {
        this.doc.setFont('Helvetica', 'bold')
        this.doc.setFontSize(7.5)
        this.doc.text(label, this.margin + 2, this.currentY)
        this.doc.setFont('Helvetica', 'normal')
        this.doc.text(value, this.margin + 35, this.currentY)
        this.currentY += 4
      }

      this.currentY += 3

      // Card 3: Plafonds & seuils opérations abonné
      this.drawCardHeader('PLAFONDS & SEUILS OPÉRATIONS ABONNÉ')
      this.checkPageBreak(40)

      const userLimitHeaders = ['Opération', 'Web Min', 'Web Max', 'Web/j', 'Mobile Min', 'Mobile Max', 'Mobile/j']
      const userLimitRows = [
        ['Sweep ZBA', '1,00', 'Illimité', '999', '1,00', 'Illimité', '999'],
        ['Ajustement TBA', '1,00', 'Illimité', '999', '1,00', 'Illimité', '999'],
        ['Opération FBA', '1,00', 'Illimité', '999', '1,00', 'Illimité', '999'],
        ['Couverture débitrice', '1,00', 'Illimité', '999', '1,00', 'Illimité', '999'],
      ]

      const userLimitColumnWidths = [30, 18, 18, 12, 18, 18, 12]
      this.drawTable(userLimitHeaders, userLimitRows, userLimitColumnWidths)

      this.currentY += 5

      // Card 4: Comptes au sein de la banque
      this.drawCardHeader('COMPTES AU SEIN DE LA BANQUE')
      this.checkPageBreak(30)

      const userAccountHeaders = ['Numéro de compte', 'Intitulé', 'Rôle', 'Statut']
      const userAccountRows: string[][] = []

      if (contract?.masterAccount) {
        userAccountRows.push([
          contract.masterAccount.iban?.substring(0, 20) || '',
          contract.masterAccount.clientName,
          'Centralisateur',
          'Actif',
        ])
      }

      if (contract?.secondaryAccounts) {
        contract.secondaryAccounts.forEach((acc) => {
          userAccountRows.push([
            acc.iban?.substring(0, 20) || '',
            acc.clientName,
            'Secondaire',
            'Actif',
          ])
        })
      }

      if (userAccountRows.length > 0) {
        const userAccountColumnWidths = [40, 40, 24, 22]
        this.drawTable(userAccountHeaders, userAccountRows, userAccountColumnWidths)
      }

      this.currentY += 5

      // Signature block (3 columns)
      this.doc.setFont('Helvetica', 'bold')
      this.doc.setFontSize(9)
      this.doc.text('SIGNATURE', this.margin, this.currentY)
      this.currentY += 5

      this.drawSignatureBlock(['Signature du représentant légal', 'Signature de l\'abonné', 'Signature et cachet du CAF'])

      this.drawPageNumber()
    })
  }

  public generateFinalConditionsPage(contract: CashPoolingContract) {
    // Only add new page if there's actual content on current page
    if (this.currentY > this.margin + 10) {
      this.addPage()
    }
    this.currentY = this.margin

    // Title
    this.doc.setFont('Helvetica', 'bold')
    this.doc.setFontSize(12)
    this.doc.setTextColor(...this.TEXT_COLOR)
    this.doc.text('CONDITIONS GÉNÉRALES & SIGNATURE FINALE', this.pageWidth / 2, this.currentY, {
      align: 'center',
    })
    this.currentY += 8

    // Conditions box
    this.doc.setFillColor(...this.BLUE_LIGHT)
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 1, 'F')
    this.currentY += 2

    const conditions = [
      'Je (Nous), soussigné(s), reconnais (sons) avoir pris connaissance des conditions générales et déclare (ons) y adhérer sans aucune restriction ni réserve.',
      'A cet effet, je (nous) autorise (ons) la banque à effectuer sur le compte de tarification précisé ci-dessus les prélèvements prévus au titre des conditions tarifaires du service Cash Pooling.',
      'Je (Nous) mandate (ons) les personnes désignées comme utilisateurs habilités à l\'effet d\'effectuer sur les comptes ci-dessus indiqués les opérations et fonctionnalités incluses dans la présente convention. Toute modification ou changement doit être dûment notifié à la Banque selon les modalités convenues.',
      'Les conditions particulières et générales relatives au token vous seront remis à la livraison.',
    ]

    this.doc.setFont('Helvetica', 'normal')
    this.doc.setFontSize(8)

    for (const condition of conditions) {
      const lines = this.doc.splitTextToSize('• ' + condition, this.pageWidth - 2 * this.margin - 4)
      this.doc.text(lines, this.margin + 2, this.currentY)
      const lineHeight = 8 * 0.35
      this.currentY += lines.length * lineHeight + 2.5
    }

    this.currentY += 5

    // Final signature block
    this.doc.setFont('Helvetica', 'bold')
    this.doc.setFontSize(9)
    this.doc.text('SIGNATURE FINALE', this.margin, this.currentY)
    this.currentY += 5

    this.drawSignatureBlock(['Signature du représentant légal', 'Signature de l\'abonné', 'Signature et cachet du CAF'])

    this.drawPageNumber()
  }

  public generate(contract: CashPoolingContract, options?: ContractGenerationOptions) {
    this.options = options || {}
    
    // Recalculate total pages (removed OPCVM page)
    this.totalPages = 3 + (options?.users?.length || 0) + 1

    this.generatePage1(contract)
    this.generatePage2(contract)
    // this.generatePage3(contract) // OPCVM page removed
    this.generatePage4(contract)
    
    if (options?.users) {
      this.generateUserContractPages(options.users, contract)
    }
    
    this.generateFinalConditionsPage(contract)

    return this.doc
  }

  public save(filename: string) {
    this.doc.save(filename)
  }

  public getDocumentAsBlob(): Blob {
    return this.doc.output('blob') as Blob
  }

  // Static helper methods for backward compatibility
  static generateContractPDF(contract: CashPoolingContract, options?: ContractGenerationOptions | null): Blob {
    const generator = new ContractPDFGenerator(options || undefined)
    generator.generate(contract, options || undefined)
    return generator.getDocumentAsBlob()
  }

  static downloadPDF(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
  }
}

export async function generateContractPDF(
  contract: CashPoolingContract,
  options?: ContractGenerationOptions
) {
  try {
    console.log('[Contract] Starting PDF generation for contract:', contract.contractNumber)
    const generator = new ContractPDFGenerator(options)
    const pdf = generator.generate(contract, options)
    console.log('[Contract] PDF generated successfully, saving...')
    const filename = `Convention-CP-${contract.contractNumber}-${new Date().getTime()}.pdf`
    generator.save(filename)
    console.log('[Contract] PDF saved successfully as:', filename)
    return filename
  } catch (error) {
    console.error('[Contract] PDF generation error:', error)
    throw error
  }
}

// Export the class for direct usage
export { ContractPDFGenerator }
