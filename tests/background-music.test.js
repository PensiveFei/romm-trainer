import test from 'node:test';
import assert from 'node:assert/strict';
import {createBackgroundMusic, resolveDreamAria, BACKGROUND_MUSIC_ENABLED_KEY, BACKGROUND_MUSIC_VOLUME_KEY} from '../dist/src/background-music.js';

class FakeAudio extends EventTarget {
  constructor(){super();this.src='';this.paused=true;this.starts=0;this.failure=null;}
  async play(){this.starts++;if(this.failure)throw this.failure;this.paused=false;this.dispatchEvent(new Event('playing'));}
  pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}
}
function fakeStorage(){const values=new Map();return {values,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};}

test('background music loops while browsing, pauses for practice and remembers the player preference',async()=>{
  const audio=new FakeAudio(),storage=fakeStorage();let active=true,loads=0;
  const music=createBackgroundMusic({audio,storage,isActive:()=>active,resolveSource:async()=>{loads++;return 'https://test.invalid/song';}});
  assert.equal(audio.loop,true);assert.equal(audio.volume,.25);
  assert.equal(await music.start(),true);assert.equal(music.snapshot().state,'playing');assert.equal(loads,1);
  active=false;music.suspend();assert.equal(audio.paused,true);assert.equal(await music.start(),false);
  active=true;assert.equal(await music.start(),true);assert.equal(loads,1,'returning to the library reuses the source');
  music.setVolume(40);assert.equal(audio.volume,.4);assert.equal(storage.values.get(BACKGROUND_MUSIC_VOLUME_KEY),'40');
  music.setEnabled(false);assert.equal(audio.paused,true);assert.equal(storage.values.get(BACKGROUND_MUSIC_ENABLED_KEY),'false');
  assert.equal(await music.start(),false);
  const reloaded=createBackgroundMusic({audio:new FakeAudio(),storage});
  assert.deepEqual(reloaded.snapshot(),{enabled:false,volume:40,state:'off'});
});

test('a delayed source cannot start over a practice or a disabled preference',async()=>{
  const audio=new FakeAudio();let active=true,resolve;
  const music=createBackgroundMusic({audio,isActive:()=>active,resolveSource:()=>new Promise(done=>{resolve=done;})});
  const starting=music.start();await Promise.resolve();
  active=false;music.suspend();resolve('https://test.invalid/song');
  assert.equal(await starting,false);assert.equal(audio.starts,0);
  active=true;assert.equal(await music.start(),true);
  music.setEnabled(false);assert.equal(audio.paused,true);
});

test('blocked autoplay can be retried and media errors refresh the source',async()=>{
  const audio=new FakeAudio();let loads=0;
  const music=createBackgroundMusic({audio,resolveSource:async()=>{loads++;return 'https://test.invalid/song';}});
  audio.failure=Object.assign(new Error('gesture required'),{name:'NotAllowedError'});
  assert.equal(await music.start(),false);assert.equal(music.snapshot().state,'blocked');
  audio.failure=null;
  const retry=music.start();assert.equal(audio.starts,2,'a prepared source starts within the user gesture');
  assert.equal(await retry,true);assert.equal(loads,1);
  audio.pause();assert.equal(music.snapshot().state,'idle','an interrupted player can be resumed on the next gesture');
  assert.equal(await music.start(),true);
  audio.dispatchEvent(new Event('error'));assert.equal(music.snapshot().state,'error');
  assert.equal(await music.start(),true);assert.equal(loads,2);
});

test('the resolver accepts the intended official song and rejects unexpected streams',async()=>{
  const response=url=>async()=>({ok:true,json:async()=>({code:0,data:{song_id:1659248,urls:[url]}})});
  assert.equal(await resolveDreamAria(response('https://example.bilivideo.com/track.m4a')),'https://example.bilivideo.com/track.m4a');
  await assert.rejects(resolveDreamAria(response('https://evil.example/track.m4a')));
  await assert.rejects(resolveDreamAria(async()=>({ok:false})));
});
