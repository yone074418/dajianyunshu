import {
  getUniqueTransportCase,
  validateTransportCase,
  type TransportCase,
} from '../../domain/transportCase'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCurrentProfile,
  type AuthProfile,
} from '../../features/auth/authSession'
import {
  createAttemptForStudent,
  getActiveAttemptForStudent,
  saveAttemptStep,
  type AttemptWithSteps,
} from '../../services/attempts/attemptService'

const STAGE_NAMES = [
  '运输任务及货物介绍',
  '简单配车',
  '路线勘测',
  '车组确定',
  '货物装车与绑扎加固',
  '货物运输',
] as const

type PageState =
  | { status: 'ready'; data: TransportCase }
  | { status: 'empty' }
  | { status: 'validation_error'; message: string }
  | { status: 'error'; message: string }

function loadCase(): PageState {
  try {
    const raw = getUniqueTransportCase()
    if (!raw) {
      return { status: 'empty' }
    }
    const data = validateTransportCase(raw)
    return { status: 'ready', data }
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return {
        status: 'validation_error',
        message: '案例数据校验失败，请联系教师或管理员。',
      }
    }
    return {
      status: 'error',
      message: '加载案例数据时发生错误，请稍后重试。',
    }
  }
}

export default function TaskIntroductionPage() {
  const navigate = useNavigate()
  const state = useMemo(() => loadCase(), [])
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [activeAttempt, setActiveAttempt] = useState<AttemptWithSteps | null>(
    null,
  )
  const [flowStatus, setFlowStatus] = useState<
    'loading' | 'ready' | 'saving' | 'completed' | 'error'
  >('loading')
  const [flowError, setFlowError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function restoreFlow() {
      const currentProfile = await getCurrentProfile()
      if (cancelled) return

      if (!currentProfile || currentProfile.role !== 'student') {
        setFlowStatus('ready')
        return
      }

      setProfile(currentProfile)
      const existing = await getActiveAttemptForStudent(currentProfile.id)
      if (cancelled) return

      setActiveAttempt(existing)
      setFlowStatus(
        existing?.steps[0]?.status === 'completed' ? 'completed' : 'ready',
      )
    }

    restoreFlow()

    return () => {
      cancelled = true
    }
  }, [])

  const handleContinueToVehicleSelection = async () => {
    if (state.status !== 'ready') return

    setFlowError(null)
    setFlowStatus('saving')

    try {
      const currentProfile = profile ?? (await getCurrentProfile())
      if (!currentProfile || currentProfile.role !== 'student') {
        navigate('/login')
        return
      }

      const attempt =
        activeAttempt ??
        (await getActiveAttemptForStudent(currentProfile.id)) ??
        (await createAttemptForStudent({
          studentId: currentProfile.id,
          caseId: state.data.id,
        }))

      const firstStep = attempt.steps[0]
      if (firstStep.status !== 'completed') {
        await saveAttemptStep({
          studentId: currentProfile.id,
          attemptId: attempt.attempt.id,
          stepId: firstStep.id,
          status: 'completed',
          dataSnapshot: {
            stageId: 'stage_1_task_intro',
            caseId: state.data.id,
            completedAt: new Date().toISOString(),
            source: 'task-introduction-page',
          },
        })
      }

      setFlowStatus('completed')
      navigate('/student/experiment')
    } catch (err) {
      setFlowStatus('error')
      setFlowError(err instanceof Error ? err.message : '保存第一阶段失败')
    }
  }

  if (state.status === 'empty') {
    return (
      <div
        data-testid="task-intro-empty"
        style={{ padding: '40px', textAlign: 'center' }}
      >
        <p style={{ color: '#c00' }}>未找到案例数据，请联系教师或管理员。</p>
      </div>
    )
  }

  if (state.status === 'validation_error') {
    return (
      <div
        data-testid="task-intro-validation-error"
        style={{ padding: '40px', textAlign: 'center' }}
      >
        <p style={{ color: '#c00' }}>{state.message}</p>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div
        data-testid="task-intro-error"
        style={{ padding: '40px', textAlign: 'center' }}
      >
        <p style={{ color: '#c00' }}>{state.message}</p>
      </div>
    )
  }

  const { data } = state

  return (
    <div
      data-testid="task-introduction-page"
      style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}
    >
      <h1>运输任务及货物介绍</h1>
      <h2 style={{ color: '#3d85c6', marginTop: '8px' }}>{data.name}</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>
        请先阅读本次大件运输任务背景、起终点、货物参数和实验目标。
      </p>

      <section data-testid="case-background" style={sectionStyle}>
        <h2>案例背景</h2>
        <p>{data.background}</p>
        {data.teachingNotes.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <strong>教学说明：</strong>
            <ul>
              {data.teachingNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section data-testid="route-summary" style={sectionStyle}>
        <h2>运输路线</h2>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={cardStyle}>
            <div style={labelStyle}>起点</div>
            <div style={valueStyle}>{data.origin.name}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {data.origin.type}
            </div>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>
              {data.origin.description}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '24px',
              color: '#3d85c6',
            }}
          >
            →
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>终点</div>
            <div style={valueStyle}>{data.destination.name}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {data.destination.type}
            </div>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>
              {data.destination.description}
            </p>
          </div>
        </div>
      </section>

      <section data-testid="cargo-parameters" style={sectionStyle}>
        <h2>货物参数</h2>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
          {data.cargo.description}
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={thStyle}>参数</th>
              <th style={thStyle}>数值</th>
              <th style={thStyle}>单位</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>长度</td>
              <td style={tdStyle}>{data.cargo.dimensions.lengthM}</td>
              <td style={tdStyle}>m</td>
            </tr>
            <tr>
              <td style={tdStyle}>宽度</td>
              <td style={tdStyle}>{data.cargo.dimensions.widthM}</td>
              <td style={tdStyle}>m</td>
            </tr>
            <tr>
              <td style={tdStyle}>高度</td>
              <td style={tdStyle}>{data.cargo.dimensions.heightM}</td>
              <td style={tdStyle}>m</td>
            </tr>
            <tr>
              <td style={tdStyle}>重量</td>
              <td style={tdStyle}>{data.cargo.weightT}</td>
              <td style={tdStyle}>t</td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#888' }}>
          货物类别：{data.cargo.category} | 单位：{data.cargo.unit}
        </div>
      </section>

      <section data-testid="task-objectives" style={sectionStyle}>
        <h2>实验目标</h2>
        <ol>
          {data.objectives.map((obj, i) => (
            <li key={i} style={{ marginBottom: '6px' }}>
              {obj}
            </li>
          ))}
        </ol>
      </section>

      <section data-testid="stage-overview" style={sectionStyle}>
        <h2>实验阶段概览</h2>
        <ol style={{ listStyle: 'none', padding: 0 }}>
          {STAGE_NAMES.map((name, i) => (
            <li
              key={i}
              style={{
                padding: '8px 12px',
                marginBottom: '4px',
                borderRadius: '4px',
                background: i === 0 ? '#e8f0fe' : '#f9f9f9',
                fontWeight: i === 0 ? 'bold' : 'normal',
                color: i === 0 ? '#3d85c6' : '#666',
                borderLeft:
                  i === 0 ? '3px solid #3d85c6' : '3px solid transparent',
              }}
            >
              {i + 1}. {name}
              {i === 0 && (
                <span style={{ fontSize: '12px', marginLeft: '8px' }}>
                  ← 当前阶段
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        {flowStatus === 'completed' && (
          <p
            data-testid="stage-one-completed"
            style={{ color: '#2e7d32', fontSize: '13px' }}
          >
            第一阶段已完成，可继续进入简单配车。
          </p>
        )}
        {flowError && (
          <p
            data-testid="stage-one-error"
            style={{ color: '#c00', fontSize: '13px' }}
          >
            {flowError}
          </p>
        )}
        <button
          data-testid="continue-btn"
          onClick={handleContinueToVehicleSelection}
          disabled={flowStatus === 'saving'}
          style={{
            padding: '12px 32px',
            background: '#3d85c6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: flowStatus === 'saving' ? 'not-allowed' : 'pointer',
            opacity: flowStatus === 'saving' ? 0.7 : 1,
          }}
        >
          {flowStatus === 'saving' ? '保存中...' : '我已了解任务，继续'}
        </button>
      </div>
    </div>
  )
}

const sectionStyle: React.CSSProperties = {
  marginTop: '24px',
  padding: '20px',
  background: '#fff',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
}

const cardStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '200px',
  padding: '16px',
  background: '#f9f9f9',
  borderRadius: '6px',
  border: '1px solid #e8e8e8',
}

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#888',
  marginBottom: '4px',
}

const valueStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '4px',
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  borderBottom: '2px solid #ddd',
  fontSize: '14px',
}

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #eee',
  fontSize: '14px',
}
