/**
 * 世界地图集生成器（比照《金庸群侠传》1996）——确定性、自校验。
 * 用法：node scripts/gen-world-maps.mjs   → 重写 src/data/maps/world.ts
 *
 * 产出 ~42 张互联地图（区域/城镇/门派/秘境）。每张过 content.test 不变量：
 * 等宽、地形有定义、spawn 可走且非出口、出口可走 + 落点可走 + 落点非出口（无 ping-pong）、连通。
 * 不改现有 5 图；世界经 jianghu 新增的 (5,19)→zhongyuan gate 接入（见 jianghu.ts）。
 * 改世界结构请改本文件重跑，勿手改 world.ts。
 */
import fs from "fs";

// ---------- 世界图谱（type: region/town/sect/dungeon；connects 无向）----------
const NODES = [
  { id: "zhongyuan", name: "中原大地图", type: "region", biome: "plain",
    connects: ["jianghu", "jiangnan", "saiwai", "chuanshan", "luoyang", "xiangyang", "kaifeng"] },
  { id: "jiangnan", name: "江南", type: "region", biome: "water",
    connects: ["jiaxing", "linan", "suzhou", "yangzhou", "taohuadao"] },
  { id: "saiwai", name: "塞外", type: "region", biome: "desert", connects: ["menggu", "heimuya", "guangmingding"] },
  { id: "chuanshan", name: "川陕", type: "region", biome: "mountain", connects: ["dali", "zhongnan", "huashan-pai", "emei"] },
  { id: "luoyang", name: "洛阳城", type: "town", biome: "plain", connects: ["shaolin"] },
  { id: "xiangyang", name: "襄阳城", type: "town", biome: "plain", connects: ["gaibang"] },
  { id: "kaifeng", name: "开封府", type: "town", biome: "plain", connects: ["huanggong"] },
  { id: "jiaxing", name: "嘉兴", type: "town", biome: "water", connects: [] },
  { id: "linan", name: "临安", type: "town", biome: "water", connects: ["huanggong"] },
  { id: "suzhou", name: "苏州", type: "town", biome: "water", connects: [] },
  { id: "yangzhou", name: "扬州", type: "town", biome: "water", connects: [] },
  { id: "dali", name: "大理城", type: "town", biome: "mountain", connects: ["tianlongsi"] },
  { id: "menggu", name: "蒙古大营", type: "town", biome: "desert", connects: [] },
  { id: "changan", name: "长安", type: "town", biome: "plain", connects: ["zhongnan"] },
  { id: "shaolin", name: "少林寺", type: "sect", biome: "mountain", connects: ["cangjingge"] },
  { id: "wudang", name: "武当山", type: "sect", biome: "mountain", connects: ["zhongyuan"] },
  { id: "emei", name: "峨嵋", type: "sect", biome: "mountain", connects: [] },
  { id: "huashan-pai", name: "华山派", type: "sect", biome: "mountain", connects: [] },
  { id: "quanzhen", name: "全真教", type: "sect", biome: "mountain", connects: ["gumu"] },
  { id: "zhongnan", name: "终南山", type: "sect", biome: "mountain", connects: ["quanzhen"] },
  { id: "gaibang", name: "丐帮总舵", type: "sect", biome: "plain", connects: [] },
  { id: "mingjiao", name: "明教", type: "sect", biome: "mountain", connects: ["guangmingding"] },
  { id: "taohuadao", name: "桃花岛", type: "sect", biome: "water", connects: [] },
  { id: "gumu", name: "活死人墓", type: "dungeon", biome: "mountain", connects: [] },
  { id: "tianlongsi", name: "天龙寺", type: "sect", biome: "mountain", connects: [] },
  { id: "xingxiu", name: "星宿海", type: "sect", biome: "desert", connects: ["saiwai"] },
  { id: "guangmingding", name: "光明顶", type: "dungeon", biome: "mountain", connects: ["heimuya"] },
  { id: "heimuya", name: "黑木崖", type: "dungeon", biome: "mountain", connects: [] },
  { id: "jueqinggu", name: "绝情谷", type: "dungeon", biome: "water", connects: ["chuanshan"] },
  { id: "cangjingge", name: "藏经阁", type: "dungeon", biome: "mountain", connects: [] },
  { id: "huanggong", name: "皇宫大内", type: "dungeon", biome: "plain", connects: [] },
  { id: "mimidong", name: "山洞密室", type: "dungeon", biome: "mountain", connects: ["jiangnan"] },
  { id: "wuxi", name: "无锡", type: "town", biome: "water", connects: ["jiangnan"] },
  { id: "quanzhou", name: "泉州港", type: "town", biome: "water", connects: ["jiangnan"] },
  { id: "chengdu", name: "成都", type: "town", biome: "mountain", connects: ["chuanshan"] },
  { id: "kunlun", name: "昆仑派", type: "sect", biome: "mountain", connects: ["chuanshan"] },
  { id: "kongtong", name: "崆峒派", type: "sect", biome: "desert", connects: ["saiwai"] },
  { id: "tiezhang", name: "铁掌帮", type: "sect", biome: "mountain", connects: ["xiangyang"] },
  { id: "xuedaomen", name: "血刀门", type: "sect", biome: "desert", connects: ["saiwai"] },
  { id: "xiakedao", name: "侠客岛", type: "dungeon", biome: "water", connects: ["jiangnan"] },
  { id: "wuliangdong", name: "无量山洞", type: "dungeon", biome: "mountain", connects: ["dali"] },
  { id: "zhenlong", name: "珍珑棋局", type: "dungeon", biome: "mountain", connects: ["wudang"] },
];
const EXISTING = new Set(["jianghu", "xiake-island", "niujia-village", "huashan-summit", "houshan-path"]);
const EXISTING_SPAWN = { jianghu: { x: 18, y: 14 } };

