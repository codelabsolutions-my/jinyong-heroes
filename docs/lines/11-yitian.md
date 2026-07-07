# 线 11 · 倚天屠龙记（T3，4 章）— 生产 spec

> **状态：▢ 未实装**（M5 排期；本项目**最大的分支资产**——赵敏/周芷若互斥招募）。
> 格式照黄金模板 `docs/lines/01-yuanyang.md`。规范部分标注"待补"，引擎依赖标注"▢ 依赖"。
> 上游：STORY_BIBLE §2.11（章节级）· WORLD_ATLAS §2.4/§2.7/§2.8（地图）· ROSTER §2 & §3.6（NPC）
> · CHARACTERS §4（张无忌双系, 赵敏/周芷若互斥）& §5（正邪偏移）· CONTENT_FORMAT §2（落地）
> · ENDINGS（产出 `mingjiao-side` + `guangmingding-evil`）。

**一句话**：屠龙倚天，号令天下——正邪之辨最模糊的一条线。张无忌夹在明教与六大派之间，
玩家的每一次站边都在世俗"正邪"与剧情"真侠"之间撕扯。
**难度**：T3（长线 4 章，含连续战 + 限时战 + 多阶段 BOSS + 最大互斥分支）。
**天书**：`book-yitian`（屠龙刀中"武穆遗书"位——**同人改编点**，日志需自嘲一句：
"刀里本该是《武穆遗书》，怎么成了天书残页？——罢了，江湖事，向来将错就错。"）。
**线缩写**：`yt`。**入口**：无名小村/中原传闻 flag `yt-start` 点火（导流见 §7）。

---

## 1. 章节流程

### 第 1 章 · 蝴蝶谷（医仙考验）

| 节拍 | 地图              | 参与 NPC     | 类型         | 内容                                               |
| ---- | ----------------- | ------------ | ------------ | -------------------------------------------------- |
| 起   | 蝴蝶谷 `hudiegu`✎ | `hu-qingniu` | 点火对话     | 张无忌寒毒身世，胡青牛"医仙"立"非我教中人不医"规矩 |
| 承   | 蝴蝶谷 `hudiegu`  | `hu-qingniu` | 解谜/考验    | 医仙考验（辨药/救人抉择，医毒主题）                |
| 抉择 | —                 | 胡青牛       | **choice**   | 是否救治教外伤者：救(侠+, 破规矩)/守规矩(-)        |
| 合   | 蝴蝶谷 `hudiegu`  | 杂兵(追兵)   | **战斗**(中) | 护谷战，张无忌初显身手                             |
| 收   | 蝴蝶谷            | `hu-qingniu` | 引线         | 胡青牛点明光明顶将有大变→导向第 2 章               |

### 第 2 章 · 光明顶（**本线核心 · 选边 · 连续 3 战**）

| 节拍     | 地图                    | 参与 NPC                 | 类型             | 内容                                                  |
| -------- | ----------------------- | ------------------------ | ---------------- | ----------------------------------------------------- |
| 起       | 光明顶 `guangmingding`▢ | `miejue` + 六大派        | 名场面对话       | 六大派围攻光明顶，明教危在旦夕                        |
| 转       | 光明顶 `guangmingding`  | `miejue`                 | **目睹**         | 目睹灭绝师太滥杀明教教众（埋"正派未必正"钩子）        |
| **抉择** | —                       | —                        | **CORE choice**  | 助明教 / 助六大派（详见 §2）                          |
| 战1      | 光明顶 `guangmingding`  | 分支敌                   | **battle 连1/3** | 站边后连续 3 场战斗（`城`连续战）                     |
| 战2      | 光明顶 `guangmingding`  | 分支敌                   | **battle 连2/3** | 中途不回血、不切图，考验队伍续航                      |
| 战3      | 明教总坛 `mingjiao`▢    | 分支 BOSS(灭绝/成昆手下) | **battle 连3/3** | 第 3 场为章节 BOSS                                    |
| 募       | 光明顶 `guangmingding`  | `zhangwuji`              | **recruit**      | 力挽狂澜后张无忌入队（全能双系主坦）                  |
| 收       | —                       | —                        | learnSkill/flag  | 张无忌羁绊→乾坤大挪移；产 `mingjiao-side` 或分支 flag |

