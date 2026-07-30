# 名古屋・高山・立山黑部 聖地巡禮 8 日行程

線上共編行程網站。所有人打開同一個網址，就能看到同一份行程，
新增／編輯／刪除景點會即時同步給所有人（用 [Supabase](https://supabase.com) 當免費雲端資料庫）。

## 第一次設定（只需要做一次）

### 1. 建立 Supabase 專案

1. 到 https://supabase.com 註冊並建立一個新專案（免費方案即可）。
2. 專案建立好後，進到左側選單 **SQL Editor** → **New query**。
3. 把這個資料夾裡的 [`supabase-schema.sql`](./supabase-schema.sql) 整份內容貼上，按 **Run** 執行一次。
   這會建立 `days`（每天資訊）與 `items`（景點/行程項目）兩張表，並開啟即時同步。
4. 到左側選單 **Project Settings → API**，複製：
   - **Project URL**
   - **anon public key**（或新版介面叫 **publishable key**）
5. 打開 [`supabase-config.js`](./supabase-config.js)，把 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
   換成剛剛複製的值，存檔。

> 這組 key 是設計給前端公開使用的，不是密碼，可以放心一起 commit 上 GitHub。
> 真正的存取權限是資料庫的 RLS policy 控制的（見 `supabase-schema.sql`）。
>
> ⚠️ 目前的設定是「任何拿到網址的人都能新增/編輯/刪除」，沒有登入機制，
> 適合單純的個人/親友出遊規劃用，請不要放機密資料。

### 2. 部署到 GitHub Pages

```bash
git add -A
git commit -m "行程網站"
git push
```

推上 GitHub 後，到 repo 的 **Settings → Pages**：
- Source 選 **Deploy from a branch**
- Branch 選 **main** / `/ (root)`
- 存檔後等 1~2 分鐘，網址會是 `https://<你的帳號>.github.io/<repo 名稱>/`

之後任何人打開這個網址就能看行程、新增/編輯/刪除景點，資料會自動同步。

## 平常怎麼用

- 上方分頁可以切換每一天。
- 每張卡片標題／住宿資訊可以直接點下去編輯，點旁邊空白處會自動存檔。
- 點「＋ 新增這天的行程」新增一個景點/行程項目。
- 每個項目右邊有 ✏️ 編輯、🗑️ 刪除。
- 右下角「＋ 新增天數」可以加一整天新行程。

## 檔案說明

| 檔案 | 用途 |
|---|---|
| `index.html` | 頁面結構 |
| `style.css` | 樣式 |
| `app.js` | 主要邏輯（讀寫 Supabase、即時同步、渲染畫面） |
| `supabase-config.js` | Supabase 連線設定（**要自己填**） |
| `supabase-schema.sql` | 建表用 SQL（**要自己在 Supabase 執行一次**） |
| `seed-data.js` | 初始行程資料，第一次載入、資料庫是空的時候會自動寫入 |
