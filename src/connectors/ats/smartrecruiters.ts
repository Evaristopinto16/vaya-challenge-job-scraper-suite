import type { Connector, RawJob } from '../../type/types.js';
import { httpJson } from '../../core/http.js';
import { normalizeRaw, stripHtml } from '../../core/normalizer.js';

interface SrPosting {
  id: string;
  name: string;
  releasedDate?: string;
  location?: { city?: string; country?: string; remote?: boolean };
  typeOfEmployment?: { label?: string };
  company?: { identifier?: string; name?: string };
  ref?: string;
  jobAd?: { sections?: { jobDescription?: { text?: string } } };
}

interface SrList { content: SrPosting[]; totalFound: number; offset: number; limit: number; }

export const smartrecruiters: Connector = {
  platform: 'smartrecruiters',

  async fetch({ id }) {
    if (!id) throw new Error('smartrecruiters: missing {id}');
    const out: RawJob[] = [];
    let offset = 0;
    const limit = 100;
    while (true) {
      const url = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(id)}/postings?offset=${offset}&limit=${limit}`;
      const page = await httpJson<SrList>(url);
      for (const p of page.content ?? []) {
        const sourceUrl = `https://jobs.smartrecruiters.com/${id}/${p.id}`;
        out.push({
          externalId: p.id,
          title: p.name,
          company: p.company?.name ?? id,
          description: stripHtml(p.jobAd?.sections?.jobDescription?.text) ?? undefined,
          location: [p.location?.city, p.location?.country].filter(Boolean).join(', ') || undefined,
          remote: p.location?.remote,
          employmentType: p.typeOfEmployment?.label,
          postedAt: p.releasedDate ?? null,
          sourceUrl,
          applyUrl: sourceUrl,
          raw: p,
        });
      }
      offset += limit;
      if (offset >= (page.totalFound ?? 0)) break;
    }
    return out;
  },

  normalize(raw) {
    return normalizeRaw(raw, 'smartrecruiters');
  },
};