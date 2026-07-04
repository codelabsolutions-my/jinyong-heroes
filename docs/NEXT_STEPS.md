# NEXT_STEPS.md — 交接与实施计划

> 写给下一个接手的 Claude session（任何模型）。目标：不需要读完整个对话历史，
> 只读这份文档 + 下面列的必读文件，就能直接开工 M2。
> 完成一个里程碑后：更新本文档（把下一个里程碑展开成同等细度）、更新
> PROJECT_OVERVIEW 的 Scope/Roadmap，然后才开下一个。

---

## 0. 当前状态（2026-07-04）

- **main：M0+M1+M2 已完成并 squash-merge**。工作树应干净、无遗留分支/worktree。
- **111 个单测全过**；`npm test && npm run lint && npx tsc --noEmit` 全绿。
- **可玩内容**：两张地图（无名小村 ↔ 后山小径）、NPC 对话（含条件变体）、线索日志（J）、
  存档（K）/读档（L）v1；**后山拦路强盗触发完整网格战棋战斗**（移动/攻击/武学/待机、
  三系克制、胜负回探索、胜利置 flag 不再重复触发）。
- **战斗系统全在 `src/game/battle/`（纯逻辑，零 Pixi，重度单测）**：rng / types / damage /
  range(BFS) / turnOrder / ai / setup / resolve。渲染在 `scenes/BattleScene`、`ui/BattleMenu`，
  交互在 `core/BattleController`。
- M1、M2 都经过 code review 并修完；教训固化成测试（存档校验、变体遮蔽、内容坏链、回放一致）。

### 必读文件（按顺序）

1. `CLAUDE.md` — 工作流程和架构铁律（worktree 分支、分层、测试、验证）
2. `docs/GAME_DESIGN.md` — 游戏系统设计（战斗规格 §4 已对齐 M2 实现）
3. `docs/PROJECT_OVERVIEW.md` — 当前里程碑 scope（现在是 M3）
4. `docs/DECISIONS.md` — 15 条 ADR，别推翻已定决策（战斗相关见 #12-#15）
5. `src/game/`（尤其 `battle/`）— 读 setup.ts + resolve.ts + types.ts 就懂战斗分层
6. `scripts/verify-m2.mjs` — 状态感知 e2e 范式（读 `__debug().battle` 驱动战斗）；M3 照抄结构
7. `docs/STORY_BIBLE.md` — 十四天书全流程；**M3 做《射雕》§2.9**
8. `docs/CHARACTERS_AND_SKILLS.md` — 属性/成长/队友/武学表（M3 历练升级、郭靖黄蓉数值从这取）

### 怎么跑

```bash
npm run dev                      # http://localhost:5173，方向键/WASD 移动
npm test && npm run lint && npx tsc --noEmit   # 提交前全检
# e2e（需先起 dev server，端口随意但要传对）：
npm run dev -- --port 5200 --strictPort &
node scripts/verify-m1.mjs http://localhost:5200 /tmp/shots   # 回归
node scripts/verify-m2.mjs http://localhost:5200 /tmp/shots
```

> ⚠️ **e2e 与地图内容耦合**：verify-*.mjs 里的导航是写死的按键序列。改了地图 NPC/地形
> 布局（比如 M2 在后山加了拦路强盗）就会撞车——M2 就因此改了 verify-m1 的绕行路径。
> 加内容后务必跑一遍旧的 verify 回归。

---

## 1. 流程须知（血泪坑，别再踩）

1. **永远 worktree 分支，永远不直接 commit main**（CLAUDE.md §1.1）。新 worktree 要
   `npm install`（node_modules 不共享）。
2. **pre-commit 第一次跑会因 prettier 改写文件而失败** — 这是正常行为：
   `git add -A` 再 commit 一次即可。
3. **squash-merge 后 `git branch -d` 会报 not fully merged** — 用 `git branch -D`，
   这是 squash 的正常结果。
4. **docs-guard hook** 会拦截"改了架构相关路径但没改文档"的提交 — 改系统代码时
   同一提交里更新 DECISIONS/GAME_DESIGN/CLAUDE.md，别用 `[no-adr]` 逃逸除非真的无关。
5. **merge 前必须跑 `/code-review`**（CLAUDE.md §1.6）。M1 的 review 抓出 8 个真 bug，
   这一步不能省。
