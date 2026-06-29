import { useState, useMemo } from 'react'
import {
  getAxleLineOptions,
  getColumnOptions,
  getAllowedColumnCounts,
  getAllowedAxleLineCounts,
  validateTrailerSelection,
  type TrailerAxleLineOption,
  type TrailerColumnOption,
} from '../../domain/trailerSelection'

export default function TrailerSelectionPage() {
  const axleOptions = useMemo(() => getAxleLineOptions(), [])
  const colOptions = useMemo(() => getColumnOptions(), [])

  const [selectedAxle, setSelectedAxle] = useState<number | null>(null)
  const [selectedCol, setSelectedCol] = useState<number | null>(null)

  const allowedCols = useMemo(
    () => (selectedAxle !== null ? getAllowedColumnCounts(selectedAxle) : []),
    [selectedAxle],
  )
  const allowedAxles = useMemo(
    () => (selectedCol !== null ? getAllowedAxleLineCounts(selectedCol) : []),
    [selectedCol],
  )

  const validation = useMemo(() => {
    if (selectedAxle === null || selectedCol === null) return null
    return validateTrailerSelection({
      axleLines: selectedAxle,
      columns: selectedCol,
    })
  }, [selectedAxle, selectedCol])

  const handleAxleChange = (axleLines: number) => {
    setSelectedAxle(axleLines)
    if (selectedCol !== null) {
      const allowed = getAllowedColumnCounts(axleLines)
      if (!allowed.includes(selectedCol)) {
        setSelectedCol(null)
      }
    }
  }

  const handleColChange = (columns: number) => {
    setSelectedCol(columns)
    if (selectedAxle !== null) {
      const allowed = getAllowedAxleLineCounts(columns)
      if (!allowed.includes(selectedAxle)) {
        setSelectedAxle(null)
      }
    }
  }

  const canContinue = validation?.success === true

  return (
    <div data-testid="trailer-selection-page" style={containerStyle}>
      <h1>简单配车 — 挂车轴线数与纵列数选择</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        本页面用于选择挂车的轴线数和纵列数。非法组合会被界面和数据校验同时阻止。
        本阶段只做轴线数/纵列数选择，不做最终配车规则判断。
      </p>

      <section style={{ marginTop: '24px' }}>
        <h2>选择轴线数</h2>
        <div data-testid="axle-options" style={optionGridStyle}>
          {axleOptions.map((opt) => (
            <OptionButton
              key={opt.id}
              option={opt}
              isSelected={selectedAxle === opt.axleLines}
              isDisabled={
                selectedCol !== null && !allowedAxles.includes(opt.axleLines)
              }
              onClick={() => handleAxleChange(opt.axleLines)}
              testId={`axle-${opt.axleLines}`}
            />
          ))}
        </div>
      </section>

      <section style={{ marginTop: '24px' }}>
        <h2>选择纵列数</h2>
        <div data-testid="column-options" style={optionGridStyle}>
          {colOptions.map((opt) => (
            <OptionButton
              key={opt.id}
              option={opt}
              isSelected={selectedCol === opt.columns}
              isDisabled={
                selectedAxle !== null && !allowedCols.includes(opt.columns)
              }
              onClick={() => handleColChange(opt.columns)}
              testId={`col-${opt.columns}`}
            />
          ))}
        </div>
      </section>

      {selectedAxle !== null && selectedCol !== null && (
        <section data-testid="selection-summary" style={{ marginTop: '24px' }}>
          <h2>当前选择</h2>
          <div style={summaryStyle}>
            <span>
              轴线数：<strong>{selectedAxle}</strong>
            </span>
            <span style={{ marginLeft: '16px' }}>
              纵列数：<strong>{selectedCol}</strong>
            </span>
          </div>

          {validation && !validation.success && (
            <div data-testid="validation-error" style={errorStyle}>
              <strong>非法组合：</strong>
              {validation.error}
            </div>
          )}

          {validation?.success && (
            <div data-testid="validation-success" style={successStyle}>
              合法组合，可以继续。
            </div>
          )}
        </section>
      )}

      <div style={{ marginTop: '24px' }}>
        <button
          data-testid="btn-continue"
          disabled={!canContinue}
          style={{
            ...btnStyle,
            background: canContinue ? '#1976d2' : '#bdbdbd',
            cursor: canContinue ? 'pointer' : 'not-allowed',
          }}
        >
          继续
        </button>
      </div>

      <div style={noteStyle}>
        <strong>教学简化说明：</strong>
        本页面的轴线数与纵列数合法组合规则为教学简化配置，不代表真实工程挂车设计规范。
        实际配车应根据货物参数、路线条件和车辆技术手册确定。
      </div>
    </div>
  )
}

function OptionButton({
  option,
  isSelected,
  isDisabled,
  onClick,
  testId,
}: {
  option: TrailerAxleLineOption | TrailerColumnOption
  isSelected: boolean
  isDisabled: boolean
  onClick: () => void
  testId: string
}) {
  const label = 'axleLines' in option ? option.label : option.label
  const desc = option.description

  return (
    <button
      data-testid={testId}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        display: 'block',
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: isSelected
          ? '2px solid #1976d2'
          : isDisabled
            ? '1px solid #e0e0e0'
            : '1px solid #d0d7de',
        background: isSelected ? '#e3f2fd' : isDisabled ? '#f5f5f5' : '#fff',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        opacity: isDisabled ? 0.5 : 1,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{label}</div>
      <div
        style={{
          fontSize: '12px',
          color: isDisabled ? '#999' : '#555',
          marginTop: '4px',
        }}
      >
        {desc}
      </div>
      {isDisabled && (
        <div style={{ fontSize: '11px', color: '#c62828', marginTop: '4px' }}>
          当前选择下不可用
        </div>
      )}
    </button>
  )
}

const containerStyle: React.CSSProperties = {
  padding: '24px',
  maxWidth: '960px',
  margin: '0 auto',
}

const optionGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '12px',
}

const summaryStyle: React.CSSProperties = {
  padding: '12px',
  background: '#f5f5f5',
  borderRadius: '6px',
  fontSize: '14px',
}

const errorStyle: React.CSSProperties = {
  marginTop: '8px',
  padding: '12px',
  background: '#ffebee',
  borderRadius: '6px',
  color: '#c62828',
  fontSize: '13px',
}

const successStyle: React.CSSProperties = {
  marginTop: '8px',
  padding: '12px',
  background: '#e8f5e9',
  borderRadius: '6px',
  color: '#2e7d32',
  fontSize: '13px',
}

const btnStyle: React.CSSProperties = {
  padding: '10px 24px',
  border: 'none',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
}

const noteStyle: React.CSSProperties = {
  marginTop: '32px',
  padding: '12px',
  background: '#fff3e0',
  borderRadius: '6px',
  fontSize: '12px',
}
