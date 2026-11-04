const isSubpage = location.pathname.includes("/pages/");
const dataPath = isSubpage ? "../data/cases.json" : "data/cases.json";
const severityText = {low:"一級・小小清醒",mid:"二級・翻來覆去",high:"三級・徹底失眠"};

async function loadCases() {
  try {
    const response = await fetch(dataPath);
    if (!response.ok) throw new Error("無法讀取案件資料");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

function caseCard(item) {
  return `<article class="case-card">
    <div class="case-card-top"><span class="case-emoji">${item.emoji}</span><span class="severity ${item.severity}">${item.severityLabel}</span></div>
    <p class="case-id">${item.id}　/　${item.category}</p>
    <h3>${escapeHTML(item.title)}</h3>
    <p>${escapeHTML(item.description)}</p>
    <div class="case-result"><strong>局方處理</strong><span>${escapeHTML(item.treatment)}</span></div>
    <p class="case-note">「${escapeHTML(item.note)}」</p>
  </article>`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}

document.querySelectorAll(".menu-toggle").forEach(button => {
  button.addEventListener("click", () => {
    const nav = document.querySelector(".nav");
    const open = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
  });
});

loadCases().then(cases => {
  const featured = document.querySelector("#featured-cases");
  if (featured) featured.innerHTML = cases.slice(0,3).map(caseCard).join("");
  const archive = document.querySelector("#archive-cases");
  if (archive) {
    const search = document.querySelector("#search-input");
    const filter = document.querySelector("#severity-filter");
    const empty = document.querySelector("#empty-state");
    const render = () => {
      const query = search.value.trim().toLowerCase();
      const selected = cases.filter(item => {
        const matchesText = [item.id,item.title,item.category,item.description].join(" ").toLowerCase().includes(query);
        return matchesText && (filter.value === "all" || item.severity === filter.value);
      });
      archive.innerHTML = selected.map(caseCard).join("");
      empty.hidden = selected.length !== 0;
    };
    search.addEventListener("input", render);
    filter.addEventListener("change", render);
    render();
  }
  const count = document.querySelector("#case-count");
  if (count) count.textContent = String(cases.length).padStart(3,"0");
});

const reportForm = document.querySelector("#report-form");
if (reportForm) {
  reportForm.addEventListener("submit", event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(reportForm).entries());
    const id = "MOON-" + String(Date.now()).slice(-5);
    const receipt = document.querySelector("#receipt");
    receipt.hidden = false;
    receipt.innerHTML = `<p class="eyebrow">✦ OFFICIAL RECEIPT ✦</p><h2>案件已送達月球總部！</h2><p>案件編號：<strong>${id}</strong></p><h3>${escapeHTML(values.title)}</h3><p>${escapeHTML(values.description)}</p><p>事件等級：${severityText[values.severity]}</p><p>局長批示：已收到！請先喝口水，剩下的明天再煩惱。</p><small>此回條僅供本次瀏覽展示，重新整理後不會保留。</small>`;
    receipt.scrollIntoView({behavior:"smooth",block:"center"});
    reportForm.reset();
  });
}