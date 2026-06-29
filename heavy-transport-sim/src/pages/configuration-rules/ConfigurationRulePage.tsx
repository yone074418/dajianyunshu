import { useState, useMemo } from 'react'
import {
  evaluateSimpleConfiguration,
  getVehicleCombinations,
  getTractors,
  getAxleColumnRules,
  type SimpleConfigurationInput,
  type SimpleConfigurationEvaluationResult,
} from '../../domain/configurationRules'
import { getUniqueTransportCase } from '../../domain/transportCase'

const CORRECT_INPUT: SimpleConfigurationInput = {
  caseId: 'case_heavy_transformer_transport_v1',
  cargo: {
    lengthM: 8.8,
    widthM: 3.4,
    heightM: 4.2,
    weightT: 100,
  },
  vehicleCombinationId: 'semi_trailer_combination',
  vehicleCombinationType: 'semi_trailer',
  tractorId: 'tractor_8x8_heavy_duty',
  trailerSelection: {
    axleLines: 10,
    columns: 2,
  },
}

export default function ConfigurationRulePage({
  input: inputOverride,
}: {
  input?: SimpleConfigurationInput
} = {}) {
  const [result, setResult] =
    useState<SimpleConfigurationEvaluationResult | null>(null)
  const [hasChecked, setHasChecked] = useState(false)

  const activeInput = inputOverride ?? CORRECT_INPUT

  const transportCase = useMemo(() => getUniqueTransportCase(), [])
  const combinations = useMemo(() => getVehicleCombinations(), [])
  const tractors = useMemo(() => getTractors(), [])
  const axleColumnRules = useMemo(() => getAxleColumnRules(), [])

  const combination = combinations.find(
    (c) => c.id === activeInput.vehicleCombinationId,
  )
  const tractor = tractors.find((t) => t.id === activeInput.tractorId)
  const allowedRule = axleColumnRules.find(
    (r) =>
      r.axleLines === activeInput.trailerSelection.axleLines &&
      r.columns === activeInput.trailerSelection.columns,
  )

  const handleCheck = () => {
    const evaluation = evaluateSimpleConfiguration(activeInput)
    setResult(evaluation)
    setHasChecked(true)
  }

  return (
    <div data-testid="configuration-rule-page" style={containerStyle}>
      <h1>简单配车规则检查</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
        检查当前配车方案是否满足教学简化规则。系统将根据货物参数、组合方式、牵引车和挂车选择进行综合判断。
      </p>

      <section data-testid="input-summary" style={sectionStyle}>
        <h2>当前配车方案</h2>

        <div style={summaryGridStyle}>
          <SummaryCard title="货物信息">
            <div>名称：{transportCase.cargo.name}</div>
            <div>
              尺寸：{activeInput.cargo.lengthM} × {activeInput.cargo.widthM} ×{' '}
              {activeInput.cargo.heightM} m
            </div>
            <div>重量：{activeInput.cargo.weightT} t</div>
          </SummaryCard>

          <SummaryCard title="组合方式">
            <div>{combination?.name ?? activeInput.vehicleCombinationId}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              类型：{activeInput.vehicleCombinationType}
            </div>
          </SummaryCard>

          <SummaryCard title="牵引车">
            <div>{tractor?.name ?? activeInput.tractorId}</div>
            {tractor && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                功率：{tractor.power.enginePowerKw}kW | 驱动：
                {tractor.driveType}
              </div>
            )}
          </SummaryCard>

          <SummaryCard title="挂车选择">
            <div>
              {activeInput.trailerSelection.axleLines} 轴线 ×{' '}
              {activeInput.trailerSelection.columns} 纵列
            </div>
            {allowedRule && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                {allowedRule.teachingNote}
              </div>
            )}
          </SummaryCard>
        </div>
      </section>

      <div style={{ marginTop: '24px' }}>
        <button data-testid="btn-check" onClick={handleCheck} style={btnStyle}>
          检查配车方案
        </button>
      </div>

      {hasChecked && result && (
        <section data-testid="result-panel" style={{ marginTop: '24px' }}>
          <div
            data-testid="result-status"
            style={{
              ...statusBannerStyle,
              background:
                result.status === 'passed'
                  ? '#e8f5e9'
                  : result.status === 'failed'
                    ? '#ffebee'
                    : '#fff3e0',
              color:
                result.status === 'passed'
                  ? '#2e7d32'
                  : result.status === 'failed'
                    ? '#c62828'
                    : '#e65100',
              border: `2px solid ${result.status === 'passed' ? '#4caf50' : result.status === 'failed' ? '#f44336' : '#ff9800'}`,
            }}
          >
            <strong style={{ fontSize: '18px' }}>
              {result.status === 'passed'
                ? '通过'
                : result.status === 'failed'
                  ? '不通过'
                  : '无法检查'}
            </strong>
            <div style={{ marginTop: '8px', fontSize: '14px' }}>
              {result.summary}
            </div>
          </div>

          {result.reasons.length > 0 && (
            <div data-testid="result-reasons" style={reasonsStyle}>
              <h3>检查原因</h3>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {result.reasons.map((reason, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div data-testid="result-checks" style={{ marginTop: '16px' }}>
            <h3>逐项检查结果</h3>
            {result.checks.map((check) => (
              <div
                key={check.ruleId}
                data-testid={`check-${check.ruleId}`}
                style={{
                  ...checkCardStyle,
                  borderLeft: `4px solid ${check.status === 'passed' ? '#4caf50' : check.status === 'failed' ? '#f44336' : '#ff9800'}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <strong>{check.title}</strong>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background:
                        check.status === 'passed'
                          ? '#e8f5e9'
                          : check.status === 'failed'
                            ? '#ffebee'
                            : '#fff3e0',
                      color:
                        check.status === 'passed'
                          ? '#2e7d32'
                          : check.status === 'failed'
                            ? '#c62828'
                            : '#e65100',
                    }}
                  >
                    {check.status === 'passed'
                      ? '通过'
                      : check.status === 'failed'
                        ? '不通过'
                        : '阻塞'}
                  </span>
                </div>
                <div
                  style={{ marginTop: '8px', fontSize: '13px', color: '#333' }}
                >
                  {check.reason}
                </div>
                {check.teachingNote && (
                  <div
                    style={{
                      marginTop: '6px',
                      fontSize: '12px',
                      color: '#666',
                      fontStyle: 'italic',
                    }}
                  >
                    {check.teachingNote}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div data-testid="next-action" style={nextActionStyle}>
            <strong>下一步：</strong>
            {result.nextAction}
          </div>
        </section>
      )}

      <div style={noteStyle}>
        <strong>教学简化声明：</strong>
        本规则为教学简化判断，用于虚拟仿真实验学习，不替代真实工程校核。
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div style={summaryCardStyle}>
      <div
        style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}
      >
        {title}
      </div>
      <div style={{ fontSize: '13px', color: '#333' }}>{children}</div>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  padding: '24px',
  maxWidth: '960px',
  margin: '0 auto',
}

const sectionStyle: React.CSSProperties = {
  background: '#f5f5f5',
  borderRadius: '8px',
  padding: '16px',
}

const summaryGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '12px',
  marginTop: '12px',
}

const summaryCardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '6px',
  padding: '12px',
  border: '1px solid #e0e0e0',
}

const btnStyle: React.CSSProperties = {
  padding: '12px 32px',
  border: 'none',
  borderRadius: '6px',
  background: '#1976d2',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
}

const statusBannerStyle: React.CSSProperties = {
  padding: '16px',
  borderRadius: '8px',
  textAlign: 'center',
}

const reasonsStyle: React.CSSProperties = {
  marginTop: '16px',
  padding: '12px',
  background: '#fafafa',
  borderRadius: '6px',
  border: '1px solid #e0e0e0',
}

const checkCardStyle: React.CSSProperties = {
  padding: '12px',
  marginBottom: '8px',
  background: '#fff',
  borderRadius: '4px',
  border: '1px solid #e0e0e0',
}

const nextActionStyle: React.CSSProperties = {
  marginTop: '16px',
  padding: '12px',
  background: '#e3f2fd',
  borderRadius: '6px',
  fontSize: '14px',
}

const noteStyle: React.CSSProperties = {
  marginTop: '32px',
  padding: '12px',
  background: '#fff3e0',
  borderRadius: '6px',
  fontSize: '12px',
}
