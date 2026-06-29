import { create } from 'zustand'
import { z } from 'zod'
import { SURVEY_ROUTES } from '../../domain/surveyRouteData'
import type { SurveyRoute, RouteObstacle } from '../../domain/surveyRoutes'

const STORAGE_KEY = 'heavy-transport-sim:measurement-drafts:v1'

export const measurementDraftStatusSchema = z.enum([
  'unmeasured',
  'measured',
  'needs_review',
])

export const routeMeasurementDraftSchema = z.object({
  routeId: z.string().trim().min(1),
  obstacleId: z.string().trim().min(1),
  measurementType: z.enum([
    'height',
    'distance',
    'slope',
    'curve',
    'bridge',
    'visual_check',
  ]),
  status: measurementDraftStatusSchema,
  valueSummary: z.string().optional(),
  updatedAt: z.string().trim().min(1),
})

export type RouteMeasurementDraft = z.infer<typeof routeMeasurementDraftSchema>

export interface RouteSurveyNavigationState {
  currentRouteId: string
  selectedObstacleId: string | null
  sceneInstanceKey: number
  currentRoute: SurveyRoute | null
  currentObstacles: RouteObstacle[]
  measurementDrafts: Record<string, RouteMeasurementDraft[]>
  switchRoute: (routeId: string) => void
  selectObstacle: (obstacleId: string | null) => void
  upsertMeasurementDraft: (draft: RouteMeasurementDraft) => void
  getMeasurementDrafts: (routeId: string) => RouteMeasurementDraft[]
  getObstacleMeasurementStatus: (
    routeId: string,
    obstacleId: string,
  ) => 'unmeasured' | 'measured' | 'needs_review'
  reset: () => void
}

function loadDraftsFromStorage(): Record<string, RouteMeasurementDraft[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}
    const result: Record<string, RouteMeasurementDraft[]> = {}
    for (const [routeId, drafts] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (!Array.isArray(drafts)) continue
      const valid: RouteMeasurementDraft[] = []
      for (const d of drafts) {
        const r = routeMeasurementDraftSchema.safeParse(d)
        if (r.success) valid.push(r.data)
      }
      result[routeId] = valid
    }
    return result
  } catch {
    return {}
  }
}

function saveDraftsToStorage(
  drafts: Record<string, RouteMeasurementDraft[]>,
): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
  } catch {
    // Storage full or unavailable
  }
}

const defaultRouteId = SURVEY_ROUTES[0]?.id ?? ''

export const useRouteSurveyStore = create<RouteSurveyNavigationState>(
  (set, get) => ({
    currentRouteId: defaultRouteId,
    selectedObstacleId: null,
    sceneInstanceKey: 0,
    currentRoute: SURVEY_ROUTES[0] ?? null,
    currentObstacles: SURVEY_ROUTES[0]?.obstacles ?? [],
    measurementDrafts: loadDraftsFromStorage(),

    switchRoute: (routeId) => {
      const route = SURVEY_ROUTES.find((r) => r.id === routeId)
      if (!route) return
      set((state) => ({
        currentRouteId: routeId,
        selectedObstacleId: null,
        sceneInstanceKey: state.sceneInstanceKey + 1,
        currentRoute: route,
        currentObstacles: route.obstacles,
      }))
    },

    selectObstacle: (obstacleId) => {
      const state = get()
      if (obstacleId !== null) {
        const exists = state.currentObstacles.some((o) => o.id === obstacleId)
        if (!exists) return
      }
      set({ selectedObstacleId: obstacleId })
    },

    upsertMeasurementDraft: (draft) => {
      const parsed = routeMeasurementDraftSchema.safeParse(draft)
      if (!parsed.success) return
      set((state) => {
        const routeDrafts = [
          ...(state.measurementDrafts[parsed.data.routeId] ?? []),
        ]
        const idx = routeDrafts.findIndex(
          (d) => d.obstacleId === parsed.data.obstacleId,
        )
        if (idx >= 0) {
          routeDrafts[idx] = parsed.data
        } else {
          routeDrafts.push(parsed.data)
        }
        const newDrafts = {
          ...state.measurementDrafts,
          [parsed.data.routeId]: routeDrafts,
        }
        saveDraftsToStorage(newDrafts)
        return { measurementDrafts: newDrafts }
      })
    },

    getMeasurementDrafts: (routeId) => {
      return get().measurementDrafts[routeId] ?? []
    },

    getObstacleMeasurementStatus: (routeId, obstacleId) => {
      const drafts = get().measurementDrafts[routeId] ?? []
      const draft = drafts.find((d) => d.obstacleId === obstacleId)
      return draft?.status ?? 'unmeasured'
    },

    reset: () => {
      set({
        currentRouteId: defaultRouteId,
        selectedObstacleId: null,
        sceneInstanceKey: 0,
        currentRoute: SURVEY_ROUTES[0] ?? null,
        currentObstacles: SURVEY_ROUTES[0]?.obstacles ?? [],
        measurementDrafts: {},
      })
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // Ignore
      }
    },
  }),
)
