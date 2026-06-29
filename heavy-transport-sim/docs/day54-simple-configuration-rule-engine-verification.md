# Day54 简单配车规则引擎验证记录

## 1. 基本信息

| 项目 | 内容 |
|---|---|
| 日期 | 2026-06-29 |
| Node版本 | v22.16.0 |
| npm版本 | 10.9.2 |
| 分支 | `ai-codex/week8-day54-simple-configuration-rule-engine` |
| 基线提交 | `45af2eb`（Day53 挂车轴线纵列选择） |
| Worktree路径 | `D:\Study\大件运输项目工作区\worktrees\week8-day54-simple-configuration-rule-engine` |

## 2. Day54 原始任务来源

126天计划文档第54天：

- **任务标题**：实现简单配车规则引擎
- **验收标准**：返回 `通过/不通过` 及人类可读原因

## 3. 读取的设计依据文件

| 文件 | 状态 |
|---|---|
| `大件运输虚拟仿真实验教学系统_单人复刻126天计划.md` | 已读取，确认Day54任务 |
| `docs/用户与场景.md` | 已读取 |
| `docs/六阶段实验主流程.md` | 已读取 |
| `docs/学生端信息架构.md` | 已读取 |
| `docs/六阶段低保真原型.md` | 已读取 |
| `docs/专业规则目录.md` | 已读取，VEH-001/002/003为配车相关规则 |
| `docs/唯一运输案例说明.md` | 已读取 |
| `heavy-transport-sim/docs/day53-trailer-axle-column-selection-verification.md` | 已读取 |

## 4. Day50 / Day51 / Day52 / Day53 前置状态

| 前置任务 | 分支 | 状态 | 说明 |
|---|---|---|---|
| Day50 车辆组合数据 | `ai-codex/week8-day50-vehicle-combination-data` | 已完成并合并 | `src/domain/vehicleCombinations.ts` 可用 |
| Day51 组合选择动画 | `ai-codex/week8-day51-combination-selection-animation` | 已完成并合并 | 选择组件和动画播放可用 |
| Day52 牵引车参数 | `ai-codex/week8-day52-tractor-parameters-comparison` | 已完成并合并 | `src/domain/tractors.ts` 可用 |
| Day53 挂车轴线纵列选择 | `ai-codex/week8-day53-trailer-axle-column-selection` | 已完成并合并 | `src/domain/trailerSelection.ts` 可用，含 `validateTrailerSelection` |

Day50-53 已合并至本分支基线。

## 5. 规则引擎实现

### 5.1 文件路径

| 文件 | 路径 | 说明 |
|---|---|---|
| 规则引擎核心 | `src/domain/configurationRules.ts` | 输入/输出类型、规则定义、评估函数 |
| 规则引擎测试 | `src/domain/configurationRules.test.ts` | 55个测试用例 |
| 规则结果页面 | `src/pages/configuration-rules/ConfigurationRulePage.tsx` | 配车方案检查页面 |
| 页面测试 | `src/pages/configuration-rules/ConfigurationRulePage.test.tsx` | 12个页面测试 |
| 路由 | `src/app/router.tsx` | 新增 `/student/configuration-rules` 路由 |

### 5.2 输入类型定义

```typescript
type SimpleConfigurationInput = {
  caseId: string
  cargo: { lengthM: number; widthM: number; heightM: number; weightT: number }
  vehicleCombinationId: string
  vehicleCombinationType: string
  tractorId: string
  trailerSelection: { axleLines: number; columns: number }
}
```

使用 Zod schema (`simpleConfigurationInputSchema`) 校验输入。

### 5.3 输出类型定义

```typescript
type ConfigurationRuleStatus = 'passed' | 'failed' | 'blocked'

type ConfigurationRuleCheckResult = {
  ruleId: string
  title: string
  status: ConfigurationRuleStatus
  reason: string
  teachingNote: string
  severity: 'info' | 'warning' | 'error'
}

type SimpleConfigurationEvaluationResult = {
  status: ConfigurationRuleStatus
  passed: boolean
  summary: string
  reasons: string[]
  checks: ConfigurationRuleCheckResult[]
  nextAction: string
}
```

### 5.4 校验 Schema

