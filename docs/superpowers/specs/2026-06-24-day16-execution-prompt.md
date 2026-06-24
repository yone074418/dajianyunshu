# Day16 工程质量工具配置执行提示词（完整版强约束）

```text
你是本仓库《大件运输虚拟仿真实验教学系统_单人复刻126天计划》第16天任务的执行代理。请基于最新 main，严格完成“配置 ESLint、Prettier、Vitest、Playwright”，并用可复现的红—绿证据证明：故意制造错误时检查确实失败，修复后全部检查通过。

你必须实际检查仓库、修改文件、安装依赖、运行命令、记录证据、提交并推送独立分支。不得只给建议或计划。不得执行第17天及任何后续任务。

一、唯一目标和完成定义

1. 唯一工程范围是仓库根目录下的 `heavy-transport-sim/`。
2. 为现有 Vite + React + TypeScript 工程配置并验证：
   - ESLint；
   - Prettier；
   - Vitest；
   - Playwright。
3. 每类工具都必须存在稳定、可重复执行的 npm 脚本。
4. 必须分别完成 ESLint、Prettier、Vitest、Playwright 的红—绿验证：
   - 临时制造一个可归因的错误；
   - 运行对应命令并确认非零退出；
   - 核对失败原因确实来自该临时错误；
   - 修复或删除临时错误；
   - 再运行对应命令并确认退出码为零。
5. 故意失败内容不得提交。最终必须重新运行格式检查、Lint、Vitest、Playwright 和生产构建，且所有命令均以当前最终文件状态退出为零。
6. Day16 通过仅表示工程质量工具和最小冒烟测试底座完成，不表示第17天路由、业务功能、CI、G2或系统功能已经完成。

二、必须阅读的仓库事实

行动前完整读取并核对：

- `大件运输虚拟仿真实验教学系统_单人复刻126天计划.md` 中第15、16、17天及第21天条目；
- `docs/superpowers/specs/2026-06-24-day16-quality-tooling-prompt-design.md`；
- `heavy-transport-sim/package.json`；
- `heavy-transport-sim/package-lock.json`；
- `heavy-transport-sim/tsconfig.json`；
- `heavy-transport-sim/tsconfig.app.json`；
- `heavy-transport-sim/tsconfig.node.json`；
- `heavy-transport-sim/vite.config.ts`；
- `heavy-transport-sim/src/App.tsx`；
- `heavy-transport-sim/src/main.tsx`；
- `heavy-transport-sim/docs/day15-scaffold-verification.md`；
- 根目录和工程目录的 `.gitignore`；
- 最近 Git 提交图、本地/远程分支及工作树状态。

不得假定 Day15 的旧日志仍能证明当前状态。版本、脚本、构建和测试结论必须以本次实际命令输出为准。

三、Git 预检、最新 main 判定和隔离规则

1. 先执行并阅读：
   - `git status --short --branch`；
   - `git remote -v`；
   - `git branch -a -vv`；
   - `git worktree list --porcelain`；
   - `git log --graph --oneline --decorate --all -30`。
2. 执行 `git fetch origin --prune`。若因沙箱、网络或认证失败，按环境规则申请必要权限后重试；仍失败则报告真实阻断，不得声称已核对最新远程状态。
3. 安全判断 Day16 基线：
   - 若本地 `main` 与 `origin/main` 相同，使用该提交；
   - 若本地 `main` 是 `origin/main` 的祖先，只允许快进本地 `main` 后使用；
   - 若 `origin/main` 是本地 `main` 的祖先，说明本地 `main` 含尚未推送提交，必须保留并以本地 `main` 为基线，不得重置或丢弃；
   - 若两者已分叉，停止并报告双方提交，不得自行 rebase、merge、reset 或选择一边掩盖分叉。
4. 检查本地和远程是否已存在 `ai-codex/week3-day16-quality-tooling`：
   - 不存在时，从上一步确定的 main 提交创建；
   - 存在时先核对来源、提交和工作树占用情况；
   - 不得强制覆盖、删除、重置或复用一个来源不明的同名分支。无法安全续接时停止报告。
5. 当前仓库可能存在不属于 Day16 的未跟踪或未提交文件。不得删除、覆盖、暂存、移动或 stash 它们。
6. 优先在仓库内安全路径创建独立 Git worktree 来执行 Day16，使原工作目录和用户文件保持原状。创建前确认目标目录不存在，创建后确认 HEAD 正是选定的 main 基线和 Day16 分支。
7. 不得改写历史、强推、合并 main、创建 PR或删除其他分支/工作树。

四、绝对范围边界

允许创建或修改的 Day16 业务文件仅限：

- `heavy-transport-sim/package.json`；
- `heavy-transport-sim/package-lock.json`；
- ESLint 配置文件；
- Prettier 配置和忽略文件；
- Vitest 配置、测试初始化文件和最小组件测试；
- Playwright 配置和最小端到端测试；
- 为通过格式和 Lint 所必需的现有 Day15源码格式调整；
- `heavy-transport-sim/docs/day16-quality-tooling-verification.md`；
- 为排除 Day16 生成物所必需的 `heavy-transport-sim/.gitignore` 调整。

禁止：

1. 不得实现第17天的功能目录、路由、学生端、教师端、登录页、404页或全局布局。
2. 不得加入 Zustand、Zod、Supabase、Three.js、React Three Fiber、Rapier、CI、部署或业务规则。
3. 不得重做 Day15 页面设计，不得借测试之名新增业务功能。
4. 不得修改根目录需求基线、G1冻结、论文映射、状态机、数据库或验收文档。
5. 不得升级 React、Vite、TypeScript 或其他 Day15核心依赖，除非当前版本与 Day16 工具存在已实际验证的兼容阻断；如确需调整，先记录原始错误、最小变更理由和影响，禁止顺手升级。
6. 不得提交 `node_modules/`、`dist/`、`coverage/`、`playwright-report/`、`test-results/`、浏览器缓存、截图、视频、trace、运行日志、临时探针或密钥。

五、依赖和配置要求

1. 记录实际 Node、npm、操作系统、React、Vite、TypeScript 版本。
2. 选择与仓库现有 React 18、Vite 6和TypeScript 5.6兼容的稳定依赖，不得仅凭记忆写入不存在的版本。
3. ESLint 至少覆盖 TypeScript、React Hooks 和 React Refresh；使用适合当前 ESLint 主版本的配置方式。最终 `lint` 必须扫描项目源码、测试和配置文件，并使用零 warning 门禁。
4. Prettier 必须提供写入格式和只检查格式两种脚本。合理忽略依赖、构建、覆盖率、Playwright报告、测试结果、二进制资产和锁文件；不得忽略 `src/`、测试文件或质量配置来制造假通过。
5. Vitest 使用适合 React 组件的 DOM 环境，配置统一测试初始化，并接入 Testing Library 的 DOM 断言。
6. Vitest 最小测试必须验证现有 Day15 页面，而不是虚构未来业务：
   - 页面渲染 `Get started` 标题；
   - 点击计数按钮后，文本从 `Count is 0` 变为 `Count is 1`。
7. Playwright 至少配置 Chromium 项目，通过 `webServer` 启动当前 Vite 开发服务器，使用固定本地地址和明确超时，并在测试结束后可靠停止。
8. Playwright 最小端到端测试必须从浏览器验证：
   - 首页可访问；
   - `Get started` 标题可见；
   - 点击计数按钮后显示 `Count is 1`。
9. 如本机没有所需 Chromium，执行官方 Playwright 浏览器安装命令。安装失败不得跳过测试或改成只检查配置文件。
10. 不得把单元测试和端到端测试写成只断言 `true`、只检查文件存在、捕获异常后仍通过或其他无业务意义的假测试。

六、npm 脚本契约

`heavy-transport-sim/package.json` 至少提供以下脚本，名称不得偷换：

- `dev`：启动 Vite；
- `build`：TypeScript 构建检查并生成 Vite 生产包；
- `preview`：预览生产包；
- `lint`：运行 ESLint 且 warning 视为失败；
- `format`：使用 Prettier 写入格式；
- `format:check`：只检查格式，不修改文件；
- `test`：Vitest 交互/监听模式；
- `test:run`：Vitest 单次运行并返回明确退出码；
- `test:e2e`：Playwright 单次端到端测试。

可增加一个顺序执行最终门禁的 `check` 脚本，但它不能替代分别运行和记录每一项检查。不得删除 Day15已有脚本。

七、建议文件职责

遵循项目实际工具版本选择合法扩展名，但职责必须清楚：

- ESLint 配置：规则、插件、文件范围和生成物忽略；
- Prettier 配置：统一格式参数；
- `.prettierignore`：只排除生成物、依赖、锁文件和二进制资产；
- `vitest.config.ts`：React插件、DOM环境、setup文件和测试范围；
- `src/test/setup.ts`：统一加载DOM扩展断言和必要清理；
- `src/App.test.tsx`：两个最小组件行为测试；
- `playwright.config.ts`：测试目录、Chromium、baseURL、webServer、报告器和生成物策略；
- `tests/e2e/app.spec.ts`：首页和计数交互端到端测试；
- `docs/day16-quality-tooling-verification.md`：环境、版本、红—绿证据、最终全绿证据、范围自检和未执行事项。

不要为了满足文件名机械创建重复配置。若工具版本要求不同结构，记录选择及原因，但必须保持职责和验收能力等价。

八、实施顺序

1. 完成 Git 预检、基线选择和隔离工作树。
2. 在任何修改前运行当前 `npm run build`，确认 Day15基线；失败则先判断是否为环境问题或既有缺陷。不得把既有失败悄悄归入 Day16修改。
3. 安装 ESLint 和 Prettier 依赖，建立配置和脚本，格式化 Day16范围内文本文件。
4. 安装 Vitest 与 React Testing Library 依赖，建立配置、setup和最小组件测试。
5. 安装 Playwright 测试依赖和 Chromium，建立配置与最小端到端测试。
6. 更新忽略规则，确保全部测试生成物不会进入提交。
7. 执行第九节四类红—绿验证。
8. 编写验证记录，记录真实命令、退出码和关键证据，不粘贴海量日志，不编造未执行结果。
9. 执行第十节最终全绿门禁。
10. 检查差异、暂存精确文件、提交并推送。

九、四类红—绿验证

通用规则：

- 红阶段必须由本次临时修改唯一触发；不能把网络失败、缺浏览器、配置错误或既有错误冒充预期红灯。
- 每次红阶段都要记录命令、非零退出码和能定位临时错误的关键输出。
- 绿阶段必须先恢复该临时错误，再运行同一命令并得到零退出码。
- 使用临时探针文件时，验证后彻底删除；临时修改正式测试时，必须精确恢复正确断言。
- 每完成一类验证就检查 `git diff`，确认没有遗留故意失败内容。

1. ESLint 红—绿：
   - 临时加入一个能被当前 ESLint 规则稳定捕获的 TypeScript/React错误；
   - 运行 `npm run lint`，确认非零退出且错误指向该探针；
   - 删除或修复探针；
   - 再运行 `npm run lint`，确认退出码为零。
2. Prettier 红—绿：
   - 临时创建或修改一个纳入检查范围且格式明确不合规的文本文件；
   - 运行 `npm run format:check`，确认非零退出且指出该文件；
   - 使用项目 Prettier 修复或恢复文件；
   - 再运行 `npm run format:check`，确认退出码为零。
3. Vitest 红—绿：
   - 临时将一个有意义的组件断言改成确定错误的预期；
   - 运行 `npm run test:run`，确认非零退出且失败用例正是该断言；
   - 恢复正确断言；
   - 再运行 `npm run test:run`，确认全部测试通过且退出码为零。
4. Playwright 红—绿：
   - 临时将一个稳定的页面断言改成确定不存在的标题或错误计数结果；
   - 运行 `npm run test:e2e`，确认非零退出且失败用例正是该断言；
   - 恢复正确断言；
   - 再运行 `npm run test:e2e`，确认全部端到端测试通过且退出码为零；
   - 清除失败阶段产生的截图、视频、trace、报告和测试结果目录。

十、最终全绿门禁

红—绿验证全部结束、故意错误全部恢复后，必须从最终工作树重新依次运行：

1. `npm run format:check`
2. `npm run lint`
3. `npm run test:run`
4. `npm run test:e2e`
5. `npm run build`
6. `git diff --check`

每条命令都必须实际执行并得到零退出码。任一失败都必须修复后从相关检查重新运行；在全部获得当前证据前不得使用“全绿”“完成”或同义结论。

此外必须检查：

- Playwright启动的Vite进程已结束；
- 没有残留浏览器或本任务启动的后台进程；
- `node_modules/`、`dist/`、`coverage/`、`playwright-report/`、`test-results/`和浏览器缓存未被追踪；
- 没有 `.env`、token、密钥、个人路径或机器专属配置进入差异；
- 没有 Day17及后续功能；
- 原工作目录中的用户未提交文件未被改变。

十一、验证记录要求

创建 `heavy-transport-sim/docs/day16-quality-tooling-verification.md`，至少包含：

1. 任务范围和明确排除项；
2. 基线提交、Day16分支和隔离方式；
3. Node、npm、操作系统及关键依赖实际版本；
4. 新增脚本及用途；
5. ESLint、Prettier、Vitest、Playwright 四类红—绿表格：临时错误、红阶段命令、非零退出码、关键失败原因、恢复动作、绿阶段命令和零退出码；
6. 最终六条门禁命令、执行时间和结果；
7. 变更文件清单和每个文件职责；
8. 生成物、进程、凭据和范围检查；
9. 未执行 Day17、未配置 CI、未创建 PR、未合并 main 的声明；
10. 仍存在的真实风险或环境限制。没有风险时写明核对范围，不得空置。

记录必须基于本次输出；不得复制 Day15日志或只写“已通过”。

十二、提交前范围检查

1. 执行 `git status --short`、`git diff --stat`、`git diff --check`。
2. 逐个审阅所有差异，确认每项都属于第四节允许范围。
3. 搜索并移除：
   - 临时红灯探针；
   - 故意失败断言；
   - `TODO`、`TBD`或无解释占位；
   - 调试输出和海量运行日志；
   - 测试报告、截图、视频、trace和覆盖率生成物；
   - 密钥、token、绝对个人路径和环境凭据。
4. 只暂存 Day16允许文件。
5. 使用 `git diff --cached --name-only` 和 `git diff --cached --check` 核对暂存区。若混入无关文件，停止并精确移出暂存区，不得删除用户文件。
6. 暂存后再次运行最终全绿门禁；若格式化或修复产生新差异，重新审阅并精确暂存。

十三、提交与推送

只有所有完成条件满足后才允许：

1. 提交信息精确为：`完成第3周第2天工程质量工具配置`。
2. 推送 `ai-codex/week3-day16-quality-tooling` 并设置上游。
3. 推送后核对远程分支提交哈希与本地 HEAD 一致。
4. 不创建 PR，不合并 main，不删除分支，不执行 Day17。

若提交成功但推送失败，必须如实报告“本地已提交、远程未推送”及原始原因，不得宣称任务完全交付。

十四、最终回报格式

完成后只回报：

- 基线提交、分支名、提交哈希和远程推送核对结果；
- 变更文件及职责；
- 实际安装的关键工具版本和 npm 脚本；
- 四类红—绿验证：红阶段退出码/原因与绿阶段结果；
- 最终 `format:check`、`lint`、`test:run`、`test:e2e`、`build`、`git diff --check` 的实际结果；
- Vitest和Playwright测试数量；
- 生成物、后台进程、凭据和范围检查结果；
- 剩余风险或环境限制；
- 明确说明未创建 PR、未合并 main、未执行 Day17。

不要回报未实际执行的命令，不要把依赖安装成功等同于测试通过，不要把一次旧构建当作最终全绿证据。
```
