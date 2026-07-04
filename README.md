# jinyong-heroes · 金庸群侠传重制

《金庸群侠传》(1996, 河洛工作室) 的现代化 Web 重制 — 保留原版"穿越武侠世界、
集齐十四天书、自由招募群侠"的开放骨架，加入任务日志、扩展剧情、门派声望、多结局。

**个人学习/同人项目，非商业。** 不使用原版任何素材；剧情为基于金庸小说的同人再创作。

## 运行

```bash
npm install
npm run dev      # http://localhost:5173 — 方向键/WASD 移动
```

## 常用命令

```bash
npm test         # Vitest 单测
npm run lint     # ESLint
npm run build    # typecheck + 生产构建
```

## 文档

| 文档                                                 | 内容                                 |
| ---------------------------------------------------- | ------------------------------------ |
| [CLAUDE.md](CLAUDE.md)                               | 开发流程与架构规则（agent 操作手册） |
| [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) | 愿景、当前里程碑、路线图             |
| [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md)           | 游戏系统与内容设计（核心文档）       |
| [docs/DECISIONS.md](docs/DECISIONS.md)               | 架构决策日志（ADR）                  |

## 技术栈

TypeScript 5 · Vite 6 · PixiJS 8 · Vitest — 纯前端，无后端。

## 当前状态

**M0 完成**：占位地图上逐格移动、碰撞、摄像机跟随。下一步 M1：多地图切换、
NPC 对话、任务日志、存档。见 [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)。
