import { describe, it, expect } from 'vitest'
import {
  createHydraulicSupportDraft,
  generateSupportPointCandidates,
  selectHydraulicSupportPoint,
  undoHydraulicSupportPoint,
  removeHydraulicSupportPoint,
  resetHydraulicSupportSelection,
  mapSelectedPointsToHydraulicRegions,
  validateThreePointSelection,
  completeThreePointSelection,
  createHydraulicSupportOperationLog,
  getRegionPointStatus,
  getSelectionProgress,
  hydraulicSupportDraftSchema,
  hydraulicSupportPointSchema,
  hydraulicRegionSchema,
  hydraulicThreePointResultSchema,
  hydraulicSupportOperationLogSchema,
} from './hydraulicSupport'
import type { TrailerAssemblyResult } from './trailerAssembly'

// ── Mock trailer assembly result ─────────────────────────────────────

const mockResult: TrailerAssemblyResult = {
  id: 'ta-result-1',
  targetAxleLines: 6,
  targetColumns: 2,
  completedAxleLines: 6,
  completedColumns: 2,
  moduleCount: 10,
  connectionOrder: [
    '主纵列',
    '轴线 1',
    '轴线 2',
    '轴线 3',
    '纵列 2',
    '轴线 4',
    '轴线 5',
    '轴线 6',
    '牵引端连接',
    '纵列对齐检查',
  ],
  visualSummary: '6轴线 × 2纵列，共 10 个模块',
  readyForHydraulicPointSelection: true,
  teachingNote: '拼接完成。',
  completedAt: new Date().toISOString(),
}

// ── Schema imports ───────────────────────────────────────────────────

describe('Hydraulic support schemas', () => {
  it('hydraulicSupportDraftSchema can be imported', () => {
    expect(hydraulicSupportDraftSchema).toBeDefined()
  })

  it('hydraulicSupportPointSchema can be imported', () => {
    expect(hydraulicSupportPointSchema).toBeDefined()
  })

  it('hydraulicRegionSchema can be imported', () => {
    expect(hydraulicRegionSchema).toBeDefined()
  })

  it('hydraulicThreePointResultSchema can be imported', () => {
    expect(hydraulicThreePointResultSchema).toBeDefined()
  })

  it('hydraulicSupportOperationLogSchema can be imported', () => {
    expect(hydraulicSupportOperationLogSchema).toBeDefined()
  })
})

// ── Candidate generation ─────────────────────────────────────────────

