# 线 12 · 天龙八部（T3，4 章）— 生产 spec

> **状态：▢ 未实装**（排期 M5，`src/data/story/tianlong.ts` 待建）。本 spec 照黄金模板
> `docs/lines/01-yuanyang.md` 结构书写；规范部分标"待补"，尚无实况。
> 上游：STORY_BIBLE §2.12（章节级）+ §5.3（悲剧内核不改写）· WORLD_ATLAS §2.1/§2.3/§2.5（地图）·
> ROSTER §2/§3.6（队友与 NPC）· CHARACTERS_AND_SKILLS §3.2/§4（数值）· CONTENT_FORMAT §2/§3（落地）。

**一句话**：无人不冤，有情皆孽。三兄弟各背一段孽缘——段誉的痴、虚竹的缘、乔峰的冤，
最终在雁门关外结成一个谁也改不了的结局。
**难度**：T3（4 章，长线；大战与大抉择）。**天书**：`book-tianlong`（乔峰遗赠 / 扫地僧转交，双路，见 §3）。
**线缩写**：`tl`。**入口**：大理城 `dali`「段氏侍卫」点火 flag `tl-start`（传闻导流：段誉走失）。

---

## 1. 章节流程

> 每章遵守 STORY_BIBLE §5.4 骨架：1 名场面 + 1 战斗/解谜 + ≥1 抉择。

### 第 1 章 · 大理无量山（段誉的痴）

| 节拍 | 地图                   | 参与 NPC     | 类型            | 内容                                                       |
| ---- | ---------------------- | ------------ | --------------- | ---------------------------------------------------------- |
| 起   | 大理城 `dali`※         | 段氏侍卫     | 点火对话        | 段誉负气出走无量山，托玩家寻回                             |
| 承   | 无量山洞 `wuliangdong` | `duanyu`     | 名场面对话      | 坠崖入石洞，玉像与《北冥真经》壁刻——"痴"字点题             |
| 转   | 无量山洞 `wuliangdong` | 无量剑派弟子 | **战**(T3 杂兵) | 护段誉出洞，与追来的剑派弟子一战                           |
| 抉择 | —                      | `duanyu`     | **choice**      | 劝段誉随你出山(募)/由他痴留（下章仍会重逢，仅正邪/羁绊差） |
| 收   | 无量山洞 `wuliangdong` | `duanyu`     | 招募 + 授学资格 | 段誉入队；**旁观段誉练功获〔凌波微步〕学习资格**           |

- **关键（凌波微步）**：段誉在洞中习北冥/凌波，玩家**旁观**即获 `learnSkill lingbo-weibu`
  资格（轻功被动，**+2 move，全游戏最高**，CHARACTERS §3.2）。这是"旁观获技"的设计——
  不抢段誉的机遇，玩家借势得利。
- ※ **地图**：`wuliangdong`（▢ world.ts 空壳，需重画，WORLD_ATLAS §2.5），从 `dali` 进。

### 第 2 章 · 珍珑棋局（虚竹的缘）

| 节拍 | 地图                | 参与 NPC      | 类型             | 内容                                                                   |
| ---- | ------------------- | ------------- | ---------------- | ---------------------------------------------------------------------- |
| 起   | 珍珑棋局 `zhenlong` | 苏星河 / 群豪 | 名场面对话       | 逍遥派珍珑残局，天下高手困死其中，各怀执念                             |
| 承   | 珍珑棋局 `zhenlong` | —             | **解谜**(名场面) | 棋局选项**全是死路**（步步争先=贪，自保=怯，皆无解）                   |
| 破   | 珍珑棋局 `zhenlong` | `xuzhu`       | 解谜唯一解       | 唯"**自填一子、闭眼胡下**"（虚竹解法）可破——与侠客行石壁呼应"放下执念" |
| 抉择 | —                   | `xuzhu`       | **choice**       | 破局后：劝虚竹领逍遥传承(募)/尊重他归少林之愿（仅正邪/羁绊差）         |
| 收   | 珍珑棋局 `zhenlong` | `xuzhu`       | 招募             | 虚竹入队（内力肉盾）                                                   |

