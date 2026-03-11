/**
 * Laboratory Analyses — Kanban-style demand management with inline actions.
 * Drag-free kanban: click to advance status. Detail drawer for full view.
 * Uses labStore for persistent cross-role state.
 * // TODO BACKEND: GET/PUT /api/lab/demands
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  FlaskConical, Search, CheckCircle2, AlertCircle, Activity,
  Shield, Eye, Send, Inbox, Upload, FileText, Download, Trash2, X,
  User, Calendar, Stethoscope, Lock, ArrowRight, Clock, ChevronRight,
  Filter, SortAsc
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { LabDemandStatus } from "@/stores/labStore";
import { toast } from "sonner";
import {
  useSharedLabDemands, updateLabDemandStatus, addLabPdf, removeLabPdf,
  type SharedLabDemand,
} from "@/stores/labStore";

const statusConfig: Record<string, { label: string; cls: string; bgCls: string; icon: any; next?: LabDemandStatus; nextLabel?: string }> = {
  received:       { label: "Reçue",         cls: "text-warning",          bgCls: "bg-warning/10 border-warning/30", icon: Inbox, next: "in_progress", nextLabel: "Démarrer l'analyse" },
  in_progress:    { label: "En cours",      cls: "text-primary",          bgCls: "bg-primary/10 border-primary/30", icon: Activity, next: "results_ready", nextLabel: "Marquer résultat prêt" },
  results_ready:  { label: "Résultat prêt", cls: "text-accent",           bgCls: "bg-accent/10 border-accent/30",   icon: CheckCircle2, next: "transmitted", nextLabel: "Transmettre" },
  transmitted:    { label: "Transmis",      cls: "text-muted-foreground", bgCls: "bg-muted border-border",           icon: Send },
};

type ViewMode = "kanban" | "list";

const LaboratoryAnalyses = () => {
  const [demands] = useSharedLabDemands();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmTransmit, setConfirmTransmit] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [filterStatus, setFilterStatus] = useState("all");

  const selected = selectedId ? demands.find(d => d.id === selectedId) || null : null;

  const filtered = useMemo(() => {
    return demands.filter(d => {
      if (filterStatus !== "all" && d.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return d.patient.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) || d.prescriber.toLowerCase().includes(q) || d.examens.some(e => e.toLowerCase().includes(q));
      }
      return true;
    }).sort((a, b) => {
      if (a.priority === "urgent" && b.priority !== "urgent") return -1;
      if (b.priority === "urgent" && a.priority !== "urgent") return 1;
      const order: Record<string, number> = { received: 0, in_progress: 1, results_ready: 2, transmitted: 3 };
      return (order[a.status] || 0) - (order[b.status] || 0);
    });
  }, [demands, search, filterStatus]);

  const handleAdvance = (id: string) => {
    const d = demands.find(dd => dd.id === id);
    if (!d) return;
    const cfg = statusConfig[d.status];
    if (!cfg.next) return;
    // For "results_ready" → "transmitted", require PDFs
    if (d.status === "in_progress" && d.pdfs.length === 0) {
      toast.error("Uploadez au moins 1 PDF avant de marquer comme prêt.");
      return;
    }
    if (d.status === "results_ready") {
      setSelectedId(id);
      setConfirmTransmit(true);
      return;
    }
    updateLabDemandStatus(id, cfg.next);
    toast.success(`${d.id} → ${statusConfig[cfg.next].label}`);
  };

  const handleUploadPdf = (id: string) => {
    const newPdf = {
      id: `PDF-${Date.now()}`,
      name: `Resultat_${id}_${Date.now().toString(36)}.pdf`,
      size: `${Math.floor(Math.random() * 400 + 100)} Ko`,
      uploadedAt: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
    };
    addLabPdf(id, newPdf);
    toast.success("PDF ajouté ✓");
  };

  const handleDeletePdf = (demandId: string, pdfId: string) => {
    removeLabPdf(demandId, pdfId);
    toast.success("PDF supprimé");
  };

  const handleTransmit = () => {
    if (!selected) return;
    updateLabDemandStatus(selected.id, "transmitted");
    toast.success(`📤 ${selected.id} transmis au médecin et au patient`);
    setConfirmTransmit(false);
    setSelectedId(null);
  };

  const isLocked = selected?.status === "transmitted";

  // Kanban columns
  const columns: { key: LabDemandStatus; label: string }[] = [
    { key: "received", label: "Reçues" },
    { key: "in_progress", label: "En cours" },
    { key: "results_ready", label: "Prêtes" },
    { key: "transmitted", label: "Transmis" },
  ];

  const DemandCard = ({ d, compact = false }: { d: SharedLabDemand; compact?: boolean }) => {
    const cfg = statusConfig[d.status];
    return (
      <div
        onClick={() => { setSelectedId(d.id); setConfirmTransmit(false); }}
        className={`rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all cursor-pointer ${
          selectedId === d.id ? "ring-2 ring-primary/30" : ""
        } ${d.priority === "urgent" ? "border-l-3 border-l-destructive" : ""}`}
      >
        <div className={`p-3 ${compact ? "" : "p-4"}`}>
          <div className="flex items-center gap-2.5">
            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              d.priority === "urgent" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
            }`}>{d.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground text-sm truncate">{d.patient}</span>
                {d.priority === "urgent" && <span className="text-[8px] bg-destructive/10 text-destructive px-1 py-0.5 rounded font-bold shrink-0">URG</span>}
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{d.examens.join(", ")}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2.5 gap-2">
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
              <span>{d.id}</span>
              <span>·</span>
              <span>{d.prescriber}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {d.pdfs.length > 0 && (
                <span className="text-[9px] text-accent font-medium flex items-center gap-0.5">
                  <FileText className="h-2.5 w-2.5" />{d.pdfs.length}
                </span>
              )}
              <span className="text-[10px] font-bold text-foreground">{d.amount}</span>
            </div>
          </div>

          {/* Quick action */}
          {cfg.next && d.status !== "transmitted" && (
            <Button size="sm" className={`w-full mt-2.5 text-[10px] h-7 ${
              d.status === "received" ? "gradient-primary text-primary-foreground" : 
              d.status === "in_progress" ? "bg-accent text-accent-foreground hover:bg-accent/90" :
              "bg-card border text-foreground hover:bg-muted"
            }`} onClick={e => { e.stopPropagation(); handleAdvance(d.id); }}>
              {d.status === "in_progress" && d.pdfs.length === 0 ? (
                <><Upload className="h-3 w-3 mr-1" />Uploader PDF d'abord</>
              ) : (
                <><ArrowRight className="h-3 w-3 mr-1" />{cfg.nextLabel}</>
              )}
            </Button>
          )}
          {d.status !== "transmitted" && d.status !== "received" && (
            <Button size="sm" variant="ghost" className="w-full mt-1 text-[10px] h-6 text-muted-foreground" onClick={e => { e.stopPropagation(); handleUploadPdf(d.id); }}>
              <Upload className="h-3 w-3 mr-1" />Ajouter un PDF
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout role="laboratory" title="Demandes d'analyses">
      <div className="space-y-4">
        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            {/* View toggle */}
            <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
              <button onClick={() => setViewMode("kanban")} className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${viewMode === "kanban" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                Kanban
              </button>
              <button onClick={() => setViewMode("list")} className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                Liste
              </button>
            </div>
            {/* Status filter (list mode) */}
            {viewMode === "list" && (
              <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
                {[
                  { key: "all", label: "Toutes" },
                  { key: "received", label: `Reçues (${demands.filter(d => d.status === "received").length})` },
                  { key: "in_progress", label: "En cours" },
                  { key: "results_ready", label: "Prêtes" },
                  { key: "transmitted", label: "Transmis" },
                ].map(f => (
                  <button key={f.key} onClick={() => setFilterStatus(f.key)}
                    className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${filterStatus === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Patient, ID, examen..." className="pl-8 h-8 w-52 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} demande(s)</p>
        </div>

        {/* ══ Kanban View ══ */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map(col => {
              const cfg = statusConfig[col.key];
              const ColIcon = cfg.icon;
              const items = filtered.filter(d => d.status === col.key);
              return (
                <div key={col.key} className="space-y-2">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${cfg.bgCls}`}>
                    <ColIcon className={`h-4 w-4 ${cfg.cls}`} />
                    <span className={`text-xs font-semibold ${cfg.cls}`}>{col.label}</span>
                    <span className={`text-xs font-bold ${cfg.cls} ml-auto bg-background/50 px-1.5 py-0.5 rounded-full`}>{items.length}</span>
                  </div>
                  <div className="space-y-2 min-h-[120px]">
                    {items.map(d => <DemandCard key={d.id} d={d} compact />)}
                    {items.length === 0 && (
                      <div className="text-center py-6 rounded-xl border border-dashed">
                        <CheckCircle2 className="h-6 w-6 text-muted-foreground/20 mx-auto mb-1" />
                        <p className="text-[10px] text-muted-foreground">Aucune demande</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ List View ══ */}
        {viewMode === "list" && (
          <div className="space-y-2">
            {filtered.map(d => <DemandCard key={d.id} d={d} />)}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <FlaskConical className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Aucune demande trouvée</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ Detail Drawer ══ */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => { setSelectedId(null); setConfirmTransmit(false); }}>
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-fade-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`h-11 w-11 rounded-full flex items-center justify-center text-xs font-bold ${
                  selected.priority === "urgent" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                }`}>{selected.avatar}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{selected.patient}</h3>
                    {selected.priority === "urgent" && <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-bold">URGENT</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{selected.id} · {selected.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                <button onClick={() => { setSelectedId(null); setConfirmTransmit(false); }} aria-label="Fermer"><X className="h-5 w-5 text-muted-foreground hover:text-foreground" /></button>
              </div>
            </div>

            {/* Patient info grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { icon: User, label: "Patient", value: selected.patient, sub: `Né(e) le ${selected.patientDob}` },
                { icon: Shield, label: "Assurance", value: selected.assurance, sub: selected.numAssurance ? `N° ${selected.numAssurance}` : undefined },
                { icon: Stethoscope, label: "Prescripteur", value: selected.prescriber },
                { icon: Clock, label: "Montant", value: selected.amount },
              ].map((item, i) => (
                <div key={i} className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1"><item.icon className="h-3 w-3" />{item.label}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{item.value}</p>
                  {item.sub && <p className="text-[9px] text-muted-foreground">{item.sub}</p>}
                </div>
              ))}
            </div>

            {/* Examens */}
            <div className="rounded-lg border p-3 mb-4">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Examens demandés</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.examens.map((ex, i) => (
                  <span key={i} className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[11px] font-medium">{ex}</span>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selected.notes && (
              <div className="rounded-lg bg-warning/5 border border-warning/20 p-3 mb-4">
                <p className="text-[9px] text-warning font-medium mb-1">Note interne</p>
                <p className="text-xs text-foreground">{selected.notes}</p>
              </div>
            )}

            {/* PDFs */}
            <div className="rounded-lg border p-3 mb-4">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Résultats PDF ({selected.pdfs.length})
              </p>
              {selected.pdfs.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">Aucun PDF uploadé</p>
              ) : (
                <div className="space-y-1.5">
                  {selected.pdfs.map(pdf => (
                    <div key={pdf.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-destructive shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{pdf.name}</p>
                          <p className="text-[9px] text-muted-foreground">{pdf.size} · {pdf.uploadedAt}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.info("Téléchargement (mock)")} aria-label="Télécharger">
                          <Download className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        {!isLocked && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDeletePdf(selected.id, pdf.id)} aria-label="Supprimer">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!isLocked && (
                <Button variant="outline" size="sm" className="mt-2 w-full text-xs" onClick={() => handleUploadPdf(selected.id)}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />Ajouter un PDF (mock)
                </Button>
              )}
            </div>

            {/* Status badge */}
            <div className="mb-4">
              <span className={`rounded-full px-3 py-1 text-xs font-medium border flex items-center gap-1.5 w-fit ${statusConfig[selected.status].bgCls} ${statusConfig[selected.status].cls}`}>
                {(() => { const I = statusConfig[selected.status].icon; return <I className="h-3.5 w-3.5" />; })()}
                {statusConfig[selected.status].label}
              </span>
            </div>

            {/* Actions */}
            {!isLocked && (
              <div className="space-y-2">
                {selected.status === "received" && (
                  <Button size="sm" className="w-full gradient-primary text-primary-foreground text-xs" onClick={() => { updateLabDemandStatus(selected.id, "in_progress"); toast.success(`${selected.id} → En cours`); }}>
                    <Activity className="h-3.5 w-3.5 mr-1.5" />Démarrer l'analyse
                  </Button>
                )}
                {selected.status === "in_progress" && (
                  <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs"
                    disabled={selected.pdfs.length === 0}
                    onClick={() => { updateLabDemandStatus(selected.id, "results_ready"); toast.success(`${selected.id} → Résultat prêt`); }}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    {selected.pdfs.length === 0 ? "Uploadez au moins 1 PDF" : "Marquer résultat prêt"}
                  </Button>
                )}
                {selected.status === "results_ready" && !confirmTransmit && (
                  <Button size="sm" className="w-full text-xs" variant="outline" onClick={() => setConfirmTransmit(true)}>
                    <Send className="h-3.5 w-3.5 mr-1.5" />Transmettre au médecin et patient
                  </Button>
                )}
                {confirmTransmit && (
                  <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 space-y-2">
                    <p className="text-xs text-warning font-medium">Confirmer la transmission ?</p>
                    <p className="text-[10px] text-muted-foreground">Les résultats seront envoyés et la demande sera verrouillée en lecture seule.</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="gradient-primary text-primary-foreground text-xs" onClick={handleTransmit}>
                        <Send className="h-3.5 w-3.5 mr-1" />Confirmer
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => setConfirmTransmit(false)}>Annuler</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isLocked && (
              <div className="rounded-lg bg-muted/50 p-3 flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Demande transmise — lecture seule</p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LaboratoryAnalyses;
