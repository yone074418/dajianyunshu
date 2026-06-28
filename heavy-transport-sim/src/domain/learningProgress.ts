const STORAGE_KEY = 'heavy-transport-sim:learning-progress:v1'

export interface LearningProgressRecord {
  studentId: string
  attemptId: string
  caseId: string
  chapterId: string
  categoryId: string
  readAt: string
}

export interface LearningProgressRepository {
  getReadChapterIds(studentId: string, attemptId: string): Promise<string[]>
  markChapterRead(record: LearningProgressRecord): Promise<void>
  isChapterRead(
    studentId: string,
    attemptId: string,
    chapterId: string,
  ): Promise<boolean>
}

function getStorageKey(studentId: string, attemptId: string): string {
  return `${STORAGE_KEY}:${studentId}:${attemptId}`
}

function readFromStorage(
  studentId: string,
  attemptId: string,
): LearningProgressRecord[] {
  try {
    const key = getStorageKey(studentId, attemptId)
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (r): r is LearningProgressRecord =>
        r &&
        typeof r.studentId === 'string' &&
        typeof r.attemptId === 'string' &&
        typeof r.chapterId === 'string' &&
        typeof r.readAt === 'string',
    )
  } catch {
    return []
  }
}

function writeToStorage(
  studentId: string,
  attemptId: string,
  records: LearningProgressRecord[],
): void {
  const key = getStorageKey(studentId, attemptId)
  localStorage.setItem(key, JSON.stringify(records))
}

export function createLocalStorageLearningProgressRepository(): LearningProgressRepository {
  return {
    async getReadChapterIds(
      studentId: string,
      attemptId: string,
    ): Promise<string[]> {
      const records = readFromStorage(studentId, attemptId)
      return [...new Set(records.map((r) => r.chapterId))]
    },

    async markChapterRead(record: LearningProgressRecord): Promise<void> {
      const records = readFromStorage(record.studentId, record.attemptId)
      const existing = records.find((r) => r.chapterId === record.chapterId)
      if (existing) {
        existing.readAt = record.readAt
      } else {
        records.push(record)
      }
      writeToStorage(record.studentId, record.attemptId, records)
    },

    async isChapterRead(
      studentId: string,
      attemptId: string,
      chapterId: string,
    ): Promise<boolean> {
      const records = readFromStorage(studentId, attemptId)
      return records.some((r) => r.chapterId === chapterId)
    },
  }
}

export const learningProgressRepository =
  createLocalStorageLearningProgressRepository()
