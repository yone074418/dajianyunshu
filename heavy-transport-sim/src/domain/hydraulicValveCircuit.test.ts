import { describe, it, expect } from 'vitest'
import {
  createHydraulicValveCircuitDraft,
  createValvesFromHydraulicRegions,
  toggleHydraulicValve,
  calculateRegionCircuitState,
  calculateOverallCircuitState,
  validateHydraulicValveCircuitDraft,
  resetHydraulicValves,
  createHydraulicValveOperationLog,
  getOverallStateDisplayText,
  getValveStateDisplayText,
  getCircuitStateDisplayText,
  hydraulicValveCircuitDraftSchema,
  hydraulicValveSchema,
  hydraulicCircuitRegionSchema,
  hydraulicValveOperationLogSchema,
  type HydraulicCircuitRegion,
} from './hydraulicValveCircuit'
import type {
  HydraulicRegion,
  HydraulicThreePointResult,
} from './hydraulicSupport'

// ── Mock data ────────────────────────────────────────────────────────

const mockThreePointResult: HydraulicThreePointResult = {
  id: 'hs-result-1',
  selectedPoints: [
    {
      id: 'sp-1',
      label: '支撑点 1',
      regionId: 'front_region',
      columnIndex: 0,
      axleIndex: 0,
      positionLabel: '纵列 1 · 轴线 1',
    },
    {
      id: 'sp-2',
      label: '支撑点 2',
      regionId: 'middle_region',
      columnIndex: 0,
      axleIndex: 1,
      positionLabel: '纵列 1 · 轴线 2',
    },
    {
      id: 'sp-3',
      label: '支撑点 3',
      regionId: 'rear_region',
      columnIndex: 1,
      axleIndex: 2,
      positionLabel: '纵列 2 · 轴线 3',
    },
  ],
  regions: [
    {
      id: 'front_region',
      name: '前部液压区域',
      description: '前部',
      selectedPointId: 'sp-1',
    },
    {
      id: 'middle_region',
      name: '中部液压区域',
      description: '中部',
      selectedPointId: 'sp-2',
    },
    {
      id: 'rear_region',
      name: '后部液压区域',
      description: '后部',
      selectedPointId: 'sp-3',
    },
  ],
  pointCount: 3,
  regionCount: 3,
  completed: true,
  visualSummary: '3 个支撑点覆盖 3 处液压区域。',
  readyForValveCircuitStep: true,
  teachingNote: '三点编点完成。',
  completedAt: new Date().toISOString(),
}

const mockBaseRegions: HydraulicRegion[] = [
  {
    id: 'front_region',
    name: '前部液压区域',
    description: '前部',
    selectedPointId: 'sp-1',
  },
  {
    id: 'middle_region',
    name: '中部液压区域',
    description: '中部',
    selectedPointId: 'sp-2',
  },
  {
    id: 'rear_region',
    name: '后部液压区域',
    description: '后部',
    selectedPointId: 'sp-3',
  },
]

// ── Schema imports ───────────────────────────────────────────────────

describe('Hydraulic valve circuit schemas', () => {
  it('hydraulicValveCircuitDraftSchema can be imported', () => {
    expect(hydraulicValveCircuitDraftSchema).toBeDefined()
  })

  it('hydraulicValveSchema can be imported', () => {
    expect(hydraulicValveSchema).toBeDefined()
  })

  it('hydraulicCircuitRegionSchema can be imported', () => {
    expect(hydraulicCircuitRegionSchema).toBeDefined()
  })

  it('hydraulicValveOperationLogSchema can be imported', () => {
    expect(hydraulicValveOperationLogSchema).toBeDefined()
  })
})

// ── Valve generation ─────────────────────────────────────────────────

describe('createValvesFromHydraulicRegions', () => {
  it('can be imported', () => {
    expect(createValvesFromHydraulicRegions).toBeDefined()
  })

  it('generates 3 valves from 3 regions', () => {
    const valves = createValvesFromHydraulicRegions(mockBaseRegions)
    expect(valves).toHaveLength(3)
  })

  it('each valve maps to a region', () => {
    const valves = createValvesFromHydraulicRegions(mockBaseRegions)
    for (const valve of valves) {
      expect(mockBaseRegions.some((r) => r.id === valve.regionId)).toBe(true)
    }
  })

  it('valves have unique ids', () => {
    const valves = createValvesFromHydraulicRegions(mockBaseRegions)
    const ids = valves.map((v) => v.id)
    expect(new Set(ids).size).toBe(3)
  })

  it('valves default to closed', () => {
    const valves = createValvesFromHydraulicRegions(mockBaseRegions)
    for (const v of valves) {
      expect(v.state).toBe('closed')
    }
  })
})

// ── Circuit state calculation ────────────────────────────────────────

describe('calculateRegionCircuitState', () => {
  it('open valve -> connected', () => {
    expect(calculateRegionCircuitState('open')).toBe('connected')
  })

  it('closed valve -> disconnected', () => {
    expect(calculateRegionCircuitState('closed')).toBe('disconnected')
  })
})

