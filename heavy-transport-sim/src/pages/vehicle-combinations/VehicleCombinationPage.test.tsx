import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import VehicleCombinationPage from './VehicleCombinationPage'
import { useCombinationSelectionStore } from '../../stores/combinationSelection'

beforeEach(() => {
  useCombinationSelectionStore.getState().reset()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('VehicleCombinationPage', () => {
  it('should render the page', () => {
    render(<VehicleCombinationPage />)
    expect(screen.getByTestId('vehicle-combination-page')).toBeInTheDocument()
  })

  it('should display page title', () => {
    render(<VehicleCombinationPage />)
    expect(screen.getByText(/组合方式选择与动画演示/)).toBeInTheDocument()
  })

  it('should display all 3 combinations', () => {
    render(<VehicleCombinationPage />)
    expect(
      screen.getByTestId('option-card-full_trailer_combination'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('option-card-semi_trailer_combination'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('option-card-self_propelled_modular_transporter'),
    ).toBeInTheDocument()
  })

  it('should display combination names', () => {
    render(<VehicleCombinationPage />)
    expect(screen.getByText('全挂车组合')).toBeInTheDocument()
    expect(screen.getByText('半挂车组合')).toBeInTheDocument()
    expect(screen.getByText('自行式轴线车组合')).toBeInTheDocument()
  })

  it('should show no selection hint when nothing is selected', () => {
    render(<VehicleCombinationPage />)
    expect(screen.getByTestId('no-selection-hint')).toBeInTheDocument()
  })

  it('should display explanation text about Day51 scope', () => {
    render(<VehicleCombinationPage />)
    expect(screen.getByText(/本阶段仅演示组合方式/)).toBeInTheDocument()
  })
})

describe('Combination selection', () => {
  it('should select full trailer combination on click', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    expect(
      screen.getByTestId('selected-badge-full_trailer_combination'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('selected-label')).toHaveTextContent(
      '已选择：全挂车组合',
    )
  })

  it('should select semi trailer combination on click', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-semi_trailer_combination'))
    expect(
      screen.getByTestId('selected-badge-semi_trailer_combination'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('selected-label')).toHaveTextContent(
      '已选择：半挂车组合',
    )
  })

  it('should select self propelled axle combination on click', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(
      screen.getByTestId('option-card-self_propelled_modular_transporter'),
    )
    expect(
      screen.getByTestId('selected-badge-self_propelled_modular_transporter'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('selected-label')).toHaveTextContent(
      '已选择：自行式轴线车组合',
    )
  })

  it('should show detail panel after selection', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    expect(
      screen.getByTestId('detail-panel-full_trailer_combination'),
    ).toBeInTheDocument()
  })

  it('should hide no-selection hint after selection', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    expect(screen.queryByTestId('no-selection-hint')).not.toBeInTheDocument()
  })

  it('should switch selection to another combination', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    expect(screen.getByTestId('selected-label')).toHaveTextContent(
      '已选择：全挂车组合',
    )
    fireEvent.click(screen.getByTestId('option-card-semi_trailer_combination'))
    expect(screen.getByTestId('selected-label')).toHaveTextContent(
      '已选择：半挂车组合',
    )
    expect(
      screen.queryByTestId('selected-badge-full_trailer_combination'),
    ).not.toBeInTheDocument()
  })
})

describe('Detail panel content', () => {
  it('should display full trailer advantages', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    expect(screen.getAllByText(/结构直观/).length).toBeGreaterThan(0)
  })

  it('should display full trailer disadvantages', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    expect(screen.getByText(/倒车和转弯控制难度较高/)).toBeInTheDocument()
  })

  it('should display semi trailer advantages', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-semi_trailer_combination'))
    expect(screen.getAllByText(/鞍座连接/).length).toBeGreaterThan(0)
  })

  it('should display self propelled axle advantages', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(
      screen.getByTestId('option-card-self_propelled_modular_transporter'),
    )
    expect(screen.getAllByText(/承载能力极强/).length).toBeGreaterThan(0)
  })

  it('should display teaching tips', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    expect(screen.getByText(/引导学生观察牵引杆/)).toBeInTheDocument()
  })

  it('should display related stages', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    expect(screen.getByText(/简单配车 → 车组确定/)).toBeInTheDocument()
  })
})

