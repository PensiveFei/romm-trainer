# 千音习谱 | ROMM-Trainer

Repertoire of Myriad Melodies Trainer

在线体验 / Play online: [qianyin.fun](https://qianyin.fun/)

## 项目介绍

千音习谱是为《原神》千音雅集制作的“练习模式”，旨在为玩家提供专业练谱工具。

## Project Introduction

Qianyin Xipu is a “Practice Mode” made for Genshin Impact’s Repertoire of Myriad Melodies, aiming to provide players with a professional score-practice tool.

## 演示视频 | Demo Video

[![千音习谱演示视频](https://qianyin.fun/demo/qianyin-demo-poster-1s.jpg)](https://qianyin.fun/demo/qianyin-demo.mp4)

## 核心功能

- **手动练习**：PC 使用六键键盘，手机横屏后可使用六轨触屏，支持单点、同时按和长按。
- **开始倒计时**：开始或继续练习前显示 3 秒倒计时，可随时取消。
- **片段循环**：选择 A–B 区间反复练习，每轮开始前保留一小段引导时间。
- **进度跳转**：拖动顶部进度条，或使用左右方向键快退、快进 10 秒；跳转后本轮完成度从当前位置重新计算。
- **练习设置**：调整音乐播放速度、音符下落速度、判定范围和时间偏移。
- **谱面主题**：切换八种主题，各有独立的背景、音符与手动命中特效；选择会保存在本机。
- **练习反馈**：查看当前区间的实时演奏完成度、命中、连击、漏击以及按键偏早或偏晚的情况。
- **首页与收藏**：从精选曲目或专辑进入练习，在曲目详情中收藏歌曲；收藏仅保存在当前浏览器中。
- **本地谱面**：提供原创示范谱，也可导入自行准备的 JSON 谱面和配套音频。
- **曲目典藏**：按专辑浏览或搜索 150 首曲目；其中 128 首提供通过结构检查的传说难度六轨试验谱，另外 22 首暂待补充或核对。
- **伴奏选择**：部分曲目提供官方在线原声入口；在线音源不可用时自动切换节拍伴奏。也可选择本地配套音频并保存在当前设备，下次选曲自动载入；本项目不会上传音频。节拍伴奏不包含歌曲原声，在线原声与游戏内剪辑的同步仍待逐首校准。

## Core Features

- **Manual practice**: Use six keyboard lanes on PC or touch the lanes in landscape on mobile, including taps, simultaneous notes, and holds.
- **Countdown**: A cancellable three-second countdown precedes starting or resuming practice.
- **Section looping**: Select an A–B section and repeat it with a short lead-in before each attempt.
- **Practice settings**: Adjust the music playback rate, note scroll speed, hit window, and timing offset independently.
- **Score themes**: Choose from eight themes with distinct scenery, notes and manual hit effects; your choice is saved locally.
- **Practice feedback**: See live performance completion for the selected section, hits, combo, misses, and early or late timing.
- **Home and favorites**: Start from featured songs or albums and save favorite songs in the current browser.
- **Local charts**: Try an original sample chart or import your own JSON chart and matching audio.
- **Song library**: Browse or search 150 titles by album, with 128 structurally checked six-lane Legendary trial charts. The remaining 22 need further source data or review.
- **Accompaniment**: Some songs link to an official online soundtrack; unavailable online audio falls back to a metronome. User-selected local audio can be saved in the current browser and loaded again for that song without uploading it. The metronome does not contain the soundtrack; alignment with each in-game edit remains provisional.

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

Default keys: A, S, D, J, K, L. Press Space to pause or resume. Use “曲谱与设置” at the top right to import files and adjust the practice section or key bindings.

## 部署 | Deployment

正式站点 <https://qianyin.fun> 以静态文件形式托管在 Cloudflare Pages，域名的 DNS 与证书由同一账号下的 Cloudflare Zone 管理。

The production site is served as static files by Cloudflare Pages; DNS and TLS are handled by the Cloudflare Zone for the same domain.

| 配置项 / Setting | 值 / Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `build` |

`npm run build` 会把 `dist/` 复制到 `build/`，叠加 `deploy/` 下的 `_headers` 与 `404.html`，并给 `src/` 下的脚本和样式追加内容哈希。这一步用于避免 Cloudflare 边缘按文件名沿用旧缓存，产生「新 HTML + 旧 JS」的版本错配。

`npm run build` copies `dist/` into `build/`, adds `_headers` and `404.html` from `deploy/`, and appends a content hash to the scripts and styles under `src/`. The hash keeps a stale edge cache from pairing new HTML with old JavaScript.

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
