/**
 * Laboratory Inbox — Now uses cross-role labStore for persistent state.
 * Status changes + PDF uploads persist in localStorage and notify patient/doctor.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import {
  FlaskConical, Search, Clock, CheckCircle2, AlertCircle, Activity,
  Shield, Eye, Send, Inbox, Upload, FileText, Download, Trash2, X,
  User, Calendar, Stethoscope, Lock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { LabDemandStatus } from "@/stores/labStore";
import type { LabPdfItem as LabPdf } from "@/stores/labStore";
import { toast } from "sonner";
import {
  useSharedLabDemands,
  updateLabDemandStatus, addLabPdf, removeLabPdf,
  type SharedLabDemand,
} from "@/stores/labStore";

const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
  received:       { label: "Reçue",          cls: "bg-warning/10 text-warning", icon: Inbox },
  in_progress:    { label: "En cours",       cls: "bg-primary/10 text-primary", icon: Activity },
  results_ready:  { label: "Résultat prêt",  cls: "bg-accent/10 text-accent",   icon: CheckCircle2 },
  transmitted:    { label: "Transmis",        cls: "bg-muted text-muted-foreground", icon: Send },
};

const LaboratoryAnalyses = () => {
  // Store already seeded centrally by seedStores

  const [demands, setDemands] = useSharedLabDemands();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmTransmit, setConfirmTransmit] = useState(false);

  const selected = selectedId ? demands.find((d) => d.id === selectedId) || null : null;

  const filtered = demands.filter(d => {
    if (filter !== "all" && d.status !== filter) return false;
    if (search && !d.patient.toLowerCase().includes(search.toLowerCase()) && !d.id.toLowerCase().includes(search.toLowerCase()) && !d.prescriber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (a.priority === "urgent" && b.priority !== "urgent") return -1;
    if (b.priority === "urgent" && a.priority !== "urgent") return 1;
    const order: Record<string, number> = { received: 0, in_progress: 1, results_ready: 2, transmitted: 3 };
    return (order[a.status] || 0) - (order[b.status] || 0);
  });

  /* ── Status transitions — writes to store + notifications ── */
  const handleSetStatus = (id: string, status: LabDemandStatus) => {
    updateLabDemandStatus(id, status);
    const labels: Record<string, string> = { in_progress: "En cours", results_ready: "Résultat prêt", transmitted: "Transmis" };
    toast.success(`Demande ${id} → ${labels[status]}`);
    if (status === "transmitted") {
      toast.info("📤 Notification envoyée au médecin et au patient");
    }
  };

  /* ── Mock PDF upload — writes to store ── */
  const handleUploadPdf = (id: string) => {
    const newPdf = {
      id: `PDF-${Date.now()}`,
      name: `Resultat_${id}_${Date.now().toString(36)}.pdf`,
      size: `${Math.floor(Math.random() * 400 + 100)} Ko`,
      uploadedAt: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
    };
    addLabPdf(id, newPdf);
    toast.success("PDF ajouté");
  };

  /* ── Delete PDF — writes to store ── */
  const handleDeletePdf = (demandId: string, pdfId: string) => {
    removeLabPdf(demandId, pdfId);
    toast.success("PDF supprimé");
  };

  /* ── Transmit with confirmation ── */
  const handleTransmit = () => {
    if (!selected) return;
    handleSetStatus(selected.id, "transmitted");
    setConfirmTransmit(false);
  };

  const isLocked = selected?.status === "transmitted";

  return (
    <DashboardLayout role="laboratory" title="Demandes d'analyses">
      <div className="space-y-5">
        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
              {[
                { key: "all", label: "Toutes" },
                { key: "received", label: `Reçues (${demands.filter(d => d.status === "received").length})` },
                { key: "in_progress", label: "En cours" },
                { key: "results_ready", label: "Prêtes" },
                { key: "transmitted", label: "Transmises" },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Patient, ID, médecin..." className="pl-9 h-9 w-52 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} demande(s)</p>
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4 text-xs font-medium text-muted-foreground">Demande</th>
                <th className="p-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Examens</th>
                <th className="p-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Prescripteur</th>
                <th className="p-4 text-xs font-medium text-muted-foreground">Statut</th>
                <th className="p-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">PDFs</th>
                <th className="p-4 text-xs font-medium text-muted-foreground w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(d => {
                const cfg = statusConfig[d.status];
                return (
                  <tr key={d.id}
                    className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedId === d.id ? "bg-primary/5" : ""} ${d.priority === "urgent" ? "border-l-4 border-l-destructive" : ""}`}
                    onClick={() => { setSelectedId(d.id); setConfirmTransmit(false); }}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          d.priority === "urgent" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                        }`}>{d.avatar}</div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-foreground text-sm">{d.patient}</span>
                            {d.priority === "urgent" && <span className="text-[9px] bg-destructive/10 text-destructive px-1 py-0.5 rounded font-medium">URG</span>}
                          </div>
                          <span className="text-[11px] text-muted-foreground">{d.id} · {d.date}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground hidden sm:table-cell max-w-48 truncate">{d.examens.join(", ")}</td>
                    <td className="p-4 text-xs text-muted-foreground hidden md:table-cell">{d.prescriber}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 w-fit ${cfg.cls}`}>
                        <cfg.icon className="h-3 w-3" />{cfg.label}
                      </span>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      {d.pdfs.length > 0 ? (
                        <span className="flex items-center gap-1 text-xs text-accent font-medium"><FileText className="h-3.5 w-3.5" />{d.pdfs.length}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={e => { e.stopPropagation(); setSelectedId(d.id); }}>
                        <Eye className="h-3 w-3 mr-1" />Ouvrir
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12"><FlaskConical className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">Aucune demande</p></div>
          )}
        </div>
      </div>

      {/* ══ Detail Drawer ══ */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedId(null)}>
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-fade-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`h-11 w-11 rounded-full flex items-center justify-center text-xs font-bold ${
                  selected.priority === "urgent" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                }`}>{selected.avatar}</div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selected.id}</h3>
                  <p className="text-xs text-muted-foreground">{selected.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                <button onClick={() => setSelectedId(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
            </div>

            {/* Patient info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />Patient</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{selected.patient}</p>
                <p className="text-[10px] text-muted-foreground">Né(e) le {selected.patientDob}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" />Assurance</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{selected.assurance}</p>
                {selected.numAssurance && <p className="text-[10px] text-muted-foreground">N° {selected.numAssurance}</p>}
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Stethoscope className="h-3 w-3" />Prescripteur</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{selected.prescriber}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] text-muted-foreground">Montant</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{selected.amount}</p>
              </div>
            </div>

            {/* Examens */}
            <div className="rounded-lg border p-3 mb-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Examens demandés</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.examens.map((ex, i) => (
                  <span key={i} className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">{ex}</span>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selected.notes && (
              <div className="rounded-lg bg-warning/5 border border-warning/20 p-3 mb-4">
                <p className="text-[10px] text-warning font-medium mb-1">Note interne</p>
                <p className="text-xs text-foreground">{selected.notes}</p>
              </div>
            )}

            {/* PDF Results zone */}
            <div className="rounded-lg border p-3 mb-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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
                          <p className="text-[10px] text-muted-foreground">{pdf.size} · {pdf.uploadedAt}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.info("Téléchargement PDF (mock)")}><Download className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                        {!isLocked && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDeletePdf(selected.id, pdf.id)}>
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

            {/* Status */}
            <div className="mb-4">
              <span className={`rounded-full px-3 py-1 text-xs font-medium border flex items-center gap-1.5 w-fit ${statusConfig[selected.status].cls}`}>
                {(() => { const I = statusConfig[selected.status].icon; return <I className="h-3.5 w-3.5" />; })()}
                {statusConfig[selected.status].label}
              </span>
            </div>

            {/* Action buttons */}
            {!isLocked && (
              <div className="space-y-2">
                {selected.status === "received" && (
                  <Button size="sm" className="w-full gradient-primary text-primary-foreground text-xs" onClick={() => handleSetStatus(selected.id, "in_progress")}>
                    <Activity className="h-3.5 w-3.5 mr-1.5" />Passer en cours
                  </Button>
                )}
                {selected.status === "in_progress" && (
                  <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs"
                    disabled={selected.pdfs.length === 0}
                    onClick={() => handleSetStatus(selected.id, "results_ready")}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    {selected.pdfs.length === 0 ? "Uploadez au moins 1 PDF" : "Marquer résultat prêt"}
                  </Button>
                )}
                {selected.status === "results_ready" && !confirmTransmit && (
                  <Button size="sm" className="w-full text-xs" variant="outline" onClick={() => setConfirmTransmit(true)}>
                    <Send className="h-3.5 w-3.5 mr-1.5" />Transmettre au médecin
                  </Button>
                )}
                {confirmTransmit && (
                  <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 space-y-2">
                    <p className="text-xs text-warning font-medium">Confirmer la transmission ?</p>
                    <p className="text-[10px] text-muted-foreground">Les résultats seront envoyés et la demande sera verrouillée.</p>
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
