export type SceneObjectCategory =
  | 'cargo'
  | 'vehicle'
  | 'route'
  | 'obstacle'
  | 'tool'
  | 'ground'

export interface SceneObjectMeta {
  id: string
  name: string
  category: SceneObjectCategory
  description: string
  teachingTip: string
}

export const SCENE_OBJECTS: SceneObjectMeta[] = [
  {
    id: 'cargo-main',
    name: '大件货物模型',
    category: 'cargo',
    description: '用于观察大件货物尺寸、重心和装车位置。',
    teachingTip: '请测量货物长宽高，确认重心标记位置。',
  },
  {
    id: 'tractor-6x6',
    name: '6x6 牵引车',
    category: 'vehicle',
    description: '用于观察牵引车尺寸、轴数和动力参数。',
    teachingTip: '请比较不同牵引车的轴载分布和牵引力。',
  },
  {
    id: 'height-limit',
    name: '限高障碍',
    category: 'obstacle',
    description: '用于判断运输路线是否满足高度通行条件。',
    teachingTip: '请测量限高架净空高度，与货物高度对比。',
  },
]
