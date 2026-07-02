import { z } from 'zod'

// ── Constants ────────────────────────────────────────────────────────

const nonEmptyString = z.string().trim().min(1)
const positiveInt = z.number().int().positive()
const finiteNumber = z.number().finite()

// ── Teaching weight limits (from configurationRules.ts) ──────────────

const AXLE_LINE_WEIGHT_LIMITS: Record<number, Record<number, number>> = {
  4: { 1: 60 },
  6: { 1: 100, 2: 120 },
  8: { 1: 150, 2: 180 },
  10: { 2: 200 },
  12: { 2: 300, 3: 400 },
  16: { 2: 400, 3: 500 },
}

export function getTeachingWeightLimitT(
  axleLines: number,
  columns: number,
): number | null {
  return AXLE_LINE_WEIGHT_LIMITS[axleLines]?.[columns] ?? null
}

// ── Status enums ─────────────────────────────────────────────────────

export const AXLE_LOAD_STATUSES = [
  'pass',
  'pass_with_warning',
  'fail',
  'blocked',
] as const

export type AxleLoadRuleStatus = (typeof AXLE_LOAD_STATUSES)[number]

export const AXLE_LOAD_BOUNDARY_CASES = [
  'load_below_limit',
  'load_equal_to_limit',
  'load_over_limit',
  'missing_parameter',
  'invalid_parameter',
] as const

export type AxleLoadBoundaryCase = (typeof AXLE_LOAD_BOUNDARY_CASES)[number]

export const AXLE_LOAD_DISTRIBUTION_MODES = [
  'average_by_axle_line',
  'average_by_axle_and_column',
  'teaching_simplified',
] as const

export type AxleLoadDistributionMode =
  (typeof AXLE_LOAD_DISTRIBUTION_MODES)[number]

export const AXLE_LOAD_SOURCES = [
  'trailer_assembly_result',
  'vehicle_configuration',
  'manual_input',
  'teaching_config',
] as const

export type AxleLoadSource = (typeof AXLE_LOAD_SOURCES)[number]

// ── Reselection status ───────────────────────────────────────────────

export const AXLE_LOAD_RESELECTION_STATUSES = [
  'not_started',
  'needs_modification',
  'editing',
  'pending_recalculation',
  'recalculated',
  'ready_to_confirm',
  'confirmed',
  'blocked',
] as const

export type AxleLoadReselectionStatus =
  (typeof AXLE_LOAD_RESELECTION_STATUSES)[number]

// ── Error codes ──────────────────────────────────────────────────────

export const AXLE_LOAD_ERROR_CODES = [
  'trailer_assembly_required',
  'hydraulic_support_required',
  'valve_circuit_required',
  'missing_total_mass',
  'missing_axle_lines',
  'missing_columns',
  'missing_weight_limit',
  'invalid_axle_lines',
  'invalid_columns',
  'invalid_safety_factor',
  'invalid_mass',
  'axle_load_exceeded',
  'cannot_confirm_vehicle',
] as const

export type AxleLoadErrorCode = (typeof AXLE_LOAD_ERROR_CODES)[number]

// ── Operation log actions ────────────────────────────────────────────

export const AXLE_LOAD_LOG_ACTIONS = [
  'view_axle_load_check',
  'run_axle_load_rule',
  'axle_load_pass',
  'axle_load_fail',
  'axle_load_blocked',
  'request_reselection',
  'change_axle_lines',
  'change_columns',
  'change_total_mass',
  'run_recalculation',
  'confirm_final_vehicle',
  'confirm_blocked',
] as const

export type AxleLoadLogAction = (typeof AXLE_LOAD_LOG_ACTIONS)[number]

// ── Zod schemas ──────────────────────────────────────────────────────

export const axleLoadInputSchema = z
  .object({
    routeId: z.string().optional(),
    vehicleConfigurationId: z.string().optional(),
    trailerAssemblyResultId: z.string().optional(),
    hydraulicSupportResultId: z.string().optional(),
    valveCircuitResultId: z.string().optional(),
    cargoMassT: finiteNumber.positive(),
    tractorMassT: finiteNumber.nonnegative().optional(),
    trailerMassT: finiteNumber.nonnegative().optional(),
    totalTransportMassT: finiteNumber.positive().optional(),
    axleLines: positiveInt,
    columns: positiveInt,
    singleAxleLineLimitT: finiteNumber.positive(),
    safetyFactor: finiteNumber.positive().optional(),
    loadDistributionMode: z.enum(AXLE_LOAD_DISTRIBUTION_MODES),
    source: z.enum(AXLE_LOAD_SOURCES),
  })
  .refine(
    (d) => {
      if (d.safetyFactor !== undefined) return d.safetyFactor > 0
      return true
    },
    { message: 'safetyFactor 必须大于 0' },
  )

