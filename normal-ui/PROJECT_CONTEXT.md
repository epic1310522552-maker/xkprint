# XKPrint 项目上下文

## 项目范围

单页移动端 3D 打印机控制界面。项目无构建工具、依赖清单或后端代码；页面、样式和演示交互分别集中在下列文件：

- `index.html`：所有页面结构、演示数据、对话框、底部导航，以及 Three.js / Lucide CDN 引入。
- `styles.css`：浅色/深色主题变量、移动端布局、组件与响应式样式。
- `app.js`：页面切换、主题持久化、设备配对演示、设备控制状态及 Three.js 预览。

## 页面与导航

- 页面根容器：`index.html` 的 `.app-shell`。
- 页面标识：`section[data-page]`；现有页面值为 `device`、`materials`、`models`、`market`、`profile`。
- 底部导航：`index.html` 的 `.bottom-nav`，入口使用 `button[data-nav]`。
- 页面切换：`app.js` 的 `initNavigation()`；点击任意 `[data-nav]` 后，为同名 `[data-page]` 和当前按钮设置 `active`。
- 页面显示规则：`styles.css` 的 `.page` 与 `.page.active`。
- 初始页面：模型页和“模型”底部导航按钮在 HTML 中带有 `active`。

## 设备页

位置：`index.html` 的 `section[data-page="device"]`。

### 未配对状态

- 状态类：设备页的 `no-device`。
- 内容：`.device-empty-state` 与 `[data-scan-device]`“扫码添加设备”按钮。
- 显隐规则：`styles.css` 的 `.no-device .device-empty-state` 和 `.no-device [data-device-content]`。
- 演示交互：`app.js` 的 `initDevicePairing()`；点击扫码按钮仅移除 `no-device`，不接入真实扫码或设备数据。

### 打印任务预览

- 卡片：`.hero-card[data-device-content]`。
- Three.js 挂载点：`#model-canvas`，外层为 `.hero-canvas-wrap`。
- 场景初始化：`app.js` 的 `initModelScene()`；动态导入 `three`，绘制打印机与模型，使用 `ResizeObserver` 更新画布尺寸；CDN 不可用时保留 CSS 预览回退。
- 状态与快捷操作：`.hero-overlay` 内的 `.device-status-heading`、`.status-tag.printing` 与 `.preview-float-actions`。
- 进度内容：`.progress-section`，含 `.progress-bar`、`.progress-fill`、`.progress-meta` 和 `.layer-info`。
- 对应样式：`styles.css` 的 `.hero-card`、`.hero-canvas-wrap`、`.hero-overlay`、`.device-status-heading`、`.status-tag`、`.preview-float-actions`。

### 设备控制

- 控制容器：`.device-control-panel[data-device-content]`。
- 标签页：`[role="tab"][data-tab]`；面板：`[role="tabpanel"][data-tab-panel]`。
- 标签页交互：`app.js` 的 `initDeviceControlTabs()`，同步 `active`、`aria-selected` 和 `hidden`。
- 控制标签页：热床、打印速度、风扇、照明 / RGB 卡片分别通过 `data-control-dialog` 打开同名对话框。
- 控制状态和对话框提交：`app.js` 的 `initDeviceControlDialogs()`；状态仅保存在函数内部 `state`，应用后更新对应 `[data-control-summary]`。
- 对话框：HTML 末尾的 `dialog[data-control-dialog-panel]`，包含 `bed`、`speed`、`fan`、`lighting`。
- 执行头标签页：`.toolhead-selector[data-toolhead-selector]` 和 `.toolhead-detail[data-toolhead-detail]`。
- 执行头交互：`app.js` 的 `initToolheadSelector()`；执行头演示数据在该函数的 `toolheads` 数组中，温度对话框为 `dialog[data-toolhead-temperature-dialog]`。
- 移动标签页：`[data-tab-panel="move"]`，包含步进选择、方向控制和热床按钮；目前只有页面结构，无脚本行为。

### 耗材入口

- 设备页摘要：`.material-summary-card[data-nav="materials"]`，缩略项位于 `.material-thumbnails`。
- 库存页：`section[data-page="materials"]`。
- 耗材卡：`[data-material-card]`；选择行为由 `app.js` 的 `initMaterialCards()` 控制，更新 `material-card--selected` 和 `aria-pressed`。
- 库存卡数据均直接写在 `index.html` 的 `.materials-grid`。

## 模型页

位置：`section[data-page="models"]`。

- 添加模型区域：`.add-model-card`；仅展示入口，没有上传逻辑。
- 筛选按钮：模型页 `.filter-row .chip`；仅展示，没有脚本筛选行为。
- 模型列表：`.model-grid` 内的 `.model-card`。
- 缩略图：`.model-thumb` 以及具体模型类（如 `spiral-vase`、`tray`、`dragon`、`lamp-shade`）；视觉效果在 `styles.css`。
- 模型状态：`.model-status` 的 `printing`、`ready`、`slicing`。

## 商城页

位置：`section[data-page="market"]`。

- 搜索展示：`.search-field`，未绑定输入或搜索逻辑。
- 分类入口：`.category-row .chip`，未绑定筛选逻辑。
- 精选模型：`.featured-card`。
- 商品列表：`.market-grid` 内的 `.market-item`；缩略图由 `.item-thumb` 的具体类生成样式。

## 个人页

位置：`section[data-page="profile"]`。

- 资料卡：`.profile-card`。
- 打印统计：`.metrics-row`。
- 当前打印机：`.printer-row`。
- 本月耗材图表：`.material-summary` 内的 `.weekly-chart`。
- 菜单入口：`.menu-group .menu-row`；当前仅展示，未绑定页面或操作。

## 主题、图标与资源

- 初始主题：`<html data-theme="light">`。
- 主题按钮：所有 `[data-theme-toggle]`。
- 主题逻辑：`app.js` 的 `initTheme()`；读写 `localStorage` 键 `xkprint-theme`，同时更新 `#theme-color` 与太阳/月亮图标状态。
- 主题样式：`styles.css` 顶部的 CSS 自定义属性及 `[data-theme="dark"]` 覆盖规则。
- 图标：HTML 中的 `<i data-lucide="…">`；Lucide UMD CDN 位于 `index.html` 末尾，由 `lucide.createIcons()` 转为 SVG。
- Three.js：`index.html` 的 import map 指向 jsDelivr `three@0.185.1`；仅打印预览使用。

## 初始化顺序

`app.js` 的 `runInit()` 会在 DOM 可用后按以下顺序执行：Lucide 图标、导航、设备配对、设备控制标签、执行头、控制对话框、耗材卡、主题、Three.js 场景。各初始化函数均以 DOM 选择器为入口；新增对应页面元素时应沿用现有 `data-*` 标识和类名约定。

## 样式定位

- 基础页面与头部：`styles.css` 的 Page Panels / Page Header 区段。
- 设备空状态与打印预览：Empty Device State / Hero Card / Floating Preview Actions 区段。
- 设备控制、执行头和对话框：控制组件与 `control-dialog` 相关区段。
- 耗材页：材料卡、`materials-grid`、`material-card--compact` 相关区段。
- 模型与商城：`model-grid`、`market-grid`、缩略图具体类所在区段。
- 底部导航：`Bottom Navigation` 区段。
- 小屏和宽屏适配：文件末尾的媒体查询。