- **解谜纪律**：`choice` 的每个"正常棋着"option 都 `goto` 回死局重来（不惩罚、提示渐明），
  唯一破局项揭示后可选——与侠客行第 2 章"反向解谜"同构（STORY_BIBLE §2.8/§5.3 主题呼应）。
- **支线钩子**：`xingxiu-laoguai` 星宿老怪（丁春秋）觊觎珍珑亦困于局中；正式对战放在
  **星宿海支线**（`xingxiu`，WORLD_ATLAS §2.7），本章仅名场面客串，传闻导流，不塞第 5 场战斗
  （STORY_BIBLE §5.4：超 4 场战斗拆章）。
- **地图**：`zhenlong`（▢ world.ts 空壳，需重画），从大理/缥缈峰邻进。

### 第 3 章 · 聚贤庄（乔峰的冤·上）

| 节拍 | 地图                   | 参与 NPC   | 类型                  | 内容                                                               |
| ---- | ---------------------- | ---------- | --------------------- | ------------------------------------------------------------------ |
| 起   | 聚贤庄 `juxianzhuang`✎ | `qiaofeng` | 名场面对话            | 乔峰契丹身世曝光，中原群雄设"绝交宴"，围而攻之                     |
| 承   | 聚贤庄 `juxianzhuang`  | 群豪(多波) | **城/车轮战**(多波次) | 全场大战，群雄车轮战——多波次战斗（`城` 系统，STORY_BIBLE §1.5）    |
| 抉择 | —                      | `qiaofeng` | **choice**(站边)      | **与乔峰并肩**（`望-`中原各派；侠+"虽千万人吾往矣"）/ **袖手旁观** |
| 合   | 聚贤庄 `juxianzhuang`  | `qiaofeng` | **限定同行** + 突围战 | 并肩线：乔峰"当场满配"战友军并肩杀出（**一次性战友军，不入名册**） |
| 收   | 聚贤庄 `juxianzhuang`  | `qiaofeng` | 收束对话              | 乔峰负伤北走雁门；两线分别置 `tl-bingjian` / `tl-bystand`          |

- **限定同行（`qiaofeng`）**：并肩线中乔峰作**一次性战友军**并肩作战（当场满配降龙+1.5 系数，
  CHARACTERS §4 注、ROSTER §2 限定同行条目），战后离场，**永不入 `state.party`**——原著地位用稀缺性表达。
- **地图**：`juxianzhuang`（✎ **全新待建**，WORLD_ATLAS §2.1，从 `luoyang` 进）。

### 第 4 章 · 雁门关（乔峰的冤·下）— ⚠ 悲剧内核（TRAGIC CORE，不可改写）

| 节拍 | 地图                 | 参与 NPC     | 类型                        | 内容                                                                           |
| ---- | -------------------- | ------------ | --------------------------- | ------------------------------------------------------------------------------ |
| 起   | 雁门关 `yanmenguan`✎ | `qiaofeng`   | 名场面对话                  | 辽宋对峙关前，乔峰以一身家国两难被逼到绝境                                     |
| 承   | 雁门关 `yanmenguan`  | 辽宋兵将     | **见证战/演出**             | 乔峰逼退辽帝、以止刀兵——玩家参与但**无法改变走向**（见证式）                   |
| 核   | 雁门关 `yanmenguan`  | `qiaofeng`   | **悲剧内核（不可改写）**    | **乔峰之抉择：剧情固定结局，玩家只能见证，不能扭转**                           |
| 收·A | 雁门关 `yanmenguan`  | `qiaofeng`   | 见证 → **侠值大幅+** → 授书 | **见证后 `adjustMorality +30`**；并肩线：乔峰**遗赠**天书 `book-tianlong`      |
| 收·B | 藏经阁 `cangjingge`※ | `saodi-seng` | 旁观线补授                  | 旁观线：事后访少林藏经阁，**扫地僧转交**天书 `book-tianlong`（同一部，另一路） |

