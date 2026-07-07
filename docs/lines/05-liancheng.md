# 线 05 · 连城诀（T2，3 章）— 生产 spec

> **状态：▢ 未实装**（排期 M4.5，见 STORY_BIBLE §4）。本 spec 照**黄金模板** `01-yuanyang.md`
> 的节段结构写；因本线尚无落地代码，凡"实况"位一律标 **待落地**，需补建的图/NPC 标 ✎/待补。
> 上游：STORY_BIBLE §2.5（章节级）· WORLD_ATLAS §2（地图）· ROSTER §3.5（NPC）·
> CHARACTERS_AND_SKILLS §4（狄云/水笙数值）§5（正邪偏移表）· CONTENT_FORMAT §2（落地 schema）。

**一句话**：人心比刀剑毒。狄云蒙冤，连城宝藏现世照出众生贪相——你伸手去碰它，还是放下它离开？
**难度**：T2（3 章；含简化潜入 + 高难 BOSS 允许跑路练级）。
**天书**：`book-liancheng`（天宁寺佛像内，第 3 章主链无变体遮蔽处授予）。
**线缩写**：`lc`。**入口**：湘西城镇「狱卒／茶肆传闻」点火 flag `lc-start`（NPC 待补，见 §1 脚注）。

---

## 1. 章节流程

### 第 1 章 · 湘西冤狱（地图 `wanfu` ✎）

| 节拍 | 地图         | 参与 NPC  | 类型                       | 内容                                                   |
| ---- | ------------ | --------- | -------------------------- | ------------------------------------------------------ |
| 起   | 湘西城镇 ※   | 狱卒/传闻 | 点火对话                   | 玩家听闻狄云被师门万家构陷、屈打成招下狱               |
| 承   | 万府 `wanfu` | —         | **潜入**（简化：避巡逻格） | 潜入万府搜罪证，避开固定巡逻格；踩格=触发小战/退回入口 |
| 抉择 | 万府 `wanfu` | —         | **choice**（小）           | 取证手段：智取绕巡逻(+5 侠)/硬闯打晕护院(-5)           |
| 转   | 万府 `wanfu` | `wan-gui` | 名场面对话                 | 撞破万圭构陷真相（夺师妹、栽赃"梅念笙遗物"）           |
| 合   | 万府 `wanfu` | `wan-gui` | **战斗**（护院围堵）       | 取证被发现，万圭唤家丁围堵；战后拿证据救出狄云         |
| 收   | 万府 → 城外  | `diyun`   | **招募**                   | 狄云出狱入队（**初始全系数 0.8**，大器晚成，见 §3）    |

※ **入口 NPC 待补**：ROSTER §3.5 未列本线入口 NPC；落地时补一个湘西城镇 `yushi/chashi` 传闻位
（可复用鸳鸯刀「情报贩子」机制导流，`grantClue clue-lc-1` → 点火 `lc-start`）。参照 `01-yuanyang.md` §1 的待补处理。

### 第 2 章 · 血刀凶威（地图 `xuegu` ✎ → `xuedaomen` ▢）

| 节拍 | 地图                       | 参与 NPC      | 类型                     | 内容                                                                                      |
| ---- | -------------------------- | ------------- | ------------------------ | ----------------------------------------------------------------------------------------- |
| 起   | 雪谷 `xuegu`               | —             | switchMap + 名场面对话   | 追查途中坠入雪谷绝境，风雪封路                                                            |
| 承   | 雪谷 `xuegu`               | `shuisheng`   | **招募**                 | 遇落难的水笙，共渡雪谷入队（**唯一弓系，range2 普攻**，§3）                               |
| 转   | 雪谷 → 血刀门 `xuedaomen`※ | `xuedao-zuzu` | 名场面对话               | 血刀老祖凶威毕露，逼近                                                                    |
| 合   | 血刀门 `xuedaomen`         | `xuedao-zuzu` | **BOSS**（强，允许败退） | 血刀老祖：远超当前队伍强度；**打不过 = onLose 顺进"暂避"分支**（练级提示，不锁死，见 §5） |
| 收   | 雪谷/血刀门                | `diyun`       | **羁绊事件**             | 狄云绝境顿悟《神照经》——羁绊触发，**atk 0.8 → 1.4 暴涨**（bond mechanic，§3）             |

※ **`xuedaomen` 标 ▢ 未实装**（WORLD_ATLAS §2，sect 图暂缓）：转正前，本章后半（转/合）**实况并入
`xuegu` 一张图演出**（血刀老祖追至雪谷决战），不 switchMap 到 `xuedaomen`；`xuedaomen` 转正后再拆图 + switchMap。
**狄云羁绊事件**遵 CHARACTERS §4.1（M4 羁绊系统）：以 flag 链数据化，满链解锁 `learnSkill 神照经` + 系数升档。

