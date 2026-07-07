# CONTENT_FORMAT.md — 内容落地规范（bible → src/data 配方）

> 把 `docs/lines/NN-*.md` 的一条线，机械地翻译成 `src/data/` 数据文件的**统一配方**与
> **命名/ID 约定**。目的：任何 session 拿一份线 spec，照本配方就能落地，不用二次决策。
> 引擎能力见 GAME_DESIGN §4A/§4B；地图 id → WORLD_ATLAS；人物 id → ROSTER。

---

## 1. ID 命名空间（全局唯一，kebab）

| 类别          | 前缀/格式            | 例                                     | 落地文件                         |
| ------------- | -------------------- | -------------------------------------- | -------------------------------- |
| 地图          | 拼音 kebab           | `taohuadao`, `xiao-fu`                 | `data/maps/<id>.ts`              |
| 人物/队友/NPC | 拼音 kebab           | `guojing`, `huang-yaoshi`              | `data/characters/`, `data/npcs/` |
| 武学          | 拼音 kebab           | `xianglong-shibazhang`                 | `data/skills/`                   |
| 剧情事件      | `<线缩写>-<beat>`    | `sd-huanghe`, `yy-zhuo`                | `data/story/<line>.ts`           |
| flag          | `<域>:<名>` 或语义名 | `story-done:sd-line`, `xiangyang-hero` | 由 step 产出                     |
| 线索/传闻     | `clue-<线>-<n>`      | `clue-baima-1`                         | `grantClue` step                 |
| 天书          | `book-<线>`          | `book-shediao`, `book-yuanyang`        | `data/books/`                    |
| 结局          | `ending-<名>`        | `ending-xiazhi-dazhe`                  | `data/endings/`                  |

**线缩写表**（事件 id 前缀，固定）：
`yy`鸳鸯刀 · `bm`白马 · `xf`雪山飞狐 · `fh`飞狐外传 · `lc`连城诀 · `sj`书剑 · `bx`碧血剑 ·
`xk`侠客行 · `sd`射雕 · `sn`神雕 · `yt`倚天 · `tl`天龙 · `xa`笑傲 · `ld`鹿鼎 · `end`终局。

---

## 2. 一条线 = 一个 `data/story/<line>.ts`

> ⚠️ **以真实 schema 为准**（`src/game/story/types.ts`）。跳转全部用 step 的 `id` 标签寻址，
> **不用数组下标**（插入/重排 step 不错位）。对话文本**不内联**——`dialogue` 只引 `dialogueId`，
> 文本进 `src/data/dialogues/`。字段名照抄下表，别自造（`delta` 不是 `amount`，`charId` 不是 `characterId`）。

事件链结构（GAME_DESIGN §4A，加线只写数据不改 runner）：

```ts
export const <line>Line: StoryEvent = {
  id: "<缩写>-line",
  trigger: { hasFlag: "<缩写>-start" },   // Condition: hasFlag/notFlag/hasClue/minBooks/minMorality/maxMorality/hasCompanion/minReputation（AND）
  steps: [
    { kind: "dialogue", dialogueId: "<缩写>-intro" },
    { kind: "switchMap", mapId: "<atlas-id>", x: N, y: N },
    { kind: "battle", id: "fight-a", battleId: "<缩写>-a", onWin: "a-win", onLose: "a-lose" },
    { kind: "dialogue", id: "a-lose", dialogueId: "<缩写>-a-lose" },
    { kind: "goto", target: "fight-a" },                 // 战败回打（"打不过也能过"用 onLose 顺进代替）
    { kind: "dialogue", id: "a-win", dialogueId: "<缩写>-choice-pre" },
    { kind: "choice", id: "decide", prompt: "……？", options: [   // 交互抉择 UI(ADR #31)
        { label: "侠义…", goto: "kind" },
        { label: "…", when: { minMorality: 20 }, goto: "evil" },  // when 不满足则该项不可选
      ] },
    { kind: "dialogue", id: "kind", dialogueId: "<缩写>-kind" },
    { kind: "adjustMorality", delta: 8 },                // ±5小/±15章/±30站边（CHARACTERS §5）
    { kind: "setFlag", flag: "<缩写>-kind" },
    { kind: "goto", target: "merge" },
    { kind: "dialogue", id: "evil", dialogueId: "<缩写>-evil" },
    { kind: "adjustMorality", delta: -15 },
    { kind: "dialogue", id: "merge", dialogueId: "<缩写>-boss-pre" },
    { kind: "battle", battleId: "<缩写>-boss", onWin: "win", onLose: "lose" },
    { kind: "dialogue", id: "lose", dialogueId: "<缩写>-boss-lose" },
    { kind: "goto", target: "merge" },
    { kind: "recruit", id: "win", charId: "<队友id>" },  // 入 state.party（可选）
    { kind: "learnSkill", skillId: "<武学id>", who: "player" },
    { kind: "gainExp", amount: 120 },
    { kind: "grantBook", bookId: "book-<line>" },        // 永远在无变体遮蔽的主链(§5)
    { kind: "setFlag", flag: "story-done:<缩写>-line" },
    { kind: "dialogue", dialogueId: "<缩写>-outro" },
    { kind: "end" },
  ],
};
```

