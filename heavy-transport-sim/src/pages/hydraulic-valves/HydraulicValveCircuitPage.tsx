import { useCallback, useState } from 'react'
import {
  createHydraulicValveCircuitDraft,
  toggleHydraulicValve,
  resetHydraulicValves,
  getOverallStateDisplayText,
  getValveStateDisplayText,
  getCircuitStateDisplayText,
  createHydraulicValveOperationLog,
  type HydraulicValveCircuitDraft,
  type HydraulicValveOperationLog,
  type HydraulicOverallState,
} from '../../domain/hydraulicValveCircuit'
import type { HydraulicThreePointResult } from '../../domain/hydraulicSupport'

// ── Mock three-point result for demo ─────────────────────────────────

const DEMO_THREE_POINT_RESULT: HydraulicThreePointResult = {
  id: 'demo-hs-result',
  selectedPoints: [
    {
      id: 'sp-1',
      label: '支撑点 1',
      regionId: 'front_region',
      columnIndex: 0,
      axleIndex: 0,
      positionLabel: '纵列 1 · 轴线 1',
    },
    {
      id: 'sp-2',
      label: '支撑点 2',
      regionId: 'middle_region',
      columnIndex: 0,
      axleIndex: 1,
      positionLabel: '纵列 1 · 轴线 2',
    },
    {
      id: 'sp-3',
      label: '支撑点 3',
      regionId: 'rear_region',
      columnIndex: 1,
      axleIndex: 2,
      positionLabel: '纵列 2 · 轴线 3',
    },
  ],
  regions: [
    {
      id: 'front_region',
      name: '前部液压区域',
      description: '前部',
      selectedPointId: 'sp-1',
    },
    {
      id: 'middle_region',
      name: '中部液压区域',
      description: '中部',
      selectedPointId: 'sp-2',
    },
    {
      id: 'rear_region',
      name: '后部液压区域',
      description: '后部',
      selectedPointId: 'sp-3',
    },
  ],
  pointCount: 3,
  regionCount: 3,
  completed: true,
  visualSummary: '3 个支撑点覆盖 3 处液压区域。',
  readyForValveCircuitStep: true,
  teachingNote: '三点编点完成。',
  completedAt: new Date().toISOString(),
}

// ── Helpers ──────────────────────────────────────────────────────────

const regionColors: Record<string, string> = {
  front_region: '#3b82f6',
  middle_region: '#8b5cf6',
  rear_region: '#f59e0b',
}

const overallColors: Record<HydraulicOverallState, string> = {
  all_connected: '#10b981',
  partially_connected: '#f59e0b',
  all_disconnected: '#ef4444',
  blocked: '#6b7280',
}

// ── HydraulicRegionCircuitCard ───────────────────────────────────────