### 第 3 章 · 天宁寺宝藏（地图 `tianningsi` ✎）——**本线核心抉择**

| 节拍 | 地图                    | 参与 NPC | 类型                    | 内容                                                                    |
| ---- | ----------------------- | -------- | ----------------------- | ----------------------------------------------------------------------- |
| 起   | 天宁寺 `tianningsi`     | —        | switchMap + 名场面对话  | 连城宝藏现世，群豪闻讯疯抢，佛殿大乱                                    |
| 承   | 天宁寺 `tianningsi`     | —        | **战斗**（群豪混战）    | 抢宝群豪多波围攻；本战胜负不锁线，意在渲染"贪相"                        |
| 抉择 | 天宁寺 `tianningsi`     | —        | **choice（核心·线级）** | **碰宝藏**（-30 邪 + 触发"毒发"损 hp 上限）/ **只取天书离开**（+15 侠） |
| 收   | 天宁寺佛像 `tianningsi` | —        | 授天书                  | 无论分支，主链在佛像处授 `book-liancheng`（无变体遮蔽，§5）             |

**主题落点**（人心比刀剑毒）：宝藏本身有毒（原著剧毒涂层），碰它的人被贪念反噬。抉择即主题——
玩家亲手在"要财富"与"守本心"之间做选，且**贪的代价是永久性的**（hp 上限，见 §2）。

---

## 2. 抉择与正邪

| 抉择点               | 选项             | 效果                                                                         | flag         |
| -------------------- | ---------------- | ---------------------------------------------------------------------------- | ------------ |
| Ch1 取证手段         | 智取绕巡逻       | `adjustMorality +5`                                                          | `lc-stealth` |
|                      | 硬闯打晕护院     | `adjustMorality -5`                                                          | `lc-force`   |
| **Ch3 宝藏（核心）** | **碰宝藏**       | `adjustMorality -30` **+ `setFlag lc-poisoned`（毒发：hp 上限 -20%，永久）** | `lc-greed`   |
|                      | **只取天书离开** | `adjustMorality +15`                                                         | `lc-let-go`  |

- **偏移量取表**（CHARACTERS §5）：Ch1 = ±5 小抉择；Ch3 = 线级站边，贪 = -30、放下 = +15
  （非对称刻意：贪路额外背 hp 上限的**真实代价**，放下路是"干净但放弃财富"）。
- **两难纪律**（STORY_BIBLE §5.2，无明显正确答案，每选项都有代价）：
  - 碰宝藏 → 得宝藏财货/装备奖励，但 **-30 邪 + hp 上限永久 -20%（中毒不可逆）**——玩后期战斗真痛。
  - 只取天书 → +15 侠、身家清白，但**放弃全部宝藏收益**，通关"两手空空"。
- **hp 上限惩罚是真代价**：`lc-poisoned` 是可序列化的持久 debuff flag，`GameState` 据此把中毒队员的
  `maxHp` 打 0.8 折并夹紧当前 hp。**引擎待补**：CONTENT_FORMAT §2 现有 step 无"改 maxHp"，需加一个
  持久 debuff 读取点（读 `lc-poisoned` flag 施加 hp 上限修正），或补 `applyDebuff` step。落地前先建此引擎钩子。
- **无翻案**（STORY_BIBLE §5.3）：狄云蒙冤、丁典凌霜华之殇等原著悲剧内核不改写，choice 只作用于
  正邪值与后续对话变体，不"洗白"结局。

---

## 3. 招募 / 武学 / 奖励

- **招募**
  - `diyun` 狄云（Ch1 出狱入队）：**大器晚成**，初始全系数 0.8（CHARACTERS §4）。Ch2 羁绊事件后
    `atk 0.8 → 1.4` 暴涨并 `learnSkill 神照经`（事件后解锁，自疗）。**bond mechanic**：羁绊以 flag 链
    数据化（§4.1），`lc-diyun-bond` 满链才升档——初见弱、养成强，是本线的成长叙事。
  - `shuisheng` 水笙（Ch2 雪谷入队）：**全游戏唯一弓系远程**，`atk1.0`、`range2` 普攻，特性〔骑射〕（自带）。
- **奖励**：`gainExp`（3 章 T2，量 ≈ 300，落地时按 balance.test 校准）+ `grantBook book-liancheng`。
  - 碰宝藏分支额外结算宝藏财货（金钱/装备）——刻意让"邪路有即时甜头"，代价在 §2 的 hp 上限。
- **武学**：狄云〔神照经〕（羁绊后 `learnSkill`，自疗）；水笙〔骑射〕（招募自带，非本线毕业技）。

---

## 4. flag 产出/消费

