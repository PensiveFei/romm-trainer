# 千音习谱 | ROMM-Trainer

Repertoire of Myriad Melodies Trainer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Website](https://img.shields.io/badge/website-qianyin.fun-2ea44f.svg?style=flat-square)](https://qianyin.fun/)
[![Deployed on Cloudflare Pages](https://img.shields.io/badge/deployed%20on-Cloudflare%20Pages-f38020.svg?style=flat-square&logo=cloudflare&logoColor=white)](https://qianyin.fun/)

在线体验 / Play online: [qianyin.fun](https://qianyin.fun/)

## 项目介绍

千音习谱是为《原神》千音雅集制作的“练习模式”，旨在为玩家提供专业练谱工具。

## Project Introduction

Qianyin Xipu is a “Practice Mode” made for Genshin Impact’s Repertoire of Myriad Melodies, aiming to provide players with a professional score-practice tool.

## 演示视频 | Demo Video

[![千音习谱演示视频](https://qianyin.fun/demo/qianyin-demo-v2-poster.jpg)](https://qianyin.fun/demo/qianyin-demo-v2.mp4)

<p align="center">
  <img src="docs/screenshots/library.webp" width="49%" alt="曲目典藏：150 首曲目与难度选择">
  <img src="docs/screenshots/practice.webp" width="49%" alt="练习界面：六轨谱面、完成度与判定反馈">
</p>

## 核心功能

- **手动练习**：PC 使用六键键盘，手机可使用六轨触屏，支持单点、同时按和长按。
- **界面语言**：在设置中切换简体中文、English 和日本語，选择保存在当前浏览器。
- **开始倒计时**：开始或继续练习前显示 3 秒倒计时，可随时取消。
- **背景音乐**：首页和曲库播放《梦之咏叹》的[原神官方音源](https://www.bilibili.com/audio/au1659248)，可在顶部关闭、在设置中调节音量；进入练习或试听其他曲目时暂停。浏览器限制自动播放时，点击音乐按钮即可尝试播放。
- **片段循环**：设置 A–B 练习区间，循环默认关闭，可手动开启；每轮开始前保留一小段引导时间。
- **进度跳转**：拖动顶部进度条，或使用左右方向键、手机快捷按钮快退或快进 10 秒；手机也可从当前位置设置 A、B 点。跳转后本轮完成度从当前位置重新计算。
- **练习设置**：调整音乐播放速度、音符下落速度、判定范围、时间偏移和按键音量。手动按键时可听到合成琴音，音量设为零即可关闭。
- **谱面主题**：切换八种主题，各有独立的背景、音符与手动命中特效；选择会保存在本机。
- **练习反馈**：查看实时完成度、命中、连击、漏击及偏早或偏晚；完成一轮后查看结果，同一谱面版本、区间和设置的最佳成绩保存在当前浏览器。
- **首页与收藏**：从精选曲目或专辑进入练习，在曲目详情中收藏歌曲；收藏仅保存在当前浏览器中。
- **本地谱面**：提供原创示范谱，也可导入自行准备的 JSON 谱面和配套音频。
- **曲目典藏**：按专辑和谱面状态筛选，或使用中、英、日文曲名及日语假名搜索 150 首曲目；其中 128 首提供通过结构检查的传说难度六轨试验谱，另外 22 首暂待补充或核对。
- **伴奏选择**：练习画面显示当前音源状态。部分曲目提供官方在线原声入口；在线音源不可用时自动切换节拍伴奏。也可选择本地配套音频并保存在当前设备，下次选曲自动载入；本项目不会上传音频。节拍伴奏不包含歌曲原声，在线原声与游戏内剪辑的同步仍待逐首校准。

## Core Features

- **Manual practice**: Use six keyboard lanes on PC or touch the lanes on mobile, including taps, simultaneous notes, and holds.
- **Interface language**: Switch between Simplified Chinese, English, and Japanese in settings; the choice is saved in your browser.
- **Countdown**: A cancellable three-second countdown precedes starting or resuming practice.
- **Background music**: The home screen and library play the [official Dream Aria recording](https://www.bilibili.com/audio/au1659248). Use the top music button to turn it off and settings to adjust its volume; it pauses during practice and song previews. If autoplay is blocked, click the music button to start it.
- **Section looping**: Select an A–B section and optionally repeat it with a short lead-in before each attempt. Looping is off by default.
- **Seeking**: Drag the timeline or use the arrow keys or mobile buttons to seek by ten seconds. Mobile controls can also set A and B from the current position; seeking restarts scoring from that position.
- **Practice settings**: Adjust playback rate, note scroll speed, hit window, timing offset, and key sound volume. Manual presses play a synthesized pluck; set the volume to zero to mute it.
- **Score themes**: Choose from eight themes with distinct scenery, notes and manual hit effects; your choice is saved locally.
- **Practice feedback**: See live completion, hits, combo, misses, and early or late timing, then review each finished attempt. Personal bests are saved in the current browser separately for each chart version, section, and set of practice settings.
- **Home and favorites**: Start from featured songs or albums and save favorite songs in the current browser.
- **Local charts**: Try an original sample chart or import your own JSON chart and matching audio.
- **Song library**: Browse by album, filter by chart status, or search 150 titles by their Chinese, English, Japanese, or Japanese kana names, with 128 structurally checked six-lane Legendary trial charts. The remaining 22 need further source data or review.
- **Accompaniment**: The practice screen shows the current audio source. Some songs link to an official online soundtrack; unavailable online audio falls back to a metronome. User-selected local audio can be saved in the current browser and loaded again for that song without uploading it. The metronome does not contain the soundtrack; alignment with each in-game edit remains provisional.

## 声明

本项目无盈利，非外挂、非自动演奏工具，纯粹出于热爱。

本项目为非官方作品，与米哈游、HoYoverse 及《原神》官方无隶属关系。

## Statement

This project is non-profit. It is not a cheat or an auto-playing tool—purely out of love.

This is an unofficial fan project and is not affiliated with miHoYo, HoYoverse, or Genshin Impact.

## License

[MIT License](LICENSE)

## 运行 | Getting Started

需要 Node.js 20 或更高版本，无需安装第三方依赖。运行以下命令后，用 PC 浏览器打开终端中显示的地址：

Node.js 20 or later is required. No third-party dependencies need to be installed. Run the following command and open the displayed address in a desktop browser:

```sh
npm start
```

运行核心判定测试 / Run the core judgement tests:

```sh
npm test
```

默认键位为 A、S、D、J、K、L；空格键用于暂停或继续。首页可浏览专辑、打开收藏和调整练习设置；在曲目详情下方点击星标即可收藏。练习页的「曲谱与设置」可导入文件并调整练习区间。

Default keys: A, S, D, J, K, L. Press Space to pause or resume. Open “Charts & Settings” at the top right to import files and adjust the practice section or key bindings. Choose a language under “语言 / Language” in settings.

## 部署 | Deployment

正式站点 <https://qianyin.fun> 以静态文件形式托管在 Cloudflare Pages，域名的 DNS 与证书由同一账号下的 Cloudflare Zone 管理。

The production site is served as static files by Cloudflare Pages; DNS and TLS are handled by the Cloudflare Zone for the same domain.

| 配置项 / Setting | 值 / Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `build` |

`npm run build` 会把 `dist/` 复制到 `build/`，叠加 `deploy/` 下的 `_headers` 与 `404.html`，并根据脚本、样式和曲库目录的内容生成版本号。这一步用于避免缓存导致页面、脚本与曲库数据错配。

`npm run build` copies `dist/` into `build/`, adds `_headers` and `404.html` from `deploy/`, and generates a version from the scripts, styles, and song catalog. The version keeps cached pages, code, and catalog data in sync.

推送到 `main` 后由 Cloudflare Pages 自动构建发布；`qianyin.pages.dev` 同时可用。Pushes to `main` are built and published automatically; `qianyin.pages.dev` stays available as well.

## 曲目典藏 | Song Library

曲目与试验谱依据[千音雅集乐谱仓库](https://md-ndv356.github.io/genshin-rmm/zh_cn/)的公开资料转换；当前仅开放传说难度。通过结构检查不等于已经与游戏逐音核对，包含变速的谱面及音源同步尤其需要继续验证。22 首未开放的曲目会在列表中显示状态，其中已找到官方原声入口的歌曲可以单独试听。部分游戏封面素材来自 [Genshin Impact Wiki](https://genshin-impact.fandom.com/wiki/Repertoire_of_Myriad_Melodies) 和[公开专辑图集](https://www.reddit.com/r/Genshin_Impact_Leaks/comments/1wo8uxn/72_rhythm_game_new_album_arts_new_nilou/)。个别曲目使用其[原声专辑图](https://open.spotify.com/embed/album/1FkxT3cP2litsldCdvWIM8)作为替代，并在界面标明。

The trial charts are converted from the public [score repository](https://md-ndv356.github.io/genshin-rmm/en_us/); only Legendary difficulty is currently available. Structural checks do not establish note-by-note parity with the game. Variable-tempo charts and synchronization still need verification. Some cover images are sourced from the [Genshin Impact Wiki](https://genshin-impact.fandom.com/wiki/Repertoire_of_Myriad_Melodies) and a [public album art gallery](https://www.reddit.com/r/Genshin_Impact_Leaks/comments/1wo8uxn/72_rhythm_game_new_album_arts_new_nilou/); songs without an identified cover use a placeholder.

## 《净善的遐歌》试练 | Surasthana Fantasia Trial

打开「曲谱与设置」，选择「净善的遐歌 · 传说」即可载入 168 BPM、231 音符的六轨谱面。谱面依据[千音雅集乐谱仓库](https://md-ndv356.github.io/genshin-rmm/zh_cn/_GMusic16/legend/)的公开资料转换，包含单音和长音。

默认尝试通过 YouTube 官方播放器播放《原神》[闪耀的群星 3 原声专辑](https://www.youtube.com/watch?v=2SvpviExw1o&t=2582s)，曲目从专辑约 43:02 开始。网络、地区和播放器策略可能影响播放。该专辑版长于游戏内的 1 分 35 秒版本，目前尚未确认剪辑是否完全一致；可在设置中调整「音源起点」，但不能保证整首歌自动对齐。也可选择不含歌曲的 168 BPM 节拍伴奏，或选择自己准备的配套本地音频。

The chart is adapted from the public [score database](https://md-ndv356.github.io/genshin-rmm/en_us/_GMusic16/legend/). The default online source uses the official album video, which is longer than the in-game edit; full-song synchronization is not yet verified. Availability depends on the network and region. A metronome and a user-provided local audio file are available as alternatives.

歌曲、原声及相关游戏内容的权利归其各自权利人所有；项目的 MIT 许可不授予这些第三方内容的权利。Song, soundtrack, and game-content rights remain with their respective owners; the project's MIT license does not grant rights to third-party content.

## 判定范围 | Hit Window

默认接受音符前后 180 毫秒内的按键，可在「曲谱与设置」中调整为前后 120–240 毫秒；准确判定仍使用前后 55 毫秒。长音在结束前的同一范围内松开仍可完成。超出范围的按键会显示未命中和附近音符的偏早或偏晚时间，不会额外增加漏击次数。调整范围会从当前片段起点重新练习，设置保存在本机。

The default hit window is ±180 ms and can be adjusted from ±120 to ±240 ms in the settings. The precise window remains ±55 ms, and holds can be released within the same window before their end. Inputs outside the window receive feedback without adding an extra miss. Changing the window restarts the current section, and the setting is stored locally.

## 演奏完成度 | Performance Completion

完成度以当前 A–B 练习区间的可得满分为 100%。本工具暂按以下规则估算：单音或长音开头准确命中得 20 分、普通命中得 10 分；长音按住时，每一拍累计 5 分。提前松开长音时，保留已经获得的分数；谱面未提供 BPM 时按 120 BPM 计算。完成度与播放进度分别显示，每轮循环重新计算。这套练习计分尚未与游戏逐项校准。

Completion is measured against the maximum possible score in the selected A–B section. In this trainer's provisional model, a precise tap or hold head earns 20 points and a good one earns 10; a held note earns 5 points per beat while held. Early release keeps already earned points. Charts without BPM use 120 BPM. Completion is separate from playback progress and resets on each loop. The scoring model has not been calibrated against the game.

## 本地谱面格式 | Local Chart Format

谱面为 UTF-8 JSON，时间单位是毫秒，六个轨道的编号为 0–5。导入谱面后，需选择自行准备的配套音频。

Charts use UTF-8 JSON. Times are in milliseconds and the six lanes are numbered 0–5. After importing a chart, select its matching audio file.

```json
{
  "version": 1,
  "title": "练习段落",
  "artist": "谱面作者",
  "durationMs": 12000,
  "bpm": 120,
  "laneCount": 6,
  "notes": [
    { "atMs": 2000, "lane": 0, "holdMs": 0 },
    { "atMs": 2500, "lane": 3, "holdMs": 1000 }
  ]
}
```

当前版本为早期原型：示范谱与节拍伴奏为原创；判定规则尚未与游戏逐项校准。项目不内置歌曲音频，也不支持从游戏分享码读取谱面。

This is an early prototype. Its sample chart and metronome are original; judgement has not yet been calibrated against the game. No song audio is bundled, and in-game sharing codes cannot be imported.
