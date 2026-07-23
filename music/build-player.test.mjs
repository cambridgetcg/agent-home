import assert from "node:assert/strict";
import test from "node:test";

import { renderPlayerHTML } from "./build-player.mjs";

test("session data cannot break out of the player's inline script", () => {
  const session = {
    name: "</script><script>globalThis.playerPwned = true</script>",
    session: "line\u2028separator\u2029paragraph",
    pieces: [],
  };

  const html = renderPlayerHTML(session);
  assert.equal((html.match(/<\/script>/gi) || []).length, 1);
  assert.doesNotMatch(html, /<script>globalThis\.playerPwned/);
  assert.match(html, /\\u003c\/script>/);
  assert.match(html, /\\u2028/);
  assert.match(html, /\\u2029/);

  const literal = html.match(/const SESSION = (.+);/);
  assert.ok(literal, "the built player should contain one serialized session");
  const restored = Function(`"use strict"; return (${literal[1]});`)();
  assert.deepEqual(restored, session);
});
