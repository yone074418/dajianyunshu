import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfigurationTimelinePage from './ConfigurationTimelinePage'
import type { ConfigurationChoiceLog } from '../../domain/configurationLogs'

const STORAGE_KEY = 'heavy-transport-sim:configuration-choice-logs:v1'

function seedLogs(logs: ConfigurationChoiceLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
}

function makeLog(
  overrides: Partial<ConfigurationChoiceLog> = {},
): ConfigurationChoiceLog {
  return {
    id: 'log-test-001',
    studentId: 'student-mock-001',
    attemptId: 'attempt-mock-001',
    caseId: 'case_heavy_transformer_transport_v1',
    stepId: 'simple_configuration',
    eventType: 'combination_selected',
    actionLabel: '选择组合方式',
    resultStatus: 'selected',
    timestamp: '2026-06-29T10:00:00Z',
    sequence: 1000,
    summary: '选择组合方式：半挂车组合',
    ...overrides,
  }
}

describe('ConfigurationTimelinePage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the page', () => {
    render(<ConfigurationTimelinePage />)
    expect(screen.getByTestId('configuration-timeline-page')).toBeDefined()
  })

  it('shows empty state when no logs', async () => {
    render(<ConfigurationTimelinePage />)
    const empty = await screen.findByTestId('timeline-empty')
    expect(empty).toBeDefined()
    expect(empty.textContent).toContain('暂无')
  })

  it('displays error count', async () => {
    seedLogs([
      makeLog({ id: '1', resultStatus: 'failed', reason: 'r', sequence: 1 }),
      makeLog({ id: '2', resultStatus: 'passed', sequence: 2 }),
    ])
    render(<ConfigurationTimelinePage />)
    const errorBadge = await screen.findByTestId('error-count')
    expect(errorBadge.textContent).toContain('1')
  })

  it('displays modification count', async () => {
    seedLogs([
      makeLog({ id: '1', resultStatus: 'changed', sequence: 1 }),
      makeLog({ id: '2', resultStatus: 'selected', sequence: 2 }),
    ])
    render(<ConfigurationTimelinePage />)
    const modBadge = await screen.findByTestId('modification-count')
    expect(modBadge.textContent).toContain('1')
  })

  it('displays timeline items in chronological order', async () => {
    seedLogs([
      makeLog({ id: 'a', sequence: 2000, summary: '第二个事件' }),
      makeLog({ id: 'b', sequence: 1000, summary: '第一个事件' }),
    ])
    render(<ConfigurationTimelinePage />)
    const list = await screen.findByTestId('timeline-list')
    expect(list).toBeDefined()
    expect(screen.getByText('第一个事件')).toBeDefined()
    expect(screen.getByText('第二个事件')).toBeDefined()
    const item0 = screen.getByTestId('timeline-item-0')
    expect(item0.textContent).toContain('第一个事件')
  })

  it('displays failed reason', async () => {
    seedLogs([
      makeLog({
        id: '1',
        resultStatus: 'failed',
        reason: '货物重量超出范围',
        sequence: 1,
      }),
    ])
    render(<ConfigurationTimelinePage />)
    const reason = await screen.findByTestId('timeline-item-0-reason')
    expect(reason.textContent).toContain('货物重量超出范围')
  })

  it('displays before/after values for changed logs', async () => {
    seedLogs([
      makeLog({
        id: '1',
        resultStatus: 'changed',
        eventType: 'combination_changed',
        before: 'combo-a',
        after: 'combo-b',
        sequence: 1,
      }),
    ])
    render(<ConfigurationTimelinePage />)
    const beforeAfter = await screen.findByTestId(
      'timeline-item-0-before-after',
    )
    expect(beforeAfter.textContent).toContain('combo-a')
    expect(beforeAfter.textContent).toContain('combo-b')
  })

  it('displays last failed log', async () => {
    seedLogs([
      makeLog({ id: '1', resultStatus: 'failed', reason: '原因', sequence: 1 }),
    ])
    render(<ConfigurationTimelinePage />)
    const lastFailed = await screen.findByTestId('last-failed')
    expect(lastFailed).toBeDefined()
  })

  it('displays last modification log', async () => {
    seedLogs([
      makeLog({
        id: '1',
        resultStatus: 'changed',
        before: 'old',
        after: 'new',
        sequence: 1,
      }),
    ])
    render(<ConfigurationTimelinePage />)
    const lastMod = await screen.findByTestId('last-modification')
    expect(lastMod).toBeDefined()
  })

  it('can toggle sort order', async () => {
    seedLogs([
      makeLog({ id: 'a', sequence: 1000, summary: '早的事件' }),
      makeLog({ id: 'b', sequence: 2000, summary: '晚的事件' }),
    ])
    render(<ConfigurationTimelinePage />)
    await screen.findByTestId('timeline-list')

    const btn = screen.getByTestId('btn-toggle-sort')
    fireEvent.click(btn)

    const item0 = screen.getByTestId('timeline-item-0')
    expect(item0.textContent).toContain('晚的事件')
  })

  it('does not display teacher timeline entry in student pages', () => {
    render(<ConfigurationTimelinePage />)
    expect(screen.queryByTestId('student-timeline-link')).toBeNull()
  })

  it('shows localStorage persistence note', async () => {
    render(<ConfigurationTimelinePage />)
    const note = await screen.findByText(/本地浏览器存储/)
    expect(note).toBeDefined()
  })
})
