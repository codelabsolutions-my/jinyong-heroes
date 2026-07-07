# 线 13 · 笑傲江湖（T3，4 章）— 生产 spec

> **状态：📝 spec（未实装）**。格式对齐**黄金模板** `docs/lines/01-yuanyang.md`；本线尚无 `src/data/story/xiaoao.ts`，
> 全部为规范（"待落地"）。
> 上游：STORY_BIBLE §2.13（章节级）· WORLD_ATLAS §2（地图）· ROSTER §2/§3.6（队友/NPC）·
> CONTENT_FORMAT §2（落地配方）· CHARACTERS_AND_SKILLS §4/§4.1/§5（数值/羁绊/正邪）· ENDINGS（结局 flag）。

**一句话**：有人的地方就有江湖——伪君子与真小人。目击"正派"灭门，随令狐冲学独孤九剑，最终在黑木崖走上救人（正）或投教（邪）的岔口。
**难度**：T3（全游戏单体最强 BOSS 东方不败；正邪线互斥的标杆）。**天书**：`book-xiaoao`（黑木崖秘库；无变体遮蔽，正/邪两支汇合后授予）。
**线缩写**：`xa`。**入口**：衡山城 `hengshan`「金盆洗手大会」告示点火 flag `xa-start`（导流靠太岳四侠情报贩子传闻 `clue-xa-1`，无箭头设计）。

---

## 1. 章节流程

> 每章骨架（STORY_BIBLE §5.4）：入口对话 → switchMap → 名场面 → 战斗/见证 → 抉择 → 奖励 → 下一章。
> **悟性事件 ×3**（`xa-wuxing-1/2/3`）为分散前三章的**隐藏对话**，全触发方满足第 2 章学〔独孤九剑〕的条件（见 §3）。

### 第 1 章 · 衡山金盆洗手

| 节拍 | 地图                | 参与 NPC            | 类型                 | 内容                                                      |
| ---- | ------------------- | ------------------- | -------------------- | --------------------------------------------------------- |
| 起   | 衡山城 `hengshan` ✎ | `liu-zhengfeng`     | 名场面对话           | 刘正风金盆洗手，欲退隐结交莫大/曲洋                       |
| 承   | 衡山城 `hengshan`   | 嵩山派执法队        | **见证战**(悲剧内核) | 嵩山派以"通魔"为名血洗刘门；玩家插手徒劳，choice 不改结局 |
| 抉择 | —                   | —                   | **choice**           | 拔刀相助(徒劳，+侠名)/隐忍旁观(自保)——见证式两难          |
| 钩子 | —                   | 旁白                | 剧情标记             | 埋"正派未必正"→ 为第 4 章邪线做心理铺垫                   |
| 隐藏 | 衡山城              | `linghuchong`(客串) | **悟性事件#1**       | 隐藏对话：令狐冲论"料敌机先"→ 产 `xa-wuxing-1`            |

### 第 2 章 · 华山思过崖

