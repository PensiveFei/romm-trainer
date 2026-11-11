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
    getBoundingClientRect() { return {width:0,height:0}; }
  }
  const ids=['stage','stageWrap','stageHint','feedback','message','playButton','playText','playIcon','restartButton',
    'startRange','endRange','startOutput','endOutput','loopToggle','scrollSpeed','scrollLabel','offset','speedLabel',
    'rateButtons','keyBindings','keyHelp','elapsed','duration','stageTime','progressFill','statHits','statCombo',
    'statTiming','statMiss','trackTitle','trackArtist','trackInfo','sideTitle','sideArtist','sideBpm','sourceTag',
    'chartFile','audioFile','chartButton','audioButton','demoButton','themeSelect',
    'performanceScore','completionValue','completionFill','completionTrack','toolsDrawer','toolsToggle','toolsClose',
    'hitWindow','hitWindowLabel'];
  const el=Object.fromEntries(ids.map(id=>[id,new FakeElement(id)]));
  el.startRange.value='0'; el.endRange.value='32'; el.loopToggle.checked=true; el.toolsDrawer.hidden=true;
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
  let nextFrame;
  globalThis.requestAnimationFrame=(fn)=>{ nextFrame=fn; return 0; };
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

  el.toolsToggle.dispatch('click');
  assert.equal(el.toolsDrawer.hidden,false);
  press('keydown','Escape');
  assert.equal(el.toolsDrawer.hidden,true);
  el.toolsToggle.dispatch('click'); el.toolsClose.dispatch('click');
  assert.equal(el.toolsDrawer.hidden,true);
  el.playButton.dispatch('click'); await flush();
  assert.equal(el.playText.textContent,'暂停');
  assert.equal(el.hitWindowLabel.textContent,'±180 ms');
  testAudio.currentTime=1.7; press('keydown','KeyA'); press('keyup','KeyA');
  assert.equal(el.feedback.textContent,'未命中 · 过早 300 ms');
  assert.equal(el.performanceScore.textContent,'0');
  testAudio.currentTime=2; press('keydown','KeyA'); press('keyup','KeyA');
  assert.equal(el.statHits.children[0].textContent.trim(),'1');
  assert.equal(el.performanceScore.textContent,'20');
  assert.notEqual(el.completionValue.textContent,'(0.0%)');
  const completionBeforeTheme=el.completionValue.textContent;
  el.themeSelect.value='electro'; el.themeSelect.dispatch('change');
  assert.equal(el.stageWrap.dataset.theme,'electro');
  assert.equal(settings.get('romm-trainer-theme'),'electro');
  assert.equal(el.playText.textContent,'暂停');
  assert.equal(testAudio.currentTime,2);
  assert.equal(el.completionValue.textContent,completionBeforeTheme);
  assert.equal(el.statHits.children[0].textContent.trim(),'1');
  testAudio.currentTime=10; press('keydown','KeyA');
  el.themeSelect.value='dream'; el.themeSelect.dispatch('change');
  assert.equal(el.stageWrap.dataset.theme,'dream');
  assert.equal(testAudio.currentTime,10);
  const missesBefore=Number(el.statMiss.textContent);
  const scoreAtHoldStart=Number(el.performanceScore.textContent);
  testAudio.currentTime=10.5;
  el.toolsToggle.dispatch('click');
  assert.equal(el.toolsDrawer.hidden,false);
  assert.ok(Number(el.performanceScore.textContent)>scoreAtHoldStart);
  assert.equal(el.playText.textContent,'继续练习');
  const missesAtPause=Number(el.statMiss.textContent);
  assert.ok(missesAtPause>=missesBefore);
  el.playButton.dispatch('click'); await flush();
  assert.equal(el.toolsDrawer.hidden,true);
  testAudio.currentTime=11; press('keyup','KeyA');
  assert.equal(Number(el.statMiss.textContent),missesAtPause);
  assert.equal(el.statHits.children[0].textContent.trim(),'2');

  el.endRange.value='12'; el.endRange.dispatch('input');
  assert.equal(el.completionValue.textContent,'(0.0%)');
  el.playButton.dispatch('click'); await flush();
  testAudio.currentTime=2; press('keydown','KeyA'); press('keyup','KeyA');
  assert.notEqual(el.completionValue.textContent,'(0.0%)');
  testAudio.currentTime=12; nextFrame();
  assert.equal(el.completionValue.textContent,'(0.0%)');
  assert.match(el.message.textContent,/上一轮：完成度 [\d.]+%/);
  assert.equal(el.playText.textContent,'暂停');

  el.toolsToggle.dispatch('click');
  el.hitWindow.value='220'; el.hitWindow.dispatch('input');
  assert.equal(el.hitWindowLabel.textContent,'±220 ms');
  el.hitWindow.dispatch('change');
  assert.equal(settings.get('romm-trainer-hit-window'),'220');
  el.playButton.dispatch('click'); await flush();
  testAudio.currentTime=1.8; press('keydown','KeyA'); press('keyup','KeyA');
  assert.equal(el.performanceScore.textContent,'10');
  assert.equal(el.statHits.children[0].textContent.trim(),'1');
});
