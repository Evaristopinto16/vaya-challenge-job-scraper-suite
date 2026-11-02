import type { Connector, RawJob } from '../../types.js';
import { httpJson } from '../../core/http.js';
import { normalizeRaw, stripHtml } from '../../core/normalizer.js';

interface WorkableJob {
  id: string;
  title: string;
  shortcode?: string;
  url?: string;
  shortlink?: string;
  description?: string;
  location?: { location_str?: string; city?: string; country?: string };
  telecommuting?: boolean;
  employment_type?: string;
  created_at?: string;
}

export const workable: Connector = {
  platform: 'workable',

  async fetch({ slug }) {
    if (!slug) throw new Error('workable: missing {slug}');
    const url = `https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(slug)}`;
    const data = await httpJson<{ jobs: WorkableJob[] }>(url);
    return (data.jobs ?? []).map<RawJob>((j) => {
      const sourceUrl = j.url ?? `https://apply.workable.com/${slug}/j/${j.shortcode ?? j.id}/`;
      return {
        externalId: j.id,
        title: j.title,
        description: stripHtml(j.description) ?? undefined,
        location: j.location?.location_str,
        remote: j.telecommuting,
        employmentType: j.employment_type,
        postedAt: j.created_at ?? null,
        sourceUrl,
        applyUrl: sourceUrl,
        raw: j,
      };
    });
  },

  normalize(raw, { slug }) {
    return normalizeRaw({ ...raw, company: raw.company ?? slug }, 'workable');
  },
};