const TERR = {
  wall: { color: 0x4a4038, walkable: false, name: "wall" },
  grass: { color: 0x4a7c3f, walkable: true, name: "grass" },
  road: { color: 0xa8926b, walkable: true, name: "road" },
  water: { color: 0x2b5f8e, walkable: false, name: "water" },
  tree: { color: 0x2d5426, walkable: false, name: "tree" },
  rock: { color: 0x6b6257, walkable: false, name: "rock" },
  peak: { color: 0x5a5148, walkable: false, name: "peak" },
  house: { color: 0x8a6d3b, walkable: false, name: "house" },
  sand: { color: 0xbfa96b, walkable: true, name: "sand" },
  dune: { color: 0x8f7d47, walkable: false, name: "dune" },
  gate: { color: 0xd8b25a, walkable: true, name: "gate" },
};
const BIOMES = {
  plain: { open: ".", openT: "grass", block: "T", blockT: "tree", border: "#", borderT: "rock" },
  water: { open: ".", openT: "grass", block: "~", blockT: "water", border: "~", borderT: "water" },
  desert: { open: ",", openT: "sand", block: "^", blockT: "dune", border: "^", borderT: "dune" },
  mountain: { open: ".", openT: "grass", block: "#", blockT: "rock", border: "#", borderT: "peak" },
};
const DECOR = { town: "H", sect: "H", dungeon: "#", region: null };
const SIZE = { region: [34, 22], town: [22, 16], sect: [20, 16], dungeon: [18, 14] };

const nodeById = new Map(NODES.map((n) => [n.id, n]));
const adj = new Map(NODES.map((n) => [n.id, new Set()]));
for (const n of NODES)
  for (const c of n.connects) {
    if (EXISTING.has(c)) adj.get(n.id).add(c);
    else if (nodeById.has(c)) { adj.get(n.id).add(c); adj.get(c).add(n.id); }
    else throw new Error(`${n.id} 连到未知节点 ${c}`);
  }

