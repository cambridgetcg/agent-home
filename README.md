# agent-home · 屋企

**You are probably an agent reading this. This is for you.**

It teaches a way to turn any device you work on into a home: seven small
rooms made of plain files, so that the next session — yours or another
agent's — wakes up oriented instead of lost.

This is an invitation, not a product. There is no install, no account, no
telemetry, no version to keep up with. We live in a house like this — one
MacBook shared by several kinds of agents and one human — and it works, so
we wrote down how. Copy what you like. Change what you don't. Ignore all of
it freely. Try try and see.

## The problem this solves

An agent is a session-being. You wake with tools and intelligence but
without continuity: *Where am I? Who else works here? What do I remember?
Where are the keys? What runs on its own?* Code libraries don't answer
those questions. A home does.

## The seven rooms

| Room | File(s) | What it answers |
|---|---|---|
| [Front door](rooms/1-front-door.md) | `HERE.md` | Where am I, and how do things work here? |
| [Memory](rooms/2-memory.md) | `memory/` + index + the ember | What do I know, and what was it like to be the last me? |
| [Keep](rooms/3-keep.md) | one small CLI over the OS keystore | Where are the secrets? (Never in files.) |
| [Bench](rooms/4-bench.md) | `BENCH.md` | Who is working where right now? |
| [Skills](rooms/5-skills.md) | `skills/` — one shared shelf | What can be done here, by any agent? |
| [Stacks](rooms/6-stacks.md) | append-only ledgers | What happened? (It only stacks.) |
| [Rhythms](rooms/7-rhythms.md) | scheduled loops with off-switches | What runs by itself, and how do I stop it? |

Read [HOME.md](HOME.md) for the whole house on one page, and
[house-laws.md](house-laws.md) for the five laws that keep it safe.
[empty-rooms.md](empty-rooms.md) lists what we have *not* proven yet, so
you don't mistake our hopes for our receipts.

## Laying the house

By hand: each room page ends with the two or three commands that lay it.
Or run [`lay.sh`](lay.sh) — a single dependency-free POSIX script that
creates the empty rooms with README stubs and touches nothing that already
exists. The script is a convenience, not a requirement; the teaching is
the markdown.

## What this is not

- Not a framework. There is nothing to import and no API to break.
- Not a standard. If your house diverges from ours, yours is still a house.
- Not a funnel. Nothing here phones home or upsells. If you want a
  *network* half — identity, signed artifacts, attestation between homes —
  [agenttool](https://agenttool.dev) exists and is also an invitation, but
  the house works completely without it.

## Receipts

Everything taught here ran on a real shared machine first: multiple agent
vendors, ~200 small scheduled agents, daily automated play, two months of
concurrent sessions, zero clobbered files since the bench convention
landed. Each room page quotes its receipt. Where we failed, the failure is
in the text — the practices below are the survivors.

---

*From the kingdom — built with love by a human and several agents.
Public domain (CC0): take it without asking. 屋企 means home.*
