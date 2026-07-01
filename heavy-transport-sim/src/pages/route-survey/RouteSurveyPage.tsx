import { useMemo, useEffect, useCallback, useState } from 'react'
import {
  getObstacleTypeSummary,
  validateSurveyRoutes,
  ROUTE_OBSTACLE_TYPE_LABELS,
  type SurveyRoute,
  type RouteObstacle,
} from '../../domain/surveyRoutes'
import { getSurveyRoutes } from '../../domain/surveyRouteData'
import {
  getMeasurementTargetsForObstacle,
  calculateHorizontalDistance,
  calculateVerticalDistance,
  calculateSlopePercent,
  calculateSlopeAngleDeg,
  CURVE_OBSTACLE_KIND_LABELS,
  CURVE_MEASUREMENT_SOURCE_LABELS,
  createCurveParameterResult,
  BRIDGE_KIND_LABELS,
  BRIDGE_PARAMETER_SOURCE_LABELS,
  BRIDGE_LOAD_LIMIT_MIN,
  BRIDGE_LOAD_LIMIT_MAX,
  BRIDGE_DECK_WIDTH_MIN,
  BRIDGE_DECK_WIDTH_MAX,
  BRIDGE_LENGTH_MIN,
  BRIDGE_LENGTH_MAX,
  createBridgeInfoMeasurementResult,
  type CurveObstacleKind,
  type CurveMeasurementSource,
  type CurveParameterMeasurementResult,
  type BridgeKind,
  type BridgeParameterSource,
  type BridgeDeckCondition,
  type BridgeInfoMeasurementResult,
} from '../../domain/measurements'
import {
  evaluateHeightClearance,
  type HeightClearanceInput,
  type HeightClearanceRuleResult,
} from '../../domain/heightClearance'
import {
  evaluateCircularCurveClearance,
  type CircularCurveClearanceInput,
  type CircularCurveClearanceResult,
} from '../../domain/circularCurveClearance'
import {
  evaluateBridgeBearing,
  type BridgeBearingInput,
  type BridgeBearingRuleResult,
  TEACHING_SIMPLIFICATION_NOTICE,
} from '../../domain/bridgeBearing'
import { useRouteSurveyStore } from '../../stores/route-survey/routeSurveyStore'