describe('generateSupportPointCandidates', () => {
  it('can be imported', () => {
    expect(generateSupportPointCandidates).toBeDefined()
  })

  it('generates candidates from trailer assembly result', () => {
    const points = generateSupportPointCandidates(mockResult)
    expect(points.length).toBeGreaterThan(0)
  })

  it('candidates include regionId', () => {
    const points = generateSupportPointCandidates(mockResult)
    for (const p of points) {
      expect(['front_region', 'middle_region', 'rear_region']).toContain(
        p.regionId,
      )
    }
  })

  it('candidates have unique ids', () => {
    const points = generateSupportPointCandidates(mockResult)
    const ids = points.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('candidates include positionLabel', () => {
    const points = generateSupportPointCandidates(mockResult)
    for (const p of points) {
      expect(p.positionLabel.length).toBeGreaterThan(0)
    }
  })

  it('candidate count varies with trailer result', () => {
    const smallResult = { ...mockResult, targetAxleLines: 4, targetColumns: 1 }
    const largeResult = { ...mockResult, targetAxleLines: 12, targetColumns: 3 }
    const small = generateSupportPointCandidates(smallResult)
    const large = generateSupportPointCandidates(largeResult)
    expect(large.length).toBeGreaterThan(small.length)
  })
})

// ── Draft creation ───────────────────────────────────────────────────

describe('createHydraulicSupportDraft', () => {
  it('creates blocked draft without trailer result', () => {
    const draft = createHydraulicSupportDraft({})
    expect(draft.status).toBe('blocked')
    expect(draft.lastError?.code).toBe('trailer_assembly_required')
    expect(draft.candidatePoints).toHaveLength(0)
  })

  it('creates selecting draft with trailer result', () => {
    const draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    expect(draft.status).toBe('selecting')
    expect(draft.candidatePoints.length).toBeGreaterThan(0)
    expect(draft.selectedPoints).toHaveLength(0)
    expect(draft.regions).toHaveLength(3)
  })

  it('creates 3 default regions', () => {
    const draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const regionIds = draft.regions.map((r) => r.id)
    expect(regionIds).toContain('front_region')
    expect(regionIds).toContain('middle_region')
    expect(regionIds).toContain('rear_region')
  })
})

// ── Select support point ─────────────────────────────────────────────

describe('selectHydraulicSupportPoint', () => {
  it('can be imported', () => {
    expect(selectHydraulicSupportPoint).toBeDefined()
  })

  it('selects first point successfully', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const pointId = draft.candidatePoints[0].id
    const result = selectHydraulicSupportPoint(draft, pointId)
    draft = result.draft

    expect(result.error).toBeUndefined()
    expect(draft.selectedPoints).toHaveLength(1)
    expect(draft.status).toBe('selecting')
  })

  it('selects second point successfully', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })

    // Find points from different regions
    const frontPoint = draft.candidatePoints.find(
      (p) => p.regionId === 'front_region',
    )!
    const middlePoint = draft.candidatePoints.find(
      (p) => p.regionId === 'middle_region',
    )!

    draft = selectHydraulicSupportPoint(draft, frontPoint.id).draft
    draft = selectHydraulicSupportPoint(draft, middlePoint.id).draft

    expect(draft.selectedPoints).toHaveLength(2)
  })

  it('selects third point and status becomes completed', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })

    const frontPoint = draft.candidatePoints.find(
      (p) => p.regionId === 'front_region',
    )!
    const middlePoint = draft.candidatePoints.find(
      (p) => p.regionId === 'middle_region',
    )!
    const rearPoint = draft.candidatePoints.find(
      (p) => p.regionId === 'rear_region',
    )!

    draft = selectHydraulicSupportPoint(draft, frontPoint.id).draft
    draft = selectHydraulicSupportPoint(draft, middlePoint.id).draft
    draft = selectHydraulicSupportPoint(draft, rearPoint.id).draft

    expect(draft.selectedPoints).toHaveLength(3)
    expect(draft.status).toBe('completed')
  })

  it('rejects fourth point', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })

    // Select 3 points from different regions
    const frontPoint = draft.candidatePoints.find(
      (p) => p.regionId === 'front_region',
    )!
    const middlePoint = draft.candidatePoints.find(
      (p) => p.regionId === 'middle_region',
    )!
    const rearPoint = draft.candidatePoints.find(
      (p) => p.regionId === 'rear_region',
    )!

    draft = selectHydraulicSupportPoint(draft, frontPoint.id).draft
    draft = selectHydraulicSupportPoint(draft, middlePoint.id).draft
    draft = selectHydraulicSupportPoint(draft, rearPoint.id).draft

    // Try to select another front point
    const anotherFront = draft.candidatePoints.find(
      (p) => p.regionId === 'front_region' && p.id !== frontPoint.id,
    )
    if (anotherFront) {
      const result = selectHydraulicSupportPoint(draft, anotherFront.id)
      expect(result.error?.code).toBe('max_three_points_reached')
    }
  })

  it('rejects duplicate point selection', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const pointId = draft.candidatePoints[0].id
    draft = selectHydraulicSupportPoint(draft, pointId).draft
    const result = selectHydraulicSupportPoint(draft, pointId)
    expect(result.error?.code).toBe('point_already_selected')
  })

  it('rejects same region second point', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })

    const frontPoints = draft.candidatePoints.filter(
      (p) => p.regionId === 'front_region',
    )
    if (frontPoints.length >= 2) {
      draft = selectHydraulicSupportPoint(draft, frontPoints[0].id).draft
      const result = selectHydraulicSupportPoint(draft, frontPoints[1].id)
      expect(result.error?.code).toBe('region_already_has_point')
    }
  })

  it('rejects selection on blocked draft', () => {
    const draft = createHydraulicSupportDraft({})
    const result = selectHydraulicSupportPoint(draft, 'any-id')
    expect(result.error?.code).toBe('trailer_assembly_required')
  })
})

// ── Undo support point ───────────────────────────────────────────────

