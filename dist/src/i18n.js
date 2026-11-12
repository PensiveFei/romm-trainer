import { japanese, japanesePatterns } from './ja.js';

const STORAGE_KEY = 'romm-trainer-language';
let language = 'zh-CN';
try { const saved=globalThis.localStorage?.getItem(STORAGE_KEY); if (saved === 'en' || saved === 'ja') language = saved; } catch { /* Storage is optional. */ }

// The Chinese interface is the source of truth. Keep the original DOM text so
// switching languages never replaces interactive children or user content.
const translations = {
  '后退 10 秒':'Back 10 seconds', '前进 10 秒':'Forward 10 seconds', '设置练习区间':'Set practice section',
  '当前位置设为 A':'Set A to current time', '当前位置设为 B':'Set B to current time', '恢复全曲':'Use full song',
  '查看上一轮成绩':'View last result', '成绩':'Results', '示范节拍':'Demo metronome', '节拍伴奏 · 无原曲':'Metronome · No song',
  '在线原声 · 加载中':'Online audio · Loading', '本地音频 · 加载中':'Local audio · Loading', '本地音频不可用':'Local audio unavailable', '按键音量':'Key sound volume',
  '练习结果':'Practice Result', '关闭成绩':'Close result', '最高连击':'Max Combo', '谱面状态':'Chart status',
  '全部状态':'All statuses', '可练习':'Playable', '谱面待核对':'Needs review', '暂缺谱面':'Unavailable',
  '千音习谱':'ROMM Trainer', '练习模式':'Practice Mode', '开始练习':'Start Practice', '继续练习':'Resume Practice',
  '取消倒计时':'Cancel Countdown', '正在连接…':'Connecting…', '暂停':'Pause', '再练一次':'Practice Again',
  '重新开始':'Restart', '回到片段起点':'Return to the start of the section', '播放进度':'Playback progress',
  '拖动调整进度；左右方向键快退或快进 10 秒':'Drag to seek; use the arrow keys to skip 10 seconds',
  '首页':'Home', '全部曲目':'All Songs', '曲谱与练习设置':'Charts and practice settings', '曲谱与设置':'Charts & Settings',
  '谱面练习':'Chart practice', '节拍练习 · 六键':'Rhythm Practice · 6 Keys', '原创示范谱':'Original demo chart',
  '六键':'6 Keys', '谱面主题':'Stage Theme', '基础主题':'Default', '风与自由':'Wind and Freedom',
  '岩与契约':'Stone and Contracts', '雷与永恒':'Lightning and Eternity', '水与正义':'Water and Justice',
  '火与战争':'Fire and War', '草与智慧':'Grass and Wisdom', '静思浮梦':'Dreams of Contemplation', '霜月的祷言':'Prayer of the Frostmoon',
  '六轨音符练习区':'Six-lane practice area', '当前练习区间演奏完成度':'Completion of the current practice section',
  '按当前练习区间的满分计算':'Based on the maximum score for this practice section', '演奏完成度':'Completion',
  '连击':'Combo', '垂直模式':'Vertical Mode', '准备演奏':'Ready to play', '点击上方播放键开始练习':'Press play above to start practicing',
  '触屏演奏区':'Touch controls', 'Space 暂停 / 继续':'Space: Pause / Resume', '手动练习 · 非官方项目':'Manual practice · Unofficial project',
  '在线音源':'Online Audio', '官方原声专辑 · 《净善的遐歌》':'Official soundtrack · Surasthana Fantasia',
  '使用上方练习按钮控制播放。网络与地区可能影响加载；原声和游戏剪辑的同步仍需校准。':'Use the practice button above to control playback. Availability depends on your network and region; soundtrack synchronization may need adjustment.',
  '在 YouTube 查看原声 ↗':'Open soundtrack on YouTube ↗', '命中':'Hits', '偏早 / 偏晚':'Early / Late', '漏击':'Miss',
  '判定规则尚未与游戏逐项校准':'Judgment settings are still being calibrated against the game',
  '关闭设置':'Close settings', '曲谱信息':'Chart Information', '示范谱':'Demo Chart', '谱面':'Chart', '节拍':'Tempo',
  '曲谱与音频':'Charts & Audio', '浏览全部曲目':'Browse All Songs', '净善的遐歌 · 传说':'Surasthana Fantasia · Legendary',
  '导入谱面':'Import Chart', '选择本地音频':'Choose Local Audio', '恢复示范':'Restore Demo', '伴奏选择':'Accompaniment',
  '官方在线原声':'Official Online Audio', '节拍伴奏':'Metronome', '在线原声加载中…':'Loading online audio…',
  '将所选本地音频保存在本设备':'Save selected local audio on this device', '音频仅保存在当前浏览器，不会上传。':'Audio stays in this browser and is never uploaded.',
  '删除此曲目的本地音频':'Delete saved audio for this song', '音源起点':'Audio Start', '秒':'sec',
  '调整原声或本地音频的起点，使其与谱面配合；节拍伴奏无需调整。':'Adjust the audio start to synchronize it with the chart. The metronome does not need adjustment.',
  '独立手动练习原型':'Standalone manual practice prototype', '非官方项目':'Unofficial project', '练习设置':'Practice Settings',
  '练习控制':'Practice Controls', '片段练习':'Section Practice', '起点':'Start', '终点':'End', '练习起点':'Practice start',
  '练习终点':'Practice end', '区间循环':'Loop Section', '重复练习选定的片段':'Repeat the selected section', '循环练习':'Loop practice',
  '演奏设置':'Performance Settings', '播放速度':'Playback Speed', '音符流速':'Note Speed', '音符下落速度':'Note speed',
  '判定范围':'Judgment Window', '判定范围（毫秒）':'Judgment window (milliseconds)', '前后容许时间，调大更宽松':'Larger windows allow more timing leniency',
  '时间偏移':'Timing Offset', '正值使判定稍后':'Positive values delay judgment', '时间偏移（毫秒）':'Timing offset (milliseconds)',
  '键位设置':'Key Bindings', '点击键位，再按下新的按键':'Select a lane, then press a new key',
  '千音习谱首页':'ROMM Trainer home', '首页工具':'Home tools', '打开 GitHub 项目':'Open the GitHub project',
  '使用帮助':'Help', '返回练习':'Return to practice', '推荐练习与专辑':'Featured practice and albums', '自由练习':'Free Practice',
  '从示范谱开始':'Start with a demo chart', '精选曲目':'Featured Songs', '手动练习':'Manual Practice', '正在整理曲目…':'Loading songs…',
  '查看专辑':'View album', '专辑精选':'Featured Album', '浏览专辑   ›':'Browse album   ›', '切换精选专辑':'Choose a featured album',
  '专辑列表':'Albums', '正在加载专辑…':'Loading albums…',
  '© 米哈游版权所有，其他内容权利归各自所有者':'© miHoYo. Other content belongs to its respective owners.',
  '千音习谱 · 项目说明':'ROMM Trainer · About', '关闭说明':'Close about', '【介绍】':'Introduction', '【声明】':'Disclaimer',
  '【问题反馈】':'Feedback', '千音习谱是为':'Qianyin Xipu is a practice tool for ', '《原神》':'Genshin Impact',
  '千音雅集制作的“练习模式”，旨在为玩家提供专业练谱工具。':'’s Repertoire of Myriad Melodies, designed to help players practice charts.',
  '本项目无盈利，非外挂、非自动演奏工具，纯粹出于热爱。':'This is a non-profit fan project. It is not a cheat or an auto-playing tool.',
  '本项目为非官方作品，与米哈游、HoYoverse 及':'This unofficial project is not affiliated with miHoYo, HoYoverse, or ',
  '官方无隶属关系。':'.', '遇到问题或有建议，欢迎前往':'For questions or suggestions, visit ', '反馈。':'.',
  '在线原声与游戏内剪辑的同步仍需校准。':'Synchronization between online audio and in-game edits may need adjustment.',
  '选择练习曲目':'Choose a song to practice', '全部歌曲':'All Songs', '曲目典藏':'Music Collection', '♫  曲目典藏':'♫  Music Collection', '曲目分类':'Album groups',
  '正在打开曲目典藏…':'Opening the music collection…', '选择一首曲目':'Choose a song', '查看谱面与练习信息':'View chart and practice information',
  '搜索歌曲名称':'Search songs', '✦  手动练习 · 谱面与音源同步持续校准':'✦  Manual practice · Audio synchronization is being calibrated',
  '收藏所选曲目':'Add selected song to favorites', '前往练习':'Practice',
  '设置':'Settings', '演奏界面':'Performance', '设置分类':'Settings categories', '基础':'General', '键位':'Keys',
  '已取消修改':'Change canceled', '请按下新的字母或数字键':'Press a letter or number key', '请使用字母或数字键':'Use a letter or number key',
  '这个按键已分配给其他轨道':'That key is already assigned to another lane', '键位已保存':'Key binding saved',
  '本地谱面':'Local chart', '自由节奏':'Free tempo', '本地谱':'Local chart', '在线原声 · 同步待校准':'Online audio · Synchronization may need adjustment',
  '节拍伴奏 · 无歌曲原声':'Metronome · No original soundtrack', '本地音频':'Local audio',
  '准确':'Precise', '未命中':'Miss', '长按提前松开':'Hold released early',
  '音源尚未就绪，暂时无法调整进度。':'Audio is not ready; seeking is unavailable.', '当前音源暂时无法跳转，请稍后重试。':'Unable to seek this audio. Please try again.',
  '在线音源尚未就绪，可稍后重试或切换节拍伴奏。':'Online audio is not ready. Try again later or switch to the metronome.',
  '请先选择与当前谱面配套的本地音频。':'Choose local audio for this chart first.',
  '音频从所选起点开始的剩余时长不足，请调整音源起点或更换音频。':'The audio is too short from the chosen start point. Adjust the start or choose another file.',
  '正在加载官方在线音源，首次播放可能需要一些时间。':'Loading the official online audio. The first play may take a while.',
  '在线原声已开始；如有错位，请在设置中调整音源起点。':'Online audio is playing. Adjust the audio start in settings if it is out of sync.',
  '在线原声播放失败，已切换节拍伴奏；可选择本地音频随原曲练习。':'Online audio failed; switched to the metronome. You can choose a local audio file.',
  '音频无法播放，请检查本地音频文件或浏览器设置。':'Unable to play audio. Check the local file or browser settings.',
  '请点击继续练习。':'Press Resume Practice to continue.', '音频短于谱面时长，请选择完整配套音频。':'The audio is shorter than the chart. Choose a complete audio file.',
  '本地音频已就绪，可以开始练习。':'Local audio is ready. You can start practicing.', '无法读取音频，请尝试浏览器支持的格式。':'Unable to read audio. Try a format supported by your browser.',
  '已恢复原创示范谱与节拍伴奏。':'Restored the demo chart and metronome.', '谱面文件未能加载':'Could not load the chart file',
  '已载入本设备保存的音频，可以直接练习。':'Loaded audio saved on this device. You can start practicing.', '请重试':'Please try again',
  '在线播放器已暂停，请使用上方按钮继续。':'The online player is paused. Use the button above to resume.', '在线原声不可用':'Online audio is unavailable',
  '正在准备官方在线音源，也可在设置中选择节拍伴奏。':'Preparing online audio. You can also select the metronome in settings.',
  '在线音源连接超时':'Online audio connection timed out', '谱面已就绪。在线原声与游戏剪辑的对应仍需校准。':'Chart ready. Online audio synchronization may need adjustment.',
  '在线原声暂不可用，已切换节拍伴奏；可选择本地音频随原曲练习。':'Online audio is unavailable; switched to the metronome. You can choose a local audio file.',
  '已切换为节拍伴奏，可以直接练习；此伴奏不包含歌曲原声。':'Switched to the metronome. It does not include the original soundtrack.',
  '谱面文件不能超过 1 MB。':'Chart files must not exceed 1 MB.', '已载入本地谱面，请选择它的配套音频。':'Local chart loaded. Choose its matching audio file.',
  '文件无效':'Invalid file', '已回到片段起点。':'Returned to the start of the section.',
  '音频短于谱面，未保存到本设备。':'The audio is shorter than the chart and was not saved.', '本次可播放，但未能保存到本设备。':'Audio can be played now, but could not be saved.',
  '音频无法读取，未保存到本设备。':'Unable to read audio; it was not saved.', '正在读取本地音频…':'Reading local audio…',
  '已删除保存的音频；当前已载入的音频仍可播放。':'Saved audio deleted. The currently loaded audio can still be played.',
  '未能删除本地音频，请稍后重试。':'Could not delete saved audio. Please try again.', '窗口失去焦点，练习已暂停。':'Practice paused because the window lost focus.',
  '练习区间至少需要 1 秒。':'The practice section must be at least 1 second long.',
  '区间边界切到了长按音符，请向前或向后调整。':'A section boundary cuts through a hold note. Adjust the boundary.', '这个区间没有可练习的音符。':'There are no playable notes in this section.',
  '谱面版本应为 1。':'Chart version must be 1.', '当前版本仅支持六键谱面。':'Only six-key charts are supported.',
  '谱面时长须为 4 秒至 5 分钟。':'Chart duration must be between 4 seconds and 5 minutes.', '谱面需包含 1 至 5000 个音符。':'A chart must contain 1 to 5,000 notes.',
  '谱面需要标题。':'A chart needs a title.', '同一轨道的音符不能在同一时刻出现或与长按重叠。':'Notes on the same lane cannot overlap.',
  '变速信息无效。':'Invalid tempo map.', '变速信息的时间或速度无效。':'Invalid time or tempo in the tempo map.', '节拍信息无效。':'Invalid beat information.'
};

