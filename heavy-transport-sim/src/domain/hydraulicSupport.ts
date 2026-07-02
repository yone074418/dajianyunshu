import { z } from 'zod'
import type { TrailerAssemblyResult } from './trailerAssembly'

// ── Constants ────────────────────────────────────────────────────────

const nonEmptyString = z.string().trim().min(1)
const nonNegativeInt = z.number().int().min(0)

// ── Hydraulic region ids ─────────────────────────────────────────────

export const HYDRAULIC_REGION_IDS = [
  'front_region',
  'middle_region',
  'rear_region',
] as const

export type HydraulicRegionId = (typeof HYDRAULIC_REGION_IDS)[number]

// ── Draft status ─────────────────────────────────────────────────────

export const HYDRAULIC_DRAFT_STATUSES = [
  'empty',
  'selecting',
  'completed',
  'invalid',
  'blocked',
] as const

export type HydraulicSupportDraftStatus =
  (typeof HYDRAULIC_DRAFT_STATUSES)[number]

// ── Error codes ──────────────────────────────────────────────────────

export const HYDRAULIC_ERROR_CODES = [
  'trailer_assembly_required',
  'point_not_found',
  'point_already_selected',
  'region_already_has_point',
  'max_three_points_reached',
  'three_points_required',
  'region_missing_point',
  'invalid_point_position',
] as const

export type HydraulicSupportErrorCode = (typeof HYDRAULIC_ERROR_CODES)[number]

// ── Operation log actions ────────────────────────────────────────────

export const HYDRAULIC_LOG_ACTIONS = [
  'view_hydraulic_support',
  'select_support_point',
  'undo_support_point',
  'remove_support_point',
  'reset_support_selection',
  'complete_three_point_selection',
  'selection_error',
] as const

export type HydraulicSupportLogAction = (typeof HYDRAULIC_LOG_ACTIONS)[number]

// ── Zod schemas ──────────────────────────────────────────────────────

export const hydraulicSupportPointSchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  regionId: z.enum(HYDRAULIC_REGION_IDS),
  columnIndex: nonNegativeInt,
  axleIndex: nonNegativeInt,
  positionLabel: nonEmptyString,
  sourceModuleId: z.string().optional(),
  selectedAt: z.string().optional(),
})

export const hydraulicRegionSchema = z.object({
  id: z.enum(HYDRAULIC_REGION_IDS),
  name: nonEmptyString,
  description: nonEmptyString,
  selectedPointId: z.string().optional(),
})

export const hydraulicSupportSelectionErrorSchema = z.object({
  code: z.enum(HYDRAULIC_ERROR_CODES),
  message: nonEmptyString,
  pointId: z.string().optional(),
  regionId: z.enum(HYDRAULIC_REGION_IDS).optional(),
  createdAt: nonEmptyString,
})

export const hydraulicSupportDraftSchema = z
  .object({
    id: nonEmptyString,
    routeId: z.string().optional(),
    trailerAssemblyResultId: z.string().optional(),
    candidatePoints: z.array(hydraulicSupportPointSchema),
    selectedPoints: z.array(hydraulicSupportPointSchema),
    regions: z.array(hydraulicRegionSchema),
    status: z.enum(HYDRAULIC_DRAFT_STATUSES),
    lastError: hydraulicSupportSelectionErrorSchema.optional(),
    createdAt: nonEmptyString,
    updatedAt: nonEmptyString,
  })
  .refine(
    (d) => {
      if (d.status === 'completed') return d.selectedPoints.length === 3
      return true
    },
    { message: 'completed 状态必须正好有 3 个已选点' },
  )
  .refine((d) => d.selectedPoints.length <= 3, {
    message: '已选点不能超过 3 个',
  })

export const hydraulicThreePointResultSchema = z.object({
  id: nonEmptyString,
  trailerAssemblyResultId: z.string().optional(),
  selectedPoints: z.array(hydraulicSupportPointSchema),
  regions: z.array(hydraulicRegionSchema),
  pointCount: nonNegativeInt,
  regionCount: z.literal(3),
  completed: z.boolean(),
  visualSummary: nonEmptyString,
  readyForValveCircuitStep: z.boolean(),
  teachingNote: nonEmptyString,
  completedAt: nonEmptyString,
})

