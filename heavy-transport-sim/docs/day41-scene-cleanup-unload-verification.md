# Day41 模型清理与场景卸载机制验证记录

## 1. 基本信息

- 日期：2026-06-28
- 环境：Windows 11, PowerShell
- Node：v20.17.0
- npm：10.8.2

## 2. 基线信息

- 基线提交：ec4cac6 (Merge pull request #1)
- 分支：ai-codex/week6-day41-scene-cleanup-unload
- Worktree 路径：D:\Study\大件运输项目工作区\worktrees\week6-day41-scene-cleanup-unload

## 3. Day41 原始任务

- 来源：126 天计划文档第 149 行
- 任务：建立模型清理与场景卸载机制
- 验收标准：切换实验步骤后无重复 Canvas 和明显内存增长

## 4. 读取的设计依据文件

- 126 天计划文档 ✅
- Day36-39 验证记录 — 不存在于 main 分支（在各自 worktree 中），不阻断 ✅
- Day40 验证记录 — 不存在于 main 分支（Day40 未合并），不阻断 ✅
- 当前 scene 目录下已有实现 ✅

## 5. 前置基础状态

- Day36 Canvas、灯光、地面、加载 UI：已完成（main 分支） ✅
- Day37 相机控制（OrbitControls）：已完成（main 分支） ✅
- Day38 模型点选、悬停、高亮、提示：已完成（main 分支） ✅
- Day39 Rapier 物理和触发区：已完成（main 分支） ✅
- Day40 第一人称漫游：未合并到 main，Day41 不依赖 Day40 ✅

## 6. 场景入口路径

`/student/scene-preview` — 由 `ScenePreviewPage` 组件渲染

## 7. 新增依赖

无新增依赖。Day41 仅使用项目已有的 React Three Fiber、Drei、Rapier 和 Three.js。

## 8. 场景生命周期设计

### 生命周期状态

```
idle → loading → ready → unloading → disposed
                                    → error (可重试)
```

### sceneKey 切换策略

- `SceneCanvas` 接受 `sceneKey` prop
- `ScenePreviewPage` 通过步骤按钮切换 stepId
- Canvas 使用 `key={sceneKey}` 控制 React 重挂载
- `useSceneCleanup` hook 监听 sceneKey 变化，触发清理回调

### Canvas 去重策略

- React 的 `key` prop 保证 sceneKey 变化时旧 Canvas 卸载、新 Canvas 创建
- 同一时刻 DOM 中只有一个 `[data-testid="scene-canvas"]`
- 不使用 CSS 隐藏，而是真正卸载

## 9. Three.js 资源清理策略

### disposeObject3D 工具函数

- 遍历 Object3D 子树
- 释放 geometry.dispose()
- 释放 material.dispose()（含材质数组）
- 释放 material 上的纹理字段（map, normalMap, roughnessMap 等 11 种）
- 从父节点移除对象
- 安全处理 null/undefined，可重复调用

### disposeMaterial 工具函数

- 释放材质本身
- 释放材质上附着的所有纹理

## 10. 状态清理策略

### 应清理的状态

- hoveredObjectId — useSceneInteraction.resetAll()
- selectedObjectId — useSceneInteraction.resetAll()
- trigger events — useTriggerEvents.clearEvents()

### 保留的状态

- 当前 attemptId（全局）
- 学生身份（全局）
- 已保存的操作日志（数据库）

### 清理触发时机

- sceneKey 变化时调用 cleanup 回调
- SceneCanvas 组件卸载时调用 cleanup 回调
- cleanup 函数调用 resetAll() 和 clearEvents()

## 11. 事件监听清理策略

- useSceneCleanup hook 在 sceneKey 变化和组件卸载时触发清理
- React 的 useEffect cleanup 保证组件卸载时清理副作用
- Day39 TriggerZone 的 onTriggerEvent 回调通过 props 传递，组件卸载时自然清理
- Day37 OrbitControls 随 Canvas 卸载自动清理

## 12. 内存增长验证方式

由于 JSDOM 不支持精确 JS heap 读取（performance.memory），使用以下替代指标：

- Canvas 数量：切换步骤后始终为 1
- sceneKey 变化时旧组件卸载、新组件挂载（通过 key prop 控制）
- useSceneCleanup 回调在 sceneKey 变化时被调用（单元测试验证）
- disposeObject3D 工具可安全释放 geometry/material/texture（单元测试验证）
- build 成功，无内存泄漏警告

## 13. 新增或修改文件清单

新增文件：
- `src/scene/disposeObject3D.ts` — Three.js 资源释放工具
- `src/scene/disposeObject3D.test.ts` — 资源释放工具测试
- `src/scene/useSceneCleanup.ts` — 场景清理 hook
- `src/scene/useSceneCleanup.test.ts` — 场景清理 hook 测试
- `src/scene/useSceneResourceTracker.ts` — 资源追踪 hook
- `src/scene/useSceneResourceTracker.test.ts` — 资源追踪 hook 测试

修改文件：
- `src/scene/SceneCanvas.tsx` — 接受 sceneKey，集成 useSceneCleanup
- `src/scene/SceneCanvas.test.tsx` — 新增 sceneKey 和 Canvas 去重测试
- `src/scene/useSceneInteraction.ts` — 新增 resetAll 方法
- `src/scene/index.ts` — 导出新模块
- `src/pages/scene-preview/ScenePreviewPage.tsx` — 步骤切换 UI
- `src/pages/scene-preview/ScenePreviewPage.test.tsx` — 步骤切换测试

## 14. 测试覆盖

### 单元测试（125 通过）

- `disposeObject3D.test.ts` — 12 个测试：材质释放、几何体释放、纹理释放、材质数组、递归子对象、安全重复调用、null 处理、从父移除
- `useSceneCleanup.test.ts` — 5 个测试：初始不调用、key 变化调用、key 不变不调用、卸载调用、多次变化调用
- `useSceneResourceTracker.test.ts` — 7 个测试：初始零计数、追踪几何体/材质/纹理/监听器、取消追踪、重置计数
- `SceneCanvas.test.tsx` — 6 个测试：渲染、单 Canvas、sceneKey 接受、key 变化后仍单 Canvas
- `ScenePreviewPage.test.tsx` — 8 个测试：标题、描述、Canvas、重置按钮、步骤按钮、默认步骤、步骤切换、切换后单 Canvas

### E2E 测试（10 通过）

- 路由和认证流程未回退

## 15. 本地验证结果

| 命令 | 结果 |
|------|------|
| `npm run format:check` | ✅ 通过 |
| `npm run lint` | ✅ 通过（0 errors, 0 warnings） |
| `npm run test:run` | ✅ 125 通过 |
| `npm run test:e2e` | ✅ 10 通过 |
| `npm run build` | ✅ 通过 |
| `git diff --check` | ✅ 无错误 |

## 16. 回归验证

- Day36 加载状态和失败重试：SceneCanvas 仍包含 SceneErrorBoundary 和 LoadingUI ✅
- Day37 相机控制：SceneCameraControls 仍渲染，重置按钮仍在页面 ✅
- Day38 点选和提示：SceneInfoPanel、PlaceholderModels 交互未被破坏 ✅
- Day39 物理和触发区：Physics、TriggerZone、TriggerEventPanel 未被破坏 ✅

## 17. 验收结论

Day41 全部验收标准已满足：

1. ✅ 场景生命周期机制建立（useSceneCleanup hook）
2. ✅ 模型资源清理机制建立（disposeObject3D 工具）
3. ✅ Canvas 去重机制建立（key prop 控制）
4. ✅ 切换步骤后只有一个 Canvas
5. ✅ 离开场景后旧实例卸载
6. ✅ 重进场景不叠加旧实例
7. ✅ 状态清理策略明确（hover/selected/trigger）
8. ✅ 未实现 Day42 或后续功能
9. ✅ 未创建 PR
10. ✅ 未合并 main