describe('undoHydraulicSupportPoint', () => {
  it('can be imported', () => {
    expect(undoHydraulicSupportPoint).toBeDefined()
  })

  it('undoes last selected point', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const pointId = draft.candidatePoints[0].id
    draft = selectHydraulicSupportPoint(draft, pointId).draft
    expect(draft.selectedPoints).toHaveLength(1)

    const undoResult = undoHydraulicSupportPoint(draft)
    draft = undoResult.draft
    expect(draft.selectedPoints).toHaveLength(0)
    expect(draft.status).toBe('selecting')
  })

  it('undo clears region selectedPointId', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const frontPoint = draft.candidatePoints.find(
      (p) => p.regionId === 'front_region',
    )!
    draft = selectHydraulicSupportPoint(draft, frontPoint.id).draft

    // Region should have point
    const regionBefore = draft.regions.find((r) => r.id === 'front_region')!
    expect(regionBefore.selectedPointId).toBe(frontPoint.id)

    // Undo
    draft = undoHydraulicSupportPoint(draft).draft
    const regionAfter = draft.regions.find((r) => r.id === 'front_region')!
    expect(regionAfter.selectedPointId).toBeUndefined()
  })

  it('undo on empty selection returns error', () => {
    const draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const result = undoHydraulicSupportPoint(draft)
    expect(result.error?.code).toBe('three_points_required')
  })
})

// ── Remove specific point ────────────────────────────────────────────

describe('removeHydraulicSupportPoint', () => {
  it('removes specific point by id', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const frontPoint = draft.candidatePoints.find(
      (p) => p.regionId === 'front_region',
    )!
    const middlePoint = draft.candidatePoints.find(
      (p) => p.regionId === 'middle_region',
    )!

    draft = selectHydraulicSupportPoint(draft, frontPoint.id).draft
    draft = selectHydraulicSupportPoint(draft, middlePoint.id).draft
    expect(draft.selectedPoints).toHaveLength(2)

    draft = removeHydraulicSupportPoint(draft, frontPoint.id).draft
    expect(draft.selectedPoints).toHaveLength(1)
    expect(draft.selectedPoints[0].id).toBe(middlePoint.id)
  })
})

// ── Reset ────────────────────────────────────────────────────────────

describe('resetHydraulicSupportSelection', () => {
  it('resets all selected points', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const pointId = draft.candidatePoints[0].id
    draft = selectHydraulicSupportPoint(draft, pointId).draft

    draft = resetHydraulicSupportSelection(draft).draft
    expect(draft.selectedPoints).toHaveLength(0)
    expect(draft.status).toBe('selecting')
  })

  it('resets region selectedPointId', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const frontPoint = draft.candidatePoints.find(
      (p) => p.regionId === 'front_region',
    )!
    draft = selectHydraulicSupportPoint(draft, frontPoint.id).draft
    draft = resetHydraulicSupportSelection(draft).draft

    for (const region of draft.regions) {
      expect(region.selectedPointId).toBeUndefined()
    }
  })
})

// ── Region mapping ───────────────────────────────────────────────────

describe('mapSelectedPointsToHydraulicRegions', () => {
  it('maps points to regions correctly', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const frontPoint = draft.candidatePoints.find(
      (p) => p.regionId === 'front_region',
    )!
    draft = selectHydraulicSupportPoint(draft, frontPoint.id).draft

    const regions = mapSelectedPointsToHydraulicRegions(draft)
    const frontRegion = regions.find((r) => r.id === 'front_region')!
    expect(frontRegion.selectedPointId).toBe(frontPoint.id)

    const middleRegion = regions.find((r) => r.id === 'middle_region')!
    expect(middleRegion.selectedPointId).toBeUndefined()
  })
})

// ── Validation ───────────────────────────────────────────────────────

describe('validateThreePointSelection', () => {
  it('fails for blocked draft', () => {
    const draft = createHydraulicSupportDraft({})
    const result = validateThreePointSelection(draft)
    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('trailer_assembly_required')
  })

  it('fails when less than 3 points selected', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const pointId = draft.candidatePoints[0].id
    draft = selectHydraulicSupportPoint(draft, pointId).draft
    const result = validateThreePointSelection(draft)
    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('three_points_required')
  })

  it('passes when 3 points cover all regions', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const frontPoint = draft.candidatePoints.find(
      (p) => p.regionId === 'front_region',
    )!
    const middlePoint = draft.candidatePoints.find(
      (p) => p.regionId === 'middle_region',
    )!
    const rearPoint = draft.candidatePoints.find(
      (p) => p.regionId === 'rear_region',
    )!

    draft = selectHydraulicSupportPoint(draft, frontPoint.id).draft
    draft = selectHydraulicSupportPoint(draft, middlePoint.id).draft
    draft = selectHydraulicSupportPoint(draft, rearPoint.id).draft

    const result = validateThreePointSelection(draft)
    expect(result.valid).toBe(true)
  })
})

