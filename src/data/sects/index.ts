/**
 * 门派数据（内容即数据，CLAUDE.md §5.2）。`reputation` 以门派 id 记声望，
 * 展示层查此表拿显示名——新增门派只动本文件，不改渲染代码。
 */
export interface SectDef {
  id: string;
  name: string;
}

export const SECTS: Record<string, SectDef> = {
  quanzhen: { id: "quanzhen", name: "全真教" },
  gaibang: { id: "gaibang", name: "丐帮" },
  shaolin: { id: "shaolin", name: "少林" },
  wudang: { id: "wudang", name: "武当" },
  emei: { id: "emei", name: "峨嵋" },
};

/** 门派显示名；未登记的 id 原样返回（便于早期未建档门派也能显示）。 */
export function sectName(id: string): string {
  return SECTS[id]?.name ?? id;
}
