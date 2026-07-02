import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AxleLoadRulePage from './AxleLoadRulePage'

function renderPage() {
  return render(
    <MemoryRouter>
      <AxleLoadRulePage />
    </MemoryRouter>,
  )
}

describe('AxleLoadRulePage', () => {
  it('renders page title', () => {
    renderPage()
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('轴线载荷')
    expect(heading.textContent).toContain('车组确定')
  })

  it('shows teaching simplification notice', () => {
    renderPage()
    const elements = screen.getAllByText(/教学简化/)
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows scope note about Day77 not implemented', () => {
    renderPage()
    expect(screen.getByText(/未实现 Day77/)).toBeDefined()
  })

  it('shows input form', () => {
    renderPage()
    expect(screen.getByTestId('input-cargo-mass')).toBeDefined()
    expect(screen.getByTestId('input-axle-lines')).toBeDefined()
    expect(screen.getByTestId('input-columns')).toBeDefined()
    expect(screen.getByTestId('btn-run-rule')).toBeDefined()
  })

  it('runs rule and shows result card', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-run-rule'))

    await waitFor(() => {
      expect(screen.getByTestId('result-card')).toBeDefined()
    })
    expect(screen.getByTestId('calculation-card')).toBeDefined()
  })

  it('shows calculation process', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-run-rule'))

    await waitFor(() => {
      expect(screen.getByTestId('calculation-card')).toBeDefined()
    })
    const elements = screen.getAllByText(/平均单轴线载荷/)
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows operation log entries', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-run-rule'))

    await waitFor(() => {
      expect(screen.getByTestId('operation-log')).toBeDefined()
    })
  })

  it('shows reselection flow after running rule', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-run-rule'))

    await waitFor(() => {
      expect(screen.getByTestId('reselection-flow')).toBeDefined()
    })
  })

  it('reselection allows recalculating', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-run-rule'))

    await waitFor(() => {
      expect(screen.getByTestId('reselection-flow')).toBeDefined()
    })
    await user.click(screen.getByTestId('btn-apply-changes'))

    await waitFor(() => {
      expect(screen.getByTestId('btn-recalculate')).toBeDefined()
    })
    await user.click(screen.getByTestId('btn-recalculate'))

    await waitFor(() => {
      expect(screen.getByTestId('btn-confirm-vehicle')).toBeDefined()
    })
  })

  it('confirm vehicle generates final summary', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-run-rule'))

    await waitFor(() => {
      expect(screen.getByTestId('reselection-flow')).toBeDefined()
    })
    await user.click(screen.getByTestId('btn-apply-changes'))

    await waitFor(() => {
      expect(screen.getByTestId('btn-recalculate')).toBeDefined()
    })
    await user.click(screen.getByTestId('btn-recalculate'))

    await waitFor(() => {
      expect(screen.getByTestId('btn-confirm-vehicle')).toBeDefined()
    })
    await user.click(screen.getByTestId('btn-confirm-vehicle'))

    await waitFor(() => {
      expect(screen.getByTestId('final-vehicle-card')).toBeDefined()
    })
    expect(screen.getByText(/最终车组已确认/)).toBeDefined()
  })

  it('shows result card with load data', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-run-rule'))

    await waitFor(() => {
      expect(screen.getByTestId('result-card')).toBeDefined()
    })
    const elements = screen.getAllByText(/载荷余量/)
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })
})
