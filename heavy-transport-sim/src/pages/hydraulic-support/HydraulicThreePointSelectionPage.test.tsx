import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HydraulicThreePointSelectionPage from './HydraulicThreePointSelectionPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <HydraulicThreePointSelectionPage />
    </MemoryRouter>,
  )
}

describe('HydraulicThreePointSelectionPage', () => {
  it('renders page title', () => {
    renderPage()
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('液压支撑')
    expect(heading.textContent).toContain('三点编点')
  })

  it('shows scope note about Day75 not implemented', () => {
    renderPage()
    expect(screen.getByText(/未实现 Day75/)).toBeDefined()
  })

  it('shows scope note about Day76 not implemented', () => {
    renderPage()
    expect(screen.getByText(/未实现 Day76/)).toBeDefined()
  })

  it('shows blocked message when starting without trailer result', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-start-without-result'))
    const blockedElements = screen.getAllByText(/需先完成挂车轴线/)
    expect(blockedElements.length).toBeGreaterThanOrEqual(1)
  })

  it('starts with demo data and shows workspace', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-start-with-demo'))
    expect(screen.getByTestId('hydraulic-workspace')).toBeDefined()
    expect(screen.getByTestId('region-display')).toBeDefined()
  })

  it('shows three hydraulic regions', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-start-with-demo'))
    expect(screen.getByTestId('region-card-front_region')).toBeDefined()
    expect(screen.getByTestId('region-card-middle_region')).toBeDefined()
    expect(screen.getByTestId('region-card-rear_region')).toBeDefined()
  })

  it('shows selection progress 0/3', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-start-with-demo'))
    expect(screen.getByText('0/3')).toBeDefined()
  })

  it('selects first support point', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-start-with-demo'))

    // Find first available support point button
    const pointButtons = screen.getAllByTestId(/support-point-/)
    expect(pointButtons.length).toBeGreaterThan(0)

    await user.click(pointButtons[0])
    expect(screen.getByText('1/3')).toBeDefined()
  })

  it('selects 3 points from different regions', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-start-with-demo'))

    // Get all point buttons
    const pointButtons = screen.getAllByTestId(/support-point-/)

    // Click first available point for each region
    // Front region points
    const frontPoint = pointButtons.find((btn) =>
      btn.textContent?.includes('纵列 1 · 轴线 1'),
    )
    if (frontPoint) await user.click(frontPoint)

    // Middle region points
    await waitFor(() => {
      expect(screen.getByText('1/3')).toBeDefined()
    })
    const middlePoint = screen
      .getAllByTestId(/support-point-/)
      .find(
        (btn) =>
          btn.textContent?.includes('轴线 2') && !btn.hasAttribute('disabled'),
      )
    if (middlePoint) await user.click(middlePoint)

    // Rear region points
    await waitFor(() => {
      expect(screen.getByText('2/3')).toBeDefined()
    })
    const rearPoint = screen
      .getAllByTestId(/support-point-/)
      .find(
        (btn) =>
          btn.textContent?.includes('轴线 3') && !btn.hasAttribute('disabled'),
      )
    if (rearPoint) await user.click(rearPoint)

    await waitFor(() => {
      expect(screen.getByText('3/3')).toBeDefined()
    })
  })

  it('shows undo button after selecting a point', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-start-with-demo'))
    const pointButtons = screen.getAllByTestId(/support-point-/)
    await user.click(pointButtons[0])

    expect(screen.getByTestId('btn-undo')).toBeDefined()
  })

  it('undo removes last selected point', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-start-with-demo'))
    const pointButtons = screen.getAllByTestId(/support-point-/)
    await user.click(pointButtons[0])

    expect(screen.getByText('1/3')).toBeDefined()

    await user.click(screen.getByTestId('btn-undo'))
    expect(screen.getByText('0/3')).toBeDefined()
  })

  it('reset clears all selected points', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-start-with-demo'))
    const pointButtons = screen.getAllByTestId(/support-point-/)
    await user.click(pointButtons[0])

    expect(screen.getByText('1/3')).toBeDefined()

    await user.click(screen.getByTestId('btn-reset'))
    expect(screen.getByText('0/3')).toBeDefined()
  })

  it('shows operation log entries', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-start-with-demo'))
    expect(screen.getByTestId('operation-log')).toBeDefined()
  })

  it('shows selected points list', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-start-with-demo'))
    const pointButtons = screen.getAllByTestId(/support-point-/)
    await user.click(pointButtons[0])

    expect(screen.getByTestId('selected-points-list')).toBeDefined()
  })

  it('shows error feedback on blocked state', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-start-without-result'))
    expect(screen.getByTestId('error-feedback')).toBeDefined()
  })

  it('regions show "未选择" initially', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-start-with-demo'))
    const unselected = screen.getAllByText('未选择')
    expect(unselected.length).toBe(3)
  })
})
