import { describe, it, expect } from 'vitest'
import {
  calculateDistance,
  calculateHeight,
  validateMeasurementResult,
  createDistanceResult,
  createHeightResult,
  getMeasurementTargetsForObstacle,
  getAllMeasurementTargets,
  measurementResultSchema,
  measurementTargetSchema,
  measurementPointSchema,
  calculateHorizontalDistance,
  calculateVerticalDistance,
  calculateSlopePercent,
  calculateSlopeAngleDeg,
  createSlopeMeasurementResult,
  validateSlopeMeasurementResult,
  curveParameterMeasurementResultSchema,
  createCurveParameterResult,
  validateCurveParameterMeasurementResult,
  formatCurveParameterSummary,
  type MeasurementPoint,
  type MeasurementTarget,
  type CurveParameterMeasurementResult,
} from './measurements'
import { SURVEY_ROUTES } from './surveyRouteData'

describe('calculateDistance', () => {
  it('calculates distance between two 3D points', () => {
    const d = calculateDistance([0, 0, 0], [3, 4, 0])
    expect(d).toBeCloseTo(5, 5)
  })

  it('returns 0 for same point', () => {
    expect(calculateDistance([1, 2, 3], [1, 2, 3])).toBe(0)
  })

  it('handles negative coordinates', () => {
    const d = calculateDistance([-1, -1, -1], [2, 3, 4])
    expect(d).toBeCloseTo(Math.sqrt(9 + 16 + 25), 5)
  })

  it('calculates with z component', () => {
    const d = calculateDistance([0, 0, 0], [0, 0, 5])
    expect(d).toBeCloseTo(5, 5)
  })
})

describe('calculateHeight', () => {
  it('calculates height difference using y-axis', () => {
    const h = calculateHeight([0, 0, 0], [0, 5, 0])
    expect(h).toBeCloseTo(5, 5)
  })

  it('returns absolute value', () => {
    const h = calculateHeight([0, 10, 0], [0, 3, 0])
    expect(h).toBeCloseTo(7, 5)
  })

  it('ignores x and z', () => {
    const h = calculateHeight([100, 2, 200], [300, 8, 400])
    expect(h).toBeCloseTo(6, 5)
  })

  it('returns 0 for same y', () => {
    expect(calculateHeight([0, 5, 0], [10, 5, 10])).toBe(0)
  })
})

describe('Measurement schemas', () => {
  it('valid measurement point passes schema', () => {
    const p = {
      id: 'p1',
      label: 'Point A',
      position: [0, 0, 0] as [number, number, number],
    }
    expect(measurementPointSchema.safeParse(p).success).toBe(true)
  })

  it('valid measurement target passes schema', () => {
    const t = {
      id: 't1',
      routeId: 'route_a_urban_low_bridge',
      obstacleId: 'obs1',
      targetType: 'clearance_height',
      label: 'Test Target',
      description: 'A test target',
      supportedTools: ['height'],
    }
    expect(measurementTargetSchema.safeParse(t).success).toBe(true)
  })

  it('valid measurement result passes schema', () => {
    const r = {
      id: 'r1',
      routeId: 'route_a_urban_low_bridge',
      obstacleId: 'obs1',
      targetId: 't1',
      targetLabel: 'Test Target',
      toolType: 'distance',
      points: [
        { id: 'p1', label: 'A', position: [0, 0, 0] },
        { id: 'p2', label: 'B', position: [3, 4, 0] },
      ],
      value: 5,
      unit: 'm',
      valueLabel: '5 m',
      measuredAt: new Date().toISOString(),
      source: 'manual_point_selection',
    }
    expect(measurementResultSchema.safeParse(r).success).toBe(true)
  })
})

