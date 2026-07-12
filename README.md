# 家庭点餐网站

给家人在家点菜用的小网站。纯网页（不是小程序），手机浏览器直接打开就能用，界面走可爱风格，针对 iOS 加了主屏幕图标和沉浸式状态栏。

## 项目结构

- `server.js` — Express 服务器 + 所有 API
- `db.js` — 数据存储（JSON 文件，存在 `data/` 目录下，没用真正的数据库，家庭规模够用，也避免了原生数据库模块在部署时的编译问题）
- `categories.js` — 固定的 8 个菜品分类（早餐/主食/面面/肉肉/菜菜/果果/甜甜/小药），前后端共用
- `public/index.html` — 点餐页：左侧分类导航 + 菜品卡片网格，选数量、写备注、提交订单
- `public/orders.html` — 订单页：查看所有人提交的订单，标记完成/待处理
- `public/admin.html` — 菜品管理页：增删菜品、上传菜品照片、填配料说明
- `public/icons/` — PWA / iOS 主屏幕图标
- `public/uploads/` — 菜品照片上传后存放的地方（不进 git，服务器重新部署要记得挂 Volume，见下文）

## 本地跑起来看效果

```bash
cd family-order-web
npm install
npm start
```

打开 http://localhost:3000 ，先去「菜品管理」点一下「一键添加示例菜品」，然后就能在「点餐」里下单、在「订单」里看结果了。

## 关于菜品照片

菜品照片需要你自己上传（比如用 AI 工具生成一张、或者手机拍一张实物图）。在「菜品管理」页填菜名的地方，点「选择照片」就能选图上传，上传后立刻在点餐页替换掉默认的分类 emoji 占位图。没传照片的菜会显示一个跟分类匹配的可爱 emoji 占位，不会显得很空。

## 让家人也能用 iOS「添加到主屏幕」

网站已经做了 iOS 的适配（`manifest.json` + `apple-touch-icon` + 沉浸式状态栏 + 底部安全区避让），在 iPhone Safari 打开网站后：

1. 点底部分享按钮
2. 选「添加到主屏幕」
3. 会生成一个跟原生 App 一样的图标，点开是全屏无浏览器地址栏的效果

## 部署到 Railway，让家人随时随地能用

1. 把这个项目推到一个 GitHub 仓库（新建仓库，`git init` → `git add` → `git commit` → 推上去）
2. 去 https://railway.app 用 GitHub 登录，New Project → Deploy from GitHub repo，选这个仓库
3. Railway 会自动识别是 Node 项目，自动跑 `npm install` 和 `npm start`，不用额外配置
4. **重要：加一个持久化 Volume**，不然每次重新部署数据和上传的照片都会被清空：
   - 项目页面 → 该服务 → Settings → Volumes → 新建一个 Volume
   - Mount path 填 `/app/data`
   - 再新建一个 Volume，Mount path 填 `/app/public/uploads`（菜品照片存这里）
5. 部署成功后，在 Settings → Networking 里点「Generate Domain」，会给一个 `xxx.up.railway.app` 的公网地址
6. 把这个链接发到家庭群，家人手机浏览器打开，按上面的方法「添加到主屏幕」

## 之后可以加的小功能（现在没做，用得上再说）

- 密码保护「菜品管理」页，避免家人手滑改错菜单
- 下单后自动推送提醒给"掌勺人"（可以用 Server 酱 / 企业微信机器人这类免费的推送服务）
- 菜品照片支持裁剪/压缩，现在是原图直接存
