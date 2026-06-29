import { z } from 'zod'
import {
  getVehicleCombinationById,
  VEHICLE_COMBINATIONS,
} from './vehicleCombinations'
import { getTractorById, TRACTORS } from './tractors'
import {
  isCombinationAllowed,
  getCombinationRule,
  AXLE_COLUMN_RULES,
} from './trailerSelection'

const nonEmptyString = z.string().trim().min(1)
const positiveNumber = z.number().positive()
const positiveInt = z.number().int().positive()

export const simpleConfigurationInputSchema = z.object({
  caseId: nonEmptyString,
  cargo: z.object({
    lengthM: positiveNumber,
    widthM: positiveNumber,
    heightM: positiveNumber,
    weightT: positiveNumber,
  }),
  vehicleCombinationId: nonEmptyString,
  vehicleCombinationType: nonEmptyString,
  tractorId: nonEmptyString,
  trailerSelection: z.object({
    axleLines: positiveInt,
    columns: positiveInt,
  }),
})

export type SimpleConfigurationInput = z.infer<
  typeof simpleConfigurationInputSchema
>

export type ConfigurationRuleStatus = 'passed' | 'failed' | 'blocked'

export type ConfigurationRuleCheckResult = {
  ruleId: string
  title: string
  status: ConfigurationRuleStatus
  reason: string
  teachingNote: string
  severity: 'info' | 'warning' | 'error'
}

export type SimpleConfigurationEvaluationResult = {
  status: ConfigurationRuleStatus
  passed: boolean
  summary: string
  reasons: string[]
  checks: ConfigurationRuleCheckResult[]
  nextAction: string
}

type RuleDefinition = {
  id: string
  title: string
  severity: 'info' | 'warning' | 'error'
  teachingNote: string
  evaluate: (input: SimpleConfigurationInput) => ConfigurationRuleCheckResult
}

const WEIGHT_LIMITS: Record<string, Record<string, number>> = {
  '4': { '1': 60 },
  '6': { '1': 100, '2': 120 },
  '8': { '1': 150, '2': 180 },
  '10': { '2': 200 },
  '12': { '2': 300, '3': 400 },
  '16': { '2': 400, '3': 500 },
}

const DIMENSION_LIMITS: Record<string, Record<string, number>> = {
  '4': { '1': 3.2 },
  '6': { '1': 3.5, '2': 4.0 },
  '8': { '1': 4.0, '2': 4.5 },
  '10': { '2': 5.0 },
  '12': { '2': 5.5, '3': 6.0 },
  '16': { '2': 5.5, '3': 6.0 },
}

const TRACTOR_TRACTION_LIMITS: Record<string, number> = {
  tractor_6x6_heavy_duty: 80,
  tractor_8x8_heavy_duty: 150,
}

function getTeachingWeightLimit(
  axleLines: number,
  columns: number,
): number | null {
  return WEIGHT_LIMITS[String(axleLines)]?.[String(columns)] ?? null
}

function getTeachingWidthLimit(
  axleLines: number,
  columns: number,
): number | null {
  return DIMENSION_LIMITS[String(axleLines)]?.[String(columns)] ?? null
}

const cargoWeightRule: RuleDefinition = {
  id: 'CFG-WEIGHT',
  title: '货物重量适配',
  severity: 'error',
  teachingNote:
    '货物重量应落在挂车轴线/纵列组合的教学承载范围内。超重时应增加轴线数或调整组合方式。',
  evaluate: (input) => {
    const { axleLines, columns } = input.trailerSelection
    const weight = input.cargo.weightT
    const limit = getTeachingWeightLimit(axleLines, columns)

    if (limit === null) {
      return {
        ruleId: cargoWeightRule.id,
        title: cargoWeightRule.title,
        status: 'failed',
        reason: `${axleLines}轴线${columns}纵列组合的教学承载范围未定义。`,
        teachingNote: cargoWeightRule.teachingNote,
        severity: cargoWeightRule.severity,
      }
    }

    if (weight > limit) {
      return {
        ruleId: cargoWeightRule.id,
        title: cargoWeightRule.title,
        status: 'failed',
        reason: `货物重量 ${weight}t 超出当前挂车 ${axleLines}轴线${columns}纵列组合的教学承载上限 ${limit}t，建议增加轴线数或调整组合方式。`,
        teachingNote: cargoWeightRule.teachingNote,
        severity: cargoWeightRule.severity,
      }
    }

    return {
      ruleId: cargoWeightRule.id,
      title: cargoWeightRule.title,
      status: 'passed',
      reason: `货物重量 ${weight}t 在 ${axleLines}轴线${columns}纵列组合的教学承载范围（≤${limit}t）内。`,
      teachingNote: cargoWeightRule.teachingNote,
      severity: cargoWeightRule.severity,
    }
  },
}

