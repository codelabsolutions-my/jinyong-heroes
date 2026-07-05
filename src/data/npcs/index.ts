/** NPC 定义。位置摆放在各地图的 npcs 字段里。 */

export interface NpcDef {
  id: string;
  name: string;
  /** 占位配色（衣服颜色），像素素材接入后换 spritesheet */
  color: number;
  dialogueId: string;
}

export const NPCS: Record<string, NpcDef> = {
  aniu: { id: "aniu", name: "阿牛", color: 0x7a9c4f, dialogueId: "aniu" },
  "wang-dama": {
    id: "wang-dama",
    name: "王大娘",
    color: 0x8a5a8a,
    dialogueId: "wang-dama",
  },
  sweeper: {
    id: "sweeper",
    name: "扫地老人",
    color: 0x9c9c9c,
    dialogueId: "sweeper",
  },
  bandit: {
    id: "bandit",
    name: "拦路强盗",
    color: 0x9c5a3a,
    dialogueId: "bandit",
  },
  // 射雕线点火 NPC（放在无名小村，避开 M1/M2 e2e 行走路径）
  storyteller: {
    id: "storyteller",
    name: "说书先生",
    color: 0xb08d57,
    dialogueId: "storyteller-shediao",
  },
  // 鸳鸯刀线点火 NPC（无名小村，出生点左侧僻静格，避开 e2e 路径）
  biaoshi: {
    id: "biaoshi",
    name: "镖师",
    color: 0x6b8ea3,
    dialogueId: "biaoshi",
  },
};