describe('calculateOverallCircuitState', () => {
  it('all connected when all regions connected', () => {
    const regions = [
      { id: 'front_region', circuitState: 'connected' },
      { id: 'middle_region', circuitState: 'connected' },
      { id: 'rear_region', circuitState: 'connected' },
    ]
    expect(
      calculateOverallCircuitState(
        regions as unknown as HydraulicCircuitRegion[],
      ),
    ).toBe('all_connected')
  })

  it('all disconnected when all regions disconnected', () => {
    const regions = [
      { id: 'front_region', circuitState: 'disconnected' },
      { id: 'middle_region', circuitState: 'disconnected' },
      { id: 'rear_region', circuitState: 'disconnected' },
    ]
    expect(
      calculateOverallCircuitState(
        regions as unknown as HydraulicCircuitRegion[],
      ),
    ).toBe('all_disconnected')
  })

  it('partially connected when some connected', () => {
    const regions = [
      { id: 'front_region', circuitState: 'connected' },
      { id: 'middle_region', circuitState: 'disconnected' },
      { id: 'rear_region', circuitState: 'disconnected' },
    ]
    expect(
      calculateOverallCircuitState(
        regions as unknown as HydraulicCircuitRegion[],
      ),
    ).toBe('partially_connected')
  })

  it('blocked when empty', () => {
    expect(calculateOverallCircuitState([])).toBe('blocked')
  })
})

// ── Draft creation ───────────────────────────────────────────────────

describe('createHydraulicValveCircuitDraft', () => {
  it('creates blocked draft without three point result', () => {
    const draft = createHydraulicValveCircuitDraft({})
    expect(draft.status).toBe('blocked')
    expect(draft.lastError?.code).toBe('three_point_selection_required')
    expect(draft.valves).toHaveLength(0)
  })

  it('creates ready draft with three point result', () => {
    const draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    expect(draft.status).toBe('ready')
    expect(draft.valves).toHaveLength(3)
    expect(draft.regions).toHaveLength(3)
  })

  it('valves and regions have same count', () => {
    const draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    expect(draft.valves.length).toBe(draft.regions.length)
  })

  it('all valves default to closed', () => {
    const draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    for (const v of draft.valves) {
      expect(v.state).toBe('closed')
    }
  })

  it('overall state is all_disconnected when all valves closed', () => {
    const draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    expect(draft.overallState).toBe('all_disconnected')
  })
})

// ── Toggle valve ─────────────────────────────────────────────────────

describe('toggleHydraulicValve', () => {
  it('can be imported', () => {
    expect(toggleHydraulicValve).toBeDefined()
  })

  it('opens a closed valve', () => {
    let draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    const valveId = draft.valves[0].id
    const result = toggleHydraulicValve(draft, valveId)
    draft = result.draft

    expect(result.error).toBeUndefined()
    expect(draft.valves[0].state).toBe('open')
    expect(draft.regions[0].valveState).toBe('open')
    expect(draft.regions[0].circuitState).toBe('connected')
  })

  it('closes an open valve', () => {
    let draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    const valveId = draft.valves[0].id
    draft = toggleHydraulicValve(draft, valveId).draft
    draft = toggleHydraulicValve(draft, valveId).draft

    expect(draft.valves[0].state).toBe('closed')
    expect(draft.regions[0].circuitState).toBe('disconnected')
  })

  it('rejects toggle on blocked draft', () => {
    const draft = createHydraulicValveCircuitDraft({})
    const result = toggleHydraulicValve(draft, 'any')
    expect(result.error?.code).toBe('three_point_selection_required')
  })

  it('rejects non-existent valve', () => {
    const draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    const result = toggleHydraulicValve(draft, 'non-existent')
    expect(result.error?.code).toBe('valve_not_found')
  })

  it('region display updates when valve toggled', () => {
    let draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    const valveId = draft.valves[0].id
    draft = toggleHydraulicValve(draft, valveId).draft

    expect(draft.regions[0].displayText).toContain('连通')
    expect(draft.regions[0].displayText).toContain('开启')
  })
})

// ── Three valves all open -> all_connected ───────────────────────────

describe('Three valves all open', () => {
  it('all_connected when all three valves open', () => {
    let draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    for (const valve of draft.valves) {
      draft = toggleHydraulicValve(draft, valve.id).draft
    }
    expect(draft.overallState).toBe('all_connected')
  })
})

// ── Partial open -> partially_connected ──────────────────────────────

describe('Partial valve open', () => {
  it('partially_connected when 1 of 3 valves open', () => {
    let draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    draft = toggleHydraulicValve(draft, draft.valves[0].id).draft
    expect(draft.overallState).toBe('partially_connected')
  })

  it('partially_connected when 2 of 3 valves open', () => {
    let draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    draft = toggleHydraulicValve(draft, draft.valves[0].id).draft
    draft = toggleHydraulicValve(draft, draft.valves[1].id).draft
    expect(draft.overallState).toBe('partially_connected')
  })
})

// ── All closed -> all_disconnected ───────────────────────────────────

describe('All valves closed', () => {
  it('all_disconnected when all closed', () => {
    const draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    expect(draft.overallState).toBe('all_disconnected')
  })
})

