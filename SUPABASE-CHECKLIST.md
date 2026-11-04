# Supabase 上線檢查清單

## 已完成（依使用者提供的執行結果）
- `public.cases` 已建立，包含 id/title/category/severity/description/result/treatment/note/status/created_at/reviewed_at。
- 訪客 INSERT policy：`with_check = status = 'pending'`。
- 訪客 SELECT policy：`qual = status = 'approved'`。
- `public.admins` 已建立並登記一個管理員 UUID。
- `public.is_admin()` 已建立。
- 管理員 SELECT/UPDATE policies 已建立。
- `reviewed_by` 欄位已加入。

## 請在部署後驗證
1. 用訪客視窗提交一筆測試案件。
2. 確認 `cases` 出現 `pending` 記錄。
3. 公開檔案室不應看見該筆待審案件。
4. 用管理員登入 `/pages/admin.html`，核准該筆案件。
5. 回到檔案室，確認案件出現。
6. 測試退回案件不會公開。

## 重要
如果登入後頁面顯示沒有管理員權限，請確認登入的 Auth User UID 與 `public.admins.user_id` 完全一致。
如果投稿失敗，檢查 Supabase 專案的 RLS、INSERT policy、API 設定及瀏覽器 Console。
