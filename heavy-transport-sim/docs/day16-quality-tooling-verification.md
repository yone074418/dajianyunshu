# Day16 工程质量工具验证记录

> 编制日期：2026-06-24（Asia/Shanghai）
>
> 任务：第 3 周第 2 天（总第 16 天）配置 ESLint、Prettier、Vitest 和 Playwright

## 1. 范围与排除项

本次只为现有 Vite、React、TypeScript 工程增加质量工具、最小组件测试和浏览器冒烟测试。测试验证 Day15 页面显示 `Get started`，并验证计数按钮从 `Count is 0` 变为 `Count is 1`。

未实现 Day17 的功能目录、路由、学生端、教师端、登录页、404 页或全局布局；未加入 Zustand、Zod、Supabase、Three.js、React Three Fiber、Rapier、CI、部署或业务规则。

## 2. Git 基线与隔离

| 项目     | 值                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| 基线提交 | `8be0c2432583480ecf57e7eb38b137298be6d70e`                                                                  |
| 分支     | `ai-codex/week3-day16-quality-tooling`                                                                      |
| 远端关系 | `origin/main` 是本地 `main` 的祖先；本地 `main` 领先 8 个提交，因此按规则保留本地提交并以本地 `main` 为基线 |
| 隔离方式 | 在仓库外的系统临时目录创建独立 Git worktree；原工作目录中的用户未跟踪文件未被修改、移动、暂存或删除         |

## 3. 环境与版本

| 项目                        | 实际版本                                          |
| --------------------------- | ------------------------------------------------- |
| 操作系统                    | Microsoft Windows NT 10.0.26100.0                 |
| Node.js                     | 20.17.0                                           |
| npm                         | 10.8.2                                            |
| React / React DOM           | 18.3.1 / 18.3.1                                   |
| Vite                        | 6.4.3                                             |
| TypeScript                  | 5.6.3                                             |
| ESLint                      | 9.39.2                                            |
| typescript-eslint           | 8.50.0                                            |
| Prettier                    | 3.8.4                                             |
| Vitest / jsdom              | 4.1.9 / 26.1.0                                    |
| Testing Library React / DOM | 16.3.2 / 10.4.1                                   |
| Playwright Test             | 1.61.1                                            |
| Playwright Chromium         | Chrome for Testing 149.0.7827.55（revision 1228） |

ESLint 10 和 jsdom 29 的当前稳定版要求 Node.js 至少为 20.19，故未使用。`typescript-eslint` 8.62.0 的传递依赖 `eslint-visitor-keys` 5 同样要求 Node.js 20.19；最终固定使用 8.50.0，其依赖线与 Node.js 20.17、ESLint 9 和 TypeScript 5.6 兼容。

## 4. npm 脚本

| 脚本           | 用途                                                           |
| -------------- | -------------------------------------------------------------- |
| `dev`          | 启动 Vite 开发服务器                                           |
| `build`        | 执行 TypeScript build mode 检查并生成 Vite 生产包              |
| `preview`      | 预览生产包                                                     |
| `lint`         | ESLint 扫描源码、测试和 TypeScript 配置，warning 也视为失败    |
| `format`       | Prettier 写入 Day16 配置、测试、验证文档和现有 `src/` 文本源码 |
| `format:check` | 只检查同一范围的格式，不改写文件                               |
| `test`         | 以监听模式运行 Vitest                                          |
| `test:run`     | 单次运行 Vitest 并返回明确退出码                               |
| `test:e2e`     | 单次运行 Playwright Chromium 测试                              |

## 5. 四类红—绿验证

| 工具       | 临时错误                                           | 红阶段命令与结果                 | 关键失败原因                                                             | 恢复动作                                                       | 绿阶段结果                       |
| ---------- | -------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------- | -------------------------------- |
| ESLint     | 在 `src/App.tsx` 加入未使用的 `day16LintProbe`     | `npm run lint`，退出码 1         | `@typescript-eslint/no-unused-vars` 在探针所在行报告 1 error、0 warnings | 删除临时常量                                                   | 同一命令退出码 0                 |
| Prettier   | 创建格式不合规的 `src/test/day16-format-probe.ts`  | `npm run format:check`，退出码 1 | 明确列出该文件并报告 code style issues                                   | 删除临时文件                                                   | 同一命令退出码 0                 |
| Vitest     | 把点击后的预期从 `Count is 1` 改为 `Count is 2`    | `npm run test:run`，退出码 1     | 计数测试 1 项失败；页面实际可访问按钮为 `Count is 1`                     | 恢复正确断言                                                   | 1 个文件、2 个测试通过，退出码 0 |
| Playwright | 把首页标题预期改为不存在的 `Day16 missing heading` | `npm run test:e2e`，退出码 1     | Chromium 等待标题 5 秒后报告 element not found                           | 恢复 `Get started` 断言并清理截图、视频、trace、报告和结果目录 | Chromium 1 个测试通过，退出码 0  |