6. **e2e 验证是"完成"的定义**：单测全绿 ≠ 完成。必须像 verify-m1.mjs 那样用真实
   按键在浏览器里走完整流程，断言 `window.__debug()` 的状态（探针在 `src/main.ts`，
   新增状态记得同步扩展探针）。
7. **别忘了收尾**：杀掉后台 dev server、`git worktree remove`、删分支。

---

## 2. M3「第一部天书」— 详细实施计划

**目标**：一条完整的小说线（《射雕》第 1、3 章，STORY_BIBLE §2.9），跑通
"剧情事件链 → 战斗 → 奖励 → 天书"闭环。这是第一次把 M1（对话/地图/存档）+ M2（战斗）
串成一条有始有终的线，并首次改存档格式。

> 前置阅读：STORY_BIBLE §2.9（射雕章节流程）、CHARACTERS_AND_SKILLS §2.1（历练升级曲线）
> 与 §4（郭靖/黄蓉系数）、GAME_DESIGN §4（战斗已实现）。

### 2.1 事件链系统（M3 的真正新东西）

M1 的对话只能线性播 + 末尾发 effect。M3 需要**多步、可分支、跨章的剧情事件**。
建议在 `src/game/story/` 建**声明式事件系统**（复用现有 Condition/Effect 词汇）：

```
src/game/story/types.ts     # StoryEvent { id, trigger: Condition, steps: Step[] }
                            # Step = dialogue | choice | battle | reward | setFlag | grantBook
src/game/story/runner.ts    # 纯逻辑：推进 event 的 step 指针，产出"下一步要 UI 做什么"
src/game/story/__tests__/   # 分支/条件/回放单测
src/data/story/shediao.ts   # 射雕线事件数据（章节流程翻译成 steps）
```

关键：runner 是**纯函数**（step 推进不碰 Pixi）；`choice` 分支按 Condition 选下一步；
`battle` step 复用 M2 的 setupBattle/BattleController，战斗结果（胜/败）回喂 runner 决定走向。
Game 需要把当前 `mode` 扩展或复用 dialogue/battle 来承载事件播放。**别把事件硬编码进 Game**
（ADR #3：加剧情不改引擎）。

### 2.2 存档格式升级（必做，M2 欠的账）

- `GameState` 加 `books: string[]`（已得天书 id）+ 战后延续所需的历练/武学熟练度字段。
- **bump `SAVE_VERSION` 1→2**，在 `src/game/save.ts` 已标注的迁移点写 v1→v2：
  老档（无 books/历练字段）补默认值。**迁移必须有单测**（喂一个 v1 档，断言升级后字段齐全）。
- 天书进度、历练值随存档持久化。

### 2.3 战斗奖励接通

- 战斗胜利 → 发历练值（升级按 CHARACTERS §2.1 曲线：`所需=100×lv^1.5`）+ 可能的武学习得。
- 新 Effect/Step：`grantBook`（发天书，放在**无变体遮蔽的主链**上，参照 content.test 的
  "变体遮蔽"守则）、`gainExp`、`learnSkill`。
- 郭靖/黄蓉：作**剧情战友军**自动加入该线的战斗（在 encounter 里作为 ally 阵容），
  数值按 CHARACTERS §4 系数。招募入常驻队伍是 M4，M3 只是"这一战他们并肩"。

### 2.4 内容 + 地图

- 新地图（牛家村/华山之巅，STORY_BIBLE §2.9），字符网格照 data/maps 格式。
- 日志（JournalPanel）加"天书"分册：14 格进度，已得高亮，未得显示入口线索。
- 欧阳锋一战设计为"打不过也能过"（坚持 N 回合触发洪七公救场）——需要战斗支持
  **回合数/自定义胜利条件**，M2 的 resolve 只有全灭判定，这里要扩展 outcome 触发器。

### 2.5 测试要求

- 逻辑单测：story runner（分支、条件、step 推进、战斗结果回喂）、存档 v1→v2 迁移、
  历练升级曲线、grantBook 幂等（不重复发）。
- 内容测试扩展：story 事件的引用完整性（battle→encounter、grantBook→书 id、
  跳转目标 event 存在），沿用 content.test 的坏链拦截风格。
- e2e `scripts/verify-m3.mjs`：从射雕线入口触发 → 走完事件链（含至少一场战斗）→
  断言拿到天书、books 含《射雕》、存读档保留天书。**跑 verify-m1/m2 回归**（§0 的耦合警告）。

