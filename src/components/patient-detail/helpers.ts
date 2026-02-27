/**
 * Utilitaires locaux — Dossier Patient
 */
import type { RxDraftItem } from "./types";

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

export function humanSize(bytes?: number) {
  if (!bytes && bytes !== 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} Ko`;
  return `${(kb / 1024).toFixed(1)} Mo`;
}

export const makeCode = (prefix: string) => `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
export const nowAt = () => new Date().toLocaleString();
export const dateLabel = () => new Date().toLocaleDateString();

export const buildRxItemsLabel = (items: RxDraftItem[]) =>
  items
    .filter((it) => (it.medication || "").trim().length > 0)
    .map((it) => {
      const med = (it.medication || "").trim();
      const meta = [it.dosage, it.duration].map((x) => (x || "").trim()).filter(Boolean).join(" · ");
      const instr = (it.instructions || "").trim();
      return `${med}${meta ? ` — ${meta}` : ""}${instr ? ` (${instr})` : ""}`;
    });
