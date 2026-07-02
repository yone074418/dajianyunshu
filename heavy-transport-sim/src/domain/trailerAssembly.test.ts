import { describe, it, expect } from 'vitest'
import {
  createTrailerAssemblyDraft,
  validateTrailerAssemblyDraft,
  validateTrailerAssemblyStep,
  validateTrailerAssemblySequence,
  applyTrailerAssemblyStep,
  completeTrailerAssemblyDraft,
  resetTrailerAssemblyDraft,
  createTrailerAssemblyOperationLog,
  trailerAssemblyDraftSchema,
  trailerAssemblyModuleSchema,
  trailerAssemblyErrorSchema,
  trailerAssemblyResultSchema,
  trailerAssemblyStepSchema,
  trailerAssemblyOperationLogSchema,
  getColumnLayouts,
  hasTractorConnector,
  hasAlignmentMarker,
  type TrailerAssemblyStep,
} from './trailerAssembly'

// ── Schema imports ───────────────────────────────────────────────────

describe('Trailer assembly schemas', () => {
  it('trailerAssemblyDraftSchema can be imported', () => {
    expect(trailerAssemblyDraftSchema).toBeDefined()
  })

  it('trailerAssemblyModuleSchema can be imported', () => {
    expect(trailerAssemblyModuleSchema).toBeDefined()
  })

  it('trailerAssemblyErrorSchema can be imported', () => {
    expect(trailerAssemblyErrorSchema).toBeDefined()
  })

  it('trailerAssemblyResultSchema can be imported', () => {
    expect(trailerAssemblyResultSchema).toBeDefined()
  })

  it('trailerAssemblyStepSchema can be imported', () => {
    expect(trailerAssemblyStepSchema).toBeDefined()
  })

  it('trailerAssemblyOperationLogSchema can be imported', () => {
    expect(trailerAssemblyOperationLogSchema).toBeDefined()
  })
})

// ── Draft creation ───────────────────────────────────────────────────

describe('createTrailerAssemblyDraft', () => {
  it('creates a draft with empty status', () => {
    const draft = createTrailerAssemblyDraft({
      targetAxleLines: 6,
      targetColumns: 2,
    })
    expect(draft.status).toBe('empty')
    expect(draft.targetAxleLines).toBe(6)
    expect(draft.targetColumns).toBe(2)
    expect(draft.currentAxleLines).toBe(0)
    expect(draft.currentColumns).toBe(0)
    expect(draft.placedModules).toHaveLength(0)
  })

  it('accepts optional routeId and sourceRequirementId', () => {
    const draft = createTrailerAssemblyDraft({
      targetAxleLines: 8,
      targetColumns: 1,
      routeId: 'route-1',
      sourceRequirementId: 'req-1',
    })
    expect(draft.routeId).toBe('route-1')
    expect(draft.sourceRequirementId).toBe('req-1')
  })
})

// ── Validation: combination rules ────────────────────────────────────

describe('validateTrailerAssemblyDraft', () => {
  it('allows legal 6×2 combination', () => {
    const draft = createTrailerAssemblyDraft({
      targetAxleLines: 6,
      targetColumns: 2,
    })
    const result = validateTrailerAssemblyDraft(draft)
    expect(result.valid).toBe(true)
  })

  it('allows legal 4×1 combination', () => {
    const draft = createTrailerAssemblyDraft({
      targetAxleLines: 4,
      targetColumns: 1,
    })
    const result = validateTrailerAssemblyDraft(draft)
    expect(result.valid).toBe(true)
  })

  it('rejects illegal 4×2 combination', () => {
    const draft = createTrailerAssemblyDraft({
      targetAxleLines: 4,
      targetColumns: 2,
    })
    const result = validateTrailerAssemblyDraft(draft)
    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('invalid_combination')
  })

  it('rejects illegal 10×1 combination', () => {
    const draft = createTrailerAssemblyDraft({
      targetAxleLines: 10,
      targetColumns: 1,
    })
    const result = validateTrailerAssemblyDraft(draft)
    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('invalid_combination')
  })

  it('rejects illegal 16×1 combination', () => {
    const draft = createTrailerAssemblyDraft({
      targetAxleLines: 16,
      targetColumns: 1,
    })
    const result = validateTrailerAssemblyDraft(draft)
    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('invalid_combination')
  })

  it('allows legal 12×3 combination', () => {
    const draft = createTrailerAssemblyDraft({
      targetAxleLines: 12,
      targetColumns: 3,
    })
    const result = validateTrailerAssemblyDraft(draft)
    expect(result.valid).toBe(true)
  })

  it('rejects non-positive targetAxleLines', () => {
    const draft = createTrailerAssemblyDraft({
      targetAxleLines: 0,
      targetColumns: 1,
    })
    draft.targetAxleLines = 0 as unknown as number
    const result = validateTrailerAssemblyDraft(draft)
    expect(result.valid).toBe(false)
  })
})

