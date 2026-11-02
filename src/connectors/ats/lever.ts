import type { Connector, RawJob } from '../../type/types.js';
import { httpJson } from '../../core/http.js';
import { normalizeRaw, stripHtml } from '../../core/normalizer.js';

interface LeverPosting {
  id: string;
  text: string;
  hostedUrl: string;
  applyUrl: string;
  createdAt?: number;
  categories?: { location?: string; commitment?: string; team?: string };
  descriptionPlain?: string;
  lists?: Array<{ text: string; content: string }>;
  additionalPlain?: string;
}

export const lever: Connector = {
  platform: 'lever',

  async fetch({ slug, region = 'us' }) {
    if (!slug) throw new Error('lever: missing {slug}');
    const host = region === 'eu' ? 'api.eu.lever.co' : 'api.lever.co';
    const url = `https://${host}/v0/postings/${encodeURIComponent(slug)}?mode=json`;
    const data = await httpJson<LeverPosting[]>(url);
    return data.map<RawJob>((p) => ({
      externalId: p.id,
      title: p.text,
      description: [p.descriptionPlain, ...(p.lists ?? []).map((l) => `${l.text}\n${stripHtml(l.content)}`)].filter(Boolean).join('\n\n'),
      location: p.categories?.location,
      employmentType: p.categories?.commitment,
      postedAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
      sourceUrl: p.hostedUrl,
      applyUrl: p.applyUrl,
      raw: p, 
    }));
  },

  normalize(raw, { slug }) {
    return normalizeRaw({ ...raw, company: raw.company ?? slug }, 'lever');
  },
};