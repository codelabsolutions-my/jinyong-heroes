# M3 自主开发进度日志（无人值守）

> 这是 CLAUDE.md §3.3 要求的「长时间无人值守运行的状态文件」。
> 每次 cron 唤醒读它、干一个 commit 大小的小块、跑测试、提交、更新它。
> 它**位于 main 主检出根目录**（`/Volumes/ExternalSSD/Projects/jinyong-heroes/M3_PROGRESS.md`），
> **不在 worktree 里**，所以 worktree 的 `git add -A` 永远碰不到它。别把它 `git add`。

- **里程碑**: M3「第一部天书」（《射雕》第 1、3 章线）
- **计划来源**: `docs/NEXT_STEPS.md` §2（唯一真源，别凭记忆）
- **Worktree**: `/Volumes/ExternalSSD/Projects/jinyong-heroes-m3` 分支 `feat/m3-shediao`
- **状态**: DONE ✅（M3 已 squash-merge 到 main = b5eba0b，worktree/分支已清）
- **启动**: 2026-07-04 夜（Ian 睡前设的自主 loop）

---

## 检查清单（按依赖顺序，逐个小提交）

### A. 剧情事件链系统（§2.1）— 纯逻辑，先做 ✅ 完成 (687a2a7)

- [x] A1 `src/game/story/types.ts`：`StoryEvent{id,trigger,steps}`、`Step` 联合
      （dialogue|choice|battle|reward|setFlag|grantBook|gainExp|learnSkill|goto|end）
- [x] A2 `src/game/story/runner.ts`：纯函数推进 step 指针；choice 按 Condition 选支；
      battle 结果（胜/败）回喂决定走向。复用现有 Condition/Effect 词汇。
      导出 runEvent/startEvent/selectTriggeredEvent/eventDoneFlag/collectStepRefs。
- [x] A3 `src/game/story/__tests__/runner.test.ts`：15 单测，分支/条件/推进/回喂/回放/坏链守护

### B. 存档 v1→v2 迁移（§2.2）✅ 完成 (846eb24)

- [x] B1 `GameState` 加 `books:string[]` + `progress:Record<charId,{exp,proficiency}>`（CharProgress）
- [x] B2 `src/game/save.ts`：SAVE_VERSION 1→2；`migrate()` 逐级升；未来版本仍报错；books/progress 校验
- [x] B3 迁移单测：v1 档→v2 补默认值、v2 往返、坏 progress 拒绝（共 +5 测）

### C. 战斗奖励接通（§2.3）— 纯逻辑部分 ✅ (2557d38)；C3 留待 D

- [x] C1 `src/game/progression.ts`：applyStoryEffects 落 grantBook/gainExp/learnSkill 到 state
- [x] C2 升级曲线 `100×lv^1.5`（上限30）+ 熟练度 `20×lv`（上限10,+10%/级）+ 读秘籍解锁直升3级
- [x] C3 ✅ (b222941) 机制就位：EncounterDef.allies + setupBattle 以 ally 侧登场（id 前缀 ally-）。
      数据（郭靖/黄蓉 CharacterDef + 系数）随 D2 一起填
- [x] C4 grantBook 幂等单测（14 单测覆盖曲线/熟练/gainExp/learnSkill/applyStoryEffects）

### D. 内容 + 地图（§2.4）

- [x] D1 ✅ (0c5784c) 新地图 niujia-village(牛家村)、huashan-summit(华山之巅)，各单向出口回后山(2,5)/(3,5)；
      只动新文件+maps 索引；content.test 自动覆盖。20 宽，均已校验等宽
- [x] D2 ✅ 完成：(a)人物/武学 (61aa313)；(b)encounter (601e911)；(c)story 事件链 (5895d47)。
      shediao-line：trigger flag `sd-line-start`；天书 id `book-shediao`；全胜/两条战败路径 8 单测走通。
- [x] D3 ✅ 完成：(数据) (cb7b73c) 14 天书 registry + 助手；(UI) (19d695f) JournalPanel「天书」分册
      14 部进度（已得高亮 / 未得 hint），面板改名「江湖手札」。tsc/lint/build 过。
- [x] D4 ✅ (fc298ce) 欧阳锋一战「打不过也能过」：BattleObjective.surviveRounds，resolve 回合推进后判胜；
      setup 透传 encounter.objective；歼灭优先、向后兼容、6 单测

