import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { NetEaseAudio } from '../dist/src/netease-audio.js';
import { neteaseMetingStream, neteasePage, neteaseSecureStream, neteaseStream, neteaseTrack } from '../dist/src/netease-tracks.js';
import { resolveTrack } from '../functions/api/netease/[id].js';

class FakeMedia {
  constructor() { this.listeners = {}; this.currentTime = 0; this.duration = 141.051; this.paused = true; this.muted = false; this.playbackRate = 1; this.volume = 1; }
  addEventListener(name, listener) { (this.listeners[name] ||= new Set()).add(listener); }
  removeEventListener(name, listener) { this.listeners[name]?.delete(listener); }
  emit(name) { for (const listener of this.listeners[name] || []) listener(); }
  load() {}
  async play() { this.paused = false; this.emit('playing'); }
  pause() { this.paused = true; this.emit('pause'); }
  removeAttribute(name) { if (name === 'src') this.src = ''; }
}

test('NetEase playback follows the media clock and can unlock without shifting the start', async () => {
  const media = new FakeMedia(), events = [];
  const audio = new NetEaseAudio({id:2014247586,durationSeconds:141.051}, (...event) => events.push(event), () => media);
  assert.equal(media.src, neteaseMetingStream(2014247586));
  media.emit('loadedmetadata');
  await audio.ready;
  audio.currentTime = 12.5;
  audio.playbackRate = .75;
  audio.volume = .4;
  await audio.unlock();
  assert.equal(audio.currentTime, 12.5);
  assert.equal(audio.paused, true);
  assert.equal(media.muted, false);
  assert.equal(audio.actualPlaybackRate, .75);
  assert.equal(media.volume, .4);
  await audio.play();
  media.currentTime = 13.25;
  assert.equal(audio.currentTime, 13.25);
  media.emit('ended');
  assert.deepEqual(events.at(-1), [0]);
  audio.destroy();
  media.emit('playing');
  assert.deepEqual(events.at(-1), [0]);
});

test('a short preview or an unreadable stream does not become a practice source', async () => {
  const media = new FakeMedia();
  media.duration = 30;
  const audio = new NetEaseAudio({id:1,durationSeconds:141}, () => {}, () => media);
  media.emit('loadedmetadata');
  assert.equal(media.src, neteaseSecureStream(1), 'an incomplete source retries the site resolver');
  media.emit('loadedmetadata');
  assert.equal(media.src, neteaseStream(1), 'an incomplete source retries the direct provider');
  media.emit('loadedmetadata');
  await assert.rejects(audio.ready, /不完整/);
  assert.equal(audio.failed, true);
  audio.destroy();
});

test('a failed HTTPS connection retries the provider before reporting failure', async () => {
  const media = new FakeMedia();
  const audio = new NetEaseAudio({id:2014247586,durationSeconds:141.051}, () => {}, () => media);
  media.emit('error');
  assert.equal(media.src, neteaseSecureStream(2014247586));
  media.emit('loadedmetadata');
  await audio.ready;
  assert.equal(audio.failed, false);
  audio.destroy();
});

test('a source change while unlocking retries playback after metadata loads', async () => {
  const media = new FakeMedia();
  let rejectFirst, attempts=0;
  media.play = () => {
    if (++attempts === 1) return new Promise((_,reject)=>{rejectFirst=reject;});
    media.paused=false;
    return Promise.resolve();
  };
  const audio = new NetEaseAudio({id:2014247586,durationSeconds:141.051}, () => {}, () => media);
  const unlocking=audio.unlock();
  media.emit('error');
  rejectFirst(Object.assign(new Error('source changed'),{name:'AbortError'}));
  media.emit('loadedmetadata');
  await unlocking;
  assert.equal(attempts,2);
  assert.equal(media.muted,false);
  assert.equal(media.paused,true);
  audio.destroy();
});