每类验证后均检查差异；`day16LintProbe`、`day16-format-probe.ts`、`Count is 2` 和 `Day16 missing heading` 均未残留。

## 6. 最终全绿门禁

以下命令于 2026-06-24（Asia/Shanghai）从最终代码状态逐条执行：

| 命令                   | 执行时间          | 实际结果                                        |
| ---------------------- | ----------------- | ----------------------------------------------- |
| `npm run format:check` | 21:55:27–21:55:28 | 退出码 0；全部匹配文件符合 Prettier 格式        |
| `npm run lint`         | 21:55:37–21:55:39 | 退出码 0；0 error、0 warning                    |
| `npm run test:run`     | 21:55:48–21:55:50 | 退出码 0；1 个测试文件、2 个测试全部通过        |
| `npm run test:e2e`     | 21:56:03–21:56:09 | 退出码 0；Chromium 1 个测试通过                 |
| `npm run build`        | 21:56:21–21:56:23 | 退出码 0；Vite 6.4.3 转换 31 个模块并生成生产包 |
| `git diff --check`     | 21:56:35          | 退出码 0；无空白错误                            |

`git diff --check` 输出的 CRLF 提示是 Windows 上 Git 对未来工作树换行转换的通知，不是空白错误，命令实际退出码为 0。

## 7. 文件职责

| 文件                                         | 职责                                                              |
| -------------------------------------------- | ----------------------------------------------------------------- |
| `package.json` / `package-lock.json`         | 固定工具依赖并提供稳定 npm 脚本                                   |
| `eslint.config.js`                           | ESLint flat config，覆盖 TypeScript、React Hooks 和 React Refresh |
| `.prettierrc.json` / `.prettierignore`       | 格式参数与仅针对依赖、生成物、锁文件和二进制资产的排除规则        |
| `vitest.config.ts`                           | React 插件、jsdom、setup 文件和测试范围                           |
| `src/test/setup.ts`                          | 统一加载 jest-dom 断言并在每个测试后清理 DOM                      |
| `src/App.test.tsx`                           | Day15 标题和计数器的两个组件行为测试                              |
| `playwright.config.ts`                       | Chromium、固定 baseURL、超时、webServer 和失败产物策略            |
| `tests/e2e/app.spec.ts`                      | 浏览器验证首页、标题和计数交互                                    |
| `.gitignore`                                 | 排除 coverage、Playwright 报告和测试结果                          |
| `docs/day16-quality-tooling-verification.md` | 记录环境、版本、红绿证据、最终门禁和范围自检                      |

## 8. 生成物、进程、凭据与范围检查

- `node_modules/`、`dist/`、`coverage/`、`playwright-report/` 和 `test-results/` 均由 Git 忽略；浏览器缓存位于仓库外。
- Playwright 红阶段生成的截图、视频、trace、HTML 报告和测试结果目录已删除。
- Playwright 的 Vite webServer 由测试进程启动和停止；提交前再次检查端口及后台进程。
- 差异不含 `.env`、token、密钥、个人绝对路径或机器专属配置。
- 原工作目录的 `.claude/`、两个 Day13 设计/计划文件和 `heavy-transport-sim/dev-output.txt` 保持未跟踪且未被触碰。

## 9. 未执行事项

未执行 Day17 或任何后续功能；未配置 CI；未创建 PR；未合并 `main`；未删除其他分支或工作树。

## 10. 剩余风险与环境限制

- 当前 Node.js 20.17 低于部分最新工具链的 20.19 最低要求，因此 ESLint 使用 9.x、jsdom 使用 26.x、typescript-eslint 固定为 8.50.0；升级 Node.js 后应重新核对依赖线，而不是直接批量升级。
- `npm install` 报告 `whatwg-encoding@3.1.1` 已弃用；它是 jsdom 26 兼容线的传递依赖，不影响本次测试，但未来升级 Node.js 与 jsdom 时应复核。
- Playwright Chromium 首次运行依赖仓库外的浏览器缓存；在新机器或清空缓存后需要重新执行 `npx playwright install chromium`。
