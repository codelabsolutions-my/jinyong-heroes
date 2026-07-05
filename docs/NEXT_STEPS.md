# NEXT_STEPS.md — 交接与实施计划

> 写给下一个接手的 Claude session（任何模型）。目标：不需要读完整个对话历史，
> 只读这份文档 + 下面列的必读文件，就能直接开工 M5。
> 完成一个里程碑后：更新本文档（把下一个里程碑展开成同等细度）、更新
> PROJECT_OVERVIEW 的 Scope/Roadmap，然后才开下一个。

---

## 0. 当前状态（2026-07-05）

- **main：M0+M1+M2+M3+M4 已完成并 squash-merge**。工作树应干净、无遗留分支/worktree。
- **242 个单测全过**；`npm test && npm run lint && npx tsc --noEmit && npm run build` 全绿。
- **M4 可玩内容**：两条剧情线可触发——① 无名小村「说书先生」(14,14) 点火**射雕线**（switchMap 走进
  牛家村/华山、郭靖黄蓉并肩、撑回合胜欧阳锋、授《射雕》、**走完招募郭靖/黄蓉入常驻队伍**）；
  ② 「镖师」(5,14) 点火**鸳鸯刀线**（太岳四侠→**放走/扭送正邪抉择**→卓天雄→授《鸳鸯刀》，
  完成后镖师按正邪值走不同变体）。招募的队友会带进后续战斗（enterBattle 出战完整队伍）。
- **M4 新增系统层**（纯逻辑，重度单测）：`state.ts`（morality/reputation/party + 存档 v3）、
  `conditions.ts`（正邪/队友/声望条件）、`progression.ts`（companionStats 系数折算、recruit/switchMap/
  adjustMorality 落地）、`battle/`（buff/debuff status 引擎：effectiveStat/decay）、`story/`（recruit/
  switchMap/adjustMorality steps）。集成在 `core/Game.ts`（enterBattle 带队、switchMap rebuildScene、
  morality/招募 toast）。内容：鸳鸯刀线、新人物/遭遇/对话。
- M1–M4 都经过 code review；M4 审查未发现真 bug（diff 干净）。教训固化成测试。
- **⚠️ M4 刻意简化（M5 补，见 ADR #27）**：① **队友 `coeff`/`companionStats` 未接入 `setupBattle`**——
  队友/主角战斗数值仍用静态 `CharacterDef`（接入需重新平衡已发布数值，M5 做）；② **`choice` 无交互选择 UI**
  ——Game 自动选 option0，游戏内暂走默认支（story 数据两支俱全、单测可验）；③ 友方增益技需控制器支持选 ally
  目标；④ 乱阵身法减益对行动序影响 2 回合。

### 必读文件（按顺序）

1. `CLAUDE.md` — 工作流程和架构铁律（worktree 分支、分层、测试、验证）
2. `docs/GAME_DESIGN.md` — 游戏系统设计（战斗 §4、剧情链/奖励 §4A、江湖成形 §4B 已对齐 M4 实现）
3. `docs/PROJECT_OVERVIEW.md` — 当前里程碑 scope（现在是 M5）
4. `docs/DECISIONS.md` — 27 条 ADR，别推翻已定决策（M4 相关见 #22-#27）
5. `src/game/story/`（runner.ts + types.ts）+ `src/game/progression.ts`（含 companionStats）+ `src/game/state.ts`
6. `src/data/story/{shediao,yuanyang}.ts` — 两条完整剧情线的数据范式；加线照抄
7. `scripts/verify-m4.mjs`（+ m3/m2/m1）— 状态感知 e2e 范式；M5 照抄结构
8. `docs/STORY_BIBLE.md`（§2.1 鸳鸯刀 / §2.9 射雕 已标实装）；`docs/CHARACTERS_AND_SKILLS.md`（§2.1 升级/§4 系数/§5 正邪声望挂钩，M5 折算用）

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

## 2. M5「纵向切片」— 详细实施计划

**目标**：从新游戏开局玩到**一个结局**的完整最小可通关流程；顺带补齐 M4 的两项简化
（队友系数接入战斗、choice 交互 UI）；用像素素材替换占位色块，加标题/存档入口。
这是第一次"能通关"的里程碑——重点是把已有系统串成一条有始有终的主线，而非再堆系统。

> 前置阅读：GAME_DESIGN §3.2（多结局规则）、§4B（M4 已实现的江湖系统）、
> STORY_BIBLE §1.3（天书获取总规则）与结局矩阵、CHARACTERS_AND_SKILLS §2.1/§4（升级/系数）、
> DECISIONS #22-#27（M4 决策与简化）。

### 2.1 队友系数 / 主角等级折算进战斗（补 M4 简化 ADR #27①，必做）

- `setupBattle` 现从静态 `CharacterDef` 建 combatant；改为按等级/系数折算有效属性：
  - 主角：`baseStatsAtLevel(charLevel(state,"player"))`（progression.ts 已有函数；lv1=现值，向后兼容）。
  - 队友（有 `coeff`）：`companionStats(playerLevel, coeff)`（已有函数）。敌人：保持静态 def。
- `setupBattle` 需要 `playerLevel` 入参（或传 state 片段）；`enterBattle` 传 `charLevel`。
- ⚠️ **会重新平衡**：郭靖 hp90→折算值等，射雕/鸳鸯刀战斗数值会变——**必须重跑并调 verify-m3/m4**，
  可能要调 encounter 敌方数值。**先做这个再做别的，因为它动战斗平衡。**
- 单测：折算后的 combatant 属性、lv1 向后兼容（主角仍 50/20/10/5/10）。

### 2.2 choice 交互选择 UI（补 M4 简化 ADR #27②）

