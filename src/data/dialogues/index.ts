import type { Dialogue } from "@/game/dialogue";

/** 全部对话脚本。variants 按顺序检查，第一个条件满足的生效；否则用默认 lines。 */
export const DIALOGUES: Record<string, Dialogue> = {
  aniu: {
    id: "aniu",
    variants: [
      {
        when: { hasFlag: "met-sweeper" },
        lines: [
          {
            speaker: "阿牛",
            text: "哥哥真的见到后山的老爷爷了？大家都说他是神仙呢！我以后也要闯荡江湖、学好厉害的武功！",
          },
        ],
        // 变体会永久遮蔽默认对话 — 默认发的线索这里必须补发（grantClue 自动去重）
        effects: [{ type: "grantClue", clueId: "rumor-aniu-dream" }],
      },
    ],
    lines: [
      { speaker: "阿牛", text: "哥哥是外乡人吧？你会武功吗？" },
      {
        speaker: "阿牛",
        text: "我长大了也要闯荡江湖！听说山外高手如云，随便一个都能一掌劈碎石头！",
      },
    ],
    effects: [{ type: "grantClue", clueId: "rumor-aniu-dream" }],
  },

  "wang-dama": {
    id: "wang-dama",
    variants: [
      {
        when: { hasFlag: "met-sweeper" },
        lines: [
          {
            speaker: "王大娘",
            text: "你见过后山那老头了？小伙子，他可不是寻常人，他说的话你记牢了。",
          },
        ],
        // 变体会永久遮蔽默认对话 — 默认发的线索这里必须补发（grantClue 自动去重）
        effects: [{ type: "grantClue", clueId: "rumor-houshan-old-man" }],
      },
    ],
    lines: [
      { speaker: "王大娘", text: "小伙子面生得很，从哪儿来的呀？" },
      { speaker: "小虾米", text: "说来话长……大娘，这是什么地方？" },
      {
        speaker: "王大娘",
        text: "这儿是个无名小村。对了，东边后山小径尽头有个整天扫地的怪老头，从没人见他下过山，你可别去招惹。",
      },
    ],
    effects: [{ type: "grantClue", clueId: "rumor-houshan-old-man" }],
  },

  sweeper: {
    id: "sweeper",
    variants: [
      {
        when: { hasFlag: "met-sweeper" },
        lines: [
          {
            speaker: "扫地老人",
            text: "去吧。十四天书不会自己找上门来。",
          },
        ],
      },
    ],
    lines: [
      { speaker: "扫地老人", text: "……你不是这个世界的人。" },
      { speaker: "小虾米", text: "你、你怎么知道？！" },
      {
        speaker: "扫地老人",
        text: "老朽扫了一辈子地，什么没见过。听着：集齐「飞雪连天射白鹿，笑书神侠倚碧鸳」十四部天书，你自会找到归路。",
      },
      { speaker: "小虾米", text: "十四部天书……都在哪儿？" },
      { speaker: "扫地老人", text: "在江湖。去吧。" },
    ],
    effects: [
      { type: "grantClue", clueId: "main-fourteen-books" },
      { type: "setFlag", flag: "met-sweeper" },
    ],
  },

  bandit: {
    id: "bandit",
    // 胜利后 Game 置 flag `battle-won:houshan-bandits`（见 core/Game.ts 约定），
    // 变体在此接住，不再重复触发战斗。
    variants: [
      {
        when: { hasFlag: "battle-won:houshan-bandits" },
        lines: [
          {
            speaker: "拦路强盗",
            text: "好汉饶命！小的再也不敢拦路了……",
          },
        ],
      },
    ],
    lines: [
      {
        speaker: "拦路强盗",
        text: "此山是我开，此树是我栽！要打此路过，留下买路财！",
      },
      { speaker: "小虾米", text: "我身无分文，倒是可以奉陪几招。" },
      { speaker: "拦路强盗", text: "敬酒不吃吃罚酒！兄弟们，上！" },
    ],
    effects: [{ type: "startBattle", battleId: "houshan-bandits" }],
  },

  // 说书先生：射雕线的点火 NPC。对话结束置 flag sd-line-start，
  // Game 下一帧 selectTriggeredEvent 命中即开演射雕线。
  "storyteller-shediao": {
    id: "storyteller-shediao",
    variants: [
      {
        when: { hasFlag: "sd-done" },
        lines: [
          {
            speaker: "说书先生",
            text: "少侠了结了牛家村、华山那段因缘，侠名已在江湖上传开啦！",
          },
        ],
      },
    ],
    lines: [
      {
        speaker: "说书先生",
        text: "客官听过『射雕英雄』的故事么？北边牛家村出了桩恶事，黄河四鬼横行乡里，一个姓郭的实心眼少年正要出头呢。",
      },
      { speaker: "小虾米", text: "黄河四鬼欺压良善？我这就去会一会。" },
    ],
    effects: [{ type: "setFlag", flag: "sd-line-start" }],
  },

  // —— 射雕线剧情事件对话（由 src/data/story/shediao.ts 的 StoryEvent 驱动，
  //     effect 全走 story runner 的 Step，这里只承载文本）——
  "sd-intro": {
    id: "sd-intro",
    lines: [
      {
        speaker: "旁白",
        text: "风雪漫天。你随一名憨厚青年来到牛家村，曲三酒馆前人影错动。",
      },
      {
        speaker: "郭靖",
        text: "这位朋友，前头那四个恶客欺行霸市，我郭靖看不过眼——你可愿与我并肩？",
      },
      {
        speaker: "黄河鬼",
        text: "哪来的毛头小子多管闲事？黄河四鬼的名号，也是你们能碰的？",
      },
      { speaker: "小虾米", text: "话不投机。郭兄，动手吧！" },
    ],
  },
  "sd-huanghe-lose": {
    id: "sd-huanghe-lose",
    lines: [
      {
        speaker: "郭靖",
        text: "对方好生了得……朋友，先退一步，我们缓口气再战！",
      },
      { speaker: "旁白", text: "你与郭靖退到街角，稳住阵脚，准备重新迎敌。" },
    ],
  },
  "sd-huashan-intro": {
    id: "sd-huashan-intro",
    lines: [
      {
        speaker: "旁白",
        text: "数月后，华山之巅。五绝论剑将止，忽有厉啸破空。",
      },
      {
        speaker: "黄蓉",
        text: "是欧阳锋！他要抢《九阴真经》——靖哥哥，拦住他！",
      },
      {
        speaker: "欧阳锋",
        text: "哈哈哈，识相的便退开，休怪老毒物蛤蟆功不留情！",
      },
    ],
  },
  "sd-hong-rescue": {
    id: "sd-hong-rescue",
    lines: [
      {
        speaker: "洪七公",
        text: "老毒物，欺负我这几个后生晚辈，也不嫌臊得慌！",
      },
      {
        speaker: "旁白",
        text: "洪七公自云雾中赶到，掌风一荡，逼退欧阳锋。危局已解。",
      },
      {
        speaker: "洪七公",
        text: "小子，你临危不退，有几分侠气。这册心法，你且拿去——侠之大者，为国为民。",
      },
    ],
  },
  "sd-outro": {
    id: "sd-outro",
    lines: [
      {
        speaker: "旁白",
        text: "你得授天书一册，射雕一线就此了结。十四天书，又近一部。",
      },
    ],
  },
};