### E. 集成 + 测试（§2.5 / §2.6）

- [x] E1 ✅ 完成：(a)友方 AI (b64c254)；(b)控制器驱动战友军 (9e663b9)；(c)Game story 引擎 (c0242a9)；
      (d)点火 NPC 说书先生@xiake(14,14) (c5da422)。整条射雕线已可在游戏内触发→走通→拿天书。
- [x] E2 ✅ (54bdac2) content.test 泛化：全 STORY_EVENTS 引用完整性（battle/grantBook/dialogue/learnSkill/
      跳转目标/gainExp>0/有 end/id 唯一）+ encounter allies 位置校验。content 47 / 全 194 单测绿。
- [x] E3 ✅ (38115e5) verify-m3.mjs 首次真跑一次通过：点火→黄河四鬼战(打赢)→欧阳锋战(撑回合胜)→天书→存读档保留
- [x] E4 ✅ (38115e5) 回归 verify-m1 / verify-m2 均全绿（点火 NPC @xiake(14,14) 未撞其路径）
- [x] E5 ✅ (111e3bc) 3 并行审查 agent（核心/集成/内容）等效 /code-review。发现并修 2 真 bug：
      ① runner choice 空选项静默卡死 + resumeFrom 不重校验 when；② Game 剧情战启动失败无限重触发+重复发奖+存坏档。
      第 3 项（牛家村/华山地图不可达、剧情叠加在无名小村演）非软锁，作 M3 刻意简化 → E6 文档说明。
      修完 196 单测 + verify-m3/m1/m2 全绿。
- [x] E6 ✅ (e64ade8) 文档对齐：DECISIONS #17-21、GAME_DESIGN §4A、STORY_BIBLE §2.9、PROJECT_OVERVIEW、NEXT_STEPS→M4
- [x] E7 ✅ squash-merge → main (b5eba0b)，worktree remove + branch -D 完成，本文件状态=DONE

---

## 运行日志（最新在上）

- 2026-07-05 凌晨：**🎉 M3 完成并合并** — E6 文档对齐 (e64ade8) + E7 squash-merge → main (`b5eba0b`)。
  main 上 196 单测全过、lint/tsc/build 绿；worktree 与 feat/m3-shediao 分支已清。**M3「第一部天书」DONE。**
  下一步是 M4「江湖成形」（详见 docs/NEXT_STEPS.md §2），但**按 loop 约定到此为止，不自动开 M4**——等 Ian 醒来定夺。
  memory (jinyong-heroes.md) 已更新为 M3 完成。
- 2026-07-05 凌晨：**E5 代码审查+修复完成** commit `111e3bc` — 3 agent 审查抓 2 真 bug（runner choice 卡死、
  Game 剧情战失败无限重演），已修+补测。196 单测 + 三个 e2e 全绿。下一步：**E6 文档（同 PR）**——
  1. DECISIONS.md 加 ADR（建议合并成 2-3 条）：story 声明式事件系统（§2.1）、存档 v1→v2（books/progress）、
     BattleObjective surviveRounds + 战友军友方 AI、剧情点火/播放机制（Game 承载，ADR #3 加线不改引擎的验收）。
  2. GAME_DESIGN.md §4/§5：补 M3 剧情事件链 + 战斗奖励(历练/熟练/天书) + 天书分册；
     **明确记 M3 刻意简化：射雕线以对话+战斗叠加演出，牛家村/华山地图已建但暂不可步行抵达（M4 接 switchMap/地图行走）。**
  3. STORY_BIBLE.md 射雕条目标注"M3 已实装（1、3 章）"。
  4. PROJECT_OVERVIEW.md Scope 从 M3 换 M4 并展开；NEXT_STEPS.md §2 换成 M4 同等细度计划
     （M4 概要见现 §3：江湖成形——正邪值/门派声望进档、招募队伍、多线并行；把"地图行走到牛家村/华山+switchMap"列入 M4）。
     ⚠️ docs-guard：E6 是纯文档提交，改 docs/ 即可过；但若同提交碰了架构路径要带 ADR。E6 建议独立 docs commit。
     再 **E7 合并**：squash-merge→main、worktree remove、branch -D、本文件=DONE、更新 memory。别开 M4。
