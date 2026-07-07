# 线 01 · 鸳鸯刀（T1，1 章）— 生产 spec

> **状态：✅ 已实装**（M4，`src/data/story/yuanyang.ts`）。本 spec 是**黄金模板**——其余 13 条线
> 照此格式写。已实装部分标注"实况"，未落地的规范部分标注"待补"。
> 上游：STORY_BIBLE §2.1（章节级）· WORLD_ATLAS（地图）· ROSTER §3.1（NPC）· CONTENT_FORMAT（落地）。

**一句话**：喜剧护镖。太岳四侠劫镖闹笑话，鸳鸯刀里藏着"仁者无敌"的秘密。
**难度**：T1（推荐第一条线，战斗系统教学关）。**天书**：`book-yuanyang`（"鸳"字位）。
**线缩写**：`yy`。**入口**：无名小村「镖师」(`biaoshi`) 点火 flag `yy-start`。

---

## 1. 章节流程

### 第 1 章 · 双刀合璧（唯一章）

| 节拍 | 地图                    | 参与 NPC         | 类型               | 内容                                 |
| ---- | ----------------------- | ---------------- | ------------------ | ------------------------------------ |
| 起   | 无名小村 `xiake-island` | `biaoshi`        | 点火对话           | 镖师求护镖，交代鸳鸯刀传说           |
| 承   | 官道 `guandao`※         | `taiyue-si-xia`  | **教学战**(敌极弱) | 太岳四侠劫镖，闹剧                   |
| 抉择 | —                       | 太岳四侠         | **choice**         | 战胜后：放走(+8 侠名)/扭送(-5)       |
| 转   | 萧府 `xiao-fu`※         | `xiao-banhe`     | 名场面对话         | 萧半和寿宴风波                       |
| 合   | 萧府 `xiao-fu`          | `zhuo-tianxiong` | **BOSS**           | 决战卓天雄                           |
| 收   | 萧府                    | `xiao-zhonghui`  | 授天书             | 鸳鸯刀合璧现"仁者无敌"→ 萧中慧赠天书 |

※ **地图待补**：`guandao`（可并入 zhongyuan 一段官道）、`xiao-fu` 为 ✎ 新建（WORLD_ATLAS §2.8）。
**实况简化**：M4 版**无专属地图、不 switchMap**，以对话+战斗叠加演出；天书暂由旁白授予（无 `xiao-zhonghui` NPC 时）。
规范化时补建两图 + switchMap + 萧府 NPC。

---

## 2. 抉择与正邪

| 抉择点       | 选项     | 效果                | flag        |
| ------------ | -------- | ------------------- | ----------- |
| 处置太岳四侠 | 侠义放走 | `adjustMorality +8` | `yy-kind`   |
|              | 扭送官府 | `adjustMorality -5` | `yy-turnin` |

- 两难：放走=纵匪但全侠义；扭送=守法但太岳四侠是笑点客串，扭送略显不近人情。
- 后果：镖师按 `minMorality` 走不同结束对话变体（正邪→对话变体的演示，已实装）。

---

## 3. 招募 / 武学 / 奖励

- **招募**：无（太岳四侠为固定笑点客串，完成后转为各城镇**情报贩子**，ROSTER §3 末）。
- **奖励**：`gainExp 120` + `grantBook book-yuanyang`。
- **武学**：无专属；作为教学线不塞毕业技。

---

## 4. flag 产出/消费

| flag                    | 产/消                | 说明                                                    |
| ----------------------- | -------------------- | ------------------------------------------------------- |
| `yy-start`              | 消费(trigger)        | 镖师点火                                                |
| `yy-kind` / `yy-turnin` | 产出                 | 抉择分支；镖师对话变体消费                              |
| `yy-done`               | 产出                 | 线完成（= `story-done:yy-line` 语义，实况用 `yy-done`） |
| 太岳四侠好感            | 产出(STORY_BIBLE §3) | 各城镇情报价格/内容                                     |

> 命名债：实况用 `yy-done`，CONTENT_FORMAT §1 规范是 `story-done:yy-line`；统一时择一，此处记差异。

---

## 5. 事件链落地（实况，`data/story/yuanyang.ts`）

已实装，结构见该文件：`dialogue(yy-intro) → battle(yy-taiyue, 败则 goto 回打) → dialogue(choice-prompt)
→ choice(放走/扭送) → 两支 adjustMorality+setFlag → 汇合 dialogue → battle(yy-zhuo, 败则回打)
→ gainExp+grantBook+setFlag(yy-done)+outro → end`。注册于 `data/story/index.ts`。

**规范化 TODO**（转正为完整线）：

1. 建 `guandao`（或 zhongyuan 官道段）+ `xiao-fu` 地图；在承/转节拍加 `switchMap`。
2. 摆 NPC：`xiao-banhe` / `xiao-zhonghui` / `zhuo-tianxiong`（战斗单位已在 characters）。
3. 天书改由 `xiao-zhonghui` 授予（叙事到位）。
4. 太岳四侠"情报贩子"转化：城镇 NPC + `hasFlag: yy-done` 变体。

---

## 6. 测试

- ✅ runner 单测覆盖两抉择分支 + 两战斗 onWin/onLose。
- ✅ e2e `verify-ending.mjs` 含鸳鸯刀线实跑（作为终局前置的一条线）。
- 规范化后加 `verify-yuanyang.mjs`（入口→教学战→抉择→卓天雄→天书）。

---

## 7. 联动

- 太岳四侠此后各城镇随机出现卖情报（→ 各线入口传闻导流）。
- 无跨线前置依赖（T1 教学线，适合第一条玩）。
