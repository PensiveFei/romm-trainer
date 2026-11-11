# 千音习谱 | ROMM-Trainer

Repertoire of Myriad Melodies Trainer

## 项目介绍

千音习谱是为《原神》千音雅集制作的“练习模式”，旨在为玩家提供专业练谱工具。

## Project Introduction

Qianyin Xipu is a “Practice Mode” made for Genshin Impact’s Repertoire of Myriad Melodies, aiming to provide players with a professional score-practice tool.

## 核心功能

- **PC 手动练习**：六键键盘操作，支持单点、同时按和长按，并可自定义键位。
- **片段循环**：选择 A–B 区间反复练习，每轮开始前保留一小段引导时间。
- **练习设置**：调整音乐播放速度、音符下落速度和时间偏移。
- **谱面主题**：切换八种主题，各有独立的背景、音符与手动命中特效；选择会保存在本机。
- **练习反馈**：查看命中、连击、漏击以及按键偏早或偏晚的情况。
- **本地谱面**：提供原创示范谱，也可导入自行准备的 JSON 谱面和配套音频。

## Core Features

- **Manual PC practice**: Play six lanes with configurable keyboard bindings, including taps, simultaneous notes, and holds.
- **Section looping**: Select an A–B section and repeat it with a short lead-in before each attempt.
- **Practice settings**: Adjust the music playback rate, note scroll speed, and timing offset independently.
- **Score themes**: Choose from eight themes with distinct scenery, notes and manual hit effects; your choice is saved locally.
- **Practice feedback**: See hits, combo, misses, and early or late timing.
- **Local charts**: Try an original sample chart or import your own JSON chart and matching audio.

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

默认键位为 A、S、D、J、K、L；空格键用于暂停或继续。

Default keys: A, S, D, J, K, L. Press Space to pause or resume.

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

当前版本为早期原型：内置示范谱与节拍伴奏均为原创，不是游戏原谱；判定规则尚未与游戏逐项校准。项目不包含官方曲谱或音乐，也不支持从游戏分享码读取谱面。

This is an early prototype. Its sample chart and rhythm backing are original; judgement has not yet been calibrated against the game. Official charts and music are not included, and in-game sharing codes cannot be imported.