describe('createDistanceResult', () => {
  const target: MeasurementTarget = {
    id: 't1',
    routeId: 'route_a_urban_low_bridge',
    obstacleId: 'obs1',
    targetType: 'road_width',
    label: 'Test Distance',
    description: 'Test',
    supportedTools: ['distance'],
  }

  const pA: MeasurementPoint = { id: 'a', label: 'A', position: [0, 0, 0] }
  const pB: MeasurementPoint = { id: 'b', label: 'B', position: [3, 4, 0] }

  it('creates valid distance result', () => {
    const r = createDistanceResult(
      'route_a_urban_low_bridge',
      'obs1',
      target,
      pA,
      pB,
    )
    expect('error' in r).toBe(false)
    if (!('error' in r)) {
      expect(r.value).toBeCloseTo(5, 1)
      expect(r.unit).toBe('m')
      expect(r.toolType).toBe('distance')
      expect(r.targetLabel).toBe('Test Distance')
      expect(r.points).toHaveLength(2)
    }
  })

  it('returns error for same points', () => {
    const r = createDistanceResult(
      'route_a_urban_low_bridge',
      'obs1',
      target,
      pA,
      pA,
    )
    expect('error' in r).toBe(true)
  })
})

describe('createHeightResult', () => {
  const target: MeasurementTarget = {
    id: 't1',
    routeId: 'route_a_urban_low_bridge',
    obstacleId: 'obs1',
    targetType: 'clearance_height',
    label: 'Test Height',
    description: 'Test',
    supportedTools: ['height'],
  }

  const pA: MeasurementPoint = { id: 'a', label: 'Ground', position: [0, 0, 0] }
  const pB: MeasurementPoint = { id: 'b', label: 'Top', position: [0, 4.5, 0] }

  it('creates valid height result', () => {
    const r = createHeightResult(
      'route_a_urban_low_bridge',
      'obs1',
      target,
      pA,
      pB,
    )
    expect('error' in r).toBe(false)
    if (!('error' in r)) {
      expect(r.value).toBeCloseTo(4.5, 1)
      expect(r.unit).toBe('m')
      expect(r.toolType).toBe('height')
      expect(r.targetLabel).toBe('Test Height')
    }
  })

  it('returns error for same y (zero height)', () => {
    const sameY: MeasurementPoint = {
      id: 'c',
      label: 'Same',
      position: [5, 3, 5],
    }
    const r = createHeightResult(
      'route_a_urban_low_bridge',
      'obs1',
      target,
      sameY,
      sameY,
    )
    expect('error' in r).toBe(true)
  })

  it('returns error for same points', () => {
    const r = createHeightResult(
      'route_a_urban_low_bridge',
      'obs1',
      target,
      pA,
      pA,
    )
    expect('error' in r).toBe(true)
  })
})

describe('validateMeasurementResult', () => {
  it('valid result passes validation', () => {
    const r = createDistanceResult(
      'route_a_urban_low_bridge',
      'obs_a1_railway_bridge',
      {
        id: 't1',
        routeId: 'route_a_urban_low_bridge',
        obstacleId: 'obs_a1_railway_bridge',
        targetType: 'road_width',
        label: 'Test',
        description: 'Test',
        supportedTools: ['distance'],
      },
      { id: 'a', label: 'A', position: [0, 0, 0] },
      { id: 'b', label: 'B', position: [3, 4, 0] },
    )
    if ('error' in r) throw new Error('Expected result')
    const v = validateMeasurementResult(r)
    expect(v.success).toBe(true)
    expect(v.errors).toEqual([])
  })

  it('fails for same points', () => {
    const r = {
      id: 'r1',
      routeId: 'route_a_urban_low_bridge',
      obstacleId: 'obs_a1_railway_bridge',
      targetId: 't1',
      targetLabel: 'Test',
      toolType: 'distance' as const,
      points: [
        {
          id: 'a',
          label: 'A',
          position: [0, 0, 0] as [number, number, number],
        },
        {
          id: 'b',
          label: 'B',
          position: [0, 0, 0] as [number, number, number],
        },
      ],
      value: 0,
      unit: 'm' as const,
      valueLabel: '0 m',
      measuredAt: new Date().toISOString(),
      source: 'manual_point_selection' as const,
    }
    const v = validateMeasurementResult(r)
    expect(v.success).toBe(false)
    expect(v.errors.length).toBeGreaterThan(0)
  })

  it('fails for nonexistent route', () => {
    const r = {
      id: 'r1',
      routeId: 'nonexistent',
      obstacleId: 'obs1',
      targetId: 't1',
      targetLabel: 'Test',
      toolType: 'distance' as const,
      points: [
        {
          id: 'a',
          label: 'A',
          position: [0, 0, 0] as [number, number, number],
        },
        {
          id: 'b',
          label: 'B',
          position: [3, 4, 0] as [number, number, number],
        },
      ],
      value: 5,
      unit: 'm' as const,
      valueLabel: '5 m',
      measuredAt: new Date().toISOString(),
      source: 'manual_point_selection' as const,
    }
    const v = validateMeasurementResult(r)
    expect(v.success).toBe(false)
    expect(v.errors.some((e) => e.includes('不存在'))).toBe(true)
  })

  it('fails for null input', () => {
    const v = validateMeasurementResult(null)
    expect(v.success).toBe(false)
  })
})

