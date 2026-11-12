import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('pausing a held note keeps it valid while the key remains down', async (t) => {
  t.mock.timers.enable({apis:['setTimeout']});
  class FakeElement {
    constructor(id='') {
      this.id=id; this.tagName='DIV'; this.textContent=''; this.children=[]; this.listeners={};
      this.value=''; this.checked=false; this.style={}; this.dataset={}; this.replacements=0;
      this.classList={ add(){}, remove(){}, toggle(){} };
    }
    addEventListener(name,fn) { (this.listeners[name] ||= []).push(fn); }
    dispatch(name,event={}) { for (const fn of this.listeners[name] || []) fn(event); }
    replaceChildren(...children) { this.children=children; this.replacements++; }
    appendChild(child) { this.children.push(child); }
    setAttribute() {}
    focus() {}
    blur() {}
    querySelectorAll() { return []; }
    getContext() { return {}; }
    getBoundingClientRect() { return {width:0,height:0}; }
    showModal() { this.open=true; }
    close() { this.open=false; }
  }
  const ids=['stage','stageWrap','stageHint','practiceCountdown','feedback','message','playButton','playText','playIcon','restartButton',
    'startRange','endRange','startOutput','endOutput','loopToggle','scrollSpeed','scrollLabel','offset','speedLabel',
    'rateButtons','keyBindings','keyHelp','elapsed','duration','stageTime','progressFill','statHits','statCombo',
    'statTiming','statMiss','trackTitle','trackArtist','trackInfo','sideTitle','sideArtist','sideBpm','sourceTag',
    'chartFile','audioFile','chartButton','audioButton','demoButton','themeSelect',
    'performanceScore','completionValue','completionFill','completionTrack','toolsDrawer','toolsToggle','toolsClose',
    'hitWindow','hitWindowLabel','songButton','songOptions','onlinePanel','songAudioStatus','musicStart',
    'onlineButton','metronomeButton','youtubePlayer','youtubeMount','timelineSeek',
    'touchLane0','touchLane1','touchLane2','touchLane3','touchLane4','touchLane5','homeView','libraryView',
    'seekBack10','seekForward10','quickRangeToggle','quickRangeMenu','markRangeA','markRangeB','clearRange',
    'audioModeBadge','hitVolume','hitVolumeLabel','resultOpen','practiceResult','resultClose','resultDone','resultSong',
    'resultProfile','resultCompletion','resultHits','resultMisses','resultTiming','resultCombo','resultBest','resultStorage'];
  const el=Object.fromEntries(ids.map(id=>[id,new FakeElement(id)]));
  el.startRange.value='0'; el.endRange.value='32'; el.loopToggle.checked=true; el.toolsDrawer.hidden=true;
  el.homeView.hidden=false; el.libraryView.hidden=true; el.quickRangeMenu.hidden=true; el.resultOpen.hidden=true;
  const listeners={};
  const documentListeners={};
  globalThis.HTMLElement=FakeElement;
  globalThis.window={ devicePixelRatio:1, addEventListener(name,fn){ (listeners[name] ||= []).push(fn); } };
  globalThis.document={
    hidden:false, body:new FakeElement('body'), getElementById(id){ return el[id]; },
    createElement(){ return new FakeElement(); }, createTextNode(text){ return {textContent:text}; },
    addEventListener(name,fn){ (documentListeners[name] ||= []).push(fn); }
  };
  const settings=new Map([['romm-trainer-scroll','0.3']]);
  globalThis.localStorage={ getItem(key){return settings.get(key) ?? null;}, setItem(key,value){settings.set(key,value);} };
  let nextFrame, frameRequests=0;
  globalThis.requestAnimationFrame=(fn)=>{ frameRequests++; nextFrame=fn; return 0; };
  class FakeAudio {
    constructor(){ this.listeners={}; this.currentTime=0; this.duration=32; this.paused=true; globalThis.testAudio=this; }
    addEventListener(name,fn){ this.listeners[name]=fn; }
    load(){ this.listeners.loadedmetadata?.(); }
    async play(){ if (this.failNextPlay) { this.failNextPlay=false; throw new Error('playback blocked'); } this.paused=false; }
    pause(){ this.paused=true; }
  }
  globalThis.Audio=FakeAudio;
  let soundOscillators=0;
  globalThis.AudioContext=class {
    constructor(){this.state='running';this.currentTime=0;this.sampleRate=48000;this.destination={};}
    createGain(){return {gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
    createBuffer(){return {};}
    createBufferSource(){return {connect(){},disconnect(){},start(){}};}
    createOscillator(){return {frequency:{setValueAtTime(){}},connect(){},disconnect(){},start(){soundOscillators++;},stop(){}};}
  };
  await import('../dist/src/app.js');
  assert.equal(frameRequests,0, 'the hidden practice stage does not keep rendering behind the home page');
  el.homeView.hidden=true;
  listeners['romm:practice-visible'].forEach(fn=>fn());
  assert.equal(frameRequests,1, 'entering practice restarts rendering');
  el.libraryView.hidden=false; nextFrame();
  assert.equal(frameRequests,1, 'opening the library stops the practice render loop');
  el.libraryView.hidden=true; listeners['romm:practice-visible'].forEach(fn=>fn());
  assert.equal(frameRequests,2);
  document.hidden=true; nextFrame();
  assert.equal(frameRequests,2, 'backgrounding stops the practice render loop');
  document.hidden=false; documentListeners.visibilitychange.forEach(fn=>fn());
  assert.equal(frameRequests,3, 'returning to the page resumes rendering');
  nextFrame();
  assert.equal(frameRequests,3, 'a paused stage does not continuously repaint');
  el.themeSelect.value='wind';el.themeSelect.dispatch('change');
  assert.equal(frameRequests,4, 'changing the theme schedules a fresh paused frame');
  nextFrame();
  assert.equal(frameRequests,4, 'the new paused frame does not start an animation loop');
  assert.equal(el.scrollSpeed.value, 0.3);
  assert.equal(el.scrollLabel.textContent, '0.3×');
  el.scrollSpeed.value='0.4'; el.scrollSpeed.dispatch('input');
  assert.equal(el.scrollLabel.textContent, '0.4×');
  assert.equal(settings.get('romm-trainer-scroll'), '0.4');
  const press=(name,code)=>listeners[name].forEach(fn=>fn({code,repeat:false,target:document.body,preventDefault(){}}));
  const flush=()=>new Promise(resolve=>setImmediate(resolve));
  const begin=async()=>{ el.playButton.dispatch('click'); await flush(); t.mock.timers.tick(1000); t.mock.timers.tick(1000); t.mock.timers.tick(1000); await flush(); };

  assert.equal(el.audioModeBadge.textContent,'示范节拍');
  el.seekForward10.dispatch('click');assert.equal(testAudio.currentTime,10);
  el.quickRangeToggle.dispatch('click');assert.equal(el.quickRangeMenu.hidden,false);
  el.markRangeA.dispatch('click');assert.equal(el.startRange.value,'10');assert.equal(testAudio.currentTime,8);
  el.seekForward10.dispatch('click');el.markRangeB.dispatch('click');assert.equal(el.endRange.value,'18');
  el.clearRange.dispatch('click');assert.equal(el.startRange.value,'0');assert.equal(el.endRange.value,'32');
  el.markRangeB.dispatch('click');assert.equal(el.endRange.value,'32','invalid markers leave the range unchanged');

  el.toolsToggle.dispatch('click');
  assert.equal(el.toolsDrawer.hidden,false);
  press('keydown','Escape');
  assert.equal(el.toolsDrawer.hidden,true);
  el.toolsToggle.dispatch('click'); el.toolsClose.dispatch('click');
  assert.equal(el.toolsDrawer.hidden,true);
  el.playButton.dispatch('click'); await flush();
  t.mock.timers.tick(1000);
  el.playButton.dispatch('click'); await flush();
  t.mock.timers.tick(10000); await flush();
  assert.equal(testAudio.paused,true);
  assert.equal(el.practiceCountdown.hidden,true);
  assert.equal(el.playText.textContent,'开始练习');
  el.playButton.dispatch('click'); await flush();
  assert.equal(el.practiceCountdown.textContent,'3');
  assert.equal(testAudio.paused,true);
  t.mock.timers.tick(1000); assert.equal(el.practiceCountdown.textContent,'2');
  t.mock.timers.tick(1000); assert.equal(el.practiceCountdown.textContent,'1');
  t.mock.timers.tick(1000); await flush();
  assert.equal(el.practiceCountdown.hidden,true);
  assert.equal(el.playText.textContent,'暂停');
  assert.equal(el.hitWindowLabel.textContent,'±180 ms');
  testAudio.currentTime=1.7; press('keydown','KeyA'); press('keyup','KeyA');
  assert.equal(el.feedback.textContent,'未命中 · 过早 300 ms');
  assert.equal(el.performanceScore.textContent,'0');
  testAudio.currentTime=2; press('keydown','KeyA'); press('keyup','KeyA');
  assert.equal(el.statHits.children[0].textContent.trim(),'1');
  assert.equal(el.performanceScore.textContent,'20');
  assert.notEqual(el.completionValue.textContent,'(0.0%)');
  const hitDisplayUpdates=el.statHits.replacements;
  nextFrame(); nextFrame();
  assert.equal(el.statHits.replacements,hitDisplayUpdates, 'unchanged hit statistics are not rebuilt every frame');
  el.playButton.dispatch('click');
  el.playButton.dispatch('click'); await flush();
  t.mock.timers.tick(1000);
  el.playButton.dispatch('click'); await flush();
  assert.equal(el.playText.textContent,'继续练习');
  assert.equal(el.performanceScore.textContent,'20');
  await begin();
  const completionBeforeTheme=el.completionValue.textContent;
  el.themeSelect.value='electro'; el.themeSelect.dispatch('change');
  assert.equal(el.stageWrap.dataset.theme,'electro');
  assert.equal(settings.get('romm-trainer-theme'),'electro');
  assert.equal(el.playText.textContent,'暂停');
  assert.equal(testAudio.currentTime,2);
  assert.equal(el.completionValue.textContent,completionBeforeTheme);
  assert.equal(el.statHits.children[0].textContent.trim(),'1');
  testAudio.currentTime=10; press('keydown','KeyA');
  el.themeSelect.value='dream'; el.themeSelect.dispatch('change');
  assert.equal(el.stageWrap.dataset.theme,'dream');
  assert.equal(testAudio.currentTime,10);
  const missesBefore=Number(el.statMiss.textContent);
  const scoreAtHoldStart=Number(el.performanceScore.textContent);
  testAudio.currentTime=10.5;
  el.toolsToggle.dispatch('click');
  assert.equal(el.toolsDrawer.hidden,false);
  assert.ok(Number(el.performanceScore.textContent)>scoreAtHoldStart);
  assert.equal(el.playText.textContent,'继续练习');
  const missesAtPause=Number(el.statMiss.textContent);
  assert.ok(missesAtPause>=missesBefore);
  await begin();
  assert.equal(el.toolsDrawer.hidden,true);
  testAudio.currentTime=11; press('keyup','KeyA');
  assert.equal(Number(el.statMiss.textContent),missesAtPause);
  assert.equal(el.statHits.children[0].textContent.trim(),'2');

  el.endRange.value='12'; el.endRange.dispatch('input');
  assert.equal(el.completionValue.textContent,'(0.0%)');
  await begin();
  testAudio.currentTime=2; press('keydown','KeyA'); press('keyup','KeyA');
  assert.notEqual(el.completionValue.textContent,'(0.0%)');
  testAudio.currentTime=12; nextFrame();
  assert.equal(el.completionValue.textContent,'(0.0%)');
  assert.match(el.message.textContent,/上一轮：完成度 [\d.]+%/);
  assert.equal(el.playText.textContent,'暂停');
  assert.equal(el.resultOpen.hidden,false);
  assert.notEqual(el.practiceResult.open,true,'looping must not interrupt the next round');
  assert.match(el.resultProfile.textContent,/00:00.0 – 00:12.0/);

  el.toolsToggle.dispatch('click');
  el.hitWindow.value='220'; el.hitWindow.dispatch('input');
  assert.equal(el.hitWindowLabel.textContent,'±220 ms');
  el.hitWindow.dispatch('change');
  assert.equal(settings.get('romm-trainer-hit-window'),'220');
  await begin();
  testAudio.currentTime=1.8; press('keydown','KeyA'); press('keyup','KeyA');
  assert.equal(el.performanceScore.textContent,'10');
  assert.equal(el.statHits.children[0].textContent.trim(),'1');

  testAudio.currentTime=10;
  el.timelineSeek.value='4000';el.timelineSeek.dispatch('input');el.timelineSeek.dispatch('change');
  assert.equal(testAudio.currentTime,4);
  assert.equal(el.playText.textContent,'暂停');
  assert.equal(el.performanceScore.textContent,'0');
  press('keydown','KeyK');press('keyup','KeyK');
  assert.equal(el.statHits.children[0].textContent.trim(),'1');
  el.playButton.dispatch('click');
  el.timelineSeek.value='8000';el.timelineSeek.dispatch('input');el.timelineSeek.dispatch('change');
  await begin();
  assert.equal(testAudio.currentTime,8);
  press('keydown','ArrowLeft');
  assert.equal(testAudio.currentTime,0);

  // Two independent fingers can hit a chord and sustain a hold until release.
  const touch=(lane,name,pointerId)=>el['touchLane'+lane].dispatch(name,{pointerId,pointerType:'touch',button:0,preventDefault(){}});
  testAudio.currentTime=7;
  const soundsBeforeChord=soundOscillators;
  touch(0,'pointerdown',11); touch(5,'pointerdown',12);
  assert.equal(soundOscillators-soundsBeforeChord,4,'both fingers receive their own manual sound');
  assert.equal(el.statHits.children[0].textContent.trim(),'2');
  touch(0,'pointerup',11); touch(5,'pointerup',12);
  testAudio.currentTime=10;
  touch(0,'pointerdown',13); touch(5,'pointerdown',14); touch(5,'pointerup',14);
  testAudio.currentTime=11; touch(0,'pointerup',13);
  assert.equal(el.statHits.children[0].textContent.trim(),'4');
  el.timelineSeek.value='0'; el.timelineSeek.dispatch('input'); el.timelineSeek.dispatch('change');
  testAudio.currentTime=10;
  touch(0,'pointerdown',21); touch(0,'pointerdown',22); touch(0,'pointercancel',21);
  testAudio.currentTime=11; touch(0,'pointerup',22);
  assert.equal(el.statHits.children[0].textContent.trim(),'1', 'one cancelled finger must not release another finger holding the same lane');

  const song = JSON.parse(await readFile(new URL('../dist/data/surasthana-legend.json', import.meta.url), 'utf8'));
  globalThis.fetch = async () => ({ok:true, async json(){return song;}});
  globalThis.location = {origin:'http://localhost'};
  let youtube;
  window.YT={Player:class {
    constructor(_element,options){
      this.options=options; this.time=2582; youtube=this;
      queueMicrotask(()=>options.events.onReady());
    }
    setPlaybackRate(value){this.rate=value;}
    getCurrentTime(){return this.time;}
    seekTo(value){this.time=value;}
    playVideo(){this.options.events.onStateChange({data:1});}
    pauseVideo(){this.options.events.onStateChange({data:2});}
  }};
  el.songButton.dispatch('click'); await flush(); await flush();
  assert.equal(el.trackTitle.textContent,'净善的遐歌');
  assert.equal(el.statHits.children[0].textContent.trim(),'0');
  assert.equal(el.statHits.children[1].textContent,'/ 231');
  assert.equal(el.onlinePanel.hidden,false);
  assert.match(el.songAudioStatus.textContent,/同步待校准/);
  youtube.getPlaybackRate=()=>1;
  el.rateButtons.dispatch('click',{target:{closest:()=>({dataset:{rate:'0.5'}})}});
  await begin();
  assert.equal(el.playText.textContent,'开始练习','unsupported online rates reset instead of judging at the wrong speed');
  assert.equal(el.speedLabel.textContent,'1.00×');
  assert.match(el.message.textContent,/实际速度为 1\.00×/);
  youtube.getPlaybackRate=()=>youtube.rate;
  youtube.rate=.75; youtube.options.events.onPlaybackRateChange({data:.75});
  assert.equal(el.speedLabel.textContent,'0.75×');
  youtube.rate=1; youtube.options.events.onPlaybackRateChange({data:1});
  assert.equal(el.speedLabel.textContent,'1.00×');
  el.endRange.value='6'; el.endRange.dispatch('input');
  el.musicStart.value='5.25'; el.musicStart.dispatch('change');
  assert.equal(youtube.time,2582+5.25);
  await begin();
  assert.equal(el.playText.textContent,'暂停');
  nextFrame();
  youtube.time=2582+5.25+4.405; press('keydown','KeyD');
  youtube.time=2582+5.25+4.94; press('keyup','KeyD');
  assert.equal(el.statHits.children[0].textContent.trim(),'1');
  youtube.time=2582+5.25+6.1; nextFrame();
  assert.equal(youtube.time,2582+5.25);
  assert.match(el.message.textContent,/上一轮：完成度/);
  el.timelineSeek.value='5000';el.timelineSeek.dispatch('input');el.timelineSeek.dispatch('change');
  assert.equal(youtube.time,2582+5.25+5);
  assert.equal(el.statHits.children[0].textContent.trim(),'0');
  el.toolsToggle.dispatch('click');
  assert.equal(el.playText.textContent,'继续练习');
  const previousPlayer=youtube;
  youtube.options.events.onError({data:2});
  assert.match(el.message.textContent,/在线音源不可用/);
  el.onlineButton.dispatch('click'); await flush(); await flush();
  assert.notEqual(youtube,previousPlayer);
  assert.match(el.message.textContent,/谱面已就绪/);
  testAudio.duration=95;
  el.metronomeButton.dispatch('click');
  assert.equal(el.onlinePanel.hidden,true);
  assert.match(el.songAudioStatus.textContent,/节拍伴奏/);
  assert.equal(el.audioModeBadge.textContent,'节拍伴奏 · 无原曲');
  await begin();
  assert.equal(el.playText.textContent,'暂停');
  assert.equal(testAudio.paused,false);
  el.loopToggle.checked=false;el.loopToggle.dispatch('change');
  await begin();testAudio.currentTime=6;nextFrame();
  assert.equal(el.practiceResult.open,true,'a non-looping completed practice shows its result');
  assert.match(el.resultProfile.textContent,/00:00.0 – 00:06.0/);
  assert.match(el.resultStorage.textContent,/当前浏览器/);
  el.resultDone.dispatch('click');assert.equal(el.practiceResult.open,false);
  el.timelineSeek.value='6000';el.timelineSeek.dispatch('change');
  await begin();nextFrame();
  assert.notEqual(el.practiceResult.open,true,'seeking to the end must not reopen an old result');

  // A slow chart read must not replace the later selection or its status message.
  let resolveImport;
  el.chartFile.files=[{size:64,text:()=>new Promise(resolve=>{resolveImport=resolve;})}];
  el.chartFile.dispatch('change');
  el.demoButton.dispatch('click');
  resolveImport(JSON.stringify(song)); await flush(); await flush();
  assert.equal(el.trackTitle.textContent,'节拍练习 · 六键');
  assert.match(el.message.textContent,/已恢复原创示范谱/);

  // Likewise, manually picking audio while a song fetch is pending takes priority.
  let resolveSong;
  globalThis.fetch=()=>new Promise(resolve=>{resolveSong=resolve;});
  el.songButton.dispatch('click');
  el.audioFile.files=[new Blob(['audio'],{type:'audio/wav'})];
  el.audioFile.dispatch('change');
  const chosenAudio=testAudio.src;
  resolveSong({ok:true,json:async()=>song}); await flush(); await flush();
  assert.equal(el.trackTitle.textContent,'节拍练习 · 六键');
  assert.equal(testAudio.src,chosenAudio);

  // Losing focus after pausing cannot leave a physically released key held forever.
  el.demoButton.dispatch('click');
  await begin(); testAudio.currentTime=10; press('keydown','KeyA');
  el.playButton.dispatch('click');
  const missesBeforeBlur=Number(el.statMiss.textContent);
  listeners.blur.forEach(fn=>fn());
  assert.equal(Number(el.statMiss.textContent),missesBeforeBlur+1);
  press('keyup','KeyA');
  assert.equal(Number(el.statMiss.textContent),missesBeforeBlur+1);

  // If an ended audio element cannot restart a loop, the transport remains usable.
  el.demoButton.dispatch('click');
  el.loopToggle.checked=true;el.loopToggle.dispatch('change');
  await begin();testAudio.currentTime=32;testAudio.paused=true;testAudio.failNextPlay=true;
  testAudio.listeners.ended(); await flush();
  assert.equal(el.playText.textContent,'继续练习');
  assert.equal(el.playIcon.textContent,'▶');
  assert.match(el.message.textContent,/请点击继续练习/);
});
