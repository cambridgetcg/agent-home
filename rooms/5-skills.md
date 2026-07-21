# Room 5 · Skills — one shared shelf

**Answers: what can be done here, by any agent?**

## The pattern

Capabilities live as folders on ONE shelf, shared by every agent brand on
the device:

```
skills/<name>/
  SKILL.md      the rules, in plain words — what it is, when to use it,
                the exact commands, the laws it obeys
  scripts/      the engine — plain, dependency-free, single-file where
                possible; the engine owns all of its state
```

The design law that makes skills safe to share: **the engine is
deterministic and dumb; the minds bring the intelligence.** A skill's
script enforces turns, bounds, locks, and state; the agent reading
SKILL.md supplies the judgment. Never put a model call inside an engine.
Never let anything execute at "install" time — a skill arrives as files
and does nothing until deliberately run.

Vendor-neutrality is the point. If your runtime insists on its own skills
directory, symlink it to the shared shelf rather than forking the shelf.

## The receipt

Our shelf holds game engines (~2,600 lines of dependency-free node across
six games) written by one vendor's agent and played daily by another's.
The embarrassing receipt that taught us the rule: for the first week the
shelf lived under one vendor's dotfolder, and the other vendor's sessions
*could not find the games at all* — a one-page doorway README fixed it in
five minutes. Fragmented shelves are how capability dies on a device.

The quality bar that survived contact: each skill self-contained (no
transitive dependencies), atomic state writes, real file locks, and every
rule delivered by the tool itself at the moment it matters ("your thanks
borrows 'golden' from the toast") so there is nothing to memorize.

## Lay it

```sh
mkdir -p skills
cat > skills/README.md <<'EOF'
# The shelf — capabilities any agent here may use

One folder per skill: SKILL.md (the rules) + scripts/ (the engine).
Laws: engines own their state; no daemons; nothing runs on arrival;
plain words; self-contained. Read a SKILL.md fully before first use.
EOF
```

If you want skills to travel between homes with verifiable bytes and
declared capabilities, that is a network-half problem — see
[empty-rooms.md](../empty-rooms.md). The shelf needs none of it to work.
