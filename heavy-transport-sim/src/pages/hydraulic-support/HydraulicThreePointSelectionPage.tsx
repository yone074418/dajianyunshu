import { useCallback, useState } from 'react'
import {
  createHydraulicSupportDraft,
  selectHydraulicSupportPoint,
  undoHydraulicSupportPoint,
  removeHydraulicSupportPoint,
  resetHydraulicSupportSelection,
  validateThreePointSelection,
  completeThreePointSelection,
  getRegionPointStatus,
  getSelectionProgress,
  createHydraulicSupportOperationLog,
  type HydraulicSupportDraft,
  type HydraulicSupportOperationLog,
  type HydraulicRegionId,
  type HydraulicThreePointResult,
} from '../../domain/hydraulicSupport'
import type { TrailerAssemblyResult } from '../../domain/trailerAssembly'

// ── Mock trailer result for demo ─────────────────────────────────────

const DEMO_TRAILER_RESULT: TrailerAssemblyResult = {
  id: 'demo-ta-result',
  targetAxleLines: 6,
  targetColumns: 2,
  completedAxleLines: 6,
  completedColumns: 2,
  moduleCount: 10,
  connectionOrder: [
    '主纵列',
    '轴线 1',
    '轴线 2',
    '轴线 3',
    '纵列 2',
    '轴线 4',
    '轴线 5',
    '轴线 6',
    '牵引端连接',
    '纵列对齐检查',
  ],
  visualSummary: '6轴线 × 2纵列，共 10 个模块',
  readyForHydraulicPointSelection: true,
  teachingNote: '拼接完成。',
  completedAt: new Date().toISOString(),
}

// ── Helpers ──────────────────────────────────────────────────────────

const regionLabel: Record<HydraulicRegionId, string> = {
  front_region: '前部液压区域',
  middle_region: '中部液压区域',
  rear_region: '后部液压区域',
}

const regionColor: Record<HydraulicRegionId, string> = {
  front_region: '#3b82f6',
  middle_region: '#8b5cf6',
  rear_region: '#f59e0b',
}

// ── HydraulicSelectionProgress ───────────────────────────────────────

function HydraulicSelectionProgress({
  draft,
}: {
  draft: HydraulicSupportDraft
}) {
  const progress = getSelectionProgress(draft)
  return (
    <div
      data-testid="selection-progress"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 0',
        fontSize: 15,
        fontWeight: 'bold',
      }}
    >
      <span>选择进度：</span>
      <span
        style={{
          color: progress.current === 3 ? '#10b981' : '#3b82f6',
          fontSize: 18,
        }}
      >
        {progress.label}
      </span>
      {draft.status === 'completed' && (
        <span style={{ color: '#10b981', fontSize: 13 }}>编点完成</span>
      )}
    </div>
  )
}

// ── HydraulicSelectionErrorFeedback ──────────────────────────────────

function HydraulicSelectionErrorFeedback({
  error,
}: {
  error: HydraulicSupportDraft['lastError']
}) {
  if (!error) return null
  return (
    <div
      data-testid="error-feedback"
      style={{
        border: '1px solid #ef4444',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fef2f2',
        color: '#991b1b',
        fontSize: 14,
      }}
    >
      <strong>错误 [{error.code}]：</strong>
      <span style={{ marginLeft: 8 }}>{error.message}</span>
    </div>
  )
}

// ── HydraulicRegionCard ──────────────────────────────────────────────

function HydraulicRegionCard({
  draft,
  regionId,
}: {
  draft: HydraulicSupportDraft
  regionId: HydraulicRegionId
}) {
  const region = draft.regions.find((r) => r.id === regionId)!
  const status = getRegionPointStatus(draft, regionId)

  return (
    <div
      data-testid={`region-card-${regionId}`}
      style={{
        border: `2px solid ${status.selected ? regionColor[regionId] : '#d1d5db'}`,
        borderRadius: 8,
        padding: 12,
        backgroundColor: status.selected ? '#f0f9ff' : '#f9fafb',
        flex: 1,
        minWidth: 160,
      }}
    >
      <div
        style={{
          fontWeight: 'bold',
          fontSize: 14,
          color: regionColor[regionId],
          marginBottom: 4,
        }}
      >
        {region.name}
      </div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
        {region.description}
      </div>
      <div style={{ fontSize: 13 }}>
        {status.selected && status.point ? (
          <span style={{ color: '#059669' }}>
            已选：{status.point.label}（{status.point.positionLabel}）
          </span>
        ) : (
          <span style={{ color: '#9ca3af' }}>未选择</span>
        )}
      </div>
    </div>
  )
}