- 2026-07-05 凌晨：**E3+E4 完成** commit `38115e5` — verify-m3 端到端**首次真跑一次通过**（射雕线全程），
  verify-m1/m2 回归全绿。截图在 /tmp/m3-shots。**A–E4 全部完成，M3 功能与验证到位。**
  下一步：**E5 /code-review**——在 worktree 分支跑 `/code-review`（Workflow 支撑、high effort、多 agent），
  修真 bug（M1 那次抓 8 个、M2 抓 10 个，这步不能省）。改完重跑 npm test + 三个 e2e。
  再 **E6 文档**（同 PR）：DECISIONS 加 ADR（story 事件系统 §2.1、存档 v2、objective、战友军 AI、点火机制——
  可合并成 1-2 条 ADR）；GAME_DESIGN §4/§5 补 M3 剧情链+奖励+天书；STORY_BIBLE 射雕条目标注"已实装"；
  PROJECT_OVERVIEW Scope→M4 展开；NEXT_STEPS §2 换成 M4 同等细度计划。
  再 **E7 合并**：squash-merge → main、`git worktree remove` + `git branch -D feat/m3-shediao`、
  本文件状态=DONE、更新 memory（jinyong-heroes.md）M3 完成。**然后停，别开 M4。**
  ⚠️ E5 的 /code-review 是交互式 skill，cron 里能否跑需确认；若不能，就用 general-purpose agent 做等效审查，
  或把"待审查"记进本文件、留给 Ian 醒来手动跑 /code-review。**别跳过审查直接合并。**
- 2026-07-05 凌晨：**E2 完成** commit `54bdac2` — content.test story/allies 引用完整性泛化。content 47 / 全 194 绿。
  下一步：**E3 verify-m3.mjs e2e（重头戏，运行时首次真跑射雕线）**。做法：
  1. 读 scripts/verify-m1.mjs 抄骨架（puppeteer-core 连系统 Chrome、step/steps/check 辅助、__debug 探针、截图）。
  2. 起 dev server：`npm run dev -- --port 52xx`（后台），等端口就绪；结束务必 kill。
  3. 流程：spawn(12,14) → ArrowRight×2 触到说书先生(14,14) 转向 → Space 对话到底 → 断言 storyActive=true。
     事件链：sd-intro 对话(连按 Space) → 进 sd-huanghe 战斗。**战斗要读 \__debug().battle 逐步驱动**：
     - 当 battle.playerTurn && phase==="selectMove"：Space 确认原地 → actionMenu；
     - phase==="actionMenu"：若 canAttack Space（攻击）→ selectTarget → Space 出手；否则 ArrowDown 到"待机"Space；
     - playerTurn=false（战友/敌方自动）：等（tick 若干帧）。
     - 循环到 battle.outcome!=="ongoing" 或 mode 变回非 battle。黄河四鬼这场要打赢（player+郭靖 vs 4 鬼，
       若打不赢就调 sd-huanghe 数值/或让 player 多打几拳——数值 D2b 说了可调）。
       → sd-huashan-intro 对话 → sd-ouyangfeng 战斗（撑 surviveRounds:3 即胜；玩家可一直待机让回合流逝，
       注意欧阳锋 atk30 可能秒人，若 player 先死但郭靖/黄蓉活着仍算存活到 N 回合→胜；若全灭则走 onLose 也发天书）。
       → sd-hong-rescue 对话 → sd-outro → 断言：__debug().books 含 "book-shediao"、flags["sd-done"]、storyActive=false、mode="explore"。
  4. 存读档保留天书：KeyK 存 → 刷新/KeyL 读 → books 仍含 book-shediao（注意存档在 endStory 已自动存）。
  5. **E4 回归**：跑 verify-m1.mjs、verify-m2.mjs（说书先生在 (14,14)，两脚本首步 ArrowUp 应不受影响——验证之）。
     ⚠️ 若 e2e 发现集成 bug（很可能，首次真跑），就地修并补 commit；数值不平衡就调 encounter。E3 可能要多个 firing。