function HydraulicRegionCircuitCard({
  draft,
  regionId,
  onToggle,
}: {
  draft: HydraulicValveCircuitDraft
  regionId: string
  onToggle: (valveId: string) => void
}) {
  const region = draft.regions.find((r) => r.id === regionId)
  const valve = draft.valves.find((v) => v.regionId === regionId)
  if (!region || !valve) return null

  const color = regionColors[regionId] ?? '#6b7280'
  const isConnected = region.circuitState === 'connected'

  return (
    <div
      data-testid={`region-card-${regionId}`}
      style={{
        border: `2px solid ${isConnected ? color : '#d1d5db'}`,
        borderRadius: 8,
        padding: 16,
        backgroundColor: isConnected ? '#f0f9ff' : '#f9fafb',
        flex: 1,
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: 15, color, marginBottom: 8 }}>
        {region.name}
      </div>
      {region.selectedPointId && (
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
          支撑点：{region.selectedPointId}
        </div>
      )}
      <div style={{ fontSize: 13, marginBottom: 4 }}>阀门：{valve.label}</div>
      <div style={{ fontSize: 13, marginBottom: 4 }}>
        阀门状态：
        <span
          style={{
            fontWeight: 'bold',
            color: isConnected ? '#059669' : '#dc2626',
          }}
        >
          {getValveStateDisplayText(valve.state)}
        </span>
      </div>
      <div style={{ fontSize: 13, marginBottom: 12 }}>
        回路状态：
        <span
          style={{
            fontWeight: 'bold',
            color: isConnected ? '#059669' : '#dc2626',
          }}
        >
          {getCircuitStateDisplayText(region.circuitState)}
        </span>
      </div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
        {region.displayText}
      </div>
      <button
        data-testid={`toggle-valve-${valve.id}`}
        onClick={() => onToggle(valve.id)}
        style={{
          width: '100%',
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: 'bold',
          backgroundColor: isConnected ? '#ef4444' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        {isConnected ? '关闭阀门' : '打开阀门'}
      </button>
    </div>
  )
}

// ── HydraulicCircuitStateDisplay ─────────────────────────────────────

function HydraulicCircuitStateDisplay({
  draft,
}: {
  draft: HydraulicValveCircuitDraft
}) {
  return (
    <div
      data-testid="overall-circuit-state"
      style={{
        border: `2px solid ${overallColors[draft.overallState]}`,
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#f9fafb',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
        整体回路状态
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: overallColors[draft.overallState],
        }}
      >
        {getOverallStateDisplayText(draft.overallState)}
      </div>
    </div>
  )
}

// ── HydraulicValveOperationLogDisplay ────────────────────────────────

function HydraulicValveOperationLogDisplay({
  logs,
}: {
  logs: HydraulicValveOperationLog[]
}) {
  if (logs.length === 0) return null
  return (
    <div data-testid="operation-log" style={{ fontSize: 13 }}>
      <h4 style={{ margin: '0 0 8px' }}>操作日志</h4>
      <div
        style={{
          maxHeight: 200,
          overflow: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: 6,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={thStyle}>时间</th>
              <th style={thStyle}>操作</th>
              <th style={thStyle}>消息</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={tdStyle}>
                  {new Date(log.createdAt).toLocaleTimeString()}
                </td>
                <td style={tdStyle}>{log.action}</td>
                <td style={tdStyle}>{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '6px 8px',
  textAlign: 'left',
  borderBottom: '1px solid #e5e7eb',
  fontSize: 12,
}

const tdStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderBottom: '1px solid #f3f4f6',
  fontSize: 12,
}

// ── Main Page ────────────────────────────────────────────────────────

export default function HydraulicValveCircuitPage() {
  const [draft, setDraft] = useState<HydraulicValveCircuitDraft | null>(null)
  const [logs, setLogs] = useState<HydraulicValveOperationLog[]>([])

  const addLog = useCallback(
    (log: HydraulicValveOperationLog) => setLogs((prev) => [...prev, log]),
    [],
  )

  const handleStartWithDemo = useCallback(() => {
    const newDraft = createHydraulicValveCircuitDraft({
      threePointResult: DEMO_THREE_POINT_RESULT,
    })
    setDraft(newDraft)
    addLog(
      createHydraulicValveOperationLog({
        draftId: newDraft.id,
        action: 'view_valve_circuit',
        overallState: newDraft.overallState,
        message: '进入阀门开关和回路连通状态页面（教学示例数据）。',
      }),
    )
  }, [addLog])

  const handleStartWithoutResult = useCallback(() => {
    const newDraft = createHydraulicValveCircuitDraft({})
    setDraft(newDraft)
    addLog(
      createHydraulicValveOperationLog({
        draftId: newDraft.id,
        action: 'view_valve_circuit',
        message: '需先完成液压支撑三点编点。',
      }),
    )
  }, [addLog])

  const handleToggle = useCallback(
    (valveId: string) => {
      if (!draft) return
      const result = toggleHydraulicValve(draft, valveId)
      setDraft(result.draft)
      addLog(result.log)
    },
    [draft, addLog],
  )

  const handleReset = useCallback(() => {
    if (!draft) return
    const result = resetHydraulicValves(draft)
    setDraft(result.draft)
    addLog(result.log)
  }, [draft, addLog])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
        阀门开关与回路连通状态
      </h1>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
        本页面为 Day75
        阀门开关和回路连通状态交互。只做教学简化回路连通状态，不做真实液压压力仿真。
        Day76 才做轴线载荷规则和重新选择流程。
      </p>

      {/* Start section */}
      {!draft && (
        <div
          style={{
            border: '1px solid #d1d5db',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            backgroundColor: '#f9fafb',
          }}
        >
          <h3 style={{ margin: '0 0 12px' }}>进入阀门回路</h3>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
            请选择一种方式进入：
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              data-testid="btn-start-with-demo"
              onClick={handleStartWithDemo}
              style={btnStyle('#3b82f6')}
            >
              使用教学示例数据（三点编点已完成）
            </button>
            <button
              data-testid="btn-start-without-result"
              onClick={handleStartWithoutResult}
              style={btnStyle('#6b7280')}
            >
              无三点编点结果（将被阻断）
            </button>
          </div>
        </div>
      )}

      {/* Blocked state */}
      {draft?.status === 'blocked' && (
        <div
          data-testid="error-feedback"
          style={{
            border: '1px solid #ef4444',
            borderRadius: 8,
            padding: 12,
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          <strong>阻断：</strong>
          <span style={{ marginLeft: 8 }}>{draft.lastError?.message}</span>
        </div>
      )}

      {/* Three region cards with valve switches */}
      {draft && draft.status !== 'blocked' && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>
            三处液压区域与阀门
          </h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <HydraulicRegionCircuitCard
              draft={draft}
              regionId="front_region"
              onToggle={handleToggle}
            />
            <HydraulicRegionCircuitCard
              draft={draft}
              regionId="middle_region"
              onToggle={handleToggle}
            />
            <HydraulicRegionCircuitCard
              draft={draft}
              regionId="rear_region"
              onToggle={handleToggle}
            />
          </div>
        </div>
      )}

      {/* Overall circuit state */}
      {draft && draft.status !== 'blocked' && (
        <div style={{ marginBottom: 16 }}>
          <HydraulicCircuitStateDisplay draft={draft} />
        </div>
      )}

      {/* Reset button */}
      {draft && draft.status !== 'blocked' && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <button
            data-testid="btn-reset-valves"
            onClick={handleReset}
            style={btnStyle('#ef4444')}
          >
            重置所有阀门
          </button>
        </div>
      )}

      {/* Operation log */}
      <div style={{ marginBottom: 16 }}>
        <HydraulicValveOperationLogDisplay logs={logs} />
      </div>

      {/* Scope notes */}
      <div
        style={{
          marginTop: 24,
          padding: 12,
          backgroundColor: '#fef3c7',
          borderRadius: 8,
          fontSize: 13,
          color: '#92400e',
        }}
      >
        <p style={{ margin: '0 0 4px' }}>
          <strong>说明：</strong>
          本页面仅实现 Day75 阀门开关和回路连通状态。
        </p>
        <p style={{ margin: '0 0 4px' }}>
          - 未实现 Day76 轴线载荷规则和重新选择流程。
        </p>
        <p style={{ margin: '0 0 4px' }}>
          - 未实现真实液压压力计算和油路仿真。
        </p>
        <p style={{ margin: 0 }}>
          - 阀门状态为教学简化模型，不代表真实液压系统。
        </p>
      </div>
    </div>
  )
}

const btnStyle = (bg: string) => ({
  padding: '8px 16px',
  fontSize: 13,
  backgroundColor: bg,
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
})
