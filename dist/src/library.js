const $ = id => document.getElementById(id);
const view=$('libraryView'), groupsEl=$('libraryGroups'), detail=$('libraryDetail'), search=$('librarySearch');
const count=$('libraryCount'), start=$('libraryStart'), close=$('libraryClose');
const gameFrame=document.querySelector('.game-frame');
const groupColors={Encounter2:'#29263f',NodKrai3:'#292747',Magic:'#30214b',NodKrai2:'#282a46',NodKrai1:'#2c2944',Natlan2:'#512c31',Natlan:'#542c30',Mondstadt:'#273841',Liyue:'#3b302d',Inazuma:'#3c2d48',Sumeru:'#273c30',Fontaine:'#29384a'};
const stateLabels={ready:'可练习',review:'谱面待核对',missing:'暂缺谱面'};
let catalog=null, selected=null;

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
    if (className==='detail-cover') holder.style.setProperty('--cover-image',`url("${song.cover}")`);
    img.addEventListener('error',()=>{img.remove();holder.append(element('span',className==='song-cover'?'song-placeholder':'detail-placeholder','♫'));},{once:true});
    holder.append(img);
  } else holder.append(element('span',className==='song-cover'?'song-placeholder':'detail-placeholder','♫'));
  return holder;
}
function renderDetails() {
  detail.replaceChildren();
  start.disabled=!selected || selected.status!=='ready';
  if (!selected) { detail.append(element('div','library-empty','选择一首曲目')); return; }
  const song=selected, hero=coverFor(song,'detail-cover'), title=element('div','detail-name');
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
}
function renderGroups(scrollToSelection=false) {
  groupsEl.replaceChildren();
  const term=search.value.trim().toLocaleLowerCase(); let matches=0, selectedGroup=null;
  for (const group of catalog.groups) {
    const songs=group.songs.filter(s=>!term || `${s.title} ${s.titleEn}`.toLocaleLowerCase().includes(term));
    if (!songs.length) continue;
    matches+=songs.length;
    const section=element('section','album-group'); section.style.setProperty('--album-color',groupColors[group.id]||'#302744');
    const heading=element('div','album-title'); heading.append(element('span','',group.title.replace('·',' · ')),element('span','','✧  ♫  ✧')); section.append(heading);
    const tiles=element('div','album-songs');
    for (const song of songs) {
      const button=element('button','song-tile'); button.type='button';
      button.setAttribute('aria-label',`${song.title}，${stateLabels[song.status]}`); button.setAttribute('aria-pressed',String(selected?.id===song.id));
      button.title=`${song.title} · ${stateLabels[song.status]}`;
      const dot=element('span','song-status-dot '+song.status); dot.setAttribute('aria-hidden','true');
      button.append(coverFor(song,'song-cover'),dot,element('span','song-name',song.title));
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
  if (!matches) groupsEl.append(element('p','library-loading','没有找到匹配的歌曲，请尝试其他名称。'));
  if (scrollToSelection && selectedGroup) requestAnimationFrame(()=>{groupsEl.scrollTop+=selectedGroup.getBoundingClientRect().top-groupsEl.getBoundingClientRect().top;});
}
function show() {
  view.hidden=false; gameFrame.inert=true; window.dispatchEvent(new Event('romm:library-open'));
  if (catalog) renderGroups(true);
  close.focus();
}
function hide() { view.hidden=true; gameFrame.inert=false; $('libraryOpen').focus(); }
$('libraryOpen').addEventListener('click',show);
$('libraryDrawerButton').addEventListener('click',show);
close.addEventListener('click',hide);
search.addEventListener('input',()=>{if(catalog)renderGroups();});
start.addEventListener('click',()=>{
  if (!selected || selected.status!=='ready') return;
  window.dispatchEvent(new CustomEvent('romm:select-song',{detail:selected})); hide();
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
gameFrame.inert=true;
close.focus();
try {
  const response=await fetch('./data/catalog.json');
  if (!response.ok) throw new Error('曲目资料加载失败');
  catalog=await response.json();
  const songs=catalog.groups.flatMap(group=>group.songs);
  selected=songs.find(song=>song.id==='_GMusic16') || songs.find(song=>song.status==='ready') || songs[0];
  count.textContent=`${songs.length} 首曲目 · ${songs.filter(song=>song.status==='ready').length} 首可练习`;
  renderGroups(true);renderDetails();
} catch {
  count.textContent='曲目资料暂不可用'; groupsEl.replaceChildren(element('p','library-loading','曲目资料加载失败，请检查网络后刷新页面。'));start.disabled=true;
}
