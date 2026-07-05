# M4 自主开发进度日志（无人值守）

> CLAUDE.md §3.3 要求的「长时间无人值守运行的状态文件」。每次 cron 唤醒读它、
> 干一个 commit 大小的小块、跑测试、提交、更新它。
> **位于 main 主检出根目录**（不在 worktree 里），worktree 的 `git add -A` 碰不到它。别 `git add` 它。

- **里程碑**: M4「江湖成形」
- **计划来源**: `docs/NEXT_STEPS.md` §2（M4 详细计划，唯一真源）
- **Worktree**: `/Volumes/ExternalSSD/Projects/jinyong-heroes-m4` 分支 `feat/m4-jianghu`
- **状态**: DONE ✅（M4 已 squash-merge 到 main = a353778，worktree/分支已清）
- **启动**: 2026-07-05（Ian 选"自主 loop"跑 M4）

---

## 检查清单（按依赖顺序，逐个小提交）

### §2.1 基础（GameState v3 + Condition）✅ 完成 (88d559d)

- [x] GameState 加 morality/reputation/party；SAVE_VERSION 2→3 链式迁移 + 校验
- [x] Condition 加 minBooks/minMorality/maxMorality/hasCompanion/minReputation + evaluate
- [x] state 助手 adjustMorality/addReputation/getReputation/addCompanion/hasCompanion；9 新单测

### §2.2 队伍/招募系统

- [x] a. ✅ (8d2db8d) recruit Step + StoryEffect（runner 产 effect、applyStoryEffects 应用+report.recruited、Game toast）；content.test 校验 charId
- [x] b. ✅ (60d7c88) enterBattle 出战 [player, ...state.party 队友]，按 allySpawns 截断；playerIds 传全部出战 id；setup 多人摆位测
- [x] c. ✅ (1fded23) 队友系数折算：baseStatsAtLevel + companionStats(level,coeff) + StatBlock/CompanionCoeff 类型；6 测
- [x] d. ✅ (2ab1262) CharacterDef.coeff（郭靖 hp1.3/def1.2/spd0.8、黄蓉 atk0.7/spd1.2）；射雕线主链招募郭靖/黄蓉
- **§2.2 队伍/招募 全部完成 ✅**（coeff 折算到战斗有效属性留待 §2.4 或独立 chunk，与主角 level 折算一起做）

### §2.3 地图行走接通剧情 (switchMap，补 M3 简化 ADR#21) ✅ 完成

- [x] a. (7206e35) StoryStep/StoryEffect 加 switchMap；runner 产出 effect（纯）+ 单测
- [x] b. (7206e35) applyStoryEffects 写 state.player + report.switchedMap；Game rebuildScene + 弹地图名
- [x] c. (8ef1d6b) 射雕线 shediao.ts 两处 switchMap（牛家村/华山）；verify-m3 e2e 全过
- [x] d. (7206e35) content.test 校验 switchMap.mapId∈MAPS、落点可站

### §2.4 战斗增益/减益技能（黄蓉「计策」类）

- [x] a+b. ✅ (58a7b21) 状态引擎：Combatant.statuses + SkillRuntime/SkillDef.status；effectiveStat；
      resolve 命中施加(倒下不挂)+每回合 decayStatuses；伤害/turnOrder 用有效属性；回放确定性；7 单测
- [x] c. ✅ (ecce557) 黄蓉「计策·乱阵」（无系 range3 mp6，降敌 speed -4/3 回合）；黄蓉 skills 填上；setup status 单测。**§2.4 完成**
- 说明：敌方目标减益开箱即用（现有 targetsInRange 选敌）；**队友/己方增益（激励 +atk）需控制器支持选 ally
  目标——归 §2.4b-controller 或后续 polish，非阻塞**。消耗品/商店拆到 M5。
- [ ] （可选后续）队友 coeff 折算 + 主角 level 折算到战斗有效属性（改 setupBattle，独立 chunk）

### §2.5 多线并行

- [x] a. ✅ (d7cc6b2) adjustMorality StoryStep/Effect（正邪值抉择引擎，照 recruit 模式）+ 单测
- [x] b. ✅ (b-1 d00175a 战斗数据 / b-2 99fb02a 故事)：鸳鸯刀线完整——镖师点火、官道遇太岳四侠、
      放走(+8)/扭送(-5)抉择、卓天雄决战、授天书 book-yuanyang。yuanyang.test 两支+回炉。
