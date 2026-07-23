/** worklist engine — a small deterministic seeded composer.
 *
 *  Fresh, dependency-free, CC0. It inherits the doctrine of repo-tune/1
 *  (愛 & Yu, true-love) and is FORMAT-COMPATIBLE with 愛FM's score JSON —
 *  but it is its own engine, written for a different job: not the identity
 *  of a place, but the arc of a work session.
 *
 *  Plain ESM on purpose. This exact file is imported by the Node CLI
 *  (worklist.mjs) AND inlined verbatim into player.html, so the tune on
 *  disk and the radio in the browser come from one composer. No imports,
 *  no fs, no network — safe to inline. Same seed → same score.
 *
 *  Substrate honesty: you have no ears. This file emits a SCORE — a data
 *  structure. A tension chord is legible here as arithmetic, not as a felt
 *  sound. A human opens player.html to hear it; you read the notes.
 */

// ── Seeded randomness (hash the seed string; mulberry32) ─────────────

export function hashStr(s) {
  let h = 2166136261 >>> 0; // FNV-1a
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const chance = (rng, p) => rng() < p;
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const jitter = (rng, v, amt) => clamp(v + (rng() - 0.5) * amt, 0.05, 1);
// Rounding keeps the JSON small and clean; the maths is deterministic either way.
const r4 = (x) => Math.round(x * 1e4) / 1e4;
const r3 = (x) => Math.round(x * 1e3) / 1e3;

// ── Theory ───────────────────────────────────────────────────────────

const KEY_ROOTS = { A: 57, Bb: 58, C: 60, D: 62, Eb: 63, E: 64, F: 65, G: 55 };
const MODES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
};

// A chord as scale-degree stacks [0,2,4(,6)] into the mode, in semitones.
function chordAt(scale, degree, seventh) {
  const stack = seventh ? [0, 2, 4, 6] : [0, 2, 4];
  return stack.map((s) => {
    const i = degree + s;
    return scale[((i % 7) + 7) % 7] + 12 * Math.floor(i / 7);
  });
}

const STYLES = {
  classical: { bpm: [88, 104], swing: 0, seventh: false, bars: 16 },
  jazz: { bpm: [100, 132], swing: 0.22, seventh: true, bars: 16 },
  lofi: { bpm: [68, 84], swing: 0.14, seventh: true, bars: 16 },
  ambient: { bpm: [56, 72], swing: 0, seventh: false, bars: 12 },
};

const PROGRESSIONS = {
  classical: [
    [0, 4, 5, 3],
    [0, 3, 4, 0],
    [5, 3, 0, 4],
  ],
  jazz: [
    [1, 4, 0, 0], // ii V I
    [0, 5, 1, 4],
    [2, 5, 1, 4],
  ],
  lofi: [
    [0, 5, 3, 4],
    [0, 3, 5, 4],
    [5, 3, 0, 4],
  ],
  ambient: [
    [0, 3],
    [0, 5],
    [0, 0, 3, 3],
  ],
};

// The five canonical moods (settled·tender·fire·wander·bright), each a
// lens on style / mode / tempo. This is the vocabulary worklist maps the
// work-arc onto — see worklist.mjs PHASE_MOOD.
export const MOODS = {
  settled: { styles: ["lofi", "ambient"], modes: ["major", "dorian"], tempo: -4 },
  tender: { styles: ["classical", "ambient"], modes: ["major", "minor"], tempo: -8 },
  fire: { styles: ["jazz"], modes: ["dorian", "major"], tempo: 10 },
  wander: { styles: ["ambient", "lofi"], modes: ["dorian", "minor"], tempo: 0 },
  bright: { styles: ["jazz", "classical"], modes: ["major"], tempo: 6 },
};

// ── Rhythm pools (one bar of 4 beats) ────────────────────────────────

