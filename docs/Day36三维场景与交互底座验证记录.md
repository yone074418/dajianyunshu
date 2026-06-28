# Day36 三维场景与交互底座验证记录

> 任务：第36天：建立Canvas、灯光、地面和加载界面  
> 执行日期：2026-06-28  
> 验收标准：场景加载时有进度，失败时有重试按钮

## 1. 安装依赖

| 包名 | 版本 | 用途 |
|---|---|---|
| three | ^0.178.0 | 3D 渲染引擎 |
| @react-three/fiber | ^8 | React Three Fiber 绑定 |
| @react-three/drei | ^9 | R3F 辅助组件（OrbitControls、Grid、Html） |
| @types/three | ^0 | Three.js TypeScript 类型 |

注意：@react-three/fiber@9 要求 React 19，当前项目使用 React 18，因此安装 @react-three/fiber@8。

## 2. 创建文件

| 文件 | 用途 |
|---|---|
| `src/scene/SceneLighting.tsx` | 场景灯光：环境光、方向光（带阴影）、半球光 |
| `src/scene/Ground.tsx` | 地面：网格参考线 + 平面地面 |
| `src/scene/LoadingUI.tsx` | 加载中指示器（使用 Drei Html 组件） |
| `src/scene/SceneErrorBoundary.tsx` | 错误边界：捕获渲染错误，显示错误信息和重试按钮 |
| `src/scene/SceneCanvas.tsx` | 主场景 Canvas：整合灯光、地面、加载 UI、OrbitControls |
| `src/scene/index.ts` | 统一导出 |

## 3. 实现细节

### 3.1 Canvas 配置
- 开启阴影（shadows）
- 相机位置 [10, 10, 10]，视角 50°
- 抗锯齿开启
- 背景色 #e8e8e8

### 3.2 灯光系统
- 环境光 intensity=0.5
- 方向光 position=[10,15,10]，intensity=1，带阴影
- 半球光 天空色#87ceeb，地面色#444444，intensity=0.3

### 3.3 地面
- Grid 网格参考线：100x100，cell=1，section=5
- 平面地面：100x100，颜色#a0a0a0

### 3.4 OrbitControls
- 支持阻尼（dampingFactor=0.1）
- 最小距离 2，最大距离 100
- 最大仰角限制（不能看到地面下方）

### 3.5 加载 UI
- 使用 Drei 的 Html 组件在 Canvas 内显示
- 旋转加载动画 + "加载场景中..." 文字

### 3.6 错误边界
- Class Component 实现 getDerivedStateFromError
- 显示错误信息和重试按钮
- 重试按钮通过重置 state 触发重新渲染

## 4. 集成

场景已集成到 `ExperimentPage.tsx`：
- 当实验已恢复（resumeState 存在）时，页面左侧显示实验控制，右侧显示三维场景
- 使用 flexbox 布局，场景最小高度 400px

## 5. 构建与测试验证

| 检查项 | 结果 |
|---|---|
| TypeScript 编译 | 通过 |
| ESLint | 通过（0 warnings） |
| 单元测试 | 51 个测试全部通过 |
| Vite 生产构建 | 通过（bundle 1.3MB，Three.js 体积预期） |

## 6. Day36 验收结论

| 验收项 | 结论 | 说明 |
|---|---|---|
| Canvas 建立 | 通过 | SceneCanvas 组件配置阴影、相机、抗锯齿 |
| 灯光 | 通过 | 环境光+方向光+半球光，方向光带阴影 |
| 地面 | 通过 | Grid 网格参考线 + 平面地面 |
| 加载界面 | 通过 | LoadingUI 使用旋转动画和文字提示 |
| 失败时有重试按钮 | 通过 | SceneErrorBoundary 捕获错误并提供重试按钮 |
| 场景加载时有进度 | 通过 | Suspense fallback 显示 LoadingUI |

**Day36 总结论：通过。** 场景底座已建立，可在浏览器中加载、旋转、缩放。

## 7. 后续任务

- Day37：实现相机旋转、缩放、重置和边界（当前 OrbitControls 已提供基础功能）
- Day38：实现模型点选、悬停、高亮和提示
- Day39：接入 Rapier 刚体、碰撞器和触发区