describe('getMeasurementTargetsForObstacle', () => {
  it('returns targets for height_limit obstacle', () => {
    const obs = SURVEY_ROUTES[0].obstacles.find(
      (o) => o.type === 'height_limit',
    )!
    const targets = getMeasurementTargetsForObstacle(SURVEY_ROUTES[0].id, obs)
    expect(targets.length).toBeGreaterThanOrEqual(1)
    expect(targets[0].targetType).toBe('clearance_height')
    expect(targets[0].supportedTools).toContain('height')
  })

  it('returns targets for narrow_section obstacle', () => {
    const obs = SURVEY_ROUTES[0].obstacles.find(
      (o) => o.type === 'narrow_section',
    )!
    const targets = getMeasurementTargetsForObstacle(SURVEY_ROUTES[0].id, obs)
    expect(targets.length).toBeGreaterThanOrEqual(1)
    expect(targets[0].targetType).toBe('road_width')
    expect(targets[0].supportedTools).toContain('distance')
  })

  it('returns targets for bridge obstacle', () => {
    const obs = SURVEY_ROUTES[1].obstacles.find((o) => o.type === 'bridge')!
    const targets = getMeasurementTargetsForObstacle(SURVEY_ROUTES[1].id, obs)
    expect(targets.length).toBeGreaterThanOrEqual(1)
    expect(targets[0].supportedTools).toContain('distance')
  })

  it('returns targets for curve obstacle', () => {
    const obs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    const targets = getMeasurementTargetsForObstacle(SURVEY_ROUTES[0].id, obs)
    expect(targets.length).toBeGreaterThanOrEqual(1)
  })

  it('returns targets for slope obstacle', () => {
    const obs = SURVEY_ROUTES[2].obstacles.find((o) => o.type === 'slope')!
    const targets = getMeasurementTargetsForObstacle(SURVEY_ROUTES[2].id, obs)
    expect(targets.length).toBeGreaterThanOrEqual(1)
    expect(targets[0].supportedTools).toContain('height')
  })

  it('each target has suggestedPointPairs or is a curve target', () => {
    for (const route of SURVEY_ROUTES) {
      for (const obs of route.obstacles) {
        const targets = getMeasurementTargetsForObstacle(route.id, obs)
        for (const t of targets) {
          if (t.supportedTools.includes('curve')) {
            expect(t.curveKind).toBeDefined()
          } else {
            expect(t.suggestedPointPairs).toBeDefined()
            expect(t.suggestedPointPairs!.length).toBeGreaterThanOrEqual(1)
          }
        }
      }
    }
  })
})

