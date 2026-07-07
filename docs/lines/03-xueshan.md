# 线 03 · 雪山飞狐（T1，2 章）— 生产 spec

> **状态：▢ 未实装**（M4 批次）。本 spec 照黄金模板 `docs/lines/01-yuanyang.md` 的段落结构写；
> 规范部分标注"待补"，落地后补"实况"。
> 上游：STORY_BIBLE §2.3（章节级）· WORLD_ATLAS §2（地图）· ROSTER §3.4（NPC）· CONTENT_FORMAT §2（落地）。

**一句话**：玉笔峰上的罗生门——一桩百年恩怨，各人各说各话；雪山藏宝洞里藏着刀谱与天书。
**难度**：T1（2 章，短线；`谜`+`正邪`的教学载体，比鸳鸯刀稍进阶）。**天书**：`book-xueshan`（藏宝洞内）。
**线缩写**：`xf`。**入口**：中原大地图北境「说书人/雪山传闻」点火 flag `xf-start`（导流：胡一刀苗人凤旧怨的传闻线索）。

---

## 1. 章节流程

### 第 1 章 · 玉笔峰问案

| 节拍 | 地图              | 参与 NPC | 类型                         | 内容                                               |
| ---- | ----------------- | -------- | ---------------------------- | -------------------------------------------------- |
| 起   | 玉笔峰 `yubifeng` | `baoshu` | 点火对话 + switchMap         | 上峰赴宴，众人围坐说百年前胡苗范田四家恩怨         |
| 承   | 玉笔峰            | `baoshu` | 名场面（罗生门）             | 宝树和尚、平阿四、苗若兰各讲一段往事，证词互相矛盾 |
| 谜   | 玉笔峰            | —        | **推理小游戏**（指认说谎者） | 答错无惩罚（可重猜），答对 `grantClue` 拿额外线索  |
| 收   | 玉笔峰            | `baoshu` | 对话                         | 真相浮出一角，引出苗人凤下峰赴约 → 转第 2 章       |

**推理小游戏落地**：无独立引擎，映射为 **choice-tree 节拍**（一串 `choice` step）。

- 呈现 3 份证词（对话），末尾 `choice`：「谁在说谎？」→ 选项对应 `baoshu` / 平阿四 / 苗若兰。
- 答对（宝树和尚——他为掩盖当年劫财杀人而歪曲证词）：`grantClue clue-xueshan-1`（藏宝洞机关/刀谱线索），顺进收尾。
- 答错：走"再想想"对话变体，`goto` 回到 `choice`（**无正邪/无数值惩罚**，符合 STORY_BIBLE §2.3"答错无惩罚"）。
- `clue-xueshan-1` 为**软增益**：持有则第 2 章藏宝洞对话多一条旁白（点破机关/刀谱来历），不持有也能通关（不卡主链）。

### 第 2 章 · 雪山藏宝

| 节拍  | 地图                      | 参与 NPC       | 类型                    | 内容                                                 |
| ----- | ------------------------- | -------------- | ----------------------- | ---------------------------------------------------- |
| 起    | 玉笔峰 `yubifeng`         | `miao-renfeng` | 名场面对话              | 苗人凤"打遍天下无敌手"现身，约主角一战证武           |
| 抉择A | —                         | `miao-renfeng` | **choice**（战前）      | 点到为止 / 下死手（正邪）→ 决定 BOSS 战语义与战后    |
| 战    | 玉笔峰                    | `miao-renfeng` | **BOSS**（T1 BOSS，强） | 苗人凤比武；"打不过也能过"用 onLose 顺进（承让收招） |
| 转    | 雪山藏宝洞 `xueshan-dong` | —              | switchMap + 机关对话    | 循线入洞，胡家刀谱与祖传宝藏现世                     |
| 抉择B | —                         | —              | **choice**（独立）      | 拿刀谱宝藏（邪+）/ 封洞而去（侠+）——与抉择A 互不影响 |
| 收    | 雪山藏宝洞                | —              | 授天书                  | 无论 A/B，天书 `book-xueshan` 在主链授予 → `xf-done` |

※ **地图待补**：`yubifeng`（玉笔峰/雪山堡，✎ 新建，WORLD_ATLAS §2）、`xueshan-dong`（藏宝洞窟，✎ 新建）。二图 exits 双向，藏宝洞回玉笔峰再回中原北境（不做死胡同）。
**苗人凤设定**：`type=BOSS(强)`，**不可招募**（"打遍天下无敌手，设定为不出山"，STORY_BIBLE §2.3）。战胜/承让都不入队。

