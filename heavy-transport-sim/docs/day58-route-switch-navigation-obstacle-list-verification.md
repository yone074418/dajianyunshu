# Day58 路线切换导航与障碍列表验证记录

## 1. 基本信息

| 项目 | 内容 |
|---|---|
| 日期 | 2026-06-29 |
| Node版本 | v22.16.0 |
| npm版本 | 10.9.2 |
| 分支 | `ai-codex/week9-day58-route-switch-navigation-obstacle-list` |
| 基线提交 | `fe45e1a`（Day57 路线勘测场景障碍点配置） |
| Worktree路径 | `D:\Study\大件运输项目工作区\worktrees\week9-day58-route-switch-navigation-obstacle-list` |

## 2. Day58 原始任务

- **任务标题**：实现路线切换、导航和障碍列表
- **验收标准**：切换路线不丢已测数据且场景正确卸载

## 3. Day57 前置状态

Day57 路线与障碍配置已完成。三条路线各有3个障碍点，覆盖5种障碍类型。

## 4. 实现文件

| 文件 | 操作 |
|---|---|
| `src/stores/route-survey/routeSurveyStore.ts` | 新增 - 路线导航状态和测量draft store |
| `src/stores/route-survey/routeSurveyStore.test.ts` | 新增 - 30个测试 |
| `src/pages/route-survey/RouteSurveyPage.tsx` | 重写 - 路线切换、障碍列表、详情面板 |
| `src/pages/route-survey/RouteSurveyPage.test.tsx` | 重写 - 16个页面测试 |

## 5. 路线导航

- 三条路线导航卡片全部显示 ✅
- 当前路线有选中态（蓝色边框 + 蓝色背景）✅
- 每条路线显示名称、起点终点、障碍数量、障碍类型摘要 ✅
- 点击路线卡片切换 currentRouteId ✅
- 切换后场景预览区域更新 ✅

## 6. 障碍列表

- 显示当前路线全部障碍点 ✅
- 每个障碍显示类型、名称、风险等级、测量工具、教学提示 ✅
- 测量状态显示（未测/已测/待复核）✅
- 点击障碍项选中并显示详情面板 ✅
- 再次点击同一障碍取消选中 ✅
- 切换路线后只显示新路线障碍 ✅
- 切换路线后旧路线障碍不残留 ✅

## 7. 已测数据保留

- `measurementDrafts` 按 routeId 隔离存储 ✅
- 给路线A写入draft，切换到路线B后路线A的draft不丢失 ✅
- 切回路线A后draft仍存在 ✅
- localStorage 持久化 ✅
- Zod schema 校验 draft 数据 ✅
- 无效 draft 数据被拒绝 ✅
- localStorage 损坏时不白屏 ✅

## 8. 场景卸载

- 切换路线时 `sceneInstanceKey` 递增（证明场景切换）✅
- `useEffect` 监听 `currentRouteId` 变化 ✅
- 切换路线时 `selectedObstacleId` 清理 ✅
- 旧路线障碍 marker 不残留（UI层面通过测试验证）✅

## 9. 数据来源

所有路线和障碍数据来自 Day57 的 `surveyRouteData.ts`，不硬编码在 JSX 中。

## 10. 验证命令结果

| 命令 | 结果 |
|---|---|
| `npm ci` | ✅ 通过 |
| `npm run format:check` | ✅ 通过 |
| `npm run lint` | ✅ 0 errors, 0 warnings |
| `npm run test:run` | ✅ 664 tests passed (45 files) |
| `npm run test:e2e` | ✅ 12 tests passed |
| `npm run build` | ✅ 通过 |
| `git diff --check` | ✅ 无空白错误 |

## 11. 新增依赖

无新增依赖。

## 12. 未实现功能

- 未实现 Day59 距离/高度测量工具
- 未实现 Day60-62 测量工具
- 未实现路线通行规则
- 未创建 PR
- 未合并 main
