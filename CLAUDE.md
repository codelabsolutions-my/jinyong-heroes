# CLAUDE.md — jinyong-heroes

> **What this file is:** the **HOW** — the operating manual every Claude session and agent reads first.
> **WHY / WHAT** lives in `docs/PROJECT_OVERVIEW.md` (vision, scope, build plan).
> Game systems and content design live in `docs/GAME_DESIGN.md`.
> Architectural decisions live in `docs/DECISIONS.md` (append-only ADR log).
> When this doc and the code disagree, the code is wrong — fix one or the other in the same PR.

**One-liner:** 《金庸群侠传》(1996) 的现代化 Web 重制 — 保留原版剧情骨架与开放式玩法，加入现代游戏设计与扩展剧情。个人学习/同人项目，不商业化。

---

## 1. Mandatory Development Workflow

**Every feature, fix, or chore follows this process. No exceptions.**

### 1.1 Git worktree branch — ALWAYS

No direct commits to `main`. Create an isolated worktree for every unit of work:

```bash
git worktree add ../jinyong-heroes-<branch-name> -b <type>/<title>
# feat/battle-grid, fix/camera-clamp, chore/upgrade-pixi
```

### 1.2 Tests — ALWAYS

All new code ships with tests, written alongside the implementation, not after.

- Vitest — `__tests__/*.test.ts` co-located with source
- 游戏逻辑（战斗结算、正邪值、存档、地图碰撞、剧情条件）必须可以脱离 Pixi 渲染层单独测试 — 这是 §5.1 分层规则存在的原因
- Run the full check before every commit: `npm test && npm run lint && npx tsc --noEmit`

### 1.3 Verify before claiming done — ALWAYS

"Tests pass" is necessary, not sufficient. Before reporting a task complete:

1. Run lint + typecheck + tests.
2. `npm run dev` 打开游戏，实际操作被改动的流程（走地图、进战斗、触发剧情），报告你观察到的行为 — 不是应该发生的行为。
3. For UI/画面 work: compare against the acceptance criteria in the design brief (§4).

### 1.4 Conventional commits — ALWAYS

```
<type>(<scope>): <description>
feat(battle): add turn order by speed stat
fix(map): block movement into water tiles
content(story): add Tianlong chapter 2 events
```

Commit at every meaningful checkpoint, not once at day-end. Small, lane-scoped commits.

### 1.5 Update docs in the same PR — WHEN APPLICABLE

- `docs/DECISIONS.md` — one ADR row for every architectural decision, in the PR that ships it
- `docs/GAME_DESIGN.md` — when game systems/数值/剧情结构 change
- `CLAUDE.md` — when architecture rules, stack, commands, or ownership lanes change
- `README.md` — when setup, prerequisites, or commands change

**This is enforced, not optional:** `.claude/hooks/docs-guard.sh` blocks doc-less commits
touching architecture-significant paths; the `docs-guard` CI job re-checks the PR.
Escape hatch: `[no-adr]` in the commit command or PR title, with justification.

### 1.6 PR → review → squash-merge → remove worktree

Run `/code-review` on the branch before merging. Then squash-merge and
`git worktree remove ../jinyong-heroes-<branch-name>`.

---

## 2. Safety Rules (Non-Negotiable)

1. **Secrets never appear in chat, code, or commits.** （本项目目前无后端，无 key；若未来加云存档等服务，key 走 `.env` + GitHub secrets，只用 env-var 名字引用。）
2. **原版游戏的素材（图片/音乐/数据文件）不进仓库。** 本项目只用自制、AI 生成或明确可用授权（CC0/CC-BY）的素材，`docs/CREDITS.md` 记录每份第三方素材的来源和许可。剧情文本是基于金庸小说的同人再创作，保持非商业定位。
3. **`node_modules/`、build 输出、大型二进制不进仓库。** `.gitignore` enforces this — do not weaken it.
4. **存档格式变更必须向后兼容或带迁移。** 玩家存档是玩家的"生产数据"——`SaveData` 带 `version` 字段，加载旧版本必须能升级或明确报错，never 静默丢档。