- 2026-07-05 凌晨：**E1(d) 点火 NPC 完成 → E1 全完** commit `c5da422` — 说书先生@xiake(14,14) 置 sd-line-start。
  content 43 / 全 190 单测绿，lint/tsc/build 过。**A–E1 全部完成，射雕线在游戏内可玩。**
  下一步：**E2 → E3**。
  E2（小）：content.test 扩展 story 引用完整性——遍历 STORY_EVENTS 校验：
  battle step 的 battleId∈ENCOUNTERS、grantBook 的 bookId∈BOOKS、goto/onWin/onLose 目标 step 存在、
  dialogue step 的 dialogueId∈DIALOGUES。（shediao.test 已覆盖 shediao 一条，E2 泛化到全 STORY_EVENTS
  并纳入 content.test，未来加线自动受保护。）
  E3（重头戏 e2e）：写 scripts/verify-m3.mjs（仿 verify-m1/m2 结构，用 puppeteer-core + 系统 Chrome +
  window.__debug()）：起 dev server → 从 (12,14) 向右走到说书先生 → 对话点火 → 走完事件链
  （含 sd-huanghe / sd-ouyangfeng 两战，注意战友军自动、玩家需在 playerTurn 时出招；欧阳锋战撑回合）
  → 断言 __debug().books 含 "book-shediao"、flags["sd-done"]、storyActive 归 false → 存读档保留天书。
  ⚠️ 战斗交互：读 debugSnapshot（playerTurn/phase/canAttack）驱动按键，别写死步数；胜负用 hp 归零判。
  ⚠️ 跑完 **verify-m1/m2 回归**（E4）；杀 dev server。若 e2e 暴露集成 bug，就地修（这是 e2e 的价值）。
- 2026-07-05 凌晨：**E1(c) story 引擎完成** commit `c0242a9` — Game 承载剧情事件播放（休眠待点火）。
  190 单测绿、lint、tsc、build 过。M1/M2 路径未变（storyRun 恒 null 直到 sd-line-start 置位）。
  下一步：**E1(d) 点火 NPC**（激活整条射雕线）——
  加一个 NPC，其对话 effect 设 `{type:"setFlag", flag:"sd-line-start"}`，对话关闭后 Game 下一帧点火开演。
  ⚠️ **放置要避开 M1/M2 e2e 路径**（§0 耦合警告）：- 先读 scripts/verify-m1.mjs、verify-m2.mjs 看它们在哪张图走哪条路、跟哪些 NPC 交互；- 放到"可达但不在 e2e 行走/facing 路径上"的空格（xiake-island 或 houshan-path 的僻静格）；- content.test 要求：NPC 在可走格、不占出生点/出口/其它 NPC；对话 record key==id。
  步骤：data/npcs 加 NPC（如 id `guo-messenger` 名"报信少年"/或直接"郭靖"）→ 对话(effect setFlag sd-line-start)
  → 某地图 npcs 加 placement。做完 tsc/lint/test/build + 手工确认没撞 e2e 路径。
  做完 E1(d) 即 **E1 全完**，进 E2（content.test 加 story/grantBook 引用完整性）、E3（verify-m3 e2e，重头戏）。
- 2026-07-05 凌晨：**E1(b) 完成** commit `9e663b9` — BattleController 自动驱动战友军回合（playerIds 机制）。
  190 单测绿、lint、tsc、build 过。下一步：**E1(c) Game 承载 story 播放**（最核心的集成）——
  读 src/core/Game.ts 全貌（mode 机制、enterBattle/endBattle、对话播放 startDialogue/advanceDialogue、
  battleWonFlag 约定）。要点：1. 加 story 播放状态：持一个 {event, run} + 当前 StoryStepResult。进入某 mode（新增 "story" 或复用现有）。2. 点火：探索中检测 selectTriggeredEvent(STORY_EVENTS, state)；命中则 startEvent + 首次 runEvent。3. yield=dialogue → 用 DIALOGUES[id] 走现有对话框；对话读完 → runEvent(无输入)继续。4. yield=battle → enterBattle 该 battleId（复用 setupBattle+BattleController；战友军已自动）；
  战斗 result → runEvent(input:{type:"battle",outcome})。注意 enterBattle 现在从 dialogue effect 触发，
  需让它也能从 story 触发并把结果回喂 story，而不是走老的 battleWonFlag 分支。5. 每次 runEvent 的 effects → progression.applyStoryEffects(state, effects, {player:"player"})；
  其中 grantBook 写 state.books、gainExp 写 progress（存档已支持）。toast 提示新天书/升级。6. yield=end → 回探索。存档（saveGame）。
  ⚠️ 这步大，建议：先只做"对话-only 的 story 播放骨架 + 点火 + applyStoryEffects"（不接战斗），
  单独 commit；再做"story battle 接入 + 结果回喂" 第二 commit。E1(d) 点火 flag 可并入(c)。
  ⚠️ 别破坏 M1/M2：老的 bandit 对话 startBattle→enterBattle→battleWonFlag 路径要保留（verify-m1/m2 回归）。