test('the secure resolver permits only catalog songs and HTTPS provider redirects', async () => {
  const validSong = {id:2014247586,code:200,fee:0,freeTrialInfo:null,url:'http://m801.music.126.net/example.mp3?token=1'};
  const response = song => async () => ({ok:true,json:async()=>({code:200,data:[song]})});
  const ok = await resolveTrack('2014247586',response(validSong));
  assert.equal(ok.status,302);
  assert.equal(ok.headers.get('location'),'https://m801.music.126.net/example.mp3?token=1');
  assert.equal(ok.headers.get('cache-control'),'no-store');
  assert.equal((await resolveTrack('123',response(validSong))).status,404);
  assert.equal((await resolveTrack('2014247586',response({...validSong,url:'http://music.126.net.example.com/file'}))).status,502);
  assert.equal((await resolveTrack('2014247586',response({...validSong,freeTrialInfo:{start:0,end:30}}))).status,502);
  assert.equal((await resolveTrack('2014247586',response({...validSong,fee:1}))).status,502);
});

test('the secure resolver can use another provider endpoint and reports failures without exposing URLs', async () => {
  const validSong = {id:2014247586,code:200,fee:0,freeTrialInfo:null,url:'http://m801.music.126.net/example.mp3?token=1'};
  const alternate = await resolveTrack('2014247586', async url => {
    if (new URL(url).hostname !== 'interface.music.163.com') throw new TypeError('network failure');
    return {ok:true,json:async()=>({code:200,data:[validSong]})};
  });
  assert.equal(alternate.status,302);
  assert.match(alternate.headers.get('location'),/^https:/);
  const failed = await resolveTrack('2014247586', async () => ({ok:false,status:403}));
  assert.equal(failed.status,502);
  assert.equal(failed.headers.get('x-romm-resolver'),'main-http-403,interface-http-403,interface3-http-403,meting-http-403');
});

test('the site resolver accepts only NetEase CDN redirects from its alternate endpoint', async () => {
  const fetcher = location => async url => new URL(url).hostname === 'met.liiiu.cn'
    ? {status:302,headers:new Headers({Location:location})}
    : {ok:true,json:async()=>({code:200,data:[{id:2014247586,code:404}]})};
  const response=await resolveTrack('2014247586',fetcher('http://m701.music.126.net/file.mp3'));
  assert.equal(response.status,302);
  assert.equal(response.headers.get('location'),'https://m701.music.126.net/file.mp3');
  assert.equal((await resolveTrack('2014247586',fetcher('https://music.126.net.example.com/file'))).status,502);
});

test('closing a still-loading source cancels its readiness and ignores late events', async () => {
  const media = new FakeMedia(), events = [];
  const audio = new NetEaseAudio({id:1,durationSeconds:141}, (...event) => events.push(event), () => media);
  const ready = assert.rejects(audio.ready, /关闭/);
  audio.destroy();
  media.emit('loadedmetadata');
  media.emit('error');
  await ready;
  assert.deepEqual(events, []);
});

test('every YouTube catalog source has a matched domestic source with enough recording duration', async () => {
  const catalog = JSON.parse(await readFile(new URL('../dist/data/catalog.json', import.meta.url), 'utf8'));
  const songs = catalog.groups.flatMap(group => group.songs).filter(song => song.audio);
  assert.equal(songs.length, 53);
  for (const song of songs) {
    const source = neteaseTrack(song);
    assert.ok(source, song.title);
    assert.ok(source.durationSeconds + 1.5 >= song.durationMs / 1000, song.title);
    assert.match(neteasePage(source.id), /^https:\/\/music\.163\.com\/#\/song\?id=\d+$/);
  }
  assert.equal(neteaseTrack({id:'_GMusic16'}).id, 2014247586);
  assert.equal(neteaseTrack({id:'not-a-song'}), null);
});

test('mapped playable recordings extend beyond the end of their last note', async () => {
  const catalog = JSON.parse(await readFile(new URL('../dist/data/catalog.json', import.meta.url), 'utf8'));
  const songs = catalog.groups.flatMap(group => group.songs).filter(song => song.status === 'ready' && neteaseTrack(song));
  assert.equal(songs.length, 85);
  for (const song of songs) {
    const chart = JSON.parse(await readFile(new URL('../dist/' + song.chartUrl.replace(/^\.\//,''), import.meta.url), 'utf8'));
    const lastNoteMs = Math.max(...chart.notes.map(note => note.atMs + (note.holdMs || 0)));
    assert.ok(neteaseTrack(song).durationSeconds * 1000 >= lastNoteMs + 250, song.title);
  }
});
