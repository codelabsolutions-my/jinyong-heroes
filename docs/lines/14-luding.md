# 线 14 · 鹿鼎记（T3，3 章）— 反武侠喜剧线 · 生产 spec

> **状态：▢ 未实装**（刻意排到**最后一条**实施——见下方 §0 设计依赖）。
> 上游：STORY_BIBLE §2.14（章节级）· WORLD_ATLAS §2（地图）· ROSTER §2/§3.6（招募/NPC）·
> CHARACTERS_AND_SKILLS §4（韦小宝规则外单位）· CONTENT_FORMAT §2（落地）。
> 格式对齐黄金模板 `docs/lines/01-yuanyang.md`。

**一句话**：反武侠喜剧。不会武功的韦小宝，靠一张嘴、一把石灰、一包蒙汗药，在皇宫、神龙岛、通吃岛之间左右逢源——武林里活得最好的，偏偏是最不像侠客的那个。
**主题**：不会武功的人如何在武林活得最好。
**难度**：T3（内容 T3，但**引擎依赖 T-max**，见 §0）。**天书**：`book-luding`（"四十二章经夹层"，四十二章经碎片拼合后得，unshadowed 主链授予）。
**线缩写**：`ld`。**入口**：皇宫大内 `huanggong`「小太监」引子点火 flag `ld-start`。

---

## 0. ⚠ 引擎/设计前置依赖（BUILD BLOCKER — 先读这一节）

**本线引入全新玩法「对话战斗」(dialogue-as-combat)，spec 冻结 ≠ 可落地。** STORY_BIBLE §2.14
明确要求：**「对话战斗（新玩法，实施前先加 GAME_DESIGN 章节）」**。在下列两项落地之前，本线**不得进入
build workstream**：

1. **GAME_DESIGN 新增「对话战斗」章节**（§4C 或新章）——把「对话选择当作战斗回合」这套玩法
   形式化：什么是「一回合」、选项如何结算「胜负/伤害」、失败如何 fallback 到真实 `battle`。
   没有这章，content-author 无从照配方落地（CONTENT_FORMAT §2 目前只覆盖 `dialogue/choice/battle`
   三种 step，不覆盖「对话即战斗」）。
2. **引擎能力扩展**（systems-engineer lane，`src/game/`）——本线是**验证战斗系统扩展性的试金石**，
   触碰三处现有系统的边界：
   - **规则外单位**：韦小宝 `atk≈0.2`，常规伤害公式对他近乎失效——战斗核心必须容得下「靠状态/
     控制而非伤害取胜」的单位（CHARACTERS §4）。
   - **非伤害制胜条件**：撒石灰致盲、下蒙汗药、溜之大吉——需要引擎支持「致盲/催眠 debuff」与
     「全队无惩罚撤退」这类**非 HP 归零的战斗终止**。
   - **对话战斗结算器**：把 `choice` 的选项后果映射成战斗态的转移（选对=推进/免战，选错=掉血/触发真打）。

> **落地顺序硬约束**：GAME_DESIGN 章节 → 引擎扩展 + 单测 → 本线内容落地。上游未就绪时，本 spec
> 停在「设计冻结」态，不开 content PR。这也是「刻意放最后实施」的原因——让其余 13 条线先把常规
> 战斗/剧情引擎跑成熟，最后用本线压测扩展性。

**新玩法一览（三种，全部 ▢ 未实装，均需 §0.1/§0.2 先落地）**：

| 玩法               | 出现章节 | 引擎需求                            | fallback（选错/失败时）          |
| ------------------ | -------- | ----------------------------------- | -------------------------------- |
| 嘴炮玩法(对话战斗) | 第 1 章  | 对话战斗结算器：选项→胜负/伤害      | 顺进真实 `battle`（选错才打）    |
| 马屁喜剧解谜       | 第 2 章  | 选项「夸张度」评分 → 洪教主好感阈值 | 好感不足则触发 `hong-jiaozhu` 战 |
| 四十二章经拼图     | 第 3 章  | 拼图小游戏 step（碎片收集→拼合）    | 碎片不齐则密室不开（无战斗）     |

---

## 1. 章节流程

### 第 1 章 · 京城（皇宫大内 `huanggong`）

