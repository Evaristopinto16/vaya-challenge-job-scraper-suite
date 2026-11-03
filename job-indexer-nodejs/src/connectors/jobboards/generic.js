const { getJson, getText } = require("../http");
const cheerio = require("cheerio");

function getPath(obj, path) {
  if (!path) return undefined;
  return path.split(".").reduce((value, key) => value == null ? undefined : value[key], obj);
}

function mapByFields(item, fields = {}) {
  return {
    externalId: getPath(item, fields.id || "id"),
    title: getPath(item, fields.title || "title"),
    company: getPath(item, fields.company || "company"),
    description: getPath(item, fields.description || "description"),
    location: getPath(item, fields.location || "location"),
    url: getPath(item, fields.url || "url"),
    applicationUrl: getPath(item, fields.applicationUrl || "applicationUrl"),
    postedAt: getPath(item, fields.postedAt || "postedAt"),
    salary: getPath(item, fields.salary || "salary"),
    employmentType: getPath(item, fields.employmentType || "employmentType"),
    remote: getPath(item, fields.remote || "remote")
  };
}

async function fetchConfigured(source) {
  const cfg = source.config || {};
  if (cfg.endpoint) {
    const data = await getJson(cfg.endpoint, {
      headers: cfg.headers || {}
    });
    const items = getPath(data, cfg.itemsPath || "jobs");
    if (!Array.isArray(items)) throw new Error(`Expected array at config.itemsPath="${cfg.itemsPath || "jobs"}".`);
    return items.map(item => mapByFields(item, cfg.fields));
  }

  if (cfg.listingUrl && cfg.selectors && cfg.selectors.item && cfg.selectors.title) {
    const html = await getText(cfg.listingUrl, { headers: cfg.headers || {} });
    const $ = cheerio.load(html);
    const s = cfg.selectors;
    const result = [];
    $(s.item).each((_, el) => {
      const node = $(el);
      const link = (selector) => {
        if (!selector) return null;
        const a = node.find(selector).first();
        return a.attr("href") || null;
      };
      const text = (selector) => selector ? node.find(selector).first().text().trim() || null : null;
      const href = link(s.url);
      result.push({
        externalId: node.attr("data-id") || href,
        title: text(s.title),
        company: text(s.company) || source.config.company || source.name,
        description: text(s.description),
        location: text(s.location),
        url: href ? new URL(href, cfg.listingUrl).toString() : cfg.listingUrl,
        applicationUrl: link(s.applicationUrl) ? new URL(link(s.applicationUrl), cfg.listingUrl).toString() : null,
        postedAt: text(s.postedAt),
        salary: text(s.salary),
        employmentType: text(s.employmentType),
        remote: text(s.remote)
      });
    });
    return result;
  }

  throw new Error(`${source.platform} needs config.endpoint (JSON) or config.listingUrl + selectors (HTML).`);
}

module.exports = { fetchConfigured };
