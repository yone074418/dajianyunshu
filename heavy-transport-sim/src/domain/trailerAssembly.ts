import { z } from 'zod'
import { isCombinationAllowed, getCombinationRule } from './trailerSelection'

// ── Constants ────────────────────────────────────────────────────────

const nonEmptyString = z.string().trim().min(1)
const positiveInt = z.number().int().positive()
const nonNegativeInt = z.number().int().min(0)

// ── Status & Step enums ──────────────────────────────────────────────

export const TRAILER_ASSEMBLY_DRAFT_STATUSES = [
  'empty',
  'in_progress',
  'completed',
  'invalid',
  'blocked',
] as const

export type TrailerAssemblyDraftStatus =
  (typeof TRAILER_ASSEMBLY_DRAFT_STATUSES)[number]

export const TRAILER_ASSEMBLY_STEP_TYPES = [
  'select_target_configuration',
  'place_main_column',
  'add_axle_module',
  'add_side_column',
  'connect_tractor_end',
  'align_columns',
  'complete_assembly',
  'reset_assembly',
] as const

export type TrailerAssemblyStepType =
  (typeof TRAILER_ASSEMBLY_STEP_TYPES)[number]

// ── Module types ─────────────────────────────────────────────────────

export const MODULE_TYPES = [
  'main_column',
  'side_column',
  'axle_line',
  'tractor_connector',
  'alignment_marker',
] as const

export type TrailerAssemblyModuleType = (typeof MODULE_TYPES)[number]

// ── Error codes ──────────────────────────────────────────────────────

export const ASSEMBLY_ERROR_CODES = [
  'missing_target_configuration',
  'main_column_required_first',
  'axle_order_invalid',
  'column_order_invalid',
  'column_axle_count_mismatch',
  'tractor_connector_missing',
  'target_not_reached',
  'target_exceeded',
  'invalid_combination',
] as const

export type TrailerAssemblyErrorCode = (typeof ASSEMBLY_ERROR_CODES)[number]

// ── Zod schemas ──────────────────────────────────────────────────────

export const trailerAssemblyModuleSchema = z.object({
  id: nonEmptyString,
  moduleType: z.enum(MODULE_TYPES),
  columnIndex: nonNegativeInt.optional(),
  axleIndex: nonNegativeInt.optional(),
  label: nonEmptyString,
  positionLabel: nonEmptyString,
  placedAt: nonEmptyString,
})

export const trailerAssemblyErrorSchema = z.object({
  code: z.enum(ASSEMBLY_ERROR_CODES),
  message: nonEmptyString,
  stepType: z.enum(TRAILER_ASSEMBLY_STEP_TYPES),
  createdAt: nonEmptyString,
})

export const trailerAssemblyResultSchema = z.object({
  id: nonEmptyString,
  targetAxleLines: positiveInt,
  targetColumns: positiveInt,
  completedAxleLines: positiveInt,
  completedColumns: positiveInt,
  moduleCount: nonNegativeInt,
  connectionOrder: z.array(nonEmptyString),
  visualSummary: nonEmptyString,
  readyForHydraulicPointSelection: z.boolean(),
  teachingNote: nonEmptyString,
  completedAt: nonEmptyString,
})

export const trailerAssemblyStepSchema = z.object({
  id: nonEmptyString,
  stepType: z.enum(TRAILER_ASSEMBLY_STEP_TYPES),
  columnIndex: nonNegativeInt.optional(),
  axleIndex: nonNegativeInt.optional(),
  moduleType: z.enum(MODULE_TYPES).optional(),
  createdAt: nonEmptyString,
})

