import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, User, Calendar, FileText, FlaskConical, Phone, Eye, Shield, ChevronRight, Activity, Send, Download, Clock, CheckCircle2, AlertCircle, Printer, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockLabPatients, mockLabPatientAnalysesHistory } from "@/data/mockData";

type DetailTab = "info" | "analyses" | "results";

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  in_progress: { label: "En cours", class: "bg-primary/10 text-primary", icon: Clock },
  ready: { label: "Prêt", class: "bg-accent/10 text-accent", icon: CheckCircle2 },
  waiting: { label: "En attente", class: "bg-warning/10 text-warning", icon: AlertCircle },
  sent: { label: "Envoyé", class: "bg-muted text-muted-foreground", icon: CheckCircle2 },
};

const LaboratoryPatients = () => {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<typeof mockLabPatients[0] | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("info");

  const filtered = mockLabPatients.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
  );

  const patientAnalyses = selectedPatient ? (mockLabPatientAnalysesHistory[selectedPatient.name] || []) : [];

  return (
    <DashboardLayout role="laboratory" title="Patients">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un patient..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} patient(s)</p>
        </div>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-foreground">{mockLabPatients.length}</p><p className="text-[11px] text-muted-foreground">Total patients</p></div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-warning">{mockLabPatients.filter(p => p.status === "waiting").length}</p><p className="text-[11px] text-muted-foreground">En attente</p></div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-primary">{mockLabPatients.filter(p => p.status === "in_progress").length}</p><p className="text-[11px] text-muted-foreground">En cours</p></div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-accent">{mockLabPatients.filter(p => p.status === "ready").length}</p><p className="text-[11px] text-muted-foreground">Prêts</p></div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 text-xs font-medium text-muted-foreground">Patient</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Dernière analyse</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Date</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground">Statut</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((p, i) => {
                  const sc = statusConfig[p.status];
                  return (
                    <tr key={i} className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedPatient?.name === p.name ? "bg-primary/5" : ""}`}
                      onClick={() => { setSelectedPatient(p); setDetailTab("info"); }}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{p.avatar}</div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-foreground text-sm">{p.name}</span>
                              {p.cnam && <Shield className="h-3 w-3 text-primary" />}
                            </div>
                            <span className="text-[11px] text-muted-foreground">{p.age} ans</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground hidden sm:table-cell">{p.lastAnalysis}</td>
                      <td className="p-4 text-xs text-muted-foreground hidden md:table-cell">{p.date}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 w-fit ${sc.class}`}>
                          <sc.icon className="h-3 w-3" />{sc.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-semibold text-foreground">{p.total}</span>
                        <span className="text-xs text-muted-foreground"> analyses</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Patient detail with tabs */}
          <div className="rounded-xl border bg-card shadow-card">
            {selectedPatient ? (
              <div>
                <div className="p-5 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">{selectedPatient.avatar}</div>
                    <div>
                      <h3 className="font-bold text-foreground">{selectedPatient.name}</h3>
                      <p className="text-xs text-muted-foreground">{selectedPatient.age} ans · {selectedPatient.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                  {([
                    { key: "info" as DetailTab, label: "Infos", icon: User },
                    { key: "analyses" as DetailTab, label: "Analyses", icon: FlaskConical },
                  ]).map(t => (
                    <button key={t.key} onClick={() => setDetailTab(t.key)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${detailTab === t.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                      <t.icon className="h-3 w-3" />{t.label}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {detailTab === "info" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground">Téléphone</p><p className="text-xs font-medium text-foreground">{selectedPatient.phone}</p></div>
                        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3"><p className="text-[10px] text-primary font-medium flex items-center gap-1"><Shield className="h-3 w-3" />Assurance</p><p className="text-xs font-semibold text-foreground">{selectedPatient.cnam ? "CNAM" : "Privée"}</p></div>
                        <div className="rounded-lg bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground">Total analyses</p><p className="text-xs font-bold text-foreground">{selectedPatient.total}</p></div>
                        <div className="rounded-lg bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground">Dernière</p><p className="text-xs font-medium text-foreground">{selectedPatient.lastAnalysis}</p></div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <Button variant="outline" size="sm" className="w-full text-xs justify-start"><FlaskConical className="h-3.5 w-3.5 mr-2 text-primary" />Nouvelle analyse</Button>
                        <Button variant="outline" size="sm" className="w-full text-xs justify-start"><FileText className="h-3.5 w-3.5 mr-2 text-accent" />Voir les résultats</Button>
                        <Button variant="outline" size="sm" className="w-full text-xs justify-start"><Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />Appeler</Button>
                        <Button variant="outline" size="sm" className="w-full text-xs justify-start"><Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />Envoyer email</Button>
                      </div>
                    </div>
                  )}

                  {detailTab === "analyses" && (
                    <div className="space-y-3">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Historique des analyses</p>
                      {patientAnalyses.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">Aucune analyse enregistrée</p>
                      ) : (
                        <div className="space-y-2">
                          {patientAnalyses.map(a => {
                            const sc = statusConfig[a.status];
                            return (
                              <div key={a.id} className="rounded-lg border p-3 hover:bg-muted/20 transition-colors">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-medium text-foreground">{a.type}</p>
                                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium flex items-center gap-0.5 ${sc.class}`}>
                                    <sc.icon className="h-2.5 w-2.5" />{sc.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                  <span>{a.id}</span><span>·</span><span>{a.date}</span><span>·</span>
                                  <span>{a.doctor}</span><span>·</span>
                                  <span className="font-medium text-foreground">{a.amount}</span>
                                </div>
                                {(a.status === "ready") && (
                                  <div className="flex gap-1.5 mt-2">
                                    <Button variant="outline" size="sm" className="h-6 text-[9px]"><Download className="h-2.5 w-2.5 mr-0.5" />PDF</Button>
                                    <Button size="sm" className="h-6 text-[9px] gradient-primary text-primary-foreground"><Send className="h-2.5 w-2.5 mr-0.5" />Envoyer</Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FlaskConical className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Sélectionnez un patient pour voir ses détails</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryPatients;