describe('getAllMeasurementTargets', () => {
  it('returns targets for all obstacles in a route', () => {
    const targets = getAllMeasurementTargets(SURVEY_ROUTES[0].id)
    expect(targets.length).toBeGreaterThanOrEqual(3)
  })

  it('returns empty for nonexistent route', () => {
    expect(getAllMeasurementTargets('nonexistent')).toEqual([])
  })

  it('covers multiple target types across route', () => {
    const targets = getAllMeasurementTargets(SURVEY_ROUTES[0].id)
    const types = new Set(targets.map((t) => t.targetType))
    expect(types.size).toBeGreaterThanOrEqual(2)
  })
})

describe('Slope measurement calculations', () => {
  it('calculateHorizontalDistance computes XZ plane distance', () => {
    const h = calculateHorizontalDistance([0, 0, 0], [3, 10, 4])
    expect(h).toBeCloseTo(5, 5)
  })

  it('calculateHorizontalDistance returns 0 for same XZ', () => {
    expect(calculateHorizontalDistance([5, 0, 5], [5, 100, 5])).toBe(0)
  })

  it('calculateVerticalDistance computes Y axis difference', () => {
    const v = calculateVerticalDistance([0, 0, 0], [100, 1.5, 200])
    expect(v).toBeCloseTo(1.5, 5)
  })

  it('calculateVerticalDistance returns absolute value', () => {
    const v = calculateVerticalDistance([0, 10, 0], [0, 3, 0])
    expect(v).toBeCloseTo(7, 5)
  })

  it('calculateSlopePercent computes correct percentage', () => {
    expect(calculateSlopePercent(20, 1.5)).toBeCloseTo(7.5, 5)
  })

  it('calculateSlopePercent returns 0 for zero horizontal', () => {
    expect(calculateSlopePercent(0, 5)).toBe(0)
  })

  it('calculateSlopePercent returns 0 for zero vertical', () => {
    expect(calculateSlopePercent(20, 0)).toBeCloseTo(0, 5)
  })

  it('calculateSlopeAngleDeg computes correct angle', () => {
    const angle = calculateSlopeAngleDeg(20, 1.5)
    expect(angle).toBeCloseTo(4.29, 1)
  })

  it('calculateSlopeAngleDeg returns 0 for zero horizontal', () => {
    expect(calculateSlopeAngleDeg(0, 5)).toBe(0)
  })
})

describe('createSlopeMeasurementResult', () => {
  const pA = {
    id: 'a',
    label: '坡底',
    position: [0, 0, 0] as [number, number, number],
  }
  const pB = {
    id: 'b',
    label: '坡顶',
    position: [50, 3.75, 0] as [number, number, number],
  }

  it('creates valid slope result with process text', () => {
    const r = createSlopeMeasurementResult(
      'route_c_mountain_slope',
      'obs_c1_mountain_slope',
      'target_slope',
      '山腰陡坡段 - 坡度',
      pA,
      pB,
    )
    expect('error' in r).toBe(false)
    if (!('error' in r)) {
      expect(r.toolType).toBe('slope')
      expect(r.horizontalDistanceM).toBeCloseTo(50, 1)
      expect(r.verticalDistanceM).toBeCloseTo(3.75, 1)
      expect(r.slopePercent).toBeCloseTo(7.5, 1)
      expect(r.unit).toBe('%')
      expect(r.processText).toContain('水平距离')
      expect(r.processText).toContain('垂直距离')
      expect(r.processText).toContain('计算过程')
      expect(r.processText).toContain('坡度结果')
      expect(r.targetLabel).toBe('山腰陡坡段 - 坡度')
    }
  })

  it('includes slope angle in result', () => {
    const r = createSlopeMeasurementResult(
      'route_c_mountain_slope',
      'obs_c1_mountain_slope',
      'target_slope',
      'Test',
      pA,
      pB,
    )
    if (!('error' in r)) {
      expect(r.slopeAngleDeg).toBeDefined()
      expect(r.slopeAngleDeg!).toBeGreaterThan(0)
    }
  })

  it('returns error for same points', () => {
    const r = createSlopeMeasurementResult(
      'route_c_mountain_slope',
      'obs_c1_mountain_slope',
      'target_slope',
      'Test',
      pA,
      pA,
    )
    expect('error' in r).toBe(true)
  })

  it('returns error for zero horizontal distance', () => {
    const sameXZ = {
      id: 'c',
      label: 'Same XZ',
      position: [0, 100, 0] as [number, number, number],
    }
    const r = createSlopeMeasurementResult(
      'route_c_mountain_slope',
      'obs_c1_mountain_slope',
      'target_slope',
      'Test',
      pA,
      sameXZ,
    )
    expect('error' in r).toBe(true)
  })

  it('result writes to measurement draft via schema', () => {
    const r = createSlopeMeasurementResult(
      'route_c_mountain_slope',
      'obs_c1_mountain_slope',
      'target_slope',
      'Test',
      pA,
      pB,
    )
    if (!('error' in r)) {
      const v = validateSlopeMeasurementResult(r)
      expect(v.success).toBe(true)
    }
  })
})

