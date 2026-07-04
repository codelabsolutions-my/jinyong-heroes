# NEXT_STEPS.md — 交接与实施计划

> 写给下一个接手的 Claude session（任何模型）。目标：不需要读完整个对话历史，
> 只读这份文档 + 下面列的必读文件，就能直接开工 M2。
> 完成一个里程碑后：更新本文档（把下一个里程碑展开成同等细度）、更新
> PROJECT_OVERVIEW 的 Scope/Roadmap，然后才开下一个。

---

## 0. 当前状态（2026-07-04）

- **main = `9f0254b`**（M0+M1 已完成并 squash-merge）。工作树干净，无遗留分支/worktree。
- **49 个单测全过**；`npm test && npm run lint && npx tsc --noEmit` 全绿。
- **可玩内容**：两张地图（无名小村 ↔ 后山小径）、3 个 NPC 对话（含条件变体）、
  线索日志（J）、存档（K）/读档（L）、localStorage 存档 v1。
- **已通过 24-agent code review**，8 个正确性 bug 已修复（详见 DECISIONS.md #7-#10 和
  git log `fix(review)` 的提交说明——那次 review 的教训都固化成了测试）。

### 必读文件（按顺序）

1. `CLAUDE.md` — 工作流程和架构铁律（worktree 分支、分层、测试、验证）
2. `docs/GAME_DESIGN.md` — 游戏系统设计（战斗规格在 §4，M2 直接照它做）
3. `docs/PROJECT_OVERVIEW.md` — 当前里程碑 scope（现在是 M2）
4. `docs/DECISIONS.md` — 10 条 ADR，别推翻已定决策
5. `src/game/` 全部文件 — 很小，读完就懂分层怎么做的
6. `scripts/verify-m1.mjs` — e2e 验证的写法范式，M2 照抄结构
7. `docs/STORY_BIBLE.md` — 十四天书全流程章节级设计 + 结局矩阵 + 里程碑映射（写剧情必读）
8. `docs/CHARACTERS_AND_SKILLS.md` — 属性模型、数值曲线、17 队友名册、武学总表（M2 数值直接从这取）

### 怎么跑

```bash
npm run dev                      # http://localhost:5173，方向键/WASD 移动
npm test && npm run lint && npx tsc --noEmit   # 提交前全检
# e2e（需先起 dev server，端口随意但要传对）：
npm run dev -- --port 5199 --strictPort &
node scripts/verify-m1.mjs http://localhost:5199 /tmp/shots
```

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

## 2. M2「第一场架」— 详细实施计划

**目标**：一场完整可玩的网格战棋战斗，从探索触发、打完回到探索。
Scope 见 `docs/PROJECT_OVERVIEW.md`；系统规格见 `GAME_DESIGN.md §4`。

### 2.1 新增文件与归属（lane 见 CLAUDE.md §8）

```
src/game/rng.ts                 # 可播种 RNG（mulberry32），接口 { next(): number }（0..1）
src/game/battle/types.ts        # BattleState / Combatant / BattleAction / 事件日志类型
src/game/battle/setup.ts        # (encounterDef, partyState, rng) => BattleState
src/game/battle/turnOrder.ts    # 速度决定行动序列（每轮按 speed 降序，同速用稳定顺序）
src/game/battle/range.ts        # BFS 移动范围 / 攻击范围计算（纯函数）
src/game/battle/resolve.ts      # 核心：(state, action, rng) => BattleState —— 纯函数！
src/game/battle/__tests__/      # 上面每个模块的单测（这是 M2 的重头测试）
src/data/skills/index.ts        # 武学定义：school 刚|柔|奇, power, range, mpCost
src/data/characters/index.ts    # 战斗单位模板：hp/mp/attack/defense/speed/skills
src/data/battles/index.ts       # 遭遇定义：敌方阵容、战场地图（复用字符网格格式）、胜负条件
src/scenes/BattleScene.ts       # 渲染：战场格子、单位、HP 条、行动高亮、回合横幅
src/ui/BattleMenu.ts            # 行动菜单（见 2.4 键位）
scripts/verify-m2.mjs           # e2e：触发战斗→打完→回到探索
```

### 2.2 规则规格（照 GAME_DESIGN §4，这里补足实现细节）

- **数值**：`damage = max(1, round((attack + skill.power - defense) * counterMod * variance))`
  - `counterMod`：克制 1.25 / 被克 0.75 / 同系或无系 1.0。克制环：刚→奇→柔→刚
  - `variance`：0.9 + rng.next() * 0.2（±10%）