### 第 3 章 · 万安寺（**限时救援 · 回合数破塔**）

| 节拍 | 地图              | 参与 NPC  | 类型                 | 内容                                          |
| ---- | ----------------- | --------- | -------------------- | --------------------------------------------- |
| 起   | 万安寺 `wanansi`✎ | —         | 名场面对话           | 六大派群雄被囚大都万安寺塔，纵火将至          |
| 承   | 万安寺 `wanansi`  | 塔中守军  | **限时战**(▢依赖)    | **回合数限制内破塔救人**（timed-victory）     |
| 抉择 | —                 | —         | **choice**(互斥关键) | 救援中的关键站边→决定赵敏/周芷若归属（见 §2） |
| 募   | 万安寺 `wanansi`  | `zhaomin` | **recruit**(条件)    | `mingjiao-side` 分支：赵敏来投                |
| 收   | —                 | —         | flag                 | 破塔成败与站边写入 flag，导向第 4 章          |

> **▢ 引擎依赖（限时胜利条件）**：现 `battle` 只有 onWin/onLose，无"N 回合内达成目标"胜利判定。
> 需 systems-engineer 加 `battle.turnLimit` + `onTimeout` 分支（或 `objective: {kind:"survive-and-clear", turns:N}`）。
> **落地前置**：此 step 在引擎支持限时前用**降级演出**（普通 battle + 战后对话交代"险些不及"）占位，
> 引擎就绪后原地替换。记 DECISIONS 一条 ADR。

### 第 4 章 · 屠狮大会（屠龙刀真相 · 多阶段 BOSS）

| 节拍 | 地图                | 参与 NPC               | 类型             | 内容                                      |
| ---- | ------------------- | ---------------------- | ---------------- | ----------------------------------------- |
| 起   | 屠狮大会 `shaolin`▢ | 群雄                   | 名场面对话       | 少林屠狮大会，谢逊与屠龙刀真相揭晓        |
| 转   | 屠狮大会 `shaolin`  | 互斥 BOSS(赵敏/周芷若) | **battle**(分支) | 未招募的一方在此作为**后期 BOSS**登场     |
| 合   | 屠狮大会 `shaolin`  | `chenggun`             | **BOSS 多阶段**  | 成昆（混元霹雳手，多阶段——见 §5 数值）    |
| 收   | 屠狮大会 `shaolin`  | —                      | 授天书           | 屠龙刀断，取出天书残页（日志自嘲）→线完成 |

※ **地图状态**：`hudiegu`✎ 新建（医谷, WORLD_ATLAS §2.8）、`wanansi`✎ 新建（大都塔楼, §2.8）、
`guangmingding`▢ / `mingjiao`▢ 转正（§2.4/§2.7 空壳需重画）、`shaolin`▢ 转正（§2.1，与天龙线共用）。
连续战不 switchMap（战 1/2 同图叠演），战 3 `switchMap` 到 `mingjiao`。

---

## 2. 抉择与正邪（**最大分支资产**）

### 2.1 核心站边（第 2 章 光明顶）——`choice` + `when` 门控

| 抉择点     | 选项               | 效果                                       | flag                                   |
| ---------- | ------------------ | ------------------------------------------ | -------------------------------------- |
| 光明顶站边 | 助明教（护教安民） | `adjustMorality -15`(世俗视邪) + 剧情偏侠  | `mingjiao-side`                        |
|            | └ 侠向（张无忌式） | 站边后仍护群雄，无额外邪值                 | （仅 `mingjiao-side`）                 |
|            | └ 邪向（号令天下） | `adjustMorality -30`(线级站边, 屠戮六大派) | `mingjiao-side` + `guangmingding-evil` |
|            | 助六大派           | `adjustMorality +15`(望+各派)              | `yt-liupai`                            |
|            | └ 反转（目睹滥杀） | 章末 `adjustMorality -5` 对灭绝失望        | `yt-liupai-doubt`                      |

