/**
 * M1 端到端验证：用真实浏览器按键走完整流程。
 * 前置：dev server 已启动。用法：
 *   node scripts/verify-m1.mjs http://localhost:5199 /path/to/screenshots
 */
import puppeteer from "puppeteer-core";

const URL = process.argv[2] ?? "http://localhost:5173";
const SHOT_DIR = process.argv[3] ?? ".";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = 0;
function check(label, ok, detail = "") {
  const mark = ok ? "✓" : "✗";
  console.log(`${mark} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

const debug = (page) => page.evaluate(() => window.__debug());

/** 单格移动：短按一次方向键并等移动完成 */
async function step(page, key) {
  await page.keyboard.down(key);
  await sleep(60);
  await page.keyboard.up(key);
  await sleep(230);
}

async function steps(page, key, n) {
  for (let i = 0; i < n; i++) await step(page, key);
}

async function tapUntilExplore(page, maxTaps = 12) {
  for (let i = 0; i < maxTaps; i++) {
    await page.keyboard.press("Space");
    await sleep(120);
    if ((await debug(page)).mode === "explore") return true;
  }
  return false;
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

  // 2. 走到阿牛面前对话（阿牛在 12,12；站 12,13 面朝上）
  await step(page, "ArrowUp"); // → (12,13)
  await step(page, "ArrowUp"); // 被阿牛挡住，只转向
  d = await debug(page);
  check("被 NPC 阻挡（还在 12,13）", d.player.x === 12 && d.player.y === 13);

  await page.keyboard.press("Space");
  await sleep(150);
  d = await debug(page);
  check("空格触发对话", d.mode === "dialogue");
  await page.screenshot({ path: `${SHOT_DIR}/m1-dialogue.png` });

  check("对话推进到结束", await tapUntilExplore(page));
  d = await debug(page);
  check("获得阿牛的线索", d.clues.includes("rumor-aniu-dream"), d.clues.join());

  // 3. 日志界面
  await page.keyboard.press("KeyJ");
  await sleep(150);
  d = await debug(page);
  check("J 打开日志", d.mode === "journal");
  await page.screenshot({ path: `${SHOT_DIR}/m1-journal.png` });
  await page.keyboard.press("KeyJ");
  await sleep(150);
  check("再按 J 关闭日志", (await debug(page)).mode === "explore");

  // 4. 东侧大路 → 后山小径
  await steps(page, "ArrowRight", 8); // (12,13) → (20,13)
  await steps(page, "ArrowUp", 3); //    → (20,10)
  await steps(page, "ArrowRight", 7); // → (27,10) 出口
  await sleep(400);
  d = await debug(page);
  check(
    "走上出口切换到后山小径 (2,8)",
    d.player.mapId === "houshan-path" && d.player.x === 2 && d.player.y === 8,
    JSON.stringify(d.player),
  );

  // 5. 找扫地老人（15,10），站 (15,9) 面朝下
  await steps(page, "ArrowRight", 13); // → (15,8)
  await steps(page, "ArrowDown", 1); //   → (15,9)，被老人挡在 (15,10)
  await page.keyboard.press("ArrowDown"); // 转向
  await sleep(250);
  await page.keyboard.press("Space");
  await sleep(150);
  d = await debug(page);
  check("与扫地老人对话", d.mode === "dialogue");
  check("对话推进到结束", await tapUntilExplore(page));
  d = await debug(page);
  check(
    "拿到主线线索 + met-sweeper flag",
    d.clues.includes("main-fourteen-books") && d.flags["met-sweeper"] === true,
    d.clues.join(),
  );
  await page.screenshot({ path: `${SHOT_DIR}/m1-houshan.png` });

  // 6. 存档
  await page.keyboard.press("KeyK");
  await sleep(200);
  const hasSave = await page.evaluate(
    () => window.localStorage.getItem("jinyong-heroes:save:0") !== null,
  );
  check("K 写入 localStorage 存档", hasSave);
  const savedPos = (await debug(page)).player;

  // 7. 刷新 → 新游戏 → 读档恢复
  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForFunction(() => typeof window.__debug === "function");
  await sleep(300);
  d = await debug(page);
  check("刷新后回到新游戏出生点", d.player.mapId === "xiake-island");

  await page.keyboard.press("KeyL");
  await sleep(400);
  d = await debug(page);
  check(
    "L 读档恢复位置与进度",
    d.player.mapId === savedPos.mapId &&
      d.player.x === savedPos.x &&
      d.player.y === savedPos.y &&
      d.clues.includes("rumor-aniu-dream") &&
      d.clues.includes("main-fourteen-books"),
    JSON.stringify(d.player) + " clues=" + d.clues.length,
  );
  await page.screenshot({ path: `${SHOT_DIR}/m1-loaded.png` });

  console.log(failures === 0 ? "\nM1 e2e 全部通过" : `\n${failures} 项失败`);
  process.exitCode = failures === 0 ? 0 : 1;
} finally {
  await browser.close();
}
