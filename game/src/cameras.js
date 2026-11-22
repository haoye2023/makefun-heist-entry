// Velvet Midnight — the wall-mounted security cameras.
// One job: sweep an arc back and forth, and spot the thief inside the cone.
// An EMP pulse freezes a camera blind for a few seconds; a blind camera
// shows a dead lens and raises no alarm.
import { CAMERA_VISION_RANGE, CAMERA_VISION_HALF_ANGLE } from './config.js';
import { hasLineOfSight, inVisionCone } from './world.js';

export function makeCamera(def, index) {
  return {
    index,
    x: def.x,
    y: def.y,
    baseAngle: def.baseAngle,
    sweep: def.sweep,
    speed: def.speed,
    phase: index * 1.3,
    angle: def.baseAngle,
    disabledLeft: 0,
  };
}

export function updateCamera(camera, dt, time) {
  if (camera.disabledLeft > 0) {
    camera.disabledLeft = Math.max(0, camera.disabledLeft - dt);
    return;
  }
  camera.angle = camera.baseAngle + Math.sin(time * camera.speed + camera.phase) * camera.sweep;
}

export function cameraSeesPlayer(camera, player, world) {
  if (camera.disabledLeft > 0 || player.hidden) return false;
  if (!inVisionCone(camera.x, camera.y, camera.angle, CAMERA_VISION_RANGE, CAMERA_VISION_HALF_ANGLE, player.x, player.y)) {
    return false;
  }
  return hasLineOfSight(world, camera.x, camera.y, player.x, player.y);
}