function gateSlots(W, H, count) {
  const ring = [];
  for (let x = 2; x <= W - 3; x++) ring.push({ x, y: 1, inx: x, iny: 2 });
  for (let y = 2; y <= H - 3; y++) ring.push({ x: W - 2, y, inx: W - 3, iny: y });
  for (let x = W - 3; x >= 2; x--) ring.push({ x, y: H - 2, inx: x, iny: H - 3 });
  for (let y = H - 3; y >= 2; y--) ring.push({ x: 1, y, inx: 2, iny: y });
  const slots = [], step = Math.max(2, Math.floor(ring.length / count));
  for (let i = 0, k = 0; k < count; i += step, k++) slots.push(ring[i % ring.length]);
  return slots;
}
const gatePos = new Map();
for (const n of NODES) {
  const [W, H] = SIZE[n.type];
  const neighbors = [...adj.get(n.id)];
  const slots = gateSlots(W, H, Math.max(1, neighbors.length));
  const m = new Map();
  neighbors.forEach((nb, i) => m.set(nb, slots[i]));
  gatePos.set(n.id, m);
}

function genGrid(n) {
  const [W, H] = SIZE[n.type], b = BIOMES[n.biome];
  const g = Array.from({ length: H }, () => Array(W).fill(b.open));
  for (let x = 0; x < W; x++) { g[0][x] = b.border; g[H - 1][x] = b.border; }
  for (let y = 0; y < H; y++) { g[y][0] = b.border; g[y][W - 1] = b.border; }
  const cx = Math.floor(W / 2), cy = Math.floor(H / 2);
  const density = { region: 11, town: 7, sect: 6, dungeon: 4 }[n.type];
  const decorCh = DECOR[n.type];
  for (let y = 2; y < H - 2; y++)
    for (let x = 2; x < W - 2; x++)
      if (decorCh && (x * 7 + y * 13) % density === 0) g[y][x] = decorCh === "H" ? "H" : b.block;
  const slots = [...gatePos.get(n.id).values()];
  const carve = (x0, y0, x1, y1) => {
    let x = x0, y = y0;
    const open = () => { if (x > 0 && x < W - 1 && y > 0 && y < H - 1) g[y][x] = b.open; };
    while (x !== x1) { open(); x += x1 > x ? 1 : -1; }
    while (y !== y1) { open(); y += y1 > y ? 1 : -1; }
    open();
  };
  g[cy][cx] = b.open;
  for (const s of slots) carve(cx, cy, s.inx, s.iny);
  for (const s of slots) g[s.iny][s.inx] = b.open;
  for (const s of slots) g[s.y][s.x] = "O";
  return { W, H, cx, cy, grid: g.map((r) => r.join("")) };
}
function terrainsFor(n) {
  const b = BIOMES[n.biome], put = {};
  put[b.open] = TERR[b.openT]; put[b.border] = TERR[b.borderT]; put[b.block] = TERR[b.blockT];
  if (n.type === "town" || n.type === "sect") put["H"] = TERR.house;
  put["O"] = TERR.gate;
  return put;
}

const maps = {};
for (const n of NODES) {
  const gg = genGrid(n), gp = gatePos.get(n.id), exits = [];
  for (const [nb, s] of gp) {
    let toX, toY;
    if (EXISTING.has(nb)) { toX = EXISTING_SPAWN[nb].x; toY = EXISTING_SPAWN[nb].y; }
    else { const back = gatePos.get(nb).get(n.id); toX = back.inx; toY = back.iny; }
    exits.push({ x: s.x, y: s.y, toMap: nb, toX, toY });
  }
  maps[n.id] = { id: n.id, name: n.name, type: n.type, spawn: { x: gg.cx, y: gg.cy },
    grid: gg.grid, W: gg.W, H: gg.H, terrains: terrainsFor(n), exits };
}

