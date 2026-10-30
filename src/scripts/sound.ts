// Opt-in sound. Nothing is downloaded until the visitor presses the Sound
// button, and every visit starts silent.

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, "/");
const SFX = ["tick", "select", "open", "power"] as const;
type Sfx = (typeof SFX)[number];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let music: AudioBufferSourceNode | null = null;
let musicBuf: AudioBuffer | null = null;
const buffers = new Map<Sfx, AudioBuffer>();
let on = false;
let loading: Promise<void> | null = null;
let lastTick = 0;
const listeners = new Set<(on: boolean) => void>();

async function decode(name: string) {
  const res = await fetch(`${BASE}sound/${name}.mp3`);
  return ctx!.decodeAudioData(await res.arrayBuffer());
}

function load() {
  if (loading) return loading;
  loading = (async () => {
    await Promise.all(SFX.map(async (s) => buffers.set(s, await decode(s))));
    musicBuf = await decode("score");
  })();
  return loading;
}

function startMusic() {
  if (!ctx || !musicBuf || !musicGain || music) return;
  music = ctx.createBufferSource();
  music.buffer = musicBuf;
  music.loop = true;
  music.connect(musicGain);
  musicGain.gain.cancelScheduledValues(ctx.currentTime);
  musicGain.gain.setValueAtTime(0, ctx.currentTime);
  musicGain.gain.linearRampToValueAtTime(0.42, ctx.currentTime + 2.4);
  music.start();
}

function stopMusic() {
  if (!ctx || !music || !musicGain) return;
  const m = music;
  music = null;
  musicGain.gain.cancelScheduledValues(ctx.currentTime);
  musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime);
  musicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
  m.stop(ctx.currentTime + 0.65);
}

export function play(name: Sfx, gain = 1) {
  if (!on || !ctx || !master) return;
  const buf = buffers.get(name);
  if (!buf) return;
  if (name === "tick") {
    const now = performance.now();
    if (now - lastTick < 70) return;
    lastTick = now;
  }
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  g.gain.value = gain;
  src.buffer = buf;
  src.connect(g).connect(master);
  src.start();
}

export async function setSound(next: boolean) {
  on = next;
  listeners.forEach((fn) => fn(on));
  if (next) {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0;
      musicGain.connect(master);
    }
    if (ctx.state === "suspended") await ctx.resume();
    await load();
    if (!on) return;
    play("power", 0.8);
    startMusic();
  } else {
    stopMusic();
  }
}

export const isOn = () => on;
export const onChange = (fn: (on: boolean) => void) => listeners.add(fn);

document.addEventListener("visibilitychange", () => {
  if (!ctx) return;
  if (document.hidden) ctx.suspend();
  else if (on) ctx.resume();
});
