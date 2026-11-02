import { randomUUID } from 'node:crypto';
import type { Job, RawJob } from '../type/types';

export function normalizeRaw(raw: RawJob, platform: string): Job {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    title: raw.title.trim(),
    company: raw.company?.trim() ?? null,
    description: raw.description ?? null,
    location: raw.location ? { raw: raw.location } : null,
    remote: raw.remote ?? null,
    employmentType: raw.employmentType ?? null,
    salary: (raw.salaryMin != null || raw.salaryMax != null)
      ? { min: raw.salaryMin ?? null, max: raw.salaryMax ?? null, currency: raw.salaryCurrency ?? null, period: raw.salaryPeriod ?? null }
      : null,
    postedAt: raw.postedAt ?? null,
    sourcePlatform: platform,
    sourceUrl: raw.sourceUrl,
    applyUrl: raw.applyUrl,
    firstSeen: now,
    lastChecked: now,
    status: 'active',
    sourceLinks: [raw.sourceUrl],
  };
}

export function stripHtml(html?: string | null): string | null {
  if (!html) return null;
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || null;
}