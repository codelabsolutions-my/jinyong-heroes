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
};