// ---------- 校验 ----------
const errs = [];
const cell = (m, x, y) => m.grid[y]?.[x];
const walk = (m, x, y) => { const c = cell(m, x, y); return c === undefined ? false : (m.terrains[c]?.walkable ?? false); };
const gate = (m, x, y) => cell(m, x, y) === "O";
for (const m of Object.values(maps)) {
  for (const row of m.grid) {
    if (row.length !== m.W) errs.push(`${m.id} 行宽`);
    for (const ch of row) if (!m.terrains[ch]) errs.push(`${m.id} '${ch}' 无地形`);
  }
  if (!walk(m, m.spawn.x, m.spawn.y)) errs.push(`${m.id} spawn 不可走`);
  if (gate(m, m.spawn.x, m.spawn.y)) errs.push(`${m.id} spawn 在 gate`);
  for (const e of m.exits) {
    if (!walk(m, e.x, e.y)) errs.push(`${m.id} 出口不可走`);
    const tgt = maps[e.toMap];
    if (tgt) {
      if (!walk(tgt, e.toX, e.toY)) errs.push(`${m.id}→${e.toMap} 落点不可走`);
      if (gate(tgt, e.toX, e.toY)) errs.push(`${m.id}→${e.toMap} 落点是 gate`);
    } else if (!EXISTING.has(e.toMap)) errs.push(`${m.id}→未知图 ${e.toMap}`);
  }
  const seen = new Set([m.spawn.x + "," + m.spawn.y]), q = [[m.spawn.x, m.spawn.y]];
  while (q.length) { const [x, y] = q.pop();
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = x+dx, ny = y+dy, k = nx+","+ny;
      if (!seen.has(k) && walk(m, nx, ny) && !gate(m, nx, ny)) { seen.add(k); q.push([nx, ny]); }
    }
  }
  for (const e of m.exits)
    if (![[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => seen.has((e.x+dx)+","+(e.y+dy))))
      errs.push(`${m.id} gate→${e.toMap} spawn 走不到`);
}
if (errs.length) { console.error("校验失败:", errs.slice(0, 30)); process.exit(1); }

// ---------- 输出 world.ts ----------
const hex = (n) => "0x" + n.toString(16).padStart(6, "0");
const emitMap = (m) => {
  const terr = Object.entries(m.terrains)
    .map(([ch, t]) => `      ${JSON.stringify(ch)}: { color: ${hex(t.color)}, walkable: ${t.walkable}, name: ${JSON.stringify(t.name)} },`).join("\n");
  const grid = m.grid.map((r) => `      ${JSON.stringify(r)},`).join("\n");
  const exits = m.exits.map((e) => `      { x: ${e.x}, y: ${e.y}, toMap: ${JSON.stringify(e.toMap)}, toX: ${e.toX}, toY: ${e.toY} },`).join("\n");
  return `  ${JSON.stringify(m.id)}: {
    id: ${JSON.stringify(m.id)},
    name: ${JSON.stringify(m.name)},
    spawn: { x: ${m.spawn.x}, y: ${m.spawn.y} },
    terrains: {
${terr}
    },
    grid: [
${grid}
    ],
    exits: [
${exits}
    ],
    npcs: [],
  },`;
};
const bridge = gatePos.get("zhongyuan").get("jianghu");
const out = `import type { MapData } from "./types";

/**
 * 江湖世界地图集（M5+，比照《金庸群侠传》1996 的开放世界）——${Object.keys(maps).length} 张互联地图：
 * 区域大图（中原/江南/塞外/川陕）+ 城镇 + 门派 + 剧情秘境。全部为**可步行探索的空壳**：
 * 地形网格 + 出入口已就位，NPC/剧情后续按 STORY_BIBLE 逐图填充（内容即数据 ADR #3）。
 *
 * ⚠️ 本文件由 scripts/gen-world-maps.mjs 确定性生成并自校验，勿手改；改世界结构请改生成器重跑。
 * 入口：jianghu 的 (5,19) gate → zhongyuan (${bridge.inx},${bridge.iny})。
 */
export const WORLD_MAPS: Record<string, MapData> = {
${Object.values(maps).map(emitMap).join("\n")}
};
`;
fs.writeFileSync(new URL("../src/data/maps/world.ts", import.meta.url), out);
console.log(`OK: ${Object.keys(maps).length} 张图，校验通过；jianghu→zhongyuan 落点 (${bridge.inx},${bridge.iny})`);