- [x] c. ✅ DoD"morality→对话变体"：镖师 `when:{hasFlag:yy-done,minMorality:5}` 变体（99fb02a）。**§2.5 完成**

### §2.6 测试 + §2.7 完成

- [x] content.test 扩展（recruit/switchMap/adjustMorality/allies 引用）——随各 feature chunk 已加
- [x] `scripts/verify-m4.mjs` ✅ (a5c3b8b) 鸳鸯刀线全程（点火→2 战→放走抉择 morality+8→天书→变体→存读档）
- [x] 回归 verify-m1/m2/m3 ✅ 全绿 (a5c3b8b)
- [x] §2.7-review ✅ (2e45959) 3 agent 审查未发现真 bug/软锁（M4 diff 干净）；打磨 moralityDelta + 注释。
      两项转 M5：队友 coeff 未接入战斗(静态值)、乱阵身法减益 2 回合。
- [x] §2.7-docs ✅ (863ac86) DECISIONS #22-27、GAME_DESIGN §4B、STORY_BIBLE §2.1、PROJECT_OVERVIEW→M5、NEXT_STEPS §2→M5
- [x] §2.7-merge ✅ squash-merge → main (a353778)、worktree remove + branch -D 完成、状态=DONE、memory 已更新

---

## 运行日志（最新在上）

- 2026-07-05：**🎉 M4 完成并合并** — §2.7-docs (863ac86) + squash-merge → main (`a353778`)。
  main 上 242 单测全过、lint/tsc/build 绿；verify-m4/m1/m2/m3 e2e 全过；worktree 与 feat/m4-jianghu 分支已清。
  **M4「江湖成形」DONE。** 下一步 M5「纵向切片」（docs/NEXT_STEPS.md §2），但按 loop 约定到此为止，不自动开 M5。
  memory (jinyong-heroes.md) 已更新为 M4 完成。
- 2026-07-05：**§2.7-review 完成** commit `2e45959` — 3 agent 代码审查，M4 diff 干净（无真 bug/软锁），
  打磨 moralityDelta 汇报实际变化 + 注释。242 单测绿。下一步：**§2.7-docs**（纯文档 commit）：
  - DECISIONS.md 加 ADR #22-#28（或合并）：①存档 v3(morality/reputation/party)+Condition 扩展；
    ②队伍/招募+companionStats(**注明未接入战斗，M5 折算**)；③switchMap 过场切图；④buff/debuff status 引擎
    (effectiveStat/decay)；⑤adjustMorality 正邪抉择；⑥多线并行(鸳鸯刀)+choice 自动选 option0(**无交互 UI，M5**)。
  - GAME_DESIGN.md 加 §4B「M4 江湖成形」（正邪值/门派声望/队伍招募/状态技/多线/正邪抉择）+ 里程碑表 M4✅；
    **明确记 M4 简化**：队友 coeff 未接入战斗(静态值)、choice 无交互 UI(自动 option0)、友方增益需 ally 选目标、
    乱阵身法减益 2 回合。
  - STORY_BIBLE §2.1 鸳鸯刀标「M4 已实装(1 章)」。
  - PROJECT_OVERVIEW Scope M4→M5、Roadmap M4✅（射雕补完/神雕? 看 §3；M5=纵向切片：开局到一个结局+像素素材）。
  - NEXT_STEPS §0 状态更新(M4 完成/242 测)、必读文件更新、§2 换 M5 详细计划、§3→M6。
    docs-guard：纯 docs commit 即可过。
    再 **§2.7-merge**：从 main `git merge --squash feat/m4-jianghu` + commit(Co-Authored-By Opus 4.8 1M)、
    验 diff 空、`npm test` on main、worktree remove、branch -D、M4_PROGRESS=DONE、更新 memory。**别开 M5。**
