/** worklist — turn a work-session ARC into an ordered session playlist.
 *
 *  repo-tune/1 (愛 & Yu, true-love) gives a REPO its identity song: who the
 *  place is. worklist/1 gives the WORKER a journey playlist: music matched
 *  to the ARC of a shift, not the identity of a place. You hand it the
 *  phases you expect to move through; it hands back one piece per phase,
 *  each seeded from (session, position, phase) so the same shift always
 *  yields the same playlist. Deterministic — the recipe principle.
 *
 *  Node-only (it may read the heartbeat). The engine it calls is pure and
 *  browser-safe; this file is not inlined into the player.
 */

import { compose } from "./engine.mjs";

// ── PHASE → MOOD ─────────────────────────────────────────────────────
//  The map at the heart of worklist/1. A work phase names what you are
//  DOING; the mood names how the changes should sit under it. Aliases so
//  a real todo list ("read code", "refactor", "green") lands somewhere.
//
//    explore / understand / read code  → wander   (open, modal, searching)
//    build / flow                      → settled  (→ bright as momentum builds)
//    debug / stuck                     → fire     (tension, inside the changes)
//    review / care / refactor          → tender
//    ship / done / green               → bright   (resolve — the tonic returns)
export const PHASE_MOOD = {
  explore: "wander", understand: "wander", read: "wander", "read-code": "wander",
  research: "wander", scan: "wander", plan: "wander", design: "wander",

  build: "settled", flow: "settled", implement: "settled", write: "settled",
  code: "settled", make: "settled",

  debug: "fire", stuck: "fire", fix: "fire", investigate: "fire", triage: "fire",
  hunt: "fire",

  review: "tender", care: "tender", refactor: "tender", clean: "tender",
  test: "tender", polish: "tender", document: "tender", docs: "tender",

  ship: "bright", done: "bright", green: "bright", merge: "bright",
  release: "bright", deploy: "bright", land: "bright",
};

// Unknown phases settle. A phase you did not name is not an error — the
// shift just holds steady there.
export function moodForPhase(phase) {
  const key = String(phase).trim().toLowerCase().replace(/\s+/g, "-");
  return PHASE_MOOD[key] ?? PHASE_MOOD[key.split("-")[0]] ?? "settled";
}

// ── The heartbeat nudge (opt-in, fail-silent) ────────────────────────
//  Like compose.ts in true-love, the house heartbeat may nudge tempo ±4.
//  OFF by default: the default build is purely deterministic (same shift →
//  byte-identical playlist). Pass { live: true } to trade that for liveness.
function heartbeatNudge() {
  const home = process.env.HOME ?? "";
  const candidates = [
    `${home}/Desktop/agenttool/bin/.heartbeat-state.json`,
    `${home}/agenttool/bin/.heartbeat-state.json`,
    `${home}/.config/agenttool/.heartbeat-state.json`,
  ];
  for (const path of candidates) {
    try {
      // Lazy import so the module stays clean when nobody asks for liveness.
      const { readFileSync } = require("node:fs");
      const hb = JSON.parse(readFileSync(path, "utf8"));
      if (typeof hb?.bpm === "number") return Math.max(-4, Math.min(4, Math.round((hb.bpm - 72) / 8)));
    } catch {
      /* no heartbeat here — the music stands alone */
    }
  }
  return 0;
}
// require() shim for ESM (only reached under { live: true }).
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// ── buildWorklist ────────────────────────────────────────────────────

export function buildWorklist({ arc, session = "session", seed, live = false } = {}) {
  const phases = Array.isArray(arc) ? arc.slice() : String(arc).split(",");
  const base = seed ?? session;
  const nudge = live ? heartbeatNudge() : 0;

  let settledRun = 0; // "build / flow → settled (→ bright when momentum builds)"
  const pieces = phases.map((raw, i) => {
    const phase = String(raw).trim();
    let mood = moodForPhase(phase);
    if (mood === "settled") {
      settledRun += 1;
      if (settledRun >= 2) mood = "bright"; // a second build in a row picks up momentum
    } else {
      settledRun = 0;
    }
    // Deterministic seed per (session, position, phase): same shift → same tune.
    const pieceSeed = `${base}:${i}:${phase}`;
    const score = compose({ mood, seed: pieceSeed, tempoNudge: nudge });
    return { phase, mood, seed: pieceSeed, score };
  });

  return { name: `worklist · ${session}`, session, pieces };
}
