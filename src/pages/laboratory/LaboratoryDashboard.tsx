import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  FlaskConical, Clock, CheckCircle2, ChevronRight, Send, Activity,
  Timer, User, Shield, Beaker, Search, Plus, Eye, Download,
  ArrowUp, ArrowDown, Minus, X, Save, AlertCircle, Calendar,
  Printer, Phone, FileText, Filter, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { mockLabAnalysisTypes, mockLabDashboardAnalyses } from "@/data/mockData";

type DashTab = "pipeline" | "results" | "new";
type AnalysisStatus = "waiting" | "in_progress" | "ready" | "sent";

interface DashAnalysis {
  id: number;
  patient: string;
  avatar: string;
  type: string;
  doctor: string;
  status: AnalysisStatus;
  date: string;
  priority: string;
  amount: string;
  progress: number;
  cnam: boolean;
  values?: { name: string; value: string; ref: string; status: string }[];
}

const statusConfig: Record<string, { label: string; class: string; icon: any; order: number }> = {
  waiting: { label: "Prélèvement", class: "bg-warning/10 text-warning border-warning/30", icon: Timer, order: 0 },
  in_progress: { label: "En cours", class: "bg-primary/10 text-primary border-primary/30", icon: Activity, order: 1 },
  ready: { label: "À valider", class: "bg-accent/10 text-accent border-accent/30", icon: CheckCircle2, order: 2 },
  sent: { label: "Envoyé", class: "bg-muted text-muted-foreground", icon: Send, order: 3 },
};

