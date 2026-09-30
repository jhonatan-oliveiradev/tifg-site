import {
  Gfx,
  PENCIL,
  TINT,
  arc,
  line,
  oval,
  rng,
  tube,
  type Ctx,
  type Env,
  type P,
} from "../../.anidoodle/repo/skills/anidoodle/engine/src/canvas-core/core";
import type { Piece } from "../../.anidoodle/repo/skills/anidoodle/engine/src/canvas-core/input";

const W = 760;
const H = 610;
const PAPER = "#f7f0df";
const INK = "#2f322c";
const PENCIL_BLUE = "#8a91a0";
const RUST = "#b8563f";
const MOSS = "#6e8069";
const SEA = "#6d96a2";
const GOLD = "#d3ad67";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const stage = (p: number, a: number, b: number) => clamp01((p - a) / Math.max(0.0001, b - a));
const at = (o: P, pts: P[]): P[] => pts.map(([x, y]) => [o[0] + x, o[1] + y]);

function paper(ctx: Ctx, seed: number) {
  ctx.save();
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  const r = rng(seed);
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 210; i++) {
    const x = r() * W;
    const y = r() * H;
    ctx.strokeStyle = r() > 0.55 ? "#776f62" : "#ffffff";
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 3 + r() * 8, y + (r() - 0.5) * 1.8);
    ctx.stroke();
  }
  ctx.restore();
}

function drawConstruction(g: Gfx, progress: number) {
  const p = stage(progress, 0.02, 0.28);
  if (p <= 0) return;
  const c = "#87909d";
  g.group("ink", () => {
    g.pen(oval(390, 244, 145, 112, 16), { closed: true, w: 1.25, color: c, seed: 11, opacity: 0.42, wobble: 1.6, progress: p });
    g.pen(oval(378, 405, 118, 84, 14), { closed: true, w: 1.2, color: c, seed: 12, opacity: 0.38, wobble: 1.6, progress: p });
    g.pen([[390, 116], [390, 520]], { w: 1.1, color: c, seed: 13, opacity: 0.36, progress: p });
    g.pen([[226, 248], [552, 248]], { w: 1.1, color: c, seed: 14, opacity: 0.34, progress: p });
    g.pen([[248, 376], [532, 376]], { w: 1.1, color: c, seed: 15, opacity: 0.3, progress: p });
    g.pen([[262, 178], [336, 132]], { w: 1.0, color: c, seed: 16, opacity: 0.3, progress: p });
    g.pen([[516, 178], [454, 129]], { w: 1.0, color: c, seed: 17, opacity: 0.3, progress: p });
  });
}

function feedCard(g: Gfx, x: number, y: number, rotation: number, seed: number, alpha: number) {
  const card: P[] = [[-43, -31], [40, -31], [46, -25], [46, 28], [39, 34], [-39, 34], [-46, 28], [-46, -24]];
  g.push(x, y, 1, rotation);
  g.group("paint", () => g.form(card, "#fbf8ef", "#d7cfbf", { seed, light: [-3, -4] }));
  g.group("ink", () => {
    g.pen(card, { closed: true, w: 2.1, seed: seed + 1, wobble: 0.5, opacity: alpha });
    g.pen([[-28, -15], [20, -15]], { w: 1.4, seed: seed + 2, opacity: 0.55 * alpha, retrace: false });
    g.pen([[-28, -3], [29, -3]], { w: 1.4, seed: seed + 3, opacity: 0.48 * alpha, retrace: false });
    g.pen([[-28, 9], [9, 9]], { w: 1.4, seed: seed + 4, opacity: 0.45 * alpha, retrace: false });
    g.pen(oval(-28, 22, 4, 4, 6), { closed: true, w: 1.3, seed: seed + 5, opacity: 0.6 * alpha, retrace: false });
  });
  g.pop();
}

