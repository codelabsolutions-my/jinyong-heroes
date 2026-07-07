# 线 08 · 侠客行（T2，2 章）— 生产 spec

> **状态：▢ 未实装（design-only）**。本 spec 照黄金模板 `01-yuanyang.md` 写，冻结后再落地。
> 上游：STORY_BIBLE §2.8（章节级）· WORLD_ATLAS §2.6/§3（`xiakedao`）· ROSTER §3.5（石破天/龙木二岛主）·
> CHARACTERS §3.2（太玄功）/§4（石破天数值）/§5（正邪）· CONTENT_FORMAT §2（落地配方，缩写 `xk`）。
> 系统标签：`战` `谜` `募`。

**一句话**：不识字的人参透了天下第一武学——石破天在侠客岛石壁上，只看笔画、不看注解，悟出《太玄经》。
**难度**：T2（2 章，含反向解谜关）。**天书**：`book-xiakexing`（参透石壁即得，《太玄经》与天书合一，最终章主链授予）。
**线缩写**：`xk`。**入口**：泉州渡口/江湖传闻点火 flag `xk-start`（传闻线索 `clue-xiakexing-1` 导流——"赏善罚恶二使又来送腊八粥了"）。

---

## 1. 章节流程

### 第 1 章 · 赏善罚恶令

| 节拍 | 地图                 | 参与 NPC         | 类型               | 内容                                                               |
| ---- | -------------------- | ---------------- | ------------------ | ------------------------------------------------------------------ |
| 起   | 泉州 `quanzhou`      | `shipotian`      | 点火对话           | 街头撞见憨傻少年石破天（狗杂种），错位笑点开场，交代"喝腊八粥"传说 |
| 承   | 泉州 `quanzhou`      | `long-mu-daozhu` | 名场面对话         | 赏善罚恶二使/龙木二岛主持令而至，武林闻风丧胆，无人敢接            |
| 抉择 | —                    | `long-mu-daozhu` | **choice**（两难） | 替人赴死接令（侠++）/ 被迫随石破天上岛（见 §2）                    |
| 转   | 泉州 `quanzhou` 渡口 | `shipotian`      | 名场面对话         | 随石破天登船赴侠客岛，石破天的错位笑点（把凶险当喝粥）             |
| 收   | 侠客岛 `xiakedao`    | `long-mu-daozhu` | switchMap + 招募   | 循海路入岛；石破天同行 `recruit shipotian` 入队，二岛主引向石壁    |

### 第 2 章 · 石壁太玄经（最终章）

| 节拍 | 地图                                     | 参与 NPC         | 类型                      | 内容                                                                          |
| ---- | ---------------------------------------- | ---------------- | ------------------------- | ----------------------------------------------------------------------------- |
| 起   | 侠客岛 `xiakedao` · 石壁二十四室（分区） | `long-mu-daozhu` | 名场面对话                | 二岛主自陈：数十年困于注解、无人能通，请你与石破天参悟                        |
| 承   | 侠客岛 `xiakedao` · 石壁二十四室（分区） | `shipotian`      | **反向解谜**（`谜` 简化） | 二十四室逐室：各家注解选项 vs "不看注解，只看笔画"（见 §5 谜面设计）          |
| 转   | 侠客岛 `xiakedao` · 石壁二十四室（分区） | `shipotian`      | 揭示对话                  | 石破天不识字，只把笔画看作剑招图谱——一举贯通，主题点破                        |
| 收   | 侠客岛 `xiakedao` · 石壁二十四室（分区） | `long-mu-daozhu` | 授天书 + 授武学           | 参透石壁 → `grantBook book-xiakexing` + `learnSkill taixuan-gong` → `xk-done` |

