import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TeacherPage from './TeacherPage'

const mockUseAuthStore = vi.hoisted(() => vi.fn())

vi.mock('../../stores/auth/useAuthStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <TeacherPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockUseAuthStore.mockReturnValue({
    user: {
      id: 'teacher-1',
      name: '测试教师',
      email: 'teacher@example.com',
      role: 'teacher',
    },
    logout: vi.fn(),
  })
})

describe('TeacherPage Day47 integration', () => {
  it('shows learning completion overview on the teacher page', async () => {
    renderPage()

    expect(
      await screen.findByTestId('learning-completion-overview'),
    ).toBeInTheDocument()
  })
})