- 2026-07-05 凌晨：**E1(a) 友方 AI 完成** commit `b64c254` — autoTurnActions(side 无关) + allyAutoTurnActions。
  190 单测绿、lint、tsc 过。下一步：**E1(b) BattleController 驱动 ally 战友军回合**——
  读 src/core/BattleController.ts 现状：它在 enemyTurn 阶段调 enemyTurnActions。改为：当 activeId
  既非 player 又是 ally 侧（战友军）时，也走自动流程（allyAutoTurnActions），把动作依次 resolve；
  只有 activeId==="player" 才交玩家操控。注意 debugSnapshot 的 activeSide/phase 要能反映。
  这一步是 Pixi/交互层（BattleController 有逻辑但依赖 state），尽量把"该不该自动"抽成可测判断。
  之后 E1(c) Game 集成 story、E1(d) 点火，再 E2/E3。
- 2026-07-05 凌晨：**D3(UI) 完成 → D 全完** commit `19d695f` — 手札「天书」分册 14 部进度。
  185 单测绿、lint、tsc、build 均过。**A–D 全部完成，进入 E 集成阶段。**
  下一步：**E1（最大的活）：把 story 事件链接进 Game**。要点（读 src/core/Game.ts、BattleController、
  BattleScene、DialogueBox 现状后动手）：
  1. Game 加 story 播放：selectTriggeredEvent(STORY_EVENTS, state) 点火后，用 runEvent 推进；
     yield=dialogue → 复用现有对话框播 DIALOGUES[id]；yield=battle → 复用 setupBattle+BattleController；
     yield=choice → 需要选择 UI（射雕线暂无 choice，可后置）；yield=end → 落幕。
  2. 战斗结果回喂：BattleController.result("victory"/"defeat") → runEvent(input:{type:"battle",outcome})。
  3. 奖励落地：runEvent 返回的 effects 交给 progression.applyStoryEffects(state, effects, {player:"player"})；
     grantBook 写进 state.books（存档已支持）。
  4. ⚠️ **友方(郭靖/黄蓉)行动控制**：encounter.allies 在 ally 侧，BattleController 现只让 player 行动、
     enemyTurnActions 只驱动 enemy。需给非 player 的 ally 单位加"友方 AI"（最简：复用 enemyTurnActions
     的趋近-攻击逻辑，target 取敌方）或让玩家轮流操控。否则回合会卡在郭靖/黄蓉身上。这是 E1 必须解决的。
  5. 点火：给某入口(如后山 NPC 或牛家村落点)设 flag `sd-line-start`。E3 e2e 要能触发。
     E1 建议再拆：先做"友方 AI"(纯 game 层，可单测) 作为独立小 commit，再做 Game 集成。
- 2026-07-05 凌晨：**D3(数据) 完成** commit `cb7b73c` — 十四天书 registry（book-shediao 齐全，余占位+hint）。
  185 单测绿、lint、tsc 过。下一步：**D3(UI)**——JournalPanel 加「天书」分册。
  参考现有 JournalPanel.open(state, defs) 的重画式渲染（src/ui/JournalPanel.ts，Pixi）；
  加一个模式切换或第二段：调 `bookEntries(state)` 画 14 行/格，owned 高亮显示 name，
  未 owned 灰显并展示 def.hint。UI 无单测硬性要求（Pixi），但 books 数据层已测；
  可给 JournalPanel 加个纯函数式的"要显示什么"辅助（可选）。改动限 src/ui/ + 可能 src/core 接线。
  ⚠️ 提示：JournalPanel.open 现签名带 defs(线索表)；加天书别破坏线索分册，另开区域或标签页。
  之后进 **E 阶段**：E1(story 接进 Game + 友方控制) → E2(content.test story/grantBook 引用) →
  E3(verify-m3 e2e) → E4(回归) → E5(code-review) → E6(文档) → E7(合并)。E1 是最大的集成活。
