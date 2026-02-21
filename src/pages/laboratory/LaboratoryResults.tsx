import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Download, Send, Eye, Shield, ArrowUp, ArrowDown, Minus, User, Calendar, Banknote, CheckCircle2, Search, Filter, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockLabResults, type LabResult, type LabResultValue } from "@/data/mockData";

const LaboratoryResults = () => {
  const [results, setResults] = useState<LabResult[]>(mockLabResults);
  const [search, setSearch] = useState("");
  const [filterSent, setFilterSent] = useState<"all" | "sent" | "pending">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<LabResultValue[]>([]);

  const filtered = results.filter(r => {
    if (search && !r.patient.toLowerCase().includes(search.toLowerCase()) && !r.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterSent === "sent" && !r.sent) return false;
    if (filterSent === "pending" && r.sent) return false;
    return true;
  });

  const handleSend = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, sent: true } : r));
  };

  const handleStartEdit = (r: LabResult) => {
    setEditingId(r.id);
    setEditValues([...r.values]);
  };

  const handleSaveEdit = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, values: editValues } : r));
    setEditingId(null);
  };

  return (
    <DashboardLayout role="laboratory" title="Résultats">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-9 h-9 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
              {[{ key: "all" as const, label: "Tous" }, { key: "pending" as const, label: `Non envoyés (${results.filter(r => !r.sent).length})` }, { key: "sent" as const, label: "Envoyés" }].map(f => (
                <button key={f.key} onClick={() => setFilterSent(f.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filterSent === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} résultat(s)</p>
        </div>

        {filtered.map((r) => {
          const isEditing = editingId === r.id;
          return (
            <div key={r.id} className={`rounded-xl border bg-card shadow-card transition-all ${isEditing ? "ring-2 ring-primary/20" : "hover:shadow-card-hover"}`}>
              <div className="flex items-start justify-between p-5 border-b flex-wrap gap-3">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">{r.avatar}</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{r.id}</h3>
                      {r.sent ? (
                        <span className="rounded-full bg-accent/10 text-accent px-2.5 py-0.5 text-xs font-medium flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Envoyé</span>
                      ) : (
                        <span className="rounded-full bg-warning/10 text-warning px-2.5 py-0.5 text-xs font-medium">Non envoyé</span>
                      )}
                      {r.cnam && <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"><Shield className="h-3 w-3" />CNAM</span>}
                    </div>
                    <p className="text-sm text-foreground mt-1 font-medium">{r.type}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />{r.patient} · <Calendar className="h-3.5 w-3.5" />{r.date} · {r.doctor}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-foreground mr-2">{r.amount}</span>
                  {!isEditing && (
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => handleStartEdit(r)}>
                      <Edit className="h-3.5 w-3.5 mr-1" />Modifier
                    </Button>
                  )}
                  {!r.sent && !isEditing && (
                    <Button size="sm" className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => handleSend(r.id)}>
                      <Send className="h-3.5 w-3.5 mr-1" />Envoyer
                    </Button>
                  )}
                  <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1" />PDF</Button>
                </div>
              </div>
              <div className="p-5">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs">
                      <th className="pb-3 font-medium text-muted-foreground">Paramètre</th>
                      <th className="pb-3 font-medium text-muted-foreground">Résultat</th>
                      <th className="pb-3 font-medium text-muted-foreground">Valeurs de référence</th>
                      <th className="pb-3 font-medium text-muted-foreground w-20">Indicateur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isEditing ? editValues : r.values).map((v, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-3 text-sm text-foreground font-medium">{v.name}</td>
                        <td className="py-3">
                          {isEditing ? (
                            <Input value={editValues[i].value}
                              onChange={e => { const u = [...editValues]; u[i] = { ...u[i], value: e.target.value }; setEditValues(u); }}
                              className="h-8 w-32 text-sm" />
                          ) : (
                            <span className={`text-sm font-bold ${v.status === "high" ? "text-destructive" : v.status === "low" ? "text-warning" : "text-foreground"}`}>{v.value}</span>
                          )}
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">{v.ref}</td>
                        <td className="py-3">
                          {isEditing ? (
                            <select value={editValues[i].status}
                              onChange={e => { const u = [...editValues]; u[i] = { ...u[i], status: e.target.value }; setEditValues(u); }}
                              className="h-8 rounded-md border bg-background px-2 text-xs">
                              <option value="normal">Normal</option>
                              <option value="high">Élevé</option>
                              <option value="low">Bas</option>
                            </select>
                          ) : v.status === "high" ? (
                            <span className="flex items-center gap-1 text-destructive text-xs font-medium"><ArrowUp className="h-3.5 w-3.5" />Élevé</span>
                          ) : v.status === "low" ? (
                            <span className="flex items-center gap-1 text-warning text-xs font-medium"><ArrowDown className="h-3.5 w-3.5" />Bas</span>
                          ) : (
                            <span className="flex items-center gap-1 text-accent text-xs font-medium"><Minus className="h-3.5 w-3.5" />Normal</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {isEditing && (
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => handleSaveEdit(r.id)}>
                      <Save className="h-3.5 w-3.5 mr-1" />Enregistrer
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5 mr-1" />Annuler
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryResults;