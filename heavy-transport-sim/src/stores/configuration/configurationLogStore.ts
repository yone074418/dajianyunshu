import { create } from 'zustand'
import {
  LocalConfigurationLogRepository,
  createConfigurationChoiceLog,
  getErrorCount,
  getModificationCount,
  getLastFailedLog,
  getLastModificationLog,
  type ConfigurationChoiceLog,
  type ConfigurationLogEventType,
} from '../../domain/configurationLogs'

const MOCK_STUDENT_ID = 'student-mock-001'
const MOCK_STUDENT_NAME = '测试学生'
const MOCK_ATTEMPT_ID = 'attempt-mock-001'
const MOCK_CASE_ID = 'case_heavy_transformer_transport_v1'

interface PreviousSelections {
  vehicleCombinationId: string | null
  tractorId: string | null
  axleLines: number | null
  columns: number | null
}

export interface ConfigurationLogState {
  logs: ConfigurationChoiceLog[]
  previousSelections: PreviousSelections
  errorCount: number
  modificationCount: number
  lastFailedLog: ConfigurationChoiceLog | null
  lastModificationLog: ConfigurationChoiceLog | null
  loadLogs: () => void
  logCombinationSelected: (
    combinationId: string,
    combinationName: string,
  ) => void
  logTractorSelected: (tractorId: string, tractorName: string) => void
  logAxleLinesSelected: (axleLines: number, label: string) => void
  logColumnsSelected: (columns: number, label: string) => void
  logConfigurationChecked: (
    status: 'passed' | 'failed' | 'blocked',
    summary: string,
    reason?: string,
  ) => void
  clearLogs: () => void
}

const repository = new LocalConfigurationLogRepository()

function determineEventType(
  field: keyof PreviousSelections,
  newValue: string | number | null,
  currentSelections: PreviousSelections,
): { eventType: ConfigurationLogEventType; isChange: boolean } {
  const map: Record<
    keyof PreviousSelections,
    { select: ConfigurationLogEventType; change: ConfigurationLogEventType }
  > = {
    vehicleCombinationId: {
      select: 'combination_selected',
      change: 'combination_changed',
    },
    tractorId: { select: 'tractor_selected', change: 'tractor_changed' },
    axleLines: {
      select: 'trailer_axle_lines_selected',
      change: 'trailer_axle_lines_changed',
    },
    columns: {
      select: 'trailer_columns_selected',
      change: 'trailer_columns_changed',
    },
  }
  const prev = currentSelections[field]
  const isChange = prev !== null && prev !== newValue
  const eventType = isChange ? map[field].change : map[field].select
  return { eventType, isChange }
}

function addLog(
  log: Omit<ConfigurationChoiceLog, 'id' | 'sequence'>,
): ConfigurationChoiceLog {
  return repository.add(createConfigurationChoiceLog(log))
}

