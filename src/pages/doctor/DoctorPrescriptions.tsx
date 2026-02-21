import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Plus, Send, Printer, Shield, User, Pill, Eye, ChevronDown, CheckCircle, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockDoctorPrescriptions } from "@/data/mockData";

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState(mockDoctorPrescriptions);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPatient, setNewPatient] = useState("");
  const [newItems, setNewItems] = useState([{ medication: "", dosage: "" }]);

  const handleSend = (id: string) => {
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, sent: true } : p));
  };

  const handleAddNew = () => {
    if (!newPatient) return;
    const newId = `ORD-2026-${(46 + prescriptions.length).toString().padStart(3, "0")}`;
    setPrescriptions(prev => [{
      id: newId, patient: newPatient, date: "20 Fév 2026",
      items: newItems.filter(i => i.medication).map(i => `${i.medication} - ${i.dosage}`),
      sent: false, cnam: true, total: "— DT", status: "active", doctor: "Dr. Bouazizi", pharmacy: null
    }, ...prev]);
    setShowNewForm(false);
    setNewPatient("");
    setNewItems([{ medication: "", dosage: "" }]);
    setExpandedId(newId);
  };

  return (
    <DashboardLayout role="doctor" title="Ordonnances">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{prescriptions.length} ordonnance(s) · {prescriptions.filter(p => !p.sent).length} brouillon(s)</p>
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => setShowNewForm(!showNewForm)}>
            <Plus className="h-4 w-4 mr-2" />{showNewForm ? "Annuler" : "Nouvelle ordonnance"}
          </Button>
        </div>

        {showNewForm && (
          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground">Nouvelle ordonnance</h3>
            <div><Label className="text-xs">Patient</Label><Input value={newPatient} onChange={e => setNewPatient(e.target.value)} placeholder="Nom du patient" className="mt-1" /></div>
            <div className="space-y-2">
              <Label className="text-xs">Médicaments</Label>
              {newItems.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input value={item.medication} onChange={e => { const u = [...newItems]; u[i].medication = e.target.value; setNewItems(u); }} placeholder="Médicament" className="flex-1" />
                  <Input value={item.dosage} onChange={e => { const u = [...newItems]; u[i].dosage = e.target.value; setNewItems(u); }} placeholder="Posologie" className="flex-1" />
                  {newItems.length > 1 && <button onClick={() => setNewItems(prev => prev.filter((_, j) => j !== i))} className="text-destructive"><Trash2 className="h-4 w-4" /></button>}
                </div>
              ))}
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setNewItems(prev => [...prev, { medication: "", dosage: "" }])}><Plus className="h-3 w-3 mr-1" />Ajouter médicament</Button>
            </div>
            <div className="flex gap-2">
              <Button className="gradient-primary text-primary-foreground" onClick={handleAddNew}><CheckCircle className="h-4 w-4 mr-1" />Créer l'ordonnance</Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>Annuler</Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div key={p.id} className="rounded-xl border bg-card shadow-card overflow-hidden">
              <div className="p-5 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><FileText className="h-5 w-5 text-primary" /></div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{p.id}</h3>
                        {p.sent ? <span className="rounded-full bg-accent/10 text-accent px-2.5 py-0.5 text-xs font-medium">✓ Envoyée</span> : <span className="rounded-full bg-warning/10 text-warning px-2.5 py-0.5 text-xs font-medium">Brouillon</span>}
                        {p.cnam && <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"><Shield className="h-3 w-3" />CNAM</span>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{p.patient} · {p.date}</p>
                      <div className="mt-3 space-y-1">
                        {p.items.map((item, i) => (
                          <p key={i} className="text-sm text-foreground flex items-center gap-2"><Pill className="h-3.5 w-3.5 text-primary" />{item}</p>
                        ))}
                      </div>
                      <p className="text-sm font-bold text-foreground mt-2">{p.total}</p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${expandedId === p.id ? "rotate-180" : ""}`} />
                </div>
              </div>
              {expandedId === p.id && (
                <div className="border-t px-5 py-4 bg-muted/10 flex gap-2 flex-wrap">
                  {!p.sent && <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => handleSend(p.id)}><Send className="h-4 w-4 mr-1" />Envoyer au patient</Button>}
                  <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1" />Imprimer</Button>
                  <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />PDF</Button>
                  <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />Aperçu</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorPrescriptions;