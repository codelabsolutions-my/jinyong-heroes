# ROSTER.md — 人物名册（队友落位 + 剧情 NPC）

> **人物"在哪、干嘛"的单一事实来源。** 队友的**数值**在 `CHARACTERS_AND_SKILLS.md §4`
> （那里是真源，本册不重复数字，只补"在哪张图、怎么招、招募点"）；剧情 NPC（不可招募的
> 说书先生/BOSS/授书人/情报贩子）此前从未成册，本册补全。摆 NPC（`src/data/npcs/`）以此为准。
>
> 配套：地图 id → `WORLD_ATLAS.md`；招募/正邪门槛数值 → `CHARACTERS_AND_SKILLS §5`；
> 每条线的 NPC 出场顺序 → `docs/lines/NN-*.md`。

---

## 1. 已实装 NPC（现状基线，`src/data/npcs/`）

| npc id        | 名       | 所在图     | 作用                           |
| ------------- | -------- | ---------- | ------------------------------ |
| `sweeper`     | 扫地老人 | 无名小村   | 开局点明主线（集齐十四天书）   |
| `storyteller` | 说书先生 | 无名小村   | 射雕线点火（`sd-line-start`）  |
| `biaoshi`     | 镖师     | 无名小村   | 鸳鸯刀线点火（`yy-start`）     |
| `aniu`        | 阿牛     | 无名小村   | 村民对话（`met-sweeper` 变体） |
| `wang-dama`   | 王大妈   | 无名小村   | 村民对话                       |
| `bandit`      | 强盗     | (战斗单位) | T1 杂兵模板                    |

> 命名约定：NPC id 用 kebab 拼音（`huang-yaoshi`），与队友 `characters/` id 一致；
> 一个人物**同时是队友又当过剧情 NPC**时共用一个 id（如 `guojing` 先战友军后入队）。

---

## 2. 可招募队友落位（17 人；数值见 CHARACTERS_AND_SKILLS §4）

> 列：**id** · 名 · 线 · **招募图**(WORLD_ATLAS id) · **招募条件**(CHARACTERS §5 / STORY_BIBLE) · 定位一句话。
> 招募 = 剧情 `recruit` StoryStep 入 `state.party`（GAME_DESIGN §4B）。

| id            | 名       | 线   | 招募图         | 招募条件                                  | 定位           |
| ------------- | -------- | ---- | -------------- | ----------------------------------------- | -------------- |
| `guojing`     | 郭靖     | 射雕 | niujia-village | 射雕第1章并肩后                           | 重装战士       |
| `huangrong`   | 黄蓉     | 射雕 | taohuadao      | 射雕第2章后                               | 军师/战场控制  |
| `hufei`       | 胡斐     | 飞狐 | foshan         | 飞狐第2章后                               | 高攻近战       |
| `chenglingsu` | 程灵素   | 飞狐 | yaowangzhuang  | 飞狐第3章(选劝胡斐)                       | **唯一治疗**   |
| `diyun`       | 狄云     | 连城 | wanfu→后续     | 连城第1章后(羁绊事件暴涨)                 | 大器晚成       |
| `shuisheng`   | 水笙     | 连城 | xuegu          | 连城第2章后                               | 唯一弓系远程   |
| `wuchen`      | 无尘道长 | 书剑 | tiedanzhuang   | 书剑第1章帮红花会                         | 先手刺客       |
| `liwenxiu`    | 李文秀   | 白马 | huijiang       | 白马第1章护住后                           | 高机动辅助     |
| `shipotian`   | 石破天   | 侠客 | xiakedao       | 侠客行第1章(接令赴岛)                     | 憨傻肉盾       |
| `yangguo`     | 杨过     | 神雕 | gumu           | 神雕第1章(支持二人)                       | 爆发剑客       |
| `xiaolongnv`  | 小龙女   | 神雕 | gumu           | 神雕第1章                                 | 与杨过双剑合璧 |
| `zhangwuji`   | 张无忌   | 倚天 | guangmingding  | 倚天第2章(助明教)                         | 全能主坦(双系) |
| `zhaomin`     | 赵敏     | 倚天 | wanansi        | 倚天(mingjiao-side 分支) **与周芷若互斥** | 控制           |
| `zhouzhiruo`  | 周芷若   | 倚天 | emei           | 倚天(助六大派分支) **与赵敏互斥**         | 刺客           |
| `duanyu`      | 段誉     | 天龙 | wuliangdong    | 天龙第1章后                               | 游走消耗       |
| `xuzhu`       | 虚竹     | 天龙 | zhenlong       | 天龙第2章(破棋局后)                       | 内力肉盾       |
| `linghuchong` | 令狐冲   | 笑傲 | siguoya        | 笑傲第2章后                               | 暴击剑客       |
| `renyingying` | 任盈盈   | 笑傲 | wubagang       | 笑傲第3章(五霸冈)                         | 辅助/羁绊核心  |
| `weixiaobao`  | 韦小宝   | 鹿鼎 | huanggong      | 鹿鼎第1章后                               | 规则外单位     |

