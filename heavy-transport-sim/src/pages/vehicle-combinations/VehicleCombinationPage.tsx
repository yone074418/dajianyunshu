import {
  getVehicleCombinations,
  validateVehicleCombinations,
  type VehicleCombination,
} from '../../domain/vehicleCombinations'
import { useMemo, useState } from 'react'

type PageState =
  | { status: 'ready'; data: VehicleCombination[] }
  | { status: 'empty' }
  | { status: 'validation_error'; message: string }
  | { status: 'error'; message: string }

function loadData(): PageState {
  try {
    const raw = getVehicleCombinations()
    if (!raw || raw.length === 0) return { status: 'empty' }
    const data = validateVehicleCombinations(raw)
    return { status: 'ready', data }
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return {
        status: 'validation_error',
        message: '车辆组合数据校验失败。',
      }
    }
    return { status: 'error', message: '加载车辆组合数据时发生错误。' }
  }
}

export default function VehicleCombinationPage() {
  const state = useMemo(() => loadData(), [])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (state.status === 'empty') {
    return (
      <div
        data-testid="vc-empty"
        style={{ padding: '40px', textAlign: 'center' }}
      >
        <p style={{ color: '#c00' }}>未找到车辆组合数据。</p>
      </div>
    )
  }

  if (state.status === 'validation_error' || state.status === 'error') {
    return (
      <div
        data-testid="vc-error"
        style={{ padding: '40px', textAlign: 'center' }}
      >
        <p style={{ color: '#c00' }}>{state.message}</p>
      </div>
    )
  }

  const { data } = state

  return (
    <div
      data-testid="vehicle-combination-page"
      style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}
    >
      <h1>简单配车 — 车辆组合数据</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        本页面展示三类车辆组合的参数、优缺点和演示配置。组合选择和动画演示将在
        Day51 实现。
      </p>

      {data.map((combo) => (
        <section
          key={combo.id}
          data-testid={`combo-${combo.id}`}
          style={{
            marginTop: '24px',
            padding: '20px',
            background: '#fff',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
          }}
        >
          <h2>{combo.name}</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>{combo.description}</p>

          <div style={{ marginTop: '12px' }}>
            <strong>适用场景：</strong>
            <ul>
              {combo.applicableScenarios.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div
            style={{
              marginTop: '12px',
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '6px',
            }}
          >
            <strong>主要参数：</strong>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '8px',
              }}
            >
              <tbody>
                <tr>
                  <td style={tdStyle}>货物重量范围</td>
                  <td style={tdStyle}>
                    {combo.parameters.cargoWeightRangeT.min} -{' '}
                    {combo.parameters.cargoWeightRangeT.max} t
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>货物长度范围</td>
                  <td style={tdStyle}>
                    {combo.parameters.cargoLengthRangeM.min} -{' '}
                    {combo.parameters.cargoLengthRangeM.max} m
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>货物宽度范围</td>
                  <td style={tdStyle}>
                    {combo.parameters.cargoWidthRangeM.min} -{' '}
                    {combo.parameters.cargoWidthRangeM.max} m
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>货物高度范围</td>
                  <td style={tdStyle}>
                    {combo.parameters.cargoHeightRangeM.min} -{' '}
                    {combo.parameters.cargoHeightRangeM.max} m
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>承载能力</td>
                  <td style={tdStyle}>
                    {combo.parameters.loadCapacityDescription}
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>转弯特点</td>
                  <td style={tdStyle}>{combo.parameters.turningDescription}</td>
                </tr>
                <tr>
                  <td style={tdStyle}>操作复杂度</td>
                  <td style={tdStyle}>
                    {combo.parameters.operationComplexity === 'high'
                      ? '高'
                      : combo.parameters.operationComplexity === 'medium'
                        ? '中'
                        : '低'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: '200px' }}>
              <strong>优点：</strong>
              <ul>
                {combo.advantages.map((a, i) => (
                  <li key={i} style={{ color: '#2e7d32', fontSize: '13px' }}>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <strong>缺点：</strong>
              <ul>
                {combo.disadvantages.map((d, i) => (
                  <li key={i} style={{ color: '#c62828', fontSize: '13px' }}>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button
              data-testid={`demo-toggle-${combo.id}`}
              onClick={() =>
                setExpandedId(expandedId === combo.id ? null : combo.id)
              }
              style={{
                padding: '6px 16px',
                border: '1px solid #3d85c6',
                borderRadius: '4px',
                background: '#fff',
                color: '#3d85c6',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {expandedId === combo.id ? '收起演示配置' : '查看演示配置'}
            </button>
          </div>

          {expandedId === combo.id && (
            <div
              data-testid={`demo-config-${combo.id}`}
              style={{
                marginTop: '12px',
                padding: '12px',
                background: '#e8f0fe',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            >
              <div>
                <strong>演示 ID：</strong>
                {combo.demoConfig.demoId}
              </div>
              <div>
                <strong>场景：</strong>
                {combo.demoConfig.scenePreset}
              </div>
              <div style={{ marginTop: '8px' }}>
                <strong>组件布局：</strong>
                <ul>
                  {combo.demoConfig.componentLayout.map((comp) => (
                    <li key={comp.id}>
                      {comp.label}（{comp.role}）
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ marginTop: '8px' }}>
                <strong>动画步骤：</strong>
                <ol>
                  {combo.demoConfig.animationSteps.map((step) => (
                    <li key={step.id}>
                      {step.title} — {step.description}（{step.durationMs}ms）
                    </li>
                  ))}
                </ol>
              </div>
              <div style={{ marginTop: '8px' }}>
                <strong>教学要点：</strong>
                <ul>
                  {combo.demoConfig.keyTeachingPoints.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

const tdStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderBottom: '1px solid #eee',
  fontSize: '13px',
}
