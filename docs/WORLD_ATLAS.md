# WORLD_ATLAS.md — 世界地理总图（全 14 线的规范地图）

> **地理的单一事实来源。** STORY_BIBLE 写"某章发生在某地"，本图定义**那个地到底是哪张
> 地图、id 叫什么、和谁相连、哪条线用它、里面有什么**。写地图数据（`src/data/maps/`）
> 与摆 NPC（`src/data/npcs/`）以本图为准；地理改动先改这里（同 PR）。
>
> 配套：剧情章节 → `STORY_BIBLE.md`；人物/NPC → `ROSTER.md`；数据落地格式 →
> `CONTENT_FORMAT.md`；每条线的地图×NPC×事件编排 → `docs/lines/NN-*.md`。

---

## 0. 本图的由来（为什么现在才写）

M5 期间用 `scripts/gen-world-maps.mjs` 生成过 42 张"世界地图"（`src/data/maps/world.ts`）。
**它们的 id/名字其实是对的**（`taohuadao` 桃花岛、`guangmingding` 光明顶、`heimuya` 黑木崖、
`shaolin`、`zhenlong` 珍珑棋局…都是真地名），但**布局是自动生成的、里面空无一物**——没有
NPC、没有剧情钩子，连通图是算法拼的、不是照剧情设计的。它们制造了"世界已建好"的假象。

**决定（ADR #34）**：把 world.ts 从可玩图谱**隔离**（撤掉 `jianghu (5,19)→zhongyuan` 入口
与 `...WORLD_MAPS` 注册），文件与生成器留档但不参与游戏。本图**复用它那套 id 命名空间**——
将来照本图重画的真图，用同样的 id 就是原地替换。可玩世界暂时回到 5 张手作图，诚实为准。

---

## 1. 世界结构：枢纽—区域—节点

```
无名小村 (START, 教学口袋)
   │  出师
   ▼
中原大地图 (zhongyuan) ──────── 世界枢纽，通往五大区域门户
   │
   ├─ 中原腹地   洛阳/开封/少林/武当/丐帮 …………… T1–T2 起步
   ├─ 江南水乡   嘉兴/临安/苏州/桃花岛/牛家村 ……… T1–T3
   ├─ 塞外边关   襄阳/雁门关/蒙古/张家口 ………………… T3（家国大战）
   ├─ 川陕关中   长安/华山/终南/光明顶/昆仑 ………… T2–T3
   └─ 巴蜀滇边   成都/峨嵋/大理/无量山 …………………… T2–T3
        海路 (泉州/扬州港) → 侠客岛/神龙岛/通吃岛 … 海外三岛
```

- **软性难度门槛**（STORY_BIBLE §1.2）：不锁路，靠"区域怪物等级"引导。低层区域挨着枢纽，
  高层区域在地图边缘（塞外/海岛/黑木崖）。玩家可硬闯，打不打得过另说——原版精神。
- **每张图归属一个 region 字段**（用于小地图着色、遭遇等级、传闻导流），见 §5 数据字段。
- **门派图**（少林/武当/…）挂在所属区域下，既是拜师/声望点，也是相关线的剧情舞台。

---

## 2. 规范地图清单（canonical map list）

> 列：**id**（kebab，= 数据文件 id）· **名** · **region** · **tier** · **type** · **邻接** ·
> **用于线** · **状态**。
> `type`：`hub`枢纽 / `region`区域大图 / `town`城镇 / `sect`门派 / `wild`野外 / `dungeon`秘境/剧情场。
> `状态`：✅ 已手作可玩 · ▢ 已有空壳(world.ts, 需重画) · ✎ 全新待建（本图新增）。
> 邻接只记"设计上应连通"，具体格子坐标在建图时定。

### 2.0 枢纽与教学

