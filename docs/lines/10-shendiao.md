# 线 10 · 神雕侠侣（T3，3 章）— 生产 spec

> **状态：▢ 未实装**（规范冻结中）。本 spec 照黄金模板 `01-yuanyang.md` 结构书写。
> 上游：STORY_BIBLE §2.10（章节级）· WORLD_ATLAS §2（地图）· ROSTER §3.3（NPC）·
> CONTENT_FORMAT §2（落地 schema）· ENDINGS §1/§2（产 `xiangyang-hero`）· CHARACTERS_AND_SKILLS §4（人物/武学）。

**一句话**：问世间情为何物。杨过小龙女冲破礼教，绝情谷断肠采药生死一诺，襄阳城头以身守国——郭靖授"侠之大者"训。
**难度**：T3（三章，情感线 + 车轮守城战）。**天书**：`book-shendiao`（战后郭靖授"侠之大者"训）。
**线缩写**：`sn`。**入口**：`zhongnan` 终南山「全真道人」`zhao-zhijing` 点火 flag `sn-start`。
**前置**：`sd-done`（射雕完成；STORY_BIBLE §3）——射雕队友郭靖黄蓉由此登场，第 3 章守城自动参战。
**主题内核**：情之至（悲剧不由 choice 改写，choice 只动羁绊/正邪/对话变体，CONTENT_FORMAT §3）。

---

## 1. 章节流程

### 第 1 章 · 活死人墓

| 节拍 | 地图              | 参与 NPC                | 类型       | 内容                                         |
| ---- | ----------------- | ----------------------- | ---------- | -------------------------------------------- |
| 起   | 终南山 `zhongnan` | `zhao-zhijing`          | 点火对话   | 全真道人非议杨过小龙女师徒之情，引玩家入古墓 |
| 承   | 全真教 `quanzhen` | `zhao-zhijing`          | **战**     | 全真门人拦路（赵志敬挟私，敌中等）           |
| 转   | 活死人墓 `gumu`   | `yangguo`、`xiaolongnv` | 名场面对话 | 撞破二人礼教非议；小龙女以命相护杨过之志     |
| 抉择 | `gumu`            | —                       | **choice** | 世俗劝分 / 支持二人（**支持=羁绊线开启**）   |
| 收   | `gumu`            | `yangguo`、`xiaolongnv` | 招募       | 杨过、小龙女入队（形态见 §3）                |

### 第 2 章 · 绝情谷

| 节拍 | 地图               | 参与 NPC                | 类型           | 内容                                                 |
| ---- | ------------------ | ----------------------- | -------------- | ---------------------------------------------------- |
| 起   | 绝情谷 `jueqinggu` | —                       | switchMap+对话 | 情花毒发，谷中求解药                                 |
| 承   | `jueqinggu`        | `qiu-qianchi`           | **BOSS**       | 裘千尺枣核钉（暗器 BOSS，远程点杀，见 §5 数值）      |
| 转   | `jueqinggu`        | `yangguo`               | 名场面对话     | 唯断肠草可解；杨过命悬一线                           |
| 抉择 | `jueqinggu`        | —                       | **choice**     | 断肠草在悬崖——**跳崖采药**（假死惊吓桥段）/ 另寻他法 |
| 收   | `jueqinggu`        | `yangguo`、`xiaolongnv` | 名场面对话     | 跳崖生还，"十六年之约"式生死一诺 → 羁绊深化          |

### 第 3 章 · 襄阳大战

| 节拍 | 地图               | 参与 NPC        | 类型           | 内容                                                       |
| ---- | ------------------ | --------------- | -------------- | ---------------------------------------------------------- |
| 起   | 襄阳城 `xiangyang` | —               | switchMap+对话 | 蒙古大军压境，全城戒备                                     |
| 承   | `xiangyang`        | 郭靖、黄蓉      | 名场面对话     | 郭靖黄蓉领守城；射雕队友自动加入本战（`hasFlag: sd-done`） |
| 战   | `xiangyang`        | `jinlun-fawang` | **守城战(城)** | 多波蒙古兵车轮 + 守城 BOSS 金轮法王（见 §5）               |
| 收   | `xiangyang`        | 郭靖            | 授天书         | 守城胜 → 产 `xiangyang-hero` → 郭靖授"侠之大者"训 → 天书   |

**地图**：`zhongnan`/`quanzhen`/`gumu`/`jueqinggu`/`xiangyang` 皆 ▢ 未实装（WORLD_ATLAS §2，落地时转正 + 配双向 exits）。
**系统标签**（STORY_BIBLE §2.10）：`战` `募` `城`(守城车轮) `互`(杨过形态)。