export const axleLoadCheckResultSchema = z.object({
  checkId: z.enum([
    'total_mass_check',
    'axle_line_load_check',
    'column_distribution_check',
    'hydraulic_support_readiness_check',
    'parameter_completeness',
  ]),
  status: z.enum(AXLE_LOAD_STATUSES),
  passed: z.boolean(),
  reason: nonEmptyString,
  teachingNote: nonEmptyString,
  details: z.record(z.string(), z.unknown()).optional(),
})

export const axleLoadRuleResultSchema = z.object({
  ruleId: z.literal('axle_load'),
  status: z.enum(AXLE_LOAD_STATUSES),
  passed: z.boolean(),
  averageAxleLineLoadT: finiteNumber.optional(),
  distributedAxleLoadT: finiteNumber.optional(),
  singleAxleLineLimitT: finiteNumber.positive().optional(),
  loadMarginT: finiteNumber.optional(),
  totalTransportMassT: finiteNumber.positive().optional(),
  axleLines: positiveInt.optional(),
  columns: positiveInt.optional(),
  boundaryCase: z.enum(AXLE_LOAD_BOUNDARY_CASES),
  checks: z.array(axleLoadCheckResultSchema),
  summary: nonEmptyString,
  reasons: z.array(nonEmptyString),
  nextAction: nonEmptyString,
  canConfirmVehicle: z.boolean(),
  mustReturnToModify: z.boolean(),
  calculationProcess: z.array(nonEmptyString),
  teachingSimplificationNotice: nonEmptyString,
  evaluatedAt: nonEmptyString,
  engineVersion: nonEmptyString,
})

export const axleLoadReselectionStateSchema = z.object({
  id: nonEmptyString,
  routeId: z.string().optional(),
  sourceRuleResultId: z.string().optional(),
  status: z.enum(AXLE_LOAD_RESELECTION_STATUSES),
  before: z.object({
    axleLines: positiveInt,
    columns: positiveInt,
    totalTransportMassT: finiteNumber.positive(),
    averageAxleLineLoadT: finiteNumber.optional(),
  }),
  after: z.object({
    axleLines: positiveInt,
    columns: positiveInt,
    totalTransportMassT: finiteNumber.positive(),
    averageAxleLineLoadT: finiteNumber.optional(),
  }),
  latestRuleResult: axleLoadRuleResultSchema.optional(),
  modificationReason: nonEmptyString,
  canConfirmVehicle: z.boolean(),
  updatedAt: nonEmptyString,
  createdAt: nonEmptyString,
})

export const finalVehicleConfigurationSummarySchema = z.object({
  id: nonEmptyString,
  routeId: z.string().optional(),
  vehicleCombinationId: z.string().optional(),
  tractorCount: positiveInt,
  axleLines: positiveInt,
  columns: positiveInt,
  totalTransportMassT: finiteNumber.positive(),
  averageAxleLineLoadT: finiteNumber.positive(),
  axleLoadRuleResultId: z.string().optional(),
  confirmed: z.boolean(),
  confirmedAt: z.string().optional(),
  teachingNote: nonEmptyString,
})

export const axleLoadOperationLogSchema = z.object({
  id: nonEmptyString,
  routeId: z.string().optional(),
  action: z.enum(AXLE_LOAD_LOG_ACTIONS),
  beforeValue: z.string().optional(),
  afterValue: z.string().optional(),
  resultStatus: z.string().optional(),
  message: nonEmptyString,
  createdAt: nonEmptyString,
})

// ── Type exports ─────────────────────────────────────────────────────

export type AxleLoadInput = z.infer<typeof axleLoadInputSchema>
export type AxleLoadCheckResult = z.infer<typeof axleLoadCheckResultSchema>
export type AxleLoadRuleResult = z.infer<typeof axleLoadRuleResultSchema>
export type AxleLoadReselectionState = z.infer<
  typeof axleLoadReselectionStateSchema
