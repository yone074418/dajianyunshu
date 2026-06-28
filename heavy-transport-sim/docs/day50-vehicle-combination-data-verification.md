# Day50 车辆组合数据验证记录

## 1. 基本信息

- 日期：2026-06-28
- 环境：Windows 11, PowerShell
- Node：v20.17.0
- npm：10.8.2

## 2. 基线信息

- 当前主线：main
- 来源分支：ai-codex/week8-day50-vehicle-combination-data
- 合入方式：仅挑入 Day50 车辆组合数据、页面、测试和验证文档，并适配当前 main 路由

## 3. 任务来源

- 126 天计划第 168 行：第50天 | 定义全挂、半挂、自行式轴线车组合数据 | 三类组合有参数、优缺点和演示配置

## 4. 前置状态

- Day49 周流程验收：通过 ✅

## 5. 车辆组合数据文件

- 路径：`src/domain/vehicleCombinations.ts`
- 包含：三类组合数据、类型、Zod 校验、访问函数

## 6. 三类组合清单

| ID                                 | 类型                | 名称             |
| ---------------------------------- | ------------------- | ---------------- |
| full_trailer_combination           | full_trailer        | 全挂车组合       |
| semi_trailer_combination           | semi_trailer        | 半挂车组合       |
| self_propelled_modular_transporter | self_propelled_axle | 自行式轴线车组合 |

## 7. 全挂组合

- 重量范围：10-80t
- 长度范围：4-12m
- 操作复杂度：高
- 优点：结构直观、挂车可独立停放、适合教学演示、组合拆分清晰
- 缺点：倒车难度高、路线通过性受限、驾驶配合要求高、摆动折叠风险
- 演示配置：simple_yard 场景、4 个组件布局、4 个动画步骤

## 8. 半挂组合

- 重量范围：20-120t
- 长度范围：6-16m
- 操作复杂度：中
- 优点：鞍座连接稳定、常见易理解、操作标准化、转弯倒车容易
- 缺点：超重适应性有限、轴载压力大、受限高影响、鞍座拆装需专业设备
- 演示配置：straight_road 场景、4 个组件布局、4 个动画步骤

## 9. 自行式轴线车组合

- 重量范围：50-500t
- 长度范围：5-20m
- 操作复杂度：高
- 优点：承载能力极强、轴线组合灵活、液压悬架调平、全轮转向机动性高
- 缺点：设备复杂、成本高、需专业团队、速度慢不适合长距离
- 演示配置：simple_yard 场景、5 个组件布局、4 个动画步骤

## 10. 测试覆盖

- `vehicleCombinations.test.ts` — 31 个测试
  - 三类组合齐全、类型合法、排序稳定
  - 参数范围合法、描述非空
  - 优点/缺点不少于 3 条
  - 演示配置完整
  - Zod 校验通过/失败
  - 访问函数正确
- `VehicleCombinationPage.test.tsx` — 10 个测试
  - 页面渲染、三类组合展示
  - 名称、重量范围、优缺点
  - 演示配置展开

## 11. 本地验证结果

| 命令                   | 结果                |
| ---------------------- | ------------------- |
| `npm run format:check` | ✅ 通过             |
| `npm run lint`         | ✅ 通过（0 errors） |
| `npm run test:run`     | ✅ 140 通过         |
| `npm run test:e2e`     | ✅ 10 通过          |
| `npm run build`        | ✅ 通过（4.45s）    |
| `git diff --check`     | ✅ 无错误           |

补充验证（合入当前 main 后）：

| 命令                                                                                                                                                                                  | 结果               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `npx vitest run src/domain/vehicleCombinations.test.ts src/pages/vehicle-combinations/VehicleCombinationPage.test.tsx src/app/router.test.tsx src/pages/teacher/TeacherPage.test.tsx` | ✅ 57 通过         |
| `npm run verify:week7`                                                                                                                                                                | ✅ 39 通过, 0 失败 |

## 12. 声明

- 未实现 Day51 组合选择和动画播放
- 未实现 Day52 或后续功能
- 未部署
- 未创建 PR
- 已适配并合入当前 main 工作线