---

## 2. 抉择与正邪

| 抉择点        | 选项     | 效果                                   | flag          |
| ------------- | -------- | -------------------------------------- | ------------- |
| Ch.1 师徒之情 | 支持二人 | `adjustMorality +15`；**羁绊线开启**   | `sn-support`  |
|               | 世俗劝分 | `adjustMorality -5`                    | `sn-oppose`   |
| Ch.2 断肠草   | 跳崖采药 | 假死惊吓桥段 → 羁绊深化                | `sn-leap`     |
|               | 另寻他法 | 拖延，杨过重伤对话变体（不改主链结局） | `sn-hesitate` |

- **两难纪律**（STORY_BIBLE §5.2）：支持二人=全侠义但触世俗众怒；劝分=合礼教但拆散有情人，代价皆在。
  跳崖=以身犯险的信任；另寻=保全自身却负所托。悲剧内核不由 choice 翻盘，只影响羁绊/正邪/对话变体。
- **偏移量取表**（CHARACTERS §5）：±5 小 / ±15 章节级。支持二人为线级情感站边，记 +15。
- `sn-support` 是杨过×小龙女羁绊事件链的开关；羁绊满产 `bond-full:yangguo-xiaolongnv`（ENDINGS §2，通往〔逍遥归隐〕）。

---

## 3. 招募 / 武学 / 奖励

- **招募**（Ch.1 收）：
  - `yangguo` 杨过——爆发剑客，`atk1.4 def0.8`，特性**黯然销魂掌**（hp<30% 时 power ×2；CHARACTERS §4）。
  - `xiaolongnv` 小龙女——`spd1.3 hp0.8`，特性**双剑合璧**（与杨过同场时二人全属性 **+25%**，全游戏唯一双人 buff）。
  - **杨过独臂形态**：按招募章节时间点定前/后两形态，作**彩蛋不作分支负担**（`互` 标签，无 choice 分叉）。
- **武学**：`learnSkill yunv-suxin-jian` 玉女素心剑（柔系毕业技，power 22 / cost 1 / 单体；
  需杨过小龙女**双羁绊**满足，CHARACTERS §4 技能表）——`who: "player"`，羁绊线达成后于 Ch.2 收或 Ch.3 授。
- **奖励**：`gainExp`（T3 量级）+ `grantBook book-shendiao`（Ch.3 守城胜、无变体遮蔽主链，CONTENT_FORMAT §5）。

---

## 4. flag 产出/消费

| flag                           | 产/消         | 说明                                                           |
| ------------------------------ | ------------- | -------------------------------------------------------------- |
| `sd-done`                      | 消费(前置)    | 射雕完成；本线 trigger 前置 + Ch.3 郭靖黄蓉自动参战条件        |
| `sn-start`                     | 消费(trigger) | 赵志敬点火                                                     |
| `sn-support` / `sn-oppose`     | 产出          | Ch.1 抉择；`sn-support` 开羁绊线                               |
| `sn-leap` / `sn-hesitate`      | 产出          | Ch.2 抉择；对话变体消费                                        |
| `bond-full:yangguo-xiaolongnv` | 产出(羁绊满)  | 杨过×小龙女羁绊链满 → 〔逍遥归隐〕候选（ENDINGS §2）           |
| **`xiangyang-hero`**           | **产出**      | **Ch.3 守城战胜产出；〔侠之大者〕结局必要 flag（ENDINGS §1）** |
| `story-done:sn-line`           | 产出          | 线完成（CONTENT_FORMAT §1 规范命名）                           |

> `xiangyang-hero` 是本线对终局矩阵的核心贡献：`decideEnding` 判〔侠之大者〕需 14 书 · morality≥60 ·
> `xiangyang-hero` · 终局选「留下」（ENDINGS §1）。**守城战胜利即产此 flag，产出点必须在无变体遮蔽的主链**。

---

## 5. 事件链落地（`data/story/shendiao.ts`）

按 CONTENT_FORMAT §2 骨架，三章串一条 `StoryEvent`，跳转用 step `id` 标签寻址（不用下标）：