- 2026-07-05：**§2.6 完成** commit `a5c3b8b` — verify-m4 鸳鸯刀线 e2e 全过 + m1/m2/m3 回归全绿。
  242 单测、lint、tsc、build 过。**§2.1–§2.6 全部完成。只剩 §2.7 收尾（review→docs→merge）。**
  下一步：**§2.7-review**（多 agent 等效 /code-review）——spawn 3 个并行 general-purpose 审查 agent 覆盖：
  (1) core 逻辑：progression（companionStats/adjustMorality/recruit/switchMap applyStoryEffects）、
  state（morality clamp/party/reputation）、save v2→v3 迁移、battle status 引擎（effectiveStat/decay/回放）；
  (2) 集成：Game（enterBattle 读 party+playerIds、applyStoryResultEffects 的 switchMap rebuildScene/morality toast/
  recruit）、BattleController；(3) 内容：鸳鸯刀线软锁/数值、encounter 位置、morality 变体遮蔽。
  审查 M4 全 diff（main...feat/m4-jianghu）。只修 CONFIRMED 真 bug，改完重跑 242 单测 + verify-m4/m1/m2/m3。
  再 **§2.7-docs**：DECISIONS 加 ADR #22-#?（存档 v3=morality/reputation/party、Condition 扩展、队伍/招募+
  companionStats、switchMap、buff/debuff status 引擎、adjustMorality/正邪抉择、多线/鸳鸯刀）；
  GAME_DESIGN 加 §4B（M4 系统：正邪值/声望/队伍/状态技/多线）+ 里程碑 M4✅；STORY_BIBLE 鸳鸯刀§2.1 标实装；
  PROJECT_OVERVIEW Scope→M5、Roadmap M4✅；NEXT_STEPS §0 状态更新 + §2 换 M5 计划、§3→M6。
  **记 M4 已知简化**（choice 无交互 UI 自动 option0、友方增益需 ally 选目标、队友 coeff 未折算到战斗用静态值）。
  再 **§2.7-merge**：从 main 检出 `git merge --squash feat/m4-jianghu` + commit(Co-Authored-By Opus 4.8 1M)、
  验 main==branch(diff 空)、worktree remove、branch -D、M4_PROGRESS=DONE、更新 memory jinyong-heroes.md。别开 M5。
- 2026-07-05：**§2.5 全部完成** commit `99fb02a` — 鸳鸯刀线（护镖+正邪抉择+天书）+ morality 对话变体(DoD)。
  242 单测绿、lint、tsc、build 过。**§2.1–§2.5 全部完成，进入收尾 §2.6/2.7。**
  下一步：**§2.6 verify-m4.mjs e2e**（照 verify-m3 结构，puppeteer + __debug 探针）：
  起 dev server（未用端口，跑完 kill）。流程建议：1. 从 (12,14) 向左走到镖师(5,14)：ArrowLeft×6 到 (6,14) 面朝左 → Space 对话 → 断言 storyActive。2. 走完鸳鸯刀事件链：对话连按 Space、战斗按 __debug().battle 驱动（playerTurn/phase/canAttack；
  多人出战——若此前没招募则只有 player）。**choice 自动选 option0（放走）** → +8 morality。
  yy-taiyue 打赢（敌极弱）、yy-zhuo 打赢（BOSS 但可胜）。3. 断言：books 含 "book-yuanyang"、flags["yy-done"]、flags["yy-kind"]、storyActive=false、mode=explore。4. **morality→变体验证**：走回镖师(5,14) Space → 应命中 minMorality:5 变体（对话文本含"仁义"）——
  可读 __debug 无法读对话文本，改断言 morality>=5 + 再次对话不报错即可（或跳过文本断言）。5. 存读档保留天书。
  ⚠️ 战斗数值：yy-taiyue 敌 atk6 极弱、yy-zhuo 卓天雄 hp45/atk14——player atk10 基础，
  可能要打十几回合；驱动循环 guard 给足（~800）。打不赢就调 zhuo 数值。
  §2.7：多 agent code review（core/集成/内容）→ 修真 bug；回归 verify-m1/m2/m3；
  文档（DECISIONS 加 ADR：v3 存档/morality-reputation-party/队伍/switchMap/status引擎/adjustMorality/
  多线；GAME_DESIGN §4B M4 系统；STORY_BIBLE 鸳鸯刀标实装；PROJECT_OVERVIEW→M5；NEXT_STEPS §2→M5）；
  squash-merge→main、worktree remove、branch -D、M4_PROGRESS=DONE、更新 memory。别开 M5。
  ⚠️ 已知非阻塞：choice 无交互 UI（自动 option0）、友方增益技需 ally 选目标、队友 coeff 未折算到战斗
  （现用静态值）——这些在 E6 文档/ADR 里记为 M4 简化，M5 补。