// ── Step validation: missing target ──────────────────────────────────

describe('validateTrailerAssemblyStep - missing target', () => {
  it('rejects add_axle_module when no target selected', () => {
    const draft = createTrailerAssemblyDraft({
      targetAxleLines: 6,
      targetColumns: 1,
    })
    // status is 'empty' - no select_target_configuration step yet
    const step: TrailerAssemblyStep = {
      id: 's1',
      stepType: 'add_axle_module',
      createdAt: new Date().toISOString(),
    }
    const result = validateTrailerAssemblyStep(draft, step)
    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('missing_target_configuration')
  })
})

// ── Step validation: main column order ───────────────────────────────

describe('validateTrailerAssemblyStep - column order', () => {
  it('rejects add_side_column before place_main_column', () => {
    let draft = createTrailerAssemblyDraft({
      targetAxleLines: 6,
      targetColumns: 2,
    })
    // Select target configuration first
    const selectResult = applyTrailerAssemblyStep(draft, {
      id: 's1',
      stepType: 'select_target_configuration',
      createdAt: new Date().toISOString(),
    })
    draft = selectResult.draft

    // Try to add side column without main column
    const step: TrailerAssemblyStep = {
      id: 's2',
      stepType: 'add_side_column',
      createdAt: new Date().toISOString(),
    }
    const result = validateTrailerAssemblyStep(draft, step)
    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('main_column_required_first')
  })

  it('rejects add_side_column before main column axles completed', () => {
    let draft = createTrailerAssemblyDraft({
      targetAxleLines: 6,
      targetColumns: 2,
    })
    // Select target
    draft = applyTrailerAssemblyStep(draft, {
      id: 's1',
      stepType: 'select_target_configuration',
      createdAt: new Date().toISOString(),
    }).draft
    // Place main column
    draft = applyTrailerAssemblyStep(draft, {
      id: 's2',
      stepType: 'place_main_column',
      createdAt: new Date().toISOString(),
    }).draft

    // Try to add side column before filling main column axles
    const step: TrailerAssemblyStep = {
      id: 's3',
      stepType: 'add_side_column',
      createdAt: new Date().toISOString(),
    }
    const result = validateTrailerAssemblyStep(draft, step)
    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('axle_order_invalid')
  })
})

// ── Step validation: target exceeded ─────────────────────────────────

describe('validateTrailerAssemblyStep - target exceeded', () => {
  it('rejects add_axle_module when target reached', () => {
    let draft = createTrailerAssemblyDraft({
      targetAxleLines: 4,
      targetColumns: 1,
    })
    draft = applyTrailerAssemblyStep(draft, {
      id: 's1',
      stepType: 'select_target_configuration',
      createdAt: new Date().toISOString(),
    }).draft
    draft = applyTrailerAssemblyStep(draft, {
      id: 's2',
      stepType: 'place_main_column',
      createdAt: new Date().toISOString(),
    }).draft
    // Add 4 axle modules
    for (let i = 0; i < 4; i++) {
      draft = applyTrailerAssemblyStep(draft, {
        id: `s${3 + i}`,
        stepType: 'add_axle_module',
        columnIndex: 0,
        createdAt: new Date().toISOString(),
      }).draft
    }

    // Try to add 5th axle
    const step: TrailerAssemblyStep = {
      id: 's7',
      stepType: 'add_axle_module',
      columnIndex: 0,
      createdAt: new Date().toISOString(),
    }
    const result = validateTrailerAssemblyStep(draft, step)
    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('target_exceeded')
  })
})

