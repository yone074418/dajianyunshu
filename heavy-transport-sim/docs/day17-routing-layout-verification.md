# Day17 路由与全局布局验证记录

> 编制日期：2026-06-24（Asia/Shanghai）
>
> 任务：第 3 周第 3 天（总第 17 天）建立功能目录、路由和全局布局

## 1. 范围与排除项

本次只为现有 Vite、React、TypeScript 工程增加 React Router 路由配置、全局布局和占位页面。

未实现登录、权限、业务页面、状态管理、Zustand、Zod、Supabase、Three.js、CI 或实验功能。

## 2. Git 基线与隔离

| 项目     | 值                                                                           |
| -------- | ---------------------------------------------------------------------------- |
| 基线提交 | `ba8334898c409979b42e74cb9ed01db031faa98c`                                   |
| 分支     | `ai-codex/week3-day17-routing-layout`                                        |
| 隔离方式 | 独立 Git worktree（`C:/Users/yone/AppData/Local/Temp/day17-routing-layout`） |

## 3. 环境与版本

| 项目              | 实际版本                          |
| ----------------- | --------------------------------- |
| 操作系统          | Microsoft Windows NT 10.0.26100.0 |
| Node.js           | 20.17.0                           |
| npm               | 10.8.2                            |
| React / React DOM | 18.3.1 / 18.3.1                   |
| Vite              | 6.4.3                             |
| TypeScript        | 5.6.3                             |
| React Router DOM  | 6.30.4                            |
| ESLint            | 9.39.2                            |
| Prettier          | 3.8.4                             |
| Vitest            | 4.1.9                             |
| Playwright Test   | 1.61.1                            |

## 4. React Router 版本选择

选择 `react-router-dom@6.30.4`（v6 最新稳定版）：

- 与 React 18 完全兼容
- 与 Vite 6 和 TypeScript 5.6 兼容
- 提供 `createBrowserRouter`、`RouterProvider`、`Outlet` 等现代 API
- v7 存在 breaking changes，不适合当前项目

## 5. 目录和路由结构

```
src/
├── app/
│   ├── router.tsx          # 集中定义路由
│   └── router.test.tsx     # 路由单元测试
├── layouts/
│   └── AppLayout.tsx       # 全局布局（Header + Nav + Outlet）
├── pages/
│   ├── student/
│   │   └── StudentPage.tsx # 学生端占位页
│   ├── teacher/
│   │   └── TeacherPage.tsx # 教师端占位页
│   ├── login/
│   │   └── LoginPage.tsx   # 登录占位页
│   └── not-found/
│       └── NotFoundPage.tsx # 404页面
├── App.tsx                 # 挂载 RouterProvider
└── main.tsx                # 入口（未修改）
```

## 6. 路由表

| 路径       | 页面                                 | 说明                 |
| ---------- | ------------------------------------ | -------------------- |
| `/`        | `<Navigate to="/student" replace />` | 根路径重定向到学生端 |
| `/student` | `<StudentPage />`                    | 学生端占位页         |
| `/teacher` | `<TeacherPage />`                    | 教师端占位页         |
| `/login`   | `<LoginPage />`                      | 登录占位页           |
| `*`        | `<NotFoundPage />`                   | 404 通配页面         |

全局布局 `AppLayout` 包含：

- 应用标题："大件运输虚拟仿真实验教学系统"
- 导航链接：学生端、教师端、登录
- `<Outlet />` 渲染子路由

## 7. Vitest 红—绿证据

### 红阶段（实现前）

新增路由测试文件 `src/app/router.test.tsx`，包含 6 个测试用例。在实现路由前运行，预期失败（路由和页面不存在）。

### 绿阶段（实现后）

```
✓ src/app/router.test.tsx (6 tests) 88ms

Test Files  1 passed (1)
     Tests  6 passed (6)
```

测试用例：

1. `/student` 渲染学生端标题
2. `/teacher` 渲染教师端标题
3. `/login` 渲染登录页标题
4. 未知路径渲染 404 页面
5. 全局布局显示导航和当前子页面
6. 根路径执行预期默认导航

## 8. Playwright 红—绿证据

### 红阶段

旧测试 `tests/e2e/app.spec.ts` 测试 Day15 页面，在新路由下失败：

```
Error: expect(locator).toBeVisible() failed
Locator: getByRole('heading', { name: 'Get started', level: 1 })
```

