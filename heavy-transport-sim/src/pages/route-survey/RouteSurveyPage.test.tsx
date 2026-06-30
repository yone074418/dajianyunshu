import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RouteSurveyPage from './RouteSurveyPage'
import { useRouteSurveyStore } from '../../stores/route-survey/routeSurveyStore'
import { SURVEY_ROUTES } from '../../domain/surveyRouteData'

describe('RouteSurveyPage', () => {
  beforeEach(() => {
    localStorage.clear()
    useRouteSurveyStore.getState().reset()
  })

  it('renders the page', () => {
    render(<RouteSurveyPage />)
    expect(screen.getByTestId('route-survey-page')).toBeDefined()
  })

  it('displays all three route navigation cards', () => {
    render(<RouteSurveyPage />)
    for (const route of SURVEY_ROUTES) {
      expect(screen.getByTestId(`route-nav-${route.id}`)).toBeDefined()
    }
  })

  it('switches to route B when clicked', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    expect(screen.getByTestId('current-route-summary').textContent).toContain(
      SURVEY_ROUTES[1].name,
    )
  })

  it('displays obstacle list for current route', () => {
    render(<RouteSurveyPage />)
    const list = screen.getByTestId('obstacle-list')
    expect(list).toBeDefined()
    for (const obs of SURVEY_ROUTES[0].obstacles) {
      expect(screen.getByTestId(`obstacle-item-${obs.id}`)).toBeDefined()
    }
  })

  it('old route obstacles do not remain after switching', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    for (const obs of SURVEY_ROUTES[0].obstacles) {
      expect(screen.queryByTestId(`obstacle-item-${obs.id}`)).toBeNull()
    }
  })

  it('selects obstacle and shows detail and measurement panels', () => {
    render(<RouteSurveyPage />)
    const obsId = SURVEY_ROUTES[0].obstacles[0].id
    fireEvent.click(screen.getByTestId(`obstacle-item-${obsId}`))
    expect(screen.getByTestId('obstacle-detail-panel')).toBeDefined()
    expect(screen.getByTestId('measurement-section')).toBeDefined()
    expect(screen.getByTestId('measurement-panel')).toBeDefined()
  })

  it('shows measurement targets when obstacle selected', () => {
    render(<RouteSurveyPage />)
    const obsId = SURVEY_ROUTES[0].obstacles[0].id
    fireEvent.click(screen.getByTestId(`obstacle-item-${obsId}`))
    const targets = screen.getAllByText(/测量对象/)
    expect(targets.length).toBeGreaterThan(0)
  })

  it('shows preset measurement points when target selected', () => {
    render(<RouteSurveyPage />)
    const obsId = SURVEY_ROUTES[0].obstacles[0].id
    fireEvent.click(screen.getByTestId(`obstacle-item-${obsId}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    expect(targetButtons.length).toBeGreaterThan(0)
    fireEvent.click(targetButtons[0])
    const presets = screen.getAllByTestId(/^preset-pair-/)
    expect(presets.length).toBeGreaterThan(0)
  })

  it('shows measurement result after selecting preset', () => {
    render(<RouteSurveyPage />)
    const obsId = SURVEY_ROUTES[0].obstacles[0].id
    fireEvent.click(screen.getByTestId(`obstacle-item-${obsId}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(targetButtons[0])
    const presets = screen.getAllByTestId(/^preset-pair-/)
    fireEvent.click(presets[0])
    expect(screen.getByTestId('measurement-result')).toBeDefined()
    expect(screen.getByTestId('measurement-value').textContent).toContain('m')
    expect(screen.getByTestId('measurement-object').textContent).toContain(
      '测量对象',
    )
  })

  it('can clear measurement', () => {
    render(<RouteSurveyPage />)
    const obsId = SURVEY_ROUTES[0].obstacles[0].id
    fireEvent.click(screen.getByTestId(`obstacle-item-${obsId}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(targetButtons[0])
    const presets = screen.getAllByTestId(/^preset-pair-/)
    fireEvent.click(presets[0])
    fireEvent.click(screen.getByTestId('btn-clear-measurement'))
    expect(screen.queryByTestId('measurement-result')).toBeNull()
  })

  it('writes measurement to draft store', () => {
    render(<RouteSurveyPage />)
    const obsId = SURVEY_ROUTES[0].obstacles[0].id
    fireEvent.click(screen.getByTestId(`obstacle-item-${obsId}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(targetButtons[0])
    const presets = screen.getAllByTestId(/^preset-pair-/)
    fireEvent.click(presets[0])
    const status = useRouteSurveyStore
      .getState()
      .getObstacleMeasurementStatus(SURVEY_ROUTES[0].id, obsId)
    expect(status).toBe('measured')
  })

  it('measurement persists after route switch', () => {
    render(<RouteSurveyPage />)
    const obsId = SURVEY_ROUTES[0].obstacles[0].id
    fireEvent.click(screen.getByTestId(`obstacle-item-${obsId}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(targetButtons[0])
    const presets = screen.getAllByTestId(/^preset-pair-/)
    fireEvent.click(presets[0])
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[0].id}`))
    const status = useRouteSurveyStore
      .getState()
      .getObstacleMeasurementStatus(SURVEY_ROUTES[0].id, obsId)
    expect(status).toBe('measured')
  })

  it('displays teaching disclaimer', () => {
    render(<RouteSurveyPage />)
    expect(screen.getByText(/教学简化声明/)).toBeDefined()
  })

  it('displays Day61 scope note', () => {
    render(<RouteSurveyPage />)
    expect(screen.getByText(/Day61 只做弯道参数测量/)).toBeDefined()
  })

  it('shows slope measurement for slope obstacle', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[2].id}`))
    const slopeObs = SURVEY_ROUTES[2].obstacles.find((o) => o.type === 'slope')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${slopeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    expect(targetButtons.length).toBeGreaterThanOrEqual(2)
    const slopeTarget = targetButtons.find((b) =>
      b.textContent?.includes('坡度'),
    )
    expect(slopeTarget).toBeDefined()
  })

  it('slope measurement shows horizontal distance, vertical distance, and process', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[2].id}`))
    const slopeObs = SURVEY_ROUTES[2].obstacles.find((o) => o.type === 'slope')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${slopeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    const slopeTarget = targetButtons.find((b) =>
      b.textContent?.includes('坡度'),
    )
    fireEvent.click(slopeTarget!)
    const presets = screen.getAllByTestId(/^preset-pair-/)
    fireEvent.click(presets[presets.length - 1])
    expect(screen.getByTestId('measurement-result')).toBeDefined()
    expect(screen.getByTestId('measurement-value').textContent).toContain('%')
    expect(screen.getByTestId('measurement-horizontal')).toBeDefined()
    expect(screen.getByTestId('measurement-vertical')).toBeDefined()
    expect(screen.getByTestId('measurement-process')).toBeDefined()
  })

  it('slope measurement writes to draft store', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[2].id}`))
    const slopeObs = SURVEY_ROUTES[2].obstacles.find((o) => o.type === 'slope')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${slopeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    const slopeTarget = targetButtons.find((b) =>
      b.textContent?.includes('坡度'),
    )
    fireEvent.click(slopeTarget!)
    const presets = screen.getAllByTestId(/^preset-pair-/)
    fireEvent.click(presets[presets.length - 1])
    const status = useRouteSurveyStore
      .getState()
      .getObstacleMeasurementStatus(SURVEY_ROUTES[2].id, slopeObs.id)
    expect(status).toBe('measured')
  })

  it('shows curve parameter form when curve obstacle selected', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    const curveTarget = targetButtons.find((b) =>
      b.textContent?.includes('弯道参数'),
    )
    expect(curveTarget).toBeDefined()
    fireEvent.click(curveTarget!)
    expect(screen.getByTestId('curve-parameter-form')).toBeDefined()
  })

  it('curve parameter form shows radius input with unit m', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    const radiusInput = screen.getByTestId('curve-radius-input')
    expect(radiusInput).toBeDefined()
    expect(screen.getByText(/半径.*m/)).toBeDefined()
  })

  it('curve parameter form shows angle input with unit °', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    const angleInput = screen.getByTestId('curve-angle-input')
    expect(angleInput).toBeDefined()
    expect(screen.getByText(/夹角.*°/)).toBeDefined()
  })

  it('curve parameter form shows entrance width input with unit m', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    expect(screen.getByTestId('curve-entrance-input')).toBeDefined()
    expect(screen.getByText(/入口宽度.*m/)).toBeDefined()
  })

  it('curve parameter form shows exit width input with unit m', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    expect(screen.getByTestId('curve-exit-input')).toBeDefined()
    expect(screen.getByText(/出口宽度.*m/)).toBeDefined()
  })

  it('curve parameter form shows curve kind', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    const kindEl = screen.getByTestId('curve-kind')
    expect(kindEl).toBeDefined()
    expect(kindEl.textContent).toContain('圆弧弯道')
  })

  it('curve parameter form shows source selector', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    expect(screen.getByTestId('curve-source-select')).toBeDefined()
  })

  it('saves curve parameters and shows result', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    fireEvent.change(screen.getByTestId('curve-radius-input'), {
      target: { value: '25' },
    })
    fireEvent.change(screen.getByTestId('curve-angle-input'), {
      target: { value: '90' },
    })
    fireEvent.change(screen.getByTestId('curve-entrance-input'), {
      target: { value: '6' },
    })
    fireEvent.change(screen.getByTestId('curve-exit-input'), {
      target: { value: '5.5' },
    })
    fireEvent.click(screen.getByTestId('btn-save-curve'))
    expect(screen.getByTestId('curve-result')).toBeDefined()
    expect(screen.getByTestId('curve-result-radius').textContent).toContain(
      '25',
    )
    expect(screen.getByTestId('curve-result-radius').textContent).toContain('m')
    expect(screen.getByTestId('curve-result-angle').textContent).toContain('90')
    expect(screen.getByTestId('curve-result-angle').textContent).toContain('°')
    expect(screen.getByTestId('curve-result-entrance').textContent).toContain(
      '6',
    )
    expect(screen.getByTestId('curve-result-entrance').textContent).toContain(
      'm',
    )
    expect(screen.getByTestId('curve-result-exit').textContent).toContain('5.5')
    expect(screen.getByTestId('curve-result-exit').textContent).toContain('m')
  })

  it('shows measurement object name in curve result', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    fireEvent.change(screen.getByTestId('curve-radius-input'), {
      target: { value: '25' },
    })
    fireEvent.change(screen.getByTestId('curve-angle-input'), {
      target: { value: '90' },
    })
    fireEvent.change(screen.getByTestId('curve-entrance-input'), {
      target: { value: '6' },
    })
    fireEvent.change(screen.getByTestId('curve-exit-input'), {
      target: { value: '5.5' },
    })
    fireEvent.click(screen.getByTestId('btn-save-curve'))
    expect(screen.getByTestId('curve-result-object').textContent).toContain(
      '弯道参数',
    )
  })

  it('shows parameter source in curve result', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    fireEvent.change(screen.getByTestId('curve-radius-input'), {
      target: { value: '25' },
    })
    fireEvent.change(screen.getByTestId('curve-angle-input'), {
      target: { value: '90' },
    })
    fireEvent.change(screen.getByTestId('curve-entrance-input'), {
      target: { value: '6' },
    })
    fireEvent.change(screen.getByTestId('curve-exit-input'), {
      target: { value: '5.5' },
    })
    fireEvent.click(screen.getByTestId('btn-save-curve'))
    const sourceText = screen.getByTestId('curve-result-source').textContent
    expect(sourceText).toMatch(/手动录入|教学配置|预设点位计算/)
  })

  it('shows validation error for zero radius', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    fireEvent.change(screen.getByTestId('curve-radius-input'), {
      target: { value: '0' },
    })
    fireEvent.change(screen.getByTestId('curve-angle-input'), {
      target: { value: '90' },
    })
    fireEvent.change(screen.getByTestId('curve-entrance-input'), {
      target: { value: '6' },
    })
    fireEvent.change(screen.getByTestId('curve-exit-input'), {
      target: { value: '5.5' },
    })
    fireEvent.click(screen.getByTestId('btn-save-curve'))
    expect(screen.getByTestId('curve-errors')).toBeDefined()
    expect(screen.getByTestId('curve-errors').textContent).toContain('半径')
  })

  it('shows validation error for angle > 180', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    fireEvent.change(screen.getByTestId('curve-radius-input'), {
      target: { value: '25' },
    })
    fireEvent.change(screen.getByTestId('curve-angle-input'), {
      target: { value: '200' },
    })
    fireEvent.change(screen.getByTestId('curve-entrance-input'), {
      target: { value: '6' },
    })
    fireEvent.change(screen.getByTestId('curve-exit-input'), {
      target: { value: '5.5' },
    })
    fireEvent.click(screen.getByTestId('btn-save-curve'))
    expect(screen.getByTestId('curve-errors')).toBeDefined()
    expect(screen.getByTestId('curve-errors').textContent).toContain('夹角')
  })

  it('shows validation error for zero entrance width', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    fireEvent.change(screen.getByTestId('curve-radius-input'), {
      target: { value: '25' },
    })
    fireEvent.change(screen.getByTestId('curve-angle-input'), {
      target: { value: '90' },
    })
    fireEvent.change(screen.getByTestId('curve-entrance-input'), {
      target: { value: '0' },
    })
    fireEvent.change(screen.getByTestId('curve-exit-input'), {
      target: { value: '5.5' },
    })
    fireEvent.click(screen.getByTestId('btn-save-curve'))
    expect(screen.getByTestId('curve-errors').textContent).toContain('入口宽度')
  })

  it('shows validation error for zero exit width', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    fireEvent.change(screen.getByTestId('curve-radius-input'), {
      target: { value: '25' },
    })
    fireEvent.change(screen.getByTestId('curve-angle-input'), {
      target: { value: '90' },
    })
    fireEvent.change(screen.getByTestId('curve-entrance-input'), {
      target: { value: '6' },
    })
    fireEvent.change(screen.getByTestId('curve-exit-input'), {
      target: { value: '0' },
    })
    fireEvent.click(screen.getByTestId('btn-save-curve'))
    expect(screen.getByTestId('curve-errors').textContent).toContain('出口宽度')
  })

  it('curve measurement writes to draft store', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    fireEvent.change(screen.getByTestId('curve-radius-input'), {
      target: { value: '25' },
    })
    fireEvent.change(screen.getByTestId('curve-angle-input'), {
      target: { value: '90' },
    })
    fireEvent.change(screen.getByTestId('curve-entrance-input'), {
      target: { value: '6' },
    })
    fireEvent.change(screen.getByTestId('curve-exit-input'), {
      target: { value: '5.5' },
    })
    fireEvent.click(screen.getByTestId('btn-save-curve'))
    const status = useRouteSurveyStore
      .getState()
      .getObstacleMeasurementStatus(SURVEY_ROUTES[0].id, curveObs.id)
    expect(status).toBe('measured')
  })

  it('curve measurement persists after route switch', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    fireEvent.change(screen.getByTestId('curve-radius-input'), {
      target: { value: '25' },
    })
    fireEvent.change(screen.getByTestId('curve-angle-input'), {
      target: { value: '90' },
    })
    fireEvent.change(screen.getByTestId('curve-entrance-input'), {
      target: { value: '6' },
    })
    fireEvent.change(screen.getByTestId('curve-exit-input'), {
      target: { value: '5.5' },
    })
    fireEvent.click(screen.getByTestId('btn-save-curve'))
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[0].id}`))
    const status = useRouteSurveyStore
      .getState()
      .getObstacleMeasurementStatus(SURVEY_ROUTES[0].id, curveObs.id)
    expect(status).toBe('measured')
  })

  it('can retake curve measurement', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    fireEvent.change(screen.getByTestId('curve-radius-input'), {
      target: { value: '25' },
    })
    fireEvent.change(screen.getByTestId('curve-angle-input'), {
      target: { value: '90' },
    })
    fireEvent.change(screen.getByTestId('curve-entrance-input'), {
      target: { value: '6' },
    })
    fireEvent.change(screen.getByTestId('curve-exit-input'), {
      target: { value: '5.5' },
    })
    fireEvent.click(screen.getByTestId('btn-save-curve'))
    fireEvent.click(screen.getByTestId('btn-retake-curve'))
    expect(screen.queryByTestId('curve-result')).toBeNull()
  })

  it('does not implement Day62 bridge load input form', () => {
    render(<RouteSurveyPage />)
    expect(screen.queryByTestId('bridge-load-input')).toBeNull()
    expect(screen.queryByTestId('bridge-info-panel')).toBeNull()
  })

  it('does not implement curve passability rule engine', () => {
    render(<RouteSurveyPage />)
    expect(screen.queryByTestId('curve-passability-result')).toBeNull()
    expect(screen.queryByTestId('curve-passability-judgment')).toBeNull()
  })

  it('shows curve kind description for circular curve', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    const desc = screen.getByTestId('curve-kind-description')
    expect(desc.textContent).toContain('圆弧弯道重点测量')
  })

  it('shows fill preset button when preset params exist', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    expect(screen.getByTestId('btn-fill-preset-curve')).toBeDefined()
  })

  it('fills preset values when preset button clicked', () => {
    render(<RouteSurveyPage />)
    const curveObs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${curveObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('弯道参数'))!,
    )
    fireEvent.click(screen.getByTestId('btn-fill-preset-curve'))
    const sourceSelect = screen.getByTestId(
      'curve-source-select',
    ) as HTMLSelectElement
    expect(sourceSelect.value).toBe('teaching_config')
  })

  it('teaching note states Day61 only does curve measurement', () => {
    render(<RouteSurveyPage />)
    expect(screen.getByText(/Day61 只做弯道参数测量/)).toBeDefined()
    expect(screen.getByText(/不实现弯道是否可通过的最终判定/)).toBeDefined()
  })

  it('teaching note states Day62 does bridge', () => {
    render(<RouteSurveyPage />)
    expect(
      screen.getByText(/桥梁信息查看和限载输入由 Day62 实现/),
    ).toBeDefined()
  })
})
