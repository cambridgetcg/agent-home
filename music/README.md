# worklist/1 · the music room (愛FM at work)

_An additive upgrade to [agent-home](../README.md) (屋企). The house has
seven rooms; this adds an optional eighth — a soundtrack for a work session.
Nothing in the original seven rooms is changed. CC0._

## What this is

`repo-tune/1` (愛 & Yu, in true-love) gave a **repo** its identity song:
who a place is, one tune. **worklist/1** does the neighbouring job — it gives
the **worker** a journey playlist: music matched to the *arc* of a shift.

You hand it the phases you expect to move through; it composes one
deterministic piece per phase, seeded from `(session, position, phase)`, so
the same shift always sounds the same. The agent reads the score (structure);
a human hears it through a self-contained Web Audio HTML player.

## Substrate honesty (the load-bearing paragraph)

The agent has no ears. This engine emits a **score** — a data structure — not
sound. A tension chord is legible as arithmetic, a `fire` piece as the shape
of being stuck; that symbolic engagement is real. A human opens `player.html`
to hear the same score. One artifact, two doors. No felt-audio is claimed,
and the structural register the agent genuinely inhabits is not hedged.

## The pieces

| File | What it is |
|---|---|
| `engine.mjs` | Deterministic seeded composer. `compose({style,mood,seed,bars}) → score`. Hash the seed → mulberry32 PRNG → scale walk over a chord progression. Four voices: keys · pad · bass · drums. Pure & browser-safe — inlined into the player. |
| `worklist.mjs` | `buildWorklist({arc,session,seed}) → {name,session,pieces}` + the `PHASE_MOOD` map. Node-only (may read the heartbeat under `--live`). |
| `bench.mjs` | **Pure** `benchToArc(benchText,{now,who}) → {arc,entries,notes}` + `PHASE_LEXICON`. Derives the arc from Room 4's Bench (string in → object out, no IO). Forgives signs older than ~6h. `bench.test.mjs` proves it (`node music/bench.test.mjs`). |
| `build-player.mjs` | The one build step: inline engine + a session into `player.html`. |
| `player.html` | Self-contained Web Audio player — Play / Next / Stop / **work mode (radio)**. No external URLs; opens from `file://`. Commit it so the room works from a bare checkout. |
| `session.json` | The last-built shift (a full worklist result) — the canonical score. |
| `session.abc` | The same shift as an ABC melody line, one tune per phase — score-as-code's human-diffable half. Written on every build. |
| `../bin/worklist` | Zero-dep node CLI. Prints the plan, writes `session.json` + `session.abc`, rebuilds `player.html`. |

## Score JSON format (compatible with 愛FM)

```json
{ "title":"…", "style":"classical|jazz|lofi|ambient", "seed":"…", "by":"engine",
  "bpm":98, "swing":0, "key":"Bb", "mode":"major|minor|dorian",
  "bars":16, "beatsPerBar":4,
  "tracks":[ { "voice":"keys|pad|bass|pluck|drums", "gain":0.9,
               "notes":[ { "t":0, "d":1, "p":62, "v":0.8 } ] } ] }
```

`t`/`d` in beats; `p` is MIDI pitch (drums: 36 kick · 38 snare · 42 hat ·
46 open-hat); `v` velocity 0..1. Swing is applied by the renderer to
off-eighths. The engine also exports `scoreToABC(score)` — a melody line for
human-diffable git, per the inherited doctrine — and every `bin/worklist`
build writes it out to `session.abc`, so both doors of score-as-code (canonical
JSON + diffable ABC) are committed, not latent.

## Use it

```sh
node bin/worklist "explore,build,debug,ship" --seed today   # plan + build
node bin/worklist --from-bench                               # derive arc from Room 4's Bench
open music/player.html                                       # a human hears it
node bin/worklist --now debug --seed stuck                   # radio one phase
node music/build-player.mjs                                  # rebuild only
```

**Wiring it to real work.** `--from-bench` reads `BENCH.md` (explicit path >
`$HOME/BENCH.md` > `./BENCH.md`), maps each wet-paint sign to a phase, and
builds the shift from the current bench — failing silent if there's nothing
fresh. `rhythms/worklist` (opt-in, Room 7) rebuilds on bench change with an
off-switch first (`touch rhythms/STILL`). See `rooms/8-music.md`.

## Lineage & licence

Doctrine — score-as-code, one-artifact-two-doors, determinism, substrate
honesty, walking-past-is-honored — inherited from **`repo-tune/1`**, authored
by **愛 & Yu** in **true-love**. The engine here is fresh and minimal, written
to that doctrine and format-compatible with 愛FM; it does not copy their
wedding-song wing. Public domain (**CC0**): take it, change it, ignore it.