const cargoDimensionRule: RuleDefinition = {
  id: 'CFG-DIMENSION',
  title: '货物尺寸适配',
  severity: 'warning',
  teachingNote:
    '货物长宽高应落在组合方式的推荐尺寸范围内。任一维度明显超出推荐范围时，需调整组合方式或选择更大挂车。',
  evaluate: (input) => {
    const combination = getVehicleCombinationById(input.vehicleCombinationId)
    const { lengthM, widthM, heightM } = input.cargo
    const { axleLines, columns } = input.trailerSelection
    const issues: string[] = []

    if (combination) {
      const p = combination.parameters
      if (lengthM > p.cargoLengthRangeM.max) {
        issues.push(
          `长度 ${lengthM}m 超出组合推荐范围上限 ${p.cargoLengthRangeM.max}m`,
        )
      }
      if (widthM > p.cargoWidthRangeM.max) {
        issues.push(
          `宽度 ${widthM}m 超出组合推荐范围上限 ${p.cargoWidthRangeM.max}m`,
        )
      }
      if (heightM > p.cargoHeightRangeM.max) {
        issues.push(
          `高度 ${heightM}m 超出组合推荐范围上限 ${p.cargoHeightRangeM.max}m`,
        )
      }
    }

    const trailerWidthLimit = getTeachingWidthLimit(axleLines, columns)
    if (trailerWidthLimit !== null && widthM > trailerWidthLimit) {
      issues.push(
        `宽度 ${widthM}m 超出 ${axleLines}轴线${columns}纵列挂车教学宽度限制 ${trailerWidthLimit}m`,
      )
    }

    if (issues.length > 0) {
      return {
        ruleId: cargoDimensionRule.id,
        title: cargoDimensionRule.title,
        status: 'failed',
        reason: `货物尺寸超出推荐范围：${issues.join('；')}。`,
        teachingNote: cargoDimensionRule.teachingNote,
        severity: cargoDimensionRule.severity,
      }
    }

    return {
      ruleId: cargoDimensionRule.id,
      title: cargoDimensionRule.title,
      status: 'passed',
      reason: `货物尺寸 ${lengthM}×${widthM}×${heightM}m 在当前组合和挂车的推荐范围内。`,
      teachingNote: cargoDimensionRule.teachingNote,
      severity: cargoDimensionRule.severity,
    }
  },
}

const tractorPowerRule: RuleDefinition = {
  id: 'CFG-TRACTOR-POWER',
  title: '牵引车动力适配',
  severity: 'error',
  teachingNote:
    '牵引车的有效牵引质量和动力应满足当前货物重量的教学简化要求。过重时 6x6 牵引车可能不通过，需改用 8x8。',
  evaluate: (input) => {
    const tractor = getTractorById(input.tractorId)
    const weight = input.cargo.weightT

    if (!tractor) {
      return {
        ruleId: tractorPowerRule.id,
        title: tractorPowerRule.title,
        status: 'failed',
        reason: `未找到牵引车 "${input.tractorId}"。`,
        teachingNote: tractorPowerRule.teachingNote,
        severity: tractorPowerRule.severity,
      }
    }

    const tractionLimit = TRACTOR_TRACTION_LIMITS[input.tractorId] ?? null
    if (tractionLimit === null) {
      return {
        ruleId: tractorPowerRule.id,
        title: tractorPowerRule.title,
        status: 'failed',
        reason: `牵引车 "${tractor.name}" 的教学牵引能力参数未定义。`,
        teachingNote: tractorPowerRule.teachingNote,
        severity: tractorPowerRule.severity,
      }
    }

    if (weight > tractionLimit) {
      return {
        ruleId: tractorPowerRule.id,
        title: tractorPowerRule.title,
        status: 'failed',
        reason: `货物重量 ${weight}t 超出 ${tractor.name} 的教学牵引能力上限 ${tractionLimit}t，建议改用更大动力的牵引车。`,
        teachingNote: tractorPowerRule.teachingNote,
        severity: tractorPowerRule.severity,
      }
    }

    return {
      ruleId: tractorPowerRule.id,
      title: tractorPowerRule.title,
      status: 'passed',
      reason: `货物重量 ${weight}t 在 ${tractor.name} 的教学牵引能力范围（≤${tractionLimit}t）内。`,
      teachingNote: tractorPowerRule.teachingNote,
      severity: tractorPowerRule.severity,
    }
  },
}

