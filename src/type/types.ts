export interface RawJob {
  externalId?: string;
  title: string;
  company?: string;
  description?: string;
  location?: string;
  remote?: boolean;
  employmentType?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
  postedAt?: string | null;
  sourceUrl: string;
  applyUrl: string;
  raw?: unknown;
}

export interface Job {
  id: string;
  title: string;
  company: string | null;
  description: string | null;
  location: { raw: string; city?: string; country?: string } | null;
  remote: boolean | null;
  employmentType: string | null;
  salary: { min: number | null; max: number | null; currency: string | null; period: string | null } | null;
  postedAt: string | null;
  sourcePlatform: string;
  sourceUrl: string;
  applyUrl: string;
  firstSeen: string;
  lastChecked: string;
  status: 'active' | 'closed' | 'stale';
  sourceLinks: string[];
}

export interface Connector {
  platform: string;
  fetch(params: Record<string, string>): Promise<RawJob[]>;
  normalize(raw: RawJob, params: Record<string, string>): Job;
}