describe('validateSlopeMeasurementResult', () => {
  const validResult = {
    id: 'sr1',
    routeId: 'route_c_mountain_slope',
    obstacleId: 'obs_c1_mountain_slope',
    targetId: 'target_slope',
    targetLabel: 'Test',
    toolType: 'slope' as const,
    points: [
      { id: 'a', label: 'A', position: [0, 0, 0] as [number, number, number] },
      {
        id: 'b',
        label: 'B',
        position: [50, 3.75, 0] as [number, number, number],
      },
    ],
    horizontalDistanceM: 50,
    verticalDistanceM: 3.75,
    slopePercent: 7.5,
    slopeAngleDeg: 4.29,
    unit: '%' as const,
    processText: '水平距离：50 m\n垂直距离：3.75 m',
    valueLabel: '7.5%',
    measuredAt: new Date().toISOString(),
    source: 'manual_point_selection' as const,
  }

  it('valid result passes validation', () => {
    const v = validateSlopeMeasurementResult(validResult)
    expect(v.success).toBe(true)
    expect(v.errors).toEqual([])
  })

  it('fails for nonexistent route', () => {
    const v = validateSlopeMeasurementResult({
      ...validResult,
      routeId: 'nonexistent',
    })
    expect(v.success).toBe(false)
    expect(v.errors.some((e) => e.includes('不存在'))).toBe(true)
  })

  it('fails for null input', () => {
    const v = validateSlopeMeasurementResult(null)
    expect(v.success).toBe(false)
  })

  it('fails for same points', () => {
    const v = validateSlopeMeasurementResult({
      ...validResult,
      points: [
        {
          id: 'a',
          label: 'A',
          position: [0, 0, 0] as [number, number, number],
        },
        {
          id: 'b',
          label: 'B',
          position: [0, 0, 0] as [number, number, number],
        },
      ],
      horizontalDistanceM: 0,
      slopePercent: 0,
      valueLabel: '0%',
      processText: 'test',
    })
    expect(v.success).toBe(false)
  })
})

describe('Slope targets for slope obstacles', () => {
  it('slope obstacle has slope target with slope tool', () => {
    const obs = SURVEY_ROUTES[2].obstacles.find((o) => o.type === 'slope')!
    const targets = getMeasurementTargetsForObstacle(SURVEY_ROUTES[2].id, obs)
    const slopeTarget = targets.find((t) => t.supportedTools.includes('slope'))
    expect(slopeTarget).toBeDefined()
    expect(slopeTarget!.supportedTools).toContain('slope')
    expect(slopeTarget!.suggestedPointPairs).toBeDefined()
    expect(slopeTarget!.suggestedPointPairs!.length).toBeGreaterThanOrEqual(1)
  })

  it('slope obstacle still has height target', () => {
    const obs = SURVEY_ROUTES[2].obstacles.find((o) => o.type === 'slope')!
    const targets = getMeasurementTargetsForObstacle(SURVEY_ROUTES[2].id, obs)
    const heightTarget = targets.find((t) =>
      t.supportedTools.includes('height'),
    )
    expect(heightTarget).toBeDefined()
  })
})

