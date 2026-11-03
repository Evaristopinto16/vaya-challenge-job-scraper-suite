const crypto = require("crypto");

function clean(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === "object") value = JSON.stringify(value);
  const text = String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text || null;
}

function normalizeText(value) {
  return (clean(value) || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function makeDedupeKey(job) {
  const basis = [
    normalizeText(job.company),
    normalizeText(job.title),
    normalizeText(job.location)
  ].join("|");
  return crypto.createHash("sha256").update(basis).digest("hex");
}

function toBoolean(value) {
  if (typeof value === "boolean") return value;
  if (value === null || value === undefined) return null;
  const v = String(value).toLowerCase();
  if (["true", "yes", "remote", "1"].includes(v)) return true;
  if (["false", "no", "onsite", "on-site", "0"].includes(v)) return false;
  return null;
}

function normalizeJob(raw, source) {
  const job = {
    externalId: clean(raw.externalId || raw.id || raw.slug || raw.url),
    title: clean(raw.title || raw.name || raw.position),
    company: clean(raw.company || source.name),
    description: clean(raw.description || raw.content),
    location: clean(raw.location || raw.locations),
    sourceUrl: clean(raw.sourceUrl || raw.url || source.base_url),
    applicationUrl: clean(raw.applicationUrl || raw.applyUrl || raw.url),
    salary: clean(raw.salary || raw.compensation),
    employmentType: clean(raw.employmentType || raw.type || raw.commitment),
    remote: toBoolean(raw.remote || raw.isRemote || raw.workplaceType),
    originalPostedAt: raw.originalPostedAt || raw.postedAt || raw.createdAt || null
  };
  if (!job.title) return null;
  job.dedupeKey = makeDedupeKey(job);
  return job;
}

module.exports = { clean, normalizeText, makeDedupeKey, normalizeJob };
