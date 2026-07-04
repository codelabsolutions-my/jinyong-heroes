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
};
