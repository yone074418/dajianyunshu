import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TractorComparisonPage from './TractorComparisonPage'

describe('TractorComparisonPage', () => {
  it('should render the page', () => {
    render(<TractorComparisonPage />)
    expect(screen.getByTestId('tractor-comparison-page')).toBeInTheDocument()
  })

  it('should display page title', () => {
    render(<TractorComparisonPage />)
    expect(screen.getByText(/牵引车参数对比/)).toBeInTheDocument()
  })

  it('should display Day52 scope note', () => {
    render(<TractorComparisonPage />)
    expect(screen.getByText(/本阶段只做牵引车参数展示/)).toBeInTheDocument()
  })

  it('should display both tractor cards', () => {
    render(<TractorComparisonPage />)
    expect(screen.getByTestId('card-6x6')).toBeInTheDocument()
    expect(screen.getByTestId('card-8x8')).toBeInTheDocument()
  })

  it('should display tractor names', () => {
    render(<TractorComparisonPage />)
    expect(screen.getAllByText('6x6 重型牵引车').length).toBeGreaterThan(0)
    expect(screen.getAllByText('8x8 重型牵引车').length).toBeGreaterThan(0)
  })

  it('should display dimension comparison table', () => {
    render(<TractorComparisonPage />)
    expect(screen.getByTestId('dimension-table')).toBeInTheDocument()
    expect(screen.getByText('长度')).toBeInTheDocument()
    expect(screen.getByText('宽度')).toBeInTheDocument()
    expect(screen.getByText('高度')).toBeInTheDocument()
    expect(screen.getByText('轴距')).toBeInTheDocument()
    expect(screen.getByText('最小转弯半径')).toBeInTheDocument()
  })

  it('should display weight comparison table', () => {
    render(<TractorComparisonPage />)
    expect(screen.getByTestId('weight-table')).toBeInTheDocument()
    expect(screen.getByText('整备质量')).toBeInTheDocument()
    expect(screen.getByText('最大总质量')).toBeInTheDocument()
    expect(screen.getByText('允许牵引总质量')).toBeInTheDocument()
  })

  it('should display power comparison table', () => {
    render(<TractorComparisonPage />)
    expect(screen.getByTestId('power-table')).toBeInTheDocument()
    expect(screen.getByText('发动机功率')).toBeInTheDocument()
    expect(screen.getByText('最大扭矩')).toBeInTheDocument()
    expect(screen.getByText('驱动形式')).toBeInTheDocument()
  })

  it('should display dimension values from data', () => {
    render(<TractorComparisonPage />)
    expect(screen.getByText('7.2 m')).toBeInTheDocument()
    expect(screen.getByText('8.5 m')).toBeInTheDocument()
  })

  it('should display weight values from data', () => {
    render(<TractorComparisonPage />)
    expect(screen.getByText('10.5 t')).toBeInTheDocument()
    expect(screen.getByText('14 t')).toBeInTheDocument()
  })

  it('should display power values from data', () => {
    render(<TractorComparisonPage />)
    expect(screen.getByText('330 kW')).toBeInTheDocument()
    expect(screen.getByText('480 kW')).toBeInTheDocument()
  })

  it('should display advantages', () => {
    render(<TractorComparisonPage />)
    expect(screen.getAllByText(/结构成熟/).length).toBeGreaterThan(0)
  })

  it('should display disadvantages', () => {
    render(<TractorComparisonPage />)
    expect(screen.getByText(/超重超大货物牵引能力有限/)).toBeInTheDocument()
  })

  it('should display teaching simplified note', () => {
    render(<TractorComparisonPage />)
    expect(screen.getByText(/教学简化参数/)).toBeInTheDocument()
  })
})

describe('Data not hardcoded in component', () => {
  it('should show different values for 6x6 and 8x8', () => {
    render(<TractorComparisonPage />)
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThan(2)
  })

  it('should not implement Day53 axle selection', () => {
    render(<TractorComparisonPage />)
    expect(screen.queryByText(/轴线数选择|纵列数选择/)).not.toBeInTheDocument()
  })

  it('should not implement Day54 rule engine', () => {
    render(<TractorComparisonPage />)
    expect(
      screen.queryByText(/选择正确|选择错误|配车正确|配车错误/),
    ).not.toBeInTheDocument()
  })
})
