(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const db = () => window.moonlightDB;
  const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
  const showMessage = (node, text, kind = "info") => {
    if (!node) return;
    node.textContent = text;
    node.className = `notice ${kind}`;
    node.hidden = false;
  };
  const formatDate = value => {
    if (!value) return "時間待確認";
    return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  };
  const categoryNames = {
    "腦內劇場": "腦內劇場", "深夜嘴饞": "深夜嘴饞", "科技成癮": "科技成癮",
    "人生哲學": "人生哲學", "神祕事件": "神祕事件", "其他": "其他"
  };
  const severityNames = { mild: "微微清醒", medium: "精神抖擻", severe: "月球常住居民" };

  // 公開檔案室：只向資料庫讀取 approved 案件，RLS 也會再次限制。
  async function loadArchive() {
    const list = $("#case-list");
    if (!list || !db()) return;
    list.innerHTML = '<p class="loading">正在向月球檔案室借閱卷宗……</p>';
    const { data, error } = await db().from("cases")
      .select("id,title,category,severity,description,result,treatment,note,created_at")
      .eq("status", "approved").order("created_at", { ascending: false });
    if (error) {
      list.innerHTML = '<p class="empty">檔案室暫時連線失敗，請稍後再試。</p>';
      console.error(error); return;
    }
    window.moonlightCases = data || [];
    renderArchive();
    const count = $("#archive-count");
    if (count) count.textContent = `${data.length} 件已公開案件`;
  }
  function renderArchive() {
    const list = $("#case-list");
    if (!list) return;
    const q = ($("#case-search")?.value || "").trim().toLowerCase();
    const cat = $("#case-filter")?.value || "";
    const cases = (window.moonlightCases || []).filter(c =>
      (!cat || c.category === cat) &&
      (!q || [c.title,c.description,c.result,c.treatment,c.note].join(" ").toLowerCase().includes(q))
    );
    list.innerHTML = cases.length ? cases.map(c => `
      <article class="case-card">
        <div class="case-meta"><span class="tag">${escapeHTML(categoryNames[c.category] || c.category || "未分類")}</span><span>${escapeHTML(severityNames[c.severity] || "神祕程度未測")}</span><span>${escapeHTML(formatDate(c.created_at))}</span></div>
        <h3>${escapeHTML(c.title)}</h3>
        <p>${escapeHTML(c.description)}</p>
        ${c.result ? `<p><strong>調查結果：</strong>${escapeHTML(c.result)}</p>` : ""}
        ${c.treatment ? `<p><strong>局方處置：</strong>${escapeHTML(c.treatment)}</p>` : ""}
        ${c.note ? `<p class="small-note">${escapeHTML(c.note)}</p>` : ""}
        <div class="case-stamp">MOONLIGHT・已核准公開</div>
      </article>`).join("") : '<p class="empty">目前沒有符合條件的公開案件。也許它們正在補眠。</p>';
  }
  async function submitCase(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const button = $("button[type=submit]", form);
    const notice = $("#submit-notice");
    if (!db()) return showMessage(notice, "資料庫尚未連線，請重新整理頁面。", "error");
    const values = Object.fromEntries(new FormData(form).entries());
    if (!values.title?.trim() || !values.description?.trim()) {
      return showMessage(notice, "請至少填寫案件標題與失眠原因。", "error");
    }
    button.disabled = true; button.textContent = "正在送往月球……";
    const payload = {
      title: values.title.trim(), category: values.category || "其他",
      severity: values.severity || "mild", description: values.description.trim(),
      result: values.result.trim() || null, treatment: values.treatment.trim() || null,
      note: values.note.trim() || null, status: "pending"
    };
    const { error } = await db().from("cases").insert(payload);
    button.disabled = false; button.textContent = "提交給月球管理局";
    if (error) {
      console.error(error);
      return showMessage(notice, "案件沒有送出成功。請稍後再試；若持續失敗，請聯絡管理局。", "error");
    }
    form.reset();
    showMessage(notice, `🌙 案件已成功送達月球失眠管理局！
目前狀態：待審核。通過後才會出現在公開檔案室。

親愛的地球人：

謝謝你願意把心事交給我們保管。
如果今晚還是睡不著，也沒關係。
不用急著變好，也不用責怪自己想太多。

你不需要在今晚解決所有事情，
先好好呼吸，讓自己休息一下吧。

宇宙很大，今晚的你也值得被溫柔對待。
🐰 月兔局長祝你今晚好夢。`, "success");
  }
  async function initAdmin() {
    const loginForm = $("#admin-login");
    const panel = $("#admin-panel");
    const loginNotice = $("#login-notice");
    if (!loginForm || !db()) return;
    const logout = $("#admin-logout");
    async function checkSession() {
      const { data: { session } } = await db().auth.getSession();
      if (!session) { loginForm.hidden = false; panel.hidden = true; return; }
      const { data: isAdmin, error } = await db().rpc("is_admin");
      if (error || !isAdmin) {
        await db().auth.signOut();
        loginForm.hidden = false; panel.hidden = true;
        showMessage(loginNotice, "這個帳號尚未取得管理員權限，已安全登出。", "error");
        return;
      }
      loginForm.hidden = true; panel.hidden = false;
      $("#admin-email").textContent = session.user.email || "管理員";
      await loadAdminCases();
    }
    loginForm.addEventListener("submit", async e => {
      e.preventDefault();
      const button = $("button[type=submit]", loginForm);
      button.disabled = true;
      const { error } = await db().auth.signInWithPassword({
        email: $("#admin-email-input").value.trim(), password: $("#admin-password").value
      });
      button.disabled = false;
      if (error) return showMessage(loginNotice, "登入失敗，請確認電子郵件、密碼及信箱驗證狀態。", "error");
      await checkSession();
    });
    logout?.addEventListener("click", async () => { await db().auth.signOut(); location.reload(); });
    $("#admin-refresh")?.addEventListener("click", loadAdminCases);
    $("#admin-status-filter")?.addEventListener("change", loadAdminCases);
    await checkSession();
  }
  async function loadAdminCases() {
    const list = $("#admin-case-list");
    if (!list) return;
    list.innerHTML = '<p class="loading">正在調閱月球機密卷宗……</p>';
    const status = $("#admin-status-filter")?.value || "pending";
    const { data, error } = await db().from("cases")
      .select("*").eq("status", status).order("created_at", { ascending: false });
    if (error) {
      list.innerHTML = '<p class="empty">無法讀取案件。請確認管理員登入及資料庫 RLS 設定。</p>';
      console.error(error); return;
    }
    if (!data?.length) { list.innerHTML = '<p class="empty">這個分類目前沒有案件。月球今天很安靜。</p>'; return; }
    list.innerHTML = data.map(c => `
      <article class="admin-card" data-id="${escapeHTML(c.id)}">
        <div class="case-meta"><span class="tag">${escapeHTML(c.category || "未分類")}</span><span>${escapeHTML(formatDate(c.created_at))}</span></div>
        <h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.description)}</p>
        ${c.result ? `<p><strong>結果：</strong>${escapeHTML(c.result)}</p>` : ""}
        ${c.treatment ? `<p><strong>處置：</strong>${escapeHTML(c.treatment)}</p>` : ""}
        ${c.note ? `<p><strong>備註：</strong>${escapeHTML(c.note)}</p>` : ""}
        ${status === "pending" ? `<div class="admin-actions"><button class="button approve" data-action="approved">核准公開</button><button class="button reject" data-action="rejected">退回案件</button></div>` : ""}
        ${status !== "pending" ? `<p class="small-note">審核時間：${escapeHTML(formatDate(c.reviewed_at))}</p>` : ""}
      </article>`).join("");
    $$(".admin-card [data-action]", list).forEach(button => button.addEventListener("click", async () => {
      const card = button.closest(".admin-card");
      const id = card.dataset.id, newStatus = button.dataset.action;
      const label = newStatus === "approved" ? "核准公開" : "退回";
      if (!confirm(`確定要${label}這件案件嗎？`)) return;
      card.querySelectorAll("button").forEach(b => b.disabled = true);
      const { data: { user } } = await db().auth.getUser();
      const { error } = await db().from("cases").update({
        status: newStatus, reviewed_at: new Date().toISOString(), reviewed_by: user.id
      }).eq("id", id);
      if (error) {
        console.error(error); card.querySelectorAll("button").forEach(b => b.disabled = false);
        alert("更新失敗，請確認管理員權限及 RLS 設定。"); return;
      }
      await loadAdminCases();
    }));
  }
  document.addEventListener("DOMContentLoaded", () => {
    $("#case-form")?.addEventListener("submit", submitCase);
    $("#case-search")?.addEventListener("input", renderArchive);
    $("#case-filter")?.addEventListener("change", renderArchive);
    if ($("#case-list")) loadArchive();
    initAdmin();
    const year = $("#year"); if (year) year.textContent = new Date().getFullYear();
  });
})();
