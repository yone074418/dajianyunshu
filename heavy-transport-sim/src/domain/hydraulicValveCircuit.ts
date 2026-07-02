import { z } from 'zod'
import {
  HYDRAULIC_REGION_IDS,
  DEFAULT_HYDRAULIC_REGIONS,
  type HydraulicRegionId,
  type HydraulicRegion,
  type HydraulicThreePointResult,
} from './hydraulicSupport'

// ── Constants ────────────────────────────────────────────────────────

const nonEmptyString = z.string().trim().min(1)

// ── Valve state ──────────────────────────────────────────────────────

export const HYDRAULIC_VALVE_STATES = ['open', 'closed'] as const

export type HydraulicValveState = (typeof HYDRAULIC_VALVE_STATES)[number]

// ── Circuit region state ─────────────────────────────────────────────

export const HYDRAULIC_CIRCUIT_REGION_STATES = [
  'connected',
  'disconnected',
  'blocked',
  'unknown',
] as const

export type HydraulicCircuitRegionState =
  (typeof HYDRAULIC_CIRCUIT_REGION_STATES)[number]

// ── Overall circuit state ────────────────────────────────────────────

export const HYDRAULIC_OVERALL_STATES = [
  'all_connected',
  'partially_connected',
  'all_disconnected',
  'blocked',
] as const

export type HydraulicOverallState = (typeof HYDRAULIC_OVERALL_STATES)[number]

// ── Draft status ─────────────────────────────────────────────────────

export const VALVE_CIRCUIT_DRAFT_STATUSES = [
  'blocked',
  'ready',
  'editing',
  'completed',
] as const

export type HydraulicValveCircuitDraftStatus =
  (typeof VALVE_CIRCUIT_DRAFT_STATUSES)[number]

// ── Error codes ──────────────────────────────────────────────────────

export const VALVE_CIRCUIT_ERROR_CODES = [
  'three_point_selection_required',
  'region_not_found',
  'valve_not_found',
  'region_valve_mismatch',
  'invalid_valve_state',
  'circuit_not_ready',
] as const

export type HydraulicValveCircuitErrorCode =
  (typeof VALVE_CIRCUIT_ERROR_CODES)[number]

// ── Operation log actions ────────────────────────────────────────────

export const VALVE_LOG_ACTIONS = [
  'view_valve_circuit',
  'open_valve',
  'close_valve',
  'toggle_valve',
  'reset_valves',
  'circuit_state_changed',
  'valve_error',
] as const

export type HydraulicValveLogAction = (typeof VALVE_LOG_ACTIONS)[number]

// ── Zod schemas ──────────────────────────────────────────────────────

export const hydraulicValveSchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  regionId: z.enum(HYDRAULIC_REGION_IDS),
  state: z.enum(HYDRAULIC_VALVE_STATES),
  description: nonEmptyString,
  updatedAt: nonEmptyString,
})

export const hydraulicCircuitRegionSchema = z.object({
  id: z.enum(HYDRAULIC_REGION_IDS),
  name: nonEmptyString,
  selectedPointId: z.string().optional(),
  valveId: nonEmptyString,
  valveState: z.enum(HYDRAULIC_VALVE_STATES),
  circuitState: z.enum(HYDRAULIC_CIRCUIT_REGION_STATES),
  displayText: nonEmptyString,
})

export const hydraulicValveCircuitErrorSchema = z.object({
  code: z.enum(VALVE_CIRCUIT_ERROR_CODES),
  message: nonEmptyString,
  valveId: z.string().optional(),
  regionId: z.enum(HYDRAULIC_REGION_IDS).optional(),
  createdAt: nonEmptyString,
})

export const hydraulicValveCircuitDraftSchema = z
  .object({
    id: nonEmptyString,
    routeId: z.string().optional(),
    hydraulicSupportDraftId: z.string().optional(),
    threePointSelectionResultId: z.string().optional(),
    valves: z.array(hydraulicValveSchema),
    regions: z.array(hydraulicCircuitRegionSchema),
    overallState: z.enum(HYDRAULIC_OVERALL_STATES),
    status: z.enum(VALVE_CIRCUIT_DRAFT_STATUSES),
    lastError: hydraulicValveCircuitErrorSchema.optional(),
    createdAt: nonEmptyString,
    updatedAt: nonEmptyString,
  })
  .refine(
    (d) => {
      if (d.status === 'blocked') return d.lastError !== undefined
      return true
    },
    { message: 'blocked 状态必须有 lastError' },
  )
  .refine((d) => d.valves.length === d.regions.length, {
    message: 'valves 数量必须与 regions 数量一致',
  })

