// public/js/main.js
// Stage 6.1.A — Live Board Bootstrap (Variant A: build into /public/build)
// MAIN ENTRYPOINT for Vite build
// MAIN_JS_VERSION = 2026-01-10-LIVE-BOARD-A8-FINAL

import { initDebug } from "./debug.js";

// Core
import { EventBus } from "@client/core/EventBus.js";
import { GameLoop } from "@client/engine/GameLoop.js";
import { BoardState } from "@client/engine/BoardState.js";

// Canvas render
import { CanvasRenderLoop } from "@client/gameplay/canvas/CanvasRenderLoop.js";
import { CanvasBoardRenderer } from "@client/gameplay/canvas/CanvasBoardRenderer.js";
import { CanvasConfig } from "@client/gameplay/canvas/CanvasConfig.js";

console.log("[BOOT] World of Tetris — Live Board Bootstrap");
console.log('MAIN_JS_VERSION = 2026-01-10-LIVE-BOARD-A8-FINAL');

// ---------------------------------------------------------------------
// DOM root (ВАЖНО: рендерер сам создаёт canvas и аппендит в rootElement)
// ---------------------------------------------------------------------
const rootElement =
  document.getElementById("gameRoot") ||
  document.body;

// ---------------------------------------------------------------------
// Debug init (не ломаем, если выключено)
// ---------------------------------------------------------------------
initDebug?.();

// ---------------------------------------------------------------------
// Event bus + State
// ---------------------------------------------------------------------
const eventBus = new EventBus();

// BoardState содержит логику спавна/гравитации/локдауна и т.п.
const boardState = new BoardState({
  width: 10,
  height: 20,
});

// CanvasBoardRenderer ожидает boardSystem.getBoardSnapshot() для первичного init.
// Делаем тонкий адаптер вокруг boardState.
// ИСПРАВЛЕНИЕ: BoardState использует метод clone(), а не getBoardSnapshot()
const boardSystem = {
  getBoardSnapshot: () => boardState.clone(),
};

// ---------------------------------------------------------------------
// Renderer + RenderLoop
// ---------------------------------------------------------------------
const canvasConfig = (typeof CanvasConfig === 'function') ? new CanvasConfig() : CanvasConfig;
const renderLoop = new CanvasRenderLoop();

const renderer = new CanvasBoardRenderer({
  rootElement,
  eventBus,
  boardSystem,
  canvasConfig,
  renderLoop,
});

// зарегистрировать рендерер в render loop
renderLoop.register(renderer);

// ---------------------------------------------------------------------
// Helpers: публикуем снапшоты в renderer через event bus
// ---------------------------------------------------------------------
function publishSnapshots() {
  // BOARD
  eventBus.emit("BOARD_UPDATED", boardState.clone());

  // ACTIVE PIECE
  eventBus.emit("PIECE_UPDATED", boardState.getActivePieceSnapshot());

  // GHOST
  eventBus.emit("GHOST_UPDATED", boardState.getGhostPieceSnapshot());
}

// Первичный рендер
publishSnapshots();

// ---------------------------------------------------------------------
// Input handling (минимально необходимый слой управления)
// ---------------------------------------------------------------------
const inputState = {
  softDrop: false,
};

function onKeyDown(e) {
  // не даём странице скроллиться стрелками/пробелом
  const blockKeys = ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "];
  if (blockKeys.includes(e.key)) e.preventDefault();

  switch (e.code) {
    case "ArrowLeft":
      boardState.move(-1);
      publishSnapshots();
      break;

    case "ArrowRight":
      boardState.move(1);
      publishSnapshots();
      break;

    case "ArrowUp":
    case "KeyX":
      boardState.rotate(1);
      publishSnapshots();
      break;

    case "KeyZ":
      boardState.rotate(-1);
      publishSnapshots();
      break;

    case "ArrowDown":
      inputState.softDrop = true;
      break;

    case "Space":
      boardState.hardDrop();
      publishSnapshots();
      break;

    case "KeyC":
      boardState.holdPiece();
      publishSnapshots();
      break;
  }
}

function onKeyUp(e) {
  if (e.code === "ArrowDown") {
    inputState.softDrop = false;
  }
}

window.addEventListener("keydown", onKeyDown, { passive: false });
window.addEventListener("keyup", onKeyUp, { passive: true });

// ---------------------------------------------------------------------
// Main game loop: tick board + publish
// ---------------------------------------------------------------------
const gameLoop = new GameLoop({
  tickRate: 60,
});

gameLoop.onTick = (dt) => {
  // gameplay tick
  boardState.update(dt, {
    softDrop: inputState.softDrop,
  });

  // push updates to renderer
  publishSnapshots();

  // УДАЛЕНО: renderLoop.tick(dt) - этого метода нет!
  // CanvasRenderLoop работает автоматически через requestAnimationFrame
};

gameLoop.start();

console.log("[BOOT] Live Board started successfully");