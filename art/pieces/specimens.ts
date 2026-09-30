import { rng } from "../../.anidoodle/repo/skills/anidoodle/engine/src/canvas-core/core";
import type { Piece } from "../../.anidoodle/repo/skills/anidoodle/engine/src/canvas-core/input";

export type SpecimenKind = "scroller" | "goblin" | "algorithm" | "lurker";

const W = 640;
const H = 460;
const PAPER = "#f3eddf";
const PAPER_DARK = "#e7ddc9";
const INK = "#252922";
const INK_SOFT = "#697064";
const RED = "#c95643";
const MOSS = "#72806a";
const BLUE = "#527987";
const GOLD = "#b98a4b";

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function roughPath(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  seed: number,
  width = 2.2,
  color = INK,
  closed = false,
) {
  const random = rng(seed);
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    const jx = (random() - 0.5) * 2.2;
    const jy = (random() - 0.5) * 2.2;
    if (index === 0) ctx.moveTo(x + jx, y + jy);
    else ctx.lineTo(x + jx, y + jy);
  });
  if (closed) ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function roughOval(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  color = INK,
  fill?: string,
) {
  const points: [number, number][] = [];
  for (let i = 0; i <= 40; i += 1) {
    const angle = (i / 40) * Math.PI * 2;
    points.push([cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry]);
  }
  if (fill) {
    ctx.save();
    ctx.beginPath();
    points.forEach(([x, y], index) => (index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.globalAlpha = 0.88;
    ctx.fill();
    ctx.restore();
  }
  roughPath(ctx, points, seed, 2.2, color, true);
}

function paper(ctx: CanvasRenderingContext2D, seed: number) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  const random = rng(seed);
  ctx.save();
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 160; i += 1) {
    const x = random() * W;
    const y = random() * H;
    const length = 2 + random() * 7;
    ctx.strokeStyle = random() > 0.5 ? INK_SOFT : PAPER_DARK;
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y + (random() - 0.5) * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function eyes(
  ctx: CanvasRenderingContext2D,
  centres: [number, number][],
  look: [number, number],
  seed: number,
) {
  centres.forEach(([x, y], index) => {
    roughOval(ctx, x, y, 15, 12, seed + index * 13, INK, "#faf7ef");
    const dx = look[0] - x;
    const dy = look[1] - y;
    const d = Math.hypot(dx, dy) || 1;
    const reach = clamp(d / 90, 0, 1) * 5;
    const px = x + (dx / d) * reach;
    const py = y + (dy / d) * reach;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(px, py, 4.3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function observedMarks(ctx: CanvasRenderingContext2D, seed: number, active: boolean) {
  if (!active) return;
  const random = rng(seed);
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.fillStyle = GOLD;
  ctx.globalAlpha = 0.78;
  for (let i = 0; i < 9; i += 1) {
    const angle = (i / 9) * Math.PI * 2;
    const radius = 158 + random() * 28;
    const x = W / 2 + Math.cos(angle) * radius;
    const y = H / 2 + Math.sin(angle) * radius * 0.65;
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x + 5, y);
    ctx.moveTo(x, y - 5);
    ctx.lineTo(x, y + 5);
    ctx.stroke();
  }
  ctx.restore();
}

function drawScroller(
  ctx: CanvasRenderingContext2D,
  look: [number, number],
  breath: number,
  seed: number,
  observed: boolean,
) {
  const body: [number, number][] = [
    [118, 270],
    [168, 214],
    [240, 205],
    [301, 243 + breath],
    [372, 291],
    [452, 280],
    [514, 224],
    [534, 168],
  ];

  ctx.save();
  ctx.globalAlpha = 0.16;
  roughPath(ctx, body.map(([x, y]) => [x + 5, y + 8]), seed + 1, 22, MOSS);
  ctx.restore();

  roughPath(ctx, body, seed + 2, 18, INK);
  roughPath(ctx, body.map(([x, y]) => [x, y - 6]), seed + 3, 4, BLUE);

  roughOval(ctx, 536, 159, 45, 36, seed + 4, INK, PAPER_DARK);
  eyes(ctx, [[523, 154], [550, 151]], look, seed + 20);

  const cards = [
    [182, 162, -8],
    [294, 304, 5],
    [410, 194, -5],
  ] as const;

  cards.forEach(([x, y, rotation], index) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.fillStyle = "#f9f5eb";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.fillRect(-31, -22, 62, 44);
    ctx.strokeRect(-31, -22, 62, 44);
    roughPath(ctx, [[-21, -10], [18, -10]], seed + 50 + index, 1.6, INK_SOFT);
    roughPath(ctx, [[-21, 0], [23, 0]], seed + 60 + index, 1.6, INK_SOFT);
    roughPath(ctx, [[-21, 10], [8, 10]], seed + 70 + index, 1.6, INK_SOFT);
    ctx.restore();
  });

  observedMarks(ctx, seed + 90, observed);
}

function drawGoblin(
  ctx: CanvasRenderingContext2D,
  look: [number, number],
  breath: number,
  seed: number,
  observed: boolean,
) {
  roughOval(ctx, 320, 244 + breath, 104, 116, seed + 1, INK, "#dfe4cf");

  roughPath(ctx, [[231, 193], [180, 150], [236, 146]], seed + 2, 3, INK);
  roughPath(ctx, [[409, 193], [462, 150], [404, 146]], seed + 3, 3, INK);

  eyes(ctx, [[286, 225 + breath], [350, 225 + breath]], look, seed + 20);

  roughPath(ctx, [[284, 285], [320, 300], [357, 283]], seed + 30, 2.3, INK);
  roughPath(ctx, [[220, 281], [154, 324], [116, 300]], seed + 31, 5.5, INK);
  roughPath(ctx, [[417, 281], [482, 324], [523, 296]], seed + 32, 5.5, INK);

  roughOval(ctx, 432, 139, 43, 43, seed + 40, RED, RED);
  ctx.save();
  ctx.fillStyle = "#fff9ef";
  ctx.font = "700 18px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("99+", 432, 140);
  ctx.restore();

  roughPath(ctx, [[313, 128], [320, 89], [329, 127]], seed + 41, 2, INK);
  roughOval(ctx, 320, 80, 9, 9, seed + 42, INK, GOLD);

  observedMarks(ctx, seed + 90, observed);
}

function drawAlgorithm(
  ctx: CanvasRenderingContext2D,
  look: [number, number],
  breath: number,
  seed: number,
  observed: boolean,
) {
  const random = rng(seed + 100);
  const nodes: [number, number, number][] = Array.from({ length: 11 }, (_, index) => {
    const angle = (index / 11) * Math.PI * 2 + 0.2;
    const radius = index % 2 ? 132 : 164;
    return [
      320 + Math.cos(angle) * radius,
      232 + Math.sin(angle) * radius * 0.72 + breath,
      15 + random() * 18,
    ];
  });

  ctx.save();
  ctx.globalAlpha = 0.66;
  nodes.forEach(([x, y], index) => {
    const target = nodes[(index * 3 + 4) % nodes.length];
    roughPath(ctx, [[x, y], [320 + (random() - 0.5) * 52, 232 + (random() - 0.5) * 36], [target[0], target[1]]], seed + index * 9, 1.4, BLUE);
  });
  ctx.restore();

  nodes.forEach(([x, y, r], index) => roughOval(ctx, x, y, r, r * 0.78, seed + 220 + index, INK, index % 3 === 0 ? "#dce5e2" : PAPER));

  roughOval(ctx, 320, 232 + breath, 76, 66, seed + 300, INK, "#e8dfca");
  eyes(ctx, [[320, 228 + breath]], look, seed + 320);

  ctx.save();
  ctx.font = "italic 16px Georgia, serif";
  ctx.fillStyle = INK_SOFT;
  ctx.textAlign = "center";
  ctx.fillText("you may also like", 320, 336);
  ctx.restore();

  observedMarks(ctx, seed + 390, observed);
}

function drawLurker(
  ctx: CanvasRenderingContext2D,
  look: [number, number],
  breath: number,
  seed: number,
  observed: boolean,
) {
  ctx.save();
  ctx.globalAlpha = 0.2;
  roughOval(ctx, 320, 244, 132, 150, seed + 1, INK, INK);
  ctx.restore();

  roughPath(
    ctx,
    [[214, 338], [226, 188], [286, 112], [356, 111], [414, 188], [430, 339]],
    seed + 4,
    4,
    INK,
  );
  roughPath(ctx, [[226, 188], [320, 167 + breath], [414, 188]], seed + 5, 3, INK);

  eyes(ctx, [[294, 217 + breath], [347, 217 + breath]], look, seed + 20);

  ctx.save();
  ctx.globalAlpha = 0.38;
  [
    [143, 125, 62, 30],
    [475, 273, 74, 34],
    [132, 330, 52, 27],
  ].forEach(([x, y, w, h], index) => {
    ctx.strokeStyle = INK_SOFT;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - w / 2, y - h / 2, w, h);
    roughPath(ctx, [[x - w / 2 + 8, y], [x + w / 2 - 8, y]], seed + 40 + index, 1.2, INK_SOFT);
  });
  ctx.restore();

  observedMarks(ctx, seed + 90, observed);
}

export function createSpecimenPiece(
  kind: SpecimenKind,
  title: string,
  alt: string,
  seed: number,
): Piece {
  return {
    meta: {
      title,
      W,
      H,
      loop: 240,
      alt,
    },
    input: {
      springs: {
        look: {
          omega: 0.13,
          target: (state) => state.pointer ?? [W * 0.58, H * 0.38],
        },
      },
    },
    draw: (ctx, tick, env, state) => {
      ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      paper(ctx, seed);

      const phase = ((tick % 240) / 240) * Math.PI * 2;
      const breath = state.reduced ? 0 : Math.sin(phase) * 2.8;
      const look = state.spring.look as [number, number];
      const observed = state.state === "observed";

      if (kind === "scroller") drawScroller(ctx, look, breath, seed, observed);
      if (kind === "goblin") drawGoblin(ctx, look, breath, seed, observed);
      if (kind === "algorithm") drawAlgorithm(ctx, look, breath, seed, observed);
      if (kind === "lurker") drawLurker(ctx, look, breath, seed, observed);

      ctx.save();
      ctx.fillStyle = INK_SOFT;
      ctx.globalAlpha = 0.58;
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("FIELD SKETCH · LIVE SPECIMEN", 22, H - 22);
      ctx.restore();
    },
  };
}