| id              | 名           | region | tier | type   | 邻接                             | 用于线                         | 状态 |
| --------------- | ------------ | ------ | ---- | ------ | -------------------------------- | ------------------------------ | ---- |
| `xiake-island`※ | 无名小村     | 中原   | T0   | town   | 后山小径, 江湖                   | 开局引导, 射雕入口, 鸳鸯刀入口 | ✅   |
| `houshan-path`  | 后山小径     | 中原   | T0   | wild   | 无名小村, 牛家村, 华山之巅       | 教学过渡                       | ✅   |
| `jianghu`       | 江湖(旧枢纽) | 中原   | T0   | hub    | 无名小村, 牛家村, 华山之巅, 后山 | M5 临时枢纽                    | ✅   |
| `zhongyuan`     | 中原大地图   | 中原   | —    | region | 五大区域门户                     | 全局枢纽                       | ▢    |

> ※ **命名债**：`xiake-island` 这个 id 实际是**无名小村**（历史误名，说书先生/镖师在此）。
> 真·侠客岛是 `xiakedao`（§2.6）。迁移到规范图时应把起始村重命名为 `wuming-cun`
> （改 START_MAP_ID + 引用），列为独立技术债任务，不在内容 bible 范围内先记着。
> `jianghu` 是 M5 的临时开放世界枢纽；规范化后其角色由 `zhongyuan` 承担，`jianghu` 退役或并入。

### 2.1 中原腹地（region: 中原）

| id             | 名       | tier | type    | 邻接            | 用于线                           | 状态 |
| -------------- | -------- | ---- | ------- | --------------- | -------------------------------- | ---- |
| `luoyang`      | 洛阳城   | T2   | town    | zhongyuan, 少林 | 天龙(聚贤庄近), 传闻集散         | ▢    |
| `kaifeng`      | 开封府   | T2   | town    | zhongyuan, 丐帮 | 丐帮线, 天龙                     | ▢    |
| `shaolin`      | 少林寺   | T2   | sect    | luoyang, 藏经阁 | 天龙(扫地僧), 拜师, 倚天(屠狮)   | ▢    |
| `wudang`       | 武当山   | T2   | sect    | zhongyuan       | 倚天(张三丰), 拜师               | ▢    |
| `gaibang`      | 丐帮总舵 | T2   | sect    | kaifeng         | 射雕(洪七公), 天龙(乔峰), 打狗棒 | ▢    |
| `cangjingge`   | 藏经阁   | T3   | dungeon | shaolin         | 天龙(扫地僧点化, 旁观线天书)     | ▢    |
| `juxianzhuang` | 聚贤庄   | T3   | dungeon | luoyang         | 天龙第3章(群雄车轮战)            | ✎    |
| `huanggong`    | 皇宫大内 | T3   | dungeon | kaifeng/changan | 碧血剑(刺帝), 鹿鼎(宫斗)         | ▢    |

### 2.2 江南水乡（region: 江南）

| id               | 名     | tier | type     | 邻接              | 用于线                      | 状态 |
| ---------------- | ------ | ---- | -------- | ----------------- | --------------------------- | ---- |
| `jiaxing`        | 嘉兴   | T1   | town     | zhongyuan, 牛家村 | 射雕(醉仙楼), 传闻          | ▢    |
| `niujia-village` | 牛家村 | T1   | town     | 后山小径, 嘉兴    | 射雕第1章(黄河四鬼)         | ✅   |
| `linan`          | 临安   | T2   | town     | jiaxing, 六和塔   | 书剑(六和塔近), 南宋行在    | ▢    |
| `suzhou`         | 苏州   | T2   | town     | jiaxing           | 传闻, 商店                  | ▢    |
| `wuxi`           | 无锡   | T1   | town     | jiaxing           | 传闻, 商店                  | ▢    |
| `taohuadao`      | 桃花岛 | T3   | dungeon  | linan(海路)       | 射雕第2章(黄药师三试)       | ▢    |
| `liuheta`        | 六和塔 | T2   | dungeon  | linan             | 书剑第2章(营救文泰来, 潜入) | ✎    |
| `yangzhou`       | 扬州   | T2   | town(港) | jiaxing → 海路    | 鹿鼎(韦小宝故乡), 海路口岸  | ▢    |

### 2.3 塞外边关（region: 塞外）

