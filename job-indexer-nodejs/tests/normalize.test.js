const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeJob, makeDedupeKey } = require("../src/utils/normalize");

test("normalizes basic job fields", () => {
  const source = { name: "Example Co", base_url: "https://example.com" };
  const job = normalizeJob({ title: "Backend Developer", location: "Berlin", remote: "yes" }, source);
  assert.equal(job.title, "Backend Developer");
  assert.equal(job.company, "Example Co");
  assert.equal(job.remote, true);
  assert.ok(job.dedupeKey);
});

test("dedupe key is stable for normalized text", () => {
  const a = { company: "Acme Inc.", title: "Backend Developer", location: "Berlin" };
  const b = { company: "ACME INC", title: "Backend Developer", location: "Berlin" };
  assert.equal(makeDedupeKey(a), makeDedupeKey(b));
});
