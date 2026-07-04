/**
 * M2 端到端验证：走到强盗 → 对话触发战斗 → 键盘打完一整场 → 回到探索胜利。
 * 前置：dev server 已启动。用法：
 *   node scripts/verify-m2.mjs http://localhost:5200 /path/to/screenshots
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
  await sleep(55);
}

/** 探索层单格移动：短按方向键并等移动动画 */
async function step(page, key) {
  await page.keyboard.down(key);
  await sleep(60);
  await page.keyboard.up(key);
  await sleep(230);
}
async function steps(page, key, n) {
  for (let i = 0; i < n; i++) await step(page, key);
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

  // 1. 走到后山小径
  await step(page, "ArrowUp"); // (12,14)→(12,13)
  await steps(page, "ArrowRight", 8); // →(20,13)
  await steps(page, "ArrowUp", 3); // →(20,10)
  await steps(page, "ArrowRight", 7); // →(27,10) 出口 → houshan(2,8)
  await sleep(400);
  let d = await debug(page);
  check(
    "到达后山小径 (2,8)",
    d.player.mapId === "houshan-path" && d.player.x === 2 && d.player.y === 8,
    JSON.stringify(d.player),
  );

  // 2. 走到强盗 (8,8) 面前（站 7,8 面朝右）
  await steps(page, "ArrowRight", 5); // (2,8)→(7,8)，被强盗挡在 (8,8)
  d = await debug(page);
  check(
    "站到强盗面前 (7,8)",
    d.player.x === 7 && d.player.y === 8,
    JSON.stringify(d.player),
  );

  // 3. 对话触发战斗
  await tap(page, "Space"); // 开始对话
  d = await debug(page);
  check("空格触发对话", d.mode === "dialogue");
  for (let i = 0; i < 8 && d.mode === "dialogue"; i++) {
    await tap(page, "Space");
    d = await debug(page);
  }
  check("对话结束进入战斗", d.mode === "battle", `mode=${d.mode}`);
  await sleep(200);
  await page.screenshot({ path: `${SHOT_DIR}/m2-battle-open.png` });

  // 4. 键盘打完一整场（状态感知驱动）
  let shotTarget = false;
  let guard = 0;
  while (guard++ < 500) {
    d = await debug(page);
    if (d.mode !== "battle") break;
    const b = d.battle;
    if (!b) {
      await sleep(100);
      continue;
    }
    if (b.outcome !== "ongoing") {
      await sleep(200); // 胜负横幅停留
      continue;
    }
    if (b.activeSide === "enemy") {
      await sleep(180); // 敌方自动回合
      continue;
    }
    // 我方回合
    if (b.phase === "selectMove") {
      for (let i = 0; i < 4; i++) await tap(page, "ArrowRight");
      await tap(page, "Space"); // 提交移动 → 行动菜单
    } else if (b.phase === "actionMenu") {
      if (b.canAttack) {
        await tap(page, "Space"); // 攻击 → 选目标
      } else {
        await tap(page, "ArrowDown"); // → 待机
        await tap(page, "Space");
      }
    } else if (b.phase === "selectTarget") {
      if (!shotTarget) {
        await page.screenshot({ path: `${SHOT_DIR}/m2-target.png` });
        shotTarget = true;
      }
      await tap(page, "Space"); // 确认目标出手
    } else if (b.phase === "skillMenu") {
      await tap(page, "Escape");
    } else {
      await sleep(80);
    }
  }

  d = await debug(page);
  check("战斗结束回到探索", d.mode === "explore", `mode=${d.mode}`);
  check(
    "胜利并置 battle-won flag",
    d.flags["battle-won:houshan-bandits"] === true,
    JSON.stringify(Object.keys(d.flags)),
  );
  await page.screenshot({ path: `${SHOT_DIR}/m2-after-victory.png` });

  // 5. 战后再与强盗对话走"饶命"变体、不再触发战斗
  await tap(page, "Space");
  d = await debug(page);
  check("战后对话不再进战斗", d.mode === "dialogue" || d.mode === "explore");
  for (let i = 0; i < 4 && d.mode === "dialogue"; i++) {
    await tap(page, "Space");
    d = await debug(page);
  }
  check(
    "对话走完仍在探索（未再触发战斗）",
    d.mode === "explore",
    `mode=${d.mode}`,
  );

  console.log(failures === 0 ? "\nM2 e2e 全部通过" : `\n${failures} 项失败`);
  process.exitCode = failures === 0 ? 0 : 1;
} finally {
  await browser.close();
}
