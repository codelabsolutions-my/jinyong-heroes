# Tasks — M5 §2.1 队友系数/主角等级折算接入战斗

> M5「纵向切片」的第一刀（NEXT_STEPS §2.1 / 补 M4 简化 ADR #27①）。
> **必须先做**：它改战斗平衡，后续 §2.2 choice UI / §2.3 结局都建立在稳定的战斗数值上。
> 本 worktree 只做 §2.1；§2.2–2.5 是后续独立 workstream（CLAUDE §3.1 一 session 一 workstream）。

**Branch:** `feat/m5-battle-scaling`
**Lane:** systems-engineer（`src/game/battle/setup.ts` + `src/core/Game.ts` 胶水 + 单测）。仅内部契约 `SetupInput` 增字段，不跨 render/content lane。
**Definition of done for the whole batch:** 战斗单位属性按主角等级/队友系数动态折算（主角 lv1 向后兼容旧发布数值），单测覆盖，verify-m3/m4 回归全绿，ADR #27① 标记解决。

## Items

- [x] 1. `SetupInput` 增 `playerLevel?: number`（默认 1），`setupBattle` 透传 — _done:_ setup.ts 加字段+doc；tsc 通过。
- [x] 2. `makeCombatant` 折算规则：我方 `player` → `baseStatsAtLevel`；带 `coeff` 队友/战友军 → `companionStats`；其余+**所有敌方** → 静态 — _done:_ `allyStats`/`staticStats` helper，单测三分支各命中。
- [x] 3. `enterBattle`（Game.ts）传 `playerLevel: charLevel(this.state,"player")` — _done:_ setup.ts:246 已接线。
- [x] 4. 单测：主角 lv1 向后兼容（50/20/10/5/10, move4）+ lv5 上升；guojing coeff 折算 65hp；敌方静态 — _done:_ +5 用例，setup 15/15 绿，全套 247 绿。
- [x] 5. 战斗平衡回归：跑 `verify-m1..m4.mjs` — _done:_ 折算后黄河四鬼战 lv1 打不过 → 下调 `huanghe-gui` 24/12/5→16/8/3 → **verify-m1/m2/m3/m4 全绿**（截图 shots/m3-*.png）。
- [x] 6. 文档：DECISIONS #28（折算规则 + encounter.allies 一视同仁）；GAME_DESIGN §4B 标 ① 已补齐 — _done:_ ADR #28 + 划掉简化①。

## 追加交付（用户要求：full map + status page）

- [x] 7. 人物状态页（`ui/StatusPanel` + `status` 模式 + `C`/`Esc`）：等级/属性/侠名/历练条/武学（自带∪习得）/队伍（折算）/门派声望 — _done:_ ADR #29；verify-m5 截图确认渲染。
- [x] 8. 江湖大地图（`data/maps/jianghu`）：官道枢纽连四镇入口，无名小村南口 (14,17) 互通；开放世界步行回路 — _done:_ ADR #30；flood-fill 校验连通；verify-m5 步行 村→江湖→后山 全绿。
- [x] 9. `scripts/verify-m5.mjs`：状态页开关 + 步行进江湖 + 江湖步行抵后山 — _done:_ 全绿。

## Verification log

<!-- item # → command/check run → observed result -->

## Dropped / deferred

- §2.2 choice UI、§2.3 结局系统、§2.4 标题/存档入口+像素素材、§2.5 verify-m5 主线 — 后续独立 workstream，本 worktree 不做。
