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
        summary:
          '介绍大件运输牵引车的基本结构、驱动形式和动力参数，帮助学生理解牵引车在运输方案中的作用。',
        learningObjectives: [
          '了解牵引车的驱动形式（4x2、6x4、6x6等）',
          '理解牵引力与货物重量的关系',
          '认识牵引车选型对运输安全的影响',
        ],
        keyConcepts: ['驱动形式', '牵引力', '轴荷分配', '发动机功率'],
        content:
          '牵引车是大件运输的动力来源。不同驱动形式适用于不同路况和载荷条件。6x6全轮驱动牵引车适用于复杂路况和超重货物运输。选型时需要考虑货物重量、路线坡度和路面条件。',
        relatedExperimentStages: ['简单配车', '车组确定'],
        estimatedMinutes: 8,
        order: 0,
      },
      {
        id: 'vehicle-trailer-basics',
        categoryId: 'vehicle',
        title: '挂车与轴线车',
        summary:
          '介绍挂车和轴线车的类型、承载能力和适用场景，帮助学生理解不同车型的特点。',
        learningObjectives: [
          '了解低平板半挂车和全挂车的区别',
          '理解轴线车的液压悬架和转向原理',
          '认识多轴线分散载荷的作用',
        ],
        keyConcepts: ['低平板半挂车', '轴线车', '液压悬架', '载荷分散'],
        content:
          '挂车和轴线车是承载货物的关键装备。轴线车通过多轴线设计分散载荷，降低单轴荷载。液压悬架系统可以在装车时调节高度，方便货物上下车。',
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
    objectives: [
      '理解路线勘测在大件运输中的重要性',
      '识别限高、弯道、坡度、桥梁等典型障碍',
      '掌握路线测量参数的基本概念',
    ],
    order: 1,
    enabled: true,
    version: '1.0.0',
    chapters: [
      {
        id: 'route-survey-purpose',
        categoryId: 'route',
        title: '路线勘测目的与流程',
        summary: '介绍大件运输路线勘测的目的、基本流程和勘测报告的内容要求。',
        learningObjectives: [
          '理解为什么大件运输必须进行路线勘测',
          '了解路线勘测的基本流程',
          '认识勘测报告的主要内容',
        ],
        keyConcepts: ['路线勘测', '通行条件', '勘测报告', '备选路线'],
        content:
          '路线勘测是大件运输方案制定的关键环节。通过实地勘测，确认路线上的限高、弯道、坡度、桥梁承载等条件是否满足运输要求。通常需要准备2-3条备选路线进行比较。',
        relatedExperimentStages: ['路线勘测'],
        estimatedMinutes: 8,
        order: 0,
      },
      {
        id: 'route-obstacles',
        categoryId: 'route',
        title: '典型路线障碍',
        summary:
          '介绍大件运输路线上常见的限高架、急弯、陡坡、桥梁等障碍类型及其影响。',
        learningObjectives: [
          '识别限高架和桥梁净空对货物高度的限制',
          '理解弯道半径对大型车辆转弯的影响',
          '认识坡度对车辆爬坡能力和制动安全的影响',
        ],
        keyConcepts: [
          '限高架',
          '净空高度',
          '弯道半径',
          '坡度百分比',
          '桥梁承载',
        ],
        content:
          '大件运输路线上常见的障碍包括：限高架（净空高度不足）、急弯（转弯半径过小）、陡坡（坡度过大）、桥梁（承载能力不足）。每个障碍都需要逐一核实是否满足运输要求。',
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
      '理解货物放置的基本原则',
      '掌握重心与车组中心的关系',
      '了解液压支撑和装车偏移风险',
    ],
    order: 2,
    enabled: true,
    version: '1.0.0',
    chapters: [
      {
        id: 'loading-placement',
        categoryId: 'loading',
        title: '货物放置原则',
        summary:
          '介绍大件货物装车时的放置原则，包括居中放置、重心控制和稳定性要求。',
        learningObjectives: [
          '理解货物应尽量居中放置的原因',
          '认识重心偏移对车辆稳定性的影响',
          '了解装车前的准备工作',
        ],
        keyConcepts: ['居中放置', '重心控制', '稳定性', '装车准备'],
        content:
          '货物装车时应尽量使货物重心与车组中心对齐。重心偏移会导致车辆行驶时不稳定，增加侧翻风险。装车前需要确认车辆停放平整、支撑可靠。',
        relatedExperimentStages: ['货物装车与绑扎加固'],
        estimatedMinutes: 8,
        order: 0,
      },
      {
        id: 'loading-support',
        categoryId: 'loading',
        title: '支撑点与液压系统',
        summary: '介绍装车过程中的支撑点设置和液压悬架系统的调节作用。',
        learningObjectives: [
          '理解支撑点的作用和设置原则',
          '了解液压悬架系统的调平功能',
          '认识装车偏移的风险和预防措施',
        ],
        keyConcepts: ['支撑点', '液压悬架', '调平', '装车偏移'],
        content:
          '支撑点是货物与车辆之间的接触面，需要合理分布以确保载荷均匀传递。液压悬架系统可以在装车过程中调节各轴线高度，使车辆保持水平状态。',
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
    objectives: [
      '理解绑扎在大件运输中的重要作用',
      '了解常见绑扎工具和方法',
      '掌握绑扎点设置和角度要求',
    ],
    order: 3,
    enabled: true,
    version: '1.0.0',
    chapters: [
      {
        id: 'lashing-purpose',
        categoryId: 'lashing',
        title: '绑扎目的与工具',
        summary: '介绍绑扎在大件运输中的目的、常用绑扎工具及其特点。',
        learningObjectives: [
          '理解绑扎防止货物位移和倾覆的作用',
          '了解钢丝绳、链条、棘轮收紧器等绑扎工具',
          '认识不同绑扎工具的适用场景',
        ],
        keyConcepts: ['绑扎目的', '钢丝绳', '链条', '棘轮收紧器', '绑扎力'],
        content:
          '绑扎的目的是防止货物在运输过程中发生位移、滚动或倾覆。常用工具包括钢丝绳、链条和棘轮收紧器。绑扎力需要根据货物重量和运输条件计算确定。',
        relatedExperimentStages: ['货物装车与绑扎加固'],
        estimatedMinutes: 8,
        order: 0,
      },
      {
        id: 'lashing-technique',
        categoryId: 'lashing',
        title: '绑扎方法与注意事项',
        summary: '介绍绑扎点设置、绑扎角度、对称性要求和防滑防磨措施。',
        learningObjectives: [
          '理解绑扎点应设置在货物结构强度足够处',
          '了解绑扎角度对绑扎效果的影响',
          '认识防滑垫和防磨保护的作用',
        ],
        keyConcepts: ['绑扎点', '绑扎角度', '对称性', '防滑垫', '防磨保护'],
        content:
          '绑扎点应设置在货物结构强度足够的位置，避免损坏货物。绑扎角度不宜过大，通常建议与水平面夹角不超过45度。绑扎应左右对称，确保力的均匀分布。使用防滑垫和防磨保护可提高安全性。',
        relatedExperimentStages: ['货物装车与绑扎加固'],
        estimatedMinutes: 10,
        order: 1,
      },
    ],
  },
  {
    id: 'safety',
    title: '安全知识',
    description: '了解大件运输的安全风险、现场作业安全和教学系统中的安全提示。',
    objectives: [
      '认识大件运输的主要安全风险',
      '了解现场作业和路线通行的安全要求',
      '理解教学系统中安全提示的边界',
    ],
    order: 4,
    enabled: true,
    version: '1.0.0',
    chapters: [
      {
        id: 'safety-risk',
        categoryId: 'safety',
        title: '大件运输安全风险',
        summary: '介绍大件运输中常见的安全风险类型及其防范措施。',
        learningObjectives: [
          '识别超限超载运输的主要风险',
          '了解货物倾覆、脱落等事故原因',
          '认识路线通行中的安全风险',
        ],
        keyConcepts: ['超限超载', '倾覆风险', '脱落风险', '通行风险'],
        content:
          '大件运输的主要安全风险包括：超限超载导致的道路损坏和事故、货物绑扎不牢导致的脱落、重心不稳导致的倾覆、路线障碍判断失误导致的碰撞等。风险防范需要从方案制定、车辆选型、绑扎加固和现场管理等多方面入手。',
        relatedExperimentStages: ['路线勘测', '货物装车与绑扎加固', '货物运输'],
        estimatedMinutes: 8,
        order: 0,
      },
      {
        id: 'safety-worksite',
        categoryId: 'safety',
        title: '现场作业与通行安全',
        summary: '介绍装车现场作业安全和运输途中的通行安全注意事项。',
        learningObjectives: [
          '了解装车现场的安全管理要求',
          '认识运输途中的通行安全措施',
          '理解人员协同和设备检查的重要性',
        ],
        keyConcepts: ['现场管理', '通行安全', '人员协同', '设备检查'],
        content:
          '现场作业安全包括：装车区域设置警戒线、起重设备定期检查、操作人员持证上岗。通行安全包括：前导车和护卫车配合、夜间运输灯光警示、限速行驶和避让措施。',
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

export function getLearningCategoryById(
  id: LearningCategoryId,
): LearningCategory | undefined {
  return LEARNING_CATEGORIES.find((c) => c.id === id)
}

export function getLearningChapterById(
  chapterId: string,
): { category: LearningCategory; chapter: LearningChapter } | undefined {
  for (const category of LEARNING_CATEGORIES) {
    const chapter = category.chapters.find((ch) => ch.id === chapterId)
    if (chapter) return { category, chapter }
  }
  return undefined
}

export function validateLearningContent(data: unknown): LearningCategory[] {
  return learningContentSchema.parse(data)
}
