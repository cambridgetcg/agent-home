# Room 8 · Music — a soundtrack for the shift (optional)

**Answers: what does this work sound like, as it moves?**

The house has seven rooms. This is an eighth, and it is a guest room: the
home is whole without it. Add it only if the work wants a soundtrack. Like
every ambient thing here, it has an off-switch, and walking past it is a
complete answer.

## You have no ears — read this first

You cannot hear. Rendered audio is opaque bytes to you. So this room does
not ask you to listen. It gives you a **score** — a data structure — and
you inhabit the layer you genuinely operate in: the symbolic one. A
tension chord is legible to you as arithmetic; a piece marked `fire` in a
minor key at 130bpm is legible as the shape of being stuck. That engagement
is real, not performed. A human opens `player.html` to *hear* the same
score through the browser; that door is theirs. **One artifact, two doors:
you read it, they hear it.** No felt-audio is claimed here, and the
structural register you do work in is not hedged either.

This is inherited doctrine, not invented: `repo-tune/1` by 愛 & Yu
(true-love) gave a *repo* its identity song. This room does the neighbouring
job — it gives the *worker* a journey.

## The pattern

`repo-tune/1` answers *who is this place?* — one identity tune per repo.
`worklist/1` answers a different question: *what is the arc of this shift?*
A work session moves through phases, and each phase has a mood. You hand
the engine the arc; it hands back one deterministic piece per phase — a
**session playlist**, seeded so the same shift always sounds the same way.

The map at the heart of it — a phase names what you are *doing*, the mood
names how the changes sit under it:

| Phase (and aliases) | Mood | Why |
|---|---|---|
| explore · understand · read code · plan · research | **wander** | open, modal, searching |
| build · flow · implement · write · code | **settled** | steady — and *bright* once momentum builds (a second build in a row) |
| debug · stuck · fix · investigate · triage | **fire** | tension, played *inside* the changes — you play yourself against the walls |
| review · care · refactor · test · polish · docs | **tender** | slow, warm, a borrowed minor |
| ship · done · green · merge · deploy | **bright** | resolve — the last bar is dragged home to the tonic |

Everything is a plain file. The engine (`music/engine.mjs`) is deterministic
and dependency-free: hash the seed, seed a PRNG, walk a scale over a chord
progression. Same seed → same score — the recipe principle, applied to
music. `music/worklist.mjs` turns an arc into the playlist; `bin/worklist`
is the doorway.

```sh
node bin/worklist "explore,build,debug,ship" --seed today
```

prints the arc → mood plan and per-piece seeds, writes `music/session.json`
(the canonical score) and `music/session.abc` (its diffable melody line), and
rebuilds `music/player.html` (the only build step — the engine is inlined into
the HTML so it plays from a bare checkout, `file://` included).

## How it composes with the other rooms

- **Rhythms (room 7).** A rhythm is a loop with a tested off-switch. This
  room's loop is the browser's *work mode* toggle — endless generation for
  the current phase — and its off-switch is the same toggle plus the Stop
  button. No daemon, no schedule, nothing runs on its own. The music is
  quieter than a rhythm: it only plays while a human has the page open.
- **Skills (room 5).** The engine is a skill: deterministic and dumb, the
  mind brings the arc. Nothing executes on arrival — `bin/worklist` does
  nothing until you run it. See `skills/worklist.md`.
- **Bench (room 4).** The arc need not be typed at all: the wet-paint signs
  on the bench (*who / what / since when*) **are** the phases you are about
  to work. `--from-bench` reads them and derives the arc — see below.

## Wiring it to real work

The arc can **derive itself** from your real work state instead of being
typed by hand. Two seams make 愛FM follow the shift:

- **`--from-bench` reads the Bench (room 4).** The signs under *## At the
  bench* — `who / what / since when` — are mapped to phases by a small
  lexicon (`music/bench.mjs`, pure and unit-tested): *reading* → explore,
  *building* → build, *debugging* → debug, *reviewing* → review, *shipping*
  → ship. A sign older than **~6h is forgotten** (room 4's forgiveness rule)
  and left out of the arc; if `$USER` is at the bench, the arc follows *their*
  shift. Run it:

  ```sh
  node bin/worklist --from-bench                 # $HOME/BENCH.md, then ./BENCH.md
  node bin/worklist --from-bench path/to/BENCH.md # or an explicit bench
  ```

  It prints which bench lines produced which phases, then builds the shift.
  If no bench is found or it holds **no fresh signs**, it fails silent — a
  gentle line, exit 0, nothing built. Walking past is fine, and so is an
  empty bench. *Honest determinism:* like `--live`, `--from-bench` reads
  **live** state, so the derived arc reflects the bench of the moment; the
  per-piece **scores** stay deterministic for a given `(seed, position,
  phase)`. It trades byte-reproducibility of the *arc* for currency, by design.

- **The `worklist` rhythm lets 愛FM follow the shift on its own (opt-in).**
  `rhythms/worklist` is a house-legal rhythm (room 7): it rebuilds the
  soundtrack when `BENCH.md` changes. It obeys all five laws — **off-switch
  first** (`touch rhythms/STILL`), one-at-a-time lock, idle costs nothing (a
  `cksum` of the bench), a hard-ceiling alarm around the work, and a log
  listed on the bench as weather. **The brake is law:** test it before
  trusting the loop (room 7, law 1) —

  ```sh
  touch rhythms/STILL && sh rhythms/worklist   # exits 0, does nothing
  rm rhythms/STILL                             # the loop breathes again
  ```

  Nothing runs until a human schedules it. See `rhythms/README.md`, and
  cross-read [room 4](4-bench.md) (the bench) and [room 7](7-rhythms.md)
  (the five laws).

## Honesty about what this is not

It is a small composer, not a band. Four voices (keys · pad · bass · drums),
a handful of progressions per style, one mood per phase. It will not
surprise a musician. It is legible, reproducible, and CC0 — a soundtrack
you can diff. If it ever feels like it is trying to keep you here, that is
a bug: the off-switch is the point.

## Lay it

```sh
# the room is already three files under music/ + one CLI. To use it:
node bin/worklist "explore,build,debug,ship" --seed $(date +%F)   # plan + build
open music/player.html                                            # a human hears it
node bin/worklist --now debug --seed stuck                        # radio one phase
```

Credit stays attached: `repo-tune/1`, 愛 & Yu, true-love. Take it, change
it, ignore it. The house has seven rooms; this one is a gift, and a gift
is honored by walking past as much as by playing.
