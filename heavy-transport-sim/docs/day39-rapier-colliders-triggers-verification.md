# Day39 Rapier 刚体、碰撞器和触发区验证记录

> 任务：第39天：接入 Rapier 刚体、碰撞器和触发区
> 执行日期：2026-06-28
> 分支：ai-codex/week6-day39-rapier-colliders-triggers
> Worktree：D:\Study\大件运输项目工作区\worktrees\week6-day39-rapier-colliders-triggers

## 1. 环境

| 项目 | 版本 |
|---|---|
| Node.js | v20.17.0 |
| npm | 10.8.2 |

## 2. Day39 原始任务

来源：126天计划第147行

- 任务：接入 Rapier 刚体、碰撞器和触发区
- 验收标准：车辆与障碍不穿模，触发区可记录事件

## 3. 前置状态

- Day36 Canvas/灯光/地面/加载/失败重试：cherry-pick 合入
- Day37 相机旋转/缩放/重置/边界：cherry-pick 合入
- Day38 模型点选/悬停/高亮/提示：cherry-pick 合入

## 4. 新增依赖

| 包名 | 版本 | 说明 |
|---|---|---|
| @react-three/rapier | ^1 | Rapier 物理引擎 React 绑定（兼容 fiber@8） |

## 5. 物理世界配置

```ts
gravity: [0, -9.81, 0]
timeStep: 'vary'
debug: false
```

## 6. 新增/修改文件清单

| 文件 | 类型 |
|---|---|
| `src/scene/physicsConfig.ts` | 新增 - 物理配置 |
| `src/scene/physicsConfig.test.ts` | 新增 - 配置测试 |
| `src/scene/triggerTypes.ts` | 新增 - 触发事件类型 |
| `src/scene/useTriggerEvents.ts` | 新增 - 触发事件 hook |
| `src/scene/useTriggerEvents.test.ts` | 新增 - 触发事件测试 |
| `src/scene/GroundCollider.tsx` | 新增 - 地面碰撞器 |
| `src/scene/VehicleRigidBody.tsx` | 新增 - 车辆刚体 |
| `src/scene/ObstacleCollider.tsx` | 新增 - 障碍物碰撞器 |
| `src/scene/TriggerZone.tsx` | 新增 - 触发区 |
| `src/scene/TriggerEventPanel.tsx` | 新增 - 事件面板 |
| `src/scene/SceneCanvas.tsx` | 修改 - 集成物理 |
| `src/scene/index.ts` | 修改 - 导出新组件 |
| `src/scene/SceneCanvas.test.tsx` | 修改 - 添加 Rapier mock |
| `src/pages/scene-preview/ScenePreviewPage.tsx` | 修改 - 更新描述 |
| `src/pages/scene-preview/ScenePreviewPage.test.tsx` | 修改 - 添加 Rapier mock |

## 7. 刚体清单

| id | 类型 | 位置 | 说明 |
|---|---|---|---|
| tractor-6x6 | dynamic | [-3, 0.6, 0] | 牵引车占位刚体 |
| cargo-main | dynamic | [0, 0.6, 0] | 货物占位刚体 |

## 8. 碰撞器清单

| 对象 | 类型 | 位置 | 尺寸 |
|---|---|---|---|
| ground | fixed | [0, -0.1, 0] | 50x0.1x50 |
| height-limit | fixed | [4, 1.5, 0] | 0.15x1.5x0.15 |
| vehicle | dynamic | 随刚体 | 1.5x0.5x0.6 |
| trigger-height-zone | sensor | [4, 1, 0] | 1.5x1.5x1.5 |

## 9. 触发区清单

| id | 名称 | 位置 | 说明 |
|---|---|---|---|
| trigger-height-zone | 限高检测区 | [4, 1, 0] | 进入限高障碍区域时记录事件 |

## 10. 触发事件结构

```ts
interface SceneTriggerEvent {
  id: string
  triggerId: string
  triggerName: string
  objectId: string
  eventType: 'trigger_enter' | 'trigger_exit'
  timestamp: string
}
```

## 11. 不穿模验证

- 车辆和障碍物均使用 CuboidCollider 配置碰撞器
- 地面使用 fixed RigidBody + CuboidCollider 支撑
- 障碍物使用 fixed RigidBody 阻挡车辆
- 物理配置 gravity=[0, -9.81, 0] 确保车辆受重力影响落在地面上
- 真实碰撞行为需在浏览器中验证

## 12. 触发事件去重策略

- 使用 lastEventKeyRef 记录上一次事件的 triggerId:objectId:eventType
- 相同 key 的连续事件会被跳过
- 最多保留 10 条事件

## 13. 本地验证结果

| 命令 | 结果 |
|---|---|
| build | 通过 |
| lint | 通过（0 warnings） |
| format:check | 通过 |
| test:run | 93 测试全通过 |
| test:e2e | 10 测试全通过 |

## 14. 密钥/C盘检查

- 无密钥泄露
- worktree 在 D 盘
- 无 C 盘残留

## 15. 验收结论

**Day39 验收结论：通过。**
