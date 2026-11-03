const { getJson } = require("../http");

module.exports = {
  platform: "ashby",
  async fetch(source) {
    if (!source.identifier) throw new Error("Ashby requires identifier (job board name).");
    const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(source.identifier)}`;
    const data = await getJson(url);
    return (data.jobs || []).map((j) => ({
      externalId: j.id,
      title: j.title,
      company: source.config.company || source.name,
      description: j.descriptionPlain || j.descriptionHtml,
      location: j.location,
      employmentType: j.employmentType,
      remote: j.isRemote,
      sourceUrl: j.jobUrl,
      applicationUrl: j.applyUrl || j.jobUrl,
      postedAt: j.publishedAt
    }));
  }
};
