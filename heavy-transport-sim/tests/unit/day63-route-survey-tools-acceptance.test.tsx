import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RouteSurveyPage from '../../pages/route-survey/RouteSurveyPage'
import { useRouteSurveyStore } from '../../stores/route-survey/routeSurveyStore'
import { SURVEY_ROUTES } from '../../domain/surveyRouteData'
import {} from '../../domain/measurements'

describe('Day63 周工具验收 - 五类障碍测量', () => {
  beforeEach(() => {
    localStorage.clear()
    useRouteSurveyStore.getState().reset()
  })

  describe('验收域1: 路线与障碍配置', () => {
    it('三条路线存在', () => {
      expect(SURVEY_ROUTES.length).toBeGreaterThanOrEqual(3)
    })

    it('每条路线有起点和终点', () => {
      for (const route of SURVEY_ROUTES) {
        expect(route.origin).toBeTruthy()
        expect(route.destination).toBeTruthy()
      }
    })

    it('每条路线有障碍点', () => {
      for (const route of SURVEY_ROUTES) {
        expect(route.obstacles.length).toBeGreaterThanOrEqual(2)
      }
    })

    it('每条路线至少包含两类不同障碍', () => {
      for (const route of SURVEY_ROUTES) {
        const types = new Set(route.obstacles.map((o) => o.type))
        expect(types.size).toBeGreaterThanOrEqual(2)
      }
    })

    it('全局覆盖五类障碍', () => {
      const allTypes = new Set(
        SURVEY_ROUTES.flatMap((r) => r.obstacles.map((o) => o.type)),
      )
      expect(allTypes.has('height_limit')).toBe(true)
      expect(allTypes.has('narrow_section')).toBe(true)
      expect(allTypes.has('slope')).toBe(true)
      expect(allTypes.has('curve')).toBe(true)
      expect(allTypes.has('bridge')).toBe(true)
    })

    it('每个障碍有完整属性', () => {
      for (const route of SURVEY_ROUTES) {
        for (const obs of route.obstacles) {
          expect(obs.id).toBeTruthy()
          expect(obs.routeId).toBeTruthy()
          expect(obs.type).toBeTruthy()
          expect(obs.name).toBeTruthy()
          expect(obs.position).toBeDefined()
          expect(obs.measurementTool).toBeTruthy()
          expect(obs.teachingNote).toBeTruthy()
          expect(obs.routeId).toBe(route.id)
        }
      }
    })
  })

  describe('验收域2: 路线切换和障碍列表', () => {
    it('路线勘测页面可访问', () => {
      render(<RouteSurveyPage />)
      expect(screen.getByTestId('route-survey-page')).toBeDefined()
    })

    it('三条路线导航全部显示', () => {
      render(<RouteSurveyPage />)
      for (const route of SURVEY_ROUTES) {
        expect(screen.getByTestId(`route-nav-${route.id}`)).toBeDefined()
      }
    })

    it('切换路线后障碍列表更新', () => {
      render(<RouteSurveyPage />)
      const routeA = SURVEY_ROUTES[0]
      const routeB = SURVEY_ROUTES[1]
      fireEvent.click(screen.getByTestId(`route-nav-${routeB.id}`))
      for (const obs of routeA.obstacles) {
        expect(screen.queryByTestId(`obstacle-item-${obs.id}`)).toBeNull()
      }
      for (const obs of routeB.obstacles) {
        expect(screen.getByTestId(`obstacle-item-${obs.id}`)).toBeDefined()
      }
    })

    it('切换路线不丢已测数据', () => {
      render(<RouteSurveyPage />)
      const routeA = SURVEY_ROUTES[0]
      const routeB = SURVEY_ROUTES[1]
      const obs = routeA.obstacles[0]
      fireEvent.click(screen.getByTestId(`obstacle-item-${obs.id}`))
      const targets = screen.getAllByTestId(/^target-/)
      fireEvent.click(targets[0])
      const presets = screen.getAllByTestId(/^preset-pair-/)
      fireEvent.click(presets[0])
      expect(screen.getByTestId('measurement-result')).toBeDefined()
      fireEvent.click(screen.getByTestId(`route-nav-${routeB.id}`))
      fireEvent.click(screen.getByTestId(`route-nav-${routeA.id}`))
      const status = useRouteSurveyStore
        .getState()
        .getObstacleMeasurementStatus(routeA.id, obs.id)
      expect(status).toBe('measured')
    })
  })

  describe('验收域3: 限高障碍高度测量', () => {
    it('限高障碍可完成高度测量', () => {
      render(<RouteSurveyPage />)
      const obs = SURVEY_ROUTES[0].obstacles.find(
        (o) => o.type === 'height_limit',
      )!
      fireEvent.click(screen.getByTestId(`obstacle-item-${obs.id}`))
      const targets = screen.getAllByTestId(/^target-/)
      fireEvent.click(targets[0])
      const presets = screen.getAllByTestId(/^preset-pair-/)
      fireEvent.click(presets[0])
      expect(screen.getByTestId('measurement-result')).toBeDefined()
      expect(screen.getByTestId('measurement-value').textContent).toContain('m')
      expect(screen.getByTestId('measurement-object').textContent).toContain(
        '测量对象',
      )
    })

    it('限高障碍测量写入已测状态', () => {
      render(<RouteSurveyPage />)
      const obs = SURVEY_ROUTES[0].obstacles.find(
        (o) => o.type === 'height_limit',
      )!
      fireEvent.click(screen.getByTestId(`obstacle-item-${obs.id}`))
      const targets = screen.getAllByTestId(/^target-/)
      fireEvent.click(targets[0])
      const presets = screen.getAllByTestId(/^preset-pair-/)
      fireEvent.click(presets[0])
      const status = useRouteSurveyStore
        .getState()
        .getObstacleMeasurementStatus(SURVEY_ROUTES[0].id, obs.id)
      expect(status).toBe('measured')
    })

    it('限高障碍可清除重测', () => {
      render(<RouteSurveyPage />)
      const obs = SURVEY_ROUTES[0].obstacles.find(
        (o) => o.type === 'height_limit',
      )!
      fireEvent.click(screen.getByTestId(`obstacle-item-${obs.id}`))
      const targets = screen.getAllByTestId(/^target-/)
      fireEvent.click(targets[0])
      const presets = screen.getAllByTestId(/^preset-pair-/)
      fireEvent.click(presets[0])
      fireEvent.click(screen.getByTestId('btn-clear-measurement'))
      expect(screen.queryByTestId('measurement-result')).toBeNull()
    })
  })

  describe('验收域4: 狭窄路段距离测量', () => {
    it('狭窄路段可完成距离测量', () => {
      render(<RouteSurveyPage />)
      const obs = SURVEY_ROUTES[0].obstacles.find(
        (o) => o.type === 'narrow_section',
      )!
      fireEvent.click(screen.getByTestId(`obstacle-item-${obs.id}`))
      const targets = screen.getAllByTestId(/^target-/)
      fireEvent.click(targets[0])
      const presets = screen.getAllByTestId(/^preset-pair-/)
      fireEvent.click(presets[0])
      expect(screen.getByTestId('measurement-result')).toBeDefined()
      expect(screen.getByTestId('measurement-value').textContent).toContain('m')
    })

    it('狭窄路段测量写入已测状态', () => {
      render(<RouteSurveyPage />)
      const obs = SURVEY_ROUTES[0].obstacles.find(
        (o) => o.type === 'narrow_section',
      )!
      fireEvent.click(screen.getByTestId(`obstacle-item-${obs.id}`))
      const targets = screen.getAllByTestId(/^target-/)
      fireEvent.click(targets[0])
      const presets = screen.getAllByTestId(/^preset-pair-/)
      fireEvent.click(presets[0])
      const status = useRouteSurveyStore
        .getState()
        .getObstacleMeasurementStatus(SURVEY_ROUTES[0].id, obs.id)
      expect(status).toBe('measured')
    })
  })

  describe('验收域5: 坡道障碍坡度测量', () => {
    it('坡道障碍可完成坡度测量', () => {
      render(<RouteSurveyPage />)
      fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[2].id}`))
      const obs = SURVEY_ROUTES[2].obstacles.find((o) => o.type === 'slope')!
      fireEvent.click(screen.getByTestId(`obstacle-item-${obs.id}`))
      const targets = screen.getAllByTestId(/^target-/)
      const slopeTarget = targets.find((b) => b.textContent?.includes('坡度'))
      expect(slopeTarget).toBeDefined()
      fireEvent.click(slopeTarget!)
      const presets = screen.getAllByTestId(/^preset-pair-/)
      fireEvent.click(presets[presets.length - 1])
      expect(screen.getByTestId('measurement-result')).toBeDefined()
      expect(screen.getByTestId('measurement-value').textContent).toContain('%')
      expect(screen.getByTestId('measurement-horizontal')).toBeDefined()
      expect(screen.getByTestId('measurement-vertical')).toBeDefined()
      expect(screen.getByTestId('measurement-process')).toBeDefined()
    })

    it('坡道测量写入已测状态', () => {
      render(<RouteSurveyPage />)
      fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[2].id}`))
      const obs = SURVEY_ROUTES[2].obstacles.find((o) => o.type === 'slope')!
      fireEvent.click(screen.getByTestId(`obstacle-item-${obs.id}`))
      const targets = screen.getAllByTestId(/^target-/)
      const slopeTarget = targets.find((b) => b.textContent?.includes('坡度'))
      fireEvent.click(slopeTarget!)
      const presets = screen.getAllByTestId(/^preset-pair-/)
      fireEvent.click(presets[presets.length - 1])
      const status = useRouteSurveyStore
        .getState()
        .getObstacleMeasurementStatus(SURVEY_ROUTES[2].id, obs.id)
      expect(status).toBe('measured')
    })
  })

  describe('验收域6: 弯道障碍参数测量', () => {
    it('弯道障碍可完成参数测量', () => {
      render(<RouteSurveyPage />)
      const obs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
      fireEvent.click(screen.getByTestId(`obstacle-item-${obs.id}`))
      const targets = screen.getAllByTestId(/^target-/)
      fireEvent.click(targets.find((b) => b.textContent?.includes('弯道参数'))!)
      fireEvent.change(screen.getByTestId('curve-radius-input'), {
        target: { value: '25' },
      })
      fireEvent.change(screen.getByTestId('curve-angle-input'), {
        target: { value: '90' },
      })
      fireEvent.change(screen.getByTestId('curve-entrance-input'), {
        target: { value: '6' },
      })
      fireEvent.change(screen.getByTestId('curve-exit-input'), {
        target: { value: '5.5' },
      })
      fireEvent.click(screen.getByTestId('btn-save-curve'))
      expect(screen.getByTestId('curve-result')).toBeDefined()
      expect(screen.getByTestId('curve-result-radius').textContent).toContain(
        'm',
      )
      expect(screen.getByTestId('curve-result-angle').textContent).toContain(
        '°',
      )
    })

    it('弯道参数写入已测状态', () => {
      render(<RouteSurveyPage />)
      const obs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
      fireEvent.click(screen.getByTestId(`obstacle-item-${obs.id}`))
      const targets = screen.getAllByTestId(/^target-/)
      fireEvent.click(targets.find((b) => b.textContent?.includes('弯道参数'))!)
      fireEvent.change(screen.getByTestId('curve-radius-input'), {
        target: { value: '25' },
      })
      fireEvent.change(screen.getByTestId('curve-angle-input'), {
        target: { value: '90' },
      })
      fireEvent.change(screen.getByTestId('curve-entrance-input'), {
        target: { value: '6' },
      })
      fireEvent.change(screen.getByTestId('curve-exit-input'), {
        target: { value: '5.5' },
      })
      fireEvent.click(screen.getByTestId('btn-save-curve'))
      const status = useRouteSurveyStore
        .getState()
        .getObstacleMeasurementStatus(SURVEY_ROUTES[0].id, obs.id)
      expect(status).toBe('measured')
    })

    it('弯道非法参数不能提交', () => {
      render(<RouteSurveyPage />)
      const obs = SURVEY_ROUTES[0].obstacles.find((o) => o.type === 'curve')!
      fireEvent.click(screen.getByTestId(`obstacle-item-${obs.id}`))
      const targets = screen.getAllByTestId(/^target-/)
      fireEvent.click(targets.find((b) => b.textContent?.includes('弯道参数'))!)
      fireEvent.change(screen.getByTestId('curve-radius-input'), {
        target: { value: '0' },
      })
      fireEvent.change(screen.getByTestId('curve-angle-input'), {
        target: { value: '90' },
      })
      fireEvent.change(screen.getByTestId('curve-entrance-input'), {
        target: { value: '6' },
      })
      fireEvent.change(screen.getByTestId('curve-exit-input'), {
        target: { value: '5.5' },
      })
      fireEvent.click(screen.getByTestId('btn-save-curve'))
      expect(screen.getByTestId('curve-errors')).toBeDefined()
    })
  })

  describe('验收域7: 桥梁障碍限载输入', () => {
    it('桥梁障碍可完成限载输入', () => {
      render(<RouteSurveyPage />)
      fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
      const obs = SURVEY_ROUTES[1].obstacles.find((o) => o.type === 'bridge')!
      fireEvent.click(screen.getByTestId(`obstacle-item-${obs.id}`))
      const targets = screen.getAllByTestId(/^target-/)
      fireEvent.click(targets.find((b) => b.textContent?.includes('桥梁信息'))!)
      expect(screen.getByTestId('bridge-info-card')).toBeDefined()
      fireEvent.change(screen.getByTestId('bridge-load-limit-input'), {
        target: { value: '200' },
      })
      fireEvent.change(screen.getByTestId('bridge-deck-width-input'), {
        target: { value: '8' },
      })
      fireEvent.change(screen.getByTestId('bridge-length-input'), {
        target: { value: '50' },
      })
      fireEvent.click(screen.getByTestId('btn-save-bridge'))
      expect(screen.getByTestId('bridge-result')).toBeDefined()
      expect(
        screen.getByTestId('bridge-result-load-limit').textContent,
      ).toContain('t')
    })

    it('桥梁限载写入已测状态', () => {
      render(<RouteSurveyPage />)
      fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
      const obs = SURVEY_ROUTES[1].obstacles.find((o) => o.type === 'bridge')!
      fireEvent.click(screen.getByTestId(`obstacle-item-${obs.id}`))
      const targets = screen.getAllByTestId(/^target-/)
      fireEvent.click(targets.find((b) => b.textContent?.includes('桥梁信息'))!)
      fireEvent.change(screen.getByTestId('bridge-load-limit-input'), {
        target: { value: '200' },
      })
      fireEvent.change(screen.getByTestId('bridge-deck-width-input'), {
        target: { value: '8' },
      })
      fireEvent.change(screen.getByTestId('bridge-length-input'), {
        target: { value: '50' },
      })
      fireEvent.click(screen.getByTestId('btn-save-bridge'))
      const status = useRouteSurveyStore
        .getState()
        .getObstacleMeasurementStatus(SURVEY_ROUTES[1].id, obs.id)
      expect(status).toBe('measured')
    })

    it('桥梁非法限载不能提交', () => {
      render(<RouteSurveyPage />)
      fireEvent.click(screen.getByTestId(`route-nav-${SURVEY_ROUTES[1].id}`))
      const obs = SURVEY_ROUTES[1].obstacles.find((o) => o.type === 'bridge')!
      fireEvent.click(screen.getByTestId(`obstacle-item-${obs.id}`))
      const targets = screen.getAllByTestId(/^target-/)
      fireEvent.click(targets.find((b) => b.textContent?.includes('桥梁信息'))!)
      fireEvent.change(screen.getByTestId('bridge-load-limit-input'), {
        target: { value: '3' },
      })
      fireEvent.change(screen.getByTestId('bridge-deck-width-input'), {
        target: { value: '8' },
      })
      fireEvent.change(screen.getByTestId('bridge-length-input'), {
        target: { value: '50' },
      })
      fireEvent.click(screen.getByTestId('btn-save-bridge'))
      expect(screen.getByTestId('bridge-errors')).toBeDefined()
    })
  })

  describe('验收域8: 页面不实现后续功能', () => {
    it('不实现 Day64 高度通过性规则', () => {
      render(<RouteSurveyPage />)
      expect(screen.queryByTestId('height-passability-result')).toBeNull()
    })

    it('不实现 Day65/66 弯道通过性规则', () => {
      render(<RouteSurveyPage />)
      expect(screen.queryByTestId('curve-passability-result')).toBeNull()
    })

    it('不实现 Day68 桥梁承载规则', () => {
      render(<RouteSurveyPage />)
      expect(screen.queryByTestId('bridge-load-rule-result')).toBeNull()
    })
  })
})
