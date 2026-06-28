import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)

export const LEARNING_CATEGORY_IDS = [
  'vehicle',
  'route',
  'loading',
  'lashing',
  'safety',
] as const

export type LearningCategoryId = (typeof LEARNING_CATEGORY_IDS)[number]

export const learningChapterSchema = z.object({
  id: nonEmptyString,
  categoryId: z.enum(LEARNING_CATEGORY_IDS),
  title: nonEmptyString,
  summary: nonEmptyString,
  learningObjectives: z.array(nonEmptyString).min(1),
  keyConcepts: z.array(nonEmptyString).min(1),
  content: nonEmptyString,
  relatedExperimentStages: z.array(nonEmptyString).min(1),
  estimatedMinutes: z.number().positive(),
  order: z.number().int().min(0),
})

export const learningCategorySchema = z.object({
  id: z.enum(LEARNING_CATEGORY_IDS),
  title: nonEmptyString,
  description: nonEmptyString,
  objectives: z.array(nonEmptyString).min(1),
  chapters: z.array(learningChapterSchema).min(1),
  order: z.number().int().min(0),
  enabled: z.boolean(),
  version: nonEmptyString,
})

export const learningContentSchema = z.array(learningCategorySchema).length(5)

export type LearningChapter = z.infer<typeof learningChapterSchema>
export type LearningCategory = z.infer<typeof learningCategorySchema>