```
trigger { hasFlag: "sn-start", hasFlag: "sd-done" }
─ Ch.1 ─
dialogue(sn-intro) → switchMap(quanzhen) → battle(sn-quanzhen, onWin/onLose 回打)
→ switchMap(gumu) → dialogue(sn-gumu-scene)
→ choice(sn-ch1-decide: 支持→goto support / 劝分→goto oppose)
  support: adjustMorality +15 · setFlag(sn-support) · goto ch1-recruit
  oppose:  adjustMorality -5  · setFlag(sn-oppose)  · goto ch1-recruit
→ ch1-recruit: recruit(yangguo) · recruit(xiaolongnv)
─ Ch.2 ─
switchMap(jueqinggu) → dialogue(sn-qinghua)
→ battle(sn-qiuqianchi BOSS, onWin/onLose 回打)
→ dialogue(sn-duanchang-pre)
→ choice(sn-ch2-decide: 跳崖→setFlag(sn-leap) / 另寻→setFlag(sn-hesitate))
→ dialogue(sn-leap-reunion) →〔当 sn-support〕learnSkill(yunv-suxin-jian, player)
─ Ch.3 ─
switchMap(xiangyang) → dialogue(sn-shoucheng-pre)  // 郭靖黄蓉自动参战（sd-done）
→ battle(sn-menggubing 车轮多波) → battle(sn-jinlun BOSS 守城)
  onWin → setFlag(xiangyang-hero) · dialogue(sn-guojing-xiazhi) · gainExp · grantBook(book-shendiao)
        · setFlag(story-done:sn-line) · dialogue(sn-outro) · end
  onLose → dialogue(sn-shoucheng-lose) · goto 守城战重打
```

注册进 `data/story/index.ts` 的 `STORY_EVENTS`（终局类之前）。字段名照 CONTENT_FORMAT §2 速查
（`delta` 非 `amount`、`charId` 非 `characterId`；对话文本进 `data/dialogues/`，事件只引 `dialogueId`）。

**落地顺序**（CONTENT_FORMAT §4）：建 5 图转正 + exits → 摆 NPC(`zhao-zhijing`/`qiu-qianchi`/`jinlun-fawang`) →
写事件链 → 人物数值（杨过/小龙女队友、二 BOSS 分层）→ `book-shendiao` + 入口传闻导流 → 测试。

**数值要点**（CHARACTERS §2.3 BOSS 分层 / §6.4 balance）：

- `qiu-qianchi` 枣核钉——远程暗器点杀型，高单发、低血，考验站位/柔系减伤。
- `jinlun-fawang` 守城 BOSS——前置多波蒙古兵车轮耗蓝，本战有郭靖黄蓉参战抬手；标准队回合数落 4–8 区间。
- 双剑合璧 +25%：杨过小龙女同队时的团队增益，balance 测须含"二人同场"与"仅其一"两组。

---

## 6. 测试

- **content.test.ts 引用完整性**：5 地图 / 3 NPC / 2 队友 / `yunv-suxin-jian` / `book-shendiao` id 存在；
  `sn-start`、`sd-done` 有产出方；`grantBook` 落 Ch.3 无变体遮蔽主链；`xiangyang-hero` 进 flag 总表测试。
- **runner 单测**：两抉择各分支、三战斗 onWin/onLose、goto 无死循环；`sn-support` 门控 `learnSkill` 生效/跳过两路。
- **balance.test.ts**：标准队 vs 裘千尺、vs 金轮法王（含守城车轮），固定 seed，回合 4–8；双剑合璧两组对照。
- **e2e `verify-shendiao.mjs`**：puppeteer 实跑入口→活死人墓招募→绝情谷跳崖→襄阳守城胜→天书（CLAUDE.md §1.3）。
- **结局联动**：`ending.test.ts` 构造含 `xiangyang-hero`+14 书+morality≥60+`end-choice-stay` 的 state，断言〔侠之大者〕。

---

## 7. 联动

- **前置**：`sd-done`（射雕）——郭靖黄蓉登场 + Ch.3 自动参战；无射雕则本线不触发。
- **产终局 flag**：`xiangyang-hero`（〔侠之大者〕必要，ENDINGS §1）——本线是侠之大者结局的唯一来源。
- **羁绊**：`sn-support` → 杨过×小龙女羁绊链 → `bond-full:yangguo-xiaolongnv`（〔逍遥归隐〕候选，CHARACTERS §4.1）。
- **人物复用**：郭靖、黄蓉沿用射雕线同 id（CONTENT_FORMAT §6）；杨过小龙女双剑合璧 buff 后续同场仍生效。
- **口吻纪律**（STORY_BIBLE §5.1）：动笔前重读原著活死人墓/绝情谷/襄阳城头名场面，忠于杨过之狂、龙女之淡、郭靖之拙诚。