| 节拍 | 地图               | 参与 NPC        | 类型           | 内容                                                         |
| ---- | ------------------ | --------------- | -------------- | ------------------------------------------------------------ |
| 起   | 思过崖 `siguoya` ✎ | `linghuchong`   | 对话/**招募**  | 令狐冲被罚面壁思过崖；并肩后 `recruit linghuchong`           |
| 承   | 思过崖 `siguoya`   | 剑宗余孽/田伯光 | **战斗**       | 崖下遇袭，实战检验                                           |
| 转   | 思过崖 `siguoya`   | `feng-qingyang` | 名场面对话     | 风清扬石壁授剑；讲"无招胜有招"                               |
| 授技 | —                  | `feng-qingyang` | **learnSkill** | 若 `xa-wuxing-1/2/3` 全在→ `learnSkill dugu-jiujian`(player) |
| 隐藏 | 思过崖             | 石壁剑招        | **悟性事件#2** | 隐藏对话：参五岳剑派破绽图→ 产 `xa-wuxing-2`                 |

### 第 3 章 · 五霸冈

| 节拍 | 地图                | 参与 NPC      | 类型           | 内容                                                   |
| ---- | ------------------- | ------------- | -------------- | ------------------------------------------------------ |
| 起   | 五霸冈 `wubagang` ✎ | 群豪          | 名场面对话     | 令狐冲重伤，江湖群豪聚五霸冈相救                       |
| 承   | 五霸冈 `wubagang`   | `renyingying` | 对话/**招募**  | 圣姑任盈盈现身；随后 `recruit renyingying`             |
| 羁绊 | 绿竹巷(冈内)        | `renyingying` | **羁绊事件**   | 琴箫合奏《笑傲江湖曲》→ 启 `bond` 链(令狐冲×任盈盈)    |
| 隐藏 | 五霸冈              | 任盈盈论琴理  | **悟性事件#3** | 隐藏对话：以琴入剑，悟"以无形克有形"→ 产 `xa-wuxing-3` |

### 第 4 章 · 黑木崖（正 / 邪 互斥，见 §2）

| 节拍  | 地图               | 参与 NPC         | 类型               | 内容                                                        |
| ----- | ------------------ | ---------------- | ------------------ | ----------------------------------------------------------- |
| 起    | 黑木崖 `heimuya` ▢ | —                | switchMap+对话     | 任盈盈被东方不败囚于崖顶秘库                                |
| 抉择  | —                  | —                | **choice(互斥)**   | **正线**：助令狐冲闯崖救人 / **邪线**：投效日月神教清理门户 |
| 正·合 | 黑木崖 `heimuya`   | `dongfang-bubai` | **BOSS(天花板)**   | 东方不败 spd 碾压——须靠地形/人数优势破（详 §2/§3）          |
| 邪·合 | 黑木崖 `heimuya`   | `dongfang-bubai` | **战斗(替其清门)** | 替东方不败诛除异己（含令狐冲一方）→ 产 `heimuya-evil`       |
| 收    | 黑木崖秘库         | 旁白             | 授天书             | 两支汇合：`grantBook book-xiaoao`（无变体遮蔽主链）→ `end`  |

**地图**：`hengshan`/`siguoya`/`wubagang` ✎ 新建（WORLD_ATLAS §2），`heimuya` ▢ 未实装/转正。
`siguoya` 从 `huashan-pai` 门派进入；`heimuya` 秘境不挂枢纽，从塞外/华北边缘硬闯（WORLD_ATLAS §2 秘境规则）。

---

## 2. 抉择与正邪（含正/邪互斥分支——本线核心）

| 抉择点             | 选项            | `when`(可选性)    | 效果                             | flag           |
| ------------------ | --------------- | ----------------- | -------------------------------- | -------------- |
| Ch1 灭门见证       | 拔刀相助(徒劳)  | —                 | `adjustMorality +5`              | `xa-c1-help`   |
|                    | 隐忍旁观        | —                 | `adjustMorality -5`              | `xa-c1-watch`  |
| **Ch4 黑木崖岔口** | **正·救任盈盈** | —（默认可选）     | `adjustMorality +15`             | `xa-zheng`     |
|                    | **邪·投效神教** | `maxMorality:-40` | `adjustMorality -30`（线级站边） | `xa-xie`       |
| Ch4 邪线·清门户后  | （无选，顺进）  | —                 | `setFlag heimuya-evil`           | `heimuya-evil` |

**正/邪互斥落地纪律**：

- **门槛**：邪线选项带 `when: { maxMorality: -40 }`（CHARACTERS §5「黑木崖邪线入口 邪≤-40」）。正邪值不够黑者，该项**不可选**——邪线不是随手可点的，须前面各线累积到枭雄档。
- **互斥**：`xa-zheng` 与 `xa-xie` 由同一 `choice` 分流，`goto` 到两条互不回头的支链；两支各自 `battle` 后 **汇合(merge)** 到同一 `grantBook`。天书两条路都拿得到（STORY_BIBLE：天书在黑木崖秘库，与站边无关）。
- **正线**（`xa-zheng`）：助令狐冲救任盈盈，打赢东方不败（见 §3 战术）。此路径下若羁绊链已满 → 产 `bond-full:linghu-ying`（见 §3）。
- **邪线**（`xa-xie`）：投效日月神教，替东方不败清理门户（战斗对象含令狐冲一方，**背叛**）→ 顺进产 **`heimuya-evil`**。此举与令狐冲/任盈盈羁绊**互斥**（背叛盈盈→羁绊断，不产 `bond-full:linghu-ying`）。
- **两难纪律**（STORY_BIBLE §5.2）：正线=侠义但直面全游戏最强 BOSS（高门槛硬仗）；邪线=避开硬仗、得神教之势，但踏出"魔道"第一步、失去羁绊与逍遥归隐资格。
- **悲剧内核**：Ch1 灭门是见证式（choice 不改刘正风结局，只动正邪值/后续对话变体），与 Ch4 的**真岔口**（choice 实打实改分支）区分开——一见证、一抉择，教学玩家两种 choice 语义。

**下游结局**（ENDINGS §1）：`heimuya-evil` 是〔**魔道称尊**〕`ending-modao-chengzun` 的**主要入口**（另一入口 `guangmingding-evil`）；触发还需集齐 14 天书 且 `morality ≤ -60`。邪线自身 `-30` 站边不足 -60——须跨线累积，本线只提供入口 flag。`bond-full:linghu-ying` 是〔**逍遥归隐**〕`ending-xiaoyao-guiyin` 的任一伴侣羁绊满条件（`-20 ≤ morality ≤ 60`）。

---

## 3. 招募 / 武学 / 奖励 / 羁绊

- **招募**（ROSTER §2）：
  - `linghuchong` 令狐冲——Ch2 `siguoya` 招募（暴击剑客：`atk1.2 crit+20%`，自带〔独孤九剑〕3 级）。
  - `renyingying` 任盈盈——Ch3 `wubagang` 招募（辅助/羁绊核心：`atk0.6 mp1.3`，〔清心普善咒〕群体解控/回 mp）。
  - 邪线**不阻断招募**（二人已在前三章入队）；邪线的代价体现在羁绊断裂与正邪站边，而非退队。
- **武学**（CHARACTERS §4/§4.1）：
  - **玩家毕业技**：`dugu-jiujian` 独孤九剑（奇系毕业技，唯一；无视 50% defense——破防定位）。**学习条件**：`feng-qingyang` 授，且 `xa-wuxing-1 && xa-wuxing-2 && xa-wuxing-3` 三个悟性隐藏事件**全触发**（`learnSkill` step 前置 `hasFlag` ×3；缺一则风清扬对话走"机缘未到"变体，不授）。
  - 令狐冲作为队友**自带**独孤九剑 3 级——与玩家习得是两回事（一个是 recruit 静态携带，一个是 player `learnSkill`）。
- **羁绊标杆**（CHARACTERS §4.1，GAME_DESIGN §3.1）：令狐冲×任盈盈**同队**触发羁绊事件链。
  - 挂点：Ch3 绿竹巷琴箫启链 → 后续同队战斗/对话累积 → 满链产 `bond-full:linghu-ying`。
  - 数据化为 flag 链（非硬编码）；满羁绊解锁〔逍遥归隐〕结局条件。
  - **仅正线路径**可达满（邪线背叛即断链）。
- **奖励**：`gainExp 240`（T3）+ `grantBook book-xiaoao`（正/邪汇合主链，永不被变体遮蔽——CONTENT_FORMAT §5）。

**BOSS·东方不败（`dongfang-bubai`，天花板层）战术**（CHARACTERS §2.3 天花板：spd 40 超模）：

- 速度碾压——正常对拼必被压制。设计为**必须**用地形/人数优势破：黑木崖地形卡位（狭道限制其走位）+ 令狐冲(破防)+任盈盈(解控/回蓝)+玩家(独孤九剑无视防御) 多打一。
- `onLose` 不硬性回打全灭——可给"退守绿竹巷再来"顺进变体，但正线要过必须最终赢下（救人语义）。平衡由 balance.test 固定 seed 卡回合数。

---

## 4. flag 产出 / 消费

| flag                        | 产/消         | 说明                                                        |
| --------------------------- | ------------- | ----------------------------------------------------------- |
| `xa-start`                  | 消费(trigger) | 衡山城告示点火                                              |
| `clue-xa-1`                 | 消费(导流)    | 太岳四侠情报贩子传闻（无箭头导流，非硬门槛）                |
| `xa-c1-help`/`xa-c1-watch`  | 产出          | Ch1 见证抉择；后续对话变体消费                              |
| `xa-wuxing-1/2/3`           | 产出(隐藏)    | 前三章悟性事件；Ch2 `learnSkill dugu-jiujian` 前置全消费    |
| `xa-zheng` / `xa-xie`       | 产出          | Ch4 正/邪互斥分支标记                                       |
| **`heimuya-evil`**          | **产出**      | 邪线专属；〔魔道称尊〕主要入口（ENDINGS §1/§2）             |
| **`bond-full:linghu-ying`** | **产出**      | 令狐冲×任盈盈羁绊满（仅正线）；〔逍遥归隐〕条件（羁绊标杆） |
| `story-done:xa-line`        | 产出          | 线完成（CONTENT_FORMAT §1 规范命名）                        |

> 跨线共享 flag（`heimuya-evil`/`bond-full:*`）在 STORY_BIBLE §3 总表定义一次，本线只产出，不另造名。

---

## 5. 事件链落地（待落地，`data/story/xiaoao.ts`）

按 CONTENT_FORMAT §2 配方；跳转全部用 step `id` 标签寻址，不用下标。对话文本进 `data/dialogues/`，此处只引 `dialogueId`。骨架：

```ts
export const xiaoaoLine: StoryEvent = {
  id: "xa-line",
  trigger: { hasFlag: "xa-start" },
  steps: [
    // —— Ch1 衡山金盆洗手 ——
    { kind: "switchMap", mapId: "hengshan", x: 12, y: 10 },
    { kind: "dialogue", dialogueId: "xa-c1-jinpen" }, // 刘正风金盆洗手名场面
    {
      kind: "battle",
      id: "c1-witness",
      battleId: "xa-c1-songshan",
      onWin: "c1-after",
      onLose: "c1-after",
    }, // 见证战：胜负都顺进(悲剧内核)
    { kind: "dialogue", id: "c1-after", dialogueId: "xa-c1-choice-pre" },
    {
      kind: "choice",
      id: "c1-decide",
      prompt: "刘门血流成河，你……？",
      options: [
        { label: "拔刀相助", goto: "c1-help" },
        { label: "隐忍旁观", goto: "c1-watch" },
      ],
    },
    { kind: "dialogue", id: "c1-help", dialogueId: "xa-c1-help" },
    { kind: "adjustMorality", delta: 5 },
    { kind: "setFlag", flag: "xa-c1-help" },
    { kind: "goto", target: "c1-hook" },
    { kind: "dialogue", id: "c1-watch", dialogueId: "xa-c1-watch" },
    { kind: "adjustMorality", delta: -5 },
    { kind: "setFlag", flag: "xa-c1-watch" },
    { kind: "dialogue", id: "c1-hook", dialogueId: "xa-c1-wuxing" }, // 悟性#1 隐藏对话
    { kind: "setFlag", flag: "xa-wuxing-1" },

    // —— Ch2 华山思过崖 ——
    { kind: "switchMap", mapId: "siguoya", x: 8, y: 14 },
    { kind: "dialogue", dialogueId: "xa-c2-chong" },
    { kind: "recruit", charId: "linghuchong" },
    {
      kind: "battle",
      battleId: "xa-c2-tian",
      onWin: "c2-feng",
      onLose: "c2-feng",
    },
    { kind: "dialogue", id: "c2-feng", dialogueId: "xa-c2-fengqingyang" }, // 风清扬授剑名场面
    { kind: "setFlag", flag: "xa-wuxing-2" }, // 悟性#2(石壁破绽)
    // 独孤九剑：三悟性全在才学；否则走"机缘未到"变体不授
    {
      kind: "learnSkill",
      skillId: "dugu-jiujian",
      who: "player",
      when: {
        hasFlag:
          "xa-wuxing-1" /* + xa-wuxing-2 + xa-wuxing-3；引擎 AND 需三条 hasFlag，见落地 TODO */,
      },
    },

    // —— Ch3 五霸冈 ——
    { kind: "switchMap", mapId: "wubagang", x: 10, y: 9 },
    { kind: "dialogue", dialogueId: "xa-c3-qunhao" },
    { kind: "recruit", charId: "renyingying" },
    { kind: "dialogue", dialogueId: "xa-c3-luzhu" }, // 绿竹巷琴箫：羁绊链起点(bond:linghu-ying step 1)
    { kind: "setFlag", flag: "xa-wuxing-3" }, // 悟性#3(以琴入剑)

    // —— Ch4 黑木崖：正/邪互斥 ——
    { kind: "switchMap", mapId: "heimuya", x: 7, y: 6 },
    { kind: "dialogue", dialogueId: "xa-c4-pre" },
    {
      kind: "choice",
      id: "c4-fork",
      prompt: "黑木崖顶，你的抉择？",
      options: [
        { label: "助令狐冲救盈盈", goto: "c4-zheng" },
        { label: "投效神教清门户", when: { maxMorality: -40 }, goto: "c4-xie" }, // 门槛：邪≤-40
      ],
    },
    // 正线
    { kind: "dialogue", id: "c4-zheng", dialogueId: "xa-c4-zheng" },
    { kind: "adjustMorality", delta: 15 },
    { kind: "setFlag", flag: "xa-zheng" },
    {
      kind: "battle",
      id: "c4-boss",
      battleId: "xa-dongfang",
      onWin: "c4-bond",
      onLose: "c4-retreat",
    },
    { kind: "dialogue", id: "c4-retreat", dialogueId: "xa-c4-retreat" },
    { kind: "goto", target: "c4-boss" },
    { kind: "dialogue", id: "c4-bond", dialogueId: "xa-c4-bond-full" }, // 羁绊满(仅正线)
    { kind: "setFlag", flag: "bond-full:linghu-ying" },
    { kind: "goto", target: "c4-merge" },
    // 邪线
    { kind: "dialogue", id: "c4-xie", dialogueId: "xa-c4-xie" },
    { kind: "adjustMorality", delta: -30 },
    { kind: "setFlag", flag: "xa-xie" },
    {
      kind: "battle",
      battleId: "xa-qingmenhu",
      onWin: "c4-evil",
      onLose: "c4-evil",
    }, // 替东方不败清理门户(背叛)
    { kind: "dialogue", id: "c4-evil", dialogueId: "xa-c4-evil" },
    { kind: "setFlag", flag: "heimuya-evil" }, // 魔道称尊入口(ENDINGS)
    // 汇合：天书在无变体遮蔽主链
    { kind: "dialogue", id: "c4-merge", dialogueId: "xa-c4-mige" }, // 黑木崖秘库
    { kind: "gainExp", amount: 240 },
    { kind: "grantBook", bookId: "book-xiaoao" },
    { kind: "setFlag", flag: "story-done:xa-line" },
    { kind: "dialogue", dialogueId: "xa-outro" },
    { kind: "end" },
  ],
};
```

注册进 `data/story/index.ts` 的 `STORY_EVENTS`。

**落地 TODO**：

1. **三 flag AND 门控**：`learnSkill.when` 需同时 `hasFlag xa-wuxing-1/2/3`。若 `Condition` 仅支持单 `hasFlag`，用 `learnSkill` 前插一段 `choice`-less 分流或扩 `Condition` 支持 `hasFlags: []`（记 ADR）。首选扩 `Condition`（声明式，CLAUDE.md §5.3）。
2. **羁绊链**：`bond:linghu-ying` 现只在正线终点一次性置满，规范化应做成 Ch3 起点 + 同队战斗累积的**多 step flag 链**（GAME_DESIGN §3.1）。
3. 建四图（§1）+ 摆 NPC（`liu-zhengfeng`/`feng-qingyang`/`dongfang-bubai`）+ 对话入 `data/dialogues/`。
4. 数值：令狐冲/任盈盈按 CHARACTERS §4 系数；东方不败按 §2.3 天花板层（spd 40）落 `data/characters/`。

---

## 6. 测试（CONTENT_FORMAT §5 / CLAUDE.md §1.2）

- **content.test**：引用完整性——`hengshan/siguoya/wubagang/heimuya`、`linghuchong/renyingying/liu-zhengfeng/feng-qingyang/dongfang-bubai`、`dugu-jiujian`、`book-xiaoao` 均存在；`heimuya-evil`/`bond-full:linghu-ying`/`xa-wuxing-*` 有产出方；`grantBook` 落无变体遮蔽主链。
- **runner 单测**：正/邪两分支各跑通；邪线 `when: maxMorality -40` 门槛的可选/不可选两态；悟性 0/1/2/3 flag 下 `learnSkill` 授/不授；东方不败 onWin/onLose(退守回打) 无死循环。
- **balance.test**：标准队(令狐冲+任盈盈+玩家) vs 东方不败(天花板)，固定 seed，验证"靠地形/人数才在 4–8 回合内破"、无地形优势应打不过。
- **decideEnding 单测**：`heimuya-evil + morality≤-60 + 14书` → `ending-modao-chengzun`；`bond-full:linghu-ying + -20≤morality≤60 + 14书` → `ending-xiaoyao-guiyin`（ENDINGS §3）。
- **e2e `verify-xiaoao.mjs`**：puppeteer 实跑 入口→灭门见证→思过崖学剑(三悟性)→五霸冈招募/羁绊→黑木崖**正线**拿天书；另跑一条**邪线**断言产 `heimuya-evil`。

---

## 7. 联动

- **上游**：太岳四侠情报贩子（`clue-xa-1`）在城镇导流入 `hengshan`（无箭头，ROSTER §3.6）。
- **下游结局**：`heimuya-evil` → 〔魔道称尊〕主要入口；`bond-full:linghu-ying` → 〔逍遥归隐〕（ENDINGS）。
- **跨线复用**：`huashan-pai` 门派与碧血剑线共用（WORLD_ATLAS §2 line 110，`siguoya` 挂其下）；`riyue 日月神教` 声望阵营（ROSTER §4 待补 SECTS）。
- **羁绊标杆**：本线令狐冲×任盈盈是 GAME_DESIGN §3.1 羁绊系统的参考实现，杨过×小龙女(神雕)、郭靖(射雕)照此挂点。
