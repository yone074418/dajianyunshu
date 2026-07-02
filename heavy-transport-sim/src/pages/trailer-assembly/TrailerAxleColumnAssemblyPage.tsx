import { useCallback, useMemo, useState } from 'react'
import {
  createTrailerAssemblyDraft,
  applyTrailerAssemblyStep,
  resetTrailerAssemblyDraft,
  createTrailerAssemblyOperationLog,
  validateTrailerAssemblyDraft,
  getColumnLayouts,
  hasTractorConnector,
  hasAlignmentMarker,
  type TrailerAssemblyDraft,
  type TrailerAssemblyStep,
  type TrailerAssemblyOperationLog,
  type TrailerAssemblyStepType,
} from '../../domain/trailerAssembly'
import {
  AXLE_LINE_OPTIONS,
  COLUMN_OPTIONS,
  AXLE_COLUMN_RULES,
} from '../../domain/trailerSelection'

// ── Helpers ──────────────────────────────────────────────────────────

function getStepLabel(stepType: TrailerAssemblyStepType): string {
  const labels: Record<TrailerAssemblyStepType, string> = {
    select_target_configuration: '选择目标方案',
    place_main_column: '放置主纵列',
    add_axle_module: '添加轴线模块',
    add_side_column: '添加侧纵列',
    connect_tractor_end: '连接牵引端',
    align_columns: '纵列对齐检查',
    complete_assembly: '完成拼接',
    reset_assembly: '重置拼接',
  }
  return labels[stepType]
}

// ── TrailerAssemblyWorkspace ─────────────────────────────────────────

function TrailerAssemblyWorkspace({
  draft,
  onPlaceModule,
}: {
  draft: TrailerAssemblyDraft
  onPlaceModule: (step: TrailerAssemblyStep) => void
}) {
  const layouts = getColumnLayouts(draft)
  const hasConnector = hasTractorConnector(draft)
  const hasAlign = hasAlignmentMarker(draft)

  return (
    <div
      data-testid="trailer-assembly-workspace"
      style={{
        border: '2px solid #3b82f6',
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#eff6ff',
      }}
    >
      <h3 style={{ margin: '0 0 12px', color: '#1e40af' }}>拼接工作区</h3>

      {draft.status === 'empty' ? (
        <p style={{ color: '#6b7280' }}>请先选择目标挂车方案。</p>
      ) : (
        <div>
          {/* Target info */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginBottom: 12,
              fontSize: 14,
            }}
          >
            <span>
              目标：{draft.targetAxleLines}轴线 / {draft.targetColumns}纵列
            </span>
            <span>
              当前：{draft.currentAxleLines}轴线 / {draft.currentColumns}纵列
            </span>
          </div>

          {/* Tractor direction indicator */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: 8,
              fontSize: 13,
              color: '#6b7280',
            }}
          >
            ← 牵引方向
          </div>

          {/* Visual grid */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              minHeight: 120,
            }}
          >
            {layouts.map((layout) => (
              <div
                key={layout.columnIndex}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: layout.isMain ? '#1d4ed8' : '#6b7280',
                  }}
                >
                  {layout.label}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    gap: 2,
                  }}
                >
                  {layout.axles.map((axle) => (
                    <div
                      key={axle.id}
                      data-testid="axle-module"
                      style={{
                        width: 48,
                        height: 24,
                        backgroundColor: layout.isMain ? '#3b82f6' : '#93c5fd',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: 'white',
                      }}
                    >
                      {axle.label}
                    </div>
                  ))}
                </div>
                {/* Add axle button per column */}
                {draft.currentAxleLines < draft.targetAxleLines && (
                  <button
                    data-testid={`add-axle-col-${layout.columnIndex}`}
                    onClick={() =>
                      onPlaceModule({
                        id: `step-${Date.now()}`,
                        stepType: 'add_axle_module',
                        columnIndex: layout.columnIndex,
                        createdAt: new Date().toISOString(),
                      })
                    }
                    style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      cursor: 'pointer',
                      backgroundColor: '#dbeafe',
                      border: '1px solid #93c5fd',
                      borderRadius: 4,
                    }}
                  >
                    + 轴线
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Connector & alignment status */}
          <div
            style={{
              marginTop: 12,
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              fontSize: 13,
            }}
          >
            <span>牵引端：{hasConnector ? '✅ 已连接' : '⬜ 未连接'}</span>
            <span>对齐检查：{hasAlign ? '✅ 已完成' : '⬜ 未检查'}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── TrailerAxleModulePalette ─────────────────────────────────────────

