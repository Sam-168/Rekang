import type { Report, ReportReason, ReportStatus, ReportTargetType } from '../types/trust'

const reports: Report[] = [
  { id: 'REP-104', targetType: 'listing', targetId: 'student-laptop', targetLabel: 'Student laptop', reason: 'Suspicious or misleading', details: 'The price changed after I asked to collect it, and the seller requested an off-platform deposit.', reporterName: 'Lerato Dube', createdAt: '2026-10-04T09:24:00+02:00', status: 'open' },
  { id: 'REP-103', targetType: 'profile', targetId: 'thabo', targetLabel: 'Thabo Molefe', reason: 'Spam', details: 'Repeated messages about unrelated services.', reporterName: 'Aisha Jacobs', createdAt: '2026-10-03T15:40:00+02:00', status: 'open' },
  { id: 'REP-102', targetType: 'listing', targetId: 'headphones', targetLabel: 'Wireless headphones', reason: 'Prohibited item', details: 'Reviewed and confirmed that the listing is allowed.', reporterName: 'Current user', createdAt: '2026-10-02T12:10:00+02:00', status: 'dismissed', resolutionNote: 'No policy violation found.' },
  { id: 'REP-101', targetType: 'profile', targetId: 'legacy-account', targetLabel: 'Removed account', reason: 'Harassment or abuse', details: 'Sent abusive messages after an order was cancelled.', reporterName: 'Naledi Mokoena', createdAt: '2026-10-01T08:30:00+02:00', status: 'resolved', resolutionNote: 'Account suspended after review.' },
]

const wait = (milliseconds = 280) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export const reportService = {
  async list() { await wait(); return [...reports] },
  async create(input: { targetType: ReportTargetType; targetId: string; targetLabel: string; reason: ReportReason; details: string }) {
    await wait(460)
    if (reports.some((report) => report.targetId === input.targetId && report.reporterName === 'Current user' && report.status === 'open')) throw new Error('You already have an open report for this item.')
    const report: Report = { ...input, id: `REP-${105 + reports.length}`, reporterName: 'Current user', createdAt: new Date().toISOString(), status: 'open' }
    reports.unshift(report)
    return report
  },
  async updateStatus(id: string, status: Exclude<ReportStatus, 'open'>, resolutionNote: string) {
    await wait(360)
    const report = reports.find((item) => item.id === id)
    if (!report) throw new Error('Report not found.')
    report.status = status
    report.resolutionNote = resolutionNote
    return { ...report }
  },
}
