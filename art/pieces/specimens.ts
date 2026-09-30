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
  type P,
} from "../../.anidoodle/repo/skills/anidoodle/engine/src/canvas-core/core";
import type { Piece } from "../../.anidoodle/repo/skills/anidoodle/engine/src/canvas-core/input";

export type SpecimenKind = "scroller" | "goblin" | "algorithm" | "lurker";

const W = 700;
const H = 520;
const PAPER = "#f5eedf";
const INK = "#2e312b";
const PENCIL_BLUE = "#8d94a1";
const RED = "#bb513f";
const MOSS = "#6f8068";
const BLUE = "#658f9a";
const GOLD = "#cfaa61";

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const at = (o: P, pts: P[]): P[] => pts.map(([x, y]) => [o[0] + x, o[1] + y]);

function paper(ctx: Ctx, seed: number) {
  ctx.save();
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  const r = rng(seed);
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 150; i++) {
    const x = r() * W;
    const y = r() * H;
    ctx.strokeStyle = r() > 0.5 ? "#6f6a5f" : "#fff";
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 3 + r() * 7, y + (r() - 0.5) * 1.4);
    ctx.stroke();
  }
  ctx.restore();
}

function eye(g: Gfx, x: number, y: number, target: P, seed: number, scale = 1) {
  const dx = target[0] - x;
  const dy = target[1] - y;
  const d = Math.hypot(dx, dy) || 1;
  const px = (dx / d) * Math.min(5.5 * scale, d / 75);
  const py = (dy / d) * Math.min(4.2 * scale, d / 90);

  g.group("paint", () => {
    g.wash(oval(x, y, 15 * scale, 12 * scale, 9), "#fffaf1", {
      alpha: 0.98,
      seed,
      dx: 0,
      dy: 0,
      shrink: 1,
      rim: false,
    });
  });
  g.group("ink", () => {
    g.pen(oval(x, y, 15 * scale, 12 * scale, 9), {
      closed: true,
      w: 1.9 * scale,
      seed: seed + 1,
      wobble: 0.4,
      retrace: false,
    });
    const c = g.cur;
    c.fillStyle = INK;
    c.beginPath();
    c.arc(x + px, y + py, 4.1 * scale, 0, Math.PI * 2);
    c.fill();
  });
}

function observationMarks(g: Gfx, seed: number, active: boolean) {
  if (!active) return;
  const r = rng(seed);
  g.group("ink", () => {
    for (let i = 0; i < 13; i++) {
      const a = (i / 13) * Math.PI * 2;
      const rr = 235 + r() * 30;
      const x = W / 2 + Math.cos(a) * rr;
      const y = H / 2 + Math.sin(a) * rr * 0.72;
      g.pen(line([x - 7, y], [x + 7, y]), { w: 1.4, color: GOLD, seed: seed + i, retrace: false });
      g.pen(line([x, y - 7], [x, y + 7]), { w: 1.4, color: GOLD, seed: seed + 30 + i, retrace: false });
    }
  });
}

function feedCard(g: Gfx, x: number, y: number, rot: number, seed: number, accent = BLUE) {
  const card: P[] = [[-42, -31], [39, -31], [46, -24], [46, 27], [39, 34], [-39, 34], [-46, 27], [-46, -24]];
  g.push(x, y, 1, rot);
  g.group("paint", () => {
    g.form(card, "#fbf8ee", "#d8cfbd", { seed, light: [-3, -4] });
    g.wash(oval(-29, -18, 5, 5, 7), accent, { alpha: 0.75, seed: seed + 1, dx: 0, dy: 0, shrink: 1, rim: false });
  });
  g.group("ink", () => {
    g.pen(card, { closed: true, w: 2.2, seed: seed + 2, wobble: 0.5 });
    g.pen([[-19, -17], [27, -17]], { w: 1.4, seed: seed + 3, opacity: 0.55, retrace: false });
    g.pen([[-28, -3], [28, -3]], { w: 1.35, seed: seed + 4, opacity: 0.45, retrace: false });
    g.pen([[-28, 10], [9, 10]], { w: 1.35, seed: seed + 5, opacity: 0.4, retrace: false });
  });
  g.pop();
}

