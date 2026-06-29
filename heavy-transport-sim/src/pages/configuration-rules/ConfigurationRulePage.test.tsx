import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfigurationRulePage from './ConfigurationRulePage'

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
    render(<ConfigurationRulePage />)
    fireEvent.click(screen.getByTestId('btn-check'))
    expect(screen.getByTestId('result-panel')).toBeDefined()
    expect(screen.getByTestId('result-status')).toBeDefined()
    expect(screen.getAllByText('通过').length).toBeGreaterThan(0)
  })

  it('shows check results for each rule', () => {
    render(<ConfigurationRulePage />)
    fireEvent.click(screen.getByTestId('btn-check'))
    expect(screen.getByTestId('check-CFG-COMPLETENESS')).toBeDefined()
    expect(screen.getByTestId('check-CFG-WEIGHT')).toBeDefined()
    expect(screen.getByTestId('check-CFG-DIMENSION')).toBeDefined()
    expect(screen.getByTestId('check-CFG-TRACTOR-POWER')).toBeDefined()
    expect(screen.getByTestId('check-CFG-AXLE-COLUMN')).toBeDefined()
  })

  it('shows next action after check', () => {
    render(<ConfigurationRulePage />)
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
})
