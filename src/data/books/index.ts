import type { GameState } from "@/game/state";

/**
 * 十四天书（数据）。集齐方能归去（STORY_BIBLE §1.2/§1.3）。
 * 每部 = 对应小说线最终章的剧情奖励（grantBook effect）。
 * 未获得时日志显示 hint（该线入口线索，传闻导流）。
 * 序位按回目诗「飞雪连天射白鹿，笑书神侠倚碧鸳」。
 * M3 只做射雕线 → 仅 book-shediao 可得，其余为占位（name+入口线索齐全，随各线里程碑实装）。
 */
export interface BookDef {
  id: string;
  /** 天书序位 1-14（回目诗顺序） */
  order: number;
  /** 所属小说线名 */
  name: string;
  /** 未获得时显示的入口线索 */
  hint: string;
}

export const BOOKS: Record<string, BookDef> = {
  "book-feihu": {
    id: "book-feihu",
    order: 1,
    name: "飞狐外传",
    hint: "传闻少年胡斐为钟阿四一家讨公道，侠名渐起。",
  },
  "book-xueshan": {
    id: "book-xueshan",
    order: 2,
    name: "雪山飞狐",
    hint: "长白山雪峰之巅，苗胡两家的旧怨未了。",
  },
  "book-liancheng": {
    id: "book-liancheng",
    order: 3,
    name: "连城诀",
    hint: "荆州城里一桩冤案，牵出连城剑谱的秘密。",
  },
  "book-tianlong": {
    id: "book-tianlong",
    order: 4,
    name: "天龙八部",
    hint: "无量山洞、大理段氏，江湖将起惊天波澜。",
  },
  "book-shediao": {
    id: "book-shediao",
    order: 5,
    name: "射雕英雄传",
    hint: "张家口外风雪里，一个憨厚少年正要闯荡江湖。",
  },
  "book-baima": {
    id: "book-baima",
    order: 6,
    name: "白马啸西风",
    hint: "大漠孤烟，白马载着一个汉族少女远走天涯。",
  },
  "book-luding": {
    id: "book-luding",
    order: 7,
    name: "鹿鼎记",
    hint: "扬州丽春院里，出了个满嘴谎话的机灵小子。",
  },
  "book-xiaoao": {
    id: "book-xiaoao",
    order: 8,
    name: "笑傲江湖",
    hint: "福威镖局血案，一曲《笑傲江湖》引无数人竞逐。",
  },
  "book-shujian": {
    id: "book-shujian",
    order: 9,
    name: "书剑恩仇录",
    hint: "红花会群雄反清，当家的竟与朝廷有着血脉之秘。",
  },
  "book-shendiao": {
    id: "book-shendiao",
    order: 10,
    name: "神雕侠侣",
    hint: "活死人墓外，一段问世间情为何物的因缘。（需先了结射雕）",
  },
  "book-xiake": {
    id: "book-xiake",
    order: 11,
    name: "侠客行",
    hint: "侠客岛赏善罚恶令一出，武林人人自危。",
  },
  "book-yitian": {
    id: "book-yitian",
    order: 12,
    name: "倚天屠龙记",
    hint: "武林至尊，宝刀屠龙。刀剑之下藏着武穆遗书。",
  },
  "book-bixue": {
    id: "book-bixue",
    order: 13,
    name: "碧血剑",
    hint: "华山派下山的少年，背负着金蛇郎君的旧事。",
  },
  "book-yuanyang": {
    id: "book-yuanyang",
    order: 14,
    name: "鸳鸯刀",
    hint: "一对鸳鸯刀里，据说藏着『无敌于天下』的大秘密。",
  },
};

/** 天书总数（集齐目标）。 */
export const TOTAL_BOOKS = 14;

export interface BookEntry {
  def: BookDef;
  owned: boolean;
}

/** 按序位排好的天书清单，标注是否已获得（日志「天书」分册用）。 */
export function bookEntries(
  state: GameState,
  defs: Record<string, BookDef> = BOOKS,
): BookEntry[] {
  const owned = new Set(state.books);
  return Object.values(defs)
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((def) => ({ def, owned: owned.has(def.id) }));
}

/** 已获得天书数。 */
export function ownedBookCount(state: GameState): number {
  return state.books.filter((id) => id in BOOKS).length;
}
