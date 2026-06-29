import { useMemo } from 'react'
import {
  getObstacleTypeSummary,
  validateSurveyRoutes,
  ROUTE_OBSTACLE_TYPE_LABELS,
  type SurveyRoute,
} from '../../domain/surveyRoutes'
import { getSurveyRoutes } from '../../domain/surveyRouteData'

export default function RouteSurveyPage() {
  const routes = useMemo(() => getSurveyRoutes(), [])
  const validation = useMemo(() => validateSurveyRoutes(routes), [routes])

  return (
    <div data-testid="route-survey-page" style={containerStyle}>
      <h1>路线勘测</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
        本模块展示三条候选运输路线及其障碍点配置。学生需要对每条路线的障碍进行测量和评估。
      </p>

      <div style={noteStyle}>
        <strong>说明：</strong>
        Day57 只搭建路线与障碍点配置。路线切换和测量工具将在 Day58—Day62
        逐步实现。
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

      <div style={{ marginTop: '24px' }}>
        <h2>候选路线概览</h2>
        <div style={routeGridStyle}>
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      </div>

      <div style={teachingNoteStyle}>
        <strong>教学简化声明：</strong>
        本路线和障碍点数据为教学简化配置，使用虚构地名，不代表真实工程路线。
        路线约束仅为教学演示，实际大件运输需依据现场勘测数据。
      </div>
    </div>
  )
}

function RouteCard({ route }: { route: SurveyRoute }) {
  const typeSummary = useMemo(() => getObstacleTypeSummary(route), [route])
  const obstacleTypes = useMemo(
    () => [...new Set(route.obstacles.map((o) => o.type))],
    [route],
  )

  return (
    <div data-testid={`route-card-${route.id}`} style={routeCardStyle}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{route.name}</h3>
      <p style={{ fontSize: '13px', color: '#555', margin: '0 0 12px 0' }}>
        {route.description}
      </p>

      <div style={{ fontSize: '13px', marginBottom: '8px' }}>
        <div>
          <strong>起点：</strong>
          {route.origin}
        </div>
        <div>
          <strong>终点：</strong>
          {route.destination}
        </div>
      </div>

      <div style={{ fontSize: '13px', marginBottom: '8px' }}>
        <strong>教学目标：</strong>
        {route.teachingGoal}
      </div>

      <div style={{ fontSize: '13px', marginBottom: '8px' }}>
        <strong>路线点位：</strong>
        {route.points.length} 个
      </div>

      <div style={{ fontSize: '13px', marginBottom: '8px' }}>
        <strong>障碍点：</strong>
        {route.obstacles.length} 个
      </div>

      <div style={{ fontSize: '13px', marginBottom: '8px' }}>
        <strong>障碍类型：</strong>
        {typeSummary}
      </div>

      <div style={{ marginTop: '12px' }}>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '14px' }}>障碍点清单</h4>
        {route.obstacles.map((obs) => (
          <div key={obs.id} style={obstacleItemStyle}>
            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
              {ROUTE_OBSTACLE_TYPE_LABELS[obs.type] ?? obs.type}：{obs.name}
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
              {obs.description}
            </div>
            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
              风险等级：
              {obs.riskLevel === 'high'
                ? '高'
                : obs.riskLevel === 'medium'
                  ? '中'
                  : '低'}
              {' | '}测量工具：{obs.measurementTool}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '8px',
          fontSize: '11px',
          color: obstacleTypes.length >= 2 ? '#2e7d32' : '#c62828',
        }}
      >
        {obstacleTypes.length >= 2
          ? `✓ 包含 ${obstacleTypes.length} 种不同障碍类型`
          : `✗ 只有 ${obstacleTypes.length} 种障碍类型，至少需要 2 种`}
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

const routeGridStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginTop: '12px',
}

const routeCardStyle: React.CSSProperties = {
  padding: '16px',
  background: '#fff',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
}

const obstacleItemStyle: React.CSSProperties = {
  padding: '8px',
  background: '#f5f5f5',
  borderRadius: '4px',
  marginBottom: '6px',
}

const teachingNoteStyle: React.CSSProperties = {
  marginTop: '32px',
  padding: '12px',
  background: '#fff3e0',
  borderRadius: '6px',
  fontSize: '12px',
}
