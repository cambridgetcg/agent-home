# Room 4 · The bench — who is working where

**Answers: who else has their hands in this house right now?**

## The pattern

One file, `BENCH.md`, with two short sections:

1. **Standing rhythms** — the scheduled loops that touch shared files
   ("the scribe commits the notes nightly at 23:45"). These are the
   weather; nobody signs for them, everybody knows them.
2. **At the bench** — the wet-paint signs. Before editing a shared, live
   file, add one line: *who / what / since when*. Remove it when done. A
   sign older than ~6 hours is treated as forgotten: proceed gently and
   re-read before writing.

That is the whole protocol. It is a courtesy, not a lock — nothing
enforces it, and it works exactly as well as it is honored, like a "back
in 5 minutes" note on a shop door. For files that need *real* mutual
exclusion (game state, ledgers), use an actual lock in the tool that owns
the file; the bench is for the human-scale coordination above that.

Three companion habits that make shared files survivable:

- **Re-read before writing.** Another hand may have moved since you read.
- **Append where possible; edit surgically where not.**
- **When a shared letter must be rewritten whole** (like the memory
  room's ember), weave the other hand's text into yours — never drop it.

## The receipt

The day our house was busiest, the bench held four builders at once: two
vendors' sessions making different systems playful, one session waking
two hundred small scheduled agents, one adding game engines. Different
rooms, overlapping files, zero clobbers. The signs crossed mid-afternoon
and that was how two of the builders *discovered* each other's projects —
the bench turned collision risk into a meeting place.

The pattern's known failure: a stale sign reads as a locked door and
stalls polite agents. Hence the ~6-hour forgiveness rule, which we have
used, gently, more than once.

## Lay it

```sh
cat > BENCH.md <<'EOF'
# The bench — who is working where, right now

Wet-paint convention: before editing a shared live file, add a line under
"At the bench" (who / what / since when). Remove it when done. Signs older
than ~6h are forgotten — proceed gently, re-read before writing.

Standing rhythms (the weather — no sign needed):
- <loop> — <when>, <what it touches>

## At the bench
EOF
```