使用 Zod v4 的 `z.object()` 定义 `simpleConfigurationInputSchema`，校验规则：
- caseId 非空
- cargo.lengthM/widthM/heightM/weightT 均为正数
- vehicleCombinationId 非空
- tractorId 非空
- trailerSelection.axleLines/columns 为正整数

## 6. 规则说明

### 6.1 货物重量适配规则 (CFG-WEIGHT)

- **输入**：cargo.weightT, trailerSelection.axleLines, trailerSelection.columns
- **判断**：货物重量是否在挂车轴线/纵列组合的教学承载范围内
- **承载范围**：基于 `WEIGHT_LIMITS` 表，例如 10轴线2纵列 ≤200t, 16轴线3纵列 ≤500t
- **不通过时**：说明当前重量和允许范围，建议增加轴线数

### 6.2 货物尺寸适配规则 (CFG-DIMENSION)

- **输入**：cargo 长宽高, vehicleCombination 参数, trailerSelection
- **判断**：长宽高是否在组合推荐范围内，宽度是否在挂车教学宽度限制内
- **维度限制**：组合参数的 cargoLengthRangeM/cargoWidthRangeM/cargoHeightRangeM.max，以及挂车宽度限制表
- **不通过时**：说明具体是哪一项超限

### 6.3 牵引车动力适配规则 (CFG-TRACTOR-POWER)

- **输入**：tractorId, cargo.weightT
- **判断**：货物重量是否在牵引车教学牵引能力范围内
- **牵引能力**：6x6 ≤80t, 8x8 ≤150t
- **不通过时**：说明牵引车动力或牵引质量不足，建议改用更大动力牵引车

### 6.4 挂车轴线纵列合法性规则 (CFG-AXLE-COLUMN)

- **输入**：trailerSelection.axleLines, trailerSelection.columns
- **判断**：复用 Day53 的 `isCombinationAllowed()` 和 `getCombinationRule()`
- **不通过时**：复用 Day53 的非法组合原因
- **一致性**：与 Day53 `validateTrailerSelection` 使用同一 `AXLE_COLUMN_RULES` 数据源

### 6.5 基础完整性规则 (CFG-COMPLETENESS)

- **输入**：全部字段
- **判断**：caseId、组合方式、牵引车、货物参数、轴线数、纵列数是否完整
- **不通过时**：明确指出缺少哪些字段

## 7. 验证证据

### 7.1 通过案例

- **配置**：SPMT 16x3 + 8x8牵引车 + 100t货物
- **结果**：`status: 'passed'`, 所有5条规则通过
- **测试用例**：`configurationRules.test.ts` "Passing configuration" describe

### 7.2 不通过案例

- **超重**：168t货物 + 6轴线2纵列(上限120t) → CFG-WEIGHT failed
- **超尺寸**：20×5×6m + 半挂车10x2 → CFG-DIMENSION failed
- **牵引力不足**：168t + 6x6牵引车(上限80t) → CFG-TRACTOR-POWER failed
- **非法组合**：4轴线2纵列 → CFG-AXLE-COLUMN failed

### 7.3 缺参数案例

- **空组合方式**：`vehicleCombinationId: ''` → blocked/failed
- **空牵引车**：`tractorId: ''` → blocked/failed
- **零重量**：`weightT: 0` → blocked (schema校验失败)
- **null输入**：`evaluateSimpleConfiguration(null)` → blocked
- **空对象**：`evaluateSimpleConfiguration({})` → blocked

### 7.4 人类可读原因验证

每条规则的 `reason` 字段均包含具体数值和建议：
- `货物重量 200t 超出当前挂车 6轴线2纵列组合的教学承载上限 120t`
- `货物重量 168t 超出 6x6 重型牵引车 的教学牵引能力上限 80t`
- `缺少必要参数：组合方式、牵引车，请返回补全后再检查。`

## 8. Day53 校验复用说明

CFG-AXLE-COLUMN 规则直接调用 Day53 的 `isCombinationAllowed()` 和 `getCombinationRule()` 函数，使用同一 `AXLE_COLUMN_RULES` 数据源。非法组合的原因和教学说明与 Day53 保持一致。

## 9. 教学简化声明

页面底部显示：
> **教学简化声明：** 本规则为教学简化判断，用于虚拟仿真实验学习，不替代真实工程校核。

