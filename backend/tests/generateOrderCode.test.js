import { test } from "node:test";
import assert from "node:assert/strict";
import { generateOrderCode } from "../utils/generateOrderCode.js";

test("generateOrderCode returns a PB-prefixed 6-char code by default", () => {
  const code = generateOrderCode();
  assert.match(code, /^PB[A-Z2-9]{6}$/);
});

test("generateOrderCode produces distinct values across calls", () => {
  const codes = new Set(Array.from({ length: 50 }, generateOrderCode));
  assert.equal(codes.size, 50);
});
