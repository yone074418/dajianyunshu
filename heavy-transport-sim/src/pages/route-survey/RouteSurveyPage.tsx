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
  type CurveObstacleKind,
  type CurveMeasurementSource,
  type CurveParameterMeasurementResult,
} from '../../domain/measurements'
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
        Day58 实现路线切换、导航和障碍列表。Day59 实现距离/高度测量，Day60
        实现坡度测量，Day61 实现弯道参数测量。
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

      <div style={teachingNoteStyle}>
        <strong>教学简化声明：</strong>
        本路线和障碍点数据为教学简化配置，不代表真实工程路线。Day59
        已实现距离/高度测量工具，Day60 已实现坡度测量，Day61
        已实现弯道参数测量（半径、夹角、入口/出口宽度）。
        桥梁信息查看和限载输入将在 Day62 实现。弯道通过性规则（圆弧弯道
        Day65、直交弯道 Day66）将在后续实现。
        本系统不做弯道是否可通过的最终判定。
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

  const activeTarget = targets.find((t) => t.id === activeTargetId) ?? null

  const handleTargetSelect = (targetId: string) => {
    setActiveTargetId(targetId)
    setSelectedPairIndex(null)
    setMeasurementResult(null)
    setCurveResult(null)
    setCurveErrors([])
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
  }

  const handleCurveSave = () => {
    if (!activeTarget) return
    const errs: string[] = []
    const radius = parseFloat(curveForm.radiusM)
    const angle = parseFloat(curveForm.angleDeg)
    const entrance = parseFloat(curveForm.entranceWidthM)
    const exit = parseFloat(curveForm.exitWidthM)
    if (isNaN(radius) || radius <= 0) errs.push('半径必须大于 0')
    if (isNaN(angle) || angle <= 0 || angle > 180)
      errs.push('夹角必须大于 0 且小于等于 180')
    if (isNaN(entrance) || entrance <= 0) errs.push('入口宽度必须大于 0')
    if (isNaN(exit) || exit <= 0) errs.push('出口宽度必须大于 0')
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
      effectiveWidthM: curveForm.effectiveWidthM
        ? parseFloat(curveForm.effectiveWidthM)
        : undefined,
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

function CurveParameterForm({
  form,
  onChange,
  errors,
  onSave,
  result,
  onClear,
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
}) {
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
            min="0"
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
