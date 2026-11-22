// Velvet Midnight — the physical world: walls, cover and line of sight.
// One job: answer "can this circle move here?" and "can this eye see that?"
import { WORLD_W, WORLD_H } from './config.js';

export function makeWorld(level) {
  const solids = [];
  for (const w of level.walls) solids.push({ ...w, kind: 'wall' });
  for (const c of level.crates) solids.push({ ...c, kind: 'crate' });
  return { level, solids };
}

// Circle vs rectangle test, used for walls and crates.
export function circleHitsRect(cx, cy, r, rect) {
  const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

export function circleHitsAnySolid(world, cx, cy, r) {
  if (cx - r < 0 || cx + r > WORLD_W || cy - r < 0 || cy + r > WORLD_H) return true;
  for (const s of world.solids) {
    if (circleHitsRect(cx, cy, r, s)) return true;
  }
  return false;
}

// Move a circle with axis separation so it slides along walls instead of sticking.
export function moveCircle(world, pos, r, dx, dy) {
  const nx = pos.x + dx;
  if (!circleHitsAnySolid(world, nx, pos.y, r)) pos.x = nx;
  const ny = pos.y + dy;
  if (!circleHitsAnySolid(world, pos.x, ny, r)) pos.y = ny;
}

function segmentHitsRect(x1, y1, x2, y2, rect) {
  // Slab test: does the segment cross the rectangle?
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tMin = 0;
  let tMax = 1;
  const slabs = [
    [dx, x1 - rect.x],
    [-dx, rect.x + rect.w - x1],
    [dy, y1 - rect.y],
    [-dy, rect.y + rect.h - y1],
  ];
  for (const [d, n] of slabs) {
    if (Math.abs(d) < 1e-9) {
      if (n < 0) return false;
    } else {
      const t = n / d;
      if (d > 0) {
        if (t > tMax) return false;
        if (t > tMin) tMin = t;
      } else {
        if (t < tMin) return false;
        if (t < tMax) tMax = t;
      }
    }
  }
  return true;
}

// True when nothing (wall or crate) stands between two points.
export function hasLineOfSight(world, ax, ay, bx, by) {
  for (const s of world.solids) {
    if (segmentHitsRect(ax, ay, bx, by, s)) return false;
  }
  return true;
}

// Angle helpers shared by guards and cameras.
export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

export function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function inVisionCone(eyeX, eyeY, facing, range, halfAngle, tx, ty) {
  const dx = tx - eyeX;
  const dy = ty - eyeY;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (dist < 18) return true; // too close to miss
  const diff = Math.abs(angleDifference(angleTo(eyeX, eyeY, tx, ty), facing));
  return diff <= halfAngle;
}
