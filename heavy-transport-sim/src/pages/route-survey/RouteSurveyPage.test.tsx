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

  it('displays Day60 scope note', () => {
    render(<RouteSurveyPage />)
    expect(screen.getByText(/Day59 已实现距离\/高度测量/)).toBeDefined()
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

  it('shows bridge info form when bridge obstacle selected', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const bridgeObs = SURVEY_ROUTES[1].obstacles.find(
      (o) => o.type === 'bridge',
    )!
    fireEvent.click(screen.getByTestId(`obstacle-item-${bridgeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    const bridgeTarget = targetButtons.find((b) =>
      b.textContent?.includes('桥梁信息'),
    )
    expect(bridgeTarget).toBeDefined()
    fireEvent.click(bridgeTarget!)
    expect(screen.getByTestId('bridge-info-form')).toBeDefined()
  })

  it('bridge info form shows bridge info card', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const bridgeObs = SURVEY_ROUTES[1].obstacles.find(
      (o) => o.type === 'bridge',
    )!
    fireEvent.click(screen.getByTestId(`obstacle-item-${bridgeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('桥梁信息'))!,
    )
    expect(screen.getByTestId('bridge-info-card')).toBeDefined()
    expect(screen.getByTestId('bridge-info-card').textContent).toContain(
      '运河公路桥梁',
    )
  })

  it('bridge info form shows bridge kind', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const bridgeObs = SURVEY_ROUTES[1].obstacles.find(
      (o) => o.type === 'bridge',
    )!
    fireEvent.click(screen.getByTestId(`obstacle-item-${bridgeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('桥梁信息'))!,
    )
    expect(screen.getByTestId('bridge-kind')).toBeDefined()
    expect(screen.getByTestId('bridge-kind').textContent).toContain('中型桥梁')
  })

  it('bridge info form shows load limit input with unit t', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const bridgeObs = SURVEY_ROUTES[1].obstacles.find(
      (o) => o.type === 'bridge',
    )!
    fireEvent.click(screen.getByTestId(`obstacle-item-${bridgeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('桥梁信息'))!,
    )
    expect(screen.getByTestId('bridge-load-limit-input')).toBeDefined()
    expect(screen.getByText(/限载值.*t/)).toBeDefined()
  })

  it('bridge info form shows range hints', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const bridgeObs = SURVEY_ROUTES[1].obstacles.find((o) => o.type === 'bridge')!
    fireEvent.click(screen.getByTestId(`obstacle-item-${bridgeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(targetButtons.find((b) => b.textContent?.includes('桥梁信息'))!)
    expect(screen.getAllByText(/范围/).length).toBeGreaterThan(0)
  })

  it('bridge info form shows source selector', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const bridgeObs = SURVEY_ROUTES[1].obstacles.find(
      (o) => o.type === 'bridge',
    )!
    fireEvent.click(screen.getByTestId(`obstacle-item-${bridgeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('桥梁信息'))!,
    )
    expect(screen.getByTestId('bridge-source-select')).toBeDefined()
  })

  it('saves bridge info and shows result', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const bridgeObs = SURVEY_ROUTES[1].obstacles.find(
      (o) => o.type === 'bridge',
    )!
    fireEvent.click(screen.getByTestId(`obstacle-item-${bridgeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('桥梁信息'))!,
    )
    fireEvent.change(screen.getByTestId('bridge-load-limit-input'), {
      target: { value: '200' },
    })
    fireEvent.change(screen.getByTestId('bridge-deck-width-input'), {
      target: { value: '8' },
    })
    fireEvent.change(screen.getByTestId('bridge-length-input'), {
      target: { value: '50' },
    })
    fireEvent.click(screen.getByTestId('btn-save-bridge'))
    expect(screen.getByTestId('bridge-result')).toBeDefined()
    expect(
      screen.getByTestId('bridge-result-load-limit').textContent,
    ).toContain('200')
    expect(
      screen.getByTestId('bridge-result-load-limit').textContent,
    ).toContain('t')
    expect(
      screen.getByTestId('bridge-result-deck-width').textContent,
    ).toContain('8')
    expect(
      screen.getByTestId('bridge-result-deck-width').textContent,
    ).toContain('m')
  })

  it('shows validation error for load limit below minimum', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const bridgeObs = SURVEY_ROUTES[1].obstacles.find(
      (o) => o.type === 'bridge',
    )!
    fireEvent.click(screen.getByTestId(`obstacle-item-${bridgeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('桥梁信息'))!,
    )
    fireEvent.change(screen.getByTestId('bridge-load-limit-input'), {
      target: { value: '3' },
    })
    fireEvent.change(screen.getByTestId('bridge-deck-width-input'), {
      target: { value: '8' },
    })
    fireEvent.change(screen.getByTestId('bridge-length-input'), {
      target: { value: '50' },
    })
    fireEvent.click(screen.getByTestId('btn-save-bridge'))
    expect(screen.getByTestId('bridge-errors')).toBeDefined()
    expect(screen.getByTestId('bridge-errors').textContent).toContain('限载值')
  })

  it('shows validation error for load limit above maximum', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const bridgeObs = SURVEY_ROUTES[1].obstacles.find(
      (o) => o.type === 'bridge',
    )!
    fireEvent.click(screen.getByTestId(`obstacle-item-${bridgeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('桥梁信息'))!,
    )
    fireEvent.change(screen.getByTestId('bridge-load-limit-input'), {
      target: { value: '600' },
    })
    fireEvent.change(screen.getByTestId('bridge-deck-width-input'), {
      target: { value: '8' },
    })
    fireEvent.change(screen.getByTestId('bridge-length-input'), {
      target: { value: '50' },
    })
    fireEvent.click(screen.getByTestId('btn-save-bridge'))
    expect(screen.getByTestId('bridge-errors')).toBeDefined()
    expect(screen.getByTestId('bridge-errors').textContent).toContain('限载值')
  })

  it('shows validation error for missing required fields', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const bridgeObs = SURVEY_ROUTES[1].obstacles.find(
      (o) => o.type === 'bridge',
    )!
    fireEvent.click(screen.getByTestId(`obstacle-item-${bridgeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('桥梁信息'))!,
    )
    fireEvent.click(screen.getByTestId('btn-save-bridge'))
    expect(screen.getByTestId('bridge-errors')).toBeDefined()
  })

  it('bridge info writes to draft store', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const bridgeObs = SURVEY_ROUTES[1].obstacles.find(
      (o) => o.type === 'bridge',
    )!
    fireEvent.click(screen.getByTestId(`obstacle-item-${bridgeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('桥梁信息'))!,
    )
    fireEvent.change(screen.getByTestId('bridge-load-limit-input'), {
      target: { value: '200' },
    })
    fireEvent.change(screen.getByTestId('bridge-deck-width-input'), {
      target: { value: '8' },
    })
    fireEvent.change(screen.getByTestId('bridge-length-input'), {
      target: { value: '50' },
    })
    fireEvent.click(screen.getByTestId('btn-save-bridge'))
    const status = useRouteSurveyStore
      .getState()
      .getObstacleMeasurementStatus(SURVEY_ROUTES[1].id, bridgeObs.id)
    expect(status).toBe('measured')
  })

  it('bridge measurement persists after route switch', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const bridgeObs = SURVEY_ROUTES[1].obstacles.find(
      (o) => o.type === 'bridge',
    )!
    fireEvent.click(screen.getByTestId(`obstacle-item-${bridgeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('桥梁信息'))!,
    )
    fireEvent.change(screen.getByTestId('bridge-load-limit-input'), {
      target: { value: '200' },
    })
    fireEvent.change(screen.getByTestId('bridge-deck-width-input'), {
      target: { value: '8' },
    })
    fireEvent.change(screen.getByTestId('bridge-length-input'), {
      target: { value: '50' },
    })
    fireEvent.click(screen.getByTestId('btn-save-bridge'))
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[0].id}`))
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const status = useRouteSurveyStore
      .getState()
      .getObstacleMeasurementStatus(SURVEY_ROUTES[1].id, bridgeObs.id)
    expect(status).toBe('measured')
  })

  it('shows bridge result object name', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const bridgeObs = SURVEY_ROUTES[1].obstacles.find(
      (o) => o.type === 'bridge',
    )!
    fireEvent.click(screen.getByTestId(`obstacle-item-${bridgeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('桥梁信息'))!,
    )
    fireEvent.change(screen.getByTestId('bridge-load-limit-input'), {
      target: { value: '200' },
    })
    fireEvent.change(screen.getByTestId('bridge-deck-width-input'), {
      target: { value: '8' },
    })
    fireEvent.change(screen.getByTestId('bridge-length-input'), {
      target: { value: '50' },
    })
    fireEvent.click(screen.getByTestId('btn-save-bridge'))
    expect(screen.getByTestId('bridge-result-object').textContent).toContain(
      '桥梁信息',
    )
  })

  it('shows bridge result source', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const bridgeObs = SURVEY_ROUTES[1].obstacles.find(
      (o) => o.type === 'bridge',
    )!
    fireEvent.click(screen.getByTestId(`obstacle-item-${bridgeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('桥梁信息'))!,
    )
    fireEvent.change(screen.getByTestId('bridge-load-limit-input'), {
      target: { value: '200' },
    })
    fireEvent.change(screen.getByTestId('bridge-deck-width-input'), {
      target: { value: '8' },
    })
    fireEvent.change(screen.getByTestId('bridge-length-input'), {
      target: { value: '50' },
    })
    fireEvent.click(screen.getByTestId('btn-save-bridge'))
    expect(screen.getByTestId('bridge-result-source').textContent).toMatch(
      /手动录入|现场标牌|资料查询|教师给定|教学配置/,
    )
  })

  it('can clear bridge info', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const bridgeObs = SURVEY_ROUTES[1].obstacles.find(
      (o) => o.type === 'bridge',
    )!
    fireEvent.click(screen.getByTestId(`obstacle-item-${bridgeObs.id}`))
    const targetButtons = screen.getAllByTestId(/^target-/)
    fireEvent.click(
      targetButtons.find((b) => b.textContent?.includes('桥梁信息'))!,
    )
    fireEvent.change(screen.getByTestId('bridge-load-limit-input'), {
      target: { value: '200' },
    })
    fireEvent.change(screen.getByTestId('bridge-deck-width-input'), {
      target: { value: '8' },
    })
    fireEvent.change(screen.getByTestId('bridge-length-input'), {
      target: { value: '50' },
    })
    fireEvent.click(screen.getByTestId('btn-save-bridge'))
    fireEvent.click(screen.getByTestId('btn-clear-bridge'))
    expect(screen.queryByTestId('bridge-result')).toBeNull()
  })

  it('displays teaching note with Day62 scope', () => {
    render(<RouteSurveyPage />)
    expect(screen.getByText(/Day62 已实现桥梁信息查看和限载输入/)).toBeDefined()
    expect(screen.getByText(/桥梁承载教学规则由 Day68 实现/)).toBeDefined()
  })

  it('does not implement Day63 weekly acceptance', () => {
    render(<RouteSurveyPage />)
    expect(screen.queryByTestId('weekly-acceptance')).toBeNull()
  })

  it('does not implement Day68 bridge load rules', () => {
    render(<RouteSurveyPage />)
    expect(screen.queryByTestId('bridge-load-rule-result')).toBeNull()
  })
})
