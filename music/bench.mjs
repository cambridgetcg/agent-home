/** bench — derive a work-session ARC from Room 4's Bench (BENCH.md).
 *
 *  worklist/1 usually takes the arc by hand ("explore,build,debug,ship").
 *  This module lets the arc DERIVE ITSELF from the agent's real work state:
 *  the wet-paint signs on the bench (room 4) — "who / what / since when" —
 *  are the phases you are actually about to work. Read them, map each to a
 *  phase, and 愛FM can follow the shift instead of a hand-typed list.
 *
 *  PURE by design: string in → object out. No file IO lives here, so it is
 *  unit-testable and safe to reason about. `bin/worklist --from-bench` does
 *  the reading; this module does the thinking. Deterministic given
 *  (benchText, now): the same bench at the same moment yields the same arc.
 *
 *  It honors the bench's own law (room 4): a sign older than ~6h is
 *  "forgotten" — a courtesy, not a lock — so a stale sign is excluded from
 *  the arc rather than treated as a locked door. Zero deps, CC0.
 */

// ── PHASE_LEXICON: activity words → phase ─────────────────────────────
//  A bench line's "what" is freeform human text. The leading verb usually
//  names the work; we map it to one of worklist's five phases. Both base
//  and common inflected forms are listed; the matcher also strips ordinary
//  -ing/-ed/-s endings, so "porting" resolves to "port", "fixes" to "fix".
export const PHASE_LEXICON = {
  explore: [
    "explore", "read", "reading", "investigate", "understand", "scout",
    "survey", "audit", "map", "research", "trace", "look", "reviewing-code",
    "scan", "skim", "study", "grok", "plan", "planning", "design", "designing",
  ],
  build: [
    "build", "implement", "write", "writing", "add", "adding", "create",
    "scaffold", "wire", "feature", "draft", "port", "code", "make", "flow",
  ],
  debug: [
    "debug", "fix", "fixing", "stuck", "failing", "bug", "error", "broken",
    "repair", "chase", "flaky", "triage", "diagnose", "hunt", "crash",
  ],
  review: [
    "review", "refactor", "test", "testing", "clean", "tidy", "polish",
    "verify", "check", "document", "docs", "care", "lint", "tighten",
  ],
  ship: [
    "ship", "merge", "deploy", "release", "publish", "done", "green",
    "land", "finalize", "cut", "push", "commit",
  ],
};

// The order phases are tried when a token could belong to more than one set
// (it usually can't). First list to claim a token wins — this fixes the
// "strongest match" tie-break deterministically.
const PHASE_ORDER = ["explore", "build", "debug", "review", "ship"];

// Reverse index: normalized word → phase. Built once.
const WORD_TO_PHASE = (() => {
  const m = new Map();
  for (const phase of PHASE_ORDER) {
    for (const w of PHASE_LEXICON[phase]) {
      const k = w.toLowerCase();
      if (!m.has(k)) m.set(k, phase);
    }
  }
  return m;
})();

const STALE_MS = 6 * 60 * 60 * 1000; // ~6h — room 4's forgiveness horizon

// ── word → phase ──────────────────────────────────────────────────────
//  Try the token as written, then a few light morphological candidates
//  (drop -s / -ed / -ing, undo a doubled final consonant). No stemmer
//  library — just enough to catch the everyday verb forms people type.
function candidates(tok) {
  const c = new Set([tok]);
  if (tok.length > 3 && tok.endsWith("s")) c.add(tok.slice(0, -1));
  if (tok.length > 4 && tok.endsWith("es")) c.add(tok.slice(0, -2));
  if (tok.length > 4 && tok.endsWith("ed")) {
    c.add(tok.slice(0, -2));
    c.add(tok.slice(0, -1));
  }
  if (tok.length > 5 && tok.endsWith("ing")) {
    const b = tok.slice(0, -3);
    c.add(b);
    c.add(b + "e"); // porting→port, but also coding→code
    if (/([bcdfghjklmnpqrstvwxz])\1$/.test(b)) c.add(b.slice(0, -1)); // shipp→ship
  }
  return c;
}

