import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LearningCenterPage from './LearningCenterPage'

describe('LearningCenterPage', () => {
  it('should render the page', () => {
    render(<LearningCenterPage />)
    expect(screen.getByTestId('learning-center-page')).toBeInTheDocument()
  })

  it('should display page title', () => {
    render(<LearningCenterPage />)
    expect(screen.getByText('知识学习')).toBeInTheDocument()
  })

  it('should display all 5 categories', () => {
    render(<LearningCenterPage />)
    expect(screen.getByTestId('category-vehicle')).toBeInTheDocument()
    expect(screen.getByTestId('category-route')).toBeInTheDocument()
    expect(screen.getByTestId('category-loading')).toBeInTheDocument()
    expect(screen.getByTestId('category-lashing')).toBeInTheDocument()
    expect(screen.getByTestId('category-safety')).toBeInTheDocument()
  })

  it('should display vehicle category title', () => {
    render(<LearningCenterPage />)
    expect(screen.getByText('车辆知识')).toBeInTheDocument()
  })

  it('should display route category title', () => {
    render(<LearningCenterPage />)
    expect(screen.getByText('路线知识')).toBeInTheDocument()
  })

  it('should display loading category title', () => {
    render(<LearningCenterPage />)
    expect(screen.getByText('装车知识')).toBeInTheDocument()
  })

  it('should display lashing category title', () => {
    render(<LearningCenterPage />)
    expect(screen.getByText('绑扎知识')).toBeInTheDocument()
  })

  it('should display safety category title', () => {
    render(<LearningCenterPage />)
    expect(screen.getByText('安全知识')).toBeInTheDocument()
  })

  it('should display chapter titles', () => {
    render(<LearningCenterPage />)
    expect(screen.getByText('牵引车基础')).toBeInTheDocument()
    expect(screen.getByText('挂车与轴线车')).toBeInTheDocument()
  })

  it('should display category learning objectives', () => {
    render(<LearningCenterPage />)
    expect(screen.getByText(/理解牵引车和挂车的基本结构/)).toBeInTheDocument()
  })

  it('should display estimated time for chapters', () => {
    render(<LearningCenterPage />)
    expect(screen.getAllByText(/约 \d+ 分钟/).length).toBeGreaterThan(0)
  })

  it('should expand chapter on click', () => {
    render(<LearningCenterPage />)
    const chapterHeader = screen.getByText('牵引车基础')
    fireEvent.click(chapterHeader)
    expect(screen.getByText(/牵引车是大件运输的动力来源/)).toBeInTheDocument()
  })

  it('should display key concepts when expanded', () => {
    render(<LearningCenterPage />)
    fireEvent.click(screen.getByText('牵引车基础'))
    expect(screen.getByText('驱动形式')).toBeInTheDocument()
    expect(screen.getByText('牵引力')).toBeInTheDocument()
  })

  it('should display related stages when expanded', () => {
    render(<LearningCenterPage />)
    fireEvent.click(screen.getByText('牵引车基础'))
    expect(screen.getByText(/关联实验阶段：/)).toBeInTheDocument()
  })

  it('should show progress save note', () => {
    render(<LearningCenterPage />)
    expect(
      screen.getByText(/学习进度保存功能将在后续版本中实现/),
    ).toBeInTheDocument()
  })

  it('should not display progress bar or completion percentage', () => {
    render(<LearningCenterPage />)
    expect(screen.queryByText(/已完成/)).not.toBeInTheDocument()
    expect(screen.queryByText(/完成度/)).not.toBeInTheDocument()
    expect(screen.queryByText(/已读/)).not.toBeInTheDocument()
  })
})
