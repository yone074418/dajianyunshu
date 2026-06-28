import { useMemo, useState } from 'react'
import {
  getLearningCategories,
  validateLearningContent,
  type LearningCategory,
} from '../../domain/learningContent'

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
      <p style={{ color: '#999', fontSize: '12px' }}>
        注：学习进度保存功能将在后续版本中实现。
      </p>

      {data.map((category) => (
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
          <h2>{category.title}</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>
            {category.description}
          </p>

          <div style={{ marginTop: '12px' }}>
            <strong>学习目标：</strong>
            <ul>
              {category.objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: '12px' }}>
            <strong>章节列表：</strong>
            {category.chapters.map((chapter) => (
              <div
                key={chapter.id}
                data-testid={`chapter-${chapter.id}`}
                style={{
                  marginTop: '12px',
                  padding: '16px',
                  background: '#f9f9f9',
                  borderRadius: '6px',
                  border: '1px solid #e8e8e8',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    setExpandedChapter(
                      expandedChapter === chapter.id ? null : chapter.id,
                    )
                  }
                >
                  <h3 style={{ margin: 0, fontSize: '16px' }}>
                    {chapter.title}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#888' }}>
                    约 {chapter.estimatedMinutes} 分钟
                  </span>
                </div>
                <p
                  style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}
                >
                  {chapter.summary}
                </p>

                {expandedChapter === chapter.id && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ marginTop: '8px' }}>
                      <strong>学习目标：</strong>
                      <ul>
                        {chapter.learningObjectives.map((obj, i) => (
                          <li key={i} style={{ fontSize: '13px' }}>
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ marginTop: '8px' }}>
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
                      关联实验阶段：{chapter.relatedExperimentStages.join('、')}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
