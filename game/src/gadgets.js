// Velvet Midnight — the thief's gadgets, each spent at a cost.
// One job: count the charges, spend them, and apply what each one does.
// EMP blinds every camera; the disguise makes guards look straight through
// the thief; a coin toss rings out where it lands and pulls guards over.
import { DISGUISE_SECONDS, EMP_DISABLE_SECONDS, GADGET_DEFS } from './config.js';

export function makeGadgets() {
  return {
    emp: GADGET_DEFS.emp.max,
    disguise: GADGET_DEFS.disguise.max,
    noise: GADGET_DEFS.noise.max,
  };
}

export function gadgetCount(gadgets, kind) {
  return gadgets[kind] ?? 0;
}

export function useEmp(gadgets, cameras, onUsed) {
  if (gadgets.emp <= 0) return false;
  gadgets.emp -= 1;
  for (const camera of cameras) camera.disabledLeft = EMP_DISABLE_SECONDS;
  if (onUsed) onUsed('emp');
  return true;
}

export function useDisguise(gadgets, player, onUsed) {
  if (gadgets.disguise <= 0) return false;
  gadgets.disguise -= 1;
  player.disguiseLeft = DISGUISE_SECONDS;
  if (onUsed) onUsed('disguise');
  return true;
}

export function useNoise(gadgets, x, y, onUsed) {
  if (gadgets.noise <= 0) return null;
  gadgets.noise -= 1;
  const noise = { x, y, ttl: 1.2, ring: 0 };
  if (onUsed) onUsed('noise', noise);
  return noise;
}