function drawScroller(g: Gfx, tick: number, look: P, active: boolean) {
  const sway = Math.sin(tick * 0.026) * 7;
  const reach = active ? 16 + Math.sin(tick * 0.04) * 9 : 0;
  const spine: P[] = [
    [108, 334],
    [164, 283],
    [235, 287],
    [302, 324],
    [372, 382],
    [446, 396],
    [512, 363],
    [553, 304],
    [576 + reach, 242 + sway * 0.3],
    [564 + reach, 191 + sway * 0.2],
  ];
  const body = tube(spine, 35, 23, true);

  g.group("paint", () => {
    g.wash(body, "#9bae8e", { alpha: 0.55, seed: 100, dx: 4, dy: 2, shrink: 0.97, rim: true });
    g.wash(oval(351, 349, 180, 72, 14), "#7b9fa9", { alpha: 0.13, seed: 101, dx: 2, dy: 1, shrink: 0.98, rim: true });
  });

  g.group("ink", () => {
    g.pen(body, { closed: true, w: 3.4, seed: 110, wobble: 1.1, boil: 0.4, taper: 0.5 });
    g.pen(spine, { w: 1.7, color: PENCIL_BLUE, seed: 111, opacity: 0.34, wobble: 1.2, retrace: false });
    g.hatch(332, 352, 230, { n: 20, len: 17, angle: -0.65, seed: 112, opacity: 0.18 });
  });

  feedCard(g, 202, 236, -0.12, 130);
  feedCard(g, 365, 443, 0.08, 140, RED);
  feedCard(g, 512, 307, -0.05, 150, GOLD);

  const headY = 178 + sway * 0.45;
  const head: P[] = [[-59, -31], [-41, -52], [-9, -61], [27, -57], [52, -40], [60, -7], [51, 27], [20, 47], [-19, 48], [-47, 30], [-60, 2]];
  g.push(565 + reach, headY, 1, -0.06 + Math.sin(tick * 0.02) * 0.015);
  g.group("paint", () => g.form(head, "#e6dbc6", "#aa9d88", { seed: 160, light: [-8, -9], hi: [-25, -23, 12, 7, -28] }));
  g.group("ink", () => {
    g.pen(head, { closed: true, w: 3.4, seed: 161, wobble: 0.9, boil: 0.35 });
    g.pen(arc(0, 21, 11, 7, 0.1 * Math.PI, 0.9 * Math.PI, 6), { w: 2.2, seed: 162 });
  });
  eye(g, -19, -9, [look[0] - (565 + reach), look[1] - headY], 170);
  eye(g, 18, -11, [look[0] - (565 + reach), look[1] - headY], 180);
  g.pop();

  if (active) {
    g.group("ink", () => {
      g.pen([[598, 132], [617, 116], [632, 121]], { w: 1.5, color: RED, seed: 195, retrace: false });
      g.pen([[595, 145], [620, 140]], { w: 1.5, color: RED, seed: 196, retrace: false });
    });
  }
}

function bell(g: Gfx, x: number, y: number, seed: number, pulse: number) {
  g.push(x, y, 0.85 + pulse * 0.04);
  const body: P[] = [[-22, 14], [-18, -7], [-11, -18], [0, -23], [11, -18], [18, -7], [22, 14], [14, 19], [-14, 19]];
  g.group("paint", () => g.form(body, "#e5c778", "#b98c3d", { seed, light: [-3, -4] }));
  g.group("ink", () => {
    g.pen(body, { closed: true, w: 2.1, seed: seed + 1, wobble: 0.4 });
    g.pen(arc(0, 19, 9, 7, 0, Math.PI, 5), { w: 1.7, seed: seed + 2, retrace: false });
  });
  g.pop();
}

