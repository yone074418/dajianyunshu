import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import LearningCompletionOverview from './LearningCompletionOverview'

const mockStorage = new Map<string, string>()

beforeEach(() => {
  mockStorage.clear()
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) =>
    mockStorage.has(key) ? mockStorage.get(key)! : null,
  )
})

describe('LearningCompletionOverview', () => {
  it('should render the overview', async () => {
    render(<LearningCompletionOverview />)
    await waitFor(() => {
      expect(
        screen.getByTestId('learning-completion-overview'),
      ).toBeInTheDocument()
    })
  })

  it('should display student ID', async () => {
    render(<LearningCompletionOverview />)
    await waitFor(() => {
      expect(screen.getByText('student-local-001')).toBeInTheDocument()
    })
  })

  it('should display completion percentage', async () => {
    render(<LearningCompletionOverview />)
    await waitFor(() => {
      expect(screen.getByTestId('completion-percentage')).toHaveTextContent(
        '0 / 10',
      )
    })
  })

  it('should display category breakdown', async () => {
    render(<LearningCompletionOverview />)
    await waitFor(() => {
      expect(
        screen.getByTestId('category-breakdown-vehicle'),
      ).toBeInTheDocument()
      expect(screen.getByTestId('category-breakdown-route')).toBeInTheDocument()
      expect(
        screen.getByTestId('category-breakdown-loading'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('category-breakdown-lashing'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('category-breakdown-safety'),
      ).toBeInTheDocument()
    })
  })

  it('should show read count from localStorage', async () => {
    mockStorage.set(
      'heavy-transport-sim:learning-progress:v1:student-local-001:attempt-local-001',
      JSON.stringify([
        {
          studentId: 'student-local-001',
          attemptId: 'attempt-local-001',
          caseId: 'case-001',
          chapterId: 'vehicle-tractor-basics',
          categoryId: 'vehicle',
          readAt: '2026-01-01T00:00:00.000Z',
        },
        {
          studentId: 'student-local-001',
          attemptId: 'attempt-local-001',
          caseId: 'case-001',
          chapterId: 'route-survey-purpose',
          categoryId: 'route',
          readAt: '2026-01-01T00:00:00.000Z',
        },
      ]),
    )

    render(<LearningCompletionOverview />)
    await waitFor(() => {
      expect(screen.getByTestId('completion-percentage')).toHaveTextContent(
        '2 / 10',
      )
      expect(
        screen.getByTestId('category-breakdown-vehicle'),
      ).toHaveTextContent('1 / 2')
      expect(screen.getByTestId('category-breakdown-route')).toHaveTextContent(
        '1 / 2',
      )
    })
  })

  it('should handle corrupted localStorage gracefully', async () => {
    mockStorage.set(
      'heavy-transport-sim:learning-progress:v1:student-local-001:attempt-local-001',
      'not-json!!!',
    )

    render(<LearningCompletionOverview />)
    await waitFor(() => {
      expect(screen.getByTestId('completion-percentage')).toHaveTextContent(
        '0 / 10',
      )
    })
  })
})
