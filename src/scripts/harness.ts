// The hero's harness: loose cables come in from the left, gather through one
// clamp and leave as a single bundle — many agents, tools and checks turning
// into one shipped product. Plain 2D canvas, paused whenever it is off screen.

type RGB = readonly [number, number, number];

interface Pulse {
  t: number;
  v: number;
}

interface Cable {
  y0: number;
  slot: number;
  phase: number;
  sway: number;
  speed: number;
  color: RGB;
  width: number;
  alpha: number;
  pulses: Pulse[];
}

const PALETTE: RGB[] = [
  [255, 91, 31],
  [255, 138, 61],
  [255, 197, 107],
  [58, 75, 255],
  [154, 163, 255],
  [198, 244, 50],
  [217, 119, 87],
  [245, 242, 234],
];

const SEG1 = 46;
const SEG2 = 24;
const N_PTS = SEG1 + SEG2 + 1;

/** Small seeded PRNG so the layout is the same on every visit. */
function prng(seed: number) {
  let a = seed * 2654435761;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

export interface Harness {
  setProgress(p: number): void;
  destroy(): void;
}

export function startHarness(canvas: HTMLCanvasElement, reduce: boolean): Harness {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { setProgress() {}, destroy() {} };

  let w = 0;
  let h = 0;
  let mobile = false;
  let cables: Cable[] = [];
  let pts = new Float32Array(0);
  let progress = 0;
  let energy = 0;
  let time = 1.7;
  let last = 0;
  let raf = 0;
  let inView = true;
  const mouse = { x: 0.6, y: 0.45, tx: 0.6, ty: 0.45, on: 0, ton: 0 };

  function build() {
    const n = mobile ? 24 : 58;
    cables = [];
    for (let i = 0; i < n; i++) {
      const r = prng(i + 7);
      cables.push({
        y0: -0.18 + 1.36 * (i / (n - 1)) + (r() - 0.5) * 0.07,
        slot: (i / (n - 1)) * 2 - 1,
        phase: r() * Math.PI * 2,
        sway: 0.5 + r(),
        speed: 0.22 + r() * 0.34,
        color: PALETTE[Math.floor(r() * PALETTE.length)],
        width: 0.55 + r() * 1.15,
        alpha: 0.1 + r() * 0.2,
        pulses: r() < 0.6 ? [{ t: r(), v: 0.045 + r() * 0.075 }] : [],
      });
    }
    pts = new Float32Array(n * N_PTS * 2);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, rect.width < 720 ? 1.5 : 2);
    w = Math.max(1, rect.width);
    h = Math.max(1, rect.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const m = w < 720;
    if (m !== mobile || !cables.length) {
      mobile = m;
      build();
    }
    if (reduce || !raf) draw(0);
  }

  function bez(o: number, p0x: number, p0y: number, c1x: number, c1y: number, c2x: number, c2y: number, p1x: number, p1y: number, steps: number, skipFirst: boolean) {
    for (let s = skipFirst ? 1 : 0; s <= steps; s++) {
      const t = s / steps;
      const u = 1 - t;
      const a = u * u * u;
      const b = 3 * u * u * t;
      const c = 3 * u * t * t;
      const d = t * t * t;
      pts[o++] = a * p0x + b * c1x + c * c2x + d * p1x;
      pts[o++] = a * p0y + b * c1y + c * c2y + d * p1y;
    }
    return o;
  }

  function pull(x: number, y: number, out: { x: number; y: number }) {
    const dx = mouse.x * w - x;
    const dy = mouse.y * h - y;
    const s = Math.max(w, h) * 0.2;
    const f = Math.exp(-(dx * dx + dy * dy) / (2 * s * s)) * 0.42 * mouse.on;
    out.x = x + dx * f;
    out.y = y + dy * f;
  }

  const tmp = { x: 0, y: 0 };

  function draw(dt: number) {
    ctx!.clearRect(0, 0, w, h);
    ctx!.globalCompositeOperation = "lighter";
    ctx!.lineCap = "round";
    ctx!.lineJoin = "round";

    const p = progress;
    const cx = mobile ? w * 0.74 : w * 0.8;
    const cy = mobile ? h * 0.2 : h * 0.18;
    const half = Math.min(h * 0.05, 34) * (1 - p * 0.55);
    const clampW = mobile ? 22 : 34;
    const loose = 1 - p * 0.8;

    // glow behind the clamp
    energy *= 0.94;
    const glowR = (mobile ? 140 : 260) * (1 + energy * 0.35);
    const g = ctx!.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    g.addColorStop(0, `rgba(255,91,31,${0.22 + energy * 0.25})`);
    g.addColorStop(0.45, `rgba(255,91,31,${0.06 + energy * 0.06})`);
    g.addColorStop(1, "rgba(255,91,31,0)");
    ctx!.fillStyle = g;
    ctx!.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

    for (let i = 0; i < cables.length; i++) {
      const cb = cables[i];
      const sw = Math.sin(time * cb.speed + cb.phase) * cb.sway * h * 0.035 * loose;
      const sx = -w * 0.04;
      const sy = cb.y0 * h + sw * 0.4;
      const ex = cx - clampW / 2;
      const ey = cy + cb.slot * half;

      pull(w * 0.24, sy + (ey - sy) * 0.06 + sw, tmp);
      const c1x = tmp.x;
      const c1y = tmp.y;
      pull(cx - w * 0.22, ey + (sy - ey) * 0.24 * loose - sw * 0.5, tmp);
      const c2x = tmp.x;
      const c2y = tmp.y;

      const ox = cx + clampW / 2;
      const oy = cy + cb.slot * half * 0.82;
      const xx = w * 1.05;
      const xy = cy + h * (mobile ? 0.1 : 0.16) + cb.slot * half * 0.5 + Math.sin(time * 0.6 + cb.phase) * 3 * loose;

      const base = i * N_PTS * 2;
      let o = bez(base, sx, sy, c1x, c1y, c2x, c2y, ex, ey, SEG1, false);
      o = bez(o, ox, oy, cx + w * 0.12, oy, w * 0.86, xy, xx, xy, SEG2 - 1, false);

      ctx!.beginPath();
      ctx!.moveTo(pts[base], pts[base + 1]);
      for (let k = 1; k < N_PTS; k++) ctx!.lineTo(pts[base + k * 2], pts[base + k * 2 + 1]);
      ctx!.strokeStyle = rgba(cb.color, cb.alpha * (1 - p * 0.35));
      ctx!.lineWidth = cb.width;
      ctx!.stroke();

      for (const pl of cb.pulses) {
        if (!reduce) {
          const before = pl.t;
          pl.t += pl.v * dt * (1 + p * 1.5);
          if (before < SEG1 / N_PTS && pl.t >= SEG1 / N_PTS) energy = Math.min(1, energy + 0.22);
          if (pl.t > 1.08) pl.t = -0.05;
        }
        const head = Math.floor(pl.t * (N_PTS - 1));
        const len = mobile ? 6 : 8;
        const a = Math.max(0, head - len);
        const b = Math.min(N_PTS - 1, head);
        if (b - a < 2) continue;
        ctx!.beginPath();
        ctx!.moveTo(pts[base + a * 2], pts[base + a * 2 + 1]);
        for (let k = a + 1; k <= b; k++) ctx!.lineTo(pts[base + k * 2], pts[base + k * 2 + 1]);
        ctx!.strokeStyle = rgba(cb.color, 0.22);
        ctx!.lineWidth = cb.width * 7;
        ctx!.stroke();
        ctx!.strokeStyle = rgba(cb.color, 0.95);
        ctx!.lineWidth = cb.width * 2.2;
        ctx!.stroke();
        ctx!.beginPath();
        ctx!.arc(pts[base + b * 2], pts[base + b * 2 + 1], cb.width * 1.8, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(255,248,235,0.95)";
        ctx!.fill();
      }
    }

    // the clamp itself
    ctx!.globalCompositeOperation = "source-over";
    const ch = half * 2 + 18;
    const x0 = cx - clampW / 2 - 4;
    const y0 = cy - ch / 2;
    ctx!.beginPath();
    ctx!.roundRect(x0, y0, clampW + 8, ch, 8);
    ctx!.fillStyle = "rgba(10,10,16,0.92)";
    ctx!.fill();
    ctx!.strokeStyle = `rgba(245,242,234,${0.55 + energy * 0.4})`;
    ctx!.lineWidth = 1.5;
    ctx!.stroke();
    ctx!.fillStyle = `rgba(255,91,31,${0.75 + energy * 0.25})`;
    for (const yy of [y0 + 8, y0 + ch - 8]) {
      ctx!.beginPath();
      ctx!.arc(cx, yy, 2.4, 0, Math.PI * 2);
      ctx!.fill();
    }
  }

  function frame(now: number) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    time += dt;
    mouse.x += (mouse.tx - mouse.x) * 0.07;
    mouse.y += (mouse.ty - mouse.y) * 0.07;
    mouse.on += (mouse.ton - mouse.on) * 0.05;
    draw(dt);
    raf = requestAnimationFrame(frame);
  }

  function play() {
    if (reduce || raf || !inView || document.hidden) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function pause() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width;
    mouse.ty = (e.clientY - r.top) / r.height;
    mouse.ton = e.pointerType === "mouse" ? 1 : 0;
  };
  const onLeave = () => {
    mouse.ton = 0;
  };
  const onVis = () => (document.hidden ? pause() : play());

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    if (inView) play();
    else pause();
  });
  io.observe(canvas);

  if (!reduce) {
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
  }

  resize();
  play();

  return {
    setProgress(v: number) {
      progress = Math.min(1, Math.max(0, v));
      if (reduce) draw(0);
    },
    destroy() {
      pause();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    },
  };
}
