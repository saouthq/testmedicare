import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { ClipboardList, Plus, FileText, Shield, Eye, ChevronDown, Send, Printer, CheckCircle2, X, Calendar, Stethoscope, Pill, Activity, Download, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { mockDoctorConsultations } from "@/data/mockData";

type ConsultFilter = "today" | "week" | "all";

const DoctorConsultations = () => {
  const [filter, setFilter] = useState<ConsultFilter>("today");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [consultations, setConsultations] = useState(mockDoctorConsultations);
  const [closingId, setClosingId] = useState<number | null>(null);

  // Closing form state
  const [closeForm, setCloseForm] = useState({
    diagnosis: "",
    notes: "",
    prescriptions: [{ medication: "", dosage: "" }],
    analyses: [""],
    nextRdv: "",
    amount: "",
  });

  const filtered = consultations.filter(c => {
    if (filter === "today") return c.date === "20 Fév 2026";
    if (filter === "week") return ["20 Fév 2026", "18 Fév 2026", "17 Fév 2026", "15 Fév 2026"].includes(c.date);
    return true;
  });

  const todayTotal = consultations.filter(c => c.date === "20 Fév 2026").reduce((sum, c) => sum + parseInt(c.amount), 0);
  const todayDone = consultations.filter(c => c.date === "20 Fév 2026" && (c as any).closed).length;
  const todayCount = consultations.filter(c => c.date === "20 Fév 2026").length;

  const startClosing = (c: typeof consultations[0]) => {
    setClosingId(c.id);
    setCloseForm({
      diagnosis: "",
      notes: c.notes || "",
      prescriptions: [{ medication: "", dosage: "" }],
      analyses: [""],
      nextRdv: "15 jours",
      amount: c.amount.replace(" DT", ""),
    });
  };

  const confirmClose = (id: number) => {
    setConsultations(prev => prev.map(c => c.id === id ? { ...c, closed: true } as any : c));
    setClosingId(null);
    setExpandedId(null);
  };

  return (
    <DashboardLayout role="doctor" title="Consultations">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
            {[{ key: "today" as ConsultFilter, label: "Aujourd'hui" }, { key: "week" as ConsultFilter, label: "Cette semaine" }, { key: "all" as ConsultFilter, label: "Tout" }].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f.label}</button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            {filter === "today" && (
              <>
                <span className="text-xs text-muted-foreground">{todayDone}/{todayCount} terminées</span>
                <span className="text-sm font-semibold text-foreground bg-accent/10 text-accent px-3 py-1.5 rounded-lg">CA jour : {todayTotal} DT</span>
              </>
            )}
            <Link to="/dashboard/doctor/consultation/new">
              <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm"><Plus className="h-4 w-4 mr-2" />Nouvelle consultation</Button>
            </Link>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Aucune consultation pour cette période</p>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((c) => {
            const isClosed = (c as any).closed;
            return (
              <div key={c.id} className={`rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all overflow-hidden ${isClosed ? "opacity-60" : ""}`}>
                <div className="p-5 cursor-pointer" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link to="/dashboard/doctor/patients/1" onClick={e => e.stopPropagation()} className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary hover:bg-primary/20 transition-colors">{c.avatar}</Link>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link to="/dashboard/doctor/patients/1" onClick={e => e.stopPropagation()} className="font-semibold text-foreground hover:text-primary transition-colors">{c.patient}</Link>
                          {c.cnam && <span className="flex items-center gap-1 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium"><Shield className="h-3 w-3" />CNAM</span>}
                          {isClosed && <span className="flex items-center gap-1 text-[9px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-medium"><CheckCircle2 className="h-3 w-3" />Clôturée</span>}
                        </div>
                        <p className="text-sm text-muted-foreground">{c.date} à {c.time} · {c.motif}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-foreground">{c.amount}</span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === c.id ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </div>
                {expandedId === c.id && (
                  <div className="border-t px-5 py-4 bg-muted/10 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Notes de consultation</p>
                      <p className="text-sm text-foreground">{c.notes}</p>
                    </div>
                    {c.prescriptions > 0 && (
                      <div className="flex items-center gap-1 text-sm text-primary"><FileText className="h-3.5 w-3.5" /><span>{c.prescriptions} ordonnance{c.prescriptions > 1 ? "s" : ""} générée{c.prescriptions > 1 ? "s" : ""}</span></div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <Link to="/dashboard/doctor/patients/1"><Button variant="outline" size="sm" className="text-xs"><Eye className="h-3.5 w-3.5 mr-1" />Voir le patient</Button></Link>
                      <Button variant="outline" size="sm" className="text-xs"><Printer className="h-3.5 w-3.5 mr-1" />Imprimer CR</Button>
                      {c.prescriptions > 0 && <Button variant="outline" size="sm" className="text-xs"><Send className="h-3.5 w-3.5 mr-1" />Envoyer ordonnance</Button>}
                      <Link to="/dashboard/doctor/consultation/new"><Button variant="outline" size="sm" className="text-xs"><ClipboardList className="h-3.5 w-3.5 mr-1" />Nouvelle consultation</Button></Link>

                      {/* Close consultation button */}
                      {!isClosed && closingId !== c.id && (
                        <Button size="sm" className="gradient-primary text-primary-foreground text-xs" onClick={() => startClosing(c)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Clôturer la consultation
                        </Button>
                      )}
                    </div>

                    {/* ═══ CLOSING FORM ═══ */}
                    {closingId === c.id && (
                      <div className="mt-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-primary" />Clôture de consultation
                          </h4>
                          <button onClick={() => setClosingId(null)} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Diagnosis */}
                        <div>
                          <Label className="text-xs">Diagnostic</Label>
                          <Input
                            value={closeForm.diagnosis}
                            onChange={e => setCloseForm(f => ({ ...f, diagnosis: e.target.value }))}
                            placeholder="Ex: Angine virale, syndrome grippal..."
                            className="mt-1 bg-background"
                          />
                        </div>

                        {/* Notes */}
                        <div>
                          <Label className="text-xs">Compte-rendu</Label>
                          <Textarea
                            value={closeForm.notes}
                            onChange={e => setCloseForm(f => ({ ...f, notes: e.target.value }))}
                            rows={2}
                            className="mt-1 bg-background"
                          />
                        </div>

                        {/* Prescriptions */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs flex items-center gap-1"><Pill className="h-3 w-3 text-warning" />Ordonnance</Label>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setCloseForm(f => ({
                              ...f, prescriptions: [...f.prescriptions, { medication: "", dosage: "" }],
                            }))}>+ Ajouter</Button>
                          </div>
                          {closeForm.prescriptions.map((p, i) => (
                            <div key={i} className="flex gap-2 items-center mb-1.5">
                              <Input value={p.medication} onChange={e => { const u = [...closeForm.prescriptions]; u[i] = { ...u[i], medication: e.target.value }; setCloseForm(f => ({ ...f, prescriptions: u })); }} placeholder="Médicament" className="flex-1 bg-background h-8 text-xs" />
                              <Input value={p.dosage} onChange={e => { const u = [...closeForm.prescriptions]; u[i] = { ...u[i], dosage: e.target.value }; setCloseForm(f => ({ ...f, prescriptions: u })); }} placeholder="Posologie" className="flex-1 bg-background h-8 text-xs" />
                              {closeForm.prescriptions.length > 1 && (
                                <button onClick={() => setCloseForm(f => ({ ...f, prescriptions: f.prescriptions.filter((_, j) => j !== i) }))} className="text-destructive/50 hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Analyses */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs flex items-center gap-1"><Activity className="h-3 w-3 text-accent" />Analyses prescrites</Label>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setCloseForm(f => ({
                              ...f, analyses: [...f.analyses, ""],
                            }))}>+ Ajouter</Button>
                          </div>
                          {closeForm.analyses.map((a, i) => (
                            <div key={i} className="flex gap-2 items-center mb-1.5">
                              <Input value={a} onChange={e => { const u = [...closeForm.analyses]; u[i] = e.target.value; setCloseForm(f => ({ ...f, analyses: u })); }} placeholder="Type d'analyse" className="flex-1 bg-background h-8 text-xs" />
                              {closeForm.analyses.length > 1 && (
                                <button onClick={() => setCloseForm(f => ({ ...f, analyses: f.analyses.filter((_, j) => j !== i) }))} className="text-destructive/50 hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Next RDV + Amount */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs flex items-center gap-1"><Calendar className="h-3 w-3 text-primary" />Prochain RDV</Label>
                            <select value={closeForm.nextRdv} onChange={e => setCloseForm(f => ({ ...f, nextRdv: e.target.value }))} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-xs">
                              <option value="">Pas de suivi</option>
                              <option value="1 semaine">1 semaine</option>
                              <option value="15 jours">15 jours</option>
                              <option value="1 mois">1 mois</option>
                              <option value="3 mois">3 mois</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs">Montant facturé (DT)</Label>
                            <Input value={closeForm.amount} onChange={e => setCloseForm(f => ({ ...f, amount: e.target.value }))} className="mt-1 bg-background h-9 text-xs" />
                          </div>
                        </div>

                        {/* Summary preview */}
                        <div className="rounded-lg bg-card border p-3 space-y-1.5">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Résumé</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-muted-foreground">Patient :</span> <span className="font-medium text-foreground">{c.patient}</span></div>
                            <div><span className="text-muted-foreground">Montant :</span> <span className="font-medium text-foreground">{closeForm.amount} DT</span></div>
                            {closeForm.diagnosis && <div><span className="text-muted-foreground">Diagnostic :</span> <span className="font-medium text-foreground">{closeForm.diagnosis}</span></div>}
                            {closeForm.nextRdv && <div><span className="text-muted-foreground">Prochain RDV :</span> <span className="font-medium text-primary">{closeForm.nextRdv}</span></div>}
                            {closeForm.prescriptions.filter(p => p.medication).length > 0 && (
                              <div className="col-span-2"><span className="text-muted-foreground">Ordonnance :</span> <span className="font-medium text-foreground">{closeForm.prescriptions.filter(p => p.medication).length} médicament(s)</span></div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button className="gradient-primary text-primary-foreground" size="sm" onClick={() => confirmClose(c.id)}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Valider la clôture
                          </Button>
                          <Button variant="outline" size="sm"><Printer className="h-3.5 w-3.5 mr-1" />Imprimer</Button>
                          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1" />PDF</Button>
                          <Button variant="ghost" size="sm" onClick={() => setClosingId(null)}>Annuler</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center">{filtered.length} consultation(s) affichée(s)</p>
      </div>
    </DashboardLayout>
  );
};

export default DoctorConsultations;