| 节拍 | 地图                 | 参与 NPC       | 类型                   | 内容                                              |
| ---- | -------------------- | -------------- | ---------------------- | ------------------------------------------------- |
| 起   | 皇宫大内 `huanggong` | 小太监(引子)   | 点火对话               | 误入宫廷，撞见冒充太监的韦小宝                    |
| 承   | 皇宫大内 `huanggong` | `weixiaobao`   | **嘴炮玩法**(对话战斗) | 卷入宫廷斗——用对话选择过关，**选错才打**          |
| 抉择 | —                    | `weixiaobao`   | **choice**             | 帮韦小宝圆谎(+市井机变)/秉公戳穿(+侠义但触怒宫廷) |
| 转   | 皇宫大内 `huanggong` | 侍卫(选错分支) | **battle**(fallback)   | 嘴炮失败才发生的真实战斗                          |
| 收   | 皇宫大内 `huanggong` | `weixiaobao`   | **招募**               | 韦小宝服气，入队（**规则外单位**）                |

> **嘴炮玩法核心**：本章用「对话战斗」代替常规 `battle` 作为过关方式。选对话推进剧情、免于开打；
> 选错则**顺进**一场真实 `battle`（CONTENT_FORMAT §2「打不过也能过」的反用——这里是「说不过才要打」）。

### 第 2 章 · 神龙岛（`shenlongdao` ✎ 新建）

| 节拍 | 地图                 | 参与 NPC       | 类型               | 内容                                       |
| ---- | -------------------- | -------------- | ------------------ | ------------------------------------------ |
| 起   | 神龙岛 `shenlongdao` | 神龙教众       | 过场对话           | 渡海登岛，撞上「仙福永享，寿与天齐」的教众 |
| 承   | 神龙岛 `shenlongdao` | `hong-jiaozhu` | **马屁喜剧解谜**   | 面见洪教主——**马屁选项越夸张越有效**       |
| 抉择 | —                    | `hong-jiaozhu` | **choice**         | 谄媚到底(过关免战)/正气凛然(触怒→BOSS 战)  |
| 合   | 神龙岛 `shenlongdao` | `hong-jiaozhu` | **BOSS**(fallback) | 马屁不到位才打的洪教主战                   |
| 收   | 神龙岛 `shenlongdao` | `weixiaobao`   | 过场               | 骗得洪教主信任，套出四十二章经下落         |

> **马屁喜剧解谜核心**：洪教主对奉承有「夸张度」阈值——选项越离谱、越肉麻，好感涨得越多；
> 达到阈值即「解谜成功」，绕过 BOSS 战。选正气/克制选项则好感不足，`hong-jiaozhu` 开打（fallback）。

### 第 3 章 · 通吃岛（`tongchidao` ✎ 新建）

| 节拍 | 地图                | 参与 NPC     | 类型           | 内容                                  |
| ---- | ------------------- | ------------ | -------------- | ------------------------------------- |
| 起   | 通吃岛 `tongchidao` | `weixiaobao` | 过场对话       | 韦小宝领入藏宝密室                    |
| 承   | 通吃岛 `tongchidao` | —            | **拼图小游戏** | 四十二章经**碎片拼图**——集齐碎片拼合  |
| 收   | 通吃岛 `tongchidao` | `weixiaobao` | 授天书         | 碎片拼合，夹层现「天书」→ `grantBook` |

> **拼图小游戏核心**：本章无战斗，靠拼图 step 收束。碎片可散落前两章（如宫中/神龙岛各得几片），
> 第 3 章拼合成整本四十二章经，夹层藏天书。碎片不齐→密室机关不开（无 fallback 战，纯解谜门槛）。

**地图状态**：`huanggong`▢ 转正（WORLD_ATLAS §2，与碧血剑「刺帝」共用，本线走「宫斗」用途）·
`shenlongdao`✎ 新建 · `tongchidao`✎ 新建。海岛经泉州渡口进（WORLD_ATLAS §说明3：不直连大陆）。

---

## 2. 抉择与正邪

| 抉择点         | 选项         | 效果                 | flag         |
| -------------- | ------------ | -------------------- | ------------ |
| 第1章·宫廷圆谎 | 帮韦小宝圆谎 | `adjustMorality -5`  | `ld-help`    |
|                | 秉公戳穿     | `adjustMorality +5`  | `ld-honest`  |
| 第2章·面见教主 | 谄媚到底     | `adjustMorality -5`  | `ld-flatter` |
|                | 正气凛然     | `adjustMorality +15` | `ld-upright` |

- **两难纪律**（STORY_BIBLE §5.2）：本线的「正确答案」被喜剧化地倒置——**圆滑/谄媚**往往才是过关
  的路（免战、推进），却要付正邪代价；**正直**选项道德加分，却把自己推进硬仗（fallback 战）。这正是
  「反武侠」内核：武林最优解未必是侠义最优解。
