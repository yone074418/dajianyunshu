# Day45 货物360°查看和尺寸标注验证记录

## 1. 基本信息

- 日期：2026-06-28
- 环境：Windows 11, PowerShell
- Node：v20.17.0
- npm：10.8.2

## 2. 基线信息

- 原始实现分支：ai-codex/week7-day45-cargo-360-dimensions
- 当前状态：已提取有效改动并合并到 main，保留 Day29-Day44 主线成果

## 3. 任务来源

- 126 天计划第 158 行：第45天 | 实现货物360°查看和尺寸标注 | 可旋转、缩放、复位，并正确显示长宽高

## 4. 前置状态

- Day43 案例数据：已合并到 main ✅
- Day44 任务介绍页面：已合并到 main ✅
- G3 验收（Day42）：通过 ✅

## 5. 货物360°查看入口

- 路由：`/student/cargo`
- 受 AuthGuard + RoleGuard 保护

## 6. 货物查看组件

- 路径：`src/pages/cargo-viewer/Cargo360Viewer.tsx`
- 使用 React Three Fiber Canvas + OrbitControls
- 参数化 box geometry 占位模型（比例来自案例数据）
- 3D Html 标注显示长宽高

## 7. 货物尺寸数据读取

- 数据源：`src/domain/transportCase.ts` → `UNIQUE_TRANSPORT_CASE`
- 读取：`getUniqueTransportCase()` → `cargo.dimensions`
- 页面通过 `useMemo(() => loadCase(), [])` 同步读取

## 8. 非硬编码验证

- 测试验证页面渲染案例数据中的长宽高数值
- 组件不直接写死任何尺寸数值
- 所有展示来自 `data.cargo.dimensions`

## 9. 旋转功能

- 使用 Drei OrbitControls
- 水平 360° 旋转
- maxPolarAngle 限制防止进入地下
- enableDamping 平滑控制

## 10. 缩放功能

- minDistance=3（防止穿进货物）
- maxDistance=30（防止无限远离）
- 滚轮/触控板缩放

## 11. 复位功能

- "复位视角"按钮
- data-testid="reset-view-btn"
- 点击触发页面刷新复位

## 12. 尺寸标注

- 3D Html 标注：长度、宽度、高度
- 信息卡表格：长度、宽度、高度、重量
- 单位：m（米）、t（吨）
- 数值来自案例数据

## 13. 测试覆盖

- `Cargo360Viewer.test.tsx` — 15 个测试
  - 页面渲染、Canvas、货物名称、类别
  - 长度/宽度/高度/重量展示
  - 单位显示、复位按钮、旋转控制
  - 尺寸表格、帮助文案、数据来源验证

## 14. 本地验证结果

| 命令 | 结果 |
|------|------|
| `npm run format:check` | ✅ 通过 |
| `npm run lint` | ✅ 通过（0 errors, 0 warnings） |
| `npm run test:run` | ✅ 当前主线验证通过 |
| `npm run test:e2e` | ✅ 10 通过 |
| `npm run build` | ✅ 通过（4.09s） |
| `git diff --check` | ✅ 无错误 |

## 15. 声明

- 未实现 Day46 或后续功能
- 未部署
- 未创建 PR
- 已合并 main
