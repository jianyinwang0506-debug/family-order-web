# 家庭点餐网站 (Family Order Web)

## Overview
纯网页家庭点餐工具（Node.js + Express，无数据库，JSON 文件存储）。三个页面：点餐、订单、菜品管理（含图片上传）。详见 `README.md`。

## Running on Replit
- Dev workflow **Start application** runs `PORT=5000 npm start` (webview on port 5000).
- Server code defaults to `process.env.PORT || 3000`; the workflow overrides it to 5000 for Replit's webview requirement.
- Data persists as JSON files under `data/` and uploaded dish photos under `public/uploads/` — both are on local disk, not a database.

## Deployment
- Configured as a **Reserved VM** deployment (`npm start`), not Autoscale, because the app relies on local-disk JSON files and uploaded images for persistence — a VM keeps one persistent disk across the deployment's lifetime, avoiding the data loss that could happen with Autoscale's multiple/ephemeral instances.
- No secrets or external services are required to run this app.

## User preferences
- Keep the project as a plain Node/Express app with JSON file storage — no database migration wanted.
