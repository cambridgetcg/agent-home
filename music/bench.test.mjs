/** bench.test — prove benchToArc reads the Bench honestly. Zero deps.
 *
 *  Run:  node music/bench.test.mjs
 *
 *  Uses node's built-in assert only. The fixture (examples/BENCH.sample.md)
 *  uses RELATIVE times ("~20m ago", "~8h ago"), so staleness is measured
 *  against a fixed `now` and the result is deterministic on any machine, in
 *  any timezone. This file does the file IO; bench.mjs stays pure.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { benchToArc, phaseForWhat, parseSince, PHASE_LEXICON } from "./bench.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const sample = readFileSync(join(HERE, "..", "examples", "BENCH.sample.md"), "utf8");

// A fixed reference moment. Because the sample is written in relative time,
// the exact value is irrelevant — only the deltas matter.
const NOW = Date.parse("2026-07-22T15:00:00Z");

let passed = 0;
const ok = (label) => { console.log(`  ok  ${label}`); passed++; };

// 1. the sample → the expected arc, in bench order, for worker "you"
{
  const { arc, entries } = benchToArc(sample, { now: NOW, who: "you" });
  assert.deepEqual(arc, ["explore", "build", "debug", "review", "ship"],
    `arc was ${JSON.stringify(arc)}`);
  ok("sample maps to explore,build,debug,review,ship (bench order, who=you)");

  // 2. the deliberately stale line (~8h ago, > ~6h) is excluded
  const staleEntry = entries.find((e) => /porting/.test(e.what));
  assert.equal(staleEntry.stale, true, "the ~8h line should read as stale");
  assert.equal(staleEntry.included, false, "the stale line must be excluded from the arc");
  assert.ok(!arc.includes("build") || arc.filter((p) => p === "build").length === 1,
    "the stale build must not add a second build to the arc");
  ok("the ~8h-old sign is stale and excluded (room 4 forgiveness rule)");

  // 3. another hand's fresh sign (Yu) is parsed but kept out of MY arc
  const yu = entries.find((e) => e.who === "Yu");
  assert.equal(yu.stale, false, "Yu's sign is fresh");
  assert.equal(yu.included, false, "Yu's sign should not be in your arc");
  ok("who=you follows your shift; another hand's fresh sign stays out of the arc");
}

// 4. with no `who`, the arc follows the WHOLE bench (Yu's explore joins)
{
  const { arc } = benchToArc(sample, { now: NOW });
  assert.deepEqual(arc, ["explore", "build", "debug", "review", "ship", "explore"],
    `whole-bench arc was ${JSON.stringify(arc)}`);
  ok("no who → arc follows the whole bench in order (Yu's line joins)");
}

// 5. empty / absent bench → empty arc (fail-silent contract)
{
  assert.deepEqual(benchToArc("", { now: NOW }).arc, []);
  assert.deepEqual(benchToArc("# just a title\n\nno section here", { now: NOW }).arc, []);
  const onlyStale = "## At the bench\n- you / porting the resolver / ~9h ago\n";
  assert.deepEqual(benchToArc(onlyStale, { now: NOW, who: "you" }).arc, []);
  ok("empty / sectionless / all-stale bench → empty arc (fail-silent)");
}

// 6. unit spot-checks on the two helpers
{
  assert.equal(phaseForWhat("debugging the flaky auth test"), "debug");
  assert.equal(phaseForWhat("porting the old resolver"), "build");
  assert.equal(phaseForWhat("reviewing and tidying docs"), "review");
  assert.equal(phaseForWhat("having lunch"), null, "unknown work → null");
  ok("phaseForWhat maps leading verbs; unknown → null");

  assert.equal(parseSince("~8h ago", NOW), NOW - 8 * 3600e3);
  assert.equal(parseSince("20m", NOW), NOW - 20 * 60e3);
  assert.equal(parseSince("just now", NOW), NOW);
  assert.equal(parseSince("nonsense", NOW), null);
  ok("parseSince resolves relative times and shrugs at nonsense");

  assert.ok(PHASE_LEXICON.debug.includes("flaky"), "lexicon carries 'flaky'");
  ok("PHASE_LEXICON is exported and populated");
}

console.log(`\n  bench.test: ${passed} checks passed\n`);