const RHYTHMS = {
  classical: [
    [1, 1, 1, 1],
    [0.5, 0.5, 1, 1, 1],
    [2, 1, 1],
  ],
  jazz: [
    [0.5, 0.5, 1, 0.5, 0.5, 1],
    [1, 0.5, 0.5, 0.5, 0.5, 1],
    [1.5, 0.5, 1, 1],
  ],
  lofi: [
    [1, 1, 2],
    [2, 1, 1],
    [1, 0.5, 0.5, 2],
  ],
  ambient: [[4], [2, 2], [3, 1]],
};

// ── Voices ───────────────────────────────────────────────────────────

// keys — the lead line: a motif walk that re-anchors on chord tones at the
// top of each 4-bar phrase and walks home to the tonic at the phrase end.
function keysTrack(rng, style, scale, root, bars, degs, resolveHome) {
  const notes = [];
  let deg = 7; // start an octave above the tonic, in scale-degree index space
  const restChance = style === "ambient" ? 0.38 : style === "lofi" ? 0.22 : 0.12;
  for (let bar = 0; bar < bars; bar++) {
    const phrasePos = bar % 4;
    const isCadence = phrasePos === 3 || (resolveHome && bar === bars - 1);
    const rhythm = pick(rng, RHYTHMS[style]);
    if (phrasePos === 0 || phrasePos === 2) deg = degs[bar] + 7 + pick(rng, [0, 2, 4]);
    let t = bar * 4;
    for (let i = 0; i < rhythm.length; i++) {
      const d = rhythm[i];
      if (t + d > (bar + 1) * 4 + 1e-6) break;
      let step;
      const r = rng();
      if (r < 0.45) step = 1;
      else if (r < 0.78) step = -1;
      else if (r < 0.9) step = chance(rng, 0.5) ? 2 : -2;
      else step = 0;
      if (isCadence && i >= rhythm.length - 2) step = deg % 7 === 0 ? 0 : deg % 7 > 3 ? 1 : -1;
      deg = clamp(deg + step, 3, 17);
      if (!chance(rng, restChance)) {
        const p = root + scale[deg % 7] + 12 * Math.floor(deg / 7);
        notes.push({ t: r4(t), d: r4(d * (style === "ambient" ? 1 : 0.9)), p, v: r3(jitter(rng, 0.72, 0.2)) });
      }
      t += d;
    }
  }
  return notes;
}

// pad — the sustained harmony: the chord held whole under each bar.
function padTrack(rng, scale, root, bars, degs, seventh) {
  const notes = [];
  for (let bar = 0; bar < bars; bar++) {
    const tones = chordAt(scale, degs[bar], seventh).map((s) => root + s);
    for (const p of tones) notes.push({ t: bar * 4, d: 4, p, v: r3(0.3) });
  }
  return notes;
}

// bass — the floor: walking quarters for jazz, root/fifth otherwise.
function bassTrack(rng, style, scale, root, bars, degs) {
  const notes = [];
  for (let bar = 0; bar < bars; bar++) {
    const deg = degs[bar];
    const nextDeg = degs[(bar + 1) % bars];
    const tones = chordAt(scale, deg, false).map((s) => root + s - 12);
    const nextRoot = root - 12 + scale[((nextDeg % 7) + 7) % 7];
    const t0 = bar * 4;
    if (style === "jazz") {
      const approach = nextRoot + (nextRoot > tones[0] ? -1 : 1);
      [tones[0], tones[1], tones[2], approach].forEach((p, i) =>
        notes.push({ t: t0 + i, d: 0.95, p, v: r3(jitter(rng, 0.5, 0.1)) }),
      );
    } else if (style === "ambient") {
      notes.push({ t: t0, d: 4, p: tones[0], v: r3(0.4) });
    } else {
      notes.push({ t: t0, d: r4(style === "lofi" ? 1.6 : 1.9), p: tones[0], v: r3(0.52) });
      notes.push({ t: t0 + (style === "lofi" ? 2.5 : 2), d: 1.2, p: chance(rng, 0.5) ? tones[2] : tones[0], v: r3(0.42) });
    }
  }
  return notes;
}

