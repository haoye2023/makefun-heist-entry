# Velvet Midnight — a gallery heist

A complete, original 2D top-down stealth heist game. Three jobs — The Midnight
Gallery, The Marble Bank, The Sapphire Casino — each a room to cross under
patrolling guards with vision cones and sweeping security cameras. Steal the
loot (the crowned prize is the job), watch the alarm meter, spend your gadgets
(EMP, disguise, coin toss), and slip out through the green getaway van.

## Play

```sh
node serve.ts        # then open http://localhost:8080
```

Move with WASD or arrow keys. `[1]` EMP blinds cameras, `[2]` disguise fools
guards, `[3]` or click tosses a coin to lure a guard. If the alarm hits 100
the house locks down; if a guard grabs you, the job is blown. `R` retries a
job, `N` takes the next one, `M` returns to the menu.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored
`vendor/makefun-game.ts`. Screenshots are real renders of the game's own code,
posed deterministically with `?shot=cover|start|escape|busted&seed=1`.

## Layout

- `game/index.html` — the page, canvas only
- `game/src/main.js` — state machine, game loop, alarm and scoring
- `game/src/levels.js` — the three floor plans
- `game/src/world.js` — collision and line of sight
- `game/src/guards.js` — patrol, suspicion, investigation, chase
- `game/src/cameras.js` — sweeping cameras and EMP blackout
- `game/src/loot.js` — loot, the required prize, the getaway condition
- `game/src/gadgets.js` — EMP, disguise, coin toss
- `game/src/input.js` — keyboard and mouse
- `game/src/audio.js` — synthesised Web Audio effects, no audio files
- `game/src/render.js` — all canvas drawing: room, cones, HUD, screens
- `game/src/shots.js` — deterministic screenshot poses
- `game/src/config.js`, `game/src/random.js` — tuning constants, seeded RNG

MIT licensed. No network requests: every file the game loads lives under
`game/`.