export const useConfigurationLogStore = create<ConfigurationLogState>(
  (set, get) => ({
    logs: [],
    previousSelections: {
      vehicleCombinationId: null,
      tractorId: null,
      axleLines: null,
      columns: null,
    },
    errorCount: 0,
    modificationCount: 0,
    lastFailedLog: null,
    lastModificationLog: null,

    loadLogs: () => {
      const logs = repository.getByAttempt(MOCK_ATTEMPT_ID)
      set({
        logs,
        errorCount: getErrorCount(logs),
        modificationCount: getModificationCount(logs),
        lastFailedLog: getLastFailedLog(logs),
        lastModificationLog: getLastModificationLog(logs),
      })
    },

    logCombinationSelected: (combinationId, combinationName) => {
      const state = get()
      const { eventType, isChange } = determineEventType(
        'vehicleCombinationId',
        combinationId,
        state.previousSelections,
      )

      const logs = state.logs
      const modCount = isChange
        ? state.modificationCount + 1
        : state.modificationCount

      const log = addLog({
        studentId: MOCK_STUDENT_ID,
        studentName: MOCK_STUDENT_NAME,
        attemptId: MOCK_ATTEMPT_ID,
        caseId: MOCK_CASE_ID,
        stepId: 'simple_configuration',
        eventType,
        actionLabel: isChange ? '修改组合方式' : '选择组合方式',
        resultStatus: isChange ? 'changed' : 'selected',
        timestamp: new Date().toISOString(),
        before: state.previousSelections.vehicleCombinationId,
        after: combinationId,
        summary: isChange
          ? `将组合方式从 "${state.previousSelections.vehicleCombinationId}" 修改为 "${combinationName}"`
          : `选择组合方式：${combinationName}`,
        metadata: {
          vehicleCombinationId: combinationId,
          modificationCountAfter: modCount,
        },
      })

      set({
        logs: [...logs, log],
        previousSelections: {
          ...state.previousSelections,
          vehicleCombinationId: combinationId,
        },
        modificationCount: modCount,
        lastModificationLog: isChange ? log : state.lastModificationLog,
      })
    },

    logTractorSelected: (tractorId, tractorName) => {
      const state = get()
      const { eventType, isChange } = determineEventType(
        'tractorId',
        tractorId,
        state.previousSelections,
      )

      const modCount = isChange
        ? state.modificationCount + 1
        : state.modificationCount

      const log = addLog({
        studentId: MOCK_STUDENT_ID,
        studentName: MOCK_STUDENT_NAME,
        attemptId: MOCK_ATTEMPT_ID,
        caseId: MOCK_CASE_ID,
        stepId: 'simple_configuration',
        eventType,
        actionLabel: isChange ? '修改牵引车' : '选择牵引车',
        resultStatus: isChange ? 'changed' : 'selected',
        timestamp: new Date().toISOString(),
        before: state.previousSelections.tractorId,
        after: tractorId,
        summary: isChange
          ? `将牵引车从 "${state.previousSelections.tractorId}" 修改为 "${tractorName}"`
          : `选择牵引车：${tractorName}`,
        metadata: {
          tractorId,
          modificationCountAfter: modCount,
        },
      })

      set({
        logs: [...state.logs, log],
        previousSelections: { ...state.previousSelections, tractorId },
        modificationCount: modCount,
        lastModificationLog: isChange ? log : state.lastModificationLog,
      })
    },

    logAxleLinesSelected: (axleLines, label) => {
      const state = get()
      const { eventType, isChange } = determineEventType(
        'axleLines',
        axleLines,
        state.previousSelections,
      )

      const modCount = isChange
        ? state.modificationCount + 1
        : state.modificationCount

      const log = addLog({
        studentId: MOCK_STUDENT_ID,
        studentName: MOCK_STUDENT_NAME,
        attemptId: MOCK_ATTEMPT_ID,
        caseId: MOCK_CASE_ID,
        stepId: 'simple_configuration',
        eventType,
        actionLabel: isChange ? '修改轴线数' : '选择轴线数',
        resultStatus: isChange ? 'changed' : 'selected',
        timestamp: new Date().toISOString(),
        before: state.previousSelections.axleLines,
        after: axleLines,
        summary: isChange
          ? `将轴线数从 ${state.previousSelections.axleLines} 修改为 ${label}`
          : `选择轴线数：${label}`,
        metadata: {
          axleLines,
          modificationCountAfter: modCount,
        },
      })

      set({
        logs: [...state.logs, log],
        previousSelections: { ...state.previousSelections, axleLines },
        modificationCount: modCount,
        lastModificationLog: isChange ? log : state.lastModificationLog,
      })
    },

    logColumnsSelected: (columns, label) => {
      const state = get()
      const { eventType, isChange } = determineEventType(
        'columns',
        columns,
        state.previousSelections,
      )

      const modCount = isChange
        ? state.modificationCount + 1
        : state.modificationCount

      const log = addLog({
        studentId: MOCK_STUDENT_ID,
        studentName: MOCK_STUDENT_NAME,
        attemptId: MOCK_ATTEMPT_ID,
        caseId: MOCK_CASE_ID,
        stepId: 'simple_configuration',
        eventType,
        actionLabel: isChange ? '修改纵列数' : '选择纵列数',
        resultStatus: isChange ? 'changed' : 'selected',
        timestamp: new Date().toISOString(),
        before: state.previousSelections.columns,
        after: columns,
        summary: isChange
          ? `将纵列数从 ${state.previousSelections.columns} 修改为 ${label}`
          : `选择纵列数：${label}`,
        metadata: {
          columns,
          modificationCountAfter: modCount,
        },
      })

      set({
        logs: [...state.logs, log],
        previousSelections: { ...state.previousSelections, columns },
        modificationCount: modCount,
        lastModificationLog: isChange ? log : state.lastModificationLog,
      })
    },

    logConfigurationChecked: (status, summary, reason) => {
      const state = get()

      const eventTypeMap: Record<string, ConfigurationLogEventType> = {
        passed: 'configuration_passed',
        failed: 'configuration_failed',
        blocked: 'configuration_blocked',
      }

      const errCount =
        status === 'failed' || status === 'blocked'
          ? state.errorCount + 1
          : state.errorCount

      const log = addLog({
        studentId: MOCK_STUDENT_ID,
        studentName: MOCK_STUDENT_NAME,
        attemptId: MOCK_ATTEMPT_ID,
        caseId: MOCK_CASE_ID,
        stepId: 'simple_configuration',
        eventType: eventTypeMap[status] ?? 'configuration_checked',
        actionLabel: '检查配车方案',
        resultStatus: status,
        timestamp: new Date().toISOString(),
        summary,
        reason,
        metadata: {
          errorCountAfter: errCount,
        },
      })

      const newLogs = [...state.logs, log]
      set({
        logs: newLogs,
        errorCount: errCount,
        lastFailedLog:
          status === 'failed' || status === 'blocked'
            ? log
            : state.lastFailedLog,
      })
    },

    clearLogs: () => {
      repository.clear()
      set({
        logs: [],
        previousSelections: {
          vehicleCombinationId: null,
          tractorId: null,
          axleLines: null,
          columns: null,
        },
        errorCount: 0,
        modificationCount: 0,
        lastFailedLog: null,
        lastModificationLog: null,
      })
    },
  }),
)
