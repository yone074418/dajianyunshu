import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)
const positiveNumber = z.number().positive()
const numberRange = z
  .object({
    min: positiveNumber,
    max: positiveNumber,
  })
  .refine((r) => r.max > r.min, { message: 'max must be greater than min' })

export const VEHICLE_COMBINATION_TYPES = [
  'full_trailer',
  'semi_trailer',
  'self_propelled_axle',
] as const

export type VehicleCombinationType = (typeof VEHICLE_COMBINATION_TYPES)[number]

export const vehicleCombinationParameterSchema = z.object({
  cargoWeightRangeT: numberRange,
  cargoLengthRangeM: numberRange,
  cargoWidthRangeM: numberRange,
  cargoHeightRangeM: numberRange,
  loadCapacityDescription: nonEmptyString,
  turningDescription: nonEmptyString,
  stabilityDescription: nonEmptyString,
  operationComplexity: z.enum(['low', 'medium', 'high']),
  routeAdaptability: z.enum(['low', 'medium', 'high']),
  tractorDependency: z.enum(['low', 'medium', 'high']),
})

export const vehicleCombinationDemoConfigSchema = z.object({
  demoId: nonEmptyString,
  scenePreset: nonEmptyString,
  cameraPreset: z.object({
    position: z.tuple([z.number(), z.number(), z.number()]),
    target: z.tuple([z.number(), z.number(), z.number()]),
  }),
  modelPlaceholder: z.object({
    tractor: z.string().optional(),
    trailer: z.string().optional(),
    cargo: z.string().optional(),
    powerUnit: z.string().optional(),
  }),
  componentLayout: z
    .array(
      z.object({
        id: nonEmptyString,
        label: nonEmptyString,
        role: nonEmptyString,
        position: z.tuple([z.number(), z.number(), z.number()]),
      }),
    )
    .min(1),
  animationSteps: z
    .array(
      z.object({
        id: nonEmptyString,
        title: nonEmptyString,
        description: nonEmptyString,
        durationMs: positiveNumber,
      }),
    )
    .min(1),
  highlightParts: z.array(z.string()),
  keyTeachingPoints: z.array(nonEmptyString).min(1),
})

export const vehicleCombinationSchema = z.object({
  id: nonEmptyString,
  type: z.enum(VEHICLE_COMBINATION_TYPES),
  name: nonEmptyString,
  description: nonEmptyString,
  applicableScenarios: z.array(nonEmptyString).min(1),
  parameters: vehicleCombinationParameterSchema,
  advantages: z.array(nonEmptyString).min(3),
  disadvantages: z.array(nonEmptyString).min(3),
  demoConfig: vehicleCombinationDemoConfigSchema,
  teachingTips: z.array(nonEmptyString).min(1),
  relatedStages: z.array(nonEmptyString).min(1),
  enabled: z.boolean(),
  order: z.number().int().min(0),
  version: nonEmptyString,
})

export const vehicleCombinationsSchema = z
  .array(vehicleCombinationSchema)
  .length(3)

export type VehicleCombinationParameter = z.infer<
  typeof vehicleCombinationParameterSchema
>
export type VehicleCombinationDemoConfig = z.infer<
  typeof vehicleCombinationDemoConfigSchema
>
export type VehicleCombination = z.infer<typeof vehicleCombinationSchema>

