import { useEffect, useRef, useCallback } from 'react'
import type { VehicleCombination } from '../../domain/vehicleCombinations'
import { useCombinationSelectionStore } from '../../stores/combinationSelection'

interface Props {
  combination: VehicleCombination
}

export default function CombinationAnimationPlayer({ combination }: Props) {
  const {
    animationStatus,
    currentStepIndex,
    play,
    pause,
    resume,
    reset,
    advanceStep,
  } = useCombinationSelectionStore()

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const steps = combination.demoConfig.animationSteps
  const isComplete = currentStepIndex >= steps.length
  const currentStep = !isComplete ? steps[currentStepIndex] : null

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    clearTimer()
    return clearTimer
  }, [combination.id, clearTimer])

  useEffect(() => {
    if (animationStatus !== 'playing' || isComplete) {
      clearTimer()
      return
    }
    const step = steps[currentStepIndex]
    if (!step) return
    timerRef.current = setTimeout(() => {
      advanceStep()
    }, step.durationMs)
    return clearTimer
  }, [
    animationStatus,
    currentStepIndex,
    isComplete,
    steps,
    advanceStep,
    clearTimer,
  ])

  const handlePlay = () => {
    if (animationStatus === 'idle' || animationStatus === 'completed') {
      play()
    }
  }

  const handlePause = () => {
    if (animationStatus === 'playing') {
      pause()
    }
  }

  const handleResume = () => {
    if (animationStatus === 'paused') {
      resume()
    }
  }

  const handleReset = () => {
    clearTimer()
    reset()
  }

  return (
    <div data-testid={`animation-player-${combination.id}`}>
      <div
        data-testid="animation-viewport"
        style={{
          width: '100%',
          height: '300px',
          background: '#f0f4f8',
          borderRadius: '8px',
          border: '1px solid #d0d7de',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          data-testid="component-layout"
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {combination.demoConfig.componentLayout.map((comp) => {
            const isActive =
              currentStep &&
              (currentStep.title.includes(comp.label) ||
                currentStep.description.includes(comp.label))
            return (
              <div
                key={comp.id}
                data-testid={`component-${comp.id}`}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: isActive ? '2px solid #1976d2' : '1px solid #bdbdbd',
                  background: isActive ? '#e3f2fd' : '#fff',
                  fontWeight: isActive ? 'bold' : 'normal',
                  transition: 'all 0.3s',
                  fontSize: '13px',
                }}
              >
                {comp.label}
              </div>
            )
          })}
        </div>

        {animationStatus === 'idle' && (
          <div data-testid="animation-idle" style={{ color: '#666' }}>
            点击「播放演示」开始动画
          </div>
        )}

        {currentStep && animationStatus !== 'idle' && (
          <div
            data-testid="animation-step-info"
            style={{ textAlign: 'center' }}
          >
            <div
              data-testid="step-title"
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#1976d2',
                marginBottom: '4px',
              }}
            >
              步骤 {currentStepIndex + 1}/{steps.length}：{currentStep.title}
            </div>
            <div
              data-testid="step-description"
              style={{ fontSize: '14px', color: '#555' }}
            >
              {currentStep.description}
            </div>
          </div>
        )}

        {animationStatus === 'completed' && (
          <div
            data-testid="animation-completed"
            style={{
              color: '#2e7d32',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            演示完成
          </div>
        )}
      </div>

      <div
        data-testid="animation-progress"
        style={{
          marginTop: '8px',
          height: '4px',
          background: '#e0e0e0',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${steps.length > 0 ? (Math.min(currentStepIndex, steps.length) / steps.length) * 100 : 0}%`,
            background: animationStatus === 'completed' ? '#2e7d32' : '#1976d2',
            transition: 'width 0.3s',
          }}
        />
      </div>

      <div
        data-testid="animation-controls"
        style={{
          marginTop: '12px',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {(animationStatus === 'idle' || animationStatus === 'completed') && (
          <button
            data-testid="btn-play"
            onClick={handlePlay}
            style={btnStyle('#1976d2')}
          >
            播放演示
          </button>
        )}
        {animationStatus === 'playing' && (
          <button
            data-testid="btn-pause"
            onClick={handlePause}
            style={btnStyle('#f57c00')}
          >
            暂停
          </button>
        )}
        {animationStatus === 'paused' && (
          <button
            data-testid="btn-resume"
            onClick={handleResume}
            style={btnStyle('#2e7d32')}
          >
            继续
          </button>
        )}
        {animationStatus !== 'idle' && (
          <button
            data-testid="btn-reset"
            onClick={handleReset}
            style={btnStyle('#757575')}
          >
            复位演示
          </button>
        )}
      </div>
    </div>
  )
}

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: '8px 20px',
    border: 'none',
    borderRadius: '4px',
    background: color,
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  }
}
