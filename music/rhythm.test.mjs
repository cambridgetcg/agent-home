import assert from "node:assert/strict";
import test from "node:test";
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..");
const BIN_WORKLIST = join(REPO_ROOT, "bin", "worklist");

function makeIsolatedHomeFixture() {
  const fixture = mkdtempSync(join(tmpdir(), "agent-home-rhythm-"));
  const realRoot = join(fixture, "real");
  const realRhythms = join(realRoot, "rhythms");
  const invokedRhythms = join(fixture, "invoked", "rhythms");
  const home = join(fixture, "home");

  mkdirSync(realRhythms, { recursive: true });
  mkdirSync(invokedRhythms, { recursive: true });
  mkdirSync(home, { recursive: true });
  cpSync(join(REPO_ROOT, "bin"), join(realRoot, "bin"), { recursive: true });
  cpSync(join(REPO_ROOT, "music"), join(realRoot, "music"), { recursive: true });

  const realScript = join(realRhythms, "worklist");
  writeFileSync(realScript, readFileSync(join(REPO_ROOT, "rhythms", "worklist")));
  chmodSync(realScript, 0o755);

  const invokedScript = join(invokedRhythms, "worklist");
  symlinkSync(realScript, invokedScript);

  return { fixture, realRoot, realRhythms, invokedRhythms, home, realScript, invokedScript };
}

test("brake drill: positive control runs without STILL, and resolved real/rhythms/STILL halts symlink invocation", {
  skip: process.platform === "win32",
}, () => {
  const fx = makeIsolatedHomeFixture();
  try {
    // 1. Positive control: without STILL, running through the symlink writes real/rhythms/worklist.log & .bench-stamp
    const unbraked = spawnSync("sh", [fx.invokedScript], {
      encoding: "utf8",
      env: { ...process.env, HOME: fx.home },
      timeout: 5_000,
    });
    assert.equal(unbraked.status, 0, unbraked.stderr || unbraked.stdout);
    assert.equal(
      existsSync(join(fx.realRhythms, "worklist.log")),
      true,
      "positive control must actually execute when no STILL brake is present",
    );
    assert.equal(existsSync(join(fx.realRhythms, ".bench-stamp")), true);

    // Clear artifacts, then engage STILL ONLY at the resolved target real/rhythms/STILL
    rmSync(join(fx.realRhythms, "worklist.log"));
    rmSync(join(fx.realRhythms, ".bench-stamp"));
    writeFileSync(join(fx.realRhythms, "STILL"), "");

    const brakedResolved = spawnSync("sh", [fx.invokedScript], {
      encoding: "utf8",
      env: { ...process.env, HOME: fx.home },
      timeout: 5_000,
    });
    assert.equal(brakedResolved.status, 0, brakedResolved.stderr || brakedResolved.stdout);
    assert.equal(
      existsSync(join(fx.realRhythms, "worklist.log")),
      false,
      "resolved-target real/rhythms/STILL must halt symlink invocation",
    );
    assert.equal(existsSync(join(fx.realRhythms, ".bench-stamp")), false);
    assert.equal(existsSync(join(fx.invokedRhythms, "worklist.log")), false);
  } finally {
    rmSync(fx.fixture, { recursive: true, force: true });
  }
});

