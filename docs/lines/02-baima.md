# 线 02 · 白马啸西风（T1，2 章）— 生产 spec

> **状态：▢ 未实装（design-only）**。本 spec 照黄金模板 `01-yuanyang.md` 写，冻结后再落地。
> 上游：STORY_BIBLE §2.2（章节级）· WORLD_ATLAS §2.8（地图）· ROSTER §3.1（李文秀）·
> CHARACTERS §4/§5（数值/正邪）· CONTENT_FORMAT（落地配方）。M4 线（`募`/`正邪`/`谜` 简化版）。

**一句话**：回疆孤女李文秀与高昌迷宫——"那都是很好很好的，可我偏不喜欢"。
**难度**：T1（短线 2 章，新手教学层）。**天书**：`book-baima`（迷宫深处石匣，最终章主链授予）。
**线缩写**：`bm`。**入口**：回疆部落 `huijiang` 遇险点火 flag `bm-start`（传闻线索 `clue-baima-1` 导流）。

---

## 1. 章节流程

### 第 1 章 · 大漠白马

| 节拍 | 地图                 | 参与 NPC   | 类型                   | 内容                                                   |
| ---- | -------------------- | ---------- | ---------------------- | ------------------------------------------------------ |
| 起   | 回疆部落 `huijiang`✎ | `liwenxiu` | 点火对话               | 哈萨克营地，白马载伤女李文秀而来，交代高昌地图         |
| 承   | 回疆部落 `huijiang`✎ | —          | 名场面对话             | 李文秀身世独白（"那都是很好很好的，可我偏不喜欢"钩子） |
| 转   | 回疆部落 `huijiang`✎ | 吕梁三杰   | **BOSS**(T1 杂兵+首领) | 吕梁三杰追杀夺地图，护住李文秀                         |
| 抉择 | —                    | 李文秀     | **choice**             | 战后：是否收留她同行（募）——无正邪偏移，纯招募门       |
| 收   | 回疆部落 `huijiang`✎ | `liwenxiu` | 招募                   | 护住后 `recruit liwenxiu` 入队，指向高昌               |

### 第 2 章 · 高昌迷宫（最终章）

| 节拍 | 地图                 | 参与 NPC   | 类型                  | 内容                                                |
| ---- | -------------------- | ---------- | --------------------- | --------------------------------------------------- |
| 起   | 高昌迷宫 `gaochang`✎ | —          | switchMap + 名场面    | 循地图入迷宫，风沙掩门                              |
| 承   | 高昌迷宫 `gaochang`✎ | —          | **解谜/机关**（简化） | 机关格 + 岔路：走对路开石门（见 §5 机关说明）       |
| 转   | 高昌迷宫 `gaochang`✎ | —          | 揭示对话              | "宝藏"只是中原日用品（针线/瓷碗），高昌人以为是神物 |
| 抉择 | —                    | `liwenxiu` | **choice**（两难）    | 把真相告诉部落 / 保守秘密（见 §2）                  |
| 收   | 高昌迷宫 `gaochang`✎ | —          | 授天书                | 迷宫深处石匣 → `grantBook book-baima` → `bm-done`   |

**✎ 地图待建**：`huijiang`（回疆哈萨克营地，✎ 新建，WORLD_ATLAS §2.8，书剑第 3 章复用）、
`gaochang`（高昌迷宫，✎ 新建，普通地图 + 机关格）。落地前两图均为 **待建**，需配双向 exits + 回程闭合。

---

## 2. 抉择与正邪

| 抉择点           | 选项                                               | 效果                 | flag          |
| ---------------- | -------------------------------------------------- | -------------------- | ------------- |
| 第1章 · 收留     | 收留李文秀同行                                     | `recruit liwenxiu`   | `bm-liwenxiu` |
|                  | （不选则本线暂停，需再访 `huijiang` 重启——不硬锁） | —                    | —             |
| 第2章 · 高昌真相 | 把真相告诉部落                                     | `adjustMorality +15` | `bm-truth`    |
|                  | 保守秘密                                           | `adjustMorality -15` | `bm-secret`   |

