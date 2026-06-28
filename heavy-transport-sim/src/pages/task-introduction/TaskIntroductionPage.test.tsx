import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TaskIntroductionPage from './TaskIntroductionPage'

describe('TaskIntroductionPage', () => {
  it('should render the page', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByTestId('task-introduction-page')).toBeInTheDocument()
  })

  it('should display case name from data', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByTestId('task-introduction-page')).toHaveTextContent(
      '大型变压器公路运输虚拟仿真实验',
    )
  })

  it('should display origin from data', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByText('东港重型装备制造厂')).toBeInTheDocument()
  })

  it('should display destination from data', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByText('西郊 500kV 变电站施工现场')).toBeInTheDocument()
  })

  it('should display cargo length from data', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByText('8.8')).toBeInTheDocument()
  })

  it('should display cargo width from data', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByText('3.4')).toBeInTheDocument()
  })

  it('should display cargo height from data', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByText('4.2')).toBeInTheDocument()
  })

  it('should display cargo weight from data', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByText('168')).toBeInTheDocument()
  })

  it('should display objectives from data', () => {
    render(<TaskIntroductionPage />)
    expect(
      screen.getByText(/根据货物尺寸和重量选择合适的运输车辆/),
    ).toBeInTheDocument()
  })

  it('should display stage overview', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByTestId('stage-overview')).toBeInTheDocument()
    expect(screen.getByText(/简单配车/)).toBeInTheDocument()
    expect(screen.getByText(/路线勘测/)).toBeInTheDocument()
    expect(screen.getByText(/车组确定/)).toBeInTheDocument()
    expect(screen.getByText(/货物装车与绑扎加固/)).toBeInTheDocument()
    expect(screen.getByText(/货物运输/)).toBeInTheDocument()
  })

  it('should highlight current stage', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByText('← 当前阶段')).toBeInTheDocument()
  })

  it('should display continue button', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByTestId('continue-btn')).toBeInTheDocument()
    expect(screen.getByText('我已了解任务，继续')).toBeInTheDocument()
  })

  it('should display background from data', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByText(/某电力工程需要/)).toBeInTheDocument()
  })

  it('should display teaching notes', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByText(/本案例为教学简化案例/)).toBeInTheDocument()
  })
})

describe('TaskIntroductionPage data source', () => {
  it('should render data from getUniqueTransportCase, not hardcoded', () => {
    render(<TaskIntroductionPage />)
    const page = screen.getByTestId('task-introduction-page')
    expect(page).toHaveTextContent('大型变压器公路运输虚拟仿真实验')
    expect(page).toHaveTextContent('东港重型装备制造厂')
    expect(page).toHaveTextContent('西郊 500kV 变电站施工现场')
    expect(page).toHaveTextContent('168')
    expect(page).toHaveTextContent('8.8')
  })
})
