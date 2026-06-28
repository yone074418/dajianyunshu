# Day38 模型点选、悬停、高亮和提示验证记录

> 任务：第38天：实现模型点选、悬停、高亮和提示
> 执行日期：2026-06-28
> 分支：ai-codex/week6-day38-model-pick-hover-highlight-tooltip
> Worktree：D:\Study\大件运输项目工作区\worktrees\week6-day38-model-pick-hover-highlight-tooltip
> 基线提交：872f2b8 (origin/main)，cherry-pick Day36+Day37: ce422ec, 98b8049

## 1. 环境

| 项目 | 版本 |
|---|---|
| Node.js | v20.17.0 |
| npm | 10.8.2 |

## 2. Day38 原始任务

来源：126天计划第146行

- 任务：实现模型点选、悬停、高亮和提示
- 验收标准：鼠标命中正确，选中状态清晰且不改布局

## 3. 前置状态

- Day36 Canvas/灯光/地面/加载/失败重试：已通过 cherry-pick 合入
- Day37 相机旋转/缩放/重置/边界：已通过 cherry-pick 合入

## 4. 可交互对象清单

| id | 名称 | 类型 | 教学说明 |
|---|---|---|---|
| cargo-main | 大件货物模型 | cargo | 请测量货物长宽高，确认重心标记位置 |
| tractor-6x6 | 6x6 牵引车 | vehicle | 请比较不同牵引车的轴载分布和牵引力 |
| height-limit | 限高障碍 | obstacle | 请测量限高架净空高度，与货物高度对比 |

## 5. 新增/修改文件清单

| 文件 | 类型 |
|---|---|
| `src/scene/sceneObjectMeta.ts` | 新增 - 对象元数据定义 |
| `src/scene/sceneObjectMeta.test.ts` | 新增 - 元数据测试 |
| `src/scene/useSceneInteraction.ts` | 新增 - 交互状态 hook |
| `src/scene/useSceneInteraction.test.ts` | 新增 - 交互状态测试 |
| `src/scene/SelectableModel.tsx` | 新增 - 可选中模型包装 |
| `src/scene/HighlightMesh.tsx` | 新增 - 高亮网格组件 |
| `src/scene/PlaceholderModels.tsx` | 新增 - 占位模型集合 |
| `src/scene/SceneInfoPanel.tsx` | 新增 - 信息面板 |
| `src/scene/SceneCanvas.tsx` | 修改 - 集成交互 |
| `src/scene/index.ts` | 修改 - 导出新组件 |
| `src/pages/scene-preview/ScenePreviewPage.tsx` | 修改 - 更新描述 |
| `src/pages/scene-preview/ScenePreviewPage.test.tsx` | 修改 - 更新 mock |
| `src/scene/SceneCanvas.test.tsx` | 修改 - 更新 mock |

## 6. 实现说明

### hover 状态
- useSceneInteraction hook 管理 hoveredObjectId
- handlePointerOver 设置，handlePointerOut 清除
- hover 不影响 selected 状态

### selected 状态
- handleClick 切换选中/取消
- 点击不同对象切换 selected
- selected 优先级高于 hover

### 高亮
- HighlightMesh 组件根据 isHovered/isSelected 改变材质颜色和 emissive
- hover: emissiveIntensity=0.15
- selected: emissiveIntensity=0.3
- 不改变几何尺寸

### 信息面板
- SceneInfoPanel 使用 absolute 定位，不挤压页面
- 显示名称、类型、教学说明
- hover 时显示"点击选中此对象"

### 鼠标命中
- 只有 SelectableModel 参与 raycast
- stopPropagation 防止事件冒泡
- 地面不参与选择

## 7. 本地验证结果

| 命令 | 结果 |
|---|---|
| build | 通过 |
| lint | 通过（0 warnings） |
| format:check | 通过 |
| test:run | 82 测试全通过 |
| test:e2e | 10 测试全通过 |

## 8. 密钥/C盘检查

- 无密钥泄露
- worktree 在 D 盘
- 无 C 盘残留

## 9. 验收结论

**Day38 验收结论：通过。**
