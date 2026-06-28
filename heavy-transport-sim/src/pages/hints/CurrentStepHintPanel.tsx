import { useState, useCallback, useRef } from 'react'
import {
  getHintsForStep,
  type StepHint,
  type StepId,
} from '../../domain/stepHints'
import { hintUsageRepository } from '../../domain/hintUsage'

const DEFAULT_STUDENT_ID = 'student-local-001'
const DEFAULT_ATTEMPT_ID = 'attempt-local-001'

interface CurrentStepHintPanelProps {
  stepId: StepId
  stepName: string
}

export default function CurrentStepHintPanel({
  stepId,
  stepName,
}: CurrentStepHintPanelProps) {
  const hints = getHintsForStep(stepId)
  const [activeHint, setActiveHint] = useState<StepHint | null>(null)
  const [usageMap, setUsageMap] = useState<Map<string, number>>(new Map())
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'ready' | 'saving' | 'error'
  >('idle')
  const [error, setError] = useState<string | undefined>()
  const savingRef = useRef(false)

  const loadUsage = useCallback(async () => {
    setStatus('loading')
    try {
      const records = await hintUsageRepository.getUsageForStep(
        DEFAULT_STUDENT_ID,
        DEFAULT_ATTEMPT_ID,
        stepId,
      )
      const map = new Map<string, number>()
      for (const r of records) {
        map.set(r.hintId, r.viewCount)
      }
      setUsageMap(map)
      setStatus('ready')
    } catch {
      setError('加载提示记录失败')
      setStatus('error')
    }
  }, [stepId])

  const handleViewHint = useCallback(
    async (hint: StepHint) => {
      if (savingRef.current) return
      savingRef.current = true
      setStatus('saving')
      setActiveHint(hint)

      try {
        const { record } = await hintUsageRepository.incrementViewCount({
          studentId: DEFAULT_STUDENT_ID,
          attemptId: DEFAULT_ATTEMPT_ID,
          stepId,
          hintId: hint.id,
          stepName,
          hintTitle: hint.title,
          hintLevel: hint.level,
        })
        setUsageMap((prev) => new Map(prev).set(hint.id, record.viewCount))
        setStatus('ready')
      } catch {
        setError('保存提示记录失败')
        setStatus('error')
      } finally {
        savingRef.current = false
      }
    },
    [stepId, stepName],
  )

  const handleCloseHint = useCallback(() => {
    setActiveHint(null)
  }, [])

  if (hints.length === 0) {
    return (
      <div
        data-testid="hint-panel-empty"
        style={{
          padding: '16px',
          background: '#f9f9f9',
          borderRadius: '6px',
          color: '#888',
          fontSize: '14px',
        }}
      >
        暂无当前步骤提示
      </div>
    )
  }

  return (
    <div
      data-testid="hint-panel"
      style={{
        padding: '16px',
        background: '#fff',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px' }}>当前步骤提示</h3>
        <button
          data-testid="load-usage-btn"
          onClick={loadUsage}
          style={{
            padding: '4px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: '#fff',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          刷新计数
        </button>
      </div>

      {error && (
        <div
          data-testid="hint-error"
          style={{ color: '#c00', fontSize: '13px', marginBottom: '8px' }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {hints.map((hint) => {
          const count = usageMap.get(hint.id) ?? 0
          return (
            <button
              key={hint.id}
              data-testid={`hint-btn-${hint.id}`}
              onClick={() => handleViewHint(hint)}
              disabled={status === 'saving'}
              style={{
                padding: '8px 16px',
                border: '1px solid #3d85c6',
                borderRadius: '4px',
                background: activeHint?.id === hint.id ? '#e8f0fe' : '#fff',
                color: '#3d85c6',
                cursor: status === 'saving' ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                opacity: status === 'saving' ? 0.6 : 1,
              }}
            >
              查看提示
              {count > 0 && (
                <span
                  data-testid={`hint-count-${hint.id}`}
                  style={{
                    marginLeft: '6px',
                    fontSize: '11px',
                    color: '#888',
                  }}
                >
                  ({count})
                </span>
              )}
            </button>
          )
        })}
      </div>

      {activeHint && (
        <div
          data-testid={`hint-content-${activeHint.id}`}
          style={{
            marginTop: '16px',
            padding: '16px',
            background: activeHint.level === 'warning' ? '#fff3cd' : '#f0f7ff',
            borderRadius: '6px',
            border: `1px solid ${activeHint.level === 'warning' ? '#ffc107' : '#b3d9ff'}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '15px' }}>{activeHint.title}</h4>
            <button
              data-testid="close-hint-btn"
              onClick={handleCloseHint}
              style={{
                padding: '2px 8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              关闭
            </button>
          </div>
          <div
            style={{
              marginTop: '4px',
              fontSize: '11px',
              color: activeHint.level === 'warning' ? '#856404' : '#3d85c6',
            }}
          >
            {activeHint.level === 'basic'
              ? '基础提示'
              : activeHint.level === 'detail'
                ? '详细提示'
                : '安全警告'}
          </div>
          <p style={{ marginTop: '8px', fontSize: '14px', lineHeight: '1.6' }}>
            {activeHint.content}
          </p>
          {activeHint.relatedKnowledgeCategory && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
              建议查看：
              {activeHint.relatedKnowledgeCategory === 'vehicle'
                ? '车辆知识'
                : activeHint.relatedKnowledgeCategory === 'route'
                  ? '路线知识'
                  : activeHint.relatedKnowledgeCategory === 'loading'
                    ? '装车知识'
                    : activeHint.relatedKnowledgeCategory === 'lashing'
                      ? '绑扎知识'
                      : '安全知识'}
            </div>
          )}
          <div
            data-testid={`hint-view-count-${activeHint.id}`}
            style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}
          >
            已查看提示 {usageMap.get(activeHint.id) ?? 0} 次
          </div>
        </div>
      )}
    </div>
  )
}
