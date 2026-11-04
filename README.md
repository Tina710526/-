# ☾ 月球失眠管理局

**Moonlight Insomnia Department**

> 地球人睡不著的晚上，我們都知道原因。

一個可愛、療癒、帶有荒謬幽默的奇幻主題網站。設定為月球背面的小型機關，專門收錄人類在深夜發生的各種奇妙失眠事件。

## 網站功能

- **月球總部**：品牌介紹、案件統計、熱門案件。
- **失眠檔案室**：從 JSON 讀取案件，支援關鍵字搜尋與事件等級篩選。
- **提交案件**：互動表單，產生本次瀏覽有效的案件回條。
- **關於管理局**：世界觀與角色介紹。

## 技術

- HTML5、CSS3、原生 JavaScript
- JSON 作為案件資料來源
- GitHub Pages 靜態網站部署
- 不需要資料庫、API Key 或建置工具

## 專案結構

```text
.
├── index.html
├── AGENTS.md
├── README.md
├── data/cases.json
├── assets/css/style.css
├── assets/js/main.js
└── pages/
    ├── archive.html
    ├── submit.html
    └── about.html
```

## 本機預覽

因為網站會使用 `fetch()` 讀取 JSON，請透過本機 HTTP 伺服器開啟，不要直接雙擊 HTML。

```bash
python -m http.server 8000
```

接著瀏覽 `http://localhost:8000`。

## 部署到 GitHub Pages

1. 在 GitHub 建立一個新的 Repository，例如 `moonlight-insomnia-department`。
2. 將本專案所有檔案上傳到 Repository 根目錄。
3. 進入 Repository 的 **Settings → Pages**。
4. 在 **Build and deployment** 選擇 **Deploy from a branch**。
5. Branch 選擇 `main`，資料夾選擇 `/ (root)`，按下 Save。
6. 等待 GitHub Pages 部署完成。
7. 網站網址通常會是：

   `https://你的GitHub帳號.github.io/moonlight-insomnia-department/`

每次推送更新到 `main`，GitHub Pages 就會重新部署。

## 如何新增一筆失眠案件？

開啟 `data/cases.json`，在陣列中新增一個物件。請遵守 `AGENTS.md` 的資料格式與命名規則。

範例：

```json
{
  "id": "MOON-007",
  "title": "睡前突然想整理人生",
  "category": "深夜思想暴走",
  "severity": "mid",
  "severityLabel": "二級失眠事件",
  "emoji": "🧹",
  "description": "當事人本來只想睡覺，卻突然決定從明天開始成為全新的人。",
  "result": "大腦誤把凌晨當成年度計畫會議。",
  "treatment": "發放一張明天再努力的通行證。",
  "note": "新人生請於睡醒後開始。"
}
```

新增後，首頁與檔案室會從同一份 JSON 自動讀取資料，不需要手動製作案件卡片。

## AI 協作方式

本專案使用 `AGENTS.md` 作為 AI 開發規範。每次請 AI 修改前，先要求它閱讀該文件。文件定義世界觀、設計系統、資料格式、目錄結構、程式安全與完成檢查清單。

## 注意事項

提交表單是前端展示功能，資料不會傳送到伺服器，也不會永久保存。此網站是虛構創作，非醫療資訊。
