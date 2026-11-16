// IDs and durations matched against HOYO-MiX official albums on NetEase Cloud Music.
// Only metadata is stored here; media is streamed by the provider.
const tracks = {
  '_GMusic144': [2014246626, 158000], // 行水盈盈 Serene and Fathomless
  '_GMusic145': [3341052371, 137636], // 九十八随眠观 Tales From the Ninety-Eight-Nights
  '_GMusic146': [2014256635, 106697], // 七域的蕖华 Lotus of Haftkarsvar
  '_GMusic147': [3341052375, 130069], // 五味交响 La complexe symphonie en cuisine
  '_GMusic148': [2666553230, 129030], // 秉烛贯夜 Non si levava ancor
  '_GMusic129': [3341052387, 206705], // 献向镜水的月光 Song to the Mirrored Moon
  '_GMusic120': [1817406371, 72500], // 童梦历险记 Where the Sunlight Flees
  '_GMusic121': [3341051490, 150177], // 完遂的美梦 Summa Perfectionis
  '_GMusic109': [3341052379, 108254], // 山椒与梭鱼之战 War With Pepper and Fish
  '_GMusic110': [3341052381, 156603], // 银雪与圣林的回舞 Lumipyhaemetsaen Polkka
  '_GMusic111': [3341052383, 132271], // 逝往苍焰 Entombed in Pale Fire
  '_GMusic112': [3341051486, 80470], // 巧思暇逸 Ingenious Trip
  '_GMusic113': [3341051488, 150983], // 热砂的倦戏 Machination of Mehenet
  '_GMusic114': [3341051489, 75199], // 互助方案！ For Your Cash Only
  '_GMusic80': [2666551257, 93063], // 曜间浮行 Interstellar Drift
  '_GMusic81': [3341051481, 127344], // 飒勇的豪斗 Valiant Duel
  '_GMusic82': [3341052372, 56498], // 健体之诲 Fitness Lesson
  '_GMusic83': [3341051482, 82815], // 祛疾的清风 Healing Breeze
  '_GMusic66': [2666551249, 132652], // 暖泉的遐仰 Hot Spring Affection
  '_GMusic67': [2666551251, 90003], // 极效方案 Note of Effective Settlements
  '_GMusic68': [2666551250, 74546], // 鼠兔之舞 Pirouette of Pika's Pike
  '_GMusic69': [2666553235, 140841], // 聚光之刻 Lights on Me
  '_GMusic70': [2666551254, 175808], // 调停的乐诗 Viajadora's Verse
  '_GMusic71': [2666553236, 84158], // 七帷的暮雨 Rain of Seven Curtains
  '_GMusic14': [1817410055, 107012], // 诗人的工作 Bard's Adventure
  '_GMusic5': [1817406380, 91499], // 真红骑士，出发！ Let's Go, Crimson Knight!
  '_GMusic9': [1817406390, 122864], // 白皑中的冥想 Contemplation in Snow
  '_GMusic23': [1817406377, 76000], // 夏宫灵囿 Sieh an, mein Sommernachtgarten!
  '_GMusic24': [1817406373, 61334], // 独家特调 Exclusive Specialty
  '_GMusic31': [1913532405, 107329], // 捷疾之业 Path of Yaksha
  '_GMusic32': [1817410057, 100519], // 麟跃幽岩 Qilin's Prance
  '_GMusic17': [1817410059, 108827], // 尘世闲游 Rex Incognito
  '_GMusic18': [1913532407, 92968], // 尽在吾辈 Any Last Words
  '_GMusic33': [2014246623, 78000], // 快意新词 Chapter of a New Era
  '_GMusic34': [2014246622, 157000], // 鹤鸣清唳 The Crane Cries
  '_GMusic3': [1913533270, 100980], // 荒波椛叶 Drifter's Destiny
  '_GMusic1': [1913532415, 99984], // 硝华流焰 Blossoms of Summer Night
  '_GMusic7': [1913532421, 155007], // 何妄何执 Termination of Desires
  '_GMusic2': [2014246618, 148000], // 高光时刻 Time to Shine
  '_GMusic39': [2014246624, 164587], // 天狐外道 Nothing but Trickery
  '_GMusic40': [2014247582, 83161], // 蹑风捕迹 Storm Chaser
  '_GMusic12': [2014256631, 71000], // 撷萃漫想 Caprice of the Leaves
  '_GMusic16': [2014247586, 141051], // 净善的遐歌 Surasthana Fantasia
  '_GMusic48': [2116865671, 172139], // 思接千载 Cogitation of Epochs
  '_GMusic49': [2014256633, 124000], // 缄秘的行律 Order of Silence
  '_GMusic50': [2116865669, 72604], // 旋蓝之舞 Whirling of Vairambhaka
  '_GMusic15': [2116862937, 115453], // 幻光漫戏 Lustrous Trick
  '_GMusic21': [2116862941, 158101], // 霜烈竞逐 Nippy Bout
  '_GMusic19': [2116862940, 179543], // 古海复涌之时 Parousia Diluvi
  '_GMusic20': [2116862943, 183098], // 邀欢同游 Se mettre sur son trente-et-un !
  '_GMusic57': [2666551240, 145432], // 船明伞彩 Largo alla donzella
  '_GMusic139': [2750878526, 171946], // 回家的路 The Long Way Home
  '_GMusic140': [2750877664, 171946], // The Long Way Home
  '_GMusic150': [3411268918, 115663], // 须臾的舒闲 Transient Tranquility
  '_GMusic151': [3411283513, 184789], // 寂夜月如锋 Selenic Ascension
  '_GMusic128': [3358787335, 162534], // 如生之不竭
  '_GMusic130': [3348141934, 173528], // 野马尘埃
  '_GMusic133': [3358806553, 269233], // 白鸽之诗
  '_GMusic135': [3411282706, 164864], // 西风之歌（合奏）
  '_GMusic136': [3358780008, 104060], // 柔月下的暗鸦
  '_GMusic137': [3358787319, 125532], // 枯叶飞旋
  '_GMusic138': [2756018761, 103223], // 晚祷的铃歌
  '_GMusic115': [2613484736, 90718], // 魔女的茶话会
  '_GMusic116': [3358779440, 119786], // 茶会之余
  '_GMusic118': [2613484756, 123904], // 星界的眷盼
  '_GMusic123': [2613484725, 94768], // 风轻云暖
  '_GMusic124': [2613484729, 96000], // 飞鼠进行曲
  '_GMusic103': [2756018746, 127262], // 船歌优稳
  '_GMusic105': [2756034903, 191140], // 永夜与破晓的誓刃
  '_GMusic106': [2756019215, 129253], // 新月的摇篮曲（其一）：伴月同眠
  '_GMusic107': [2756019206, 99184], // 闲饮酣适
  '_GMusic108': [2756036522, 126975], // 实力碾鸭！
  '_GMusic94': [2674775198, 131512], // 幽谷舟咏·其三
  '_GMusic95': [2147140935, 170855], // 烬火
  '_GMusic73': [2657687361, 104025], // 镜中日暖
  '_GMusic75': [2657687370, 108691], // 舒翼乘云
  '_GMusic79': [2657697281, 150090], // 奉炽火以希望
  '_GMusic64': [2635291858, 103884], // 逐火如弦
  '_GMusic62': [2635291845, 117715], // 紫锦草的闲息
  '_GMusic63': [2635291851, 117796], // 浪暖风柔
  '_GMusic72': [2635292816, 95090], // 游光逐虹
  '_GMusic26': [1481390532, 86986], // 有趣的挑战
  '_GMusic29': [1492276426, 117421], // 杯中明月
  '_GMusic45': [1992139167, 108213], // 喧繁之港
  '_GMusic51': [2041859189, 200515], // 三千娑世御咏歌
  '_GMusic58': [2156624907, 165797], // 终末的赦祷颂
  '_GMusic59': [2130084924, 105808], // 灾蚀的痕影
  '_GMusic60': [2100334024, 149520], // 轻涟
  '_GMusic86': [2631333977, 215493], // 经过（中）
  '_GMusic97': [2631336272, 217356], // 经过（日）
  '_GMusic98': [2631336273, 219721], // 经过（英）
  '_GMusic92': [2662252634, 177976], // 灼火之心（中）
  '_GMusic99': [2662252635, 177976], // 灼火之心（英）
  '_GMusic100': [2662251971, 177976], // 灼火之心（韩）
  '_GMusic101': [2662252636, 177976], // 灼火之心（日）
  '_GMusic127': [2756019200, 260318], // 挪德卡莱
  '_GMusic134': [3358807399, 252744], // 七见断灭智论抄
  '_GMusic117': [2737536430, 162018], // 囿于棋格中
  '_GMusic119': [1861579836, 295706], // 山巅雪国的记忆
  '_GMusic125': [2068982788, 123898], // 逸兴欢跃
  '_GMusic126': [1973619549, 234833], // 仲夏夜绮思
  '_GMusic104': [2756034905, 238400], // 苍银的圣咒
  '_GMusic85': [2160850755, 150842], // 未行之路
  '_GMusic88': [2666553227, 127729], // 天静先借风作籁
  '_GMusic89': [1913532413, 144001], // 风仪之舞
  '_GMusic90': [2116865672, 120474], // 骄阳炽燎
  '_GMusic91': [2666553231, 138379], // 海露欢游
  '_GMusic93': [3341051484, 144174], // 伫立而待
  '_GMusic87': [1833805540, 77958], // 皎洁的笑颜
  '_GMusic96': [1973626814, 165918], // 纯真的歌谣
  '_GMusic76': [2699945643, 116639], // 饫沃坡野
  '_GMusic74': [2657683858, 132959], // 夜诞的花冠
  '_GMusic77': [2699945647, 100684], // 勤倦之畛
  '_GMusic78': [2699954432, 277851], // 受龙所选的试炼
  '_GMusic84': [2699953016, 231233], // 炽烈的还魂诗·再现
  '_GMusic61': [2635292773, 284768], // 纳塔
  '_GMusic65': [2635292813, 258663], // 预见的征程
  '_GMusic22': [1481392262, 108274], // 蒙德城繁忙的午后
  '_GMusic27': [1481390929, 194514], // 光辉的涨落
  '_GMusic10': [1913532410, 109499], // 浪沫起舞
  '_GMusic25': [1481392864, 291000], // 冰封交响曲
  '_GMusic11': [1455706968, 208000], // 终天的闭幕曲
  '_GMusic8': [1983465848, 201204], // 风花的邀约
  '_GMusic28': [1492276411, 276250], // 璃月
  '_GMusic30': [1492283139, 259588], // 疾如猛火
  '_GMusic6': [1861578703, 210610], // 岩壑之崩
  '_GMusic35': [1861578697, 164100], // 斩破风暴的魔鲸
  '_GMusic36': [1910911958, 160940], // 神女劈观·唤情
  '_GMusic37': [1879098378, 329773], // 稻妻
  '_GMusic38': [1879108765, 248040], // 斩雾破竹
  '_GMusic4': [1913533272, 61985], // 赤胆昭忠
  '_GMusic41': [1937114528, 245186], // 背水一战
  '_GMusic42': [1937114513, 182628], // 燃烬之舞
  '_GMusic43': [1937111527, 208597], // 稻光神鸣
  '_GMusic44': [1992141905, 285160], // 须弥
  '_GMusic46': [1992344607, 245373], // 流金疾驰
  '_GMusic47': [1992343574, 108106], // 绿野纤绵的曲调
  '_GMusic13': [2014256630, 128000], // 绰巡林风
  '_GMusic52': [2041859190, 218190], // 噬神巨蛇的狂舞
  '_GMusic53': [2085833516, 273360], // 枫丹
  '_GMusic54': [2085836773, 239440], // 花与剑的轮舞
  '_GMusic55': [2085833561, 239762], // 咏歌与凯旋
  '_GMusic56': [2666551244, 160541], // 未始的供献颂
};

export function neteaseTrack(song) {
  const track = Object.hasOwn(tracks, song?.id) ? tracks[song.id] : null;
  return track ? {id: track[0], durationSeconds: track[1] / 1000} : null;
}

export function isNeteaseTrackId(id) {
  return Number.isSafeInteger(id) && Object.values(tracks).some(track => track[0] === id);
}

export function neteasePage(id) {
  return `https://music.163.com/#/song?id=${id}`;
}

export function neteaseStream(id) {
  return `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
}

// Public Meting endpoint for personal websites, returning the provider's HTTPS
// stream. The service can be unavailable, so the player also tries NetEase.
export function neteaseMetingStream(id) {
  return `https://met.liiiu.cn/meting/api?server=netease&type=url&id=${id}&br=128`;
}

export function neteaseSecureStream(id) {
  return `/api/netease/${id}`;
}