export const hydraulicSupportOperationLogSchema = z.object({
  id: nonEmptyString,
  draftId: nonEmptyString,
  routeId: z.string().optional(),
  action: z.enum(HYDRAULIC_LOG_ACTIONS),
  pointId: z.string().optional(),
  regionId: z.enum(HYDRAULIC_REGION_IDS).optional(),
  beforeValue: z.string().optional(),
  afterValue: z.string().optional(),
  resultStatus: z.enum(HYDRAULIC_DRAFT_STATUSES),
  errorCode: z.string().optional(),
  message: nonEmptyString,
  createdAt: nonEmptyString,
})

// ── Type exports ─────────────────────────────────────────────────────

export type HydraulicSupportPoint = z.infer<typeof hydraulicSupportPointSchema>
export type HydraulicRegion = z.infer<typeof hydraulicRegionSchema>
export type HydraulicSupportSelectionError = z.infer<
  typeof hydraulicSupportSelectionErrorSchema
>
export type HydraulicSupportDraft = z.infer<typeof hydraulicSupportDraftSchema>
export type HydraulicThreePointResult = z.infer<
  typeof hydraulicThreePointResultSchema
>
export type HydraulicSupportOperationLog = z.infer<
  typeof hydraulicSupportOperationLogSchema
>

// ── Helpers ──────────────────────────────────────────────────────────

