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

/** Parsing "20 Fév 2026" (format mock FR) -> timestamp for stable filtering/sorting. */
export const parseFrDate = (value: string | null): number => {
  if (!value) return 0;
  const parts = value.trim().split(/\s+/);
  if (parts.length < 3) return 0;
  const day = Number(parts[0]);
  const monRaw = parts[1].toLowerCase();
  const year = Number(parts[2]);
  const monthMap: Record<string, number> = {
    jan: 0, janv: 0, fev: 1, fév: 1, fevr: 1, févr: 1,
    mar: 2, mars: 2, avr: 3, avril: 3, mai: 4,
    jun: 5, juin: 5, jul: 6, juil: 6,
    aou: 7, aoû: 7, aout: 7, août: 7,
    sep: 8, sept: 8, oct: 9, nov: 10, dec: 11, déc: 11,
  };
  const key = monRaw.replace(".", "");
  const month = monthMap[key] ?? monthMap[key.slice(0, 3)] ?? 0;
  const d = new Date(year, month, Number.isFinite(day) ? day : 1);
  return d.getTime();
};

/** Parsing "09:30" -> minutes for time-based sorting. */
export const parseTimeToMinutes = (t: string): number => {
  const [hh, mm] = (t || "").split(":");
  const h = Number(hh);
  const m = Number(mm);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
};

/** cx utility for conditional classNames */
export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

/** Now timestamp as locale string */
export const nowAt = () => new Date().toLocaleString();

/** Today label in FR format */
export const dateLabel = () => new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

/** Generate a mock code like "ORD-2026-001" */
export const makeCode = (prefix: string) => {
  const y = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 900) + 100;
  return `${prefix}-${y}-${String(seq).padStart(3, "0")}`;
};
