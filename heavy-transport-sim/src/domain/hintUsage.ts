const USAGE_STORAGE_KEY = 'heavy-transport-sim:hint-usage:v1'
const LOG_STORAGE_KEY = 'heavy-transport-sim:hint-logs:v1'

export interface HintUsageRecord {
  studentId: string
  attemptId: string
  stepId: string
  hintId: string
  viewCount: number
  firstViewedAt: string
  lastViewedAt: string
}

export interface HintLogEvent {
  id: string
  studentId: string
  attemptId: string
  caseId?: string
  stepId: string
  stepName: string
  hintId: string
  hintTitle: string
  eventType: 'hint_viewed'
  timestamp: string
  metadata?: {
    hintLevel?: string
    viewCountAfter?: number
    source?: string
  }
}

function readUsageFromStorage(
  studentId: string,
  attemptId: string,
): HintUsageRecord[] {
  try {
    const key = `${USAGE_STORAGE_KEY}:${studentId}:${attemptId}`
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (r): r is HintUsageRecord =>
        r &&
        typeof r.studentId === 'string' &&
        typeof r.attemptId === 'string' &&
        typeof r.stepId === 'string' &&
        typeof r.hintId === 'string' &&
        typeof r.viewCount === 'number' &&
        r.viewCount >= 0,
    )
  } catch {
    return []
  }
}

function writeUsageToStorage(
  studentId: string,
  attemptId: string,
  records: HintUsageRecord[],
): void {
  const key = `${USAGE_STORAGE_KEY}:${studentId}:${attemptId}`
  localStorage.setItem(key, JSON.stringify(records))
}

function readLogsFromStorage(
  studentId: string,
  attemptId: string,
): HintLogEvent[] {
  try {
    const key = `${LOG_STORAGE_KEY}:${studentId}:${attemptId}`
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (r): r is HintLogEvent =>
        r && typeof r.id === 'string' && typeof r.hintId === 'string',
    )
  } catch {
    return []
  }
}

function writeLogsToStorage(
  studentId: string,
  attemptId: string,
  logs: HintLogEvent[],
): void {
  const key = `${LOG_STORAGE_KEY}:${studentId}:${attemptId}`
  localStorage.setItem(key, JSON.stringify(logs))
}

export interface HintUsageRepository {
  getUsage(
    studentId: string,
    attemptId: string,
    stepId: string,
    hintId: string,
  ): Promise<HintUsageRecord | null>
  incrementViewCount(params: {
    studentId: string
    attemptId: string
    stepId: string
    hintId: string
    stepName: string
    hintTitle: string
    hintLevel?: string
  }): Promise<{ record: HintUsageRecord; logEvent: HintLogEvent }>
  getLogs(studentId: string, attemptId: string): Promise<HintLogEvent[]>
  getUsageForStep(
    studentId: string,
    attemptId: string,
    stepId: string,
  ): Promise<HintUsageRecord[]>
}

export function createLocalStorageHintUsageRepository(): HintUsageRepository {
  return {
    async getUsage(studentId, attemptId, stepId, hintId) {
      const records = readUsageFromStorage(studentId, attemptId)
      return (
        records.find((r) => r.stepId === stepId && r.hintId === hintId) ?? null
      )
    },

    async incrementViewCount({
      studentId,
      attemptId,
      stepId,
      hintId,
      stepName,
      hintTitle,
      hintLevel,
    }) {
      const now = new Date().toISOString()
      const records = readUsageFromStorage(studentId, attemptId)
      const existing = records.find(
        (r) => r.stepId === stepId && r.hintId === hintId,
      )

      if (existing) {
        existing.viewCount += 1
        existing.lastViewedAt = now
      } else {
        records.push({
          studentId,
          attemptId,
          stepId,
          hintId,
          viewCount: 1,
          firstViewedAt: now,
          lastViewedAt: now,
        })
      }

      writeUsageToStorage(studentId, attemptId, records)

      const newRecord = records.find(
        (r) => r.stepId === stepId && r.hintId === hintId,
      )!

      const logEvent: HintLogEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        studentId,
        attemptId,
        stepId,
        stepName,
        hintId,
        hintTitle,
        eventType: 'hint_viewed',
        timestamp: now,
        metadata: {
          hintLevel,
          viewCountAfter: newRecord.viewCount,
          source: 'current_step_hint_panel',
        },
      }

      const logs = readLogsFromStorage(studentId, attemptId)
      logs.push(logEvent)
      writeLogsToStorage(studentId, attemptId, logs)

      return { record: newRecord, logEvent }
    },

    async getLogs(studentId, attemptId) {
      return readLogsFromStorage(studentId, attemptId)
    },

    async getUsageForStep(studentId, attemptId, stepId) {
      const records = readUsageFromStorage(studentId, attemptId)
      return records.filter((r) => r.stepId === stepId)
    },
  }
}

export const hintUsageRepository = createLocalStorageHintUsageRepository()