- 2026-07-05：**§2.5b-1 完成** commit `d00175a` — 鸳鸯刀战斗数据（太岳四侠/卓天雄 + yy-taiyue/yy-zhuo）。
  232 单测绿、lint、tsc 过。下一步：**§2.5b-2 鸳鸯刀故事**：
  1. data/npcs 加入口 NPC（如 `biaoshi` 镖师）；xiake-island 摆在 **(5,14) 一带**（spawn 左侧，
     verify-m1/m2/m3 都从 (12,14) 上行/右行，不走 row14 左段——已核对，安全）。对话 effect setFlag `yy-start`。
  2. data/dialogues 加：镖师对话（setFlag yy-start）、yy-intro、yy-choice-prompt、yy-let-go、yy-turn-in、
     yy-zhuo-pre、yy-outro。
  3. src/data/story/yuanyang.ts：StoryEvent(id `yuanyang-line`, trigger hasFlag `yy-start`)：
     intro→battle yy-taiyue(onWin 继续/onLose 重来)→**choice 放走/扭送**→(放走 goto→adjustMorality +8→setFlag yy-kind
     →汇合) / (扭送 goto→adjustMorality -5→setFlag yy-turnin→汇合)→battle yy-zhuo→grantBook book-yuanyang
     →setFlag yy-done→outro→end。注册进 story/index.ts STORY_EVENTS。
  4. yuanyang.test：两条 choice 路径 playStory（照 shediao.test），断言 grantBook book-yuanyang +
     各自 adjustMorality effect 方向（+8 / -5）。
     ⚠️ **关键：Game 的 advanceStory 目前 case "choice" 是自动选 option[0]（M3 遗留，无选择 UI）**——
     所以**游戏内**只会走 option 0 那条路（把"放走"设为 option 0，默认走侠义线）。story DATA 支持两条
     （runner 单测能喂两种 choice 输入验证），但**玩家还不能真选**。§2.6 verify-m4 走的是 option-0 路径。
     真·交互选择 UI 是后续 chunk（Game 加选择菜单）——**非 M4 阻塞**；DoD"morality 影响对话变体"用
     book/flag/morality-gated variant 演示即可（可给镖师加 sd-done 后 `when:{minMorality:5}` 变体）。
  5. DoD morality→变体：给某 NPC（镖师或新的）加一个 `when:{minMorality:N}` 对话变体。
     之后 §2.6/2.7：verify-m4.mjs、回归、多 agent review、文档、squash-merge。
- 2026-07-05：**§2.5a 完成** commit `d7cc6b2` — adjustMorality 剧情步（正邪值抉择铺路）。224 单测绿、lint、tsc、build 过。
  下一步：**§2.5b 鸳鸯刀线内容**（STORY_BIBLE §2.1，T1 教学线，1 章）。一个 commit 建议含：
  1. 入口 NPC：xiake-island 加"镖师/护镖人"，僻静格（**避开 verify-m1/m2/m3 走位**——
     m1/m2/m3 从 (12,14) 上行/右行到 (14,14) 说书先生、再 (20,13)→(27,10) 出口。
     安全格：如 (5,14) 或 (9,17) 一带，先查三脚本确认不踩）。对话 effect setFlag `yy-start`。
  2. 敌方 CharacterDef：太岳四侠（`taiyue-si-xia`，T1 极弱，教学）、BOSS 卓天雄（`zhuo-tianxiong`，T1 BOSS）。
  3. encounter：`yy-taiyue`（官道遇劫，太岳四侠×4 极弱）、`yy-zhuo`（卓天雄，稍强）。field 可复用开阔格。
  4. dialogues：yy-intro / yy-choice-taiyue（放走 or 扭送）/ yy-let-go / yy-turn-in / yy-zhuo-pre / yy-outro。
  5. src/data/story/yuanyang.ts：StoryEvent(trigger hasFlag `yy-start`)：
     intro→battle yy-taiyue→**choice(放走→adjustMorality +8 / 扭送→adjustMorality -5，各 setFlag)**→
     battle yy-zhuo→grantBook `book-yuanyang`→setFlag `yy-done`→outro→end。注册进 story/index.ts。
  6. 天书面板已支持；grantBook book-yuanyang 自动点亮。
  7. 测试：yuanyang.test（两条抉择路径 playthrough，断言 grantBook + 各自 morality 方向）；content.test 自动校验引用。
     ⚠️ choice 分支用 goto（现有），每支 goto 到一个 adjustMorality 步再 goto 汇合——choice 本身不带 effect。
     ⚠️ DoD"正邪值影响一处对话变体"：给某个 NPC 对话加 variant `when:{minMorality:N}` 或 `{maxMorality:-N}`
     演示（对话变体已支持 Condition）——可放 §2.5b 或 §2.6 verify-m4 里体现。
     之后 §2.6/2.7：verify-m4.mjs、回归 m1/m2/m3、多 agent review、文档、squash-merge。