### 2.6 M3 完成定义

1. verify-m3 全绿 + verify-m1/m2 回归仍绿；单测/lint/tsc 过；code review 跑过且修完
2. 存档 v1→v2 迁移有测试且旧档能升级
3. GAME_DESIGN / STORY_BIBLE 与实现对齐（同 PR 修）；DECISIONS 加 ADR
4. PROJECT_OVERVIEW Scope 换成 M4 并展开；本文档 §2 换成 M4 的同等细度计划

### 2.7 M2 落地后的现成积木（直接复用，别重造）

- `setupBattle({encounter, party, characterTable, skillTable, seed})` → BattleState
- `new BattleController(input, state, w, h)`；`.update(dt)`；`.result`（"victory"/"defeat"/null）；
  `.debugSnapshot()`（e2e 探针）
- `resolve(state, action, rng)` 纯函数；`enemyTurnActions`、`reachableTiles`、`targetsInRange`
- 对话 Effect `startBattle` 已通；Game 里 `enterBattle/endBattle` 是战斗进出的范例
- **M2 已知简化项**（GAME_DESIGN §4 末列）：无常驻系别、移动不可撤销、战不进档——
  M3/M4 视需要补齐；补哪个都要连带更新测试与文档。

---

## 3. M4-M6 概要（到时再展开；M3 详见 §2）

- **M4 江湖成形**：正邪值 + 门派声望字段进 GameState（bump 版本）、影响对话变体和
  招募；队伍系统（招募 1-2 名队友进战斗）；3 条小说线并行可触发。
- **M5 纵向切片**：开局→任一结局可玩通；像素素材替换色块（素材许可记录进
  docs/CREDITS.md，见 CLAUDE.md §2.2）；标题画面/新游戏/继续游戏入口。
- **M6 活江湖**：门派动态模拟（确定性 tick + 传闻叙事）、自创武功（点数预算）——
  设计见 `docs/AI_FEATURES.md`（⚠️ 无运行时 LLM、无后端，ADR #11）；创作期 LLM
  内容工作流从 M3 起就可用。

---

## 4. 已知技术债（接手时知悉，别当 bug 重修）

1. **位置权威还在渲染层 Player 精灵上**（ADR #9 之后 Game 靠 syncPlayerState 同步回
   GameState）。碰撞规则已抽纯（`src/game/movement.ts`）。**探索层**的重构仍推迟；
   注意战斗层没有这个问题——BattleState 是唯一权威，渲染只读。
2. **M2 战斗的刻意简化**（GAME_DESIGN §4 末列）：① 单位无常驻系别，防守方按无系结算
   （克制只在攻击方生效）；② 移动一经确认不可撤销（无 undo，SRPG 通常可回退）；
   ③ 敌方 AI 是最简趋近-攻击；④ 战斗不进存档、战后满血。M3/M4 按需补，别当 bug。
3. Toast 显示在顶部会盖住日志面板标题一角 — 纯视觉小瑕疵，M5 美术阶段一起处理。
4. `Input.destroy()` / `Player.teleport()` 目前无调用方 — 留着，别删（切场景清理和
   读档瞬移后续会用）。
5. golden-template 带来的 `.claude/skills/prod-migrate`、`verify-data`、`.env.example`
   对本项目暂无意义 — 无害，留着；若碍事可在独立 chore 分支清理。
6. 无远端仓库，CI workflows（`.github/workflows/`）从未跑过 — 若建 GitHub 远端，
   第一次推送后检查 ci.yml/smoke.yml 是否适配（smoke 假设有 .env/migrations，需删减）。

---

## 5. 内容创作速查（给写剧情的 session）

加一段新剧情 = 只动 `src/data/`（引擎零改动，这是 ADR #3 的验收标准）：

1. 地图：`src/data/maps/<name>.ts`（字符网格）+ 注册进 `maps/index.ts` + 出入口互连
2. NPC：`npcs/index.ts` 定义 + 地图 `npcs` 摆放（别占出生点/出口/落点，测试会拦）
3. 对话：`dialogues/index.ts`。⚠️ 变体会永久遮蔽默认对话——默认发的线索变体必须
   补发（`content.test.ts` 有测试拦截，报错信息会告诉你哪条）
4. 线索：`clues/index.ts`（category: 主线|传闻）
5. 跑 `npm test`——内容完整性测试会抓所有坏链（未知 id、NPC 占位冲突、行长不齐）