### 绿阶段

新增 `tests/e2e/routing.spec.ts`，包含 7 个测试用例：

```
ok 1 [chromium] › tests\e2e\routing.spec.ts:3:1 › loads the student page at /student (360ms)
ok 2 [chromium] › tests\e2e\routing.spec.ts:11:1 › loads the teacher page at /teacher (272ms)
ok 3 [chromium] › tests\e2e\routing.spec.ts:19:1 › loads the login page at /login (299ms)
ok 4 [chromium] › tests\e2e\routing.spec.ts:27:1 › shows 404 page for unknown routes (287ms)
ok 5 [chromium] › tests\e2e\routing.spec.ts:35:1 › navigates between pages using nav links (400ms)
ok 6 [chromium] › tests\e2e\routing.spec.ts:54:1 › root path redirects to /student (253ms)
ok 7 [chromium] › tests\e2e\routing.spec.ts:62:1 › displays global layout with navigation (278ms)

7 passed (4.5s)
```

## 9. 最终全绿门禁

| 命令                   | 结果                                                |
| ---------------------- | --------------------------------------------------- |
| `npm run format:check` | ✅ 退出码 0；全部匹配文件符合 Prettier 格式         |
| `npm run lint`         | ✅ 退出码 0；0 error、0 warning                     |
| `npm run test:run`     | ✅ 退出码 0；1 个测试文件、6 个测试全部通过         |
| `npm run test:e2e`     | ✅ 退出码 0；Chromium 7 个测试通过                  |
| `npm run build`        | ✅ 退出码 0；Vite 6.4.3 转换 37 个模块并生成生产包  |
| `git diff --check`     | ✅ 退出码 0；无空白错误（CRLF 提示为 Windows 通知） |

## 10. 测试数量

| 类型       | 文件数 | 测试数 |
| ---------- | ------ | ------ |
| Vitest     | 1      | 6      |
| Playwright | 1      | 7      |
| **总计**   | **2**  | **13** |

## 11. 变更文件与职责

| 文件                                        | 职责                              |
| ------------------------------------------- | --------------------------------- |
| `package.json` / `package-lock.json`        | 新增 react-router-dom 依赖        |
| `src/app/router.tsx`                        | 集中定义路由配置                  |
| `src/app/router.test.tsx`                   | 路由单元测试                      |
| `src/layouts/AppLayout.tsx`                 | 全局布局（Header + Nav + Outlet） |
| `src/pages/student/StudentPage.tsx`         | 学生端占位页                      |
| `src/pages/teacher/TeacherPage.tsx`         | 教师端占位页                      |
| `src/pages/login/LoginPage.tsx`             | 登录占位页                        |
| `src/pages/not-found/NotFoundPage.tsx`      | 404 页面                          |
| `src/App.tsx`                               | 挂载 RouterProvider               |
| `src/App.css`                               | 全局布局样式                      |
| `src/index.css`                             | 简化基础样式                      |
| `tests/e2e/routing.spec.ts`                 | Playwright 路由验收测试           |
| `docs/day17-routing-layout-verification.md` | 验证记录                          |

## 12. 生成物、后台进程、凭据和范围检查

- `node_modules/`、`dist/`、`coverage/`、`playwright-report/` 和 `test-results/` 均由 Git 忽略
- Playwright 的 Vite webServer 由测试进程启动和停止
- 差异不含 `.env`、token、密钥、个人绝对路径或机器专属配置
- 未实现 Day18 或后续功能
- 未配置 CI、未创建 PR、未合并 main

## 13. 未执行事项

- 未实现真实登录、注册、退出或会话恢复
- 未实现角色权限、路由守卫、403 页面或鉴权重定向
- 未加入 Supabase、数据库、RLS 或环境变量
- 未加入 Zustand、Zod、TanStack Query 或实验状态机
- 未实现大件运输业务表单、规则、评分或流程
- 未实现 Three.js、React Three Fiber、Drei 或 Rapier
- 未配置 CI、部署或监控
- 未执行 Day18 或任何后续任务

## 14. 剩余风险与环境限制

- React Router v6 的 `v7_startTransition` 未来标志警告不影响当前功能
- Node.js 20.17 低于部分最新工具链的 20.19 最低要求，当前依赖版本已兼容
