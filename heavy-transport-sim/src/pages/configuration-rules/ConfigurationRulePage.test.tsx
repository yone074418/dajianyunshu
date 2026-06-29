import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfigurationRulePage from './ConfigurationRulePage'
import type { SimpleConfigurationInput } from '../../domain/configurationRules'

const PASSING_INPUT: SimpleConfigurationInput = {
  caseId: 'case_heavy_transformer_transport_v1',
  cargo: { lengthM: 8.8, widthM: 3.4, heightM: 4.2, weightT: 100 },
  vehicleCombinationId: 'semi_trailer_combination',
  vehicleCombinationType: 'semi_trailer',
  tractorId: 'tractor_8x8_heavy_duty',
  trailerSelection: { axleLines: 10, columns: 2 },
}

const FAILING_INPUT: SimpleConfigurationInput = {
  caseId: 'case_heavy_transformer_transport_v1',
  cargo: { lengthM: 8.8, widthM: 3.4, heightM: 4.2, weightT: 200 },
  vehicleCombinationId: 'semi_trailer_combination',
  vehicleCombinationType: 'semi_trailer',
  tractorId: 'tractor_6x6_heavy_duty',
  trailerSelection: { axleLines: 4, columns: 1 },
}

const BLOCKED_INPUT = {
  caseId: '',
  cargo: { lengthM: 0, widthM: 0, heightM: 0, weightT: 0 },
  vehicleCombinationId: '',
  vehicleCombinationType: '',
  tractorId: '',
  trailerSelection: { axleLines: 0, columns: 0 },
} as unknown as SimpleConfigurationInput

describe('ConfigurationRulePage', () => {
  it('renders the page', () => {
    render(<ConfigurationRulePage />)
    expect(screen.getByTestId('configuration-rule-page')).toBeDefined()
  })

  it('displays cargo summary', () => {
    render(<ConfigurationRulePage />)
    expect(screen.getByTestId('input-summary')).toBeDefined()
    expect(screen.getByText(/500kV/)).toBeDefined()
  })

  it('displays vehicle combination info', () => {
    render(<ConfigurationRulePage />)
    expect(screen.getByText(/半挂车组合/)).toBeDefined()
  })

  it('displays tractor info', () => {
    render(<ConfigurationRulePage />)
    expect(screen.getByText(/8x8 重型牵引车/)).toBeDefined()
  })

  it('displays trailer selection info', () => {
    render(<ConfigurationRulePage />)
    expect(screen.getByText(/10 轴线/)).toBeDefined()
    expect(screen.getByText(/2 纵列/)).toBeDefined()
  })

  it('displays check button', () => {
    render(<ConfigurationRulePage />)
    expect(screen.getByTestId('btn-check')).toBeDefined()
  })

  it('displays teaching disclaimer', () => {
    render(<ConfigurationRulePage />)
    expect(screen.getByText(/教学简化声明/)).toBeDefined()
    expect(screen.getByText(/不替代真实工程校核/)).toBeDefined()
  })

  it('shows passed result after clicking check', () => {
    render(<ConfigurationRulePage input={PASSING_INPUT} />)
    fireEvent.click(screen.getByTestId('btn-check'))
    expect(screen.getByTestId('result-panel')).toBeDefined()
    expect(screen.getByTestId('result-status')).toBeDefined()
    expect(screen.getAllByText('通过').length).toBeGreaterThan(0)
  })

  it('shows failed result with reasons and suggestions', () => {
    render(<ConfigurationRulePage input={FAILING_INPUT} />)
    fireEvent.click(screen.getByTestId('btn-check'))
    expect(screen.getByTestId('result-panel')).toBeDefined()
    expect(screen.getByTestId('result-status')).toBeDefined()
    expect(screen.getAllByText('不通过').length).toBeGreaterThan(0)
    expect(screen.getByTestId('result-reasons')).toBeDefined()
    expect(screen.getByTestId('next-action')).toBeDefined()
  })

  it('shows blocked result for missing parameters', () => {
    render(<ConfigurationRulePage input={BLOCKED_INPUT} />)
    fireEvent.click(screen.getByTestId('btn-check'))
    expect(screen.getByTestId('result-panel')).toBeDefined()
    expect(screen.getByTestId('result-status')).toBeDefined()
    expect(screen.getAllByText(/无法检查/).length).toBeGreaterThan(0)
  })

  it('shows check results for each rule', () => {
    render(<ConfigurationRulePage input={PASSING_INPUT} />)
    fireEvent.click(screen.getByTestId('btn-check'))
    expect(screen.getByTestId('check-CFG-COMPLETENESS')).toBeDefined()
    expect(screen.getByTestId('check-CFG-WEIGHT')).toBeDefined()
    expect(screen.getByTestId('check-CFG-DIMENSION')).toBeDefined()
    expect(screen.getByTestId('check-CFG-TRACTOR-POWER')).toBeDefined()
    expect(screen.getByTestId('check-CFG-AXLE-COLUMN')).toBeDefined()
  })

  it('shows next action after check', () => {
    render(<ConfigurationRulePage input={PASSING_INPUT} />)
    fireEvent.click(screen.getByTestId('btn-check'))
    expect(screen.getByTestId('next-action')).toBeDefined()
    expect(screen.getByText(/下一步/)).toBeDefined()
  })

  it('does not show result panel before clicking check', () => {
    render(<ConfigurationRulePage />)
    expect(screen.queryByTestId('result-panel')).toBeNull()
  })

  it('does not implement Day55 logging features', () => {
    render(<ConfigurationRulePage />)
    expect(screen.queryByTestId('operation-log')).toBeNull()
    expect(screen.queryByTestId('error-count')).toBeNull()
    expect(screen.queryByTestId('modification-count')).toBeNull()
  })

  it('displays failed reasons list', () => {
    render(<ConfigurationRulePage input={FAILING_INPUT} />)
    fireEvent.click(screen.getByTestId('btn-check'))
    const reasons = screen.getByTestId('result-reasons')
    expect(reasons).toBeDefined()
    expect(reasons.querySelectorAll('li').length).toBeGreaterThan(0)
  })
})
