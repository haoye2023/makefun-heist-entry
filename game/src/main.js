// Velvet Midnight — the game itself: state, the loop, the alarm and the win.
// One job: own the screens (title / playing / busted / win / complete), run
// the update step, and glue the modules together. It draws through render.js
// and never draws a pixel itself.
import {
  ALARM_FALL_PER_SECOND, ALARM_LOCKDOWN, ALARM_RISE_PER_SECOND,
  CANVAS_H, CANVAS_W, HUD_H, PLAYER_R, PLAYER_SPEED, RANK_BY_PEAK_ALARM,
} from './config.js';
import { LEVELS } from './levels.js';
import { makeWorld, moveCircle } from './world.js';
import { cameraSeesPlayer, makeCamera, updateCamera } from './cameras.js';
import { canGuardSee, guardCatchesPlayer, makeGuard, updateGuard } from './guards.js';
import { lootTakenValue, makeLoot, requiredLootTaken, tryGrabLoot } from './loot.js';
import { makeGadgets, useDisguise, useEmp, useNoise } from './gadgets.js';
import { makeInput, movementVector } from './input.js';
import { makeAudio } from './audio.js';
import { drawGame } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const game = {
  screen: 'title', // title | playing | busted | win | complete
  levelIndex: 0,
  level: LEVELS[0],
  world: null,
  player: null,
  guards: [],
  cameras: [],
  loot: [],
  gadgets: null,
  noises: [],
  alarm: 0,
  peakAlarm: 0,
  elapsed: 0,
  score: 0,
  totalHaul: 0,
  totalScore: 0,
  time: 0,
  frozen: false,
  moving: false,
  seenNow: false,
  seenByCamera: false,
  exitOpen: false,
  banner: '',
  bannerLeft: 0,
  bustedReason: '',
  rank: RANK_BY_PEAK_ALARM[0],
  requiredLootName: '',
};

const input = makeInput(canvas);
const audio = makeAudio();

// shots.js poses scenes through the game object, so it reaches startLevel here.
game.startLevel = startLevel;

export function startLevel(levelIndex) {
  game.levelIndex = levelIndex;
  game.level = LEVELS[levelIndex];
  game.world = makeWorld(game.level);
  game.player = {
    x: game.level.start.x,
    y: game.level.start.y,
    facing: -Math.PI / 2,
    disguiseLeft: 0,
    hidden: false,
  };
  game.guards = game.level.guards.map((def, i) => makeGuard(def, i));
  game.cameras = game.level.cameras.map((def, i) => makeCamera(def, i));
  game.loot = game.level.loot.map(makeLoot);
  game.gadgets = makeGadgets();
  game.noises = [];
  game.alarm = 0;
  game.peakAlarm = 0;
  game.elapsed = 0;
  game.score = 0;
  game.seenNow = false;
  game.seenByCamera = false;
  game.exitOpen = false;
  game.banner = game.level.name;
  game.bannerLeft = 3;
  game.bustedReason = '';
  game.rank = RANK_BY_PEAK_ALARM[0];
  game.requiredLootName = game.level.loot.find((item) => item.required).name;
  game.screen = 'playing';
  announce(`${game.level.name}. Steal the ${game.requiredLootName}, then reach the getaway van.`);
}

function startGame() {
  game.totalHaul = 0;
  game.totalScore = 0;
  startLevel(0);
}

function bust(reason) {
  game.screen = 'busted';
  game.bustedReason = reason;
  audio.caught();
  announce(`Busted. ${reason}`);
}

function winLevel() {
  const haul = lootTakenValue(game.loot);
  const timeBonus = Math.max(0, Math.round((game.level.par - game.elapsed) * 5));
  const alarmPenalty = Math.round(game.peakAlarm * 4);
  const levelScore = haul + timeBonus - alarmPenalty;
  game.score = levelScore;
  game.totalHaul += haul;
  game.totalScore += levelScore;
  game.rank = RANK_BY_PEAK_ALARM.find((r) => game.peakAlarm <= r.max) ?? RANK_BY_PEAK_ALARM[2];
  game.screen = 'win';
  audio.win();
  announce(`Clean getaway! Haul $${haul}, rank ${game.rank.name}.`);
}

function completeGame() {
  game.screen = 'complete';
  announce(`All three jobs done. Total haul $${game.totalHaul}.`);
}

function announce(text) {
  if (statusEl) statusEl.textContent = text;
}