// ── Step validation: complete assembly requires tractor connector ────

describe('validateTrailerAssemblyStep - complete', () => {
  it('rejects complete_assembly without tractor connector', () => {
    let draft = createTrailerAssemblyDraft({
      targetAxleLines: 4,
      targetColumns: 1,
    })
    draft = applyTrailerAssemblyStep(draft, {
      id: 's1',
      stepType: 'select_target_configuration',
      createdAt: new Date().toISOString(),
    }).draft
    draft = applyTrailerAssemblyStep(draft, {
      id: 's2',
      stepType: 'place_main_column',
      createdAt: new Date().toISOString(),
    }).draft
    for (let i = 0; i < 4; i++) {
      draft = applyTrailerAssemblyStep(draft, {
        id: `s${3 + i}`,
        stepType: 'add_axle_module',
        columnIndex: 0,
        createdAt: new Date().toISOString(),
      }).draft
    }

    const step: TrailerAssemblyStep = {
      id: 's7',
      stepType: 'complete_assembly',
      createdAt: new Date().toISOString(),
    }
    const result = validateTrailerAssemblyStep(draft, step)
    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('tractor_connector_missing')
  })
})

// ── Correct sequence: full assembly ──────────────────────────────────

describe('Correct assembly sequence', () => {
  it('completes 4×1 assembly successfully', () => {
    let draft = createTrailerAssemblyDraft({
      targetAxleLines: 4,
      targetColumns: 1,
    })

    // 1. Select target
    draft = applyTrailerAssemblyStep(draft, {
      id: 's1',
      stepType: 'select_target_configuration',
      createdAt: new Date().toISOString(),
    }).draft
    expect(draft.status).toBe('in_progress')

    // 2. Place main column
    draft = applyTrailerAssemblyStep(draft, {
      id: 's2',
      stepType: 'place_main_column',
      createdAt: new Date().toISOString(),
    }).draft
    expect(draft.currentColumns).toBe(1)

    // 3. Add 4 axle modules
    for (let i = 0; i < 4; i++) {
      draft = applyTrailerAssemblyStep(draft, {
        id: `s${3 + i}`,
        stepType: 'add_axle_module',
        columnIndex: 0,
        createdAt: new Date().toISOString(),
      }).draft
    }
    expect(draft.currentAxleLines).toBe(4)

    // 4. Connect tractor end
    draft = applyTrailerAssemblyStep(draft, {
      id: 's7',
      stepType: 'connect_tractor_end',
      createdAt: new Date().toISOString(),
    }).draft

    // 5. Align columns
    draft = applyTrailerAssemblyStep(draft, {
      id: 's8',
      stepType: 'align_columns',
      createdAt: new Date().toISOString(),
    }).draft

    // 6. Complete
    const result = applyTrailerAssemblyStep(draft, {
      id: 's9',
      stepType: 'complete_assembly',
      createdAt: new Date().toISOString(),
    })
    draft = result.draft

    expect(draft.status).toBe('completed')
    expect(draft.result).toBeDefined()
    expect(draft.result!.targetAxleLines).toBe(4)
    expect(draft.result!.targetColumns).toBe(1)
    expect(draft.result!.completedAxleLines).toBe(4)
    expect(draft.result!.completedColumns).toBe(1)
    expect(draft.result!.moduleCount).toBeGreaterThan(0)
    expect(draft.result!.connectionOrder.length).toBeGreaterThan(0)
    expect(draft.result!.visualSummary).toContain('4')
    expect(draft.result!.visualSummary).toContain('1')
  })

  it('completes 6×2 assembly with side column', () => {
    let draft = createTrailerAssemblyDraft({
      targetAxleLines: 6,
      targetColumns: 2,
    })

    // Select target
    draft = applyTrailerAssemblyStep(draft, {
      id: 's1',
      stepType: 'select_target_configuration',
      createdAt: new Date().toISOString(),
    }).draft

    // Place main column
    draft = applyTrailerAssemblyStep(draft, {
      id: 's2',
      stepType: 'place_main_column',
      createdAt: new Date().toISOString(),
    }).draft

    // Add 3 axles to main column
    for (let i = 0; i < 3; i++) {
      draft = applyTrailerAssemblyStep(draft, {
        id: `s${3 + i}`,
        stepType: 'add_axle_module',
        columnIndex: 0,
        createdAt: new Date().toISOString(),
      }).draft
    }

    // Add side column
    draft = applyTrailerAssemblyStep(draft, {
      id: 's6',
      stepType: 'add_side_column',
      createdAt: new Date().toISOString(),
    }).draft
    expect(draft.currentColumns).toBe(2)

    // Add 3 axles to side column
    for (let i = 0; i < 3; i++) {
      draft = applyTrailerAssemblyStep(draft, {
        id: `s${7 + i}`,
        stepType: 'add_axle_module',
        columnIndex: 1,
        createdAt: new Date().toISOString(),
      }).draft
    }

    // Connect tractor
    draft = applyTrailerAssemblyStep(draft, {
      id: 's10',
      stepType: 'connect_tractor_end',
      createdAt: new Date().toISOString(),
    }).draft

    // Align columns
    draft = applyTrailerAssemblyStep(draft, {
      id: 's11',
      stepType: 'align_columns',
      createdAt: new Date().toISOString(),
    }).draft

    // Complete
    const result = applyTrailerAssemblyStep(draft, {
      id: 's12',
      stepType: 'complete_assembly',
      createdAt: new Date().toISOString(),
    })
    draft = result.draft

    expect(draft.status).toBe('completed')
    expect(draft.result!.targetAxleLines).toBe(6)
    expect(draft.result!.targetColumns).toBe(2)
    expect(draft.result!.completedAxleLines).toBe(6)
    expect(draft.result!.completedColumns).toBe(2)
  })
})