// ── HydraulicRegionDisplay ───────────────────────────────────────────

function HydraulicRegionDisplay({ draft }: { draft: HydraulicSupportDraft }) {
  return (
    <div data-testid="region-display">
      <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>三处液压区域</h3>
      <div style={{ display: 'flex', gap: 12 }}>
        <HydraulicRegionCard draft={draft} regionId="front_region" />
        <HydraulicRegionCard draft={draft} regionId="middle_region" />
        <HydraulicRegionCard draft={draft} regionId="rear_region" />
      </div>
    </div>
  )
}

// ── SelectedSupportPointList ─────────────────────────────────────────

function SelectedSupportPointList({
  draft,
  onRemove,
}: {
  draft: HydraulicSupportDraft
  onRemove: (pointId: string) => void
}) {
  if (draft.selectedPoints.length === 0) return null

  return (
    <div data-testid="selected-points-list">
      <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>已选支撑点</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {draft.selectedPoints.map((p, i) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 10px',
              backgroundColor: '#f0f9ff',
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            <span>
              {i + 1}. {p.label} — {p.positionLabel}（{regionLabel[p.regionId]}
              ）
            </span>
            <button
              data-testid={`remove-point-${p.id}`}
              onClick={() => onRemove(p.id)}
              style={{
                fontSize: 11,
                padding: '2px 8px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: 4,
                cursor: 'pointer',
                color: '#991b1b',
              }}
            >
              移除
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── HydraulicSupportWorkspace ────────────────────────────────────────

function HydraulicSupportWorkspace({
  draft,
  onSelectPoint,
}: {
  draft: HydraulicSupportDraft
  onSelectPoint: (pointId: string) => void
}) {
  if (draft.status === 'blocked') {
    return (
      <div
        data-testid="hydraulic-workspace"
        style={{
          border: '2px solid #ef4444',
          borderRadius: 8,
          padding: 16,
          backgroundColor: '#fef2f2',
          textAlign: 'center',
          color: '#991b1b',
        }}
      >
        需先完成挂车轴线/纵列拼接，再进入液压支撑三点编点。
      </div>
    )
  }

  // Group points by region for display
  const pointsByRegion: Record<
    HydraulicRegionId,
    typeof draft.candidatePoints
  > = {
    front_region: [],
    middle_region: [],
    rear_region: [],
  }
  for (const p of draft.candidatePoints) {
    pointsByRegion[p.regionId].push(p)
  }

  return (
    <div
      data-testid="hydraulic-workspace"
      style={{
        border: '2px solid #3b82f6',
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#eff6ff',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          fontSize: 12,
          color: '#6b7280',
          marginBottom: 8,
        }}
      >
        ← 牵引方向
      </div>
      <h3 style={{ margin: '0 0 12px', color: '#1e40af', fontSize: 15 }}>
        可选支撑点（点击选择）
      </h3>

      <div style={{ display: 'flex', gap: 16 }}>
        {(Object.keys(pointsByRegion) as HydraulicRegionId[]).map(
          (regionId) => (
            <div key={regionId} style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: 13,
                  color: regionColor[regionId],
                  marginBottom: 6,
                }}
              >
                {regionLabel[regionId]}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {pointsByRegion[regionId].map((point) => {
                  const isSelected = draft.selectedPoints.some(
                    (sp) => sp.id === point.id,
                  )
                  const regionHasPoint = draft.regions.some(
                    (r) => r.id === regionId && r.selectedPointId,
                  )
                  const isDisabled =
                    isSelected ||
                    (regionHasPoint &&
                      !draft.selectedPoints.some((sp) => sp.id === point.id)) ||
                    draft.selectedPoints.length >= 3

                  return (
                    <button
                      key={point.id}
                      data-testid={`support-point-${point.id}`}
                      onClick={() => onSelectPoint(point.id)}
                      disabled={isDisabled}
                      style={{
                        padding: '6px 10px',
                        fontSize: 12,
                        borderRadius: 6,
                        border: isSelected
                          ? `2px solid ${regionColor[regionId]}`
                          : '1px solid #d1d5db',
                        backgroundColor: isSelected
                          ? regionColor[regionId]
                          : isDisabled
                            ? '#f3f4f6'
                            : 'white',
                        color: isSelected
                          ? 'white'
                          : isDisabled
                            ? '#9ca3af'
                            : '#374151',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled && !isSelected ? 0.5 : 1,
                      }}
                    >
                      {point.label}（{point.positionLabel}）
                      {isSelected ? ' ✓' : ''}
                    </button>
                  )
                })}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  )
}

// ── HydraulicSupportResultPreview ────────────────────────────────────

function HydraulicSupportResultPreview({
  result,
}: {
  result: HydraulicThreePointResult
}) {
  return (
    <div
      data-testid="result-preview"
      style={{
        border: '2px solid #10b981',
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#ecfdf5',
      }}
    >
      <h3 style={{ margin: '0 0 12px', color: '#065f46' }}>三点编点完成</h3>
      <div
        style={{
          fontSize: 14,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}
      >
        <div>已选支撑点：{result.pointCount}</div>
        <div>液压区域：{result.regionCount}</div>
        <div>
          可进入阀门编点：{result.readyForValveCircuitStep ? '是' : '否'}
        </div>
        <div>完成状态：{result.completed ? '已完成' : '未完成'}</div>
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: '#374151' }}>
        <strong>摘要：</strong> {result.visualSummary}
      </div>
      <div style={{ marginTop: 12, fontSize: 13 }}>
        <strong>已选点详情：</strong>
        <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
          {result.selectedPoints.map((p) => (
            <li key={p.id}>
              {p.label} — {p.positionLabel}（{regionLabel[p.regionId]}）
            </li>
          ))}
        </ul>
      </div>
      <div
        style={{
          marginTop: 12,
          padding: 8,
          backgroundColor: '#fef3c7',
          borderRadius: 6,
          fontSize: 13,
          color: '#92400e',
        }}
      >
        <strong>教学提示：</strong> {result.teachingNote}
      </div>
    </div>
  )
}

// ── HydraulicSupportOperationLogDisplay ──────────────────────────────

function HydraulicSupportOperationLogDisplay({
  logs,
}: {
  logs: HydraulicSupportOperationLog[]
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
              <th style={thStyle}>状态</th>
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
                <td style={tdStyle}>{log.resultStatus}</td>
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

export default function HydraulicThreePointSelectionPage() {
  const [draft, setDraft] = useState<HydraulicSupportDraft | null>(null)
  const [logs, setLogs] = useState<HydraulicSupportOperationLog[]>([])
  const [result, setResult] = useState<HydraulicThreePointResult | null>(null)

  const addLog = useCallback(
    (log: HydraulicSupportOperationLog) => setLogs((prev) => [...prev, log]),
    [],
  )

  const handleStartWithDemo = useCallback(() => {
    const newDraft = createHydraulicSupportDraft({
      trailerAssemblyResult: DEMO_TRAILER_RESULT,
    })
    setDraft(newDraft)
    setResult(null)
    addLog(
      createHydraulicSupportOperationLog({
        draftId: newDraft.id,
        action: 'view_hydraulic_support',
        resultStatus: newDraft.status,
        message: '进入液压支撑三点编点页面（教学示例数据）。',
      }),
    )
  }, [addLog])

  const handleStartWithoutResult = useCallback(() => {
    const newDraft = createHydraulicSupportDraft({})
    setDraft(newDraft)
    setResult(null)
    addLog(
      createHydraulicSupportOperationLog({
        draftId: newDraft.id,
        action: 'view_hydraulic_support',
        resultStatus: 'blocked',
        message: '需先完成挂车轴线/纵列拼接。',
      }),
    )
  }, [addLog])

  const handleSelectPoint = useCallback(
    (pointId: string) => {
      if (!draft) return
      const r = selectHydraulicSupportPoint(draft, pointId)
      setDraft(r.draft)
      addLog(r.log)
    },
    [draft, addLog],
  )

  const handleUndo = useCallback(() => {
    if (!draft) return
    const r = undoHydraulicSupportPoint(draft)
    setDraft(r.draft)
    addLog(r.log)
  }, [draft, addLog])

  const handleRemovePoint = useCallback(
    (pointId: string) => {
      if (!draft) return
      const r = removeHydraulicSupportPoint(draft, pointId)
      setDraft(r.draft)
      addLog(r.log)
    },
    [draft, addLog],
  )

  const handleReset = useCallback(() => {
    if (!draft) return
    const r = resetHydraulicSupportSelection(draft)
    setDraft(r.draft)
    addLog(r.log)
  }, [draft, addLog])

  const handleComplete = useCallback(() => {
    if (!draft) return
    const validation = validateThreePointSelection(draft)
    if (!validation.valid && validation.error) {
      setDraft({ ...draft, status: 'invalid', lastError: validation.error })
      addLog(
        createHydraulicSupportOperationLog({
          draftId: draft.id,
          action: 'selection_error',
          resultStatus: 'invalid',
          errorCode: validation.error.code,
          message: validation.error.message,
        }),
      )
      return
    }
    const { result: r, log } = completeThreePointSelection(draft)
    setResult(r)
    setDraft({ ...draft, status: 'completed' })
    addLog(log)
  }, [draft, addLog])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
        液压支撑三点编点
      </h1>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
        本页面为 Day74
        液压支撑三点编点交互。只做支撑点编点和区域显示，不做阀门开关和回路连通。
        Day75 才做阀门开关和回路连通状态。Day76 才做轴线载荷规则和重新选择流程。
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
          <h3 style={{ margin: '0 0 12px' }}>进入编点</h3>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
            请选择一种方式进入液压支撑三点编点：
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              data-testid="btn-start-with-demo"
              onClick={handleStartWithDemo}
              style={btnStyle('#3b82f6')}
            >
              使用教学示例数据（6×2 挂车）
            </button>
            <button
              data-testid="btn-start-without-result"
              onClick={handleStartWithoutResult}
              style={btnStyle('#6b7280')}
            >
              无挂车拼接结果（将被阻断）
            </button>
          </div>
        </div>
      )}

      {/* Blocked state */}
      {draft?.status === 'blocked' && (
        <div style={{ marginBottom: 16 }}>
          <HydraulicSelectionErrorFeedback error={draft.lastError} />
        </div>
      )}

      {/* Selection progress */}
      {draft && draft.status !== 'blocked' && (
        <div style={{ marginBottom: 12 }}>
          <HydraulicSelectionProgress draft={draft} />
        </div>
      )}

      {/* Error feedback */}
      {draft?.lastError && draft.status === 'invalid' && (
        <div style={{ marginBottom: 12 }}>
          <HydraulicSelectionErrorFeedback error={draft.lastError} />
        </div>
      )}

      {/* Workspace */}
      {draft && (
        <div style={{ marginBottom: 16 }}>
          <HydraulicSupportWorkspace
            draft={draft}
            onSelectPoint={handleSelectPoint}
          />
        </div>
      )}

      {/* Selected points list */}
      {draft && draft.selectedPoints.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SelectedSupportPointList
            draft={draft}
            onRemove={handleRemovePoint}
          />
        </div>
      )}

      {/* Undo / Reset / Complete buttons */}
      {draft && draft.status !== 'blocked' && (
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 16,
            justifyContent: 'center',
          }}
        >
          {draft.selectedPoints.length > 0 && (
            <button
              data-testid="btn-undo"
              onClick={handleUndo}
              style={btnStyle('#f59e0b')}
            >
              撤销上一个
            </button>
          )}
          {draft.selectedPoints.length > 0 && (
            <button
              data-testid="btn-reset"
              onClick={handleReset}
              style={btnStyle('#ef4444')}
            >
              重置全部
            </button>
          )}
          {draft.selectedPoints.length === 3 &&
            draft.status !== 'completed' && (
              <button
                data-testid="btn-complete"
                onClick={handleComplete}
                style={btnStyle('#10b981')}
              >
                确认完成
              </button>
            )}
        </div>
      )}

      {/* Hydraulic region display */}
      {draft && draft.status !== 'blocked' && (
        <div style={{ marginBottom: 16 }}>
          <HydraulicRegionDisplay draft={draft} />
        </div>
      )}

      {/* Result preview */}
      {result && (
        <div style={{ marginBottom: 16 }}>
          <HydraulicSupportResultPreview result={result} />
        </div>
      )}

      {/* Operation log */}
      <div style={{ marginBottom: 16 }}>
        <HydraulicSupportOperationLogDisplay logs={logs} />
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
          本页面仅实现 Day74 液压支撑三点编点交互和区域显示。
        </p>
        <p style={{ margin: '0 0 4px' }}>
          - 未实现 Day75 阀门开关和回路连通状态。
        </p>
        <p style={{ margin: '0 0 4px' }}>
          - 未实现 Day76 轴线载荷规则和重新选择流程。
        </p>
        <p style={{ margin: 0 }}>
          - 三点编点结果仅表示支撑点位置选定，不代表液压系统校核通过。
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
