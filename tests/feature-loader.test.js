import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

async function fixture(t) {
  const dir=await mkdtemp(path.join(os.tmpdir(),'romm-lazy-'));
  t.after(()=>rm(dir,{recursive:true,force:true}));
  await writeFile(path.join(dir,'package.json'),' {"type":"module"}');
  await writeFile(path.join(dir,'feature-loader.js'),await readFile(new URL('../dist/src/feature-loader.js',import.meta.url)));
  const url=pathToFileURL(path.join(dir,'feature-loader.js'));url.searchParams.set('v','test-version');
  return {dir,loader:await import(url.href)};
}

test('practice and library load once on demand with the current build version',async t=>{
  const {dir,loader}=await fixture(t);
  const source='export const loadedUrl=import.meta.url;';
  await writeFile(path.join(dir,'app.js'),source);
  await writeFile(path.join(dir,'library.js'),source);
  const [first,second]=await Promise.all([loader.loadPractice(),loader.loadPractice()]);
  assert.equal(first,second);
  assert.equal(new URL(first.loadedUrl).searchParams.get('v'),'test-version');
  const library=await loader.loadLibrary();
  assert.equal(new URL(library.loadedUrl).searchParams.get('v'),'test-version');
});

test('a failed feature load can be retried after the module becomes available',async t=>{
  const {dir,loader}=await fixture(t);
  await assert.rejects(loader.loadPractice());
  await writeFile(path.join(dir,'app.js'),'export const loadedUrl=import.meta.url;');
  const loaded=await loader.loadPractice();
  const url=new URL(loaded.loadedUrl);
  assert.equal(url.searchParams.get('v'),'test-version');
  assert.equal(url.searchParams.get('retry'),'1');
});
