# M1 江湖骨架 — 任务清单

> feat/m1-world-skeleton。每项验证通过后标 [x]。

1. [x] `src/game/` 纯逻辑层：GameState（带 version）、conditions、journal（线索）、dialogue runner — 全部零 Pixi 依赖 + 单测
2. [x] `src/game/save.ts`：序列化/反序列化 + 版本校验 + 注入式 storage + 单测
3. [x] 地图格式扩展：出入口（exits）+ NPC 摆放；第二张地图「后山小径」+ 地图注册表
4. [x] 内容数据：3 个 NPC、对话脚本（含条件变体）、线索定义
5. [x] Input 扩展：边沿触发按键（空格对话、J 日志、K 存档、L 读档）
6. [x] 渲染层：NPC 渲染、对话框 UI、任务日志面板、HUD 提示栏、存档 toast
7. [x] 地图切换：走上出口 → 切地图到指定落点
8. [x] 全部检查过：vitest + eslint + tsc
9. [x] 浏览器 e2e 实测：走地图→切图→对话拿线索→日志可见→存档→刷新→读档位置恢复
10. [x] 文档更新（PROJECT_OVERVIEW 状态、必要 ADR）+ 提交 + squash-merge 回 main
