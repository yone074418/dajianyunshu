import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TrailerAxleColumnAssemblyPage from './TrailerAxleColumnAssemblyPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <TrailerAxleColumnAssemblyPage />
    </MemoryRouter>,
  )
}

describe('TrailerAxleColumnAssemblyPage', () => {
  it('renders page title', () => {
    renderPage()
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('挂车轴线')
    expect(heading.textContent).toContain('纵列拼接')
  })

  it('shows scope note about Day74 not implemented', () => {
    renderPage()
    expect(screen.getByText(/未实现 Day74/)).toBeDefined()
  })

  it('shows scope note about Day76 not implemented', () => {
    renderPage()
    expect(screen.getByText(/未实现 Day76/)).toBeDefined()
  })

  it('shows target configuration selector', () => {
    renderPage()
    expect(screen.getByLabelText('轴线数')).toBeDefined()
    expect(screen.getByLabelText('纵列数')).toBeDefined()
    expect(screen.getByTestId('btn-select-configuration')).toBeDefined()
  })

  it('selects configuration and shows workspace', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-select-configuration'))

    expect(screen.getByTestId('trailer-assembly-workspace')).toBeDefined()
    expect(screen.getByTestId('module-palette')).toBeDefined()
  })

  it('selects 4x1 combination successfully', async () => {
    const user = userEvent.setup()
    renderPage()

    const axleSelect = screen.getByLabelText('轴线数')
    await user.selectOptions(axleSelect, '4')

    const columnSelect = screen.getByLabelText('纵列数') as HTMLSelectElement
    expect(columnSelect.value).toBe('1')

    await user.click(screen.getByTestId('btn-select-configuration'))
    expect(screen.getByTestId('trailer-assembly-workspace')).toBeDefined()
  })

  it('completes full assembly sequence for 4x1', async () => {
    const user = userEvent.setup()
    renderPage()

    // Select 4x1
    const axleSelect = screen.getByLabelText('轴线数')
    await user.selectOptions(axleSelect, '4')
    await user.click(screen.getByTestId('btn-select-configuration'))

    // Place main column
    await user.click(screen.getByTestId('btn-place-main-column'))

    // Add 4 axle modules
    const addAxleBtn = screen.getByTestId('add-axle-col-0')
    for (let i = 0; i < 4; i++) {
      await user.click(addAxleBtn)
    }

    // Connect tractor
    await waitFor(() => {
      expect(screen.getByTestId('btn-connect-tractor')).toBeDefined()
    })
    await user.click(screen.getByTestId('btn-connect-tractor'))

    // Align columns
    await waitFor(() => {
      expect(screen.getByTestId('btn-align-columns')).toBeDefined()
    })
    await user.click(screen.getByTestId('btn-align-columns'))

    // Complete
    await user.click(screen.getByTestId('btn-complete-assembly'))

    // Result should show
    await waitFor(() => {
      expect(screen.getByTestId('result-card')).toBeDefined()
    })
    expect(screen.getByText(/拼接完成结果/)).toBeDefined()
  })

  it('shows error when adding side column before main column axles', async () => {
    const user = userEvent.setup()
    renderPage()

    // Select 6x2
    const axleSelect = screen.getByLabelText('轴线数')
    await user.selectOptions(axleSelect, '6')
    await user.click(screen.getByTestId('btn-select-configuration'))

    // Place main column
    await user.click(screen.getByTestId('btn-place-main-column'))

    // Try to add side column before filling main column axles
    await user.click(screen.getByTestId('btn-add-side-column'))

    // Should show error feedback
    await waitFor(() => {
      expect(screen.getByTestId('error-feedback')).toBeDefined()
    })
    // Error message should mention completing main column first
    const errorFeedback = screen.getByTestId('error-feedback')
    expect(errorFeedback.textContent).toContain('主纵列')
  })

  it('shows error feedback on assembly error (complete without tractor)', async () => {
    const user = userEvent.setup()
    renderPage()

    // Select target (6x2 default)
    await user.click(screen.getByTestId('btn-select-configuration'))

    // Place main column
    await user.click(screen.getByTestId('btn-place-main-column'))

    // Fill main column axles (3 for 6x2)
    const addAxleBtn = screen.getByTestId('add-axle-col-0')
    for (let i = 0; i < 3; i++) {
      await user.click(addAxleBtn)
    }

    // Add side column
    await waitFor(() => {
      expect(screen.getByTestId('btn-add-side-column')).toBeDefined()
    })
    await user.click(screen.getByTestId('btn-add-side-column'))

    // Fill side column axles
    const addAxleBtn1 = screen.getByTestId('add-axle-col-1')
    for (let i = 0; i < 3; i++) {
      await user.click(addAxleBtn1)
    }

    // Try to complete without tractor connector
    await user.click(screen.getByTestId('btn-complete-assembly'))

    await waitFor(() => {
      expect(screen.getByTestId('error-feedback')).toBeDefined()
    })
    const errorFeedback = screen.getByTestId('error-feedback')
    expect(errorFeedback.textContent).toContain('牵引端')
  })

  it('resets assembly', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-select-configuration'))
    await user.click(screen.getByTestId('btn-place-main-column'))

    // Reset
    await user.click(screen.getByTestId('btn-reset-assembly'))

    // After reset, workspace should still exist but with 0 axles and 0 columns
    await waitFor(() => {
      const workspace = screen.getByTestId('trailer-assembly-workspace')
      expect(workspace.textContent).toContain('0轴线')
      expect(workspace.textContent).toContain('0纵列')
    })
  })

  it('shows operation log entries', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-select-configuration'))

    expect(screen.getByTestId('operation-log')).toBeDefined()
  })

  it('result shows axle count, column count, module count, and connection order', async () => {
    const user = userEvent.setup()
    renderPage()

    // Quick 4x1 assembly
    const axleSelect = screen.getByLabelText('轴线数')
    await user.selectOptions(axleSelect, '4')
    await user.click(screen.getByTestId('btn-select-configuration'))
    await user.click(screen.getByTestId('btn-place-main-column'))

    const addAxleBtn = screen.getByTestId('add-axle-col-0')
    for (let i = 0; i < 4; i++) {
      await user.click(addAxleBtn)
    }

    await waitFor(() => {
      expect(screen.getByTestId('btn-connect-tractor')).toBeDefined()
    })
    await user.click(screen.getByTestId('btn-connect-tractor'))

    await waitFor(() => {
      expect(screen.getByTestId('btn-align-columns')).toBeDefined()
    })
    await user.click(screen.getByTestId('btn-align-columns'))

    await user.click(screen.getByTestId('btn-complete-assembly'))

    await waitFor(() => {
      expect(screen.getByTestId('result-card')).toBeDefined()
    })

    const resultCard = screen.getByTestId('result-card')
    expect(resultCard.textContent).toContain('目标轴线数')
    expect(resultCard.textContent).toContain('4')
    expect(resultCard.textContent).toContain('目标纵列数')
    expect(resultCard.textContent).toContain('完成轴线数')
    expect(resultCard.textContent).toContain('模块总数')
    expect(resultCard.textContent).toContain('连接顺序')

    // Visual result
    expect(screen.getByTestId('result-visual')).toBeDefined()
  })

  it('shows step list after assembly steps', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('btn-select-configuration'))
    await user.click(screen.getByTestId('btn-place-main-column'))

    expect(screen.getByTestId('step-list')).toBeDefined()
  })

  it('teaching note mentions Day74 not implemented', async () => {
    const user = userEvent.setup()
    renderPage()

    // Quick 4x1
    const axleSelect = screen.getByLabelText('轴线数')
    await user.selectOptions(axleSelect, '4')
    await user.click(screen.getByTestId('btn-select-configuration'))
    await user.click(screen.getByTestId('btn-place-main-column'))

    const addAxleBtn = screen.getByTestId('add-axle-col-0')
    for (let i = 0; i < 4; i++) {
      await user.click(addAxleBtn)
    }

    await waitFor(() => {
      expect(screen.getByTestId('btn-connect-tractor')).toBeDefined()
    })
    await user.click(screen.getByTestId('btn-connect-tractor'))

    await waitFor(() => {
      expect(screen.getByTestId('btn-align-columns')).toBeDefined()
    })
    await user.click(screen.getByTestId('btn-align-columns'))

    await user.click(screen.getByTestId('btn-complete-assembly'))

    await waitFor(() => {
      expect(screen.getByTestId('result-card')).toBeDefined()
    })

    // Teaching note should mention Day74 (appears in page description and result)
    const day74Elements = screen.getAllByText(/Day74/)
    expect(day74Elements.length).toBeGreaterThanOrEqual(1)
  })
})