> **地图**：`xiakedao`（侠客岛，dungeon，WORLD_ATLAS §2.6，状态 **▢ 未实装**，经 `quanzhou` 渡口 exit 进）。
> **石壁二十四室不单独建图**——作为 `xiakedao` **岛内分区/子区域**表达（同图内分段，谜面用触发格 + `dialogue` + 门控，
> 见 §5），不新增 map id、不假设引擎改动。落地前 `xiakedao` 为 **待建**，需配泉州渡口双向 exit + 回程闭合。

---

## 2. 抉择与正邪

| 抉择点       | 选项               | 效果                 | flag         |
| ------------ | ------------------ | -------------------- | ------------ |
| 第1章 · 接令 | 替人赴死，挺身接令 | `adjustMorality +30` | `xk-jieling` |
|              | 被迫随石破天上岛   | `adjustMorality 0`   | `xk-beipo`   |

- **两难**（STORY_BIBLE §5.2，两选皆有代价，无"明显正确答案"）：
  - **替人赴死接令**（+30，**线级站边**，取 §5 线级 ±30）：赏善罚恶令历来"接令者有去无回"，替他人挺身赴死是**侠++**的大义——
    但你把自己送进武林公认的鬼门关，同行者、羁绊线均押上性命，代价是"可能真的回不来"的恐惧与牵连。
  - **被迫随石破天上岛**（0，无偏移）：不逞英雄、不揽死义，只是被卷入随波上岛——保全一时的审慎，
    却也意味着此行非你所愿、无侠名可得；叙事上"被动"本身即代价（错失挺身之名，且仍逃不过上岛）。
- 正邪轴刻意做**不对称**：接令=线级 +30 的重奖（呼应"替人赴死"的原著分量），被迫=0（不罚被动，但不给侠名）。
  两支**汇合**于登船/上岛节拍，共走后续主链——**天书与太玄功不因抉择变体遮蔽**（§5.5 纪律）。
- 后果：正邪值影响结局判定与后续对话变体；`xk-jieling` 侠名可作〔侠之大者〕类结局与降龙线（侠≥60）的正向累计。

---

## 3. 招募 / 武学 / 奖励

- **招募**：`shipotian` 石破天（ROSTER §3.5，招募图 `xiakedao`，第 1 章上岛后 `recruit shipotian` 入队）。
  定位=**憨傻高质量肉盾**；系数 `hp 1.5` / `def 1.3` / `spd 0.7`（CHARACTERS §4）；专属特性 **金刚不坏**（受伤上限锁定）。
  **人物口吻**（STORY_BIBLE §5.1）：对话全是**错位笑点**——把凶险当玩笑、把武学当吃食、认死理不识字，忠于原著"狗杂种"的天真。
- **武学**：`taixuan-gong` **太玄功**（CHARACTERS §3.2，内功系被动，**全属性 +15%**，**全游戏数值天花板**）。
  **刻意放在解谜线而非战斗线**——奖励"智取/放下执念"，而非"打得狠"（设计意图见 §7 主题联动）。
- **奖励**：`gainExp 150`（T2 略高于 T1 的 120）+ `grantBook book-xiakexing` + `learnSkill taixuan-gong`（三者同在最终章主链无变体节拍）。

---

## 4. flag 产出/消费

| flag                      | 产/消           | 说明                                                               |
| ------------------------- | --------------- | ------------------------------------------------------------------ |
| `xk-start`                | 消费(trigger)   | 泉州渡口/传闻点火本线                                              |
| `clue-xiakexing-1`        | 消费(导流)      | 入口传闻线索（`grantClue`，无箭头导流，别线传闻可给）              |
| `xk-jieling` / `xk-beipo` | 产出            | 第1章接令两难分支；后续对话变体 + 结局判定消费                     |
| `xk-shipotian`            | 产出            | 第1章招募石破天（`hasCompanion: shipotian` 语义等价）              |
| `xk-zoufo`（走火计数）    | 产出/消费(内部) | 第2章谜面：每选一次"注解"累加，越高提示越明显（见 §5，纯本线内部） |
| `xk-done`                 | 产出            | 线完成（= `story-done:xk-line` 语义，实况命名见下）                |