| id            | 名       | tier | type    | 邻接            | 用于线                    | 状态 |
| ------------- | -------- | ---- | ------- | --------------- | ------------------------- | ---- |
| `zhangjiakou` | 张家口   | T2   | town    | zhongyuan       | 射雕第1章(遇黄蓉)         | ✎    |
| `xiangyang`   | 襄阳城   | T3   | town    | zhongyuan, 蒙古 | 神雕第3章(守城战)         | ▢    |
| `menggu`      | 蒙古大营 | T3   | wild    | 襄阳, 张家口    | 射雕/神雕(蒙古军), 车轮战 | ▢    |
| `yanmenguan`  | 雁门关   | T3   | dungeon | 塞外边缘        | 天龙第4章(乔峰之抉择)     | ✎    |

### 2.4 川陕关中（region: 川陕）

| id               | 名       | tier | type    | 邻接              | 用于线                            | 状态 |
| ---------------- | -------- | ---- | ------- | ----------------- | --------------------------------- | ---- |
| `changan`        | 长安     | T2   | town    | zhongyuan, 华山   | 关中集散, 碧血剑(京城可复用)      | ▢    |
| `huashan-pai`    | 华山派   | T2   | sect    | changan, 华山之巅 | 碧血剑第1章(金蛇洞), 笑傲(思过崖) | ▢    |
| `huashan-summit` | 华山之巅 | T3   | wild    | 后山小径, 华山派  | 射雕第3章(论剑/欧阳锋)            | ✅   |
| `siguoya`        | 思过崖   | T3   | dungeon | huashan-pai       | 笑傲第2章(风清扬授独孤九剑)       | ✎    |
| `zhongnan`       | 终南山   | T2   | wild    | changan           | 神雕第1章前置(全真/古墓)          | ▢    |
| `quanzhen`       | 全真教   | T2   | sect    | zhongnan          | 神雕(全真冲突)                    | ▢    |
| `gumu`           | 活死人墓 | T3   | dungeon | zhongnan          | 神雕第1章(杨过小龙女)             | ▢    |
| `kongtong`       | 崆峒派   | T2   | sect    | changan           | 倚天(六大派), 拜师                | ▢    |
| `kunlun`         | 昆仑派   | T3   | sect    | 光明顶            | 倚天(六大派)                      | ▢    |
| `guangmingding`  | 光明顶   | T3   | dungeon | kunlun            | 倚天第2章(六大派围攻, 选边)       | ▢    |
| `xuedaomen`      | 血刀门   | T2   | sect    | 川陕边(藏边)      | 连城诀第2章(血刀老祖)             | ▢    |

### 2.5 巴蜀滇边（region: 巴蜀滇 / 西南）

| id            | 名         | tier | type    | 邻接            | 用于线                      | 状态 |
| ------------- | ---------- | ---- | ------- | --------------- | --------------------------- | ---- |
| `chengdu`     | 成都       | T2   | town    | zhongyuan/川陕  | 西南集散, 商店              | ▢    |
| `emei`        | 峨嵋       | T2   | sect    | chengdu         | 倚天(六大派/灭绝), 拜师     | ▢    |
| `dali`        | 大理城     | T2   | town    | chengdu         | 天龙第1章(段誉)             | ▢    |
| `tianlongsi`  | 天龙寺     | T2   | sect    | dali            | 天龙(段氏/六脉神剑)         | ▢    |
| `wuliangdong` | 无量山洞   | T2   | dungeon | dali            | 天龙第1章(北冥/凌波微步)    | ▢    |
| `zhenlong`    | 珍珑棋局   | T3   | dungeon | 缥缈峰(dali邻)  | 天龙第2章(虚竹破局)         | ▢    |
| `jueqinggu`   | 绝情谷     | T3   | dungeon | chengdu/西南    | 神雕第2章(情花毒, 裘千尺)   | ▢    |
| `wanfu`       | 万府(湘西) | T2   | dungeon | chengdu(湘西邻) | 连城诀第1章(潜入取证)       | ✎    |
| `xuegu`       | 雪谷       | T2   | wild    | 血刀门邻        | 连城诀第2章                 | ✎    |
| `tianningsi`  | 天宁寺     | T2   | dungeon | 湘西            | 连城诀第3章(宝藏, 核心抉择) | ✎    |

### 2.6 海路与海外三岛（region: 海外，经港口进）

