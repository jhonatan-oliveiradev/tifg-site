import { rng, type P } from "../../.anidoodle/repo/skills/anidoodle/engine/src/canvas-core/core";
import type { Piece } from "../../.anidoodle/repo/skills/anidoodle/engine/src/canvas-core/input";

export type SpecimenKind = "scroller" | "goblin" | "algorithm" | "lurker";

const W = 760;
const H = 600;
const PAPER = "#f3eddf";
const INK = "#252922";
const SOFT = "#687064";
const RED = "#bd4f3c";
const MOSS = "#71806a";
const BLUE = "#5b8590";
const GOLD = "#b28a50";
const CREAM = "#fbf7ed";

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

function paper(ctx: CanvasRenderingContext2D, seed: number, tint = PAPER) {
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, W, H);
  const random = rng(seed);
  ctx.save();
  for (let i = 0; i < 260; i += 1) {
    ctx.globalAlpha = 0.055 + random() * 0.08;
    ctx.strokeStyle = random() > 0.82 ? "#6d6b5d" : "#baaF98";
    ctx.lineWidth = 0.4;
    const x = random() * W;
    const y = random() * H;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 3 + random() * 9, y + (random() - 0.5) * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function rough(
  ctx: CanvasRenderingContext2D,
  points: P[],
  seed: number,
  width = 2,
  color = INK,
  alpha = 1,
  close = false,
) {
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  points.forEach(([x, y], i) => {
    const xx = x + (r() - 0.5) * 2.4;
    const yy = y + (r() - 0.5) * 2.4;
    if (i) ctx.lineTo(xx, yy);
    else ctx.moveTo(xx, yy);
  });
  if (close) ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function oval(cx: number, cy: number, rx: number, ry: number, n = 40): P[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  });
}

