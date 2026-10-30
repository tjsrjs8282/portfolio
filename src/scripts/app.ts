import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import Lenis from "lenis";
import { startHarness } from "./harness";
import { play, setSound, isOn, onChange } from "./sound";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const root = document.documentElement;
const reduce = root.classList.contains("reduce-motion");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => Array.from(el.querySelectorAll<T>(s));

/* Below the fold, everything is set up in small separate tasks, in page
   order, so the first paint and the hero intro never wait on it. */
const queue: (() => void)[] = [];
const later = (fn: () => void) => queue.push(fn);
const idle: (cb: () => void) => void =
  "requestIdleCallback" in window ? (cb) => requestIdleCallback(cb, { timeout: 600 }) : (cb) => setTimeout(cb, 16);

/* ───────────── smooth scroll ───────────── */
let lenis: Lenis | null = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

const headerOffset = () => -(($("[data-hdr]")?.offsetHeight ?? 70) + 8);

function scrollToTarget(target: HTMLElement) {
  // force: the menu may have stopped Lenis a moment ago.
  if (lenis) lenis.scrollTo(target, { offset: headerOffset(), duration: 1.4, force: true });
  else target.scrollIntoView({ behavior: "auto", block: "start" });
  // Move keyboard focus along with the view.
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

// A link inside the menu hands focus to its target, not back to the Menu button.
let leavingMenu = false;

document.addEventListener("click", (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>("a[data-scroll]");
  if (!a) return;
  const id = a.getAttribute("href");
  if (!id?.startsWith("#")) return;
  const target = id === "#top" ? $("#top") : $(id);
  if (!target) return;
  e.preventDefault();
  const menu = $<HTMLDialogElement>("#menu");
  if (menu?.open) {
    leavingMenu = true;
    menu.close();
    lenis?.start();
  }
  scrollToTarget(target);
  history.replaceState(null, "", id === "#top" ? location.pathname : id);
});

/* ───────────── header ───────────── */
const hdr = $("[data-hdr]");
if (hdr) {
  let lastY = 0;
  const onScroll = (y: number) => {
    hdr.classList.toggle("is-solid", y > 40);
    const menuOpen = $<HTMLDialogElement>("#menu")?.open;
    const goingDown = y > lastY + 2;
    const goingUp = y < lastY - 2;
    if (!menuOpen && y > 240 && goingDown) hdr.classList.add("is-hidden");
    else if (goingUp || y <= 240) hdr.classList.remove("is-hidden");
    lastY = y;
  };
  if (lenis) lenis.on("scroll", ({ scroll }: { scroll: number }) => onScroll(scroll));
  else addEventListener("scroll", () => onScroll(scrollY), { passive: true });
  hdr.addEventListener("focusin", () => hdr.classList.remove("is-hidden"));
}

// Active nav link follows the section in view (set up once the page is idle).
later(() => {
  for (const link of $$<HTMLAnchorElement>(".hdr__nav a[href^='#']")) {
    const section = $(link.getAttribute("href")!);
    if (!section) continue;
    ScrollTrigger.create({
      trigger: section,
      start: "top 45%",
      end: "bottom 45%",
      onToggle: (self) => (self.isActive ? link.setAttribute("aria-current", "true") : link.removeAttribute("aria-current")),
    });
  }
});

// Seoul clock
const clock = $("[data-clock]");
if (clock) {
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false });
  const tick = () => (clock.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 15000);
}

/* ───────────── menu dialog ───────────── */
const menu = $<HTMLDialogElement>("#menu");
const menuOpen = $("[data-menu-open]");
if (menu && menuOpen) {
  menuOpen.addEventListener("click", () => {
    menu.showModal();
    lenis?.stop();
    play("open", 0.7);
  });
  $("[data-menu-close]", menu)?.addEventListener("click", () => menu.close());
  menu.addEventListener("close", () => {
    lenis?.start();
    if (leavingMenu) leavingMenu = false;
    else menuOpen.focus({ preventScroll: true });
  });
  menu.addEventListener("click", (e) => {
    if (e.target === menu) menu.close();
  });
}