export const trailerAssemblyDraftSchema = z
  .object({
    id: nonEmptyString,
    routeId: z.string().optional(),
    sourceRequirementId: z.string().optional(),
    targetAxleLines: positiveInt,
    targetColumns: positiveInt,
    currentAxleLines: nonNegativeInt,
    currentColumns: nonNegativeInt,
    placedModules: z.array(trailerAssemblyModuleSchema),
    steps: z.array(trailerAssemblyStepSchema),
    status: z.enum(TRAILER_ASSEMBLY_DRAFT_STATUSES),
    lastError: trailerAssemblyErrorSchema.optional(),
    result: trailerAssemblyResultSchema.optional(),
    createdAt: nonEmptyString,
    updatedAt: nonEmptyString,
  })
  .refine(
    (d) => {
      if (d.status === 'completed') return d.result !== undefined
      return true
    },
    { message: 'completed 状态必须有 result' },
  )
  .refine(
    (d) => {
      if (d.status === 'invalid') return d.lastError !== undefined
      return true
    },
    { message: 'invalid 状态必须有 lastError' },
  )
  .refine((d) => d.currentAxleLines <= d.targetAxleLines, {
    message: '当前轴线数不得超过目标轴线数',
  })
  .refine((d) => d.currentColumns <= d.targetColumns, {
    message: '当前纵列数不得超过目标纵列数',
  })

export const trailerAssemblyOperationLogSchema = z.object({
  id: nonEmptyString,
  draftId: nonEmptyString,
  routeId: z.string().optional(),
  action: z.enum([
    'view_trailer_assembly',
    'select_target_configuration',
    'place_main_column',
    'add_axle_module',
    'add_side_column',
    'connect_tractor_end',
    'align_columns',
    'complete_assembly',
    'assembly_error',
    'reset_assembly',
  ]),
  stepType: z.enum(TRAILER_ASSEMBLY_STEP_TYPES).optional(),
  beforeValue: z.string().optional(),
  afterValue: z.string().optional(),
  resultStatus: z.enum(TRAILER_ASSEMBLY_DRAFT_STATUSES),
  errorCode: z.string().optional(),
  message: nonEmptyString,
  createdAt: nonEmptyString,
})

// ── Type exports ─────────────────────────────────────────────────────

export type TrailerAssemblyModule = z.infer<typeof trailerAssemblyModuleSchema>
export type TrailerAssemblyError = z.infer<typeof trailerAssemblyErrorSchema>
export type TrailerAssemblyResult = z.infer<typeof trailerAssemblyResultSchema>
export type TrailerAssemblyStep = z.infer<typeof trailerAssemblyStepSchema>
export type TrailerAssemblyDraft = z.infer<typeof trailerAssemblyDraftSchema>
export type TrailerAssemblyOperationLog = z.infer<
  typeof trailerAssemblyOperationLogSchema
>

// ── Helpers ──────────────────────────────────────────────────────────

