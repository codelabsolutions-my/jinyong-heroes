# 线 06 · 书剑恩仇录（T2，3 章）— 生产 spec

> **状态：▢ 未实装**（排期 M4.5，需 `潜`/`城`/`望` 引擎能力，STORY_BIBLE §4）。
> 本 spec 照黄金模板（`docs/lines/01-yuanyang.md`）格式书写；上游：STORY_BIBLE §2.6（章节级）·
> WORLD_ATLAS §2.2/§2.6（地图）· ROSTER §2/§3.5（人物）· CHARACTERS_AND_SKILLS §4（无尘数值）/§5（正邪·声望）·
> CONTENT_FORMAT §2（落地配方，缩写 `sj`）。

**一句话**：红花会群雄营救文泰来——反清的江湖义气，与"帮/告发"的正邪分野。
**难度**：T2（中线 3 章）。**天书**：`book-shujian`（陈家洛以红花会信物相赠；邪线从张召重尸身搜出——两支都落主链，**无变体遮蔽**）。
**线缩写**：`sj`。**入口**：▢ 城镇「红花会香主」传闻点火 flag `sj-start`（无箭头导流，`grantClue` → 入口）。
**新增依赖**：门派声望阵营 `honghua`红花会（ROSTER §4：`src/data/sects/` 待补，随本线落地）。

---

## 1. 章节流程

> 每章 1 名场面 + 1 战斗/解谜 + ≥1 抉择（STORY_BIBLE §5.4）。

### 第 1 章 · 铁胆庄

| 节拍  | 地图                   | 参与 NPC             | 类型             | 内容                                         |
| ----- | ---------------------- | -------------------- | ---------------- | -------------------------------------------- |
| 起    | 铁胆庄 `tiedanzhuang`※ | `chen-jialuo`        | 点火对话         | 红花会总舵主陈家洛求助：文泰来被清廷所擒     |
| 承    | 铁胆庄                 | `wuchen`, `xinyan`▢  | 名场面对话       | 红花会群雄聚义；无尘道长追风快剑亮相         |
| 抉择  | —                      | 陈家洛 / 清廷差官    | **choice**       | 帮红花会 / 告发（**线级站边**，见 §2）       |
| 转·正 | 铁胆庄                 | `wuchen`             | **战**+招募      | 助红花会退追兵 → 招募无尘道长（先手刺客）    |
| 转·邪 | 铁胆庄                 | `chen-jialuo` 等群雄 | **BOSS**(邪独有) | 告发引清兵围庄，反与红花会为敌（望-honghua） |
| 收    | 铁胆庄                 | —                    | 分支收束         | 正：随红花会赴杭；邪：领清廷赏金，红花会敌对 |

※ **地图 ✎ 新建**：`tiedanzhuang` 铁胆庄（庄园，WORLD_ATLAS §2.6）。
▢ `xinyan` 心砚（书童，彩蛋弱角，**可选配角**）——ROSTER §3.5 未列，落地时补 `src/data/npcs/`（flag: **needs-add**）。

### 第 2 章 · 六和塔营救

| 节拍 | 地图              | 参与 NPC          | 类型                 | 内容                                         |
| ---- | ----------------- | ----------------- | -------------------- | -------------------------------------------- |
| 起   | 临安 `linan`▢     | `chen-jialuo`     | 对话                 | 探明文泰来囚于六和塔，定夜袭之计             |
| 承   | 六和塔 `liuheta`※ | 塔中守卫          | **潜入**(守卫视野格) | ▢ 避开守卫视野格潜入；触发视野=转入戒备战    |
| 转   | 六和塔            | `wen-tailai`▢     | 名场面对话           | 寻见文泰来（囚徒），解缚                     |
| 合   | 六和塔            | `zhang-zhaozhong` | **BOSS**             | 火手判官张召重截击，塔中决战                 |
| 收   | 六和塔            | `wen-tailai`▢     | 抉择+脱身            | 张召重败走/伏诛（分支，见 §2）→ 护文泰来出塔 |

※ **地图 ✎ 新建**：`liuheta` 六和塔（dungeon，潜入图，WORLD_ATLAS §2.2）。
▢ **潜入玩法**（`潜`）：守卫视野格 = 地图数据标记的巡逻/朝向格，踏入即触发戒备战——M4.5 引擎能力，未实装。
▢ `wen-tailai` 文泰来（被救 NPC）——ROSTER §3.5 未列，落地时补（flag: **needs-add**）。