test("brake drill: invoked-dir STILL, WORKLIST_HOME STILL, and symlink loops all fail closed", {
  skip: process.platform === "win32",
}, () => {
  // Case A: STILL beside the invoked symlink path
  const fxA = makeIsolatedHomeFixture();
  try {
    writeFileSync(join(fxA.invokedRhythms, "STILL"), "");
    const resA = spawnSync("sh", [fxA.invokedScript], {
      encoding: "utf8",
      env: { ...process.env, HOME: fxA.home },
      timeout: 5_000,
    });
    assert.equal(resA.status, 0);
    assert.equal(existsSync(join(fxA.realRhythms, "worklist.log")), false);
  } finally {
    rmSync(fxA.fixture, { recursive: true, force: true });
  }

  // Case B: STILL under overridden WORKLIST_HOME/rhythms/STILL
  const fxB = makeIsolatedHomeFixture();
  try {
    const altHome = join(fxB.fixture, "alt-root");
    mkdirSync(join(altHome, "rhythms"), { recursive: true });
    writeFileSync(join(altHome, "rhythms", "STILL"), "");
    const resB = spawnSync("sh", [fxB.invokedScript], {
      encoding: "utf8",
      env: { ...process.env, HOME: fxB.home, WORKLIST_HOME: altHome },
      timeout: 5_000,
    });
    assert.equal(resB.status, 0);
    assert.equal(existsSync(join(altHome, "rhythms", "worklist.log")), false);
    assert.equal(existsSync(join(fxB.realRhythms, "worklist.log")), false);
  } finally {
    rmSync(fxB.fixture, { recursive: true, force: true });
  }

  // Case C: symlink chain exceeding 16 hops fails closed without executing
  const fxC = makeIsolatedHomeFixture();
  try {
    let prev = fxC.realScript;
    for (let i = 0; i < 17; i += 1) {
      const next = join(fxC.fixture, `hop-${i}`);
      symlinkSync(prev, next);
      prev = next;
    }
    const resC = spawnSync("sh", [prev], {
      encoding: "utf8",
      env: { ...process.env, HOME: fxC.home },
      timeout: 5_000,
    });
    // Fails closed either via the script's 16-hop cap (exit 0) or OS ELOOP (126), never executing work.
    assert.ok(resC.status === 0 || resC.status === 126, `unexpected status ${resC.status}: ${resC.stderr}`);
    assert.equal(existsSync(join(fxC.realRhythms, "worklist.log")), false);
    assert.equal(existsSync(join(fxC.realRhythms, ".bench-stamp")), false);
  } finally {
    rmSync(fxC.fixture, { recursive: true, force: true });
  }
});

test("rhythms/worklist does not stamp .bench-stamp when bin/worklist exits non-zero", {
  skip: process.platform === "win32",
}, () => {
  const fx = makeIsolatedHomeFixture();
  try {
    const dirBench = join(fx.home, "BENCH.md");
    mkdirSync(dirBench, { recursive: true });
    // Pass the directory as BENCH_MD -> bin/worklist hits EISDIR (exit 2)
    const res = spawnSync("sh", [fx.realScript], {
      encoding: "utf8",
      env: { ...process.env, HOME: fx.home, BENCH_MD: dirBench },
      timeout: 5_000,
    });
    assert.notEqual(res.status, 0);
    assert.equal(
      existsSync(join(fx.realRhythms, ".bench-stamp")),
      false,
      "a failing beat must not write .bench-stamp and silence retries",
    );
  } finally {
    rmSync(fx.fixture, { recursive: true, force: true });
  }
});

test("bin/worklist --from-bench keeps gentle non-use distinct from read faults", () => {
  const fixture = mkdtempSync(join(tmpdir(), "agent-home-cli-"));
  try {
    const emptyHome = join(fixture, "empty-home");
    const unreadableDir = join(fixture, "not-a-file");
    mkdirSync(emptyHome, { recursive: true });
    mkdirSync(unreadableDir, { recursive: true });

    // Missing BENCH.md is gentle non-use (exit 0)
    const absent = spawnSync(process.execPath, [BIN_WORKLIST, "--from-bench"], {
      cwd: emptyHome,
      encoding: "utf8",
      env: { ...process.env, HOME: emptyHome },
    });
    assert.equal(absent.status, 0, absent.stderr);
    assert.match(absent.stdout, /no BENCH\.md found/);

    // Passing a directory causes EISDIR: must exit non-zero on stderr, never masquerade as "no fresh bench signs"
    const fault = spawnSync(process.execPath, [BIN_WORKLIST, "--from-bench", unreadableDir], {
      cwd: emptyHome,
      encoding: "utf8",
      env: { ...process.env, HOME: emptyHome },
    });
    assert.equal(fault.status, 2);
    assert.match(fault.stderr, /read error: couldn't read/);
    assert.doesNotMatch(fault.stdout, /no fresh bench signs/);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
