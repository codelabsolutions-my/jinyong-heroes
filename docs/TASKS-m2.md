# M2 第一场架 — 任务清单

> feat/m2-battle。每项验证通过后标 [x]。实施计划见 NEXT_STEPS.md §2。

## 纯逻辑层（src/game/battle/，零 Pixi，重头测试）

1. [x] `src/game/rng.ts`：mulberry32 可播种 RNG，`makeRng(seed) => { next(): 0..1 }` + 单测
2. [x] `src/game/battle/types.ts`：School / Combatant / BattleState / BattleAction / 日志类型
3. [x] `src/game/battle/damage.ts`：伤害公式 + 三系克制（9 组合矩阵单测）
4. [x] `src/game/battle/range.ts`：BFS 移动范围 + 攻击范围（曼哈顿），障碍/单位/边界单测
5. [x] `src/game/battle/turnOrder.ts`：速度降序 + 同速稳定；死亡单位不入队，单测
6. [x] `src/game/battle/ai.ts`：确定性敌方 AI（趋近最近敌、入射程则攻击）+ 单测
7. [x] `src/game/battle/setup.ts`：`(encounter, party, rng) => BattleState` + 单测
8. [x] `src/game/battle/resolve.ts`：核心纯函数 `(state, action, rng) => newState`；move/attack/skill/wait、回合推进、胜负判定 + 单测（含同 seed 回放一致、平衡性 4-8 回合）

## 内容数据（src/data/）

9. [x] `src/data/skills/index.ts`：SkillDef（野球拳 + 长拳测试技）
10. [x] `src/data/characters/index.ts`：CharacterDef（player 小虾米 + 拦路强盗）
11. [x] `src/data/battles/index.ts`：EncounterDef（后山拦路 · 战场 + 阵容 + 出生点）
12. [x] 新 NPC 拦路强盗 + 对话（startBattle effect）；摆到后山小径
13. [x] `dialogue.ts` 加 `startBattle` effect；`AdvanceResult` 透出；`content.test.ts` 引用完整性扩展

## 渲染 + 集成

14. [x] `src/scenes/BattleScene.ts`：战场/单位/HP 条/光标/范围高亮/回合横幅/日志行
15. [x] `src/ui/BattleMenu.ts`：攻击/武学/待机 菜单 + 武学子菜单（mp 显示）
16. [x] `src/core/BattleController.ts`：交互子状态机（选移动→菜单→选目标）+ 敌方自动回合
17. [x] `src/core/Game.ts`：mode "battle"；dialogue startBattle → 进战斗；胜/败 → 回探索
18. [x] `src/main.ts`：`__debug()` 扩展战斗字段（e2e 用）

## 验收

19. [x] 全绿：`npm test && npm run lint && npx tsc --noEmit`
20. [x] e2e `scripts/verify-m2.mjs`：走到强盗→对话触发→键盘打完→回探索胜利；verify-m1 回归仍绿
21. [x] `/code-review` 跑过且修完
22. [x] 文档：GAME_DESIGN §4 对齐实现；PROJECT_OVERVIEW Scope→M3；NEXT_STEPS §2→M3 计划；DECISIONS 加 ADR
23. [x] 提交 + squash-merge 回 main + 收尾（worktree/分支/dev server）
