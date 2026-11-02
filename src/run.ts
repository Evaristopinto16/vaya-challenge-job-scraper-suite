import { atsConnectors } from './connectors/ats/index.js';
import { normalizeRaw } from './core/normalizer.js';

async function main() {
  const jobs = [
    { platform: 'greenhouse', params: { slug: 'stripe' } },
    { platform: 'lever', params: { slug: 'netflix', region: 'us' } },
    { platform: 'workable', params: { slug: 'workable' } },
    { platform: 'ashby', params: { name: 'linear' } },
    { platform: 'smartrecruiters', params: { id: 'Visa' } },
    { platform: 'recruitee', params: { slug: 'recruitee' } },
  ];

  for (const { platform, params } of jobs) {
    const c = atsConnectors[platform];
    if (!c) { console.warn(`no connector: ${platform}`); continue; }
    try {
      const raws = await c.fetch(params);
      const normalized = raws.slice(0, 3).map((r: any) => c.normalize(r, params));
      console.log(`\n=== ${platform} (${params}) -> ${raws.length} jobs`);
      console.table(normalized.map((j: any) => ({ title: j.title.slice(0, 50), company: j.company, location: j.location?.raw })));
    } catch (err) {
      console.error(`FAIL ${platform}:`, (err as Error).message);
    }
  }
}

main();