/* ───────────── sound ───────────── */
const soundBtn = $("[data-sound]");
soundBtn?.addEventListener("click", () => setSound(!isOn()));
onChange((on) => soundBtn?.setAttribute("aria-pressed", String(on)));
if (finePointer) {
  document.addEventListener("pointerover", (e) => {
    const el = (e.target as Element).closest("a, button, [data-compare-range]");
    if (el && !(e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) play("tick", 0.55);
  });
}
document.addEventListener("click", (e) => {
  if ((e.target as Element).closest("a, button:not([data-sound])")) play("select", 0.6);
});

/* ───────────── hero ───────────── */
const hero = $("[data-hero]");
const canvas = $<HTMLCanvasElement>("[data-harness]");
let harness: ReturnType<typeof startHarness> | null = null;
// The cables start a frame after first paint; the canvas fades in anyway.
if (canvas) requestAnimationFrame(() => (harness = startHarness(canvas, reduce)));

if (hero && !reduce) {
  const words = $$("[data-hero-word]", hero);
  const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
  intro
    // y: 0 matters — GSAP reads the CSS start offset as px, which yPercent alone would leave behind.
    .fromTo(words, { yPercent: 105, y: 0 }, { yPercent: 0, duration: 1.25, stagger: 0.08 }, 0.05)
    .to($$("[data-hero-in]", hero), { opacity: 1, duration: 0.9, stagger: 0.07, ease: "power2.out" }, 0.35)
    .fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1.8, ease: "power2.out" }, 0);

  const kicker = $("[data-scramble]", hero);
  if (kicker) {
    const text = kicker.textContent ?? "";
    intro.to(kicker, { duration: 1.1, scrambleText: { text, chars: "GEONYWORKS01·", speed: 0.5 } }, 0.35);
  }

  // Scroll: the words drift apart and stretch, the cables pull taut.
  later(() =>
    gsap
      .timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.4,
          onUpdate: (self) => harness?.setProgress(self.progress),
        },
      })
      .to(".w1", { xPercent: -7, ease: "none" }, 0)
      .to(".w2", { xPercent: 9, "--wd": 125, ease: "none" }, 0)
      .to(".w3", { xPercent: -4, ease: "none" }, 0)
      // Wrappers, not the intro's own targets, so the two never fight over opacity.
      .to("[data-hero-bg]", { yPercent: 14, opacity: 0.4, ease: "none" }, 0)
      .to(".hero__row", { y: -60, opacity: 0, ease: "none" }, 0),
  );
}


/* ───────────── reveals ───────────── */
later(() => {
  if (reduce) return;
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: "expo.out", overwrite: true }),
  });

  // Manifesto: each plain word lights up as it passes through the view.
  const mws = $$(".manifesto__text > .mw");
  if (mws.length) {
    gsap.to(mws, {
      color: "#f5f2ea",
      ease: "none",
      stagger: 0.04,
      scrollTrigger: { trigger: ".manifesto__text", start: "top 82%", end: "bottom 42%", scrub: true },
    });
  }
});

