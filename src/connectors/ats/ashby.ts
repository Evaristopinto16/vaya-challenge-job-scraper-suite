import type { Connector, RawJob } from '../../types.js';
import { httpJson } from '../../core/http.js';
import { normalizeRaw } from '../../core/normalizer.js';

interface AshbyJob {
  id: string;
  title: string;
  location?: string;
  secondaryLocations?: Array<{ location?: string }>;
  employmentType?: string;
  publishedAt?: string;
  jobUrl: string;
  applyUrl?: string;
  descriptionPlain?: string;
  compensation?: {
    compensationTierSummary?: string;
    summaryComponents?: Array<{ summary?: string }>;
  };
}

export const ashby: Connector = {
  platform: 'ashby',

  async fetch({ name }) {
    if (!name) throw new Error('ashby: missing {name}');
    const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(name)}?includeCompensation=true`;
    const data = await httpJson<{ jobs: AshbyJob[] }>(url);
    return (data.jobs ?? []).map<RawJob>((j) => ({
      externalId: j.id,
      title: j.title,
      description: j.descriptionPlain,
      location: j.location ?? j.secondaryLocations?.[0]?.location,
      employmentType: j.employmentType,
      postedAt: j.publishedAt ?? null,
      sourceUrl: j.jobUrl,
      applyUrl: j.applyUrl ?? j.jobUrl,
      salaryCurrency: null,
      salaryPeriod: null,
      salaryMin: null,
      salaryMax: null,
      raw: j,
    }));
  },

  normalize(raw, { name }) {
    return normalizeRaw({ ...raw, company: raw.company ?? name }, 'ashby');
  },
};