// ── Result display ───────────────────────────────────────────────────

describe('Assembly result', () => {
  it('result shows axle count, column count, module count, and connection order', () => {
    let draft = createTrailerAssemblyDraft({
      targetAxleLines: 4,
      targetColumns: 1,
    })
    draft = applyTrailerAssemblyStep(draft, {
      id: 's1',
      stepType: 'select_target_configuration',
      createdAt: new Date().toISOString(),
    }).draft
    draft = applyTrailerAssemblyStep(draft, {
      id: 's2',
      stepType: 'place_main_column',
      createdAt: new Date().toISOString(),
    }).draft
    for (let i = 0; i < 4; i++) {
      draft = applyTrailerAssemblyStep(draft, {
        id: `s${3 + i}`,
        stepType: 'add_axle_module',
        columnIndex: 0,
        createdAt: new Date().toISOString(),
      }).draft
    }
    draft = applyTrailerAssemblyStep(draft, {
      id: 's7',
      stepType: 'connect_tractor_end',
      createdAt: new Date().toISOString(),
    }).draft
    draft = applyTrailerAssemblyStep(draft, {
      id: 's8',
      stepType: 'align_columns',
      createdAt: new Date().toISOString(),
    }).draft
    draft = applyTrailerAssemblyStep(draft, {
      id: 's9',
      stepType: 'complete_assembly',
      createdAt: new Date().toISOString(),
    }).draft

    const result = draft.result!
    expect(result.completedAxleLines).toBe(4)
    expect(result.completedColumns).toBe(1)
    expect(result.moduleCount).toBeGreaterThan(0)
    expect(result.connectionOrder.length).toBeGreaterThan(0)
    expect(result.readyForHydraulicPointSelection).toBe(true)
    expect(result.teachingNote).toContain('Day74')
  })
})

