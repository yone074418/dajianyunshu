import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)
const positiveInt = z.number().int().positive()

export const trailerAxleLineOptionSchema = z.object({
  id: nonEmptyString,
  axleLines: positiveInt,
  label: nonEmptyString,
  description: nonEmptyString,
  applicableScenarios: z.array(nonEmptyString).min(1),
  enabled: z.boolean(),
  order: z.number().int().min(0),
})

export const trailerColumnOptionSchema = z.object({
  id: nonEmptyString,
  columns: positiveInt,
  label: nonEmptyString,
  description: nonEmptyString,
  applicableScenarios: z.array(nonEmptyString).min(1),
  enabled: z.boolean(),
  order: z.number().int().min(0),
})

export const trailerAxleColumnRuleSchema = z.object({
  id: nonEmptyString,
  axleLines: positiveInt,
  columns: positiveInt,
  allowed: z.boolean(),
  reason: z.string(),
  teachingNote: z.string(),
})

export const trailerSelectionSchema = z.object({
  axleLines: positiveInt,
  columns: positiveInt,
})

export type TrailerAxleLineOption = z.infer<typeof trailerAxleLineOptionSchema>
export type TrailerColumnOption = z.infer<typeof trailerColumnOptionSchema>
export type TrailerAxleColumnRule = z.infer<typeof trailerAxleColumnRuleSchema>
export type TrailerSelection = z.infer<typeof trailerSelectionSchema>

export const AXLE_LINE_OPTIONS: TrailerAxleLineOption[] = [
  {
    id: 'axle_4',
    axleLines: 4,
    label: '4 轴线',
    description: '4轴线挂车，适合中等载荷的常规大件运输。',
    applicableScenarios: ['中等重量货物（20—60t）', '路线条件较好的运输'],
    enabled: true,
    order: 0,
  },
  {
    id: 'axle_6',
    axleLines: 6,
    label: '6 轴线',
    description: '6轴线挂车，承载能力适中，是大件运输教学中最常见的配置。',
    applicableScenarios: ['中等至较重货物（40—100t）', '常规大件运输教学演示'],
    enabled: true,
    order: 1,
  },
  {
    id: 'axle_8',
    axleLines: 8,
    label: '8 轴线',
    description: '8轴线挂车，承载能力较强，适合较重货物运输。',
    applicableScenarios: ['较重货物（80—150t）', '需要较大承载面积的运输'],
    enabled: true,
    order: 2,
  },
  {
    id: 'axle_10',
    axleLines: 10,
    label: '10 轴线',
    description: '10轴线挂车，多轴线分散载荷，适合重型设备。',
    applicableScenarios: ['重型设备（100—200t）', '需要多轴分散载荷的运输'],
    enabled: true,
    order: 3,
  },
  {
    id: 'axle_12',
    axleLines: 12,
    label: '12 轴线',
    description: '12轴线挂车，承载面积大，适合超大件运输。',
    applicableScenarios: ['超大件货物（150—300t）', '需要大面积载荷分散的运输'],
    enabled: true,
    order: 4,
  },
  {
    id: 'axle_16',
    axleLines: 16,
    label: '16 轴线',
    description: '16轴线挂车，最大承载配置，适合超重型设备短距离转运。',
    applicableScenarios: ['超重型设备（200—500t）', '短距离精密转运'],
    enabled: true,
    order: 5,
  },
]

export const COLUMN_OPTIONS: TrailerColumnOption[] = [
  {
    id: 'col_1',
    columns: 1,
    label: '1 纵列',
    description: '单纵列布局，挂车窄而长，适合窄路和弯道较多的路线。',
    applicableScenarios: ['货物宽度较大但长度适中', '路线较窄的运输'],
    enabled: true,
    order: 0,
  },
  {
    id: 'col_2',
    columns: 2,
    label: '2 纵列',
    description: '双纵列布局，挂车较宽但长度缩短，承载稳定性好。',
    applicableScenarios: ['货物宽度适中', '需要更好横向稳定性的运输'],
    enabled: true,
    order: 1,
  },
  {
    id: 'col_3',
    columns: 3,
    label: '3 纵列',
    description: '三纵列布局，挂车最宽，承载面积最大，适合超宽货物。',
    applicableScenarios: ['超宽超重货物', '短距离场地内转运'],
    enabled: true,
    order: 2,
  },
]