function wash(
  ctx: CanvasRenderingContext2D,
  points: P[],
  color: string,
  seed: number,
  alpha = 0.26,
) {
  const r = rng(seed);
  for (let pass = 0; pass < 4; pass += 1) {
    ctx.save();
    ctx.globalAlpha = alpha * (0.58 - pass * 0.08);
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach(([x, y], i) => {
      const xx = x + (r() - 0.5) * 7;
      const yy = y + (r() - 0.5) * 7;
      if (i) ctx.lineTo(xx, yy);
      else ctx.moveTo(xx, yy);
    });
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function hatch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
  amount = 18,
  color = SOFT,
) {
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  for (let i = 0; i < amount; i += 1) {
    const xx = x + r() * w;
    const yy = y + r() * h;
    ctx.beginPath();
    ctx.moveTo(xx - 8, yy + 10);
    ctx.lineTo(xx + 9, yy - 9);
    ctx.stroke();
  }
  ctx.restore();
}

function gaze(ctx: CanvasRenderingContext2D, centres: P[], look: P, seed: number, blink = 0) {
  centres.forEach(([x, y], index) => {
    ctx.save();
    ctx.fillStyle = CREAM;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(x, y, 13, Math.max(1.7, 10 * (1 - blink)), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const dx = look[0] - x;
    const dy = look[1] - y;
    const d = Math.hypot(dx, dy) || 1;
    const reach = Math.min(5, d / 80);
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(x + (dx / d) * reach, y + (dy / d) * reach, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (index === 0) rough(ctx, [[x - 15, y - 18], [x, y - 22], [x + 14, y - 18]], seed + 10, 1.2, INK, 0.55);
  });
}

function stamp(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, rotation = -0.07) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = RED;
  ctx.fillStyle = RED;
  ctx.globalAlpha = 0.58;
  ctx.lineWidth = 1.3;
  ctx.strokeRect(-55, -15, 110, 30);
  ctx.font = "700 10px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 1);
  ctx.restore();
}

function drawCard(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number, seed: number, active = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = CREAM;
  ctx.strokeStyle = active ? RED : INK;
  ctx.lineWidth = active ? 2 : 1.3;
  ctx.fillRect(-36, -25, 72, 50);
  ctx.strokeRect(-36, -25, 72, 50);
  rough(ctx, [[-24, -12], [19, -12]], seed, 1, SOFT, 0.6);
  rough(ctx, [[-24, -2], [26, -2]], seed + 1, 1, SOFT, 0.5);
  rough(ctx, [[-24, 9], [8, 9]], seed + 2, 1, SOFT, 0.45);
  if (active) {
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(27, -18, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function scroller(ctx: CanvasRenderingContext2D, tick: number, look: P, state: string, seed: number) {
  const t = tick / 60;
  const observed = state === "observed";
  const body: P[] = Array.from({ length: 54 }, (_, i) => {
    const u = i / 53;
    const x = 76 + u * 590;
    const y = 344 + Math.sin(u * Math.PI * 3.1 + t * 0.42) * (66 - u * 18) - u * 82;
    return [x, y];
  });

  ctx.save();
  ctx.globalAlpha = 0.14;
  rough(ctx, body.map(([x, y]) => [x + 7, y + 10]), seed + 1, 32, MOSS);
  ctx.restore();
  rough(ctx, body, seed + 2, 24, INK, 0.92);
  rough(ctx, body.map(([x, y]) => [x, y - 5]), seed + 3, 6, BLUE, 0.7);

  const cards = [
    { i: 9, r: -0.14 }, { i: 18, r: 0.11 }, { i: 28, r: -0.09 },
    { i: 38, r: 0.12 }, { i: 45, r: -0.06 },
  ];
  let nearest = -1;
  let best = Infinity;
  cards.forEach(({ i }, index) => {
    const [x, y] = body[i];
    const d = Math.hypot(look[0] - x, look[1] - y);
    if (d < best) {
      best = d;
      nearest = index;
    }
  });
  cards.forEach(({ i, r }, index) => {
    const [x, y] = body[i];
    drawCard(ctx, x, y - 47, r + Math.sin(t + index) * 0.015, seed + 40 + index * 4, best < 130 && index === nearest);
  });

  const head = body.at(-1)!;
  const headY = head[1] - (observed ? 15 : 0);
  wash(ctx, oval(head[0], headY, 63, 49), GOLD, seed + 70, 0.22);
  rough(ctx, oval(head[0], headY, 63, 49), seed + 71, 2.6, INK, 1, true);
  rough(ctx, [[head[0] + 28, headY - 36], [head[0] + 51, headY - 74], [head[0] + 70, headY - 81]], seed + 72, 2, INK);
  rough(ctx, [[head[0] - 24, headY - 39], [head[0] - 40, headY - 72], [head[0] - 57, headY - 82]], seed + 73, 2, INK);
  const blink = Math.max(0, 1 - Math.abs(Math.sin(t * 0.66)) * 18);
  gaze(ctx, [[head[0] - 21, headY - 4], [head[0] + 17, headY - 7]], look, seed + 80, blink);

  if (best < 150) {
    const targetCard = cards[nearest];
    const target = body[targetCard.i];
    rough(ctx, [[head[0] - 8, headY + 28], [head[0] - 25, headY + 40], [target[0] + 5, target[1] - 42]], seed + 90, 2.3, RED, 0.8);
  }

  hatch(ctx, 250, 250, 270, 160, seed + 100, 36);
  if (observed) stamp(ctx, "FEED RESPONSE", 125, 112, -0.06);
}

function goblin(ctx: CanvasRenderingContext2D, tick: number, look: P, state: string, seed: number) {
  const t = tick / 60;
  const observed = state === "observed";
  const pulse = 1 + Math.sin(t * 3.2) * 0.05;
  const badge = [535, 152] as P;
  const nearBadge = Math.hypot(look[0] - badge[0], look[1] - badge[1]) < 150;
  const bob = Math.sin(t * 1.3) * 3;

  wash(ctx, oval(356, 330 + bob, 126, 145), MOSS, seed + 1, 0.24);
  rough(ctx, oval(356, 330 + bob, 126, 145), seed + 2, 2.8, INK, 1, true);
  wash(ctx, [[247, 279], [178, 203], [270, 226]], GOLD, seed + 3, 0.2);
  wash(ctx, [[465, 279], [536, 203], [442, 226]], GOLD, seed + 4, 0.2);
  rough(ctx, [[247, 279], [178, 203], [270, 226]], seed + 5, 2.4, INK, 1, true);
  rough(ctx, [[465, 279], [536, 203], [442, 226]], seed + 6, 2.4, INK, 1, true);

  gaze(ctx, [[319, 304 + bob], [392, 304 + bob]], look, seed + 20, 0);
  rough(ctx, [[315, 374 + bob], [356, 389 + bob], [401, 370 + bob]], seed + 21, 2.2, INK);
  rough(ctx, [[355, 330 + bob], [345, 348 + bob], [363, 351 + bob]], seed + 22, 1.4, SOFT);

  const notifications = [
    [120, 136, 11, "3"], [196, 101, 15, "12"], [617, 241, 12, "7"],
    [567, 403, 17, "28"], [169, 433, 13, "5"], [535, 152, 31, "99+"],
  ] as const;

  notifications.forEach(([x, y, r, label], i) => {
    const scale = i === 5 ? pulse : 1 + Math.sin(t * 2 + i) * 0.025;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = i === 5 ? RED : i % 2 ? GOLD : BLUE;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fffaf1";
    ctx.font = `700 ${Math.max(9, r * 0.55)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 1);
    ctx.restore();
  });

  const leftHand: P = nearBadge ? [494, 176] : [226, 372 + bob];
  const rightHand: P = nearBadge ? [561, 184] : [485, 366 + bob];
  rough(ctx, [[276, 356 + bob], [250, 360 + bob], leftHand], seed + 50, 8, INK, 0.9);
  rough(ctx, [[438, 356 + bob], [472, 350 + bob], rightHand], seed + 51, 8, INK, 0.9);
  rough(ctx, oval(leftHand[0], leftHand[1], 11, 9), seed + 52, 1.7, INK, 1, true);
  rough(ctx, oval(rightHand[0], rightHand[1], 11, 9), seed + 53, 1.7, INK, 1, true);

  if (nearBadge) {
    rough(ctx, [[500, 114], [535, 92], [568, 111]], seed + 70, 1.5, RED, 0.65);
    ctx.save();
    ctx.fillStyle = RED;
    ctx.font = "italic 14px Georgia, serif";
    ctx.fillText("mine.", 574, 120);
    ctx.restore();
  }

  hatch(ctx, 270, 240, 170, 240, seed + 80, 28);
  if (observed) stamp(ctx, "STIMULUS HOARDER", 129, 520, 0.04);
}

function algorithm(ctx: CanvasRenderingContext2D, tick: number, look: P, state: string, seed: number) {
  const t = tick / 60;
  const observed = state === "observed";
  const centre: P = [380, 300];
  const nodes = Array.from({ length: 18 }, (_, i) => {
    const ring = i % 3;
    const baseR = 120 + ring * 62;
    const angle = (i / 18) * Math.PI * 2 + ring * 0.7 + t * (0.03 + ring * 0.012);
    let x = centre[0] + Math.cos(angle) * baseR;
    let y = centre[1] + Math.sin(angle) * baseR * 0.68;
    const d = Math.hypot(look[0] - x, look[1] - y);
    if (d < 190) {
      const k = (190 - d) / 190;
      x += (look[0] - x) * 0.14 * k;
      y += (look[1] - y) * 0.14 * k;
    }
    return [x, y] as P;
  });

  const random = rng(seed + 200);
  ctx.save();
  ctx.globalAlpha = 0.24;
  ctx.strokeStyle = BLUE;
  ctx.lineWidth = 1.1;
  for (let i = 0; i < nodes.length; i += 1) {
    const targets = [(i * 5 + 3) % nodes.length, (i * 7 + 8) % nodes.length];
    targets.forEach((j) => {
      ctx.beginPath();
      ctx.moveTo(nodes[i][0], nodes[i][1]);
      ctx.quadraticCurveTo(
        centre[0] + (random() - 0.5) * 120,
        centre[1] + (random() - 0.5) * 90,
        nodes[j][0],
        nodes[j][1],
      );
      ctx.stroke();
    });
  }
  ctx.restore();

  nodes.forEach(([x, y], i) => {
    const r = 7 + (i % 4) * 2.5;
    wash(ctx, oval(x, y, r * 1.5, r * 1.2), i % 3 === 0 ? RED : BLUE, seed + 300 + i, 0.18);
    rough(ctx, oval(x, y, r, r * 0.85), seed + 400 + i, 1.1, INK, 0.75, true);
  });

  wash(ctx, oval(centre[0], centre[1], 78, 68), GOLD, seed + 501, 0.18);
  rough(ctx, oval(centre[0], centre[1], 78, 68), seed + 502, 2.4, INK, 1, true);
  rough(ctx, oval(centre[0], centre[1], 42, 36), seed + 503, 1.4, BLUE, 0.55, true);
  gaze(ctx, [[380, 298]], look, seed + 510, 0);

  const dx = look[0] - centre[0];
  const dy = look[1] - centre[1];
  const prediction: P = [centre[0] + dx * 0.72, centre[1] + dy * 0.72];
  ctx.save();
  ctx.strokeStyle = RED;
  ctx.globalAlpha = observed ? 0.75 : 0.34;
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.moveTo(centre[0], centre[1]);
  ctx.lineTo(prediction[0], prediction[1]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeRect(prediction[0] - 18, prediction[1] - 13, 36, 26);
  ctx.fillStyle = RED;
  ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("LIKELY NEXT", prediction[0] + 24, prediction[1] - 4);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = SOFT;
  ctx.globalAlpha = 0.55;
  ctx.font = "italic 15px Georgia, serif";
  ctx.fillText("you may also like", 326, 414);
  ctx.restore();

  if (observed) stamp(ctx, "MODEL UPDATED", 600, 514, -0.04);
}

function lurker(ctx: CanvasRenderingContext2D, tick: number, look: P, state: string, seed: number) {
  const t = tick / 60;
  const level =
    state === "observed" || state === "revealed" ? 1 :
    state === "form" ? 0.72 :
    state === "eyes" ? 0.46 :
    state === "trace" ? 0.22 : 0.04;

  const hide = state === "observed" && Math.hypot(look[0] - 380, look[1] - 282) < 135 ? 26 : 0;
  ctx.save();
  ctx.globalAlpha = 0.08 + level * 0.15;
  wash(ctx, oval(380 + hide, 320, 132, 177), INK, seed + 1, 0.28 * level);
  ctx.restore();

  if (level > 0.15) {
    rough(ctx, [[255 + hide, 489], [270 + hide, 250], [325 + hide, 159], [428 + hide, 160], [494 + hide, 252], [510 + hide, 490]], seed + 2, 2.6, INK, level * 0.85);
    rough(ctx, [[270 + hide, 250], [380 + hide, 216 + Math.sin(t) * 2], [494 + hide, 252]], seed + 3, 2, INK, level * 0.78);
  }

  if (level > 0.36) {
    gaze(ctx, [[347 + hide, 286], [414 + hide, 286]], look, seed + 10, 0);
  }

  if (level > 0.58) {
    rough(ctx, [[328 + hide, 350], [380 + hide, 360], [434 + hide, 348]], seed + 20, 1.5, INK, level);
    hatch(ctx, 287 + hide, 230, 186, 240, seed + 30, 48, INK);
    const boxes = [[146, 135], [609, 192], [154, 436], [622, 437]] as const;
    boxes.forEach(([x, y], i) => {
      ctx.save();
      ctx.globalAlpha = level * 0.32;
      ctx.strokeStyle = SOFT;
      ctx.strokeRect(x - 43, y - 23, 86, 46);
      rough(ctx, [[x - 29, y - 7], [x + 25, y - 7]], seed + 50 + i, 1, SOFT, 0.55);
      rough(ctx, [[x - 29, y + 5], [x + 10, y + 5]], seed + 60 + i, 1, SOFT, 0.45);
      ctx.restore();
    });
  }

  if (level > 0.9) {
    stamp(ctx, hide ? "RETREATING" : "PRESENCE CONFIRMED", 565, 86, 0.05);
  }
}

export function createSpecimenPiece(
  kind: SpecimenKind,
  title: string,
  alt: string,
  seed: number,
): Piece {
  return {
    meta: { title, W, H, loop: 360, alt },
    input: {
      springs: {
        look: {
          omega: 0.16,
          target: (d) => d.pointer ?? [W * 0.62, H * 0.36],
        },
      },
    },
    draw: (ctx, tick, env, state) => {
      ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      paper(ctx, seed, kind === "algorithm" ? "#efe9db" : PAPER);
      const look = state.spring.look as P;

      if (kind === "scroller") scroller(ctx, tick, look, state.state, seed);
      if (kind === "goblin") goblin(ctx, tick, look, state.state, seed);
      if (kind === "algorithm") algorithm(ctx, tick, look, state.state, seed);
      if (kind === "lurker") lurker(ctx, tick, look, state.state, seed);

      ctx.save();
      ctx.fillStyle = SOFT;
      ctx.globalAlpha = 0.5;
      ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("LIVE FIELD PLATE · MOVE CURSOR ACROSS SPECIMEN", 22, H - 22);
      ctx.restore();
    },
  };
}
