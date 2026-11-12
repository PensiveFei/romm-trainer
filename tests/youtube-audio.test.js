import test from 'node:test';
import assert from 'node:assert/strict';
import { YouTubeAudio } from '../dist/src/youtube-audio.js';

test('an album track uses its own video and offsets seeking to its chapter',async()=>{
  let instance;
  globalThis.location={origin:'http://localhost'};
  globalThis.window={YT:{Player:class {
    constructor(_element,options){this.options=options;this.time=options.playerVars.start;instance=this;queueMicrotask(()=>options.events.onReady());}
    setPlaybackRate(){}
    setVolume(value){this.volume=value;}
    getCurrentTime(){return this.time;}
    seekTo(time){this.time=time;}
    pauseVideo(){}
    destroy(){}
  }}};
  const audio=new YouTubeAudio({},()=>{},{videoId:'b2dhv1PlyqE',trackStartSeconds:3236});
  audio.volume=.35;
  await audio.ready;
  assert.equal(instance.volume,35);
  audio.volume=.7;
  assert.equal(instance.volume,70);
  audio.volume=2;
  assert.equal(instance.volume,100);
  assert.equal(instance.options.videoId,'b2dhv1PlyqE');
  assert.equal(instance.options.playerVars.start,3236);
  audio.currentTime=2.5;
  assert.equal(instance.time,3238.5);
  assert.equal(audio.currentTime,2.5);
  audio.destroy();
});