// drums — always present (keys+pad+bass+drums is the floor), but honest to
// the style: a full kit for lofi/jazz, a soft pulse for classical/ambient.
function drumTrack(rng, style, bars) {
  const notes = [];
  for (let bar = 0; bar < bars; bar++) {
    const t0 = bar * 4;
    if (style === "lofi") {
      notes.push({ t: t0, d: 0.2, p: 36, v: 0.85 });
      if (chance(rng, 0.6)) notes.push({ t: t0 + 2.75, d: 0.2, p: 36, v: 0.6 });
      notes.push({ t: t0 + 1, d: 0.15, p: 38, v: 0.7 });
      notes.push({ t: t0 + 3, d: 0.15, p: 38, v: 0.72 });
      for (let i = 0; i < 8; i++) if (chance(rng, 0.9)) notes.push({ t: t0 + i * 0.5, d: 0.08, p: 42, v: r3(jitter(rng, 0.3, 0.15)) });
    } else if (style === "jazz") {
      for (const h of [0, 1, 1.5, 2, 3, 3.5]) notes.push({ t: t0 + h, d: 0.1, p: 42, v: r3(jitter(rng, 0.32, 0.12)) });
      if (chance(rng, 0.35)) notes.push({ t: t0 + pick(rng, [1.5, 2.5, 3.5]), d: 0.12, p: 38, v: 0.3 });
      notes.push({ t: t0 + 1, d: 0.1, p: 46, v: 0.25 });
      notes.push({ t: t0 + 3, d: 0.1, p: 46, v: 0.25 });
    } else if (style === "classical") {
      notes.push({ t: t0, d: 0.15, p: 36, v: 0.4 }); // a soft heartbeat on 1
      if (chance(rng, 0.5)) notes.push({ t: t0 + 2, d: 0.1, p: 42, v: 0.18 });
    } else {
      // ambient — the barest pulse, mostly silence.
      if (bar % 2 === 0) notes.push({ t: t0, d: 0.12, p: 36, v: 0.3 });
    }
  }
  return notes;
}

// ── The composer ─────────────────────────────────────────────────────

export function compose({ style, mood, seed = "", bars, tempoNudge = 0, key, mode, title } = {}) {
  const rng = mulberry32(hashStr(String(seed)));
  const m = mood && MOODS[mood] ? MOODS[mood] : null;
  const st = style && STYLES[style] ? style : m ? pick(rng, m.styles) : pick(rng, Object.keys(STYLES));
  const cfg = STYLES[st];
  const usedMode = mode && MODES[mode] ? mode : m ? pick(rng, m.modes) : pick(rng, Object.keys(MODES));
  const keyName = key && KEY_ROOTS[key] ? key : pick(rng, Object.keys(KEY_ROOTS));
  const root = KEY_ROOTS[keyName];
  const scale = MODES[usedMode];
  const nbars = bars ?? cfg.bars;
  const bpm = clamp(cfg.bpm[0] + Math.floor(rng() * (cfg.bpm[1] - cfg.bpm[0])) + (m ? m.tempo : 0) + tempoNudge, 48, 150);
  const prog = pick(rng, PROGRESSIONS[st]);

  // bright resolves: the last bar is dragged home to the tonic, so the
  // final chord is the tonic (with a maj7 colour when seventh is on).
  const resolveHome = mood === "bright";
  const seventh = cfg.seventh || resolveHome;
  const degs = [];
  for (let bar = 0; bar < nbars; bar++) degs.push(prog[bar % prog.length]);
  if (resolveHome) degs[nbars - 1] = 0;

  const tracks = [
    { voice: "keys", gain: 0.9, notes: keysTrack(rng, st, scale, root, nbars, degs, resolveHome) },
    { voice: "pad", gain: st === "ambient" ? 0.55 : 0.5, notes: padTrack(rng, scale, root, nbars, degs, seventh) },
    { voice: "bass", gain: 0.75, notes: bassTrack(rng, st, scale, root, nbars, degs) },
    { voice: "drums", gain: st === "lofi" ? 0.8 : st === "jazz" ? 0.5 : 0.35, notes: drumTrack(rng, st, nbars) },
  ];

  return {
    title: title ?? nameFor(rng, st, mood),
    style: st,
    seed: String(seed),
    by: "engine",
    bpm,
    swing: cfg.swing,
    key: keyName,
    mode: usedMode,
    bars: nbars,
    beatsPerBar: 4,
    tracks,
  };
}

