// Velvet Midnight — the three heist levels.
// One job: the floor plan of each job — walls, cover crates, patrol routes,
// cameras, loot and the getaway door. Coordinates are world pixels (1280 x 704).
// A wall is {x, y, w, h}. A guard patrol is a loop of waypoints. A camera sits
// on a wall and sweeps an arc. Loot has a name, a value and a world position.

export const LEVELS = [
  {
    id: 'gallery',
    name: '1 · The Midnight Gallery',
    par: 150,
    start: { x: 84, y: 620 },
    exit: { x: 640, y: 664, w: 120, h: 40 },
    walls: [
      // Vault room (top centre) holding the Crown of Dawn.
      { x: 540, y: 0, w: 16, h: 190 },
      { x: 724, y: 0, w: 16, h: 190 },
      { x: 540, y: 174, w: 82, h: 16 },
      { x: 658, y: 174, w: 82, h: 16 },
      // Wing dividers with a door gap each, so every room has two ways in.
      { x: 400, y: 0, w: 16, h: 250 },
      { x: 400, y: 330, w: 16, h: 374 },
      { x: 864, y: 0, w: 16, h: 250 },
      { x: 864, y: 330, w: 16, h: 374 },
      // A long display plinth across the middle hall.
      { x: 560, y: 430, w: 160, h: 18 },
    ],
    crates: [
      { x: 150, y: 300, w: 72, h: 72 },
      { x: 210, y: 540, w: 96, h: 64 },
      { x: 500, y: 560, w: 72, h: 72 },
      { x: 760, y: 560, w: 72, h: 72 },
      { x: 1000, y: 140, w: 72, h: 96 },
      { x: 1050, y: 470, w: 96, h: 64 },
      { x: 60, y: 120, w: 64, h: 64 },
    ],
    rugs: [
      { x: 460, y: 240, w: 360, h: 150 },
      { x: 40, y: 430, w: 220, h: 120 },
      { x: 1020, y: 430, w: 220, h: 120 },
    ],
    guards: [
      { waypoints: [{ x: 470, y: 300 }, { x: 810, y: 300 }, { x: 810, y: 620 }, { x: 470, y: 620 }], pause: 1.2 },
      { waypoints: [{ x: 120, y: 260 }, { x: 330, y: 260 }, { x: 330, y: 620 }, { x: 120, y: 620 }], pause: 0.9 },
    ],
    cameras: [
      { x: 640, y: 12, baseAngle: Math.PI / 2, sweep: 0.85, speed: 0.55 },
      { x: 1150, y: 330, baseAngle: Math.PI, sweep: 0.7, speed: 0.7 },
    ],
    loot: [
      { id: 'painting', name: 'The Weeping Duchess', value: 400, x: 150, y: 100, kind: 'painting' },
      { id: 'gem', name: 'Star of Marrow', value: 650, x: 1130, y: 90, kind: 'gem' },
      { id: 'crown', name: 'Crown of Dawn', value: 1200, x: 640, y: 96, kind: 'crown', required: true },
    ],
  },
  {
    id: 'bank',
    name: '2 · The Marble Bank',
    par: 180,
    start: { x: 84, y: 620 },
    exit: { x: 640, y: 664, w: 120, h: 40 },
    walls: [
      { x: 300, y: 0, w: 16, h: 210 },
      { x: 300, y: 290, w: 16, h: 414 },
      { x: 640, y: 0, w: 16, h: 150 },
      { x: 640, y: 230, w: 16, h: 474 },
      { x: 964, y: 0, w: 16, h: 210 },
      { x: 964, y: 290, w: 16, h: 414 },
      { x: 380, y: 480, w: 200, h: 16 },
      { x: 700, y: 480, w: 200, h: 16 },
    ],
    crates: [
      { x: 120, y: 300, w: 72, h: 72 },
      { x: 420, y: 120, w: 96, h: 64 },
      { x: 760, y: 120, w: 96, h: 64 },
      { x: 1060, y: 320, w: 72, h: 96 },
      { x: 180, y: 540, w: 96, h: 64 },
      { x: 980, y: 540, w: 96, h: 64 },
      { x: 580, y: 560, w: 120, h: 64 },
    ],
    rugs: [
      { x: 340, y: 250, w: 260, h: 140 },
      { x: 680, y: 250, w: 260, h: 140 },
    ],
    guards: [
      { waypoints: [{ x: 480, y: 330 }, { x: 800, y: 330 }, { x: 800, y: 620 }, { x: 480, y: 620 }], pause: 1.0 },
      { waypoints: [{ x: 120, y: 200 }, { x: 260, y: 200 }, { x: 260, y: 620 }, { x: 120, y: 620 }], pause: 0.9 },
      { waypoints: [{ x: 1020, y: 200 }, { x: 1160, y: 200 }, { x: 1160, y: 620 }, { x: 1020, y: 620 }], pause: 0.9 },
    ],
    cameras: [
      { x: 480, y: 12, baseAngle: Math.PI / 2, sweep: 0.8, speed: 0.65 },
      { x: 800, y: 12, baseAngle: Math.PI / 2, sweep: 0.8, speed: 0.65 },
      { x: 640, y: 692, baseAngle: -Math.PI / 2, sweep: 0.9, speed: 0.5 },
    ],
    loot: [
      { id: 'ledger', name: 'The Black Ledger', value: 500, x: 150, y: 100, kind: 'painting' },
      { id: 'bars', name: 'Gold Bars', value: 800, x: 480, y: 90, kind: 'gem' },
      { id: 'bonds', name: 'Bearer Bonds', value: 700, x: 1130, y: 100, kind: 'gem' },
      { id: 'diamond', name: 'The Widow Diamond', value: 1500, x: 800, y: 90, kind: 'crown', required: true },
    ],
  },
  {
    id: 'casino',
    name: '3 · The Sapphire Casino',
    par: 210,
    start: { x: 84, y: 620 },
    exit: { x: 640, y: 664, w: 120, h: 40 },
    walls: [
      { x: 260, y: 0, w: 16, h: 190 },
      { x: 260, y: 270, w: 16, h: 434 },
      { x: 520, y: 0, w: 16, h: 130 },
      { x: 520, y: 210, w: 16, h: 200 },
      { x: 520, y: 490, w: 16, h: 214 },
      { x: 760, y: 0, w: 16, h: 130 },
      { x: 760, y: 210, w: 16, h: 200 },
      { x: 760, y: 490, w: 16, h: 214 },
      { x: 1020, y: 0, w: 16, h: 190 },
      { x: 1020, y: 270, w: 16, h: 434 },
      { x: 580, y: 330, w: 120, h: 16 },
    ],
    crates: [
      { x: 100, y: 300, w: 72, h: 72 },
      { x: 380, y: 560, w: 96, h: 64 },
      { x: 620, y: 560, w: 96, h: 64 },
      { x: 900, y: 560, w: 96, h: 64 },
      { x: 1120, y: 320, w: 72, h: 96 },
      { x: 340, y: 120, w: 72, h: 72 },
      { x: 880, y: 120, w: 72, h: 72 },
    ],
    rugs: [
      { x: 40, y: 430, w: 200, h: 120 },
      { x: 540, y: 380, w: 200, h: 120 },
      { x: 1040, y: 430, w: 200, h: 120 },
    ],
    guards: [
      { waypoints: [{ x: 400, y: 300 }, { x: 880, y: 300 }, { x: 880, y: 620 }, { x: 400, y: 620 }], pause: 0.8 },
      { waypoints: [{ x: 120, y: 200 }, { x: 220, y: 200 }, { x: 220, y: 620 }, { x: 120, y: 620 }], pause: 0.8 },
      { waypoints: [{ x: 1060, y: 200 }, { x: 1160, y: 200 }, { x: 1160, y: 620 }, { x: 1060, y: 620 }], pause: 0.8 },
      { waypoints: [{ x: 580, y: 120 }, { x: 700, y: 120 }, { x: 700, y: 430 }, { x: 580, y: 430 }], pause: 1.1 },
    ],
    cameras: [
      { x: 400, y: 12, baseAngle: Math.PI / 2, sweep: 0.75, speed: 0.75 },
      { x: 880, y: 12, baseAngle: Math.PI / 2, sweep: 0.75, speed: 0.75 },
      { x: 640, y: 692, baseAngle: -Math.PI / 2, sweep: 0.9, speed: 0.6 },
      { x: 1270, y: 350, baseAngle: Math.PI, sweep: 0.7, speed: 0.8 },
    ],
    loot: [
      { id: 'chips', name: 'High-Roller Chips', value: 600, x: 140, y: 100, kind: 'gem' },
      { id: 'watch', name: 'The Sapphire Watch', value: 900, x: 400, y: 90, kind: 'gem' },
      { id: 'necklace', name: 'Emerald Necklace', value: 900, x: 880, y: 90, kind: 'gem' },
      { id: 'vaultcash', name: 'Vault Cash', value: 800, x: 1140, y: 100, kind: 'painting' },
      { id: 'heart', name: 'Heart of the House', value: 2000, x: 640, y: 90, kind: 'crown', required: true },
    ],
  },
];
