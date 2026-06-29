import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RouteSurveyPage from './RouteSurveyPage'
import { SURVEY_ROUTES } from '../../domain/surveyRouteData'

describe('RouteSurveyPage', () => {
  it('renders the page', () => {
    render(<RouteSurveyPage />)
    expect(screen.getByTestId('route-survey-page')).toBeDefined()
  })

  it('displays route survey title', () => {
    render(<RouteSurveyPage />)
    expect(screen.getByText('路线勘测')).toBeDefined()
  })

  it('displays all three routes', () => {
    render(<RouteSurveyPage />)
    for (const route of SURVEY_ROUTES) {
      expect(screen.getByTestId(`route-card-${route.id}`)).toBeDefined()
    }
  })

  it('displays route names', () => {
    render(<RouteSurveyPage />)
    expect(screen.getByText(/城区低桥绕行/)).toBeDefined()
    expect(screen.getByText(/工业园宽路直达/)).toBeDefined()
    expect(screen.getByText(/山区坡道桥梁/)).toBeDefined()
  })

  it('displays origin and destination for each route', () => {
    render(<RouteSurveyPage />)
    const origins = screen.getAllByText(/东港重型装备制造厂/)
    expect(origins.length).toBeGreaterThanOrEqual(3)
    const dests = screen.getAllByText(/500kV 变电站/)
    expect(dests.length).toBeGreaterThanOrEqual(3)
  })

  it('displays obstacle count for each route', () => {
    render(<RouteSurveyPage />)
    const obstacleTexts = screen.getAllByText(/障碍点：/)
    expect(obstacleTexts.length).toBeGreaterThanOrEqual(3)
  })

  it('displays obstacle type summary', () => {
    render(<RouteSurveyPage />)
    expect(screen.getAllByText(/限高障碍/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/弯道障碍/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/桥梁障碍/).length).toBeGreaterThan(0)
  })

  it('displays at least two obstacle types per route indicator', () => {
    render(<RouteSurveyPage />)
    const indicators = screen.getAllByText(/种不同障碍类型/)
    expect(indicators.length).toBeGreaterThanOrEqual(3)
  })

  it('displays teaching disclaimer', () => {
    render(<RouteSurveyPage />)
    expect(screen.getByText(/教学简化声明/)).toBeDefined()
  })

  it('displays Day57 scope note', () => {
    render(<RouteSurveyPage />)
    expect(screen.getByText(/Day57 只搭建路线/)).toBeDefined()
  })

  it('does not implement route switching', () => {
    render(<RouteSurveyPage />)
    expect(screen.queryByTestId('route-switcher')).toBeNull()
  })

  it('does not implement measurement tools', () => {
    render(<RouteSurveyPage />)
    expect(screen.queryByTestId('measurement-tool')).toBeNull()
  })
})
