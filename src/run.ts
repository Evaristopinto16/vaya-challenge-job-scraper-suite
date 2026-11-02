import { greenhouse } from './connectors/ats/greenhouse.js';

async function main() {
  console.log('fetching greenhouse...');
  const t = Date.now();
  const raws = await greenhouse.fetch({ slug: 'stripe' });
  console.log(`done in ${Date.now() - t}ms, ${raws.length} jobs`);
  console.log(raws[0]);
}
main().catch((e) => { console.error('ERR', e); process.exit(1); });