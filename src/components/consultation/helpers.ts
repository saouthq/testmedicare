export function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function openPrintWindow(title: string, bodyHtml: string) {
  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!w) return;
  w.document.open();
  w.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    h1,h2,h3 { margin: 0 0 10px 0; }
    .muted { color: #666; font-size: 12px; }
    .box { border: 1px solid #ddd; border-radius: 12px; padding: 16px; }
    ul { padding-left: 18px; }
    li { margin: 6px 0; }
    .row { display: flex; justify-content: space-between; gap: 12px; }
    hr { border: none; border-top: 1px solid #eee; margin: 14px 0; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`);
  w.document.close();
  w.focus();
  window.setTimeout(() => { try { w.print(); } catch { /* no-op */ } }, 250);
}

export function autoGrowCompact(el: HTMLTextAreaElement) {
  try {
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  } catch { /* no-op */ }
}