> 命名约定：CONTENT_FORMAT §1 规范为 `story-done:xk-line`；沿用鸳鸯刀实况风格可写 `xk-done`，
> 落地时与其余线统一择一，此处记差异（同 §01/§02 命名债）。

---

## 5. 事件链落地（sketch，`data/story/xiakexing.ts`——待落地）

按 CONTENT_FORMAT §2 真实 StoryStep schema（`id` 标签寻址，不用下标；对话只引 `dialogueId`）：

```
dialogue(xk-intro)                                  // 泉州撞见石破天，错位笑点
→ dialogue(xk-lingzhi)                              // 龙木二岛主持赏善罚恶令而至（名场面）
→ choice(id:jieling-q, prompt:"这催命的令，接，还是不接？", options:[
        {label:"替人赴死，挺身接令", goto:jieling},
        {label:"被迫随石破天上岛",   goto:beipo} ])
→ dialogue(id:jieling, dialogueId:xk-jieling) → adjustMorality(delta:+30) → setFlag(xk-jieling) → goto(board)
→ dialogue(id:beipo,   dialogueId:xk-beipo)   → adjustMorality(delta:0)   → setFlag(xk-beipo)   → goto(board)
→ dialogue(id:board, dialogueId:xk-embark)          // 汇合：登船赴岛，石破天笑点
→ switchMap(xiakedao, x,y) → recruit(charId:shipotian) → setFlag(xk-shipotian)
→ dialogue(xk-shibi-enter)                          // 二岛主自陈困于注解数十年（石壁分区，同图分段）
→ [反向解谜段：见下] → dialogue(xk-wutong)          // 石破天只看笔画一举贯通，主题点破
→ dialogue(id:reward, dialogueId:xk-taixuan)        // 参透石壁（主链，无变体遮蔽）
→ gainExp(amount:150)
→ grantBook(bookId:book-xiakexing)
→ learnSkill(skillId:taixuan-gong, who:"player")
→ setFlag(xk-done)
→ dialogue(xk-outro) → end
```

**反向解谜段（`谜` 简化版说明）**：STORY_BIBLE §2.8 的"石壁二十四室反向解谜"，落地时**不假设新 step kind**——
用现有能力表达（同 §02 白马"普通地图 + 触发格"思路）：石壁二十四室压缩为 **N 个代表性谜关**（建议 3–4 关抽象二十四室，
不逐室建），每关一个 `choice`：

```
每关（示意，代表二十四室之一）：
choice(id:room-k, prompt:"这一室，怎么参？", options:[
    {label:"不看注解，只看笔画（图谱）", goto:room-k-right},   // ← 唯一正解
    {label:"细读『XX家』注解（越读越玄）", goto:room-k-wrong} ])
→ room-k-right: dialogue(线条如剑招，隐隐生气) → goto(next-room)
→ room-k-wrong: dialogue(注解相互矛盾，气血翻涌=走火) → adjustMorality(delta:-5 小/或 hp 轻惩)
               → setFlag(xk-zoufo 累加) → dialogue(提示随走火升级：注解越读越像陷阱) → goto(back to room-k)
```

- **反向机制**（本线灵魂）：**全部选"只看笔画"才能悟出**；**选注解越多越走火**（气血翻涌，轻惩不硬锁），
  且**走火越深提示越明显**（`xk-zoufo` 计数驱动对话变体：读注解读得越多，旁白越直白地暗示"少年不识字反而看得清"）。
  谜关**打不过也能过**——反复走火只受轻惩、给足提示，最终必能回到正解，不卡关（"奖励智取"而非"惩罚愚钝"）。
- **不看注解只看笔画 = 主题落点**：石破天不识字，只把石壁笔画当剑招图谱，故不落"注解=执念"的陷阱——
  与天龙珍珑棋局"放下执念方破局"同构（§7）。