function updatePlaying(dt) {
  game.elapsed += dt;
  if (game.player.disguiseLeft > 0) game.player.disguiseLeft -= dt;
  if (game.bannerLeft > 0) game.bannerLeft -= dt;

  // Movement.
  const move = movementVector(input);
  game.moving = move.x !== 0 || move.y !== 0;
  if (game.moving) {
    const speed = PLAYER_SPEED * (game.player.disguiseLeft > 0 ? 0.7 : 1);
    const nx = move.x * speed * dt;
    const ny = move.y * speed * dt;
    moveCircle(game.world, game.player, PLAYER_R, nx, ny);
    game.player.facing = Math.atan2(move.y, move.x);
    if (Math.random() < dt * 2) audio.step();
  }

  // Noise rings fade; guards only hear a fresh toss.
  let freshNoise = null;
  for (const noise of game.noises) {
    noise.ttl -= dt;
    if (noise.ttl > 0.9) freshNoise = noise;
  }
  game.noises = game.noises.filter((noise) => noise.ttl > 0);

  // Cameras sweep; guards patrol, investigate and chase.
  for (const camera of game.cameras) updateCamera(camera, dt, game.time);
  for (const guard of game.guards) {
    updateGuard(guard, dt, game.world, game.player, freshNoise, game.alarm >= ALARM_LOCKDOWN);
  }

  // Who sees the thief right now?
  let seenByGuard = false;
  for (const guard of game.guards) {
    if (guard.suspicion >= 1 && canGuardSee(guard, game.player, game.world)) seenByGuard = true;
  }
  game.seenByCamera = false;
  for (const camera of game.cameras) {
    if (cameraSeesPlayer(camera, game.player, game.world)) game.seenByCamera = true;
  }
  const wasSeen = game.seenNow;
  game.seenNow = seenByGuard || game.seenByCamera;
  if (game.seenNow && !wasSeen) audio.spotted();

  // The alarm climbs while seen, falls while hidden. At 100 the house locks
  // down and every guard hunts the thief.
  if (game.seenNow) {
    const rate = ALARM_RISE_PER_SECOND * (game.seenByCamera ? 0.7 : 1);
    game.alarm = Math.min(ALARM_LOCKDOWN, game.alarm + rate * dt);
  } else {
    game.alarm = Math.max(0, game.alarm - ALARM_FALL_PER_SECOND * dt);
  }
  game.peakAlarm = Math.max(game.peakAlarm, game.alarm);

  // Caught: a chasing guard touches the thief.
  for (const guard of game.guards) {
    if (guard.state === 'chase' && guardCatchesPlayer(guard, game.player)) {
      bust('A guard caught you in the open — the cone saw you coming.');
      return;
    }
  }

  // Loot: walk over it to pocket it.
  tryGrabLoot(game.loot, game.player, (item) => {
    audio.pickup();
    announce(`Pocketed the ${item.name}, worth $${item.value}.`);
    if (item.required) {
      game.banner = `The ${item.name} is yours — get to the van!`;
      game.bannerLeft = 3;
    }
  });

  // The van opens once the job's prize is in the bag.
  game.exitOpen = requiredLootTaken(game.loot);

  // Getaway: step into the van with the prize.
  if (game.exitOpen) {
    const e = game.level.exit;
    if (game.player.x > e.x && game.player.x < e.x + e.w && game.player.y > e.y - 6 && game.player.y < e.y + e.h) {
      winLevel();
    }
  }
}

function useGadget(kind) {
  if (game.screen !== 'playing') return;
  if (kind === 'emp') {
    if (useEmp(game.gadgets, game.cameras, () => audio.emp())) {
      game.banner = 'EMP pulse — cameras blind for 7 seconds';
      game.bannerLeft = 2;
    }
  } else if (kind === 'disguise') {
    if (useDisguise(game.gadgets, game.player, () => {})) {
      game.banner = 'Disguise on — guards will look straight through you';
      game.bannerLeft = 2;
    }
  }
}

function tossCoinAt(point) {
  if (game.screen !== 'playing') return;
  // The click lands in canvas pixels; the world starts below the HUD strip.
  const noise = useNoise(game.gadgets, point.x, point.y - HUD_H, () => audio.coin());
  if (noise) game.noises.push(noise);
}

input.onKey = (code) => {
  audio.ensure();
  if (code === 'Enter' && game.screen === 'title') {
    startGame();
    return;
  }
  if (game.screen === 'title') return;
  if (code === 'KeyR' && (game.screen === 'busted' || game.screen === 'win')) {
    startLevel(game.levelIndex);
    return;
  }
  if (code === 'KeyM' && game.screen !== 'playing' && game.screen !== 'title') {
    game.screen = 'title';
    return;
  }
  if (code === 'KeyN' && game.screen === 'win' && game.levelIndex + 1 < LEVELS.length) {
    startLevel(game.levelIndex + 1);
    return;
  }
  if (code === 'KeyN' && game.screen === 'win') {
    completeGame();
    return;
  }
  if (game.screen !== 'playing') return;
  if (code === 'Digit1') useGadget('emp');
  if (code === 'Digit2') useGadget('disguise');
  if (code === 'Digit3') tossCoinAt({ x: input.mouseX, y: input.mouseY });
};

input.onClick = (point) => {
  audio.ensure();
  if (game.screen === 'playing') tossCoinAt(point);
};

let lastTime = 0;
function frame(timestamp) {
  const dt = Math.min(0.05, (timestamp - lastTime) / 1000 || 0);
  lastTime = timestamp;
  if (!game.frozen) {
    game.time += dt;
    if (game.screen === 'playing') updatePlaying(dt);
    if (game.screen === 'title' || game.screen === 'busted' || game.screen === 'win') {
      // The room still breathes behind the overlay screens.
      for (const camera of game.cameras) updateCamera(camera, dt, game.time);
      for (const guard of game.guards) updateGuard(guard, dt, game.world, game.player, null, false);
    }
  }
  drawGame(ctx, game);
  requestAnimationFrame(frame);
}

// Boot: the title screen shows the first job's room behind it.
startLevel(0);
game.screen = 'title';

// A handle for play-testing from the console (and for the screenshot helper):
// window.velvetMidnight exposes the live game state, read-only in practice.
window.velvetMidnight = game;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  applyShot(game, shot, Number(params.get('seed') ?? 1) || 1);
  drawGame(ctx, game);
} else {
  requestAnimationFrame(frame);
}