---

## 2. 抉择与正邪

| 抉择点                 | 选项       | 效果                 | flag       |
| ---------------------- | ---------- | -------------------- | ---------- |
| A · 苗人凤比武（战前） | 点到为止   | `adjustMorality +15` | `xf-mercy` |
|                        | 下死手     | `adjustMorality -15` | `xf-kill`  |
| B · 藏宝洞（独立）     | 封洞而去   | `adjustMorality +15` | `xf-seal`  |
|                        | 拿刀谱宝藏 | `adjustMorality -15` | `xf-loot`  |

- 偏移量取表（CHARACTERS §5：±15 章节级站边）；A、B 各为一次章节级抉择，**互相独立**（可组合出 4 种正邪走向）。
- **两难 A**：点到为止=侠义，但苗人凤自负"无敌手"，你收招他反受辱、埋后患；下死手=对一位悲剧英雄痛下杀手（原著苗人凤是重情重义之人，非反派），爽而背德。悲剧内核不改写（STORY_BIBLE §5.3）——choice 不"翻案"苗人凤，只落在主角正邪值。
- **两难 B**：封洞=不取不义之财、全侠名，但胡家刀谱从此湮没（原著遗恨的补白）；拿宝藏=得实利与武学传闻，但掘人祖坟、邪+。
- 后果：`xf-mercy`/`xf-kill` 影响苗人凤战后台词变体与北境传闻；`xf-seal`/`xf-loot` 影响藏宝洞旁白与后续城镇口碑。正邪总值汇入终局矩阵（STORY_BIBLE §1.4）。

---

## 3. 招募 / 武学 / 奖励

- **招募**：无（苗人凤"不出山"，见 §1；本线无常驻队友）。
- **奖励**：`gainExp 130` + `grantBook book-xueshan`。
- **武学**：无专属毕业技。传闻钩子——藏宝洞刀谱在剧情上呼应「铁掌」秘籍导流（CHARACTERS §3.2 "铁掌…雪山线传闻导流"），但**不在本线直接授技**（保持 T1 轻养成）。

---

## 4. flag 产出/消费

| flag                   | 产/消             | 说明                                                       |
| ---------------------- | ----------------- | ---------------------------------------------------------- |
| `xf-start`             | 消费(trigger)     | 北境传闻点火                                               |
| `clue-xueshan-1`       | 产出(§1 推理答对) | 软增益线索；第 2 章藏宝洞对话变体消费（不卡主链）          |
| `xf-mercy` / `xf-kill` | 产出              | 抉择 A；苗人凤战后 & 北境传闻变体消费                      |
| `xf-seal` / `xf-loot`  | 产出              | 抉择 B；藏宝洞旁白 & 城镇口碑变体消费                      |
| `fh-done`              | **消费(跨线)**    | 飞狐外传完成 → 第 2 章胡斐代打分支（§7，STORY_BIBLE §3）   |
| `story-done:xf-line`   | 产出              | 线完成（CONTENT_FORMAT §1 规范名；实况若简写记 `xf-done`） |

> 依赖纪律：`fh-done` 只在 STORY_BIBLE §3 总表定义，本线仅消费不另造（CONTENT_FORMAT §6）。

---

## 5. 事件链落地（规范蓝图，`data/story/xueshan.ts`）

> 待落地。结构照 CONTENT_FORMAT §2 schema（跳转用 step `id` 标签，不用下标；对话文本进 `data/dialogues/`）。

