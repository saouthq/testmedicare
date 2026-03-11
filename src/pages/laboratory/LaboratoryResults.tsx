/**
 * Laboratory Results — Reads from cross-role labStore for persistent state.
 * Shows demands with PDFs attached (results_ready + transmitted).
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { FileText, Download, Send, Eye, Shield, User, Calendar, Search, CheckCircle2, Stethoscope, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSharedLabDemands, type SharedLabDemand } from "@/stores/labStore";
import { toast } from "sonner";

const LaboratoryResults = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "results_ready" | "transmitted">("all");

  // Store already seeded centrally by seedStores

  const [demands] = useSharedLabDemands();

  // Only demands that have PDFs or are results_ready/transmitted
  const withResults = demands.filter(d => d.status === "results_ready" || d.status === "transmitted");

  const filtered = withResults.filter(d => {
    if (search && !d.patient.toLowerCase().includes(search.toLowerCase()) && !d.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    return true;
  });

  return (
    <DashboardLayout role="laboratory" title="Résultats">
      <div className="space-y-6">
        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-9 h-9 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
              {[
                { key: "all" as const, label: "Tous" },
                { key: "results_ready" as const, label: "Prêts" },
                { key: "transmitted" as const, label: "Transmis" },
              ].map(f => (
                <button key={f.key} onClick={() => setFilterStatus(f.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filterStatus === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} résultat(s)</p>
        </div>

        {/* ── Result cards ── */}
        {filtered.map(d => (
          <div key={d.id} className={`rounded-xl border bg-card shadow-card transition-all hover:shadow-card-hover ${d.status === "transmitted" ? "opacity-75" : ""}`}>
            <div className="flex items-start justify-between p-5 border-b flex-wrap gap-3">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">{d.avatar}</div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{d.id}</h3>
                    {d.status === "transmitted" ? (
                      <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs font-medium flex items-center gap-1"><Lock className="h-3 w-3" />Transmis</span>
                    ) : (
                      <span className="rounded-full bg-accent/10 text-accent px-2.5 py-0.5 text-xs font-medium flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Prêt</span>
                    )}
                    {d.assurance !== "Sans assurance" && (
                      <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        <Shield className="h-3 w-3" />{d.assurance}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground mt-1 font-medium">{d.examens.join(", ")}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />{d.patient} · <Stethoscope className="h-3.5 w-3.5" />{d.prescriber} · <Calendar className="h-3.5 w-3.5" />{d.date}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-foreground">{d.amount}</span>
            </div>

            {/* PDF list */}
            <div className="p-5">
              {d.pdfs.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aucun PDF</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Fichiers PDF ({d.pdfs.length})</p>
                  {d.pdfs.map(pdf => (
                    <div key={pdf.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="h-5 w-5 text-destructive shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{pdf.name}</p>
                          <p className="text-[10px] text-muted-foreground">{pdf.size} · {pdf.uploadedAt}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs shrink-0" onClick={() => toast.info("Téléchargement PDF (mock)")}>
                        <Download className="h-3.5 w-3.5 mr-1" />Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun résultat trouvé</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryResults;
