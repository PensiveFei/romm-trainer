// Generate small, replaceable previews from the checked-in cover artwork.
// Requires ImageMagick; these files are checked in, so deploys need only Node.
import { mkdir, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets=path.join(root,'dist/assets');
for (const folder of ['covers','encounter-covers']) {
  const source=path.join(assets,folder), target=path.join(assets,'cover-thumbs',folder);
  await mkdir(target,{recursive:true});
  for (const name of await readdir(source)) {
    if (!/\.(webp|jpe?g|png)$/i.test(name)) continue;
    const output=path.join(target,name.replace(/\.[^.]+$/,'.webp'));
    const result=spawnSync('magick',[path.join(source,name),'-thumbnail','192x192>','-strip','-quality','72',output],{stdio:'inherit'});
    if (result.status!==0) throw new Error(`Could not generate ${output}`);
  }
}
const hero=spawnSync('magick',[path.join(assets,'encounter-covers/01-qkfbm4fgdarh1.png'),'-strip','-quality','80',path.join(assets,'home-hero.jpg')],{stdio:'inherit'});
if (hero.status!==0) throw new Error('Could not generate home hero image');
console.log('Cover previews generated.');
