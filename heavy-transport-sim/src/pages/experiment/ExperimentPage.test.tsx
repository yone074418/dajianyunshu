import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ExperimentPage from './ExperimentPage'

const {
  mockGetCurrentProfile,
  mockGetActiveAttemptForStudent,
  mockContinueAttempt,
} = vi.hoisted(() => ({
  mockGetCurrentProfile: vi.fn(),
  mockGetActiveAttemptForStudent: vi.fn(),
  mockContinueAttempt: vi.fn(),
}))

vi.mock('../../features/auth/authSession', () => ({
  getCurrentProfile: () => mockGetCurrentProfile(),
}))

vi.mock('../../services/attempts/attemptService', () => ({
  getCurrentProfile: () => mockGetCurrentProfile(),
  getActiveAttemptForStudent: (studentId: string) =>
    mockGetActiveAttemptForStudent(studentId),
  continueAttempt: (input: unknown) => mockContinueAttempt(input),
  createAttemptForStudent: vi.fn(),
  saveAttemptStep: vi.fn(),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <ExperimentPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockGetCurrentProfile.mockResolvedValue({
    id: 'student-local-001',
    displayName: '测试学生',
    role: 'student',
  })
  mockGetActiveAttemptForStudent.mockResolvedValue({
    attempt: {
      id: 'attempt-local-001',
      studentId: 'student-local-001',
      caseId: 'case_heavy_transformer_transport_v1',
      status: 'in_progress',
      currentStageIndex: 1,
      createdAt: '2026-06-28T00:00:00.000Z',
      updatedAt: '2026-06-28T00:00:00.000Z',
    },
    steps: [],
  })
  mockContinueAttempt.mockResolvedValue({
    attemptId: 'attempt-local-001',
    currentStep: {
      id: 'step-2',
      attemptId: 'attempt-local-001',
      stageId: 'stage_2_simple_vehicle_selection',
      stageIndex: 1,
      status: 'available',
      dataSnapshot: null,
      savedAt: null,
    },
    completedSteps: [],
    availableSteps: [],
  })
})

describe('ExperimentPage Day48 integration', () => {
  it('shows current step hint panel after resuming the attempt', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByTestId('continue-attempt'))

    await waitFor(() => {
      expect(screen.getByTestId('hint-panel')).toBeInTheDocument()
    })
  })
})