- 2026-07-05 凌晨：**D2(c) 完成 → D2 全完** commit `5895d47` — 射雕线事件链 shediao（剧情→战斗→天书闭环）。
  179 单测绿、lint、tsc 过。下一步：**D3（JournalPanel 天书 14 格分册）**——
  先建 `src/data/books/index.ts`（14 天书定义：id/name/线索/所属线；至少 book-shediao 齐全，
  其余 13 可先占位 name+入口线索，STORY_BIBLE 各线"天书"条目有出处）；
  JournalPanel(Pixi UI, src/ui/) 加"天书"分册：14 格，已得(state.books)高亮，未得显示入口线索。
  ⚠️ D3 是 Pixi UI，纯逻辑测试有限；建 books 数据表可单测（14 条齐、key==id、book-shediao 在册）。
  E2 之后可加 content.test：grantBook→books 表存在（现 shediao.test 已覆盖 story 内部引用）。
  ⚠️ 仍未做的 E1 关键项：story 接进 Game + 友方(郭靖/黄蓉)行动控制（见更早日志）。
- 2026-07-05 凌晨：**D2(b) 完成** commit `601e911` — 射雕线两场遭遇（sd-huanghe / sd-ouyangfeng）。
  171 单测绿、lint、tsc 过。下一步：**D2(c) `src/data/story/shediao.ts`**：
  用 A 的 StoryEvent/Step 串射雕线：dialogue（入牛家村→遇黄河四鬼）→ battle `sd-huanghe`
  → dialogue（华山）→ battle `sd-ouyangfeng`（onWin/onLose 都续，洪七公救场）→ grantBook `book-jiuyin`
  - gainExp + setFlag `sd-done`。trigger 用某入口 flag（E1 决定怎么点火）。天书 id 定 `book-jiuyin`。
    ⚠️ shediao.ts 里 dialogue step 引用的 dialogueId 需在 data/dialogues 存在，或 story 事件自带内联文本——
    看 A 的 StoryStep dialogue 用的是 dialogueId(引用现有对话系统) 还是内联；若是引用，需在 dialogues 加对应条目，
    或改 runner 支持内联 lines（评估成本，别擅自改引擎；优先加 dialogues 条目）。E2 会加 story 引用完整性测试。
- 2026-07-05 凌晨：**D2(a) 完成** commit `61aa313` — 射雕线人物/武学（郭靖/黄蓉/黄河鬼/欧阳锋 + 降龙/蛤蟆功）。
  163 单测绿、lint、tsc 过。下一步：**D2(b) encounter**：在 data/battles 加
  `sd-huanghe`（黄河四鬼@牛家村，field 用 niujia 感的开阔格，enemies:4×huanghe-gui，allies:[guojing]，
  allySpawns 给 player）与 `sd-ouyangfeng`（欧阳锋@华山，enemies:[ouyangfeng]，allies:[guojing,huangrong]，
  objective:{surviveRounds: 5 左右}）。坐标都要在界内/可站/不重叠（content.test 现只查 allySpawns+enemies，
  allies 坐标合法性等 E2 补测——但仍手工确认别越界/踩不可走格）。
  ⚠️ **E1 关键待办（别忘）**：story 战友军在 ally 侧，但 BattleController 目前只让 player 行动、
  enemyTurnActions 只驱动 enemy 侧；郭靖/黄蓉这些 ally 单位需要「玩家操控」或「友方 AI」，否则回合会卡住。
  E1 集成时必须解决（最简：友方 AI 复用 enemyTurnActions 的趋近-攻击，对 target 取敌方）。