- **两难纪律**（STORY_BIBLE §5.2）：助明教=世俗眼中"邪"、正邪值下滑，但剧情最偏侠（护教众、
  救群雄）；助六大派=声望与"正名"，却要目睹灭绝师太滥杀→良知反噬。**没有干净的正确答案**。
- **邪向入口**：`助明教`下再给一次 `choice`，选"魔道称尊/号令天下"才产 `guangmingding-evil`
  （否则只是 `mingjiao-side` 的侠向），偏移 -30（线级站边表 CHARACTERS §5）——此 flag 是
  ENDINGS〔魔道称尊〕的**备选入口**（与笑傲 `heimuya-evil` 并列）。

### 2.2 赵敏 / 周芷若互斥招募（choice + flag 双重驱动）

**机制 = 光明顶站边 flag（§2.1）+ 后续抉择（第 3/4 章）联合门控**。落地用 `choice.options[].when`：

```ts
// 第 3 章 万安寺 · 救援中的关键站边 choice（决定谁入队、谁成 BOSS）
{ kind: "choice", id: "yt-partner-decide", prompt: "危局之中，谁与你并肩？", options: [
    // 助明教分支：赵敏可招（她本敌营，因你护明教而倒戈）
    { label: "接纳赵敏之助", when: { hasFlag: "mingjiao-side" }, goto: "recruit-zhaomin" },
    // 助六大派分支：周芷若可招（峨嵋同道）
    { label: "与周芷若同行", when: { notFlag: "mingjiao-side" }, goto: "recruit-zhouzhiruo" },
  ] },
```

| 光明顶站边（§2.1）        | 招募图               | 入队者                      | **另一人 → 后期 BOSS**              |
| ------------------------- | -------------------- | --------------------------- | ----------------------------------- |
| 助明教（`mingjiao-side`） | `wanansi`（第 3 章） | `zhaomin` 赵敏（控制）      | `zhouzhiruo` 周芷若 → 屠狮大会 BOSS |
| 助六大派（`yt-liupai`）   | `emei`（峨嵋, 后续） | `zhouzhiruo` 周芷若（刺客） | `zhaomin` 赵敏 → 屠狮大会 BOSS      |

- **不可兼得**：`when: { hasFlag / notFlag: "mingjiao-side" }` 使两选项**永不同时可选**——
  引擎层保证互斥（ROSTER §2 注：赵敏 XOR 周芷若）。**未招募的一方**在第 4 章屠狮大会
  作为分支 BOSS 登场（数值见 §5），把"另一条路会怎样"具象成一场硬仗。
- **数值对照**（CHARACTERS §4）：赵敏 atk0.8/spd1.2「号令：束缚敌 1 回合」；
  周芷若 atk1.3/hp0.7「九阴白骨爪：敌 hp<20% 即死」——控制流 vs 斩杀流，双结局队伍手感迥异。
- **为何是最大分支资产**：一条线内**分叉出两支队友 + 两个 BOSS + 两套第 4 章战斗编排**，
  且分叉由第 2 章的正邪站边**远程决定**（flag 跨章驱动），是全 14 线里最深的一次分支投资。

---

## 3. 招募 / 武学 / 奖励

- **招募**：
  - `zhangwuji` 张无忌 — 第 2 章光明顶助明教/力挽狂澜后入队（全能主坦，**唯一双系刚+柔**，全系数 1.1）。
  - `zhaomin` 赵敏 **XOR** `zhouzhiruo` 周芷若 — 见 §2.2（互斥，站边+抉择决定）。
- **武学**：`learnSkill { skillId: "qiankun-danuoyi", who: "player" }` 乾坤大挪移
  （张无忌**羁绊**解锁——25% 概率反弹近战伤害, CHARACTERS §3 表）。**羁绊门控**：
  需张无忌在队 + 羁绊事件链满（`when: { hasCompanion: "zhangwuji" }` gated 的 learnSkill；
  羁绊系统 CHARACTERS §4.1）。
- **奖励**：`gainExp 300`（T3 量级）+ `grantBook book-yitian`（屠龙刀天书残页，第 4 章授予）。