- 若最终需真正的解谜 step kind（超出"分区分段 + 触发格 + choice"能表达的范围），**须先加 ADR + 引擎能力**再落地——本 spec 不预设新 step kind。

**落地 TODO（转正步骤，CONTENT_FORMAT §4）**：

1. 建图：`xiakedao`（▢ 转正），配 `quanzhou` 渡口双向 exit + 回程闭合；石壁二十四室作**岛内分区**铺谜关触发格（不新增 map id）。
2. 摆 NPC：`shipotian`（招募单位 + 错位笑点对话进 `data/dialogues/`）、`long-mu-daozhu`（关键 NPC，赏善罚恶令/石壁对话）。
3. 写事件链 `data/story/xiakexing.ts`，注册进 `data/story/index.ts` 的 `STORY_EVENTS`。
4. 数值：石破天按 CHARACTERS §4 系数（hp1.5/def1.3/spd0.7/金刚不坏）落 `data/characters/`；本线无强制 BOSS 战（战力靠石破天肉盾 + 谜关），如加护岛杂兵按 §2.3 T2 层。
5. 天书 `book-xiakexing` 落 `data/books/`（《太玄经》与天书合一）；太玄功 `taixuan-gong` 落 `data/skills/`（内功被动，全属性 +15%）；入口传闻 `clue-xiakexing-1` 导流。

---

## 6. 测试（CONTENT_FORMAT §5，落地时必过）

- **content.test.ts 引用完整性**：`xiakedao`/`shipotian`/`long-mu-daozhu`/`book-xiakexing`/`taixuan-gong` 存在；
  `xk-start`/`clue-xiakexing-1` 有产出方；`grantBook` **与** `learnSkill` 同落在**无变体遮蔽的主链** `reward` 节拍（§5.5）。
- **runner 单测**：接令两难（jieling/beipo）各分支跑通；招募 `shipotian`；反向解谜——全选"笔画"直达正解、混选"注解"累加 `xk-zoufo` 且**必回正解不死循环**（goto 收敛）。
- **balance.test.ts**：石破天在队的 T2 标准队（验证 hp1.5/def1.3 肉盾承伤 + 太玄功 +15% 后不破坏平衡曲线），固定 seed，若有护岛战回合数落 4–8 区间。
- **e2e `verify-xiakexing.mjs`**：puppeteer 实跑 入口 → 赏善罚恶令两难 → 招募石破天 → 上侠客岛 → 石壁反向解谜（含一次走火演示）→ 参透 → 天书 + 太玄功入手。

---

## 7. 联动

- **主题（本线灵魂）**：**"不识字的人参透了天下第一武学"**——太玄功刻意放在**解谜线而非战斗线**，
  奖励"放下执念、直观笔画"的智取，而非硬实力。与**天龙珍珑棋局**"放下执念方破局"（虚竹乱下反通）**明确呼应**，
  形成"识字者困于注解 / 不识字者反得真意"的对照母题——两线落地时对话与旁白可互文（跨线主题资产）。
- **太玄功=数值天花板**：全属性 +15% 的顶级内功，是全游戏最强内功奖励之一；因其强度，**唯一获取路径是本线解谜**（不另开购买/掉落），
  保持"智取独得"的稀缺性（同 §3.2 平衡规则——毕业级武学唯一来源）。
- **石破天跨线**：憨傻肉盾 + 错位笑点，作前排承伤位可带入后续线的标准队；羁绊/结局变体落地结局线时按 `hasCompanion: shipotian` 接。
- **地图复用**：`xiakedao` 经 `quanzhou` 海路进（WORLD_ATLAS §3 海岛走港口规则），与神龙岛/通吃岛同属"海外三岛"渡口体系，建图时预留港口 exit 统一样式。
- 入口无硬跨线前置（传闻导流即可触发）；完成产 `xk-done` + `xk-jieling` 侠名，供结局矩阵、降龙线（侠≥60）与后续对话变体消费。
