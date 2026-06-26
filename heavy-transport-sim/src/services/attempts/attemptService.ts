import {
  type Attempt,
  type AttemptStep,
  type AttemptWithSteps,
  type AttemptResumeState,
  type OperationLog,
  type StageId,
  type StepStatus,
  STAGE_IDS,
} from '../../types/attempt'
import { getCurrentProfile } from '../../features/auth/authSession'

export type { AttemptWithSteps, AttemptResumeState }

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function now(): string {
  return new Date().toISOString()
}

const attempts: Map<string, Attempt> = new Map()
const steps: Map<string, AttemptStep[]> = new Map()
const logs: OperationLog[] = []

function addLog(
  attemptId: string,
  studentId: string,
  eventType: string,
  stageId: StageId | null,
  result: string,
): void {
  logs.push({
    id: generateId(),
    attemptId,
    studentId,
    eventType,
    stageId,
    result,
    timestamp: now(),
  })
}

export function getLogs(): OperationLog[] {
  return [...logs]
}

export function clearAll(): void {
  attempts.clear()
  steps.clear()
  logs.length = 0
}

export async function requireStudentId(): Promise<string> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'student') {
    throw new Error('AUTH_REQUIRED')
  }
  return profile.id
}

export async function createAttemptForStudent(input: {
  studentId: string
  caseId: string
}): Promise<AttemptWithSteps> {
  const existing = Array.from(attempts.values()).find(
    (a) => a.studentId === input.studentId && a.status === 'in_progress',
  )
  if (existing) {
    throw new Error('STILL_HAS_ACTIVE_ATTEMPT')
  }

  const attemptId = generateId()
  const timestamp = now()

  const attempt: Attempt = {
    id: attemptId,
    studentId: input.studentId,
    caseId: input.caseId,
    status: 'in_progress',
    currentStageIndex: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const attemptSteps: AttemptStep[] = STAGE_IDS.map((stageId, index) => ({
    id: generateId(),
    attemptId,
    stageId,
    stageIndex: index,
    status: (index === 0 ? 'available' : 'locked') as StepStatus,
    dataSnapshot: null,
    savedAt: null,
  }))

  attempts.set(attemptId, attempt)
  steps.set(attemptId, attemptSteps)
  addLog(attemptId, input.studentId, 'attempt_created', STAGE_IDS[0], 'success')

  return { attempt, steps: attemptSteps }
}

export async function getActiveAttemptForStudent(
  studentId: string,
): Promise<AttemptWithSteps | null> {
  const attempt = Array.from(attempts.values()).find(
    (a) => a.studentId === studentId && a.status === 'in_progress',
  )

  if (!attempt) {
    return null
  }

  const attemptSteps = steps.get(attempt.id) || []
  return { attempt, steps: attemptSteps }
}

export async function continueAttempt(input: {
  studentId: string
  attemptId: string
}): Promise<AttemptResumeState> {
  const attempt = attempts.get(input.attemptId)

  if (!attempt) {
    throw new Error('ATTEMPT_NOT_FOUND')
  }

  if (attempt.studentId !== input.studentId) {
    addLog(
      input.attemptId,
      input.studentId,
      'attempt_access_denied',
      null,
      'denied',
    )
    throw new Error('ACCESS_DENIED')
  }

  if (attempt.status === 'completed') {
    throw new Error('ATTEMPT_ALREADY_COMPLETED')
  }

  const attemptSteps = steps.get(attempt.id) || []
  const currentStep = attemptSteps.find(
    (s) => s.stageIndex === attempt.currentStageIndex,
  )

  if (!currentStep) {
    throw new Error('CURRENT_STEP_NOT_FOUND')
  }

  addLog(
    attempt.id,
    input.studentId,
    'attempt_continued',
    currentStep.stageId,
    'success',
  )

  return { attempt, steps: attemptSteps, currentStep }
}

export async function saveAttemptStep(input: {
  studentId: string
  attemptId: string
  stepId: string
  status: StepStatus
  dataSnapshot?: unknown
}): Promise<{ success: boolean; step: AttemptStep }> {
  const attempt = attempts.get(input.attemptId)

  if (!attempt) {
    throw new Error('ATTEMPT_NOT_FOUND')
  }

  if (attempt.studentId !== input.studentId) {
    addLog(
      input.attemptId,
      input.studentId,
      'attempt_access_denied',
      null,
      'denied',
    )
    throw new Error('ACCESS_DENIED')
  }

  if (attempt.status === 'completed') {
    throw new Error('ATTEMPT_ALREADY_COMPLETED')
  }

  const attemptSteps = steps.get(attempt.id) || []
  const stepIndex = attemptSteps.findIndex((s) => s.id === input.stepId)

  if (stepIndex === -1) {
    throw new Error('STEP_NOT_FOUND')
  }

  const step = attemptSteps[stepIndex]

  if (step.status === 'locked') {
    throw new Error('STEP_IS_LOCKED')
  }

  const updatedStep: AttemptStep = {
    ...step,
    status: input.status,
    dataSnapshot: input.dataSnapshot ?? step.dataSnapshot,
    savedAt: now(),
  }

  attemptSteps[stepIndex] = updatedStep
  steps.set(attempt.id, attemptSteps)

  if (input.status === 'completed' && stepIndex < STAGE_IDS.length - 1) {
    const nextStep = attemptSteps[stepIndex + 1]
    attemptSteps[stepIndex + 1] = { ...nextStep, status: 'available' }
    attempt.currentStageIndex = stepIndex + 1
  }

  if (input.status === 'completed' && stepIndex === STAGE_IDS.length - 1) {
    attempt.status = 'completed'
  }

  attempt.updatedAt = now()
  attempts.set(attempt.id, attempt)

  addLog(
    attempt.id,
    input.studentId,
    'attempt_step_saved',
    step.stageId,
    'success',
  )

  return { success: true, step: updatedStep }
}

export async function restoreAttemptProgress(input: {
  studentId: string
  attemptId: string
}): Promise<AttemptResumeState> {
  return continueAttempt(input)
}

export async function simulateNetworkError(): Promise<never> {
  addLog('system', 'system', 'attempt_save_failed', null, 'network_error')
  throw new Error('NETWORK_ERROR')
}

export async function simulateDbError(): Promise<never> {
  addLog('system', 'system', 'attempt_save_failed', null, 'db_error')
  throw new Error('DB_ERROR')
}
