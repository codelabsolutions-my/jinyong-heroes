import type { ClueDef } from "@/game/journal";

/** 全部线索定义。id 命名：main-* 主线，rumor-* 传闻。 */
export const CLUES: Record<string, ClueDef> = {
  "rumor-houshan-old-man": {
    id: "rumor-houshan-old-man",
    category: "传闻",
    title: "后山的怪老头",
    text: "王大娘说，村子东边的后山小径尽头住着个整天扫地的怪老头，从没人见过他下山。",
  },
  "rumor-aniu-dream": {
    id: "rumor-aniu-dream",
    category: "传闻",
    title: "阿牛的心愿",
    text: "村口的少年阿牛一心想拜师学武，听说山外的江湖上高手如云。",
  },
  "main-fourteen-books": {
    id: "main-fourteen-books",
    category: "主线",
    title: "十四天书",
    text: "扫地老人说：集齐「飞雪连天射白鹿，笑书神侠倚碧鸳」十四部天书，方能回到原来的世界。",
  },
};
