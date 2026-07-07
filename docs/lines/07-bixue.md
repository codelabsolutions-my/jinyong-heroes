# 线 07 · 碧血剑（T2，3 章）— 生产 spec

> **状态：▢ 未实装**（排期 M4.5，STORY_BIBLE §4）。本 spec 照黄金模板 `01-yuanyang.md` 写；
> 全部为**规范设计**（无"实况"），落地时按 CONTENT_FORMAT 机械翻译。
> 上游：STORY_BIBLE §2.7（章节级）· WORLD_ATLAS §2（地图）· ROSTER §3.4/§3.5（人物）·
> CHARACTERS_AND_SKILLS §3.2/§4/§5（武学/队友/正邪）· CONTENT_FORMAT §2（schema）。

**一句话**：金蛇郎君的遗产与袁崇焕的遗志。金蛇秘笈、温家血仇、袁承志的刺帝执念。
**难度**：T2（3 章，中线）。**天书**：`book-bixue`（温家堡地窖，第 2 章授予，无变体遮蔽主链）。
**线缩写**：`bx`。**入口**：华山派山道「守洞道人」(`bx-daoren`) 点火 flag `bx-start`
（传闻导流：各城镇太岳四侠/书商透"华山绝壁有金蛇洞"，`grantClue clue-bx-1`）。

> **新增资产提示**（落地前必办）：
>
> - **队友 2 人需先补名册**：`yuanchengzhi` 袁承志（均衡型，全 1.0 系数）、`hetieshou` 何铁手
>   （用毒，邪≤-20 邪线专属）——CHARACTERS §4 与 ROSTER §3.4 均只在注里提及，未进正式队友表；
>   本线落地 PR 内先补 `data/characters/` + 两表行。
> - **地图**：`wenjiabao` 为 ✎ 新建（WORLD_ATLAS §2，阵法特殊战图）；`mimidong`（华山金蛇洞复用）、
>   `huanggong`（皇宫大内=京城）为 ▢ 转正（重画）。

---

## 1. 章节流程

### 第 1 章 · 华山石洞（`mimidong`）

| 节拍   | 地图                | 参与 NPC       | 类型                   | 内容                                                                        |
| ------ | ------------------- | -------------- | ---------------------- | --------------------------------------------------------------------------- |
| 起     | 山洞密室 `mimidong` | `bx-daoren`    | 点火对话               | 守洞道人指绝壁金蛇洞，交代金蛇郎君夏雪宜传说                                |
| 名场面 | `mimidong`          | —（旁白/遗骸） | 名场面对话             | 洞内金蛇郎君遗骸与遗书：一段情仇、一柄金蛇剑、一部秘笈                      |
| 谜     | `mimidong`          | —              | **机关解谜**           | 石室机关：按遗书暗示的次序开石门（选错=触机关小惩，可重试）                 |
| 收     | `mimidong`          | —              | **授武学（本线福利）** | 得金蛇秘笈 → 学〔金蛇剑法〕`jinshe-jianfa`（**人人可学**，CHARACTERS §3.2） |
| 抉择   | —                   | —              | **choice**             | 金蛇锥剧毒暗器：一并取走（+邪，得阴狠手段）/ 留于洞中（+侠）                |

**名场面纪律**：金蛇郎君遗书须像夏雪宜——痴、狠、悲；温家血仇由此埋 ch2 钩子（STORY_BIBLE §5.1）。
**解谜落地**：M4.5 无专属 puzzle step，用 `choice`（选对机关次序 → goto 开门；选错 → 小惩对话 → goto 回选）
表达；若后续引擎加 `puzzle` step 再转正（记为轻量引擎依赖，见 §5）。

### 第 2 章 · 温家堡（`wenjiabao` ✎）

| 节拍 | 地图               | 参与 NPC   | 类型                           | 内容                                                                   |
| ---- | ------------------ | ---------- | ------------------------------ | ---------------------------------------------------------------------- |
| 转   | 温家堡 `wenjiabao` | `wen-clan` | 名场面对话                     | 温家五老识金蛇剑法，血仇当面；金蛇郎君与温仪往事                       |
| 战   | `wenjiabao`        | `wen-clan` | **五行阵特殊战**               | 温氏五行阵：**击破阵眼单位**（土位老者）阵法方解，五老普攻附克制轮加成 |
| 收   | `wenjiabao` 地窖   | —          | **授天书（主链，unshadowed）** | 破阵入地窖，得《碧血剑》天书 `grantBook book-bixue`                    |
| 抉择 | —                  | 温家五老   | **choice**                     | 处置温家：为金蛇郎君灭门（+邪）/ 冤冤相报何时了、放过（+侠）           |

**特殊战 = 引擎依赖**：五行阵胜利条件不是"清场"，是"击破阵眼单位后阵法解除、余众溃退"。
需 `resolve()` 支持**特定单位胜利条件**（击破 `targetUnit` 即胜），见 §5 引擎依赖①。

