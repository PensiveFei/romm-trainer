import { favorites } from './favorites.js';

const $ = id => document.getElementById(id);
const view=$('libraryView'), groupsEl=$('libraryGroups'), detail=$('libraryDetail'), search=$('librarySearch');
const count=$('libraryCount'), start=$('libraryStart'), close=$('libraryClose');
const favoriteButton=$('libraryFavorite'), heading=$('libraryHeading');
const gameFrame=document.querySelector('.game-frame');
const groupColors={Encounter2:'#29263f',NodKrai3:'#292747',Magic:'#30214b',NodKrai2:'#282a46',NodKrai1:'#2c2944',Natlan2:'#512c31',Natlan:'#542c30',Mondstadt:'#273841',Liyue:'#3b302d',Inazuma:'#3c2d48',Sumeru:'#273c30',Fontaine:'#29384a'};
const stateLabels={ready:'可练习',review:'谱面待核对',missing:'暂缺谱面'};
let catalog=null, selected=null, groupFilter=null, favoriteFilter=false, returnTo='practice';

function element(tag, className, text) {
  const node=document.createElement(tag);
  if (className) node.className=className;
  if (text !== undefined) node.textContent=text;
  return node;
}
function coverFor(song, className) {
  const holder=element('div',className);
  if (song.cover) {
    const img=element('img'); img.src=song.cover; img.alt=''; img.loading='lazy';
    if (className==='detail-cover') holder.style.setProperty('--cover-image',`url(${JSON.stringify(img.src)})`);
    img.addEventListener('error',()=>{img.remove();holder.style.removeProperty('--cover-image');holder.append(element('span',className==='song-cover'?'song-placeholder':'detail-placeholder','♫'));},{once:true});
    holder.append(img);
  } else holder.append(element('span',className==='song-cover'?'song-placeholder':'detail-placeholder','♫'));
  return holder;
}
function updateFavoriteButton() {
  favoriteButton.disabled=!selected;
  const marked=!!selected && favorites.has(selected.id);
  favoriteButton.setAttribute('aria-pressed',String(marked));
  favoriteButton.setAttribute('aria-label',marked?'取消收藏所选曲目':'收藏所选曲目');
  favoriteButton.title=marked?'已收藏 · 点击取消':'收藏曲目';
}
function renderDetails() {
  detail.replaceChildren();
  start.disabled=!selected || selected.status!=='ready';
  updateFavoriteButton();
  if (!selected) { detail.append(element('div','library-empty','选择一首曲目')); return; }
  const song=selected, hero=coverFor(song,'detail-cover'), title=element('div','detail-name');
  if (song.coverKind==='soundtrack') hero.append(element('span','detail-cover-credit','原声专辑图'));
  title.append(element('h2','',song.title),element('small','',song.titleEn)); hero.append(title); detail.append(hero);
  const kicker=element('div','detail-kicker');
  kicker.append(element('strong','','选择难度'),element('span','',`${Math.floor(song.durationMs/60000)}:${String(Math.floor(song.durationMs/1000)%60).padStart(2,'0')}  ·  ${song.bpm} BPM`)); detail.append(kicker);
  const difficulty=['普通','困难','大师','传说'], glyphs=['♩','♫','♬','✦'];
  for (let i=0;i<4;i++) {
    const available=i===3 && song.status==='ready';
    const row=element('div','difficulty-row'+(available?' playable':''));
    row.append(element('span','difficulty-icon',glyphs[i]));
    const body=element('div'), head=element('div','difficulty-head');
    head.append(element('strong','',difficulty[i]),element('span','difficulty-status',i===3?stateLabels[song.status]:'暂未收录'));
    const stars=element('span','difficulty-stars');
    const level=Math.max(0,Math.min(10,Number(song.levels?.[i])||0));
    stars.append(document.createTextNode('★'.repeat(level)));
    stars.append(element('span','dim',' ◆'.repeat(Math.max(0,10-level))));
    body.append(head,stars);row.append(body);detail.append(row);
  }
  const summary=element('p','detail-summary');
  if (song.status==='ready') summary.textContent=`传说 · ${song.noteCount} 个音符 · 六键练习谱。${song.audio?'提供官方在线原声入口，游戏剪辑同步待校准。':'提供节拍伴奏，可自行选择配套音频。'} 判定规则仍在校准中。`;
  else summary.textContent=song.status==='review'?'公开谱面存在数据疑点，核对后再开放练习。':'当前资料中尚未找到可用的传说谱面。';
  detail.append(summary);
  if (song.audio && /^[A-Za-z0-9_-]{11}$/.test(song.audio.videoId)) {
    const audio=element('div','library-audio-preview');
    const toggle=element('button','library-audio-toggle','♫ 试听官方原声');toggle.type='button';toggle.setAttribute('aria-expanded','false');
    const link=element('a','','在 YouTube 打开 ↗');link.href=`https://www.youtube.com/watch?v=${song.audio.videoId}&t=${Math.max(0,Math.floor(song.audio.startSeconds))}s`;link.target='_blank';link.rel='noopener noreferrer';
    const mount=element('div','library-audio-mount');mount.hidden=true;
    toggle.addEventListener('click',()=>{
      if (!mount.hidden) {mount.replaceChildren();mount.hidden=true;toggle.textContent='♫ 试听官方原声';toggle.setAttribute('aria-expanded','false');return;}
      const frame=element('iframe');frame.title=`${song.title} 官方原声`;
      frame.src=`https://www.youtube.com/embed/${song.audio.videoId}?start=${Math.max(0,Math.floor(song.audio.startSeconds))}&playsinline=1`;
      frame.allow='encrypted-media; picture-in-picture';frame.allowFullscreen=true;
      mount.append(frame);mount.hidden=false;toggle.textContent='收起试听';toggle.setAttribute('aria-expanded','true');
      mount.scrollIntoView({block:'nearest'});
    });
    audio.append(toggle,link,mount);detail.append(audio);
  }
}
function renderGroups(scrollToSelection=false) {
  groupsEl.replaceChildren();
  const term=search.value.trim().toLocaleLowerCase(); let matches=0, selectedGroup=null;
  for (const group of catalog.groups) {
    if (groupFilter && group.id!==groupFilter) continue;
    const songs=group.songs.filter(s=>(!favoriteFilter || favorites.has(s.id)) && (!term || `${s.title} ${s.titleEn}`.toLocaleLowerCase().includes(term)));
    if (!songs.length) continue;
    matches+=songs.length;
    const section=element('section','album-group'); section.style.setProperty('--album-color',groupColors[group.id]||'#302744');
    const heading=element('div','album-title'); heading.append(element('span','',group.title.replace('·',' · ')),element('span','','✧  ♫  ✧')); section.append(heading);
    const tiles=element('div','album-songs');
    for (const song of songs) {
      const button=element('button','song-tile'); button.type='button';
      const coverNote=song.coverKind==='soundtrack'?'，使用原声专辑图':'';
      button.setAttribute('aria-label',`${song.title}，${stateLabels[song.status]}${coverNote}`); button.setAttribute('aria-pressed',String(selected?.id===song.id));
      button.title=`${song.title} · ${stateLabels[song.status]}${coverNote}`;
      const dot=element('span','song-status-dot '+song.status); dot.setAttribute('aria-hidden','true');
      button.append(coverFor(song,'song-cover'),dot,element('span','song-name',song.title));
      if (favorites.has(song.id)) { const star=element('span','song-favorite-mark','★');star.setAttribute('aria-hidden','true');button.append(star); }
      button.addEventListener('click',()=>{
        selected=song;
        groupsEl.querySelectorAll('.song-tile[aria-pressed="true"]').forEach(el=>el.setAttribute('aria-pressed','false'));
        button.setAttribute('aria-pressed','true'); renderDetails();
      });
      tiles.append(button);
      if (selected?.id===song.id) selectedGroup=section;
    }
    section.append(tiles);groupsEl.append(section);
  }
  if (!matches) groupsEl.append(element('p','library-loading',favoriteFilter && !term?'还没有收藏曲目。可在歌曲详情下方点击星标收藏。':'没有找到匹配的歌曲，请尝试其他名称。'));
  const all=catalog.groups.flatMap(group=>group.songs);
  count.textContent=groupFilter || favoriteFilter || term ? `${matches} 首曲目` : `${all.length} 首曲目 · ${all.filter(song=>song.status==='ready').length} 首可练习`;
  if (scrollToSelection && selectedGroup) requestAnimationFrame(()=>{groupsEl.scrollTop+=selectedGroup.getBoundingClientRect().top-groupsEl.getBoundingClientRect().top;});
}
function chooseInFilter() {
  if (!catalog) return;
  const term=search.value.trim().toLocaleLowerCase();
  const groups=catalog.groups.filter(group=>!groupFilter || group.id===groupFilter);
  const songs=groups.flatMap(group=>group.songs).filter(song=>(!favoriteFilter || favorites.has(song.id)) && (!term || `${song.title} ${song.titleEn}`.toLocaleLowerCase().includes(term)));
  if (!selected || !songs.some(song=>song.id===selected.id)) selected=(groupFilter ? songs[0] : songs.find(song=>song.status==='ready') || songs[0]) || null;
}
function show(options={}) {
  returnTo=options.from==='home'?'home':'practice';
  groupFilter=options.groupId || null; favoriteFilter=!!options.favoritesOnly;
  search.value='';
  $('homeView').hidden=true; view.hidden=false; gameFrame.inert=true;
  window.dispatchEvent(new Event('romm:library-open'));
  if (catalog) {
    const group=catalog.groups.find(item=>item.id===groupFilter);
    heading.textContent=favoriteFilter?'我的收藏':group?group.title.replace('·',' · '):'全部歌曲';
    chooseInFilter();renderGroups(true);renderDetails();
  }
  close.setAttribute('aria-label',returnTo==='home'?'返回首页':'返回练习');
  close.focus();
}
function hide(toPractice=false) {
  // Removing the player stops a preview before returning to the practice view.
  if (detail.querySelector('.library-audio-mount iframe')) renderDetails();
  view.hidden=true;
  if (!toPractice && returnTo==='home') window.dispatchEvent(new Event('romm:show-home'));
  else {gameFrame.inert=false;$('libraryOpen').focus();}
}
$('libraryOpen').addEventListener('click',()=>show());
$('libraryDrawerButton').addEventListener('click',()=>show());
window.addEventListener('romm:open-library',event=>show(event.detail || {}));
close.addEventListener('click',()=>hide());
search.addEventListener('input',()=>{if(catalog){chooseInFilter();renderGroups();renderDetails();}});
start.addEventListener('click',()=>{
  if (!selected || selected.status!=='ready') return;
  window.dispatchEvent(new CustomEvent('romm:select-song',{detail:selected})); hide(true);
});
favoriteButton.addEventListener('click',()=>{
  if (!selected) return;
  const previousId=selected.id;
  const result=favorites.toggle(selected.id);
  $('favoriteFeedback').textContent=result.saved?(result.favorite?'已收藏，保存在此浏览器。':'已取消收藏。'):'当前浏览器无法保存，收藏仅在本次访问有效。';
  if (favoriteFilter && !result.favorite) chooseInFilter();
  renderGroups();
  if (selected?.id!==previousId) renderDetails(); else updateFavoriteButton();
  window.dispatchEvent(new CustomEvent('romm:favorites-changed',{detail:{source:'library'}}));
});
window.addEventListener('romm:favorites-changed',event=>{
  if (event.detail?.source==='library') return;
  if (!catalog || view.hidden) return;
  chooseInFilter();renderGroups();renderDetails();
});
window.addEventListener('keydown',event=>{
  if (!view.hidden && event.key==='Escape') {event.preventDefault();hide();}
});
view.addEventListener('keydown',event=>{
  if (event.key!=='Tab') return;
  const focusable=[...view.querySelectorAll('button:not(:disabled), input, [tabindex="0"]')];
  if (!focusable.length) return;
  if (event.shiftKey && document.activeElement===focusable[0]) {event.preventDefault();focusable.at(-1).focus();}
  else if (!event.shiftKey && document.activeElement===focusable.at(-1)) {event.preventDefault();focusable[0].focus();}
});
try {
  const response=await fetch('./data/catalog.json');
  if (!response.ok) throw new Error('曲目资料加载失败');
  catalog=await response.json();
  const songs=catalog.groups.flatMap(group=>group.songs);
  selected=songs.find(song=>song.id==='_GMusic16') || songs.find(song=>song.status==='ready') || songs[0];
  const group=catalog.groups.find(item=>item.id===groupFilter);
  heading.textContent=favoriteFilter?'我的收藏':group?group.title.replace('·',' · '):'全部歌曲';
  chooseInFilter();renderGroups(!view.hidden);renderDetails();
} catch {
  count.textContent='曲目资料暂不可用'; groupsEl.replaceChildren(element('p','library-loading','曲目资料加载失败，请检查网络后刷新页面。'));start.disabled=true;
}