const groupNames = {
  Encounter2:'Encounters · A Moment on a Long Journey', NodKrai3:'Nod-Krai · Garden of Anticipation',
  Magic:'Magic · A Fantastical Symphony', NodKrai2:'Nod-Krai · Gateway to a Borderland Paradise',
  NodKrai1:'Encounters · Memories of a Long Journey', Natlan2:'Natlan · Fields of Falling Fire',
  Natlan:'Natlan · Plains of Contending Flames', Mondstadt:'Mondstadt · City of Wind and Song',
  Liyue:'Liyue · Dreams Beneath the Jade Moon', Inazuma:'Inazuma · Land of Tranquility and Eternity',
  Sumeru:'Sumeru · Forest of Wisdom', Fontaine:'Fontaine · Fountain of Lucent Dew'
};

export function getLanguage() { return language; }
// Production modules carry the build hash; reuse it for the cached catalog.
export function catalogUrl() {
  const moduleUrl=new URL(import.meta.url), url=new URL('../data/catalog.json',moduleUrl);
  url.search=moduleUrl.search;
  return url;
}
export function tr(zh, en, ja) {
  if (language === 'en') return en;
  if (language === 'ja') {
    if (ja !== undefined) return ja;
    if (typeof zh === 'string') {
      const translated=translate(zh);
      if (translated !== zh || Object.hasOwn(japanese, zh)) return translated;
    }
    return en;
  }
  return zh;
}
export function songName(song) { return tr(song.title, song.titleEn || song.title, song.titleJa || song.titleEn || song.title); }
export function groupName(group) { return tr(group.title.replace('·', ' · '), groupNames[group.id] || group.title.replace('·', ' · '), group.titleJa || groupNames[group.id] || group.title.replace('·', ' · ')); }
export function songMatches(song, query) {
  const normalize=value=>String(value || '').normalize('NFKC').toLocaleLowerCase().replace(/[\u30a1-\u30f6]/g,char=>String.fromCharCode(char.charCodeAt(0)-0x60));
  const term=normalize(query.trim());
  return !term || [song.title,song.titleEn,song.titleJa,song.titleKana].some(value=>normalize(value).includes(term));
}