```
trigger: hasFlag xf-start
── 第 1 章 ──
dialogue(xf-intro)
switchMap(yubifeng, x,y)
dialogue(xf-testimony-baoshu) → dialogue(xf-testimony-pingasi) → dialogue(xf-testimony-miaoruolan)
choice(id=whodunit, "谁在说谎？"):
  · 宝树和尚 → goto liar-right
  · 平阿四   → goto liar-wrong
  · 苗若兰   → goto liar-wrong
dialogue(id=liar-wrong, xf-guess-wrong) → goto whodunit        // 无惩罚，回猜
dialogue(id=liar-right, xf-guess-right) → grantClue(clue-xueshan-1) → goto ch2
── 第 2 章 ──
dialogue(id=ch2, xf-miao-appear)
[跨线分支] 若 hasFlag fh-done → goto hufei-branch（§7）
choice(id=duel-stance, "如何应战苗人凤？"):
  · 点到为止 → goto stance-mercy
  · 下死手   → goto stance-kill
dialogue(id=stance-mercy, xf-mercy-pre) → adjustMorality(+15) → setFlag(xf-mercy) → goto miao-fight
dialogue(id=stance-kill,  xf-kill-pre)  → adjustMorality(-15) → setFlag(xf-kill)  → goto miao-fight
battle(id=miao-fight, battleId=xf-miao, onWin=miao-win, onLose=miao-yield)
dialogue(id=miao-yield, xf-miao-yield) → goto to-cave      // 承让收招，打不过也能过
dialogue(id=miao-win,   xf-miao-win)   → goto to-cave
── 藏宝洞 ──
dialogue(id=to-cave, xf-cave-pre) → switchMap(xueshan-dong, x,y)
dialogue(xf-cave-scene)                                    // 若 hasClue clue-xueshan-1 走加料变体
choice(id=treasure, "如何处置藏宝洞？"):
  · 封洞而去   → goto seal
  · 拿刀谱宝藏 → goto loot
dialogue(id=seal, xf-seal) → adjustMorality(+15) → setFlag(xf-seal) → goto reward
dialogue(id=loot, xf-loot) → adjustMorality(-15) → setFlag(xf-loot)
── 授天书（无变体遮蔽的主链）──
dialogue(id=reward, xf-book-pre)
gainExp(130)
grantBook(book-xueshan)                                    // STORY_BIBLE §5.5：主链，不被 A/B 变体遮蔽
setFlag(story-done:xf-line)
dialogue(xf-outro)
end
```

**建线步骤（CONTENT_FORMAT §4）**：

1. 建图 `yubifeng` + `xueshan-dong`（✎ 新建），配双向 exits。
2. 摆 NPC `baoshu`、`miao-renfeng`（+跨线复用 `hufei`），对话文本进 `data/dialogues/`。
3. 写事件链 `data/story/xueshan.ts`，注册进 `data/story/index.ts`。
4. 数值：`miao-renfeng` 按 T1 BOSS(强) 锚定（CHARACTERS §2.3，比卓天雄略高，"打不过也能过"设计）。
5. 天书 `book-xueshan` 落 `data/books/`；`clue-xueshan-1` 由 grantClue 产出。

---

## 6. 测试

- content.test.ts：引用的 map(`yubifeng`,`xueshan-dong`)/npc(`baoshu`,`miao-renfeng`,`hufei`)/book(`book-xueshan`) id 存在；`clue-xueshan-1` 有产出方(§1)与消费方(§2 变体)；`fh-done` 消费引用 §3 总表；`grantBook` 落主链（无 A/B 变体遮蔽）。
- runner 单测：推理 choice 答对/答错（答错 goto 回猜无死循环）、抉择 A×B 四组合、`xf-miao` onWin/onLose、`fh-done` 跨线分支两走向。
- balance.test.ts：T1 标准队 vs `xf-miao`（苗人凤，强），固定 seed，回合数落 4–8（BOSS 偏上限，体现"强"）。
- e2e `verify-xueshan.mjs`：入口→玉笔峰问案（推理答对拿线索）→苗人凤战（点到为止）→藏宝洞（封洞）→天书 `book-xueshan`。

---

## 7. 联动

- **跨线（`fh-done`，STORY_BIBLE §3）**：若已完成〔飞狐外传〕，第 2 章苗人凤现身后走 `hufei-branch`——
  `hufei`（胡斐）登场，代主角与苗人凤一战（羁绊剧情：胡苗两家血仇，原著"胡斐雪山斗苗人凤"名场面的补白）。
  该分支 `battle` 以胡斐为主战单位（并肩/代打），战后仍回 `to-cave` 主链，**天书授予与抉择 B 不受影响**。
  抉择 A（点到为止/下死手）在此分支由剧情语义承载（胡斐的两难，玩家旁观见证），正邪偏移是否计入按落地时定：
  规范取"玩家未亲手出手则不计 A 偏移，仅保留 B 抉择"，避免代打却背德的不合理归因。
- **传闻导流**：本线北境传闻同时是「铁掌」秘籍（裘千仞旧部）的线索来源（CHARACTERS §3.2），完成后城镇书商变体解锁。
- 无强制前置（T1 短线，可早玩）；`fh-done` 为**可选增益联动**，不满足也整条线可通。