export const hydraulicValveOperationLogSchema = z.object({
  id: nonEmptyString,
  draftId: nonEmptyString,
  routeId: z.string().optional(),
  action: z.enum(VALVE_LOG_ACTIONS),
  valveId: z.string().optional(),
  regionId: z.enum(HYDRAULIC_REGION_IDS).optional(),
  beforeValue: z.string().optional(),
  afterValue: z.string().optional(),
  overallState: z.string().optional(),
  errorCode: z.string().optional(),
  message: nonEmptyString,
  createdAt: nonEmptyString,
})

// ── Type exports ─────────────────────────────────────────────────────

export type HydraulicValve = z.infer<typeof hydraulicValveSchema>
export type HydraulicCircuitRegion = z.infer<
  typeof hydraulicCircuitRegionSchema
>
export type HydraulicValveCircuitError = z.infer<
  typeof hydraulicValveCircuitErrorSchema
>
export type HydraulicValveCircuitDraft = z.infer<
  typeof hydraulicValveCircuitDraftSchema
>
export type HydraulicValveOperationLog = z.infer<
  typeof hydraulicValveOperationLogSchema
>

// ── Helpers ──────────────────────────────────────────────────────────

function generateId(): string {
  return `vc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function now(): string {
  return new Date().toISOString()
}

// ── Valve creation from regions ──────────────────────────────────────

export function createValvesFromHydraulicRegions(
  regions: HydraulicRegion[],
): HydraulicValve[] {
  const regionLabels: Record<HydraulicRegionId, string> = {
    front_region: '前部阀门',
    middle_region: '中部阀门',
    rear_region: '后部阀门',
  }
  const regionDescriptions: Record<HydraulicRegionId, string> = {
    front_region: '控制前部液压区域的液压供应。',
    middle_region: '控制中部液压区域的液压供应。',
    rear_region: '控制后部液压区域的液压供应。',
  }

  return regions.map((region) => ({
    id: `valve-${region.id}`,
    label: regionLabels[region.id],
    regionId: region.id,
    state: 'closed' as HydraulicValveState,
    description: regionDescriptions[region.id],
    updatedAt: now(),
  }))
}

// ── Circuit state calculation ────────────────────────────────────────

export function calculateRegionCircuitState(
  valveState: HydraulicValveState,
): HydraulicCircuitRegionState {
  return valveState === 'open' ? 'connected' : 'disconnected'
}

export function calculateOverallCircuitState(
  regions: HydraulicCircuitRegion[],
): HydraulicOverallState {
  if (regions.length === 0) return 'blocked'

  const states = regions.map((r) => r.circuitState)
  if (states.some((s) => s === 'blocked' || s === 'unknown')) return 'blocked'

  const connectedCount = states.filter((s) => s === 'connected').length
  if (connectedCount === states.length) return 'all_connected'
  if (connectedCount === 0) return 'all_disconnected'
  return 'partially_connected'
}

// ── Map valve states to region display ───────────────────────────────

export function mapValveStateToRegionDisplay(
  valves: HydraulicValve[],
  baseRegions: HydraulicRegion[],
): HydraulicCircuitRegion[] {
  return baseRegions.map((region) => {
    const valve = valves.find((v) => v.regionId === region.id)
    const valveState = valve?.state ?? 'closed'
    const circuitState = calculateRegionCircuitState(valveState)

    return {
      id: region.id,
      name: region.name,
      selectedPointId: region.selectedPointId,
      valveId: valve?.id ?? `valve-${region.id}`,
      valveState,
      circuitState,
      displayText:
        circuitState === 'connected'
          ? `${region.name}：连通（阀门开启）`
          : `${region.name}：未连通（阀门关闭）`,
    }
  })
}

// ── Draft creation ───────────────────────────────────────────────────

export type CreateValveCircuitDraftInput = {
  threePointResult?: HydraulicThreePointResult
  baseRegions?: HydraulicRegion[]
  routeId?: string
}

export function createHydraulicValveCircuitDraft(
  input: CreateValveCircuitDraftInput,
): HydraulicValveCircuitDraft {
  const id = generateId()
  const ts = now()

  if (!input.threePointResult) {
    return {
      id,
      routeId: input.routeId,
      valves: [],
      regions: [],
      overallState: 'blocked',
      status: 'blocked',
      lastError: {
        code: 'three_point_selection_required',
        message: '需先完成液压支撑三点编点，再进入阀门开关和回路连通状态。',
        createdAt: ts,
      },
      createdAt: ts,
      updatedAt: ts,
    }
  }

  const baseRegions =
    input.baseRegions ??
    input.threePointResult.regions ??
    DEFAULT_HYDRAULIC_REGIONS.map((r) => ({ ...r }))
  const valves = createValvesFromHydraulicRegions(baseRegions)
  const circuitRegions = mapValveStateToRegionDisplay(valves, baseRegions)
  const overallState = calculateOverallCircuitState(circuitRegions)

  return {
    id,
    routeId: input.routeId,
    threePointSelectionResultId: input.threePointResult.id,
    valves,
    regions: circuitRegions,
    overallState,
    status: 'ready',
    createdAt: ts,
    updatedAt: ts,
  }
}

// ── Toggle valve ─────────────────────────────────────────────────────

export type ValveOperationResult = {
  draft: HydraulicValveCircuitDraft
  error?: HydraulicValveCircuitError
  log: HydraulicValveOperationLog
}

export function toggleHydraulicValve(
  draft: HydraulicValveCircuitDraft,
  valveId: string,
): ValveOperationResult {
  const ts = now()

  if (draft.status === 'blocked') {
    const error: HydraulicValveCircuitError = {
      code: 'three_point_selection_required',
      message: '需先完成液压支撑三点编点。',
      createdAt: ts,
    }
    return {
      draft: { ...draft, lastError: error, updatedAt: ts },
      error,
      log: createHydraulicValveOperationLog({
        draftId: draft.id,
        routeId: draft.routeId,
        action: 'valve_error',
        valveId,
        errorCode: error.code,
        message: error.message,
      }),
    }
  }

  const valve = draft.valves.find((v) => v.id === valveId)
  if (!valve) {
    const error: HydraulicValveCircuitError = {
      code: 'valve_not_found',
      message: `阀门 ${valveId} 不存在。`,
      valveId,
      createdAt: ts,
    }
    return {
      draft: { ...draft, lastError: error, updatedAt: ts },
      error,
      log: createHydraulicValveOperationLog({
        draftId: draft.id,
        routeId: draft.routeId,
        action: 'valve_error',
        valveId,
        errorCode: error.code,
        message: error.message,
      }),
    }
  }

  const oldState = valve.state
  const newState: HydraulicValveState = oldState === 'open' ? 'closed' : 'open'

  const newValves = draft.valves.map((v) =>
    v.id === valveId ? { ...v, state: newState, updatedAt: ts } : v,
  )

  const baseRegions: HydraulicRegion[] = draft.regions.map((r) => ({
    id: r.id,
    name: r.name,
    description: '',
    selectedPointId: r.selectedPointId,
  }))
  const newRegions = mapValveStateToRegionDisplay(newValves, baseRegions)
  const newOverall = calculateOverallCircuitState(newRegions)

  const action: HydraulicValveLogAction =
    newState === 'open' ? 'open_valve' : 'close_valve'

  return {
    draft: {
      ...draft,
      valves: newValves,
      regions: newRegions,
      overallState: newOverall,
      status: 'editing',
      lastError: undefined,
      updatedAt: ts,
    },
    log: createHydraulicValveOperationLog({
      draftId: draft.id,
      routeId: draft.routeId,
      action,
      valveId,
      regionId: valve.regionId,
      beforeValue: oldState,
      afterValue: newState,
      overallState: newOverall,
      message: `${valve.label}：${oldState === 'open' ? '开启' : '关闭'} → ${newState === 'open' ? '开启' : '关闭'}。`,
    }),
  }
}

// ── Set valve state directly ─────────────────────────────────────────

export function setHydraulicValveState(
  draft: HydraulicValveCircuitDraft,
  valveId: string,
  state: HydraulicValveState,
): ValveOperationResult {
  const ts = now()

  const valve = draft.valves.find((v) => v.id === valveId)
  if (!valve) {
    const error: HydraulicValveCircuitError = {
      code: 'valve_not_found',
      message: `阀门 ${valveId} 不存在。`,
      valveId,
      createdAt: ts,
    }
    return {
      draft: { ...draft, lastError: error, updatedAt: ts },
      error,
      log: createHydraulicValveOperationLog({
        draftId: draft.id,
        routeId: draft.routeId,
        action: 'valve_error',
        valveId,
        errorCode: error.code,
        message: error.message,
      }),
    }
  }

  if (valve.state === state) {
    return {
      draft: { ...draft, updatedAt: ts },
      log: createHydraulicValveOperationLog({
        draftId: draft.id,
        routeId: draft.routeId,
        action: state === 'open' ? 'open_valve' : 'close_valve',
        valveId,
        regionId: valve.regionId,
        beforeValue: valve.state,
        afterValue: state,
        message: `${valve.label}已是${state === 'open' ? '开启' : '关闭'}状态。`,
      }),
    }
  }

  return toggleHydraulicValve(draft, valveId)
}

// ── Reset all valves ─────────────────────────────────────────────────

export function resetHydraulicValves(
  draft: HydraulicValveCircuitDraft,
): ValveOperationResult {
  const ts = now()

  const newValves = draft.valves.map((v) => ({
    ...v,
    state: 'closed' as HydraulicValveState,
    updatedAt: ts,
  }))

  const baseRegions: HydraulicRegion[] = draft.regions.map((r) => ({
    id: r.id,
    name: r.name,
    description: '',
    selectedPointId: r.selectedPointId,
  }))
  const newRegions = mapValveStateToRegionDisplay(newValves, baseRegions)
  const newOverall = calculateOverallCircuitState(newRegions)

  return {
    draft: {
      ...draft,
      valves: newValves,
      regions: newRegions,
      overallState: newOverall,
      status: 'ready',
      lastError: undefined,
      updatedAt: ts,
    },
    log: createHydraulicValveOperationLog({
      draftId: draft.id,
      routeId: draft.routeId,
      action: 'reset_valves',
      overallState: newOverall,
      message: '已重置所有阀门为关闭状态。',
    }),
  }
}

// ── Validation ───────────────────────────────────────────────────────

export type ValidationResult = {
  valid: boolean
  error?: HydraulicValveCircuitError
}

export function validateHydraulicValveCircuitDraft(
  draft: HydraulicValveCircuitDraft,
): ValidationResult {
  const ts = now()

  if (draft.status === 'blocked') {
    return {
      valid: false,
      error: draft.lastError ?? {
        code: 'circuit_not_ready',
        message: '回路未就绪。',
        createdAt: ts,
      },
    }
  }

  if (draft.valves.length !== 3) {
    return {
      valid: false,
      error: {
        code: 'valve_not_found',
        message: `需要 3 个阀门，当前 ${draft.valves.length} 个。`,
        createdAt: ts,
      },
    }
  }

  if (draft.regions.length !== 3) {
    return {
      valid: false,
      error: {
        code: 'region_not_found',
        message: `需要 3 个区域，当前 ${draft.regions.length} 个。`,
        createdAt: ts,
      },
    }
  }

  // Check valve-region consistency
  for (const region of draft.regions) {
    const valve = draft.valves.find((v) => v.id === region.valveId)
    if (!valve) {
      return {
        valid: false,
        error: {
          code: 'valve_not_found',
          message: `区域 ${region.name} 的阀门 ${region.valveId} 不存在。`,
          valveId: region.valveId,
          regionId: region.id,
          createdAt: ts,
        },
      }
    }
    if (valve.state !== region.valveState) {
      return {
        valid: false,
        error: {
          code: 'region_valve_mismatch',
          message: `区域 ${region.name} 的阀门状态不一致：阀门为 ${valve.state}，区域显示为 ${region.valveState}。`,
          valveId: valve.id,
          regionId: region.id,
          createdAt: ts,
        },
      }
    }
  }

  return { valid: true }
}

// ── Operation log ────────────────────────────────────────────────────

export function createHydraulicValveOperationLog(
  input: Omit<HydraulicValveOperationLog, 'id' | 'createdAt'>,
): HydraulicValveOperationLog {
  return {
    ...input,
    id: generateId(),
    createdAt: now(),
  }
}

// ── Display helpers ──────────────────────────────────────────────────

export function getOverallStateDisplayText(
  state: HydraulicOverallState,
): string {
  const texts: Record<HydraulicOverallState, string> = {
    all_connected: '全部连通：三处液压区域均已供压。',
    partially_connected: '部分连通：部分液压区域已供压。',
    all_disconnected: '全部断开：三处液压区域均未供压。',
    blocked: '阻断：缺少三点编点结果或配置错误。',
  }
  return texts[state]
}

export function getValveStateDisplayText(state: HydraulicValveState): string {
  return state === 'open' ? '开启' : '关闭'
}

export function getCircuitStateDisplayText(
  state: HydraulicCircuitRegionState,
): string {
  const texts: Record<HydraulicCircuitRegionState, string> = {
    connected: '连通',
    disconnected: '未连通',
    blocked: '阻断',
    unknown: '未知',
  }
  return texts[state]
}
