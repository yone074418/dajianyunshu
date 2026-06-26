import { describe, it, expect, beforeEach } from 'vitest'
import {
  createAttemptForStudent,
  getActiveAttemptForStudent,
  continueAttempt,
  saveAttemptStep,
  restoreAttemptProgress,
  getLogs,
  clearAll,
} from './attemptService'
import { STAGE_IDS } from '../../types/attempt'

describe('AttemptService', () => {
  beforeEach(() => {
    clearAll()
  })

  describe('createAttemptForStudent', () => {
    it('should create an attempt with six stages', async () => {
      const result = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      expect(result.attempt.id).toBeTruthy()
      expect(result.attempt.studentId).toBe('student-1')
      expect(result.attempt.caseId).toBe('case-1')
      expect(result.attempt.status).toBe('in_progress')
      expect(result.steps).toHaveLength(6)
    })

    it('should set first stage as available and rest as locked', async () => {
      const result = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      expect(result.steps[0].status).toBe('available')
      for (let i = 1; i < 6; i++) {
        expect(result.steps[i].status).toBe('locked')
      }
    })

    it('should use correct stage IDs in order', async () => {
      const result = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      result.steps.forEach((step, index) => {
        expect(step.stageId).toBe(STAGE_IDS[index])
        expect(step.stageIndex).toBe(index)
      })
    })

    it('should reject if student still has active attempt', async () => {
      await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      await expect(
        createAttemptForStudent({ studentId: 'student-1', caseId: 'case-1' }),
      ).rejects.toThrow('STILL_HAS_ACTIVE_ATTEMPT')
    })

    it('should log attempt_created event', async () => {
      await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      const logs = getLogs()
      expect(logs).toHaveLength(1)
      expect(logs[0].eventType).toBe('attempt_created')
      expect(logs[0].studentId).toBe('student-1')
    })
  })

  describe('getActiveAttemptForStudent', () => {
    it('should return null when no active attempt exists', async () => {
      const result = await getActiveAttemptForStudent('student-1')
      expect(result).toBeNull()
    })

    it('should return active attempt with steps', async () => {
      await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      const result = await getActiveAttemptForStudent('student-1')
      expect(result).not.toBeNull()
      expect(result!.attempt.studentId).toBe('student-1')
      expect(result!.steps).toHaveLength(6)
    })

    it('should not return other students attempts', async () => {
      await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      const result = await getActiveAttemptForStudent('student-2')
      expect(result).toBeNull()
    })
  })

  describe('continueAttempt', () => {
    it('should resume attempt with current step', async () => {
      const created = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      const result = await continueAttempt({
        studentId: 'student-1',
        attemptId: created.attempt.id,
      })

      expect(result.attempt.id).toBe(created.attempt.id)
      expect(result.currentStep.stageId).toBe(STAGE_IDS[0])
    })

    it('should reject if attempt not found', async () => {
      await expect(
        continueAttempt({ studentId: 'student-1', attemptId: 'nonexistent' }),
      ).rejects.toThrow('ATTEMPT_NOT_FOUND')
    })

    it('should reject if student does not own attempt', async () => {
      const created = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      await expect(
        continueAttempt({
          studentId: 'student-2',
          attemptId: created.attempt.id,
        }),
      ).rejects.toThrow('ACCESS_DENIED')
    })

    it('should reject if attempt is completed', async () => {
      const created = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      for (const step of created.steps) {
        await saveAttemptStep({
          studentId: 'student-1',
          attemptId: created.attempt.id,
          stepId: step.id,
          status: 'completed',
        })
      }

      await expect(
        continueAttempt({
          studentId: 'student-1',
          attemptId: created.attempt.id,
        }),
      ).rejects.toThrow('ATTEMPT_ALREADY_COMPLETED')
    })

    it('should log attempt_continued event', async () => {
      const created = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      await continueAttempt({
        studentId: 'student-1',
        attemptId: created.attempt.id,
      })

      const logs = getLogs()
      const continueLog = logs.find((l) => l.eventType === 'attempt_continued')
      expect(continueLog).toBeTruthy()
    })
  })

  describe('saveAttemptStep', () => {
    it('should save step status and data', async () => {
      const created = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      const result = await saveAttemptStep({
        studentId: 'student-1',
        attemptId: created.attempt.id,
        stepId: created.steps[0].id,
        status: 'completed',
        dataSnapshot: { answer: 'test' },
      })

      expect(result.success).toBe(true)
      expect(result.step.status).toBe('completed')
      expect(result.step.dataSnapshot).toEqual({ answer: 'test' })
      expect(result.step.savedAt).toBeTruthy()
    })

    it('should unlock next stage when current is completed', async () => {
      const created = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      expect(created.steps[1].status).toBe('locked')

      await saveAttemptStep({
        studentId: 'student-1',
        attemptId: created.attempt.id,
        stepId: created.steps[0].id,
        status: 'completed',
      })

      const active = await getActiveAttemptForStudent('student-1')
      expect(active!.steps[1].status).toBe('available')
    })

    it('should mark attempt as completed when last stage is completed', async () => {
      const created = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      for (const step of created.steps) {
        await saveAttemptStep({
          studentId: 'student-1',
          attemptId: created.attempt.id,
          stepId: step.id,
          status: 'completed',
        })
      }

      const active = await getActiveAttemptForStudent('student-1')
      expect(active).toBeNull()
    })

    it('should reject saving locked step', async () => {
      const created = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      await expect(
        saveAttemptStep({
          studentId: 'student-1',
          attemptId: created.attempt.id,
          stepId: created.steps[1].id,
          status: 'completed',
        }),
      ).rejects.toThrow('STEP_IS_LOCKED')
    })

    it('should reject if student does not own attempt', async () => {
      const created = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      await expect(
        saveAttemptStep({
          studentId: 'student-2',
          attemptId: created.attempt.id,
          stepId: created.steps[0].id,
          status: 'completed',
        }),
      ).rejects.toThrow('ACCESS_DENIED')
    })

    it('should reject saving completed attempt', async () => {
      const created = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      for (const step of created.steps) {
        await saveAttemptStep({
          studentId: 'student-1',
          attemptId: created.attempt.id,
          stepId: step.id,
          status: 'completed',
        })
      }

      await expect(
        saveAttemptStep({
          studentId: 'student-1',
          attemptId: created.attempt.id,
          stepId: created.steps[0].id,
          status: 'in_progress',
        }),
      ).rejects.toThrow('ATTEMPT_ALREADY_COMPLETED')
    })

    it('should log attempt_step_saved event', async () => {
      const created = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      await saveAttemptStep({
        studentId: 'student-1',
        attemptId: created.attempt.id,
        stepId: created.steps[0].id,
        status: 'completed',
      })

      const logs = getLogs()
      const saveLog = logs.find((l) => l.eventType === 'attempt_step_saved')
      expect(saveLog).toBeTruthy()
      expect(saveLog!.stageId).toBe(STAGE_IDS[0])
    })
  })

  describe('restoreAttemptProgress', () => {
    it('should restore attempt from saved state', async () => {
      const created = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      await saveAttemptStep({
        studentId: 'student-1',
        attemptId: created.attempt.id,
        stepId: created.steps[0].id,
        status: 'completed',
      })

      const result = await restoreAttemptProgress({
        studentId: 'student-1',
        attemptId: created.attempt.id,
      })

      expect(result.steps[0].status).toBe('completed')
      expect(result.steps[1].status).toBe('available')
      expect(result.currentStep.stageId).toBe(STAGE_IDS[1])
    })

    it('should reject if student does not own attempt', async () => {
      const created = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      await expect(
        restoreAttemptProgress({
          studentId: 'student-2',
          attemptId: created.attempt.id,
        }),
      ).rejects.toThrow('ACCESS_DENIED')
    })
  })

  describe('redo creates new attempt', () => {
    it('should allow creating new attempt after completion', async () => {
      const first = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      for (const step of first.steps) {
        await saveAttemptStep({
          studentId: 'student-1',
          attemptId: first.attempt.id,
          stepId: step.id,
          status: 'completed',
        })
      }

      const second = await createAttemptForStudent({
        studentId: 'student-1',
        caseId: 'case-1',
      })

      expect(second.attempt.id).not.toBe(first.attempt.id)
      expect(second.steps[0].status).toBe('available')
    })
  })
})
