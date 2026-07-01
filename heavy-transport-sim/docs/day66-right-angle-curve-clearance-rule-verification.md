# Day66 直交弯道通过性规则验证记录

## 1. 基本信息

| 项目 | 内容 |
|---|---|
| 日期 | 2026-07-01 |
| Node版本 | v20.17.0 |
| npm版本 | 10.8.2 |
| 分支 | `ai-codex/week10-day66-right-angle-curve-clearance-rule` |
| 基线提交 | `12ae535`（整合Day63到Day65路线规则验收） |
| Worktree路径 | `D:\Study\大件运输项目工作区\worktrees\week10-day66-right-angle-curve-clearance-rule` |

## 2. Day66 原始任务

- **任务标题**：实现直交弯道通过性规则
- **验收标准**：测量值与所需最小出口宽度比较正确
- **来源**：第194行

## 3. 前置状态

| 前置 | 状态 |
|---|---|
| Day57-Day63 | 已完成，已合并main |
| Day64 高度通过性规则 | 已完成，已合并main |
| Day65 圆弧弯道通过性规则 | 已完成，已合并main |

## 4. 读取的设计依据文件

| 文件 | 状态 |
|---|---|
| `大件运输虚拟仿真实验教学系统_单人复刻126天计划.md` | 已读取 |
| `docs/用户与场景.md` | 已读取 |
| `docs/六阶段实验主流程.md` | 已读取 |
| `docs/专业规则目录.md` | 已读取 |
| `heavy-transport-sim/docs/day64-height-clearance-rule-verification.md` | 已读取 |
| `heavy-transport-sim/docs/day65-circular-curve-clearance-rule-verification.md` | 已读取 |

## 5. 实现文件

| 文件 | 操作 |
|---|---|
| `src/domain/rightAngleCurveClearance.ts` | 新增 - 直交弯道通过性规则引擎 |
| `src/domain/rightAngleCurveClearance.test.ts` | 新增 - 51个测试 |
| `src/pages/route-survey/RouteSurveyPage.tsx` | 修改 - 新增RightAngleCurvePanel |
| `docs/day66-right-angle-curve-clearance-rule-verification.md` | 新增 - 验证记录 |

## 6. 规则引擎

- **输入类型**：`RightAngleCurveClearanceInput`（Zod schema）
- **输出类型**：`RightAngleCurveClearanceResult`
- **评估函数**：`evaluateRightAngleCurveClearance(input)`
- **校验函数**：`validateRightAngleCurveInput(input)`
- **计算函数**：
  - `calculateRequiredExitWidth(input)` - 计算所需最小出口宽度
  - `calculateEntranceWidthMargin(input)` - 计算入口宽度余量
  - `calculateExitWidthMargin(input)` - 计算出口宽度余量
- **格式化函数**：`formatRightAngleCurveReason(result)`

## 7. 教学简化规则

```
所需最小出口宽度 = 车辆总宽 + 安全余量 + 教学简化转弯外摆量
教学简化转弯外摆量 = max(0, 车辆总长 / 最小转弯半径 × 0.8)
入口宽度要求：入口宽度 >= 车辆总宽 + 安全余量
出口宽度要求：出口宽度 >= 所需最小出口宽度
角度要求：直交弯道夹角应在 80° 到 100° 的教学范围内
```

## 8. 核心验证结果

### 出口宽度大于所需最小出口宽度 → 通过
- 输入：出口宽度 8.0 m，所需最小出口宽度约 6.63 m
- 结果：`status: 'pass'`, `passed: true`
- 测试：`returns pass when exit width and entrance width sufficient` ✅

### 出口宽度等于所需最小出口宽度 → 边界警告通过
- 输入：出口宽度 = 所需最小出口宽度
- 结果：`status: 'pass_with_warning'`, `passed: true`
- 测试：`returns pass_with_warning when exit width equals required width` ✅

### 出口宽度小于所需最小出口宽度 → 不通过
- 输入：出口宽度 3.0 m，所需最小出口宽度约 6.63 m
- 结果：`status: 'fail'`, `passed: false`
- 测试：`returns fail when exit width insufficient` ✅

### 入口宽度充足 → 通过
- 输入：入口宽度 6.0 m，所需入口宽度 2.85 m
- 结果：入口检查通过
- 测试：`returns pass when exit width and entrance width sufficient` ✅

### 入口宽度不足 → 不通过
- 输入：入口宽度 2.0 m，所需入口宽度 2.85 m
- 结果：`status: 'fail'`, 入口检查失败
- 测试：`returns fail when entrance width insufficient` ✅

### 入口宽度等于所需宽度 → 边界警告通过
- 测试：`returns pass_with_warning when entrance width equals required width` ✅

### 转角有效宽度充足 → 通过
- 测试：`returns pass when exit width and entrance width sufficient` ✅

### 转角有效宽度不足 → 不通过
- 输入：转角有效宽度 3.0 m
- 结果：`status: 'fail'`, 转角检查失败
- 测试：`returns fail when corner effective width insufficient` ✅

### 转角有效宽度等于所需宽度 → 边界警告通过
- 测试：`returns pass_with_warning when corner effective width equals required width` ✅

### 夹角为 90° → 通过
- 测试：`returns pass when angle is 90 degrees` ✅

### 夹角偏离直交范围 → 警告或阻塞
- 84° → `pass_with_warning`（偏差6°）
- 75° → `fail`（偏差15°）
- 测试：`returns pass_with_warning when angle deviates slightly from 90` ✅
- 测试：`returns fail when angle deviates significantly from 90` ✅

