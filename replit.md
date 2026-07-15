# 家庭点餐网站 (Family Order Web)

## Overview
纯网页家庭点餐工具（Node.js + Express）。三个页面：点餐、订单、菜品管理（含图片上传）。详见 `README.md`。

## Running on Replit
- Dev workflow **Start application** runs `PORT=5000 npm start` (webview on port 5000).
- Server code defaults to `process.env.PORT || 3000`; the workflow overrides it to 5000 for Replit's webview requirement.
- Storage auto-detects the Replit environment via `REPL_ID`:
  - On Replit: dish/order data goes to **Replit Database** (`@replit/database`), dish photos go to **Replit Object Storage** (`@replit/object-storage`, default bucket). Object Storage must be enabled once via Tools → Object Storage in the Replit UI, or photo uploads will fail with a clear error message.
  - Off Replit (local dev): falls back to JSON files under `data/` and `public/uploads/`, unchanged from before.

## Deployment
- Currently configured as a **Reserved VM** deployment (`npm start`). This is no longer required for data safety now that data lives in Replit Database/Object Storage rather than local disk — Autoscale would also work safely and may be cheaper, since it scales to zero when idle. Switching back to Autoscale is optional, not urgent.
- No secrets required — Replit Database and the default Object Storage bucket authenticate automatically within the Replit environment.

## User preferences
- Data must survive redeploys/publishes without manual re-entry — this was the actual requirement behind the earlier "no database migration" preference (the concern was unnecessary complexity, not database usage itself). Replit's own managed Database/Object Storage satisfies this without requiring any external account or secrets, so it was adopted instead of local JSON files.
