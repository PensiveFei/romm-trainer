import test from 'node:test';
import assert from 'node:assert/strict';
import { createHitSound, HIT_VOLUME_KEY } from '../dist/src/hit-sound.js';

test('manual hit sound unlocks once, supports overlapping presses, and respects mute',()=>{
  const values=new Map(),storage={getItem:key=>values.get(key) ?? null,setItem:(key,value)=>values.set(key,value)};
  let context;
  class FakeContext {
    constructor(){context=this;this.state='running';this.currentTime=1;this.sampleRate=48000;this.destination={};this.notes=[];this.unlocks=0;}
    createGain(){return {gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
    createBuffer(){return {};}
    createBufferSource(){return {connect(){},disconnect(){},start:()=>{this.unlocks++;}};}
    createOscillator(){const osc={frequency:{setValueAtTime(){}},connect(){},disconnect(){},start:()=>this.notes.push(osc),stop(){}};return osc;}
  }
  const sound=createHitSound({storage,AudioContextClass:FakeContext});
  assert.equal(sound.getVolume(),30);
  sound.play();assert.equal(context,undefined,'no sound is synthesized without a user gesture');
  sound.unlock();assert.equal(context.unlocks,1);
  sound.play();sound.play();assert.equal(context.notes.length,4,'two presses may overlap');
  sound.setVolume(0);sound.play();assert.equal(context.notes.length,4);
  assert.equal(values.get(HIT_VOLUME_KEY),'0');
  assert.equal(createHitSound({storage,AudioContextClass:FakeContext}).getVolume(),0);
  sound.setVolume(150);assert.equal(sound.getVolume(),100);
});

test('unavailable audio and blocked storage do not prevent practice',()=>{
  const sound=createHitSound({storage:{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}}});
  assert.doesNotThrow(()=>{sound.unlock();sound.play();sound.setVolume(50);});
  assert.equal(sound.getVolume(),50);
});
