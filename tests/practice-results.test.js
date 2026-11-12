import test from 'node:test';
import assert from 'node:assert/strict';
import { chartIdentity, createResultsStore, resultPercent, RESULTS_KEY } from '../dist/src/practice-results.js';

const chart={durationMs:10000,bpm:120,notes:[{atMs:1000,lane:0,holdMs:0},{atMs:2500,lane:1,holdMs:500}]};
const identity=chartIdentity('song',{id:'_GMusic16'},chart);
const attempt=(extra={})=>({...identity,startMs:0,endMs:10000,rate:1,hitWindowMs:180,offsetMs:0,
  score:20,maxScore:40,hits:1,misses:1,early:0,late:0,maxCombo:1,total:2,...extra});

test('personal bests only compare attempts with the same chart, range and settings',()=>{
  const values=new Map(),storage={getItem:key=>values.get(key) ?? null,setItem:(key,value)=>values.set(key,value)};
  const store=createResultsStore(storage);
  assert.equal(store.record(attempt()).improved,true);
  const worse=store.record(attempt({score:10}));
  assert.equal(worse.improved,false);assert.equal(worse.best.score,20);
  assert.equal(store.record(attempt({score:30})).improved,true);
  for(const change of [{rate:.75},{hitWindowMs:220},{startMs:1000},{endMs:9000},{offsetMs:10},{chartId:identity.chartId+'x'}]) {
    assert.equal(store.record(attempt({...change,score:5})).improved,true);
  }
  assert.equal(JSON.parse(values.get(RESULTS_KEY)).length,7);
  const reloaded=createResultsStore(storage);
  assert.equal(reloaded.record(attempt({score:25})).best.score,30);
  assert.equal(resultPercent(reloaded.recent('_GMusic16')),'75.0');
  assert.equal(store.record(attempt({total:0})),null);
  assert.notEqual(chartIdentity('song',{id:'_GMusic16'},{...chart,notes:[...chart.notes,{atMs:4000,lane:3,holdMs:0}]}).chartId,identity.chartId);
});

test('results fall back to this session when storage is corrupt or unavailable',()=>{
  const broken={getItem:()=>'{bad json',setItem(){throw Error('blocked');}};
  const store=createResultsStore(broken);
  const saved=store.record(attempt());
  assert.equal(saved.saved,false);
  assert.equal(store.record(attempt({score:10})).best.score,20);
  assert.equal(store.recent('_GMusic16').score,20);
});