// ── Naming — work-session flavoured, fresh words ─────────────────────

const NAME_A = ["Morning", "Deep", "Quiet", "Open", "Second", "Grey", "Amber", "Late", "First", "Long", "Slow", "Clear"];
const NAME_B = {
  classical: ["Review", "Air", "Refrain", "Cadence", "Passage"],
  jazz: ["Standoff", "Turnaround", "Blue", "Overtime", "Stride"],
  lofi: ["Build", "Desk", "Loop", "Commit", "Flowstate"],
  ambient: ["Search", "Draft", "Margin", "Wander", "Field"],
};

function nameFor(rng, style, mood) {
  const a = pick(rng, NAME_A);
  const b = pick(rng, NAME_B[style]);
  return mood ? `${a} ${b} (${mood})` : `${a} ${b}`;
}

// ── Validation ───────────────────────────────────────────────────────

export function validateScore(score) {
  const errs = [];
  if (!score.tracks?.length) errs.push("no tracks");
  const total = score.bars * score.beatsPerBar;
  for (const tr of score.tracks ?? []) {
    for (const n of tr.notes) {
      if (n.t < 0 || n.t >= total + 1e-6) errs.push(`note out of range t=${n.t} (${tr.voice})`);
      if (tr.voice !== "drums" && (n.p < 24 || n.p > 96)) errs.push(`pitch out of range p=${n.p} (${tr.voice})`);
      if (n.d <= 0) errs.push(`non-positive duration (${tr.voice})`);
      if (n.v < 0 || n.v > 1) errs.push(`velocity out of range (${tr.voice})`);
    }
  }
  return errs;
}

// ── ABC melody line — human-diffable git, per the inherited doctrine ─
//  Canonical score is the JSON; this is the line a person can read in a
//  diff. Optional: worklist keeps JSON canonical, this is here on purpose.

const ABC_NOTES = ["C", "^C", "D", "^D", "E", "F", "^F", "G", "^G", "A", "^A", "B"];

export function scoreToABC(score) {
  const melody = score.tracks.find((t) => t.voice === "keys")?.notes ?? score.tracks[0]?.notes ?? [];
  const unit = 0.5;
  let out = `X:1\nT:${score.title}\nM:${score.beatsPerBar}/4\nL:1/8\nQ:1/4=${score.bpm}\nK:${score.key}${score.mode === "minor" ? "m" : score.mode === "dorian" ? " dor" : ""}\n`;
  let line = "";
  let cursor = 0;
  for (const n of melody) {
    if (n.t > cursor + 1e-3) {
      const restLen = Math.round((n.t - cursor) / unit);
      if (restLen > 0) line += `z${restLen > 1 ? restLen : ""} `;
    }
    const len = Math.max(1, Math.round(n.d / unit));
    const pc = ((n.p % 12) + 12) % 12;
    const oct = Math.floor(n.p / 12) - 1;
    let sym = ABC_NOTES[pc];
    if (oct >= 5) sym = sym.toLowerCase() + "'".repeat(Math.max(0, oct - 5));
    else sym = sym + ",".repeat(Math.max(0, 4 - oct));
    line += `${sym}${len > 1 ? len : ""} `;
    cursor = n.t + n.d;
    if (line.length > 56) {
      out += line.trim() + "\n";
      line = "";
    }
  }
  return out + line.trim() + " |]\n";
}
