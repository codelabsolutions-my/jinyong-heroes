/**
 * M5 结局 e2e（ADR #33）：从新游戏玩到一个结局——通关鸳鸯刀线 + 射雕线（集齐 2 天书），
 * 触发「江湖初程」结局画面。这是第一个"从开局玩到结局"的完整流程。
 * 用法：node scripts/verify-ending.mjs http://localhost:5203 /shots
 */
import puppeteer from "puppeteer-core";
const URL = process.argv[2] ?? "http://localhost:5173";
const SHOT_DIR = process.argv[3] ?? ".";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (l, ok, d = "") => { console.log(`${ok ? "✓" : "✗"} ${l}${d ? ` — ${d}` : ""}`); if (!ok) failures++; };
const debug = (p) => p.evaluate(() => window.__debug());
async function tap(p, k) { await p.keyboard.press(k); await sleep(42); }
async function step(p, k) { await p.keyboard.down(k); await sleep(55); await p.keyboard.up(k); await sleep(180); }
async function steps(p, k, n) { for (let i = 0; i < n; i++) await step(p, k); }
async function battleStep(p, b) {
  if (!b) return sleep(80);
  if (b.outcome !== "ongoing") return sleep(160);
  if (!b.playerTurn) return sleep(90);
  if (b.phase === "selectMove") { for (let i = 0; i < 4; i++) await tap(p, "ArrowRight"); await tap(p, "Space"); }
  else if (b.phase === "actionMenu") { if (b.canAttack) await tap(p, "Space"); else { await tap(p, "ArrowDown"); await tap(p, "Space"); } }
  else if (b.phase === "selectTarget") await tap(p, "Space");
  else if (b.phase === "skillMenu") await tap(p, "Escape");
  else await sleep(80);
}

/** 推进当前剧情线到落幕（回探索）或结局画面出现。返回 "explore" | "ending" | "timeout"。 */
async function playStory(page, guardMax = 2000) {
  let sawStory = false, guard = 0;
  while (guard++ < guardMax) {
    const d = await debug(page);
    if (d.mode === "ending") return "ending";
    if (d.storyActive) sawStory = true;
    if (sawStory && !d.storyActive && d.mode === "explore") return "explore";
    if (d.mode === "storyChoice") { await tap(page, "Space"); continue; } // 确认默认支
    if (d.mode === "dialogue") { await tap(page, "Space"); continue; }
    if (d.mode === "battle") { await battleStep(page, d.battle); continue; }
    await sleep(60);
  }
  return "timeout";
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--window-size=1040,760"] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1040, height: 760 });
  await page.goto(URL, { waitUntil: "networkidle0" });
  await page.waitForFunction(() => typeof window.__debug === "function");
  await sleep(300);

  // 1. 鸳鸯刀线（从出生左行到镖师 (6,14)）
  await steps(page, "ArrowLeft", 6);
  await tap(page, "Space");
  let r = await playStory(page);
  let d = await debug(page);
  check("鸳鸯刀线通关，得 book-yuanyang", (d.books ?? []).includes("book-yuanyang"), `${r} ${JSON.stringify(d.books)}`);

  // 2. 射雕线（从镖师处右行到说书先生 (13,14)）
  await steps(page, "ArrowRight", 7);
  d = await debug(page);
  check("走到说书先生前 (13,14)", d.player.mapId === "xiake-island" && d.player.x === 13 && d.player.y === 14, JSON.stringify(d.player));
  await tap(page, "Space");
  r = await playStory(page);
  d = await debug(page);
  check("射雕线通关，得 book-shediao（集齐 2 天书）", (d.books ?? []).includes("book-shediao") && d.books.length >= 2, `${r} ${JSON.stringify(d.books)}`);

  // 3. 集齐两部天书 → 结局自动触发（selectTriggeredEvent minBooks:2）
  for (let i = 0; i < 20 && d.mode !== "ending"; i++) { await sleep(120); d = await debug(page); }
  check("集齐两部天书触发结局画面", d.mode === "ending" && d.ending === "jianghu-chucheng", `mode=${d.mode} ending=${d.ending}`);
  await page.screenshot({ path: `${SHOT_DIR}/ending.png` });

  // 4. 空格结束结局，回探索；结局事件置完成 flag（不重复触发）
  await tap(page, "Space");
  d = await debug(page);
  check("结局画面结束回探索", d.mode === "explore", `mode=${d.mode}`);
  check("结局事件置完成 flag", d.flags["story-done:ending-first-arc"] === true || Object.keys(d.flags).some((f) => f.includes("ending-first-arc")), JSON.stringify(Object.keys(d.flags).filter((f) => f.includes("ending"))));

  console.log(failures === 0 ? "\n结局 e2e 全部通过（从开局玩到一个结局）" : `\n结局 e2e 失败 ${failures} 项`);
  process.exitCode = failures === 0 ? 0 : 1;
} finally {
  await browser.close();
}
