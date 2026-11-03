const { getJson } = require("../http");
const config = require("../../config");

module.exports = {
  platform: "workable",
  async fetch(source) {
    const account = source.identifier || config.workableAccount;
    if (!account || !config.workableToken) {
      throw new Error("Workable requires WORKABLE_ACCOUNT/identifier and WORKABLE_TOKEN.");
    }
    const url = `https://${encodeURIComponent(account)}.workable.com/spi/v3/jobs?state=published`;
    const data = await getJson(url, {
      headers: { Authorization: `Bearer ${config.workableToken}` }
    });
    const jobs = data.jobs || [];
    return jobs.map((j) => ({
      externalId: j.shortcode || j.id,
      title: j.title,
      company: source.config.company || source.name,
      description: j.description,
      location: j.location && [j.location.city, j.location.region, j.location.country].filter(Boolean).join(", "),
      employmentType: j.employment_type,
      remote: j.telecommuting,
      sourceUrl: j.url,
      applicationUrl: j.application_url || j.url,
      postedAt: j.created_at
    }));
  }
};
