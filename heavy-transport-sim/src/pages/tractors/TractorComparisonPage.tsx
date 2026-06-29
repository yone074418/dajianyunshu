import { useMemo } from 'react'
import {
  getTractors,
  validateTractors,
  type Tractor,
} from '../../domain/tractors'

type PageState =
  | { status: 'ready'; data: Tractor[] }
  | { status: 'empty' }
  | { status: 'validation_error'; message: string }
  | { status: 'error'; message: string }

function loadData(): PageState {
  try {
    const raw = getTractors()
    if (!raw || raw.length === 0) return { status: 'empty' }
    const data = validateTractors(raw)
    return { status: 'ready', data }
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return {
        status: 'validation_error',
        message: '牵引车数据校验失败。',
      }
    }
    return { status: 'error', message: '加载牵引车数据时发生错误。' }
  }
}

export default function TractorComparisonPage() {
  const state = useMemo(() => loadData(), [])

  if (state.status === 'empty') {
    return (
      <div data-testid="tractor-empty" style={containerStyle}>
        <p style={{ color: '#c00' }}>未找到牵引车数据。</p>
      </div>
    )
  }

  if (state.status === 'validation_error' || state.status === 'error') {
    return (
      <div data-testid="tractor-error" style={containerStyle}>
        <p style={{ color: '#c00' }}>{state.message}</p>
      </div>
    )
  }

  const { data } = state
  const t6 = data.find((t) => t.driveType === '6x6')!
  const t8 = data.find((t) => t.driveType === '8x8')!

  return (
    <div data-testid="tractor-comparison-page" style={containerStyle}>
      <h1>简单配车 — 牵引车参数对比</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        本页面展示 6x6 和 8x8
        重型牵引车的参数对比，帮助学生理解不同牵引车的差异。
        本阶段只做牵引车参数展示，不做最终配车判定。
      </p>

      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginTop: '24px',
          flexWrap: 'wrap',
        }}
      >
        <TractorCard tractor={t6} testId="card-6x6" />
        <TractorCard tractor={t8} testId="card-8x8" />
      </div>

      <h2 style={{ marginTop: '32px' }}>尺寸参数对比</h2>
      <ComparisonTable
        testId="dimension-table"
        headers={['参数', '6x6 重型牵引车', '8x8 重型牵引车']}
        rows={[
          ['长度', `${t6.dimensions.lengthM} m`, `${t8.dimensions.lengthM} m`],
          ['宽度', `${t6.dimensions.widthM} m`, `${t8.dimensions.widthM} m`],
          ['高度', `${t6.dimensions.heightM} m`, `${t8.dimensions.heightM} m`],
          [
            '轴距',
            `${t6.dimensions.wheelbaseM} m`,
            `${t8.dimensions.wheelbaseM} m`,
          ],
          [
            '轮距',
            `${t6.dimensions.trackWidthM} m`,
            `${t8.dimensions.trackWidthM} m`,
          ],
          [
            '最小转弯半径',
            `${t6.dimensions.minTurningRadiusM} m`,
            `${t8.dimensions.minTurningRadiusM} m`,
          ],
        ]}
      />

      <h2 style={{ marginTop: '32px' }}>重量参数对比</h2>
      <ComparisonTable
        testId="weight-table"
        headers={['参数', '6x6 重型牵引车', '8x8 重型牵引车']}
        rows={[
          [
            '整备质量',
            `${t6.weights.curbWeightT} t`,
            `${t8.weights.curbWeightT} t`,
          ],
          [
            '最大总质量',
            `${t6.weights.grossWeightT} t`,
            `${t8.weights.grossWeightT} t`,
          ],
          [
            '允许牵引总质量',
            `${t6.weights.maxTractionMassT} t`,
            `${t8.weights.maxTractionMassT} t`,
          ],
          [
            '允许鞍座载荷',
            `${t6.weights.fifthWheelLoadT} t`,
            `${t8.weights.fifthWheelLoadT} t`,
          ],
          [
            '轴载说明',
            t6.weights.axleLoadDescription,
            t8.weights.axleLoadDescription,
          ],
        ]}
      />

      <h2 style={{ marginTop: '32px' }}>动力参数对比</h2>
      <ComparisonTable
        testId="power-table"
        headers={['参数', '6x6 重型牵引车', '8x8 重型牵引车']}
        rows={[
          [
            '发动机功率',
            `${t6.power.enginePowerKw} kW`,
            `${t8.power.enginePowerKw} kW`,
          ],
          [
            '最大扭矩',
            `${t6.power.maxTorqueNm} Nm`,
            `${t8.power.maxTorqueNm} Nm`,
          ],
          ['驱动形式', t6.power.driveType, t8.power.driveType],
          [
            '低速牵引能力',
            t6.power.lowSpeedTractionDescription,
            t8.power.lowSpeedTractionDescription,
          ],
          [
            '爬坡能力',
            t6.power.gradeabilityDescription,
            t8.power.gradeabilityDescription,
          ],
          [
            '制动辅助',
            t6.power.brakingAssistDescription,
            t8.power.brakingAssistDescription,
          ],
        ]}
      />

      <h2 style={{ marginTop: '32px' }}>适用场景与优缺点对比</h2>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h3>6x6 适用场景</h3>
          <ul>
            {t6.applicableScenarios.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <h3 style={{ color: '#2e7d32' }}>优点</h3>
          <ul>
            {t6.advantages.map((a, i) => (
              <li key={i} style={{ color: '#2e7d32' }}>
                {a}
              </li>
            ))}
          </ul>
          <h3 style={{ color: '#c62828' }}>缺点</h3>
          <ul>
            {t6.disadvantages.map((d, i) => (
              <li key={i} style={{ color: '#c62828' }}>
                {d}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h3>8x8 适用场景</h3>
          <ul>
            {t8.applicableScenarios.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <h3 style={{ color: '#2e7d32' }}>优点</h3>
          <ul>
            {t8.advantages.map((a, i) => (
              <li key={i} style={{ color: '#2e7d32' }}>
                {a}
              </li>
            ))}
          </ul>
          <h3 style={{ color: '#c62828' }}>缺点</h3>
          <ul>
            {t8.disadvantages.map((d, i) => (
              <li key={i} style={{ color: '#c62828' }}>
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        style={{
          marginTop: '32px',
          padding: '16px',
          background: '#fff3e0',
          borderRadius: '8px',
          fontSize: '13px',
        }}
      >
        <strong>教学简化参数说明：</strong>
        本页面展示的牵引车参数为教学简化值，不代表真实工程车辆参数。
        实际配车时应根据真实车辆技术手册和路线条件确定。
      </div>
    </div>
  )
}

function TractorCard({
  tractor,
  testId,
}: {
  tractor: Tractor
  testId: string
}) {
  return (
    <div
      data-testid={testId}
      style={{
        flex: 1,
        minWidth: '280px',
        padding: '16px',
        border: '1px solid #d0d7de',
        borderRadius: '8px',
        background: '#fff',
      }}
    >
      <h3 style={{ margin: '0 0 8px' }}>{tractor.name}</h3>
      <p style={{ fontSize: '13px', color: '#555' }}>{tractor.description}</p>
      <p style={{ fontSize: '13px', marginTop: '8px' }}>
        <strong>牵引能力：</strong>
        {tractor.tractionDescription}
      </p>
    </div>
  )
}

function ComparisonTable({
  testId,
  headers,
  rows,
}: {
  testId: string
  headers: string[]
  rows: string[][]
}) {
  return (
    <table
      data-testid={testId}
      style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}
    >
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={thStyle}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci} style={tdStyle}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const containerStyle: React.CSSProperties = {
  padding: '24px',
  maxWidth: '1100px',
  margin: '0 auto',
}

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '2px solid #d0d7de',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: 'bold',
  background: '#f5f5f5',
}

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid #eee',
  fontSize: '13px',
}
