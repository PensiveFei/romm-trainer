import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { validateChart } from '../dist/src/chart.js';
import { Judge } from '../dist/src/judge.js';

const root=new URL('../dist/',import.meta.url);
const readJson=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));

test('every available catalog entry has a valid six-lane chart and matching metadata',async()=>{
  const catalog=await readJson('data/catalog.json');
  const songs=catalog.groups.flatMap(group=>group.songs);
  assert.equal(songs.length,150);
  assert.equal(new Set(songs.map(song=>song.id)).size,songs.length);
  assert.equal(songs.filter(song=>song.status==='ready').length,128);
  assert.equal(songs.filter(song=>song.status==='review').length,10);
  assert.equal(songs.filter(song=>song.status==='missing').length,12);
  await Promise.all(songs.map(async song=>{
    if (song.cover) await access(new URL(song.cover.replace(/^\.\//,''),root));
    if (song.status!=='ready') assert.equal(song.chartUrl,null);
    else {
      const chart=validateChart(await readJson(song.chartUrl.replace(/^\.\//,'')));
      assert.equal(chart.title,song.title);
      assert.equal(chart.notes.length,song.noteCount);
      assert.equal(chart.durationMs,song.durationMs);
      assert.ok(chart.beatTimesMs.length);
    }
    if (song.audio) {
      assert.match(song.audio.videoId,/^[A-Za-z0-9_-]{11}$/);
      assert.ok(song.audio.startSeconds>=0);
      assert.ok(song.audio.durationSeconds===null || song.audio.durationSeconds>=song.durationMs/1000);
    }
  }));
});

test('the restored album exposes its artwork and official sources without inventing missing charts',async()=>{
  const {groups}=await readJson('data/catalog.json');
  const songs=groups.find(group=>group.id==='Encounter2').songs;
  assert.equal(songs.filter(song=>song.cover).length,13);
  assert.equal(songs.filter(song=>song.coverKind==='soundtrack').length,2);
  assert.equal(songs.filter(song=>song.audio).length,9);
  const home=songs.find(song=>song.id==='_GMusic139');
  assert.equal(home.audio.videoId,'-ZRFTNh39EI');
  assert.equal(home.status,'missing');assert.equal(home.chartUrl,null);
  const moon=songs.find(song=>song.id==='_GMusic151');
  assert.deepEqual(moon.audio,{videoId:'b2dhv1PlyqE',startSeconds:3236,durationSeconds:185});
  assert.equal(moon.status,'ready');
});

test('the existing Surasthana chart and catalog conversion have identical timing',async()=>{
  const old=validateChart(await readJson('data/surasthana-legend.json'));
  const updated=validateChart(await readJson('data/library/_GMusic16.json'));
  const notes=chart=>chart.notes.map(({atMs,lane,holdMs})=>({atMs,lane,holdMs}));
  assert.deepEqual(notes(updated),notes(old));
});

test('hold completion follows changes in tempo without double-counting',()=>{
  const chart=validateChart({version:1,title:'tempo',durationMs:4000,bpm:120,laneCount:6,tempoMap:[{atMs:0,bpm:120},{atMs:1500,bpm:60}],notes:[{atMs:1000,lane:0,holdMs:1500}]});
  const judge=new Judge(chart,0,4000);
  assert.equal(judge.maxScore,30);
  judge.press(0,1000);judge.tick(1500);assert.equal(judge.score,25);
  judge.tick(2000);assert.equal(judge.score,27.5);
  judge.tick(2000);assert.equal(judge.score,27.5);
  judge.tick(2500);assert.equal(judge.score,30);assert.equal(judge.completion,100);
  assert.throws(()=>validateChart({...chart,tempoMap:[{atMs:100,bpm:120}]}),/变速信息/);
});