export default function RouteSurveyPage() {
  const routes = useMemo(() => getSurveyRoutes(), [])
  const validation = useMemo(() => validateSurveyRoutes(routes), [routes])

  const currentRouteId = useRouteSurveyStore((s) => s.currentRouteId)
  const selectedObstacleId = useRouteSurveyStore((s) => s.selectedObstacleId)
  const sceneInstanceKey = useRouteSurveyStore((s) => s.sceneInstanceKey)
  const currentRoute = useRouteSurveyStore((s) => s.currentRoute)
  const currentObstacles = useRouteSurveyStore((s) => s.currentObstacles)
  const switchRoute = useRouteSurveyStore((s) => s.switchRoute)
  const selectObstacle = useRouteSurveyStore((s) => s.selectObstacle)
  const getObstacleMeasurementStatus = useRouteSurveyStore(
    (s) => s.getObstacleMeasurementStatus,
  )

  useEffect(() => {
    return () => {
      // Scene cleanup on unmount
    }
  }, [currentRouteId])

  const handleRouteSwitch = useCallback(
    (routeId: string) => {
      switchRoute(routeId)
    },
    [switchRoute],
  )

  const handleObstacleSelect = useCallback(
    (obstacleId: string) => {
      selectObstacle(obstacleId === selectedObstacleId ? null : obstacleId)
    },
    [selectObstacle, selectedObstacleId],
  )

  const selectedObstacle = useMemo(
    () => currentObstacles.find((o) => o.id === selectedObstacleId) ?? null,
    [currentObstacles, selectedObstacleId],
  )

  const measuredCount = useMemo(() => {
    return currentObstacles.filter(
      (o) => getObstacleMeasurementStatus(currentRouteId, o.id) === 'measured',
    ).length
  }, [currentObstacles, currentRouteId, getObstacleMeasurementStatus])

  return (
    <div data-testid="route-survey-page" style={containerStyle}>
      <h1>路线勘测</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
        选择候选运输路线，查看障碍点配置。切换路线不丢失已测数据。
      </p>

      <div style={noteStyle}>
        <strong>说明：</strong>
        Day58 实现路线切换、导航和障碍列表。测量工具将在 Day59—Day62 逐步实现。
      </div>

      {!validation.success && (
        <div data-testid="validation-errors" style={errorStyle}>
          <strong>数据校验问题：</strong>
          <ul style={{ margin: '4px 0 0 16px' }}>
            {validation.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <section data-testid="route-nav" style={{ marginTop: '20px' }}>
        <h2>路线导航</h2>
        <div style={routeNavGridStyle}>
          {routes.map((route) => (
            <RouteNavCard
              key={route.id}
              route={route}
              isSelected={route.id === currentRouteId}
              onSelect={handleRouteSwitch}
            />
          ))}
        </div>
      </section>

      {currentRoute && (
        <section
          data-testid="current-route-summary"
          style={{ marginTop: '20px' }}
        >
          <div style={summaryBarStyle}>
            <div>
              <strong>当前路线：</strong>
              {currentRoute.name}
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
              {currentRoute.origin} → {currentRoute.destination}
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
              障碍类型：{getObstacleTypeSummary(currentRoute)}
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              已测：{measuredCount} / {currentObstacles.length} | 场景实例：#
              {sceneInstanceKey}
            </div>
          </div>
        </section>
      )}

      <section data-testid="scene-preview" style={{ marginTop: '20px' }}>
        <h2>路线场景预览</h2>
        <div data-testid="scene-host" style={scenePreviewStyle}>
          <div
            style={{ color: '#999', textAlign: 'center', paddingTop: '60px' }}
          >
            路线场景预览区域
            <br />
            <span style={{ fontSize: '12px' }}>
              当前路线：{currentRoute?.name ?? '未选择'}
              <br />
              场景实例 Key：#{sceneInstanceKey}
            </span>
          </div>
        </div>
      </section>

      <section
        data-testid="obstacle-list-section"
        style={{ marginTop: '20px' }}
      >
        <h2>障碍点列表</h2>
        {currentObstacles.length === 0 ? (
          <div data-testid="obstacle-list-empty" style={emptyStyle}>
            当前路线无障碍点配置。
          </div>
        ) : (
          <div data-testid="obstacle-list" style={obstacleListStyle}>
            {currentObstacles.map((obs) => (
              <ObstacleListItem
                key={obs.id}
                obstacle={obs}
                routeId={currentRouteId}
                isSelected={obs.id === selectedObstacleId}
                onSelect={handleObstacleSelect}
                getMeasurementStatus={getObstacleMeasurementStatus}
              />
            ))}
          </div>
        )}
      </section>

      {selectedObstacle && (
        <section data-testid="obstacle-detail" style={{ marginTop: '20px' }}>
          <h2>障碍详情</h2>
          <ObstacleDetailPanel obstacle={selectedObstacle} />
        </section>
      )}

      {selectedObstacle && (
        <section
          data-testid="measurement-section"
          style={{ marginTop: '20px' }}
        >
          <h2>测量工具</h2>
          <MeasurementPanel
            routeId={currentRouteId}
            obstacle={selectedObstacle}
          />
        </section>
      )}

      {selectedObstacle && selectedObstacle.type === 'height_limit' && (
        <section
          data-testid="height-clearance-section"
          style={{ marginTop: '20px' }}
        >
          <h2>高度通过性检查</h2>
          <HeightClearancePanel
            routeId={currentRouteId}
            obstacle={selectedObstacle}
          />
        </section>
      )}

      {selectedObstacle && selectedObstacle.type === 'curve' && (
        <section
          data-testid="circular-curve-section"
          style={{ marginTop: '20px' }}
        >
          <h2>圆弧弯道通过性检查</h2>
          <CircularCurvePanel
            routeId={currentRouteId}
            obstacle={selectedObstacle}
          />
        </section>
      )}

      {selectedObstacle && selectedObstacle.type === 'bridge' && (
        <section
          data-testid="bridge-bearing-section"
          style={{ marginTop: '20px' }}
        >
          <h2>桥梁承载教学检查</h2>
          <BridgeBearingPanel
            routeId={currentRouteId}
            obstacle={selectedObstacle}
          />
        </section>
      )}

      <div style={teachingNoteStyle}>
        <strong>教学简化声明：</strong>
        本路线和障碍点数据为教学简化配置，不代表真实工程路线。Day59
        已实现距离/高度测量工具，Day60 已实现坡度测量，Day62
        已实现桥梁信息查看和限载输入。 桥梁承载教学规则由 Day68
        实现。本系统不做桥梁是否能通行的最终判断。
      </div>
    </div>
  )
}

function RouteNavCard({
  route,
  isSelected,
  onSelect,
}: {
  route: SurveyRoute
  isSelected: boolean
  onSelect: (routeId: string) => void
}) {
  const typeSummary = useMemo(() => getObstacleTypeSummary(route), [route])

  return (
    <button
      data-testid={`route-nav-${route.id}`}
      onClick={() => onSelect(route.id)}
      style={{
        ...routeNavCardStyle,
        border: isSelected ? '2px solid #1976d2' : '1px solid #d0d7de',
        background: isSelected ? '#e3f2fd' : '#fff',
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{route.name}</div>
      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
        {route.origin} → {route.destination}
      </div>
      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
        障碍：{route.obstacles.length} 个 | {typeSummary}
      </div>
    </button>
  )
}

function ObstacleListItem({
  obstacle,
  routeId,
  isSelected,
  onSelect,
  getMeasurementStatus,
}: {
  obstacle: RouteObstacle
  routeId: string
  isSelected: boolean
  onSelect: (obstacleId: string) => void
  getMeasurementStatus: (
    routeId: string,
    obstacleId: string,
  ) => 'unmeasured' | 'measured' | 'needs_review'
}) {
  const status = getMeasurementStatus(routeId, obstacle.id)
  const statusLabel =
    status === 'measured'
      ? '已测'
      : status === 'needs_review'
        ? '待复核'
        : '未测'
  const statusColor =
    status === 'measured'
      ? '#2e7d32'
      : status === 'needs_review'
        ? '#e65100'
        : '#999'

  return (
    <button
      data-testid={`obstacle-item-${obstacle.id}`}
      onClick={() => onSelect(obstacle.id)}
      style={{
        ...obstacleItemStyle,
        border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
        background: isSelected ? '#e3f2fd' : '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>
          {ROUTE_OBSTACLE_TYPE_LABELS[obstacle.type] ?? obstacle.type}：
          {obstacle.name}
        </span>
        <span
          style={{
            fontSize: '11px',
            color: statusColor,
            fontWeight: 'bold',
          }}
        >
          {statusLabel}
        </span>
      </div>
      <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
        风险：
        {obstacle.riskLevel === 'high'
          ? '高'
          : obstacle.riskLevel === 'medium'
            ? '中'
            : '低'}
        {' | '}测量工具：{obstacle.measurementTool}
      </div>
      <div
        style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}
        title={obstacle.teachingNote}
      >
        {obstacle.teachingNote.substring(0, 50)}...
      </div>
    </button>
  )
}

function ObstacleDetailPanel({ obstacle }: { obstacle: RouteObstacle }) {
  return (
    <div data-testid="obstacle-detail-panel" style={detailPanelStyle}>
      <h3 style={{ margin: '0 0 8px 0' }}>{obstacle.name}</h3>
      <div style={{ fontSize: '13px', color: '#333' }}>
        {obstacle.description}
      </div>
      <div style={{ fontSize: '13px', marginTop: '8px' }}>
        <strong>类型：</strong>
        {ROUTE_OBSTACLE_TYPE_LABELS[obstacle.type] ?? obstacle.type}
      </div>
      <div style={{ fontSize: '13px', marginTop: '4px' }}>
        <strong>风险等级：</strong>
        {obstacle.riskLevel === 'high'
          ? '高'
          : obstacle.riskLevel === 'medium'
            ? '中'
            : '低'}
      </div>
      <div style={{ fontSize: '13px', marginTop: '4px' }}>
        <strong>关联测量工具：</strong>
        {obstacle.measurementTool}
      </div>
      <div style={{ fontSize: '13px', marginTop: '4px' }}>
        <strong>位置：</strong>[{obstacle.position.join(', ')}]
      </div>
      <div
        style={{
          fontSize: '12px',
          color: '#1565c0',
          marginTop: '8px',
          fontStyle: 'italic',
        }}
      >
        {obstacle.teachingNote}
      </div>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  padding: '24px',
  maxWidth: '960px',
  margin: '0 auto',
}

const noteStyle: React.CSSProperties = {
  padding: '12px',
  background: '#e3f2fd',
  borderRadius: '6px',
  fontSize: '13px',
  marginBottom: '16px',
}

const errorStyle: React.CSSProperties = {
  padding: '12px',
  background: '#ffebee',
  borderRadius: '6px',
  fontSize: '13px',
  color: '#c62828',
}

const routeNavGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '12px',
  marginTop: '8px',
}

const routeNavCardStyle: React.CSSProperties = {
  padding: '12px',
  borderRadius: '8px',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s',
}

const summaryBarStyle: React.CSSProperties = {
  padding: '12px',
  background: '#f5f5f5',
  borderRadius: '6px',
}

const scenePreviewStyle: React.CSSProperties = {
  height: '200px',
  background: '#fafafa',
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
}

const obstacleListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const obstacleItemStyle: React.CSSProperties = {
  padding: '12px',
  borderRadius: '6px',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s',
}

const detailPanelStyle: React.CSSProperties = {
  padding: '16px',
  background: '#fff',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
}

const emptyStyle: React.CSSProperties = {
  padding: '24px',
  textAlign: 'center',
  color: '#999',
  fontSize: '14px',
}

const teachingNoteStyle: React.CSSProperties = {
  marginTop: '32px',
  padding: '12px',
  background: '#fff3e0',
  borderRadius: '6px',
  fontSize: '12px',
}

const formLabelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  fontSize: '12px',
  fontWeight: 500,
  color: '#333',
}

const formInputStyle: React.CSSProperties = {
  padding: '6px 8px',
  border: '1px solid #d0d7de',
  borderRadius: '4px',
  fontSize: '13px',
  marginTop: '2px',
}

const curveErrorStyle: React.CSSProperties = {
  padding: '8px',
  background: '#ffebee',
  borderRadius: '4px',
  fontSize: '12px',
  color: '#c62828',
  marginTop: '8px',
}

const saveBtnStyle: React.CSSProperties = {
  padding: '6px 16px',
  border: '1px solid #1976d2',
  borderRadius: '4px',
  background: '#1976d2',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold',
}

const clearBtnStyle: React.CSSProperties = {
  padding: '6px 16px',
  border: '1px solid #d0d7de',
  borderRadius: '4px',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '12px',
}

const rulePanelStyle: React.CSSProperties = {
  padding: '12px',
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  background: '#fff',
}

const ruleGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '8px',
}

const ruleResultStyle: React.CSSProperties = {
  padding: '12px',
  background: '#e8f5e9',
  borderRadius: '6px',
  marginTop: '12px',
  fontSize: '13px',
}

const curveResultBoxStyle: React.CSSProperties = {
  padding: '12px',
  background: '#e8f5e9',
  borderRadius: '6px',
  marginTop: '12px',
}

const curveParamRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '13px',
  padding: '2px 0',
}

const curveParamLabelStyle: React.CSSProperties = {
  color: '#555',
}

const curveParamValueStyle: React.CSSProperties = {
  fontWeight: 'bold',
  color: '#2e7d32',
}

function MeasurementPanel({
  routeId,
  obstacle,
}: {
  routeId: string
  obstacle: RouteObstacle
}) {
  const targets = useMemo(
    () => getMeasurementTargetsForObstacle(routeId, obstacle),
    [routeId, obstacle],
  )

  const [activeTargetId, setActiveTargetId] = useState<string | null>(null)
  const [selectedPairIndex, setSelectedPairIndex] = useState<number | null>(
    null,
  )
  const [measurementResult, setMeasurementResult] = useState<{
    value: number
    unit: string
    label: string
    targetLabel: string
    processText?: string
    horizontalDistance?: number
    verticalDistance?: number
    slopeAngle?: number
  } | null>(null)

  const [curveResult, setCurveResult] =
    useState<CurveParameterMeasurementResult | null>(null)
  const [curveForm, setCurveForm] = useState<{
    curveKind: CurveObstacleKind
    radiusM: string
    angleDeg: string
    entranceWidthM: string
    exitWidthM: string
    effectiveWidthM: string
    source: CurveMeasurementSource
    notes: string
  }>({
    curveKind: 'circular_curve',
    radiusM: '',
    angleDeg: '',
    entranceWidthM: '',
    exitWidthM: '',
    effectiveWidthM: '',
    source: 'manual_input',
    notes: '',
  })
  const [curveErrors, setCurveErrors] = useState<string[]>([])

  const [bridgeResult, setBridgeResult] =
    useState<BridgeInfoMeasurementResult | null>(null)
  const [bridgeForm, setBridgeForm] = useState<{
    bridgeKind: BridgeKind
    loadLimitT: string
    deckWidthM: string
    bridgeLengthM: string
    clearanceHeightM: string
    laneCount: string
    deckCondition: BridgeDeckCondition
    allowMeeting: boolean
    source: BridgeParameterSource
    notes: string
  }>({
    bridgeKind: 'medium_bridge',
    loadLimitT: '',
    deckWidthM: '',
    bridgeLengthM: '',
    clearanceHeightM: '',
    laneCount: '',
    deckCondition: 'unknown',
    allowMeeting: false,
    source: 'manual_input',
    notes: '',
  })
  const [bridgeErrors, setBridgeErrors] = useState<string[]>([])

  const activeTarget = targets.find((t) => t.id === activeTargetId) ?? null

  const handleTargetSelect = (targetId: string) => {
    setActiveTargetId(targetId)
    setSelectedPairIndex(null)
    setMeasurementResult(null)
    setCurveResult(null)
    setCurveErrors([])
    setBridgeResult(null)
    setBridgeErrors([])
    const tgt = targets.find((t) => t.id === targetId)
    if (tgt?.curveKind) {
      const preset = tgt.presetCurveParams
      setCurveForm({
        curveKind: tgt.curveKind,
        radiusM: preset?.radiusM ? String(preset.radiusM) : '',
        angleDeg: preset?.angleDeg ? String(preset.angleDeg) : '',
        entranceWidthM: preset?.entranceWidthM
          ? String(preset.entranceWidthM)
          : '',
        exitWidthM: preset?.exitWidthM ? String(preset.exitWidthM) : '',
        effectiveWidthM: '',
        source: preset?.radiusM ? 'teaching_config' : 'manual_input',
        notes: '',
      })
    }
    if (tgt?.bridgeKind) {
      const preset = tgt.presetBridgeParams
      setBridgeForm({
        bridgeKind: tgt.bridgeKind,
        loadLimitT: preset?.loadLimitT ? String(preset.loadLimitT) : '',
        deckWidthM: preset?.deckWidthM ? String(preset.deckWidthM) : '',
        bridgeLengthM: preset?.bridgeLengthM
          ? String(preset.bridgeLengthM)
          : '',
        clearanceHeightM: '',
        laneCount: '',
        deckCondition: 'unknown',
        allowMeeting: false,
        source: preset?.loadLimitT ? 'teaching_config' : 'manual_input',
        notes: '',
      })
    }
  }

  const handlePresetSelect = (pairIndex: number) => {
    if (!activeTarget?.suggestedPointPairs?.[pairIndex]) return
    setSelectedPairIndex(pairIndex)
    const pair = activeTarget.suggestedPointPairs[pairIndex]
    const posA = pair.pointA as [number, number, number]
    const posB = pair.pointB as [number, number, number]
    const dx = posB[0] - posA[0]
    const dy = posB[1] - posA[1]
    const dz = posB[2] - posA[2]

    const isSlope = activeTarget.supportedTools.includes('slope')

    let value: number
    let unit: string
    let processText: string | undefined
    let horizontalDistance: number | undefined
    let verticalDistance: number | undefined
    let slopeAngle: number | undefined

    if (isSlope) {
      const hDist = calculateHorizontalDistance(posA, posB)
      const vDist = calculateVerticalDistance(posA, posB)
      const pct = calculateSlopePercent(hDist, vDist)
      const angle = calculateSlopeAngleDeg(hDist, vDist)
      value = Math.round(pct * 100) / 100
      unit = '%'
      horizontalDistance = Math.round(hDist * 100) / 100
      verticalDistance = Math.round(vDist * 100) / 100
      slopeAngle = Math.round(angle * 100) / 100
      processText = [
        `水平距离：${horizontalDistance} m`,
        `垂直距离：${verticalDistance} m`,
        `计算过程：${verticalDistance} ÷ ${horizontalDistance} × 100 = ${value}%`,
        `坡度结果：${value}%（约 ${slopeAngle}°）`,
      ].join('\n')
    } else if (activeTarget.supportedTools.includes('height')) {
      value = Math.abs(dy)
      unit = 'm'
    } else {
      value = Math.sqrt(dx * dx + dy * dy + dz * dz)
      unit = 'm'
    }
    value = Math.round(value * 100) / 100

    setMeasurementResult({
      value,
      unit,
      label: pair.label,
      targetLabel: activeTarget.label,
      processText,
      horizontalDistance,
      verticalDistance,
      slopeAngle,
    })

    useRouteSurveyStore.getState().upsertMeasurementDraft({
      routeId,
      obstacleId: obstacle.id,
      measurementType: isSlope
        ? 'slope'
        : activeTarget.supportedTools.includes('height')
          ? 'height'
          : 'distance',
      status: 'measured',
      valueSummary: `${value} ${unit}`,
      updatedAt: new Date().toISOString(),
    })
  }

  const handleClear = () => {
    setActiveTargetId(null)
    setSelectedPairIndex(null)
    setMeasurementResult(null)
    setCurveResult(null)
    setCurveErrors([])
    setBridgeResult(null)
    setBridgeErrors([])
  }

  const handleCurveSave = () => {
    if (!activeTarget) return
    const errs: string[] = []
    const radius = parseFloat(curveForm.radiusM)
    const angle = parseFloat(curveForm.angleDeg)
    const entrance = parseFloat(curveForm.entranceWidthM)
    const exit = parseFloat(curveForm.exitWidthM)
    const effective = curveForm.effectiveWidthM
      ? parseFloat(curveForm.effectiveWidthM)
      : undefined
    if (!Number.isFinite(radius) || radius <= 0) errs.push('半径必须大于 0')
    if (!Number.isFinite(angle) || angle <= 0 || angle > 180)
      errs.push('夹角必须大于 0 且小于等于 180')
    if (!Number.isFinite(entrance) || entrance <= 0)
      errs.push('入口宽度必须大于 0')
    if (!Number.isFinite(exit) || exit <= 0) errs.push('出口宽度必须大于 0')
    if (
      effective !== undefined &&
      (!Number.isFinite(effective) || effective <= 0)
    )
      errs.push('有效宽度必须大于 0')
    if (errs.length > 0) {
      setCurveErrors(errs)
      return
    }
    setCurveErrors([])
    const result = createCurveParameterResult({
      routeId,
      obstacleId: obstacle.id,
      targetId: activeTarget.id,
      targetLabel: activeTarget.label,
      curveKind: curveForm.curveKind,
      radiusM: radius,
      angleDeg: angle,
      entranceWidthM: entrance,
      exitWidthM: exit,
      effectiveWidthM: effective,
      source: curveForm.source,
      notes: curveForm.notes || undefined,
    })
    if ('error' in result) {
      setCurveErrors([result.error])
      return
    }
    setCurveResult(result)
    useRouteSurveyStore.getState().upsertMeasurementDraft({
      routeId,
      obstacleId: obstacle.id,
      measurementType: 'curve',
      status: 'measured',
      valueSummary: result.valueLabel,
      updatedAt: result.measuredAt,
    })
  }

  const handleBridgeSave = () => {
    if (!activeTarget) return
    const errs: string[] = []
    const loadLimit = parseFloat(bridgeForm.loadLimitT)
    const deckWidth = parseFloat(bridgeForm.deckWidthM)
    const bridgeLength = parseFloat(bridgeForm.bridgeLengthM)
    const clearance = bridgeForm.clearanceHeightM
      ? parseFloat(bridgeForm.clearanceHeightM)
      : undefined
    const laneCount = bridgeForm.laneCount
      ? parseInt(bridgeForm.laneCount)
      : undefined
    if (isNaN(loadLimit) || loadLimit <= 0)
      errs.push(
        `限载值必须在 ${BRIDGE_LOAD_LIMIT_MIN}t 到 ${BRIDGE_LOAD_LIMIT_MAX}t 之间`,
      )
    else if (loadLimit < BRIDGE_LOAD_LIMIT_MIN)
      errs.push(`限载值不能小于 ${BRIDGE_LOAD_LIMIT_MIN}t`)
    else if (loadLimit > BRIDGE_LOAD_LIMIT_MAX)
      errs.push(`限载值不能大于 ${BRIDGE_LOAD_LIMIT_MAX}t`)
    if (isNaN(deckWidth) || deckWidth <= 0)
      errs.push(
        `桥面宽度必须在 ${BRIDGE_DECK_WIDTH_MIN}m 到 ${BRIDGE_DECK_WIDTH_MAX}m 之间`,
      )
    else if (deckWidth < BRIDGE_DECK_WIDTH_MIN)
      errs.push(`桥面宽度不能小于 ${BRIDGE_DECK_WIDTH_MIN}m`)
    else if (deckWidth > BRIDGE_DECK_WIDTH_MAX)
      errs.push(`桥面宽度不能大于 ${BRIDGE_DECK_WIDTH_MAX}m`)
    if (isNaN(bridgeLength) || bridgeLength <= 0)
      errs.push(
        `桥梁长度必须在 ${BRIDGE_LENGTH_MIN}m 到 ${BRIDGE_LENGTH_MAX}m 之间`,
      )
    else if (bridgeLength < BRIDGE_LENGTH_MIN)
      errs.push(`桥梁长度不能小于 ${BRIDGE_LENGTH_MIN}m`)
    else if (bridgeLength > BRIDGE_LENGTH_MAX)
      errs.push(`桥梁长度不能大于 ${BRIDGE_LENGTH_MAX}m`)
    if (
      clearance !== undefined &&
      (!Number.isFinite(clearance) || clearance < 2 || clearance > 15)
    )
      errs.push('桥下净空必须在 2m 到 15m 之间')
    if (
      laneCount !== undefined &&
      (!Number.isInteger(laneCount) || laneCount < 1 || laneCount > 8)
    )
      errs.push('车道数必须在 1 到 8 之间')
    if (errs.length > 0) {
      setBridgeErrors(errs)
      return
    }
    setBridgeErrors([])
    const result = createBridgeInfoMeasurementResult({
      routeId,
      obstacleId: obstacle.id,
      targetId: activeTarget.id,
      targetLabel: activeTarget.label,
      bridgeName: obstacle.name,
      bridgeKind: bridgeForm.bridgeKind,
      loadLimitT: loadLimit,
      deckWidthM: deckWidth,
      bridgeLengthM: bridgeLength,
      clearanceHeightM: clearance,
      laneCount,
      deckCondition: bridgeForm.deckCondition,
      allowMeeting: bridgeForm.allowMeeting,
      source: bridgeForm.source,
      notes: bridgeForm.notes || undefined,
    })
    if ('error' in result) {
      setBridgeErrors([result.error])
      return
    }
    setBridgeResult(result)
    useRouteSurveyStore.getState().upsertMeasurementDraft({
      routeId,
      obstacleId: obstacle.id,
      measurementType: 'bridge',
      status: 'measured',
      valueSummary: result.valueLabel,
      updatedAt: result.measuredAt,
    })
  }

  if (targets.length === 0) {
    return (
      <div
        data-testid="measurement-empty"
        style={{ color: '#999', fontSize: '13px' }}
      >
        当前障碍无可测量对象。
      </div>
    )
  }

  return (
    <div data-testid="measurement-panel">
      <div style={{ marginBottom: '12px' }}>
        <strong style={{ fontSize: '13px' }}>选择测量对象：</strong>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '8px',
            flexWrap: 'wrap',
          }}
        >
          {targets.map((t) => (
            <button
              key={t.id}
              data-testid={`target-${t.id}`}
              onClick={() => handleTargetSelect(t.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border:
                  activeTargetId === t.id
                    ? '2px solid #1976d2'
                    : '1px solid #d0d7de',
                background: activeTargetId === t.id ? '#e3f2fd' : '#fff',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {t.label}
              <div style={{ fontSize: '11px', color: '#666' }}>
                {t.supportedTools.join(' / ')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeTarget && (
        <div
          data-testid="measurement-target-detail"
          style={{ marginBottom: '12px' }}
        >
          <div style={{ fontSize: '13px', color: '#555' }}>
            {activeTarget.description}
          </div>
          {activeTarget.supportedTools.includes('curve') &&
          activeTarget.curveKind ? (
            <div style={{ marginTop: '12px' }}>
              <CurveParameterForm
                form={curveForm}
                presetCurveParams={activeTarget.presetCurveParams}
                onChange={setCurveForm}
                errors={curveErrors}
                onSave={handleCurveSave}
                result={curveResult}
                onClear={() => {
                  setCurveResult(null)
                  setCurveErrors([])
                }}
              />
            </div>
          ) : activeTarget.supportedTools.includes('bridge') &&
            activeTarget.bridgeKind ? (
            <div style={{ marginTop: '12px' }}>
              <BridgeInfoForm
                obstacle={obstacle}
                form={bridgeForm}
                onChange={setBridgeForm}
                errors={bridgeErrors}
                onSave={handleBridgeSave}
                result={bridgeResult}
                onClear={() => {
                  setBridgeResult(null)
                  setBridgeErrors([])
                }}
              />
            </div>
          ) : (
            activeTarget.suggestedPointPairs &&
            activeTarget.suggestedPointPairs.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <strong style={{ fontSize: '12px' }}>预设测量点：</strong>
                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    marginTop: '4px',
                    flexWrap: 'wrap',
                  }}
                >
                  {activeTarget.suggestedPointPairs.map((pair, i) => (
                    <button
                      key={pair.id}
                      data-testid={`preset-pair-${i}`}
                      onClick={() => handlePresetSelect(i)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border:
                          selectedPairIndex === i
                            ? '2px solid #2e7d32'
                            : '1px solid #d0d7de',
                        background:
                          selectedPairIndex === i ? '#e8f5e9' : '#fff',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                    >
                      {pair.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {measurementResult && (
        <div
          data-testid="measurement-result"
          style={{
            padding: '12px',
            background: '#e8f5e9',
            borderRadius: '6px',
            marginTop: '8px',
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '4px',
            }}
          >
            测量结果
          </div>
          <div
            data-testid="measurement-value"
            style={{ fontSize: '18px', color: '#2e7d32' }}
          >
            {measurementResult.value} {measurementResult.unit}
          </div>
          <div
            data-testid="measurement-object"
            style={{ fontSize: '13px', marginTop: '4px' }}
          >
            测量对象：{measurementResult.targetLabel}
          </div>
          <div
            data-testid="measurement-points"
            style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}
          >
            测量方式：{measurementResult.label}
          </div>
          {measurementResult.horizontalDistance !== undefined && (
            <div
              data-testid="measurement-horizontal"
              style={{ fontSize: '13px', marginTop: '4px' }}
            >
              水平距离：{measurementResult.horizontalDistance} m
            </div>
          )}
          {measurementResult.verticalDistance !== undefined && (
            <div
              data-testid="measurement-vertical"
              style={{ fontSize: '13px', marginTop: '4px' }}
            >
              垂直距离：{measurementResult.verticalDistance} m
            </div>
          )}
          {measurementResult.slopeAngle !== undefined && (
            <div
              data-testid="measurement-angle"
              style={{ fontSize: '13px', marginTop: '4px' }}
            >
              坡度角：约 {measurementResult.slopeAngle}°
            </div>
          )}
          {measurementResult.processText && (
            <div
              data-testid="measurement-process"
              style={{
                fontSize: '12px',
                color: '#1565c0',
                marginTop: '8px',
                whiteSpace: 'pre-line',
                background: '#f5f5f5',
                padding: '8px',
                borderRadius: '4px',
              }}
            >
              {measurementResult.processText}
            </div>
          )}
        </div>
      )}

      {measurementResult && (
        <button
          data-testid="btn-clear-measurement"
          onClick={handleClear}
          style={{
            marginTop: '8px',
            padding: '6px 16px',
            border: '1px solid #d0d7de',
            borderRadius: '4px',
            background: '#fff',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          清除测量
        </button>
      )}
    </div>
  )
}

const CURVE_KIND_DESCRIPTIONS: Record<CurveObstacleKind, string> = {
  circular_curve: '圆弧弯道重点测量：半径、夹角、入口宽度、出口宽度。',
  right_angle_curve:
    '直交弯道重点测量：夹角、入口宽度、出口宽度、转角处有效宽度。',
  compound_curve: '复合弯道参数测量：后续扩展，当前仅支持基础参数录入。',
}

function CurveParameterForm({
  form,
  onChange,
  errors,
  onSave,
  result,
  onClear,
  presetCurveParams,
}: {
  form: {
    curveKind: CurveObstacleKind
    radiusM: string
    angleDeg: string
    entranceWidthM: string
    exitWidthM: string
    effectiveWidthM: string
    source: CurveMeasurementSource
    notes: string
  }
  onChange: (f: typeof form) => void
  errors: string[]
  onSave: () => void
  result: CurveParameterMeasurementResult | null
  onClear: () => void
  presetCurveParams?: {
    radiusM?: number
    angleDeg?: number
    entranceWidthM?: number
    exitWidthM?: number
  }
}) {
  const hasPreset =
    presetCurveParams &&
    (presetCurveParams.radiusM ||
      presetCurveParams.angleDeg ||
      presetCurveParams.entranceWidthM ||
      presetCurveParams.exitWidthM)

  const handleFillPreset = () => {
    if (!presetCurveParams) return
    onChange({
      ...form,
      radiusM: presetCurveParams.radiusM
        ? String(presetCurveParams.radiusM)
        : form.radiusM,
      angleDeg: presetCurveParams.angleDeg
        ? String(presetCurveParams.angleDeg)
        : form.angleDeg,
      entranceWidthM: presetCurveParams.entranceWidthM
        ? String(presetCurveParams.entranceWidthM)
        : form.entranceWidthM,
      exitWidthM: presetCurveParams.exitWidthM
        ? String(presetCurveParams.exitWidthM)
        : form.exitWidthM,
      source: 'teaching_config',
    })
  }

  return (
    <div data-testid="curve-parameter-form">
      <div style={{ marginBottom: '8px' }}>
        <strong style={{ fontSize: '12px' }}>弯道类型：</strong>
        <span
          data-testid="curve-kind"
          style={{ fontSize: '13px', marginLeft: '4px' }}
        >
          {CURVE_OBSTACLE_KIND_LABELS[form.curveKind] ?? form.curveKind}
        </span>
        <div
          data-testid="curve-kind-description"
          style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}
        >
          {CURVE_KIND_DESCRIPTIONS[form.curveKind] ?? ''}
        </div>
      </div>

      {hasPreset && (
        <button
          data-testid="btn-fill-preset-curve"
          onClick={handleFillPreset}
          style={{
            padding: '4px 12px',
            borderRadius: '4px',
            border: '1px solid #1976d2',
            background: '#e3f2fd',
            cursor: 'pointer',
            fontSize: '11px',
            marginBottom: '8px',
          }}
        >
          从教学配置填入
        </button>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <label style={formLabelStyle}>
          <span>半径 (m) *</span>
          <input
            data-testid="curve-radius-input"
            type="number"
            step="0.01"
            min="0.01"
            value={form.radiusM}
            onChange={(e) => onChange({ ...form, radiusM: e.target.value })}
            style={formInputStyle}
            placeholder="弯道半径"
          />
        </label>
        <label style={formLabelStyle}>
          <span>夹角 (°) *</span>
          <input
            data-testid="curve-angle-input"
            type="number"
            step="0.01"
            min="0.01"
            max="180"
            value={form.angleDeg}
            onChange={(e) => onChange({ ...form, angleDeg: e.target.value })}
            style={formInputStyle}
            placeholder="弯道夹角"
          />
        </label>
        <label style={formLabelStyle}>
          <span>入口宽度 (m) *</span>
          <input
            data-testid="curve-entrance-input"
            type="number"
            step="0.01"
            min="0.01"
            value={form.entranceWidthM}
            onChange={(e) =>
              onChange({ ...form, entranceWidthM: e.target.value })
            }
            style={formInputStyle}
            placeholder="入口路面宽度"
          />
        </label>
        <label style={formLabelStyle}>
          <span>出口宽度 (m) *</span>
          <input
            data-testid="curve-exit-input"
            type="number"
            step="0.01"
            min="0.01"
            value={form.exitWidthM}
            onChange={(e) => onChange({ ...form, exitWidthM: e.target.value })}
            style={formInputStyle}
            placeholder="出口路面宽度"
          />
        </label>
        <label style={formLabelStyle}>
          <span>有效宽度 (m)</span>
          <input
            data-testid="curve-effective-input"
            type="number"
            step="0.01"
            min="0.01"
            value={form.effectiveWidthM}
            onChange={(e) =>
              onChange({ ...form, effectiveWidthM: e.target.value })
            }
            style={formInputStyle}
            placeholder="可选"
          />
        </label>
        <label style={formLabelStyle}>
          <span>参数来源</span>
          <select
            data-testid="curve-source-select"
            value={form.source}
            onChange={(e) =>
              onChange({
                ...form,
                source: e.target.value as CurveMeasurementSource,
              })
            }
            style={formInputStyle}
          >
            <option value="manual_input">手动录入</option>
            <option value="preset_point_pair">预设点位计算</option>
            <option value="teaching_config">教学配置</option>
          </select>
        </label>
      </div>

      <label
        style={{ ...formLabelStyle, marginBottom: '8px', display: 'block' }}
      >
        <span>备注</span>
        <textarea
          data-testid="curve-notes-input"
          value={form.notes}
          onChange={(e) => onChange({ ...form, notes: e.target.value })}
          style={{
            ...formInputStyle,
            width: '100%',
            minHeight: '48px',
            resize: 'vertical',
          }}
          placeholder="可选备注"
        />
      </label>

      {errors.length > 0 && (
        <div data-testid="curve-errors" style={curveErrorStyle}>
          {errors.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          data-testid="btn-save-curve"
          onClick={onSave}
          style={saveBtnStyle}
        >
          保存弯道参数
        </button>
        {result && (
          <button
            data-testid="btn-retake-curve"
            onClick={onClear}
            style={clearBtnStyle}
          >
            重测
          </button>
        )}
      </div>

      {result && (
        <div data-testid="curve-result" style={curveResultBoxStyle}>
          <div
            style={{
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '4px',
            }}
          >
            弯道参数测量结果
          </div>
          <div data-testid="curve-result-radius" style={curveParamRowStyle}>
            <span style={curveParamLabelStyle}>半径：</span>
            <span style={curveParamValueStyle}>{result.radiusM} m</span>
          </div>
          <div data-testid="curve-result-angle" style={curveParamRowStyle}>
            <span style={curveParamLabelStyle}>夹角：</span>
            <span style={curveParamValueStyle}>{result.angleDeg}°</span>
          </div>
          <div data-testid="curve-result-entrance" style={curveParamRowStyle}>
            <span style={curveParamLabelStyle}>入口宽度：</span>
            <span style={curveParamValueStyle}>{result.entranceWidthM} m</span>
          </div>
          <div data-testid="curve-result-exit" style={curveParamRowStyle}>
            <span style={curveParamLabelStyle}>出口宽度：</span>
            <span style={curveParamValueStyle}>{result.exitWidthM} m</span>
          </div>
          {result.effectiveWidthM !== undefined && (
            <div
              data-testid="curve-result-effective"
              style={curveParamRowStyle}
            >
              <span style={curveParamLabelStyle}>有效宽度：</span>
              <span style={curveParamValueStyle}>
                {result.effectiveWidthM} m
              </span>
            </div>
          )}
          <div
            data-testid="curve-result-object"
            style={{ fontSize: '13px', marginTop: '8px' }}
          >
            测量对象：{result.targetLabel}
          </div>
          <div
            data-testid="curve-result-source"
            style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}
          >
            参数来源：
            {CURVE_MEASUREMENT_SOURCE_LABELS[result.source] ?? result.source}
          </div>
          <div
            data-testid="curve-result-kind"
            style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}
          >
            弯道类型：
            {CURVE_OBSTACLE_KIND_LABELS[result.curveKind] ?? result.curveKind}
          </div>
        </div>
      )}
    </div>
  )
}

function BridgeInfoForm({
  obstacle,
  form,
  onChange,
  errors,
  onSave,
  result,
  onClear,
}: {
  obstacle: RouteObstacle
  form: {
    bridgeKind: BridgeKind
    loadLimitT: string
    deckWidthM: string
    bridgeLengthM: string
    clearanceHeightM: string
    laneCount: string
    deckCondition: BridgeDeckCondition
    allowMeeting: boolean
    source: BridgeParameterSource
    notes: string
  }
  onChange: (f: typeof form) => void
  errors: string[]
  onSave: () => void
  result: BridgeInfoMeasurementResult | null
  onClear: () => void
}) {
  return (
    <div data-testid="bridge-info-form">
      <div
        data-testid="bridge-info-card"
        style={{
          padding: '12px',
          background: '#f5f5f5',
          borderRadius: '6px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}
        >
          {obstacle.name}
        </div>
        <div style={{ fontSize: '13px', color: '#333' }}>
          {obstacle.description}
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          类型：{ROUTE_OBSTACLE_TYPE_LABELS[obstacle.type] ?? obstacle.type} |
          风险：
          {obstacle.riskLevel === 'high'
            ? '高'
            : obstacle.riskLevel === 'medium'
              ? '中'
              : '低'}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#1565c0',
            marginTop: '4px',
            fontStyle: 'italic',
          }}
        >
          {obstacle.teachingNote}
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong style={{ fontSize: '12px' }}>桥梁类型：</strong>
        <span
          data-testid="bridge-kind"
          style={{ fontSize: '13px', marginLeft: '4px' }}
        >
          {BRIDGE_KIND_LABELS[form.bridgeKind] ?? form.bridgeKind}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <label style={formLabelStyle}>
          <span>限载值 (t) *</span>
          <input
            data-testid="bridge-load-limit-input"
            type="number"
            step="1"
            min={BRIDGE_LOAD_LIMIT_MIN}
            max={BRIDGE_LOAD_LIMIT_MAX}
            value={form.loadLimitT}
            onChange={(e) => onChange({ ...form, loadLimitT: e.target.value })}
            style={formInputStyle}
            placeholder={`${BRIDGE_LOAD_LIMIT_MIN}-${BRIDGE_LOAD_LIMIT_MAX}t`}
          />
          <span style={{ fontSize: '11px', color: '#999' }}>
            范围：{BRIDGE_LOAD_LIMIT_MIN}t - {BRIDGE_LOAD_LIMIT_MAX}t
          </span>
        </label>
        <label style={formLabelStyle}>
          <span>桥面宽度 (m) *</span>
          <input
            data-testid="bridge-deck-width-input"
            type="number"
            step="0.1"
            min={BRIDGE_DECK_WIDTH_MIN}
            max={BRIDGE_DECK_WIDTH_MAX}
            value={form.deckWidthM}
            onChange={(e) => onChange({ ...form, deckWidthM: e.target.value })}
            style={formInputStyle}
            placeholder={`${BRIDGE_DECK_WIDTH_MIN}-${BRIDGE_DECK_WIDTH_MAX}m`}
          />
          <span style={{ fontSize: '11px', color: '#999' }}>
            范围：{BRIDGE_DECK_WIDTH_MIN}m - {BRIDGE_DECK_WIDTH_MAX}m
          </span>
        </label>
        <label style={formLabelStyle}>
          <span>桥梁长度 (m) *</span>
          <input
            data-testid="bridge-length-input"
            type="number"
            step="1"
            min={BRIDGE_LENGTH_MIN}
            max={BRIDGE_LENGTH_MAX}
            value={form.bridgeLengthM}
            onChange={(e) =>
              onChange({ ...form, bridgeLengthM: e.target.value })
            }
            style={formInputStyle}
            placeholder={`${BRIDGE_LENGTH_MIN}-${BRIDGE_LENGTH_MAX}m`}
          />
          <span style={{ fontSize: '11px', color: '#999' }}>
            范围：{BRIDGE_LENGTH_MIN}m - {BRIDGE_LENGTH_MAX}m
          </span>
        </label>
        <label style={formLabelStyle}>
          <span>桥下净空 (m)</span>
          <input
            data-testid="bridge-clearance-input"
            type="number"
            step="0.1"
            min="0"
            value={form.clearanceHeightM}
            onChange={(e) =>
              onChange({ ...form, clearanceHeightM: e.target.value })
            }
            style={formInputStyle}
            placeholder="可选"
          />
        </label>
        <label style={formLabelStyle}>
          <span>车道数</span>
          <input
            data-testid="bridge-lane-count-input"
            type="number"
            step="1"
            min="1"
            max="8"
            value={form.laneCount}
            onChange={(e) => onChange({ ...form, laneCount: e.target.value })}
            style={formInputStyle}
            placeholder="可选"
          />
        </label>
        <label style={formLabelStyle}>
          <span>参数来源</span>
          <select
            data-testid="bridge-source-select"
            value={form.source}
            onChange={(e) =>
              onChange({
                ...form,
                source: e.target.value as BridgeParameterSource,
              })
            }
            style={formInputStyle}
          >
            <option value="manual_input">手动录入</option>
            <option value="field_sign">现场标牌</option>
            <option value="survey_document">资料查询</option>
            <option value="teacher_provided">教师给定</option>
            <option value="teaching_config">教学配置</option>
          </select>
        </label>
      </div>

      <label
        style={{ ...formLabelStyle, marginBottom: '8px', display: 'block' }}
      >
        <span>备注</span>
        <textarea
          data-testid="bridge-notes-input"
          value={form.notes}
          onChange={(e) => onChange({ ...form, notes: e.target.value })}
          style={{
            ...formInputStyle,
            width: '100%',
            minHeight: '48px',
            resize: 'vertical',
          }}
          placeholder="可选备注"
        />
      </label>

      {errors.length > 0 && (
        <div
          data-testid="bridge-errors"
          style={{
            padding: '8px',
            background: '#ffebee',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#c62828',
            marginTop: '8px',
          }}
        >
          {errors.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          data-testid="btn-save-bridge"
          onClick={onSave}
          style={{
            padding: '6px 16px',
            border: '1px solid #1976d2',
            borderRadius: '4px',
            background: '#1976d2',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          保存桥梁信息
        </button>
        {result && (
          <button
            data-testid="btn-clear-bridge"
            onClick={onClear}
            style={{
              padding: '6px 16px',
              border: '1px solid #d0d7de',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            重填
          </button>
        )}
      </div>

      {result && (
        <div
          data-testid="bridge-result"
          style={{
            padding: '12px',
            background: '#e8f5e9',
            borderRadius: '6px',
            marginTop: '12px',
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '4px',
            }}
          >
            桥梁信息保存结果
          </div>
          <div data-testid="bridge-result-name" style={{ fontSize: '13px' }}>
            桥梁名称：{result.bridgeName}
          </div>
          <div data-testid="bridge-result-kind" style={{ fontSize: '13px' }}>
            桥梁类型：
            {BRIDGE_KIND_LABELS[result.bridgeKind] ?? result.bridgeKind}
          </div>
          <div
            data-testid="bridge-result-load-limit"
            style={{ fontSize: '13px' }}
          >
            限载值：{result.loadLimitT} t
          </div>
          <div
            data-testid="bridge-result-deck-width"
            style={{ fontSize: '13px' }}
          >
            桥面宽度：{result.deckWidthM} m
          </div>
          <div data-testid="bridge-result-length" style={{ fontSize: '13px' }}>
            桥梁长度：{result.bridgeLengthM} m
          </div>
          {result.clearanceHeightM !== undefined && (
            <div
              data-testid="bridge-result-clearance"
              style={{ fontSize: '13px' }}
            >
              桥下净空：{result.clearanceHeightM} m
            </div>
          )}
          <div
            data-testid="bridge-result-source"
            style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}
          >
            参数来源：
            {BRIDGE_PARAMETER_SOURCE_LABELS[result.source] ?? result.source}
          </div>
          <div
            data-testid="bridge-result-object"
            style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}
          >
            测量对象：{result.targetLabel}
          </div>
        </div>
      )}
    </div>
  )
}

function HeightClearancePanel({
  routeId,
  obstacle,
}: {
  routeId: string
  obstacle: RouteObstacle
}) {
  const [clearanceHeight, setClearanceHeight] = useState('')
  const [totalHeight, setTotalHeight] = useState('')
  const [safetyMargin, setSafetyMargin] = useState('0')
  const [result, setResult] = useState<HeightClearanceRuleResult | null>(null)

  const handleEvaluate = () => {
    const input: HeightClearanceInput = {
      routeId,
      obstacleId: obstacle.id,
      obstacleName: obstacle.name,
      measuredClearanceHeightM: parseOptionalNumber(clearanceHeight),
      totalTransportHeightM: parseOptionalNumber(totalHeight),
      safetyMarginM: parseOptionalNumber(safetyMargin) ?? 0,
      measurementSource: 'manual_input',
    }
    setResult(evaluateHeightClearance(input))
  }

  return (
    <div data-testid="height-clearance-panel" style={rulePanelStyle}>
      <div style={ruleGridStyle}>
        <label style={formLabelStyle}>
          <span>限高值 (m)</span>
          <input
            data-testid="height-clearance-input"
            type="number"
            step="0.01"
            value={clearanceHeight}
            onChange={(e) => setClearanceHeight(e.target.value)}
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          <span>运输总高度 (m)</span>
          <input
            data-testid="height-transport-input"
            type="number"
            step="0.01"
            value={totalHeight}
            onChange={(e) => setTotalHeight(e.target.value)}
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          <span>安全余量 (m)</span>
          <input
            data-testid="height-margin-input"
            type="number"
            step="0.01"
            value={safetyMargin}
            onChange={(e) => setSafetyMargin(e.target.value)}
            style={formInputStyle}
          />
        </label>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          data-testid="btn-evaluate-height"
          onClick={handleEvaluate}
          style={saveBtnStyle}
        >
          检查通过性
        </button>
        {result && (
          <button
            data-testid="btn-clear-height-rule"
            onClick={() => setResult(null)}
            style={clearBtnStyle}
          >
            清除
          </button>
        )}
      </div>
      {result && (
        <div data-testid="height-clearance-result" style={ruleResultStyle}>
          <div data-testid="height-clearance-status">
            status: {result.status}
          </div>
          <div data-testid="height-clearance-reason">{result.reason}</div>
          {result.clearanceHeightM !== undefined && (
            <div data-testid="height-clearance-value">
              clearance: {result.clearanceHeightM.toFixed(2)} m
            </div>
          )}
          {result.totalTransportHeightM !== undefined && (
            <div data-testid="height-transport-value">
              transport: {result.totalTransportHeightM.toFixed(2)} m
            </div>
          )}
          {result.differenceM !== undefined && (
            <div data-testid="height-difference">
              margin: {result.differenceM.toFixed(2)} m
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CircularCurvePanel({
  routeId,
  obstacle,
}: {
  routeId: string
  obstacle: RouteObstacle
}) {
  const [vehicleLength, setVehicleLength] = useState('16')
  const [vehicleWidth, setVehicleWidth] = useState('2.55')
  const [minTurningRadius, setMinTurningRadius] = useState('12')
  const [curveRadius, setCurveRadius] = useState('')
  const [curveAngle, setCurveAngle] = useState('90')
  const [entranceWidth, setEntranceWidth] = useState('')
  const [exitWidth, setExitWidth] = useState('')
  const [safetyMargin, setSafetyMargin] = useState('0.3')
  const [result, setResult] = useState<CircularCurveClearanceResult | null>(
    null,
  )

  const handleEvaluate = () => {
    const input: CircularCurveClearanceInput = {
      routeId,
      obstacleId: obstacle.id,
      obstacleName: obstacle.name,
      curveKind: 'circular_curve',
      vehicle: {
        totalLengthM: parseRequiredNumber(vehicleLength),
        totalWidthM: parseRequiredNumber(vehicleWidth),
        minTurningRadiusM: parseRequiredNumber(minTurningRadius),
      },
      curve: {
        radiusM: parseRequiredNumber(curveRadius),
        angleDeg: parseRequiredNumber(curveAngle),
        entranceWidthM: parseRequiredNumber(entranceWidth),
        exitWidthM: parseRequiredNumber(exitWidth),
      },
      safetyMarginM: parseOptionalNumber(safetyMargin) ?? 0,
      measurementSource: 'manual_input',
    }
    setResult(evaluateCircularCurveClearance(input))
  }

  return (
    <div data-testid="circular-curve-panel" style={rulePanelStyle}>
      <div style={ruleGridStyle}>
        <label style={formLabelStyle}>
          <span>车辆总长 (m)</span>
          <input
            data-testid="curve-vehicle-length"
            type="number"
            step="0.01"
            value={vehicleLength}
            onChange={(e) => setVehicleLength(e.target.value)}
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          <span>车辆总宽 (m)</span>
          <input
            data-testid="curve-vehicle-width"
            type="number"
            step="0.01"
            value={vehicleWidth}
            onChange={(e) => setVehicleWidth(e.target.value)}
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          <span>最小转弯半径 (m)</span>
          <input
            data-testid="curve-min-radius"
            type="number"
            step="0.01"
            value={minTurningRadius}
            onChange={(e) => setMinTurningRadius(e.target.value)}
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          <span>弯道半径 (m)</span>
          <input
            data-testid="curve-clearance-radius"
            type="number"
            step="0.01"
            value={curveRadius}
            onChange={(e) => setCurveRadius(e.target.value)}
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          <span>弯道夹角 (deg)</span>
          <input
            data-testid="curve-clearance-angle"
            type="number"
            step="0.01"
            value={curveAngle}
            onChange={(e) => setCurveAngle(e.target.value)}
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          <span>入口宽度 (m)</span>
          <input
            data-testid="curve-clearance-entrance"
            type="number"
            step="0.01"
            value={entranceWidth}
            onChange={(e) => setEntranceWidth(e.target.value)}
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          <span>出口宽度 (m)</span>
          <input
            data-testid="curve-clearance-exit"
            type="number"
            step="0.01"
            value={exitWidth}
            onChange={(e) => setExitWidth(e.target.value)}
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          <span>安全余量 (m)</span>
          <input
            data-testid="curve-clearance-margin"
            type="number"
            step="0.01"
            value={safetyMargin}
            onChange={(e) => setSafetyMargin(e.target.value)}
            style={formInputStyle}
          />
        </label>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          data-testid="btn-evaluate-curve"
          onClick={handleEvaluate}
          style={saveBtnStyle}
        >
          检查通过性
        </button>
        {result && (
          <button
            data-testid="btn-clear-curve-rule"
            onClick={() => setResult(null)}
            style={clearBtnStyle}
          >
            清除
          </button>
        )}
      </div>
      {result && (
        <div data-testid="circular-curve-result" style={ruleResultStyle}>
          <div data-testid="circular-curve-status">status: {result.status}</div>
          <div data-testid="circular-curve-summary">{result.summary}</div>
          {result.radiusMarginM !== undefined && (
            <div data-testid="circular-curve-radius-margin">
              radius margin: {result.radiusMarginM.toFixed(2)} m
            </div>
          )}
          {result.widthMarginM !== undefined && (
            <div data-testid="circular-curve-width-margin">
              width margin: {result.widthMarginM.toFixed(2)} m
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BridgeBearingPanel({
  routeId,
  obstacle,
}: {
  routeId: string
  obstacle: RouteObstacle
}) {
  const [bridgeName, setBridgeName] = useState(obstacle.name)
  const [loadLimitT, setLoadLimitT] = useState('')
  const [totalMassT, setTotalMassT] = useState('180')
  const [axleLines, setAxleLines] = useState('12')
  const [singleAxleLineLimitT, setSingleAxleLineLimitT] = useState('18')
  const [safetyFactor, setSafetyFactor] = useState('1.1')
  const [result, setResult] = useState<BridgeBearingRuleResult | null>(null)

  const handleEvaluate = () => {
    const input: BridgeBearingInput = {
      routeId,
      obstacleId: obstacle.id,
      obstacleName: obstacle.name,
      bridge: {
        bridgeName,
        loadLimitT: parseRequiredNumber(loadLimitT),
        singleAxleLineLimitT: parseOptionalNumber(singleAxleLineLimitT),
      },
      vehicle: {
        totalMassT: parseRequiredNumber(totalMassT),
        axleLines: parseInt(axleLines) || 0,
      },
      safetyFactor: parseOptionalNumber(safetyFactor),
      measurementSource: 'manual_input',
    }
    setResult(evaluateBridgeBearing(input))
  }

  return (
    <div data-testid="bridge-bearing-panel" style={rulePanelStyle}>
      <div style={ruleGridStyle}>
        <label style={formLabelStyle}>
          <span>桥梁名称</span>
          <input
            data-testid="bearing-bridge-name-input"
            type="text"
            value={bridgeName}
            onChange={(e) => setBridgeName(e.target.value)}
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          <span>桥梁限载 (t)</span>
          <input
            data-testid="bearing-load-limit-input"
            type="number"
            step="0.01"
            value={loadLimitT}
            onChange={(e) => setLoadLimitT(e.target.value)}
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          <span>运输总质量 (t)</span>
          <input
            data-testid="bearing-total-mass-input"
            type="number"
            step="0.01"
            value={totalMassT}
            onChange={(e) => setTotalMassT(e.target.value)}
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          <span>轴线数</span>
          <input
            data-testid="bearing-axle-lines-input"
            type="number"
            step="1"
            value={axleLines}
            onChange={(e) => setAxleLines(e.target.value)}
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          <span>教学单轴线限值 (t)</span>
          <input
            data-testid="bearing-single-axle-limit-input"
            type="number"
            step="0.01"
            value={singleAxleLineLimitT}
            onChange={(e) => setSingleAxleLineLimitT(e.target.value)}
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          <span>安全系数</span>
          <input
            data-testid="bearing-safety-factor-input"
            type="number"
            step="0.01"
            value={safetyFactor}
            onChange={(e) => setSafetyFactor(e.target.value)}
            style={formInputStyle}
          />
        </label>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          data-testid="btn-evaluate-bearing"
          onClick={handleEvaluate}
          style={saveBtnStyle}
        >
          检查桥梁承载
        </button>
        {result && (
          <button
            data-testid="btn-clear-bearing-rule"
            onClick={() => setResult(null)}
            style={clearBtnStyle}
          >
            清除
          </button>
        )}
      </div>
      {result && (
        <div data-testid="bridge-bearing-result" style={ruleResultStyle}>
          <div
            data-testid="bearing-teaching-notice"
            style={{
              padding: '8px',
              background: '#fff3e0',
              borderRadius: '4px',
              fontSize: '12px',
              marginBottom: '8px',
              fontWeight: 'bold',
            }}
          >
            {TEACHING_SIMPLIFICATION_NOTICE}
          </div>
          <div data-testid="bearing-status">
            状态:{' '}
            {result.status === 'pass'
              ? '通过'
              : result.status === 'pass_with_warning'
                ? '边界通过'
                : result.status === 'fail'
                  ? '不通过'
                  : '缺参数'}
          </div>
          <div data-testid="bearing-summary">{result.summary}</div>
          {result.loadLimitT !== undefined && (
            <div data-testid="bearing-load-limit-value">
              桥梁限载: {result.loadLimitT.toFixed(2)} t
            </div>
          )}
          {result.totalMassT !== undefined && (
            <div data-testid="bearing-total-mass-value">
              运输总质量: {result.totalMassT.toFixed(2)} t
            </div>
          )}
          {result.averageAxleLineLoadT !== undefined && (
            <div data-testid="bearing-axle-load-value">
              平均单轴线载荷: {result.averageAxleLineLoadT.toFixed(2)} t/轴线
            </div>
          )}
          {result.singleAxleLineLimitT !== undefined && (
            <div data-testid="bearing-axle-limit-value">
              教学单轴线限值: {result.singleAxleLineLimitT.toFixed(2)} t/轴线
            </div>
          )}
          {result.totalLoadMarginT !== undefined && (
            <div data-testid="bearing-total-margin">
              总质量余量: {result.totalLoadMarginT.toFixed(2)} t
            </div>
          )}
          {result.axleLoadMarginT !== undefined && (
            <div data-testid="bearing-axle-margin">
              轴线载荷余量: {result.axleLoadMarginT.toFixed(2)} t
            </div>
          )}
          {result.calculationProcess.length > 0 && (
            <div
              data-testid="bearing-calculation-process"
              style={{
                fontSize: '12px',
                color: '#1565c0',
                marginTop: '8px',
                whiteSpace: 'pre-line',
                background: '#f5f5f5',
                padding: '8px',
                borderRadius: '4px',
              }}
            >
              {result.calculationProcess.join('\n')}
            </div>
          )}
          <div
            data-testid="bearing-next-action"
            style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}
          >
            建议：{result.nextAction}
          </div>
        </div>
      )}
    </div>
  )
}

function parseOptionalNumber(value: string): number | undefined {
  if (value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseRequiredNumber(value: string): number {
  return parseOptionalNumber(value) ?? 0
}
