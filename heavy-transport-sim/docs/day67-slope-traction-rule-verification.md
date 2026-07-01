# Day67 坡道牵引力教学规则验证记录

## 1. 基本信息

| 项目 | 内容 |
|---|---|
| 日期 | 2026-07-01 |
| Node版本 | v20.17.0 |
| npm版本 | 10.8.2 |
| 分支 | `ai-codex/week10-day67-slope-traction-rule` |
| 基线提交 | `12ae535`（整合Day63到Day65路线规则验收） |
| Worktree路径 | `D:\Study\大件运输项目工作区\worktrees\week10-day67-slope-traction-rule` |

## 2. Day67 原始任务

- **任务标题**：实现坡道牵引力教学规则
- **验收标准**：显示有效牵引力、阻力和是否满足
- **来源**：第195行

## 3. 前置状态

| 前置 | 状态 |
|---|---|
| Day57-Day63 | 已完成，已合并main |
| Day64 高度通过性规则 | 已完成，已合并main |
| Day65 圆弧弯道通过性规则 | 已完成，已合并main |
| Day66 直交弯道通过性规则 | 已完成，已合并main |

## 4. 读取的设计依据文件

| 文件 | 状态 |
|---|---|
| `大件运输虚拟仿真实验教学系统_单人复刻126天计划.md` | 已读取，确认Day67任务 |
| `docs/用户与场景.md` | 已读取 |
| `docs/六阶段实验主流程.md` | 已读取 |
| `docs/学生端信息架构.md` | 已读取 |
| `docs/六阶段低保真原型.md` | 已读取 |
| `docs/通用功能与页面清单.md` | 已读取 |
| `docs/专业规则目录.md` | 已读取，确认SLP-001至SLP-004规则 |
| `docs/唯一运输案例说明.md` | 已读取，确认案例参数 |
| `heavy-transport-sim/docs/day64-height-clearance-rule-verification.md` | 已读取 |
| `heavy-transport-sim/docs/day65-circular-curve-clearance-rule-verification.md` | 已读取 |
| `heavy-transport-sim/docs/day66-right-angle-curve-clearance-rule-verification.md` | 已读取 |

## 5. Day57—Day66 前置状态说明

| 前置任务 | 状态 | 说明 |
|---|---|---|
| Day57 路线场景与障碍配置 | 已完成 | 三条路线和障碍点已配置 |
| Day58 路线切换导航障碍列表 | 已完成 | 路线切换功能可用 |
| Day59 距离/高度测量工具 | 已完成 | 测量工具可用 |
| Day60 坡度测量工具 | 已完成 | 坡度测量可用，slopePercent可获取 |
| Day61 弯道参数测量 | 已完成 | 弯道参数测量可用 |
| Day62 桥梁信息查看 | 已完成 | 桥梁信息可用 |
| Day63 路线勘测工具验收 | 已完成 | 工具验收通过 |
| Day64 高度通过性规则 | 已完成 | HeightClearancePanel已实现 |
| Day65 圆弧弯道通过性规则 | 已完成 | CircularCurvePanel已实现 |
| Day66 直交弯道通过性规则 | 已完成 | RightAngleCurvePanel已实现 |

## 6. 实现文件清单

| 文件 | 操作 |
|---|---|
| `src/domain/slopeTraction.ts` | 新增 - 坡道牵引力教学规则引擎 |
| `src/domain/slopeTraction.test.ts` | 新增 - 48个测试 |
| `src/pages/route-survey/RouteSurveyPage.tsx` | 修改 - 新增SlopeTractionPanel |
| `docs/day67-slope-traction-rule-verification.md` | 新增 - 验证记录 |

## 7. 规则引擎

- **输入类型**：`SlopeTractionInput`（Zod schema）
- **输出类型**：`SlopeTractionRuleResult`
- **Schema校验路径**：`src/domain/slopeTraction.ts` 中 `slopeTractionInputSchema`
- **评估函数**：`evaluateSlopeTraction(input)`
- **校验函数**：`validateSlopeTractionInput(input)`
- **计算函数**：
  - `calculateSlopePercentFromDistances(hDist, vDist)` - 从距离计算坡度
  - `calculateEffectiveTractionForce(input)` - 计算有效牵引力
  - `calculateGradeResistance(massT, slopePercent)` - 计算坡道阻力
  - `calculateRollingResistance(massT, coeff)` - 计算滚动阻力
  - `calculateTotalSlopeResistance(grade, rolling, safetyFactor)` - 计算总阻力