describe('Curve parameter measurement schema', () => {
  it('can be imported', () => {
    expect(curveParameterMeasurementResultSchema).toBeDefined()
  })

  it('valid curve result passes schema', () => {
    const r = {
      id: 'curve-1',
      routeId: 'route_a_urban_low_bridge',
      obstacleId: 'obs_a2_ring_road_curve',
      targetId: 'target_obs_a2_ring_road_curve_curve_params',
      targetLabel: '城西环岛右转弯道 - 弯道参数',
      toolType: 'curve' as const,
      curveKind: 'circular_curve' as const,
      radiusM: 25,
      angleDeg: 90,
      entranceWidthM: 6,
      exitWidthM: 5.5,
      source: 'manual_input' as const,
      valueLabel: '圆弧弯道 半径25m 夹角90° 入口6m 出口5.5m',
      measuredAt: new Date().toISOString(),
    }
    expect(curveParameterMeasurementResultSchema.safeParse(r).success).toBe(
      true,
    )
  })
})

describe('createCurveParameterResult', () => {
  const baseInput = {
    routeId: 'route_a_urban_low_bridge',
    obstacleId: 'obs_a2_ring_road_curve',
    targetId: 'target_curve',
    targetLabel: '城西环岛右转弯道 - 弯道参数',
    curveKind: 'circular_curve' as const,
    source: 'manual_input' as const,
  }

  it('creates valid curve result', () => {
    const r = createCurveParameterResult({
      ...baseInput,
      radiusM: 25,
      angleDeg: 90,
      entranceWidthM: 6,
      exitWidthM: 5.5,
    })
    expect('error' in r).toBe(false)
    if (!('error' in r)) {
      expect(r.toolType).toBe('curve')
      expect(r.curveKind).toBe('circular_curve')
      expect(r.radiusM).toBe(25)
      expect(r.angleDeg).toBe(90)
      expect(r.entranceWidthM).toBe(6)
      expect(r.exitWidthM).toBe(5.5)
      expect(r.source).toBe('manual_input')
      expect(r.valueLabel).toContain('圆弧弯道')
      expect(r.valueLabel).toContain('半径25m')
      expect(r.valueLabel).toContain('夹角90°')
    }
  })

  it('returns error for radiusM = 0', () => {
    const r = createCurveParameterResult({
      ...baseInput,
      radiusM: 0,
      angleDeg: 90,
      entranceWidthM: 6,
      exitWidthM: 5.5,
    })
    expect('error' in r).toBe(true)
    if ('error' in r) expect(r.error).toContain('半径')
  })

  it('returns error for negative radiusM', () => {
    const r = createCurveParameterResult({
      ...baseInput,
      radiusM: -5,
      angleDeg: 90,
      entranceWidthM: 6,
      exitWidthM: 5.5,
    })
    expect('error' in r).toBe(true)
  })

  it('returns error for angleDeg = 0', () => {
    const r = createCurveParameterResult({
      ...baseInput,
      radiusM: 25,
      angleDeg: 0,
      entranceWidthM: 6,
      exitWidthM: 5.5,
    })
    expect('error' in r).toBe(true)
    if ('error' in r) expect(r.error).toContain('夹角')
  })

  it('returns error for negative angleDeg', () => {
    const r = createCurveParameterResult({
      ...baseInput,
      radiusM: 25,
      angleDeg: -10,
      entranceWidthM: 6,
      exitWidthM: 5.5,
    })
    expect('error' in r).toBe(true)
  })

  it('returns error for angleDeg > 180', () => {
    const r = createCurveParameterResult({
      ...baseInput,
      radiusM: 25,
      angleDeg: 200,
      entranceWidthM: 6,
      exitWidthM: 5.5,
    })
    expect('error' in r).toBe(true)
  })

  it('returns error for entranceWidthM = 0', () => {
    const r = createCurveParameterResult({
      ...baseInput,
      radiusM: 25,
      angleDeg: 90,
      entranceWidthM: 0,
      exitWidthM: 5.5,
    })
    expect('error' in r).toBe(true)
    if ('error' in r) expect(r.error).toContain('入口宽度')
  })

  it('returns error for negative entranceWidthM', () => {
    const r = createCurveParameterResult({
      ...baseInput,
      radiusM: 25,
      angleDeg: 90,
      entranceWidthM: -3,
      exitWidthM: 5.5,
    })
    expect('error' in r).toBe(true)
  })

  it('returns error for exitWidthM = 0', () => {
    const r = createCurveParameterResult({
      ...baseInput,
      radiusM: 25,
      angleDeg: 90,
      entranceWidthM: 6,
      exitWidthM: 0,
    })
    expect('error' in r).toBe(true)
    if ('error' in r) expect(r.error).toContain('出口宽度')
  })

  it('returns error for negative exitWidthM', () => {
    const r = createCurveParameterResult({
      ...baseInput,
      radiusM: 25,
      angleDeg: 90,
      entranceWidthM: 6,
      exitWidthM: -2,
    })
    expect('error' in r).toBe(true)
  })

  it('returns error for empty routeId', () => {
    const r = createCurveParameterResult({
      ...baseInput,
      routeId: '',
      radiusM: 25,
      angleDeg: 90,
      entranceWidthM: 6,
      exitWidthM: 5.5,
    })
    expect('error' in r).toBe(true)
  })

  it('returns error for empty obstacleId', () => {
    const r = createCurveParameterResult({
      ...baseInput,
      obstacleId: '',
      radiusM: 25,
      angleDeg: 90,
      entranceWidthM: 6,
      exitWidthM: 5.5,
    })
    expect('error' in r).toBe(true)
  })

  it('returns error for empty targetId', () => {
    const r = createCurveParameterResult({
      ...baseInput,
      targetId: '',
      radiusM: 25,
      angleDeg: 90,
      entranceWidthM: 6,
      exitWidthM: 5.5,
    })
    expect('error' in r).toBe(true)
  })

  it('returns error for nonexistent route', () => {
    const r = createCurveParameterResult({
      ...baseInput,
      routeId: 'nonexistent',
      radiusM: 25,
      angleDeg: 90,
      entranceWidthM: 6,
      exitWidthM: 5.5,
    })
    expect('error' in r).toBe(true)
    if ('error' in r) expect(r.error).toContain('不存在')
  })

  it('includes optional fields when provided', () => {
    const r = createCurveParameterResult({
      ...baseInput,
      radiusM: 25,
      angleDeg: 90,
      entranceWidthM: 6,
      exitWidthM: 5.5,
      effectiveWidthM: 4.8,
      innerClearanceM: 1.2,
      outerClearanceM: 2.0,
      notes: '测试备注',
    })
    if (!('error' in r)) {
      expect(r.effectiveWidthM).toBe(4.8)
      expect(r.innerClearanceM).toBe(1.2)
      expect(r.outerClearanceM).toBe(2.0)
      expect(r.notes).toBe('测试备注')
    }
  })
})

