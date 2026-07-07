# ENDINGS.md — 结局矩阵（decideEnding 规范）

> STORY_BIBLE §1.4 的四结局矩阵，形式化成一个**可单测的纯函数** `decideEnding(state): EndingId`。
> 放 `src/game/ending.ts`（零 Pixi，GAME_DESIGN §4 存档收敛 + §5 分层）。终局事件在集齐 14 天书后
> 触发，调用本函数选结局。M5 已有占位结局「江湖初程」(minBooks:2)——那是里程碑标记，不是终局；
> 终局是"14 书 + 判定"。

---

## 1. 判定规则（优先级从上到下，第一个满足者胜出）

| 优先 | 结局 id                 | 中文         | 条件（全部满足）                                                                     |
| ---- | ----------------------- | ------------ | ------------------------------------------------------------------------------------ |
| 1    | `ending-xiazhi-dazhe`   | 侠之大者     | 14 书 · `morality ≥ 60` · flag `xiangyang-hero`(神雕守城胜) · 终局选「留下」         |
| 2    | `ending-modao-chengzun` | 魔道称尊     | 14 书 · `morality ≤ -60` · flag `heimuya-evil`(笑傲邪线) **或** `guangmingding-evil` |
| 3    | `ending-xiaoyao-guiyin` | 逍遥归隐     | 14 书 · 任一伴侣羁绊满(flag `bond-full:*`) · `-20 ≤ morality ≤ 60`                   |
| 4    | `ending-guiqu`          | 归去（默认） | 14 书（其余情况兜底）                                                                |

**伪代码**（`decideEnding`）：

```ts
function decideEnding(s: GameState): EndingId {
  if (s.books.length < 14) return "none"; // 未集齐，终局不触发
  if (
    s.morality >= 60 &&
    hasFlag(s, "xiangyang-hero") &&
    hasFlag(s, "end-choice-stay")
  )
    return "ending-xiazhi-dazhe";
  if (
    s.morality <= -60 &&
    (hasFlag(s, "heimuya-evil") || hasFlag(s, "guangmingding-evil"))
  )
    return "ending-modao-chengzun";
  if (-20 <= s.morality && s.morality <= 60 && anyBondFull(s))
    return "ending-xiaoyao-guiyin";
  return "ending-guiqu";
}
```

- `anyBondFull(s)` = 存在任一 `bond-full:<pair>` flag（羁绊系统 CHARACTERS §4.1）。
- `hasFlag` 读 `state.flags`；终局选「留下/归去」是终局事件里的一个 `choice`，产 `end-choice-stay`/`end-choice-go`。

---

## 2. 依赖的 flag（来源见 STORY_BIBLE §3 总表）

| flag                                | 产生于             | 用于                  |
| ----------------------------------- | ------------------ | --------------------- |
| `xiangyang-hero`                    | 神雕第3章守城胜    | 侠之大者必要          |
| `heimuya-evil`                      | 笑傲第4章邪线      | 魔道称尊入口          |
| `guangmingding-evil`                | 倚天光明顶邪向站边 | 魔道称尊入口(备选)    |
| `bond-full:*`                       | 各羁绊事件链满     | 逍遥归隐              |
| `end-choice-stay` / `end-choice-go` | 终局事件 choice    | 侠之大者 vs 归去 分流 |

---

## 3. 数据落地

- `src/data/endings/`：四个 `EndingDef{id,title,lines}`（现有 `ending/index.ts` 已有此结构，扩到 4 个）。
- `src/data/story/ending.ts`：终局 `StoryEvent`，`trigger: { minBooks: 14 }`，steps = 归途独白 →
  `choice`(留下/归去) → `{kind:"ending", endingId: decideEnding(state)}` → `end`。
  （`ending` StoryStep + `ui/EndingScreen` 已实装, ADR #33。）
- **测试**：`src/game/__tests__/ending.test.ts`——四结局各构造一个 `GameState` 断言 `decideEnding` 返回值，
  含边界（morality 恰 60 / 恰 -20）与优先级覆盖（同时满足多条时取最高优先）。

---

## 4. 扩展位（M5 后）

STORY_BIBLE §1.4 是**最小四结局**。后续可加：`门派尊主`（某派声望满+掌门线）、
`独孤求败`（全武学毕业技集齐）等——加结局 = 加一行判定 + 一个 EndingDef，不改引擎。
优先级插入时更新本表与 `decideEnding`，同步扩单测。
