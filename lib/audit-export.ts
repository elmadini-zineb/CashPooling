import type { AuditLogEntry } from './types'

// Export to CSV format
export function exportAuditToCSV(logs: AuditLogEntry[], contractNumber: string): void {
  const headers = ['Date', 'Heure', 'Utilisateur', 'Email', 'Rôle', 'Action', 'Détails', 'Changements']
  
  const rows = logs.map((log) => [
    log.createdAt.toLocaleDateString('fr-FR'),
    log.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    log.userName || 'N/A',
    log.userEmail,
    log.userRole || 'N/A',
    log.action,
    JSON.stringify(log.details),
    log.changesSummary || 'N/A',
  ])

  const csv = [
    `Piste d'Audit - Convention ${contractNumber}`,
    `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
    '',
    headers.join(';'),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')),
  ].join('\n')

  downloadFile(csv, `audit-${contractNumber}-${Date.now()}.csv`, 'text/csv')
}

// Export to PDF format (simplified)
export function exportAuditToPDF(logs: AuditLogEntry[], contractNumber: string): void {
  const pdfContent = generatePDFContent(logs, contractNumber)
  downloadFile(pdfContent, `audit-${contractNumber}-${Date.now()}.pdf`, 'application/pdf')
}

function generatePDFContent(logs: AuditLogEntry[], contractNumber: string): string {
  // Simple text-based PDF content (in production, use a library like pdfkit)
  const content = [
    'PISTE D\'AUDIT - CONVENTION DE TRÉSORERIE',
    '========================================',
    '',
    `Numéro de convention: ${contractNumber}`,
    `Date de génération: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
    '',
    '========================================',
    '',
    ...logs.map((log) => [
      `${log.createdAt.toLocaleDateString('fr-FR')} - ${log.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
      `Action: ${log.action}`,
      `Utilisateur: ${log.userName || log.userEmail}`,
      `Rôle: ${log.userRole || 'N/A'}`,
      `Changements: ${log.changesSummary || 'N/A'}`,
      '---',
    ]).flat(),
  ].join('\n')

  return content
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