### 缺少车辆总长 → 阻塞
- 测试：`returns blocked when vehicle totalLengthM missing` ✅

### 缺少车辆总宽 → 阻塞
- 测试：`returns blocked when vehicle totalWidthM missing` ✅

### 缺少最小转弯半径 → 阻塞
- 测试：`returns blocked when minTurningRadiusM missing` ✅

### 缺少入口宽度 → 阻塞
- 测试：`returns blocked when entranceWidthM missing` ✅

### 缺少出口宽度 → 阻塞
- 测试：`returns blocked when exitWidthM missing` ✅

### NaN/Infinity 不会导致结果出现 NaN
- 测试：`handles NaN without producing NaN in output` ✅
- 测试：`handles Infinity gracefully` ✅

### 每个结果都有 summary、reasons、teachingNote、nextAction
- 测试：`every result has summary, reasons, teachingNote, nextAction` ✅

### 每个检查都有 reason 和 teachingNote
- 测试：`every check has reason and teachingNote` ✅

## 9. 页面面板

- **路径**：`RouteSurveyPage.tsx` 中 `RightAngleCurvePanel`
- **触发**：选择 `curve` 类型障碍时显示（与圆弧弯道面板并列）
- **元素**：
  - 车辆总长输入
  - 车辆总宽输入
  - 最小转弯半径输入
  - 弯道夹角输入
  - 入口宽度输入
  - 出口宽度输入
  - 转角有效宽度输入（可选）
  - 安全余量输入
  - 检查按钮
  - 结果面板（显示状态、摘要、所需最小出口宽度、出口宽度余量、入口宽度余量、教学说明、建议）

## 10. 人类可读原因验证

### 通过文案示例
```
当前直交弯道出口宽度 8.00 m，教学简化所需最小出口宽度 6.63 m，余量 1.37 m；入口宽度满足车辆进入要求，判定为可通过。
```

### 不通过文案示例
```
出口宽度 3.00 m 小于教学简化所需最小出口宽度 6.63 m...
```

### 缺参数文案示例
```
缺少车辆总宽，无法判断直交弯道是否可通过。请先完成弯道参数测量或补充车辆参数。
```

## 11. 教学简化声明

本规则为教学简化规则，基于车辆总长、总宽和最小转弯半径与直交弯道参数进行比较，不替代真实车辆扫掠轨迹分析。

## 12. 未实现功能声明

- **未实现 Day67 坡道牵引力规则**：规则ID为 `right_angle_curve_clearance`，不包含坡道牵引力计算
- **未实现 Day68 桥梁承载规则**：不包含桥梁承载判断
- **未实现 Day69 路线建议生成**：不包含路线建议功能
- **未实现真实车辆扫掠轨迹仿真**：仅使用教学简化公式
- **未实现真实多轴转向动力学计算**：仅使用简化转弯外摆量

## 13. 本地验证结果

| 命令 | 结果 |
|---|---|
| `format:check` | ✅ 通过 |
| `lint` | ✅ 0 errors |
| `test:run` | ✅ 846 passed (49 files) |
| `test:e2e` | ✅ 12 passed |
| `build` | ✅ 3.95s |
| `git diff --check` | ✅ 无空白错误 |

## 14. 新增依赖

无。

## 15. 测试覆盖清单

| 测试场景 | 状态 |
|---|---|
| 直交弯道规则可以被导入 | ✅ |
| 输入 schema 可以被导入 | ✅ |
| 输出结构可以被导入 | ✅ |
| 出口宽度大于所需最小出口宽度时返回通过 | ✅ |
| 出口宽度等于所需最小出口宽度时返回边界正确结果 | ✅ |
| 出口宽度小于所需最小出口宽度时返回不通过 | ✅ |
| 入口宽度充足时入口检查通过 | ✅ |
| 入口宽度不足时返回不通过或警告 | ✅ |
| 入口宽度等于所需宽度时返回边界警告 | ✅ |
| 转角有效宽度充足时通过 | ✅ |
| 转角有效宽度不足时返回不通过或警告 | ✅ |
| 转角有效宽度等于所需宽度时返回边界警告 | ✅ |
| 夹角为 90° 时角度检查通过 | ✅ |
| 夹角明显偏离直交范围时返回警告或阻塞 | ✅ |
| 缺少车辆总长时返回阻塞 | ✅ |
| 缺少车辆总宽时返回阻塞 | ✅ |
| 缺少最小转弯半径时返回阻塞 | ✅ |
| 缺少入口宽度时返回阻塞 | ✅ |
| 缺少出口宽度时返回阻塞 | ✅ |
| NaN 不会导致结果出现 NaN | ✅ |
| Infinity 处理正确 | ✅ |
| 每个结果都有 summary、reasons、teachingNote、nextAction | ✅ |
| 页面能展示通过结果 | ✅ |
| 页面能展示不通过结果 | ✅ |
| 页面能展示缺参数结果 | ✅ |
| 页面不实现 Day67 坡道牵引力规则 | ✅ |
| 页面不实现 Day68—Day69 后续规则 | ✅ |
| 构建成功 | ✅ |

## 16. 验收结论

Day66 通过。测量值与所需最小出口宽度比较正确。规则引擎实现了完整的输入校验、所需最小出口宽度计算、出口宽度检查、入口宽度检查、转角有效宽度检查、角度范围检查，并产生了人类可读的原因和教学说明。
