import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LearningCenterPage from './LearningCenterPage'

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
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(
    (key: string) => {
      mockStorage.delete(key)
    },
  )
})

describe('LearningCenterPage with progress', () => {
  it('should render the page', () => {
    render(<LearningCenterPage />)
    expect(screen.getByTestId('learning-center-page')).toBeInTheDocument()
  })

  it('should display progress summary', () => {
    render(<LearningCenterPage />)
    expect(screen.getByTestId('learning-progress-summary')).toHaveTextContent(
      '已读 0 / 10',
    )
  })

  it('should display all chapters as unread initially', () => {
    render(<LearningCenterPage />)
    expect(screen.getAllByText('未读').length).toBeGreaterThan(0)
  })

  it('should mark chapter as read on button click', async () => {
    render(<LearningCenterPage />)
    const btn = screen.getByTestId('mark-read-vehicle-tractor-basics')
    fireEvent.click(btn)
    await waitFor(() => {
      expect(
        screen.getByTestId('chapter-status-vehicle-tractor-basics'),
      ).toHaveTextContent('已读')
    })
  })

  it('should update progress summary after marking read', async () => {
    render(<LearningCenterPage />)
    fireEvent.click(screen.getByTestId('mark-read-vehicle-tractor-basics'))
    await waitFor(() => {
      expect(screen.getByTestId('learning-progress-summary')).toHaveTextContent(
        '已读 1 / 10',
      )
    })
  })

  it('should update category progress after marking read', async () => {
    render(<LearningCenterPage />)
    fireEvent.click(screen.getByTestId('mark-read-vehicle-tractor-basics'))
    await waitFor(() => {
      expect(screen.getByTestId('category-progress-vehicle')).toHaveTextContent(
        '已读 1 / 2',
      )
    })
  })

  it('should persist progress in localStorage', async () => {
    render(<LearningCenterPage />)
    fireEvent.click(screen.getByTestId('mark-read-vehicle-tractor-basics'))
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalled()
    })
  })

  it('should restore progress from localStorage on remount', async () => {
    mockStorage.set(
      'heavy-transport-sim:learning-progress:v1:student-local-001:attempt-local-001',
      JSON.stringify([
        {
          studentId: 'student-local-001',
          attemptId: 'attempt-local-001',
          caseId: 'case_heavy_transformer_transport_v1',
          chapterId: 'vehicle-tractor-basics',
          categoryId: 'vehicle',
          readAt: '2026-01-01T00:00:00.000Z',
        },
      ]),
    )

    render(<LearningCenterPage />)
    await waitFor(() => {
      expect(
        screen.getByTestId('chapter-status-vehicle-tractor-basics'),
      ).toHaveTextContent('已读')
    })
    expect(screen.getByTestId('learning-progress-summary')).toHaveTextContent(
      '已读 1 / 10',
    )
  })

  it('should not show mark-read button for already read chapters', async () => {
    mockStorage.set(
      'heavy-transport-sim:learning-progress:v1:student-local-001:attempt-local-001',
      JSON.stringify([
        {
          studentId: 'student-local-001',
          attemptId: 'attempt-local-001',
          caseId: 'case_heavy_transformer_transport_v1',
          chapterId: 'vehicle-tractor-basics',
          categoryId: 'vehicle',
          readAt: '2026-01-01T00:00:00.000Z',
        },
      ]),
    )

    render(<LearningCenterPage />)
    await waitFor(() => {
      expect(
        screen.queryByTestId('mark-read-vehicle-tractor-basics'),
      ).not.toBeInTheDocument()
    })
  })

  it('should handle corrupted localStorage gracefully', () => {
    mockStorage.set(
      'heavy-transport-sim:learning-progress:v1:student-local-001:attempt-local-001',
      'not-valid-json!!!',
    )

    render(<LearningCenterPage />)
    expect(screen.getByTestId('learning-progress-summary')).toHaveTextContent(
      '已读 0 / 10',
    )
  })

  it('should display all 5 categories', () => {
    render(<LearningCenterPage />)
    expect(screen.getByTestId('category-vehicle')).toBeInTheDocument()
    expect(screen.getByTestId('category-route')).toBeInTheDocument()
    expect(screen.getByTestId('category-loading')).toBeInTheDocument()
    expect(screen.getByTestId('category-lashing')).toBeInTheDocument()
    expect(screen.getByTestId('category-safety')).toBeInTheDocument()
  })
})
