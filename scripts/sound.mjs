// Original UI sound + an ambient score, generated with ElevenLabs and mastered
// with ffmpeg. Build-time only: the key never reaches the browser, and the page
// downloads nothing until a visitor turns sound on.
//   npm run assets:sound   (ELEVENLABS_API_KEY in .env.local; takes in .cache/sound are reused)
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

process.loadEnvFile(".env.local");
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) throw new Error("ELEVENLABS_API_KEY missing in .env.local");

const RAW = ".cache/sound";
const OUT = "public/sound";
mkdirSync(RAW, { recursive: true });
mkdirSync(OUT, { recursive: true });

const HEADERS = { "xi-api-key": KEY, "Content-Type": "application/json" };

/** kind sfx → /v1/sound-generation, kind music → /v1/music. lufs = mastering target. */
const SOUNDS = {
  tick: {
    kind: "sfx", sec: 0.5, pi: 0.65, lufs: -27, ch: 1,
    text: "A single very soft, very short digital tick, like a precise mechanical keyboard switch heard from afar, clean minimal UI hover sound",
  },
  select: {
    kind: "sfx", sec: 0.7, pi: 0.6, lufs: -22, ch: 1,
    text: "Short clean modern UI confirm sound, two quick rising soft synth blips, warm and friendly, no reverb tail",
  },
  open: {
    kind: "sfx", sec: 0.9, pi: 0.55, lufs: -24, ch: 1,
    text: "Quick airy whoosh with a faint glassy digital shimmer, a sleek interface panel sliding open",
  },
  power: {
    kind: "sfx", sec: 1.6, pi: 0.5, lufs: -21, ch: 2,
    text: "Warm analog synthesizer powering on, a soft low hum swelling up into a bright clean chord, cinematic tech intro, short",
  },
  score: {
    kind: "music", sec: 48, lufs: -24, ch: 2, loop: true,
    text: [
      "Minimal cinematic ambient electronic loop for a late-night product studio.",
      "Warm analog synth pads, a soft pulsing arpeggio, gentle sub bass, faint tape texture.",
      "Focused, hopeful, forward-moving, 92 BPM, no drums drops, no build-ups, steady from start to end so it loops.",
      "Instrumental only, no vocals.",
    ].join(" "),
  },
};

async function generate(name, s) {
  const raw = join(RAW, `${name}.mp3`);
  if (existsSync(raw)) return raw;
  let res;
  if (s.kind === "music") {
    res = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ prompt: s.text, music_length_ms: s.sec * 1000, model_id: "music_v1" }),
    });
  } else {
    const url = "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128";
    const body = { text: s.text, duration_seconds: s.sec, prompt_influence: s.pi, model_id: "eleven_text_to_sound_v2" };
    res = await fetch(url, { method: "POST", headers: HEADERS, body: JSON.stringify(body) });
    if (!res.ok && (res.status === 400 || res.status === 422)) {
      const { model_id, ...plain } = body;
      res = await fetch(url, { method: "POST", headers: HEADERS, body: JSON.stringify(plain) });
    }
  }
  if (!res.ok) throw new Error(`${name}: ElevenLabs ${res.status} ${(await res.text()).slice(0, 200)}`);
  writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
  return raw;
}

function master(name, s, raw) {
  const out = join(OUT, `${name}.mp3`);
  const norm = `loudnorm=I=${s.lufs}:TP=-1.5:LRA=11`;
  let args;
  if (s.loop) {
    // Seamless bed: crossfade the last 3 s back into the first 3 s.
    const c = 3;
    args = ["-i", raw, "-filter_complex",
      `[0:a]${norm},asplit[a][b];[a]atrim=${c},asetpts=PTS-STARTPTS[main];[b]atrim=0:${c},asetpts=PTS-STARTPTS[head];[main][head]acrossfade=d=${c}:c1=tri:c2=tri[o]`,
      "-map", "[o]", "-ac", String(s.ch), "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "96k", out];
  } else {
    const lead = "silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.01";
    args = ["-i", raw, "-af", `${lead},${norm},afade=t=out:st=${Math.max(0, s.sec - 0.08)}:d=0.08`,
      "-ac", String(s.ch), "-ar", "44100", "-c:a", "libmp3lame", "-b:a", s.ch === 1 ? "64k" : "96k", out];
  }
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`ffmpeg mastering failed: ${name}`);
  return out;
}

for (const [name, s] of Object.entries(SOUNDS)) {
  const raw = await generate(name, s);
  const out = master(name, s, raw);
  console.log(`  ✓ ${name.padEnd(7)} ${String(s.sec + "s").padEnd(5)} ${(statSync(out).size / 1024).toFixed(0).padStart(4)} KB  → ${out}`);
}
