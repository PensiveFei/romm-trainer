// Reuse the three short synthesized sounds rather than recomputing them for
// every beat. The mix and resulting 16-bit WAV use the original timing.
const sampleRate=22050;
let samples;
function beatSamples() {
  if (samples) return samples;
  const wave=(duration,frequency,decay,amplitude)=>Float64Array.from(
    {length:Math.floor(duration*sampleRate)},
    (_,i)=>{const s=i/sampleRate;return Math.sin(2*Math.PI*frequency*s)*Math.exp(-s*decay)*amplitude;}
  );
  samples={strong:wave(.12,82,35,.35),weak:wave(.12,105,35,.16),tick:wave(.045,1700,90,.035)};
  return samples;
}

export function createMetronomeWav(durationMs=32000,bpm=120,firstBeat=0,beatTimesMs=null) {
  const length=Math.ceil(durationMs/1000*sampleRate), data=new Float32Array(length);
  const tones=beatSamples();
  const add=(time,signal)=>{
    const start=Math.floor(time*sampleRate);
    for(let i=0;i<signal.length && start+i<length;i++) data[start+i]+=signal[i];
  };
  const beats=Array.isArray(beatTimesMs) && beatTimesMs.length ? beatTimesMs.map(t=>t/1000) : Array.from({length:Math.max(0,Math.ceil((durationMs/1000-firstBeat)*bpm/60))},(_,i)=>firstBeat+i*60/bpm);
  for(let beat=0;beat<beats.length;beat++) {
    const t=beats[beat];
    add(t,beat%4===0?tones.strong:tones.weak);
    add(t+(beats[beat+1]?(beats[beat+1]-t)/2:30/bpm),tones.tick);
  }
  const bytes=new ArrayBuffer(44+length*2), view=new DataView(bytes);
  const text=(at,value)=>{for(let i=0;i<value.length;i++) view.setUint8(at+i,value.charCodeAt(i));};
  text(0,'RIFF');view.setUint32(4,36+length*2,true);text(8,'WAVE');text(12,'fmt ');
  view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
  view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);
  view.setUint16(32,2,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,length*2,true);
  for(let i=0;i<length;i++) view.setInt16(44+i*2,Math.max(-1,Math.min(1,data[i]))*32767,true);
  return bytes;
}
