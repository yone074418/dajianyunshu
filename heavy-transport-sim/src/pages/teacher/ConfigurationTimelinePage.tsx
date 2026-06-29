import { useState, useMemo } from 'react'
import {
  LocalConfigurationLogRepository,
  getErrorCount,
  getModificationCount,
  getLastFailedLog,
  getLastModificationLog,
  sortLogsByTime,
  type ConfigurationChoiceLog,
} from '../../domain/configurationLogs'

const repository = new LocalConfigurationLogRepository()

const MOCK_ATTEMPT_ID = 'attempt-mock-001'

function loadInitialLogs(): ConfigurationChoiceLog[] {
  try {
    return repository.getByAttempt(MOCK_ATTEMPT_ID)
  } catch {
    return []
  }
}

export default function ConfigurationTimelinePage() {
  const [logs] = useState<ConfigurationChoiceLog[]>(loadInitialLogs)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const sortedLogs = useMemo(
    () => sortLogsByTime(logs, sortOrder),
    [logs, sortOrder],
  )

  const errorCount = useMemo(() => getErrorCount(logs), [logs])
  const modificationCount = useMemo(() => getModificationCount(logs), [logs])
  const lastFailed = useMemo(() => getLastFailedLog(logs), [logs])
  const lastModification = useMemo(() => getLastModificationLog(logs), [logs])

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  return (
    <div data-testid="configuration-timeline-page" style={containerStyle}>
      <h1>配车阶段操作时间线</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
        查看学生在简单配车阶段的所有关键选择、修改和规则检查记录。
      </p>

      <section data-testid="summary-cards" style={summarySectionStyle}>
        <SummaryCard
          title="错误次数"
          value={errorCount}
          color="#c62828"
          testId="error-count"
        />
        <SummaryCard
          title="修改次数"
          value={modificationCount}
          color="#e65100"
          testId="modification-count"
        />
        <div style={summaryCardStyle}>
          <div
            style={{
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '4px',
            }}
          >
            学生
          </div>
          <div style={{ fontSize: '13px', color: '#333' }}>测试学生</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            attempt: {MOCK_ATTEMPT_ID}
          </div>
        </div>
      </section>

      {lastFailed && (
        <section data-testid="last-failed" style={lastFailedStyle}>
          <strong>最后一次失败：</strong>
          {lastFailed.summary}
          {lastFailed.reason && ` — ${lastFailed.reason}`}
        </section>
      )}

      {lastModification && (
        <section data-testid="last-modification" style={lastModStyle}>
          <strong>最后一次修改：</strong>
          {lastModification.summary}
          {lastModification.before !== undefined &&
            lastModification.after !== undefined && (
              <span style={{ fontSize: '12px', color: '#666' }}>
                {' '}
                （{JSON.stringify(lastModification.before)} →{' '}
                {JSON.stringify(lastModification.after)}）
              </span>
            )}
        </section>
      )}

      <div style={{ marginTop: '16px', marginBottom: '8px' }}>
        <button
          data-testid="btn-toggle-sort"
          onClick={toggleSort}
          style={sortBtnStyle}
        >
          {sortOrder === 'asc' ? '按时间正序 ↑' : '按时间倒序 ↓'}
        </button>
      </div>

      {sortedLogs.length === 0 ? (
        <div data-testid="timeline-empty" style={emptyStyle}>
          暂无配车阶段操作记录。
        </div>
      ) : (
        <div data-testid="timeline-list" style={timelineStyle}>
          {sortedLogs.map((log, index) => (
            <TimelineItem
              key={log.id}
              log={log}
              index={index}
              isLast={index === sortedLogs.length - 1}
            />
          ))}
        </div>
      )}

      <div style={noteStyle}>
        <strong>说明：</strong>
        本时间线数据使用本地浏览器存储（localStorage），未接入真实数据库。
        刷新页面后数据仍可读取，但清除浏览器数据后将丢失。
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  color,
  testId,
}: {
  title: string
  value: number
  color: string
  testId: string
}) {
  return (
    <div data-testid={testId} style={summaryCardStyle}>
      <div
        style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}
      >
        {title}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>{value}</div>
    </div>
  )
}