- 2026-07-05：**§2.4 全部完成** commit `ecce557`（黄蓉·乱阵）。223 单测绿、lint、tsc 过。
  下一步：**§2.5 多线并行**（建议一条线一个 commit，别一次塞两条）：
  再落 **1-2 条线的第 1 章**（教学门槛低的）。**推荐鸳鸯刀线**（STORY_BIBLE：鸳鸯刀=第14部天书，
  "无敌于天下"梗，短小易做）或碧血剑线（金蛇剑法福利）。每条线照射雕范式：1. 入口 NPC（放 xiake-island 或 houshan 僻静格，**避开 verify-m1/m2/m3 路径**——查那三个脚本的走位）+ 对话 effect setFlag `<line>-start`。2. src/data/story/<line>.ts：StoryEvent（trigger hasFlag `<line>-start`）；对话+至少 1 战+grantBook。
  注册进 story/index.ts 的 STORY_EVENTS。3. 新 encounter（可复用现有小地图字段或简单新场）；新敌方 CharacterDef（T1 杂兵）。4. grantBook 用 books 表里对应 id（book-yuanyang / book-bixue，已在 data/books）。5. content.test 自动校验引用；加一个该线的 story playthrough 单测（照 shediao.test）。
  **可选**：正邪值抉择——给某条线加一个 choice，选项 effect 调 adjustMorality（需 story runner 支持
  choice 的 effect？现在 choice 只 goto。若要 choice 带 effect，加 setFlag 分支即可，morality 用
  新 StoryStep `{kind:"adjustMorality",delta}` + StoryEffect——照 recruit 模式加，小改）。M4 DoD 要
  "正邪值影响一处对话变体"，可用 minMorality/maxMorality 对话变体演示（对话变体已支持 Condition）。
  之后 §2.6/2.7：verify-m4.mjs（招募→带队进战→正邪值影响一处对话变体→switchMap 走图）、
  回归 m1/m2/m3、多 agent review、文档(ADR/GAME_DESIGN/STORY_BIBLE/OVERVIEW→M5/NEXT_STEPS→M5)、squash-merge。
- 2026-07-05：**§2.4a/b 状态引擎完成** commit `58a7b21` — 增益/减益 statuses + effectiveStat + resolve 施加/衰减
  （伤害/turnOrder 用有效属性、回放确定性保持）。222 单测绿、lint、tsc、build 过。
  下一步：**§2.4c 黄蓉计策数据**——SKILLS 加 `jimou-luanzhen`（乱阵：name"乱阵"、school null、power 0-2、
  range 3、mpCost ~6、status:{stat:"speed",amount:-4,duration:3}）；黄蓉 skills 改 `["jimou-luanzhen"]`。
  走现有 skill→选敌流程即可（黄蓉玩家操控时可放；友方 AI 只普攻不放，可接受）。
  content.test 已覆盖角色武学引用。之后 §2.5 多线并行、§2.6/2.7 e2e+review+文档+合并。
  ⚠️ 队友/己方增益（激励 +我方 atk）需控制器支持选 ally 目标——留作后续，非 M4 阻塞。
- 2026-07-05：**§2.2d + §2.3 全部完成**（Ian "proceed"，连做 4 commit）：
  `2ab1262` 队友 coeff + 射雕招募；`7206e35` switchMap 机制（types/runner/progression/Game/content 测）；
  `8ef1d6b` 射雕线用 switchMap 走进牛家村/华山——**补齐 M3 简化 ADR#21，两图接通，verify-m3 e2e 全过**。
  215 单测绿、lint、tsc、build 过。**§2.2、§2.3 完成。**下一步：**§2.4 战斗增益/减益技能**——
  a. SkillRuntime/SkillDef 加可选 `effect`（如 `{kind:"debuffSpeed",amount,duration}`/`{kind:"buffAtk",...}`）；
  Combatant 加 buff/debuff 状态数组（进 BattleState，可序列化）。
  b. resolve 处理施放增益/减益（skill 命中→给目标/己方挂状态）+ 每回合/回合末衰减；回放单测。
  c. 黄蓉「计策」技能数据（jimou_luanzhen 降敌 spd、jimou_jili +我方 atk）；黄蓉 skills 填上；友方 AI 可选放。
  ⚠️ 这是纯逻辑为主（src/game/battle/），但触及 resolve 核心——务必回放确定性单测，别破坏 M2/M3 战斗。
  ⚠️ 顺带可做「队友 coeff 折算到战斗有效属性 + 主角 level 折算」——但那改 setupBattle，建议独立 chunk，别和 buff 混。
  也可在 §2.4 后做 §2.2 遗留的"coeff→有效属性折算"（对称处理主角 level）。
