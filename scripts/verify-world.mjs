/**
 * 世界地图集 e2e：从无名小村 → 江湖 → 中原大地图，证明世界地图集在引擎里可进可走。
 * （42 张新图的内部合法性/连通由 content.test 保证；此处证"入口在引擎里真的能走进去"。）
 * 用法：node scripts/verify-world.mjs http://localhost:5202 /shots
 */
import puppeteer from "puppeteer-core";
const URL = process.argv[2] ?? "http://localhost:5173";
const SHOT_DIR = process.argv[3] ?? ".";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (l, ok, d = "") => { console.log(`${ok ? "✓" : "✗"} ${l}${d ? ` — ${d}` : ""}`); if (!ok) failures++; };
const debug = (p) => p.evaluate(() => window.__debug());
async function step(p, k) { await p.keyboard.down(k); await sleep(60); await p.keyboard.up(k); await sleep(230); }
async function seq(p, ks) { for (const k of ks) await step(p, k); }

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--window-size=1040,760"] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1040, height: 760 });
  await page.goto(URL, { waitUntil: "networkidle0" });
  await page.waitForFunction(() => typeof window.__debug === "function");
  await sleep(300);

  // 1. 出生 → 南口进江湖（同 verify-m5）
  await seq(page, ["ArrowDown", "ArrowDown", "ArrowRight", "ArrowRight", "ArrowDown"]);
  let d = await debug(page);
  check("进入江湖大地图 (18,18)", d.player.mapId === "jianghu" && d.player.x === 18 && d.player.y === 18, JSON.stringify(d.player));

  // 2. 江湖底部西行到中原入口 (5,19)：13×Left 到 (5,18)，Down 踩 gate → zhongyuan (2,2)
  await seq(page, Array(13).fill("ArrowLeft"));
  d = await debug(page);
  check("走到中原入口上方 (5,18)", d.player.mapId === "jianghu" && d.player.x === 5 && d.player.y === 18, JSON.stringify(d.player));
  await step(page, "ArrowDown");
  d = await debug(page);
  check("踏入中原大地图 zhongyuan (2,2)", d.player.mapId === "zhongyuan" && d.player.x === 2 && d.player.y === 2, JSON.stringify(d.player));
  await page.screenshot({ path: `${SHOT_DIR}/world-zhongyuan.png` });

  // 3. 在中原大地图内能走动（沿凿好的路进内部）
  const before = `${d.player.x},${d.player.y}`;
  await seq(page, ["ArrowDown", "ArrowRight", "ArrowRight"]);
  d = await debug(page);
  check("中原大地图内可自由行走", d.player.mapId === "zhongyuan" && `${d.player.x},${d.player.y}` !== before, JSON.stringify(d.player));

  console.log(failures === 0 ? "\n世界地图集 e2e 全部通过" : `\n世界地图集 e2e 失败 ${failures} 项`);
  process.exitCode = failures === 0 ? 0 : 1;
} finally {
  await browser.close();
}
