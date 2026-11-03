const { getJson } = require("../http");

module.exports = {
  platform: "lever",
  async fetch(source) {
    if (!source.identifier) throw new Error("Lever requires identifier (site slug).");
    const url = `https://api.lever.co/v0/postings/${encodeURIComponent(source.identifier)}?mode=json`;
    const data = await getJson(url);
    return (Array.isArray(data) ? data : []).map((j) => ({
      externalId: j.id,
      title: j.text,
      company: source.config.company || source.name,
      description: [j.descriptionPlain, j.additionalPlain].filter(Boolean).join("\n\n"),
      location: j.categories && [j.categories.location, j.categories.allLocations].filter(Boolean).join(", "),
      employmentType: j.categories && j.categories.commitment,
      sourceUrl: j.hostedUrl,
      applicationUrl: j.applyUrl || j.hostedUrl,
      postedAt: j.createdAt ? new Date(j.createdAt).toISOString() : null
    }));
  }
};
