# 线 09 · 射雕英雄传（T3，3 章）— 生产 spec

> **状态：⏳ 部分实装**（M3 首发 + M4 补，`src/data/story/shediao.ts`）。本 spec 照**黄金模板**
> `01-yuanyang.md` 格式写：已落地的标注**「实况」**，规范未落地的标注**「待补」**。
> 上游：STORY_BIBLE §2.9（章节级）· WORLD_ATLAS §射雕（地图）· ROSTER §3.2（NPC）·
> CHARACTERS §4（郭靖/黄蓉）· CONTENT_FORMAT §2（落地）。
>
> **实装边界一句话**：M3 上了 **第 1 章（黄河四鬼）+ 第 3 章（欧阳锋）** 的对话+战斗叠加演出；
> M4 加了 `switchMap`（玩家真能走进牛家村/华山之巅）并把郭靖黄蓉在收尾**招募入常驻队伍**。
> **第 2 章 · 桃花岛（黄药师三试）整章待补**；黄蓉的「计策」技能与登场铺垫、降龙习得、正邪小抉择皆待补。

**一句话**：侠之大者，为国为民。憨厚少年郭靖闯荡江湖，与黄蓉一路同行，在华山之巅见证九阴之争。
**难度**：T3（长线，本项目 M3 首发验证线）。**天书**：`book-shediao`（射雕英雄传，`order:5`，
入口线索 hint「张家口外风雪里，一个憨厚少年正要闯荡江湖。」）。**线缩写**：`sd`。
**入口**：无名小村「说书先生」(`storyteller`) 点火 flag `sd-line-start`（**实况**，ROSTER §3.2）。
**morality 定位**：**侠字招牌线**——全线小抉择一律偏正，不设邪向站边（STORY_BIBLE §2.9）。

---

## 1. 章节流程

### 第 1 章 · 风雪惊变（牛家村）—— ✅ 实况

| 节拍 | 地图                    | 参与 NPC      | 类型                | 内容                                       |
| ---- | ----------------------- | ------------- | ------------------- | ------------------------------------------ |
| 起   | 牛家村 `niujia-village` | —（旁白）     | 点火对话 `sd-intro` | 少年郭靖初入江湖，曲三酒馆旧案             |
| 承   | 牛家村 `niujia-village` | `huanghe-gui` | **BOSS**(常规战)    | 黄河四鬼寻仇，郭靖并肩（`sd-huanghe`）     |
| 收   | 牛家村                  | —             | 历练奖励            | 战胜 `gainExp 150` → `setFlag sd-ch1-done` |

- **实况**：`switchMap → niujia-village (3,6)` 玩家实际走入（M4）；`sd-huanghe` 战斗 `allies:[guojing]`
  郭靖为友军并肩；**常规战，须打赢方能推进**——败则 `sd-huanghe-lose` 宽慰一句后 `goto` 回打。
- **待补**：STORY_BIBLE §2.9 的「张家口遇乞丐装黄蓉（不揭穿=羁绊+）」名场面与**羁绊小抉择**尚未落地；
  `zhangjiakou`（张家口，✎ 新建）地图未建，第 1 章现全部发生在牛家村。曲三酒馆旧案仅旁白带过。

### 第 2 章 · 桃花岛（黄药师三试）—— ❌ 整章待补

| 节拍 | 地图                | 参与 NPC       | 类型               | 内容                                      |
| ---- | ------------------- | -------------- | ------------------ | ----------------------------------------- |
| 起   | 桃花岛 `taohuadao`※ | `huang-yaoshi` | 名场面对话         | 上岛求亲/求学，黄药师立三试               |
| 试一 | 桃花岛              | `huang-yaoshi` | **谜**(乐律)       | 乐律谜题（听音辨谱）                      |
| 试二 | 桃花岛              | `huang-yaoshi` | **谜**(走位)       | 奇门八卦阵走位（迷宫格/机关）             |
| 试三 | 桃花岛              | `huang-yaoshi` | **BOSS**(点到为止) | 战郭靖——特殊胜利：撑住/点到即止，不下死手 |

※ **地图待补**：`taohuadao`（桃花岛，WORLD_ATLAS ▢ 转正；秘境只从 `linan` 海路进，不挂枢纽）。

