# AGENTS.md — 月球失眠管理局

## 專案目標
維護「月球失眠管理局｜Moonlight Insomnia Department」網站。標語：「地球人睡不著的晚上，我們都知道原因。」網站是可部署至 GitHub Pages 的靜態網站，Supabase 提供雲端案件資料庫與管理員認證。

## 世界觀與語氣
- 月球背面神秘機構，收錄人類深夜荒謬失眠理由。
- 角色：月兔局長、睡眠精靈、星星郵差、黑眼圈幽靈。
- 可愛、療癒、帶一點奇幻；幽默荒謬但不嘲笑真正失眠者。
- 色系：薰衣草紫、淡粉、奶油黃、天空藍。

## 技術限制
- 純 HTML/CSS/JavaScript；不可要求 Node build 才能部署。
- GitHub Pages 為靜態主機；Supabase 為資料庫/Auth。
- Supabase JS v2 由 CDN 載入。
- 使用 `assets/js/config.js` 的 `MOONLIGHT_SUPABASE_URL` 和 `MOONLIGHT_SUPABASE_KEY`。
- config.js 只能包含 Project URL 和 Publishable/anon key；絕不可加入 service_role、secret key、資料庫密碼。
- 所有資料存取必須依賴 Supabase RLS；不可只靠前端判斷權限。

## 資料與審核規則
- `public.cases` 是案件主表；狀態只允許 `pending`、`approved`、`rejected`。
- 訪客 INSERT 只能建立 `pending`；訪客 SELECT 只能看到 `approved`。
- 管理員由 `public.admins.user_id` 名單確認；`public.is_admin()` 是權限判斷函式。
- 只有管理員能讀取所有狀態及 UPDATE 案件；審核時更新 `status`、`reviewed_at`、`reviewed_by`。
- 不開放前端註冊；管理員帳號由專案擁有者在 Supabase 控制台建立。
- 新投稿不得包含使用者密碼、聯絡方式、住址等敏感個資。

## 目錄
- `index.html`：首頁
- `pages/archive.html`：公開案件檔案室
- `pages/submit.html`：訪客投稿
- `pages/admin.html`：管理員登入與審核
- `pages/about.html`：關於管理局
- `assets/css/style.css`：共用樣式
- `assets/js/config.js`：Supabase 公開連線設定
- `assets/js/supabase-client.js`：Supabase client 初始化
- `assets/js/main.js`：頁面互動、資料讀寫與審核

## 開發規範
- 所有使用者輸入在輸出到 HTML 前必須 escape；不得直接用未清理字串拼接 HTML。
- 所有表單須有 label、必填欄位、錯誤提示與送出中狀態。
- 保持手機版可用、語意化 HTML、鍵盤可操作及足夠對比。
- 新增頁面須沿用既有導覽與視覺。
- 不得建立公開管理員註冊流程。
- 不得把待審核／退回案件顯示在公開檔案室。

## 品質檢查
- 檢查所有相對路徑在根目錄及 `pages/` 子目錄均正確。
- 測試訪客投稿後資料庫新增 `pending` 案件。
- 測試公開檔案室只顯示 `approved`。
- 測試非管理員無法查詢待審案件或更新案件狀態。
- 測試管理員登入後可核准／退回案件。
- 若 Supabase 查詢失敗，顯示友善錯誤，不可假裝成功。

## AI 回報
完成工作後，列出修改檔案、功能、測試結果、尚待使用者在 Supabase/GitHub 手動完成的事項。不得聲稱未實際測試的功能已經通過。
