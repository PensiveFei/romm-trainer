import { favorites } from './favorites.js';

const $=id=>document.getElementById(id);
const home=$('homeView'), gameFrame=document.querySelector('.game-frame');
const albumsEl=$('homeAlbums'), featuredEl=$('homeFeaturedList');
const drawer=$('toolsDrawer'), drawerParent=drawer.parentNode, drawerNext=drawer.nextSibling;
const backdrop=$('homeSettingsBackdrop'), help=$('homeHelp');
const albumArt={Encounter2:'../encounter-covers/01-qkfbm4fgdarh1.png',NodKrai3:'121.webp',Magic:'111.webp',NodKrai2:'97.webp',NodKrai1:'85.webp',Natlan2:'73.webp',Natlan:'61.webp',Mondstadt:'01.webp',Liyue:'13.webp',Inazuma:'25.webp',Sumeru:'37.webp',Fontaine:'49.webp'};
const heroIds=['Encounter2','NodKrai3','Magic','Mondstadt','Sumeru'];
const featuredIds=['_GMusic106','_GMusic104','_GMusic16'];
let catalog=null, heroIndex=0, expanded=true, settingsFromHome=false;
let lastHeroInteraction=Date.now();

function el(tag,className,text) {
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(text!==undefined)node.textContent=text;
  return node;
}
function artFor(group) {const file=albumArt[group.id];return file?`./assets/covers/${file}`:null;}
function openLibrary(options={}) {window.dispatchEvent(new CustomEvent('romm:open-library',{detail:{from:'home',...options}}));}
function openPractice(song) {
  home.hidden=true;gameFrame.inert=false;
  if(song)window.dispatchEvent(new CustomEvent('romm:select-song',{detail:song}));
  $('playButton').focus();
}
function renderFeatured() {
  featuredEl.replaceChildren();
  const songs=catalog.groups.flatMap(group=>group.songs);
  for(const id of featuredIds) {
    const song=songs.find(item=>item.id===id && item.status==='ready');
    if(!song)continue;
    const button=el('button','featured-song');button.type='button';button.setAttribute('aria-label',`练习 ${song.title}`);
    const picture=el('span','featured-picture');
    if(song.cover){const image=el('img');image.src=song.cover;image.alt='';picture.append(image);}else picture.textContent='♫';
    const details=el('span','featured-copy'),line=el('span','featured-level');
    line.append(el('span','featured-keys','六键'),el('span','featured-stars','★'.repeat(song.levels?.[3] || 0)),el('span','featured-diamonds','◆'.repeat(Math.max(0,10-(song.levels?.[3] || 0)))));
    details.append(el('strong','',song.title),line);
    button.append(picture,details,el('span','featured-play','▶'));button.addEventListener('click',()=>openPractice(song));featuredEl.append(button);
  }
}
function renderHero() {
  if(!catalog)return;
  const id=heroIds[heroIndex], group=catalog.groups.find(item=>item.id===id);
  if(!group)return;
  $('homeHeroImage').src=artFor(group) || '';
  $('homeHeroImage').style.objectPosition=id==='Encounter2'?'center 25%':'center 47%';
  $('homeHeroTitle').textContent=group.title.replace('·',' · ');
  $('homeHeroOpen').setAttribute('aria-label',`浏览 ${group.title} 专辑`);
  const pages=$('homeHeroPages');pages.replaceChildren();
  heroIds.forEach((groupId,index)=>{
    const candidate=catalog.groups.find(item=>item.id===groupId);
    const button=el('button','hero-dot');button.type='button';
    button.setAttribute('aria-label',`展示 ${candidate?.title || '专辑'}`);button.setAttribute('aria-pressed',String(index===heroIndex));
    button.addEventListener('click',()=>{heroIndex=index;lastHeroInteraction=Date.now();renderHero();pages.children[index]?.focus();});pages.append(button);
  });
}
function makeRecord({title,image,kind,onClick,count}) {
  const button=el('button','album-record');button.type='button';button.title=title;button.setAttribute('aria-label',count===undefined?title:`${title}，${count} 首`);
  const sleeve=el('span','album-sleeve '+(kind || ''));
  if(image){const img=el('img');img.src=image;img.alt='';img.loading='lazy';sleeve.append(img);}
  else sleeve.append(el('span','album-symbol',kind==='favorite'?'★':kind==='all'?'▦':'♫'));
  if(count!==undefined)sleeve.append(el('span','album-count',String(count)));
  button.append(el('span','album-disc'),sleeve,el('span','album-record-label',title));
  button.addEventListener('click',onClick);return button;
}
function renderAlbums() {
  albumsEl.replaceChildren();
  const songs=catalog?.groups.flatMap(group=>group.songs) || [];
  const favoriteCount=songs.filter(song=>favorites.has(song.id)).length;
  albumsEl.append(makeRecord({title:'全部歌曲',kind:'all',onClick:()=>openLibrary()}));
  albumsEl.append(makeRecord({title:'我的收藏',kind:'favorite',count:favoriteCount,onClick:()=>openLibrary({favoritesOnly:true})}));
  for(const group of catalog?.groups || []) albumsEl.append(makeRecord({title:group.title.replace('·',' · '),image:artFor(group),onClick:()=>openLibrary({groupId:group.id})}));
  albumsEl.classList.toggle('collapsed',!expanded);
  $('homeExpand').setAttribute('aria-expanded',String(expanded));
  $('homeExpand').replaceChildren(document.createTextNode(expanded?'收起 ':'展开 '),el('span','',expanded?'⌃':'⌄'));
}