/* ───────────── pipeline: pinned horizontal ───────────── */
later(() => {
  if (reduce) return;
  gsap.matchMedia().add("(min-width: 900px)", () => {
    const track = $("[data-pipe-track]");
    const vp = $("[data-pipe-viewport]");
    if (!track || !vp) return;
    const dist = () => Math.max(0, track.scrollWidth - vp.clientWidth);
    const move = gsap.to(track, {
      x: () => -dist(),
      ease: "none",
      scrollTrigger: {
        trigger: vp,
        start: "center center",
        end: () => `+=${dist()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
    gsap.to("[data-pipe-bar]", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: vp, start: "center center", end: () => `+=${dist()}`, scrub: 0.6, invalidateOnRefresh: true },
    });
    for (const card of $$("[data-stage-card]")) {
      gsap.fromTo(
        card,
        { opacity: 0.35, y: 26 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: { trigger: card, containerAnimation: move, start: "left 92%", end: "left 62%", scrub: true },
        },
      );
    }
  });
});

/* ───────────── products ───────────── */
// Index hover preview (fine pointers)
later(() => {
  const index = $("[data-index]");
  const previewBox = $("[data-preview-box]");
  const previewImg = previewBox?.querySelector("img");
  if (!index || !previewBox || !previewImg || !finePointer) return;
  gsap.set(previewBox, { xPercent: -50, yPercent: -50 });
  const qx = gsap.quickTo(previewBox, "x", { duration: 0.55, ease: "power3" });
  const qy = gsap.quickTo(previewBox, "y", { duration: 0.55, ease: "power3" });
  const qr = gsap.quickTo(previewBox, "rotation", { duration: 0.8, ease: "power3" });
  let lastX = 0;
  index.addEventListener("pointermove", (e) => {
    qx(e.clientX + 40);
    qy(e.clientY);
    qr(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.6));
    lastX = e.clientX;
  });
  for (const row of $$<HTMLAnchorElement>("[data-preview]", index)) {
    row.addEventListener("pointerenter", () => {
      const src = row.dataset.preview;
      if (src && previewImg.getAttribute("src") !== src) previewImg.src = src;
      gsap.to(previewBox, { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out", overwrite: "auto" });
    });
  }
  index.addEventListener("pointerleave", () =>
    gsap.to(previewBox, { opacity: 0, scale: 0.85, duration: 0.35, ease: "power2.out", overwrite: "auto" }),
  );
});

for (const stage of $$("[data-stage]")) {
  later(() => {
    if (reduce) return;
    const main = $(".frame--browser, .frame--poster, .frame--term", stage);
    const phone = $(".frame--phone", stage);
    if (main) {
      gsap.fromTo(
        main,
        { clipPath: "inset(14% 10% 14% 10% round 28px)", scale: 1.04 },
        {
          clipPath: "inset(0% 0% 0% 0% round 16px)",
          scale: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: stage, start: "top 88%", end: "top 38%", scrub: 0.5 },
        },
      );
    }
    if (phone) {
      gsap.fromTo(
        phone,
        { yPercent: 22 },
        { yPercent: -10, ease: "none", scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: true } },
      );
    }
  });
}

/* ───────────── harness code + counters ───────────── */
later(() => {
  if (reduce) return;
  const lines = $$("[data-code-line]");
  if (lines.length) {
    ScrollTrigger.create({
      trigger: "[data-code]",
      start: "top 75%",
      once: true,
      onEnter: () => gsap.to(lines, { opacity: 1, x: 0, duration: 0.6, stagger: 0.06, ease: "power3.out" }),
    });
  }
  for (const el of $$("[data-count]")) {
    const end = Number(el.dataset.count);
    const obj = { v: 0 };
    el.textContent = "0";
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: end,
          duration: 1.8,
          ease: "expo.out",
          onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString("en-US")),
        }),
    });
  }
});

/* ───────────── archive: before / after ───────────── */
later(() => {
  const compare = $("[data-compare]");
  const range = $<HTMLInputElement>("[data-compare-range]");
  if (!compare || !range) return;
  const set = (v: number) => compare.style.setProperty("--pos", `${v}%`);
  range.addEventListener("input", () => set(Number(range.value)));
  if (reduce) return;
  const hint = { v: 50 };
  ScrollTrigger.create({
    trigger: compare,
    start: "top 70%",
    once: true,
    onEnter: () => {
      if (range.matches(":focus")) return;
      gsap
        .timeline()
        .to(hint, { v: 82, duration: 0.9, ease: "power3.inOut", onUpdate: () => set(hint.v) })
        .to(hint, { v: 50, duration: 1.1, ease: "power3.inOut", onUpdate: () => set(hint.v) });
    },
  });
});

/* ───────────── path + footer ───────────── */
later(() => {
  if (reduce) return;
  gsap.to("[data-path-fill]", {
    scaleY: 1,
    ease: "none",
    scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 70%", scrub: true },
  });
  gsap.from("[data-footmark] span", {
    yPercent: 70,
    opacity: 0,
    stagger: 0.12,
    ease: "none",
    scrollTrigger: { trigger: "[data-footmark]", start: "top bottom", end: "bottom bottom", scrub: true },
  });
});

/* ───────────── magnetic buttons + cursor ───────────── */
later(() => {
  if (!finePointer || reduce) return;
  for (const el of $$("[data-magnetic]")) {
    const qx = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
    const qy = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      qx((e.clientX - (r.left + r.width / 2)) * 0.28);
      qy((e.clientY - (r.top + r.height / 2)) * 0.36);
    });
    el.addEventListener("pointerleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
    });
  }

  const cursor = $("[data-cursor-el]");
  const label = $("[data-cursor-label]");
  if (!cursor || !label) return;
  const cx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
  const cy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      cursor.classList.add("is-on");
      cx(e.clientX);
      cy(e.clientY);
    },
    { passive: true },
  );
  document.addEventListener("pointerover", (e) => {
    const t = (e.target as Element).closest<HTMLElement>("a, button, [data-cursor]");
    const text = t?.dataset.cursor ?? "";
    cursor.classList.toggle("is-link", !!t && !text);
    cursor.classList.toggle("has-label", !!text);
    label.textContent = text;
  });
  root.addEventListener("pointerleave", () => cursor.classList.remove("is-on"));
  addEventListener("pointerdown", () => cursor.classList.add("is-down"));
  addEventListener("pointerup", () => cursor.classList.remove("is-down"));
});

function drain() {
  const fn = queue.shift();
  if (fn) {
    fn();
    idle(drain);
    return;
  }
  // Everything exists now: put triggers in page order (the nav spy was made
  // early but sits below the pinned pipeline), measure once, and again if
  // late fonts move lines.
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  if (document.fonts && document.fonts.status !== "loaded") document.fonts.ready.then(() => ScrollTrigger.refresh());
}
idle(drain);
