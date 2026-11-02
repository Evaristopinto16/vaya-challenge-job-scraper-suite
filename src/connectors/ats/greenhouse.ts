import type { Connector, RawJob } from '../../type/types.js';
import { httpJson } from '../../core/http.js';
import { normalizeRaw, stripHtml } from '../../core/normalizer.js';

interface GhResponse {
  jobs: Array<{
    id: number;
    title: string;
    absolute_url: string;
    location?: { name?: string };
    updated_at?: string;
    content?: string;
    metadata?: Array<{ name: string; value: unknown }>;
  }>;
}

export const greenhouse: Connector = {
  platform: 'greenhouse',

  async fetch({ slug }) {
    if (!slug) throw new Error('greenhouse: missing {slug}');
    const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs?content=true`;
    const data = await httpJson<GhResponse>(url);
    return data.jobs.map<RawJob>((j) => ({
      externalId: String(j.id),
      title: j.title,
      description: stripHtml(j.content) ?? undefined,
      location: j.location?.name,
      postedAt: j.updated_at ?? null,
      sourceUrl: j.absolute_url,
      applyUrl: j.absolute_url,
      raw: j,
    }));
  },

  normalize(raw, { slug }) {
    return { ...normalizeRaw({ ...raw, company: raw.company ?? slug }, 'greenhouse') };
  },
};