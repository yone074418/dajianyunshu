# GAP-003关闭与主分支合并 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将已批准的专业判定契约分层方案同步到候选基线，关闭GAP-003，验证全部远程分支后安全合并并推送`main`。

**Architecture:** 以PCR-009追加式变更记录为治理入口，不回写Day7历史结论；专业判定契约在G1冻结，具体案例配置按第50—91天生成并受发布门禁控制。所有远程功能分支先验证均被整改分支包含，再以快进方式更新`main`。

**Tech Stack:** Markdown、Git、PowerShell；不安装依赖，不编写业务代码。

---

### Task 1: 同步专业判定契约候选基线

**Files:**
- Modify: `docs/G1剩余阻断项决策与材料包.md`
- Modify: `docs/专业规则与案例参数证据审计.md`
- Modify: `docs/专业规则目录.md`
- Modify: `docs/实验状态机设计.md`
- Modify: `大件运输虚拟仿真实验教学系统_单人复刻126天计划.md`

- [x] **Step 1: 登记PCR-009与批准结论**

在整改材料包记录：G1冻结判定契约；第50—91天形成案例配置；疑似错式不用于自动判分；配置不完整阻断案例发布但不计学生错误。

- [x] **Step 2: 同步规则与状态机边界**

把ARC/ORT疑似错式从“等待修正式”改为“首版展示但禁止自动判分”；自动校验仅使用已发布版本化案例真值。保持15状态和54转换编号不变。

- [x] **Step 3: 同步计划职责**

在G1说明中明确冻结判定契约与配置发布门禁；保留第50—91天原有案例数据和功能制作任务。

- [x] **Step 4: 追加式关闭问题**

关闭GAP-003、BLOCK-007、ACT-009；保留Day7原始“未关闭”历史记录，并明确关闭不代表案例值已经制作。

### Task 2: 文档与状态机验证

**Files:**
- Test: `docs/*.md`

- [x] **Step 1: 检查占位与矛盾**

运行PowerShell `Select-String`，确认当前候选文档不再把GAP-003写为未关闭，不出现未决占位标记或用疑似错式自动判分的表述。

- [x] **Step 2: 检查Markdown结构**

逐表比较未转义竖线数量；预期本次修改文件表格错误为0。运行`git diff --check`；预期无输出。

- [x] **Step 3: 检查固定状态机**

从`docs/实验状态机设计.md`提取并去重`LS-*`及`ENT/S1—S6/HLP/ERR/END-*`编号；预期生命周期状态15、转换54、Mermaid 3。

- [ ] **Step 4: 提交并推送整改分支**

只暂存计划与本任务文档，排除`.claude/`。提交信息：`关闭GAP-003并完成G1阻断整改`。推送`ai-ds/g1-blocker-remediation`。

### Task 3: 审查并合并远程分支

**Files:**
- Verify: Git refs and commit graph

- [ ] **Step 1: 刷新远程引用**

运行`git fetch --prune origin`；预期成功且无未处理冲突。

- [ ] **Step 2: 审查全部远程分支**

对`refs/remotes/origin`每个分支执行祖先检查；除整改分支外，预期所有功能分支头均为整改分支祖先。若存在未包含分支，停止合并并先审查差异。

- [ ] **Step 3: 验证main可快进**

确认工作区除用户既有`.claude/`外无改动，且`origin/main`是整改分支祖先。预期`git merge-base --is-ancestor origin/main ai-ds/g1-blocker-remediation`成功。

- [ ] **Step 4: 快进本地main**

切换`main`，以`git merge --ff-only ai-ds/g1-blocker-remediation`合并。任何非快进结果均停止，不创建隐式合并提交。

- [ ] **Step 5: 合并后复验并推送**

复查15状态、54转换、Markdown表格、`git diff --check`和提交图；全部通过后运行`git push origin main`。不创建Pull Request。
