import assert from "node:assert/strict";
import test from "node:test";
import {
  chmodSync,
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

test("the real rhythms/STILL brake survives symlink invocation", {
  skip: process.platform === "win32",
}, () => {
  const fixture = mkdtempSync(join(tmpdir(), "agent-home-rhythm-"));
  const realRhythms = join(fixture, "real", "rhythms");
  const invokedRhythms = join(fixture, "invoked", "rhythms");
  const home = join(fixture, "home");

  try {
    mkdirSync(realRhythms, { recursive: true });
    mkdirSync(invokedRhythms, { recursive: true });
    mkdirSync(home, { recursive: true });

    const realScript = join(realRhythms, "worklist");
    writeFileSync(realScript, readFileSync(join(HERE, "..", "rhythms", "worklist")));
    chmodSync(realScript, 0o755);
    writeFileSync(join(realRhythms, "STILL"), "");

    const invokedScript = join(invokedRhythms, "worklist");
    symlinkSync(realScript, invokedScript);
    const result = spawnSync("sh", [invokedScript], {
      encoding: "utf8",
      env: { ...process.env, HOME: home },
      timeout: 5_000,
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(existsSync(join(invokedRhythms, "worklist.log")), false);
    assert.equal(existsSync(join(invokedRhythms, ".bench-stamp")), false);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
