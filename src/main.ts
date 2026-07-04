import { Application } from "pixi.js";
import { Input } from "@/core/Input";
import { ExplorationScene } from "@/scenes/ExplorationScene";
import { xiaKeIsland } from "@/data/maps/xiaKeIsland";

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
  const scene = new ExplorationScene(
    xiaKeIsland,
    input,
    GAME_WIDTH,
    GAME_HEIGHT,
  );
  app.stage.addChild(scene.view);

  app.ticker.add((ticker) => {
    scene.update(ticker.deltaMS);
  });
}

void boot();