function drawCreature(g: Gfx, tick: number, progress: number, look: P, observed: boolean) {
  const sketch = stage(progress, 0.18, 0.52);
  const wash = stage(progress, 0.34, 0.68);
  const ink = stage(progress, 0.52, 0.88);
  const awake = stage(progress, 0.82, 1);
  const breathe = Math.sin((tick / 240) * Math.PI * 2) * (awake * 3.2);

  const spine: P[] = [
    [175, 355], [230, 304], [286, 306], [339, 336], [400, 388],
    [468, 401], [527, 372], [570, 316], [588, 248], [574, 194],
  ];
  const body = tube(spine, 32, 24, true);

  if (sketch > 0) {
    g.group("ink", () => {
      g.pen(spine, { w: 2.1, color: PENCIL_BLUE, seed: 41, opacity: 0.5 * sketch, wobble: 2.1, progress: sketch });
      g.pen(body, { closed: true, w: 1.4, color: PENCIL_BLUE, seed: 42, opacity: 0.36 * sketch, wobble: 2.2, progress: sketch });
      [0, 1, 2, 3, 4, 5].forEach((i) => {
        const x = 214 + i * 60;
        g.pen([[x, 284 + (i % 2) * 22], [x + 20, 316 + (i % 3) * 15]], {
          w: 1.0, color: PENCIL_BLUE, seed: 60 + i, opacity: 0.25 * sketch, progress: sketch,
        });
      });
    });
  }

  if (wash > 0) {
    g.group("paint", () => {
      g.wash(body, "#91a887", { alpha: 0.52 * wash, seed: 70, dx: 4, dy: 2, shrink: 0.97, rim: true });
      g.wash(oval(448, 360, 110, 78, 12), "#7fa5ad", { alpha: 0.18 * wash, seed: 71, dx: 3, dy: 1, shrink: 0.98, rim: true });
      g.wash(oval(258, 332, 96, 68, 12), "#d1a36f", { alpha: 0.14 * wash, seed: 72, dx: 2, dy: 1, shrink: 0.97, rim: true });
    });
  }

  if (ink > 0) {
    g.group("ink", () => {
      g.pen(body, { closed: true, w: 3.3, seed: 90, wobble: 1.1, boil: 0.35, taper: 0.5, opacity: ink, progress: ink });
      g.pen(spine, { w: 1.8, seed: 91, wobble: 0.9, opacity: 0.38 * ink, retrace: false, progress: ink });
      g.hatch(344, 356, 180, { n: 18, len: 17, angle: -0.7, seed: 92, opacity: 0.22 * ink });
    });
  }

  if (progress > 0.45) {
    feedCard(g, 236, 241, -0.1, 110, stage(progress, 0.45, 0.7));
    feedCard(g, 381, 465, 0.07, 120, stage(progress, 0.5, 0.76));
    feedCard(g, 512, 283, -0.07, 130, stage(progress, 0.56, 0.82));
  }

  const headY = 177 + breathe;
  const head: P[] = [[-56, -28], [-40, -50], [-8, -61], [30, -56], [52, -37], [58, -3], [48, 31], [17, 47], [-20, 46], [-48, 26], [-60, 0]];
  g.push(574, headY, 1, -0.08 + Math.sin(tick * 0.018) * awake * 0.018);
  if (wash > 0) g.group("paint", () => g.form(head, "#e6dbc4", "#a89b87", { seed: 140, light: [-8, -10], hi: [-22, -22, 12, 7, -24] }));
  if (ink > 0) g.group("ink", () => g.pen(head, { closed: true, w: 3.2, seed: 141, wobble: 0.9, boil: 0.35, opacity: ink }));
  if (awake > 0) {
    const eye = (x: number, y: number, seed: number) => {
      const dx = look[0] - (574 + x);
      const dy = look[1] - (headY + y);
      const d = Math.hypot(dx, dy) || 1;
      const rx = (dx / d) * Math.min(5, d / 80);
      const ry = (dy / d) * Math.min(4, d / 90);
      g.group("paint", () => g.wash(oval(x, y, 13, 10, 9), "#fffaf0", { alpha: 0.96 * awake, seed, dx: 0, dy: 0, shrink: 1, rim: false }));
      g.group("ink", () => {
        g.pen(oval(x, y, 13, 10, 9), { closed: true, w: 1.8, seed: seed + 1, opacity: awake, retrace: false });
        const c = g.cur;
        c.fillStyle = INK;
        c.globalAlpha = awake;
        c.beginPath();
        c.arc(x + rx, y + ry, 3.7, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;
      });
    };
    eye(-20, -8, 160);
    eye(17, -10, 170);
    g.group("ink", () => g.pen(arc(0, 19, 11, 7, 0.12 * Math.PI, 0.88 * Math.PI, 6), { w: 2.2, seed: 180, opacity: awake }));
  }
  g.pop();

  if (observed && awake > 0.8) {
    g.group("ink", () => {
      const r = rng(555);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const rr = 230 + r() * 30;
        const x = 380 + Math.cos(a) * rr;
        const y = 320 + Math.sin(a) * rr * 0.68;
        g.pen(line([x - 7, y], [x + 7, y]), { w: 1.5, color: GOLD, seed: 600 + i, retrace: false });
        g.pen(line([x, y - 7], [x, y + 7]), { w: 1.5, color: GOLD, seed: 620 + i, retrace: false });
      }
    });
  }

  if (awake > 0.2) {
    g.group("ink", () => {
      g.pen([[108, 116], [150, 116], [178, 140]], { w: 1.3, color: RUST, seed: 710, opacity: 0.7 * awake, retrace: false });
      g.pen([[105, 496], [158, 496], [197, 456]], { w: 1.3, color: SEA, seed: 711, opacity: 0.5 * awake, retrace: false });
    });
  }
}

export const heroPiece: Piece = {
  meta: {
    title: "The Internet Field Guide — living plate",
    W,
    H,
    loop: 360,
    alt: "A hand-drawn internet creature assembles itself from pencil construction lines, watercolour and ink, then wakes and follows the pointer.",
  },
  input: {
    springs: {
      look: {
        omega: 0.14,
        target: (d) => d.pointer ?? [W * 0.62, H * 0.37],
      },
    },
  },
  draw: (ctx, tick, env, input) => {
    ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
    paper(ctx, 91);

    const g = new Gfx(ctx, env, tick, PENCIL);
    const autoplay = clamp01(tick / 250);
    const progress = input.reduced ? 1 : Math.max(autoplay, input.scroll * 1.05);
    const look = input.spring.look as P;

    drawConstruction(g, progress);

    g.group("ink", () => {
      g.pen([[80, 86], [190, 86]], { w: 1.2, color: RUST, seed: 801, opacity: stage(progress, 0.1, 0.3), retrace: false });
      g.pen([[572, 527], [682, 527]], { w: 1.2, color: MOSS, seed: 802, opacity: stage(progress, 0.55, 0.8), retrace: false });
    });

    drawCreature(g, tick, progress, look, input.state === "observed");

    const labelP = stage(progress, 0.68, 0.92);
    if (labelP > 0) {
      ctx.save();
      ctx.globalAlpha = labelP;
      ctx.fillStyle = INK;
      ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.letterSpacing = "0.08em";
      ctx.fillText("PLATE 01 / VOLUTUS INFINITUM", 82, 72);
      ctx.fillStyle = RUST;
      ctx.fillText("LIVE FIELD STUDY", 548, 548);
      ctx.restore();
    }
  },
};
