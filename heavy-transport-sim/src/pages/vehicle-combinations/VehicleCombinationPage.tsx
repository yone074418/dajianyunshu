import { useEffect, useMemo } from 'react'
import {
  getVehicleCombinations,
  validateVehicleCombinations,
  type VehicleCombination,
} from '../../domain/vehicleCombinations'
import { useCombinationSelectionStore } from '../../stores/combinationSelection'
import CombinationOptionCard from './CombinationOptionCard'
import CombinationDetailPanel from './CombinationDetailPanel'
import CombinationAnimationPlayer from './CombinationAnimationPlayer'

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
  const {
    selectedCombinationId,
    selectedCombination,
    selectCombination,
    reset,
  } = useCombinationSelectionStore()

  const handleSelect = (combination: VehicleCombination) => {
    if (combination.id === selectedCombinationId) return
    reset()
    selectCombination(combination)
  }

  useEffect(() => {
    return () => {
      useCombinationSelectionStore.getState().reset()
    }
  }, [])

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
      style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}
    >
      <h1>简单配车 — 组合方式选择与动画演示</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        本页面用于演示三类车辆组合方式的选择和动画播放。请选择一种组合方式查看其参数、优缺点和演示动画。
        本阶段仅演示组合方式，不做最终配车判定。
      </p>

      <section style={{ marginTop: '24px' }}>
        <h2>选择组合方式</h2>
        <div
          data-testid="combination-options"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {data.map((combo) => (
            <CombinationOptionCard
              key={combo.id}
              combination={combo}
              isSelected={selectedCombinationId === combo.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </section>

      {selectedCombination && (
        <>
          <section style={{ marginTop: '24px' }}>
            <h2>
              <span data-testid="selected-label">
                已选择：{selectedCombination.name}
              </span>
            </h2>
            <CombinationDetailPanel combination={selectedCombination} />
          </section>

          <section style={{ marginTop: '24px' }}>
            <h2>组合动画演示</h2>
            <CombinationAnimationPlayer combination={selectedCombination} />
          </section>
        </>
      )}

      {!selectedCombination && (
        <div
          data-testid="no-selection-hint"
          style={{
            marginTop: '32px',
            padding: '24px',
            textAlign: 'center',
            background: '#f5f5f5',
            borderRadius: '8px',
            color: '#888',
          }}
        >
          请从上方选择一种组合方式，以查看详细信息和动画演示。
        </div>
      )}
    </div>
  )
}
