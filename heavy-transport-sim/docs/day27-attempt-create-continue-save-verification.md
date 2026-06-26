# Day27 Attempt Create Continue Save Verification

## 1. Task Source

- Date: 2026-06-26
- Source: `大件运输虚拟仿真实验教学系统_单人复刻126天计划.md`
- Original task: Day27, 实现实验创建、继续和保存接口
- Acceptance standard: 学生可创建一次实验并从数据库恢复当前步骤

## 2. Design Basis

- `docs/六阶段实验主流程.md`
- `docs/数据库实体关系设计.md`
- `docs/通用功能与页面清单.md`
- `docs/学生端信息架构.md`

## 3. Auth/RLS/Route Guard Integration

Day24-Day26已合并到main，本分支已rebase到最新main：
- Auth模块: `src/features/auth/authSession.ts` ✅ 已集成
- Route Guard: `src/app/AuthGuard.tsx`, `RoleGuard.tsx` ✅ 已集成
- RLS: 数据库层面策略 ✅ 迁移文件存在

## 4. Real Database Verification Status

**未执行。** 无Supabase真实凭据。通过内存mock服务验证接口逻辑和数据流。

## 5. Six Stage Initialization

| Index | Stage ID | Stage Name | Initial Status |
|-------|----------|------------|----------------|
| 0 | stage_1_task_intro | 运输任务及货物介绍 | available |
| 1 | stage_2_simple_vehicle_selection | 简单配车 | locked |
| 2 | stage_3_route_survey | 路线勘测 | locked |
| 3 | stage_4_vehicle_group_confirmation | 车组确定 | locked |
| 4 | stage_5_loading_and_lashing | 货物装车与绑扎加固 | locked |
| 5 | stage_6_transport | 货物运输 | locked |

## 6. API Interfaces

- `createAttemptForStudent` - 创建attempt，生成6阶段
- `getActiveAttemptForStudent` - 查询未完成attempt
- `continueAttempt` - 继续attempt，校验归属
- `saveAttemptStep` - 保存步骤，解锁下一阶段
- `restoreAttemptProgress` - 恢复当前步骤
- `requireStudentId` - 从Auth获取当前学生ID

## 7. Page Entry

- `src/pages/experiment/ExperimentPage.tsx` - 实验管理页面
- 路由: `/student/experiment` - 需AuthGuard + student角色
- 功能: 创建实验、继续实验、保存阶段、查看六阶段状态

## 8. Test Coverage (27 unit + 10 E2E)

### Unit Tests (27)
1-23: 原有测试 + 24-27: 错误场景测试（access_denied日志、锁定步骤拒绝、attempt不存在处理）

### E2E Tests (10)
1. 未登录→重定向登录
2. 学生登录→学生页
3. 学生不能访问教师页
4. 学生退出→登录页
5. 教师登录→教师页
6. 教师不能访问学生页
7. 404页面
8. 根路径重定向
9. 导航链接
10. 全局布局

## 9. Verification Results

| Command | Result |
|---------|--------|
| npm run format:check | ✅ Passed |
| npm run lint | ✅ Passed (0 errors) |
| npm run test:run | ✅ 48 tests passed |
| npm run test:e2e | ✅ 10 tests passed |
| npm run build | ✅ Passed |
| git diff --check | ✅ Passed |

## 10. Not Implemented

- 真实Supabase数据库操作
- operation_logs写入数据库
- 断网场景E2E测试

## 11. Acceptance Conclusion

Day27验收标准满足：
- 创建attempt生成6阶段 ✅
- 第一阶段available，其余locked ✅
- 查询未完成attempt ✅
- 继续自己的attempt ✅
- 保存当前步骤 ✅
- 从保存状态恢复 ✅
- 权限校验（归属检查）✅
- 已完成attempt只读 ✅
- 重做创建新attempt ✅
- 操作日志记录 ✅
- 页面入口 ✅
- Auth集成 ✅
- E2E测试 ✅
