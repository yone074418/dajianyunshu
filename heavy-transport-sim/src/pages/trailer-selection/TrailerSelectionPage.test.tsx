import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TrailerSelectionPage from './TrailerSelectionPage'

describe('TrailerSelectionPage', () => {
  it('should render the page', () => {
    render(<TrailerSelectionPage />)
    expect(screen.getByTestId('trailer-selection-page')).toBeInTheDocument()
  })

  it('should display page title', () => {
    render(<TrailerSelectionPage />)
    expect(screen.getByText(/挂车轴线数与纵列数选择/)).toBeInTheDocument()
  })

  it('should display Day53 scope note', () => {
    render(<TrailerSelectionPage />)
    expect(screen.getByText(/本阶段只做轴线数\/纵列数选择/)).toBeInTheDocument()
  })

  it('should render axle line options', () => {
    render(<TrailerSelectionPage />)
    expect(screen.getByTestId('axle-options')).toBeInTheDocument()
    expect(screen.getByTestId('axle-4')).toBeInTheDocument()
    expect(screen.getByTestId('axle-6')).toBeInTheDocument()
    expect(screen.getByTestId('axle-8')).toBeInTheDocument()
    expect(screen.getByTestId('axle-10')).toBeInTheDocument()
    expect(screen.getByTestId('axle-12')).toBeInTheDocument()
    expect(screen.getByTestId('axle-16')).toBeInTheDocument()
  })

  it('should render column options', () => {
    render(<TrailerSelectionPage />)
    expect(screen.getByTestId('column-options')).toBeInTheDocument()
    expect(screen.getByTestId('col-1')).toBeInTheDocument()
    expect(screen.getByTestId('col-2')).toBeInTheDocument()
    expect(screen.getByTestId('col-3')).toBeInTheDocument()
  })

  it('continue button should be disabled initially', () => {
    render(<TrailerSelectionPage />)
    expect(screen.getByTestId('btn-continue')).toBeDisabled()
  })

  it('should show summary after selecting both axle and column', () => {
    render(<TrailerSelectionPage />)
    fireEvent.click(screen.getByTestId('axle-6'))
    fireEvent.click(screen.getByTestId('col-2'))
    expect(screen.getByTestId('selection-summary')).toBeInTheDocument()
  })

  it('should select valid combination and show success', () => {
    render(<TrailerSelectionPage />)
    fireEvent.click(screen.getByTestId('axle-6'))
    fireEvent.click(screen.getByTestId('col-2'))
    expect(screen.getByTestId('validation-success')).toBeInTheDocument()
    expect(screen.getByTestId('btn-continue')).not.toBeDisabled()
  })

  it('should show error for disallowed combination 4+2 via disabled UI', () => {
    render(<TrailerSelectionPage />)
    fireEvent.click(screen.getByTestId('axle-4'))
    expect(screen.getByTestId('col-2')).toBeDisabled()
    expect(screen.getByTestId('col-3')).toBeDisabled()
    expect(screen.getByTestId('col-1')).not.toBeDisabled()
  })

  it('should disable col-3 for axle 6 (UI layer block)', () => {
    render(<TrailerSelectionPage />)
    fireEvent.click(screen.getByTestId('axle-6'))
    expect(screen.getByTestId('col-3')).toBeDisabled()
  })

  it('should disable col-1 for axle 10 (UI layer block)', () => {
    render(<TrailerSelectionPage />)
    fireEvent.click(screen.getByTestId('axle-10'))
    expect(screen.getByTestId('col-1')).toBeDisabled()
    expect(screen.getByTestId('col-3')).toBeDisabled()
    expect(screen.getByTestId('col-2')).not.toBeDisabled()
  })

  it('should show validation error for 8+3 via data layer', () => {
    render(<TrailerSelectionPage />)
    fireEvent.click(screen.getByTestId('axle-8'))
    expect(screen.getByTestId('col-3')).toBeDisabled()
  })

  it('should disable invalid columns when axle is selected', () => {
    render(<TrailerSelectionPage />)
    fireEvent.click(screen.getByTestId('axle-4'))
    expect(screen.getByTestId('col-2')).toBeDisabled()
    expect(screen.getByTestId('col-3')).toBeDisabled()
    expect(screen.getByTestId('col-1')).not.toBeDisabled()
  })

  it('should disable invalid axles when column is selected', () => {
    render(<TrailerSelectionPage />)
    fireEvent.click(screen.getByTestId('col-3'))
    expect(screen.getByTestId('axle-4')).toBeDisabled()
    expect(screen.getByTestId('axle-6')).toBeDisabled()
    expect(screen.getByTestId('axle-8')).toBeDisabled()
    expect(screen.getByTestId('axle-10')).toBeDisabled()
    expect(screen.getByTestId('axle-12')).not.toBeDisabled()
    expect(screen.getByTestId('axle-16')).not.toBeDisabled()
  })

  it('should recalculate column validity when axle changes', () => {
    render(<TrailerSelectionPage />)
    fireEvent.click(screen.getByTestId('axle-4'))
    expect(screen.getByTestId('col-2')).toBeDisabled()

    fireEvent.click(screen.getByTestId('axle-6'))
    expect(screen.getByTestId('col-2')).not.toBeDisabled()
  })

  it('should recalculate axle validity when column changes', () => {
    render(<TrailerSelectionPage />)
    fireEvent.click(screen.getByTestId('col-1'))
    expect(screen.getByTestId('axle-10')).toBeDisabled()

    fireEvent.click(screen.getByTestId('col-2'))
    expect(screen.getByTestId('axle-10')).not.toBeDisabled()
  })

  it('should display teaching simplified note', () => {
    render(<TrailerSelectionPage />)
    expect(screen.getByText(/教学简化说明/)).toBeInTheDocument()
  })

  it('should not implement Day54 rule engine', () => {
    render(<TrailerSelectionPage />)
    expect(
      screen.queryByText(/配车通过|配车不通过|最终判定/),
    ).not.toBeInTheDocument()
  })

  it('should update validity when switching axle after selecting combination', () => {
    render(<TrailerSelectionPage />)
    fireEvent.click(screen.getByTestId('axle-6'))
    fireEvent.click(screen.getByTestId('col-2'))
    expect(screen.getByTestId('validation-success')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('axle-12'))
    expect(screen.getByTestId('col-1')).toBeDisabled()
    expect(screen.getByTestId('col-2')).not.toBeDisabled()
    expect(screen.getByTestId('col-3')).not.toBeDisabled()
  })

  it('should allow 12+3 combination', () => {
    render(<TrailerSelectionPage />)
    fireEvent.click(screen.getByTestId('axle-12'))
    fireEvent.click(screen.getByTestId('col-3'))
    expect(screen.getByTestId('validation-success')).toBeInTheDocument()
    expect(screen.getByTestId('btn-continue')).not.toBeDisabled()
  })

  it('should allow 16+2 combination', () => {
    render(<TrailerSelectionPage />)
    fireEvent.click(screen.getByTestId('axle-16'))
    fireEvent.click(screen.getByTestId('col-2'))
    expect(screen.getByTestId('validation-success')).toBeInTheDocument()
  })
})
