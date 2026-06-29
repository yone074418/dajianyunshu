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
})