| flag                      | 产/消         | 说明                                                           |
| ------------------------- | ------------- | -------------------------------------------------------------- |
| `lc-start`                | 消费(trigger) | 湘西传闻 NPC 点火本线                                          |
| `lc-stealth` / `lc-force` | 产出          | Ch1 取证手段分支；后续对话/护院态度变体消费                    |
| `lc-diyun-bond`           | 产出          | Ch2 狄云羁绊满链；消费方 = 狄云系数升档 + `learnSkill 神照经`  |
| `lc-greed` / `lc-let-go`  | 产出          | Ch3 核心抉择分支；结局矩阵与对话变体消费                       |
| `lc-poisoned`             | 产出          | 碰宝藏产出；**引擎持久 debuff 读取**（hp 上限 -20%），存档随行 |
| `story-done:lc-line`      | 产出          | 本线完成（CONTENT_FORMAT §1 规范命名）                         |

> 命名遵 CONTENT_FORMAT §1：完成 flag 用 `story-done:lc-line`（不沿用 `01-yuanyang` 的 `yy-done` 历史债）。

---

## 5. 事件链落地（**待落地**，规划 `data/story/liancheng.ts`）

按 CONTENT_FORMAT §2 真实 schema（step 用 `id` 标签寻址，对话文本进 `data/dialogues/` 不内联）。规划骨架：

```ts
export const lianchengLine: StoryEvent = {
  // id: "lc-line"
  id: "lc-line",
  trigger: { hasFlag: "lc-start" },
  steps: [
    // —— Ch1 湘西冤狱 ——
    { kind: "dialogue", dialogueId: "lc-intro" },
    { kind: "switchMap", mapId: "wanfu", x: 0, y: 0 },
    { kind: "dialogue", dialogueId: "lc-wanfu-sneak" }, // 潜入简化：避巡逻格（关卡逻辑在 map，剧情只叙事）
    {
      kind: "choice",
      id: "ch1-decide",
      prompt: "如何取证？",
      options: [
        { label: "智取，绕开巡逻", goto: "ch1-stealth" },
        { label: "硬闯，打晕护院", goto: "ch1-force" },
      ],
    },
    { kind: "dialogue", id: "ch1-stealth", dialogueId: "lc-stealth" },
    { kind: "adjustMorality", delta: 5 },
    { kind: "setFlag", flag: "lc-stealth" },
    { kind: "goto", target: "ch1-merge" },
    { kind: "dialogue", id: "ch1-force", dialogueId: "lc-force" },
    { kind: "adjustMorality", delta: -5 },
    { kind: "setFlag", flag: "lc-force" },
    { kind: "dialogue", id: "ch1-merge", dialogueId: "lc-wangui-reveal" }, // 名场面：万圭构陷
    {
      kind: "battle",
      id: "ch1-fight",
      battleId: "lc-wangui",
      onWin: "ch1-win",
      onLose: "ch1-lose",
    },
    { kind: "dialogue", id: "ch1-lose", dialogueId: "lc-wangui-lose" },
    { kind: "goto", target: "ch1-fight" },
    { kind: "recruit", id: "ch1-win", charId: "diyun" }, // 初始全 0.8
    // —— Ch2 血刀凶威 ——
    { kind: "switchMap", mapId: "xuegu", x: 0, y: 0 },
    { kind: "dialogue", dialogueId: "lc-xuegu" },
    { kind: "recruit", charId: "shuisheng" },
    // ▢ xuedaomen 未实装：转正前不 switchMap，血刀老祖追至雪谷决战
    { kind: "dialogue", dialogueId: "lc-xuedao-pre" }, // 名场面：血刀凶威
    {
      kind: "battle",
      id: "ch2-boss",
      battleId: "lc-xuedao",
      onWin: "ch2-win",
      onLose: "ch2-retreat",
    },
    // 打不过也能过：onLose 顺进"暂避"，不 goto 回打（对比 yuanyang 的战败回打）
    { kind: "dialogue", id: "ch2-retreat", dialogueId: "lc-xuedao-retreat" }, // 练级提示 + 允许离开
    { kind: "setFlag", flag: "lc-ch2-retry" },
    { kind: "goto", target: "ch2-boss" }, // 玩家练级后重入
    { kind: "dialogue", id: "ch2-win", dialogueId: "lc-diyun-awaken" }, // 狄云羁绊：神照经顿悟
    { kind: "setFlag", flag: "lc-diyun-bond" }, // bond 满链 → 数值升档 + 神照经
    { kind: "learnSkill", skillId: "shenzhaojing", who: "diyun" },
    // —— Ch3 天宁寺宝藏（核心抉择）——
    { kind: "switchMap", mapId: "tianningsi", x: 0, y: 0 },
    { kind: "dialogue", dialogueId: "lc-treasure-appear" }, // 名场面：群豪疯抢
    {
      kind: "battle",
      id: "ch3-melee",
      battleId: "lc-melee",
      onWin: "ch3-choice",
      onLose: "ch3-choice",
    }, // 胜负不锁
    {
      kind: "choice",
      id: "ch3-choice",
      prompt: "宝藏就在眼前……",
      options: [
        { label: "伸手取宝藏", goto: "greed" },
        { label: "只取天书，转身离开", goto: "letgo" },
      ],
    },
    { kind: "dialogue", id: "greed", dialogueId: "lc-greed" },
    { kind: "adjustMorality", delta: -30 },
    { kind: "setFlag", flag: "lc-greed" },
    { kind: "setFlag", flag: "lc-poisoned" }, // 毒发：引擎据此 maxHp -20%（真实代价）
    { kind: "goto", target: "ch3-merge" },
    { kind: "dialogue", id: "letgo", dialogueId: "lc-letgo" },
    { kind: "adjustMorality", delta: 15 },
    { kind: "setFlag", flag: "lc-let-go" },
    // —— 授天书（主链，无变体遮蔽：两支必汇合于此）——
    { kind: "dialogue", id: "ch3-merge", dialogueId: "lc-book-pre" },
    { kind: "gainExp", amount: 300 },
    { kind: "grantBook", bookId: "book-liancheng" }, // 佛像中，STORY_BIBLE §5.5
    { kind: "setFlag", flag: "story-done:lc-line" },
    { kind: "dialogue", dialogueId: "lc-outro" },
    { kind: "end" },
  ],
};
```

