import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LearningCenterPage from './LearningCenterPage'

beforeEach(() => {
  localStorage.clear()
})

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

  it('should show persisted learning progress summary', () => {
    render(<LearningCenterPage />)
    expect(screen.getByTestId('learning-progress-summary')).toBeInTheDocument()
    expect(screen.getByText(/学习进度：0 \/ \d+ 章节已读/)).toBeInTheDocument()
  })

  it('should mark expanded chapter as read', async () => {
    render(<LearningCenterPage />)
    fireEvent.click(screen.getByText('牵引车基础'))
    fireEvent.click(screen.getByTestId('mark-read-vehicle-tractor-basics'))

    await waitFor(() => {
      expect(screen.getByText('已读')).toBeInTheDocument()
    })
    expect(screen.getByText(/学习进度：1 \/ \d+ 章节已读/)).toBeInTheDocument()
  })
})
