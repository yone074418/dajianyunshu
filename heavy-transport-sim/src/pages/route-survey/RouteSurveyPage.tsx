import { useMemo, useEffect, useCallback } from 'react'
import {
  getObstacleTypeSummary,
  validateSurveyRoutes,
  ROUTE_OBSTACLE_TYPE_LABELS,
  type SurveyRoute,
  type RouteObstacle,
} from '../../domain/surveyRoutes'
import { getSurveyRoutes } from '../../domain/surveyRouteData'
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

      <div style={teachingNoteStyle}>
        <strong>教学简化声明：</strong>
        本路线和障碍点数据为教学简化配置，不代表真实工程路线。
        切换路线不丢失已测数据。测量工具将在 Day59—Day62 实现。
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
