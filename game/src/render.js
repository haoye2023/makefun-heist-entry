// Velvet Midnight — everything the player sees.
// One job: draw the room, the cones, the people, the loot and the HUD on the
// canvas, plus the title, busted and getaway screens. No game logic lives here.
import {
  CANVAS_H, CANVAS_W, GUARD_VISION_HALF_ANGLE, GUARD_VISION_RANGE,
  CAMERA_VISION_HALF_ANGLE, CAMERA_VISION_RANGE, HUD_H, PALETTE, WORLD_H, WORLD_W,
} from './config.js';
import { lootTakenCount, lootTakenValue } from './loot.js';

export function drawGame(ctx, game) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = PALETTE.floorEdge;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.save();
  ctx.translate(0, HUD_H);
  drawFloor(ctx, game);
  drawRugs(ctx, game);
  drawExit(ctx, game);
  drawCones(ctx, game);
  drawWallsAndCrates(ctx, game);
  drawLoot(ctx, game); // after the walls, so a loot label is never buried under a crate
  drawCameras(ctx, game);
  drawGuards(ctx, game);
  drawPlayer(ctx, game);
  drawNoiseRings(ctx, game);
  ctx.restore();

  drawHud(ctx, game);
  drawBanner(ctx, game);
  drawAlarmVignette(ctx, game);
  if (game.screen === 'title') drawTitleScreen(ctx, game);
  if (game.screen === 'busted') drawBustedScreen(ctx, game);
  if (game.screen === 'win') drawWinScreen(ctx, game);
  if (game.screen === 'complete') drawCompleteScreen(ctx, game);
}

function drawFloor(ctx, game) {
  const tile = 64;
  for (let y = 0; y < WORLD_H; y += tile) {
    for (let x = 0; x < WORLD_W; x += tile) {
      const even = ((x + y) / tile) % 2 === 0;
      ctx.fillStyle = even ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(x, y, tile, tile);
    }
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= WORLD_W; x += tile) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD_H); ctx.stroke();
  }
  for (let y = 0; y <= WORLD_H; y += tile) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_W, y); ctx.stroke();
  }
  // Outer border glow: the room's edge.
  ctx.strokeStyle = PALETTE.wallLine;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, WORLD_W - 4, WORLD_H - 4);
}

function drawRugs(ctx, game) {
  for (const rug of game.level.rugs) {
    ctx.fillStyle = PALETTE.rug;
    ctx.fillRect(rug.x, rug.y, rug.w, rug.h);
    ctx.strokeStyle = PALETTE.rugEdge;
    ctx.lineWidth = 3;
    ctx.strokeRect(rug.x + 4, rug.y + 4, rug.w - 8, rug.h - 8);
  }
}

function drawWallsAndCrates(ctx, game) {
  for (const w of game.level.walls) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(w.x, w.y, w.w, 5);
    ctx.strokeStyle = PALETTE.wallLine;
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x + 1, w.y + 1, w.w - 2, w.h - 2);
  }
  for (const c of game.level.crates) {
    ctx.fillStyle = PALETTE.crate;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = PALETTE.crateTop;
    ctx.fillRect(c.x, c.y, c.w, 8);
    ctx.strokeStyle = '#3a2d1f';
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x + c.w, c.y + c.h);
    ctx.moveTo(c.x + c.w, c.y);
    ctx.lineTo(c.x, c.y + c.h);
    ctx.stroke();
  }
}

function drawExit(ctx, game) {
  const e = game.level.exit;
  const active = game.exitOpen;
  const pulse = 0.55 + 0.35 * Math.sin(game.time * 4);
  ctx.fillStyle = active ? `rgba(57, 217, 138, ${0.35 + 0.3 * pulse})` : 'rgba(57, 217, 138, 0.16)';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = active ? PALETTE.exit : PALETTE.exitDark;
  ctx.lineWidth = 3;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = active ? '#d8ffe9' : '#9fc7ae';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(active ? '◀ GETAWAY VAN — GO! ▶' : 'GETAWAY VAN (locked)', e.x + e.w / 2, e.y + e.h / 2);
  if (active) {
    ctx.fillStyle = `rgba(57, 217, 138, ${0.5 * pulse})`;
    ctx.beginPath();
    ctx.moveTo(e.x + e.w / 2, e.y - 26);
    ctx.lineTo(e.x + e.w / 2 - 10, e.y - 10);
    ctx.lineTo(e.x + e.w / 2 + 10, e.y - 10);
    ctx.closePath();
    ctx.fill();
  }
}