// ── Reset ────────────────────────────────────────────────────────────

describe('Reset assembly', () => {
  it('resets draft to initial state', () => {
    let draft = createTrailerAssemblyDraft({
      targetAxleLines: 6,
      targetColumns: 2,
    })
    draft = applyTrailerAssemblyStep(draft, {
      id: 's1',
      stepType: 'select_target_configuration',
      createdAt: new Date().toISOString(),
    }).draft
    draft = applyTrailerAssemblyStep(draft, {
      id: 's2',
      stepType: 'place_main_column',
      createdAt: new Date().toISOString(),
    }).draft

    const resetResult = resetTrailerAssemblyDraft(draft)
    draft = resetResult.draft

    expect(draft.status).toBe('in_progress')
    expect(draft.currentAxleLines).toBe(0)
    expect(draft.currentColumns).toBe(0)
    expect(draft.placedModules).toHaveLength(0)
    expect(draft.result).toBeUndefined()
  })
})

// ── Operation log ────────────────────────────────────────────────────

describe('Operation log', () => {
  it('creates operation log with required fields', () => {
    const log = createTrailerAssemblyOperationLog({
      draftId: 'draft-1',
      action: 'place_main_column',
      resultStatus: 'in_progress',
      message: '已放置主纵列。',
    })
    expect(log.id).toBeDefined()
    expect(log.draftId).toBe('draft-1')
    expect(log.action).toBe('place_main_column')
    expect(log.resultStatus).toBe('in_progress')
    expect(log.createdAt).toBeDefined()
  })

  it('applyTrailerAssemblyStep produces log for each step', () => {
    let draft = createTrailerAssemblyDraft({
      targetAxleLines: 4,
      targetColumns: 1,
    })
    const r1 = applyTrailerAssemblyStep(draft, {
      id: 's1',
      stepType: 'select_target_configuration',
      createdAt: new Date().toISOString(),
    })
    expect(r1.log.action).toBe('select_target_configuration')
    draft = r1.draft

    const r2 = applyTrailerAssemblyStep(draft, {
      id: 's2',
      stepType: 'place_main_column',
      createdAt: new Date().toISOString(),
    })
    expect(r2.log.action).toBe('place_main_column')
  })

  it('applyTrailerAssemblyStep produces error log for invalid step', () => {
    const draft = createTrailerAssemblyDraft({
      targetAxleLines: 6,
      targetColumns: 2,
    })
    const r = applyTrailerAssemblyStep(draft, {
      id: 's1',
      stepType: 'add_side_column',
      createdAt: new Date().toISOString(),
    })
    expect(r.error).toBeDefined()
    expect(r.log.action).toBe('assembly_error')
    expect(r.log.errorCode).toBe('missing_target_configuration')
  })
})

// ── Column layout helpers ────────────────────────────────────────────

