// Velvet Midnight — keyboard and mouse input.
// One job: turn keys and clicks into game intents, and nothing else.
// Movement: WASD or arrow keys. Gadgets: 1 EMP, 2 disguise, 3 coin toss.
// A mouse click throws the coin where it lands; Enter confirms screens.
export function makeInput(canvas) {
  const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    clicked: null, // {x, y} in canvas pixels, consumed by the game loop
    pressedKeys: new Set(),
    onKey: null, // (code) => void, set by main.js for one-shot actions
    onClick: null, // ({x, y}) => void, set by main.js
  };

  const keyMap = {
    KeyW: 'up', ArrowUp: 'up',
    KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left',
    KeyD: 'right', ArrowRight: 'right',
  };

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  window.addEventListener('keydown', (event) => {
    const dir = keyMap[event.code];
    if (dir) {
      input[dir] = true;
      event.preventDefault();
    }
    if (!event.repeat) {
      input.pressedKeys.add(event.code);
      if (input.onKey) input.onKey(event.code);
    }
  });

  window.addEventListener('keyup', (event) => {
    const dir = keyMap[event.code];
    if (dir) input[dir] = false;
    input.pressedKeys.delete(event.code);
  });

  window.addEventListener('blur', () => {
    input.up = input.down = input.left = input.right = false;
    input.pressedKeys.clear();
  });

  canvas.addEventListener('mousemove', (event) => {
    const p = canvasPoint(event);
    input.mouseX = p.x;
    input.mouseY = p.y;
  });

  canvas.addEventListener('mousedown', (event) => {
    input.mouseDown = true;
    const p = canvasPoint(event);
    input.clicked = p;
    if (input.onClick) input.onClick(p);
  });

  window.addEventListener('mouseup', () => {
    input.mouseDown = false;
  });

  return input;
}

export function movementVector(input) {
  let x = 0;
  let y = 0;
  if (input.left) x -= 1;
  if (input.right) x += 1;
  if (input.up) y -= 1;
  if (input.down) y += 1;
  if (x !== 0 && y !== 0) {
    const inv = 1 / Math.SQRT2;
    x *= inv;
    y *= inv;
  }
  return { x, y };
}
