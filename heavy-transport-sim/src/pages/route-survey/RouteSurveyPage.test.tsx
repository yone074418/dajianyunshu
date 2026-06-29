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

  it('shows the first route as selected by default', () => {
    render(<RouteSurveyPage />)
    const card = screen.getByTestId(`route-nav-${SURVEY_ROUTES[0].id}`)
    expect(card.style.border).toContain('rgb(25, 118, 210)')
  })

  it('switches to route B when clicked', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    const card = screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`)
    expect(card.style.border).toContain('rgb(25, 118, 210)')
    expect(screen.getByTestId('current-route-summary').textContent).toContain(
      SURVEY_ROUTES[1].name,
    )
  })

  it('switches to route C when clicked', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[2].id}`))
    expect(screen.getByTestId('current-route-summary').textContent).toContain(
      SURVEY_ROUTES[2].name,
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

  it('updates obstacle list when switching routes', () => {
    render(<RouteSurveyPage />)
    fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
    for (const obs of SURVEY_ROUTES[1].obstacles) {
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

  it('selects obstacle and shows detail panel', () => {
    render(<RouteSurveyPage />)
    const obsId = SURVEY_ROUTES[0].obstacles[0].id
    fireEvent.click(screen.getByTestId(`obstacle-item-${obsId}`))
    expect(screen.getByTestId('obstacle-detail-panel')).toBeDefined()
    expect(screen.getByTestId('obstacle-detail')).toBeDefined()
  })

  it('deselects obstacle when clicking same item', () => {
    render(<RouteSurveyPage />)
    const obsId = SURVEY_ROUTES[0].obstacles[0].id
    fireEvent.click(screen.getByTestId(`obstacle-item-${obsId}`))
    fireEvent.click(screen.getByTestId(`obstacle-item-${obsId}`))
    expect(screen.queryByTestId('obstacle-detail-panel')).toBeNull()
  })

  it('displays scene instance key', () => {
    render(<RouteSurveyPage />)
    expect(screen.getByTestId('scene-host').textContent).toContain('场景实例')
  })

  it('displays measured count', () => {
    render(<RouteSurveyPage />)
    expect(screen.getByTestId('current-route-summary').textContent).toContain(
      '已测',
    )
  })

  it('displays teaching disclaimer', () => {
    render(<RouteSurveyPage />)
    expect(screen.getByText(/教学简化声明/)).toBeDefined()
  })

  it('displays Day58 scope note', () => {
    render(<RouteSurveyPage />)
    expect(screen.getByText(/Day58 实现路线切换/)).toBeDefined()
  })

  it('does not implement measurement tools', () => {
    render(<RouteSurveyPage />)
    expect(screen.queryByTestId('measurement-tool')).toBeNull()
    expect(screen.queryByTestId('height-measurement')).toBeNull()
    expect(screen.queryByTestId('slope-measurement')).toBeNull()
  })
})
