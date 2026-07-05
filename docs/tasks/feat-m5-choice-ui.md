# Tasks — M5 §2.2 choice 交互选择 UI

> 补 M4 简化 ADR #27②：`advanceStory` 的 `case "choice"` 现自动选 option0；改为弹交互菜单，
> 玩家 ↑↓ 选、空格确认 → `advanceStory({type:"choice", option})`。runner 已产可选项（含 when 过滤），
> 只缺渲染 + 回喂。lane：render（ui/ChoiceBox）+ systems 胶水（core/Game）。

**Branch:** `feat/m5-choice-ui`
**DoD:** 鸳鸯刀线「放走/扭送」由玩家交互选择；verify-m4 真正驱动菜单；单测/lint/tsc/build + e2e 全绿。

## Items

- [x] 1. `ui/ChoiceBox`：居中面板 + prompt + 选项列表，↑↓ 选（跳过禁用）、高亮当前项 — _accept when:_ open/move/selected/close API，仿 BattleMenu。
- [x] 2. Game：`storyChoice` 模式 + `pendingChoice` 存 yield.options；`advanceStory` choice case 开菜单不再自动选；`updateStoryChoice` ↑↓/空格确认回喂 `{type:"choice",option}` — _accept when:_ tsc 过，模式路由接上。
- [x] 3. 探针：`__debug().storyChoice = {prompt, options, selected} | null` 供 e2e 驱动 — _accept when:_ verify 能读到选项与当前选中。
- [x] 4. verify-m4 加 storyChoice 处理：断言 2 选项、↓→selected=1、↑→selected=0、空格确认放走（保留 morality+8 断言）— _accept when:_ verify-m4 全绿且真正走了菜单。
- [x] 5. 文档：ADR #31（choice UI）；GAME_DESIGN §4C 标 ADR #27② 已补齐；yuanyang.ts 去掉「自动选 option0」注释 — _accept when:_ docs-guard 放行。
- [x] 6. 全检 + e2e 回归：verify-m1/m2/m3/m4/m5 全绿；code review 修完 — _accept when:_ 全绿。