function drawLoot(ctx, game) {
  for (const item of game.loot) {
    if (item.taken) continue;
    const bob = Math.sin(game.time * 2.4 + item.sparkle) * 2;
    const glow = 0.5 + 0.3 * Math.sin(game.time * 3 + item.sparkle);
    ctx.save();
    ctx.translate(item.x, item.y + bob);
    ctx.fillStyle = `rgba(242, 193, 78, ${0.22 * glow})`;
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = PALETTE.gold;
    if (item.kind === 'painting') {
      ctx.fillRect(-14, -10, 28, 20);
      ctx.fillStyle = '#7d3a44';
      ctx.fillRect(-10, -6, 20, 12);
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(-14, -10, 28, 3);
    } else if (item.kind === 'gem') {
      ctx.beginPath();
      ctx.moveTo(0, -14); ctx.lineTo(12, 0); ctx.lineTo(0, 14); ctx.lineTo(-12, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath();
      ctx.moveTo(0, -14); ctx.lineTo(6, -2); ctx.lineTo(-6, -2);
      ctx.closePath();
      ctx.fill();
    } else {
      // crown: three points and a band
      ctx.beginPath();
      ctx.moveTo(-14, 8); ctx.lineTo(-14, -6); ctx.lineTo(-7, 2);
      ctx.lineTo(0, -12); ctx.lineTo(7, 2); ctx.lineTo(14, -6); ctx.lineTo(14, 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-14, 8, 28, 4);
    }
    ctx.restore();
    ctx.fillStyle = PALETTE.text;
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const labelX = Math.max(95, Math.min(CANVAS_W - 95, item.x));
    ctx.fillText(item.name, labelX, item.y + 30 + bob);
  }
}

function drawCone(ctx, x, y, facing, range, halfAngle, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, facing - halfAngle, facing + halfAngle);
  ctx.closePath();
  ctx.fill();
}

function drawCones(ctx, game) {
  for (const camera of game.cameras) {
    const hot = camera.disabledLeft <= 0 && game.seenByCamera;
    drawCone(ctx, camera.x, camera.y, camera.angle, CAMERA_VISION_RANGE,
      CAMERA_VISION_HALF_ANGLE, camera.disabledLeft > 0 ? 'rgba(120,120,120,0.10)' : (hot ? PALETTE.camConeHot : PALETTE.camCone));
  }
  for (const guard of game.guards) {
    const hot = guard.suspicion > 0.4 || guard.state === 'chase';
    drawCone(ctx, guard.x, guard.y, guard.facing, GUARD_VISION_RANGE,
      GUARD_VISION_HALF_ANGLE, hot ? PALETTE.coneHot : PALETTE.cone);
  }
}

function drawCameras(ctx, game) {
  for (const camera of game.cameras) {
    const dead = camera.disabledLeft > 0;
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.fillStyle = dead ? '#5a5a5a' : PALETTE.camera;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = dead ? '#333' : '#fff3c4';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Lens direction tick.
    ctx.strokeStyle = dead ? '#5a5a5a' : PALETTE.camera;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(camera.angle) * 16, Math.sin(camera.angle) * 16);
    ctx.stroke();
    ctx.restore();
    if (dead) {
      ctx.fillStyle = '#cfcfcf';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`EMP ${Math.ceil(camera.disabledLeft)}s`, camera.x, camera.y + 22);
    }
  }
}

function drawGuards(ctx, game) {
  for (const guard of game.guards) {
    const bob = Math.sin(guard.bobPhase) * 1.5;
    ctx.save();
    ctx.translate(guard.x, guard.y + bob);
    // Body.
    ctx.fillStyle = PALETTE.guardDark;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.guard;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    // Facing nose.
    ctx.fillStyle = '#ffd9d9';
    ctx.beginPath();
    ctx.arc(Math.cos(guard.facing) * 7, Math.sin(guard.facing) * 7, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Cap brim.
    ctx.strokeStyle = '#2b0d0d';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 14, guard.facing - 0.9, guard.facing + 0.9);
    ctx.stroke();
    ctx.restore();
    // State mark above the head: ! spotted, ? curious.
    if (guard.state === 'chase' || guard.suspicion >= 1) {
      drawMark(ctx, guard.x, guard.y - 28 + bob, '!', '#ff5b5b');
    } else if (guard.state === 'investigate' || guard.state === 'suspicious') {
      drawMark(ctx, guard.x, guard.y - 28 + bob, '?', PALETTE.gold);
    } else if (guard.suspicion > 0.05) {
      drawMark(ctx, guard.x, guard.y - 28 + bob, '!', '#ffb020', guard.suspicion);
    }
  }
}