> **限定同行（不入名册）**：`qiaofeng` 乔峰——天龙第3章聚贤庄"当场满配并肩"（CHARACTERS §4 注），
> 不进 `party`，做成一次性战友军。
> **邪线专属队友**：`hetieshou` 何铁手（碧血剑, 邪≤-20 可招, guangmingding/温家堡邻）——CHARACTERS §4 提及，
> 排期时补入本表。

---

## 3. 剧情 NPC 名册（不可招募；按线）

> 类型：`点火`剧情入口 NPC · `关键`推动剧情/授物 · `BOSS`强制战斗 · `情报`传闻贩子 · `配角`。
> BOSS 的战斗单位数值见 CHARACTERS §2.3 敌人分层；本表只定"是谁、在哪、干嘛"。

### 3.1 鸳鸯刀（T1）

| id               | 名       | 图       | 类型          | 作用                                |
| ---------------- | -------- | -------- | ------------- | ----------------------------------- |
| `biaoshi`        | 镖师     | 无名小村 | 点火          | 起线；按正邪走对话变体(已实装)      |
| `taiyue-si-xia`  | 太岳四侠 | guandao  | BOSS(弱)/配角 | 教学战；此后各城镇卖情报(§4 情报网) |
| `xiao-banhe`     | 萧半和   | xiao-fu  | 关键          | 寿宴主人                            |
| `xiao-zhonghui`  | 萧中慧   | xiao-fu  | 关键          | 授鸳鸯刀天书                        |
| `zhuo-tianxiong` | 卓天雄   | xiao-fu  | BOSS          | 寿宴 BOSS                           |

### 3.2 射雕英雄传（T3, 部分实装）

| id             | 名       | 图                     | 类型      | 作用                        |
| -------------- | -------- | ---------------------- | --------- | --------------------------- |
| `storyteller`  | 说书先生 | 无名小村               | 点火      | 起线(已实装)                |
| `huanghe-gui`  | 黄河四鬼 | niujia-village         | BOSS      | 第1章(郭靖并肩, 已实装)     |
| `ouyangfeng`   | 欧阳锋   | huashan-summit         | BOSS      | 第3章(撑回合胜, 已实装)     |
| `huang-yaoshi` | 黄药师   | taohuadao              | 关键/BOSS | 第2章三试(点到为止)         |
| `hong-qigong`  | 洪七公   | huashan-summit/gaibang | 关键      | 授射雕天书；打狗棒/降龙线索 |

### 3.3 神雕侠侣（T3, 前置 sd-done）

| id              | 名       | 图        | 类型 | 作用           |
| --------------- | -------- | --------- | ---- | -------------- |
| `zhao-zhijing`  | 赵志敬   | quanzhen  | 关键 | 全真冲突引子   |
| `qiu-qianchi`   | 裘千尺   | jueqinggu | BOSS | 第2章(枣核钉)  |
| `jinlun-fawang` | 金轮法王 | xiangyang | BOSS | 第3章守城 BOSS |

### 3.4 飞狐外传 / 雪山飞狐（T2/T1）