>
export type FinalVehicleConfigurationSummary = z.infer<
  typeof finalVehicleConfigurationSummarySchema
>
export type AxleLoadOperationLog = z.infer<typeof axleLoadOperationLogSchema>

// ── Helpers ──────────────────────────────────────────────────────────

function generateId(): string {
  return `al-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function now(): string {
  return new Date().toISOString()
}

const ENGINE_VERSION = 'axle-load-teaching-v1.0'

// ── Validation ───────────────────────────────────────────────────────

export type ValidationResult = {
  valid: boolean
  error?: { code: AxleLoadErrorCode; message: string }
}

export function validateAxleLoadInput(input: AxleLoadInput): ValidationResult {
  if (!Number.isFinite(input.cargoMassT) || input.cargoMassT <= 0) {
    return {
      valid: false,
      error: {
        code: 'invalid_mass',
        message: '货物质量必须为有限正数。',
      },
    }
  }

  if (!Number.isInteger(input.axleLines) || input.axleLines <= 0) {
    return {
      valid: false,
      error: {
        code: 'invalid_axle_lines',
        message: '轴线数必须为正整数。',
      },
    }
  }

  if (!Number.isInteger(input.columns) || input.columns <= 0) {
    return {
      valid: false,
      error: {
        code: 'invalid_columns',
        message: '纵列数必须为正整数。',
      },
    }
  }

  if (
    input.safetyFactor !== undefined &&
    (!Number.isFinite(input.safetyFactor) || input.safetyFactor <= 0)
  ) {
    return {
      valid: false,
      error: {
        code: 'invalid_safety_factor',
        message: '安全系数必须为有限正数。',
      },
    }
  }

  if (
    input.totalTransportMassT !== undefined &&
    (!Number.isFinite(input.totalTransportMassT) ||
      input.totalTransportMassT <= 0)
  ) {
    return {
      valid: false,
      error: {
        code: 'invalid_mass',
        message: '运输总质量必须为有限正数。',
      },
    }
  }

  return { valid: true }
}

// ── Calculation functions ────────────────────────────────────────────

export function calculateTotalTransportMass(input: AxleLoadInput): number {
  if (input.totalTransportMassT !== undefined) {
    return input.totalTransportMassT
  }
  const tractor = input.tractorMassT ?? 0
  const trailer = input.trailerMassT ?? 0
  return input.cargoMassT + tractor + trailer
}

export function calculateAverageAxleLineLoad(
  totalMassT: number,
  axleLines: number,
  safetyFactor: number = 1.0,
): number {
  return (totalMassT * safetyFactor) / axleLines
}

export function calculateColumnDistributedLoad(
  totalMassT: number,
  axleLines: number,
  columns: number,
  safetyFactor: number = 1.0,
): number {
  return (totalMassT * safetyFactor) / axleLines / columns
}

// ── Main rule evaluation ─────────────────────────────────────────────

export function evaluateAxleLoadRule(input: AxleLoadInput): AxleLoadRuleResult {
  const ts = now()
  const checks: AxleLoadCheckResult[] = []
  const reasons: string[] = []
  const calculationProcess: string[] = []

  // Validate input
  const validation = validateAxleLoadInput(input)
  if (!validation.valid) {
    checks.push({
      checkId: 'parameter_completeness',
      status: 'blocked',
      passed: false,
      reason: validation.error!.message,
      teachingNote: '请补全所有必需参数后再执行轴线载荷检查。',
    })
    return {
      ruleId: 'axle_load',
      status: 'blocked',
      passed: false,
      boundaryCase: 'invalid_parameter',
      checks,
      summary: `参数校验失败：${validation.error!.message}`,
      reasons: [validation.error!.message],
      nextAction: '请修正参数后重新检查。',
      canConfirmVehicle: false,
      mustReturnToModify: true,
      calculationProcess: [`参数校验失败：${validation.error!.message}`],
      teachingSimplificationNotice:
        '本规则为教学简化轴线载荷判断，不替代真实工程校核。',
      evaluatedAt: ts,
      engineVersion: ENGINE_VERSION,
    }
  }

  // Check teaching weight limit exists
  const limit = input.singleAxleLineLimitT
  if (
    limit === null ||
    limit === undefined ||
    !Number.isFinite(limit) ||
    limit <= 0
  ) {
    const msg = `单轴线教学限值未定义或无效。`
    checks.push({
      checkId: 'parameter_completeness',
      status: 'blocked',
      passed: false,
      reason: msg,
      teachingNote: '请确认轴线数和纵列数组合是否合法。',
    })
    return {
      ruleId: 'axle_load',
      status: 'blocked',
      passed: false,
      singleAxleLineLimitT: input.singleAxleLineLimitT,
      axleLines: input.axleLines,
      columns: input.columns,
      boundaryCase: 'missing_parameter',
      checks,
      summary: msg,
      reasons: [msg],
      nextAction: '请调整轴线数或纵列数后重新检查。',
      canConfirmVehicle: false,
      mustReturnToModify: true,
      calculationProcess: [msg],
      teachingSimplificationNotice:
        '本规则为教学简化轴线载荷判断，不替代真实工程校核。',
      evaluatedAt: ts,
      engineVersion: ENGINE_VERSION,
    }
  }

  // Calculate total transport mass
  const totalMass = calculateTotalTransportMass(input)
  const safetyFactor = input.safetyFactor ?? 1.0
  const checkedMass = totalMass * safetyFactor

  calculationProcess.push(
    `运输总质量 = ${input.cargoMassT}(货物)${input.tractorMassT ? ` + ${input.tractorMassT}(牵引车)` : ''}${input.trailerMassT ? ` + ${input.trailerMassT}(挂车)` : ''} = ${totalMass.toFixed(1)}t`,
  )
  calculationProcess.push(
    `安全系数 = ${safetyFactor}，校核总质量 = ${totalMass.toFixed(1)} × ${safetyFactor} = ${checkedMass.toFixed(1)}t`,
  )

  // Total mass check
  checks.push({
    checkId: 'total_mass_check',
    status: 'pass',
    passed: true,
    reason: `运输总质量 ${totalMass.toFixed(1)}t，校核总质量 ${checkedMass.toFixed(1)}t。`,
    teachingNote: '运输总质量包含货物、牵引车和挂车。',
    details: { totalMassT: totalMass, checkedMassT: checkedMass },
  })

  // Average axle line load
  const avgLoad = calculateAverageAxleLineLoad(
    totalMass,
    input.axleLines,
    safetyFactor,
  )
  calculationProcess.push(
    `平均单轴线载荷 = ${checkedMass.toFixed(1)} ÷ ${input.axleLines} = ${avgLoad.toFixed(2)}t/轴线`,
  )

  // Column distributed load
  const colLoad = calculateColumnDistributedLoad(
    totalMass,
    input.axleLines,
    input.columns,
    safetyFactor,
  )
  calculationProcess.push(
    `纵列分担载荷 = ${checkedMass.toFixed(1)} ÷ ${input.axleLines} ÷ ${input.columns} = ${colLoad.toFixed(2)}t/轴线`,
  )

  calculationProcess.push(
    `单轴线教学限值 = ${limit}t（${input.axleLines}轴线${input.columns}纵列）`,
  )

  // Axle line load check
  const margin = limit - avgLoad
  let boundaryCase: AxleLoadBoundaryCase
  let status: AxleLoadRuleStatus
  let passed: boolean

  if (avgLoad < limit) {
    boundaryCase = 'load_below_limit'
    status = 'pass'
    passed = true
    const msg = `平均单轴线载荷 ${avgLoad.toFixed(2)}t < 限值 ${limit}t，载荷余量 ${margin.toFixed(2)}t。`
    checks.push({
      checkId: 'axle_line_load_check',
      status: 'pass',
      passed: true,
      reason: msg,
      teachingNote: '轴线载荷在教学限值范围内。',
    })
    reasons.push(msg)
    calculationProcess.push(`结论：${msg}`)
  } else if (Math.abs(avgLoad - limit) < 0.01) {
    boundaryCase = 'load_equal_to_limit'
    status = 'pass_with_warning'
    passed = true
    const msg = `平均单轴线载荷 ${avgLoad.toFixed(2)}t ≈ 限值 ${limit}t，处于边界。`
    checks.push({
      checkId: 'axle_line_load_check',
      status: 'pass_with_warning',
      passed: true,
      reason: msg,
      teachingNote: '轴线载荷处于边界，建议留有余量。',
    })
    reasons.push(msg)
    calculationProcess.push(`结论：${msg}`)
  } else {
    boundaryCase = 'load_over_limit'
    status = 'fail'
    passed = false
    const msg = `平均单轴线载荷 ${avgLoad.toFixed(2)}t > 限值 ${limit}t，超载 ${(avgLoad - limit).toFixed(2)}t。`
    checks.push({
      checkId: 'axle_line_load_check',
      status: 'fail',
      passed: false,
      reason: msg,
      teachingNote:
        '轴线载荷超出教学限值，必须增加轴线数、减少货物质量或调整纵列数。',
    })
    reasons.push(msg)
    calculationProcess.push(`结论：${msg}`)
    calculationProcess.push(
      `修改建议：增加轴线数或减少运输总质量，使平均单轴线载荷 ≤ ${limit}t。`,
    )
  }

  // Column distribution check
  checks.push({
    checkId: 'column_distribution_check',
    status: status,
    passed: passed,
    reason: `纵列分担载荷 ${colLoad.toFixed(2)}t/轴线，限值 ${limit}t。`,
    teachingNote: '纵列分担载荷为教学简化计算。',
    details: { distributedLoadT: colLoad, limitT: limit },
  })

  // Hydraulic support readiness
  checks.push({
    checkId: 'hydraulic_support_readiness_check',
    status: 'pass',
    passed: true,
    reason: input.hydraulicSupportResultId
      ? '液压支撑三点编点已完成。'
      : '液压支撑三点编点状态未确认（不影响轴线载荷计算）。',
    teachingNote: '液压支撑编点为独立步骤。',
  })

  const summary =
    status === 'fail'
      ? `轴线载荷检查不通过：${reasons.join('；')}`
      : status === 'pass_with_warning'
        ? `轴线载荷检查边界通过：${reasons.join('；')}`
        : `轴线载荷检查通过：${reasons.join('；')}`

  return {
    ruleId: 'axle_load',
    status,
    passed,
    averageAxleLineLoadT: avgLoad,
    distributedAxleLoadT: colLoad,
    singleAxleLineLimitT: limit,
    loadMarginT: margin,
    totalTransportMassT: totalMass,
    axleLines: input.axleLines,
    columns: input.columns,
    boundaryCase,
    checks,
    summary,
    reasons,
    nextAction:
      status === 'fail'
        ? '轴线载荷超限，必须返回修改轴线数、纵列数或运输总质量。'
        : status === 'pass_with_warning'
          ? '轴线载荷处于边界，可以确定车组但建议留有余量。'
          : '轴线载荷满足要求，可以确定车组。',
    canConfirmVehicle: passed,
    mustReturnToModify: !passed,
    calculationProcess,
    teachingSimplificationNotice:
      '本规则为教学简化轴线载荷判断，不替代真实轴载、轮压、悬架压力或桥梁验算。',
    evaluatedAt: ts,
    engineVersion: ENGINE_VERSION,
  }
}

// ── Reselection flow ─────────────────────────────────────────────────

export function createReselectionFlowState(input: {
  routeId?: string
  ruleResult: AxleLoadRuleResult
  axleLines: number
  columns: number
  totalTransportMassT: number
}): AxleLoadReselectionState {
  const ts = now()
  return {
    id: generateId(),
    routeId: input.routeId,
    sourceRuleResultId: input.ruleResult.ruleId,
    status:
      input.ruleResult.status === 'fail'
        ? 'needs_modification'
        : 'ready_to_confirm',
    before: {
      axleLines: input.axleLines,
      columns: input.columns,
      totalTransportMassT: input.totalTransportMassT,
      averageAxleLineLoadT: input.ruleResult.averageAxleLineLoadT,
    },
    after: {
      axleLines: input.axleLines,
      columns: input.columns,
      totalTransportMassT: input.totalTransportMassT,
    },
    latestRuleResult: input.ruleResult,
    modificationReason:
      input.ruleResult.status === 'fail'
        ? input.ruleResult.reasons.join('；')
        : '',
    canConfirmVehicle: input.ruleResult.canConfirmVehicle,
    createdAt: ts,
    updatedAt: ts,
  }
}

export function requestVehicleReselection(
  state: AxleLoadReselectionState,
  reason: string,
): AxleLoadReselectionState {
  return {
    ...state,
    status: 'needs_modification',
    modificationReason: reason,
    canConfirmVehicle: false,
    updatedAt: now(),
  }
}

export function applyAxleLoadReselection(
  state: AxleLoadReselectionState,
  changes: {
    axleLines?: number
    columns?: number
    totalTransportMassT?: number
  },
): AxleLoadReselectionState {
  return {
    ...state,
    status: 'pending_recalculation',
    after: {
      axleLines: changes.axleLines ?? state.after.axleLines,
      columns: changes.columns ?? state.after.columns,
      totalTransportMassT:
        changes.totalTransportMassT ?? state.after.totalTransportMassT,
    },
    canConfirmVehicle: false,
    updatedAt: now(),
  }
}

export function recalculateAxleLoadAfterReselection(
  state: AxleLoadReselectionState,
  context: {
    cargoMassT: number
    tractorMassT?: number
    trailerMassT?: number
    singleAxleLineLimitT: number
    safetyFactor?: number
    loadDistributionMode: AxleLoadDistributionMode
    source: AxleLoadSource
  },
): { state: AxleLoadReselectionState; result: AxleLoadRuleResult } {
  const input: AxleLoadInput = {
    ...context,
    totalTransportMassT: state.after.totalTransportMassT,
    axleLines: state.after.axleLines,
    columns: state.after.columns,
    routeId: state.routeId,
  }
  const result = evaluateAxleLoadRule(input)

  const newState: AxleLoadReselectionState = {
    ...state,
    status: result.passed ? 'ready_to_confirm' : 'needs_modification',
    after: {
      ...state.after,
      averageAxleLineLoadT: result.averageAxleLineLoadT,
    },
    latestRuleResult: result,
    canConfirmVehicle: result.canConfirmVehicle,
    updatedAt: now(),
  }

  return { state: newState, result }
}

export function confirmFinalVehicleConfiguration(
  state: AxleLoadReselectionState,
): {
  summary: FinalVehicleConfigurationSummary
  state: AxleLoadReselectionState
} {
  const ts = now()

  if (!state.canConfirmVehicle || !state.latestRuleResult?.passed) {
    throw new Error('轴线载荷未通过，不能确定车组。')
  }

  const summary: FinalVehicleConfigurationSummary = {
    id: generateId(),
    routeId: state.routeId,
    tractorCount: 1,
    axleLines: state.after.axleLines,
    columns: state.after.columns,
    totalTransportMassT: state.after.totalTransportMassT,
    averageAxleLineLoadT:
      state.after.averageAxleLineLoadT ??
      state.latestRuleResult.averageAxleLineLoadT ??
      0,
    axleLoadRuleResultId: state.latestRuleResult.ruleId,
    confirmed: true,
    confirmedAt: ts,
    teachingNote:
      '车组已确认。本结果基于教学简化轴线载荷规则，不替代真实工程校核。',
  }

  return {
    summary,
    state: {
      ...state,
      status: 'confirmed',
      updatedAt: ts,
    },
  }
}

// ── Operation log ────────────────────────────────────────────────────

export function createAxleLoadOperationLog(
  input: Omit<AxleLoadOperationLog, 'id' | 'createdAt'>,
): AxleLoadOperationLog {
  return {
    ...input,
    id: generateId(),
    createdAt: now(),
  }
}

// ── Display helpers ──────────────────────────────────────────────────

export function getAxleLoadStatusDisplayText(
  status: AxleLoadRuleStatus,
): string {
  const texts: Record<AxleLoadRuleStatus, string> = {
    pass: '通过',
    pass_with_warning: '边界通过',
    fail: '超载',
    blocked: '阻塞',
  }
  return texts[status]
}

export function getReselectionStatusDisplayText(
  status: AxleLoadReselectionStatus,
): string {
  const texts: Record<AxleLoadReselectionStatus, string> = {
    not_started: '未开始',
    needs_modification: '需要修改',
    editing: '编辑中',
    pending_recalculation: '待重新计算',
    recalculated: '已重新计算',
    ready_to_confirm: '可以确认',
    confirmed: '已确认',
    blocked: '阻塞',
  }
  return texts[status]
}
