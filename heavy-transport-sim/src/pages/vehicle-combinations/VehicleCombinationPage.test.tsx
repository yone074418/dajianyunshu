import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import VehicleCombinationPage from './VehicleCombinationPage'

describe('VehicleCombinationPage', () => {
  it('should render the page', () => {
    render(<VehicleCombinationPage />)
    expect(screen.getByTestId('vehicle-combination-page')).toBeInTheDocument()
  })

  it('should display page title', () => {
    render(<VehicleCombinationPage />)
    expect(screen.getByText(/简单配车/)).toBeInTheDocument()
  })

  it('should display all 3 combinations', () => {
    render(<VehicleCombinationPage />)
    expect(
      screen.getByTestId('combo-full_trailer_combination'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('combo-semi_trailer_combination'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('combo-self_propelled_modular_transporter'),
    ).toBeInTheDocument()
  })

  it('should display combination names', () => {
    render(<VehicleCombinationPage />)
    expect(screen.getByText('全挂车组合')).toBeInTheDocument()
    expect(screen.getByText('半挂车组合')).toBeInTheDocument()
    expect(screen.getByText('自行式轴线车组合')).toBeInTheDocument()
  })

  it('should display weight ranges', () => {
    render(<VehicleCombinationPage />)
    expect(screen.getByText(/10 - 80 t/)).toBeInTheDocument()
    expect(screen.getByText(/20 - 120 t/)).toBeInTheDocument()
    expect(screen.getByText(/50 - 500 t/)).toBeInTheDocument()
  })

  it('should display advantages', () => {
    render(<VehicleCombinationPage />)
    expect(screen.getAllByText(/结构直观/).length).toBeGreaterThan(0)
  })

  it('should display disadvantages', () => {
    render(<VehicleCombinationPage />)
    expect(screen.getByText(/倒车和转弯控制难度较高/)).toBeInTheDocument()
  })

  it('should display demo config toggle button', () => {
    render(<VehicleCombinationPage />)
    expect(
      screen.getByTestId('demo-toggle-full_trailer_combination'),
    ).toBeInTheDocument()
  })

  it('should expand demo config on click', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('demo-toggle-full_trailer_combination'))
    expect(
      screen.getByTestId('demo-config-full_trailer_combination'),
    ).toBeInTheDocument()
  })

  it('should display demo animation steps when expanded', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('demo-toggle-full_trailer_combination'))
    expect(screen.getByText(/牵引车靠近挂车/)).toBeInTheDocument()
  })

  it('should display note about Day51', () => {
    render(<VehicleCombinationPage />)
    expect(
      screen.getByText(/组合选择和动画演示将在 Day51 实现/),
    ).toBeInTheDocument()
  })
})
