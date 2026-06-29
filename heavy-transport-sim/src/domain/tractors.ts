import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)
const positiveNumber = z.number().positive()

export const TRACTOR_DRIVE_TYPES = ['6x6', '8x8'] as const
export type TractorDriveType = (typeof TRACTOR_DRIVE_TYPES)[number]

export const tractorDimensionSchema = z.object({
  lengthM: positiveNumber,
  widthM: positiveNumber,
  heightM: positiveNumber,
  wheelbaseM: positiveNumber,
  trackWidthM: positiveNumber,
  minTurningRadiusM: positiveNumber,
})

export const tractorWeightSchema = z.object({
  curbWeightT: positiveNumber,
  grossWeightT: positiveNumber,
  maxTractionMassT: positiveNumber,
  fifthWheelLoadT: positiveNumber,
  axleLoadDescription: nonEmptyString,
})

export const tractorPowerSchema = z.object({
  enginePowerKw: positiveNumber,
  maxTorqueNm: positiveNumber,
  driveType: z.enum(TRACTOR_DRIVE_TYPES),
  lowSpeedTractionDescription: nonEmptyString,
  gradeabilityDescription: nonEmptyString,
  brakingAssistDescription: nonEmptyString,
})

export const tractorSchema = z.object({
  id: nonEmptyString,
  name: nonEmptyString,
  driveType: z.enum(TRACTOR_DRIVE_TYPES),
  description: nonEmptyString,
  dimensions: tractorDimensionSchema,
  weights: tractorWeightSchema,
  power: tractorPowerSchema,
  tractionDescription: nonEmptyString,
  applicableScenarios: z.array(nonEmptyString).min(1),
  advantages: z.array(nonEmptyString).min(2),
  disadvantages: z.array(nonEmptyString).min(2),
  teachingTips: z.array(nonEmptyString).min(1),
  compatibleCombinationTypes: z.array(nonEmptyString).min(1),
  relatedStages: z.array(nonEmptyString).min(1),
  enabled: z.boolean(),
  order: z.number().int().min(0),
  version: nonEmptyString,
})

export const tractorsSchema = z.array(tractorSchema).length(2)

export type TractorDimension = z.infer<typeof tractorDimensionSchema>
export type TractorWeight = z.infer<typeof tractorWeightSchema>
export type TractorPower = z.infer<typeof tractorPowerSchema>
export type Tractor = z.infer<typeof tractorSchema>

export const TRACTORS: Tractor[] = [
  {
    id: 'tractor_6x6_heavy_duty',
    name: '6x6 重型牵引车',
    driveType: '6x6',
    description:
      '三轴六轮驱动重型牵引车，适用于中等至重型大件货物的公路运输。结构成熟、维护方便，是大件运输教学中最常见的牵引车型。',
    dimensions: {
      lengthM: 7.2,
      widthM: 2.5,
      heightM: 3.2,
      wheelbaseM: 3.8,
      trackWidthM: 2.0,
      minTurningRadiusM: 10.5,
    },
    weights: {
      curbWeightT: 10.5,
      grossWeightT: 25.0,
      maxTractionMassT: 80.0,
      fifthWheelLoadT: 15.0,
      axleLoadDescription: '前轴 7t / 后双轴 18t（教学简化值）',
    },
    power: {
      enginePowerKw: 330,
      maxTorqueNm: 1800,
      driveType: '6x6',
      lowSpeedTractionDescription: '低速牵引力充足，适合中等载荷起步和爬坡',
      gradeabilityDescription: '满载爬坡能力约 12%—15%',
      brakingAssistDescription: '标配发动机制动和 ABS，可选液力缓速器',
    },
    tractionDescription:
      '有效牵引力约 180kN，可牵引总质量 80t 以下的半挂或全挂组合。',
    applicableScenarios: [
      '中等重量货物（20—80t）的中长途公路运输',
      '半挂车组合的主要牵引车型',
      '路线条件较好的常规大件运输',
    ],
    advantages: [
      '结构成熟，配件供应和维修网络完善',
      '油耗和运营成本相对较低',
      '操作培训周期短，学生容易理解',
    ],
    disadvantages: [
      '超重超大货物牵引能力有限',
      '复杂路况通过性不如 8x8',
      '极端工况下附着力不足',
    ],
    teachingTips: [
      '引导学生对比 6x6 与 8x8 的驱动形式差异',
      '说明轴距和转弯半径对路线选择的影响',
      '提醒学生关注鞍座载荷与货物重量的匹配',
    ],
    compatibleCombinationTypes: ['full_trailer', 'semi_trailer'],
    relatedStages: ['简单配车', '车组确定'],
    enabled: true,
    order: 0,
    version: '1.0.0',
  },
  {
    id: 'tractor_8x8_heavy_duty',
    name: '8x8 重型牵引车',
    driveType: '8x8',
    description:
      '四轴八轮全驱重型牵引车，专为超重超大件运输设计。动力强劲、附着力大，适合高载荷和复杂路况的大件运输任务。',
    dimensions: {
      lengthM: 8.5,
      widthM: 2.55,
      heightM: 3.4,
      wheelbaseM: 4.5,
      trackWidthM: 2.1,
      minTurningRadiusM: 12.5,
    },
    weights: {
      curbWeightT: 14.0,
      grossWeightT: 32.0,
      maxTractionMassT: 150.0,
      fifthWheelLoadT: 22.0,
      axleLoadDescription: '前双轴 12t / 后双轴 20t（教学简化值）',
    },
    power: {
      enginePowerKw: 480,
      maxTorqueNm: 2600,
      driveType: '8x8',
      lowSpeedTractionDescription: '低速牵引力极强，适合重载起步和低速精密操控',
      gradeabilityDescription: '满载爬坡能力约 15%—20%',
      brakingAssistDescription:
        '标配发动机制动、ABS 和液力缓速器，可选排气制动',
    },
    tractionDescription:
      '有效牵引力约 280kN，可牵引总质量 150t 以下的重型组合。',
    applicableScenarios: [
      '超重超大货物（80—150t）的大件运输',
      '自行式轴线车组合的辅助牵引',
      '路线条件复杂、坡度较大的运输任务',
    ],
    advantages: [
      '全轮驱动附着力大，重载和爬坡能力强',
      '可匹配更大载荷的挂车组合',
      '复杂路况通过性好',
    ],
    disadvantages: [
      '购置和运营成本高',
      '油耗较大，经济性不如 6x6',
      '转弯半径大，窄路和急弯通过受限',
    ],
    teachingTips: [
      '引导学生比较 8x8 与 6x6 的牵引能力和成本差异',
      '说明全轮驱动在湿滑或坡道路面的优势',
      '提醒学生注意 8x8 的转弯半径对路线选择的约束',
    ],
    compatibleCombinationTypes: ['semi_trailer', 'self_propelled_axle'],
    relatedStages: ['简单配车', '车组确定'],
    enabled: true,
    order: 1,
    version: '1.0.0',
  },
]

export function getTractors(): Tractor[] {
  return TRACTORS
}

export function getTractorById(id: string): Tractor | undefined {
  return TRACTORS.find((t) => t.id === id)
}

export function getTractorByDriveType(
  driveType: TractorDriveType,
): Tractor | undefined {
  return TRACTORS.find((t) => t.driveType === driveType)
}

export function validateTractors(data: unknown): Tractor[] {
  return tractorsSchema.parse(data)
}