- **待补全部**：本章无任何 step 落地。三试对应引擎能力 `谜`（乐律=选项谜、奇门阵=机关格迷宫）+
  `战`特殊胜利条件（战郭靖「点到为止」＝撑回合/降至阈值即胜，复用第 3 章 `surviveRounds` 思路）。
- **黄蓉正式招募铺垫应在本章**：现实况里黄蓉在第 3 章末直接入队（见 §3），缺桃花岛这段登场弧。

### 第 3 章 · 华山之巅（欧阳锋）—— ✅ 实况

| 节拍 | 地图                      | 参与 NPC      | 类型                    | 内容                                           |
| ---- | ------------------------- | ------------- | ----------------------- | ---------------------------------------------- |
| 起   | 华山之巅 `huashan-summit` | —（旁白）     | 对话 `sd-huashan-intro` | 华山论剑旁观，九阴真经之争                     |
| 战   | 华山之巅                  | `ouyangfeng`  | **BOSS**(打不过也能过)  | 欧阳锋抢经，`sd-ouyangfeng`，`surviveRounds:3` |
| 救场 | 华山之巅                  | `hong-qigong` | 授天书 `sd-hong-rescue` | 洪七公救场，「侠义为先」授天书                 |

- **实况**：`switchMap → huashan-summit (3,6)`（M4）；`sd-ouyangfeng` `objective:{surviveRounds:3}`，
  `allies:[guojing, huangrong]` 二人并肩。**「打不过也能过」**＝撑满 3 回合即胜；打赢额外
  `gainExp 100`（`ouyang-win-bonus`），**胜负都汇流到洪七公救场** `hong-rescue` 授书（`onLose→hong-rescue`）。
- **待补**：华山论剑「东邪西毒南帝北丐中神通」群像仅旁白一句；surviveRounds 回合数/数值 E3 待调平衡。

---

## 2. 抉择与正邪

**实况**：当前**无 `choice` step、无 `adjustMorality`**——第 1、3 章为纯主链推进（侠字招牌线，方向本就偏正）。

**待补**（规范化时补，全部偏正，量取 CHARACTERS §5 表 ±5 小 / ±15 章节级）：

| 抉择点（待补）       | 选项       | 效果                            | flag（拟） |
| -------------------- | ---------- | ------------------------------- | ---------- |
| 张家口遇乞丐装黄蓉   | 不揭穿身份 | `adjustMorality +5` + 黄蓉羁绊+ | `sd-hide`  |
| 战郭靖（桃花岛试三） | 点到为止   | `adjustMorality +5`             | `sd-mercy` |

> 侠字招牌线的两难较弱（无邪向站边），主要靠"是否揭穿黄蓉/是否手下留情"做偏正小选择与羁绊铺垫。

---

## 3. 招募 / 武学 / 奖励

- **招募（实况）**：线尾 `recruit guojing` + `recruit huangrong`（M4，**胜负皆招募**，落 `state.party`）。
- **招募（待补）**：黄蓉现为"第 3 章末直接入队"的简化招募，**缺桃花岛登场弧**；其**「计策」技能**
  （乱阵=降敌 spd / 激励=+我方 atk，CHARACTERS §4 `atk0.7 spd1.2`）待补。郭靖定位重装（`hp1.3 def1.2 spd0.8`）。
- **奖励（实况）**：第 1 章 `gainExp 150`；第 3 章打赢 `+100`；救场 `+250` → **`grantBook book-shediao`**。
- **武学（待补）**：**〔降龙十八掌〕`xianglong-shibazhang`**（刚系毕业技，`learnSkill who:"player"`）——
  门槛 **郭靖羁绊满 + 侠值高（侠≥60）**（CHARACTERS §4/§7），本线不直接授，作为跨线长期目标（见 §7）。
  〔打狗棒法〕由黄蓉羁绊事件解锁（射雕补完），亦待补。

---

## 4. flag 产出/消费

| flag                 | 产/消         | 说明                                                       |
| -------------------- | ------------- | ---------------------------------------------------------- |
| `sd-line-start`      | 消费(trigger) | 说书先生点火（实况）                                       |
| `sd-ch1-done`        | 产出          | 第 1 章通关标记（实况，第 2 章转正后作其触发前置）         |
| `sd-done`            | 产出          | 线完成（实况）；= STORY_BIBLE §3 总表跨线 flag，**勿改名** |
| `sd-hide`/`sd-mercy` | 产出（待补）  | 偏正小抉择分支；羁绊/对话变体消费                          |