describe('validateCurveParameterMeasurementResult', () => {
  const validResult: CurveParameterMeasurementResult = {
    id: 'curve-1',
    routeId: 'route_a_urban_low_bridge',
    obstacleId: 'obs_a2_ring_road_curve',
    targetId: 'target_curve',
    targetLabel: '城西环岛右转弯道 - 弯道参数',
    toolType: 'curve',
    curveKind: 'circular_curve',
    radiusM: 25,
    angleDeg: 90,
    entranceWidthM: 6,
    exitWidthM: 5.5,
    source: 'manual_input',
    valueLabel: '圆弧弯道 半径25m 夹角90° 入口6m 出口5.5m',
    measuredAt: new Date().toISOString(),
  }

  it('valid result passes validation', () => {
    const v = validateCurveParameterMeasurementResult(validResult)
    expect(v.success).toBe(true)
    expect(v.errors).toEqual([])
  })

  it('fails for nonexistent route', () => {
    const v = validateCurveParameterMeasurementResult({
      ...validResult,
      routeId: 'nonexistent',
    })
    expect(v.success).toBe(false)
    expect(v.errors.some((e) => e.includes('不存在'))).toBe(true)
  })

  it('fails for obstacle not belonging to route', () => {
    const v = validateCurveParameterMeasurementResult({
      ...validResult,
      obstacleId: 'nonexistent_obs',
    })
    expect(v.success).toBe(false)
  })

  it('fails for non-curve obstacle type', () => {
    const v = validateCurveParameterMeasurementResult({
      ...validResult,
      obstacleId: 'obs_a1_railway_bridge',
    })
    expect(v.success).toBe(false)
    expect(v.errors.some((e) => e.includes('不是弯道类型'))).toBe(true)
  })

  it('fails for null input', () => {
    const v = validateCurveParameterMeasurementResult(null)
    expect(v.success).toBe(false)
  })
})