const LaboratoryDashboard = () => {
  const [analyses, setAnalyses] = useState<DashAnalysis[]>(mockLabDashboardAnalyses as DashAnalysis[]);
  const [activeTab, setActiveTab] = useState<DashTab>("pipeline");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState<DashAnalysis | null>(null);

  // New analysis form
  const [newPatient, setNewPatient] = useState("");
  const [newType, setNewType] = useState(mockLabAnalysisTypes[0]);
  const [newDoctor, setNewDoctor] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCnam, setNewCnam] = useState(true);
  const [newPriority, setNewPriority] = useState("normal");

  // Result editing
  const [editingValues, setEditingValues] = useState<{ name: string; value: string; ref: string; status: string }[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const waitingCount = analyses.filter(a => a.status === "waiting").length;
  const inProgressCount = analyses.filter(a => a.status === "in_progress").length;
  const readyCount = analyses.filter(a => a.status === "ready").length;
  const urgentCount = analyses.filter(a => a.priority === "urgent" && a.status !== "sent").length;

  const filtered = analyses.filter(a => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (search && !a.patient.toLowerCase().includes(search.toLowerCase()) && !a.type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    // Urgent first, then by pipeline order
    if (a.priority === "urgent" && b.priority !== "urgent") return -1;
    if (b.priority === "urgent" && a.priority !== "urgent") return 1;
    return statusConfig[a.status].order - statusConfig[b.status].order;
  });

  const handleAdvanceStatus = (id: number) => {
    // TODO BACKEND: PATCH /api/lab/analyses/{id} { status: nextStatus }
    setAnalyses(prev => prev.map(a => {
      if (a.id !== id) return a;
      if (a.status === "waiting") return { ...a, status: "in_progress" as AnalysisStatus, progress: 10 };
      if (a.status === "in_progress") return { ...a, status: "ready" as AnalysisStatus, progress: 100 };
      if (a.status === "ready") return { ...a, status: "sent" as AnalysisStatus };
      return a;
    }));
  };

  const handleAddAnalysis = () => {
    // TODO BACKEND: POST /api/lab/analyses
    if (!newPatient || !newType) return;
    const maxId = Math.max(...analyses.map(a => a.id), 0);
    setAnalyses(prev => [...prev, {
      id: maxId + 1,
      patient: newPatient,
      avatar: newPatient.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase(),
      type: newType,
      doctor: newDoctor || "Dr. —",
      status: "waiting" as AnalysisStatus,
      date: "20 Fév",
      priority: newPriority,
      amount: newAmount || "40 DT",
      progress: 0,
      cnam: newCnam,
    }]);
    setNewPatient(""); setNewDoctor(""); setNewAmount(""); setNewPriority("normal");
    setActiveTab("pipeline");
  };

  const handleStartEdit = (a: DashAnalysis) => {
    if (a.values) {
      setEditingId(a.id);
      setEditingValues([...a.values]);
    }
  };

  const handleSaveEdit = () => {
    // TODO BACKEND: PUT /api/lab/analyses/{id}/results
    if (editingId === null) return;
    setAnalyses(prev => prev.map(a => a.id === editingId ? { ...a, values: editingValues } : a));
    setEditingId(null);
  };

  return (
    <DashboardLayout role="laboratory" title="Tableau de bord">
      <div className="space-y-5">
        {/* Live counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button onClick={() => { setActiveTab("pipeline"); setFilterStatus("waiting"); }}
            className="rounded-xl border bg-warning/5 border-warning/20 p-3 flex items-center gap-3 text-left hover:shadow-sm transition-all">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><Timer className="h-5 w-5 text-warning" /></div>
            <div><p className="text-lg font-bold text-warning">{waitingCount}</p><p className="text-[10px] text-muted-foreground">Prélèvements</p></div>
          </button>
          <button onClick={() => { setActiveTab("pipeline"); setFilterStatus("in_progress"); }}
            className="rounded-xl border bg-primary/5 border-primary/20 p-3 flex items-center gap-3 text-left hover:shadow-sm transition-all">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Activity className="h-5 w-5 text-primary" /></div>
            <div><p className="text-lg font-bold text-primary">{inProgressCount}</p><p className="text-[10px] text-muted-foreground">En cours</p></div>
          </button>
          <button onClick={() => { setActiveTab("pipeline"); setFilterStatus("ready"); }}
            className="rounded-xl border bg-accent/5 border-accent/20 p-3 flex items-center gap-3 text-left hover:shadow-sm transition-all">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-accent" /></div>
            <div><p className="text-lg font-bold text-accent">{readyCount}</p><p className="text-[10px] text-muted-foreground">À valider</p></div>
          </button>
          {urgentCount > 0 ? (
            <div className="rounded-xl border bg-destructive/5 border-destructive/20 p-3 flex items-center gap-3 animate-pulse">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertCircle className="h-5 w-5 text-destructive" /></div>
              <div><p className="text-lg font-bold text-destructive">{urgentCount}</p><p className="text-[10px] text-muted-foreground">Urgents</p></div>
            </div>
          ) : (
            <div className="rounded-xl border p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center"><FlaskConical className="h-5 w-5 text-muted-foreground" /></div>
              <div><p className="text-lg font-bold text-foreground">{analyses.length}</p><p className="text-[10px] text-muted-foreground">Total</p></div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 rounded-lg border bg-card p-0.5">
            {([
              { key: "pipeline" as DashTab, label: "Pipeline analyses", icon: FlaskConical },
              { key: "results" as DashTab, label: "Résultats à valider", icon: Eye },
              { key: "new" as DashTab, label: "Nouvelle analyse", icon: Plus },
            ]).map(t => (
              <button key={t.key} onClick={() => { setActiveTab(t.key); setFilterStatus("all"); }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${activeTab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <t.icon className="h-3.5 w-3.5" />{t.label}
              </button>
            ))}
          </div>
          {activeTab === "pipeline" && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 w-44 text-xs" />
              </div>
              <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
                {[
                  { key: "all", label: "Tous" },
                  { key: "waiting", label: "Prélèv." },
                  { key: "in_progress", label: "En cours" },
                  { key: "ready", label: "Prêts" },
                ].map(f => (
                  <button key={f.key} onClick={() => setFilterStatus(f.key)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${filterStatus === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══ PIPELINE TAB ═══ */}
        {activeTab === "pipeline" && (
          <div className="space-y-3">
            {filtered.map(a => {
              const config = statusConfig[a.status];
              return (
                <div key={a.id} onClick={() => setSelectedAnalysis(a)}
                  className={`rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer ${
                    a.priority === "urgent" ? "border-l-4 border-l-destructive" : ""
                  } ${a.status === "sent" ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className={`h-11 w-11 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      a.priority === "urgent" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                    }`}>{a.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground text-sm">{a.patient}</p>
                        {a.priority === "urgent" && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">URGENT</span>}
                        {a.cnam && <Shield className="h-3 w-3 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{a.type} · {a.doctor} · {a.date}</p>
                      {a.status === "in_progress" && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="h-1.5 w-28 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${a.progress}%` }} />
                          </div>
                          <span className="text-[10px] font-medium text-primary">{a.progress}%</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-foreground">{a.amount}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium border flex items-center gap-1 ${config.class}`}>
                        <config.icon className="h-3 w-3" />{config.label}
                      </span>
                      {a.status !== "sent" && (
                        <Button size="sm" className={`h-7 text-[10px] shrink-0 ${
                          a.status === "waiting" ? "gradient-primary text-primary-foreground" :
                          a.status === "in_progress" ? "bg-accent text-accent-foreground hover:bg-accent/90" :
                          "bg-card border text-foreground hover:bg-muted"
                        }`}
                          onClick={e => { e.stopPropagation(); handleAdvanceStatus(a.id); }}>
                          {a.status === "waiting" && <><Beaker className="h-3 w-3 mr-1" />Prélever</>}
                          {a.status === "in_progress" && <><CheckCircle2 className="h-3 w-3 mr-1" />Valider</>}
                          {a.status === "ready" && <><Send className="h-3 w-3 mr-1" />Envoyer</>}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12"><FlaskConical className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">Aucune analyse trouvée</p></div>
            )}
          </div>
        )}

        {/* ═══ RESULTS TAB ═══ */}
        {activeTab === "results" && (
          <div className="space-y-4">
            {analyses.filter(a => a.status === "ready" && a.values).map(a => (
              <div key={a.id} className="rounded-xl border bg-card shadow-card overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">{a.avatar}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground text-sm">{a.patient}</p>
                        {a.cnam && <Shield className="h-3 w-3 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{a.type} · {a.doctor} · {a.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {editingId !== a.id && (
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => handleStartEdit(a)}>
                        <FileText className="h-3.5 w-3.5 mr-1" />Modifier
                      </Button>
                    )}
                    <Button size="sm" className="gradient-primary text-primary-foreground text-xs" onClick={() => handleAdvanceStatus(a.id)}>
                      <Send className="h-3.5 w-3.5 mr-1" />Envoyer
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5 mr-1" />PDF</Button>
                  </div>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs">
                        <th className="pb-2 font-medium text-muted-foreground">Paramètre</th>
                        <th className="pb-2 font-medium text-muted-foreground">Résultat</th>
                        <th className="pb-2 font-medium text-muted-foreground">Référence</th>
                        <th className="pb-2 font-medium text-muted-foreground w-20">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(editingId === a.id ? editingValues : a.values!).map((v, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-2.5 text-sm text-foreground font-medium">{v.name}</td>
                          <td className="py-2.5">
                            {editingId === a.id ? (
                              <Input value={editingValues[i].value}
                                onChange={e => { const u = [...editingValues]; u[i] = { ...u[i], value: e.target.value }; setEditingValues(u); }}
                                className="h-7 w-28 text-xs" />
                            ) : (
                              <span className={`text-sm font-bold ${v.status === "high" ? "text-destructive" : v.status === "low" ? "text-warning" : "text-foreground"}`}>{v.value}</span>
                            )}
                          </td>
                          <td className="py-2.5 text-xs text-muted-foreground">{v.ref}</td>
                          <td className="py-2.5">
                            {v.status === "high" ? <span className="flex items-center gap-1 text-destructive text-xs"><ArrowUp className="h-3 w-3" />Élevé</span> :
                             v.status === "low" ? <span className="flex items-center gap-1 text-warning text-xs"><ArrowDown className="h-3 w-3" />Bas</span> :
                             <span className="flex items-center gap-1 text-accent text-xs"><Minus className="h-3 w-3" />Normal</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {editingId === a.id && (
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <Button size="sm" className="gradient-primary text-primary-foreground" onClick={handleSaveEdit}><Save className="h-3.5 w-3.5 mr-1" />Enregistrer</Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Annuler</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {analyses.filter(a => a.status === "ready" && a.values).length === 0 && (
              <div className="text-center py-12"><CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">Aucun résultat à valider</p></div>
            )}
          </div>
        )}

        {/* ═══ NEW ANALYSIS TAB ═══ */}
        {activeTab === "new" && (
          <div className="max-w-2xl">
            <div className="rounded-xl border bg-card shadow-card p-6 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Beaker className="h-4 w-4 text-primary" />Enregistrer une analyse</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label className="text-xs">Patient</Label><Input value={newPatient} onChange={e => setNewPatient(e.target.value)} placeholder="Nom du patient" className="mt-1" /></div>
                <div><Label className="text-xs">Type d'analyse</Label>
                  <select value={newType} onChange={e => setNewType(e.target.value)} className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm">
                    {mockLabAnalysisTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><Label className="text-xs">Médecin prescripteur</Label><Input value={newDoctor} onChange={e => setNewDoctor(e.target.value)} placeholder="Dr. ..." className="mt-1" /></div>
                <div><Label className="text-xs">Montant</Label><Input value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="Ex: 45 DT" className="mt-1" /></div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={newCnam} onChange={e => setNewCnam(e.target.checked)} className="rounded border-input" /><Shield className="h-3 w-3 text-primary" />CNAM</label>
                <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={newPriority === "urgent"} onChange={e => setNewPriority(e.target.checked ? "urgent" : "normal")} className="rounded border-input" /><AlertCircle className="h-3 w-3 text-destructive" />Urgent</label>
              </div>
              <div className="flex gap-2">
                <Button className="gradient-primary text-primary-foreground" onClick={handleAddAnalysis} disabled={!newPatient}>
                  <Save className="h-4 w-4 mr-1" />Enregistrer
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("pipeline")}>Annuler</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Analysis detail drawer ── */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedAnalysis(null)}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-fade-in max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{selectedAnalysis.patient}</h3>
                <button onClick={() => setSelectedAnalysis(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Analyse</p><p className="text-sm font-medium text-foreground mt-0.5">{selectedAnalysis.type}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Médecin</p><p className="text-sm font-medium text-foreground mt-0.5">{selectedAnalysis.doctor}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Date</p><p className="text-sm font-medium text-foreground mt-0.5">{selectedAnalysis.date}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Montant</p><p className="text-sm font-bold text-foreground mt-0.5">{selectedAnalysis.amount}</p></div>
              </div>
              {selectedAnalysis.values && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-semibold text-foreground mb-2">Résultats</p>
                  {selectedAnalysis.values.map((v, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-t text-xs">
                      <span className="text-foreground">{v.name}</span>
                      <span className={`font-bold ${v.status === "high" ? "text-destructive" : v.status === "low" ? "text-warning" : "text-accent"}`}>{v.value}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                {selectedAnalysis.status !== "sent" && (
                  <Button size="sm" className="w-full text-xs gradient-primary text-primary-foreground" onClick={() => { handleAdvanceStatus(selectedAnalysis.id); setSelectedAnalysis(null); }}>
                    {selectedAnalysis.status === "waiting" && <><Beaker className="h-3.5 w-3.5 mr-1" />Enregistrer le prélèvement</>}
                    {selectedAnalysis.status === "in_progress" && <><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Valider les résultats</>}
                    {selectedAnalysis.status === "ready" && <><Send className="h-3.5 w-3.5 mr-1" />Envoyer au médecin</>}
                  </Button>
                )}
                <Button size="sm" variant="outline" className="w-full text-xs"><Phone className="h-3.5 w-3.5 mr-1" />Appeler le patient</Button>
                <Button size="sm" variant="outline" className="w-full text-xs"><Printer className="h-3.5 w-3.5 mr-1" />Imprimer</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LaboratoryDashboard;
