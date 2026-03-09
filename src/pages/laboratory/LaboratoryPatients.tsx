/**
 * Laboratory Patients — Search patient → see all their demands + PDFs
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, User, FlaskConical, Phone, Shield, FileText, Download, Send, Lock, Activity, Inbox, CheckCircle2, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockLabPatients, mockLabDemands, type LabDemand } from "@/data/mocks/lab";

const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
  received:       { label: "Reçue",          cls: "bg-warning/10 text-warning", icon: Inbox },
  in_progress:    { label: "En cours",       cls: "bg-primary/10 text-primary", icon: Activity },
  results_ready:  { label: "Résultat prêt",  cls: "bg-accent/10 text-accent",   icon: CheckCircle2 },
  transmitted:    { label: "Transmis",        cls: "bg-muted text-muted-foreground", icon: Send },
};

const LaboratoryPatients = () => {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<typeof mockLabPatients[0] | null>(null);

  const filtered = mockLabPatients.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
  );

  // Get all demands for selected patient
  const patientDemands: LabDemand[] = selectedPatient
    ? mockLabDemands.filter(d => d.patient === selectedPatient.name)
    : [];

  return (
    <DashboardLayout role="laboratory" title="Patients">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un patient (nom, téléphone)..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} patient(s)</p>
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
                      <span className="text-sm font-semibold text-foreground">{p.totalDemands}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Patient detail sidebar ── */}
          <div className="rounded-xl border bg-card shadow-card">
            {selectedPatient ? (
              <div>
                <div className="p-5 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">{selectedPatient.avatar}</div>
                    <div>
                      <h3 className="font-bold text-foreground">{selectedPatient.name}</h3>
                      <p className="text-xs text-muted-foreground">Né(e) le {selectedPatient.dob}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Info cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />Téléphone</p>
                      <p className="text-xs font-medium text-foreground">{selectedPatient.phone}</p>
                    </div>
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                      <p className="text-[10px] text-primary font-medium flex items-center gap-1"><Shield className="h-3 w-3" />Assurance</p>
                      <p className="text-xs font-semibold text-foreground">{selectedPatient.assurance}</p>
                    </div>
                  </div>

                  {/* Patient demands */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Historique demandes ({patientDemands.length})
                    </p>
                    {patientDemands.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">Aucune demande</p>
                    ) : (
                      <div className="space-y-2">
                        {patientDemands.map(d => {
                          const cfg = statusConfig[d.status];
                          return (
                            <div key={d.id} className="rounded-lg border p-3">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-medium text-foreground">{d.id}</p>
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium flex items-center gap-0.5 ${cfg.cls}`}>
                                  <cfg.icon className="h-2.5 w-2.5" />{cfg.label}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground">{d.examens.join(", ")}</p>
                              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />{d.date} · {d.prescriber}
                              </p>
                              {/* PDF list */}
                              {d.pdfs.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {d.pdfs.map(pdf => (
                                    <div key={pdf.id} className="flex items-center justify-between rounded bg-muted/50 px-2 py-1.5">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <FileText className="h-3 w-3 text-destructive shrink-0" />
                                        <span className="text-[10px] text-foreground truncate">{pdf.name}</span>
                                      </div>
                                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Download className="h-3 w-3 text-muted-foreground" /></Button>
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
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FlaskConical className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Sélectionnez un patient</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryPatients;
