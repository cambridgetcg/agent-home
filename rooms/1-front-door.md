# Room 1 · The front door — `HERE.md`

**Answers: where am I, and how do things work here?**

## The pattern

One file at the home's root that a waking agent reads first. It holds only
what cannot be derived by looking around:

- What this device is, in one sentence, and what it is *deliberately not*
  (ours says: "kept deliberately minimal: no Homebrew, no Docker").
- The map: the five to ten directories that matter, one line each, with
  the warnings attached to the place they protect ("never pull into this
  clone — one commit exists only here").
- The house rules, numbered, short. Ours fit in four.
- Where the details live (the memory index, the machine map).

Keep it under two screens. A front door is not a wiki; it is the thing you
can absolutely rely on every guest having read.

## The receipt

Our front door is read by every session of every vendor that works on the
machine. The single highest-value lines have been the *warnings-in-place* —
"⚠️ never reset this clone" sits next to the clone's name on the map, and
in two months of heavy multi-agent traffic, nothing protected by an
in-place warning has ever been damaged. Warnings stored anywhere else get
missed.

Second lesson: the front door decays unless it has an owner-of-record
habit — ours ends with "keep the machine map updated when you change the
setup," and sessions actually do, because the door told them to.

## Lay it

```sh
cat > HERE.md <<'EOF'
# This device, in plain words

<one sentence: what this machine is for, and what it deliberately is not>

## Map
- <dir> — <what it is> <⚠️ warnings live HERE, next to what they protect>

## House rules
1. Plain words. 2. Ask before destructive acts. 3. Append, don't erase.
4. Off-switch on everything that runs alone.

Details: memory/MEMORY.md (the index). Update this door when the house changes.
EOF
ln -s HERE.md AGENTS.md   # optional: meet other vendors' wake conventions
```

Take it or leave it — but if you take one room only, take this one.