---

## 4. flag 产出 / 消费

| flag                                           | 产/消                | 说明                                                                    |
| ---------------------------------------------- | -------------------- | ----------------------------------------------------------------------- |
| `yt-start`                                     | 消费(trigger)        | 传闻/村口点火                                                           |
| `mingjiao-side`                                | **产出**             | 助明教站边（§2.1）；消费方：赵敏招募门控、ENDINGS〔魔道称尊〕入口       |
| `guangmingding-evil`                           | **产出**             | 助明教·邪向站边（§2.1）；消费方：ENDINGS〔魔道称尊〕**备选入口**        |
| `yt-liupai`                                    | 产出                 | 助六大派站边；消费方：周芷若招募门控（`notFlag: mingjiao-side` 同义支） |
| `yt-liupai-doubt`                              | 产出                 | 目睹灭绝滥杀→失望（后续反转对话变体消费）                               |
| `yt-partner-zhaomin` / `yt-partner-zhouzhiruo` | 产出                 | §2.2 招募结果；第 4 章 BOSS 选择消费（未招者登场）                      |
| `story-done:yt-line`                           | 产出                 | 线完成（CONTENT_FORMAT §1 规范名；授天书后置）                          |
| 六大派声望                                     | 产出(STORY_BIBLE §3) | 助六大派→望+各派；助明教→望-各派（对话/拜师变体消费）                   |

> **ENDINGS 产出确认**：本线产 `mingjiao-side`（〔魔道称尊〕主判据之一）+ `guangmingding-evil`
> （〔魔道称尊〕备选入口, ENDINGS §2 表）。二者均为终局判定输入。

---

## 5. 事件链落地（规范 spec，`data/story/yitian.ts`）

结构（CONTENT_FORMAT §2，加线只写数据不改 runner；跳转用 step `id` 标签，不用下标）：

```
dialogue(yt-intro) → switchMap(hudiegu) → dialogue(yt-huqingniu)
  → 【第1章】choice(yt-heal: 救/守规矩)→两支 adjustMorality+setFlag → merge
  → battle(yt-hudiegu-fight, onLose 回打) → dialogue(yt-ch1-outro)
→ switchMap(guangmingding) → dialogue(yt-miejue-slaughter)   // 目睹滥杀
  → 【第2章 CORE】choice(yt-side):
       助明教 → choice(yt-mingjiao-how: 侠向/邪向)
                 侠向 → setFlag(mingjiao-side)
                 邪向 → adjustMorality(-30)+setFlag(mingjiao-side)+setFlag(guangmingding-evil)
       助六大派 → adjustMorality(+15)+setFlag(yt-liupai)
  → battle(yt-gmd-1, 连1/3) → battle(yt-gmd-2, 连2/3)
  → switchMap(mingjiao) → battle(yt-gmd-boss, 连3/3, onLose 回打)
  → recruit(zhangwuji) → [羁绊满] learnSkill(qiankun-danuoyi, who:player)
  → dialogue(yt-ch2-outro)
→ switchMap(wanansi) → dialogue(yt-wanansi-intro)
  → 【第3章】battle(yt-wanansi-tower, ▢turnLimit=N, onTimeout: 降级演出)   // 限时救援
  → choice(yt-partner-decide, when 门控 §2.2):
       →recruit(zhaomin)  [when hasFlag mingjiao-side]  +setFlag(yt-partner-zhaomin)
       →recruit(zhouzhiruo)[when notFlag mingjiao-side] +setFlag(yt-partner-zhouzhiruo)
  → dialogue(yt-ch3-outro)
→ switchMap(shaolin) → dialogue(yt-tushi-intro)
  → 【第4章】battle(yt-rival-boss: 未招募者=赵敏/周芷若, 分支由 partner flag 选)
  → battle(yt-chenggun-p1)→battle(yt-chenggun-p2)→battle(yt-chenggun-p3)  // 多阶段
  → gainExp(300) → grantBook(book-yitian)   // 无变体遮蔽的主链(STORY_BIBLE §5.5)
  → setFlag(story-done:yt-line) → dialogue(yt-outro-book-selfmock) → end
```

