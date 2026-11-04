(function () {
  const url = window.MOONLIGHT_SUPABASE_URL;
  const key = window.MOONLIGHT_SUPABASE_KEY;
  if (!window.supabase || !url || !key) {
    console.error("Supabase 初始化失敗：請確認 CDN 與 config.js。");
    return;
  }
  window.moonlightDB = window.supabase.createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
})();