const homeTheme=el('section','home-theme-setting');
const homeThemeHeading=el('h3','home-theme-heading','演奏界面');
const themeLabel=el('label','','谱面主题');themeLabel.htmlFor='homeThemeSelect';
const themeSelect=el('select');themeSelect.id='homeThemeSelect';themeSelect.setAttribute('aria-label','谱面主题');
for(const option of $('themeSelect').options)themeSelect.append(option.cloneNode(true));
homeTheme.append(themeLabel,themeSelect);
const controlColumn=drawer.querySelector('.control-column');
controlColumn.insertBefore(homeThemeHeading,drawer.querySelector('.settings-panel'));
controlColumn.insertBefore(homeTheme,drawer.querySelector('.settings-panel'));
const settingsNav=el('nav','home-settings-nav');settingsNav.setAttribute('aria-label','设置分类');
const navItems=[['基础',homeThemeHeading],['键位',drawer.querySelector('.key-panel')]];
for(const [label,target] of navItems){
  const button=el('button','settings-nav-item',label);button.type='button';button.setAttribute('aria-current',label==='基础'?'true':'false');
  button.addEventListener('click',()=>{settingsNav.querySelectorAll('button').forEach(item=>item.setAttribute('aria-current',String(item===button)));target.scrollIntoView({block:'start',behavior:'smooth'});});
  settingsNav.append(button);
}
drawer.querySelector('.drawer-columns').prepend(settingsNav);
themeSelect.addEventListener('change',()=>{$('themeSelect').value=themeSelect.value;$('themeSelect').dispatchEvent(new Event('change',{bubbles:true}));});
function restoreDrawer() {
  if(!settingsFromHome)return;
  settingsFromHome=false;drawer.classList.remove('home-drawer');
  drawerParent.insertBefore(drawer,drawerNext);drawer.querySelector('.drawer-head h2').textContent='曲谱与设置';backdrop.hidden=true;home.inert=false;$('homeSettingsOpen').focus();
}
$('homeSettingsOpen').addEventListener('click',()=>{
  settingsFromHome=true;home.inert=true;backdrop.hidden=false;document.body.append(drawer);drawer.classList.add('home-drawer');drawer.querySelector('.drawer-head h2').textContent='设置';
  settingsNav.querySelectorAll('button').forEach((item,index)=>item.setAttribute('aria-current',String(index===0)));controlColumn.scrollTop=0;
  themeSelect.value=$('themeSelect').value;window.dispatchEvent(new Event('romm:open-settings'));
});
window.addEventListener('romm:settings-closed',restoreDrawer);
backdrop.addEventListener('click',()=>$('toolsClose').click());
drawer.addEventListener('keydown',event=>{
  if(!settingsFromHome || event.key!=='Tab')return;
  const focusable=[...drawer.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled)')].filter(node=>node.getClientRects().length);
  if(!focusable.length)return;
  if(event.shiftKey && document.activeElement===focusable[0]){event.preventDefault();focusable.at(-1).focus();}
  else if(!event.shiftKey && document.activeElement===focusable.at(-1)){event.preventDefault();focusable[0].focus();}
});
$('homeHelpOpen').addEventListener('click',()=>help.showModal());
$('homeHelpClose').addEventListener('click',()=>help.close());
$('homeDemo').addEventListener('click',()=>{openPractice();window.dispatchEvent(new Event('romm:home-demo'));});
$('homeResume').addEventListener('click',()=>openPractice());
$('homeOpen').addEventListener('click',()=>window.dispatchEvent(new Event('romm:show-home')));
$('homeHeroOpen').addEventListener('click',()=>openLibrary({groupId:heroIds[heroIndex]}));
$('homeExpand').addEventListener('click',()=>{expanded=!expanded;renderAlbums();});
window.addEventListener('romm:show-home',()=>{home.hidden=false;home.inert=false;gameFrame.inert=true;renderAlbums();$('homeResume').focus();});
window.addEventListener('romm:favorites-changed',renderAlbums);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)lastHeroInteraction=Date.now();});
setInterval(()=>{
  const hero=document.querySelector('.home-hero');
  if(!catalog || document.hidden || home.hidden || home.inert || help.open || hero.matches(':hover, :focus-within') || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || Date.now()-lastHeroInteraction<6000)return;
  heroIndex=(heroIndex+1)%heroIds.length;lastHeroInteraction=Date.now();renderHero();
},6000);
gameFrame.inert=true;

try {
  const response=await fetch('./data/catalog.json');if(!response.ok)throw Error('catalog');
  catalog=await response.json();renderFeatured();renderHero();renderAlbums();
} catch {featuredEl.replaceChildren(el('p','home-loading','曲目加载失败，请检查网络后刷新。'));renderAlbums();}
