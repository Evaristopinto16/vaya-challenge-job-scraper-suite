const { getJson } = require("../http");

module.exports = {
  platform: "smartrecruiters",
  async fetch(source) {
    if (!source.identifier) throw new Error("SmartRecruiters requires identifier (company id).");
    const all = [];
    let offset = 0;
    const limit = 100;
    while (true) {
      const url = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(source.identifier)}/postings?limit=${limit}&offset=${offset}`;
      const data = await getJson(url);
      const postings = data.content || [];
      all.push(...postings.map((j) => ({
        externalId: j.id,
        title: j.name,
        company: source.config.company || source.name,
        description: j.jobAd && j.jobAd.sections && Object.values(j.jobAd.sections).map(s => s && s.text).filter(Boolean).join("\n"),
        location: j.location && [j.location.city, j.location.region, j.location.country].filter(Boolean).join(", "),
        employmentType: j.typeOfEmployment && j.typeOfEmployment.label,
        sourceUrl: j.ref,
        applicationUrl: j.ref,
        postedAt: j.releasedDate
      })));
      if (postings.length < limit) break;
      offset += limit;
    }
    return all;
  }
};