### 第 3 章 · 回疆风沙

| 节拍 | 地图             | 参与 NPC               | 类型                  | 内容                                              |
| ---- | ---------------- | ---------------------- | --------------------- | ------------------------------------------------- |
| 起   | 回疆 `huijiang`◇ | `chen-jialuo`          | 对话                  | 护送香香公主返回疆，穿越风沙大漠                  |
| 承   | 回疆             | 香香公主 `xiangxiang`▢ | 名场面对话            | 香香公主初见；红花会与回疆部落情谊                |
| 战   | 回疆             | 狼群                   | **城/车轮战**(多波次) | ▢ 狼群车轮战：连续 N 波，中途不回血，考验队伍续航 |
| 抉择 | —                | 陈家洛                 | **choice**            | 战后小抉择（见 §2）                               |
| 收   | 回疆             | `chen-jialuo`          | 授天书                | 陈家洛以红花会信物相赠 `book-shujian`             |

◇ **地图复用**：`huijiang` 回疆部落（白马啸西风第 1 章共用，WORLD_ATLAS §2.6；沙漠哈萨克营地）。
▢ **车轮战玩法**（`城`）：多波次战斗，一场 battle 内连续投放敌波、波间不重置队伍状态——M4.5/M5 引擎能力，未实装。
▢ `xiangxiang` 香香公主（护送 NPC）——ROSTER §3.5 未列，落地时补（flag: **needs-add**）。

---

## 2. 抉择与正邪

> 偏移量统一取表（CHARACTERS §5）：±5 小 / ±15 章节级 / ±30 线级站边。两难纪律（STORY_BIBLE §5.2）。

| 抉择点              | 选项     | 效果                                                 | flag           |
| ------------------- | -------- | ---------------------------------------------------- | -------------- |
| 【第1章】帮/告发    | 助红花会 | `adjustMorality +30`（线级站边）                     | `sj-help`      |
|                     | 告发清廷 | `adjustMorality -30` + 清廷赏金 + `honghua` 声望 -30 | `sj-betray`    |
| 【第2章】处置张召重 | 手下留情 | `adjustMorality +15`（章节级，放走死敌）             | `sj-spare-zzz` |
|                     | 下死手   | `adjustMorality -15`（快意恩仇，张召重伏诛）         | `sj-kill-zzz`  |
| 【第3章】护送风波   | 侠义护民 | `adjustMorality +5`                                  | `sj-kind`      |
|                     | 只顾天书 | `adjustMorality -5`                                  | `sj-selfish`   |

- **核心两难（第1章）**：助红花会 = 江湖大义但与朝廷决裂、通缉在身；告发 = **邪线独有剧情**（清廷赏金、`honghua` 敌对），
  失去无尘道长招募、并使第2/3章走「与红花会为敌」的独有分支——站边级抉择，代价对称。
- **邪线独有**：`sj-betray` 后，第1章尾追加「清兵围庄」BOSS 战（与红花会群雄为敌），天书改由第2章击杀张召重后从其尸身搜出。
- 天书两支（正：陈家洛相赠 / 邪：尸身搜出）都在无变体遮蔽的主链事件上 `grantBook`（STORY_BIBLE §5.5），不可错过。

---

## 3. 招募 / 武学 / 奖励

- **招募**：`wuchen` 无尘道长（图 `tiedanzhuang`；条件 = 第1章选「助红花会」`sj-help`）。
  数值（CHARACTERS §4）：**先手刺客** spd1.4 / hp0.8；专属武学「追风快剑」（先制反击）。邪线（`sj-betray`）**不可招募**。
- **配角**：`xinyan` 心砚（书童，彩蛋弱角，可选，不入 party；flag needs-add）。
- **奖励**：`gainExp`（章节递进）+ `grantBook book-shujian`。
- **武学**：无全员福利技；无尘「追风快剑」为其专属，随招募带入。

---

## 4. flag 产出/消费

| flag                           | 产/消         | 说明                                            |
| ------------------------------ | ------------- | ----------------------------------------------- |
| `sj-start`                     | 消费(trigger) | 红花会传闻点火                                  |
| `sj-help` / `sj-betray`        | 产出          | 第1章站边；决定无尘招募、第2/3章正/邪分支       |
| `sj-spare-zzz` / `sj-kill-zzz` | 产出          | 第2章张召重处置；后续对话变体                   |
| `sj-kind` / `sj-selfish`       | 产出          | 第3章小抉择                                     |
| `honghua`（门派声望）          | 产出(±)       | ROSTER §4 待补 SECTS；跨线消费（→ 飞狐外传 §7） |
| `story-done:sj-line`           | 产出          | 线完成（含 `grantBook book-shujian`）           |

