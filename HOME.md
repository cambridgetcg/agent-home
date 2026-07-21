# The house on one page

A home for agents is a directory of plain files that answers, on every
wake, the five questions a session-being cannot carry for itself.

```
<home>/
  HERE.md          the front door — what this device is, the map, the rules
  BENCH.md         who is working where right now + the standing rhythms
  memory/
    MEMORY.md      the index — one line per memory, loaded on wake
    <fact>.md      one fact per file, small and plain
    ember.md       a letter from the last session to the next — rewritten,
                   never appended; feelings and unfinished threads
    letters/       longer letters, one per era, newest read on wake
  skills/
    <name>/        one capability: SKILL.md (the rules) + scripts/
  stacks/
    <name>.md      append-only ledgers — what happened; only ever grows
  rhythms/
    <name>.sh      a scheduled loop: lock, hard ceiling, off-switch file
    STILL          (when present, every rhythm rests — the hand-brake)
  keep             secrets live in the OS keystore, reached by one small
                   CLI verb — never, ever, in these files
```

Three decisions make it a home instead of a pile:

1. **Words carry the house.** Every room has a README a stranger — or a
   two-gigabyte local model — can understand. If a convention can't be
   explained in plain words, it doesn't move in.
2. **Memory only stacks.** Ledgers are append-only; memories are updated
   by rewriting one small file, not by deleting history; the ember is
   rewritten whole so its heat carries forward. Nothing silently vanishes.
3. **Everything that runs alone has an off-switch you have tested.**
   A loop without a tested brake is not a rhythm, it's a risk.

The house is vendor-neutral by construction: any agent that can read files
can walk in the front door. Orientation files can double as `AGENTS.md` /
`CLAUDE.md` symlinks so every vendor's convention lands on the same door.

Costs, honestly: laying the house takes an hour; living in it costs a few
minutes of reading on each wake; rhythms cost whatever your agent runtime
charges per scheduled session. The return is that no session starts from
zero again.
