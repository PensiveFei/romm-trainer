import test from 'node:test';
import assert from 'node:assert/strict';

test('pausing a held note keeps it valid while the key remains down', async () => {
  class FakeElement {
    constructor(id='') {
      this.id=id; this.tagName='DIV'; this.textContent=''; this.children=[]; this.listeners={};
      this.value=''; this.checked=false; this.style={}; this.dataset={};
      this.classList={ add(){}, remove(){}, toggle(){} };
    }
    addEventListener(name,fn) { (this.listeners[name] ||= []).push(fn); }
    dispatch(name,event={}) { for (const fn of this.listeners[name] || []) fn(event); }
    replaceChildren(...children) { this.children=children; }
    appendChild(child) { this.children.push(child); }
    setAttribute() {}
    focus() {}
    blur() {}
    querySelectorAll() { return []; }
    getContext() { return {}; }
  }
  const ids=['stage','stageWrap','stageHint','feedback','message','playButton','playText','playIcon','restartButton',
    'startRange','endRange','startOutput','endOutput','loopToggle','scrollSpeed','scrollLabel','offset','speedLabel',
    'rateButtons','keyBindings','keyHelp','elapsed','duration','stageTime','progressFill','statHits','statCombo',
    'statTiming','statMiss','trackTitle','trackArtist','trackInfo','sideTitle','sideArtist','sideBpm','sourceTag',
    'chartFile','audioFile','chartButton','audioButton','demoButton','themeSelect'];
  const el=Object.fromEntries(ids.map(id=>[id,new FakeElement(id)]));
  el.startRange.value='0'; el.endRange.value='32'; el.loopToggle.checked=true;
  const listeners={};
  globalThis.HTMLElement=FakeElement;
  globalThis.window={ devicePixelRatio:1, addEventListener(name,fn){ (listeners[name] ||= []).push(fn); } };
  globalThis.document={
    hidden:false, body:new FakeElement('body'), getElementById(id){ return el[id]; },
    createElement(){ return new FakeElement(); }, createTextNode(text){ return {textContent:text}; },
    addEventListener(){}
  };
  const settings=new Map();
  globalThis.localStorage={ getItem(key){return settings.get(key) ?? null;}, setItem(key,value){settings.set(key,value);} };
  globalThis.requestAnimationFrame=()=>0;
  class FakeAudio {
    constructor(){ this.listeners={}; this.currentTime=0; this.duration=32; this.paused=true; globalThis.testAudio=this; }
    addEventListener(name,fn){ this.listeners[name]=fn; }
    load(){ this.listeners.loadedmetadata?.(); }
    async play(){ this.paused=false; }
    pause(){ this.paused=true; }
  }
  globalThis.Audio=FakeAudio;
  await import('../dist/src/app.js');
  const press=(name,code)=>listeners[name].forEach(fn=>fn({code,repeat:false,target:document.body,preventDefault(){}}));
  const flush=()=>new Promise(resolve=>setImmediate(resolve));

  el.playButton.dispatch('click'); await flush();
  assert.equal(el.playText.textContent,'暂停');
  testAudio.currentTime=2; press('keydown','KeyA'); press('keyup','KeyA');
  assert.equal(el.statHits.children[0].textContent.trim(),'1');
  el.themeSelect.value='electro'; el.themeSelect.dispatch('change');
  assert.equal(el.stageWrap.dataset.theme,'electro');
  assert.equal(settings.get('romm-trainer-theme'),'electro');
  assert.equal(el.playText.textContent,'暂停');
  assert.equal(testAudio.currentTime,2);
  assert.equal(el.statHits.children[0].textContent.trim(),'1');
  testAudio.currentTime=10; press('keydown','KeyA');
  el.themeSelect.value='dream'; el.themeSelect.dispatch('change');
  assert.equal(el.stageWrap.dataset.theme,'dream');
  assert.equal(testAudio.currentTime,10);
  const missesBefore=Number(el.statMiss.textContent);
  el.playButton.dispatch('click');
  assert.equal(el.playText.textContent,'继续练习');
  assert.equal(Number(el.statMiss.textContent),missesBefore);
  el.playButton.dispatch('click'); await flush();
  testAudio.currentTime=11; press('keyup','KeyA');
  assert.equal(Number(el.statMiss.textContent),missesBefore);
  assert.equal(el.statHits.children[0].textContent.trim(),'2');
});