- **格式化函数**：`formatSlopeTractionReason(result)`

## 8. 教学简化计算规则

```
有效牵引力(kN) = 牵引车数量 × 单车牵引力(kN) × 传动效率
坡道阻力(kN) = 总质量(t) × 9.8 × 坡度百分比 / 100
滚动阻力(kN) = 总质量(t) × 9.8 × 滚动阻力系数
总阻力(kN) = (坡道阻力 + 滚动阻力) × 安全系数
有效牵引力 >= 总阻力：满足
有效牵引力 < 总阻力：不满足
```

## 9. 核心验证结果

### 有效牵引力计算正确
- 输入：2台牵引车，单车300kN，效率0.85
- 结果：有效牵引力 = 2 × 300 × 0.85 = 510 kN
- 测试：`calculates traction force correctly` ✅

### 坡道阻力计算正确
- 输入：总质量200t，坡度7.5%
- 结果：坡道阻力 = 200 × 9.8 × 7.5 / 100 = 147 kN
- 测试：`calculates grade resistance correctly` ✅

### 滚动阻力计算正确
- 输入：总质量200t，滚动阻力系数0.015
- 结果：滚动阻力 = 200 × 9.8 × 0.015 = 29.4 kN
- 测试：`calculates rolling resistance correctly` ✅

### 总阻力计算正确
- 输入：坡道阻力147kN，滚动阻力29.4kN，安全系数1.1
- 结果：总阻力 = (147 + 29.4) × 1.1 = 194.04 kN
- 测试：`calculates total resistance with safety factor` ✅

### 有效牵引力大于总阻力 → 满足
- 测试：`returns pass when traction exceeds resistance` ✅

### 有效牵引力等于总阻力 → 边界满足
- 测试：`returns pass_with_warning when traction equals resistance` ✅

### 有效牵引力小于总阻力 → 不满足
- 测试：`returns fail when traction is less than resistance` ✅

### 坡度为0时坡道阻力为0
- 测试：`handles slope of 0 correctly` ✅

### 缺少坡度 → 阻塞
- 测试：`returns blocked when slopePercent missing` ✅

### 缺少总质量 → 阻塞
- 测试：`returns blocked when totalMassT missing` ✅

### 缺少牵引车数量 → 阻塞
- 测试：`returns blocked when tractorCount missing` ✅

### 缺少单车牵引力 → 阻塞
- 测试：`returns blocked when tractionForcePerTractorKN missing` ✅

### drivetrainEfficiency为0 → 非法参数
- 测试：`returns blocked for drivetrainEfficiency of 0` ✅

### drivetrainEfficiency > 1 → 非法参数
- 测试：`returns blocked for drivetrainEfficiency > 1` ✅

### rollingResistanceCoefficient为负数 → 非法参数
- 测试：`returns blocked for negative rollingResistanceCoefficient` ✅

### safetyFactor为0 → 非法参数
- 测试：`returns blocked for safetyFactor of 0` ✅

### NaN/Infinity不导致NaN输出
- 测试：`handles NaN without producing NaN in output` ✅
- 测试：`handles Infinity gracefully` ✅

### 每个结果都有summary/reasons/teachingNote/nextAction
- 测试：`every result has summary, reasons, teachingNote, nextAction` ✅

### 每个结果都有calculationProcess
- 测试：`every result has calculationProcess` ✅

### 显示有效牵引力
- 测试：`displays effectiveTractionKN in result` ✅

### 显示阻力
- 测试：`displays gradeResistanceKN in result` ✅
- 测试：`displays totalResistanceKN in result` ✅

### 显示是否满足
- 测试：`returns pass when traction exceeds resistance` ✅
- 测试：`returns fail when traction is less than resistance` ✅

### 从距离计算坡度
- 测试：`calculates slope percent correctly` ✅
- 测试：`calculates slopePercent from distances when not provided` ✅

## 10. 页面面板

- **路径**：`RouteSurveyPage.tsx` 中 `SlopeTractionPanel`
- **触发**：选择 `slope` 类型障碍时显示
- **元素**：
  - 坡度输入
  - 总质量输入
  - 牵引车数量输入
  - 单车牵引力输入
  - 传动效率输入
  - 滚动阻力系数输入
  - 安全系数输入
  - 检查按钮
  - 结果面板（显示状态、摘要、有效牵引力、坡道阻力、滚动阻力、总阻力、牵引力余量、计算过程、教学说明、建议）

