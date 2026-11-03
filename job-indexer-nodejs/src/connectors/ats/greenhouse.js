const { getJson } = require("../http");

module.exports = {
  platform: "greenhouse",
  async fetch(source) {
    if (!source.identifier) throw new Error("Greenhouse requires identifier (board token).");
    const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(source.identifier)}/jobs?content=true`;
    const data = await getJson(url);
    return (data.jobs || []).map((j) => ({
      externalId: String(j.id),
      title: j.title,
      company: source.config.company || source.name,
      description: j.content,
      location: j.location && j.location.name,
      sourceUrl: j.absolute_url,
      applicationUrl: j.absolute_url,
      postedAt: j.updated_at
    }));
  }
};
