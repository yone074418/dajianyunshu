import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)
const nonNegativeInt = z.number().int().min(0)

export const CONFIGURATION_LOG_EVENT_TYPES = [
  'combination_selected',
  'combination_changed',
  'tractor_selected',
  'tractor_changed',
  'trailer_axle_lines_selected',
  'trailer_axle_lines_changed',
  'trailer_columns_selected',
  'trailer_columns_changed',
  'configuration_checked',
  'configuration_passed',
  'configuration_failed',
  'configuration_blocked',
] as const

export type ConfigurationLogEventType =
  (typeof CONFIGURATION_LOG_EVENT_TYPES)[number]

export const CONFIGURATION_LOG_RESULT_STATUSES = [
  'selected',
  'changed',
  'passed',
  'failed',
  'blocked',
] as const

export type ConfigurationLogResultStatus =
  (typeof CONFIGURATION_LOG_RESULT_STATUSES)[number]

export const configurationLogMetadataSchema = z
  .object({
    vehicleCombinationId: z.string().optional(),
    tractorId: z.string().optional(),
    axleLines: z.number().int().positive().optional(),
    columns: z.number().int().positive().optional(),
    errorCountAfter: nonNegativeInt.optional(),
    modificationCountAfter: nonNegativeInt.optional(),
    source: z.string().optional(),
  })
  .strict()

export const configurationChoiceLogSchema = z
  .object({
    id: nonEmptyString,
    studentId: nonEmptyString,
    studentName: z.string().optional(),
    attemptId: nonEmptyString,
    caseId: nonEmptyString,
    stepId: z.literal('simple_configuration'),
    eventType: z.enum(CONFIGURATION_LOG_EVENT_TYPES),
    actionLabel: nonEmptyString,
    resultStatus: z.enum(CONFIGURATION_LOG_RESULT_STATUSES),
    timestamp: nonEmptyString,
    sequence: nonNegativeInt,
    before: z.unknown().optional(),
    after: z.unknown().optional(),
    summary: nonEmptyString,
    reason: z.string().optional(),
    ruleResultId: z.string().optional(),
    metadata: configurationLogMetadataSchema.optional(),
  })
  .refine(
    (log) => {
      if (log.resultStatus === 'failed' || log.resultStatus === 'blocked') {
        return log.reason !== undefined && log.reason.length > 0
      }
      return true
    },
    { message: 'failed 或 blocked 事件必须包含 reason' },
  )
  .refine(
    (log) => {
      if (
        log.resultStatus === 'changed' &&
        log.before !== undefined &&
        log.after !== undefined
      ) {
        return JSON.stringify(log.before) !== JSON.stringify(log.after)
      }
      return true
    },
    { message: '修改事件的 before 和 after 不能完全相同' },
  )

export type ConfigurationChoiceLog = z.infer<
  typeof configurationChoiceLogSchema
>
export type ConfigurationLogMetadata = z.infer<
  typeof configurationLogMetadataSchema
>

const STORAGE_KEY = 'heavy-transport-sim:configuration-choice-logs:v1'

function generateId(): string {
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createConfigurationChoiceLog(
  base: Omit<ConfigurationChoiceLog, 'id' | 'sequence'>,
): ConfigurationChoiceLog {
  return {
    ...base,
    id: generateId(),
    sequence: Date.now(),
  }
}

export class LocalConfigurationLogRepository {
  private storageKey: string

  constructor(storageKey: string = STORAGE_KEY) {
    this.storageKey = storageKey
  }

  getAll(): ConfigurationChoiceLog[] {
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (!raw) return []
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      const valid: ConfigurationChoiceLog[] = []
      for (const item of parsed) {
        const result = configurationChoiceLogSchema.safeParse(item)
        if (result.success) {
          valid.push(result.data)
        }
      }
      return valid.sort((a, b) => a.sequence - b.sequence)
    } catch {
      return []
    }
  }

  getByAttempt(attemptId: string): ConfigurationChoiceLog[] {
    return this.getAll().filter((l) => l.attemptId === attemptId)
  }

  add(log: ConfigurationChoiceLog): ConfigurationChoiceLog {
    const all = this.getAll()
    all.push(log)
    all.sort((a, b) => a.sequence - b.sequence)
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(all))
    } catch {
      // Storage full or unavailable
    }
    return log
  }

  clear(): void {
    try {
      localStorage.removeItem(this.storageKey)
    } catch {
      // Ignore
    }
  }
}

export function getErrorCount(logs: ConfigurationChoiceLog[]): number {
  return logs.filter(
    (l) => l.resultStatus === 'failed' || l.resultStatus === 'blocked',
  ).length
}

export function getModificationCount(logs: ConfigurationChoiceLog[]): number {
  return logs.filter((l) => l.resultStatus === 'changed').length
}

export function getLastFailedLog(
  logs: ConfigurationChoiceLog[],
): ConfigurationChoiceLog | null {
  const failed = logs.filter((l) => l.resultStatus === 'failed')
  return failed.length > 0 ? failed[failed.length - 1] : null
}

export function getLastModificationLog(
  logs: ConfigurationChoiceLog[],
): ConfigurationChoiceLog | null {
  const changed = logs.filter((l) => l.resultStatus === 'changed')
  return changed.length > 0 ? changed[changed.length - 1] : null
}

export function sortLogsByTime(
  logs: ConfigurationChoiceLog[],
  order: 'asc' | 'desc' = 'asc',
): ConfigurationChoiceLog[] {
  return [...logs].sort((a, b) =>
    order === 'asc' ? a.sequence - b.sequence : b.sequence - a.sequence,
  )
}