**落地 TODO**（CONTENT_FORMAT §4 顺序）：

1. **建图**：`wanfu`✎ / `xuegu`✎ / `tianningsi`✎（配 exits 双向）；`xuedaomen`▢ 暂缓（Ch2 后半并入 `xuegu`）。
2. **摆 NPC**：`wan-gui`(wanfu)、`xuedao-zuzu`(xuedaomen/暂 xuegu)；补湘西入口传闻 NPC；对话进 `data/dialogues/`。
3. **数值**：狄云 `atk0.8` 起（羁绊后 1.4）、水笙 `atk1.0 range2`（CHARACTERS §4）；血刀老祖按 §2.3 BOSS 分层
   **刻意超标**（当前队伍打不过为设计意图，配练级提示）。
4. **引擎钩子**：`lc-poisoned` 的 hp 上限持久 debuff 读取点（或补 `applyDebuff` step）——落地前先建。
5. **天书**：`data/books/book-liancheng.ts`；入口 `grantClue clue-lc-1` 导流（无箭头设计）。

---

## 6. 测试

- **content.test.ts 引用完整性**：`wanfu/xuegu/tianningsi`、`wan-gui/xuedao-zuzu`、`diyun/shuisheng`、
  `shenzhaojing`、`book-liancheng` 均须存在；`lc-poisoned` 有产出（碰宝藏）+ 消费方（引擎 debuff）；
  `grantBook` 落在无变体遮蔽主链（Ch3 汇合点）。
- **runner 单测**：三章链跑通——Ch1 两取证分支 + 万圭战 onWin/onLose；Ch2 血刀老祖 onLose"暂避"不死循环
  - 羁绊 setFlag/learnSkill；Ch3 两抉择分支必汇合至 grantBook。
- **balance.test.ts**（CHARACTERS §6.4）：标准队含**羁绊后狄云 + 水笙**，vs 血刀老祖固定 seed——
  验证"未练级打不过、练级后可胜"两档；Ch3 群豪混战回合数落 4–8。
- **e2e `verify-liancheng.mjs`**：puppeteer 实跑 入口→万府潜入取证→招狄云→雪谷招水笙→血刀老祖（含败退练级路径）
  →狄云羁绊暴涨→天宁寺核心抉择（**两支各跑一遍**，校 `lc-poisoned` 的 hp 上限实际生效）→授天书。

---

## 7. 联动

- **入口导流**：湘西城镇传闻/情报贩子（鸳鸯刀太岳四侠机制复用）散布狄云冤案 → `grantClue clue-lc-1`。
- **狄云羁绊标杆**：本线的"大器晚成 + 羁绊暴涨"是 CHARACTERS §4.1 羁绊系统的早期样板（与令狐冲×任盈盈、
  杨过×小龙女并列），落地时把 flag 链模式沉淀成可复用配方。
- **正邪导出**：`lc-greed`/`lc-let-go` 的 ±值汇入全局正邪轴，影响终局矩阵（`docs/ENDINGS.md`）与
  后续线对话档位（大侠/魔头称谓）。
- **无硬前置**：T2 独立线，不依赖其他线完成 flag；可在 M4.5 与书剑/碧血/笑傲并行开发（一线一 workstream）。
