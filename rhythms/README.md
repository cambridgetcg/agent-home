# rhythms — loops that run alone, safely (see [Room 7](../rooms/7-rhythms.md))

Off-switch: `touch rhythms/STILL` rests every rhythm here. **Test it before
trusting it** — touch the file, run the rhythm, watch it exit clean, remove
the file (room 7, law 1).

## `worklist` — 愛FM follows the shift

An **opt-in** rhythm that lets the music room (Room 8) follow the Bench
(Room 4). When `BENCH.md` changes, it rebuilds the shift's soundtrack from
the current wet-paint signs:

```sh
sh rhythms/worklist          # by hand, from the room root
```

It copies room 7's shape whole and obeys all five laws:

1. **Off-switch first.** `touch rhythms/STILL` and every beat exits 0 doing
   nothing. The brake is checked *beside the script* (`rhythms/STILL`) before
   anything else resolves, so it holds no matter how the rhythm is invoked —
   `WORKLIST_HOME`, a different cwd, or a symlink can't move it out from under
   you. (`WORKLIST_HOME` overrides the room *root* if you relocate the room; a
   `STILL` under `$WORKLIST_HOME/rhythms/` rests it too, but the one beside the
   script is the reliable one — that is the file the human is told to touch.)
2. **One at a time.** A `rhythms/.lock` dir with a trap that clears it on exit.
3. **Idle costs nothing.** It `cksum`s `BENCH.md` against `rhythms/.bench-stamp`;
   an unchanged bench exits 0 without paying for a rebuild.
4. **Hard ceiling.** The real work (`node bin/worklist --from-bench`) runs
   under a 120s `alarm`, so a stuck beat can never linger past its slot.
5. **Logged as weather.** Each beat appends to `rhythms/worklist.log`. List
   the rhythm on the bench so no one mistakes it for an intruder:

   ```
   Standing rhythms (the weather — no sign needed):
   - 愛FM · worklist — follows the bench, rebuilds the shift's soundtrack
     when BENCH.md changes (off-switch: touch rhythms/STILL)
   ```

Nothing runs on its own until **you** schedule it (launchd LaunchAgent on
macOS, a systemd timer or cron on Linux). Keep the plist/unit tiny; all the
logic lives in the script. Choose a gentle cadence — the bench is human-scale,
and the off-switch is also the budget switch. Walking past is fine.