// ── Complete ─────────────────────────────────────────────────────────

describe('completeThreePointSelection', () => {
  it('generates result with 3 points and 3 regions', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const frontPoint = draft.candidatePoints.find(
      (p) => p.regionId === 'front_region',
    )!
    const middlePoint = draft.candidatePoints.find(
      (p) => p.regionId === 'middle_region',
    )!
    const rearPoint = draft.candidatePoints.find(
      (p) => p.regionId === 'rear_region',
    )!

    draft = selectHydraulicSupportPoint(draft, frontPoint.id).draft
    draft = selectHydraulicSupportPoint(draft, middlePoint.id).draft
    draft = selectHydraulicSupportPoint(draft, rearPoint.id).draft

    const { result } = completeThreePointSelection(draft)
    expect(result.pointCount).toBe(3)
    expect(result.regionCount).toBe(3)
    expect(result.completed).toBe(true)
    expect(result.readyForValveCircuitStep).toBe(true)
    expect(result.teachingNote).toContain('Day75')
  })
})

// ── Operation log ────────────────────────────────────────────────────

describe('Hydraulic support operation log', () => {
  it('creates log with required fields', () => {
    const log = createHydraulicSupportOperationLog({
      draftId: 'draft-1',
      action: 'select_support_point',
      resultStatus: 'selecting',
      message: '已选择支撑点。',
    })
    expect(log.id).toBeDefined()
    expect(log.draftId).toBe('draft-1')
    expect(log.action).toBe('select_support_point')
    expect(log.createdAt).toBeDefined()
  })

  it('selectHydraulicSupportPoint produces log', () => {
    const draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const pointId = draft.candidatePoints[0].id
    const result = selectHydraulicSupportPoint(draft, pointId)
    expect(result.log.action).toBe('select_support_point')
  })

  it('error selection produces error log', () => {
    const draft = createHydraulicSupportDraft({})
    const result = selectHydraulicSupportPoint(draft, 'any')
    expect(result.log.action).toBe('selection_error')
    expect(result.log.errorCode).toBeDefined()
  })

  it('undo produces undo log', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    draft = selectHydraulicSupportPoint(
      draft,
      draft.candidatePoints[0].id,
    ).draft
    const result = undoHydraulicSupportPoint(draft)
    expect(result.log.action).toBe('undo_support_point')
  })

  it('reset produces reset log', () => {
    const draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const result = resetHydraulicSupportSelection(draft)
    expect(result.log.action).toBe('reset_support_selection')
  })
})

// ── Visual helpers ───────────────────────────────────────────────────

describe('Visual helpers', () => {
  it('getRegionPointStatus returns selected for filled region', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const frontPoint = draft.candidatePoints.find(
      (p) => p.regionId === 'front_region',
    )!
    draft = selectHydraulicSupportPoint(draft, frontPoint.id).draft

    const status = getRegionPointStatus(draft, 'front_region')
    expect(status.selected).toBe(true)
    expect(status.point?.id).toBe(frontPoint.id)
  })

  it('getRegionPointStatus returns not selected for empty region', () => {
    const draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const status = getRegionPointStatus(draft, 'middle_region')
    expect(status.selected).toBe(false)
  })

  it('getSelectionProgress shows correct count', () => {
    let draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    expect(getSelectionProgress(draft).label).toBe('0/3')

    draft = selectHydraulicSupportPoint(
      draft,
      draft.candidatePoints[0].id,
    ).draft
    expect(getSelectionProgress(draft).label).toBe('1/3')
  })
})

// ── Three regions always present ─────────────────────────────────────

describe('Hydraulic regions', () => {
  it('always 3 regions in draft', () => {
    const draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    expect(draft.regions).toHaveLength(3)
  })

  it('regions have unique ids', () => {
    const draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    const ids = draft.regions.map((r) => r.id)
    expect(new Set(ids).size).toBe(3)
  })

  it('regions have names and descriptions', () => {
    const draft = createHydraulicSupportDraft({
      trailerAssemblyResult: mockResult,
    })
    for (const r of draft.regions) {
      expect(r.name.length).toBeGreaterThan(0)
      expect(r.description.length).toBeGreaterThan(0)
    }
  })
})
