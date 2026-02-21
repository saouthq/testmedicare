import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FlaskConical, Search, Plus, Clock, CheckCircle2, AlertCircle, Activity, Shield, User, Eye, Banknote, X, Save, Send, Beaker } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { mockLabAnalysesDetail, mockLabAnalysisTypes, type LabAnalysis } from "@/data/mockData";

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  waiting: { label: "Attente prélèvement", class: "bg-warning/10 text-warning", icon: AlertCircle },
  in_progress: { label: "En cours", class: "bg-primary/10 text-primary", icon: Clock },
  ready: { label: "Résultat prêt", class: "bg-accent/10 text-accent", icon: CheckCircle2 },
  sent: { label: "Envoyé", class: "bg-muted text-muted-foreground", icon: CheckCircle2 },
};

const LaboratoryAnalyses = () => {
  const [analyses, setAnalyses] = useState<LabAnalysis[]>(mockLabAnalysesDetail);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newAnalysis, setNewAnalysis] = useState({ patient: "", type: mockLabAnalysisTypes[0], doctor: "", amount: "", cnam: true, priority: "normal" });

  const filtered = analyses.filter(a => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search && !a.patient.toLowerCase().includes(search.toLowerCase()) && !a.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    setAnalyses(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const handleAdd = () => {
    if (!newAnalysis.patient || !newAnalysis.type) return;
    const maxNum = Math.max(...analyses.map(a => parseInt(a.id.split("-")[1])), 0);
    setAnalyses(prev => [...prev, {
      id: `ANA-${String(maxNum + 1).padStart(3, "0")}`,
      patient: newAnalysis.patient, type: newAnalysis.type, doctor: newAnalysis.doctor,
      date: "20 Fév 2026", status: "waiting", amount: newAnalysis.amount || "40 DT",
      cnam: newAnalysis.cnam, avatar: newAnalysis.patient.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase(),
      priority: newAnalysis.priority,
    }]);
    setShowNew(false);
    setNewAnalysis({ patient: "", type: mockLabAnalysisTypes[0], doctor: "", amount: "", cnam: true, priority: "normal" });
  };

  return (
    <DashboardLayout role="laboratory" title="Analyses">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
              {[
                { key: "all", label: "Toutes" },
                { key: "waiting", label: `Attente (${analyses.filter(a => a.status === "waiting").length})` },
                { key: "in_progress", label: "En cours" },
                { key: "ready", label: "Prêtes" },
                { key: "sent", label: "Envoyées" },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-9 h-9 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => setShowNew(!showNew)}>
            <Plus className="h-4 w-4 mr-2" />Nouvelle analyse
          </Button>
        </div>

        {showNew && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Beaker className="h-4 w-4 text-primary" />Enregistrer une nouvelle analyse</h4>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              <div><Label className="text-xs">Patient</Label><Input value={newAnalysis.patient} onChange={e => setNewAnalysis(p => ({ ...p, patient: e.target.value }))} className="mt-1 h-9" placeholder="Nom du patient" /></div>
              <div><Label className="text-xs">Type d'analyse</Label>
                <select value={newAnalysis.type} onChange={e => setNewAnalysis(p => ({ ...p, type: e.target.value }))} className="mt-1 w-full h-9 rounded-md border bg-background px-3 text-sm">
                  {mockLabAnalysisTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><Label className="text-xs">Médecin prescripteur</Label><Input value={newAnalysis.doctor} onChange={e => setNewAnalysis(p => ({ ...p, doctor: e.target.value }))} className="mt-1 h-9" placeholder="Dr. ..." /></div>
              <div><Label className="text-xs">Montant</Label><Input value={newAnalysis.amount} onChange={e => setNewAnalysis(p => ({ ...p, amount: e.target.value }))} className="mt-1 h-9" placeholder="Ex: 45 DT" /></div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={newAnalysis.cnam} onChange={e => setNewAnalysis(p => ({ ...p, cnam: e.target.checked }))} className="rounded border-input" />CNAM</label>
                <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={newAnalysis.priority === "urgent"} onChange={e => setNewAnalysis(p => ({ ...p, priority: e.target.checked ? "urgent" : "normal" }))} className="rounded border-input" />Urgent</label>
              </div>
              <div className="flex items-end gap-2 col-span-1">
                <Button size="sm" className="gradient-primary text-primary-foreground" onClick={handleAdd}><Save className="h-3.5 w-3.5 mr-1" />Enregistrer</Button>
                <Button variant="outline" size="sm" onClick={() => setShowNew(false)}><X className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((a) => {
            const config = statusConfig[a.status];
            const Icon = config.icon;
            return (
              <div key={a.id} className={`rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all ${a.priority === "urgent" ? "border-l-3 border-l-destructive" : ""}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${config.class}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{a.id}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.class}`}>{config.label}</span>
                        {a.priority === "urgent" && <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-medium">Urgent</span>}
                        {a.cnam && <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"><Shield className="h-3 w-3" />CNAM</span>}
                      </div>
                      <p className="text-sm font-medium text-foreground mt-1">{a.type}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />{a.patient} · {a.doctor} · {a.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-foreground flex items-center gap-1"><Banknote className="h-4 w-4 text-accent" />{a.amount}</span>
                    {a.status === "waiting" && (
                      <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => handleStatusChange(a.id, "in_progress")}>
                        Enregistrer prélèvement
                      </Button>
                    )}
                    {a.status === "in_progress" && (
                      <Button className="bg-accent text-accent-foreground hover:bg-accent/90" size="sm" onClick={() => handleStatusChange(a.id, "ready")}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Valider résultats
                      </Button>
                    )}
                    {a.status === "ready" && (
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => handleStatusChange(a.id, "sent")}>
                        <Send className="h-3.5 w-3.5 mr-1" />Envoyer au médecin
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
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryAnalyses;