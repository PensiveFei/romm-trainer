import test from 'node:test';
import assert from 'node:assert/strict';
import { createMetronomeWav } from '../dist/src/metronome.js';

// Compare the optimized mixer against the original per-beat synthesis, including
// closely spaced beats that overlap. A change in samples could shift practice audio.
function originalSamples(durationMs,bpm,firstBeat,beatTimesMs) {
  const sampleRate=22050,length=Math.ceil(durationMs/1000*sampleRate),data=new Float32Array(length);
  const add=(time,duration,fn)=>{
    const start=Math.floor(time*sampleRate),count=Math.floor(duration*sampleRate);
    for(let i=0;i<count && start+i<length;i++) data[start+i]+=fn(i/sampleRate);
  };
  const beats=beatTimesMs?.length ? beatTimesMs.map(t=>t/1000) : Array.from({length:Math.max(0,Math.ceil((durationMs/1000-firstBeat)*bpm/60))},(_,i)=>firstBeat+i*60/bpm);
  for(let beat=0;beat<beats.length;beat++) {
    const t=beats[beat],strong=beat%4===0;
    add(t,.12,s=>Math.sin(2*Math.PI*(strong?82:105)*s)*Math.exp(-s*35)*(strong?.35:.16));
    add(t+(beats[beat+1]?(beats[beat+1]-t)/2:30/bpm),.045,s=>Math.sin(2*Math.PI*1700*s)*Math.exp(-s*90)*.035);
  }
  const pcm=new Int16Array(length);
  for(let i=0;i<length;i++) pcm[i]=Math.max(-1,Math.min(1,data[i]))*32767;
  return pcm;
}

test('optimized metronome preserves the original audio samples and beat timing',()=>{
  for(const [duration,bpm,first,beats] of [[3000,120,.12,null],[2600,168,0,[0,700,715,1250,2000]]]) {
    const wav=createMetronomeWav(duration,bpm,first,beats);
    const header=new DataView(wav);
    assert.equal(header.getUint32(24,true),22050);
    assert.equal(header.getUint16(34,true),16);
    assert.deepEqual(new Int16Array(wav,44),originalSamples(duration,bpm,first,beats));
  }
});
