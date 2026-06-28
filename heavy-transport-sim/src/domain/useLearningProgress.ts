import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  learningProgressRepository,
  type LearningProgressRecord,
} from './learningProgress'
import { LEARNING_CATEGORIES, getAllChapterIds } from './learningContent'

const DEFAULT_STUDENT_ID = 'student-local-001'
const DEFAULT_ATTEMPT_ID = 'attempt-local-001'
const DEFAULT_CASE_ID = 'case_heavy_transformer_transport_v1'

export type UseLearningProgressResult = {
  readChapterIds: Set<string>
  markChapterRead: (chapterId: string) => Promise<void>
  isChapterRead: (chapterId: string) => boolean
  summary: {
    totalChapters: number
    readChapters: number
  }
  categorySummary: {
    categoryId: string
    title: string
    total: number
    read: number
  }[]
  status: 'idle' | 'loading' | 'ready' | 'saving' | 'error'
  error?: string
}

export function useLearningProgress(): UseLearningProgressResult {
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'ready' | 'saving' | 'error'
  >('idle')
  const [error, setError] = useState<string | undefined>()

  const totalChapters = useMemo(() => getAllChapterIds().length, [])

  const categorySummary = useMemo(
    () =>
      LEARNING_CATEGORIES.map((cat) => ({
        categoryId: cat.id,
        title: cat.title,
        total: cat.chapters.length,
        read: cat.chapters.filter((ch) => readIds.has(ch.id)).length,
      })),
    [readIds],
  )

  useEffect(() => {
    let cancelled = false
    async function loadProgress() {
      setStatus('loading')
      try {
        const ids = await learningProgressRepository.getReadChapterIds(
          DEFAULT_STUDENT_ID,
          DEFAULT_ATTEMPT_ID,
        )
        if (!cancelled) {
          setReadIds(new Set(ids))
          setStatus('ready')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '加载进度失败')
          setStatus('error')
        }
      }
    }
    loadProgress()
    return () => {
      cancelled = true
    }
  }, [])

  const markChapterRead = useCallback(async (chapterId: string) => {
    setStatus('saving')
    try {
      const record: LearningProgressRecord = {
        studentId: DEFAULT_STUDENT_ID,
        attemptId: DEFAULT_ATTEMPT_ID,
        caseId: DEFAULT_CASE_ID,
        chapterId,
        categoryId:
          LEARNING_CATEGORIES.find((c) =>
            c.chapters.some((ch) => ch.id === chapterId),
          )?.id ?? 'unknown',
        readAt: new Date().toISOString(),
      }
      await learningProgressRepository.markChapterRead(record)
      setReadIds((prev) => new Set([...prev, chapterId]))
      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存进度失败')
      setStatus('error')
    }
  }, [])

  const isChapterRead = useCallback(
    (chapterId: string) => readIds.has(chapterId),
    [readIds],
  )

  return {
    readChapterIds: readIds,
    markChapterRead,
    isChapterRead,
    summary: {
      totalChapters,
      readChapters: readIds.size,
    },
    categorySummary,
    status,
    error,
  }
}
