import { rng, type P } from "../../.anidoodle/repo/skills/anidoodle/engine/src/canvas-core/core";
import { scrollSpan, type Piece } from "../../.anidoodle/repo/skills/anidoodle/engine/src/canvas-core/input";

const W = 760;
const H = 720;
const PAPER = "#f3eddf";
const INK = "#252922";
const GRAPHITE = "#4c5148";
const RED = "#b94f3e";
const BLUE = "#5f8994";
const MOSS = "#74866d";
const GOLD = "#b58b4f";
const WASH = "#d9c9a9";

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (v: number) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};

const wingLeft: P[] = [
  [370, 306], [318, 250], [248, 190], [158, 178], [92, 222], [126, 292],
  [210, 340], [300, 359], [364, 342],
];
const wingRight: P[] = wingLeft.map(([x, y]) => [W - x, y]);
const lowerLeft: P[] = [
  [365, 342], [298, 362], [220, 405], [190, 489], [246, 519], [316, 474], [374, 390],
];
const lowerRight: P[] = lowerLeft.map(([x, y]) => [W - x, y]);

function jitter(points: P[], seed: number, amount = 2.4): P[] {
  const random = rng(seed);
  return points.map(([x, y]) => [
    x + (random() - 0.5) * amount,
    y + (random() - 0.5) * amount,
  ]);
}

function lineLength(points: P[]) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  return total;
}

function partial(points: P[], progress: number): P[] {
  if (!points.length || progress <= 0) return [];
  if (progress >= 1) return points;
  const target = lineLength(points) * progress;
  let travelled = 0;
  const out: P[] = [points[0]];
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const segment = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (travelled + segment >= target) {
      const u = segment ? (target - travelled) / segment : 0;
      out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
      break;
    }
    travelled += segment;
    out.push(b);
  }
  return out;
}

function stroke(
  ctx: CanvasRenderingContext2D,
  points: P[],
  seed: number,
  progress = 1,
  width = 2,
  color = GRAPHITE,
  alpha = 1,
  closed = false,
) {
  const full = jitter(closed ? [...points, points[0]] : points, seed);
  const pts = partial(full, progress);
  if (pts.length < 2) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.restore();
}

function ellipsePoints(cx: number, cy: number, rx: number, ry: number, n = 48): P[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  });
}