- 偏移量取表（CHARACTERS §5：±5 小 / ±15 章节级）。喜剧线不设 ±30 站边级抉择。
- 后果：正邪值影响结局矩阵（ENDINGS）与后续对话变体；choice 不改本线喜剧结局（韦小宝总能全身而退）。

---

## 3. 招募 / 武学 / 奖励

- **招募**：`weixiaobao` 韦小宝（第 1 章末入队，`huanggong`，ROSTER §2）。
  **规则外单位 · 验证战斗系统扩展性的试金石**（CHARACTERS §4，line 120）：
  - 数值：`atk≈0.2`（常规伤害公式对他近乎失效）、`spd1.3`（先手撒控制）。
  - 技能全为**控制/逃跑/非伤害**——见下表。这套技能是压测引擎「非 HP 制胜」能力的核心用例（§0.2）。

  | 技能     | 效果                    | 引擎需求（▢ 未实装）             |
  | -------- | ----------------------- | -------------------------------- |
  | 撒石灰   | 致盲（命中/闪避大降）   | 「致盲」debuff 状态              |
  | 溜之大吉 | 全队撤退，**无惩罚**    | 非 HP 归零的战斗终止（安全退出） |
  | 下蒙汗药 | 催眠/眩晕（跳过其行动） | 「催眠」debuff 状态              |

- **奖励**：`gainExp`（T3 量级，落地时按 CHARACTERS §4 定）+ `grantBook book-luding`。
- **武学**：无专属「毕业技」；韦小宝的价值是**功能性规则外单位**，不塞常规武学。
  （邪线可选武学「化骨绵掌」见 CHARACTERS §85，非本线主链，按需另议。）

---

## 4. flag 产出/消费

| flag                        | 产/消         | 说明                                      |
| --------------------------- | ------------- | ----------------------------------------- |
| `ld-start`                  | 消费(trigger) | 皇宫小太监点火                            |
| `ld-help` / `ld-honest`     | 产出          | 第1章抉择分支                             |
| `ld-flatter` / `ld-upright` | 产出          | 第2章抉择分支                             |
| `ld-fragments`              | 产出          | 四十二章经碎片集齐（拼图门槛，第3章消费） |
| `story-done:ld-line`        | 产出          | 线完成（CONTENT_FORMAT §1 规范命名）      |

> 命名遵循 CONTENT_FORMAT §1（`<域>:<名>` / `<缩写>-<名>`）。碎片若分章收集，用 `ld-fragment-1..N`
> 累积、第3章校验齐全后置 `ld-fragments`（具体片数落地时定，随拼图设计）。

---

## 5. 事件链落地（配方，`data/story/luding.ts`）

> ⚠ **未落地**：待 §0 的 GAME_DESIGN「对话战斗」章节 + 引擎扩展就绪后，方按此配方开 content PR。
> 下列骨架中 `dialogueBattle` / `puzzle` 为**待定 step 类型**（现 schema 无——由 §0.1 章节定义后补入
> CONTENT_FORMAT §2 与 `src/game/story/types.ts`）。

