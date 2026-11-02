export interface FetchOptions {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT = 15_000;
const DEFAULT_RETRIES = 3;

export async function httpJson<T>(url: string, opts: FetchOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, timeoutMs = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES } = opts;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'accept': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.status === 429 || res.status >= 500) {
        const retryAfter = Number(res.headers.get('retry-after') ?? 0);
        const backoff = retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 500;
        await sleep(backoff);
        lastErr = new Error(`HTTP ${res.status} ${url}`);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt === retries) break;
      await sleep(2 ** attempt * 500);
    }
  }
  throw lastErr;
}

export async function httpText(url: string, opts: FetchOptions = {}): Promise<string> {
  const res = await fetch(url, {
    ...opts, 
    headers: {
         'accept': 'application/xml,text/xml,*/*',
         ...opts.headers }
         }
        );
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));