function paper(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  const r = rng(9917);
  ctx.save();
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 330; i += 1) {
    const x = r() * W;
    const y = r() * H;
    ctx.strokeStyle = r() > 0.72 ? "#8e846f" : "#c6b99f";
    ctx.lineWidth = 0.35 + r() * 0.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 3 + r() * 10, y + (r() - 0.5) * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function washShape(
  ctx: CanvasRenderingContext2D,
  points: P[],
  color: string,
  alpha: number,
  seed: number,
  scale = 1,
) {
  if (alpha <= 0) return;
  const r = rng(seed);
  const cx = points.reduce((sum, p) => sum + p[0], 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p[1], 0) / points.length;

  for (let pass = 0; pass < 4; pass += 1) {
    const pts = points.map(([x, y]) => [
      cx + (x - cx) * scale + (r() - 0.5) * 5,
      cy + (y - cy) * scale + (r() - 0.5) * 5,
    ] as P);

    ctx.save();
    ctx.globalAlpha = alpha * (0.18 + pass * 0.035);
    ctx.fillStyle = color;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function construction(ctx: CanvasRenderingContext2D, p: number) {
  const q = ease(p);
  stroke(ctx, ellipsePoints(380, 330, 58, 116), 10, q, 1.2, BLUE, 0.32);
  stroke(ctx, ellipsePoints(380, 270, 30, 34), 11, clamp((q - 0.08) / 0.92), 1.1, BLUE, 0.3);
  stroke(ctx, ellipsePoints(245, 300, 150, 92), 12, clamp((q - 0.18) / 0.82), 1, BLUE, 0.26);
  stroke(ctx, ellipsePoints(515, 300, 150, 92), 13, clamp((q - 0.26) / 0.74), 1, BLUE, 0.26);
  stroke(ctx, [[380, 118], [380, 553]], 14, clamp((q - 0.36) / 0.64), 1, BLUE, 0.24);
  stroke(ctx, [[90, 330], [670, 330]], 15, clamp((q - 0.46) / 0.54), 1, BLUE, 0.22);
}

function sketch(ctx: CanvasRenderingContext2D, p: number) {
  const sequences = [
    [wingLeft, 41], [wingRight, 42], [lowerLeft, 43], [lowerRight, 44],
    [ellipsePoints(380, 327, 31, 111), 45],
    [[[360, 225], [340, 183], [313, 150], [284, 137]] as P[], 46],
    [[[400, 225], [420, 183], [447, 150], [476, 137]] as P[], 47],
  ] as const;

  sequences.forEach(([points, seed], index) => {
    const start = index / sequences.length;
    const local = clamp((p - start * 0.55) / 0.46);
    stroke(ctx, points, seed, local, 1.65, GRAPHITE, 0.55, index < 5);
  });

  const veins: P[][] = [
    [[370, 302], [285, 268], [183, 230], [108, 226]],
    [[368, 320], [278, 312], [196, 300], [129, 285]],
    [[368, 352], [292, 398], [236, 450], [213, 485]],
    [[390, 302], [475, 268], [577, 230], [652, 226]],
    [[392, 320], [482, 312], [564, 300], [631, 285]],
    [[392, 352], [468, 398], [524, 450], [547, 485]],
  ];
  veins.forEach((v, i) => stroke(ctx, v, 70 + i, clamp((p - 0.35 - i * 0.03) / 0.5), 1.1, GRAPHITE, 0.42));
}

function paint(ctx: CanvasRenderingContext2D, p: number) {
  const q = ease(p);
  washShape(ctx, wingLeft, BLUE, q, 101, 0.96 + q * 0.04);
  washShape(ctx, wingRight, BLUE, q, 102, 0.96 + q * 0.04);
  washShape(ctx, lowerLeft, MOSS, clamp((q - 0.15) / 0.85), 103, 0.95 + q * 0.05);
  washShape(ctx, lowerRight, MOSS, clamp((q - 0.15) / 0.85), 104, 0.95 + q * 0.05);
  washShape(ctx, ellipsePoints(380, 329, 28, 104), GOLD, clamp((q - 0.28) / 0.72), 105, 0.98);

  const spots = [
    [230, 256, 36, RED], [530, 256, 36, RED],
    [262, 405, 28, GOLD], [498, 405, 28, GOLD],
    [166, 251, 17, MOSS], [594, 251, 17, MOSS],
  ] as const;

  spots.forEach(([x, y, r, color], i) => {
    const u = clamp((q - 0.24 - i * 0.04) / 0.55);
    if (!u) return;
    ctx.save();
    ctx.globalAlpha = 0.14 + u * 0.2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function finalInk(ctx: CanvasRenderingContext2D, p: number) {
  const main = [
    [wingLeft, 151], [wingRight, 152], [lowerLeft, 153], [lowerRight, 154],
    [ellipsePoints(380, 327, 30, 108), 155],
  ] as const;
  main.forEach(([pts, seed], i) => stroke(ctx, pts, seed, clamp((p - i * 0.08) / 0.7), 2.7, INK, 0.96, true));

  const segments = Array.from({ length: 7 }, (_, i) => ellipsePoints(380, 269 + i * 22, 24 - i * 1.2, 10));
  segments.forEach((pts, i) => stroke(ctx, pts, 180 + i, clamp((p - 0.25 - i * 0.035) / 0.6), 1.5, INK, 0.7));

  stroke(ctx, [[360, 226], [340, 183], [313, 150], [284, 137]], 201, clamp((p - 0.48) / 0.5), 2, INK);
  stroke(ctx, [[400, 226], [420, 183], [447, 150], [476, 137]], 202, clamp((p - 0.5) / 0.5), 2, INK);

  const littleTabs = [
    [118, 392, -8], [605, 356, 7], [148, 520, 5], [580, 505, -6],
  ] as const;
  littleTabs.forEach(([x, y, rot], i) => {
    const u = clamp((p - 0.38 - i * 0.06) / 0.42);
    if (!u) return;
    ctx.save();
    ctx.globalAlpha = u;
    ctx.translate(x, y);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(-34, -20, 68, 40);
    stroke(ctx, [[-22, -7], [20, -7]], 220 + i, u, 1, INK, 0.7);
    stroke(ctx, [[-22, 3], [10, 3]], 230 + i, u, 1, INK, 0.5);
    ctx.restore();
  });
}

function awake(
  ctx: CanvasRenderingContext2D,
  tick: number,
  look: P,
  observed: boolean,
) {
  const phase = (tick / 60) * Math.PI * 2;
  const bob = Math.sin(phase * 0.55) * 2.5;
  const dx = look[0] - 380;
  const dy = look[1] - 246;
  const d = Math.hypot(dx, dy) || 1;
  const gx = (dx / d) * Math.min(5.5, d / 70);
  const gy = (dy / d) * Math.min(4, d / 90);

  ctx.save();
  ctx.translate(0, bob);
  [[368, 247], [392, 247]].forEach(([x, y], i) => {
    ctx.fillStyle = "#fffaf1";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.ellipse(x, y, 8.8, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(x + gx, y + gy, 2.7, 0, Math.PI * 2);
    ctx.fill();
    if (observed) {
      ctx.strokeStyle = RED;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(x, y, 14 + Math.sin(phase + i) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
  ctx.restore();

  const r = rng(3301);
  for (let i = 0; i < 14; i += 1) {
    const angle = i * 1.77 + phase * (i % 2 ? 0.04 : -0.03);
    const radius = 145 + r() * 170;
    const x = 380 + Math.cos(angle) * radius;
    const y = 336 + Math.sin(angle) * radius * 0.62;
    const alpha = 0.15 + 0.25 * (0.5 + 0.5 * Math.sin(phase * 1.8 + i));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = i % 3 === 0 ? RED : GOLD;
    ctx.beginPath();
    ctx.arc(x, y, 1.6 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function tool(ctx: CanvasRenderingContext2D, progress: number, stage: "pencil" | "brush") {
  const path: P[] = stage === "brush"
    ? [[120, 590], [230, 510], [330, 390], [455, 305], [590, 245]]
    : [[106, 194], [206, 224], [320, 268], [430, 350], [620, 420]];
  const pts = partial(path, progress);
  const tip = pts.at(-1) ?? path[0];

  ctx.save();
  ctx.translate(tip[0], tip[1]);
  ctx.rotate(-0.72);
  if (stage === "pencil") {
    ctx.fillStyle = GOLD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(72, -7);
    ctx.lineTo(74, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = GRAPHITE;
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-8, -5);
    ctx.lineTo(-8, 5);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.strokeStyle = RED;
    ctx.lineWidth = 11;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(82, 0);
    ctx.stroke();
    ctx.fillStyle = "#725843";
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.quadraticCurveTo(-3, -9, 10, -5);
    ctx.lineTo(10, 5);
    ctx.quadraticCurveTo(-3, 9, -18, 0);
    ctx.fill();
  }
  ctx.restore();
}

export const fieldGuideHero: Piece = {
  meta: {
    title: "The Intertab Moth, drawn into life",
    W,
    H,
    loop: 360,
    alt: "A large moth-like digital creature is constructed in pencil, painted with translucent washes, inked, then wakes and follows the visitor's pointer.",
  },
  input: {
    springs: {
      p: { omega: 0.12, target: (d) => d.scroll },
      look: { omega: 0.18, target: (d) => d.pointer ?? [520, 250] },
    },
  },
  draw: (ctx, tick, env, state) => {
    ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    paper(ctx);

    // Front-load the illustration so the plate never feels broken/empty,
    // then reserve the final ~30% of the scroll sequence for the living specimen.
    const p = state.reduced ? 1 : scrollSpan(state.spring.p as number, 0.005, 0.88);
    const c = clamp(p / 0.12);
    const s = clamp((p - 0.06) / 0.22);
    const w = clamp((p - 0.23) / 0.2);
    const i = clamp((p - 0.4) / 0.22);
    const alive = clamp((p - 0.58) / 0.12);

    construction(ctx, c);
    sketch(ctx, s);
    paint(ctx, w);
    finalInk(ctx, i);

    ctx.save();
    ctx.fillStyle = INK;
    ctx.globalAlpha = 0.55;
    ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText("PLATE 00 · INTERTAB LEPIDOPTERA", 26, 34);
    ctx.fillText("CONSTRUCTION / WASH / FINAL LINE", 26, H - 28);
    ctx.restore();

    if (!state.reduced && p < 0.62) {
      if (p < 0.23) tool(ctx, clamp(s), "pencil");
      else if (p < 0.43) tool(ctx, clamp(w), "brush");
      else tool(ctx, clamp(i), "pencil");
    }

    if (alive > 0.01) {
      ctx.save();
      ctx.globalAlpha = alive;
      awake(ctx, tick, state.spring.look as P, state.state === "observed");
      ctx.restore();
    }

    if (p > 0.78) {
      ctx.save();
      ctx.globalAlpha = clamp((p - 0.78) / 0.08);
      ctx.strokeStyle = RED;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 6]);
      ctx.strokeRect(48, 64, W - 96, H - 126);
      ctx.setLineDash([]);
      ctx.fillStyle = RED;
      ctx.font = "italic 13px Georgia, serif";
      ctx.fillText("specimen has noticed the observer", 474, 675);
      ctx.restore();
    }
  },
};
