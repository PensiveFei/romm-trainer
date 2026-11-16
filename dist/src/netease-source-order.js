import { neteaseMetingStream, neteaseSecureStream, neteaseStream } from './netease-tracks.js';

const KEY='romm-trainer-netease-source';
const MAX_AGE_MS=24*60*60*1000;
const names=new Set(['meting','site','direct']);
function browserStorage() { try { return globalThis.localStorage || null; } catch { return null; } }
function savedSource(storage,now) {
  try {
    const value=JSON.parse(storage?.getItem(KEY) || 'null');
    return names.has(value?.name) && Number.isFinite(value.time) && value.time<=now && now-value.time<MAX_AGE_MS ? value.name : null;
  } catch { return null; }
}
export function neteaseSources(id,storage=browserStorage(),now=Date.now()) {
  const sources=[
    {name:'meting',url:neteaseMetingStream(id)},
    {name:'site',url:neteaseSecureStream(id)},
    {name:'direct',url:neteaseStream(id)}
  ];
  const preferred=savedSource(storage,now);
  return preferred ? [...sources.filter(source=>source.name===preferred),...sources.filter(source=>source.name!==preferred)] : sources;
}
export function rememberNeteaseSource(name,storage=browserStorage(),now=Date.now()) {
  if (!names.has(name)) return;
  try { storage?.setItem(KEY,JSON.stringify({name,time:now})); } catch { /* A preference is optional. */ }
}
export function forgetNeteaseSource(name,storage=browserStorage(),now=Date.now()) {
  try { if (savedSource(storage,now)===name) storage?.removeItem(KEY); } catch { /* A preference is optional. */ }
}
