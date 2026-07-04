# Decisions — jinyong-heroes

> Append-only ADR log. Every architectural decision gets a row when it's made —
> in the same PR that ships it. When a decision is reversed, add a new entry;
> never delete the old one.

| #   | Date       | Decision                                                                                              | Why                                                                          | Alternatives rejected                                                                   |
| --- | ---------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | 2026-07-04 | TypeScript + Vite + PixiJS 8，纯前端无后端                                                            | 浏览器即开即玩、迭代快、与 Ian 其他项目技术栈一致，agent 开发效率最高        | Godot（学习曲线+agent 协作差）、Unity（对 2D 像素 RPG 偏重）、Phaser（Pixi 更薄更可控） |
| 2   | 2026-07-04 | 逻辑/渲染严格分层：`src/game/` 纯 TS，渲染层只读状态                                                  | 战斗、正邪值、存档等核心规则必须可单测、可回放，不被 Pixi 绑架               | 逻辑写进 Scene 里（原型快但很快不可测）                                                 |
| 3   | 2026-07-04 | 内容即数据：地图/剧情/武学全部是 `src/data/` 类型化数据文件                                           | "加更多剧情"是本项目核心诉求，新增内容不应改引擎代码                         | 硬编码剧情（每段剧情都要动引擎）                                                        |
| 4   | 2026-07-04 | 地图用字符网格 + 地形表描述                                                                           | 人和 agent 都能直接读写、diff 友好、零工具链                                 | Tiled 编辑器 JSON（先期过重，M5 素材阶段可再评估）                                      |
| 5   | 2026-07-04 | 定位为非商业同人项目                                                                                  | 金庸小说改编权由第三方持有，直接用原著人物/剧情商业化有法律风险              | 换皮架空世界（失去"金庸群侠"的灵魂，如需商业化再评估）                                  |
| 6   | 2026-07-04 | 逐格移动 + 网格战棋，继承原版手感                                                                     | 复刻的辨识度核心；网格也大幅简化碰撞与战斗实现                               | 自由移动 + ARPG 战斗（不再是金庸群侠传）                                                |
| 7   | 2026-07-04 | e2e 验证用 puppeteer-core 驱动系统 Chrome + `window.__debug()` 探针（scripts/verify-m1.mjs）          | 满足 CLAUDE.md §1.3"实际玩通"：真实按键走完整流程，断言读游戏状态而非猜像素  | playwright（多装一份浏览器）、纯截图肉眼比对（无法断言状态）                            |
| 8   | 2026-07-04 | 输入边沿触发 takePress + 每帧 endFrame 清空                                                           | 对话推进/开菜单"按一下做一件事"，避免长按连发和跨帧堆积                      | keydown 直接改游戏状态（输入和帧循环脱节，不可测）                                      |
| 9   | 2026-07-04 | Game(core) 是唯一模式状态机：explore/dialogue/journal，按模式路由输入；场景只管渲染和移动             | 模式互斥逻辑集中一处，切图/读档统一走 rebuildScene                           | 每个 UI 组件自己监听键盘（互相抢按键，状态不一致）                                      |
| 10  | 2026-07-04 | 存档读取严格校验 + 注入式 worldCheck：game 层校验结构/枚举，data 层的"落点是否存在且可站"由调用方注入 | code review 发现 5 处坏档能砸穿游戏循环；game 层不 import 地图注册表保持分层 | loadGame 直接 import MAPS（game→data 运行时耦合）、不校验（坏档裸崩）                   |
