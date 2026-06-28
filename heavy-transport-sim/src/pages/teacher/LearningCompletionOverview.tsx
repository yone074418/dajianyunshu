import { useState, useEffect, useMemo } from 'react'
import { learningProgressRepository } from '../../domain/learningProgress'
import {
  LEARNING_CATEGORIES,
  getAllChapterIds,
} from '../../domain/learningContent'

const STUDENT_IDS = ['student-local-001']
const ATTEMPT_ID = 'attempt-local-001'

interface StudentCompletion {
  studentId: string
  readChapterIds: string[]
  totalChapters: number
  readChapters: number
  percentage: number
  categoryBreakdown: {
    categoryId: string
    title: string
    total: number
    read: number
  }[]
}

export default function LearningCompletionOverview() {
  const [completions, setCompletions] = useState<StudentCompletion[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const totalChapters = useMemo(() => getAllChapterIds().length, [])

  useEffect(() => {
    async function loadAll() {
      setStatus('loading')
      try {
        const results: StudentCompletion[] = []
        for (const studentId of STUDENT_IDS) {
          const readIds = await learningProgressRepository.getReadChapterIds(
            studentId,
            ATTEMPT_ID,
          )
          const categoryBreakdown = LEARNING_CATEGORIES.map((cat) => ({
            categoryId: cat.id,
            title: cat.title,
            total: cat.chapters.length,
            read: cat.chapters.filter((ch) => readIds.includes(ch.id)).length,
          }))
          results.push({
            studentId,
            readChapterIds: readIds,
            totalChapters,
            readChapters: readIds.length,
            percentage:
              totalChapters > 0
                ? Math.round((readIds.length / totalChapters) * 100)
                : 0,
            categoryBreakdown,
          })
        }
        setCompletions(results)
        setStatus('ready')
      } catch {
        setStatus('error')
      }
    }
    loadAll()
  }, [totalChapters])

  if (status === 'loading') {
    return (
      <div
        data-testid="completion-loading"
        style={{ padding: '16px', color: '#888' }}
      >
        正在加载学生完成度...
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div
        data-testid="completion-error"
        style={{ padding: '16px', color: '#c00' }}
      >
        加载学生完成度失败
      </div>
    )
  }

  if (completions.length === 0) {
    return (
      <div
        data-testid="completion-empty"
        style={{ padding: '16px', color: '#888' }}
      >
        暂无学生学习记录
      </div>
    )
  }

  return (
    <div data-testid="learning-completion-overview">
      <h3 style={{ marginTop: 0, fontSize: '16px' }}>学生学习完成度</h3>
      {completions.map((comp) => (
        <div
          key={comp.studentId}
          data-testid={`student-completion-${comp.studentId}`}
          style={{
            padding: '16px',
            background: '#f9f9f9',
            borderRadius: '6px',
            border: '1px solid #e8e8e8',
            marginTop: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong>{comp.studentId}</strong>
              <span
                data-testid="completion-percentage"
                style={{
                  marginLeft: '12px',
                  fontSize: '14px',
                  color: '#3d85c6',
                }}
              >
                {comp.readChapters} / {comp.totalChapters} 章节已读 (
                {comp.percentage}%)
              </span>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            {comp.categoryBreakdown.map((cat) => (
              <div
                key={cat.categoryId}
                data-testid={`category-breakdown-${cat.categoryId}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid #eee',
                  fontSize: '13px',
                }}
              >
                <span>{cat.title}</span>
                <span
                  style={{ color: cat.read === cat.total ? '#2e7d32' : '#666' }}
                >
                  {cat.read} / {cat.total}
                  {cat.read === cat.total && ' ✓'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