## 11. 人类可读原因验证

### 满足文案示例
```
当前有效牵引力 510.00 kN，总阻力 194.04 kN，牵引力余量 315.96 kN。按教学简化规则，该坡道牵引力满足要求。
```

### 不满足文案示例
```
当前有效牵引力 170.00 kN，小于校核总阻力 2695.00 kN，牵引力不足 2525.00 kN。建议增加牵引车数量、降低总质量、选择坡度更小的路线或重新配置车组。
```

### 缺参数文案示例
```
缺少坡度百分比，无法判断坡道牵引力是否满足。请先完成坡度测量或补充车辆参数。
```

## 12. 教学简化声明

本规则为教学简化规则，基于车辆总质量、牵引车数量和单车牵引力与坡道参数进行比较，不替代真实车辆动力学仿真或工程牵引校核。

## 13. 数据来源证明

规则数据不在JSX中硬编码的证据：
1. 输入类型定义在 `src/domain/slopeTraction.ts` 中，使用Zod schema独立定义
2. 规则计算逻辑在独立的 `evaluateSlopeTraction()` 函数中
3. 页面面板 `SlopeTractionPanel` 仅负责UI渲染和用户交互，调用独立的规则引擎
4. 所有计算参数通过函数参数传入，不依赖组件内部硬编码值

## 14. 未实现功能声明

- **未实现 Day68 桥梁承载规则**：规则ID为 `slope_traction`，不包含桥梁承载判断
- **未实现 Day69 路线建议生成**：不包含路线建议功能
- **未实现真实车辆动力学仿真**：仅使用教学简化公式
- **未实现真实发动机扭矩曲线**：仅使用简化单车牵引力
- **未实现真实轮胎附着系数复杂计算**：仅使用教学配置值

## 15. 本地验证结果

| 命令 | 结果 |
|---|---|
| `format:check` | ✅ 通过 |
| `lint` | ✅ 0 errors |
| `test:run` | ✅ 843 passed (49 files) |
| `test:e2e` | ✅ 12 passed |
| `build` | ✅ 3.98s |
| `git diff --check` | ✅ 无空白错误 |

## 16. 新增依赖

无。

## 17. 测试覆盖清单

| 测试场景 | 状态 |
|---|---|
| 坡道牵引力规则可以被导入 | ✅ |
| 输入schema可以被导入 | ✅ |
| 输出结构可以被导入 | ✅ |
| 有效牵引力计算正确 | ✅ |
| 坡道阻力计算正确 | ✅ |
| 滚动阻力计算正确 | ✅ |
| 总阻力计算正确 | ✅ |
| 有效牵引力大于总阻力时返回满足 | ✅ |
| 有效牵引力等于总阻力时返回边界正确结果 | ✅ |
| 有效牵引力小于总阻力时返回不满足 | ✅ |
| 坡度为0时坡道阻力为0 | ✅ |
| 缺少坡度时返回阻塞 | ✅ |
| 缺少总质量时返回阻塞 | ✅ |
| 缺少牵引车数量时返回阻塞 | ✅ |
| 缺少单车牵引力时返回阻塞 | ✅ |
| drivetrainEfficiency为0时返回非法参数 | ✅ |
| drivetrainEfficiency > 1时返回非法参数 | ✅ |
| rollingResistanceCoefficient为负数时返回非法参数 | ✅ |
| safetyFactor为0时返回非法参数 | ✅ |
| NaN/Infinity不导致NaN输出 | ✅ |
| 每个结果都有summary/reasons/teachingNote/nextAction | ✅ |
| 每个结果都显示有效牵引力、阻力和是否满足 | ✅ |
| 页面能展示满足结果 | ✅ |
| 页面能展示不满足结果 | ✅ |
| 页面能展示缺参数结果 | ✅ |
| 页面不实现Day68桥梁承载规则 | ✅ |
| 页面不实现Day69路线建议生成 | ✅ |
| 构建成功 | ✅ |

## 18. 验收结论

Day67 通过。显示有效牵引力、阻力和是否满足。规则引擎实现了完整的输入校验、有效牵引力计算、坡道阻力计算、滚动阻力计算、总阻力计算和是否满足判断，并产生了人类可读的原因、计算过程和教学说明。