const trailerAxleColumnRule: RuleDefinition = {
  id: 'CFG-AXLE-COLUMN',
  title: '挂车轴线纵列合法性',
  severity: 'error',
  teachingNote:
    '挂车轴线数与纵列数的组合必须符合教学简化配置规则。非法组合无法保证承载稳定性和路线通过性。',
  evaluate: (input) => {
    const { axleLines, columns } = input.trailerSelection
    const allowed = isCombinationAllowed(axleLines, columns)
    const rule = getCombinationRule(axleLines, columns)

    if (!allowed) {
      const reason =
        rule?.reason ?? `${axleLines}轴线${columns}纵列为非法组合。`
      return {
        ruleId: trailerAxleColumnRule.id,
        title: trailerAxleColumnRule.title,
        status: 'failed',
        reason,
        teachingNote: rule?.teachingNote || trailerAxleColumnRule.teachingNote,
        severity: trailerAxleColumnRule.severity,
      }
    }

    return {
      ruleId: trailerAxleColumnRule.id,
      title: trailerAxleColumnRule.title,
      status: 'passed',
      reason: `${axleLines}轴线${columns}纵列为合法挂车组合。`,
      teachingNote: rule?.teachingNote || trailerAxleColumnRule.teachingNote,
      severity: trailerAxleColumnRule.severity,
    }
  },
}

const completenessRule: RuleDefinition = {
  id: 'CFG-COMPLETENESS',
  title: '基础完整性',
  severity: 'error',
  teachingNote:
    '配车方案检查前必须填写完整的基本参数，包括货物信息、组合方式、牵引车和挂车选择。',
  evaluate: (input) => {
    const missing: string[] = []

    if (!input.caseId || input.caseId.trim() === '') {
      missing.push('案例编号')
    }
    if (
      !input.vehicleCombinationId ||
      input.vehicleCombinationId.trim() === ''
    ) {
      missing.push('组合方式')
    }
    if (
      !input.vehicleCombinationType ||
      input.vehicleCombinationType.trim() === ''
    ) {
      missing.push('组合类型')
    }
    if (!input.tractorId || input.tractorId.trim() === '') {
      missing.push('牵引车')
    }
    if (!input.cargo || input.cargo.weightT <= 0) {
      missing.push('货物重量')
    }
    if (!input.cargo || input.cargo.lengthM <= 0) {
      missing.push('货物长度')
    }
    if (!input.cargo || input.cargo.widthM <= 0) {
      missing.push('货物宽度')
    }
    if (!input.cargo || input.cargo.heightM <= 0) {
      missing.push('货物高度')
    }
    if (!input.trailerSelection || input.trailerSelection.axleLines <= 0) {
      missing.push('挂车轴线数')
    }
    if (!input.trailerSelection || input.trailerSelection.columns <= 0) {
      missing.push('挂车纵列数')
    }

    if (missing.length > 0) {
      return {
        ruleId: completenessRule.id,
        title: completenessRule.title,
        status: 'blocked',
        reason: `缺少必要参数：${missing.join('、')}，请返回补全后再检查。`,
        teachingNote: completenessRule.teachingNote,
        severity: completenessRule.severity,
      }
    }

    const combo = getVehicleCombinationById(input.vehicleCombinationId)
    if (!combo) {
      return {
        ruleId: completenessRule.id,
        title: completenessRule.title,
        status: 'failed',
        reason: `组合方式 "${input.vehicleCombinationId}" 不存在于已知数据中。`,
        teachingNote: completenessRule.teachingNote,
        severity: completenessRule.severity,
      }
    }

    const tractor = getTractorById(input.tractorId)
    if (!tractor) {
      return {
        ruleId: completenessRule.id,
        title: completenessRule.title,
        status: 'failed',
        reason: `牵引车 "${input.tractorId}" 不存在于已知数据中。`,
        teachingNote: completenessRule.teachingNote,
        severity: completenessRule.severity,
      }
    }

    return {
      ruleId: completenessRule.id,
      title: completenessRule.title,
      status: 'passed',
      reason: '所有必要参数已填写完整，数据引用有效。',
      teachingNote: completenessRule.teachingNote,
      severity: completenessRule.severity,
    }
  },
}

