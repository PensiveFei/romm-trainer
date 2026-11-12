import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('leaving while online playback is connecting resets the button and restarts from the selected start', async (t) => {
  t.mock.timers.enable({apis:['setTimeout']});
  class FakeElement {
    constructor() {
      this.tagName='DIV'; this.textContent=''; this.children=[]; this.listeners={};
      this.value=''; this.checked=false; this.hidden=false; this.style={}; this.dataset={};
      this.classList={add(){},remove(){},toggle(){}};
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
  const ids=['stage','stageWrap','stageHint','practiceCountdown','feedback','message','playButton','playText','playIcon','restartButton',
    'startRange','endRange','startOutput','endOutput','loopToggle','scrollSpeed','scrollLabel','offset','speedLabel',
    'rateButtons','keyBindings','keyHelp','elapsed','duration','stageTime','progressFill','statHits','statCombo',
    'statTiming','statMiss','trackTitle','trackArtist','trackInfo','sideTitle','sideArtist','sideBpm','sourceTag',
    'chartFile','audioFile','chartButton','audioButton','demoButton','themeSelect','performanceScore','completionValue',
    'completionFill','completionTrack','toolsDrawer','toolsToggle','toolsClose','hitWindow','hitWindowLabel','songButton',
    'songOptions','onlinePanel','songAudioStatus','musicStart','onlineButton','metronomeButton','youtubePlayer','youtubeMount'];
  const el=Object.fromEntries(ids.map(id=>[id,new FakeElement()]));
  el.startRange.value='0'; el.endRange.value='32'; el.toolsDrawer.hidden=true;
  const listeners={};
  globalThis.HTMLElement=FakeElement;
  globalThis.window={devicePixelRatio:1,addEventListener(name,fn){(listeners[name] ||= []).push(fn);}};
  globalThis.document={
    hidden:false,body:new FakeElement(),getElementById:id=>el[id],
    createElement:()=>new FakeElement(),createTextNode:text=>({textContent:text}),addEventListener(){}
  };
  globalThis.localStorage={getItem:()=>null,setItem(){}};
  globalThis.requestAnimationFrame=()=>0;
  globalThis.location={origin:'http://localhost'};
  globalThis.Audio=class {
    constructor(){this.listeners={};this.currentTime=0;this.duration=120;this.paused=true;}
    addEventListener(name,fn){this.listeners[name]=fn;}
    load(){this.listeners.loadedmetadata?.();}
    pause(){this.paused=true;}
  };
  const chart=JSON.parse(await readFile(new URL('../dist/data/surasthana-legend.json',import.meta.url),'utf8'));
  globalThis.fetch=async()=>({ok:true,json:async()=>chart});
  let youtube;
  window.YT={Player:class {
    constructor(_element,options){this.options=options;this.time=2582;this.seeks=[];youtube=this;queueMicrotask(()=>options.events.onReady());}
    setPlaybackRate(){}
    getCurrentTime(){return this.time;}
    seekTo(value){this.time=value;this.seeks.push(value);}
    playVideo(){} // Deliberately leave the player connecting until the test resolves it.
    pauseVideo(){this.options.events.onStateChange({data:2});}
  }};
  const flush=()=>new Promise(resolve=>setImmediate(resolve));
  const emit=name=>{for(const fn of listeners[name] || [])fn({type:name});};
  await import('../dist/src/app.js');
  el.songButton.dispatch('click'); await flush(); await flush();
  assert.equal(el.trackTitle.textContent,'净善的遐歌');

  for (const destination of ['romm:show-home','romm:library-open']) {
    el.restartButton.dispatch('click');
    el.playButton.dispatch('click'); t.mock.timers.tick(1000); t.mock.timers.tick(1000); t.mock.timers.tick(1000); await flush();
    assert.equal(el.playText.textContent,'正在连接…');

    emit(destination); await flush();
    assert.equal(el.playText.textContent,'开始练习');
    assert.equal(el.playIcon.textContent,'▶');

    // A late player callback after cancellation must not resume playback or overwrite the button.
    youtube.options.events.onStateChange({data:1}); await flush();
    assert.equal(el.playText.textContent,'开始练习');

    // Moving the fake player away from the starting point makes a fresh seek observable.
    youtube.time=2592;
    const previousSeeks=youtube.seeks.length;
    el.playButton.dispatch('click'); t.mock.timers.tick(1000); t.mock.timers.tick(1000); t.mock.timers.tick(1000); await flush();
    assert.equal(youtube.seeks.length,previousSeeks+1);
    assert.equal(youtube.seeks.at(-1),2582);
    assert.equal(el.playText.textContent,'正在连接…');
    youtube.options.events.onStateChange({data:1}); await flush();
    assert.equal(el.playText.textContent,'暂停');
    el.playButton.dispatch('click'); // Pause before testing the other destination.
  }
  youtube.options.events.onError({data:100}); await flush();
  assert.equal(el.songAudioStatus.textContent,'节拍伴奏 · 无歌曲原声');
  assert.match(el.message.textContent,/已切换节拍伴奏/);

  // An unreachable online player must not leave the song permanently loading.
  window.YT.Player=class { pauseVideo(){} destroy(){} };
  el.onlineButton.dispatch('click'); await flush();
  assert.equal(el.songAudioStatus.textContent,'在线原声 · 同步待校准');
  t.mock.timers.tick(8000); await flush();
  assert.equal(el.songAudioStatus.textContent,'节拍伴奏 · 无歌曲原声');
  assert.match(el.message.textContent,/已切换节拍伴奏/);
});
