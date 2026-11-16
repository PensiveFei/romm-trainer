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

export function neteaseSecureStream(id) {
  return `/api/netease/${id}`;
}