export const LEARNING_CATEGORIES: LearningCategory[] = [
  {
    id: 'vehicle',
    title: '车辆知识',
    description:
      '了解大件运输中使用的牵引车、挂车和轴线车的基本概念与选型依据。',
    objectives: [
      '理解牵引车和挂车的基本结构',
      '了解轴线车的承载原理',
      '掌握车辆组合方式对运输方案的影响',
    ],
    order: 0,
    enabled: true,
    version: '1.0.0',
    chapters: [
      {
        id: 'vehicle-tractor-basics',
        categoryId: 'vehicle',
        title: '牵引车基础',
        summary: '介绍大件运输牵引车的基本结构、驱动形式和动力参数。',
        learningObjectives: [
          '了解牵引车的驱动形式',
          '理解牵引力与货物重量的关系',
        ],
        keyConcepts: ['驱动形式', '牵引力', '轴荷分配'],
        content:
          '牵引车是大件运输的动力来源。不同驱动形式适用于不同路况和载荷条件。',
        relatedExperimentStages: ['简单配车', '车组确定'],
        estimatedMinutes: 8,
        order: 0,
      },
      {
        id: 'vehicle-trailer-basics',
        categoryId: 'vehicle',
        title: '挂车与轴线车',
        summary: '介绍挂车和轴线车的类型、承载能力和适用场景。',
        learningObjectives: [
          '了解低平板半挂车和全挂车的区别',
          '理解轴线车的液压悬架',
        ],
        keyConcepts: ['低平板半挂车', '轴线车', '液压悬架'],
        content:
          '挂车和轴线车是承载货物的关键装备。轴线车通过多轴线设计分散载荷。',
        relatedExperimentStages: ['简单配车', '车组确定'],
        estimatedMinutes: 10,
        order: 1,
      },
    ],
  },
  {
    id: 'route',
    title: '路线知识',
    description: '了解大件运输路线勘测的目的、典型障碍和风险识别方法。',
    objectives: ['理解路线勘测的重要性', '识别典型障碍', '掌握路线测量参数'],
    order: 1,
    enabled: true,
    version: '1.0.0',
    chapters: [
      {
        id: 'route-survey-purpose',
        categoryId: 'route',
        title: '路线勘测目的与流程',
        summary: '介绍大件运输路线勘测的目的和基本流程。',
        learningObjectives: [
          '理解为什么必须进行路线勘测',
          '了解勘测的基本流程',
        ],
        keyConcepts: ['路线勘测', '通行条件', '备选路线'],
        content: '路线勘测是大件运输方案制定的关键环节。',
        relatedExperimentStages: ['路线勘测'],
        estimatedMinutes: 8,
        order: 0,
      },
      {
        id: 'route-obstacles',
        categoryId: 'route',
        title: '典型路线障碍',
        summary: '介绍限高架、急弯、陡坡、桥梁等障碍类型。',
        learningObjectives: ['识别限高架和桥梁净空限制', '理解弯道半径的影响'],
        keyConcepts: ['限高架', '净空高度', '弯道半径', '坡度百分比'],
        content: '大件运输路线上常见的障碍包括限高架、急弯、陡坡、桥梁。',
        relatedExperimentStages: ['路线勘测'],
        estimatedMinutes: 10,
        order: 1,
      },
    ],
  },
  {
    id: 'loading',
    title: '装车知识',
    description: '了解货物装车的基本原则、重心控制和支撑点概念。',
    objectives: [
      '理解货物放置原则',
      '掌握重心与车组中心的关系',
      '了解液压支撑',
    ],
    order: 2,
    enabled: true,
    version: '1.0.0',
    chapters: [
      {
        id: 'loading-placement',
        categoryId: 'loading',
        title: '货物放置原则',
        summary: '介绍大件货物装车时的放置原则。',
        learningObjectives: ['理解居中放置的原因', '认识重心偏移的影响'],
        keyConcepts: ['居中放置', '重心控制', '稳定性'],
        content: '货物装车时应尽量使货物重心与车组中心对齐。',
        relatedExperimentStages: ['货物装车与绑扎加固'],
        estimatedMinutes: 8,
        order: 0,
      },
      {
        id: 'loading-support',
        categoryId: 'loading',
        title: '支撑点与液压系统',
        summary: '介绍装车过程中的支撑点设置和液压悬架系统。',
        learningObjectives: ['理解支撑点的作用', '了解液压悬架的调平功能'],
        keyConcepts: ['支撑点', '液压悬架', '调平'],
        content: '支撑点是货物与车辆之间的接触面，需要合理分布。',
        relatedExperimentStages: ['货物装车与绑扎加固'],
        estimatedMinutes: 10,
        order: 1,
      },
    ],
  },
  {
    id: 'lashing',
    title: '绑扎知识',
    description: '了解绑扎的目的、工具、方法和注意事项。',
    objectives: ['理解绑扎的作用', '了解绑扎工具', '掌握绑扎点设置'],
    order: 3,
    enabled: true,
    version: '1.0.0',
    chapters: [
      {
        id: 'lashing-purpose',
        categoryId: 'lashing',
        title: '绑扎目的与工具',
        summary: '介绍绑扎的目的和常用绑扎工具。',
        learningObjectives: ['理解绑扎防止位移的作用', '了解绑扎工具'],
        keyConcepts: ['绑扎目的', '钢丝绳', '链条', '棘轮收紧器'],
        content: '绑扎的目的是防止货物在运输过程中发生位移或倾覆。',
        relatedExperimentStages: ['货物装车与绑扎加固'],
        estimatedMinutes: 8,
        order: 0,
      },
      {
        id: 'lashing-technique',
        categoryId: 'lashing',
        title: '绑扎方法与注意事项',
        summary: '介绍绑扎点设置、角度和防滑防磨措施。',
        learningObjectives: ['理解绑扎点设置原则', '了解绑扎角度的影响'],
        keyConcepts: ['绑扎点', '绑扎角度', '对称性', '防滑垫'],
        content: '绑扎点应设置在货物结构强度足够的位置。',
        relatedExperimentStages: ['货物装车与绑扎加固'],
        estimatedMinutes: 10,
        order: 1,
      },
    ],
  },
  {
    id: 'safety',
    title: '安全知识',
    description: '了解大件运输的安全风险和现场作业安全。',
    objectives: ['认识主要安全风险', '了解现场作业安全', '理解安全提示边界'],
    order: 4,
    enabled: true,
    version: '1.0.0',
    chapters: [
      {
        id: 'safety-risk',
        categoryId: 'safety',
        title: '大件运输安全风险',
        summary: '介绍大件运输中常见的安全风险类型。',
        learningObjectives: ['识别超限超载风险', '了解倾覆和脱落风险'],
        keyConcepts: ['超限超载', '倾覆风险', '脱落风险'],
        content: '大件运输的主要安全风险包括超限超载、货物倾覆、脱落等。',
        relatedExperimentStages: ['路线勘测', '货物装车与绑扎加固'],
        estimatedMinutes: 8,
        order: 0,
      },
      {
        id: 'safety-worksite',
        categoryId: 'safety',
        title: '现场作业与通行安全',
        summary: '介绍装车现场作业安全和运输途中通行安全。',
        learningObjectives: ['了解现场管理要求', '认识通行安全措施'],
        keyConcepts: ['现场管理', '通行安全', '人员协同'],
        content: '现场作业安全包括警戒线设置、设备检查、持证上岗。',
        relatedExperimentStages: ['货物装车与绑扎加固', '货物运输'],
        estimatedMinutes: 10,
        order: 1,
      },
    ],
  },
]

export function getLearningCategories(): LearningCategory[] {
  return LEARNING_CATEGORIES
}

export function getAllChapterIds(): string[] {
  return LEARNING_CATEGORIES.flatMap((c) => c.chapters.map((ch) => ch.id))
}

export function validateLearningContent(data: unknown): LearningCategory[] {
  return learningContentSchema.parse(data)
}