- ⚠ **悲剧内核纪律（STORY_BIBLE §5.3 / CONTENT_FORMAT §3，本线的第一红线）**：
  - **结局固定，不可改写。** 雁门关乔峰之抉择的收场是原著悲剧内核——同人的边界是"补白"，
    不是"翻案"。此处**不设改变结局的 `choice`**。任何 `choice` 只能影响正邪值 / 后续对话变体，
    **绝不 `goto` 出一个"救活/改写"的分支**。
  - **玩家只能见证。** 本章的交互是"见证式演出"：可以有战斗节拍、可以有对话选择表达玩家立场，
    但引擎层面**没有一条 `goto` 通向不同结局**——机制上就不给"翻案"的口子。
  - **见证的回报是侠值。** 见证完成后 `adjustMorality +30`（线级站边量，CHARACTERS §5）——
    尊重悲剧、承受重量，本身就是最大的"侠"。这是本线唯一的大幅正邪奖励。
  - **落地校验**：`content.test.ts` / runner 单测须断言第 4 章事件链**无任何 `ending` 改写分支**、
    无"乔峰存活"flag 产出；评审此文件的 PR 若引入改写结局的 step，直接驳回。
- ※ **地图**：`yanmenguan`（✎ **全新待建**，WORLD_ATLAS §2.3，塞外边缘）；
  `cangjingge`（▢ world.ts 空壳，需重画，从 `shaolin` 进，旁观线专用）。

---

## 2. 抉择与正邪

| 抉择点         | 章  | 选项                 | 效果                                 | flag               |
| -------------- | --- | -------------------- | ------------------------------------ | ------------------ |
| 段誉去留       | 1   | 劝随出山             | `adjustMorality +5` + 招募           | `tl-duanyu`        |
|                |     | 由他痴留             | `adjustMorality -5`（后章仍重逢）    | `tl-duanyu-stay`   |
| 虚竹传承       | 2   | 劝领逍遥传承         | `adjustMorality +5` + 招募           | `tl-xuzhu`         |
|                |     | 尊他归少林之愿       | 中性（仍招募，仅羁绊差）             | `tl-xuzhu-shaolin` |
| **聚贤庄站边** | 3   | 与乔峰并肩           | `adjustMorality +30` + `望-中原各派` | `tl-bingjian`      |
|                |     | 袖手旁观             | `adjustMorality -15`                 | `tl-bystand`       |
| **雁门关见证** | 4   | （无改写选项，见证） | `adjustMorality +30`（见证回报）     | `tl-witnessed`     |

- **两难纪律（STORY_BIBLE §5.2）**：聚贤庄站边是本线真两难——并肩=全侠义但**得罪中原各派声望**、
  与整个武林为敌"虽千万人吾往矣"；旁观=自保但眼睁睁看忠义之士蒙冤，`邪+`。没有无痛的正确答案。
- **悲剧内核是"无选项的抉择"**：第 4 章标"抉择点"却**无改变结局的选项**——玩家的能动性收敛为
  "是否愿意见证"，见证即得侠值。这是 CONTENT_FORMAT §3 末条"悲剧内核：choice 不改结局"的标杆实现。
- **偏移量取表**（CHARACTERS §5）：±5 小 / ±15 章节级 / ±30 线级站边，不逐条拍脑袋。

---

## 3. 招募 / 武学 / 奖励

- **招募**：
  - `duanyu` 段誉（第 1 章，`wuliangdong`）——游走消耗（move+1，六脉神剑 range3 豪赌笑点）。
  - `xuzhu` 虚竹（第 2 章破棋局后，`zhenlong`）——内力肉盾（mp1.5 hp1.2，天山折梅手缴械）。
  - `qiaofeng` 乔峰——**限定同行，不入名册**（第 3 章并肩一次性战友军 + 第 4 章见证）。
