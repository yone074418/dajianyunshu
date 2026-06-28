import { useMemo, useState } from 'react'
import {
  getLearningCategories,
  validateLearningContent,
  type LearningCategory,
} from '../../domain/learningContent'
import { useLearningProgress } from '../../domain/useLearningProgress'

type PageState =
  | { status: 'ready'; data: LearningCategory[] }
  | { status: 'empty' }
  | { status: 'validation_error'; message: string }
  | { status: 'error'; message: string }

function loadContent(): PageState {
  try {
    const raw = getLearningCategories()
    if (!raw || raw.length === 0) return { status: 'empty' }
    const data = validateLearningContent(raw)
    return { status: 'ready', data }
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return { status: 'validation_error', message: '知识内容数据校验失败。' }
    }
    return { status: 'error', message: '加载知识内容时发生错误。' }
  }
}

export default function LearningCenterPage() {
  const state = useMemo(() => loadContent(), [])
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)
  const {
    markChapterRead,
    isChapterRead,
    summary,
    categorySummary,
    status: progressStatus,
  } = useLearningProgress()

  if (state.status === 'empty') {
    return (
      <div
        data-testid="learning-empty"
        style={{ padding: '40px', textAlign: 'center' }}
      >
        <p style={{ color: '#c00' }}>未找到知识学习内容。</p>
      </div>
    )
  }

  if (state.status === 'validation_error' || state.status === 'error') {
    return (
      <div
        data-testid="learning-error"
        style={{ padding: '40px', textAlign: 'center' }}
      >
        <p style={{ color: '#c00' }}>{state.message}</p>
      </div>
    )
  }

  const { data } = state

  return (
    <div
      data-testid="learning-center-page"
      style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}
    >
      <h1>知识学习</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        请先学习以下五类大件运输知识，为后续实验操作做好准备。
      </p>

      <div
        data-testid="learning-progress-summary"
        style={{
          padding: '12px 16px',
          background: '#e8f0fe',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '14px',
        }}
      >
        学习进度：已读 {summary.readChapters} / {summary.totalChapters}
        {progressStatus === 'loading' && ' (加载中...)'}
      </div>

      {data.map((category) => {
        const catProgress = categorySummary.find(
          (c) => c.categoryId === category.id,
        )
        return (
          <section
            key={category.id}
            data-testid={`category-${category.id}`}
            style={{
              marginTop: '24px',
              padding: '20px',
              background: '#fff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
          >
            <h2>
              {category.title}
              <span
                data-testid={`category-progress-${category.id}`}
                style={{
                  fontSize: '13px',
                  fontWeight: 'normal',
                  color: '#666',
                  marginLeft: '12px',
                }}
              >
                (已读 {catProgress?.read ?? 0} / {catProgress?.total ?? 0})
              </span>
            </h2>
            <p style={{ color: '#666', fontSize: '14px' }}>
              {category.description}
            </p>

            <div style={{ marginTop: '12px' }}>
              {category.chapters.map((chapter) => {
                const read = isChapterRead(chapter.id)
                return (
                  <div
                    key={chapter.id}
                    data-testid={`chapter-${chapter.id}`}
                    style={{
                      marginTop: '12px',
                      padding: '16px',
                      background: read ? '#f0faf0' : '#f9f9f9',
                      borderRadius: '6px',
                      border: `1px solid ${read ? '#a0d0a0' : '#e8e8e8'}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{ cursor: 'pointer', flex: 1 }}
                        onClick={() =>
                          setExpandedChapter(
                            expandedChapter === chapter.id ? null : chapter.id,
                          )
                        }
                      >
                        <h3 style={{ margin: 0, fontSize: '16px' }}>
                          {chapter.title}
                          <span
                            data-testid={`chapter-status-${chapter.id}`}
                            style={{
                              fontSize: '12px',
                              marginLeft: '8px',
                              color: read ? '#2e7d32' : '#999',
                            }}
                          >
                            {read ? '已读' : '未读'}
                          </span>
                        </h3>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: '12px', color: '#888' }}>
                          约 {chapter.estimatedMinutes} 分钟
                        </span>
                        {!read && (
                          <button
                            data-testid={`mark-read-${chapter.id}`}
                            onClick={() => markChapterRead(chapter.id)}
                            style={{
                              padding: '4px 12px',
                              border: '1px solid #3d85c6',
                              borderRadius: '4px',
                              background: '#fff',
                              color: '#3d85c6',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            标记已读
                          </button>
                        )}
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#666',
                        marginTop: '8px',
                      }}
                    >
                      {chapter.summary}
                    </p>

                    {expandedChapter === chapter.id && (
                      <div style={{ marginTop: '12px' }}>
                        <div>
                          <strong>学习目标：</strong>
                          <ul>
                            {chapter.learningObjectives.map((obj, i) => (
                              <li key={i} style={{ fontSize: '13px' }}>
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong>关键概念：</strong>
                          <div
                            style={{
                              display: 'flex',
                              gap: '6px',
                              flexWrap: 'wrap',
                              marginTop: '4px',
                            }}
                          >
                            {chapter.keyConcepts.map((concept, i) => (
                              <span
                                key={i}
                                style={{
                                  padding: '2px 8px',
                                  background: '#e8f0fe',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  color: '#3d85c6',
                                }}
                              >
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div
                          style={{
                            marginTop: '12px',
                            fontSize: '13px',
                            lineHeight: '1.6',
                          }}
                        >
                          {chapter.content}
                        </div>
                        <div
                          style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            color: '#888',
                          }}
                        >
                          关联实验阶段：
                          {chapter.relatedExperimentStages.join('、')}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