字段速查：`dialogue.dialogueId` · `battle.{battleId,onWin,onLose}` · `choice.options[].{label,when?,goto}` ·
`adjustMorality.delta` · `recruit.charId` · `learnSkill.{skillId,who?}` · `grantClue.clueId` ·
`grantBook.bookId` · `gainExp.amount` · `switchMap.{mapId,x,y}` · `goto.target` · `ending.endingId`。
注册进 `data/story/index.ts` 的 `STORY_EVENTS`（顺序影响多触发时的选择——终局类放最后）。

**每章的骨架（STORY_BIBLE §5.4：每章 1 名场面 + 1 战斗/解谜 + ≥1 抉择）**：
入口对话 → switchMap 到章节图 → 名场面对话 → 战斗/解谜 step → 抉择(choice/adjustMorality) → 奖励 → 下一章或 end。

---

## 3. 抉择的落地（choice / adjustMorality）

- 抉择用 `choice` step（交互 UI 已就绪，ADR #31），每个 option 带 `effects` 与可选 `goto`。
- 正邪偏移量**统一取表**（CHARACTERS §5）：±5 小 / ±15 章节级 / ±30 线级站边。不逐条拍脑袋。
- **两难纪律**（STORY_BIBLE §5.2）：没有"明显正确答案"；每个选项都有代价。
- 悲剧内核（乔峰/程灵素等）：玩家只能见证，choice 不改结局，只影响正邪值/后续对话变体。

---

## 4. NPC / 地图落地顺序（建一条线的步骤）

1. **建图**：按 WORLD_ATLAS §2 该线的图（✎ 新建 / ▢ 转正），落 `data/maps/`，配 exits 双向。
2. **摆 NPC**：按 ROSTER §3 该线 NPC，落 `data/npcs/` + `data/dialogues/`（对话文本进 dialogues，不写死在地图）。
3. **写事件链**：按 §2 落 `data/story/<line>.ts`，注册进 `data/story/index.ts`。
4. **人物/敌人数值**：队友按 CHARACTERS §4 系数、BOSS 按 §2.3 分层，落 `data/characters/`。
5. **天书/线索**：`data/books/` 该线天书；入口传闻 `grantClue` 导流（无箭头设计）。
6. **测试**：见 §5。

---

## 5. 测试纪律（每条线必过）

- **content.test.ts 引用完整性**：事件引用的 map/npc/character/skill/book id 必须存在；
  flag 消费方必有产出方；`grantBook` 落在无变体遮蔽的主链事件（STORY_BIBLE §5.5）。
- **runner 单测**：该线事件链跑通（choice 各分支、battle onWin/onLose、goto 无死循环）。
- **balance.test.ts**（CHARACTERS §6.4）：该线标准队 vs 标准 BOSS，固定 seed，回合数落 4–8 区间。
- **e2e verify-<line>.mjs**：puppeteer 实跑该线从入口到天书（CLAUDE.md §1.3——实测才算完成）。
- **结局线**：`decideEnding(state)` 纯函数单测覆盖四结局矩阵（见 `docs/ENDINGS.md`）。

---

## 6. 跨线一致性（避免 14 线各写各的）

- **共享 flag** 只在 STORY_BIBLE §3 总表里定义一次；跨线消费引用总表名，不另造。
- **复用 NPC/队友** 共用同一 id（乔峰、太岳四侠、郭靖黄蓉在多线出场）。
- **人物口吻** 忠于原著（STORY_BIBLE §5.1）——动笔前重读该角色原著名场面。
- **一条线一个 PR/workstream**（CLAUDE.md §3.1），spec 冻结后再落地。