- **行动**：每回合每单位 = 移动（≤move 步，BFS 不穿单位/障碍）+ 一个动作
  （攻击 | 武学 | 待机）。攻击=普攻（range 1，无 mp）；武学耗 mp。
- **胜负**：敌方全灭=胜（回探索，暂时无奖励——M3 接奖励）；我方全灭=败
  （弹提示 → 回到探索并自动尝试读档；无档则回新游戏出生点）。
- **RNG 必须注入**：resolve 里所有随机取自传入的 rng。种子存进 BattleState，
  同种子同操作序列必须得到完全相同的结果（写一个回放测试守住这点）。
- **战斗触发**：新增对话 effect `{ type: "startBattle", battleId: string }`。
  M2 用一个新 NPC（如后山的"拦路强盗"）触发第一场战斗。
  ⚠️ 加 effect 类型时同步：`src/game/dialogue.ts` 的 Effect union、
  `content.test.ts` 的引用完整性测试（battleId 必须存在于 data/battles）。

### 2.3 GameState / 存档

- M2 战斗**不进存档**（战斗中禁用 K/L），GameState 只加长期字段：
  `party: { hp, mp }` 这类战后延续的状态如果 M2 需要，**必须 bump SAVE_VERSION 到 2
  并写 v1→v2 迁移**（loadGame 里有注释标好了迁移点），迁移要有单测。
  如果 M2 先做"战后满血"，可以不动存档格式——推荐这条省事路线。
- `Game` 状态机加 `mode: "battle"`：explore→battle（对话 effect 触发）、
  battle→explore（胜/败结算后）。战斗期间到格/出口检查天然不会跑（player 不动）。

### 2.4 键位（定死，别发明新的）

- 方向键/WASD：移动光标（选格子/选目标）
- 空格/Enter：确认；Esc：取消/返回上级菜单
- 菜单顺序固定：攻击 / 武学 / 待机（上下键选，空格确认）

### 2.5 测试要求

- 单测（src/game/battle/**tests**/）：伤害公式含三系克制矩阵（9 组合全断言）、
  行动序（含同速稳定性）、BFS 范围（障碍/单位阻挡/地图边界）、resolve 纯函数性
  （同 seed 回放一致）、胜负判定。
- 内容测试扩展：skills/characters/battles 的引用完整性（对话 startBattle → battles
  存在；battle 阵容 → characters 存在；character skills → skills 存在）。
- e2e（scripts/verify-m2.mjs）：走到强盗 NPC → 对话触发战斗 → 用键盘打完一整场
  （脚本里写死一条能赢的操作序列；数值设计要保证这条序列稳赢——比如强盗很弱）→
  断言回到 explore、断言战斗结果。截图：战斗开场、选目标高亮、胜利瞬间。

### 2.6 M2 完成定义

1. verify-m2.mjs 全绿 + verify-m1.mjs 仍然全绿（回归）
2. 全部单测/lint/tsc 过；code review 跑过且修完
3. GAME_DESIGN §4 若与实现有出入，同 PR 修文档
4. PROJECT_OVERVIEW 的 Scope 换成 M3 并展开；本文档 §2 换成 M3 的同等细度计划

---

## 3. M3-M6 概要（到时再展开）

- **M3 第一部天书**：射雕线迷你剧情（2-3 章）：新地图（牛家村/破庙）、剧情事件链
  （flag 串联）、战斗奖励接通（经验/武学习得——需要 SAVE_VERSION bump）、第一部天书
  《射雕》入手、日志"主线"分册显示进度。原版感觉参考：拿天书前要完成该线的关键事件。
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
   GameState）。碰撞规则已抽纯（`src/game/movement.ts`），但"完全 state-authoritative
   movement"的重构**刻意推迟**——等 M2 战斗落地后看是否值得，别在 M2 里顺手重构。
2. Toast 显示在顶部会盖住日志面板标题一角 — 纯视觉小瑕疵，M5 美术阶段一起处理。
3. `Input.destroy()` / `Player.teleport()` 目前无调用方 — 留着，别删（切场景清理和
   读档瞬移后续会用）。
4. golden-template 带来的 `.claude/skills/prod-migrate`、`verify-data`、`.env.example`
   对本项目暂无意义 — 无害，留着；若碍事可在独立 chore 分支清理。
5. 无远端仓库，CI workflows（`.github/workflows/`）从未跑过 — 若建 GitHub 远端，
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