### 第 3 章 · 京城风云（`huanggong` ▢）

| 节拍  | 地图                 | 参与 NPC        | 类型                    | 内容                                                                                 |
| ----- | -------------------- | --------------- | ----------------------- | ------------------------------------------------------------------------------------ |
| 转    | 皇宫大内 `huanggong` | `yuan-chengzhi` | 名场面对话              | 袁承志谋刺崇祯为父袁崇焕报仇；家国、私仇、时局的三难                                 |
| 抉择  | —                    | `yuan-chengzhi` | **核心 choice（站边）** | 助他放下私仇（+侠，袁承志感召入队）/ 助他动手刺帝（+邪）                             |
| 战    | `huanggong`          | 皇宫大内侍卫    | **必败战（邪支）**      | 助刺 → 大内高手车轮，**剧情必然失败**（onWin/onLose 同归失败对话）                   |
| 收·侠 | `huanggong`          | `yuan-chengzhi` | **招募**                | 放下支：`recruit yuanchengzhi`（均衡型队友）                                         |
| 收·邪 | `huanggong`          | `hetieshou`     | **邪线招募（门槛）**    | 动手支且**邪≤-20**：何铁手钦其狠辣来投 `recruit hetieshou`；袁承志败走**退场不可招** |

**站边抉择**：这是本线定调点，正邪偏移取**线级 ±30**（CHARACTERS §5）。悲剧内核不改写——
刺帝一支无论战斗输赢，剧情都失败（尊重史实与原著，玩家只能见证，STORY_BIBLE §5.3）。

---

## 2. 抉择与正邪

| 抉择点             | 章  | 选项           | 效果                                          | flag              |
| ------------------ | --- | -------------- | --------------------------------------------- | ----------------- |
| 金蛇锥暗器         | 1   | 取走剧毒暗器   | `adjustMorality -5`                           | `bx-take-poison`  |
|                    |     | 留于洞中       | `adjustMorality +5`                           | `bx-leave-poison` |
| 处置温家           | 2   | 灭门报仇       | `adjustMorality -15`                          | `bx-wen-slay`     |
|                    |     | 放过温家       | `adjustMorality +15`                          | `bx-wen-spare`    |
| 袁承志刺帝（站边） | 3   | 助他放下（侠） | `adjustMorality +30` + `recruit yuanchengzhi` | `bx-let-go`       |
|                    |     | 助他动手（邪） | `adjustMorality -30` + 必败战 + 袁承志退场    | `bx-strike`       |

- **两难纪律**（STORY_BIBLE §5.2）：
  - 金蛇锥：狠辣手段有用但沾邪；仁厚留毒则失一暗器资源。
  - 温家：为夏雪宜复仇痛快但滥杀无辜后人；放过则金蛇郎君遗恨难平、玩家亦无战利。
  - 刺帝：放下=保袁承志一命且得均衡强援，但父仇未报、憋屈；动手=快意恩仇却必败、痛失队友。
- **邪线专属出口**：`bx-strike` 且 `maxMorality -20` 满足时才解锁何铁手招募
  （CHARACTERS §5 门槛「何铁手 邪≤-20」），用 choice option 的 `when: { maxMorality: -20 }` 表达。

---

## 3. 招募 / 武学 / 奖励

- **招募**：
  - `yuanchengzhi` 袁承志（均衡型，全 1.0 系数）——**仅 `bx-let-go`（侠支）可招**；`bx-strike` 支退场。
  - `hetieshou` 何铁手（用毒，医毒近程）——**仅 `bx-strike` 且邪≤-20 可招**（邪线专属队友）。
  - ⚠️ 二者当前不在 CHARACTERS §4 / ROSTER §3.4 正式队友表，落地 PR 内先补（见头部提示）。
- **武学**：〔金蛇剑法〕`jinshe-jianfa`（柔系，power 12，range 1/单体，mp 6，CHARACTERS §3.2）——
  第 1 章授予，**本线福利、人人可学**（`learnSkill who: "player"`，前中期强力普及技）。
- **奖励**：`gainExp 200`（T2 中线）+ `grantBook book-bixue`（第 2 章主链，见 §1）。

---

## 4. flag 产出/消费

| flag                                 | 产/消         | 说明                                 |
| ------------------------------------ | ------------- | ------------------------------------ |
| `bx-start`                           | 消费(trigger) | 守洞道人点火                         |
| `clue-bx-1`                          | 消费(导流)    | 传闻线索指向金蛇洞（无箭头设计）     |
| `bx-take-poison` / `bx-leave-poison` | 产出          | ch1 暗器抉择                         |
| `bx-wen-slay` / `bx-wen-spare`       | 产出          | ch2 温家处置抉择                     |
| `bx-let-go` / `bx-strike`            | 产出          | ch3 站边；决定招募分支与后续对话变体 |
| `story-done:bx-line`                 | 产出          | 线完成（CONTENT_FORMAT §1 规范命名） |