export const AXLE_COLUMN_RULES: TrailerAxleColumnRule[] = [
  {
    id: 'rule_4_1',
    axleLines: 4,
    columns: 1,
    allowed: true,
    reason: '',
    teachingNote: '4轴线1纵列是最基础的挂车配置，适合中等载荷的常规运输。',
  },
  {
    id: 'rule_4_2',
    axleLines: 4,
    columns: 2,
    allowed: false,
    reason:
      '4轴线不支持2纵列，教学简化配置中该组合轴数不足以支撑双纵列布局的稳定性要求。',
    teachingNote: '',
  },
  {
    id: 'rule_4_3',
    axleLines: 4,
    columns: 3,
    allowed: false,
    reason:
      '4轴线不支持3纵列，教学简化配置中该组合轴数严重不足，无法保证三纵列的承载稳定性。',
    teachingNote: '',
  },
  {
    id: 'rule_6_1',
    axleLines: 6,
    columns: 1,
    allowed: true,
    reason: '',
    teachingNote: '6轴线1纵列是常见的中型挂车配置，适合中等至较重货物。',
  },
  {
    id: 'rule_6_2',
    axleLines: 6,
    columns: 2,
    allowed: true,
    reason: '',
    teachingNote: '6轴线2纵列提供更好的横向稳定性，适合较宽货物。',
  },
  {
    id: 'rule_6_3',
    axleLines: 6,
    columns: 3,
    allowed: false,
    reason:
      '6轴线不支持3纵列，教学简化配置中该组合横向跨度过大，轴线分布不足以保证安全。',
    teachingNote: '',
  },
  {
    id: 'rule_8_1',
    axleLines: 8,
    columns: 1,
    allowed: true,
    reason: '',
    teachingNote: '8轴线1纵列提供较大承载面积，适合较重的长条形货物。',
  },
  {
    id: 'rule_8_2',
    axleLines: 8,
    columns: 2,
    allowed: true,
    reason: '',
    teachingNote: '8轴线2纵列是重型运输的常用配置，承载和稳定性均衡。',
  },
  {
    id: 'rule_8_3',
    axleLines: 8,
    columns: 3,
    allowed: false,
    reason:
      '8轴线不支持3纵列，教学简化配置中该组合宽度过大，转弯和路线通过性受限。',
    teachingNote: '',
  },
  {
    id: 'rule_10_1',
    axleLines: 10,
    columns: 1,
    allowed: false,
    reason:
      '10轴线不支持1纵列，教学简化配置中该组合过长，转弯半径和路线通过性不满足要求。',
    teachingNote: '',
  },
  {
    id: 'rule_10_2',
    axleLines: 10,
    columns: 2,
    allowed: true,
    reason: '',
    teachingNote: '10轴线2纵列适合重型设备，多轴线分散载荷降低单轴压力。',
  },
  {
    id: 'rule_10_3',
    axleLines: 10,
    columns: 3,
    allowed: false,
    reason:
      '10轴线不支持3纵列，教学简化配置中该组合总宽度过大，不满足常规公路运输限制。',
    teachingNote: '',
  },
  {
    id: 'rule_12_1',
    axleLines: 12,
    columns: 1,
    allowed: false,
    reason:
      '12轴线不支持1纵列，教学简化配置中该组合极度过长，无法在常规路线转弯。',
    teachingNote: '',
  },
  {
    id: 'rule_12_2',
    axleLines: 12,
    columns: 2,
    allowed: true,
    reason: '',
    teachingNote: '12轴线2纵列适合超大件运输，提供极大的承载面积。',
  },
  {
    id: 'rule_12_3',
    axleLines: 12,
    columns: 3,
    allowed: true,
    reason: '',
    teachingNote: '12轴线3纵列是最大标准配置之一，适合超宽超重货物。',
  },
  {
    id: 'rule_16_1',
    axleLines: 16,
    columns: 1,
    allowed: false,
    reason: '16轴线不支持1纵列，教学简化配置中该组合长度超出所有常规路线限制。',
    teachingNote: '',
  },
  {
    id: 'rule_16_2',
    axleLines: 16,
    columns: 2,
    allowed: true,
    reason: '',
    teachingNote: '16轴线2纵列适合超重型设备，多轴线大面积分散载荷。',
  },
  {
    id: 'rule_16_3',
    axleLines: 16,
    columns: 3,
    allowed: true,
    reason: '',
    teachingNote: '16轴线3纵列是最大承载配置，适合超重型设备短距离转运。',
  },
]

export function getAxleLineOptions(): TrailerAxleLineOption[] {
  return AXLE_LINE_OPTIONS
}

export function getColumnOptions(): TrailerColumnOption[] {
  return COLUMN_OPTIONS
}

export function getAxleColumnRules(): TrailerAxleColumnRule[] {
  return AXLE_COLUMN_RULES
}

export function getAllowedColumnCounts(axleLines: number): number[] {
  return AXLE_COLUMN_RULES.filter(
    (r) => r.axleLines === axleLines && r.allowed,
  ).map((r) => r.columns)
}

export function getAllowedAxleLineCounts(columns: number): number[] {
  return AXLE_COLUMN_RULES.filter(
    (r) => r.columns === columns && r.allowed,
  ).map((r) => r.axleLines)
}

export function isCombinationAllowed(
  axleLines: number,
  columns: number,
): boolean {
  const rule = AXLE_COLUMN_RULES.find(
    (r) => r.axleLines === axleLines && r.columns === columns,
  )
  return rule?.allowed ?? false
}

export function getCombinationRule(
  axleLines: number,
  columns: number,
): TrailerAxleColumnRule | undefined {
  return AXLE_COLUMN_RULES.find(
    (r) => r.axleLines === axleLines && r.columns === columns,
  )
}

export interface TrailerSelectionResult {
  success: boolean
  selection?: TrailerSelection
  error?: string
}

export function validateTrailerSelection(
  input: unknown,
): TrailerSelectionResult {
  const parsed = trailerSelectionSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: '轴线数和纵列数必须为正整数。',
    }
  }

  const { axleLines, columns } = parsed.data

  const axleExists = AXLE_LINE_OPTIONS.some(
    (o) => o.axleLines === axleLines && o.enabled,
  )
  if (!axleExists) {
    return {
      success: false,
      error: `轴线数 ${axleLines} 不在可选范围内。`,
    }
  }

  const colExists = COLUMN_OPTIONS.some(
    (o) => o.columns === columns && o.enabled,
  )
  if (!colExists) {
    return {
      success: false,
      error: `纵列数 ${columns} 不在可选范围内。`,
    }
  }

  const rule = getCombinationRule(axleLines, columns)
  if (!rule) {
    return {
      success: false,
      error: `${axleLines}轴线与${columns}纵列的组合规则未定义。`,
    }
  }

  if (!rule.allowed) {
    return {
      success: false,
      error: rule.reason,
    }
  }

  return {
    success: true,
    selection: { axleLines, columns },
  }
}