export function translate(value) {
  if (language === 'zh-CN' || typeof value !== 'string') return value;
  const dictionary=language === 'ja' ? japanese : translations;
  if (Object.hasOwn(dictionary, value)) return dictionary[value];
  const patterns=language === 'ja' ? japanesePatterns : dynamicTranslations;
  for (const [pattern, render] of patterns) { const match=value.match(pattern); if (match) return render(...match, translate); }
  return value;
}

const dynamicTranslations = [
    [/^第 (\d+) 轨，按键 (.+)$/, (_, n, key) => `Lane ${n}, key ${key}`],
    [/^第 (\d+) 轨$/, (_, n) => `Lane ${n}`],
    [/^传说 · (.+) 星$/, (_, n) => `Legendary · ${n} stars`],
    [/^已跳转至 (.+)；本轮完成度从当前位置重新计算。$/, (_, time) => `Seeked to ${time}; completion starts from this position.`],
    [/^上一轮：完成度 (.+)%，命中 (.+) \/ (.+)。继续练习。$/, (_, score, hits, total) => `Last round: ${score}% complete, ${hits} / ${total} hits. Keep practicing.`],
    [/^本段练习完成：完成度 (.+)%，命中 (.+) \/ (.+)。$/, (_, score, hits, total) => `Practice complete: ${score}% complete, ${hits} / ${total} hits.`],
    [/^练习区间 (.+)$/, (_, range) => `Practice section ${range}`],
    [/^判定范围已调整为前后 (.+) ms，已回到片段起点。$/, (_, n) => `Judgment window set to ±${n} ms. Returned to the section start.`],
    [/^时间偏移已设置为 (.+) ms。正值使判定稍后。$/, (_, n) => `Timing offset set to ${n} ms. Positive values delay judgment.`],
    [/^音源起点已调整为 (.+) 秒，谱面已回到片段起点。$/, (_, n) => `Audio start set to ${n} seconds. Returned to the section start.`],
    [/^已载入本设备保存的音频：(.+)$/, (_, name) => `Loaded saved audio: ${name === '本地音频' ? translate(name) : name}`],
    [/^已保存在本设备：(.+)$/, (_, name) => `Saved on this device: ${name}`],
    [/^第 (\d+) 个音符的时间、轨道或时长无效。$/, (_, n) => `Note ${n} has an invalid time, lane, or duration.`],
    [/^未命中 · (过早|过晚) (\d+) ms$/, (_, kind, n) => `Miss · ${kind === '过早' ? 'too early' : 'too late'} ${n} ms`],
    [/^(偏早|偏晚) (\d+) ms$/, (_, kind, n) => `${kind === '偏早' ? 'Early' : 'Late'} ${n} ms`],
    [/^曲谱加载失败：(.+)$/, (_, reason) => `Chart loading failed: ${translate(reason)}`],
    [/^谱面导入失败：(.+)$/, (_, reason) => `Chart import failed: ${translate(reason)}`],
    [/^在线音源不可用（播放器错误 (\d+)）$/, (_, code) => `Online audio unavailable (player error ${code})`],
    [/^(.+)，已切换节拍伴奏；可选择本地音频随原曲练习。$/, (_, reason) => `${translate(reason)}; switched to the metronome. You can choose a local audio file.`]
];

