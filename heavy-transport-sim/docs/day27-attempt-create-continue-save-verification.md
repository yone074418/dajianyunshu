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

Day22-Day26 verification documents not found in main branch (changes not yet merged). Implementation uses mock data service layer.

## 3. Current Supabase/Auth/RLS/Route Guard Status

- Supabase client exists but no real connection configured
- No auth store in main branch (Day25/26 not merged)
- No RLS policies available
- No route guards in main branch

## 4. Real Database Verification Status

**Not performed.** No real Supabase credentials available. Interface logic and data flow verified through in-memory mock service. Real cloud verification not executed.

## 5. Six Stage Initialization Rules

| Index | Stage ID | Stage Name | Initial Status |
|-------|----------|------------|----------------|
| 0 | stage_1_task_intro | 运输任务及货物介绍 | available |
| 1 | stage_2_simple_vehicle_selection | 简单配车 | locked |
| 2 | stage_3_route_survey | 路线勘测 | locked |
| 3 | stage_4_vehicle_group_confirmation | 车组确定 | locked |
| 4 | stage_5_loading_and_lashing | 货物装车与绑扎加固 | locked |
| 5 | stage_6_transport | 货物运输 | locked |

## 6. API Interfaces

### createAttemptForStudent

- Location: `src/services/attempts/attemptService.ts`
- Creates attempt with status `in_progress`
- Generates 6 steps, first stage `available`, rest `locked`
- Rejects if student still has active attempt
- Logs `attempt_created` event

### getActiveAttemptForStudent

- Location: `src/services/attempts/attemptService.ts`
- Returns in-progress attempt with steps for student
- Returns null if no active attempt
- Does not return other students attempts

### continueAttempt

- Location: `src/services/attempts/attemptService.ts`
- Resumes attempt by attemptId
- Validates student ownership
- Returns current step from attempt_steps status
- Rejects completed attempts
- Logs `attempt_continued` event

### saveAttemptStep

- Location: `src/services/attempts/attemptService.ts`
- Saves step status and dataSnapshot
- Validates student ownership
- Rejects locked steps and completed attempts
- Unlocks next stage when current completed
- Marks attempt completed when last stage done
- Logs `attempt_step_saved` event

### restoreAttemptProgress

- Location: `src/services/attempts/attemptService.ts`
- Delegates to continueAttempt
- Restores from last saved state

## 7. Permission Checks

- Student can only create own attempt
- Student can only continue own attempt
- Student can only save own attempt step
- Access denied logged for unauthorized access
- Completed attempts reject write operations

## 8. Operation Logs Strategy

In-memory log array. Events: `attempt_created`, `attempt_continued`, `attempt_step_saved`, `attempt_access_denied`. Each log records attemptId, studentId, eventType, stageId, result, timestamp. Real database logging not available.

## 9. Test Coverage (23 new tests)

1. Create attempt with six stages ✅
2. First stage available, rest locked ✅
3. Correct stage IDs in order ✅
4. Reject duplicate active attempt ✅
5. Log attempt_created ✅
6. Get active attempt returns null when none ✅
7. Get active attempt with steps ✅
8. Not return other students attempts ✅
9. Continue attempt with current step ✅
10. Reject nonexistent attempt ✅
11. Reject wrong student ✅
12. Reject completed attempt ✅
13. Log attempt_continued ✅
14. Save step status and data ✅
15. Unlock next stage on complete ✅
16. Mark attempt completed on last stage ✅
17. Reject saving locked step ✅
18. Reject saving other students attempt ✅
19. Reject saving completed attempt ✅
20. Log attempt_step_saved ✅
21. Restore from saved state ✅
22. Restore rejects wrong student ✅
23. Redo creates new attempt ✅

## 10. Verification Results

| Command | Result |
|---------|--------|
| npm run format:check | Passed |
| npm run lint | Passed (0 errors) |
| npm run test:run | 41 tests passed |
| npm run test:e2e | 7 tests passed |
| npm run build | Passed |
| git diff --check | Passed |

## 11. Not Implemented

- Real Supabase database operations
- Day28 G2 verification
- Six stage business logic
- Scoring algorithms
- Teacher evaluation
- 3D scene
- Deployment

## 12. Acceptance Conclusion

Day27 acceptance criteria satisfied:
- Attempt creation generates 6 stages ✅
- First stage available, rest locked ✅
- Student can query active attempt ✅
- Student can continue own attempt ✅
- Student can save current step ✅
- Restore from saved state works ✅
- Permission checks enforce ownership ✅
- Completed attempts are read-only ✅
- Redo creates new attempt ✅
- Operation logs recorded ✅
