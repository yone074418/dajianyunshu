import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TaskIntroductionPage from './TaskIntroductionPage'

const {
  mockGetCurrentProfile,
  mockGetActiveAttemptForStudent,
  mockCreateAttemptForStudent,
  mockSaveAttemptStep,
} = vi.hoisted(() => ({
  mockGetCurrentProfile: vi.fn(),
  mockGetActiveAttemptForStudent: vi.fn(),
  mockCreateAttemptForStudent: vi.fn(),
  mockSaveAttemptStep: vi.fn(),
}))

vi.mock('../../features/auth/authSession', () => ({
  getCurrentProfile: () => mockGetCurrentProfile(),
}))

vi.mock('../../services/attempts/attemptService', () => ({
  getActiveAttemptForStudent: (studentId: string) =>
    mockGetActiveAttemptForStudent(studentId),
  createAttemptForStudent: (input: unknown) =>
    mockCreateAttemptForStudent(input),
  saveAttemptStep: (input: unknown) => mockSaveAttemptStep(input),
}))

const testAttempt = {
  attempt: {
    id: 'attempt-1',
    studentId: 'student-1',
    caseId: 'case_heavy_transformer_transport_v1',
    status: 'in_progress',
    currentStageIndex: 0,
    createdAt: '2026-06-28T00:00:00.000Z',
    updatedAt: '2026-06-28T00:00:00.000Z',
  },
  steps: [
    {
      id: 'step-1',
      attemptId: 'attempt-1',
      stageId: 'stage_1_task_intro',
      stageIndex: 0,
      status: 'available',
      dataSnapshot: null,
      savedAt: null,
    },
    {
      id: 'step-2',
      attemptId: 'attempt-1',
      stageId: 'stage_2_simple_vehicle_selection',
      stageIndex: 1,
      status: 'locked',
      dataSnapshot: null,
      savedAt: null,
    },
  ],
}

function renderPage() {
  return render(
    <MemoryRouter>
      <TaskIntroductionPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockGetCurrentProfile.mockResolvedValue({
    id: 'student-1',
    displayName: '测试学生',
    role: 'student',
  })
  mockGetActiveAttemptForStudent.mockResolvedValue(null)
  mockCreateAttemptForStudent.mockResolvedValue(testAttempt)
  mockSaveAttemptStep.mockResolvedValue({
    success: true,
    step: { ...testAttempt.steps[0], status: 'completed' },
  })
})

describe('TaskIntroductionPage', () => {
  it('should render the page', () => {
    renderPage()
    expect(screen.getByTestId('task-introduction-page')).toBeInTheDocument()
  })

  it('should display case name from data', () => {
    renderPage()
    expect(screen.getByTestId('task-introduction-page')).toHaveTextContent(
      '大型变压器公路运输虚拟仿真实验',
    )
  })

  it('should display origin from data', () => {
    renderPage()
    expect(screen.getByText('东港重型装备制造厂')).toBeInTheDocument()
  })

  it('should display destination from data', () => {
    renderPage()
    expect(screen.getByText('西郊 500kV 变电站施工现场')).toBeInTheDocument()
  })

  it('should display cargo length from data', () => {
    renderPage()
    expect(screen.getByText('8.8')).toBeInTheDocument()
  })

  it('should display cargo width from data', () => {
    renderPage()
    expect(screen.getByText('3.4')).toBeInTheDocument()
  })

  it('should display cargo height from data', () => {
    renderPage()
    expect(screen.getByText('4.2')).toBeInTheDocument()
  })

  it('should display cargo weight from data', () => {
    renderPage()
    expect(screen.getByText('168')).toBeInTheDocument()
  })

  it('should display objectives from data', () => {
    renderPage()
    expect(
      screen.getByText(/根据货物尺寸和重量选择合适的运输车辆/),
    ).toBeInTheDocument()
  })

  it('should display stage overview', () => {
    renderPage()
    expect(screen.getByTestId('stage-overview')).toBeInTheDocument()
    expect(screen.getByText(/简单配车/)).toBeInTheDocument()
    expect(screen.getByText(/路线勘测/)).toBeInTheDocument()
    expect(screen.getByText(/车组确定/)).toBeInTheDocument()
    expect(screen.getByText(/货物装车与绑扎加固/)).toBeInTheDocument()
    expect(screen.getByText(/货物运输/)).toBeInTheDocument()
  })

  it('should highlight current stage', () => {
    renderPage()
    expect(screen.getByText('← 当前阶段')).toBeInTheDocument()
  })

  it('should display continue button', () => {
    renderPage()
    expect(screen.getByTestId('continue-btn')).toBeInTheDocument()
  })

  it('should complete first stage when continuing to vehicle selection', async () => {
    renderPage()

    fireEvent.click(screen.getByTestId('continue-btn'))

    await waitFor(() => {
      expect(mockSaveAttemptStep).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: 'student-1',
          attemptId: 'attempt-1',
          stepId: 'step-1',
          status: 'completed',
        }),
      )
    })
  })

  it('should restore completed first-stage state', async () => {
    mockGetActiveAttemptForStudent.mockResolvedValue({
      ...testAttempt,
      steps: [
        { ...testAttempt.steps[0], status: 'completed' },
        { ...testAttempt.steps[1], status: 'available' },
      ],
    })

    renderPage()

    expect(await screen.findByTestId('stage-one-completed')).toBeInTheDocument()
  })

  it('should display background from data', () => {
    renderPage()
    expect(screen.getByText(/某电力工程需要/)).toBeInTheDocument()
  })

  it('should display teaching notes', () => {
    renderPage()
    expect(screen.getByText(/本案例为教学简化案例/)).toBeInTheDocument()
  })
})

describe('TaskIntroductionPage data source', () => {
  it('should render data from getUniqueTransportCase, not hardcoded', () => {
    renderPage()
    const page = screen.getByTestId('task-introduction-page')
    expect(page).toHaveTextContent('大型变压器公路运输虚拟仿真实验')
    expect(page).toHaveTextContent('东港重型装备制造厂')
    expect(page).toHaveTextContent('西郊 500kV 变电站施工现场')
    expect(page).toHaveTextContent('168')
    expect(page).toHaveTextContent('8.8')
  })
})