function drawMark(ctx, x, y, text, color, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;
}

function drawPlayer(ctx, game) {
  const p = game.player;
  const bob = Math.sin(game.time * 10) * (game.moving ? 1.2 : 0);
  ctx.save();
  ctx.translate(p.x, p.y + bob);
  // Soft shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 10 - bob, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body: a thief in a teal hood with a dark mask band.
  ctx.fillStyle = PALETTE.playerDark;
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.player;
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_R - 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#10222b';
  ctx.fillRect(-8, -3, 16, 6);
  ctx.fillStyle = '#eafcff';
  ctx.beginPath();
  ctx.arc(-4, 0, 1.8, 0, Math.PI * 2);
  ctx.arc(4, 0, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // Facing tick.
  ctx.strokeStyle = '#eafcff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(p.facing) * 12, Math.sin(p.facing) * 12);
  ctx.stroke();
  ctx.restore();
  if (p.disguiseLeft > 0) {
    ctx.fillStyle = 'rgba(242, 193, 78, 0.9)';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`DISGUISE ${Math.ceil(p.disguiseLeft)}s`, p.x, p.y - 24);
  }
}

function drawNoiseRings(ctx, game) {
  for (const noise of game.noises) {
    const t = 1 - noise.ttl / 1.2;
    ctx.strokeStyle = `rgba(242, 193, 78, ${0.9 * (1 - t)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(noise.x, noise.y, 8 + t * 46, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawHud(ctx, game) {
  ctx.fillStyle = PALETTE.hudBg;
  ctx.fillRect(0, 0, CANVAS_W, HUD_H);
  ctx.strokeStyle = PALETTE.hudLine;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, HUD_H - 1);
  ctx.lineTo(CANVAS_W, HUD_H - 1);
  ctx.stroke();

  ctx.textBaseline = 'middle';
  // Left: job name and objective.
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(game.level.name, 16, 20);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '13px system-ui, sans-serif';
  const objective = game.exitOpen
    ? 'All loot is yours — reach the green getaway van!'
    : `Steal the ${game.requiredLootName}, then reach the van.`;
  ctx.fillText(objective, 16, 44);

  // Centre: loot haul.
  const value = lootTakenValue(game.loot);
  const count = lootTakenCount(game.loot);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`◆ $${value.toLocaleString('en-US')}  ·  ${count}/${game.loot.length} loot`, CANVAS_W / 2, 20);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(`TIME ${formatTime(game.elapsed)}   ·   SCORE ${game.score}`, CANVAS_W / 2, 44);

  // Right: alarm meter.
  const barX = CANVAS_W - 300;
  const barY = 14;
  const barW = 220;
  const barH = 16;
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', barX, barY + barH / 2);
  ctx.fillStyle = '#241d2e';
  ctx.fillRect(barX + 58, barY, barW - 58, barH);
  const alarmFrac = game.alarm / 100;
  ctx.fillStyle = alarmFrac < 0.4 ? PALETTE.alarmLow : alarmFrac < 0.75 ? PALETTE.alarmMid : PALETTE.alarmHigh;
  ctx.fillRect(barX + 58, barY, (barW - 58) * alarmFrac, barH);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX + 58, barY, barW - 58, barH);

  // Gadgets row, right side under the alarm — replaced by a lockdown warning
  // when the alarm is maxed, so the two never print over each other.
  if (game.alarm >= 100) {
    ctx.fillStyle = PALETTE.alarmHigh;
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LOCKDOWN! Every guard is hunting you.', barX, 50);
    return;
  }
  const gadgets = [
    { key: '1', label: 'EMP', left: game.gadgets.emp },
    { key: '2', label: 'Disguise', left: game.gadgets.disguise },
    { key: '3', label: 'Coin', left: game.gadgets.noise },
  ];
  let gx = CANVAS_W - 300;
  ctx.font = '12px system-ui, sans-serif';
  for (const g of gadgets) {
    const text = `[${g.key}] ${g.label} ×${g.left}`;
    ctx.fillStyle = g.left > 0 ? PALETTE.text : '#5a4f68';
    ctx.fillText(text, gx, 50);
    gx += ctx.measureText(text).width + 18;
  }
}

function drawBanner(ctx, game) {
  if (!game.banner || game.bannerLeft <= 0 || game.screen !== 'playing') return;
  const alpha = Math.min(1, game.bannerLeft);
  ctx.globalAlpha = alpha;
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const w = Math.min(CANVAS_W - 40, ctx.measureText(game.banner).width + 56);
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect((CANVAS_W - w) / 2, 120, w, 64);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  ctx.strokeRect((CANVAS_W - w) / 2, 120, w, 64);
  ctx.fillStyle = PALETTE.text;
  ctx.fillText(game.banner, CANVAS_W / 2, 152);
  ctx.globalAlpha = 1;
}

function drawAlarmVignette(ctx, game) {
  if (game.alarm < 55 || game.screen !== 'playing') return;
  const strength = ((game.alarm - 55) / 45) * (0.22 + 0.1 * Math.sin(game.time * 6));
  const grad = ctx.createRadialGradient(
    CANVAS_W / 2, CANVAS_H / 2, CANVAS_H * 0.35,
    CANVAS_W / 2, CANVAS_H / 2, CANVAS_H * 0.75,
  );
  grad.addColorStop(0, 'rgba(232, 75, 75, 0)');
  grad.addColorStop(1, `rgba(232, 75, 75, ${strength})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  if (game.seenNow) {
    ctx.fillStyle = '#ff5b5b';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED!', CANVAS_W / 2, HUD_H + 40);
  }
}

function drawTitleScreen(ctx, game) {
  ctx.fillStyle = 'rgba(10, 7, 14, 0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('VELVET MIDNIGHT', CANVAS_W / 2, 210);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '22px Georgia, serif';
  ctx.fillText('— a three-job gallery heist —', CANVAS_W / 2, 252);
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillStyle = PALETTE.textDim;
  const lines = [
    'Move with WASD or arrow keys. Watch the red cones: guards and cameras see what their cone touches.',
    'Grab the loot — the crowned prize is the job. Then slip out through the green getaway van.',
    'Gadgets: [1] EMP blinds cameras · [2] Disguise fools guards · [3] or click: toss a coin to lure a guard.',
    'If the alarm hits 100 the house locks down. If a guard grabs you, the job is blown.',
    '',
    'Three jobs: The Midnight Gallery · The Marble Bank · The Sapphire Casino',
  ];
  lines.forEach((line, i) => ctx.fillText(line, CANVAS_W / 2, 320 + i * 30));
  ctx.fillStyle = game.time % 1 < 0.6 ? PALETTE.text : '#8a7d68';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.fillText('Press ENTER to start the first job', CANVAS_W / 2, 560);
}

function drawBustedScreen(ctx, game) {
  ctx.fillStyle = 'rgba(40, 4, 8, 0.66)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff5b5b';
  ctx.font = 'bold 72px Georgia, serif';
  ctx.fillText('BUSTED!', CANVAS_W / 2, 300);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText(game.bustedReason, CANVAS_W / 2, 350);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillText(`You carried away $${lootTakenValue(game.loot).toLocaleString('en-US')} before the cuffs clicked.`, CANVAS_W / 2, 390);
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('Press R to run this job again · Press M for the menu', CANVAS_W / 2, 460);
}

function drawWinScreen(ctx, game) {
  ctx.fillStyle = 'rgba(6, 20, 12, 0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.exit;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('CLEAN GETAWAY!', CANVAS_W / 2, 240);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText(`Job ${game.levelIndex + 1} of 3 complete — the ${game.requiredLootName} is yours.`, CANVAS_W / 2, 300);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText(`Haul $${lootTakenValue(game.loot).toLocaleString('en-US')}  ·  Time ${formatTime(game.elapsed)}  ·  Peak alarm ${Math.round(game.peakAlarm)}%`, CANVAS_W / 2, 350);
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 24px system-ui, sans-serif';
  const rank = game.rank;
  ctx.fillText(`Rank: ${rank.name} — ${rank.blurb}`, CANVAS_W / 2, 400);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText(
    game.levelIndex + 1 < 3 ? 'Press N for the next job · Press R to replay this one' : 'Press M for the menu — you cleared all three jobs!',
    CANVAS_W / 2, 470,
  );
}

function drawCompleteScreen(ctx, game) {
  ctx.fillStyle = 'rgba(6, 20, 12, 0.78)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 56px Georgia, serif';
  ctx.fillText('THE VELVET MIDNIGHT', CANVAS_W / 2, 250);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '24px Georgia, serif';
  ctx.fillText('All three jobs done. The house never saw your face.', CANVAS_W / 2, 300);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText(`Total haul $${game.totalHaul.toLocaleString('en-US')}  ·  Total score ${game.totalScore}`, CANVAS_W / 2, 360);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText('Press M to play again from the first job', CANVAS_W / 2, 430);
}

export function formatTime(seconds) {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// Re-exported for main.js (player radius lives in config, but render owns the
// drawing constant so a future art pass changes it in one place).
import { PLAYER_R } from './config.js';