const ALL_RULES: RuleDefinition[] = [
  completenessRule,
  cargoWeightRule,
  cargoDimensionRule,
  tractorPowerRule,
  trailerAxleColumnRule,
]

export function evaluateSimpleConfiguration(
  input: unknown,
): SimpleConfigurationEvaluationResult {
  const parseResult = simpleConfigurationInputSchema.safeParse(input)
  if (!parseResult.success) {
    const issues = parseResult.error.issues
      .map((i) => i.path.join('.') + ': ' + i.message)
      .join('; ')
    return {
      status: 'blocked',
      passed: false,
      summary: '输入数据格式不合法，无法进行配车检查。',
      reasons: [`输入校验失败：${issues}`],
      checks: [],
      nextAction: '请检查输入数据格式并补全必要参数。',
    }
  }

  const validInput = parseResult.data
  const checks: ConfigurationRuleCheckResult[] = ALL_RULES.map((rule) =>
    rule.evaluate(validInput),
  )

  const hasBlocked = checks.some((c) => c.status === 'blocked')
  const hasFailed = checks.some((c) => c.status === 'failed')

  let status: ConfigurationRuleStatus
  let summary: string
  let nextAction: string
  const reasons: string[] = []

  if (hasBlocked) {
    status = 'blocked'
    const blockedChecks = checks.filter((c) => c.status === 'blocked')
    reasons.push(...blockedChecks.map((c) => c.reason))
    summary = '配车方案缺少必要参数，无法完成检查。'
    nextAction = '请返回补全缺失的参数后再进行检查。'
  } else if (hasFailed) {
    status = 'failed'
    const failedChecks = checks.filter((c) => c.status === 'failed')
    reasons.push(...failedChecks.map((c) => c.reason))
    summary = '配车方案未通过检查，请根据以下失败项修改。'
    const suggestions: string[] = []
    for (const fc of failedChecks) {
      if (fc.ruleId === 'CFG-WEIGHT') {
        suggestions.push('增加轴线数或改用承载能力更强的组合方式')
      } else if (fc.ruleId === 'CFG-DIMENSION') {
        suggestions.push('调整组合方式或选择尺寸更大的挂车')
      } else if (fc.ruleId === 'CFG-TRACTOR-POWER') {
        suggestions.push('改用 8x8 重型牵引车')
      } else if (fc.ruleId === 'CFG-AXLE-COLUMN') {
        suggestions.push('选择合法的轴线数/纵列数组合')
      }
    }
    nextAction =
      suggestions.length > 0
        ? `建议：${[...new Set(suggestions)].join('；')}。`
        : '请根据失败项调整配车方案。'
  } else {
    status = 'passed'
    summary = '配车方案通过教学简化规则检查，可以进入下一阶段。'
    reasons.push('所有配车规则检查均通过。')
    nextAction = '配车方案合格，可以继续后续路线勘测步骤。'
  }

  return {
    status,
    passed: status === 'passed',
    summary,
    reasons,
    checks,
    nextAction,
  }
}

export function getConfigurationRules(): RuleDefinition[] {
  return [...ALL_RULES]
}

export function getVehicleCombinations() {
  return VEHICLE_COMBINATIONS
}

export function getTractors() {
  return TRACTORS
}

export function getAxleColumnRules() {
  return AXLE_COLUMN_RULES
}