function generateId(): string {
  return `hs-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function now(): string {
  return new Date().toISOString()
}

// ── Default hydraulic regions ────────────────────────────────────────

export const DEFAULT_HYDRAULIC_REGIONS: HydraulicRegion[] = [
  {
    id: 'front_region',
    name: '前部液压区域',
    description: '挂车前部支撑区域，对应牵引端附近轴线。',
  },
  {
    id: 'middle_region',
    name: '中部液压区域',
    description: '挂车中部支撑区域，对应中间轴线。',
  },
  {
    id: 'rear_region',
    name: '后部液压区域',
    description: '挂车后部支撑区域，对应尾部轴线。',
  },
]

// ── Support point generation ─────────────────────────────────────────

export function generateSupportPointCandidates(
  trailerResult: TrailerAssemblyResult,
): HydraulicSupportPoint[] {
  const points: HydraulicSupportPoint[] = []
  const { targetAxleLines, targetColumns } = trailerResult
  const axlesPerColumn = Math.ceil(targetAxleLines / targetColumns)

  for (let col = 0; col < targetColumns; col++) {
    for (let axle = 0; axle < axlesPerColumn; axle++) {
      // Assign region based on axle position within column
      let regionId: HydraulicRegionId
      const position = axle / Math.max(axlesPerColumn - 1, 1)
      if (position <= 0.33) {
        regionId = 'front_region'
      } else if (position <= 0.66) {
        regionId = 'middle_region'
      } else {
        regionId = 'rear_region'
      }

      // Only include up to targetAxleLines total
      if (col * axlesPerColumn + axle >= targetAxleLines) break

      points.push({
        id: `sp-col${col}-axle${axle}`,
        label: `支撑点 ${points.length + 1}`,
        regionId,
        columnIndex: col,
        axleIndex: axle,
        positionLabel: `纵列 ${col + 1} · 轴线 ${axle + 1}`,
      })
    }
  }

  return points
}

// ── Default regions helper ───────────────────────────────────────────

function createDefaultRegions(): HydraulicRegion[] {
  return DEFAULT_HYDRAULIC_REGIONS.map((r) => ({ ...r }))
}

// ── Draft creation ───────────────────────────────────────────────────

export type CreateHydraulicDraftInput = {
  trailerAssemblyResult?: TrailerAssemblyResult
  routeId?: string
}

export function createHydraulicSupportDraft(
  input: CreateHydraulicDraftInput,
): HydraulicSupportDraft {
  const id = generateId()
  const ts = now()

  if (!input.trailerAssemblyResult) {
    return {
      id,
      routeId: input.routeId,
      candidatePoints: [],
      selectedPoints: [],
      regions: createDefaultRegions(),
      status: 'blocked',
      lastError: {
        code: 'trailer_assembly_required',
        message: '需先完成挂车轴线/纵列拼接，再进入液压支撑三点编点。',
        createdAt: ts,
      },
      createdAt: ts,
      updatedAt: ts,
    }
  }

  const candidatePoints = generateSupportPointCandidates(
    input.trailerAssemblyResult,
  )

  return {
    id,
    routeId: input.routeId,
    trailerAssemblyResultId: input.trailerAssemblyResult.id,
    candidatePoints,
    selectedPoints: [],
    regions: createDefaultRegions(),
    status: 'selecting',
    createdAt: ts,
    updatedAt: ts,
  }
}

// ── Select support point ─────────────────────────────────────────────

export type SelectPointResult = {
  draft: HydraulicSupportDraft
  error?: HydraulicSupportSelectionError
  log: HydraulicSupportOperationLog
}

export function selectHydraulicSupportPoint(
  draft: HydraulicSupportDraft,
  pointId: string,
): SelectPointResult {
  const ts = now()

  if (draft.status === 'blocked' || draft.status === 'empty') {
    const error: HydraulicSupportSelectionError = {
      code: 'trailer_assembly_required',
      message: '需先完成挂车轴线/纵列拼接。',
      createdAt: ts,
    }
    return {
      draft: { ...draft, status: 'invalid', lastError: error, updatedAt: ts },
      error,
      log: createHydraulicSupportOperationLog({
        draftId: draft.id,
        routeId: draft.routeId,
        action: 'selection_error',
        resultStatus: 'invalid',
        errorCode: error.code,
        message: error.message,
      }),
    }
  }

  // Check max 3 points
  if (draft.selectedPoints.length >= 3) {
    const error: HydraulicSupportSelectionError = {
      code: 'max_three_points_reached',
      message: '已选择 3 个支撑点，不能再添加。请先撤销已选点。',
      createdAt: ts,
    }
    return {
      draft: { ...draft, status: 'invalid', lastError: error, updatedAt: ts },
      error,
      log: createHydraulicSupportOperationLog({
        draftId: draft.id,
        routeId: draft.routeId,
        action: 'selection_error',
        pointId,
        resultStatus: 'invalid',
        errorCode: error.code,
        message: error.message,
      }),
    }
  }

  // Find candidate
  const candidate = draft.candidatePoints.find((p) => p.id === pointId)
  if (!candidate) {
    const error: HydraulicSupportSelectionError = {
      code: 'point_not_found',
      message: `支撑点 ${pointId} 不存在。`,
      pointId,
      createdAt: ts,
    }
    return {
      draft: { ...draft, status: 'invalid', lastError: error, updatedAt: ts },
      error,
      log: createHydraulicSupportOperationLog({
        draftId: draft.id,
        routeId: draft.routeId,
        action: 'selection_error',
        pointId,
        resultStatus: 'invalid',
        errorCode: error.code,
        message: error.message,
      }),
    }
  }

  // Check duplicate
  if (draft.selectedPoints.some((p) => p.id === pointId)) {
    const error: HydraulicSupportSelectionError = {
      code: 'point_already_selected',
      message: `支撑点 ${candidate.label} 已被选择，不能重复选择。`,
      pointId,
      createdAt: ts,
    }
    return {
      draft: { ...draft, status: 'invalid', lastError: error, updatedAt: ts },
      error,
      log: createHydraulicSupportOperationLog({
        draftId: draft.id,
        routeId: draft.routeId,
        action: 'selection_error',
        pointId,
        regionId: candidate.regionId,
        resultStatus: 'invalid',
        errorCode: error.code,
        message: error.message,
      }),
    }
  }

  // Check region already has point
  if (
    draft.regions.some((r) => r.id === candidate.regionId && r.selectedPointId)
  ) {
    const error: HydraulicSupportSelectionError = {
      code: 'region_already_has_point',
      message: `${candidate.regionId === 'front_region' ? '前部' : candidate.regionId === 'middle_region' ? '中部' : '后部'}液压区域已有支撑点，请先撤销或选择其他区域。`,
      pointId,
      regionId: candidate.regionId,
      createdAt: ts,
    }
    return {
      draft: { ...draft, status: 'invalid', lastError: error, updatedAt: ts },
      error,
      log: createHydraulicSupportOperationLog({
        draftId: draft.id,
        routeId: draft.routeId,
        action: 'selection_error',
        pointId,
        regionId: candidate.regionId,
        resultStatus: 'invalid',
        errorCode: error.code,
        message: error.message,
      }),
    }
  }

  // Apply selection
  const selectedPoint = { ...candidate, selectedAt: ts }
  const newSelectedPoints = [...draft.selectedPoints, selectedPoint]
  const newRegions = draft.regions.map((r) =>
    r.id === candidate.regionId ? { ...r, selectedPointId: pointId } : r,
  )

  const newStatus: HydraulicSupportDraftStatus =
    newSelectedPoints.length === 3 ? 'completed' : 'selecting'

  const updatedDraft: HydraulicSupportDraft = {
    ...draft,
    selectedPoints: newSelectedPoints,
    regions: newRegions,
    status: newStatus,
    lastError: undefined,
    updatedAt: ts,
  }

  return {
    draft: updatedDraft,
    log: createHydraulicSupportOperationLog({
      draftId: draft.id,
      routeId: draft.routeId,
      action: 'select_support_point',
      pointId,
      regionId: candidate.regionId,
      resultStatus: newStatus,
      message: `已选择 ${candidate.label}（${candidate.positionLabel}），${newSelectedPoints.length}/3。`,
    }),
  }
}

// ── Undo last selected point ─────────────────────────────────────────

export function undoHydraulicSupportPoint(
  draft: HydraulicSupportDraft,
): SelectPointResult {
  const ts = now()

  if (draft.selectedPoints.length === 0) {
    const error: HydraulicSupportSelectionError = {
      code: 'three_points_required',
      message: '没有已选支撑点可撤销。',
      createdAt: ts,
    }
    return {
      draft: { ...draft, status: 'invalid', lastError: error, updatedAt: ts },
      error,
      log: createHydraulicSupportOperationLog({
        draftId: draft.id,
        routeId: draft.routeId,
        action: 'selection_error',
        resultStatus: 'invalid',
        errorCode: error.code,
        message: error.message,
      }),
    }
  }

  const lastPoint = draft.selectedPoints[draft.selectedPoints.length - 1]
  const newSelectedPoints = draft.selectedPoints.slice(0, -1)
  const newRegions = draft.regions.map((r) =>
    r.selectedPointId === lastPoint.id
      ? { ...r, selectedPointId: undefined }
      : r,
  )

  return {
    draft: {
      ...draft,
      selectedPoints: newSelectedPoints,
      regions: newRegions,
      status: 'selecting',
      lastError: undefined,
      updatedAt: ts,
    },
    log: createHydraulicSupportOperationLog({
      draftId: draft.id,
      routeId: draft.routeId,
      action: 'undo_support_point',
      pointId: lastPoint.id,
      regionId: lastPoint.regionId,
      resultStatus: 'selecting',
      message: `已撤销 ${lastPoint.label}，剩余 ${newSelectedPoints.length}/3。`,
    }),
  }
}

// ── Remove specific point ────────────────────────────────────────────

export function removeHydraulicSupportPoint(
  draft: HydraulicSupportDraft,
  pointId: string,
): SelectPointResult {
  const ts = now()

  const target = draft.selectedPoints.find((p) => p.id === pointId)
  if (!target) {
    const error: HydraulicSupportSelectionError = {
      code: 'point_not_found',
      message: `已选列表中不存在支撑点 ${pointId}。`,
      pointId,
      createdAt: ts,
    }
    return {
      draft: { ...draft, status: 'invalid', lastError: error, updatedAt: ts },
      error,
      log: createHydraulicSupportOperationLog({
        draftId: draft.id,
        routeId: draft.routeId,
        action: 'selection_error',
        pointId,
        resultStatus: 'invalid',
        errorCode: error.code,
        message: error.message,
      }),
    }
  }

  const newSelectedPoints = draft.selectedPoints.filter((p) => p.id !== pointId)
  const newRegions = draft.regions.map((r) =>
    r.selectedPointId === pointId ? { ...r, selectedPointId: undefined } : r,
  )

  return {
    draft: {
      ...draft,
      selectedPoints: newSelectedPoints,
      regions: newRegions,
      status: 'selecting',
      lastError: undefined,
      updatedAt: ts,
    },
    log: createHydraulicSupportOperationLog({
      draftId: draft.id,
      routeId: draft.routeId,
      action: 'remove_support_point',
      pointId,
      regionId: target.regionId,
      resultStatus: 'selecting',
      message: `已移除 ${target.label}，剩余 ${newSelectedPoints.length}/3。`,
    }),
  }
}

// ── Reset all selections ─────────────────────────────────────────────

export function resetHydraulicSupportSelection(
  draft: HydraulicSupportDraft,
): SelectPointResult {
  const ts = now()

  return {
    draft: {
      ...draft,
      selectedPoints: [],
      regions: createDefaultRegions(),
      status: 'selecting',
      lastError: undefined,
      updatedAt: ts,
    },
    log: createHydraulicSupportOperationLog({
      draftId: draft.id,
      routeId: draft.routeId,
      action: 'reset_support_selection',
      resultStatus: 'selecting',
      message: '已重置所有支撑点选择。',
    }),
  }
}

// ── Map selected points to regions ───────────────────────────────────

export function mapSelectedPointsToHydraulicRegions(
  draft: HydraulicSupportDraft,
): HydraulicRegion[] {
  return draft.regions.map((region) => {
    const selected = draft.selectedPoints.find((p) => p.regionId === region.id)
    return selected
      ? { ...region, selectedPointId: selected.id }
      : { ...region, selectedPointId: undefined }
  })
}

// ── Validate three-point selection ───────────────────────────────────

export type ValidationResult = {
  valid: boolean
  error?: HydraulicSupportSelectionError
}

export function validateThreePointSelection(
  draft: HydraulicSupportDraft,
): ValidationResult {
  const ts = now()

  if (draft.status === 'blocked') {
    return {
      valid: false,
      error: {
        code: 'trailer_assembly_required',
        message: '需先完成挂车轴线/纵列拼接。',
        createdAt: ts,
      },
    }
  }

  if (draft.selectedPoints.length < 3) {
    return {
      valid: false,
      error: {
        code: 'three_points_required',
        message: `需要选择 3 个支撑点，当前已选 ${draft.selectedPoints.length} 个。`,
        createdAt: ts,
      },
    }
  }

  // Check all 3 regions covered
  for (const region of draft.regions) {
    const hasPoint = draft.selectedPoints.some((p) => p.regionId === region.id)
    if (!hasPoint) {
      return {
        valid: false,
        error: {
          code: 'region_missing_point',
          message: `${region.name}尚未选择支撑点。`,
          regionId: region.id,
          createdAt: ts,
        },
      }
    }
  }

  return { valid: true }
}

export function validateHydraulicSupportDraft(
  draft: HydraulicSupportDraft,
): ValidationResult {
  return validateThreePointSelection(draft)
}

// ── Complete three-point selection ───────────────────────────────────

export function completeThreePointSelection(draft: HydraulicSupportDraft): {
  result: HydraulicThreePointResult
  log: HydraulicSupportOperationLog
} {
  const ts = now()

  const result: HydraulicThreePointResult = {
    id: generateId(),
    trailerAssemblyResultId: draft.trailerAssemblyResultId,
    selectedPoints: [...draft.selectedPoints],
    regions: mapSelectedPointsToHydraulicRegions(draft),
    pointCount: draft.selectedPoints.length,
    regionCount: 3,
    completed: true,
    visualSummary: `已选择 ${draft.selectedPoints.length} 个支撑点，覆盖前部、中部、后部三处液压区域。`,
    readyForValveCircuitStep: true,
    teachingNote:
      '三点编点完成。下一步将进入 Day75 阀门开关和回路连通状态（本阶段不实现）。',
    completedAt: ts,
  }

  return {
    result,
    log: createHydraulicSupportOperationLog({
      draftId: draft.id,
      routeId: draft.routeId,
      action: 'complete_three_point_selection',
      resultStatus: 'completed',
      message: '液压支撑三点编点完成。',
    }),
  }
}

// ── Operation log ────────────────────────────────────────────────────

export function createHydraulicSupportOperationLog(
  input: Omit<HydraulicSupportOperationLog, 'id' | 'createdAt'>,
): HydraulicSupportOperationLog {
  return {
    ...input,
    id: generateId(),
    createdAt: now(),
  }
}

// ── Visual helpers ───────────────────────────────────────────────────

export function getRegionPointStatus(
  draft: HydraulicSupportDraft,
  regionId: HydraulicRegionId,
): { selected: boolean; point?: HydraulicSupportPoint } {
  const region = draft.regions.find((r) => r.id === regionId)
  if (!region?.selectedPointId) return { selected: false }
  const point = draft.selectedPoints.find(
    (p) => p.id === region.selectedPointId,
  )
  return { selected: true, point }
}

export function getSelectionProgress(draft: HydraulicSupportDraft): {
  current: number
  total: number
  label: string
} {
  const current = draft.selectedPoints.length
  return {
    current,
    total: 3,
    label: `${current}/3`,
  }
}
