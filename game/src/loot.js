// Velvet Midnight — the loot: paintings, gems and the one prize per job.
// One job: hold what is still on the wall, hand it over when the thief is
// close enough, and say when the job's required prize is in the bag.
export function makeLoot(def) {
  return {
    id: def.id,
    name: def.name,
    value: def.value,
    x: def.x,
    y: def.y,
    kind: def.kind,
    required: Boolean(def.required),
    taken: false,
    sparkle: Math.random() * Math.PI * 2,
  };
}

export function tryGrabLoot(lootList, player, onGrab) {
  let grabbed = null;
  for (const item of lootList) {
    if (item.taken) continue;
    if (Math.hypot(item.x - player.x, item.y - player.y) < 30) {
      item.taken = true;
      grabbed = item;
      if (onGrab) onGrab(item);
    }
  }
  return grabbed;
}

export function lootTakenValue(lootList) {
  return lootList.reduce((sum, item) => sum + (item.taken ? item.value : 0), 0);
}

export function lootTakenCount(lootList) {
  return lootList.filter((item) => item.taken).length;
}

export function requiredLootTaken(lootList) {
  return lootList.filter((item) => item.required).every((item) => item.taken);
}

export function lootRemaining(lootList) {
  return lootList.filter((item) => !item.taken);
}