- **武学**：
  - `lingbo-weibu` 凌波微步（轻功被动，**+2 move 全游戏最高**）——第 1 章**旁观段誉**获学习资格
    （`learnSkill skillId: lingbo-weibu, who: player`）。
  - `beiming-shengong` 北冥神功（内功被动，普攻附带吸对方 mp）——**段誉羁绊事件链**产出
    （M4 羁绊挂点，CHARACTERS §4.1；`learnSkill` 落在羁绊满 flag 后的主链）。
- **奖励**：`gainExp`（T3 长线，第 3、4 章各给一段）+ `grantBook book-tianlong`（见下"双路"）。

### 天书双路（`book-tianlong`，两条都在无变体遮蔽的主链，STORY_BIBLE §5.5）

| 路   | 触发 flag     | 授书者 / 地点            | step 位置                                                 |
| ---- | ------------- | ------------------------ | --------------------------------------------------------- |
| 并肩 | `tl-bingjian` | 乔峰**遗赠**（雁门关）   | 第 4 章收·A 主链，见证后 `grantBook`                      |
| 旁观 | `tl-bystand`  | 扫地僧**转交**（藏经阁） | 第 4 章收·B 主链（`switchMap cangjingge` 后 `grantBook`） |

> **纪律**：聚贤庄站边是**硬分支**（`goto` 到两条独立子链），**不是变体条件遮蔽**——
> 两条子链各自都以 `grantBook book-tianlong` 收尾，任一路走完必得天书，无人两头落空
> （content.test：`grantBook` 落在无变体遮蔽主链）。两路是同一部天书，不重复不叠加。

---

## 4. flag 产出/消费

| flag                            | 产/消             | 说明                                                       |
| ------------------------------- | ----------------- | ---------------------------------------------------------- |
| `tl-start`                      | 消费(trigger)     | 大理段氏侍卫点火                                           |
| `tl-duanyu` / `tl-duanyu-stay`  | 产出              | 第 1 章段誉去留；后续对话变体消费                          |
| `tl-lingbo`                     | 产出              | 凌波微步学习资格（旁观获技）                               |
| `tl-xuzhu` / `tl-xuzhu-shaolin` | 产出              | 第 2 章虚竹抉择                                            |
| `tl-bingjian` / `tl-bystand`    | 产出              | **聚贤庄站边硬分支**；决定天书授予路（§3）与雁门关演出变体 |
| `tl-witnessed`                  | 产出              | 雁门关见证完成（悲剧内核回报 `+30` 的锚点）                |
| `story-done:tl-line`            | 产出              | 线完成（CONTENT_FORMAT §1 规范命名）                       |
| 中原各派声望                    | 产出(消费方§声望) | 并肩线 `望-`；影响后续门派对话/拜师                        |

---

## 5. 事件链落地（规范，`data/story/tianlong.ts` 待建）

结构骨架（照 CONTENT_FORMAT §2，跳转用 step `id` 标签寻址，不用下标）：