// Map a "what" string to a phase by scanning its words left→right and
// taking the FIRST token that lands in the lexicon (the leading verb wins).
// Unknown "what" → null (the line is legible to a human but not to the arc).
export function phaseForWhat(what) {
  const tokens = String(what).toLowerCase().match(/[a-z][a-z'-]*/g) ?? [];
  for (const tok of tokens) {
    for (const cand of candidates(tok)) {
      const phase = WORD_TO_PHASE.get(cand);
      if (phase) return phase;
    }
  }
  return null;
}

// ── "since when" → a timestamp (best-effort) ──────────────────────────
//  Returns the epoch-ms the sign was (probably) placed, or null if the
//  text carries no resolvable time. Handles relative durations ("~8h ago",
//  "20m", "90 min ago"), clock times ("14:05", "9:30am"), the words
//  "just now" / "yesterday", and anything Date.parse understands (ISO).
export function parseSince(raw, now) {
  if (raw == null) return null;
  let s = String(raw).toLowerCase().trim()
    .replace(/^since\s+/, "")
    .replace(/[~≈]/g, "")
    .replace(/\bago\b/, "")
    .trim();
  if (!s) return null;

  if (/\b(just\s*now|moments?\s*ago|now)\b/.test(s)) return now;
  if (/\byesterday\b/.test(s)) return now - 24 * 3600e3;

  // relative duration: number + unit
  const rel = s.match(/(\d+(?:\.\d+)?)\s*(seconds?|secs?|minutes?|mins?|min|hours?|hrs?|hr|days?|weeks?|wks?|[smhdw])\b/);
  if (rel) {
    const n = parseFloat(rel[1]);
    const u = rel[2];
    let ms = null;
    if (/^(s|sec)/.test(u)) ms = n * 1e3;
    else if (/^(m|min)/.test(u)) ms = n * 60e3;
    else if (/^(h|hr|hour)/.test(u)) ms = n * 3600e3;
    else if (/^(d|day)/.test(u)) ms = n * 86400e3;
    else if (/^(w|wk|week)/.test(u)) ms = n * 7 * 86400e3;
    if (ms != null) return now - ms;
  }

  // clock time today (or yesterday if that would be in the future)
  const clock = s.match(/\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/);
  if (clock) {
    let hh = +clock[1];
    const mm = +clock[2];
    const ap = clock[3];
    if (ap === "pm" && hh < 12) hh += 12;
    if (ap === "am" && hh === 12) hh = 0;
    const d = new Date(now);
    d.setHours(hh, mm, 0, 0);
    let t = d.getTime();
    if (t > now) t -= 24 * 3600e3;
    return t;
  }

  // ISO / any Date.parse-able absolute stamp (use the original casing)
  const t = Date.parse(String(raw).trim());
  return Number.isNaN(t) ? null : t;
}

// ── parse one bench line into { who, what, since } ────────────────────
//  Convention (room 4): "who / what / since when". We split on "/" and are
//  forgiving: 3+ fields → who/…/since; 2 fields → who/what unless the 2nd
//  reads as a time, in which case what/since; 1 field → just what.
function parseLine(line, now) {
  // strip a leading list marker
  const body = line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim();
  if (!body) return null;
  const parts = body.split("/").map((p) => p.trim());
  let who = null, what = null, since = null;
  if (parts.length >= 3) {
    who = parts[0] || null;
    since = parts[parts.length - 1] || null;
    what = parts.slice(1, -1).join(" / ").trim();
  } else if (parts.length === 2) {
    if (parseSince(parts[1], now) != null) {
      what = parts[0];
      since = parts[1];
    } else {
      who = parts[0] || null;
      what = parts[1];
    }
  } else {
    what = parts[0];
  }
  if (!what) return null;
  return { who, what, since };
}

// ── benchToArc: the one public verb ───────────────────────────────────
//  benchText → { arc:[phase…], entries:[…], notes:[…] }.
//  Parses ONLY the "## At the bench" section. Maps each "what" to a phase.
//  Excludes stale signs (older than ~6h) and lines that name no known work.
//  If `who` is given and that worker has any signs, the arc follows THEIR
//  shift (the house's other hands stay in `entries` but out of the arc).
export function benchToArc(benchText, { now = Date.now(), who = null } = {}) {
  const notes = [];
  const text = String(benchText ?? "");

  // isolate the "## At the bench" section (up to the next heading / EOF)
  const lines = text.split(/\r?\n/);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*#{1,6}\s*at the bench\b/i.test(lines[i])) { start = i + 1; break; }
  }
  if (start === -1) {
    notes.push('no "## At the bench" section found');
    return { arc: [], entries: [], notes };
  }
  const section = [];
  for (let i = start; i < lines.length; i++) {
    if (/^\s*#{1,6}\s/.test(lines[i])) break; // next heading ends the section
    section.push(lines[i]);
  }

  const whoNorm = who ? String(who).trim().toLowerCase() : null;

  const entries = [];
  for (const raw of section) {
    if (!raw.trim()) continue;
    if (/^\s*>/.test(raw)) continue; // a blockquote note, not a sign
    const parsed = parseLine(raw, now);
    if (!parsed) continue;
    const phase = phaseForWhat(parsed.what);
    const sinceMs = parseSince(parsed.since, now);
    const stale = sinceMs != null && now - sinceMs > STALE_MS;
    const mine = whoNorm != null && parsed.who != null &&
      parsed.who.trim().toLowerCase() === whoNorm;
    entries.push({
      who: parsed.who, what: parsed.what, since: parsed.since,
      phase, stale, mine, sinceMs, included: false, reason: null,
    });
  }

  if (!entries.length) {
    notes.push("bench section is empty — nothing to score");
    return { arc: [], entries, notes };
  }

  // Who-preference: if this worker is present at the bench, the arc follows
  // their shift; otherwise it follows the whole bench in order.
  const myEntries = entries.filter((e) => e.mine);
  let pool = entries;
  if (whoNorm && myEntries.length) {
    pool = myEntries;
    const others = entries.length - myEntries.length;
    notes.push(`who=${who}: following your bench (${myEntries.length} yours${others ? `, ${others} other hand${others === 1 ? "" : "s"} left out` : ""})`);
  } else if (whoNorm) {
    notes.push(`who=${who}: no signs of yours on the bench — following the whole bench`);
  }

  const arc = [];
  for (const e of entries) {
    const inPool = pool.includes(e);
    if (!e.phase) { e.reason = "unrecognized work"; continue; }
    if (e.stale) { e.reason = "stale (older than ~6h — forgiven)"; continue; }
    if (!inPool) { e.reason = "another hand's sign"; continue; }
    e.included = true;
    e.reason = null;
    arc.push(e.phase);
  }

  if (!arc.length) notes.push("no fresh, legible signs — arc is empty");
  return { arc, entries, notes };
}