| id            | 名     | tier | type     | 邻接         | 用于线                       | 状态 |
| ------------- | ------ | ---- | -------- | ------------ | ---------------------------- | ---- |
| `quanzhou`    | 泉州港 | T2   | town(港) | jiaxing/海路 | 出海口岸                     | ▢    |
| `xiakedao`    | 侠客岛 | T2   | dungeon  | 泉州(海路)   | 侠客行(赏善罚恶, 石壁太玄经) | ▢    |
| `shenlongdao` | 神龙岛 | T3   | dungeon  | 泉州(海路)   | 鹿鼎第2章(洪教主)            | ✎    |
| `tongchidao`  | 通吃岛 | T3   | dungeon  | 泉州(海路)   | 鹿鼎第3章(四十二章经)        | ✎    |

### 2.7 魔教 / 邪派据点（跨区域，正邪线专属）

| id         | 名       | tier | type    | 邻接               | 用于线                               | 状态 |
| ---------- | -------- | ---- | ------- | ------------------ | ------------------------------------ | ---- |
| `heimuya`  | 黑木崖   | T3   | dungeon | 塞外/华北          | 笑傲第4章(东方不败/魔道称尊结局入口) | ▢    |
| `mingjiao` | 明教总坛 | T3   | sect    | 光明顶邻           | 倚天(明教线)                         | ▢    |
| `xingxiu`  | 星宿海   | T3   | wild    | 西域边             | 天龙(星宿老怪, 传闻)                 | ▢    |
| `mimidong` | 山洞密室 | T2   | dungeon | 华山派(金蛇洞复用) | 碧血剑第1章(金蛇秘笈)                | ▢    |

### 2.8 各线专属新场景（✎ 全新，随线建）

> 这些是 STORY_BIBLE 点名、但现有 id 空间没有的场景，随对应线一起建图。集中列此便于排期。

| id              | 名         | 用于线/章                 | 备注                              |
| --------------- | ---------- | ------------------------- | --------------------------------- |
| `xiao-fu`       | 萧府/镖局  | 鸳鸯刀(寿宴, 卓天雄)      | 小型宅邸图                        |
| `guandao`       | 官道       | 鸳鸯刀第1章(劫镖教学战)   | 可做 `zhongyuan` 内路段而非独立图 |
| `huijiang`      | 回疆部落   | 白马第1章 / 书剑第3章     | 沙漠哈萨克营地                    |
| `gaochang`      | 高昌迷宫   | 白马第2章(机关解谜)       | 迷宫格                            |
| `yubifeng`      | 玉笔峰     | 雪山飞狐第1章(问案推理)   | 雪山堡                            |
| `xueshan-dong`  | 雪山藏宝洞 | 雪山飞狐第2章             | 洞窟                              |
| `shangjiabao`   | 商家堡     | 飞狐外传第1章             | 庄园                              |
| `foshan`        | 佛山       | 飞狐外传第2章(追凶)       | 岭南镇                            |
| `yaowangzhuang` | 药王庄     | 飞狐外传第3章(程灵素)     | 药圃, 解毒剂商店                  |
| `tiedanzhuang`  | 铁胆庄     | 书剑第1章(红花会)         | 庄园                              |
| `wenjiabao`     | 温家堡     | 碧血剑第2章(五行阵)       | 阵法特殊战                        |
| `hudiegu`       | 蝴蝶谷     | 倚天第1章(胡青牛)         | 医谷                              |
| `wanansi`       | 万安寺     | 倚天第3章(限时救援)       | 大都塔楼                          |
| `hengshan`      | 衡山城     | 笑傲第1章(刘正风金盆洗手) | 南岳镇                            |
| `wubagang`      | 五霸冈     | 笑傲第3章(任盈盈, 绿竹巷) | 荒冈                              |

**规范世界总量**：现有 ▢ ~38 张（world.ts 空壳，需重画）+ ✅ 5 张手作 + ✎ ~17 张新增
≈ **60 张地图**。这是全 14 线完整版的诚实规模。

---

## 3. 连通与门槛设计原则

