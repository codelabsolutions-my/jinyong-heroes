# NEXT_STEPS.md — 交接与实施计划

> 写给下一个接手的 Claude session（任何模型）。目标：不需要读完整个对话历史，
> 只读这份文档 + 下面列的必读文件，就能直接开工 M4。
> 完成一个里程碑后：更新本文档（把下一个里程碑展开成同等细度）、更新
> PROJECT_OVERVIEW 的 Scope/Roadmap，然后才开下一个。

---

## 0. 当前状态（2026-07-05）

- **main：M0+M1+M2+M3 已完成并 squash-merge**。工作树应干净、无遗留分支/worktree。
- **196 个单测全过**；`npm test && npm run lint && npx tsc --noEmit && npm run build` 全绿。
- **M3 可玩内容**：无名小村「说书先生」(14,14) 对话点火射雕线 → 事件链自动开演：
  牛家村黄河四鬼战（郭靖并肩）→ 华山欧阳锋战（撑回合胜=洪七公救场，"打不过也能过"，郭靖+黄蓉并肩）
  → 授天书《射雕》(`book-shediao`) + 历练奖励 → 「江湖手札」J 面板天书分册（14 部进度）。存读档保留天书。
- **M3 新增系统层**（纯逻辑，重度单测）：`src/game/story/`（声明式剧情事件链 runner）、
  `src/game/progression.ts`（历练/熟练/天书奖励）、`src/game/battle/` 扩展（objective/allies/友方 AI）、
  `save.ts` v1→v2 迁移。集成在 `core/Game.ts`（story 播放引擎）+ `core/BattleController.ts`（playerIds/友方自动）。
  内容在 `src/data/story/`、`src/data/books/`、新地图/人物/遭遇/对话。
- M1/M2/M3 都经过 code review 并修完；教训固化成测试（存档校验/迁移、变体遮蔽、内容坏链、回放一致、
  剧情事件引用完整性、choice 死路 fail-fast、剧情战失败不无限重演）。
- **⚠️ M3 刻意简化（M4 补，见 ADR #21）**：射雕线为对话+战斗叠加演出，牛家村/华山地图已建但暂不可步行抵达
  （播放期玩家仍在无名小村）；友方 AI 只用普攻，黄蓉「计策」增益技待 M4；招募入常驻队伍是 M4。

### 必读文件（按顺序）

1. `CLAUDE.md` — 工作流程和架构铁律（worktree 分支、分层、测试、验证）
2. `docs/GAME_DESIGN.md` — 游戏系统设计（战斗 §4、剧情链/奖励/天书 §4A 已对齐 M3 实现）
3. `docs/PROJECT_OVERVIEW.md` — 当前里程碑 scope（现在是 M4）
4. `docs/DECISIONS.md` — 21 条 ADR，别推翻已定决策（M3 相关见 #17-#21）
5. `src/game/story/`（runner.ts + types.ts）+ `src/game/progression.ts` — 剧情/奖励分层
6. `src/data/story/shediao.ts` — 一条完整剧情线的数据范式；M4 加线照抄
7. `scripts/verify-m3.mjs` — 状态感知 e2e 范式（点火→事件链→战斗→断言天书）；M4 照抄结构
8. `docs/STORY_BIBLE.md` §2.9 已标实装；`docs/CHARACTERS_AND_SKILLS.md` — 队友系数/武学表/正邪值挂钩（M4 用）

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

## 2. M4「江湖成形」— 详细实施计划

**目标**：把"一条线"扩成"一个江湖"——正邪值 + 门派声望进档并影响世界、招募队友进常驻队伍、
2-3 条小说线并行可触发、地图行走接通剧情场景。也补齐 M3 的已知简化项。

> 前置阅读：CHARACTERS_AND_SKILLS §4（队友名册/系数）、§4.1（羁绊挂点）、§5（正邪值/声望数值挂钩）、
> STORY_BIBLE §1.2（难度层）与各线入口条件、GAME_DESIGN §4A（M3 已实现的剧情/奖励/战斗积木）。

### 2.1 GameState 扩展 + 存档 v2→v3（必做）

- `GameState` 加：`morality`（正邪值，整数）、`reputation: Record<sectId, number>`（门派声望）、
  `party: string[]`（常驻队伍 charId，出战上限 5）。
- **bump `SAVE_VERSION` 2→3**，`save.ts` 写 v2→v3 迁移（老档补 `morality:0/reputation:{}/party:[]`）；
  **迁移单测**（喂 v2 档断言升级）。注意 `migrate()` 已是逐级结构，接着 v1→v2 后面加 v2→v3。
- `Condition` 扩展：`minMorality/maxMorality`、`hasCompanion`、`minReputation`（配 ConditionEvaluator）。
  这样对话变体/剧情 trigger 能按正邪/队友/声望分支——**纯逻辑，先加 evaluate 单测**。

### 2.2 队伍/招募系统

- 招募 = 一个 `recruit` 剧情 Step（或对话 effect）：把 charId 加入 `state.party`。
- 战斗出战：`enterBattle` 的 `party` 从 `[player]` 改为读 `state.party`（player 恒在），
  按 `allySpawns` 摆位（spawns 要够；不够则报错或截断——定清楚）。playerIds 传全部出战队伍。