```ts
export const ludingLine: StoryEvent = {
  id: "ld-line",
  trigger: { hasFlag: "ld-start" },
  steps: [
    // —— 第 1 章 · 京城（嘴炮玩法）——
    { kind: "dialogue", dialogueId: "ld-intro" },
    { kind: "switchMap", mapId: "huanggong", x: /*TBD*/ 0, y: 0 },
    {
      kind: "dialogueBattle",
      id: "ld-mouth",
      dialogueId: "ld-court-talk", // ▢ 新 step（§0.1）
      onWin: "ch1-choice",
      onLose: "ld-guard-fight",
    }, // 说赢→推进；说输→真打
    {
      kind: "battle",
      id: "ld-guard-fight",
      battleId: "ld-shiwei", // fallback 真实战斗
      onWin: "ch1-choice",
      onLose: "ld-guard-fight",
    },
    {
      kind: "choice",
      id: "ch1-choice",
      prompt: "韦小宝的谎，帮不帮圆？",
      options: [
        { label: "帮他圆谎", goto: "ld-help" },
        { label: "秉公戳穿", goto: "ld-honest" },
      ],
    },
    { kind: "dialogue", id: "ld-help", dialogueId: "ld-help" },
    { kind: "adjustMorality", delta: -5 },
    { kind: "setFlag", flag: "ld-help" },
    { kind: "goto", target: "ch1-merge" },
    { kind: "dialogue", id: "ld-honest", dialogueId: "ld-honest" },
    { kind: "adjustMorality", delta: 5 },
    { kind: "setFlag", flag: "ld-honest" },
    { kind: "dialogue", id: "ch1-merge", dialogueId: "ld-recruit-pre" },
    { kind: "recruit", charId: "weixiaobao" }, // 规则外单位入队

    // —— 第 2 章 · 神龙岛（马屁喜剧解谜）——
    { kind: "switchMap", mapId: "shenlongdao", x: 0, y: 0 },
    { kind: "dialogue", dialogueId: "ld-shenlong-intro" },
    {
      kind: "dialogueBattle",
      id: "ld-flattery",
      dialogueId: "ld-hong-flatter", // ▢ 新 step：夸张度评分
      onWin: "ch2-merge",
      onLose: "ld-hong-fight",
    }, // 马屁够足→免战
    {
      kind: "battle",
      id: "ld-hong-fight",
      battleId: "ld-hong", // fallback：洪教主 BOSS
      onWin: "ch2-merge",
      onLose: "ld-hong-fight",
    },
    { kind: "dialogue", id: "ch2-merge", dialogueId: "ld-jing-clue" },
    { kind: "setFlag", flag: "ld-fragments" }, // （占位：碎片集齐）

    // —— 第 3 章 · 通吃岛（拼图 → 天书）——
    { kind: "switchMap", mapId: "tongchidao", x: 0, y: 0 },
    { kind: "dialogue", dialogueId: "ld-tongchi-intro" },
    {
      kind: "puzzle",
      id: "ld-puzzle",
      puzzleId: "ld-42jing", // ▢ 新 step：拼图小游戏
      require: "ld-fragments",
      onSolve: "ld-book",
    },
    { kind: "dialogue", id: "ld-book", dialogueId: "ld-book-reveal" },
    { kind: "gainExp", amount: /*T3 · 落地时定*/ 0 },
    { kind: "grantBook", bookId: "book-luding" }, // unshadowed 主链授予
    { kind: "setFlag", flag: "story-done:ld-line" },
    { kind: "dialogue", dialogueId: "ld-outro" },
    { kind: "end" },
  ],
};
```

> `dialogueBattle` / `puzzle` 是本 spec **提名**的新 step，最终形状由 §0.1 的 GAME_DESIGN 章节拍板，
> 再回写 CONTENT_FORMAT §2。在此之前，本骨架仅为设计草图，**不视为可落地契约**。

---

## 6. 测试

> 全部 ▢ 未实装；下列为**落地时的测试清单**（依 CONTENT_FORMAT §5）。前提：§0 引擎/设计已就绪。

- **content.test.ts 引用完整性**：`huanggong`/`shenlongdao`/`tongchidao`、`weixiaobao`、`hong-jiaozhu`、
  `book-luding` 均存在；flag 消费必有产出；`grantBook` 落在无变体遮蔽主链。
- **对话战斗单测（新）**：验证「选对→免战推进 / 选错→顺进真实 battle」两分支；马屁「夸张度」阈值分支。
- **规则外单位单测（试金石，§0.2）**：`weixiaobao` `atk≈0.2` 参战不崩公式；撒石灰致盲 / 蒙汗药催眠 /
  溜之大吉「无惩罚全队撤退」三条非 HP 制胜路径可结算、可回放（确定性核心，CLAUDE.md §5.5）。
- **拼图 step 单测（新）**：碎片不齐→密室不开；集齐→`onSolve` 授天书。
- **balance.test.ts**：仅覆盖 fallback 真实战（`ld-shiwei` / `ld-hong`）；对话战斗/拼图不走战斗平衡。
- **e2e verify-luding.mjs**：puppeteer 实跑入口→嘴炮过关→马屁解谜→拼图→天书（含选错触发真打的支线）。

---

## 7. 联动

- **排序**：注册进 `data/story/index.ts` 的 `STORY_EVENTS` 时，本线（连同终局类）放靠后（CONTENT_FORMAT §2）。
- **入口导流**：太岳四侠情报贩子网（ROSTER §3.6 注）在扬州/泉州出摊时，可卖「宫中出了个不会武功却
  混得风生水起的小子」传闻，`grantClue` 导向 `huanggong`（无箭头开放世界）。
- **跨线共用图**：`huanggong` 与碧血剑（刺帝）共用（WORLD_ATLAS §2）——本线用「宫斗」，碧血剑用「刺帝」，
  同图不同用途，落地时注意两线 flag 互不污染。
- **规则外单位复用**：`weixiaobao` 入队后，其「溜之大吉」在其余线的困难战中亦可作保命手段——是本线
  对全局战斗系统的正向外部性（也是「试金石」价值的延续）。
- **无强制前置**：内容上不依赖其他线通关；但**工程上强依赖** §0 引擎/设计前置——这是唯一的硬阻塞。
