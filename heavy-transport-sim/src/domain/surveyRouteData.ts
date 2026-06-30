import { type SurveyRoute, validateSurveyRoutes } from './surveyRoutes'

export const SURVEY_ROUTES: SurveyRoute[] = [
  {
    id: 'route_a_urban_low_bridge',
    name: '路线A：城区低桥绕行路线',
    description:
      '从东港装备制造厂出发，经城区主干道向西行进，绕开工业区直达变电站。路线经过城市建成区，有限高架和多处弯道，需要关注净空高度和转弯半径。',
    origin: '东港重型装备制造厂',
    destination: '西郊 500kV 变电站施工现场',
    teachingGoal:
      '学习识别城区路线中的限高障碍和弯道障碍，理解高度测量和弯道参数测量的重要性。',
    points: [
      {
        id: 'route_a_p1',
        label: '起点：东港装备制造厂大门',
        position: [0, 0, 0],
        description: '货物装车完成后出发点',
      },
      {
        id: 'route_a_p2',
        label: '城区主干道入口',
        position: [200, 0, 0],
        description: '进入城区主干道',
      },
      {
        id: 'route_a_p3',
        label: '铁路跨线桥',
        position: [500, 0, 50],
        description: '铁路跨线桥下方，有限高架',
      },
      {
        id: 'route_a_p4',
        label: '城西环岛弯道',
        position: [800, 0, 100],
        description: '城西环岛右转弯道',
      },
      {
        id: 'route_a_p5',
        label: '终点：变电站施工现场',
        position: [1200, 0, 0],
        description: '货物到达目的地',
      },
    ],
    obstacles: [
      {
        id: 'obs_a1_railway_bridge',
        routeId: 'route_a_urban_low_bridge',
        type: 'height_limit',
        name: '铁路跨线桥限高架',
        description:
          '铁路跨线桥下方设有限高架，标注限高4.5m。需要测量实际净空高度，判断货物加车辆总高是否可以通过。',
        position: [500, 0, 50],
        riskLevel: 'high',
        measurementTool: 'height',
        measurementPlaceholders: {
          markedHeight: 4.5,
          unit: 'm',
          measuredHeight: null,
          vehiclePlusCargoHeight: null,
        },
        teachingNote:
          '限高架标注高度可能与实际净空有差异，需要现场实测。货物高度4.2m加车辆高度后可能接近或超过限高。',
        enabled: true,
        order: 0,
      },
      {
        id: 'obs_a2_ring_road_curve',
        routeId: 'route_a_urban_low_bridge',
        type: 'curve',
        name: '城西环岛右转弯道',
        description:
          '城西环岛为右转弯道，需要测量弯道内半径和外半径，判断车辆转弯半径是否满足要求。',
        position: [800, 0, 100],
        riskLevel: 'medium',
        measurementTool: 'curve',
        measurementPlaceholders: {
          innerRadius: 25,
          outerRadius: 31,
          unit: 'm',
          roadWidth: 6,
          curveKind: 'circular_curve',
          curveAngleDeg: 90,
          entranceWidth: 6,
          exitWidth: 5.5,
        },
        teachingNote:
          '环岛弯道需要同时检查内侧不刮擦和外侧不越界。全挂车组合倒车难度高，需要特别注意。',
        enabled: true,
        order: 1,
      },
      {
        id: 'obs_a3_narrow_section',
        routeId: 'route_a_urban_low_bridge',
        type: 'narrow_section',
        name: '老城区窄路会车段',
        description:
          '老城区一段道路两侧有建筑物，路面宽度受限，需要判断车辆宽度是否满足通行要求。',
        position: [650, 0, 75],
        riskLevel: 'medium',
        measurementTool: 'distance',
        measurementPlaceholders: {
          roadWidth: null,
          unit: 'm',
          vehicleWidth: 2.55,
          clearance: null,
        },
        teachingNote:
          '狭窄路段需要测量实际可用路面宽度，考虑车辆宽度和安全余量。超宽货物可能无法通过。',
        enabled: true,
        order: 2,
      },
    ],
    scenePreset: 'urban_scene',
    enabled: true,
    order: 0,
    version: '1.0.0',
  },
  {
    id: 'route_b_industrial_direct',
    name: '路线B：工业园宽路直达路线',
    description:
      '从东港装备制造厂出发，沿工业园区宽幅道路向西直达变电站。路线经过工业园区和郊区，路面宽阔但有桥梁和一处路面收窄路段。',
    origin: '东港重型装备制造厂',
    destination: '西郊 500kV 变电站施工现场',
    teachingGoal:
      '学习识别桥梁承载障碍和狭窄路段障碍，理解桥梁限载测量和路面宽度测量的方法。',
    points: [
      {
        id: 'route_b_p1',
        label: '起点：东港装备制造厂大门',
        position: [0, 0, 0],
        description: '货物装车完成后出发点',
      },
      {
        id: 'route_b_p2',
        label: '工业园区主干道',
        position: [300, 0, 0],
        description: '工业园区宽幅道路',
      },
      {
        id: 'route_b_p3',
        label: '运河桥梁',
        position: [600, 0, 30],
        description: '跨越运河的公路桥梁',
      },
      {
        id: 'route_b_p4',
        label: '路面收窄施工段',
        position: [900, 0, 0],
        description: '道路施工导致路面收窄',
      },
      {
        id: 'route_b_p5',
        label: '终点：变电站施工现场',
        position: [1200, 0, 0],
        description: '货物到达目的地',
      },
    ],
    obstacles: [
      {
        id: 'obs_b1_canal_bridge',
        routeId: 'route_b_industrial_direct',
        type: 'bridge',
        name: '运河公路桥梁',
        description:
          '跨越运河的公路桥梁，需要核实桥梁承载能力是否满足车货总重168t的要求。',
        position: [600, 0, 30],
        riskLevel: 'high',
        measurementTool: 'bridge',
        measurementPlaceholders: {
          bridgeLoadCapacity: null,
          unit: 't',
          vehiclePlusCargoWeight: 168,
          bridgeSpan: null,
        },
        teachingNote:
          '桥梁承载能力需要逐桥核实。车货总重168t对桥梁承载是重要考验，必须确认桥梁设计荷载。',
        enabled: true,
        order: 0,
      },
      {
        id: 'obs_b2_construction_narrow',
        routeId: 'route_b_industrial_direct',
        type: 'narrow_section',
        name: '施工路段路面收窄',
        description:
          '道路施工导致路面从双向四车道收窄为单幅通行，需要测量收窄后实际可用宽度。',
        position: [900, 0, 0],
        riskLevel: 'medium',
        measurementTool: 'distance',
        measurementPlaceholders: {
          roadWidth: null,
          unit: 'm',
          vehicleWidth: 2.55,
          clearance: null,
        },
        teachingNote:
          '施工路段的收窄可能使超宽货物无法通行。需要提前了解施工信息并测量实际可通行宽度。',
        enabled: true,
        order: 1,
      },
      {
        id: 'obs_b3_height_limit_gate',
        routeId: 'route_b_industrial_direct',
        type: 'height_limit',
        name: '工业园区限高门架',
        description:
          '工业园区出口处有限高门架，标注限高5.0m，需要测量实际净空。',
        position: [400, 0, 0],
        riskLevel: 'medium',
        measurementTool: 'height',
        measurementPlaceholders: {
          markedHeight: 5.0,
          unit: 'm',
          measuredHeight: null,
          vehiclePlusCargoHeight: null,
        },
        teachingNote:
          '限高门架通常比铁路跨线桥高，但仍需实测确认。货物4.2m加车辆高度需要仔细核算。',
        enabled: true,
        order: 2,
      },
    ],
    scenePreset: 'industrial_scene',
    enabled: true,
    order: 1,
    version: '1.0.0',
  },
  {
    id: 'route_c_mountain_slope',
    name: '路线C：山区坡道桥梁路线',
    description:
      '从东港装备制造厂出发，经南部山区公路绕行至变电站。路线有明显坡度变化和山区桥梁，路面条件复杂但距离较短。',
    origin: '东港重型装备制造厂',
    destination: '西郊 500kV 变电站施工现场',
    teachingGoal:
      '学习识别坡道障碍和桥梁障碍，理解坡度测量和山区桥梁承载评估的方法。',
    points: [
      {
        id: 'route_c_p1',
        label: '起点：东港装备制造厂大门',
        position: [0, 0, 0],
        description: '货物装车完成后出发点',
      },
      {
        id: 'route_c_p2',
        label: '南部山区入口',
        position: [200, 0, 50],
        description: '进入山区公路',
      },
      {
        id: 'route_c_p3',
        label: '山腰陡坡段',
        position: [400, 0, 200],
        description: '山腰处坡度较大的路段',
      },
      {
        id: 'route_c_p4',
        label: '山谷桥梁',
        position: [700, 0, 150],
        description: '跨越山谷的桥梁',
      },
      {
        id: 'route_c_p5',
        label: '下山弯道',
        position: [900, 0, 50],
        description: '下山方向的弯道',
      },
      {
        id: 'route_c_p6',
        label: '终点：变电站施工现场',
        position: [1200, 0, 0],
        description: '货物到达目的地',
      },
    ],
    obstacles: [
      {
        id: 'obs_c1_mountain_slope',
        routeId: 'route_c_mountain_slope',
        type: 'slope',
        name: '山腰陡坡段',
        description:
          '山腰处有一段约200m的上坡路段，需要测量水平距离和高差，计算实际坡度百分比。',
        position: [400, 0, 200],
        riskLevel: 'high',
        measurementTool: 'slope',
        measurementPlaceholders: {
          horizontalDistance: null,
          verticalRise: null,
          unit: 'm',
          slopePercent: null,
        },
        teachingNote:
          '坡度超过车辆爬坡能力时无法通过。常见道路纵坡通常不超过9%，但山区道路可能更陡。需要实测计算。',
        enabled: true,
        order: 0,
      },
      {
        id: 'obs_c2_valley_bridge',
        routeId: 'route_c_mountain_slope',
        type: 'bridge',
        name: '山谷公路桥梁',
        description: '跨越山谷的公路桥梁，桥面较窄且承载能力需要核实。',
        position: [700, 0, 150],
        riskLevel: 'high',
        measurementTool: 'bridge',
        measurementPlaceholders: {
          bridgeLoadCapacity: null,
          unit: 't',
          vehiclePlusCargoWeight: 168,
          bridgeSpan: null,
        },
        teachingNote:
          '山区桥梁承载能力通常低于城市桥梁，需要特别关注。同时桥面宽度可能受限。',
        enabled: true,
        order: 1,
      },
      {
        id: 'obs_c3_downhill_curve',
        routeId: 'route_c_mountain_slope',
        type: 'curve',
        name: '下山方向急弯',
        description: '下山方向有一处急弯，需要测量弯道半径和路面宽度。',
        position: [900, 0, 50],
        riskLevel: 'medium',
        measurementTool: 'curve',
        measurementPlaceholders: {
          innerRadius: 18,
          outerRadius: 24,
          unit: 'm',
          roadWidth: 5,
          curveKind: 'circular_curve',
          curveAngleDeg: 120,
          entranceWidth: 5,
          exitWidth: 4.5,
        },
        teachingNote:
          '下坡弯道对车辆制动和转向同时提出要求。需要综合考虑坡度和弯道半径。',
        enabled: true,
        order: 2,
      },
    ],
    scenePreset: 'mountain_scene',
    enabled: true,
    order: 2,
    version: '1.0.0',
  },
]

export function getSurveyRoutes(): SurveyRoute[] {
  return SURVEY_ROUTES
}

export function getSurveyRouteById(id: string): SurveyRoute | undefined {
  return SURVEY_ROUTES.find((r) => r.id === id)
}

export function validateAllSurveyRoutes() {
  return validateSurveyRoutes(SURVEY_ROUTES)
}
