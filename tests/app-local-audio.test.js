import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { localAudioOffsets, localAudioStore } from '../dist/src/local-audio.js';

test('a saved local soundtrack restores its start point and reports unsupported platform audio', async (t) => {
  t.mock.timers.enable({apis:['setTimeout']});
  class FakeElement {
    constructor() {
      this.tagName='DIV'; this.textContent=''; this.children=[]; this.listeners={};
      this.value=''; this.checked=false; this.hidden=false; this.style={}; this.dataset={};
      this.classList={add(){},remove(){},toggle(){}};
    }
    addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
    dispatch(name, event={}) { for (const fn of this.listeners[name] || []) fn(event); }
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
    'songOptions','onlinePanel','songAudioStatus','musicStart','onlineButton','metronomeButton','youtubePlayer','youtubeMount',
    'rememberAudio','savedAudioStatus','forgetAudio'];
  const el=Object.fromEntries(ids.map(id=>[id,new FakeElement()]));
  el.startRange.value='0'; el.endRange.value='32'; el.toolsDrawer.hidden=true;
  const values = new Map();
  globalThis.localStorage={getItem:key=>values.get(key) ?? null,setItem:(key,value)=>values.set(key,value)};
  globalThis.HTMLElement=FakeElement;
  globalThis.window={devicePixelRatio:1,addEventListener(){}};
  globalThis.document={
    hidden:false,body:new FakeElement(),getElementById:id=>el[id],
    createElement:()=>new FakeElement(),createTextNode:text=>({textContent:text}),addEventListener(){}
  };
  globalThis.requestAnimationFrame=()=>0;
  globalThis.location={origin:'http://localhost'};
  let player;
  globalThis.Audio=class {
    constructor(){this.listeners={};this.currentTime=0;this.duration=141;this.paused=true;player=this;}
    addEventListener(name,fn){(this.listeners[name] ||= []).push(fn);}
    removeEventListener(name,fn){this.listeners[name]=(this.listeners[name] || []).filter(listener=>listener !== fn);}
    dispatch(name){for(const fn of [...(this.listeners[name] || [])])fn();}
    load(){this.dispatch('loadedmetadata');}
    pause(){this.paused=true;}
  };
  const chart=JSON.parse(await readFile(new URL('../dist/data/surasthana-legend.json',import.meta.url),'utf8'));
  globalThis.fetch=async()=>({ok:true,json:async()=>chart});
  const file=new File(['audio'], 'surasthana.flac', {type:'audio/flac',lastModified:42});
  let savedFile=file;
  localAudioStore.get=async()=>savedFile;
  localAudioStore.put=async(_key,value)=>{savedFile=value;};
  localAudioStore.remove=async()=>{savedFile=null;};
  localAudioOffsets.set('_GMusic16', file, 12.35);
  const flush=()=>new Promise(resolve=>setImmediate(resolve));
  await import('../dist/src/app.js?local-audio-integration');

  el.songButton.dispatch('click'); await flush(); await flush();
  assert.equal(el.trackTitle.textContent,'净善的遐歌');
  assert.equal(el.musicStart.value,'12.35');
  assert.equal(el.musicStart.max,'46');
  assert.equal(player.currentTime,12.35);

  el.musicStart.value='18.5'; el.musicStart.dispatch('change');
  assert.equal(player.currentTime,18.5);
  assert.equal(localAudioOffsets.get('_GMusic16',file),18.5);
  el.songButton.dispatch('click'); await flush(); await flush();
  assert.equal(el.musicStart.value,'18.5');

  const protectedFile=new File(['unrecognized'], 'song.mgg', {lastModified:43});
  el.rememberAudio.checked=false;
  el.audioFile.files=[protectedFile];
  el.audioFile.dispatch('change');
  player.dispatch('error');
  assert.match(el.message.textContent,/平台专用音频/);
  assert.equal(localAudioOffsets.get('_GMusic16',file),18.5);

  el.songButton.dispatch('click'); await flush(); await flush();
  el.forgetAudio.dispatch('click'); await flush();
  assert.equal(localAudioOffsets.get('_GMusic16',file),0);
  el.musicStart.value='3'; el.musicStart.dispatch('change');
  assert.equal(localAudioOffsets.get('_GMusic16',file),0);
});