describe('Column layout helpers', () => {
  it('getColumnLayouts returns correct layout', () => {
    let draft = createTrailerAssemblyDraft({
      targetAxleLines: 6,
      targetColumns: 2,
    })
    draft = applyTrailerAssemblyStep(draft, {
      id: 's1',
      stepType: 'select_target_configuration',
      createdAt: new Date().toISOString(),
    }).draft
    draft = applyTrailerAssemblyStep(draft, {
      id: 's2',
      stepType: 'place_main_column',
      createdAt: new Date().toISOString(),
    }).draft
    draft = applyTrailerAssemblyStep(draft, {
      id: 's3',
      stepType: 'add_axle_module',
      columnIndex: 0,
      createdAt: new Date().toISOString(),
    }).draft

    const layouts = getColumnLayouts(draft)
    expect(layouts).toHaveLength(1)
    expect(layouts[0].isMain).toBe(true)
    expect(layouts[0].axles).toHaveLength(1)
  })

  it('hasTractorConnector returns correct value', () => {
    let draft = createTrailerAssemblyDraft({
      targetAxleLines: 4,
      targetColumns: 1,
    })
    expect(hasTractorConnector(draft)).toBe(false)

    draft = applyTrailerAssemblyStep(draft, {
      id: 's1',
      stepType: 'select_target_configuration',
      createdAt: new Date().toISOString(),
    }).draft
    draft = applyTrailerAssemblyStep(draft, {
      id: 's2',
      stepType: 'place_main_column',
      createdAt: new Date().toISOString(),
    }).draft
    for (let i = 0; i < 4; i++) {
      draft = applyTrailerAssemblyStep(draft, {
        id: `s${3 + i}`,
        stepType: 'add_axle_module',
        columnIndex: 0,
        createdAt: new Date().toISOString(),
      }).draft
    }
    draft = applyTrailerAssemblyStep(draft, {
      id: 's7',
      stepType: 'connect_tractor_end',
      createdAt: new Date().toISOString(),
    }).draft

    expect(hasTractorConnector(draft)).toBe(true)
  })

  it('hasAlignmentMarker returns correct value', () => {
    let draft = createTrailerAssemblyDraft({
      targetAxleLines: 4,
      targetColumns: 1,
    })
    expect(hasAlignmentMarker(draft)).toBe(false)

    draft = applyTrailerAssemblyStep(draft, {
      id: 's1',
      stepType: 'select_target_configuration',
      createdAt: new Date().toISOString(),
    }).draft
    draft = applyTrailerAssemblyStep(draft, {
      id: 's2',
      stepType: 'place_main_column',
      createdAt: new Date().toISOString(),
    }).draft
    draft = applyTrailerAssemblyStep(draft, {
      id: 's3',
      stepType: 'align_columns',
      createdAt: new Date().toISOString(),
    }).draft

    expect(hasAlignmentMarker(draft)).toBe(true)
  })
})

// ── Sequence validation ──────────────────────────────────────────────

describe('validateTrailerAssemblySequence', () => {
  it('fails for non-in_progress draft', () => {
    const draft = createTrailerAssemblyDraft({
      targetAxleLines: 4,
      targetColumns: 1,
    })
    const result = validateTrailerAssemblySequence(draft)
    expect(result.valid).toBe(false)
  })
})

// ── completeTrailerAssemblyDraft ─────────────────────────────────────

describe('completeTrailerAssemblyDraft', () => {
  it('produces completed draft with result', () => {
    let draft = createTrailerAssemblyDraft({
      targetAxleLines: 4,
      targetColumns: 1,
    })
    draft = applyTrailerAssemblyStep(draft, {
      id: 's1',
      stepType: 'select_target_configuration',
      createdAt: new Date().toISOString(),
    }).draft
    draft = applyTrailerAssemblyStep(draft, {
      id: 's2',
      stepType: 'place_main_column',
      createdAt: new Date().toISOString(),
    }).draft
    for (let i = 0; i < 4; i++) {
      draft = applyTrailerAssemblyStep(draft, {
        id: `s${3 + i}`,
        stepType: 'add_axle_module',
        columnIndex: 0,
        createdAt: new Date().toISOString(),
      }).draft
    }
    draft = applyTrailerAssemblyStep(draft, {
      id: 's7',
      stepType: 'connect_tractor_end',
      createdAt: new Date().toISOString(),
    }).draft
    draft = applyTrailerAssemblyStep(draft, {
      id: 's8',
      stepType: 'align_columns',
      createdAt: new Date().toISOString(),
    }).draft

    const result = completeTrailerAssemblyDraft(draft)
    expect(result.draft.status).toBe('completed')
    expect(result.draft.result).toBeDefined()
  })
})
