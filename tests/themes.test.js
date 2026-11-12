import test from 'node:test';
import assert from 'node:assert/strict';
import { THEMES, getTheme, paintBackdrop, paintHit } from '../dist/src/themes.js';
import { isReferenceTheme, paintReferenceBackdrop, paintReferenceHold, paintReferenceNote } from '../dist/src/reference-themes.js';

const requested=['wind','geo','electro','hydro','pyro','dendro','dream','frost'];

function recorder() {
  const calls=[];
  const ctx=new Proxy({}, {
    get(_target, name) {
      if (name === 'createLinearGradient') return (...args) => {
        calls.push([name,...args]);
        return { addColorStop(...stop) { calls.push(['addColorStop',...stop]); } };
      };
      return (...args) => { calls.push([name,...args]); };
    },
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


test('the screenshot themes render their own backgrounds, tap notes and holds', () => {
  const ids=['moonfeather','feast','plum','lotus','flameheart','whitestar','icefang','sakura'];
  const noteGeometry=new Set(), sceneGeometry=new Set();
  for(const id of ids) {
    assert.equal(isReferenceTheme(id),true);
    const scene=recorder(), tap=recorder(), hold=recorder(), ribbon=recorder();
    assert.equal(paintReferenceBackdrop(scene.ctx,id,700,450),true);
    assert.equal(paintReferenceNote(tap.ctx,id,100,200,20,false),true);
    assert.equal(paintReferenceNote(hold.ctx,id,100,200,20,true),true);
    assert.equal(paintReferenceHold(ribbon.ctx,id,100,50,200,20),true);
    assert.notDeepEqual(tap.calls,hold.calls,`${id} must distinguish taps and holds`);
    for(const drawing of [scene,tap,hold,ribbon]) {
      assert.equal(drawing.calls.filter(call=>call[0]==='save').length,drawing.calls.filter(call=>call[0]==='restore').length);
    }
    sceneGeometry.add(JSON.stringify(scene.calls.filter(call=>call[0]!=='set')));
    noteGeometry.add(JSON.stringify(tap.calls.filter(call=>call[0]!=='set')));
  }
  assert.equal(sceneGeometry.size,ids.length);
  assert.equal(noteGeometry.size,ids.length);
  const unsupported=recorder();
  assert.equal(paintReferenceBackdrop(unsupported.ctx,'base',700,450),false);
  assert.equal(paintReferenceNote(unsupported.ctx,'base',100,200,20,false),false);
  assert.equal(paintReferenceHold(unsupported.ctx,'base',100,50,200,20),false);
  assert.equal(unsupported.calls.length,0);
});