- 队友跟随成长（CHARACTERS §2.2）：队友等级=主角等级，属性=主角同级基准×系数。
  在 `progression.ts` 加"按系数折算队友有效属性"的纯函数 + 单测。
- 郭靖/黄蓉从"剧情战友军"升级为"可招募"（射雕线走完解锁），黄蓉「计策」增益技需 §2.4 支持。

### 2.3 地图行走接通剧情（补 M3 简化，ADR #21）

- story 加 `switchMap` Step（`{kind,mapId,x,y}`）：runner 产出一个 `switchMap` effect，
  Game 收到后改 `state.player.mapId/x/y` 并 `rebuildScene()`。**runner 保持纯**——只产数据。
- 用它让射雕线真正走进牛家村/华山（两图 M3 已建）；牛家村/华山补入口（双向 exit 或 story 带入）。
- ⚠️ 加/改地图必跑 verify-m1/m2/m3 回归（导航耦合，§0 警告）。

### 2.4 战斗增益/减益技能（黄蓉「计策」类）

- M3 的 `SkillRuntime` 只有伤害语义。M4 加 `effect` 字段（如 `{kind:"debuffSpeed",amount,duration}`
  / `{kind:"buffAtk",...}`）+ 战斗内 buff/debuff 状态（进 `Combatant`，随回合衰减）。
- resolve 处理 buff/debuff 结算（纯逻辑 + 回放单测）；friendly/enemy AI 可选放增益技。
- 消耗品/商店（CHARACTERS §3.3）：金创药等，作战斗 `item` 动作 + 探索层商店 UI（可拆到后续）。

### 2.5 多线并行

- 再落地 2 条线的第 1 章（STORY_BIBLE 选入口门槛低的，如碧血剑/鸳鸯刀教学关），
  各自入口 NPC 点火（照 `storyteller-shediao` 范式，注意放置避开 e2e 路径）。
- 天书面板已支持 14 部；新线走完 `grantBook` 对应 id 即自动点亮。

### 2.6 测试要求

- 逻辑单测：v2→v3 迁移、Condition 新字段 evaluate、队友系数折算、buff/debuff 结算与衰减、
  `switchMap` runner 产出、招募改 party。
- 内容测试：content.test 已泛化到 STORY_EVENTS/BOOKS/allies——新线自动受保护；
  加 `recruit`/`switchMap` step 的引用校验（charId∈CHARACTERS、mapId∈MAPS）。
- e2e：新增 `verify-m4.mjs`（招募一名队友→带进下一战→正邪值影响一处对话变体→switchMap 走图）；
  **跑 verify-m1/m2/m3 回归**。

### 2.7 M4 完成定义

1. verify-m4 全绿 + m1/m2/m3 回归仍绿；单测/lint/tsc/build 过；code review 跑过且修完
2. 存档 v2→v3 迁移有测试且旧档能升级（never 静默丢档）
3. GAME_DESIGN/STORY_BIBLE/DECISIONS(加 ADR)/PROJECT_OVERVIEW 与实现对齐（同 PR）
4. 本文档 §2 换成 M5 的同等细度计划

### 2.8 M3 落地后的现成积木（直接复用，别重造）

- **剧情**：`StoryEvent`/`Step`（`src/game/story/types.ts`）、`runEvent/startEvent/selectTriggeredEvent/
eventDoneFlag/collectStepRefs`（runner.ts）；`src/data/story/shediao.ts` 是完整范式；
  Game 的 `beginStory/advanceStory/endStory` 是播放引擎，加 `switchMap`/`recruit` yield 就地扩。
- **奖励**：`progression.ts` 的 `gainExp/learnSkill/grantBook/applyStoryEffects/charLevel/skillLevel`。
- **战斗**：`setupBattle`（已支持 `allies`/`objective`）、`BattleController(input,state,w,h,playerIds)`、
  `autoTurnActions`（side 无关友方/敌方 AI）、`BattleObjective.surviveRounds`。
- **存档**：`save.ts` 的 `migrate()` 逐级结构，v2→v3 接在后面即可。
- **M3 已知简化项**（GAME_DESIGN §4A 末 / ADR #21）：地图不可步行抵达剧情场景、友方 AI 只普攻、
  黄蓉计策未实装、无常驻队伍——**都在 M4 补**，补哪个都连带更新测试与文档。

---

## 3. M5-M6 概要（到时再展开；M4 详见 §2）

- **M5 纵向切片**：开局→任一结局可玩通；像素素材替换色块（素材许可记录进
  docs/CREDITS.md，见 CLAUDE.md §2.2）；标题画面/新游戏/继续游戏入口。
- **M6 活江湖**：门派动态模拟（确定性 tick + 传闻叙事）、自创武功（点数预算）——
  设计见 `docs/AI_FEATURES.md`（⚠️ 无运行时 LLM、无后端，ADR #11）；创作期 LLM
  内容工作流已可用。

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