- **两难**（STORY_BIBLE §5.2，无明显正确答案，两选皆有代价）：
  - **告诉真相**（+15，章节级）：坦荡不欺，但亲手击碎高昌人世代供奉的"神物"信仰，可能引发部落内部动荡——诚实的代价是幻梦破灭。
  - **保守秘密**（−15，章节级）：守住他们的安宁与希望，却是你替他们做了主、以"善意的谎言"隐瞒真相——温柔背后是傲慢的欺瞒。
- 正邪轴取 §5 章节级 ±15，对称设计：轴奖励坦荡、罚欺瞒，但叙事给"保密"以慈悲动机，故非"明显正确答案"。
- 后果：两支汇合后共走最终授书节拍（天书**不因抉择变体遮蔽**，§5.5 纪律）；正邪值影响结局判定与后续对话变体。

---

## 3. 招募 / 武学 / 奖励

- **招募**：`liwenxiu` 李文秀（ROSTER §3.1，招募图 `huijiang`，第 1 章护住后）。
  定位=高机动辅助；系数 `move +2`、`atk 0.7`（弱攻）；专属特性 **迷踪步**（受击闪避 +15%，CHARACTERS §4）。
- **奖励**：`gainExp 120` + `grantBook book-baima`。
- **武学**：无专属毕业技（T1 短线不塞高阶武学）；李文秀入队自带迷踪步（轻功系被动，M4 被动槽）。

---

## 4. flag 产出/消费

| flag                     | 产/消         | 说明                                                  |
| ------------------------ | ------------- | ----------------------------------------------------- |
| `bm-start`               | 消费(trigger) | `huijiang` 遇险点火本线                               |
| `clue-baima-1`           | 消费(导流)    | 入口传闻线索（`grantClue`，无箭头导流，别线传闻可给） |
| `bm-liwenxiu`            | 产出          | 第1章招募李文秀（`hasCompanion: liwenxiu` 语义等价）  |
| `bm-truth` / `bm-secret` | 产出          | 第2章两难抉择分支；后续对话变体 + 结局判定消费        |
| `bm-done`                | 产出          | 线完成（= `story-done:bm-line` 语义，实况命名见下）   |

> 命名约定：CONTENT_FORMAT §1 规范为 `story-done:bm-line`；沿用鸳鸯刀实况风格可写 `bm-done`，
> 落地时与其余线统一择一，此处记差异（同 §01 命名债）。

---

## 5. 事件链落地（sketch，`data/story/baima.ts`——待落地）

按 CONTENT_FORMAT §2 真实 StoryStep schema（`id` 标签寻址，不用下标；对话只引 `dialogueId`）：

```
dialogue(bm-intro)
→ switchMap(huijiang, x,y)
→ dialogue(bm-liwenxiu-tale)                     // 名场面：身世独白
→ battle(id:fight-lvliang, battleId:bm-lvliang, onWin:lv-win, onLose:lv-lose)
→ dialogue(id:lv-lose, dialogueId:bm-lvliang-lose) → goto(fight-lvliang)   // 战败回打
→ dialogue(id:lv-win, dialogueId:bm-recruit-pre)
→ choice(id:recruit-q, options:[ {label:"收留她同行", goto:recruit-yes},
                                 {label:"独自上路",   goto:recruit-no} ])
→ recruit(id:recruit-yes, charId:liwenxiu) → setFlag(bm-liwenxiu) → goto(ch2)
→ dialogue(id:recruit-no, dialogueId:bm-recruit-skip) → end            // 本线暂停，再访重启
→ switchMap(id:ch2, gaochang, x,y) → dialogue(bm-maze-enter)
→ [机关/解谜段：见下] → dialogue(bm-treasure-reveal)                    // "宝藏"=中原日用品
→ choice(id:maze-choice, prompt:"这秘密，说，还是不说？", options:[
        {label:"把真相告诉部落", goto:truth},
        {label:"保守秘密",       goto:secret} ])
→ dialogue(id:truth,  dialogueId:bm-truth)  → adjustMorality(delta:+15) → setFlag(bm-truth)  → goto(reward)
→ dialogue(id:secret, dialogueId:bm-secret) → adjustMorality(delta:-15) → setFlag(bm-secret) → goto(reward)
→ dialogue(id:reward, dialogueId:bm-stone-box)                          // 石匣现天书（主链，无变体遮蔽）
→ gainExp(amount:120) → grantBook(bookId:book-baima) → setFlag(bm-done)
→ dialogue(bm-outro) → end
```