export const VEHICLE_COMBINATIONS: VehicleCombination[] = [
  {
    id: 'full_trailer_combination',
    type: 'full_trailer',
    name: '全挂车组合',
    description:
      '牵引车通过牵引杆连接全挂车，挂车自身有前后轴组，货物完全由挂车承载。结构直观，适合教学理解牵引与挂车的力学关系。',
    applicableScenarios: [
      '中等重量货物的中短途运输',
      '教学演示牵引车与挂车的连接和分离',
      '需要挂车独立支撑的场景',
    ],
    parameters: {
      cargoWeightRangeT: { min: 10, max: 80 },
      cargoLengthRangeM: { min: 4, max: 12 },
      cargoWidthRangeM: { min: 2, max: 3.5 },
      cargoHeightRangeM: { min: 2, max: 4 },
      loadCapacityDescription: '承载能力中等，适合中型货物',
      turningDescription: '转弯半径较大，倒车操作难度高',
      stabilityDescription: '直线行驶稳定性好，转弯时挂车有甩尾风险',
      operationComplexity: 'high',
      routeAdaptability: 'medium',
      tractorDependency: 'medium',
    },
    advantages: [
      '结构直观，牵引车与挂车关系清晰，便于教学理解',
      '挂车可独立停放和装载，牵引车可更换',
      '适合演示牵引杆力学传递原理',
      '组合拆分相对清晰，维护分工明确',
    ],
    disadvantages: [
      '倒车和转弯控制难度较高，学生不易掌握',
      '路线通过性受限，急弯和窄路难以通过',
      '对驾驶员和现场指挥配合要求高',
      '挂车摆动和折叠风险较大',
    ],
    demoConfig: {
      demoId: 'demo-full-trailer-001',
      scenePreset: 'simple_yard',
      cameraPreset: {
        position: [10, 8, 10],
        target: [0, 0, 0],
      },
      modelPlaceholder: {
        tractor: 'tractor_placeholder',
        trailer: 'full_trailer_placeholder',
        cargo: 'cargo_box_placeholder',
      },
      componentLayout: [
        {
          id: 'tractor',
          label: '牵引车',
          role: 'tractor',
          position: [-4, 0, 0],
        },
        {
          id: 'drawbar',
          label: '牵引杆',
          role: 'trailer',
          position: [-2, 0, 0],
        },
        {
          id: 'trailer',
          label: '全挂车',
          role: 'trailer',
          position: [1, 0, 0],
        },
        { id: 'cargo', label: '货物', role: 'cargo', position: [1, 1, 0] },
      ],
      animationSteps: [
        {
          id: 'approach',
          title: '牵引车靠近挂车',
          description: '牵引车倒车至挂车前方',
          durationMs: 2000,
        },
        {
          id: 'connect',
          title: '连接牵引杆',
          description: '牵引车与挂车通过牵引杆连接',
          durationMs: 1500,
        },
        {
          id: 'load',
          title: '装载货物',
          description: '货物放置在挂车承载面上',
          durationMs: 2000,
        },
        {
          id: 'depart',
          title: '起步行驶',
          description: '组合车辆起步直线行驶',
          durationMs: 2500,
        },
      ],
      highlightParts: ['drawbar', 'trailer_axles', 'hitch_point'],
      keyTeachingPoints: [
        '牵引杆是传递牵引力的关键部件',
        '全挂车有独立的前后轴组',
        '倒车时挂车运动方向与牵引车相反',
      ],
    },
    teachingTips: [
      '引导学生观察牵引杆的连接方式',
      '说明全挂车与半挂车在结构上的区别',
      '提醒学生注意倒车时的方向控制',
    ],
    relatedStages: ['简单配车', '车组确定'],
    enabled: true,
    order: 0,
    version: '1.0.0',
  },
  {
    id: 'semi_trailer_combination',
    type: 'semi_trailer',
    name: '半挂车组合',
    description:
      '牵引车通过鞍座连接半挂车，挂车前端搭在牵引车上，后端由自身轴组支撑。连接稳定，是公路大件运输的常见组合方式。',
    applicableScenarios: [
      '公路大件运输的主要组合方式',
      '中长途运输场景',
      '教学演示鞍座连接和轴载分配',
    ],
    parameters: {
      cargoWeightRangeT: { min: 20, max: 120 },
      cargoLengthRangeM: { min: 6, max: 16 },
      cargoWidthRangeM: { min: 2.5, max: 4 },
      cargoHeightRangeM: { min: 2.5, max: 4.5 },
      loadCapacityDescription: '承载能力较强，适合中大型货物',
      turningDescription: '转弯半径适中，比全挂车灵活',
      stabilityDescription: '连接稳定，重心分布合理',
      operationComplexity: 'medium',
      routeAdaptability: 'medium',
      tractorDependency: 'high',
    },
    advantages: [
      '牵引车与挂车通过鞍座连接，结构稳定可靠',
      '公路运输场景常见，学生容易理解实际应用',
      '操作和组织相对标准化，便于教学',
      '转弯和倒车比全挂车容易控制',
    ],
    disadvantages: [
      '对超重超大货物适应性有限，需要更大牵引车',
      '轴载和桥梁校核压力明显，受道路承载限制',
      '受限高、转弯半径和装载重心影响较大',
      '鞍座连接拆装需要专业设备',
    ],
    demoConfig: {
      demoId: 'demo-semi-trailer-001',
      scenePreset: 'straight_road',
      cameraPreset: {
        position: [12, 8, 8],
        target: [0, 0, 0],
      },
      modelPlaceholder: {
        tractor: 'tractor_6x6_placeholder',
        trailer: 'semi_trailer_placeholder',
        cargo: 'cargo_transformer_placeholder',
      },
      componentLayout: [
        {
          id: 'tractor',
          label: '6x6牵引车',
          role: 'tractor',
          position: [-5, 0, 0],
        },
        {
          id: 'saddle',
          label: '鞍座',
          role: 'trailer',
          position: [-3, 0.8, 0],
        },
        {
          id: 'trailer',
          label: '半挂车',
          role: 'trailer',
          position: [1, 0, 0],
        },
        { id: 'cargo', label: '变压器', role: 'cargo', position: [1, 1.2, 0] },
      ],
      animationSteps: [
        {
          id: 'back',
          title: '倒车对位',
          description: '牵引车倒车至半挂车前方',
          durationMs: 2000,
        },
        {
          id: 'couple',
          title: '鞍座连接',
          description: '半挂车前端搭上鞍座并锁定',
          durationMs: 1500,
        },
        {
          id: 'legs',
          title: '收起支腿',
          description: '收起半挂车前支撑腿',
          durationMs: 1000,
        },
        {
          id: 'depart',
          title: '起步行驶',
          description: '组合车辆起步',
          durationMs: 2500,
        },
      ],
      highlightParts: ['saddle', 'kingpin', 'landing_gear', 'rear_axles'],
      keyTeachingPoints: [
        '鞍座是半挂车连接的核心部件',
        '半挂车前端搭在牵引车上，重量由牵引车承担一部分',
        '主销是连接牵引车和半挂车的关键',
      ],
    },
    teachingTips: [
      '引导学生观察鞍座和主销的连接方式',
      '说明半挂车轴载分配的特点',
      '比较半挂车与全挂车的结构差异',
    ],
    relatedStages: ['简单配车', '车组确定'],
    enabled: true,
    order: 1,
    version: '1.0.0',
  },
  {
    id: 'self_propelled_modular_transporter',
    type: 'self_propelled_axle',
    name: '自行式轴线车组合',
    description:
      '自行式模块化运输车（SPMT），由动力单元和多轴线模块组成，承载能力强，轴线组合灵活，适合重型设备短距离或复杂场地转运。',
    applicableScenarios: [
      '超大超重设备的短距离转运',
      '复杂场地内的精密定位',
      '教学演示多轴线载荷分散和液压悬架',
    ],
    parameters: {
      cargoWeightRangeT: { min: 50, max: 500 },
      cargoLengthRangeM: { min: 5, max: 20 },
      cargoWidthRangeM: { min: 3, max: 6 },
      cargoHeightRangeM: { min: 3, max: 6 },
      loadCapacityDescription: '承载能力极强，可组合多轴线分散载荷',
      turningDescription: '支持全轮转向，转弯半径小，灵活性高',
      stabilityDescription: '液压悬架自动调平，稳定性极好',
      operationComplexity: 'high',
      routeAdaptability: 'high',
      tractorDependency: 'low',
    },
    advantages: [
      '承载能力极强，可运输数百吨货物',
      '轴线组合灵活，可根据货物调整轴数',
      '液压悬架自动调平，适应不平路面',
      '支持全轮转向，场地内机动性高',
    ],
    disadvantages: [
      '设备结构复杂，操作技术要求高',
      '购置和租赁成本高昂',
      '需要专业操作团队和现场协调',
      '速度慢，不适合长距离公路运输',
    ],
    demoConfig: {
      demoId: 'demo-spmt-001',
      scenePreset: 'simple_yard',
      cameraPreset: {
        position: [15, 10, 15],
        target: [0, 0, 0],
      },
      modelPlaceholder: {
        powerUnit: 'spmt_power_unit_placeholder',
        trailer: 'spmt_axle_module_placeholder',
        cargo: 'cargo_heavy_placeholder',
      },
      componentLayout: [
        {
          id: 'power_unit',
          label: '动力单元',
          role: 'power_unit',
          position: [-6, 0, 0],
        },
        {
          id: 'axle_1',
          label: '轴线模块1',
          role: 'axle_module',
          position: [-2, 0, 0],
        },
        {
          id: 'axle_2',
          label: '轴线模块2',
          role: 'axle_module',
          position: [2, 0, 0],
        },
        {
          id: 'axle_3',
          label: '轴线模块3',
          role: 'axle_module',
          position: [6, 0, 0],
        },
        {
          id: 'cargo',
          label: '重型设备',
          role: 'cargo',
          position: [0, 1.5, 0],
        },
      ],
      animationSteps: [
        {
          id: 'assemble',
          title: '模块组装',
          description: '将多个轴线模块拼接组合',
          durationMs: 3000,
        },
        {
          id: 'position',
          title: '定位装载',
          description: 'SPMT驶入货物下方',
          durationMs: 2000,
        },
        {
          id: 'lift',
          title: '液压顶升',
          description: '液压悬架顶升货物',
          durationMs: 2000,
        },
        {
          id: 'transport',
          title: '低速转运',
          description: '低速行驶至目标位置',
          durationMs: 3000,
        },
      ],
      highlightParts: [
        'power_unit',
        'axle_modules',
        'hydraulic_suspension',
        'steering_system',
      ],
      keyTeachingPoints: [
        'SPMT通过多轴线分散载荷，降低单轴荷载',
        '液压悬架可以自动调平，适应不平路面',
        '全轮转向使大型车辆在狭小空间也能机动',
      ],
    },
    teachingTips: [
      '引导学生观察轴线模块的拼接方式',
      '说明液压悬架的调平原理',
      '比较SPMT与传统牵引车挂车组合的差异',
    ],
    relatedStages: ['简单配车', '车组确定'],
    enabled: true,
    order: 2,
    version: '1.0.0',
  },
]

export function getVehicleCombinations(): VehicleCombination[] {
  return VEHICLE_COMBINATIONS
}

export function getVehicleCombinationById(
  id: string,
): VehicleCombination | undefined {
  return VEHICLE_COMBINATIONS.find((c) => c.id === id)
}

export function validateVehicleCombinations(
  data: unknown,
): VehicleCombination[] {
  return vehicleCombinationsSchema.parse(data)
}
