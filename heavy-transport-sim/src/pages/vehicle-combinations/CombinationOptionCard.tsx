import type { VehicleCombination } from '../../domain/vehicleCombinations'

interface Props {
  combination: VehicleCombination
  isSelected: boolean
  onSelect: (combination: VehicleCombination) => void
}

export default function CombinationOptionCard({
  combination,
  isSelected,
  onSelect,
}: Props) {
  const { parameters } = combination

  return (
    <button
      data-testid={`option-card-${combination.id}`}
      onClick={() => onSelect(combination)}
      style={{
        display: 'block',
        width: '100%',
        padding: '16px',
        borderRadius: '8px',
        border: isSelected ? '2px solid #1976d2' : '1px solid #d0d7de',
        background: isSelected ? '#e3f2fd' : '#fff',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3
          data-testid={`card-name-${combination.id}`}
          style={{ margin: 0, fontSize: '16px', color: '#1a1a1a' }}
        >
          {combination.name}
        </h3>
        {isSelected && (
          <span
            data-testid={`selected-badge-${combination.id}`}
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              background: '#1976d2',
              color: '#fff',
              fontSize: '12px',
            }}
          >
            已选择
          </span>
        )}
      </div>

      <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#555' }}>
        {combination.description}
      </p>

      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
        <span>
          重量：{parameters.cargoWeightRangeT.min}-
          {parameters.cargoWeightRangeT.max}t
        </span>
        <span style={{ marginLeft: '12px' }}>
          复杂度：
          {parameters.operationComplexity === 'high'
            ? '高'
            : parameters.operationComplexity === 'medium'
              ? '中'
              : '低'}
        </span>
      </div>

      <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
        适用：{combination.applicableScenarios[0]}
      </div>
    </button>
  )
}
