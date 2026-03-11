/**
 * Laboratory Patients — Uses cross-role labStore for real-time demand data.
 * Search patient → see all their demands + PDFs.
 * // TODO BACKEND: GET /api/lab/patients
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { Search, User, FlaskConical, Phone, Shield, FileText, Download, Send, Lock, Activity, Inbox, CheckCircle2, Calendar, Eye, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockLabPatients } from "@/data/mocks/lab";
import { useSharedLabDemands, type SharedLabDemand } from "@/stores/labStore";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
  received:       { label: "Reçue",          cls: "bg-warning/10 text-warning", icon: Inbox },
  in_progress:    { label: "En cours",       cls: "bg-primary/10 text-primary", icon: Activity },
  results_ready:  { label: "Résultat prêt",  cls: "bg-accent/10 text-accent",   icon: CheckCircle2 },
  transmitted:    { label: "Transmis",        cls: "bg-muted text-muted-foreground", icon: Send },
};

const LaboratoryPatients = () => {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<typeof mockLabPatients[0] | null>(null);

  // Use cross-role store for real-time demand data
  useEffect(() => {
    initLabStoreIfEmpty(mockLabDemands as SharedLabDemand[]);
  }, []);

  const [demands] = useSharedLabDemands();

  const filtered = mockLabPatients.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
  );

  // Get all demands for selected patient from cross-role store (real-time)
  const patientDemands = selectedPatient
    ? demands.filter(d => d.patient === selectedPatient.name)
    : [];

  // Count demands per patient from store
  const demandCounts = new Map<string, number>();
  demands.forEach(d => demandCounts.set(d.patient, (demandCounts.get(d.patient) || 0) + 1));

  return (
    <DashboardLayout role="laboratory" title="Patients">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un patient (nom, téléphone)..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} patient(s) · {demands.length} demande(s) totales</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Patient list ── */}
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 text-xs font-medium text-muted-foreground">Patient</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Assurance</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Téléphone</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground">Demandes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((p, i) => (
                  <tr key={i}
                    className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedPatient?.name === p.name ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedPatient(p)}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{p.avatar}</div>
                        <div>
                          <span className="font-medium text-foreground text-sm">{p.name}</span>
                          <p className="text-[11px] text-muted-foreground">Né(e) le {p.dob}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      {p.assurance !== "Sans assurance" ? (
                        <span className="flex items-center gap-1 text-xs text-primary font-medium"><Shield className="h-3 w-3" />{p.assurance}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sans assurance</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground hidden md:table-cell">{p.phone}</td>
                    <td className="p-4">
                      <span className="text-sm font-semibold text-foreground">{demandCounts.get(p.name) || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Patient detail sidebar ── */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            {selectedPatient ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{selectedPatient.avatar}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedPatient.name}</h3>
                    <p className="text-xs text-muted-foreground">{selectedPatient.dob} · {selectedPatient.phone}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">{selectedPatient.assurance}</span>
                </div>

                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-primary" />
                  Demandes ({patientDemands.length})
                </h4>

                {patientDemands.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">Aucune demande trouvée</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {patientDemands.map(d => {
                      const sc = statusConfig[d.status];
                      const Icon = sc?.icon || Inbox;
                      return (
                        <div key={d.id} className="rounded-lg border p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground">{d.id}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 ${sc?.cls}`}>
                              <Icon className="h-3 w-3" />{sc?.label}
                            </span>
                          </div>
                          <p className="text-xs text-foreground">{d.examens.join(", ")}</p>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{d.date}</span>
                            <span className="flex items-center gap-1"><Stethoscope className="h-3 w-3" />{d.prescriber}</span>
                          </div>
                          {d.pdfs.length > 0 && (
                            <div className="space-y-1">
                              {d.pdfs.map(pdf => (
                                <div key={pdf.id} className="flex items-center justify-between rounded bg-muted/50 px-2 py-1">
                                  <span className="text-[10px] text-foreground flex items-center gap-1">
                                    <FileText className="h-3 w-3 text-primary" />{pdf.name}
                                  </span>
                                  <button onClick={() => toast.success(`Téléchargement ${pdf.name} (mock)`)} className="text-primary hover:text-primary/80">
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
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <User className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">Sélectionnez un patient pour voir ses demandes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryPatients;
