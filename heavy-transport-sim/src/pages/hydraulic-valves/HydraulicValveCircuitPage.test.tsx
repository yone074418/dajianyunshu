import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HydraulicValveCircuitPage from './HydraulicValveCircuitPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <HydraulicValveCircuitPage />
    </MemoryRouter>,
  )
}

describe('HydraulicValveCircuitPage', () => {
  it('renders page title', () => {
    renderPage()
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('阀门')
    expect(heading.textContent).toContain('回路')
  })

  it('shows scope note about Day76 not implemented', () => {
    renderPage()
    expect(screen.getByText(/未实现 Day76/)).toBeDefined()
  })

  it('shows scope note about real hydraulic not implemented', () => {
    renderPage()
    expect(screen.getByText(/未实现真实液压压力/)).toBeDefined()
  })

  it('shows blocked message when starting without three point result', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByTestId('btn-start-without-result'))
    expect(screen.getByTestId('error-feedback')).toBeDefined()
    const blockedElements = screen.getAllByText(/需先完成液压支撑三点编点/)
    expect(blockedElements.length).toBeGreaterThanOrEqual(1)
  })

  it('starts with demo data and shows three regions', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByTestId('btn-start-with-demo'))
    expect(screen.getByTestId('region-card-front_region')).toBeDefined()
    expect(screen.getByTestId('region-card-middle_region')).toBeDefined()
    expect(screen.getByTestId('region-card-rear_region')).toBeDefined()
  })

  it('shows three valve toggle buttons', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByTestId('btn-start-with-demo'))
    const buttons = screen.getAllByTestId(/toggle-valve-/)
    expect(buttons).toHaveLength(3)
  })

  it('shows overall circuit state', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByTestId('btn-start-with-demo'))
    expect(screen.getByTestId('overall-circuit-state')).toBeDefined()
    expect(screen.getByText(/全部断开/)).toBeDefined()
  })

  it('opens front valve and region shows connected', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByTestId('btn-start-with-demo'))

    const toggleButtons = screen.getAllByTestId(/toggle-valve-/)
    await user.click(toggleButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/部分连通/)).toBeDefined()
    })
    const connectedElements = screen.getAllByText(/连通/)
    expect(connectedElements.length).toBeGreaterThanOrEqual(1)
  })

  it('opens all three valves and shows all_connected', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByTestId('btn-start-with-demo'))

    const toggleButtons = screen.getAllByTestId(/toggle-valve-/)
    for (const btn of toggleButtons) {
      await user.click(btn)
    }

    await waitFor(() => {
      expect(screen.getByText(/全部连通/)).toBeDefined()
    })
  })

  it('closes a valve and region shows disconnected', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByTestId('btn-start-with-demo'))

    const toggleButtons = screen.getAllByTestId(/toggle-valve-/)
    // Open all
    for (const btn of toggleButtons) {
      await user.click(btn)
    }
    // Close first
    await user.click(toggleButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/部分连通/)).toBeDefined()
    })
  })

  it('reset returns all valves to closed', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByTestId('btn-start-with-demo'))

    const toggleButtons = screen.getAllByTestId(/toggle-valve-/)
    await user.click(toggleButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/部分连通/)).toBeDefined()
    })

    await user.click(screen.getByTestId('btn-reset-valves'))

    await waitFor(() => {
      expect(screen.getByText(/全部断开/)).toBeDefined()
    })
  })

  it('shows operation log entries', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByTestId('btn-start-with-demo'))
    expect(screen.getByTestId('operation-log')).toBeDefined()
  })

  it('valve toggle logs are recorded', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByTestId('btn-start-with-demo'))

    const toggleButtons = screen.getAllByTestId(/toggle-valve-/)
    await user.click(toggleButtons[0])

    expect(screen.getByText(/open_valve/)).toBeDefined()
  })

  it('region display text updates when valve toggled', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByTestId('btn-start-with-demo'))

    // Initially all show disconnected
    const disconnectTexts = screen.getAllByText(/未连通/)
    expect(disconnectTexts.length).toBeGreaterThanOrEqual(3)

    // Open one valve
    const toggleButtons = screen.getAllByTestId(/toggle-valve-/)
    await user.click(toggleButtons[0])

    // Should now have connected text
    await waitFor(() => {
      expect(screen.getByText(/连通.*阀门开启/)).toBeDefined()
    })
  })
})