const originalText = new WeakMap(), originalAttributes = new WeakMap();
export function translateDocument(doc = globalThis.document) {
  if (!doc?.body || !doc.createTreeWalker) return;
  if (doc.documentElement) doc.documentElement.lang = language;
  doc.title=tr('千音习谱 | ROMM-Trainer','ROMM Trainer | Repertoire of Myriad Melodies','千音習譜 | ROMM-Trainer');
  const walker=doc.createTreeWalker(doc.body, 4);
  while (walker.nextNode()) {
    const node=walker.currentNode;
    if (node.parentElement?.closest('script, style')) continue;
    let original=originalText.get(node);
    if (original === undefined) {
      const text=node.nodeValue, trimmed=text.trim();
      if (!Object.hasOwn(translations, trimmed) && !Object.hasOwn(japanese, trimmed)) continue;
      original=text; originalText.set(node, original);
    }
    const trimmed=original.trim();
    node.nodeValue=language === 'zh-CN' ? original : original.replace(trimmed, translate(trimmed));
  }
  for (const node of doc.querySelectorAll('[aria-label], [title], [placeholder]')) {
    let originals=originalAttributes.get(node);
    for (const name of ['aria-label','title','placeholder']) {
      if (!node.hasAttribute(name)) continue;
      const value=node.getAttribute(name);
      const original=originals?.[name] ?? value;
      if (!Object.hasOwn(translations, original) && !Object.hasOwn(japanese, original) && !/^第 \d+ 轨$/.test(original)) continue;
      if (!originals) { originals={}; originalAttributes.set(node,originals); }
      originals[name]=original;
      node.setAttribute(name,translate(original));
    }
  }
}

export function setLanguage(value) {
  language=value === 'en' || value === 'ja' ? value : 'zh-CN';
  try { globalThis.localStorage?.setItem(STORAGE_KEY, language); } catch { /* Session-only preference. */ }
  translateDocument();
  globalThis.window?.dispatchEvent?.(new Event('romm:language-changed'));
}

export function initLanguage() {
  translateDocument();
  const select=globalThis.document?.getElementById('languageSelect');
  if (select) { select.value=language; select.addEventListener('change',()=>setLanguage(select.value)); }
}
