export const RESULTS_KEY = 'romm-trainer-results-v1';
const LIMIT = 500;
export function resultTime(ms) {
  const value=Math.max(0,Math.floor(ms));
  return String(Math.floor(value/60000)).padStart(2,'0')+':'+String(Math.floor(value/1000)%60).padStart(2,'0')+'.'+Math.floor(value%1000/100);
}
export function resultPercent(result) {
  const value=Math.max(0,Math.min(100,result.maxScore>0 ? result.score/result.maxScore*100 : 0));
  return (value>=100-1e-8 ? 100 : Math.floor((value+1e-9)*10)/10).toFixed(1);
}

// Separate chart revisions as well as difficulty settings, so incompatible
// attempts are never presented as the same personal best.
export function chartIdentity(sourceType, song, chart) {
  const data=JSON.stringify([chart.durationMs,chart.bpm,chart.tempoMap || null,chart.notes.map(n=>[n.atMs,n.lane,n.holdMs])]);
  let hash=2166136261;
  for (let i=0;i<data.length;i++) { hash^=data.charCodeAt(i); hash=Math.imul(hash,16777619); }
  const sourceId=sourceType==='song' && song?.id ? song.id : sourceType==='demo' ? 'demo' : 'local';
  return {sourceId,chartId:sourceId+':'+(hash>>>0).toString(16).padStart(8,'0')};
}

function profileKey(profile) {
  return JSON.stringify([profile.chartId,profile.startMs,profile.endMs,profile.rate,profile.hitWindowMs,profile.offsetMs]);
}
function validAttempt(item) {
  return item && typeof item.sourceId==='string' && typeof item.chartId==='string' &&
    ['startMs','endMs','rate','hitWindowMs','offsetMs','score','maxScore','hits','misses','early','late','maxCombo','total'].every(key=>Number.isFinite(item[key])) &&
    item.startMs>=0 && item.endMs>item.startMs && item.rate>0 && item.maxScore>0 && item.score>=0 && item.total>0;
}

export function createResultsStore(storage) {
  let records=[];
  function reload() {
    try {
      const data=JSON.parse(storage?.getItem(RESULTS_KEY) || '[]');
      records=Array.isArray(data) ? data.filter(row=>row && typeof row.key==='string' && validAttempt(row.best) && Number.isFinite(row.updatedAt)).slice(-LIMIT) : [];
    } catch { records=[]; }
  }
  reload();
  return {
    record(attempt) {
      if (!validAttempt(attempt)) return null;
      const key=profileKey(attempt), existing=records.find(row=>row.key===key);
      const improved=!existing || attempt.score/attempt.maxScore > existing.best.score/existing.best.maxScore;
      const best=improved ? {...attempt} : existing.best;
      records=records.filter(row=>row.key!==key);
      records.push({key,best,updatedAt:Date.now()});
      records=records.slice(-LIMIT);
      let saved=false;
      try { if (storage) { storage.setItem(RESULTS_KEY,JSON.stringify(records)); saved=true; } } catch { /* Keep this session's records. */ }
      return {best,improved,saved};
    },
    recent(sourceId) { return [...records].reverse().find(row=>row.best.sourceId===sourceId)?.best || null; },
    reload
  };
}

let storage;
try { storage=globalThis.localStorage; } catch { /* Browser can deny storage access. */ }
export const practiceResults=createResultsStore(storage);
if (typeof window!=='undefined') window.addEventListener('storage',event=>{
  if (event.key!==RESULTS_KEY) return;
  practiceResults.reload();
  window.dispatchEvent?.(new Event('romm:results-changed'));
});