**BOSS 数值（建线时按 CHARACTERS §2.3 分层填 `data/characters/`）**：

- `chenggun` 成昆（多阶段）：分 3 段 battle 串联（如"混元功盾→幻阴指→拼死反扑"），
  段间 hp 不回满、段间可插一句 dialogue 揭真相。T3 顶层数值，标准队 4–8 回合/段（balance.test）。
- 互斥 BOSS（赵敏/周芷若）：复用其队友数值上调至 BOSS 层（§2.3），作第 4 章前置硬仗。

**落地依赖清单**：

1. 建图：`hudiegu`✎ + `wanansi`✎（新建, §2.8）；`guangmingding`▢/`mingjiao`▢/`shaolin`▢ 转正（保持 id 原地替换）。
2. 摆 NPC：`hu-qingniu` / `miejue`(关键→BOSS) / `chenggun`(多阶段 BOSS)（ROSTER §3.6），对话进 `data/dialogues/`。
3. 队友数值：`zhangwuji`/`zhaomin`/`zhouzhiruo` 按 CHARACTERS §4 系数落 `data/characters/`。
4. 天书：`data/books/book-yitian.ts`（屠龙刀残页, 自嘲日志文案）。
5. 武学：`qiankun-danuoyi` 落 `data/skills/`（被动反弹, §3 表）。
6. 门派：补 `mingjiao 明教` 进 `data/sects/`（ROSTER §4 待补）。
7. **▢ 引擎**：`battle.turnLimit`/`onTimeout` 限时胜利（第 3 章）——先降级占位，就绪后替换 + ADR。

---

## 6. 测试（CONTENT_FORMAT §5）

- **content.test.ts**：引用的 map(`hudiegu`/`guangmingding`/`mingjiao`/`wanansi`/`shaolin`)、
  npc、character、skill(`qiankun-danuoyi`)、book(`book-yitian`) id 存在；
  flag 消费方(赵敏/周芷若招募门控、ENDINGS 入口)均有产出方；`grantBook` 落无变体遮蔽主链。
- **runner 单测**：
  - 站边三分支（助明教侠向/助明教邪向/助六大派）各跑通，flag 产出正确。
  - **互斥断言**：`mingjiao-side` 下只有赵敏可招、`notFlag` 下只有周芷若可招——**二者永不同队**。
  - 未招募者作第 4 章 BOSS 的分支选择正确（partner flag → 对应 battle）。
  - 连续 3 战不回血续航、成昆多阶段串联、限时战 onTimeout 降级支，无 goto 死循环。
- **balance.test.ts**：标准队 vs 成昆各阶段 + 互斥 BOSS，固定 seed，回合数落 4–8。
- **ending.test.ts 联动**：构造 `guangmingding-evil` + morality≤-60 的 state，断言
  `decideEnding` 命中〔魔道称尊〕（ENDINGS §1 优先级 2）。
- **e2e verify-yitian.mjs**：puppeteer 实跑**两条互斥路径**各一遍（助明教→赵敏→周芷若BOSS /
  助六大派→周芷若→赵敏BOSS），直到取出 `book-yitian`（CLAUDE.md §1.3 实测才算完成）。

---

## 7. 联动

- **入口导流**（无箭头设计）：太岳四侠情报网（ROSTER §3.6 末）在 `luoyang/chengdu` 卖
  "光明顶将有大变"传闻 → `grantClue` → `yt-start`。
- **门派声望**：助六大派↑峨嵋/昆仑/崆峒/少林声望；助明教↓六大派、↑明教——影响拜师与
  各派对话变体（CHARACTERS §5，声望独立于正邪）。
- **跨线**：`shaolin` 与天龙线（扫地僧/藏经阁）共用图，id 不变；`emei`（周芷若招募图）
  与神雕线无冲突，触发式共存（WORLD_ATLAS §3.5 门派双用）。
- **终局**：本线是〔魔道称尊〕的两大入口之一（`guangmingding-evil`），与笑傲
  `heimuya-evil` 并列——邪向玩家两条线择一即可解锁终局备选（ENDINGS §2）。
