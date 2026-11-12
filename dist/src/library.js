import { favorites } from './favorites.js';
import { tr, songName, groupName, songMatches, catalogUrl } from './i18n.js';
import { practiceResults, resultTime, resultPercent } from './practice-results.js';

const $ = id => document.getElementById(id);
const view=$('libraryView'), groupsEl=$('libraryGroups'), detail=$('libraryDetail'), search=$('librarySearch');
const count=$('libraryCount'), start=$('libraryStart'), close=$('libraryClose');
const favoriteButton=$('libraryFavorite'), heading=$('libraryHeading');
const statusSelect=$('libraryStatusFilter');
const gameFrame=document.querySelector('.game-frame');
const groupColors={Encounter2:'#29263f',NodKrai3:'#292747',Magic:'#30214b',NodKrai2:'#282a46',NodKrai1:'#2c2944',Natlan2:'#512c31',Natlan:'#542c30',Mondstadt:'#273841',Liyue:'#3b302d',Inazuma:'#3c2d48',Sumeru:'#273c30',Fontaine:'#29384a'};
const stateLabel=status=>({ready:tr('可练习','Playable'),review:tr('谱面待核对','Chart under review'),missing:tr('暂缺谱面','Chart unavailable')})[status] || '';
let catalog=null, selected=null, groupFilter=null, favoriteFilter=false, statusFilter='all', returnTo='practice';

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
  favoriteButton.setAttribute('aria-label',marked?tr('取消收藏所选曲目','Remove selected song from favorites'):tr('收藏所选曲目','Add selected song to favorites'));
  favoriteButton.title=marked?tr('已收藏 · 点击取消','Favorited · click to remove'):tr('收藏曲目','Add to favorites');
}
function renderDetails() {
  const hadPreview=!!detail.querySelector('.library-audio-mount iframe');
  detail.replaceChildren();
  if (hadPreview) window.dispatchEvent(new Event('romm:audio-preview-end'));
  start.disabled=!selected || selected.status!=='ready';
  updateFavoriteButton();
  if (!selected) { detail.append(element('div','library-empty',tr('选择一首曲目','Choose a song'))); return; }
  const song=selected, hero=coverFor(song,'detail-cover'), title=element('div','detail-name');
  if (song.coverKind==='soundtrack') hero.append(element('span','detail-cover-credit',tr('原声专辑图','Soundtrack artwork')));
  title.append(element('h2','',songName(song)),element('small','',tr(song.titleEn || '',song.titleEn ? song.title : '',song.titleJa === song.titleEn ? '' : song.titleEn || ''))); hero.append(title); detail.append(hero);
  const kicker=element('div','detail-kicker');
  kicker.append(element('strong','',tr('选择难度','Difficulty')),element('span','',`${Math.floor(song.durationMs/60000)}:${String(Math.floor(song.durationMs/1000)%60).padStart(2,'0')}  ·  ${song.bpm} BPM`)); detail.append(kicker);
  const difficulty=tr(['普通','困难','大师','传说'],['Normal','Hard','Master','Legendary'],['ノーマル','ハード','プロ','レジェンド']), glyphs=['♩','♫','♬','✦'];
  for (let i=0;i<4;i++) {
    const available=i===3 && song.status==='ready';
    const row=element('div','difficulty-row'+(available?' playable':''));
    row.append(element('span','difficulty-icon',glyphs[i]));
    const body=element('div'), head=element('div','difficulty-head');
    head.append(element('strong','',difficulty[i]),element('span','difficulty-status',i===3?stateLabel(song.status):tr('暂未收录','Not available')));
    const stars=element('span','difficulty-stars');
    const level=Math.max(0,Math.min(10,Number(song.levels?.[i])||0));
    stars.append(document.createTextNode('★'.repeat(level)));
    stars.append(element('span','dim',' ◆'.repeat(Math.max(0,10-level))));
    body.append(head,stars);row.append(body);detail.append(row);
  }
  const summary=element('p','detail-summary');
  if (song.status==='ready') summary.textContent=tr(`传说 · ${song.noteCount} 个音符 · 六键练习谱。${song.audio?'提供官方在线原声入口，游戏剪辑同步待校准。':'提供节拍伴奏，可自行选择配套音频。'} 判定规则仍在校准中。`,`Legendary · ${song.noteCount} notes · 6-key practice chart. ${song.audio?'Online soundtrack available; synchronization may need adjustment.':'Metronome available; you can choose local audio.'} Judgment is still being calibrated.`,`レジェンド · ${song.noteCount} ノーツ · 6キー練習譜面。${song.audio?'公式オンライン音源を利用できます。同期は調整中です。':'メトロノームを利用できます。端末の音源も選択できます。'} 判定ルールは調整中です。`);
  else summary.textContent=song.status==='review'?tr('公开谱面存在数据疑点，核对后再开放练习。','This public chart needs verification before practice is available.'):tr('当前资料中尚未找到可用的传说谱面。','No usable Legendary chart has been found for this song yet.');
  detail.append(summary);
  const recent=practiceResults.recent(song.id);
  if (recent) {
    const offset=`${recent.offsetMs>=0?'+':''}${recent.offsetMs} ms`;
    const profile=`${resultTime(recent.startMs)} – ${resultTime(recent.endMs)} · ${recent.rate.toFixed(2)}× · ±${recent.hitWindowMs} ms · ${tr(`偏移 ${offset}`,`Offset ${offset}`,`調整 ${offset}`)}`;
    detail.append(element('p','library-recent-best',tr(`最近记录：最佳完成度 ${resultPercent(recent)}%（${profile}）`,`Recent personal best: ${resultPercent(recent)}% (${profile})`,`最近の自己ベスト：${resultPercent(recent)}%（${profile}）`)));
  }
  if (song.audio && /^[A-Za-z0-9_-]{11}$/.test(song.audio.videoId)) {
    const audio=element('div','library-audio-preview');
    const toggle=element('button','library-audio-toggle',tr('♫ 试听官方原声','♫ Preview soundtrack'));toggle.type='button';toggle.setAttribute('aria-expanded','false');
    const link=element('a','',tr('在 YouTube 打开 ↗','Open on YouTube ↗'));link.href=`https://www.youtube.com/watch?v=${song.audio.videoId}&t=${Math.max(0,Math.floor(song.audio.startSeconds))}s`;link.target='_blank';link.rel='noopener noreferrer';
    const mount=element('div','library-audio-mount');mount.hidden=true;
    toggle.addEventListener('click',()=>{
      if (!mount.hidden) {mount.replaceChildren();mount.hidden=true;toggle.textContent=tr('♫ 试听官方原声','♫ Preview soundtrack');toggle.setAttribute('aria-expanded','false');window.dispatchEvent(new Event('romm:audio-preview-end'));return;}
      const frame=element('iframe');frame.title=tr(`${song.title} 官方原声`,`${songName(song)} official soundtrack`,`${songName(song)} 公式サウンドトラック`);
      frame.src=`https://www.youtube.com/embed/${song.audio.videoId}?start=${Math.max(0,Math.floor(song.audio.startSeconds))}&playsinline=1`;
      frame.allow='encrypted-media; picture-in-picture';frame.allowFullscreen=true;
      window.dispatchEvent(new Event('romm:audio-preview-start'));
      mount.append(frame);mount.hidden=false;toggle.textContent=tr('收起试听','Close preview');toggle.setAttribute('aria-expanded','true');
      mount.scrollIntoView({block:'nearest'});
    });
    audio.append(toggle,link,mount);detail.append(audio);
  }
}
function renderGroups(scrollToSelection=false) {
  groupsEl.replaceChildren();
  const term=search.value.trim(); let matches=0, selectedTile=null;
  for (const group of catalog.groups) {
    if (groupFilter && group.id!==groupFilter) continue;
    const songs=group.songs.filter(s=>(!favoriteFilter || favorites.has(s.id)) && (statusFilter==='all' || s.status===statusFilter) && songMatches(s,term));
    if (!songs.length) continue;
    matches+=songs.length;
    const section=element('section','album-group'); section.style.setProperty('--album-color',groupColors[group.id]||'#302744');
    const heading=element('div','album-title'); heading.append(element('span','',groupName(group)),element('span','','✧  ♫  ✧')); section.append(heading);
    const tiles=element('div','album-songs');
    for (const song of songs) {
      const button=element('button','song-tile'); button.type='button';
      const coverNote=song.coverKind==='soundtrack'?tr('，使用原声专辑图',', soundtrack artwork'):'';
      button.setAttribute('aria-label',`${songName(song)} · ${stateLabel(song.status)}${coverNote}`); button.setAttribute('aria-pressed',String(selected?.id===song.id));
      button.title=`${songName(song)} · ${stateLabel(song.status)}${coverNote}`;
      const dot=element('span','song-status-dot '+song.status); dot.setAttribute('aria-hidden','true');
      button.append(coverFor(song,'song-cover'),dot,element('span','song-name',songName(song)));
      if (favorites.has(song.id)) { const star=element('span','song-favorite-mark','★');star.setAttribute('aria-hidden','true');button.append(star); }
      button.addEventListener('click',()=>{
        selected=song;
        groupsEl.querySelectorAll('.song-tile[aria-pressed="true"]').forEach(el=>el.setAttribute('aria-pressed','false'));
        button.setAttribute('aria-pressed','true'); renderDetails();
      });
      tiles.append(button);
      if (selected?.id===song.id) selectedTile=button;
    }
    section.append(tiles);groupsEl.append(section);
  }
  if (!matches) groupsEl.append(element('p','library-loading',favoriteFilter && !term && statusFilter==='all'?tr('还没有收藏曲目。可在歌曲详情下方点击星标收藏。','No favorites yet. Select the star in a song’s details to save it.'):tr('没有找到符合条件的歌曲。','No songs match these filters.','条件に合う楽曲が見つかりません。')));
  const all=catalog.groups.flatMap(group=>group.songs);
  count.textContent=groupFilter || favoriteFilter || term || statusFilter!=='all' ? tr(`${matches} 首曲目`,`${matches} ${matches===1?'song':'songs'}`,`${matches}曲`) : tr(`${all.length} 首曲目 · ${all.filter(song=>song.status==='ready').length} 首可练习`,`${all.length} songs · ${all.filter(song=>song.status==='ready').length} playable`,`${all.length}曲 · ${all.filter(song=>song.status==='ready').length}曲を練習可能`);
  if (scrollToSelection && selectedTile) {
    const tile=selectedTile, songId=selected?.id;
    requestAnimationFrame(()=>{
      if (view.hidden || !tile.isConnected || selected?.id!==songId) return;
      const item=tile.getBoundingClientRect(), list=groupsEl.getBoundingClientRect();
      if (item.top < list.top || item.bottom > list.bottom) {
        groupsEl.scrollTop+=item.top-list.top-Math.max(0,(list.height-item.height)/2);
      }
    });
  }
}
function chooseInFilter() {
  if (!catalog) return;
  const term=search.value.trim();
  const groups=catalog.groups.filter(group=>!groupFilter || group.id===groupFilter);
  const songs=groups.flatMap(group=>group.songs).filter(song=>(!favoriteFilter || favorites.has(song.id)) && (statusFilter==='all' || song.status===statusFilter) && songMatches(song,term));
  if (!selected || !songs.some(song=>song.id===selected.id)) selected=(groupFilter ? songs[0] : songs.find(song=>song.status==='ready') || songs[0]) || null;
}
function show(options={}) {
  returnTo=options.from==='home'?'home':'practice';
  groupFilter=options.groupId || null; favoriteFilter=!!options.favoritesOnly;
  statusFilter='all'; if(statusSelect)statusSelect.value='all';
  search.value='';
  $('homeView').hidden=true; view.hidden=false; gameFrame.inert=true;
  window.dispatchEvent(new Event('romm:library-open'));
  if (catalog) {
    const group=catalog.groups.find(item=>item.id===groupFilter);
    heading.textContent=favoriteFilter?tr('我的收藏','Favorites'):group?groupName(group):tr('全部歌曲','All Songs');
    chooseInFilter();renderGroups(true);renderDetails();
  }
  close.setAttribute('aria-label',returnTo==='home'?tr('返回首页','Return home'):tr('返回练习','Return to practice'));
  close.focus();
}
function hide(toPractice=false) {
  // Removing the player stops a preview before returning to the practice view.
  if (detail.querySelector('.library-audio-mount iframe')) renderDetails();
  view.hidden=true;
  if (!toPractice && returnTo==='home') window.dispatchEvent(new Event('romm:show-home'));
  else {gameFrame.inert=false;window.dispatchEvent(new Event('romm:practice-visible'));$('libraryOpen').focus();}
}
$('libraryOpen').addEventListener('click',()=>show());
$('libraryDrawerButton').addEventListener('click',()=>show());
window.addEventListener('romm:open-library',event=>show(event.detail || {}));
close.addEventListener('click',()=>hide());
function updateFilters() {
  if (!catalog) return;
  const previousId=selected?.id;
  chooseInFilter();
  renderGroups();
  // Keep an open soundtrack preview alive when the selection did not change.
  if (selected?.id !== previousId) renderDetails();
}
search.addEventListener('input',updateFilters);
statusSelect?.addEventListener('change',()=>{statusFilter=['ready','review','missing'].includes(statusSelect.value)?statusSelect.value:'all';updateFilters();});
start.addEventListener('click',()=>{
  if (!selected || selected.status!=='ready') return;
  window.dispatchEvent(new CustomEvent('romm:select-song',{detail:selected})); hide(true);
});
favoriteButton.addEventListener('click',()=>{
  if (!selected) return;
  const previousId=selected.id;
  const result=favorites.toggle(selected.id);
  $('favoriteFeedback').textContent=result.saved?(result.favorite?tr('已收藏，保存在此浏览器。','Added to favorites in this browser.'):tr('已取消收藏。','Removed from favorites.')):tr('当前浏览器无法保存，收藏仅在本次访问有效。','Unable to save; this favorite lasts only for this visit.');
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
window.addEventListener('romm:results-changed',()=>{if(catalog && !view.hidden)renderDetails();});
window.addEventListener('romm:language-changed',()=>{
  if(!catalog)return;
  const group=catalog.groups.find(item=>item.id===groupFilter), scroll=groupsEl.scrollTop;
  heading.textContent=favoriteFilter?tr('我的收藏','Favorites'):group?groupName(group):tr('全部歌曲','All Songs');
  close.setAttribute('aria-label',returnTo==='home'?tr('返回首页','Return home'):tr('返回练习','Return to practice'));
  renderGroups();groupsEl.scrollTop=scroll;renderDetails();
});
window.addEventListener('keydown',event=>{
  if (!view.hidden && event.key==='Escape') {event.preventDefault();hide();}
});
view.addEventListener('keydown',event=>{
  if (event.key!=='Tab') return;
  const focusable=[...view.querySelectorAll('button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), a[href], iframe, [tabindex]:not([tabindex="-1"])')]
    .filter(node=>node.getClientRects().length && !node.closest('[hidden], [inert]'));
  if (!focusable.length) return;
  if (event.shiftKey && document.activeElement===focusable[0]) {event.preventDefault();focusable.at(-1).focus();}
  else if (!event.shiftKey && document.activeElement===focusable.at(-1)) {event.preventDefault();focusable[0].focus();}
});
try {
  const response=await fetch(catalogUrl());
  if (!response.ok) throw new Error('曲目资料加载失败');
  catalog=await response.json();
  const songs=catalog.groups.flatMap(group=>group.songs);
  selected=songs.find(song=>song.id==='_GMusic16') || songs.find(song=>song.status==='ready') || songs[0];
  const group=catalog.groups.find(item=>item.id===groupFilter);
  heading.textContent=favoriteFilter?tr('我的收藏','Favorites'):group?groupName(group):tr('全部歌曲','All Songs');
  chooseInFilter();renderGroups(!view.hidden);renderDetails();
} catch {
  count.textContent=tr('曲目资料暂不可用','Song data unavailable'); groupsEl.replaceChildren(element('p','library-loading',tr('曲目资料加载失败，请检查网络后刷新页面。','Unable to load songs. Check your connection and refresh.')));start.disabled=true;
}