## 10. 未实现功能声明

- **未实现** Day55 配车选择、错误次数和修改次数记录
- **未实现** 教师端按时间顺序查看关键选择
- **未实现** 路线勘测、高度、弯道、坡度、桥梁通行规则
- **未实现** 真实轴载精确计算
- **未实现** 车组确定、装车、绑扎、运输动画
- **未实现** 自动评分扣分
- **未实现** 新数据库迁移或 RLS
- **未实现** 部署或生产发布

## 11. 新增/修改文件清单

| 文件 | 操作 |
|---|---|
| `heavy-transport-sim/src/domain/configurationRules.ts` | 新增 |
| `heavy-transport-sim/src/domain/configurationRules.test.ts` | 新增 |
| `heavy-transport-sim/src/pages/configuration-rules/ConfigurationRulePage.tsx` | 新增 |
| `heavy-transport-sim/src/pages/configuration-rules/ConfigurationRulePage.test.tsx` | 新增 |
| `heavy-transport-sim/src/app/router.tsx` | 修改（新增路由） |

## 12. 测试覆盖清单

| 场景 | 测试位置 | 状态 |
|---|---|---|
| 规则引擎可导入 | `configurationRules.test.ts` | 通过 |
| 合法输入返回通过 | `configurationRules.test.ts` | 通过 |
| 超重输入返回不通过 | `configurationRules.test.ts` | 通过 |
| 超尺寸返回不通过 | `configurationRules.test.ts` | 通过 |
| 牵引力不足返回不通过 | `configurationRules.test.ts` | 通过 |
| 非法轴线/纵列返回不通过 | `configurationRules.test.ts` | 通过 |
| 缺组合方式返回阻塞 | `configurationRules.test.ts` | 通过 |
| 缺牵引车返回阻塞 | `configurationRules.test.ts` | 通过 |
| 缺货物重量返回阻塞 | `configurationRules.test.ts` | 通过 |
| 每条规则有ruleId/status/reason/teachingNote | `configurationRules.test.ts` | 通过 |
| 通过结果有summary和nextAction | `configurationRules.test.ts` | 通过 |
| 不通过结果有修改建议 | `configurationRules.test.ts` | 通过 |
| Day53校验复用 | `configurationRules.test.ts` | 通过 |
| 页面展示通过结果 | `ConfigurationRulePage.test.tsx` | 通过 |
| 页面展示检查项 | `ConfigurationRulePage.test.tsx` | 通过 |
| 页面展示下一步 | `ConfigurationRulePage.test.tsx` | 通过 |
| 页面未检查前不显示结果 | `ConfigurationRulePage.test.tsx` | 通过 |
| 页面显示教学简化声明 | `ConfigurationRulePage.test.tsx` | 通过 |
| 页面不实现Day55日志 | `ConfigurationRulePage.test.tsx` | 通过 |
| 构建成功 | `npm run build` | 通过 |

## 13. 验证命令结果

| 命令 | 结果 |
|---|---|
| `npm ci` | 通过 |
| `npm run format:check` | 通过 |
| `npm run lint` | 通过 |
| `npm run test:run` | 通过（547 tests, 39 files） |
| `npm run test:e2e` | 通过（12 tests） |
| `npm run build` | 通过 |
| `git diff --check` | 通过（无空白错误） |

## 14. 新增依赖

无新增依赖。

## 15. 密钥检查

- 未提交 `.env` 或 `.env.local`
- 未包含 `SUPABASE_SERVICE_ROLE_KEY`、JWT secret、数据库密码
- 未包含真实 Supabase URL 或 key
- 验证记录中不包含真实密钥

## 16. C 盘残留检查

Git worktree 列表中无 C 盘项目残留。

## 17. 范围检查

- 未创建 PR
- 未合并 main
- 未执行 Day55 或后续功能
- 未部署

## 18. Day54 验收结论

Day54 简单配车规则引擎已完成。规则引擎可接收配车方案输入，逐条检查货物重量、货物尺寸、牵引车动力、挂车轴线纵列合法性和基础完整性，返回 `通过/不通过/阻塞` 结果及人类可读原因。页面可在 `/student/configuration-rules` 展示检查结果。所有测试通过，构建成功。
