import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCurrentProfile,
  type AuthProfile,
} from '../../features/auth/authSession'
import {
  createAttemptForStudent,
  getActiveAttemptForStudent,
  continueAttempt,
  saveAttemptStep,
  type AttemptWithSteps,
  type AttemptResumeState,
} from '../../services/attempts/attemptService'
import { STAGE_NAMES, type StageId } from '../../types/attempt'

const DEFAULT_CASE_ID = 'case-1'

export default function ExperimentPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [activeAttempt, setActiveAttempt] = useState<AttemptWithSteps | null>(
    null,
  )
  const [resumeState, setResumeState] = useState<AttemptResumeState | null>(
    null,
  )
  const [status, setStatus] = useState<string>('加载中...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const p = await getCurrentProfile()
      if (!p || p.role !== 'student') {
        navigate('/login')
        return
      }
      setProfile(p)

      const existing = await getActiveAttemptForStudent(p.id)
      if (existing) {
        setActiveAttempt(existing)
        setStatus('已有进行中的实验')
      } else {
        setStatus('未开始实验')
      }
    }
    load()
  }, [navigate])

  const handleCreate = async () => {
    if (!profile) return
    setError(null)
    setStatus('创建中...')
    try {
      const result = await createAttemptForStudent({
        studentId: profile.id,
        caseId: DEFAULT_CASE_ID,
      })
      setActiveAttempt(result)
      setStatus('实验已创建，第一阶段可用')
    } catch (e) {
      setError(e instanceof Error ? e.message : '创建失败')
      setStatus('创建失败')
    }
  }

  const handleContinue = async () => {
    if (!profile || !activeAttempt) return
    setError(null)
    setStatus('恢复中...')
    try {
      const state = await continueAttempt({
        studentId: profile.id,
        attemptId: activeAttempt.attempt.id,
      })
      setResumeState(state)
      setStatus('已恢复到当前阶段')
    } catch (e) {
      setError(e instanceof Error ? e.message : '恢复失败')
      setStatus('恢复失败')
    }
  }

  const handleSave = async (stepId: string, stageId: StageId) => {
    if (!profile || !activeAttempt) return
    setError(null)
    setStatus('保存中...')
    try {
      await saveAttemptStep({
        studentId: profile.id,
        attemptId: activeAttempt.attempt.id,
        stepId,
        status: 'completed',
        dataSnapshot: { stageId, completedAt: new Date().toISOString() },
      })
      setStatus(`${STAGE_NAMES[stageId]} 已保存完成`)

      const updated = await getActiveAttemptForStudent(profile.id)
      if (updated) {
        setActiveAttempt(updated)
      } else {
        setActiveAttempt(null)
        setResumeState(null)
        setStatus('所有阶段已完成！')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败')
      setStatus('保存失败')
    }
  }

  if (!profile) return <div>加载中...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>实验管理</h1>
      <p>
        当前学生: {profile.displayName} ({profile.id})
      </p>
      <p>状态: {status}</p>
      {error && <p style={{ color: 'red' }}>错误: {error}</p>}

      <hr />

      {!activeAttempt && (
        <div>
          <h2>创建新实验</h2>
          <button onClick={handleCreate} data-testid="create-attempt">
            创建实验
          </button>
        </div>
      )}

      {activeAttempt && !resumeState && (
        <div>
          <h2>继续实验</h2>
          <p>实验ID: {activeAttempt.attempt.id}</p>
          <button onClick={handleContinue} data-testid="continue-attempt">
            继续实验
          </button>
        </div>
      )}

      {resumeState && (
        <div>
          <h2>当前阶段: {STAGE_NAMES[resumeState.currentStep.stageId]}</h2>
          <p>步骤ID: {resumeState.currentStep.id}</p>
          <p>状态: {resumeState.currentStep.status}</p>
          <button
            onClick={() =>
              handleSave(
                resumeState.currentStep.id,
                resumeState.currentStep.stageId,
              )
            }
            data-testid="save-step"
          >
            保存当前阶段
          </button>
        </div>
      )}

      {activeAttempt && (
        <div>
          <h2>六阶段状态</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>
                  阶段
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>
                  状态
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>
                  保存时间
                </th>
              </tr>
            </thead>
            <tbody>
              {activeAttempt.steps.map((step) => (
                <tr key={step.id} data-testid={`step-${step.stageId}`}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {STAGE_NAMES[step.stageId]}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {step.status}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {step.savedAt || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