describe('Animation player', () => {
  it('should show animation player after selection', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    expect(
      screen.getByTestId('animation-player-full_trailer_combination'),
    ).toBeInTheDocument()
  })

  it('should show idle state initially', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    expect(screen.getByTestId('animation-idle')).toBeInTheDocument()
    expect(screen.getByTestId('btn-play')).toBeInTheDocument()
  })

  it('should start animation on play click', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    fireEvent.click(screen.getByTestId('btn-play'))
    expect(screen.getByTestId('step-title')).toHaveTextContent(
      '步骤 1/4：牵引车靠近挂车',
    )
    expect(screen.getByTestId('btn-pause')).toBeInTheDocument()
  })

  it('should advance steps automatically', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    fireEvent.click(screen.getByTestId('btn-play'))
    expect(screen.getByTestId('step-title')).toHaveTextContent(
      '步骤 1/4：牵引车靠近挂车',
    )

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByTestId('step-title')).toHaveTextContent(
      '步骤 2/4：连接牵引杆',
    )
  })

  it('should pause animation', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    fireEvent.click(screen.getByTestId('btn-play'))
    fireEvent.click(screen.getByTestId('btn-pause'))
    expect(screen.getByTestId('btn-resume')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.getByTestId('step-title')).toHaveTextContent(
      '步骤 1/4：牵引车靠近挂车',
    )
  })

  it('should resume after pause', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    fireEvent.click(screen.getByTestId('btn-play'))
    fireEvent.click(screen.getByTestId('btn-pause'))
    fireEvent.click(screen.getByTestId('btn-resume'))

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByTestId('step-title')).toHaveTextContent(
      '步骤 2/4：连接牵引杆',
    )
  })

  it('should reset animation', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    fireEvent.click(screen.getByTestId('btn-play'))
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    fireEvent.click(screen.getByTestId('btn-reset'))
    expect(screen.getByTestId('animation-idle')).toBeInTheDocument()
    expect(screen.getByTestId('btn-play')).toBeInTheDocument()
  })

  it('should show completed state after all steps', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    fireEvent.click(screen.getByTestId('btn-play'))

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    act(() => {
      vi.advanceTimersByTime(2500)
    })

    expect(screen.getByTestId('animation-completed')).toBeInTheDocument()
    expect(screen.getByText('演示完成')).toBeInTheDocument()
  })

  it('should show progress bar', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    expect(screen.getByTestId('animation-progress')).toBeInTheDocument()
  })

  it('should display component layout', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    expect(screen.getByTestId('component-tractor')).toBeInTheDocument()
    expect(screen.getByTestId('component-drawbar')).toBeInTheDocument()
    expect(screen.getByTestId('component-trailer')).toBeInTheDocument()
    expect(screen.getByTestId('component-cargo')).toBeInTheDocument()
  })
})

describe('Different animations for each combination', () => {
  it('should play full trailer animation steps', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    fireEvent.click(screen.getByTestId('btn-play'))
    expect(screen.getByTestId('step-title')).toHaveTextContent('牵引车靠近挂车')
  })

  it('should play semi trailer animation steps', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-semi_trailer_combination'))
    fireEvent.click(screen.getByTestId('btn-play'))
    expect(screen.getByTestId('step-title')).toHaveTextContent('倒车对位')
  })

  it('should play self propelled axle animation steps', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(
      screen.getByTestId('option-card-self_propelled_modular_transporter'),
    )
    fireEvent.click(screen.getByTestId('btn-play'))
    expect(screen.getByTestId('step-title')).toHaveTextContent('模块组装')
  })

  it('should use different component layouts for each combination', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    expect(screen.getByTestId('component-drawbar')).toBeInTheDocument()
    expect(screen.queryByTestId('component-saddle')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('option-card-semi_trailer_combination'))
    expect(screen.getByTestId('component-saddle')).toBeInTheDocument()
    expect(screen.queryByTestId('component-drawbar')).not.toBeInTheDocument()
  })

  it('should reset animation when switching combinations', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    fireEvent.click(screen.getByTestId('btn-play'))
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    fireEvent.click(screen.getByTestId('option-card-semi_trailer_combination'))
    expect(screen.getByTestId('animation-idle')).toBeInTheDocument()
  })
})

describe('Animation controls', () => {
  it('should not show pause when idle', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    expect(screen.queryByTestId('btn-pause')).not.toBeInTheDocument()
  })

  it('should not show reset when idle', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    expect(screen.queryByTestId('btn-reset')).not.toBeInTheDocument()
  })

  it('should show play again after completion', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    fireEvent.click(screen.getByTestId('btn-play'))
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    expect(screen.getByTestId('btn-play')).toBeInTheDocument()
  })
})

describe('No Day52 tractor parameters', () => {
  it('should not display 6x6 tractor parameter selection', () => {
    render(<VehicleCombinationPage />)
    expect(screen.queryByText(/6x6.*牵引车参数/)).not.toBeInTheDocument()
    expect(screen.queryByText(/8x8.*牵引车参数/)).not.toBeInTheDocument()
  })
})

describe('No Day54 rule engine', () => {
  it('should not display correct/incorrect judgment', () => {
    render(<VehicleCombinationPage />)
    fireEvent.click(screen.getByTestId('option-card-full_trailer_combination'))
    expect(
      screen.queryByText(
        /选择正确|选择错误|配车正确|配车错误|方案正确|方案错误/,
      ),
    ).not.toBeInTheDocument()
  })
})
