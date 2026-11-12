import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildVersion } from '../scripts/build-version.mjs';
import { resolveChartUrl } from '../dist/src/chart.js';

test('chart requests use the version of their app without replacing existing parameters', () => {
  assert.equal(resolveChartUrl('./data/library/song.json?lang=zh','https://example.com/game/src/chart.js?v=abc123'),
    'https://example.com/game/data/library/song.json?lang=zh&v=abc123');
  assert.equal(resolveChartUrl('./data/song.json','https://example.com/game/src/chart.js'),
    'https://example.com/game/data/song.json');
  assert.equal(resolveChartUrl('https://other.example/song.json','https://example.com/game/src/chart.js?v=abc123'),
    'https://other.example/song.json');
});

test('a chart-only update changes the version used by the app and catalog', async t => {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'romm-build-version-'));
  const src=path.join(root,'src'), data=path.join(root,'data'), charts=path.join(data,'library');
  await fs.mkdir(src); await fs.mkdir(data); await fs.mkdir(charts);
  const script=path.join(src,'app.js'), catalog=path.join(data,'catalog.json'), chart=path.join(charts,'song.json');
  await fs.writeFile(script,'app'); await fs.writeFile(catalog,'{}'); await fs.writeFile(chart,'{"notes":[]}');
  t.after(async()=>{for(const file of [script,catalog,chart]) await fs.unlink(file);for(const dir of [charts,data,src,root]) await fs.rmdir(dir);});
  const before=await buildVersion(root);
  assert.equal(await buildVersion(root),before);
  await fs.writeFile(chart,'{"notes":[1]}');
  assert.notEqual(await buildVersion(root),before);
});
