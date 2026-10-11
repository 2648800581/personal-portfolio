import test from "node:test";
import assert from "node:assert/strict";
import { emptyCounts, isAllowedOrigin, normalizeCountry } from "../src/counter-data.js";

test("supported countries remain separate", () => {
  assert.equal(normalizeCountry("cn"), "CN");
  assert.equal(normalizeCountry("FR"), "FR");
});

test("other and missing countries are grouped", () => {
  assert.equal(normalizeCountry("CA"), "OTHER");
  assert.equal(normalizeCountry(null), "OTHER");
});

test("only configured production origins and local previews are allowed", () => {
  assert.equal(isAllowedOrigin("https://2648800581.github.io", "https://2648800581.github.io"), true);
  assert.equal(isAllowedOrigin("http://127.0.0.1:8080", "https://2648800581.github.io"), true);
  assert.equal(isAllowedOrigin("https://example.com", "https://2648800581.github.io"), false);
  assert.equal(isAllowedOrigin("", "https://2648800581.github.io"), false);
});

test("empty counts contain every visible bucket", () => {
  assert.deepEqual(emptyCounts(), {
    CN: 0,
    US: 0,
    JP: 0,
    SG: 0,
    GB: 0,
    DE: 0,
    FR: 0,
    OTHER: 0,
  });
});
