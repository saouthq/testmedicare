/**
 * Laboratory Patients — Derived from labStore demands (no separate mock).
 * Shows unique patients with their demand history.
 * // TODO BACKEND: GET /api/lab/patients
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  Search, User, FlaskConical, Phone, Shield, FileText, Download,
  Send, Lock, Activity, Inbox, CheckCircle2, Calendar, Stethoscope, Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSharedLabDemands, type SharedLabDemand } from "@/stores/labStore";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
  received:       { label: "Reçue",         cls: "bg-warning/10 text-warning",          icon: Inbox },
  in_progress:    { label: "En cours",      cls: "bg-primary/10 text-primary",          icon: Activity },
  results_ready:  { label: "Résultat prêt", cls: "bg-accent/10 text-accent",            icon: CheckCircle2 },
  transmitted:    { label: "Transmis",      cls: "bg-muted text-muted-foreground",      icon: Send },
};

interface DerivedPatient {
  name: string;
  avatar: string;
  dob: string;
  assurance: string;
  demandCount: number;
  lastDemand: string;
}

const LaboratoryPatients = () => {
  const [search, setSearch] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [demands] = useSharedLabDemands();

  // Derive unique patients from demands
  const patients = useMemo<DerivedPatient[]>(() => {
    const map = new Map<string, DerivedPatient>();
    demands.forEach(d => {
      const existing = map.get(d.patient);
      if (!existing) {
        map.set(d.patient, {
          name: d.patient,
          avatar: d.avatar,
          dob: d.patientDob,
          assurance: d.assurance,
          demandCount: 1,
          lastDemand: d.date,
        });
      } else {
        existing.demandCount++;
      }
    });
    return Array.from(map.values()).sort((a, b) => b.demandCount - a.demandCount);
  }, [demands]);

  const filtered = patients.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedPatient = selectedName ? patients.find(p => p.name === selectedName) : null;
  const patientDemands = selectedName ? demands.filter(d => d.patient === selectedName) : [];

  return (
    <DashboardLayout role="laboratory" title="Patients">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un patient..." className="pl-10 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} patient(s) · {demands.length} demande(s)</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* ── Patient list ── */}
          <div className="lg:col-span-2">
            <div className="grid gap-2 sm:grid-cols-2">
              {filtered.map(p => (
                <button key={p.name}
                  onClick={() => setSelectedName(p.name)}
                  className={`text-left rounded-xl border bg-card p-4 shadow-card transition-all hover:shadow-card-hover ${
                    selectedName === p.name ? "ring-2 ring-primary/30 border-primary/30" : ""
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{p.avatar}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">Né(e) le {p.dob}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-primary">{p.demandCount}</p>
                      <p className="text-[9px] text-muted-foreground">demandes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {p.assurance !== "Sans assurance" ? (
                      <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                        <Shield className="h-2.5 w-2.5" />{p.assurance}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Sans assurance</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Aucun patient trouvé</p>
              </div>
            )}
          </div>

          {/* ── Patient detail sidebar ── */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            {selectedPatient ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{selectedPatient.avatar}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedPatient.name}</h3>
                    <p className="text-xs text-muted-foreground">{selectedPatient.dob}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">{selectedPatient.assurance}</span>
                </div>

                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-primary" />Historique ({patientDemands.length})
                </h4>

                <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                  {patientDemands.map(d => {
                    const sc = statusConfig[d.status];
                    const Icon = sc?.icon || Inbox;
                    return (
                      <div key={d.id} className="rounded-lg border p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground">{d.id}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium flex items-center gap-1 ${sc?.cls}`}>
                            <Icon className="h-3 w-3" />{sc?.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground">{d.examens.join(", ")}</p>
                        <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{d.date}</span>
                          <span className="flex items-center gap-1"><Stethoscope className="h-3 w-3" />{d.prescriber}</span>
                        </div>
                        {d.pdfs.length > 0 && (
                          <div className="space-y-1">
                            {d.pdfs.map(pdf => (
                              <div key={pdf.id} className="flex items-center justify-between rounded bg-muted/50 px-2 py-1">
                                <span className="text-[9px] text-foreground flex items-center gap-1">
                                  <FileText className="h-3 w-3 text-accent" />{pdf.name}
                                </span>
                                <button onClick={() => toast.info(`Téléchargement ${pdf.name} (mock)`)} className="text-primary hover:text-primary/80" aria-label="Télécharger">
                                  <Download className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <User className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">Sélectionnez un patient</p>
                <p className="text-[10px] text-muted-foreground mt-1">pour voir son historique d'analyses</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryPatients;