function drawGoblin(g: Gfx, tick: number, look: P, active: boolean) {
  const bounce = Math.sin(tick * 0.045) * 3.5;
  const body: P[] = [[-92, -32], [-70, -94], [-22, -122], [32, -117], [76, -86], [96, -24], [82, 44], [41, 91], [-16, 102], [-68, 76], [-96, 24]];
  const o: P = [347, 293 + bounce];
  const B = (pts: P[]) => at(o, pts);

  g.group("paint", () => {
    g.form(B(body), "#dfe5cc", "#a6ad8f", { seed: 210, light: [-9, -12], hi: [295, 205, 20, 12, -25] });
    g.wash(B(oval(-48, 35, 28, 17, 10)), "#e8a5a0", { alpha: 0.36, seed: 211, dx: 1, dy: 1, shrink: 0.98, rim: false });
    g.wash(B(oval(50, 34, 28, 17, 10)), "#e8a5a0", { alpha: 0.36, seed: 212, dx: 1, dy: 1, shrink: 0.98, rim: false });
  });
  g.group("ink", () => {
    g.pen(B(body), { closed: true, w: 3.6, seed: 220, wobble: 1, boil: 0.4 });
    g.pen(B([[-82, -68], [-135, -108], [-90, -119]]), { w: 3, seed: 221, wobble: 0.7 });
    g.pen(B([[80, -68], [137, -108], [89, -120]]), { w: 3, seed: 222, wobble: 0.7 });
    g.hatch(o[0], o[1] + 60, 145, { n: 14, len: 13, angle: -0.5, seed: 223, opacity: 0.16 });
  });

  eye(g, o[0] - 33, o[1] - 34, look, 230, 1.05);
  eye(g, o[0] + 35, o[1] - 36, look, 240, 1.05);

  const grin = active ? 19 : 10;
  g.group("ink", () => {
    g.pen(arc(o[0], o[1] + 23, grin, 11, 0.12 * Math.PI, 0.88 * Math.PI, 7), { w: 2.6, seed: 250 });
  });

  const p1 = active ? 1 : 0;
  bell(g, 170, 184, 260, Math.sin(tick * 0.08));
  bell(g, 530, 184, 270, Math.sin(tick * 0.08 + 1.4));
  bell(g, 155, 374, 280, Math.sin(tick * 0.08 + 2.8));
  bell(g, 546, 385, 290, Math.sin(tick * 0.08 + 4.2));

  const badgeX = 488 - p1 * 14;
  const badgeY = 135 + Math.sin(tick * 0.05) * 4;
  g.group("paint", () => g.form(oval(badgeX, badgeY, 45, 45, 12), RED, "#8f372b", { seed: 300, light: [-4, -5], hi: [badgeX - 14, badgeY - 14, 8, 5, -30] }));
  g.group("ink", () => g.pen(oval(badgeX, badgeY, 45, 45, 12), { closed: true, w: 3, seed: 301, wobble: 0.6 }));

  const c = g.cur;
  c.save();
  c.fillStyle = "#fff9ed";
  c.font = "700 19px ui-monospace, SFMono-Regular, Menlo, monospace";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText("99+", badgeX, badgeY + 1);
  c.restore();

  if (active) {
    const handL = B([[-87, -4]])[0];
    const handR = [badgeX - 17, badgeY + 20] as P;
    const arm = tube([handL, [445, 219], handR], 9, 7, false);
    g.group("paint", () => g.form(arm, "#dfe5cc", "#a6ad8f", { seed: 315, light: [-3, -4] }));
    g.group("ink", () => g.pen(arm, { closed: true, w: 2.6, seed: 316, wobble: 0.5 }));
  }
}

function drawAlgorithm(g: Gfx, tick: number, look: P, active: boolean) {
  const r = rng(370);
  const core: P = [350, 267];
  const nodes: { x: number; y: number; rx: number; ry: number }[] = Array.from({ length: 15 }, (_, i) => {
    const a = (i / 15) * Math.PI * 2 + 0.22;
    const ring = i % 3 === 0 ? 198 : i % 2 ? 155 : 118;
    const shift = active ? Math.sin(tick * 0.023 + i) * 12 : Math.sin(tick * 0.013 + i) * 4;
    return {
      x: core[0] + Math.cos(a) * ring + shift,
      y: core[1] + Math.sin(a) * ring * 0.66 + Math.cos(tick * 0.015 + i) * (active ? 8 : 3),
      rx: 14 + r() * 13,
      ry: 11 + r() * 9,
    };
  });

  g.group("ink", () => {
    nodes.forEach((n, i) => {
      const target = nodes[(i * 4 + 5) % nodes.length];
      const mx = (n.x + target.x) / 2 + Math.sin(tick * 0.016 + i) * (active ? 22 : 8);
      const my = (n.y + target.y) / 2 + Math.cos(tick * 0.017 + i) * (active ? 15 : 5);
      g.pen([[n.x, n.y], [mx, my], [target.x, target.y]], {
        w: 1.4,
        color: BLUE,
        seed: 400 + i,
        opacity: active ? 0.54 : 0.34,
        retrace: false,
      });
    });
  });

  nodes.forEach((n, i) => {
    const fill = i % 4 === 0 ? "#dbe5e3" : i % 5 === 0 ? "#ead6c5" : "#f3ecdf";
    g.group("paint", () => g.form(oval(n.x, n.y, n.rx, n.ry, 9), fill, "#b7b3a8", { seed: 450 + i, light: [-2, -3] }));
    g.group("ink", () => g.pen(oval(n.x, n.y, n.rx, n.ry, 9), { closed: true, w: 1.8, seed: 470 + i, wobble: 0.5 }));
  });

  const pulse = 1 + Math.sin(tick * 0.03) * 0.025;
  g.push(core[0], core[1], pulse);
  g.group("paint", () => {
    g.form(oval(0, 0, 86, 72, 14), "#e9dec8", "#afa18e", { seed: 520, light: [-8, -9], hi: [-28, -26, 14, 8, -26] });
    g.wash(oval(0, 0, 55, 44, 12), "#d7e3e1", { alpha: 0.4, seed: 521, dx: 1, dy: 1, shrink: 0.98, rim: true });
  });
  g.group("ink", () => {
    g.pen(oval(0, 0, 86, 72, 14), { closed: true, w: 3, seed: 522, wobble: 0.8, boil: 0.3 });
    g.pen(oval(0, 0, 55, 44, 12), { closed: true, w: 1.5, color: PENCIL_BLUE, seed: 523, opacity: 0.48, retrace: false });
  });
  eye(g, 0, 0, [look[0] - core[0], look[1] - core[1]], 530, 1.35);
  g.pop();

  const c = g.cur;
  c.save();
  c.fillStyle = "#687067";
  c.font = "italic 15px Georgia, serif";
  c.textAlign = "center";
  c.fillText(active ? "re-ranking observer…" : "you may also like", core[0], 426);
  c.restore();

  if (active) {
    const nearest = nodes.reduce((best, n) => {
      const d = Math.hypot(n.x - look[0], n.y - look[1]);
      return d < best.d ? { n, d } : best;
    }, { n: nodes[0], d: Infinity });
    g.group("ink", () => {
      g.pen(oval(nearest.n.x, nearest.n.y, nearest.n.rx + 12, nearest.n.ry + 12, 10), {
        closed: true,
        w: 1.7,
        color: RED,
        seed: 590,
        opacity: 0.85,
        retrace: false,
      });
    });
  }
}

