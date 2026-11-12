// Builds the checked-in library from a locally collected snapshot of the
// public score site. No audio is downloaded or redistributed.
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { validateChart } from '../dist/src/chart.js';
import { encounterCovers, encounterAudio } from './encounter-assets.mjs';

const source = process.argv[2];
if (!source) throw new Error('Pass the directory containing romm-catalog.html, romm-chart-audit.json, romm-score-audit and romm-cover-index.');
const unpack = html => [...html.matchAll(/decodeBase64GzipUnicode\(`([^`]+)`\)/g)].map(match => JSON.parse(gunzipSync(Buffer.from(match[1], 'base64')).toString()));
const [albums, music, scoreAvailability] = unpack(fs.readFileSync(path.join(source, 'romm-catalog.html'), 'utf8'));
const audited = new Map(JSON.parse(fs.readFileSync(path.join(source, 'romm-chart-audit.json'), 'utf8')).map(x => [x.id, x]));
const chaptersFile = path.join(source, 'romm-chapters.json');
const chapters = fs.existsSync(chaptersFile) ? JSON.parse(fs.readFileSync(chaptersFile, 'utf8')) : [];
const normalize = value => value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');
const order = ['Encounter2','NodKrai3','Magic','NodKrai2','NodKrai1','Natlan2','Natlan','Mondstadt','Liyue','Inazuma','Sumeru','Fontaine'];
const covers = {
  Mondstadt:[1,1,1,3,4,5,6,7,8,9,10,2],
  Liyue:[13,14,15,16,17,18,19,20,21,22,23,24],
  Inazuma:[25,25,27,28,29,30,31,32,33,34,35,36],
  Sumeru:[37,37,37,40,41,42,43,44,45,46,47,48],
  Fontaine:[49,49,49,52,53,54,55,56,57,58,59,60],
  Natlan:[61,61,61,62,63,66,67,68,69,70,71,72],
  Natlan2:[77,73,75,76,77,78,79,80,81,82,83,84],
  NodKrai2:[97,98,99,100,101,102,103,104,105,106,107,108],
  Magic:[111,114,115,118,116,117,109,110,112,113,119,120],
  NodKrai3:[121,122,123,124,125,126,127,127,128,121,129,130]
};
const specialCovers = {85:85,86:86,97:86,98:86,88:87,89:88,90:89,91:90,93:91,92:92,99:92,100:92,101:92,94:93,95:94,87:95,96:96};
const dest = path.resolve('dist/data/library');
const coverDir = path.resolve('dist/assets/covers');
fs.mkdirSync(dest, {recursive:true}); fs.mkdirSync(coverDir, {recursive:true});
const groups = [];
let ready = 0, pending = 0, missing = 0, online = 0;
for (const groupId of order) {
  const list = Object.entries(music).filter(([, m]) => !m.inv && m.album === groupId).sort((a,b) => a[1].sortkey - b[1].sortkey);
  const songs = [];
  for (const [index,[id,m]] of list.entries()) {
    const result = audited.get(id);
    const status = !scoreAvailability[id]?.[3] ? 'missing' : result && !result.issues.length ? 'ready' : 'review';
    const number = Number(id.replace('_GMusic',''));
    const coverNumber = groupId === 'NodKrai1' ? specialCovers[number] : covers[groupId]?.[index];
    let cover = null;
    if (coverNumber) {
      const filename = String(coverNumber).padStart(2,'0') + '.webp';
      const sourceFile = path.join(source, 'romm-cover-index', filename);
      if (fs.existsSync(sourceFile)) { fs.copyFileSync(sourceFile, path.join(coverDir, filename)); cover = './assets/covers/' + filename; }
    }
    const encounterCover=encounterCovers[id];
    if (encounterCover && fs.existsSync(path.resolve('dist/assets/encounter-covers',encounterCover))) cover='./assets/encounter-covers/'+encounterCover;
    let chartUrl = null, audio = encounterAudio[id] || null;
    if (status === 'ready') {
      const [score, measure, changes] = unpack(fs.readFileSync(path.join(source, 'romm-score-audit', id + '.html'), 'utf8'));
      let ms=0, bpm=m.bpm; const notes=[], held=Array(6).fill(null), tempoMap=[{atMs:0,bpm}], beatTimesMs=[];
      for (let i=0; i<score.length; i++) {
        if (changes?.[i] && changes[i] !== bpm) {
          bpm=changes[i]; const atMs=Math.round(ms);
          if (atMs === 0) tempoMap[0].bpm=bpm;
          else if (atMs < m.duration * 1000) tempoMap.push({atMs,bpm});
        }
        const len=measure?.[i] ? measure[i][0]/measure[i][1] : 1;
        if ((i > 0 || len === 1) && ms < m.duration*1000) beatTimesMs.push(Math.round(ms));
        const lines=score[i].split(',');
        for (let j=0; j<lines.length; j++) {
          const at=ms+j/lines.length*60000/bpm;
          for (const c of lines[j]) {
            let lane='123456'.indexOf(c);
            if (lane >= 0) { notes.push({atMs:Math.round(at),lane,holdMs:0}); continue; }
            lane='qwerty'.indexOf(c);
            if (lane >= 0) { if (held[lane] !== null) throw Error(id + ' duplicate hold'); held[lane]=at; continue; }
            lane='asdfgh'.indexOf(c);
            if (lane >= 0) { if (held[lane] === null) throw Error(id + ' missing hold'); notes.push({atMs:Math.round(held[lane]),lane,holdMs:Math.round(at)-Math.round(held[lane])}); held[lane]=null; }
          }
        }
        ms += len*60000/bpm;
      }
      if (held.some(x=>x!==null) || notes.length !== m.score.l_notes) throw Error(id + ' failed audit');
      const chart={version:1,title:m.title.zh_cn,artist:'HOYO-MiX · 传说难度',durationMs:m.duration*1000,bpm:m.bpm,laneCount:6,notes,tempoMap,beatTimesMs};
      validateChart(chart);
      const filename=id+'.json'; fs.writeFileSync(path.join(dest,filename),JSON.stringify(chart)); chartUrl='./data/library/'+filename; ready++;
      const matches=chapters.filter(c => normalize(c.title) === normalize(m.title.en_us) && (c.duration === null || c.duration >= m.duration));
      if (!audio && matches.length === 1) { const c=matches[0]; audio={videoId:c.videoId,startSeconds:c.start,durationSeconds:c.duration}; }
    } else if (status === 'review') pending++; else missing++;
    if (audio) online++;
    const coverKind=encounterCover==='shimmering-voyage-6.jpg'?'soundtrack':null;
    songs.push({id,title:m.title.zh_cn,titleEn:m.title.en_us,titleJa:m.title.ja_jp,titleKana:m.ja_kana,bpm:m.bpm,bpmMin:m.bpm_min,bpmMax:m.bpm_max,durationMs:m.duration*1000,levels:[m.score.n_level,m.score.h_level,m.score.p_level,m.score.l_level],noteCount:m.score.l_notes,status,chartUrl,cover,audio,...(coverKind && {coverKind})});
  }
  groups.push({id:groupId,title:albums[groupId].zh_cn,titleJa:albums[groupId].ja_jp,songs});
}
fs.writeFileSync(path.resolve('dist/data/catalog.json'),JSON.stringify({version:1,groups}));
console.log(JSON.stringify({ready,pending,missing,online,groups:groups.length}));
