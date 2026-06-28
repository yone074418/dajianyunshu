import CurrentStepHintPanel from '../hints/CurrentStepHintPanel'

export default function TaskIntroductionPage() {
  return (
    <div
      data-testid="task-introduction-page"
      style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}
    >
      <h1>运输任务及货物介绍</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        请先阅读本次大件运输任务背景、起终点、货物参数和实验目标。
      </p>

      <section
        style={{
          marginTop: '24px',
          padding: '20px',
          background: '#fff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
        }}
      >
        <h2>案例背景</h2>
        <p>
          某电力工程需要将一台大型电力变压器从制造厂运输至变电站施工现场。变压器属于不可拆解的大件货物，外形尺寸和重量均超出普通公路运输标准，需要制定专门的大件运输方案。
        </p>
      </section>

      <section
        style={{
          marginTop: '24px',
          padding: '20px',
          background: '#fff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
        }}
      >
        <h2>运输路线</h2>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '16px',
              background: '#f9f9f9',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#888' }}>起点</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              东港重型装备制造厂
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>制造厂</div>
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
          <div
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '16px',
              background: '#f9f9f9',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#888' }}>终点</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              西郊 500kV 变电站施工现场
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              变电站施工现场
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          marginTop: '24px',
          padding: '20px',
          background: '#fff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
        }}
      >
        <h2>货物参数</h2>
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
              <td style={tdStyle}>8.8</td>
              <td style={tdStyle}>m</td>
            </tr>
            <tr>
              <td style={tdStyle}>宽度</td>
              <td style={tdStyle}>3.4</td>
              <td style={tdStyle}>m</td>
            </tr>
            <tr>
              <td style={tdStyle}>高度</td>
              <td style={tdStyle}>4.2</td>
              <td style={tdStyle}>m</td>
            </tr>
            <tr>
              <td style={tdStyle}>重量</td>
              <td style={tdStyle}>168</td>
              <td style={tdStyle}>t</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section
        style={{
          marginTop: '24px',
          padding: '20px',
          background: '#fff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
        }}
      >
        <CurrentStepHintPanel
          stepId="stage_1_task_intro"
          stepName="运输任务及货物介绍"
        />
      </section>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button
          data-testid="continue-btn"
          style={{
            padding: '12px 32px',
            background: '#3d85c6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          我已了解任务，继续
        </button>
      </div>
    </div>
  )
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
