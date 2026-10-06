import { supabase } from './supabase'
import type { Report, ReportReason, ReportStatus, ReportTargetType } from '../types/trust'

type ReportRecord = {
  id: string
  reporter_id: string
  target_type: ReportTargetType
  target_id: string
  reason: ReportReason
  details: string
  status: ReportStatus
  resolution_note: string
  created_at: string
}

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured for this environment.')
  return supabase
}

function readableError(error: { message: string }) {
  if (error.message.includes('already have an open report') || error.message.includes('duplicate key')) return 'You already have an open report for this item.'
  if (error.message.includes('Administrator access')) return 'Administrator access is required.'
  if (error.message.includes('Verify your account')) return 'Verify your account before sending a report.'
  return error.message
}

async function mapReports(records: ReportRecord[]) {
  if (!records.length) return []
  const client = requireClient()
  const reporterIds = [...new Set(records.map((report) => report.reporter_id))]
  const listingIds = records.filter((report) => report.target_type === 'listing').map((report) => report.target_id)
  const profileIds = records.filter((report) => report.target_type === 'profile').map((report) => report.target_id)
  const [{ data: reporters, error: reporterError }, listingResult, profileResult] = await Promise.all([
    client.from('profiles').select('id, full_name').in('id', reporterIds),
    listingIds.length ? client.from('listings').select('id, title').in('id', listingIds) : Promise.resolve({ data: [], error: null }),
    profileIds.length ? client.from('profiles').select('id, full_name').in('id', profileIds) : Promise.resolve({ data: [], error: null }),
  ])
  if (reporterError || listingResult.error || profileResult.error) throw new Error(readableError(reporterError ?? listingResult.error ?? profileResult.error!))
  const reporterNames = new Map((reporters ?? []).map((profile) => [profile.id, profile.full_name]))
  const listingNames = new Map((listingResult.data ?? []).map((listing) => [listing.id, listing.title]))
  const profileNames = new Map((profileResult.data ?? []).map((profile) => [profile.id, profile.full_name]))
  return records.map<Report>((record) => ({
    id: record.id,
    targetType: record.target_type,
    targetId: record.target_id,
    targetLabel: record.target_type === 'listing' ? listingNames.get(record.target_id) ?? 'Removed listing' : profileNames.get(record.target_id) ?? 'Removed profile',
    reason: record.reason,
    details: record.details,
    reporterName: reporterNames.get(record.reporter_id) ?? 'Former member',
    createdAt: record.created_at,
    status: record.status,
    resolutionNote: record.resolution_note || undefined,
  }))
}

export const reportService = {
  async list() {
    const client = requireClient()
    const { data, error } = await client.from('reports').select('*').order('created_at', { ascending: false })
    if (error) throw new Error(readableError(error))
    return mapReports(data as ReportRecord[])
  },

  async create(input: { targetType: ReportTargetType; targetId: string; targetLabel: string; reason: ReportReason; details: string }) {
    const client = requireClient()
    const { data, error } = await client.rpc('create_report', {
      target_kind: input.targetType,
      target_uuid: input.targetId,
      report_reason: input.reason,
      report_details: input.details,
    })
    if (error) throw new Error(readableError(error))
    return (await mapReports([data as ReportRecord]))[0]
  },

  async updateStatus(id: string, status: Exclude<ReportStatus, 'open'>, resolutionNote: string) {
    const client = requireClient()
    const { data, error } = await client.rpc('resolve_report', {
      target_report_id: id,
      next_status: status,
      decision_note: resolutionNote,
    })
    if (error) throw new Error(readableError(error))
    return (await mapReports([data as ReportRecord]))[0]
  },
}