function TimelineItem({
  log,
  index,
  isLast,
}: {
  log: ConfigurationChoiceLog
  index: number
  isLast: boolean
}) {
  const statusColor =
    log.resultStatus === 'passed'
      ? '#2e7d32'
      : log.resultStatus === 'failed'
        ? '#c62828'
        : log.resultStatus === 'blocked'
          ? '#e65100'
          : log.resultStatus === 'changed'
            ? '#1565c0'
            : '#1976d2'

  const statusLabel =
    log.resultStatus === 'passed'
      ? '通过'
      : log.resultStatus === 'failed'
        ? '不通过'
        : log.resultStatus === 'blocked'
          ? '阻塞'
          : log.resultStatus === 'changed'
            ? '已修改'
            : '已选择'

  const time = new Date(log.timestamp).toLocaleString('zh-CN')

  return (
    <div
      data-testid={`timeline-item-${index}`}
      style={{
        ...timelineItemStyle,
        borderLeft: `3px solid ${statusColor}`,
        opacity: isLast ? 1 : 0.95,
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
          {log.actionLabel}
        </span>
        <span
          style={{
            padding: '1px 6px',
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: 'bold',
            background: `${statusColor}15`,
            color: statusColor,
          }}
        >
          {statusLabel}
        </span>
      </div>
      <div style={{ marginTop: '4px', fontSize: '13px', color: '#333' }}>
        {log.summary}
      </div>
      {log.reason && (
        <div
          data-testid={`timeline-item-${index}-reason`}
          style={{ marginTop: '4px', fontSize: '12px', color: '#c62828' }}
        >
          原因：{log.reason}
        </div>
      )}
      {log.before !== undefined && log.after !== undefined && (
        <div
          data-testid={`timeline-item-${index}-before-after`}
          style={{ marginTop: '4px', fontSize: '12px', color: '#1565c0' }}
        >
          修改前：{JSON.stringify(log.before)} → 修改后：
          {JSON.stringify(log.after)}
        </div>
      )}
      {log.metadata?.errorCountAfter !== undefined && (
        <div style={{ marginTop: '2px', fontSize: '11px', color: '#999' }}>
          累计错误：{log.metadata.errorCountAfter}
        </div>
      )}
      {log.metadata?.modificationCountAfter !== undefined && (
        <div style={{ marginTop: '2px', fontSize: '11px', color: '#999' }}>
          累计修改：{log.metadata.modificationCountAfter}
        </div>
      )}
      <div style={{ marginTop: '4px', fontSize: '11px', color: '#999' }}>
        {time}
      </div>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  padding: '24px',
  maxWidth: '960px',
  margin: '0 auto',
}

const summarySectionStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '12px',
  marginBottom: '16px',
}

const summaryCardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '6px',
  padding: '12px',
  border: '1px solid #e0e0e0',
}

const lastFailedStyle: React.CSSProperties = {
  marginBottom: '8px',
  padding: '10px',
  background: '#ffebee',
  borderRadius: '6px',
  fontSize: '13px',
  color: '#c62828',
}

const lastModStyle: React.CSSProperties = {
  marginBottom: '16px',
  padding: '10px',
  background: '#e3f2fd',
  borderRadius: '6px',
  fontSize: '13px',
  color: '#1565c0',
}

const sortBtnStyle: React.CSSProperties = {
  padding: '6px 16px',
  border: '1px solid #d0d7de',
  borderRadius: '4px',
  background: '#fff',
  fontSize: '13px',
  cursor: 'pointer',
}

const emptyStyle: React.CSSProperties = {
  padding: '24px',
  textAlign: 'center',
  color: '#999',
  fontSize: '14px',
}

const timelineStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const timelineItemStyle: React.CSSProperties = {
  padding: '12px',
  background: '#fff',
  borderRadius: '4px',
  border: '1px solid #e0e0e0',
  marginLeft: '8px',
}

const noteStyle: React.CSSProperties = {
  marginTop: '32px',
  padding: '12px',
  background: '#fff3e0',
  borderRadius: '6px',
  fontSize: '12px',
}
