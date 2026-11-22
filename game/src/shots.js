// Velvet Midnight — deterministic screenshot scenes.
// One job: given a shot name, freeze the game into its best-looking moment so
// a screenshot shows the heist at its peak. The game itself renders the scene;
// this file only poses it. ?shot=cover&seed=1 is the cover frame.
import { GUARD_VISION_RANGE } from './config.js';
import { angleTo } from './world.js';

export function applyShot(game, shotName, seed) {
  const levelIndex = shotName === 'casino' ? 2 : 0;
  game.startLevel(levelIndex);
  game.screen = 'playing';
  game.frozen = true;
  game.time = 12.5 + seed * 0.7;

  if (shotName === 'start' || shotName === 'title') {
    game.screen = 'title';
    game.time = 3.2;
    return;
  }

  if (shotName === 'cover' || shotName === 'play') {
    // Mid-heist: the thief crosses the middle hall toward the vault, a guard's
    // cone sweeps just past, a second guard patrols the right wing, a camera
    // watches the vault door, the loot glows, and the alarm is half up.
    game.player.x = 640;
    game.player.y = 470;
    game.player.facing = -Math.PI / 2;
    game.alarm = 38;
    game.peakAlarm = 38;
    game.elapsed = 47;
    game.score = 400;
    game.loot[0].taken = true; // the painting is already in the bag
    poseGuard(game.guards[0], 520, 330, angleTo(520, 330, 700, 500), 'patrol', 0.65);
    poseGuard(game.guards[1], 950, 300, Math.PI, 'investigate', 0.2);
    game.guards[1].target = { x: 1050, y: 470 };
    game.cameras[0].angle = Math.PI / 2 + 0.4;
    game.cameras[1].angle = Math.PI + 0.25;
    game.bannerLeft = 0; // keep the vault label clear in the cover frame
    return;
  }

  if (shotName === 'escape' || shotName === 'end' || shotName === 'getaway') {
    // The payoff: every piece taken, the van open, the thief one step from it
    // while a guard gives chase and the alarm burns.
    for (const item of game.loot) item.taken = true;
    game.exitOpen = true;
    game.player.x = 640;
    game.player.y = 600;
    game.player.facing = Math.PI / 2;
    game.alarm = 82;
    game.peakAlarm = 82;
    game.elapsed = 118;
    game.score = 2650;
    poseGuard(game.guards[0], 640, 470, Math.PI / 2, 'chase', 1);
    poseGuard(game.guards[1], 900, 560, Math.PI * 0.75, 'chase', 1);
    game.cameras[0].angle = Math.PI / 2 - 0.3;
    game.cameras[1].disabledLeft = 3;
    game.seenNow = true;
    game.banner = 'GETAWAY! Reach the van!';
    game.bannerLeft = 1;
    return;
  }

  if (shotName === 'busted' || shotName === 'caught') {
    // The fair caught moment: the guard is on the thief, alarm at 100.
    game.player.x = 700;
    game.player.y = 420;
    game.player.facing = Math.PI;
    game.alarm = 100;
    game.peakAlarm = 100;
    game.elapsed = 63;
    game.score = 650;
    game.loot[0].taken = true;
    poseGuard(game.guards[0], 700, 396, Math.PI / 2, 'chase', 1);
    poseGuard(game.guards[1], 880, 300, Math.PI, 'patrol', 0.5);
    game.cameras[0].angle = Math.PI / 2;
    game.bustedReason = 'A guard caught you in the open — the cone saw you coming.';
    game.screen = 'busted';
    return;
  }

  // Unknown shot name: fall back to the cover pose.
  applyShot(game, 'cover', seed);
}

function poseGuard(guard, x, y, facing, state, suspicion) {
  guard.x = x;
  guard.y = y;
  guard.facing = facing;
  guard.state = state;
  guard.suspicion = suspicion;
  guard.bobPhase = 0.4;
}

// Keep the import used: the cone length in the cover pose matches the guard's
// real vision range, so the shot shows what the game actually sees.
export const COVER_CONE_RANGE = GUARD_VISION_RANGE;
