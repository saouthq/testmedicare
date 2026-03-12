/**
 * PrescriptionsComponents — UI de la page Ordonnances.
 * Toolbar, Stats, Liste, Row, Detail Sheet, ActionPalette.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Copy, FileText, Printer, Search, Send } from "lucide-react";
import { usePrescriptions } from "./PrescriptionsContext";
import ActionPaletteShared, { type ActionItem } from "@/components/shared/ActionPalette";
import type { PrescriptionFilter } from "./types";
import type { Prescription } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { isModuleEnabled } from "@/stores/adminModulesStore";
import { useActionGating } from "@/hooks/useActionGating";

/** Check if pharmacy send feature is enabled (module + feature flag) */
function isPharmacySendEnabled(): boolean {
  if (!isModuleEnabled("pharmacy")) return false;
  try {
    const flags = JSON.parse(localStorage.getItem("medicare_admin_features") || "{}");
    if (flags.prescriptionSendPharmacy === false) return false;
  } catch {}
  return true;
}

/* ── Stats ── */
export function PrescriptionsStats() {
  const { totalActive, totalSent, totalPending } = usePrescriptions();
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
      <StatPill label="Actives" value={String(totalActive)} />
      <StatPill label="Envoyées" value={String(totalSent)} />
      <StatPill label="En attente" value={String(totalPending)} />
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card px-3 py-2 shadow-card">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

/* ── Toolbar ── */
export function PrescriptionsToolbar() {
  const { filter, setFilter, q, setQ } = usePrescriptions();
  const filters: Array<{ key: PrescriptionFilter; label: string }> = [
    { key: "all", label: "Toutes" },
    { key: "active", label: "Actives" },
    { key: "expired", label: "Expirées" },
    { key: "sent", label: "Envoyées" },
  ];

  return (
    <div className="rounded-2xl border bg-card shadow-card p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <Button key={f.key} variant={filter === f.key ? "default" : "outline"} size="sm"
              className={cn("text-xs", filter === f.key ? "gradient-primary text-primary-foreground shadow-primary-glow" : "")}
              onClick={() => setFilter(f.key)}>
              {f.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher patient, ordonnance…" className="h-9 pl-9 text-sm" />
          </div>
          <PrescriptionsActionButton />
        </div>
      </div>
    </div>
  );
}

/* ── Actions Button + Palette ── */
function PrescriptionsActionButton() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ctx = usePrescriptions();

  const actions: ActionItem[] = [
    { id: "print-all", label: "Imprimer toutes les ordonnances", hint: "À brancher", group: "Actions", onRun: () => toast({ title: "Impression", description: "À brancher." }) },
    { id: "export-csv", label: "Exporter CSV", hint: "Liste filtrée", group: "Actions", onRun: () => toast({ title: "Export CSV", description: "À brancher." }) },
    { id: "new-rx", label: "Nouvelle ordonnance", hint: "Créer", group: "Actions", onRun: () => toast({ title: "Nouvelle ordonnance", description: "Workflow à brancher." }) },
    { id: "filter-all", label: "Toutes", group: "Filtrer", onRun: () => { ctx.setFilter("all"); } },
    { id: "filter-active", label: "Actives", group: "Filtrer", onRun: () => { ctx.setFilter("active"); } },
    { id: "filter-expired", label: "Expirées", group: "Filtrer", onRun: () => { ctx.setFilter("expired"); } },
    { id: "filter-sent", label: "Envoyées", group: "Filtrer", onRun: () => { ctx.setFilter("sent"); } },
  ];

  const filtered = q.trim()
    ? actions.filter(a => `${a.label} ${a.hint || ""}`.toLowerCase().includes(q.trim().toLowerCase()))
    : actions;

  return (
    <>
      <Button variant="outline" size="sm" className="text-xs" onClick={() => { setOpen(true); setQ(""); }}>
        <Search className="h-3.5 w-3.5 mr-1" />Actions
      </Button>
      <ActionPaletteShared open={open} onClose={() => setOpen(false)} actions={filtered} query={q} onQueryChange={setQ} placeholder="Rechercher une action…" />
    </>
  );
}

/* ── List ── */
export function PrescriptionsList() {
  const { filtered, setSelectedId, setDetailOpen } = usePrescriptions();

  if (!filtered.length) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-muted-foreground font-medium">Aucune ordonnance trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filtered.map((rx) => (
        <PrescriptionRow key={rx.id} rx={rx} onOpen={() => { setSelectedId(rx.id); setDetailOpen(true); }} />
      ))}
    </div>
  );
}

function PrescriptionRow({ rx, onOpen }: { rx: Prescription; onOpen: () => void }) {
  const { handleResend, handlePrint } = usePrescriptions();
  return (
    <div className="rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all p-3 sm:p-4 cursor-pointer" onClick={onOpen}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {(rx.patient || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground truncate">{rx.patient || "—"}</span>
              <Badge variant={rx.status === "active" ? "default" : "secondary"} className="text-[11px]">
                {rx.status === "active" ? "Active" : "Expirée"}
              </Badge>
              {rx.sent && <Badge variant="outline" className="text-[11px]">Envoyée</Badge>}
              {rx.assurance && <Badge variant="outline" className="text-[11px]">Assuré</Badge>}
            </div>
            <div className="text-xs text-muted-foreground truncate">{rx.id} • {rx.date}</div>
            <div className="text-xs text-muted-foreground truncate mt-0.5">{rx.items.join(" • ")}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <div className="text-sm font-semibold text-foreground">{rx.total}</div>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => handlePrint(rx.id)}>
            <Printer className="h-3.5 w-3.5" />
          </Button>
          {!rx.sent && isPharmacySendEnabled() && (
            <Button variant="outline" size="sm" className="text-xs" onClick={() => handleResend(rx.id)}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Detail Sheet ── */
export function PrescriptionDetail() {
  const { selected, detailOpen, setDetailOpen, handlePrint, handleResend, handleDuplicate } = usePrescriptions();

  return (
    <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto max-h-screen">
        {selected ? (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {(selected.patient || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </span>
                <span className="leading-tight">
                  <span className="block text-base">{selected.patient || "—"}</span>
                  <span className="block text-xs text-muted-foreground">{selected.id} • {selected.date}</span>
                </span>
              </SheetTitle>
              <SheetDescription className="text-xs">
                {selected.status === "active" ? "Ordonnance active" : "Ordonnance expirée"}
                {selected.sent ? " • Envoyée" : " • Non envoyée"}
                {selected.assurance ? ` • ${selected.assurance}` : ""}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-4 space-y-4 pb-6">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">Médicaments</div>
                <div className="rounded-xl border bg-card p-3 space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <div className="text-sm text-foreground">{item}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">Détails</div>
                <div className="rounded-xl border bg-card p-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Montant</span><span className="font-medium">{selected.total}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Médecin</span><span className="font-medium">{selected.doctor}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Pharmacie</span><span className="font-medium">{selected.pharmacy || "Non assignée"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Assurance</span><span className="font-medium">{selected.assurance || "Non"}</span></div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => handlePrint(selected.id)}>
                  <Printer className="mr-1 h-3.5 w-3.5" /> Imprimer
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => handleDuplicate(selected.id)}>
                  <Copy className="mr-1 h-3.5 w-3.5" /> Dupliquer
                </Button>
                {!selected.sent && isPharmacySendEnabled() && (
                  <Button size="sm" className="text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleResend(selected.id)}>
                    <Send className="mr-1 h-3.5 w-3.5" /> Envoyer à la pharmacie
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
