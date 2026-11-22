// Velvet Midnight — shared tuning constants and the colour palette.
// One job: every number and colour the other modules agree on lives here.
export const WORLD_W = 1280;
export const WORLD_H = 704;
export const HUD_H = 64;
export const CANVAS_W = WORLD_W;
export const CANVAS_H = HUD_H + WORLD_H;

export const PLAYER_R = 13;
export const PLAYER_SPEED = 178;
export const GUARD_R = 14;
export const GUARD_PATROL_SPEED = 72;
export const GUARD_CHASE_SPEED = 158;
export const GUARD_VISION_RANGE = 235;
export const GUARD_VISION_HALF_ANGLE = 0.61; // ~35 degrees each side
export const CAMERA_VISION_RANGE = 250;
export const CAMERA_VISION_HALF_ANGLE = 0.5;
export const CATCH_DISTANCE = 26;
export const ALARM_RISE_PER_SECOND = 52;
export const ALARM_FALL_PER_SECOND = 14;
export const ALARM_LOCKDOWN = 100;
export const SPOT_GRACE_SECONDS = 0.55;
export const EMP_DISABLE_SECONDS = 7;
export const DISGUISE_SECONDS = 9;

export const PALETTE = {
  floorA: '#2b2620',
  floorB: '#26211c',
  floorEdge: '#1c1713',
  wall: '#4a3f55',
  wallTop: '#6b5b7d',
  wallLine: '#2e2636',
  crate: '#5a4632',
  crateTop: '#7a6244',
  rug: '#5e2b33',
  rugEdge: '#7d3a44',
  gold: '#f2c14e',
  goldDim: '#a8842e',
  player: '#37c8e8',
  playerDark: '#1b7d99',
  guard: '#e84b4b',
  guardDark: '#8f2323',
  cone: 'rgba(232, 75, 75, 0.20)',
  coneHot: 'rgba(255, 60, 60, 0.34)',
  camCone: 'rgba(255, 176, 32, 0.20)',
  camConeHot: 'rgba(255, 176, 32, 0.36)',
  camera: '#ffb020',
  exit: '#39d98a',
  exitDark: '#1d7a4c',
  hudBg: '#14101a',
  hudLine: '#332a44',
  text: '#f4ead8',
  textDim: '#b8a98f',
  alarmLow: '#39d98a',
  alarmMid: '#f2c14e',
  alarmHigh: '#e84b4b',
  panel: 'rgba(12, 9, 16, 0.88)',
};

export const GADGET_DEFS = {
  emp: { key: '1', name: 'EMP pulse', cost: 1, max: 2, hint: 'Blinds cameras 7s' },
  disguise: { key: '2', name: 'Disguise', cost: 1, max: 1, hint: 'Guards ignore you 9s' },
  noise: { key: '3', name: 'Coin toss', cost: 1, max: 3, hint: 'Click a spot: guards look' },
};

export const RANK_BY_PEAK_ALARM = [
  { max: 30, name: 'GHOST', blurb: 'Nobody knew you were there.' },
  { max: 70, name: 'SHADOW', blurb: 'A scare or two, but clean.' },
  { max: 100, name: 'LOUD', blurb: 'The whole house woke up.' },
];