// ── Region-valve mismatch validation ─────────────────────────────────

describe('Region-valve mismatch', () => {
  it('validates valve state matches region valveState', () => {
    let draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    // Open front valve
    draft = toggleHydraulicValve(draft, draft.valves[0].id).draft
    // Tamper: set region valveState to closed while valve is open
    const tampered = {
      ...draft,
      regions: draft.regions.map((r, i) =>
        i === 0 ? { ...r, valveState: 'closed' as const } : r,
      ),
    }
    const result = validateHydraulicValveCircuitDraft(tampered)
    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('region_valve_mismatch')
  })
})

// ── Reset ────────────────────────────────────────────────────────────

describe('resetHydraulicValves', () => {
  it('resets all valves to closed', () => {
    let draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    // Open all
    for (const valve of draft.valves) {
      draft = toggleHydraulicValve(draft, valve.id).draft
    }
    expect(draft.overallState).toBe('all_connected')

    // Reset
    draft = resetHydraulicValves(draft).draft
    for (const v of draft.valves) {
      expect(v.state).toBe('closed')
    }
    expect(draft.overallState).toBe('all_disconnected')
  })

  it('reset produces log', () => {
    const draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    const result = resetHydraulicValves(draft)
    expect(result.log.action).toBe('reset_valves')
  })
})

// ── Operation log ────────────────────────────────────────────────────

describe('Hydraulic valve operation log', () => {
  it('creates log with required fields', () => {
    const log = createHydraulicValveOperationLog({
      draftId: 'draft-1',
      action: 'open_valve',
      message: '打开前部阀门。',
    })
    expect(log.id).toBeDefined()
    expect(log.draftId).toBe('draft-1')
    expect(log.action).toBe('open_valve')
    expect(log.createdAt).toBeDefined()
  })

  it('toggle produces open_valve log', () => {
    const draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    const result = toggleHydraulicValve(draft, draft.valves[0].id)
    expect(result.log.action).toBe('open_valve')
  })

  it('toggle produces close_valve log', () => {
    let draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    draft = toggleHydraulicValve(draft, draft.valves[0].id).draft
    const result = toggleHydraulicValve(draft, draft.valves[0].id)
    expect(result.log.action).toBe('close_valve')
  })

  it('error produces valve_error log', () => {
    const draft = createHydraulicValveCircuitDraft({})
    const result = toggleHydraulicValve(draft, 'any')
    expect(result.log.action).toBe('valve_error')
    expect(result.log.errorCode).toBeDefined()
  })
})

// ── Validation ───────────────────────────────────────────────────────

describe('validateHydraulicValveCircuitDraft', () => {
  it('fails for blocked draft', () => {
    const draft = createHydraulicValveCircuitDraft({})
    const result = validateHydraulicValveCircuitDraft(draft)
    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('three_point_selection_required')
  })

  it('passes for valid draft with all valves closed', () => {
    const draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    const result = validateHydraulicValveCircuitDraft(draft)
    expect(result.valid).toBe(true)
  })

  it('passes for valid draft with some valves open', () => {
    let draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    draft = toggleHydraulicValve(draft, draft.valves[0].id).draft
    const result = validateHydraulicValveCircuitDraft(draft)
    expect(result.valid).toBe(true)
  })
})

// ── Display helpers ──────────────────────────────────────────────────

describe('Display helpers', () => {
  it('getOverallStateDisplayText returns text', () => {
    expect(getOverallStateDisplayText('all_connected')).toContain('全部连通')
    expect(getOverallStateDisplayText('all_disconnected')).toContain('全部断开')
    expect(getOverallStateDisplayText('partially_connected')).toContain(
      '部分连通',
    )
    expect(getOverallStateDisplayText('blocked')).toContain('阻断')
  })

  it('getValveStateDisplayText returns Chinese', () => {
    expect(getValveStateDisplayText('open')).toBe('开启')
    expect(getValveStateDisplayText('closed')).toBe('关闭')
  })

  it('getCircuitStateDisplayText returns Chinese', () => {
    expect(getCircuitStateDisplayText('connected')).toBe('连通')
    expect(getCircuitStateDisplayText('disconnected')).toBe('未连通')
  })
})

// ── Consistency checks ───────────────────────────────────────────────

describe('Valve-region consistency', () => {
  it('valveState matches valve.state after toggle', () => {
    let draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    draft = toggleHydraulicValve(draft, draft.valves[0].id).draft

    expect(draft.regions[0].valveState).toBe(draft.valves[0].state)
  })

  it('circuitState matches calculateRegionCircuitState', () => {
    let draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    draft = toggleHydraulicValve(draft, draft.valves[1].id).draft

    for (const region of draft.regions) {
      expect(region.circuitState).toBe(
        calculateRegionCircuitState(region.valveState),
      )
    }
  })

  it('overallState matches calculateOverallCircuitState', () => {
    let draft = createHydraulicValveCircuitDraft({
      threePointResult: mockThreePointResult,
    })
    draft = toggleHydraulicValve(draft, draft.valves[0].id).draft

    expect(draft.overallState).toBe(calculateOverallCircuitState(draft.regions))
  })
})
