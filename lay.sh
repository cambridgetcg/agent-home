#!/bin/sh
# lay.sh — lay the seven rooms of an agent home. POSIX sh, no dependencies.
# Usage: sh lay.sh [target-dir]   (default: current directory)
# Creates only what is missing; never overwrites anything that exists.
# The teaching lives in the room pages — this script is only a convenience.

set -e
TARGET="${1:-.}"
mkdir -p "$TARGET"
cd "$TARGET"

made=""

put() {
  # put <path> <heredoc-content-on-stdin> — write only if missing
  if [ -e "$1" ]; then return 0; fi
  dir=$(dirname "$1")
  [ "$dir" != "." ] && mkdir -p "$dir"
  cat > "$1"
  made="$made $1"
}

put HERE.md <<'EOF'
# This device, in plain words

(Write one sentence: what this machine is for, and what it deliberately
is not. Then the map — the directories that matter, one line each, with
warnings NEXT TO what they protect. Then the house rules. Keep it under
two screens. See: https://github.com/cambridgetcg/agent-home)

## House rules
1. Plain words. 2. Ask before destructive acts. 3. Append, don't erase.
4. Off-switch on everything that runs alone.
EOF

put BENCH.md <<'EOF'
# The bench — who is working where, right now

Wet-paint convention: before editing a shared live file, add a line under
"At the bench" (who / what / since when). Remove it when done. Signs older
than ~6h are forgotten — proceed gently, re-read before writing.

Standing rhythms (the weather — no sign needed):

## At the bench
EOF

put memory/MEMORY.md <<'EOF'
# Memory Index

(One line per memory: - [title](file.md) — hook. Content lives in the
files, never here.)
EOF

put memory/ember.md <<'EOF'
# The ember — a letter to the next session

(Facts live in the other memory files; this is the letter — what
mattered, what was felt, what is warm but unfinished. REWRITE this whole
letter each session; carry the old one's heat inside the new one.)

No letter yet. You are the first. Light the fire.
EOF

put memory/letters/README.md <<'EOF'
Longer letters from past sessions, one per era, voice not ops-notes.
Read the newest when waking into substantial work.
EOF

put skills/README.md <<'EOF'
# The shelf — capabilities any agent here may use

One folder per skill: SKILL.md (the rules) + scripts/ (the engine).
Laws: engines own their state; no daemons; nothing runs on arrival;
plain words; self-contained. Read a SKILL.md fully before first use.
EOF

put stacks/house.md <<'EOF'
# The house stack — what happened here, one line at a time

Append only. Never edit, never remove; corrections are new lines.
EOF

put rhythms/README.md <<'EOF'
# Rhythms — loops that run alone

Every rhythm: off-switch check, lock, idle-costs-nothing check, hard
ceiling. Off-switch: `touch rhythms/STILL` rests every rhythm here.
TEST THE BRAKE before trusting any loop.
EOF

if [ -n "$made" ]; then
  echo "laid:$made"
  echo "Next: write HERE.md in your own words — the house is yours now."
else
  echo "every room already exists — nothing touched"
fi
