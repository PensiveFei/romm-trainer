import test from 'node:test';
import assert from 'node:assert/strict';

test('home and library share a catalog request and a failed load can be retried',async()=>{
  const originalFetch=globalThis.fetch;
  const {loadCatalog}=await import('../dist/src/catalog.js');
  let calls=0,fail=true;
  globalThis.fetch=async()=>{
    calls++;
    if(fail) throw new Error('offline');
    return {ok:true,json:async()=>({groups:[]})};
  };
  try {
    const first=loadCatalog(),second=loadCatalog();
    assert.equal(first,second);
    await assert.rejects(first,/offline/);
    fail=false;
    const [a,b]=await Promise.all([loadCatalog(),loadCatalog()]);
    assert.equal(a,b);assert.equal(calls,2);
  } finally { globalThis.fetch=originalFetch; }
});
