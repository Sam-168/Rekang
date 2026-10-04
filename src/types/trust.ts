export type ReportTargetType = 'listing' | 'profile'
export type ReportReason = 'Suspicious or misleading' | 'Prohibited item' | 'Harassment or abuse' | 'Spam' | 'Other'
export type ReportStatus = 'open' | 'resolved' | 'dismissed'

export type Report = {
  id: string
  targetType: ReportTargetType
  targetId: string
  targetLabel: string
  reason: ReportReason
  details: string
  reporterName: string
  createdAt: string
  status: ReportStatus
  resolutionNote?: string
}
