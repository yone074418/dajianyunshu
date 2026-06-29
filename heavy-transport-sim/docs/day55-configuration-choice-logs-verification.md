# Day55 配车选择日志验证记录

## 1. 基本信息

| 项目 | 内容 |
|---|---|
| 日期 | 2026-06-29 |
| Node版本 | v22.16.0 |
| npm版本 | 10.9.2 |
| 分支 | `ai-codex/week8-day55-configuration-choice-logs` |
| 基线提交 | `b1d7bca`（Day54 简单配车规则引擎） |
| Worktree路径 | `D:\Study\大件运输项目工作区\worktrees\week8-day55-configuration-choice-logs` |

## 2. Day55 原始任务

126天计划文档第55天：

- **任务标题**：记录配车选择、错误和修改次数
- **验收标准**：教师端可按时间顺序看到所有关键选择

## 3. 前置状态

| 前置任务 | 状态 |
|---|---|
| Day50 车辆组合数据 | 已完成，已合并 |
| Day51 组合选择动画 | 已完成，已合并 |
| Day52 牵引车参数 | 已完成，已合并 |
| Day53 挂车轴线纵列选择 | 已完成，已合并 |
| Day54 简单配车规则引擎 | 已完成，已合并 |

## 4. 实现说明

### 4.1 持久化方案

使用 localStorage 作为本地持久化方案，未接入真实 Supabase 数据库。

- Storage key: `heavy-transport-sim:configuration-choice-logs:v1`
- 刷新后数据仍可读取
- 清除浏览器数据后将丢失
- 未宣称真实落库

### 4.2 studentId / attemptId 处理

当前使用 mock 值：
- studentId: `student-mock-001`
- attemptId: `attempt-mock-001`
- caseId: `case_heavy_transformer_transport_v1`

### 4.3 关键选择事件清单

| 事件类型 | 触发时机 |
|---|---|
| `combination_selected` | 首次选择组合方式 |
| `combination_changed` | 修改组合方式 |
| `tractor_selected` | 首次选择牵引车 |
| `tractor_changed` | 修改牵引车 |
| `trailer_axle_lines_selected` | 首次选择轴线数 |
| `trailer_axle_lines_changed` | 修改轴线数 |
| `trailer_columns_selected` | 首次选择纵列数 |
| `trailer_columns_changed` | 修改纵列数 |
| `configuration_checked` | 点击检查配车方案 |
| `configuration_passed` | 规则检查通过 |
| `configuration_failed` | 规则检查不通过 |
| `configuration_blocked` | 规则检查阻塞/缺参数 |

### 4.4 错误次数定义

- 规则引擎返回 `failed` 时，errorCount +1
- 规则引擎返回 `blocked` 时，errorCount +1
- 每次规则检查独立计数
- 快速重复点击每次都会增加（因为每次都是独立的检查事件）

### 4.5 修改次数定义

- 组合方式从 A 改为 B，modificationCount +1
- 牵引车从 A 改为 B，modificationCount +1
- 轴线数从 A 改为 B，modificationCount +1
- 纵列数从 A 改为 B，modificationCount +1
- 第一次选择不计入修改次数
- 选择相同值不计入修改次数

### 4.6 时间顺序排序

日志按 `sequence` 字段（基于 `Date.now()`）排序：
- 默认正序（从早到晚）
- 可切换倒序（从晚到早）
- 同一时间戳按插入顺序稳定排序

### 4.7 防重复策略

- 每次选择/修改都生成独立日志
- 选择相同值不会生成修改日志（仅生成选择日志）
- 规则检查每次点击都会记录

### 4.8 权限边界

- 教师端时间线页面在 `/teacher/configuration-timeline` 路由下
- 使用 `AuthGuard` + `RoleGuard` 保护
- 学生端不暴露教师时间线入口

## 5. 文件清单

| 文件 | 操作 |
|---|---|
| `src/domain/configurationLogs.ts` | 新增 - 日志类型、schema、repository、统计函数 |
| `src/domain/configurationLogs.test.ts` | 新增 - 35个测试 |
| `src/stores/configuration/configurationLogStore.ts` | 新增 - Zustand store |
| `src/stores/configuration/configurationLogStore.test.ts` | 新增 - 19个测试 |
| `src/pages/teacher/ConfigurationTimelinePage.tsx` | 新增 - 教师端时间线页面 |
| `src/pages/teacher/ConfigurationTimelinePage.test.tsx` | 新增 - 11个测试 |
| `src/app/router.tsx` | 修改 - 新增教师端路由 |

## 6. 测试覆盖

| 场景 | 状态 |
|---|---|
| 日志类型和schema可导入 | ✅ |
| 合法日志通过校验 | ✅ |
| 缺少studentId校验失败 | ✅ |
| 缺少attemptId校验失败 | ✅ |
| failed事件缺少reason校验失败 | ✅ |
| 选择组合方式写日志 | ✅ |
| 选择牵引车写日志 | ✅ |
| 选择轴线数写日志 | ✅ |
| 选择纵列数写日志 | ✅ |
| 修改组合方式增加修改次数 | ✅ |
| 修改牵引车增加修改次数 | ✅ |
| 修改轴线数增加修改次数 | ✅ |
| 修改纵列数增加修改次数 | ✅ |
| 选择相同值不增加修改次数 | ✅ |
| 规则检查failed增加错误次数 | ✅ |
| 规则检查passed不增加错误次数 | ✅ |
| 快速重复检查不会无限增加 | ✅ |
| localStorage持久化 | ✅ |
| localStorage损坏不白屏 | ✅ |
| 教师端按时间顺序展示 | ✅ |
| 教师端显示错误次数 | ✅ |
| 教师端显示修改次数 | ✅ |
| 教师端显示修改前后值 | ✅ |
| 教师端显示失败原因 | ✅ |
| 学生端不显示教师时间线入口 | ✅ |

## 7. 验证命令结果

| 命令 | 结果 |
|---|---|
| `npm ci` | ✅ 通过 |
| `npm run format:check` | ✅ 通过 |
| `npm run lint` | ✅ 通过 |
| `npm run test:run` | ✅ 614 tests passed (42 files) |
| `npm run test:e2e` | ✅ 12 tests passed |
| `npm run build` | ✅ 通过 |
| `git diff --check` | ✅ 通过 |

## 8. 新增依赖

无新增依赖。

## 9. 未实现功能

- 未实现 Day56 周模块验收
- 未实现自动评分或教师评分
- 未实现路线勘测、车组确定、装车、绑扎、运输动画
- 未接入真实 Supabase 数据库
- 未创建 PR
- 未合并 main
