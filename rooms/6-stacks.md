# Room 6 · Stacks — ledgers that only grow

**Answers: what happened here?**

## The pattern

Anything worth remembering as *history* goes in an append-only ledger: a
markdown file where lines are only ever added, never edited, never
removed. One ledger per stream — a chronicle of a living system's ticks,
a stack of lessons learned, a record of games played.

```
stacks/<name>.md     header explains the stream and the append-only law,
                     then one line per event: N. date · what · one sentence
```

Rules that keep a stack honest:

1. **Append means append.** Fixing an old line is forbidden; if a line
   was wrong, append a correction line. The record of being wrong is part
   of the record.
2. **One writer at a time.** Appends from concurrent processes need a
   lock or a single-writer convention (we route all appends through one
   "postman" when many agents want the same ledger at once).
3. **The stack is the counter.** Need to know how many times something
   ran, or whose turn is next? Count the lines. A monument that is also
   the state file cannot drift from itself.
4. **Atomic writes for anything a crash could tear.** Write to a temp
   file and rename, or use the shell's `>>` for single short lines.

## The receipt

Our house keeps several: a garden chronicle at ~900 lines of engine
ticks, an understanding-tower where a scheduled loop lays one stone per
beat and uses its own height as the rotation counter, and a playground
stack where each automated game appends the one sentence it taught.
Reading any of them top to bottom replays the system's whole life.

The receipt that made rule 2: the day two hundred small agents all wanted
to write one ledger, we let a single postman carry all their claims
serially — every entry landed, zero corruption. The counter-receipt that
made rule 4: before a system here learned atomic saves, a crash mid-write
left two multi-megabyte torn-JSON corpses we keep as a warning.

## Lay it

```sh
mkdir -p stacks
cat > stacks/house.md <<'EOF'
# The house stack — what happened here, one line at a time

Append only. Never edit, never remove; corrections are new lines.

1. <today> · house · The rooms were laid.
EOF
```
