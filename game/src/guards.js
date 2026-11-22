// Velvet Midnight — the patrolling guards.
// One job: walk a patrol loop, notice the thief, investigate noises and chase.
// A guard is fair: it needs a short grace of continuous sight before the alarm
// climbs, it shows "!" and "?" so the player can read its mind, and it loses
// the trail when the thief breaks line of sight.
import {
  GUARD_PATROL_SPEED, GUARD_CHASE_SPEED, GUARD_VISION_RANGE,
  GUARD_VISION_HALF_ANGLE, CATCH_DISTANCE, SPOT_GRACE_SECONDS,
} from './config.js';
import { angleDifference, angleTo, hasLineOfSight, inVisionCone, moveCircle } from './world.js';

export function makeGuard(def, index) {
  const first = def.waypoints[0];
  return {
    index,
    x: first.x,
    y: first.y,
    facing: 0,
    waypointIndex: 1,
    pauseLeft: 0,
    state: 'patrol', // patrol | suspicious | chase | investigate
    suspicion: 0, // 0..1, fills while the thief is in sight
    target: null, // {x, y} the guard is walking toward while suspicious
    investigateLeft: 0,
    chaseLost: 0,
    waypoints: def.waypoints,
    pause: def.pause ?? 1,
    bobPhase: index * 1.7,
  };
}

export function updateGuard(guard, dt, world, player, noise, alarmLocked) {
  const sees = canGuardSee(guard, player, world);
  if (sees && player.disguiseLeft <= 0) {
    guard.suspicion = Math.min(1, guard.suspicion + dt / SPOT_GRACE_SECONDS);
  } else {
    guard.suspicion = Math.max(0, guard.suspicion - dt * 1.5);
  }

  if (guard.suspicion >= 1 && guard.state !== 'chase') {
    guard.state = 'chase';
    guard.chaseLost = 0;
  }

  if (noise && guard.state !== 'chase') {
    const d = Math.hypot(noise.x - guard.x, noise.y - guard.y);
    if (d < 340) {
      guard.state = 'investigate';
      guard.target = { x: noise.x, y: noise.y };
      guard.investigateLeft = 4;
    }
  }

  if (guard.state === 'patrol') {
    patrolStep(guard, dt, world);
  } else if (guard.state === 'investigate') {
    guard.investigateLeft -= dt;
    const arrived = walkToward(guard, guard.target, GUARD_PATROL_SPEED * 1.25, dt, world);
    if (arrived || guard.investigateLeft <= 0) {
      guard.state = 'patrol';
      guard.target = null;
    }
  } else if (guard.state === 'chase') {
    const target = { x: player.x, y: player.y };
    walkToward(guard, target, GUARD_CHASE_SPEED, dt, world);
    if (!sees) {
      guard.chaseLost += dt;
      if (guard.chaseLost > 2.5 && !alarmLocked) {
        guard.state = 'suspicious';
        guard.target = { x: player.x, y: player.y };
        guard.investigateLeft = 3;
        guard.suspicion = 0.4;
      }
    } else {
      guard.chaseLost = 0;
    }
  } else if (guard.state === 'suspicious') {
    guard.investigateLeft -= dt;
    const arrived = walkToward(guard, guard.target, GUARD_PATROL_SPEED * 1.25, dt, world);
    if (arrived || guard.investigateLeft <= 0) {
      guard.state = 'patrol';
      guard.target = null;
      guard.suspicion = 0;
    }
  }
  guard.bobPhase += dt * 6;
}

export function canGuardSee(guard, player, world) {
  if (player.hidden) return false;
  if (!inVisionCone(guard.x, guard.y, guard.facing, GUARD_VISION_RANGE, GUARD_VISION_HALF_ANGLE, player.x, player.y)) {
    return false;
  }
  return hasLineOfSight(world, guard.x, guard.y, player.x, player.y);
}

export function guardCatchesPlayer(guard, player) {
  return Math.hypot(guard.x - player.x, guard.y - player.y) < CATCH_DISTANCE;
}

function patrolStep(guard, dt, world) {
  if (guard.pauseLeft > 0) {
    guard.pauseLeft -= dt;
    return;
  }
  const wp = guard.waypoints[guard.waypointIndex];
  const arrived = walkToward(guard, wp, GUARD_PATROL_SPEED, dt, world);
  if (arrived) {
    guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
    guard.pauseLeft = guard.pause;
  }
}

// Walk toward a point; returns true when close enough to count as arrived.
// Also turns the guard to face where it walks.
function walkToward(guard, target, speed, dt, world) {
  const dx = target.x - guard.x;
  const dy = target.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 6) return true;
  const step = Math.min(dist, speed * dt);
  const nx = guard.x + (dx / dist) * step;
  const ny = guard.y + (dy / dist) * step;
  moveCircle(world, guard, 14, nx - guard.x, ny - guard.y);
  const want = angleTo(guard.x, guard.y, target.x, target.y);
  guard.facing += angleDifference(want, guard.facing) * Math.min(1, dt * 8);
  return Math.hypot(target.x - guard.x, target.y - guard.y) < 8;
}
