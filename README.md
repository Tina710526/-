# 月球失眠管理局｜Moonlight Insomnia Department

這是可部署到 GitHub Pages 的靜態網站，使用 Supabase 保存投稿案件與管理審核。

## 網站功能
- 訪客提交案件，寫入 `public.cases`，狀態固定為 `pending`。
- 公開檔案室只讀取 `approved` 案件。
- 管理員使用 Supabase Auth 電子郵件／密碼登入。
- 管理員可審核、通過或退回案件。
- 管理員身分由資料庫 `public.admins` 名單及 `is_admin()` 函式判斷。

## 部署前檢查
1. Supabase 專案已建立 `public.cases`，欄位符合專案 SQL。
2. 已建立 `public.admins`、`public.is_admin()` 及管理員 SELECT/UPDATE policies。
3. `cases` 的訪客 INSERT policy 必須限制 `with_check` 為 `status = 'pending'`。
4. `cases` 的訪客 SELECT policy 必須限制 `qual` 為 `status = 'approved'`。
5. Supabase Auth 已建立管理員帳號，並將其 UUID 加入 `public.admins`。
6. 在 `assets/js/config.js` 填入自己的 Project URL 與 Publishable key。這個檔案會公開，僅可放 publishable/anon key，絕不可放 `service_role` 或 secret key。
7. 先測試管理員登入，再關閉公開註冊（Allow new users to sign up）。不要關閉既有使用者登入。

## GitHub Pages
把 ZIP 解壓後的**所有內容**上傳到 Repository 根目錄，確認根目錄直接看得到 `index.html`、`assets/`、`pages/`。在 Repository Settings → Pages 啟用部署。若 Repository 名稱是 `-`，網址通常是 `https://<帳號>.github.io/-/`。

## 本機預覽
可用 VS Code Live Server，或在專案根目錄執行：
`python -m http.server 8000`
再開啟 `http://localhost:8000/`。

## 安全
- 前端只使用 Supabase Publishable key。
- 不得將 service_role/secret key、資料庫密碼寫入前端、GitHub 或公開聊天。
- RLS 是安全邊界；不要只依賴前端隱藏按鈕。
- `admins` 表不可授予 anon/authenticated 直接讀寫權限；管理員身分由 security-definer 函式查核。
- 關閉公開註冊前，先確認管理員可登入。
