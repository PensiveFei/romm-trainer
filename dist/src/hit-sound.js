export const HIT_VOLUME_KEY='romm-trainer-hit-volume';

// A short synthesized pluck acknowledges a manual press without guessing the
// song's melody. One shared context is unlocked by the user's play gesture.
export function createHitSound({storage, AudioContextClass}={}) {
  let volume=30, context=null, output=null;
  try {
    const saved=storage?.getItem(HIT_VOLUME_KEY);
    if (saved!==null && saved!==undefined && Number.isFinite(Number(saved))) volume=Math.max(0,Math.min(100,Number(saved)));
  } catch { /* Volume remains available for this session. */ }
  function unlock() {
    if (!AudioContextClass || volume===0) return;
    try {
      if (!context) {
        try { context=new AudioContextClass({latencyHint:'interactive'}); } catch { context=new AudioContextClass(); }
        output=context.createGain(); output.gain.value=.7; output.connect(context.destination);
      }
      if (context.state!=='running' && context.state!=='closed') void Promise.resolve(context.resume()).catch(()=>{});
      // Starting a silent buffer inside the gesture also unlocks older iOS Web Audio.
      const source=context.createBufferSource(); source.buffer=context.createBuffer(1,1,context.sampleRate);
      source.connect(output); source.start(); source.onended=()=>source.disconnect();
    } catch { /* Sound feedback is optional if the browser blocks audio. */ }
  }
  function soundPress() {
    if (!context || !output || volume===0 || context.state!=='running') return;
    try {
      const now=context.currentTime, amplitude=.09*volume/100;
      for (const [frequency,type,weight] of [[880,'triangle',1],[1320,'sine',.42]]) {
        const oscillator=context.createOscillator(), envelope=context.createGain();
        oscillator.type=type; oscillator.frequency.setValueAtTime(frequency,now);
        envelope.gain.setValueAtTime(.0001,now);
        envelope.gain.exponentialRampToValueAtTime(amplitude*weight,now+.003);
        envelope.gain.exponentialRampToValueAtTime(.0001,now+.14);
        oscillator.connect(envelope); envelope.connect(output);
        oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect();};
        oscillator.start(now); oscillator.stop(now+.15);
      }
    } catch { /* A failed sound must never block a judgement. */ }
  }
  return {
    getVolume:()=>volume,
    setVolume(value) {
      const numeric=Number(value); volume=Number.isFinite(numeric)?Math.max(0,Math.min(100,numeric)):30;
      try { storage?.setItem(HIT_VOLUME_KEY,String(volume)); } catch { /* Session-only preference. */ }
    },
    unlock,
    play() {
      if (volume===0) return;
      if (!context) unlock();
      if (!context || !output || context.state==='closed') return;
      if (context.state==='running') {soundPress(); return;}
      try {
        void Promise.resolve(context.resume()).then(soundPress).catch(()=>{});
      } catch { /* Audio can be interrupted or unavailable on the device. */ }
    }
  };
}

let storage;
try { storage=globalThis.localStorage; } catch {}
export const hitSound=createHitSound({storage,AudioContextClass:globalThis.AudioContext || globalThis.webkitAudioContext});
