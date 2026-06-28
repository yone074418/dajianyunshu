import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TaskIntroductionPage from './TaskIntroductionPage'

const mockStorage = new Map<string, string>()

beforeEach(() => {
  mockStorage.clear()
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) =>
    mockStorage.has(key) ? mockStorage.get(key)! : null,
  )
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
    (key: string, value: string) => {
      mockStorage.set(key, value)
    },
  )
})

describe('TaskIntroductionPage with hints', () => {
  it('should render the page', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByTestId('task-introduction-page')).toBeInTheDocument()
  })

  it('should display page title', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByText('运输任务及货物介绍')).toBeInTheDocument()
  })

  it('should display hint panel', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByTestId('hint-panel')).toBeInTheDocument()
  })

  it('should display hint buttons', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByTestId('hint-btn-hint-task-intro-1')).toBeInTheDocument()
  })

  it('should show hint content when clicking hint button', async () => {
    render(<TaskIntroductionPage />)
    fireEvent.click(screen.getByTestId('hint-btn-hint-task-intro-1'))
    await waitFor(() => {
      expect(
        screen.getByTestId('hint-content-hint-task-intro-1'),
      ).toBeInTheDocument()
    })
  })

  it('should display continue button', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByTestId('continue-btn')).toBeInTheDocument()
  })

  it('should display origin and destination', () => {
    render(<TaskIntroductionPage />)
    expect(screen.getByText('东港重型装备制造厂')).toBeInTheDocument()
    expect(screen.getByText('西郊 500kV 变电站施工现场')).toBeInTheDocument()
  })
})