> 命名遵 CONTENT_FORMAT §1 规范（`story-done:bx-line`），不沿用鸳鸯刀的实况债 `yy-done`。

---

## 5. 事件链落地（规范，`data/story/bixue.ts`）

按 CONTENT_FORMAT §2 骨架，step 用 `id` 标签寻址、对话文本进 `data/dialogues/`：

```
dialogue(bx-intro) → switchMap(mimidong) → dialogue(bx-yishu 遗书名场面)
→ choice(机关次序) →〔选对〕goto open /〔选错〕dialogue(bx-trap)→goto 回选
→ dialogue(bx-open) → learnSkill(jinshe-jianfa, player)
→ choice(金蛇锥: 取走 -5 / 留下 +5) → 两支 setFlag → merge1
→ switchMap(wenjiabao) → dialogue(bx-wen-pre 五行阵名场面)
→ battle(bx-wuxing, 特殊胜利=击破阵眼, onWin: win2, onLose: lose2)
→ dialogue(lose2)→goto bx-wuxing
→ dialogue(win2 破阵入地窖) → grantBook(book-bixue)          // 主链, 无变体遮蔽
→ choice(温家: 灭门 -15 / 放过 +15) → 两支 setFlag → merge2
→ switchMap(huanggong) → dialogue(bx-jing-pre 刺帝名场面)
→ choice(站边: 放下 goto letgo / 动手 goto strike)
  letgo: dialogue(bx-letgo) → adjustMorality(+30) → setFlag(bx-let-go)
         → recruit(yuanchengzhi) → goto finish
  strike: dialogue(bx-strike-pre) → adjustMorality(-30) → setFlag(bx-strike)
         → battle(bx-cidi 必败战, onWin: fail, onLose: fail)   // 输赢同归失败
         → dialogue(fail 袁承志败走退场)
         → choice(何铁手来投, when:{maxMorality:-20} → recruit hetieshou / 否则跳过)
         → goto finish
→ dialogue(finish, id: "finish") → gainExp(200)
→ setFlag(story-done:bx-line) → dialogue(bx-outro) → end
```

注册进 `data/story/index.ts` 的 `STORY_EVENTS`（非终局，普通顺序）。

**引擎依赖（落地前需引擎侧就绪，flag 给 systems-engineer）**：

1. **① 特定单位胜利条件（硬依赖）**：`resolve()` 需支持"击破指定 `targetUnit` 即判胜"的
   battle 胜利条件（五行阵阵眼）。当前 resolve 只有"清场/`surviveRounds`"两类；本线新增第三类。
   → 建议 battle schema 加 `victory: { kind: "defeatUnit", unitId }`，同步补 balance.test。
2. **② 必败战模式（软依赖，可数据绕过）**：刺帝为剧情必败。可**纯数据**实现（`onWin` 与 `onLose`
   都指向同一失败对话），无需引擎改动；若要"强制不可胜"的语义更干净，可后续加
   `battle.forcedLoss: true`。落地先用数据绕过，不阻塞。
3. **③ 机关解谜（轻量，可数据绕过）**：ch1 机关用 `choice` 表达即可，无需新 step；
   若日后加通用 `puzzle` step 再转正。不阻塞。

---

## 6. 测试

- **content.test.ts**：引用完整性——`mimidong`/`wenjiabao`/`huanggong`、`bx-daoren`/`wen-clan`/
  `yuan-chengzhi`/`hetieshou`、`jinshe-jianfa`、`book-bixue` 均须存在；`grantBook` 落主链
  （win2 节拍，无变体遮蔽）；`clue-bx-1` 有产出方。
- **runner 单测**：三处 choice 各分支、五行阵 onWin/onLose、必败战输赢双出口、
  何铁手 `when: {maxMorality:-20}` 门槛（满足/不满足两路）、goto 无死循环。
- **balance.test.ts**：T2 标准队 vs 温家五老（T2 BOSS，相当主角 14-18 级，CHARACTERS §2.3），
  固定 seed，阵眼战回合数落 4-8；验证「击破阵眼」提前结束不被"清场"逻辑吞掉。
- **e2e `verify-bixue.mjs`**：puppeteer 实跑 入口 → 金蛇剑法 → 五行阵破阵得天书 →
  ch3 两支各跑一遍（放下招袁承志 / 动手邪≤-20 招何铁手）。

---

## 7. 联动

- **武学普及**：〔金蛇剑法〕是前中期人人可学的柔系强技，其他线队伍构筑受益（跨线数值锚点）。
- **正邪门槛复用**：何铁手招募门槛 邪≤-20 与「连城邪线血刀刀法」「笑傲黑木崖入口」同源
  （CHARACTERS §5），是邪线资产的一环。
- **入口传闻导流**：太岳四侠/城镇书商透金蛇洞传闻（鸳鸯刀 §7 情报贩子联动）。
- **无硬前置**：可自由顺序进入（T2，建议 T1 之后）；不阻塞其他线。
