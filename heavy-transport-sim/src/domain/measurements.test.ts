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
  type MeasurementPoint,
  type MeasurementTarget,
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

  it('each target has suggestedPointPairs', () => {
    for (const route of SURVEY_ROUTES) {
      for (const obs of route.obstacles) {
        const targets = getMeasurementTargetsForObstacle(route.id, obs)
        for (const t of targets) {
          expect(t.suggestedPointPairs).toBeDefined()
          expect(t.suggestedPointPairs!.length).toBeGreaterThanOrEqual(1)
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