```
dialogue(tl-intro) → switchMap(wuliangdong)
  → dialogue(tl-ch1-yuxiang 名场面) → battle(tl-wuliang, onLose 回打)
  → choice(段誉去留: 劝随→tl-duanyu / 由他→tl-duanyu-stay) → recruit(duanyu)
  → learnSkill(lingbo-weibu, player) + setFlag(tl-lingbo)
→ switchMap(zhenlong)
  → dialogue(tl-zhenlong 名场面) → choice(珍珑棋局: 正常棋着×N 全 goto 回死局 / 虚竹解法→break)
  → dialogue(tl-xuzhu-break) → choice(虚竹传承) → recruit(xuzhu)
→ switchMap(juxianzhuang)
  → dialogue(tl-juxian 身世曝光 名场面) → battle(tl-juxian-melee 多波车轮战)
  → choice(站边: 并肩→bingjian / 旁观→bystand)
      bingjian: adjustMorality+30 + setFlag(tl-bingjian) + battle(tl-juxian-tuwei, 乔峰限定同行战友军)
      bystand:  adjustMorality-15 + setFlag(tl-bystand)
  → merge: dialogue(tl-juxian-outro)
→ switchMap(yanmenguan)
  → dialogue(tl-yanmen 名场面) → battle(tl-yanmen-witness 见证式，无改写 goto)
  → dialogue(tl-qiaofeng-choice 悲剧内核·固定结局) → adjustMorality+30 + setFlag(tl-witnessed)
  → 【天书双路】
      hasFlag tl-bingjian → dialogue(tl-book-yizeng 遗赠) → grantBook(book-tianlong)
      hasFlag tl-bystand  → switchMap(cangjingge) → dialogue(tl-book-saodi 扫地僧转交) → grantBook(book-tianlong)
  → setFlag(story-done:tl-line) → dialogue(tl-outro) → end
```

**落地步骤**（CONTENT_FORMAT §4）：

1. **建图**：`juxianzhuang` / `yanmenguan`（✎ 新建）；`wuliangdong` / `zhenlong` / `cangjingge`（▢→重画转正），
   全部配双向 exits（藏经阁从 `shaolin` 进）。
2. **摆 NPC**：`duanyu`/`xuzhu`（入 characters）、`qiaofeng`（限定同行战友军单位）、`saodi-seng`、
   `xingxiu-laoguai`（支线）、大理段氏侍卫（点火）、苏星河/无量剑派弟子/群豪波次（战斗单位）。
3. **数值**：段誉/虚竹按 CHARACTERS §4 系数；聚贤庄群豪 = T3 杂兵；乔峰战友军满配降龙+1.5 系数。
4. **天书**：`book-tianlong` 落 `data/books/`；双路各 `grantBook`。
5. **⚠ 悲剧内核校验**：第 4 章事件链**禁止**任何改写结局的分支（见 §1 第 4 章纪律）。

---

## 6. 测试

- **content.test.ts**：事件引用的 5 张图 / 6+ NPC / `duanyu`·`xuzhu` character / `lingbo-weibu`·
  `beiming-shengong` skill / `book-tianlong` book 均存在；`tl-bingjian`/`tl-bystand` 双路**各自**
  命中 `grantBook`（无变体遮蔽）；**断言第 4 章无 `ending` 改写 step、无"乔峰存活"flag**。
- **runner 单测**：珍珑 `choice` 死局 `goto` 无死循环、破局项可达；站边双分支各跑通到天书；
  多波车轮战 onWin/onLose；见证战无改写出口。
- **balance.test.ts**：标准队（含段誉/虚竹）vs 聚贤庄车轮战 & 雁门见证战，固定 seed，回合数落 4–8。
- **e2e `verify-tianlong.mjs`**：puppeteer 实跑入口→凌波资格→破棋局→聚贤庄站边（两存档各一次）→
  雁门关见证→**两路各得 `book-tianlong`**。

---

## 7. 联动

- **凌波微步**（+2 move 全游戏最高）跨全线生效——本线是"移动力天花板"的唯一来源。
- **段誉羁绊** → `beiming-shengong` 北冥神功（内功槽），与其他内功（太玄功/乾坤大挪移）择一装配。
- **星宿老怪支线**（`xingxiu` 星宿海）：珍珑棋局客串埋钩，正式对战另开支线，传闻导流。
- **主题呼应**：珍珑"放下执念"与侠客行石壁"不看注解只看笔画"（§2.8）同构——两条线互为回响。
- **悲剧内核家族**：与飞狐外传程灵素（STORY_BIBLE §5.3）同属"可见证、不可翻案"的一类，
  共享同一套"见证式演出 + 侠值回报"落地范式。
- 无强前置依赖（T3 可自由顺序进）；乔峰在 `gaibang` 丐帮亦有传闻导流入口（WORLD_ATLAS §2.1）。

```

```
