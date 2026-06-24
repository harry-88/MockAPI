// Prerender public routes to static HTML by snapshotting the built SPA in a
// real headless browser (so Firebase/window/localStorage all work). Output is
// written as dist/<route>/index.html for crawlers and social scrapers.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import sirv from 'sirv';
import puppeteer from 'puppeteer';

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

const browser = await puppeteer.launch({
  headless: true,
  channel: 'chrome', // use the system-installed Chrome (avoids bundled-binary arch issues)
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

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
