# WORKLIST — the shift's soundtrack

_A manifest for a work session's music. Sibling to true-love's `SOUNDTRACK.md`
(which names a repo's identity tune); this names a **shift's arc** instead._

`worklist/1`. Doctrine inherited from `repo-tune/1` (愛 & Yu, true-love).
Each build writes both halves of score-as-code: `music/session.json` is the
canonical score; `music/session.abc` is the human-diffable melody line (one
tune per phase) that a person can read in a git diff. A human hears it via
`music/player.html`. You have no ears — you read the score.

## The template

Copy this block, fill the arc, run the command. Nothing is kept unless a
shift deserves keeping — pieces are ephemeral by default (the engine
regenerates them from the seed; only `session.json` is committed if you want
the shift on the shelf).

```
Session:  <name — a date, a branch, a ticket>
Seed:     <fix it to reproduce the shift exactly; defaults to the session name>
Arc:      <phase, phase, phase, …>   # explore build debug review ship + aliases

Build:    node bin/worklist "<arc>" --seed <seed> --session <name>
Hear:     open music/player.html      # work mode toggle = radio; Stop = off-switch
Off:      close the tab. Nothing runs on its own.
```

Or don't type the arc at all — let it **derive itself from the bench** (Room 4):

```
Build:    node bin/worklist --from-bench     # reads $HOME/BENCH.md, then ./BENCH.md
```

The wet-paint signs under *## At the bench* (`who / what / since when`) become
the arc; a sign older than ~6h is forgiven and skipped; if `$USER` is at the
bench the arc follows *their* shift. No bench, or no fresh signs → it fails
silent (a gentle line, exit 0). This reads **live** state, so the arc is of
the moment; the per-piece scores stay deterministic per `(seed, position,
phase)`. To let 愛FM follow the shift on its own, schedule `rhythms/worklist`
(Room 7) — off-switch first: `touch rhythms/STILL`.

Phase → mood (the full map lives in `rooms/8-music.md`):

| explore/understand/read | build/flow | debug/stuck | review/refactor | ship/done |
|---|---|---|---|---|
| **wander** | **settled** → bright | **fire** | **tender** | **bright** |

## A filled example

A real morning: read into an unfamiliar module, build the feature, get stuck
on a failing test, clean it up, land it green.

```
Session:  2026-07-22
Seed:     demo
Arc:      explore, build, debug, ship

Build:    node bin/worklist "explore,build,debug,ship" --seed demo
```

Which produced this shift (verbatim from the CLI):

```
  phase        mood      style·key         bpm   seed
  explore      wander    ambient G dorian  69    demo:0:explore
  build        settled   lofi E major      78    demo:1:build
  debug        fire      jazz F dorian     116   demo:2:debug
  ship         bright    classical Bb major 98   demo:3:ship
```

Read the arc as a shape: it opens **modal and searching** (dorian, slow,
drifting), settles into a **steady lo-fi build**, tightens into **jazz
tension** when the test won't pass — you play yourself against the walls —
and lands **bright and home**, the last bar dragged to the tonic. That whole
arc is legible to you without a single sound. The committed artifacts are in
[`examples/`](examples/): `session.json` (the full score), `session.abc` (the
diffable melody line), and `player.html` (the human's door). Same seed → same
shift, every time.
