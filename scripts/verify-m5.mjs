/**
 * M5 端到端验证：人物状态页 + 江湖大地图开放世界回路。
 * 前置：dev server 已启动。用法：
 *   node scripts/verify-m5.mjs http://localhost:5200 /path/to/screenshots
 *
 * 覆盖：① C 开/关人物状态页；② 无名小村南口 (14,17) 步行进入江湖大地图；
 *      ③ 在江湖沿官道步行抵达后山入口 → 切入后山小径（自由探索接入，非剧情 switchMap）。
 * 导航按键写死，改地图布局需同步更新（见 NEXT_STEPS 的 e2e 耦合提醒）。
 */
import puppeteer from "puppeteer-core";

const URL = process.argv[2] ?? "http://localhost:5173";
const SHOT_DIR = process.argv[3] ?? ".";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = 0;
function check(label, ok, detail = "") {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

const debug = (page) => page.evaluate(() => window.__debug());

async function tap(page, key) {
  await page.keyboard.press(key);
  await sleep(140);
}

async function step(page, key) {
  await page.keyboard.down(key);
  await sleep(60);
  await page.keyboard.up(key);
  await sleep(230);
}
async function seq(page, keys) {
  for (const k of keys) await step(page, k);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--window-size=1040,760"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1040, height: 760 });
  await page.goto(URL, { waitUntil: "networkidle0" });
  await page.waitForFunction(() => typeof window.__debug === "function");
  await sleep(300);

  // 1. 新游戏出生点
  let d = await debug(page);
  check(
    "新游戏出生在无名小村 (12,14)",
    d.player.mapId === "xiake-island" && d.player.x === 12 && d.player.y === 14,
    JSON.stringify(d.player),
  );

  // 2. 人物状态页：C 打开
  await tap(page, "KeyC");
  d = await debug(page);
  check("C 打开人物状态页", d.mode === "status", `mode=${d.mode}`);
  await page.screenshot({ path: `${SHOT_DIR}/m5-status.png` });
  // Esc 关闭
  await tap(page, "Escape");
  d = await debug(page);
  check("Esc 关闭状态页回探索", d.mode === "explore", `mode=${d.mode}`);

  // 3. 从出生点步行到南口 (14,17)：下下右右下 → 踩上村口切入江湖
  await seq(page, [
    "ArrowDown",
    "ArrowDown",
    "ArrowRight",
    "ArrowRight",
    "ArrowDown",
  ]);
  d = await debug(page);
  check(
    "步行南口进入江湖大地图 (18,18)",
    d.player.mapId === "jianghu" && d.player.x === 18 && d.player.y === 18,
    JSON.stringify(d.player),
  );
  await page.screenshot({ path: `${SHOT_DIR}/m5-jianghu.png` });

  // 4. 在江湖沿官道步行至后山入口 (30,11) → 切入后山小径 (2,8)
  await seq(page, [
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowUp",
    "ArrowUp",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowUp",
    "ArrowUp",
    "ArrowUp",
    "ArrowUp",
    "ArrowUp",
  ]);
  d = await debug(page);
  check(
    "江湖步行抵达后山入口并切入后山小径 (2,8)",
    d.player.mapId === "houshan-path" && d.player.x === 2 && d.player.y === 8,
    JSON.stringify(d.player),
  );
  await page.screenshot({ path: `${SHOT_DIR}/m5-houshan-from-jianghu.png` });

  console.log(failures === 0 ? "\nM5 e2e 全部通过" : `\nM5 e2e 失败 ${failures} 项`);
  process.exitCode = failures === 0 ? 0 : 1;
} finally {
  await browser.close();
}
