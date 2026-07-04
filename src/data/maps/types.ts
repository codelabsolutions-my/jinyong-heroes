/** 地图数据格式。地图用字符网格描述，每个字符对应一种地形。 */

export interface TerrainDef {
  /** 显示颜色（像素素材接入前的占位） */
  color: number;
  walkable: boolean;
  /** 地形名，调试与后续素材映射用 */
  name: string;
}

/** 出入口：走上 (x, y) 这一格即切换到目标地图的 (toX, toY)。 */
export interface ExitDef {
  x: number;
  y: number;
  toMap: string;
  toX: number;
  toY: number;
}

/** NPC 在本地图上的摆放位置（NPC 定义在 src/data/npcs/） */
export interface NpcPlacement {
  npcId: string;
  x: number;
  y: number;
}

export interface MapData {
  id: string;
  name: string;
  /** 字符网格，每行等长，每个字符查 terrains 表 */
  grid: string[];
  terrains: Record<string, TerrainDef>;
  /** 新游戏出生点（格子坐标），仅起始地图使用 */
  spawn: { x: number; y: number };
  exits: ExitDef[];
  npcs: NpcPlacement[];
}

export function mapWidth(map: MapData): number {
  return map.grid[0]?.length ?? 0;
}

export function mapHeight(map: MapData): number {
  return map.grid.length;
}

export function terrainAt(
  map: MapData,
  x: number,
  y: number,
): TerrainDef | null {
  const row = map.grid[y];
  if (!row) return null;
  const ch = row[x];
  if (!ch) return null;
  return map.terrains[ch] ?? null;
}

export function isWalkable(map: MapData, x: number, y: number): boolean {
  return terrainAt(map, x, y)?.walkable ?? false;
}

export function exitAt(map: MapData, x: number, y: number): ExitDef | null {
  return map.exits.find((e) => e.x === x && e.y === y) ?? null;
}

export function npcAt(map: MapData, x: number, y: number): NpcPlacement | null {
  return map.npcs.find((n) => n.x === x && n.y === y) ?? null;
}
