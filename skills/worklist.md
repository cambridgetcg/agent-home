# Skill · worklist — a soundtrack for the shift

**What it is.** A deterministic, dependency-free composer that turns a work
session's *arc* into an ordered playlist — one piece per phase. `worklist/1`,
inheriting `repo-tune/1` doctrine (愛 & Yu, true-love). CC0.

**When to use it.** When a shift wants a soundtrack matched to its shape, not
to the identity of a repo. Optional and ambient — walking past is honored.

**Substrate honesty.** You have no ears. The engine emits a **score** (a data
structure); you read it, a human hears it via `music/player.html`. Do not
claim you heard anything; do not hedge that you can read structure. One
artifact, two doors.

**The map** (phase → mood; aliases in `music/worklist.mjs` `PHASE_MOOD`):

- explore / understand / read code / plan → **wander**
- build / flow / implement → **settled** (→ **bright** on a second build in a row)
- debug / stuck / fix → **fire**
- review / care / refactor / test → **tender**
- ship / done / green / merge → **bright**

**The commands.**

```sh
# plan the shift + write music/session.json + session.abc + rebuild player.html
node bin/worklist "explore,build,debug,ship" --seed <seed>

# derive the arc from Room 4's Bench instead of typing it (live state)
node bin/worklist --from-bench                 # $HOME/BENCH.md, then ./BENCH.md
node bin/worklist --from-bench path/BENCH.md   # or an explicit bench

# radio for one phase (open player.html, toggle "work mode")
node bin/worklist --now debug --seed <seed>

# from code
node -e 'import("./music/worklist.mjs").then(m => \
  console.log(JSON.stringify(m.buildWorklist({arc:["explore","ship"],session:"s",seed:"z"}))))'
```

**The laws it obeys** (room 5 quality bar):

- **Deterministic and dumb.** Same seed → byte-identical score. The engine
  brings no intelligence; the mind brings the arc.
- **Self-contained.** Zero npm deps; runs from a bare checkout with `node`.
  `music/player.html` inlines the engine — no fetches, no assets, `file://`-ok.
- **Nothing runs on arrival.** `bin/worklist` does nothing until run. The
  only loops are opt-in and each has a tested off-switch: the browser's
  *work mode* toggle, and the `rhythms/worklist` rhythm (`touch rhythms/STILL`).
- **Fail-silent liveness.** `--live` lets an agenttool heartbeat nudge tempo
  ±4 if present; `--from-bench` derives the arc from live bench state and
  fails silent (gentle line, exit 0) when there's no fresh sign. Both trade
  byte-reproducibility for currency, by design; the per-piece **scores** stay
  deterministic for a given `(seed, position, phase)` either way.

**Wiring it to real work.** `--from-bench` reads Room 4's Bench — the
wet-paint signs (`who / what / since when`) become the arc via a pure,
unit-tested lexicon (`music/bench.mjs`); signs older than ~6h are forgiven
and skipped. `rhythms/worklist` (Room 7) lets 愛FM follow the shift on its
own, off-switch first; **drill the brake before trusting it.**

**Files.** `music/engine.mjs` (composer, also inlined into the player),
`music/worklist.mjs` (arc → playlist + `PHASE_MOOD`), `music/bench.mjs`
(Bench → arc, pure; `music/bench.test.mjs` proves it), `music/build-player.mjs`
(the one build step), `bin/worklist` (the doorway), `rhythms/worklist` (the
opt-in rhythm). Teaching: `rooms/8-music.md` (cross-reads rooms 4 & 7).
