import { useCallback, useState } from 'react'
import {
  evaluateAxleLoadRule,
  createReselectionFlowState,
  applyAxleLoadReselection,
  recalculateAxleLoadAfterReselection,
  confirmFinalVehicleConfiguration,
  createAxleLoadOperationLog,
  getAxleLoadStatusDisplayText,
  getReselectionStatusDisplayText,
  getTeachingWeightLimitT,
  type AxleLoadInput,
  type AxleLoadRuleResult,
  type AxleLoadReselectionState,
  type FinalVehicleConfigurationSummary,
  type AxleLoadOperationLog,
} from '../../domain/axleLoadRule'

// ── Helpers ──────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  pass: '#10b981',
  pass_with_warning: '#f59e0b',
  fail: '#ef4444',
  blocked: '#6b7280',
}

// ── AxleLoadCalculationCard ──────────────────────────────────────────

function AxleLoadCalculationCard({ result }: { result: AxleLoadRuleResult }) {
  return (
    <div
      data-testid="calculation-card"
      style={{
        border: `2px solid ${statusColors[result.status]}`,
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#f9fafb',
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>轴线载荷计算</h3>
      <div style={{ fontSize: 14, marginBottom: 12 }}>
        {result.calculationProcess.map((step, i) => (
          <div key={i} style={{ marginBottom: 4, fontFamily: 'monospace' }}>
            {step}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── AxleLoadResultCard ───────────────────────────────────────────────

function AxleLoadResultCard({ result }: { result: AxleLoadRuleResult }) {
  return (
    <div
      data-testid="result-card"
      style={{
        border: `2px solid ${statusColors[result.status]}`,
        borderRadius: 8,
        padding: 16,
        backgroundColor: result.status === 'fail' ? '#fef2f2' : '#ecfdf5',
      }}
    >
      <h3
        style={{
          margin: '0 0 12px',
          fontSize: 16,
          color: statusColors[result.status],
        }}
      >
        规则结果：{getAxleLoadStatusDisplayText(result.status)}
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          fontSize: 14,
        }}
      >
        <div>运输总质量：{result.totalTransportMassT?.toFixed(1)}t</div>
        <div>轴线数：{result.axleLines}</div>
        <div>纵列数：{result.columns}</div>
        <div>单轴线限值：{result.singleAxleLineLimitT}t</div>
        <div>平均单轴线载荷：{result.averageAxleLineLoadT?.toFixed(2)}t</div>
        <div>纵列分担载荷：{result.distributedAxleLoadT?.toFixed(2)}t</div>
        <div>载荷余量：{result.loadMarginT?.toFixed(2)}t</div>
        <div>边界判定：{result.boundaryCase}</div>
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: '#374151' }}>
        <strong>摘要：</strong> {result.summary}
      </div>
      {result.reasons.map((r, i) => (
        <div key={i} style={{ marginTop: 4, fontSize: 13, color: '#991b1b' }}>
          {r}
        </div>
      ))}
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
        <strong>教学提示：</strong> {result.teachingSimplificationNotice}
      </div>
    </div>
  )
}

// ── AxleLoadModificationPrompt ───────────────────────────────────────

function AxleLoadModificationPrompt({
  result,
  onReselect,
}: {
  result: AxleLoadRuleResult
  onReselect: () => void
}) {
  if (result.status !== 'fail') return null

  return (
    <div
      data-testid="modification-prompt"
      style={{
        border: '1px solid #ef4444',
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#fef2f2',
      }}
    >
      <h4 style={{ margin: '0 0 8px', color: '#991b1b' }}>
        超载：需要返回修改
      </h4>
      <p style={{ fontSize: 14, color: '#991b1b', margin: '0 0 12px' }}>
        {result.nextAction}
      </p>
      <button
        data-testid="btn-reselect"
        onClick={onReselect}
        style={btnStyle('#ef4444')}
      >
        返回修改（重新选择轴线数/纵列数/质量）
      </button>
    </div>
  )
}

// ── AxleLoadReselectionFlow ──────────────────────────────────────────

function AxleLoadReselectionFlow({
  state,
  onApplyChanges,
  onRecalculate,
  onConfirm,
}: {
  state: AxleLoadReselectionState
  onApplyChanges: (changes: {
    axleLines?: number
    columns?: number
    totalTransportMassT?: number
  }) => void
  onRecalculate: () => void
  onConfirm: () => void
}) {
  const [newAxleLines, setNewAxleLines] = useState(state.after.axleLines)
  const [newColumns, setNewColumns] = useState(state.after.columns)
  const [newMass, setNewMass] = useState(state.after.totalTransportMassT)

  return (
    <div
      data-testid="reselection-flow"
      style={{
        border: '1px solid #3b82f6',
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#eff6ff',
      }}
    >
      <h4 style={{ margin: '0 0 12px', color: '#1e40af' }}>
        重新选择流程 — 状态：{getReselectionStatusDisplayText(state.status)}
      </h4>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>
            轴线数
          </label>
          <select
            data-testid="select-axle-lines"
            value={newAxleLines}
            onChange={(e) => setNewAxleLines(Number(e.target.value))}
            style={{ padding: '4px 8px' }}
          >
            {[4, 6, 8, 10, 12, 16].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>
            纵列数
          </label>
          <select
            data-testid="select-columns"
            value={newColumns}
            onChange={(e) => setNewColumns(Number(e.target.value))}
            style={{ padding: '4px 8px' }}
          >
            {[1, 2, 3].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>
            运输总质量(t)
          </label>
          <input
            data-testid="input-mass"
            type="number"
            value={newMass}
            onChange={(e) => setNewMass(Number(e.target.value))}
            style={{ padding: '4px 8px', width: 80 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          data-testid="btn-apply-changes"
          onClick={() =>
            onApplyChanges({
              axleLines: newAxleLines,
              columns: newColumns,
              totalTransportMassT: newMass,
            })
          }
          style={btnStyle('#3b82f6')}
        >
          应用修改
        </button>
        {state.status === 'pending_recalculation' && (
          <button
            data-testid="btn-recalculate"
            onClick={onRecalculate}
            style={btnStyle('#10b981')}
          >
            重新计算
          </button>
        )}
        {state.canConfirmVehicle && (
          <button
            data-testid="btn-confirm-vehicle"
            onClick={onConfirm}
            style={btnStyle('#10b981')}
          >
            确定车组
          </button>
        )}
      </div>

      {!state.canConfirmVehicle && state.status === 'needs_modification' && (
        <div style={{ marginTop: 8, fontSize: 13, color: '#991b1b' }}>
          确定车组按钮已禁用：轴线载荷未通过，请修改后重新计算。
        </div>
      )}
    </div>
  )
}

// ── FinalVehicleConfigurationCard ────────────────────────────────────

function FinalVehicleConfigurationCard({
  summary,
}: {
  summary: FinalVehicleConfigurationSummary
}) {
  return (
    <div
      data-testid="final-vehicle-card"
      style={{
        border: '2px solid #10b981',
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#ecfdf5',
      }}
    >
      <h3 style={{ margin: '0 0 12px', color: '#065f46' }}>最终车组已确认</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          fontSize: 14,
        }}
      >
        <div>轴线数：{summary.axleLines}</div>
        <div>纵列数：{summary.columns}</div>
        <div>运输总质量：{summary.totalTransportMassT.toFixed(1)}t</div>
        <div>平均单轴线载荷：{summary.averageAxleLineLoadT.toFixed(2)}t</div>
        <div>牵引车数量：{summary.tractorCount}</div>
        <div>确认状态：{summary.confirmed ? '已确认' : '未确认'}</div>
      </div>
      <div
        style={{
          marginTop: 12,
          fontSize: 13,
          color: '#92400e',
          backgroundColor: '#fef3c7',
          padding: 8,
          borderRadius: 6,
        }}
      >
        <strong>教学提示：</strong> {summary.teachingNote}
      </div>
    </div>
  )
}

// ── AxleLoadOperationLogDisplay ──────────────────────────────────────

function AxleLoadOperationLogDisplay({
  logs,
}: {
  logs: AxleLoadOperationLog[]
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

const btnStyle = (bg: string) => ({
  padding: '8px 16px',
  fontSize: 13,
  backgroundColor: bg,
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
})

// ── Main Page ────────────────────────────────────────────────────────

export default function AxleLoadRulePage() {
  const [ruleResult, setRuleResult] = useState<AxleLoadRuleResult | null>(null)
  const [reselectionState, setReselectionState] =
    useState<AxleLoadReselectionState | null>(null)
  const [finalSummary, setFinalSummary] =
    useState<FinalVehicleConfigurationSummary | null>(null)
  const [logs, setLogs] = useState<AxleLoadOperationLog[]>([])

  // Input state
  const [cargoMass, setCargoMass] = useState(100)
  const [tractorMass, setTractorMass] = useState(20)
  const [trailerMass, setTrailerMass] = useState(30)
  const [axleLines, setAxleLines] = useState(6)
  const [columns, setColumns] = useState(2)
  const [safetyFactor, setSafetyFactor] = useState(1.0)

  const addLog = useCallback(
    (log: AxleLoadOperationLog) => setLogs((prev) => [...prev, log]),
    [],
  )

  const handleRunRule = useCallback(() => {
    const limit = getTeachingWeightLimitT(axleLines, columns)
    const input: AxleLoadInput = {
      cargoMassT: cargoMass,
      tractorMassT: tractorMass,
      trailerMassT: trailerMass,
      axleLines,
      columns,
      singleAxleLineLimitT: limit ?? 25,
      safetyFactor,
      loadDistributionMode: 'teaching_simplified',
      source: 'manual_input',
    }
    const result = evaluateAxleLoadRule(input)
    setRuleResult(result)
    setFinalSummary(null)

    const state = createReselectionFlowState({
      ruleResult: result,
      axleLines,
      columns,
      totalTransportMassT: result.totalTransportMassT ?? 0,
    })
    setReselectionState(state)

    addLog(
      createAxleLoadOperationLog({
        action: result.passed
          ? 'axle_load_pass'
          : result.status === 'blocked'
            ? 'axle_load_blocked'
            : 'axle_load_fail',
        resultStatus: result.status,
        message: result.summary,
      }),
    )
  }, [
    cargoMass,
    tractorMass,
    trailerMass,
    axleLines,
    columns,
    safetyFactor,
    addLog,
  ])

  const handleReselect = useCallback(() => {
    if (!reselectionState) return
    setReselectionState({
      ...reselectionState,
      status: 'editing',
      canConfirmVehicle: false,
    })
    addLog(
      createAxleLoadOperationLog({
        action: 'request_reselection',
        message: '请求返回修改轴线载荷参数。',
      }),
    )
  }, [reselectionState, addLog])

  const handleApplyChanges = useCallback(
    (changes: {
      axleLines?: number
      columns?: number
      totalTransportMassT?: number
    }) => {
      if (!reselectionState) return
      const newState = applyAxleLoadReselection(reselectionState, changes)
      setReselectionState(newState)
      if (changes.axleLines) setAxleLines(changes.axleLines)
      if (changes.columns) setColumns(changes.columns)
      addLog(
        createAxleLoadOperationLog({
          action: changes.axleLines
            ? 'change_axle_lines'
            : changes.columns
              ? 'change_columns'
              : 'change_total_mass',
          beforeValue: JSON.stringify(reselectionState.after),
          afterValue: JSON.stringify(newState.after),
          message: `修改参数：${changes.axleLines ? `轴线数→${changes.axleLines}` : ''}${changes.columns ? `纵列数→${changes.columns}` : ''}${changes.totalTransportMassT ? `总质量→${changes.totalTransportMassT}` : ''}`,
        }),
      )
    },
    [reselectionState, addLog],
  )

  const handleRecalculate = useCallback(() => {
    if (!reselectionState) return
    const limit = getTeachingWeightLimitT(
      reselectionState.after.axleLines,
      reselectionState.after.columns,
    )
    const { state: newState, result } = recalculateAxleLoadAfterReselection(
      reselectionState,
      {
        cargoMassT: cargoMass,
        tractorMassT: tractorMass,
        trailerMassT: trailerMass,
        singleAxleLineLimitT: limit ?? 25,
        safetyFactor,
        loadDistributionMode: 'teaching_simplified',
        source: 'manual_input',
      },
    )
    setReselectionState(newState)
    setRuleResult(result)
    addLog(
      createAxleLoadOperationLog({
        action: 'run_recalculation',
        resultStatus: result.status,
        message: `重新计算：${result.summary}`,
      }),
    )
  }, [
    reselectionState,
    cargoMass,
    tractorMass,
    trailerMass,
    safetyFactor,
    addLog,
  ])

  const handleConfirm = useCallback(() => {
    if (!reselectionState) return
    try {
      const { summary, state: newState } =
        confirmFinalVehicleConfiguration(reselectionState)
      setFinalSummary(summary)
      setReselectionState(newState)
      addLog(
        createAxleLoadOperationLog({
          action: 'confirm_final_vehicle',
          message: `车组已确认：${summary.axleLines}轴线${summary.columns}纵列，总质量${summary.totalTransportMassT.toFixed(1)}t。`,
        }),
      )
    } catch {
      addLog(
        createAxleLoadOperationLog({
          action: 'confirm_blocked',
          message: '轴线载荷未通过，不能确定车组。',
        }),
      )
    }
  }, [reselectionState, addLog])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
        轴线载荷规则与车组确定
      </h1>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
        本页面为 Day76
        轴线载荷规则和重新选择流程。超载必须返回修改，满足后才能确定车组。
        本规则为教学简化判断，不替代真实工程校核。Day77 周模块验收将在后续实现。
      </p>

      {/* Input section */}
      {!ruleResult && (
        <div
          style={{
            border: '1px solid #d1d5db',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            backgroundColor: '#f9fafb',
          }}
        >
          <h3 style={{ margin: '0 0 12px' }}>输入参数</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12,
            }}
          >
            <div>
              <label
                style={{ display: 'block', fontSize: 12, marginBottom: 4 }}
              >
                货物质量(t)
              </label>
              <input
                data-testid="input-cargo-mass"
                type="number"
                value={cargoMass}
                onChange={(e) => setCargoMass(Number(e.target.value))}
                style={{ padding: '4px 8px', width: '100%' }}
              />
            </div>
            <div>
              <label
                style={{ display: 'block', fontSize: 12, marginBottom: 4 }}
              >
                牵引车质量(t)
              </label>
              <input
                data-testid="input-tractor-mass"
                type="number"
                value={tractorMass}
                onChange={(e) => setTractorMass(Number(e.target.value))}
                style={{ padding: '4px 8px', width: '100%' }}
              />
            </div>
            <div>
              <label
                style={{ display: 'block', fontSize: 12, marginBottom: 4 }}
              >
                挂车质量(t)
              </label>
              <input
                data-testid="input-trailer-mass"
                type="number"
                value={trailerMass}
                onChange={(e) => setTrailerMass(Number(e.target.value))}
                style={{ padding: '4px 8px', width: '100%' }}
              />
            </div>
            <div>
              <label
                style={{ display: 'block', fontSize: 12, marginBottom: 4 }}
              >
                轴线数
              </label>
              <select
                data-testid="input-axle-lines"
                value={axleLines}
                onChange={(e) => setAxleLines(Number(e.target.value))}
                style={{ padding: '4px 8px', width: '100%' }}
              >
                {[4, 6, 8, 10, 12, 16].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{ display: 'block', fontSize: 12, marginBottom: 4 }}
              >
                纵列数
              </label>
              <select
                data-testid="input-columns"
                value={columns}
                onChange={(e) => setColumns(Number(e.target.value))}
                style={{ padding: '4px 8px', width: '100%' }}
              >
                {[1, 2, 3].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{ display: 'block', fontSize: 12, marginBottom: 4 }}
              >
                安全系数
              </label>
              <input
                data-testid="input-safety-factor"
                type="number"
                step="0.1"
                value={safetyFactor}
                onChange={(e) => setSafetyFactor(Number(e.target.value))}
                style={{ padding: '4px 8px', width: '100%' }}
              />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button
              data-testid="btn-run-rule"
              onClick={handleRunRule}
              style={btnStyle('#3b82f6')}
            >
              执行轴线载荷检查
            </button>
          </div>
        </div>
      )}

      {/* Calculation process */}
      {ruleResult && (
        <div style={{ marginBottom: 16 }}>
          <AxleLoadCalculationCard result={ruleResult} />
        </div>
      )}

      {/* Result */}
      {ruleResult && (
        <div style={{ marginBottom: 16 }}>
          <AxleLoadResultCard result={ruleResult} />
        </div>
      )}

      {/* Modification prompt */}
      {ruleResult && (
        <div style={{ marginBottom: 16 }}>
          <AxleLoadModificationPrompt
            result={ruleResult}
            onReselect={handleReselect}
          />
        </div>
      )}

      {/* Reselection flow */}
      {reselectionState && reselectionState.status !== 'confirmed' && (
        <div style={{ marginBottom: 16 }}>
          <AxleLoadReselectionFlow
            state={reselectionState}
            onApplyChanges={handleApplyChanges}
            onRecalculate={handleRecalculate}
            onConfirm={handleConfirm}
          />
        </div>
      )}

      {/* Final vehicle configuration */}
      {finalSummary && (
        <div style={{ marginBottom: 16 }}>
          <FinalVehicleConfigurationCard summary={finalSummary} />
        </div>
      )}

      {/* Operation log */}
      <div style={{ marginBottom: 16 }}>
        <AxleLoadOperationLogDisplay logs={logs} />
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
          <strong>说明：</strong>本页面仅实现 Day76 轴线载荷规则和重新选择流程。
        </p>
        <p style={{ margin: '0 0 4px' }}>- 未实现 Day77 周模块验收。</p>
        <p style={{ margin: '0 0 4px' }}>- 未实现装车、绑扎和运输动画。</p>
        <p style={{ margin: 0 }}>
          - 轴线载荷为教学简化规则，不替代真实工程校核。
        </p>
      </div>
    </div>
  )
}