function generateId(): string {
  return `ta-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function now(): string {
  return new Date().toISOString()
}

// ── Validation ───────────────────────────────────────────────────────

export type ValidationResult = {
  valid: boolean
  error?: TrailerAssemblyError
}

export function validateTrailerAssemblyDraft(
  draft: TrailerAssemblyDraft,
): ValidationResult {
  if (draft.targetAxleLines <= 0 || !Number.isInteger(draft.targetAxleLines)) {
    return {
      valid: false,
      error: {
        code: 'missing_target_configuration',
        message: '目标轴线数必须为正整数。',
        stepType: 'select_target_configuration',
        createdAt: now(),
      },
    }
  }
  if (draft.targetColumns <= 0 || !Number.isInteger(draft.targetColumns)) {
    return {
      valid: false,
      error: {
        code: 'missing_target_configuration',
        message: '目标纵列数必须为正整数。',
        stepType: 'select_target_configuration',
        createdAt: now(),
      },
    }
  }
  if (!isCombinationAllowed(draft.targetAxleLines, draft.targetColumns)) {
    const rule = getCombinationRule(draft.targetAxleLines, draft.targetColumns)
    return {
      valid: false,
      error: {
        code: 'invalid_combination',
        message:
          rule?.reason ??
          `${draft.targetAxleLines}轴线与${draft.targetColumns}纵列组合不合法。`,
        stepType: 'select_target_configuration',
        createdAt: now(),
      },
    }
  }
  return { valid: true }
}

export function validateTrailerAssemblyStep(
  draft: TrailerAssemblyDraft,
  step: TrailerAssemblyStep,
): ValidationResult {
  // Must have target configuration
  if (
    draft.status === 'empty' &&
    step.stepType !== 'select_target_configuration' &&
    step.stepType !== 'reset_assembly'
  ) {
    return {
      valid: false,
      error: {
        code: 'missing_target_configuration',
        message: '请先选择目标挂车方案（轴线数和纵列数），再开始拼接。',
        stepType: step.stepType,
        createdAt: now(),
      },
    }
  }

  // Main column must be placed before side columns or axle modules
  const hasMainColumn = draft.placedModules.some(
    (m) => m.moduleType === 'main_column',
  )
  const hasMainColumnAxles =
    draft.currentAxleLines >=
    Math.ceil(draft.targetAxleLines / draft.targetColumns)

  if (step.stepType === 'add_side_column' && !hasMainColumn) {
    return {
      valid: false,
      error: {
        code: 'main_column_required_first',
        message: '请先放置主纵列，再添加侧纵列。',
        stepType: step.stepType,
        createdAt: now(),
      },
    }
  }

  // Axle modules on main column must be completed before adding side columns
  if (step.stepType === 'add_side_column' && !hasMainColumnAxles) {
    return {
      valid: false,
      error: {
        code: 'axle_order_invalid',
        message: '请先完成主纵列的轴线模块拼接，再添加第二纵列。',
        stepType: step.stepType,
        createdAt: now(),
      },
    }
  }

  // Cannot add axle module if target reached
  if (step.stepType === 'add_axle_module') {
    if (draft.currentAxleLines >= draft.targetAxleLines) {
      return {
        valid: false,
        error: {
          code: 'target_exceeded',
          message: `已达到目标轴线数 ${draft.targetAxleLines}，不能再添加轴线模块。`,
          stepType: step.stepType,
          createdAt: now(),
        },
      }
    }
  }

  // Cannot add side column if target reached
  if (step.stepType === 'add_side_column') {
    if (draft.currentColumns >= draft.targetColumns) {
      return {
        valid: false,
        error: {
          code: 'target_exceeded',
          message: `已达到目标纵列数 ${draft.targetColumns}，不能再添加纵列。`,
          stepType: step.stepType,
          createdAt: now(),
        },
      }
    }
  }

  // Cannot add side column if previous column axle count is not filled
  if (step.stepType === 'add_side_column') {
    const axlesPerColumn = Math.ceil(
      draft.targetAxleLines / draft.targetColumns,
    )
    const mainColumnAxles = draft.placedModules.filter(
      (m) => m.moduleType === 'axle_line' && m.columnIndex === 0,
    ).length
    if (mainColumnAxles < axlesPerColumn) {
      return {
        valid: false,
        error: {
          code: 'column_axle_count_mismatch',
          message: `主纵列轴线数（${mainColumnAxles}）未达到每列所需数量（${axlesPerColumn}），请先补齐。`,
          stepType: step.stepType,
          createdAt: now(),
        },
      }
    }
  }

  // Connect tractor end requires all columns and axles placed
  if (step.stepType === 'connect_tractor_end') {
    if (draft.currentColumns < draft.targetColumns) {
      return {
        valid: false,
        error: {
          code: 'column_order_invalid',
          message: `纵列数未达到目标（${draft.currentColumns}/${draft.targetColumns}），请先完成所有纵列拼接。`,
          stepType: step.stepType,
          createdAt: now(),
        },
      }
    }
    if (draft.currentAxleLines < draft.targetAxleLines) {
      return {
        valid: false,
        error: {
          code: 'target_not_reached',
          message: `轴线数未达到目标（${draft.currentAxleLines}/${draft.targetAxleLines}），请先补齐所有轴线模块。`,
          stepType: step.stepType,
          createdAt: now(),
        },
      }
    }
  }

  // Complete assembly requires tractor connector
  if (step.stepType === 'complete_assembly') {
    const hasConnector = draft.placedModules.some(
      (m) => m.moduleType === 'tractor_connector',
    )
    if (!hasConnector) {
      return {
        valid: false,
        error: {
          code: 'tractor_connector_missing',
          message: '请先连接牵引端，再完成拼接。',
          stepType: step.stepType,
          createdAt: now(),
        },
      }
    }

    // Check axle count consistency across columns
    const columnAxleCounts: Record<number, number> = {}
    for (const m of draft.placedModules) {
      if (m.moduleType === 'axle_line' && m.columnIndex !== undefined) {
        columnAxleCounts[m.columnIndex] =
          (columnAxleCounts[m.columnIndex] ?? 0) + 1
      }
    }
    const counts = Object.values(columnAxleCounts)
    if (counts.length > 1) {
      const allSame = counts.every((c) => c === counts[0])
      if (!allSame) {
        return {
          valid: false,
          error: {
            code: 'column_axle_count_mismatch',
            message:
              '各纵列轴线数不一致，不能完成拼接。请补齐缺失轴线或重新选择方案。',
            stepType: step.stepType,
            createdAt: now(),
          },
        }
      }
    }
  }

  return { valid: true }
}

// ── Draft creation ───────────────────────────────────────────────────

export type CreateDraftInput = {
  targetAxleLines: number
  targetColumns: number
  routeId?: string
  sourceRequirementId?: string
}

export function createTrailerAssemblyDraft(
  input: CreateDraftInput,
): TrailerAssemblyDraft {
  const id = generateId()
  const ts = now()
  return {
    id,
    routeId: input.routeId,
    sourceRequirementId: input.sourceRequirementId,
    targetAxleLines: input.targetAxleLines,
    targetColumns: input.targetColumns,
    currentAxleLines: 0,
    currentColumns: 0,
    placedModules: [],
    steps: [],
    status: 'empty',
    createdAt: ts,
    updatedAt: ts,
  }
}

// ── Apply step ───────────────────────────────────────────────────────

export type ApplyStepResult = {
  draft: TrailerAssemblyDraft
  error?: TrailerAssemblyError
  log: TrailerAssemblyOperationLog
}

export function applyTrailerAssemblyStep(
  draft: TrailerAssemblyDraft,
  step: TrailerAssemblyStep,
): ApplyStepResult {
  const ts = now()

  // Reset is always allowed
  if (step.stepType === 'reset_assembly') {
    const resetDraft = createTrailerAssemblyDraft({
      targetAxleLines: draft.targetAxleLines,
      targetColumns: draft.targetColumns,
      routeId: draft.routeId,
      sourceRequirementId: draft.sourceRequirementId,
    })
    resetDraft.id = draft.id
    resetDraft.status = 'in_progress'
    return {
      draft: resetDraft,
      log: createTrailerAssemblyOperationLog({
        draftId: draft.id,
        routeId: draft.routeId,
        action: 'reset_assembly',
        resultStatus: 'in_progress',
        message: '已重置拼接草稿。',
      }),
    }
  }

  // Validate
  const validation = validateTrailerAssemblyStep(draft, step)
  if (!validation.valid && validation.error) {
    return {
      draft: {
        ...draft,
        status: 'invalid',
        lastError: validation.error,
        updatedAt: ts,
      },
      error: validation.error,
      log: createTrailerAssemblyOperationLog({
        draftId: draft.id,
        routeId: draft.routeId,
        action: 'assembly_error',
        stepType: step.stepType,
        resultStatus: 'invalid',
        errorCode: validation.error.code,
        message: validation.error.message,
      }),
    }
  }

  // Apply the step
  const updatedDraft: TrailerAssemblyDraft = {
    ...draft,
    updatedAt: ts,
    steps: [...draft.steps, { ...step, createdAt: ts }],
  }

  switch (step.stepType) {
    case 'select_target_configuration': {
      updatedDraft.status = 'in_progress'
      break
    }
    case 'place_main_column': {
      const mainColModule: TrailerAssemblyModule = {
        id: generateId(),
        moduleType: 'main_column',
        columnIndex: 0,
        label: '主纵列',
        positionLabel: `纵列 1（主）`,
        placedAt: ts,
      }
      updatedDraft.placedModules = [...draft.placedModules, mainColModule]
      updatedDraft.currentColumns = 1
      updatedDraft.status = 'in_progress'
      break
    }
    case 'add_axle_module': {
      const colIdx = step.columnIndex ?? 0
      const existingAxles = draft.placedModules.filter(
        (m) => m.moduleType === 'axle_line' && m.columnIndex === colIdx,
      ).length
      const axleModule: TrailerAssemblyModule = {
        id: generateId(),
        moduleType: 'axle_line',
        columnIndex: colIdx,
        axleIndex: existingAxles,
        label: `轴线 ${existingAxles + 1}`,
        positionLabel: `纵列 ${colIdx + 1} · 轴线 ${existingAxles + 1}`,
        placedAt: ts,
      }
      updatedDraft.placedModules = [...draft.placedModules, axleModule]
      updatedDraft.currentAxleLines = draft.currentAxleLines + 1
      updatedDraft.status = 'in_progress'
      break
    }
    case 'add_side_column': {
      const newColIdx = draft.currentColumns
      const sideColModule: TrailerAssemblyModule = {
        id: generateId(),
        moduleType: 'side_column',
        columnIndex: newColIdx,
        label: `纵列 ${newColIdx + 1}`,
        positionLabel: `纵列 ${newColIdx + 1}`,
        placedAt: ts,
      }
      updatedDraft.placedModules = [...draft.placedModules, sideColModule]
      updatedDraft.currentColumns = draft.currentColumns + 1
      updatedDraft.status = 'in_progress'
      break
    }
    case 'connect_tractor_end': {
      const connector: TrailerAssemblyModule = {
        id: generateId(),
        moduleType: 'tractor_connector',
        label: '牵引端连接',
        positionLabel: '牵引端',
        placedAt: ts,
      }
      updatedDraft.placedModules = [...draft.placedModules, connector]
      updatedDraft.status = 'in_progress'
      break
    }
    case 'align_columns': {
      const marker: TrailerAssemblyModule = {
        id: generateId(),
        moduleType: 'alignment_marker',
        label: '纵列对齐检查',
        positionLabel: '对齐标记',
        placedAt: ts,
      }
      updatedDraft.placedModules = [...draft.placedModules, marker]
      updatedDraft.status = 'in_progress'
      break
    }
    case 'complete_assembly': {
      const result = buildAssemblyResult(updatedDraft)
      updatedDraft.result = result
      updatedDraft.status = 'completed'
      break
    }
  }

  return {
    draft: updatedDraft,
    log: createTrailerAssemblyOperationLog({
      draftId: draft.id,
      routeId: draft.routeId,
      action: mapStepTypeToAction(step.stepType),
      stepType: step.stepType,
      resultStatus: updatedDraft.status,
      message: getStepSuccessMessage(step.stepType),
    }),
  }
}

function mapStepTypeToAction(
  stepType: TrailerAssemblyStepType,
): TrailerAssemblyOperationLog['action'] {
  const mapping: Record<
    TrailerAssemblyStepType,
    TrailerAssemblyOperationLog['action']
  > = {
    select_target_configuration: 'select_target_configuration',
    place_main_column: 'place_main_column',
    add_axle_module: 'add_axle_module',
    add_side_column: 'add_side_column',
    connect_tractor_end: 'connect_tractor_end',
    align_columns: 'align_columns',
    complete_assembly: 'complete_assembly',
    reset_assembly: 'reset_assembly',
  }
  return mapping[stepType]
}

function getStepSuccessMessage(stepType: TrailerAssemblyStepType): string {
  const messages: Record<TrailerAssemblyStepType, string> = {
    select_target_configuration: '已选择目标挂车方案。',
    place_main_column: '已放置主纵列。',
    add_axle_module: '已添加轴线模块。',
    add_side_column: '已添加侧纵列。',
    connect_tractor_end: '已连接牵引端。',
    align_columns: '纵列对齐检查完成。',
    complete_assembly: '拼接完成！',
    reset_assembly: '已重置拼接草稿。',
  }
  return messages[stepType]
}

// ── Build result ─────────────────────────────────────────────────────

function buildAssemblyResult(
  draft: TrailerAssemblyDraft,
): TrailerAssemblyResult {
  const connectionOrder: string[] = draft.placedModules.map((m) => m.label)
  return {
    id: generateId(),
    targetAxleLines: draft.targetAxleLines,
    targetColumns: draft.targetColumns,
    completedAxleLines: draft.currentAxleLines,
    completedColumns: draft.currentColumns,
    moduleCount: draft.placedModules.length,
    connectionOrder,
    visualSummary: `${draft.targetAxleLines}轴线 × ${draft.targetColumns}纵列，共 ${draft.placedModules.length} 个模块`,
    readyForHydraulicPointSelection: true,
    teachingNote:
      '拼接完成。下一步将进入 Day74 液压支撑三点编点交互（本阶段不实现）。',
    completedAt: now(),
  }
}

// ── Complete assembly validation ─────────────────────────────────────

export function validateTrailerAssemblySequence(
  draft: TrailerAssemblyDraft,
): ValidationResult {
  // Full sequence validation
  if (draft.status !== 'in_progress') {
    return {
      valid: false,
      error: {
        code: 'missing_target_configuration',
        message: '草稿不在进行中状态。',
        stepType: 'complete_assembly',
        createdAt: now(),
      },
    }
  }

  const completeStep: TrailerAssemblyStep = {
    id: 'check',
    stepType: 'complete_assembly',
    createdAt: now(),
  }
  return validateTrailerAssemblyStep(draft, completeStep)
}

export function completeTrailerAssemblyDraft(
  draft: TrailerAssemblyDraft,
): ApplyStepResult {
  const step: TrailerAssemblyStep = {
    id: generateId(),
    stepType: 'complete_assembly',
    createdAt: now(),
  }
  return applyTrailerAssemblyStep(draft, step)
}

export function resetTrailerAssemblyDraft(
  draft: TrailerAssemblyDraft,
): ApplyStepResult {
  const step: TrailerAssemblyStep = {
    id: generateId(),
    stepType: 'reset_assembly',
    createdAt: now(),
  }
  return applyTrailerAssemblyStep(draft, step)
}

// ── Operation log ────────────────────────────────────────────────────

export function createTrailerAssemblyOperationLog(
  input: Omit<TrailerAssemblyOperationLog, 'id' | 'createdAt'>,
): TrailerAssemblyOperationLog {
  return {
    ...input,
    id: generateId(),
    createdAt: now(),
  }
}

const LOG_STORAGE_KEY = 'heavy-transport-sim:trailer-assembly-logs:v1'

export class LocalTrailerAssemblyLogRepository {
  private storageKey: string

  constructor(storageKey: string = LOG_STORAGE_KEY) {
    this.storageKey = storageKey
  }

  getAll(): TrailerAssemblyOperationLog[] {
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (!raw) return []
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      const valid: TrailerAssemblyOperationLog[] = []
      for (const item of parsed) {
        const result = trailerAssemblyOperationLogSchema.safeParse(item)
        if (result.success) {
          valid.push(result.data)
        }
      }
      return valid.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
    } catch {
      return []
    }
  }

  getByDraft(draftId: string): TrailerAssemblyOperationLog[] {
    return this.getAll().filter((l) => l.draftId === draftId)
  }

  add(log: TrailerAssemblyOperationLog): TrailerAssemblyOperationLog {
    const all = this.getAll()
    all.push(log)
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

// ── Visual summary helpers ───────────────────────────────────────────

export type ColumnLayout = {
  columnIndex: number
  label: string
  axles: TrailerAssemblyModule[]
  isMain: boolean
}

export function getColumnLayouts(draft: TrailerAssemblyDraft): ColumnLayout[] {
  const layouts: ColumnLayout[] = []
  for (let col = 0; col < draft.currentColumns; col++) {
    const axles = draft.placedModules.filter(
      (m) => m.moduleType === 'axle_line' && m.columnIndex === col,
    )
    layouts.push({
      columnIndex: col,
      label: col === 0 ? '主纵列' : `纵列 ${col + 1}`,
      axles,
      isMain: col === 0,
    })
  }
  return layouts
}

export function hasTractorConnector(draft: TrailerAssemblyDraft): boolean {
  return draft.placedModules.some((m) => m.moduleType === 'tractor_connector')
}

export function hasAlignmentMarker(draft: TrailerAssemblyDraft): boolean {
  return draft.placedModules.some((m) => m.moduleType === 'alignment_marker')
}