- 2026-07-05：**§2.2b 完成** commit `60d7c88` — enterBattle 出战完整队伍。213 单测绿、lint、tsc、build 过。
  下一步：**§2.2d 数据**——给 CharacterDef 加可选 `coeff?: CompanionCoeff`（from '@/game/progression'）；
  给郭靖(hp1.3/def1.2/spd0.8)、黄蓉(atk0.7/spd1.2)填系数（CHARACTERS §4）。
  射雕线 shediao.ts 走完加 `{kind:"recruit",charId:"guojing"}`+`{kind:"recruit",charId:"huangrong"}` step
  （放 sd-outro 前后的主链，无变体遮蔽）。content.test 已校验 recruit.charId∈CHARACTERS。
  ⚠️ 加了 recruit step 后 shediao.test（全胜路径）会多两个 recruit effect——同步更新该测试断言（effects 里含 recruit、
  state.party 含 guojing/huangrong）。⚠️ verify-m3 e2e 目前不校验 party，但跑回归确认不炸。
  注：队友 coeff 折算到战斗有效属性（companionStats）是**后续 chunk**（§2.2b 现用静态值）；
  §2.2d 只填 coeff 数据 + 招募 step，折算接入可在 §2.4 或独立 chunk 做（同时补主角 level 折算，保持对称）。
- 2026-07-05：**§2.2a 完成** commit `8d2db8d` — recruit step（招募入 state.party）。212 单测绿、lint、tsc、build 过。
  下一步：**§2.2b enterBattle 读 party**——src/core/Game.ts enterBattle 现 `party:[player]`。改为
  `party = [player, ...state.party.map(id=>CHARACTERS[id]).filter(Boolean)]`（超 allySpawns 数则截断，
  playerIds 传全部出战 charId：`[player.id, ...出战队友 id]`）。注意 setupBattle 已按 allySpawns 顺序摆位、
  party.length>allySpawns 会抛错——所以要先 slice 到 allySpawns.length。队友有效属性折算(companionStats)
  接入可放 §2.2d（数据加 coeff 后，setupBattle/enterBattle 用 companionStats 覆盖队友基础属性；
  或先简单用 CharacterDef 静态值，coeff 折算作后续）。E2E/手测确认多人出战不卡回合（friendly AI 已就绪）。
- 2026-07-05：**§2.2c 完成** commit `1fded23` — 队友属性折算 companionStats（纯逻辑）。211 单测绿、lint、tsc 过。
  下一步：**§2.2a recruit step**——story 加 `{kind:"recruit",charId}` Step + StoryEffect `{type:"recruit",charId}`；
  runner case "recruit" 产出 effect（照 grantBook 模式）；progression.applyStoryEffects 加 recruit 分支调 state.addCompanion，
  report 加 recruited[]。runner/progression/story 单测。之后 §2.2b（enterBattle 读 party）、§2.2d（数据加 coeff + 招募 step）。
  提示：StoryStep/StoryEffect 联合在 src/game/story/types.ts；applyStoryEffects 在 progression.ts；addCompanion 已在 state.ts。
- 2026-07-05：**§2.1 完成** commit `88d559d`（Ian 在场手动跑）— GameState v3 + Condition 扩展，205 单测绿。
  下一步：**§2.2 队伍/招募**。建议顺序 c(系数折算纯函数)→a(recruit step)→b(enterBattle 读 party)→d(数据)。
  提示：enterBattle 现在 `party:[player]`；改成读 state.party 时注意 allySpawns 数量与 playerIds。
  friendly AI（autoTurnActions）已 side 无关，多队友出战即自动可控/或玩家轮流操控——定清楚谁 playerIds。