| id             | 名       | 图                 | 类型     | 作用                           |
| -------------- | -------- | ------------------ | -------- | ------------------------------ |
| `feng-tiannan` | 凤天南   | shangjiabao/foshan | BOSS     | 飞狐外传反派                   |
| `tang-pei`     | 汤沛     | foshan             | 关键     | 设局者                         |
| `miao-renfeng` | 苗人凤   | yubifeng           | BOSS(强) | 雪山第2章(点到为止/下死手抉择) |
| `baoshu`       | 宝树和尚 | yubifeng           | 关键     | 雪山第1章罗生门证词            |

### 3.5 连城诀 / 书剑 / 碧血剑 / 侠客行（T2）

| id                | 名         | 图                    | 类型     | 作用                          |
| ----------------- | ---------- | --------------------- | -------- | ----------------------------- |
| `xuedao-zuzu`     | 血刀老祖   | xuedaomen             | BOSS(强) | 连城第2章                     |
| `wan-gui`         | 万圭       | wanfu                 | 关键     | 连城第1章构陷                 |
| `chen-jialuo`     | 陈家洛     | tiedanzhuang          | 关键     | 书剑红花会总舵主, 授天书      |
| `zhang-zhaozhong` | 张召重     | liuheta               | BOSS     | 书剑第2章                     |
| `yuan-chengzhi`   | 袁承志     | huashan-pai/huanggong | 关键     | 碧血剑主角(助其放下/动手抉择) |
| `wen-clan`        | 温家五老   | wenjiabao             | BOSS     | 碧血剑五行阵                  |
| `long-mu-daozhu`  | 龙木二岛主 | xiakedao              | 关键     | 侠客行赏善罚恶令/石壁         |

### 3.6 倚天 / 天龙 / 笑傲 / 鹿鼎（T3）

| id                | 名               | 图                      | 类型          | 作用                      |
| ----------------- | ---------------- | ----------------------- | ------------- | ------------------------- |
| `hu-qingniu`      | 胡青牛           | hudiegu                 | 关键          | 倚天第1章医仙考验         |
| `miejue`          | 灭绝师太         | emei/guangmingding      | 关键/BOSS     | 倚天光明顶(目睹滥杀→反转) |
| `chenggun`        | 成昆             | shaolin(屠狮)           | BOSS(多阶段)  | 倚天第4章最终             |
| `saodi-seng`      | 扫地僧           | cangjingge              | 关键          | 天龙旁观线授天书          |
| `qiaofeng`        | 乔峰             | juxianzhuang/yanmenguan | 关键/限定同行 | 天龙第3章并肩、第4章见证  |
| `xingxiu-laoguai` | 星宿老怪(丁春秋) | xingxiu                 | BOSS          | 天龙支线                  |
| `liu-zhengfeng`   | 刘正风           | hengshan                | 关键          | 笑傲第1章金盆洗手灭门     |
| `feng-qingyang`   | 风清扬           | siguoya                 | 关键          | 笑傲授独孤九剑            |
| `dongfang-bubai`  | 东方不败         | heimuya                 | BOSS(天花板)  | 笑傲第4章(spd 碾压)       |
| `hong-jiaozhu`    | 洪教主           | shenlongdao             | BOSS          | 鹿鼎第2章(马屁喜剧)       |

> **情报贩子网**（§1 太岳四侠扩展）：`taiyue-si-xia` 完成鸳鸯刀后在 `luoyang/suzhou/chengdu/yangzhou`
> 等城镇随机出摊，卖各线入口传闻（无箭头开放世界的导流支柱，GAME_DESIGN §3.2）。实装 = 城镇 NPC
> 带 `hasClue`-gated 对话变体。

---

## 4. 待补数据（本册引出的引擎/数据小任务）

- `src/data/sects/` 现只 5 派（全真/丐帮/少林/武当/峨嵋）；本册引用还需补：`mingjiao 明教`、
  `huashan-pai 华山派`、`kunlun 昆仑`、`kongtong 崆峒`、`xiaoyao 逍遥/天山`、`riyue 日月神教`、
  `honghua 红花会`（声望阵营）。补 SECTS record 即可（内容即数据）。
- 队友 id 规范化：现有 `guojing/huangrong` 已在 `characters/`；其余 15 人建线时按本表 id 落 `characters/`。
- BOSS 单位数值：建线时按 CHARACTERS §2.3 分层填 `characters/`（敌方静态，GAME_DESIGN §4B）。
