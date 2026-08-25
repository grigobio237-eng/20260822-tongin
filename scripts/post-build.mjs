/**
 * OpenNext post-build script
 * Copies worker.js + all its dependencies into .open-next/assets/
 * so Cloudflare Pages can bundle _worker.js correctly.
 */
import { cp, copyFile } from 'fs/promises';
import { existsSync } from 'fs';

const src = '.open-next';
const dest = '.open-next/assets';

// 1. Copy entry-point worker as _worker.js
await copyFile(`${src}/worker.js`, `${dest}/_worker.js`);
console.log('✓ Copied worker.js → assets/_worker.js');

// 2. Copy all directories that worker.js imports from
const dirs = ['cloudflare', 'middleware', 'server-functions', '.build', 'cloudflare-templates'];
for (const dir of dirs) {
  const srcDir = `${src}/${dir}`;
  if (existsSync(srcDir)) {
    await cp(srcDir, `${dest}/${dir}`, { recursive: true });
    console.log(`✓ Copied ${dir}/`);
  }
}

// 3. Generate _routes.json so Cloudflare Pages serves static assets directly
import { writeFile } from 'fs/promises';
const routes = {
  version: 1,
  include: ["/*"],
  exclude: [
    "/_next/static/*",
    "/favicon.ico",
    "/images/*",
    "/manifest.json"
  ]
};
await writeFile(`${dest}/_routes.json`, JSON.stringify(routes, null, 2));
console.log('✓ Generated _routes.json for static assets');

console.log('\n✅ Post-build complete: Cloudflare Pages worker is ready.\n');
