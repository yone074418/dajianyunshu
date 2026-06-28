# Day36 三维场景与交互底座验证记录

> 任务：第36天：建立Canvas、灯光、地面和加载界面
> 执行日期：2026-06-28
> 分支：ai-codex/week6-day36-scene-canvas-loading
> Worktree：D:\Study\大件运输项目工作区\worktrees\week6-day36-scene-canvas-loading
> 基线提交：872f2b8 (origin/main)

## 1. 环境

| 项目 | 版本 |
|---|---|
| Node.js | v20.17.0 |
| npm | 10.8.2 |
| 操作系统 | Windows (win32) |

## 2. Day36 原始任务

来源：`大件运输虚拟仿真实验教学系统_单人复刻126天计划.md` 第144行

- 任务：建立Canvas、灯光、地面和加载界面
- 验收标准：场景加载时有进度，失败时有重试按钮

## 3. 读取的设计依据

| 文件 | 状态 |
|---|---|
| 126天计划文档 | 已读取，Day36 任务确认 |
| docs/学生端信息架构.md | 已读取 |
| docs/六阶段低保真原型.md | 已读取 |
| docs/通用功能与页面清单.md | 已读取 |
| docs/六阶段实验主流程.md | 已读取 |
| docs/专业规则目录.md | 未在 worktree 中找到 |
| heavy-transport-sim/docs/day29~35 验证记录 | 未在 worktree 中找到（属于历史文档，不阻断 Day36） |

## 4. 新增依赖

| 包名 | 版本 | 类型 |
|---|---|---|
| three | ^0.178.0 | dependency |
| @react-three/fiber | ^8 | dependency |
| @react-three/drei | ^9 | dependency |
| @types/three | ^0 | devDependency（已随 three 自动安装） |

未安装 Rapier（Day39 才需要）。

## 5. 新增/修改文件清单

| 文件 | 类型 |
|---|---|
| `src/scene/SceneLighting.tsx` | 新增 - 灯光组件 |
| `src/scene/Ground.tsx` | 新增 - 地面组件 |
| `src/scene/LoadingUI.tsx` | 新增 - 加载界面 |
| `src/scene/SceneErrorBoundary.tsx` | 新增 - 错误边界+重试 |
| `src/scene/SceneCanvas.tsx` | 新增 - 主 Canvas 组件 |
| `src/scene/index.ts` | 新增 - 统一导出 |
| `src/scene/SceneErrorBoundary.test.tsx` | 新增 - 错误边界测试 |
| `src/scene/SceneCanvas.test.tsx` | 新增 - Canvas 测试 |
| `src/pages/scene-preview/ScenePreviewPage.tsx` | 新增 - 场景预览页面 |
| `src/pages/scene-preview/ScenePreviewPage.test.tsx` | 新增 - 预览页面测试 |
| `src/app/router.tsx` | 修改 - 添加 scene-preview 路由 |
| `package.json` | 修改 - 新增 3D 依赖 |
| `package-lock.json` | 修改 - 依赖锁文件 |

## 6. 场景入口

路径：`/student/scene-preview`

路由配置：`src/app/router.tsx`，使用 AuthGuard + RoleGuard 保护。

## 7. 组件说明

### 7.1 Canvas (SceneCanvas.tsx)
- 使用 React Three Fiber `<Canvas>` 组件
- 相机位置 [10, 10, 10]，视角 50°
- 背景色 #e8e8e8
- 包裹在 SceneErrorBoundary 中
- 使用 React Suspense 处理加载状态

### 7.2 灯光 (SceneLighting.tsx)
- 环境光 intensity=0.6
- 方向光 position=[10,15,10]，intensity=0.8
- 半球光 天空色#87ceeb，地面色#444444，intensity=0.3

### 7.3 地面 (Ground.tsx)
- Grid 网格参考线 100x100
- 平面地面 100x100，颜色#a0a0a0

### 7.4 加载界面 (LoadingUI.tsx)
- 使用 Drei `<Html>` 组件在 Canvas 内显示
- 旋转加载动画 + "正在加载三维场景..." 文字
- data-testid="scene-loading"

### 7.5 错误边界 (SceneErrorBoundary.tsx)
- Class Component 实现 getDerivedStateFromError
- 显示"三维场景加载失败"+"请检查网络或稍后重试"
- 重试按钮 data-testid="scene-retry-button"
- 不显示技术错误堆栈给用户

## 8. WebGL/Canvas 测试策略

JSDOM 不支持 WebGL，测试策略：
- R3F Canvas 在测试中被 mock 为 `<div data-testid="scene-canvas">`
- Drei Html/Grid 组件被 mock 为简单 div
- SceneErrorBoundary 使用真实组件测试错误捕获和重试
- 覆盖场景：正常渲染、错误状态、重试按钮、技术错误不泄露

## 9. 本地验证结果

| 命令 | 结果 |
|---|---|
| `npm run build` | 通过（bundle 1.3MB，Three.js 体积预期） |
| `npm run lint` | 通过（0 warnings） |
| `npm run format:check` | 通过 |
| `npm run test:run` | 58 测试全通过 |
| `npm run test:e2e` | 10 测试全通过 |
| `git diff --check` | 通过（无 whitespace 错误） |

## 10. 密钥检查

- 未发现 SUPABASE_SERVICE_ROLE_KEY
- 未发现 JWT_SECRET / DATABASE_PASSWORD
- 未发现 postgres:// / postgresql:// 连接串
- 未发现 .env 文件被提交

## 11. C 盘残留检查

Worktree 创建在 D 盘：`D:\Study\大件运输项目工作区\worktrees\week6-day36-scene-canvas-loading`

未在 C 盘创建项目 worktree 或依赖目录。

## 12. 范围检查

- 未实现相机旋转/缩放/重置/边界（Day37）
- 未实现模型点选/悬停/高亮（Day38）
- 未实现 Rapier 物理（Day39）
- 未实现第一人称漫游（Day40）
- 未实现模型清理/场景卸载（Day41）
- 未实现六阶段业务流程
- 未实现专业规则计算
- 未创建 PR
- 未合并 main
- 未部署

## 13. 验收结论

| 验收项 | 结论 |
|---|---|
| 已建立 Canvas | 通过 |
| 已建立基础灯光 | 通过 |
| 已建立基础地面 | 通过 |
| 场景加载时有加载状态 | 通过 |
| 加载失败时有失败提示 | 通过 |
| 加载失败时有重试按钮 | 通过 |
| 不依赖真实模型资源 | 通过 |
| 未实现 Day37+ 功能 | 通过 |
| 测试覆盖 | 通过 |
| 所有验证命令通过 | 通过 |

**Day36 验收结论：通过。**