function TrailerAxleModulePalette({
  draft,
  onPlaceMainColumn,
  onAddSideColumn,
  onConnectTractor,
  onAlignColumns,
}: {
  draft: TrailerAssemblyDraft
  onPlaceMainColumn: () => void
  onAddSideColumn: () => void
  onConnectTractor: () => void
  onAlignColumns: () => void
}) {
  const hasMainColumn = draft.placedModules.some(
    (m) => m.moduleType === 'main_column',
  )
  const hasConnector = hasTractorConnector(draft)

  if (draft.status === 'empty') return null

  return (
    <div
      data-testid="module-palette"
      style={{
        border: '1px solid #d1d5db',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f9fafb',
      }}
    >
      <h4 style={{ margin: '0 0 8px' }}>可选操作</h4>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {!hasMainColumn && (
          <button
            data-testid="btn-place-main-column"
            onClick={onPlaceMainColumn}
            style={btnStyle('#3b82f6')}
          >
            放置主纵列
          </button>
        )}
        {hasMainColumn && draft.currentColumns < draft.targetColumns && (
          <button
            data-testid="btn-add-side-column"
            onClick={onAddSideColumn}
            style={btnStyle('#8b5cf6')}
          >
            添加侧纵列
          </button>
        )}
        {!hasConnector && draft.currentAxleLines >= draft.targetAxleLines && (
          <button
            data-testid="btn-connect-tractor"
            onClick={onConnectTractor}
            style={btnStyle('#f59e0b')}
          >
            连接牵引端
          </button>
        )}
        {hasConnector && !hasAlignmentMarker(draft) && (
          <button
            data-testid="btn-align-columns"
            onClick={onAlignColumns}
            style={btnStyle('#10b981')}
          >
            纵列对齐检查
          </button>
        )}
      </div>
    </div>
  )
}

const btnStyle = (bg: string) => ({
  padding: '6px 14px',
  fontSize: 13,
  backgroundColor: bg,
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
})

// ── TrailerAssemblyStepList ──────────────────────────────────────────

function TrailerAssemblyStepList({ draft }: { draft: TrailerAssemblyDraft }) {
  const steps = draft.steps
  if (steps.length === 0) return null

  return (
    <div data-testid="step-list" style={{ fontSize: 13 }}>
      <h4 style={{ margin: '0 0 8px' }}>拼接步骤记录</h4>
      <ol style={{ paddingLeft: 20, margin: 0 }}>
        {steps.map((s) => (
          <li key={s.id} style={{ marginBottom: 4 }}>
            {getStepLabel(s.stepType)}
            {s.columnIndex !== undefined && ` (纵列 ${s.columnIndex + 1})`}
          </li>
        ))}
      </ol>
    </div>
  )
}

// ── TrailerAssemblyErrorFeedback ─────────────────────────────────────

function TrailerAssemblyErrorFeedback({
  error,
}: {
  error: TrailerAssemblyDraft['lastError']
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
      }}
    >
      <strong>拼接错误 [{error.code}]：</strong>
      <span style={{ marginLeft: 8 }}>{error.message}</span>
    </div>
  )
}

// ── TrailerAssemblyResultCard ────────────────────────────────────────