> 命名遵 CONTENT_FORMAT §1 规范（`story-done:<缩写>-line`）；`honghua` 为门派声望阵营（非布尔 flag），
> 值域 [-50,+50]（CHARACTERS §5），在 STORY_BIBLE §3 共享表登记后跨线引用。

---

## 5. 事件链落地（规范，`data/story/shujian.ts`）

> 未实装。按 CONTENT_FORMAT §2 配方落地；跳转用 step `id` 标签寻址，对话文本进 `data/dialogues/`，不内联。

```
dialogue(sj-intro) → switchMap(tiedanzhuang) → dialogue(sj-juyi 群雄聚义)
→ choice(help/betray)
  ├ help  → battle(sj-tuibing 退追兵) → recruit(wuchen) → adjustMorality(+30) → setFlag(sj-help) → goto(ch2)
  └ betray→ adjustMorality(-30) → setFlag(sj-betray) → 声望(honghua -30) → battle(sj-weizhuang 清兵围庄) → goto(ch2-evil)
→ [ch2] dialogue → switchMap(liuheta) → 潜入段(守卫视野格; 触发→戒备战)
→ dialogue(sj-wentailai) → battle(sj-zhaozhong BOSS, onWin→zzz-win, onLose→回打)
→ choice(spare/kill zzz) → adjustMorality(±15) → setFlag
→ [ch3] switchMap(huijiang) → dialogue(sj-xiangxiang) → battle(sj-langqun 车轮战/多波次)
→ choice(kind/selfish) → adjustMorality(±5)
→ [汇合主链] grantBook(book-shujian)  ← 正:陈家洛赠 / 邪:张召重尸身搜出，两支合流后统一 grant（无遮蔽）
→ setFlag(story-done:sj-line) → dialogue(sj-outro) → end
```

**规范化 TODO（落地前置）**：

1. 建图 `tiedanzhuang`(✎)、`liuheta`(✎，潜入图带视野格)；`huijiang` 复用白马线（WORLD_ATLAS）。
2. 摆 NPC：`chen-jialuo`、`zhang-zhaozhong`（BOSS，CHARACTERS §2.3 分层）；needs-add：`wen-tailai`、`xiangxiang`、`xinyan`。
3. 补 `src/data/sects/honghua`（红花会声望阵营，ROSTER §4）+ `data/characters/wuchen`（无尘数值+追风快剑）。
4. 引擎能力：潜入（守卫视野格）、多波次车轮战——M4.5/M5，未就绪前本线不落地。
5. `book-shujian` 落 `data/books/`；入口传闻 `grantClue`（无箭头导流）。

---

## 6. 测试

- **content.test.ts**：事件引用的 map/npc/character/skill/book/sect id 均存在；flag 消费方有产出方；
  `grantBook book-shujian` 落无变体遮蔽的合流主链（正/邪两支都覆盖）。
- **runner 单测**：help/betray 两大分支 + zzz/护送两小抉择 + BOSS onWin/onLose + goto 无死循环；
  邪线「清兵围庄」战与天书改道（尸身搜出）。
- **balance.test.ts**：标准队（含无尘 spd1.4 先手）vs 张召重 BOSS，固定 seed，回合 4–8；车轮战续航单测。
- **e2e** `verify-shujian.mjs`：入口 → 铁胆庄抉择（正）→ 招无尘 → 六和塔潜入+张召重 → 回疆车轮战 → 天书。

---

## 7. 联动

- **门派声望 `honghua`**：红花会声望在〔飞狐外传〕胡斐对话有变体（STORY_BIBLE §2.6 联动；跨线消费共享阵营值）。
- **地图复用**：`huijiang` 与〔白马啸西风〕第1章共用（护送/大漠同台，降低建图成本）。
- **入口导流**：无尘/红花会传闻由城镇情报网（太岳四侠等）散播，无箭头（GAME_DESIGN §3.2）。
- **正邪站边**：`sj-betray`（邪≤ 累积）为〔魔道称尊〕结局氛围累积项之一（非硬 flag，靠正邪值汇总）。