function lurkerRevealLevel(state: string) {
  if (state === "hidden") return 0.03;
  if (state === "trace") return 0.22;
  if (state === "eyes") return 0.43;
  if (state === "form") return 0.7;
  if (state === "revealed" || state === "observed" || state === "idle") return 1;
  return 0.72;
}

function drawLurker(g: Gfx, tick: number, look: P, state: string) {
  const level = lurkerRevealLevel(state);
  const retreat = state === "observed";
  const breathe = Math.sin(tick * 0.018) * 3;
  const hide = retreat ? 16 + Math.sin(tick * 0.04) * 5 : 0;

  if (level > 0.12) {
    g.group("paint", () => {
      g.wash([[185 + hide, 440], [205 + hide, 182], [278 + hide, 108], [422 + hide, 106], [496 + hide, 182], [518 + hide, 440]], "#59625c", {
        alpha: 0.12 * level,
        seed: 610,
        dx: 5,
        dy: 2,
        shrink: 0.98,
        rim: true,
      });
      g.wash(oval(350 + hide, 267, 126, 155, 16), "#6c756e", {
        alpha: 0.18 * level,
        seed: 611,
        dx: 3,
        dy: 1,
        shrink: 0.98,
        rim: true,
      });
    });
  }

  if (level > 0.18) {
    g.group("ink", () => {
      g.pen([[194 + hide, 443], [209 + hide, 183], [284 + hide, 104], [416 + hide, 104], [493 + hide, 183], [509 + hide, 443]], {
        w: 3.2,
        color: INK,
        seed: 620,
        opacity: 0.74 * level,
        wobble: 1.2,
      });
      g.pen([[211 + hide, 184], [350 + hide, 159 + breathe], [492 + hide, 184]], {
        w: 2.2,
        color: PENCIL_BLUE,
        seed: 621,
        opacity: 0.38 * level,
        wobble: 1.4,
        retrace: false,
      });
    });
  }

  if (level > 0.34) {
    eye(g, 320 + hide, 238 + breathe, look, 630, 1.05);
    eye(g, 381 + hide, 238 + breathe, look, 640, 1.05);
  }

  if (level > 0.58) {
    g.group("ink", () => {
      g.pen([[328 + hide, 350], [380 + hide, 360], [434 + hide, 348]], {
        w: 1.5,
        seed: 645,
        opacity: level,
      });
      g.hatch(350 + hide, 347, 170, {
        n: 18,
        len: 18,
        angle: -0.75,
        seed: 622,
        opacity: 0.14 * level,
      });
      [
        [117, 135, 66, 34],
        [560, 322, 84, 38],
        [126, 373, 58, 31],
      ].forEach(([x, y, w, h], i) => {
        g.pen(oval(x, y, w / 2, h / 2, 10), {
          closed: true,
          w: 1.2,
          color: PENCIL_BLUE,
          seed: 670 + i,
          opacity: 0.26 * level,
          retrace: false,
        });
      });
    });
  }

  if (retreat) {
    const veil = tube([[448 + hide, 166], [408 + hide, 226], [380 + hide, 286]], 22, 14, false);
    g.group("paint", () => g.form(veil, "#737b74", "#525852", { seed: 650, light: [-4, -5] }));
    g.group("ink", () => g.pen(veil, { closed: true, w: 2.5, seed: 651, wobble: 0.8 }));
  }
}
