import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { thumbnailUrl, setCoverImage } from '../dist/src/cover-images.js';

test('every catalog cover has a generated lightweight thumbnail',async()=>{
  const root=new URL('../dist/',import.meta.url);
  const catalog=JSON.parse(await readFile(new URL('data/catalog.json',root),'utf8'));
  const covers=new Set(catalog.groups.flatMap(group=>group.songs.map(song=>song.cover)).filter(Boolean));
  assert.ok(covers.size>100);
  await Promise.all([...covers].map(cover=>access(new URL(thumbnailUrl(cover).replace(/^\.\//,''),root))));
});

test('a missing or unsupported thumbnail falls back to the original cover',()=>{
  let onerror,failed=0;
  const image={addEventListener(name,callback){if(name==='error')onerror=callback;}};
  setCoverImage(image,'./assets/covers/01.webp',{thumbnail:true,onError:()=>failed++});
  assert.equal(image.src,'./assets/cover-thumbs/covers/01.webp');
  onerror();assert.equal(image.src,'./assets/covers/01.webp');assert.equal(failed,0);
  onerror();assert.equal(failed,1);
});
