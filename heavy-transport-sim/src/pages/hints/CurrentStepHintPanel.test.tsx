import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CurrentStepHintPanel from './CurrentStepHintPanel'
import { STEP_IDS, STEP_NAMES } from '../../domain/stepHints'

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

describe('CurrentStepHintPanel', () => {
  it('should render hint panel for task intro', () => {
    render(
      <CurrentStepHintPanel
        stepId="stage_1_task_intro"
        stepName="运输任务及货物介绍"
      />,
    )
    expect(screen.getByTestId('hint-panel')).toBeInTheDocument()
  })

  it('should display hint buttons', () => {
    render(
      <CurrentStepHintPanel
        stepId="stage_1_task_intro"
        stepName="运输任务及货物介绍"
      />,
    )
    expect(screen.getByTestId('hint-btn-hint-task-intro-1')).toBeInTheDocument()
    expect(screen.getByTestId('hint-btn-hint-task-intro-2')).toBeInTheDocument()
  })

  it('should show hint content on button click', async () => {
    render(
      <CurrentStepHintPanel
        stepId="stage_1_task_intro"
        stepName="运输任务及货物介绍"
      />,
    )
    fireEvent.click(screen.getByTestId('hint-btn-hint-task-intro-1'))
    await waitFor(() => {
      expect(
        screen.getByTestId('hint-content-hint-task-intro-1'),
      ).toBeInTheDocument()
    })
  })

  it('should display hint title when expanded', async () => {
    render(
      <CurrentStepHintPanel
        stepId="stage_1_task_intro"
        stepName="运输任务及货物介绍"
      />,
    )
    fireEvent.click(screen.getByTestId('hint-btn-hint-task-intro-1'))
    await waitFor(() => {
      expect(screen.getByText('了解货物参数')).toBeInTheDocument()
    })
  })

  it('should display hint content text when expanded', async () => {
    render(
      <CurrentStepHintPanel
        stepId="stage_1_task_intro"
        stepName="运输任务及货物介绍"
      />,
    )
    fireEvent.click(screen.getByTestId('hint-btn-hint-task-intro-1'))
    await waitFor(() => {
      expect(screen.getByText(/请仔细阅读货物的尺寸/)).toBeInTheDocument()
    })
  })

  it('should display view count after clicking', async () => {
    render(
      <CurrentStepHintPanel
        stepId="stage_1_task_intro"
        stepName="运输任务及货物介绍"
      />,
    )
    fireEvent.click(screen.getByTestId('hint-btn-hint-task-intro-1'))
    await waitFor(() => {
      expect(
        screen.getByTestId('hint-view-count-hint-task-intro-1'),
      ).toHaveTextContent('已查看提示 1 次')
    })
  })

  it('should increment view count on second click', async () => {
    render(
      <CurrentStepHintPanel
        stepId="stage_1_task_intro"
        stepName="运输任务及货物介绍"
      />,
    )
    fireEvent.click(screen.getByTestId('hint-btn-hint-task-intro-1'))
    await waitFor(() => {
      expect(
        screen.getByTestId('hint-view-count-hint-task-intro-1'),
      ).toHaveTextContent('已查看提示 1 次')
    })
    fireEvent.click(screen.getByTestId('close-hint-btn'))
    fireEvent.click(screen.getByTestId('hint-btn-hint-task-intro-1'))
    await waitFor(() => {
      expect(
        screen.getByTestId('hint-view-count-hint-task-intro-1'),
      ).toHaveTextContent('已查看提示 2 次')
    })
  })

  it('should persist view count across clicks', async () => {
    render(
      <CurrentStepHintPanel
        stepId="stage_1_task_intro"
        stepName="运输任务及货物介绍"
      />,
    )
    fireEvent.click(screen.getByTestId('hint-btn-hint-task-intro-1'))
    await waitFor(() => {
      expect(
        screen.getByTestId('hint-view-count-hint-task-intro-1'),
      ).toHaveTextContent('已查看提示 1 次')
    })
    fireEvent.click(screen.getByTestId('close-hint-btn'))
    fireEvent.click(screen.getByTestId('hint-btn-hint-task-intro-1'))
    await waitFor(() => {
      expect(
        screen.getByTestId('hint-view-count-hint-task-intro-1'),
      ).toHaveTextContent('已查看提示 2 次')
    })
  })

  it('should display hint count badge on button', async () => {
    render(
      <CurrentStepHintPanel
        stepId="stage_1_task_intro"
        stepName="运输任务及货物介绍"
      />,
    )
    fireEvent.click(screen.getByTestId('hint-btn-hint-task-intro-1'))
    await waitFor(() => {
      expect(
        screen.getByTestId('hint-count-hint-task-intro-1'),
      ).toHaveTextContent('(1)')
    })
  })

  it('should display hints for all 6 stages', () => {
    for (const stepId of STEP_IDS) {
      const { unmount } = render(
        <CurrentStepHintPanel stepId={stepId} stepName={STEP_NAMES[stepId]} />,
      )
      expect(screen.getByTestId('hint-panel')).toBeInTheDocument()
      unmount()
    }
  })

  it('should display hint level indicator', async () => {
    render(
      <CurrentStepHintPanel
        stepId="stage_1_task_intro"
        stepName="运输任务及货物介绍"
      />,
    )
    fireEvent.click(screen.getByTestId('hint-btn-hint-task-intro-1'))
    await waitFor(() => {
      expect(screen.getByText('基础提示')).toBeInTheDocument()
    })
  })

  it('should display related knowledge category', async () => {
    render(
      <CurrentStepHintPanel
        stepId="stage_1_task_intro"
        stepName="运输任务及货物介绍"
      />,
    )
    fireEvent.click(screen.getByTestId('hint-btn-hint-task-intro-1'))
    await waitFor(() => {
      expect(screen.getByText(/建议查看：/)).toBeInTheDocument()
    })
  })

  it('should close hint on close button click', async () => {
    render(
      <CurrentStepHintPanel
        stepId="stage_1_task_intro"
        stepName="运输任务及货物介绍"
      />,
    )
    fireEvent.click(screen.getByTestId('hint-btn-hint-task-intro-1'))
    await waitFor(() => {
      expect(
        screen.getByTestId('hint-content-hint-task-intro-1'),
      ).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('close-hint-btn'))
    expect(
      screen.queryByTestId('hint-content-hint-task-intro-1'),
    ).not.toBeInTheDocument()
  })
})
