# TickClock

> 复古翻页钟桌面小组件 | Retro Flip Clock Desktop Widget for Windows

一个基于 Electron 的透明桌面翻页时钟，带有流畅的 CSS 3D 翻转动画、6 种主题配色、系统托盘控制和自启动记忆功能。

<p align="center">
  <img src="screenshots/01-main-dark.png" alt="TickClock Dark Theme" width="420">
</p>

---

## 功能特性

- **翻页动画** — 纯 CSS `@keyframes` 驱动的 3D 翻转效果，每秒 / 每分钟数字变化时触发
- **6 种主题** — Dark · Blue · Red · Green · Purple · Wood，一键切换配色
- **系统托盘** — 最小化到 Windows 托盘，右键菜单快速操作
- **全局快捷键** — `Ctrl+Shift+F12` 随时唤出 / 置顶切换
- **透明无边框** — 完美融入桌面背景，不遮挡工作区域
- **12/24 小时制** — 双击切换，设置面板一键修改
- **秒数显示** — 可自由开关秒数，关掉就是一个极简时钟
- **位置记忆** — 自动记忆上次窗口位置，下次启动还原
- **开机自启** — 支持 Windows 开机自动启动（托盘菜单 / 设置面板均可控制）
- **透明度调节** — 滑块精细调节，与桌面壁纸完美融合
- **锁定位置** — 锁定后窗口无法拖动，防止误触移位

---

## 界面预览

### 主界面

<p align="center">
  <img src="screenshots/01-main-dark.png" alt="主界面" width="380">
</p>

### 设置面板

<p align="center">
  <img src="screenshots/02-settings.png" alt="设置面板" width="380">
</p>

### 6 种主题配色

| Dark | Blue | Red |
|:---:|:---:|:---:|
| ![Dark](screenshots/01-main-dark.png) | ![Blue](screenshots/03-theme-blue.png) | ![Red](screenshots/04-theme-red.png) |

| Green | Purple | Wood |
|:---:|:---:|:---:|
| ![Green](screenshots/05-theme-green.png) | ![Purple](screenshots/06-theme-purple.png) | ![Wood](screenshots/07-theme-wood.png) |

### 关闭秒数

<p align="center">
  <img src="screenshots/08-no-seconds.png" alt="隐藏秒数" width="380">
</p>

---

## 安装

### 前置要求

- [Node.js](https://nodejs.org/) >= 18
- Windows 10 / 11

### 下载运行

```bash
git clone https://github.com/acangcang-Eliauk/TickClock.git
cd TickClock
npm install
npm start
```

---

## 使用说明

### 基本操作

| 操作 | 方式 |
|------|------|
| 拖动窗口 | 鼠标按住时钟区域拖动（未锁定时） |
| 打开设置 | 点击时钟下方 ⚙ 按钮 |
| 锁定位置 | 点击时钟下方 🔒 按钮 |
| 关闭窗口 | 点击时钟下方 ✕ 按钮（最小化到托盘） |
| 唤出窗口 | `Ctrl+Shift+F12` |

### 系统托盘

TickClock 启动后会在 Windows 系统托盘中显示图标。

| 操作 | 说明 |
|------|------|
| 右键点击图标 | 弹出菜单：显示/隐藏、设置、总在最前、开机自启、退出 |
| 双击图标 | 快速显示 / 隐藏窗口 |

### 设置项

| 设置 | 说明 |
|------|------|
| 总在最前 | 窗口始终置于所有窗口之上 |
| 锁定位置 | 锁定后无法拖动，避免误触 |
| 显示秒数 | 关掉秒数后变成一个极简 HH:MM 时钟 |
| 24小时制 | 关闭后使用 12 小时制（AM/PM） |
| 透明度 | 30% ~ 100% 可调 |
| 开机自启 | 随 Windows 启动自动运行 |
| 主题色 | Dark / Blue / Red / Green / Purple / Wood |

---

## 项目架构

```
TickClock/
├── main.js              # Electron 主进程：窗口、托盘、快捷键、IPC
├── preload.js           # contextBridge：安全暴露 API 给渲染进程
├── tray-icon.png        # 系统托盘图标
├── src/
│   ├── index.html       # 主页面结构（6组翻页卡片 + 设置面板）
│   ├── css/style.css    # 6 主题 + 翻页动画 + 设置面板样式
│   └── js/
│       ├── flip.js      # FlipCard / FlipClock 类：翻页动画核心
│       ├── clock.js     # 时钟逻辑：每秒更新，12/24h 切换
│       ├── drag.js      # 拖动锁定：-webkit-app-region 控制
│       └── settings.js  # 设置面板：localStorage 持久化 + IPC 通信
└── package.json
```

### 核心模块

| 模块 | 职责 |
|------|------|
| `flip.js` | `FlipCard` 类管理单张卡片的翻页动画（CSS `@keyframes` 两阶段翻转）。`FlipClock` 类管理 6 张卡片，调用 `setTime(h, m, s)` |
| `clock.js` | 每 1s 调用 `setInterval` 更新时钟，从 localStorage 读取 12/24h 偏好 |
| `drag.js` | 通过切换 `.locked` 类控制 `-webkit-app-region` 属性 |
| `settings.js` | 所有设置持久化到 localStorage，通过 `window.tickAPI` 与主进程通信 |

### 翻页动画原理

翻页卡片使用 CSS 3D transform 实现：

1. 数字变化时，上半部分 (`flip-top`) 从 `rotateX(90deg)` 翻转到 `0deg`（300ms）
2. 同时更新静态 top 显示新值
3. 下半部分 (`flip-bottom`) 同样从 `90deg` 翻转到 `0deg`（300ms）
4. 使用 `perspective: 120px` 产生 3D 视差
5. 通过 `void element.offsetHeight` 强制回流后再添加 `.flipping` 类

---

## 开发

```bash
# 安装依赖
npm install

# 启动应用
npm start
```

---

## License

[MIT](LICENSE) © 2026 TickClock
