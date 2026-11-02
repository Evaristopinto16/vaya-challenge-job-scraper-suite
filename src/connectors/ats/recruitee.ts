import type { Connector, RawJob } from '../../types.js';
import { httpText } from '../../core/http.js';
import { normalizeRaw } from '../../core/normalizer.js';

export const recruitee: Connector = {
  platform: 'recruitee',

  async fetch({ slug }) {
    if (!slug) throw new Error('recruitee: missing {slug}');
    const url = `https://${encodeURIComponent(slug)}.recruitee.com/api/offers.xml`;
    const xml = await httpText(url);
    // Parse simples de <offer> — em produção usa fast-xml-parser.
    const offers = [...xml.matchAll(/<offer>([\s\S]*?)<\/offer>/g)].map((m) => m[1]);
    return offers.map<RawJob>((o) => {
      const pick = (tag: string) => {
        const m = o.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
        return m?.[1]?.trim();
      };
      const sourceUrl = pick('careers_url') ?? pick('url') ?? '';
      return {
        externalId: pick('id'),
        title: pick('title') ?? '',
        description: pick('description'),
        location: pick('location'),
        employmentType: pick('employment_type_code'),
        postedAt: pick('published_at') ?? null,
        sourceUrl,
        applyUrl: pick('careers_apply_url') ?? sourceUrl,
      };
    });
  },

  normalize(raw, { slug }) {
    return normalizeRaw({ ...raw, company: raw.company ?? slug }, 'recruitee');
  },
};