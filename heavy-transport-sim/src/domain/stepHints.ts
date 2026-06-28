import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)

export const STEP_IDS = [
  'stage_1_task_intro',
  'stage_2_simple_vehicle_selection',
  'stage_3_route_survey',
  'stage_4_vehicle_group_confirmation',
  'stage_5_loading_and_lashing',
  'stage_6_transport',
] as const

export type StepId = (typeof STEP_IDS)[number]

export const STEP_NAMES: Record<StepId, string> = {
  stage_1_task_intro: '运输任务及货物介绍',
  stage_2_simple_vehicle_selection: '简单配车',
  stage_3_route_survey: '路线勘测',
  stage_4_vehicle_group_confirmation: '车组确定',
  stage_5_loading_and_lashing: '货物装车与绑扎加固',
  stage_6_transport: '货物运输',
}

export const HINT_LEVELS = ['basic', 'detail', 'warning'] as const
export type StepHintLevel = (typeof HINT_LEVELS)[number]

export const stepHintSchema = z.object({
  id: nonEmptyString,
  stepId: z.enum(STEP_IDS),
  stepName: nonEmptyString,
  title: nonEmptyString,
  content: nonEmptyString,
  level: z.enum(HINT_LEVELS),
  relatedKnowledgeCategory: z
    .enum(['vehicle', 'route', 'loading', 'lashing', 'safety'])
    .optional(),
  displayOrder: z.number().int().min(0),
  enabled: z.boolean(),
  version: nonEmptyString,
})

export type StepHint = z.infer<typeof stepHintSchema>

export const stepHintsArraySchema = z.array(stepHintSchema).min(1)