- Game 的 `advanceStory` 现 `case "choice"` 自动选 option0。改为：弹一个选择菜单（可复用/仿
  `ui/BattleMenu.ts`），玩家↑↓选、空格确认 → `advanceStory({type:"choice",option})`。
- 新增 `mode: "storyChoice"` 或复用 dialogue 模式承载；`__debug` 探针加当前 choice 选项供 e2e 驱动。
- verify-m4 改为真正选一支（放走），并可加一个选另一支的断言。

### 2.3 结局系统

- `GameState` 加结局判定所需（已有 books/morality/party/flags 足够）。
- 一条可通关主线：明确"通关最短路径"（如射雕+鸳鸯刀两部天书 + 某 flag → 触发一个结局事件）。
  加结局 StoryEvent（trigger 用 `minBooks`/flag）+ 结局画面（简单文本/StoryStep `ending`）。
- GAME_DESIGN §3.2 要 ≥4 结局；M5 先做 **1 个**打通纵向切片，其余 M5+/内容期补。

### 2.4 标题/存档入口 + 像素素材（画面）

- 标题画面（新游戏/继续游戏），继续=读档。参照 CLAUDE.md §4 设计简报。
- 像素素材替换占位色块（地图 tile、单位）；**素材许可记入 `docs/CREDITS.md`**（CLAUDE.md §2.2，
  只用自制/AI 生成/CC0/CC-BY）。这块量大，可拆多 chunk，先 tile 后单位。

### 2.5 测试要求

- 逻辑单测：折算函数接入后的 setup 属性、结局判定条件。
- e2e：`verify-m5.mjs` 从**新游戏开局**走到**一个结局**（可能要串两条线；或设计一条短主线）；
  **跑 verify-m1/m2/m3/m4 回归**（折算改了战斗平衡，务必全绿）。

### 2.6 M5 完成定义

1. 能从开局玩到 1 个结局（真实按键 e2e）；单测/lint/tsc/build 过；code review 跑过且修完
2. 队友系数接入战斗且有测试；choice 可交互
3. 文档（GAME_DESIGN/STORY_BIBLE/DECISIONS 加 ADR/PROJECT_OVERVIEW）对齐；素材许可入 CREDITS.md
4. 本文档 §2 换成 M6 的同等细度计划

### 2.7 M4 落地后的现成积木（直接复用，别重造）

- **剧情**：`StoryEvent`/`Step`（`story/types.ts`，已含 dialogue/choice/battle/recruit/switchMap/
  adjustMorality/grantBook/gainExp/learnSkill/goto/end）；`runEvent` 等（runner.ts）；
  `shediao.ts`/`yuanyang.ts` 是完整范式；Game `beginStory/advanceStory/endStory` 播放引擎。
- **奖励/养成**：`progression.ts` 的 `applyStoryEffects`、`companionStats`/`baseStatsAtLevel`（**已就位待接线**）、
  `charLevel/skillLevel`。
- **战斗**：`setupBattle`（allies/objective）、`BattleController(...,playerIds)`、`autoTurnActions`、
  status 引擎（`effectiveStat`/`SkillRuntime.status`）。
- **状态/存档**：`state.ts`（morality/reputation/party + 助手）、`save.ts` `migrate()` 逐级（v3→v4 接后面）、
  `conditions.ts`（minBooks/minMorality/hasCompanion/minReputation）。
- **M4 已知简化项**（GAME_DESIGN §4B 末 / ADR #27）：队友系数未接战斗、choice 无 UI、友方增益需选 ally、
  乱阵 2 回合——§2.1/§2.2 先补前两个。

---

## 3. M6 概要（到时再展开；M5 详见 §2）

- **M6 活江湖**：门派动态模拟（确定性 tick + 传闻叙事）、自创武功（点数预算）——
  设计见 `docs/AI_FEATURES.md`（⚠️ 无运行时 LLM、无后端，ADR #11）；创作期 LLM 内容工作流已可用。
- **内容扩充期**（贯穿 M5+）：把 STORY_BIBLE 其余 12 条小说线逐条落地（加线只动 `src/data/`，ADR #3）；
  完善多结局矩阵、羁绊事件、门派声望的对话/招募联动。

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
6. ~~无远端仓库，CI workflows 从未跑过~~ **已解决（2026-07-05）**：远端 = GitHub
   `codelabsolutions-my/jinyong-heroes`；ci.yml/smoke.yml 原为 golden-template 后端模板
   （Python `uv`/postgres/pnpm），M4/M5 首推全红。已改为纯前端 npm 版：ci = docs-guard +
   gitleaks + `npm ci`/lint/test/build；smoke = 从零 `npm ci` + 产线构建 + dist 校验。删掉
   backend 作业与 pnpm/alembic/.env 假设。docs-guard 的 `sig` 正则也改指本项目实际敏感路径
   （src/game、src/core、.github/workflows）。

---

## 5. 内容创作速查（给写剧情的 session）

加一段新剧情 = 只动 `src/data/`（引擎零改动，这是 ADR #3 的验收标准）：

1. 地图：`src/data/maps/<name>.ts`（字符网格）+ 注册进 `maps/index.ts` + 出入口互连
2. NPC：`npcs/index.ts` 定义 + 地图 `npcs` 摆放（别占出生点/出口/落点，测试会拦）
3. 对话：`dialogues/index.ts`。⚠️ 变体会永久遮蔽默认对话——默认发的线索变体必须
   补发（`content.test.ts` 有测试拦截，报错信息会告诉你哪条）
4. 线索：`clues/index.ts`（category: 主线|传闻）
5. 跑 `npm test`——内容完整性测试会抓所有坏链（未知 id、NPC 占位冲突、行长不齐）