**机关/解谜段（简化版说明）**：STORY_BIBLE §2.3 标 `谜` 为 **M4 前用简化版**——高昌迷宫 =
**普通地图 + 机关格**，**不假设引擎改动**。落地时用现有能力表达：岔路走位 + 触发式机关格
（踩对格 `setFlag(bm-maze-ok)` 开石门 / 踩错格弹回或轻惩），谜面用 `dialogue` + 地图 exit 门控。
若最终需真正的解谜 step kind（超出普通地图+机关格能表达的范围），**须先加 ADR + 引擎能力**再落地——
本 spec 不预设新 step kind。

**落地 TODO（转正步骤，CONTENT_FORMAT §4）**：

1. 建图：`huijiang`、`gaochang`（✎ 新建），配 exits 双向 + 回程闭合；`gaochang` 铺机关格。
2. 摆 NPC：`liwenxiu`（+ 对话文本进 `data/dialogues/`）；吕梁三杰战斗单位落 `data/characters/`（T1 杂兵+首领，§2.3 层）。
3. 写事件链 `data/story/baima.ts`，注册进 `data/story/index.ts` 的 `STORY_EVENTS`。
4. 数值：李文秀按 CHARACTERS §4 系数（move+2/atk0.7/迷踪步）；吕梁三杰 T1 杂兵锚 §2.3。
5. 天书 `book-baima` 落 `data/books/`；入口传闻 `clue-baima-1` 导流。

---

## 6. 测试（CONTENT_FORMAT §5，落地时必过）

- **content.test.ts 引用完整性**：`huijiang`/`gaochang`/`liwenxiu`/`book-baima`/`bm-lvliang` 存在；
  `bm-start`/`clue-baima-1` 有产出方；`grantBook` 落在**无变体遮蔽的主链** `reward` 节拍（§5.5）。
- **runner 单测**：两抉择（招募 y/n、真相 truth/secret）各分支跑通；`bm-lvliang` onWin/onLose；goto 无死循环；机关格开门逻辑。
- **balance.test.ts**：李文秀在队的 T1 标准队 vs 吕梁三杰，固定 seed，回合数落 4–8 区间。
- **e2e `verify-baima.mjs`**：puppeteer 实跑 入口 → 大漠白马 BOSS → 招募李文秀 → 高昌机关 → 两难抉择 → 石匣天书。

---

## 7. 联动

- **李文秀 × 逍遥归隐结局**：李文秀羁绊满 + 正邪中庸时，结局〔逍遥归隐〕（STORY_BIBLE §1.4）
  有**专属送别台词**——回扣"那都是很好很好的，可我偏不喜欢"的孤高底色（`ending-xiaoyao-guiyin` 变体，
  条件 `hasCompanion: liwenxiu` + 羁绊满 flag）。跨线资产，落地结局线时接。
- **地图复用**：`huijiang` 与书剑第 3 章（护送香香公主，狼群车轮战）共用，建图时预留双线用法。
- 入口无跨线前置依赖（T1 教学层，适合早期玩）；完成产 `bm-done`，供结局矩阵与后续对话变体消费。