function TrailerAssemblyResultCard({ draft }: { draft: TrailerAssemblyDraft }) {
  const result = draft.result
  if (!result) return null

  return (
    <div
      data-testid="result-card"
      style={{
        border: '2px solid #10b981',
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#ecfdf5',
      }}
    >
      <h3 style={{ margin: '0 0 12px', color: '#065f46' }}>拼接完成结果</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          fontSize: 14,
        }}
      >
        <div>目标轴线数：{result.targetAxleLines}</div>
        <div>目标纵列数：{result.targetColumns}</div>
        <div>完成轴线数：{result.completedAxleLines}</div>
        <div>完成纵列数：{result.completedColumns}</div>
        <div>模块总数：{result.moduleCount}</div>
        <div>
          可进入液压编点：
          {result.readyForHydraulicPointSelection ? '是' : '否'}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <h4 style={{ margin: '0 0 4px', fontSize: 14 }}>连接顺序</h4>
        <div style={{ fontSize: 13, color: '#374151' }}>
          {result.connectionOrder.join(' → ')}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <h4 style={{ margin: '0 0 4px', fontSize: 14 }}>可视化摘要</h4>
        <div style={{ fontSize: 13, color: '#374151' }}>
          {result.visualSummary}
        </div>
      </div>

      {/* Visual result */}
      <div
        data-testid="result-visual"
        style={{
          marginTop: 12,
          padding: 12,
          backgroundColor: 'white',
          borderRadius: 6,
          border: '1px solid #d1d5db',
        }}
      >
        <div style={{ textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
          ← 牵引方向
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            marginTop: 8,
          }}
        >
          {getColumnLayouts(draft).map((layout) => (
            <div
              key={layout.columnIndex}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 'bold' }}>
                {layout.label}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  gap: 2,
                }}
              >
                {layout.axles.map((axle) => (
                  <div
                    key={axle.id}
                    style={{
                      width: 48,
                      height: 24,
                      backgroundColor: layout.isMain ? '#10b981' : '#6ee7b7',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: 'white',
                    }}
                  >
                    {axle.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {hasTractorConnector(draft) && (
          <div
            style={{
              textAlign: 'center',
              marginTop: 8,
              fontSize: 12,
              color: '#059669',
            }}
          >
            ✅ 牵引端已连接
          </div>
        )}
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

// ── TrailerAssemblyOperationLog ──────────────────────────────────────

function TrailerAssemblyOperationLog({
  logs,
}: {
  logs: TrailerAssemblyOperationLog[]
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

// ── TrailerAxleColumnAssemblyPanel ───────────────────────────────────

export default function TrailerAxleColumnAssemblyPage() {
  const [draft, setDraft] = useState<TrailerAssemblyDraft | null>(null)
  const [logs, setLogs] = useState<TrailerAssemblyOperationLog[]>([])
  const [targetAxleLines, setTargetAxleLines] = useState<number>(6)
  const [targetColumns, setTargetColumns] = useState<number>(2)

  const allowedColumns = useMemo(
    () =>
      AXLE_COLUMN_RULES.filter(
        (r) => r.axleLines === targetAxleLines && r.allowed,
      ).map((r) => r.columns),
    [targetAxleLines],
  )

  // Adjust targetColumns when allowed columns change (called from onChange)
  const adjustTargetColumns = useCallback(
    (newAxleLines: number) => {
      const newAllowed = AXLE_COLUMN_RULES.filter(
        (r) => r.axleLines === newAxleLines && r.allowed,
      ).map((r) => r.columns)
      if (newAllowed.length > 0 && !newAllowed.includes(targetColumns)) {
        setTargetColumns(newAllowed[0])
      }
    },
    [targetColumns],
  )

  const addLog = useCallback((log: TrailerAssemblyOperationLog) => {
    setLogs((prev) => [...prev, log])
  }, [])

  const handleSelectConfiguration = useCallback(() => {
    const newDraft = createTrailerAssemblyDraft({
      targetAxleLines,
      targetColumns,
    })

    // Validate combination
    const validation = validateTrailerAssemblyDraft(newDraft)
    if (!validation.valid && validation.error) {
      setDraft({
        ...newDraft,
        status: 'invalid',
        lastError: validation.error,
      })
      addLog(
        createTrailerAssemblyOperationLog({
          draftId: newDraft.id,
          action: 'assembly_error',
          resultStatus: 'invalid',
          errorCode: validation.error.code,
          message: validation.error.message,
        }),
      )
      return
    }

    const result = applyTrailerAssemblyStep(newDraft, {
      id: `step-${Date.now()}`,
      stepType: 'select_target_configuration',
      createdAt: new Date().toISOString(),
    })
    setDraft(result.draft)
    addLog(result.log)
  }, [targetAxleLines, targetColumns, addLog])

  const handleStep = useCallback(
    (step: TrailerAssemblyStep) => {
      if (!draft) return
      const result = applyTrailerAssemblyStep(draft, step)
      setDraft(result.draft)
      addLog(result.log)
    },
    [draft, addLog],
  )

  const handleReset = useCallback(() => {
    if (!draft) return
    const result = resetTrailerAssemblyDraft(draft)
    setDraft(result.draft)
    addLog(result.log)
  }, [draft, addLog])

  const handleComplete = useCallback(() => {
    if (!draft) return
    const result = applyTrailerAssemblyStep(draft, {
      id: `step-${Date.now()}`,
      stepType: 'complete_assembly',
      createdAt: new Date().toISOString(),
    })
    setDraft(result.draft)
    addLog(result.log)
  }, [draft, addLog])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
        挂车轴线 / 纵列拼接
      </h1>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
        本页面为 Day73
        挂车轴线/纵列拼接交互。只完成拼接交互和可视化，不直接判定轴载规则通过。
        Day74 液压支撑三点编点交互将在后续实现。Day76
        才做轴线载荷规则和重新选择流程。
      </p>

      {/* Target configuration selector */}
      <div
        style={{
          border: '1px solid #d1d5db',
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
          backgroundColor: '#f9fafb',
        }}
      >
        <h3 style={{ margin: '0 0 12px' }}>选择目标挂车方案</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <div>
            <label
              htmlFor="target-axle-lines"
              style={{ display: 'block', fontSize: 13, marginBottom: 4 }}
            >
              轴线数
            </label>
            <select
              id="target-axle-lines"
              value={targetAxleLines}
              onChange={(e) => {
                const v = Number(e.target.value)
                setTargetAxleLines(v)
                adjustTargetColumns(v)
              }}
              style={{ padding: '6px 10px', fontSize: 14 }}
            >
              {AXLE_LINE_OPTIONS.filter((o) => o.enabled).map((opt) => (
                <option key={opt.id} value={opt.axleLines}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="target-columns"
              style={{ display: 'block', fontSize: 13, marginBottom: 4 }}
            >
              纵列数
            </label>
            <select
              id="target-columns"
              value={targetColumns}
              onChange={(e) => setTargetColumns(Number(e.target.value))}
              style={{ padding: '6px 10px', fontSize: 14 }}
            >
              {COLUMN_OPTIONS.filter(
                (o) => o.enabled && allowedColumns.includes(o.columns),
              ).map((opt) => (
                <option key={opt.id} value={opt.columns}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <button
            data-testid="btn-select-configuration"
            onClick={handleSelectConfiguration}
            style={btnStyle('#3b82f6')}
          >
            确认方案
          </button>
        </div>

        {/* Combination hint */}
        {draft?.status === 'invalid' &&
          draft.lastError?.code === 'invalid_combination' && (
            <div
              style={{
                marginTop: 8,
                padding: 8,
                backgroundColor: '#fef2f2',
                borderRadius: 6,
                color: '#991b1b',
                fontSize: 13,
              }}
            >
              {draft.lastError.message}
            </div>
          )}
      </div>

      {/* Module palette */}
      {draft && (
        <div style={{ marginBottom: 16 }}>
          <TrailerAxleModulePalette
            draft={draft}
            onPlaceMainColumn={() =>
              handleStep({
                id: `step-${Date.now()}`,
                stepType: 'place_main_column',
                createdAt: new Date().toISOString(),
              })
            }
            onAddSideColumn={() =>
              handleStep({
                id: `step-${Date.now()}`,
                stepType: 'add_side_column',
                createdAt: new Date().toISOString(),
              })
            }
            onConnectTractor={() =>
              handleStep({
                id: `step-${Date.now()}`,
                stepType: 'connect_tractor_end',
                createdAt: new Date().toISOString(),
              })
            }
            onAlignColumns={() =>
              handleStep({
                id: `step-${Date.now()}`,
                stepType: 'align_columns',
                createdAt: new Date().toISOString(),
              })
            }
          />
        </div>
      )}

      {/* Error feedback */}
      {draft?.lastError && (
        <div style={{ marginBottom: 16 }}>
          <TrailerAssemblyErrorFeedback error={draft.lastError} />
        </div>
      )}

      {/* Workspace */}
      <div style={{ marginBottom: 16 }}>
        <TrailerAssemblyWorkspace
          draft={
            draft ??
            createTrailerAssemblyDraft({
              targetAxleLines: 4,
              targetColumns: 1,
            })
          }
          onPlaceModule={handleStep}
        />
      </div>

      {/* Complete button */}
      {draft?.status === 'in_progress' && (
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <button
            data-testid="btn-complete-assembly"
            onClick={handleComplete}
            style={{
              ...btnStyle('#10b981'),
              padding: '10px 24px',
              fontSize: 15,
            }}
          >
            完成拼接
          </button>
        </div>
      )}

      {/* Result */}
      {draft?.status === 'completed' && (
        <div style={{ marginBottom: 16 }}>
          <TrailerAssemblyResultCard draft={draft} />
        </div>
      )}

      {/* Step list */}
      {draft && (
        <div style={{ marginBottom: 16 }}>
          <TrailerAssemblyStepList draft={draft} />
        </div>
      )}

      {/* Operation log */}
      <div style={{ marginBottom: 16 }}>
        <TrailerAssemblyOperationLog logs={logs} />
      </div>

      {/* Reset button */}
      {draft && draft.status !== 'empty' && (
        <div style={{ textAlign: 'center' }}>
          <button
            data-testid="btn-reset-assembly"
            onClick={handleReset}
            style={btnStyle('#ef4444')}
          >
            重置拼接
          </button>
        </div>
      )}

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
          本页面仅实现 Day73 挂车轴线/纵列拼接交互和可视化。
        </p>
        <p style={{ margin: '0 0 4px' }}>
          - 未实现 Day74 液压支撑三点编点交互。
        </p>
        <p style={{ margin: '0 0 4px' }}>
          - 未实现 Day76 轴线载荷规则和重新选择流程。
        </p>
        <p style={{ margin: 0 }}>
          - 拼接结果仅表示结构组装完成，不代表轴载规则通过。
        </p>
      </div>
    </div>
  )
}