export const STEP_HINTS: StepHint[] = [
  {
    id: 'hint-task-intro-1',
    stepId: 'stage_1_task_intro',
    stepName: STEP_NAMES.stage_1_task_intro,
    title: '了解货物参数',
    content:
      '请仔细阅读货物的尺寸（长、宽、高）和重量参数。这些参数将直接影响后续配车方案、路线选择和绑扎加固方式。',
    level: 'basic',
    relatedKnowledgeCategory: 'vehicle',
    displayOrder: 0,
    enabled: true,
    version: '1.0.0',
  },
  {
    id: 'hint-task-intro-2',
    stepId: 'stage_1_task_intro',
    stepName: STEP_NAMES.stage_1_task_intro,
    title: '关注起终点信息',
    content:
      '起点和终点的位置决定了运输路线的基本方向。请记住起终点名称和类型，后续路线勘测需要用到。',
    level: 'basic',
    displayOrder: 1,
    enabled: true,
    version: '1.0.0',
  },
  {
    id: 'hint-task-intro-3',
    stepId: 'stage_1_task_intro',
    stepName: STEP_NAMES.stage_1_task_intro,
    title: '学习相关知识',
    content:
      '建议在开始实验前，先学习"车辆知识"和"路线知识"相关内容，了解牵引车、挂车和路线勘测的基本概念。',
    level: 'detail',
    relatedKnowledgeCategory: 'vehicle',
    displayOrder: 2,
    enabled: true,
    version: '1.0.0',
  },
  {
    id: 'hint-vehicle-selection-1',
    stepId: 'stage_2_simple_vehicle_selection',
    stepName: STEP_NAMES.stage_2_simple_vehicle_selection,
    title: '选择合适牵引车',
    content:
      '根据货物重量选择牵引车。牵引车的最大牵引力必须大于货物重量与各种阻力之和。',
    level: 'basic',
    relatedKnowledgeCategory: 'vehicle',
    displayOrder: 0,
    enabled: true,
    version: '1.0.0',
  },
  {
    id: 'hint-vehicle-selection-2',
    stepId: 'stage_2_simple_vehicle_selection',
    stepName: STEP_NAMES.stage_2_simple_vehicle_selection,
    title: '注意轴载限制',
    content:
      '选车时要注意车辆的轴数和轴载限制。多轴线车辆可以分散载荷，降低单轴荷载。',
    level: 'detail',
    relatedKnowledgeCategory: 'vehicle',
    displayOrder: 1,
    enabled: true,
    version: '1.0.0',
  },
  {
    id: 'hint-route-survey-1',
    stepId: 'stage_3_route_survey',
    stepName: STEP_NAMES.stage_3_route_survey,
    title: '检查限高障碍',
    content:
      '路线上所有限高架和桥梁的净空高度必须大于货物高度加车辆高度加安全余量。请逐一核实。',
    level: 'basic',
    relatedKnowledgeCategory: 'route',
    displayOrder: 0,
    enabled: true,
    version: '1.0.0',
  },
  {
    id: 'hint-route-survey-2',
    stepId: 'stage_3_route_survey',
    stepName: STEP_NAMES.stage_3_route_survey,
    title: '注意弯道半径',
    content:
      '急弯路段的转弯半径必须满足大型车辆转弯要求。特别注意直角弯和环岛路段。',
    level: 'basic',
    relatedKnowledgeCategory: 'route',
    displayOrder: 1,
    enabled: true,
    version: '1.0.0',
  },
  {
    id: 'hint-route-survey-3',
    stepId: 'stage_3_route_survey',
    stepName: STEP_NAMES.stage_3_route_survey,
    title: '准备备选路线',
    content:
      '建议准备2-3条备选路线进行比较。如果主路线存在不可通过的障碍，可以使用备选路线。',
    level: 'detail',
    relatedKnowledgeCategory: 'route',
    displayOrder: 2,
    enabled: true,
    version: '1.0.0',
  },
  {
    id: 'hint-vehicle-group-1',
    stepId: 'stage_4_vehicle_group_confirmation',
    stepName: STEP_NAMES.stage_4_vehicle_group_confirmation,
    title: '确认车组配置',
    content:
      '最终车组应满足货物重量、尺寸和路线约束的综合要求。确认牵引车和挂车/轴线车的组合方式。',
    level: 'basic',
    relatedKnowledgeCategory: 'vehicle',
    displayOrder: 0,
    enabled: true,
    version: '1.0.0',
  },
  {
    id: 'hint-loading-lashing-1',
    stepId: 'stage_5_loading_and_lashing',
    stepName: STEP_NAMES.stage_5_loading_and_lashing,
    title: '货物居中放置',
    content:
      '装车时应尽量使货物重心与车组中心对齐。重心偏移会导致车辆行驶时不稳定。',
    level: 'basic',
    relatedKnowledgeCategory: 'loading',
    displayOrder: 0,
    enabled: true,
    version: '1.0.0',
  },
  {
    id: 'hint-loading-lashing-2',
    stepId: 'stage_5_loading_and_lashing',
    stepName: STEP_NAMES.stage_5_loading_and_lashing,
    title: '绑扎对称性',
    content:
      '绑扎应左右对称设置，确保力的均匀分布。绑扎角度不宜过大，通常建议与水平面夹角不超过45度。',
    level: 'basic',
    relatedKnowledgeCategory: 'lashing',
    displayOrder: 1,
    enabled: true,
    version: '1.0.0',
  },
  {
    id: 'hint-loading-lashing-3',
    stepId: 'stage_5_loading_and_lashing',
    stepName: STEP_NAMES.stage_5_loading_and_lashing,
    title: '安全警告',
    content:
      '装车和绑扎是大件运输中最关键的安全环节。请确保所有绑扎点牢固，使用防滑垫和防磨保护。',
    level: 'warning',
    relatedKnowledgeCategory: 'safety',
    displayOrder: 2,
    enabled: true,
    version: '1.0.0',
  },
  {
    id: 'hint-transport-1',
    stepId: 'stage_6_transport',
    stepName: STEP_NAMES.stage_6_transport,
    title: '运输前检查',
    content: '开始运输前，请确认绑扎牢固、车辆状态正常、路线条件满足要求。',
    level: 'basic',
    relatedKnowledgeCategory: 'safety',
    displayOrder: 0,
    enabled: true,
    version: '1.0.0',
  },
  {
    id: 'hint-transport-2',
    stepId: 'stage_6_transport',
    stepName: STEP_NAMES.stage_6_transport,
    title: '注意通行安全',
    content: '运输途中应限速行驶，注意前导车配合，夜间运输需开启灯光警示。',
    level: 'warning',
    relatedKnowledgeCategory: 'safety',
    displayOrder: 1,
    enabled: true,
    version: '1.0.0',
  },
]

export function getHintsForStep(stepId: StepId): StepHint[] {
  return STEP_HINTS.filter((h) => h.stepId === stepId && h.enabled).sort(
    (a, b) => a.displayOrder - b.displayOrder,
  )
}

export function getHintById(hintId: string): StepHint | undefined {
  return STEP_HINTS.find((h) => h.id === hintId)
}

export function validateStepHints(data: unknown): StepHint[] {
  return stepHintsArraySchema.parse(data)
}