1. **枢纽放射**：`zhongyuan` 是唯一必经中心；五大区域门户从它出发，区域内再放射到城镇/门派/秘境。
2. **秘境不挂枢纽**：剧情秘境（桃花岛/光明顶/黑木崖/珍珑…）只从**所属城镇或门派**进入，
   且多数带**进入条件**（flag/正邪/天书数），避免玩家早期误入高层被劝退成挫败。
3. **海岛走港口**：侠客岛/神龙岛/通吃岛不直接连大陆，经 `quanzhou`/`yangzhou` 的"渡口"exit 进，
   营造"出海"仪式感（也是软门槛）。
4. **回程闭合**：每张叶子图都要有回到区域大图的 exit，never 死胡同（content.test 连通性断言覆盖）。
5. **门派双用**：门派图既是拜师/声望交互点（常驻），又是相关线的剧情舞台（触发式），二者共存不冲突。

---

## 4. 地图 → 线 的覆盖矩阵（建图排期依据）

| 线 (STORY_BIBLE §2) | 主要地图                                                    | 新建(✎)                   |
| ------------------- | ----------------------------------------------------------- | ------------------------- |
| 鸳鸯刀 T1           | guandao, xiao-fu                                            | guandao*, xiao-fu         |
| 白马啸西风 T1       | huijiang, gaochang                                          | 两者                      |
| 雪山飞狐 T1         | yubifeng, xueshan-dong                                      | 两者                      |
| 飞狐外传 T2         | shangjiabao, foshan, yaowangzhuang                          | 三者                      |
| 连城诀 T2           | wanfu, xuegu, xuedaomen, tianningsi                         | wanfu,xuegu,tianningsi    |
| 书剑恩仇录 T2       | tiedanzhuang, liuheta, huijiang                             | tiedanzhuang,liuheta      |
| 碧血剑 T2           | mimidong, wenjiabao, huanggong                              | wenjiabao                 |
| 侠客行 T2           | xiakedao                                                    | — (石壁在岛内分区)        |
| 射雕英雄传 T3       | zhangjiakou, niujia-village✅, taohuadao, huashan-summit✅  | zhangjiakou               |
| 神雕侠侣 T3         | zhongnan/quanzhen/gumu, jueqinggu, xiangyang                | —                         |
| 倚天屠龙记 T3       | hudiegu, guangmingding/mingjiao, wanansi, shaolin           | hudiegu,wanansi           |
| 天龙八部 T3         | wuliangdong, zhenlong, juxianzhuang, yanmenguan, cangjingge | juxianzhuang,yanmenguan   |
| 笑傲江湖 T3         | hengshan, siguoya, wubagang, heimuya                        | hengshan,siguoya,wubagang |
| 鹿鼎记 T3           | huanggong, shenlongdao, tongchidao                          | shenlongdao,tongchidao    |

\* guandao 可并入 zhongyuan 一段官道，不必独立成图。

---

## 5. 地图数据字段约定（给建图 session）

规范图在 `src/data/maps/<id>.ts`，`MapData` 结构（见 `types.ts`），本 bible 额外约定：

- `id` 用本图表的 kebab id；`name` 用中文名。
- 新增 `region` 字段（`"中原"|"江南"|"塞外"|"川陕"|"巴蜀滇"|"海外"`）——用于小地图着色与遭遇分层。
  （引擎侧加字段属 systems-engineer 小改，建图前先落 types。）
- `exits` 双向配对：A→B 有出口，B→A 必有回口（§3.4）。
- NPC 摆放引用 `ROSTER.md` 的 npc id，不在地图文件里写死对话文本（对话进 `src/data/dialogues/`）。
- **空壳替换纪律**：重画某 ▢ 图时，保持 id 不变即为原地替换；同 PR 更新本图状态 ▢→✅。

---

## 6. 与里程碑的映射

- 本 bible 冻结后，建图按 STORY_BIBLE §4 的线排期推进（T1 线 → T2 → T3）。
- 每条线开工 = 先读 `docs/lines/NN-*.md`（该线的地图×NPC×事件编排），再建图/摆 NPC/写事件数据。
- 隔离的 world.ts 空壳按线逐张"转正"（▢→✅），转正一张即从 world.ts 迁出为独立手作图。
