import { z } from 'zod'

const idSchema = z.string().trim().min(1)
const nameSchema = z.string().trim().min(1)
const nonEmptyString = z.string().trim().min(1)

export const transportCaseLocationSchema = z.object({
  name: nameSchema,
  type: nonEmptyString,
  description: nonEmptyString,
})

export const transportCaseCargoSchema = z.object({
  id: idSchema,
  name: nameSchema,
  category: nonEmptyString,
  dimensions: z.object({
    lengthM: z.number().positive(),
    widthM: z.number().positive(),
    heightM: z.number().positive(),
  }),
  weightT: z.number().positive(),
  unit: nonEmptyString,
  isOversizeLength: z.boolean(),
  isOversizeWidth: z.boolean(),
  isOversizeHeight: z.boolean(),
  isOverweight: z.boolean(),
  centerOfGravity: z.object({
    xM: z.number(),
    yM: z.number(),
    zM: z.number(),
  }),
  description: nonEmptyString,
})

export const transportCaseConstraintsSchema = z.object({
  height: nonEmptyString,
  turning: nonEmptyString,
  slope: nonEmptyString,
  bridge: nonEmptyString,
  axleLoad: nonEmptyString,
  lashing: nonEmptyString,
})

export const transportCaseSchema = z.object({
  id: idSchema,
  name: nameSchema,
  version: nonEmptyString,
  status: z.enum(['draft', 'active', 'archived']),
  background: nonEmptyString,
  origin: transportCaseLocationSchema,
  destination: transportCaseLocationSchema,
  cargo: transportCaseCargoSchema,
  objectives: z.array(nonEmptyString).min(1),
  constraints: transportCaseConstraintsSchema,
  teachingNotes: z.array(nonEmptyString).min(1),
})

export type TransportCaseLocation = z.infer<typeof transportCaseLocationSchema>
export type TransportCaseCargo = z.infer<typeof transportCaseCargoSchema>
export type TransportCaseConstraints = z.infer<
  typeof transportCaseConstraintsSchema
>
export type TransportCase = z.infer<typeof transportCaseSchema>

export const validateTransportCase = (data: unknown): TransportCase =>
  transportCaseSchema.parse(data)

export const UNIQUE_TRANSPORT_CASE: TransportCase = {
  id: 'case_heavy_transformer_transport_v1',
  name: '大型变压器公路运输虚拟仿真实验',
  version: '1.0.0',
  status: 'active',
  background:
    '某电力工程需要将一台大型电力变压器从制造厂运输至变电站施工现场。变压器属于不可拆解的大件货物，外形尺寸和重量均超出普通公路运输标准，需要制定专门的大件运输方案。学生需要根据货物参数、路线约束和车辆条件，完成从任务分析到运输交付的全过程仿真实验。',
  origin: {
    name: '东港重型装备制造厂',
    type: '制造厂',
    description:
      '位于东港工业园区的大型变压器制造基地，拥有重型起重设备和大件货物出厂条件。',
  },
  destination: {
    name: '西郊 500kV 变电站施工现场',
    type: '变电站施工现场',
    description:
      '位于城市西郊的 500kV 变电站建设工地，需要将变压器运抵现场并完成就位安装。',
  },
  cargo: {
    id: 'cargo-large-transformer-001',
    name: '500kV 大型电力变压器',
    category: '电力变压器',
    dimensions: {
      lengthM: 8.8,
      widthM: 3.4,
      heightM: 4.2,
    },
    weightT: 168,
    unit: '米/吨',
    isOversizeLength: true,
    isOversizeWidth: true,
    isOversizeHeight: true,
    isOverweight: true,
    centerOfGravity: {
      xM: 4.4,
      yM: 2.1,
      zM: 1.7,
    },
    description:
      '500kV 大型电力变压器，不可拆解整体运输。外形尺寸和重量均属于大件运输范畴，需要专用运输车辆和绑扎加固方案。',
  },
  objectives: [
    '根据货物尺寸和重量选择合适的运输车辆',
    '分析起点到终点的可选运输路线',
    '检查路线上的高度、弯道、坡度、桥梁承载等约束',
    '确定最终车组和运输方案',
    '完成货物装车和绑扎加固',
    '执行运输仿真并验证方案可行性',
  ],
  constraints: {
    height:
      '运输路线上的限高架、桥梁净空高度必须大于货物高度加车辆高度加安全余量',
    turning: '弯道半径必须满足车辆转弯要求，特别注意直角弯和环岛路段',
    slope: '坡度不得超过车辆爬坡能力限制，下坡需考虑制动安全',
    bridge: '沿线桥梁承载能力必须大于车货总重，需逐桥核算',
    axleLoad: '各轴轴载不得超过道路承载标准，需合理分布货物重心',
    lashing: '绑扎方案必须满足大件运输固定要求，防止运输途中位移和倾覆',
  },
  teachingNotes: [
    '本案例为教学简化案例，使用虚构地名，不代表真实工程路线',
    '货物参数基于教学需要设定，实际工程应以设计图纸为准',
    '路线约束仅为教学演示，实际大件运输需依据现场勘测数据',
    '学生应重点关注大件运输方案的整体合理性，而非精确数值计算',
  ],
}
