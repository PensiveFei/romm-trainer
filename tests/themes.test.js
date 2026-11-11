import test from 'node:test';
import assert from 'node:assert/strict';
import { THEMES, getTheme, paintBackdrop, paintHit } from '../dist/src/themes.js';

const requested=['wind','geo','electro','hydro','pyro','dendro','dream','frost'];

function recorder() {
  const calls=[];
  const ctx=new Proxy({}, {
    get(_target, name) { return (...args) => { calls.push([name,...args]); }; },
    set(_target, name, value) { calls.push(['set',name,value]); return true; }
  });
  return {ctx,calls};
}

test('all requested themes have independent visual motifs and invalid choices fall back safely', () => {
  assert.deepEqual(requested.map(id=>THEMES[id].name),
    ['风与自由','岩与契约','雷与永恒','水与正义','火与战争','草与智慧','静思浮梦','霜月的祷言']);
  assert.equal(new Set(requested.map(id=>THEMES[id].motif)).size,8);
  assert.equal(getTheme('not-a-theme'),THEMES.base);
  assert.equal(getTheme('toString'),THEMES.base);
});

test('themes draw distinct scenery and manual-hit effects, with no effects outside their lifetime', () => {
  const scenery=new Set(), hits=new Set();
  for (const id of requested) {
    const backdrop=recorder(), hit=recorder();
    paintBackdrop(backdrop.ctx,THEMES[id],700,450);
    paintHit(hit.ctx,THEMES[id],100,200,20,.5);
    // Compare geometry, not merely color assignments.
    scenery.add(JSON.stringify(backdrop.calls.filter(call=>call[0]!=='set')));
    hits.add(JSON.stringify(hit.calls.filter(call=>call[0]!=='set')));
    assert.equal(hit.calls.filter(call=>call[0]==='save').length,hit.calls.filter(call=>call[0]==='restore').length);
  }
  assert.equal(scenery.size,requested.length);
  assert.equal(hits.size,requested.length);
  const expired=recorder();
  paintHit(expired.ctx,THEMES.wind,100,200,20,1);
  paintHit(expired.ctx,THEMES.wind,100,200,20,-.1);
  assert.equal(expired.calls.length,0);
});
