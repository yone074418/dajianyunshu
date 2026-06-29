import type { VehicleCombination } from '../../domain/vehicleCombinations'

interface Props {
  combination: VehicleCombination
}

export default function CombinationDetailPanel({ combination }: Props) {
  const { parameters, demoConfig } = combination

  return (
    <div
      data-testid={`detail-panel-${combination.id}`}
      style={{
        padding: '20px',
        background: '#fff',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
      }}
    >
      <h3 data-testid="detail-name" style={{ marginTop: 0 }}>
        {combination.name}
      </h3>
      <p
        data-testid="detail-description"
        style={{ color: '#555', fontSize: '14px' }}
      >
        {combination.description}
      </p>

      <div style={{ marginTop: '16px' }}>
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
                {parameters.cargoWeightRangeT.min} -{' '}
                {parameters.cargoWeightRangeT.max} t
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>货物长度范围</td>
              <td style={tdStyle}>
                {parameters.cargoLengthRangeM.min} -{' '}
                {parameters.cargoLengthRangeM.max} m
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>承载能力</td>
              <td style={tdStyle}>{parameters.loadCapacityDescription}</td>
            </tr>
            <tr>
              <td style={tdStyle}>转弯特点</td>
              <td style={tdStyle}>{parameters.turningDescription}</td>
            </tr>
            <tr>
              <td style={tdStyle}>稳定性</td>
              <td style={tdStyle}>{parameters.stabilityDescription}</td>
            </tr>
            <tr>
              <td style={tdStyle}>操作复杂度</td>
              <td style={tdStyle}>
                {parameters.operationComplexity === 'high'
                  ? '高'
                  : parameters.operationComplexity === 'medium'
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
          marginTop: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '200px' }}>
          <strong style={{ color: '#2e7d32' }}>优点：</strong>
          <ul>
            {combination.advantages.map((a, i) => (
              <li key={i} style={{ color: '#2e7d32', fontSize: '13px' }}>
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <strong style={{ color: '#c62828' }}>缺点：</strong>
          <ul>
            {combination.disadvantages.map((d, i) => (
              <li key={i} style={{ color: '#c62828', fontSize: '13px' }}>
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <strong>演示配置摘要：</strong>
        <div
          style={{
            marginTop: '8px',
            padding: '12px',
            background: '#e8f0fe',
            borderRadius: '6px',
            fontSize: '13px',
          }}
        >
          <div>
            <strong>场景：</strong>
            {demoConfig.scenePreset}
          </div>
          <div>
            <strong>组件数量：</strong>
            {demoConfig.componentLayout.length} 个
          </div>
          <div>
            <strong>动画步骤：</strong>
            {demoConfig.animationSteps.length} 步
          </div>
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <strong>教学提示：</strong>
        <ul>
          {combination.teachingTips.map((tip, i) => (
            <li key={i} style={{ fontSize: '13px', color: '#555' }}>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '16px' }}>
        <strong>后续配车步骤关联：</strong>
        <span style={{ fontSize: '13px', color: '#555', marginLeft: '8px' }}>
          {combination.relatedStages.join(' → ')}
        </span>
      </div>
    </div>
  )
}

const tdStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderBottom: '1px solid #eee',
  fontSize: '13px',
}