- 2026-07-04 夜：**C3(机制) 完成** commit `b222941` — encounter.allies 剧情战友军随战登场。163 单测绿、lint、tsc 过。
  下一步：**D2 内容三连**（建议再拆小，逐次提交）：
  (a) data/characters + data/skills：加 郭靖(guojing,重装)、黄蓉(huangrong,军师)、敌方 黄河四鬼、欧阳锋，
  及其武学（按 CHARACTERS §4 系数/§3.2 武学表；敌方数值按 §2.3 分层 T1/T3）；
  (b) data/battles：加 encounter `sd-huanghe`(黄河四鬼@牛家村, allies:[郭靖?]) 与
  `sd-ouyangfeng`(欧阳锋@华山, objective.surviveRounds:N, allies:[郭靖,黄蓉])；
  (c) src/data/story/shediao.ts：射雕线 StoryEvent（用 A 的 Step：dialogue/battle/grantBook/gainExp/setFlag），
  天书 id 建议 `book-jiuyin`；battle step 的 battleId 指向 (b) 的 encounter。
  之后 E1 才把 story 接进 Game。E2 加 story/ally 引用完整性测试。
- 2026-07-04 夜：**D1 完成** commit `0c5784c` — 射雕线两张地图（牛家村/华山之巅）。160 单测绿、lint、tsc 过。
  下一步：**D2（`src/data/story/shediao.ts` 射雕线事件数据 + C3 郭靖/黄蓉战友军 encounter）**。
  提示：D2 需新增 encounter（黄河四鬼战 @牛家村、欧阳锋战 @华山用 objective.surviveRounds）到 data/battles；
  郭靖/黄蓉作 encounter 的 ally 出战单位（需先在 data/characters 加郭靖/黄蓉 + data/skills 加其武学）；
  story 事件用 A 的 StoryEvent/Step（dialogue/battle/grantBook/gainExp）；天书 id 如 `book-jiuyin`（九阴/射雕线）。
  E2 会加 story 引用完整性测试；D2 落地时顺手把新 encounter 的敌方 charId 都在 characters 里备好。
- 2026-07-04 夜：**D4 完成** commit `fc298ce` — 战斗可选胜负目标 surviveRounds（打不过也能过）。
  150 单测绿、lint、tsc 均过。下一步：**D1（新地图）+ D2（射雕线 story 数据）+ C3（郭靖/黄蓉战友军）+ D3（天书面板 UI）**。
  提示：D2 的欧阳锋战 encounter 用 `objective:{surviveRounds:N}`；story 数据用 A 的 StoryEvent/Step；
  battle step 的 battleId 要对应 data/battles 里新增的 encounter；grantBook step 放主链（无变体遮蔽）。
  建议下一 firing 先做 D1+D2（纯 data，低风险），D3(Pixi UI) 与 E1(Game 集成) 再往后。
- 2026-07-04 夜：**C(逻辑) 完成** commit `2557d38` — progression.ts 养成/奖励纯逻辑（历练/熟练/天书/applyStoryEffects）。
  144 单测绿、lint、tsc 均过。下一步：**D（内容+地图 §2.4）+ C3（郭靖/黄蓉战友军）**。
  提示：applyStoryEffects(state, effects, {player}) 是 Game 在事件/战斗后应用奖励的入口；
  charLevel/skillLevel/skillPowerMultiplier 供战斗 setup 时把 progress 折算成有效数值（E1 集成时接）。
- 2026-07-04 夜：**B 完成** commit `846eb24` — 存档 v1→v2 迁移（books+progress，SAVE_VERSION=2）。
  130 单测绿、lint、tsc 均过。下一步：**C（战斗奖励接通 §2.3）**——
  用 progress.exp + 曲线 `100×lv^1.5` 做升级；grantBook 幂等（写进 state.books，已有则不重复）；
  gainExp/learnSkill 把 runner 已产出的 effect 真正应用到 state.progress；郭靖/黄蓉作 encounter ally。
- 2026-07-04 夜：**A 完成** commit `687a2a7` — story 事件链纯逻辑核心（types+runner+15 单测）。
  全量 127 单测绿、lint、tsc 均过。下一步：**B（存档 v1→v2 迁移）**。
  提示：runner 已产出 `grantBook`/`gainExp`/`learnSkill` effect（数据形式，待 B/C 落地时由 Game 应用）；
  `eventDoneFlag(id)` = `story-done:<id>` 用于事件不重复触发。
- 2026-07-04 夜：基础设施就绪 — worktree 建好、npm install、cron loop 启动、本进度文件创建。
  下一步：A1（story/types.ts）。
