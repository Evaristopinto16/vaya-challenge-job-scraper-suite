const { getJson } = require("../http");
const { fetchConfigured } = require("./generic");

module.exports = {
  platform: "wpjobmanager",
  async fetch(source) {
    const cfg = source.config || {};
    if (cfg.endpoint) return fetchConfigured(source);
    if (!source.base_url) throw new Error("WP Job Manager requires baseUrl or config.endpoint.");
    const base = source.base_url.replace(/\/$/, "");
    const endpoint = `${base}/wp-json/wp/v2/job-listings?per_page=100&_embed=1`;
    const data = await getJson(endpoint);
    if (!Array.isArray(data)) throw new Error("WP REST API did not return an array. Configure config.endpoint if this site's route differs.");
    return data.map((j) => ({
      externalId: String(j.id),
      title: j.title && j.title.rendered,
      company: source.config.company || source.name,
      description: j.content && j.content.rendered,
      location: j.meta && (j.meta._job_location || j.meta.job_location),
      sourceUrl: j.link,
      applicationUrl: j.link,
      postedAt: j.date
    }));
  }
};
