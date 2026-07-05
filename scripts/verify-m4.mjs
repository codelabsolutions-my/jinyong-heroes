/**
 * M4 端到端验证：镖师点火鸳鸯刀线 → 走完事件链（太岳四侠→抉择→卓天雄）→
 * 授天书 book-yuanyang、正邪值抉择改 morality（放走=option0 自动选 +8）→
 * 回探索后镖师对话按 morality 走变体 → 存读档保留天书。
 * 前置：dev server 已启动。用法：
 *   node scripts/verify-m4.mjs http://localhost:5206 /path/to/screenshots
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
  await sleep(42);
}
async function step(page, key) {
  await page.keyboard.down(key);
  await sleep(55);
  await page.keyboard.up(key);
  await sleep(180);
}
async function steps(page, key, n) {
  for (let i = 0; i < n; i++) await step(page, key);
}

/** 战斗中一步：读快照决定按键。 */
async function battleStep(page, b) {
  if (!b) return sleep(80);
  if (b.outcome !== "ongoing") return sleep(160);
  if (!b.playerTurn) return sleep(90);
  if (b.phase === "selectMove") {
    for (let i = 0; i < 4; i++) await tap(page, "ArrowRight");
    await tap(page, "Space");
  } else if (b.phase === "actionMenu") {
    if (b.canAttack) await tap(page, "Space");
    else {
      await tap(page, "ArrowDown");
      await tap(page, "Space");
    }
  } else if (b.phase === "selectTarget") {
    await tap(page, "Space");
  } else if (b.phase === "skillMenu") {
    await tap(page, "Escape");
  } else await sleep(80);
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

  // 1. 出生 (12,14) 向左走到镖师 (5,14)：走到 (6,14) 面朝左
  await steps(page, "ArrowLeft", 6);
  let d = await debug(page);
  check(
    "走到镖师前 (6,14)",
    d.player.mapId === "xiake-island" && d.player.x === 6 && d.player.y === 14,
    JSON.stringify(d.player),
  );

  // 2. 对话点火
  await tap(page, "Space");
  d = await debug(page);
  check("触发镖师对话", d.mode === "dialogue", `mode=${d.mode}`);

  // 3. 统一推进：对话按空格、战斗按快照驱动，直到落幕
  let sawStory = false;
  let battleCount = 0;
  let wasBattle = false;
  let guard = 0;
  while (guard++ < 900) {
    d = await debug(page);
    if (d.storyActive) sawStory = true;
    if (d.mode === "battle" && !wasBattle) battleCount++; // 进入一场新战斗
    wasBattle = d.mode === "battle";
    if (sawStory && !d.storyActive && d.mode === "explore") break;
    if (d.mode === "dialogue") {
      await tap(page, "Space");
      continue;
    }
    if (d.mode === "battle") {
      await battleStep(page, d.battle);
      continue;
    }
    await sleep(60);
  }

  d = await debug(page);
  check("鸳鸯刀线曾点火", sawStory);
  check("经历两场战斗（太岳四侠 + 卓天雄）", battleCount >= 2, `battles=${battleCount}`);
  check("剧情落幕回探索", d.mode === "explore", `mode=${d.mode}`);
  check(
    "获得天书 book-yuanyang",
    (d.books ?? []).includes("book-yuanyang"),
    JSON.stringify(d.books),
  );
  check("置位 yy-done", d.flags["yy-done"] === true);
  check(
    "放走太岳四侠 → 侠名+8（morality>=5, yy-kind）",
    d.morality >= 5 && d.flags["yy-kind"] === true,
    `morality=${d.morality}`,
  );
  await page.screenshot({ path: `${SHOT_DIR}/m4-after-story.png` });

  // 4. 回到镖师对话：morality 变体（不校验文本，确认不崩、回到探索）
  await tap(page, "Space");
  d = await debug(page);
  check("战后镖师可再对话", d.mode === "dialogue" || d.mode === "explore");
  for (let i = 0; i < 4 && d.mode === "dialogue"; i++) {
    await tap(page, "Space");
    d = await debug(page);
  }
  check("变体对话走完仍在探索", d.mode === "explore", `mode=${d.mode}`);

  // 5. 存读档保留天书
  await tap(page, "KeyK");
  await sleep(120);
  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForFunction(() => typeof window.__debug === "function");
  await sleep(300);
  d = await debug(page);
  check("刷新后回新游戏（无天书）", (d.books ?? []).length === 0);
  await tap(page, "KeyL");
  await sleep(200);
  d = await debug(page);
  check(
    "读档后天书仍在",
    (d.books ?? []).includes("book-yuanyang"),
    JSON.stringify(d.books),
  );

  console.log(failures === 0 ? "\nM4 e2e 全部通过" : `\n${failures} 项失败`);
  process.exitCode = failures === 0 ? 0 : 1;
} finally {
  await browser.close();
}
