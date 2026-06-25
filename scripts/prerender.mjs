// Prerender public routes to static HTML by snapshotting the built SPA in a
// real headless browser (so Firebase/window/localStorage all work). Output is
// written as dist/<route>/index.html for crawlers and social scrapers.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import sirv from 'sirv';
import puppeteer from 'puppeteer-core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, '..', 'dist');
const PORT = 4178;

// Public, crawlable routes only. Dashboard stays a client-rendered SPA.
const routes = ['/', '/features', '/about', '/docs', '/contact', '/signin'];

const serve = sirv(dist, { single: true, dev: false });
const server = createServer((req, res) =>
  serve(req, res, () => {
    res.statusCode = 404;
    res.end('Not found');
  }),
);
await new Promise((resolve) => server.listen(PORT, resolve));

// Cloud builds (Vercel/CI) have no system Chrome → use @sparticuz/chromium.
// Locally use the installed Google Chrome. If neither launches, skip prerender
// and ship the plain SPA rather than failing the whole build.
async function launch() {
  if (process.env.VERCEL || process.env.CI) {
    const chromium = (await import('@sparticuz/chromium')).default;
    return puppeteer.launch({
      headless: true,
      executablePath: await chromium.executablePath(),
      args: chromium.args,
    });
  }
  return puppeteer.launch({
    headless: true,
    channel: 'chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}

let browser;
try {
  browser = await launch();
} catch (err) {
  console.warn('\n⚠  Prerender skipped (no usable Chrome/Chromium):', err.message);
  console.warn('   Shipping client-rendered SPA. SEO meta in index.html still applies.\n');
  server.close();
  process.exit(0);
}

// Snapshot every route first (keeping the served shell pristine), then write.
const snapshots = [];
try {
  for (const route of routes) {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    await page.waitForSelector('#root > *', { timeout: 15000 });
    // Let useSeo's effect set title/meta before snapshotting.
    await new Promise((r) => setTimeout(r, 300));
    snapshots.push({ route, html: await page.content() });
    await page.close();
    console.log(`prerendered ${route}`);
  }
} finally {
  await browser.close();
  server.close();
}

for (const { route, html } of snapshots) {
  const outDir = route === '/' ? dist : join(dist, route);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html);
}
