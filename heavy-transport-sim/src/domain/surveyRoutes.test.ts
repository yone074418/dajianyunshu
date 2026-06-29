import { describe, it, expect } from 'vitest'
import {
  validateSurveyRoutes,
  getSurveyRouteById,
  getRouteObstaclesByRouteId,
  getObstacleTypeSummary,
  ROUTE_OBSTACLE_TYPES,
  MEASUREMENT_TOOL_TYPES,
  routeObstacleSchema,
  surveyRouteSchema,
} from './surveyRoutes'
import { SURVEY_ROUTES, getSurveyRoutes } from './surveyRouteData'

describe('Survey routes data', () => {
  it('can be imported', () => {
    expect(SURVEY_ROUTES).toBeDefined()
    expect(SURVEY_ROUTES.length).toBeGreaterThanOrEqual(3)
  })

  it('getSurveyRoutes returns the same data', () => {
    expect(getSurveyRoutes()).toBe(SURVEY_ROUTES)
  })

  it('exactly or at least three routes exist', () => {
    expect(SURVEY_ROUTES.length).toBeGreaterThanOrEqual(3)
  })
})

describe('Route structure', () => {
  it('each route has required fields', () => {
    for (const route of SURVEY_ROUTES) {
      expect(route.id.length).toBeGreaterThan(0)
      expect(route.name.length).toBeGreaterThan(0)
      expect(route.description.length).toBeGreaterThan(0)
      expect(route.origin.length).toBeGreaterThan(0)
      expect(route.destination.length).toBeGreaterThan(0)
      expect(route.teachingGoal.length).toBeGreaterThan(0)
      expect(route.points.length).toBeGreaterThanOrEqual(2)
      expect(route.obstacles.length).toBeGreaterThanOrEqual(2)
      expect(route.scenePreset.length).toBeGreaterThan(0)
      expect(typeof route.enabled).toBe('boolean')
      expect(route.order).toBeGreaterThanOrEqual(0)
      expect(route.version.length).toBeGreaterThan(0)
    }
  })

  it('each route has origin and destination', () => {
    for (const route of SURVEY_ROUTES) {
      expect(route.origin.length).toBeGreaterThan(0)
      expect(route.destination.length).toBeGreaterThan(0)
    }
  })

  it('each route validates against schema', () => {
    for (const route of SURVEY_ROUTES) {
      const result = surveyRouteSchema.safeParse(route)
      expect(result.success).toBe(true)
    }
  })

  it('route IDs are unique', () => {
    const ids = SURVEY_ROUTES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('Obstacle structure', () => {
  it('each obstacle has required fields', () => {
    for (const route of SURVEY_ROUTES) {
      for (const obs of route.obstacles) {
        expect(obs.id.length).toBeGreaterThan(0)
        expect(obs.routeId.length).toBeGreaterThan(0)
        expect(obs.name.length).toBeGreaterThan(0)
        expect(obs.description.length).toBeGreaterThan(0)
        expect(obs.position).toHaveLength(3)
        expect(obs.teachingNote.length).toBeGreaterThan(0)
        expect(typeof obs.enabled).toBe('boolean')
        expect(obs.order).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('each obstacle type is valid', () => {
    for (const route of SURVEY_ROUTES) {
      for (const obs of route.obstacles) {
        expect(ROUTE_OBSTACLE_TYPES).toContain(obs.type)
      }
    }
  })

  it('each obstacle has valid measurement tool', () => {
    for (const route of SURVEY_ROUTES) {
      for (const obs of route.obstacles) {
        expect(MEASUREMENT_TOOL_TYPES).toContain(obs.measurementTool)
      }
    }
  })

  it('each obstacle has valid risk level', () => {
    for (const route of SURVEY_ROUTES) {
      for (const obs of route.obstacles) {
        expect(['low', 'medium', 'high']).toContain(obs.riskLevel)
      }
    }
  })

  it('each obstacle has position as 3D coordinate', () => {
    for (const route of SURVEY_ROUTES) {
      for (const obs of route.obstacles) {
        expect(obs.position).toHaveLength(3)
        for (const coord of obs.position) {
          expect(typeof coord).toBe('number')
        }
      }
    }
  })

  it('each obstacle has teaching note', () => {
    for (const route of SURVEY_ROUTES) {
      for (const obs of route.obstacles) {
        expect(obs.teachingNote.length).toBeGreaterThan(0)
      }
    }
  })

  it('each obstacle validates against schema', () => {
    for (const route of SURVEY_ROUTES) {
      for (const obs of route.obstacles) {
        const result = routeObstacleSchema.safeParse(obs)
        expect(result.success).toBe(true)
      }
    }
  })

  it('obstacle IDs are globally unique', () => {
    const allIds = SURVEY_ROUTES.flatMap((r) => r.obstacles.map((o) => o.id))
    expect(new Set(allIds).size).toBe(allIds.length)
  })

  it('each obstacle routeId points to existing route', () => {
    const routeIds = new Set(SURVEY_ROUTES.map((r) => r.id))
    for (const route of SURVEY_ROUTES) {
      for (const obs of route.obstacles) {
        expect(routeIds.has(obs.routeId)).toBe(true)
      }
    }
  })
})

describe('Obstacle type coverage per route', () => {
  it('each route has at least two different obstacle types', () => {
    for (const route of SURVEY_ROUTES) {
      const types = new Set(route.obstacles.map((o) => o.type))
      expect(types.size).toBeGreaterThanOrEqual(2)
    }
  })

  it('route A has height_limit and curve obstacles', () => {
    const routeA = SURVEY_ROUTES.find((r) => r.id.includes('urban'))
    expect(routeA).toBeDefined()
    const types = new Set(routeA!.obstacles.map((o) => o.type))
    expect(types.has('height_limit')).toBe(true)
    expect(types.has('curve')).toBe(true)
  })

  it('route B has bridge and narrow_section obstacles', () => {
    const routeB = SURVEY_ROUTES.find((r) => r.id.includes('industrial'))
    expect(routeB).toBeDefined()
    const types = new Set(routeB!.obstacles.map((o) => o.type))
    expect(types.has('bridge')).toBe(true)
    expect(types.has('narrow_section')).toBe(true)
  })

  it('route C has slope and bridge obstacles', () => {
    const routeC = SURVEY_ROUTES.find((r) => r.id.includes('mountain'))
    expect(routeC).toBeDefined()
    const types = new Set(routeC!.obstacles.map((o) => o.type))
    expect(types.has('slope')).toBe(true)
    expect(types.has('bridge')).toBe(true)
  })
})

describe('Global obstacle type coverage', () => {
  it('covers at least three obstacle types globally', () => {
    const allTypes = new Set(
      SURVEY_ROUTES.flatMap((r) => r.obstacles.map((o) => o.type)),
    )
    expect(allTypes.size).toBeGreaterThanOrEqual(3)
  })

  it('covers all five obstacle types', () => {
    const allTypes = new Set(
      SURVEY_ROUTES.flatMap((r) => r.obstacles.map((o) => o.type)),
    )
    for (const type of ROUTE_OBSTACLE_TYPES) {
      expect(allTypes.has(type)).toBe(true)
    }
  })
})

describe('validateSurveyRoutes', () => {
  it('valid routes pass validation', () => {
    const result = validateSurveyRoutes(SURVEY_ROUTES)
    expect(result.success).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('fails when fewer than 3 routes', () => {
    const result = validateSurveyRoutes(SURVEY_ROUTES.slice(0, 2))
    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('fails when route has only one obstacle type', () => {
    const badRoutes = SURVEY_ROUTES.map((r) => ({
      ...r,
      obstacles: r.obstacles.map((o) => ({ ...o, type: 'bridge' as const })),
    }))
    const result = validateSurveyRoutes(badRoutes)
    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('fails when route has only one obstacle type via validation', () => {
    const badRoutes = SURVEY_ROUTES.map((r) => ({
      ...r,
      obstacles: r.obstacles.map((o) => ({ ...o, type: 'bridge' as const })),
    }))
    const result = validateSurveyRoutes(badRoutes)
    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('fails when obstacle routeId mismatches', () => {
    const badRoutes = SURVEY_ROUTES.map((r) => ({
      ...r,
      obstacles: r.obstacles.map((o) => ({ ...o, routeId: 'wrong-id' })),
    }))
    const result = validateSurveyRoutes(badRoutes)
    expect(result.success).toBe(false)
    expect(result.errors.some((e) => e.includes('不匹配'))).toBe(true)
  })

  it('fails when route has fewer than 2 obstacles', () => {
    const badRoutes = SURVEY_ROUTES.map((r) => ({
      ...r,
      obstacles: [r.obstacles[0]],
    }))
    const result = validateSurveyRoutes(badRoutes)
    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('fails for empty input', () => {
    const result = validateSurveyRoutes([])
    expect(result.success).toBe(false)
  })

  it('fails for null input', () => {
    const result = validateSurveyRoutes(null)
    expect(result.success).toBe(false)
  })
})

describe('Helper functions', () => {
  it('getSurveyRouteById returns correct route', () => {
    const route = getSurveyRouteById(SURVEY_ROUTES, SURVEY_ROUTES[0].id)
    expect(route).toBeDefined()
    expect(route!.name).toBe(SURVEY_ROUTES[0].name)
  })

  it('getSurveyRouteById returns undefined for unknown id', () => {
    const route = getSurveyRouteById(SURVEY_ROUTES, 'nonexistent')
    expect(route).toBeUndefined()
  })

  it('getRouteObstaclesByRouteId returns obstacles', () => {
    const obstacles = getRouteObstaclesByRouteId(
      SURVEY_ROUTES,
      SURVEY_ROUTES[0].id,
    )
    expect(obstacles.length).toBeGreaterThanOrEqual(2)
  })

  it('getRouteObstaclesByRouteId returns empty for unknown route', () => {
    const obstacles = getRouteObstaclesByRouteId(SURVEY_ROUTES, 'nonexistent')
    expect(obstacles).toEqual([])
  })

  it('getObstacleTypeSummary returns type names', () => {
    const summary = getObstacleTypeSummary(SURVEY_ROUTES[0])
    expect(summary.length).toBeGreaterThan(0)
    expect(summary).toContain('限高')
  })
})
