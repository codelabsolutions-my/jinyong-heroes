import { Application } from "pixi.js";
import { Game } from "@/core/Game";
import { Input } from "@/core/Input";

const GAME_WIDTH = 960;
const GAME_HEIGHT = 640;

async function boot() {
  const app = new Application();
  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    background: 0x0d0b08,
    antialias: false, // 像素风
  });

  document.getElementById("app")!.appendChild(app.canvas);

  const input = new Input();
  const game = new Game(input, window.localStorage, GAME_WIDTH, GAME_HEIGHT);
  app.stage.addChild(game.view);

  app.ticker.add((ticker) => {
    game.update(ticker.deltaMS);
  });

  // e2e 验证脚本用的调试探针（scripts/verify-m1.mjs、verify-m2.mjs）
  (window as unknown as Record<string, unknown>).__debug = () => ({
    mode: game.mode,
    player: { ...game.state.player },
    clues: [...game.state.clues],
    flags: { ...game.state.flags },
    books: [...game.state.books],
    morality: game.state.morality,
    party: [...game.state.party],
    reputation: { ...game.state.reputation },
    storyActive: game.isStoryActive,
    storyChoice: game.storyChoiceSnapshot(),
    battle: game.battleSnapshot(),
  });
}

void boot();