describe('formatCurveParameterSummary', () => {
  it('formats summary with all fields', () => {
    const result: CurveParameterMeasurementResult = {
      id: 'curve-1',
      routeId: 'route_a_urban_low_bridge',
      obstacleId: 'obs_a2_ring_road_curve',
      targetId: 'target_curve',
      targetLabel: '城西环岛右转弯道 - 弯道参数',
      toolType: 'curve',
      curveKind: 'circular_curve',
      radiusM: 25,
      angleDeg: 90,
      entranceWidthM: 6,
      exitWidthM: 5.5,
      effectiveWidthM: 4.8,
      source: 'manual_input',
      valueLabel: 'test',
      measuredAt: '2026-06-30T10:00:00Z',
      notes: '测试备注',
    }
    const summary = formatCurveParameterSummary(result)
    expect(summary).toContain('圆弧弯道')
    expect(summary).toContain('半径：25 m')
    expect(summary).toContain('夹角：90°')
    expect(summary).toContain('入口宽度：6 m')
    expect(summary).toContain('出口宽度：5.5 m')
    expect(summary).toContain('有效宽度：4.8 m')
    expect(summary).toContain('手动录入')
    expect(summary).toContain('测试备注')
  })
})

describe('Curve targets for curve obstacles', () => {
  it('curve obstacle has curve parameter target with curve tool', () => {
    const obs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    const targets = getMeasurementTargetsForObstacle(SURVEY_ROUTES[0].id, obs)
    const curveTarget = targets.find((t) => t.supportedTools.includes('curve'))
    expect(curveTarget).toBeDefined()
    expect(curveTarget!.targetType).toBe('curve_parameters')
    expect(curveTarget!.curveKind).toBeDefined()
  })

  it('curve target has presetCurveParams', () => {
    const obs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    const targets = getMeasurementTargetsForObstacle(SURVEY_ROUTES[0].id, obs)
    const curveTarget = targets.find((t) => t.supportedTools.includes('curve'))
    expect(curveTarget).toBeDefined()
    expect(curveTarget!.presetCurveParams).toBeDefined()
  })

  it('route C curve obstacle also has curve target', () => {
    const obs = SURVEY_ROUTES[2].obstacles.find((o) => o.type === 'curve')!
    const targets = getMeasurementTargetsForObstacle(SURVEY_ROUTES[2].id, obs)
    const curveTarget = targets.find((t) => t.supportedTools.includes('curve'))
    expect(curveTarget).toBeDefined()
    expect(curveTarget!.curveKind).toBeDefined()
  })
})
