# 线 04 · 飞狐外传（T2，3 章）— 生产 spec

> **状态：▢ 未实装**（本 spec 冻结后按 CONTENT_FORMAT §4 落地）。格式对齐黄金模板 `01-yuanyang.md`。
> 上游：STORY_BIBLE §2.4（章节级）· WORLD_ATLAS §2（地图）· ROSTER §3.4（NPC/招募）·
> CHARACTERS_AND_SKILLS §4（胡斐/程灵素系数）& §5（正邪）· CONTENT_FORMAT §2（落地 schema）。

**一句话**：少年胡斐的侠义路——为素不相识的钟阿四一家讨公道，追杀凤天南三千里；
药王庄上程灵素以医毒相救、以痴情相候，问的是"这把刀，该不该落下"。
**难度**：T2（3 章，含跨图追凶 + 药理考验 + 线级站边抉择）。
**天书**：`book-feihu`（程灵素相赠，主链无遮蔽发放）。
**线缩写**：`fh`。**入口**：商家堡外「钟阿四」求告点火 flag `fh-start`。

---

## 1. 章节流程

### 第 1 章 · 商家堡（目击 → 抉择：出手/旁观）

| 节拍 | 地图                  | 参与 NPC       | 类型       | 内容                                                 |
| ---- | --------------------- | -------------- | ---------- | ---------------------------------------------------- |
| 起   | 商家堡 `shangjiabao`✎ | 钟阿四（客串） | 点火对话   | 钟阿四一家控诉凤天南强占民女、草菅人命               |
| 承   | 商家堡 `shangjiabao`  | `feng-tiannan` | 名场面对话 | 凤天南当众行凶，恶形毕露                             |
| 抉择 | —                     | `feng-tiannan` | **choice** | **出手**（侠+，进第2章追凶）/**旁观**（邪+，线暂停） |
| 转   | 商家堡 `shangjiabao`  | `feng-tiannan` | **教学战** | 出手支：击退凤天南家丁，凤天南逃往佛山               |
| 收   | —                     | 钟阿四         | 过场       | 立誓追凶 → `switchMap` 佛山                          |

**旁观支特例**：选旁观 → `adjustMorality -15` + `setFlag fh-paused` → `end`（**不**产出 `fh-ch1-done`）。
**线暂停**：再访 `shangjiabao` 时 `fh-start` 仍在、`fh-ch1-done` 缺失 → 事件重触发，可再抉择重启（钟阿四对话变体：`hasFlag fh-paused` 时更悲切）。

### 第 2 章 · 佛山追凶（汤沛设局 → BOSS 凤天南护卫队）

| 节拍 | 地图           | 参与 NPC            | 类型       | 内容                                       |
| ---- | -------------- | ------------------- | ---------- | ------------------------------------------ |
| 起   | 佛山 `foshan`✎ | `tang-pei`          | 名场面对话 | 汤沛佯装相助、暗中为凤天南设局（伏笔阴险） |
| 承   | 佛山 `foshan`  | —                   | 探查/解谜  | 顺线索寻凤天南落脚处（可选情报导流）       |
| 转   | 佛山 `foshan`  | `feng-tiannan`      | **BOSS**   | 凤天南护卫队围杀（汤沛的局），激战         |
| 收   | 佛山 `foshan`  | `hufei`（此后可招） | 过场       | 凤天南中毒逃往药王庄；胡斐入队（见 §3）    |

> **招募胡斐**：第 2 章通关后 `hufei` 于 `foshan`（ROSTER §3.4 招募图）加入，`setFlag fh-recruit-hufei`。

### 第 3 章 · 药王庄（中毒 → 程灵素解毒/药理考验 → 核心抉择）

| 节拍 | 地图                    | 参与 NPC       | 类型               | 内容                                                                            |
| ---- | ----------------------- | -------------- | ------------------ | ------------------------------------------------------------------------------- |
| 起   | 药王庄 `yaowangzhuang`✎ | —              | 过场               | 胡斐追凶途中中毒（汤沛/凤天南余毒）→ 命悬一线                                   |
| 承   | 药王庄 `yaowangzhuang`  | `chenglingsu`  | 名场面对话         | 程灵素出手解毒，一见胡斐即动情（痴情伏笔）                                      |
| 考验 | 药王庄 `yaowangzhuang`  | `chenglingsu`  | **药理三问**▢      | 程灵素三个药理问答（考验医缘/诚意，见 §2）                                      |
| 授   | 药王庄 `yaowangzhuang`  | `chenglingsu`  | 授天书             | 解毒毕 + 考验过 → 程灵素相赠 `book-feihu`（**主链无遮蔽**）                     |
| 转   | 药王庄 `yaowangzhuang`  | `feng-tiannan` | 名场面对话         | 凤天南被困药王庄，胡斐仇人当前，刀已出鞘                                        |
| 抉择 | —                       | `chenglingsu`  | **choice（核心）** | **劝胡斐放下**（侠+，程灵素入队）/**助他手刃凤天南**（杀=爽·邪+，程灵素不入队） |
| 收   | 药王庄                  | —              | 过场               | `setFlag fh-done` → 结局对话变体 → `end`                                        |

---

## 2. 抉择与正邪

| 抉择点         | 选项           | 效果                            | flag          | 备注                              |
| -------------- | -------------- | ------------------------------- | ------------- | --------------------------------- |
| Ch1 目击凤天南 | 出手相救       | `adjustMorality +15`            | `fh-ch1-done` | 章节级；进第 2 章                 |
|                | 旁观自保       | `adjustMorality -15`            | `fh-paused`   | 章节级邪+；**线暂停**，需再访重启 |
| Ch3 手刃凤天南 | 劝胡斐放下屠刀 | `adjustMorality +30` + 招程灵素 | `fh-persuade` | 线级站边；侠义大义                |
|                | 助他手刃凤天南 | `adjustMorality -30`            | `fh-kill`     | 线级站边；快意但邪+，程灵素不入队 |

**药理三问（考验，▢ 未实装）**：Ch3「考验」节拍。程灵素连问三道药理题（如"七心海棠之毒何解""断肠草与鹤顶红孰烈""解毒剂配伍禁忌"），
以 3 个 `choice` step 串联，答对进下一问、答错则程灵素纠正后仍放行（**不硬性失败**——考的是诚意与医缘，非知识壁垒，忠于她"聪慧却不刁难"的性子）。
全对可追加 `gainExp` 小奖 + 对话彩蛋。**需要新的问答 UI/判定？** 若不复用 `choice` 则标 ▢；MVP 用 `choice` 直落。

**两难纪律**（STORY_BIBLE §5.2）：

- Ch3 核心抉择无"明显正确答案"：**劝**=全侠义、且赢得程灵素这唯一治疗，却让凤天南这等恶徒逃脱天诛，钟阿四的血债悬而未决；
  **助杀**=为素不相识者手刃真凶、快意恩仇，却因滥杀染邪，且程灵素（求他放下屠刀而不得）黯然不入队——**永久失去全游戏唯一治疗**。
- **悲剧内核**：程灵素对胡斐的痴情是原著底色，choice 不改她的深情，只决定她是否随行；助杀支的对话须点到她的失望与成全，不作廉价煽情。

正邪偏移量统一取表（CHARACTERS_AND_SKILLS §5：±5 小 / ±15 章 / ±30 线级站边），不逐条拍脑袋。

---

## 3. 招募 / 武学 / 奖励

- **招募 · 胡斐** `hufei`：第 2 章通关后于 `foshan` 入队。高攻近战（§4：atk1.3 def0.9），胡家刀法（刚）。`setFlag fh-recruit-hufei`。
- **招募 · 程灵素** `chenglingsu`：**仅** Ch3 选「劝胡斐放下」(`fh-persuade`) 时入队。
  > ⚠️ **稀缺定位**：程灵素是**全游戏唯一治疗系队友**（§4：atk0.6 spd1.1，医毒双修＝群疗 + 施毒）。招到与否是重大分歧——
  > 助杀支放弃她＝后续所有线永久缺治疗位，玩家须以解毒剂/耐战阵容硬撑。此抉择的分量应在对话与 UI 提示中让玩家**知情**（非隐藏惩罚）。
- **奖励**：`gainExp 220`（T2，3 章量级）+ `grantBook book-feihu`（Ch3 主链，程灵素相赠，两支皆发——见 §4 注）。
- **武学**：胡斐「胡家刀法」、程灵素「医毒双修」随招募带出（数值落 `data/characters/`），本线不另塞毕业技。
- **药王庄解毒剂商店**：`yaowangzhuang` 设「解毒剂商店」（WORLD_ATLAS §2）。**程灵素在队时**（`hasCompanion chenglingsu`）可**反复购买解毒剂**——她的用毒/解毒身份的玩法外化；未招到则商店限购或不开（对话变体）。

---

## 4. flag 产出/消费

| flag                       | 产/消         | 说明                                                            |
| -------------------------- | ------------- | --------------------------------------------------------------- |
| `fh-start`                 | 消费(trigger) | 钟阿四点火                                                      |
| `fh-ch1-done`              | 产出          | Ch1 出手；缺失即视为线暂停（配合 `fh-paused` 重启）             |
| `fh-paused`                | 产出/消费     | Ch1 旁观；再访 `shangjiabao` 重触发 + 钟阿四悲切变体            |
| `fh-recruit-hufei`         | 产出          | Ch2 后胡斐入队标记                                              |
| `fh-persuade`              | 产出          | Ch3 劝支；程灵素入队 + 解毒剂商店开放条件                       |
| `fh-kill`                  | 产出          | Ch3 助杀支；程灵素不入队                                        |
| `fh-done`                  | 产出（共享）  | **线完成**（STORY_BIBLE §3 共享 flag 总表）；雪山飞狐 `xf` 消费 |
| `hasCompanion chenglingsu` | 产出/消费     | 药王庄解毒剂反复购买、跨线唯一治疗位的条件                      |

> **命名对齐**：STORY_BIBLE §3 定 `fh-done`（不另造 `story-done:fh-line`）；跨线只引总表名。
> **天书发放纪律**（STORY_BIBLE §5.5）：`grantBook book-feihu` 落在 Ch3「授」节拍的**主链**上（解毒+考验之后、核心抉择之**前**），
> **两个抉择支都已发到书**——所以招募程灵素与否**不遮蔽天书**。这是把"相赠天书"与"是否入队"拆到抉择前/后的关键设计。

---

## 5. 事件链落地（待落地，`data/story/feihu.ts`）

按 CONTENT_FORMAT §2 schema（跳转用 step `id` 标签，不用下标；对话文本进 `data/dialogues/`，此处只列 `dialogueId`）：

```
trigger: { hasFlag: "fh-start" }

# —— 第 1 章 商家堡 ——
switchMap(shangjiabao) → dialogue(fh-c1-intro 钟阿四控诉)
→ dialogue(fh-c1-scene 凤天南行凶)
→ choice(id=c1-decide "凤天南当众行凶，你——？":
      [ 出手相救 → goto c1-act,
        旁观自保 → goto c1-watch ])
# 旁观支：邪+ 线暂停
dialogue(id=c1-watch, fh-c1-watch) → adjustMorality(-15) → setFlag(fh-paused) → end
# 出手支：教学战 → 进第 2 章
dialogue(id=c1-act, fh-c1-act) → adjustMorality(+15) → setFlag(fh-ch1-done)
→ battle(id=fight-c1, battleId=fh-jiading, onWin=c1-win, onLose=c1-lose)
dialogue(id=c1-lose, fh-c1-lose) → goto(fight-c1)
dialogue(id=c1-win, fh-c1-win 凤天南逃佛山)

# —— 第 2 章 佛山追凶 ——
switchMap(foshan) → dialogue(fh-c2-tangpei 汤沛设局)
→ battle(id=fight-c2, battleId=fh-fengboss 凤天南护卫队, onWin=c2-win, onLose=c2-lose)
dialogue(id=c2-lose, fh-c2-lose) → goto(fight-c2)
dialogue(id=c2-win, fh-c2-win) → recruit(charId=hufei) → setFlag(fh-recruit-hufei)

# —— 第 3 章 药王庄 ——
switchMap(yaowangzhuang) → dialogue(fh-c3-poison 胡斐中毒)
→ dialogue(fh-c3-lingsu 程灵素解毒·一见动情)
# 药理三问（考验，▢ 未实装：MVP 用 choice 串联，答错纠正后放行）
→ choice(id=q1 …) → choice(id=q2 …) → choice(id=q3 …) →〔全对: gainExp 小奖〕
→ grantBook(book-feihu)                      # ★ 主链、抉择之前、两支皆得
→ dialogue(fh-c3-feng 凤天南当前·刀已出鞘)
→ choice(id=c3-decide "这把刀，该不该落下？":
      [ 劝胡斐放下屠刀 → goto c3-persuade,
        助他手刃凤天南 → goto c3-kill ])
dialogue(id=c3-persuade, fh-c3-persuade) → adjustMorality(+30)
      → recruit(charId=chenglingsu) → setFlag(fh-persuade) → goto c3-end
dialogue(id=c3-kill, fh-c3-kill 快意·程灵素黯然成全) → adjustMorality(-30) → setFlag(fh-kill)
dialogue(id=c3-end, fh-outro) → setFlag(fh-done) → end
```

**落地 TODO**（CONTENT_FORMAT §4 顺序）：

1. **建图**（3 图皆 ✎ 新建，WORLD_ATLAS §2）：`shangjiabao` / `foshan` / `yaowangzhuang`，exits 双向；`yaowangzhuang` 挂「解毒剂商店」（`hasCompanion chenglingsu` 时反复购买）。
2. **摆 NPC**（ROSTER §3.4）：`feng-tiannan`（BOSS，Ch1 家丁战 + Ch2 护卫队战两套战斗单位）、`tang-pei`（设局，Ch2）、钟阿四（客串）；对话进 `data/dialogues/`。
3. **人物数值**：`hufei`（atk1.3/def0.9）、`chenglingsu`（atk0.6/spd1.1，群疗+施毒）按 §4 落 `data/characters/`；BOSS 分层按 §2.3。
4. **天书**：`data/books/book-feihu.ts`。
5. **药理三问 UI**：若不复用 `choice` 则新增问答判定（▢），否则 MVP 用 `choice` 直落。
6. 注册进 `data/story/index.ts` 的 `STORY_EVENTS`。

---

## 6. 测试（CONTENT_FORMAT §5）

- **content.test.ts 引用完整性**：引用的 `shangjiabao/foshan/yaowangzhuang`、`feng-tiannan/tang-pei/hufei/chenglingsu`、`book-feihu` 均存在；
  `fh-*` flag 消费方有产出方；`grantBook book-feihu` 在无变体遮蔽主链（两抉择支皆达）。
- **runner 单测**：Ch1 出手/旁观两支（旁观 → 暂停 → 再访重启）、Ch2 BOSS onWin/onLose、Ch3 三问 + 核心抉择两支（劝→招程灵素 / 助杀→不招）、goto 无死循环。
- **balance.test.ts**：标准队（含胡斐）vs `fh-fengboss` 护卫队，固定 seed，回合数落 4–8。
- **e2e `verify-feihu.mjs`**：puppeteer 实跑 入口→Ch1 出手→佛山 BOSS→招胡斐→药王庄解毒→药理三问→得天书→劝支招程灵素→`fh-done`。
- **专项**：验「助杀支不招程灵素」＝后续存档 `hasCompanion chenglingsu` 为假；验「程灵素在队 → 药王庄解毒剂可反复购买」。

---

## 7. 联动

- **→ 雪山飞狐（`xf` 线）**：本线产出共享 flag **`fh-done`**（STORY_BIBLE §3 总表）。雪山飞狐第 2 章据此触发
  **胡斐登场代打苗人凤一战**（羁绊剧情，STORY_BIBLE §2.3 联动）——两条飞狐线的接缝。
- **程灵素 · 唯一治疗的下游影响**：招到与否改变全局阵容可行性（唯一治疗）。凡后续依赖治疗的高难战斗，
  平衡设计须兼顾"有/无程灵素"两态；解毒剂商店（`yaowangzhuang`）是无治疗态的缓冲。
- **入口导流**：钟阿四求告为点火；商家堡传闻可由其他线情报贩子（如太岳四侠，见 01 线）随机导流，无箭头设计。

```

```
