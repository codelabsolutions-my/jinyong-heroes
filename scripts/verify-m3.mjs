/**
 * M3 端到端验证：说书先生点火射雕线 → 走完事件链（黄河四鬼战 + 欧阳锋战）
 * → 洪七公授天书 → 回探索，books 含 book-shediao、sd-done 置位 → 存读档保留天书。
 * 前置：dev server 已启动。用法：
 *   node scripts/verify-m3.mjs http://localhost:5203 /path/to/screenshots
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
async function step(page, key) {
  await page.keyboard.down(key);
  await sleep(60);
  await page.keyboard.up(key);
  await sleep(230);
}
async function steps(page, key, n) {
  for (let i = 0; i < n; i++) await step(page, key);
}

/** 战斗中一步：读快照决定按键。返回后由外层重新取快照。 */
async function battleStep(page, b) {
  if (!b) {
    await sleep(100);
    return;
  }
  if (b.outcome !== "ongoing") {
    await sleep(200); // 胜负横幅停留
    return;
  }
  if (!b.playerTurn) {
    await sleep(140); // 敌方 / 战友军自动回合
    return;
  }
  // 玩家亲操回合
  if (b.phase === "selectMove") {
    for (let i = 0; i < 4; i++) await tap(page, "ArrowRight"); // 朝敌方靠拢
    await tap(page, "Space"); // 确认移动 → 行动菜单
  } else if (b.phase === "actionMenu") {
    if (b.canAttack) {
      await tap(page, "Space"); // 攻击 → 选目标
    } else {
      await tap(page, "ArrowDown"); // → 待机（够不到就待机，回合照样流逝）
      await tap(page, "Space");
    }
  } else if (b.phase === "selectTarget") {
    await tap(page, "Space"); // 确认出手
  } else if (b.phase === "skillMenu") {
    await tap(page, "Escape");
  } else {
    await sleep(80);
  }
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

  // 1. 走到说书先生 (14,14)：出生 (12,14) 右移两格（第二步撞 NPC 只转向）
  await steps(page, "ArrowRight", 2);
  let d = await debug(page);
  check(
    "站到说书先生前 (13,14)",
    d.player.mapId === "xiake-island" && d.player.x === 13 && d.player.y === 14,
    JSON.stringify(d.player),
  );

  // 2. 对话点火
  await tap(page, "Space");
  d = await debug(page);
  check("触发说书先生对话", d.mode === "dialogue", `mode=${d.mode}`);

  // 3. 统一推进：对话连按空格、战斗按快照驱动，直到剧情落幕
  let sawStory = false;
  let sawHuanghe = false;
  let sawOuyang = false;
  let shotHuanghe = false;
  let shotOuyang = false;
  let guard = 0;
  while (guard++ < 4000) {
    d = await debug(page);
    if (d.storyActive) sawStory = true;

    // 落幕：曾进过剧情、现已退出且回到探索
    if (sawStory && !d.storyActive && d.mode === "explore") break;

    if (d.mode === "dialogue") {
      await tap(page, "Space");
      continue;
    }
    if (d.mode === "battle") {
      const b = d.battle;
      const enemies = b?.combatants.filter((c) => c.side === "enemy") ?? [];
      if (enemies.length >= 3) {
        sawHuanghe = true;
        if (!shotHuanghe) {
          await page.screenshot({ path: `${SHOT_DIR}/m3-huanghe.png` });
          shotHuanghe = true;
        }
      } else if (enemies.length === 1) {
        sawOuyang = true;
        if (!shotOuyang) {
          await page.screenshot({ path: `${SHOT_DIR}/m3-ouyangfeng.png` });
          shotOuyang = true;
        }
      }
      await battleStep(page, b);
      continue;
    }
    await sleep(80);
  }

  d = await debug(page);
  check("射雕线曾被点火（storyActive 曾为真）", sawStory);
  check("经历了黄河四鬼战", sawHuanghe);
  check("经历了欧阳锋战", sawOuyang);
  check("剧情落幕回到探索", d.mode === "explore", `mode=${d.mode}`);
  check("storyActive 归位", d.storyActive === false);
  check(
    "获得天书 book-shediao",
    Array.isArray(d.books) && d.books.includes("book-shediao"),
    JSON.stringify(d.books),
  );
  check("置位 sd-done", d.flags["sd-done"] === true);
  await page.screenshot({ path: `${SHOT_DIR}/m3-after-story.png` });

  // 4. 存读档保留天书：存档 → 刷新（回新游戏）→ 读档 → 天书仍在
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
    (d.books ?? []).includes("book-shediao"),
    JSON.stringify(d.books),
  );

  console.log(failures === 0 ? "\nM3 e2e 全部通过" : `\n${failures} 项失败`);
  process.exitCode = failures === 0 ? 0 : 1;
} finally {
  await browser.close();
}