---

## 3. Session Discipline

1. **One workstream per session.** 引擎/系统开发、剧情内容编写、美术素材接入是不同的 workstream，分开对话。
2. **Batches of 4+ items go in a checklist file, not a chat message.** Copy `docs/TASKS.md`, number the items, mark each `[x]` as verified done.
3. **Long unattended runs** write progress to a status file the session can be resumed from.

---

## 4. Design Briefs for UI Work

Any non-trivial UI/画面 task starts from `docs/DESIGN_BRIEF.md` (copy it per feature). Minimum: one reference screenshot or sketch (原版截图 or mockup), 3 must-haves, 3 must-nots, and the device/viewport it must look right on.

---

## 5. Architecture Rules (Non-Negotiable)

1. **逻辑与渲染分层。** `src/game/`（规则、数值、状态 — 纯 TS，零 Pixi 依赖，全部可单测）与 `src/scenes|world|entities/`（Pixi 渲染层）严格分离。渲染层读游戏状态，通过命令/事件改游戏状态，never 反过来。
2. **内容即数据。** 剧情、对话、地图、武学、人物属性全部是 `src/data/` 下的类型化数据文件，不写死在系统代码里。加一段新剧情不应该改引擎代码。
3. **剧情触发用声明式条件。** 事件的触发条件（正邪值区间、队伍成员、天书数量、flag）用数据表达，由统一的 `ConditionEvaluator` 求值 — 不散落 if/else。
4. **存档可序列化。** 全部游戏状态收敛在一个可 JSON 序列化的 `GameState`，带 version 字段（见 §2.4）。
5. **确定性战斗核心。** 战斗结算是纯函数 `(state, action, rng) => newState`，RNG 显式注入 — 可回放、可测试。
6. **像素完美渲染。** 逻辑分辨率 960×640、整数缩放、`antialias: false`、贴图 nearest-neighbor。不在世界坐标里出现小数位移的模糊贴图。

---

## 6. Tech Stack

- **Runtime:** TypeScript 5 + Vite 6 + PixiJS 8（Web，纯前端，无后端）
- **Testing:** Vitest
- **Lint:** ESLint 9 (flat config) + typescript-eslint
- **素材:** 自制/AI 生成像素素材 + CC0/CC-BY 素材（记录于 docs/CREDITS.md）
- **部署:** 静态站点（后续定：GitHub Pages / Cloudflare Pages）

---

## 7. Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server (http://localhost:5173)
npm test             # run all tests
npm run lint         # lint
npm run build        # typecheck + production build
```

---

## 8. Repo Map & Ownership Lanes

No two agents own the same directory — this is what makes parallel agent runs safe.
Coordinate through shared contracts/types, never by editing another lane's code.

| Dir                                                     | Owner lane       | Notes                                            |
| ------------------------------------------------------- | ---------------- | ------------------------------------------------ |
| `src/game/`                                             | systems-engineer | 纯逻辑：战斗、正邪值、队伍、存档（零 Pixi 依赖） |
| `src/scenes/`, `src/world/`, `src/entities/`, `src/ui/` | render-engineer  | Pixi 渲染层，读 game 状态                        |
| `src/data/`                                             | content-author   | 地图、剧情、对话、武学、人物数据                 |
| `src/core/`                                             | systems-engineer | 引擎胶水：输入、场景管理、资源加载               |
| `assets/`                                               | content-author   | 素材 + CREDITS.md 同 PR 更新                     |
| CI, infra                                               | devops           | cross-cutting                                    |

---

## 9. Definition of Done (per milestone)

见 `docs/PROJECT_OVERVIEW.md` 的里程碑表。每个里程碑通用标准：

1. 该里程碑的玩法可以在浏览器里从头到尾实际玩通（不是"代码写完了"）。
2. 游戏逻辑有单测覆盖；All CI workflows green; no secrets in tree; docs updated.
3. 存档在该里程碑内保持兼容（或带迁移）。