> 命名注记：CONTENT_FORMAT §1 规范全局完成 flag 为 `story-done:sd-line`；**实况用 `sd-done`**
> 且 STORY_BIBLE §3 跨线总表也以 `sd-done` 引用（神雕前置、降龙条件）——**此处以 `sd-done` 为准**，
> 统一时勿动，否则断跨线依赖。

---

## 5. 事件链落地（实况，`src/data/story/shediao.ts`）

已实装，`id:"shediao-line"`、`trigger:{hasFlag:"sd-line-start"}`，注册于 `data/story/index.ts`。真实结构：

```
switchMap(niujia-village 3,6) → dialogue(sd-intro)
→ battle(fight-huanghe = sd-huanghe, 败→huanghe-lose→goto fight-huanghe；胜→huanghe-win)
→ gainExp(150) + setFlag(sd-ch1-done)
→ switchMap(huashan-summit 3,6) → dialogue(sd-huashan-intro)
→ battle(sd-ouyangfeng, surviveRounds:3；胜→ouyang-win-bonus gainExp100；负→hong-rescue)
→ dialogue(hong-rescue = sd-hong-rescue) → gainExp(250) → grantBook(book-shediao) → setFlag(sd-done)
→ recruit(guojing) → recruit(huangrong) → dialogue(sd-outro) → end
```

引用的对话 id（`data/dialogues/index.ts`）：`sd-intro`、`sd-huanghe-lose`、`sd-huashan-intro`、
`sd-hong-rescue`、`sd-outro`（`huanghe-win` 步为无对话的历练/flag 步）。战斗（`data/battles/index.ts`）：
`sd-huanghe`（`allies:[guojing]`）、`sd-ouyangfeng`（`allies:[guojing,huangrong]`,`objective.surviveRounds:3`）。

**规范化 TODO**（转正为完整 3 章线）：

1. 建 `zhangjiakou`（✎）与 `taohuadao`（▢转正）两图 + exits；第 1 章补张家口遇黄蓉段。
2. **落地第 2 章桃花岛**：`huang-yaoshi` NPC + 三试（乐律谜/奇门阵走位/战郭靖点到为止），
   以 `sd-ch1-done` 为前置、产出 `sd-ch2-done` 接第 3 章。
3. 补偏正 `choice`（`sd-hide`/`sd-mercy`）+ `adjustMorality`（§2）。
4. 黄蓉「计策」技能与登场弧；把线尾裸 `recruit huangrong` 改由桃花岛铺垫后入队。
5. `grantBook` 保持在无变体遮蔽的主链（实况已合规，STORY_BIBLE §5.5）。

---

## 6. 测试

- **实况**：runner 单测覆盖第 1 章 onWin/onLose+goto 回打、第 3 章 `surviveRounds` 胜/负两路汇流洪七公授书；
  `books.test.ts` 断言 `book-shediao` 在册且 `name:"射雕英雄传"`；content 引用完整性含本线。
- **实况**：e2e 有牛家村→华山实跑（M3/M4 首发线，作为 grantBook 闭环验证）。
- **待补**：第 2 章转正后加 `verify-shediao.mjs`（入口→牛家村黄河四鬼→桃花岛三试→华山欧阳锋→天书）；
  `balance.test.ts` 标准队 vs `sd-huanghe`/`sd-ouyangfeng` 固定 seed 回合数落 4–8。

---

## 7. 联动

- **`sd-done` → 神雕线前置**（STORY_BIBLE §3 总表）：完成后神雕线中**郭靖黄蓉夫妇登场**（襄阳守城队友自动加入）。
- **降龙十八掌**：`sd-done` 是其习得条件之一——**郭靖羁绊满 + 侠值高（侠≥60）** 方可 `learnSkill xianglong-shibazhang`（刚系毕业技，跨射雕+神雕达成）。
- **洪七公 `hong-qigong`**：授天书处（华山），另在 `gaibang` 丐帮总舵关联打狗棒/降龙线索（ROSTER §3.2）。
- 说书先生点火后于城镇留传闻变体（导流其余线，无箭头设计）——待补。
