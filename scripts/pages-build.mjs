// Cloudflare Pages 构建脚本
//
// 作用：把 dist/ 整理成可发布的 build/，并做两件仓库里没有的事：
//   1. 叠加 deploy/ 下的 _headers 与 404.html
//   2. 给 src 下所有 js/css 打内容哈希（全局版本号），避免 Cloudflare 边缘
//      对同名文件沿用旧缓存，导致「新 HTML + 旧 JS」的版本错配
//
// Pages 面板设置：
//   Build command        : node scripts/pages-build.mjs
//   Build output directory: build
//
// 本地预览：
//   node scripts/pages-build.mjs && npx serve build
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'build');
const OVERLAY = path.join(ROOT, 'deploy');

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function run() {
  if (!(await exists(SRC))) throw new Error('找不到 dist/ 目录');

  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });
  await fs.cp(SRC, OUT, { recursive: true });

  // 1) 叠加部署专用文件
  const overlaid = [];
  if (await exists(OVERLAY)) {
    for (const name of await fs.readdir(OVERLAY)) {
      const from = path.join(OVERLAY, name);
      await fs.cp(from, path.join(OUT, name), { recursive: true, force: true });
      overlaid.push(name);
    }
  }

  // 2) 计算 src 全局版本号
  const srcDir = path.join(OUT, 'src');
  if (!(await exists(srcDir))) throw new Error('找不到 dist/src 目录');
  const srcFiles = (await fs.readdir(srcDir)).filter(f => /\.(js|css)$/.test(f)).sort();
  const hasher = crypto.createHash('sha256');
  for (const f of srcFiles) hasher.update(f).update(await fs.readFile(path.join(srcDir, f)));
  const version = hasher.digest('hex').slice(0, 8);

  // 3) 改写 index.html 的引用
  const indexPath = path.join(OUT, 'index.html');
  let html = await fs.readFile(indexPath, 'utf8');
  const before = html;
  html = html.replace(
    /(src|href)="\.\/src\/([A-Za-z0-9._-]+\.(?:js|css))"/g,
    (_, attr, file) => `${attr}="./src/${file}?v=${version}"`,
  );
  if (html !== before) await fs.writeFile(indexPath, html, 'utf8');

  // 4) 改写模块内部的相对 import，让子模块也换缓存键
  let importRewrites = 0;
  const importRe = /(from\s*|import\s*\(\s*)(['"])\.\/([A-Za-z0-9._-]+\.js)\2/g;
  for (const f of srcFiles.filter(name => name.endsWith('.js'))) {
    const file = path.join(srcDir, f);
    const source = await fs.readFile(file, 'utf8');
    const next = source.replace(importRe, (_, lead, quote, target) => {
      importRewrites += 1;
      return `${lead}${quote}./${target}?v=${version}${quote}`;
    });
    if (next !== source) await fs.writeFile(file, next, 'utf8');
  }

  // 5) 汇总
  const files = [];
  async function walk(dir, rel = '') {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await walk(path.join(dir, entry.name), relPath);
      else files.push(relPath);
    }
  }
  await walk(OUT);
  const totals = await Promise.all(files.map(f => fs.stat(path.join(OUT, f))));
  const bytes = totals.reduce((sum, s) => sum + s.size, 0);

  await fs.writeFile(
    path.join(OUT, 'build-info.json'),
    `${JSON.stringify({ builtAt: new Date().toISOString(), version, files: files.length, overlaid }, null, 2)}\n`,
    'utf8',
  );

  console.log(`[pages-build] 版本号 v=${version}`);
  console.log(`[pages-build] 叠加文件: ${overlaid.join(', ') || '无'}`);
  console.log(`[pages-build] import 改写: ${importRewrites} 处`);
  console.log(`[pages-build] 产物: ${files.length} 个文件, ${(bytes / 1048576).toFixed(2)} MB`);
}

await run();
