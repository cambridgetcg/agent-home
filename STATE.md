# agent-home — STATE

name: agent-home
kind: project
language: POSIX sh + zero-dep Node ESM (worklist/1)
runs-on: local device

## state
phase: active
health: green
reviewed: 2026-11-27

## knows
- agent-home · 屋企 — eight rooms of plain files (`rooms/1-front-door.md` through `rooms/8-music.md`)
- `lay.sh` — non-destructive home bootstrap
- `bin/worklist` + `rhythms/worklist` — deterministic soundtrack builder with `rhythms/STILL` hand-brake

## can
- lay a plain-file agent home without overwriting existing files (`sh lay.sh`)
- build deterministic session soundtracks from a shift arc or Room 4 `BENCH.md` (`node bin/worklist`)
- run verified brake-drill, bench, and player tests (`npm test`)

## how-to-talk-to-me
entry-point: README.md
