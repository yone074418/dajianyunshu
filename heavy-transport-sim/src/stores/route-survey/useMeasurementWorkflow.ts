import { useState, useCallback, useMemo } from 'react'
import {
  createDistanceResult,
  createHeightResult,
  getMeasurementTargetsForObstacle,
  type MeasurementPoint,
  type MeasurementTarget,
  type MeasurementResult,
  type MeasurementToolTypeDay59,
} from '../../domain/measurements'
import { useRouteSurveyStore } from './routeSurveyStore'

export type MeasurementStep =
  | 'select_target'
  | 'select_point_a'
  | 'select_point_b'
  | 'result'

export interface MeasurementWorkflowState {
  activeTool: MeasurementToolTypeDay59 | null
  selectedTarget: MeasurementTarget | null
  step: MeasurementStep
  pointA: MeasurementPoint | null
  pointB: MeasurementPoint | null
  result: MeasurementResult | null
  error: string | null
}

export function useMeasurementWorkflow() {
  const currentRouteId = useRouteSurveyStore((s) => s.currentRouteId)
  const selectedObstacleId = useRouteSurveyStore((s) => s.selectedObstacleId)
  const currentObstacles = useRouteSurveyStore((s) => s.currentObstacles)
  const upsertMeasurementDraft = useRouteSurveyStore(
    (s) => s.upsertMeasurementDraft,
  )
  const getObstacleMeasurementStatus = useRouteSurveyStore(
    (s) => s.getObstacleMeasurementStatus,
  )

  const [state, setState] = useState<MeasurementWorkflowState>({
    activeTool: null,
    selectedTarget: null,
    step: 'select_target',
    pointA: null,
    pointB: null,
    result: null,
    error: null,
  })

  const selectedObstacle = useMemo(
    () => currentObstacles.find((o) => o.id === selectedObstacleId) ?? null,
    [currentObstacles, selectedObstacleId],
  )

  const availableTargets = useMemo((): MeasurementTarget[] => {
    if (!selectedObstacle) return []
    return getMeasurementTargetsForObstacle(currentRouteId, selectedObstacle)
  }, [currentRouteId, selectedObstacle])

  const selectTool = useCallback((tool: MeasurementToolTypeDay59) => {
    setState({
      activeTool: tool,
      selectedTarget: null,
      step: 'select_target',
      pointA: null,
      pointB: null,
      result: null,
      error: null,
    })
  }, [])

  const selectTarget = useCallback(
    (target: MeasurementTarget) => {
      if (
        state.activeTool &&
        !target.supportedTools.includes(state.activeTool)
      ) {
        setState((prev) => ({
          ...prev,
          error: `测量对象 "${target.label}" 不支持当前工具`,
        }))
        return
      }
      setState((prev) => ({
        ...prev,
        selectedTarget: target,
        step: 'select_point_a',
        pointA: null,
        pointB: null,
        result: null,
        error: null,
      }))
    },
    [state.activeTool],
  )

  const selectPointA = useCallback((point: MeasurementPoint) => {
    setState((prev) => ({
      ...prev,
      pointA: point,
      step: 'select_point_b',
      error: null,
    }))
  }, [])

  const selectPointB = useCallback((point: MeasurementPoint) => {
    setState((prev) => {
      if (prev.pointA && prev.pointA.id === point.id) {
        return { ...prev, error: '起点和终点不能相同' }
      }
      return { ...prev, pointB: point, error: null }
    })
  }, [])

  const calculateResult = useCallback((): MeasurementResult | null => {
    const { activeTool, selectedTarget, pointA, pointB } = state
    if (!activeTool || !selectedTarget || !pointA || !pointB) {
      setState((prev) => ({
        ...prev,
        error: '请先选择测量对象、起点和终点',
      }))
      return null
    }

    let result: MeasurementResult | { error: string }

    if (activeTool === 'distance') {
      result = createDistanceResult(
        currentRouteId,
        selectedObstacleId ?? '',
        selectedTarget,
        pointA,
        pointB,
      )
    } else {
      result = createHeightResult(
        currentRouteId,
        selectedObstacleId ?? '',
        selectedTarget,
        pointA,
        pointB,
      )
    }

    if ('error' in result) {
      setState((prev) => ({ ...prev, error: result.error }))
      return null
    }

    setState((prev) => ({ ...prev, result, step: 'result', error: null }))

    upsertMeasurementDraft({
      routeId: currentRouteId,
      obstacleId: selectedObstacleId ?? '',
      measurementType: activeTool,
      status: 'measured',
      valueSummary: result.valueLabel,
      updatedAt: result.measuredAt,
    })

    return result
  }, [state, currentRouteId, selectedObstacleId, upsertMeasurementDraft])

  const clearMeasurement = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedTarget: null,
      step: 'select_target',
      pointA: null,
      pointB: null,
      result: null,
      error: null,
    }))
  }, [])

  const resetAll = useCallback(() => {
    setState({
      activeTool: null,
      selectedTarget: null,
      step: 'select_target',
      pointA: null,
      pointB: null,
      result: null,
      error: null,
    })
  }, [])

  const usePresetPoints = useCallback(
    (target: MeasurementTarget, pairIndex: number) => {
      if (!target.suggestedPointPairs?.[pairIndex]) {
        setState((prev) => ({ ...prev, error: '预设测量点不存在' }))
        return
      }
      const pair = target.suggestedPointPairs[pairIndex]
      const pA: MeasurementPoint = {
        id: `${pair.id}_a`,
        label: pair.label.split('→')[0]?.trim() ?? '起点',
        position: pair.pointA,
      }
      const pB: MeasurementPoint = {
        id: `${pair.id}_b`,
        label: pair.label.split('→')[1]?.trim() ?? '终点',
        position: pair.pointB,
      }
      setState((prev) => ({
        ...prev,
        selectedTarget: target,
        pointA: pA,
        pointB: pB,
        step: 'result',
        error: null,
      }))
    },
    [],
  )

  return {
    ...state,
    selectedObstacle,
    availableTargets,
    selectTool,
    selectTarget,
    selectPointA,
    selectPointB,
    calculateResult,
    clearMeasurement,
    resetAll,
    usePresetPoints,
    getObstacleMeasurementStatus,
    currentRouteId,
    selectedObstacleId,
  }
}
