# 家庭点餐网站

给家人在家点菜用的小网站。纯网页（不是小程序），手机浏览器直接打开就能用，界面走可爱风格，针对 iOS 加了主屏幕图标和沉浸式状态栏。

当前部署在 Replit 上。

## 项目结构

- `server.js` — Express 服务器 + 所有 API
- `db.js` — 数据存储层，自动识别运行环境：
  - 在 Replit 上运行（能检测到 `REPL_ID` 环境变量）：菜品/订单数据存到 **Replit Database**（内置 key-value 数据库，不需要额外注册或配置）
  - 本地运行（比如你自己电脑上 `npm start`）：存到 `data/` 目录下的 JSON 文件，方便本地调试
- `categories.js` — 固定的菜品分类（早餐/主食/面面/肉肉/汤汤/菜菜/果果/甜甜），前后端共用
- `public/index.html` — 点餐页：左侧分类导航 + 菜品卡片网格，选数量、写备注、提交订单
- `public/orders.html` — 订单页：查看所有人提交的订单，标记完成/待处理
- `public/admin.html` — 菜品管理页：增删菜品、上传菜品照片、填配料说明
- `public/icons/` — PWA / iOS 主屏幕图标
- `public/uploads/` — 本地运行时，上传的菜品照片存这里（不进 git）；在 Replit 上运行时改存 **Replit Object Storage**，不用这个目录

## 为什么要分本地/Replit 两套存储

之前部署在 Railway 上用的是本地 JSON 文件 + 磁盘，这在「重新部署会重置磁盘」的平台上（Railway 免费版、Replit Autoscale/Reserved VM 都是如此）会导致每次发布新版本，菜品和订单数据全部丢失——这也是你之前在 Replit 上遇到"数据被清空"问题的根本原因。现在切换成 Replit 官方的 Database 和 Object Storage 服务后，数据存在 Replit 侧独立的持久化存储里，不会因为重新部署而被清空。

## 本地跑起来看效果

```bash
cd family-order-web
npm install
npm start
```

打开 http://localhost:3000 ，先去「菜品管理」点一下「一键添加示例菜品」，然后就能在「点餐」里下单、在「订单」里看结果了。本地运行时数据存在 `data/*.json`，删掉这个目录就能清空重来。

## 部署到 Replit 前，有一个一次性设置

**菜品照片用的 Object Storage 需要先在 Replit 项目里手动启用一次**（Replit Database 不需要，是自动开通的）：

1. 打开你的 Repl，左侧工具栏找 **Tools** → **Object Storage**，点开启用
2. 会自动创建一个默认的存储桶（bucket），不需要额外配置，代码会自动用这个默认桶
3. 启用后，重新 Publish 一次，菜品照片上传就能正常持久化了

如果没做这一步，上传照片时会看到"图片上传失败"的报错，提示你去启用 Object Storage。

## 更新代码后怎么让 Replit 生效

1. 在 Replit 左侧 **Git** 面板点 **Pull**，拉取 GitHub 上的最新代码
2. 回到 **Deploy** 页面点 **Redeploy**（代码更新不会影响 Database/Object Storage 里已经存的数据，那些是独立的）

## 关于菜品照片

菜品照片需要你自己上传（比如用 AI 工具生成一张、或者手机拍一张实物图）。在「菜品管理」页填菜名的地方，点「选择照片」就能选图上传，上传后立刻在点餐页替换掉默认的分类 emoji 占位图。没传照片的菜会显示一个跟分类匹配的可爱 emoji 占位，不会显得很空。

## 让家人也能用 iOS「添加到主屏幕」

网站已经做了 iOS 的适配（`manifest.json` + `apple-touch-icon` + 沉浸式状态栏 + 底部安全区避让），在 iPhone Safari 打开网站后：

1. 点底部分享按钮
2. 选「添加到主屏幕」
3. 会生成一个跟原生 App 一样的图标，点开是全屏无浏览器地址栏的效果

## 之后可以加的小功能（现在没做，用得上再说）

- 密码保护「菜品管理」页，避免家人手滑改错菜单
- 下单后自动推送提醒给"掌勺人"（可以用 Server 酱 / 企业微信机器人这类免费的推送服务）
- 菜品照片支持裁剪/压缩，现在是原图直接存
