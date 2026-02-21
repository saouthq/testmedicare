import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Phone, Mail, Plus, ChevronRight, Calendar, Edit, FileText, Clock, AlertTriangle, X, Shield, MapPin, Save, CheckCircle, History, Banknote, User, MessageSquare, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const initialPatients = [
  { 
    id: 1, name: "Amine Ben Ali", phone: "+216 71 234 567", email: "amine@email.tn", 
    lastVisit: "20 Fév 2026", doctor: "Dr. Bouazizi", nextAppointment: "28 Fév 14:30",
    cnamId: "12345678", assurance: "CNAM", dob: "15/03/1991", avatar: "AB",
    balance: 0, notes: "Suivi diabète régulier", gouvernorat: "Tunis",
    history: [
      { date: "20 Fév 2026", type: "Consultation", doctor: "Dr. Bouazizi", motif: "Suivi diabète", amount: "35 DT", paid: true },
      { date: "10 Jan 2026", type: "Contrôle", doctor: "Dr. Bouazizi", motif: "Bilan annuel", amount: "35 DT", paid: true },
      { date: "15 Nov 2025", type: "Consultation", doctor: "Dr. Gharbi", motif: "ECG contrôle", amount: "50 DT", paid: true },
    ]
  },
  { 
    id: 2, name: "Fatma Trabelsi", phone: "+216 22 345 678", email: "fatma@email.tn", 
    lastVisit: "18 Fév 2026", doctor: "Dr. Gharbi", nextAppointment: "25 Fév 10:00",
    cnamId: "23456789", assurance: "CNAM", dob: "12/07/1970", avatar: "FT",
    balance: 60, notes: "Hypertension — suivi cardio", gouvernorat: "Ariana",
    history: [
      { date: "18 Fév 2026", type: "Suivi", doctor: "Dr. Gharbi", motif: "Tension artérielle", amount: "50 DT", paid: false },
      { date: "5 Jan 2026", type: "Consultation", doctor: "Dr. Gharbi", motif: "Bilan cardio", amount: "50 DT", paid: true },
    ]
  },
  { 
    id: 3, name: "Mohamed Sfar", phone: "+216 55 456 789", email: "med@email.tn", 
    lastVisit: "15 Fév 2026", doctor: "Dr. Bouazizi", nextAppointment: null,
    cnamId: "—", assurance: "Privée", dob: "05/01/1998", avatar: "MS",
    balance: 0, notes: "Suivi post-opératoire", gouvernorat: "Ben Arous",
    history: [
      { date: "15 Fév 2026", type: "Contrôle", doctor: "Dr. Bouazizi", motif: "Post-opératoire", amount: "35 DT", paid: true },
    ]
  },
  { 
    id: 4, name: "Nadia Jemni", phone: "+216 98 567 890", email: "nadia@email.tn", 
    lastVisit: "10 Fév 2026", doctor: "Dr. Hammami", nextAppointment: "3 Mar 09:00",
    cnamId: "34567890", assurance: "CNAM", dob: "18/11/1959", avatar: "NJ",
    balance: 25, notes: "Arthrose — anti-inflammatoires", gouvernorat: "Manouba",
    history: [
      { date: "10 Fév 2026", type: "Consultation", doctor: "Dr. Hammami", motif: "Douleurs articulaires", amount: "45 DT", paid: false },
    ]
  },
  { 
    id: 5, name: "Sami Ayari", phone: "+216 29 678 901", email: "sami@email.tn", 
    lastVisit: "8 Fév 2026", doctor: "Dr. Bouazizi", nextAppointment: null,
    cnamId: "45678901", assurance: "CNAM", dob: "22/06/1984", avatar: "SA",
    balance: 0, notes: "Asthme léger", gouvernorat: "Tunis",
    history: [
      { date: "8 Fév 2026", type: "Consultation", doctor: "Dr. Bouazizi", motif: "Renouvellement traitement", amount: "35 DT", paid: true },
    ]
  },
];

type DetailTab = "info" | "history" | "billing";

const SecretaryPatients = () => {
  const [search, setSearch] = useState("");
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [patients, setPatients] = useState(initialPatients);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>("info");
  const [editForm, setEditForm] = useState<typeof initialPatients[0] | null>(null);
  const [saved, setSaved] = useState(false);

  const selectedPatient = selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null;

  const filtered = patients.filter(p => 
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
  );

  const handleEdit = () => {
    if (selectedPatient) {
      setEditForm({ ...selectedPatient });
      setEditMode(true);
    }
  };

  const handleSaveEdit = () => {
    if (editForm) {
      setPatients(prev => prev.map(p => p.id === editForm.id ? editForm : p));
      setEditMode(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleAddPatient = (newP: Omit<typeof initialPatients[0], "id" | "history">) => {
    const id = Math.max(...patients.map(p => p.id)) + 1;
    setPatients(prev => [{ ...newP, id, history: [] }, ...prev]);
    setShowNewPatient(false);
  };

  return (
    <DashboardLayout role="secretary" title="Patients">
      <div className="space-y-6">
        {saved && (
          <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 flex items-center gap-2 animate-fade-in">
            <CheckCircle className="h-4 w-4 text-accent" />
            <span className="text-sm text-accent font-medium">Fiche patient mise à jour</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un patient (nom, téléphone)..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10" />
          </div>
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => setShowNewPatient(true)}>
            <Plus className="h-4 w-4 mr-1" />Nouveau patient
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-foreground">{patients.length}</p><p className="text-[11px] text-muted-foreground">Total patients</p></div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-accent">{patients.filter(p => p.nextAppointment).length}</p><p className="text-[11px] text-muted-foreground">RDV planifiés</p></div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-destructive">{patients.filter(p => p.balance > 0).length}</p><p className="text-[11px] text-muted-foreground">Impayés</p></div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-warning">{patients.filter(p => p.balance > 0).reduce((s, p) => s + p.balance, 0)} DT</p><p className="text-[11px] text-muted-foreground">Solde total</p></div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Patient list */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border bg-card shadow-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-4 text-xs font-medium text-muted-foreground">Patient</th>
                    <th className="p-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Médecin</th>
                    <th className="p-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Prochain RDV</th>
                    <th className="p-4 text-xs font-medium text-muted-foreground hidden lg:table-cell">Solde</th>
                    <th className="p-4 text-xs font-medium text-muted-foreground">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((p) => (
                    <tr key={p.id} className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedPatientId === p.id ? "bg-primary/5" : ""}`} onClick={() => { setSelectedPatientId(p.id); setEditMode(false); setDetailTab("info"); }}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">{p.avatar}</div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{p.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-[11px] text-muted-foreground">{p.dob}</p>
                              {p.assurance === "CNAM" && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">CNAM</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{p.doctor}</td>
                      <td className="p-4 hidden sm:table-cell">
                        {p.nextAppointment ? (
                          <span className="text-xs text-accent font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />{p.nextAppointment}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Aucun</span>
                        )}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        {p.balance > 0 ? (
                          <span className="text-xs font-semibold text-destructive">{p.balance} DT</span>
                        ) : (
                          <span className="text-xs text-accent">Soldé</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Phone className="h-3 w-3 text-muted-foreground" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Mail className="h-3 w-3 text-muted-foreground" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Patient detail panel with tabs */}
          <div className="rounded-xl border bg-card shadow-card">
            {selectedPatient ? (
              <div>
                <div className="p-5 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">{selectedPatient.avatar}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">{selectedPatient.name}</h3>
                      <p className="text-xs text-muted-foreground">{selectedPatient.dob} · {selectedPatient.gouvernorat}</p>
                    </div>
                    {!editMode && (
                      <Button variant="outline" size="sm" className="text-xs" onClick={handleEdit}><Edit className="h-3 w-3 mr-1" />Modifier</Button>
                    )}
                  </div>
                </div>

                {/* Detail tabs */}
                <div className="flex border-b">
                  {([
                    { key: "info" as DetailTab, label: "Infos", icon: User },
                    { key: "history" as DetailTab, label: "Historique", icon: History },
                    { key: "billing" as DetailTab, label: "Solde", icon: Banknote },
                  ]).map(t => (
                    <button key={t.key} onClick={() => { setDetailTab(t.key); setEditMode(false); }}
                      className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${detailTab === t.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                      <t.icon className="h-3 w-3" />{t.label}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {/* Info tab */}
                  {detailTab === "info" && !editMode && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground">Téléphone</p><p className="text-xs font-medium text-foreground">{selectedPatient.phone}</p></div>
                        <div className="rounded-lg bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground">Email</p><p className="text-xs font-medium text-foreground truncate">{selectedPatient.email}</p></div>
                        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3"><p className="text-[10px] text-primary font-medium flex items-center gap-1"><Shield className="h-3 w-3" />Assurance</p><p className="text-xs font-semibold text-foreground">{selectedPatient.assurance}</p>{selectedPatient.cnamId !== "—" && <p className="text-[10px] text-muted-foreground mt-0.5">N° {selectedPatient.cnamId}</p>}</div>
                        <div className="rounded-lg bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground">Médecin</p><p className="text-xs font-medium text-foreground">{selectedPatient.doctor}</p></div>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground">Notes</p><p className="text-xs text-foreground mt-1">{selectedPatient.notes}</p></div>
                      <div className="space-y-2 pt-2">
                        <Button variant="outline" size="sm" className="w-full text-xs justify-start"><Calendar className="h-3.5 w-3.5 mr-2 text-primary" />Planifier un RDV</Button>
                        <Button variant="outline" size="sm" className="w-full text-xs justify-start"><FileText className="h-3.5 w-3.5 mr-2 text-warning" />Créer une facture</Button>
                        <Button variant="outline" size="sm" className="w-full text-xs justify-start"><MessageSquare className="h-3.5 w-3.5 mr-2 text-muted-foreground" />Envoyer SMS</Button>
                        <Button variant="outline" size="sm" className="w-full text-xs justify-start"><Printer className="h-3.5 w-3.5 mr-2 text-muted-foreground" />Imprimer fiche</Button>
                      </div>
                    </div>
                  )}

                  {/* Edit mode */}
                  {detailTab === "info" && editMode && editForm && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label className="text-[10px]">Téléphone</Label><Input value={editForm.phone} onChange={e => setEditForm(f => f ? { ...f, phone: e.target.value } : f)} className="mt-0.5 h-8 text-xs" /></div>
                        <div><Label className="text-[10px]">Email</Label><Input value={editForm.email} onChange={e => setEditForm(f => f ? { ...f, email: e.target.value } : f)} className="mt-0.5 h-8 text-xs" /></div>
                        <div><Label className="text-[10px]">Assurance</Label>
                          <select value={editForm.assurance} onChange={e => setEditForm(f => f ? { ...f, assurance: e.target.value } : f)} className="mt-0.5 w-full h-8 rounded-md border bg-background px-2 text-xs">
                            <option>CNAM</option><option>CNRPS</option><option>Privée</option><option>Sans</option>
                          </select>
                        </div>
                        <div><Label className="text-[10px]">N° CNAM</Label><Input value={editForm.cnamId} onChange={e => setEditForm(f => f ? { ...f, cnamId: e.target.value } : f)} className="mt-0.5 h-8 text-xs" /></div>
                        <div><Label className="text-[10px]">Médecin</Label>
                          <select value={editForm.doctor} onChange={e => setEditForm(f => f ? { ...f, doctor: e.target.value } : f)} className="mt-0.5 w-full h-8 rounded-md border bg-background px-2 text-xs">
                            <option>Dr. Bouazizi</option><option>Dr. Gharbi</option><option>Dr. Hammami</option>
                          </select>
                        </div>
                        <div><Label className="text-[10px]">Gouvernorat</Label>
                          <select value={editForm.gouvernorat} onChange={e => setEditForm(f => f ? { ...f, gouvernorat: e.target.value } : f)} className="mt-0.5 w-full h-8 rounded-md border bg-background px-2 text-xs">
                            {["Tunis", "Ariana", "Ben Arous", "Manouba", "Sousse", "Sfax"].map(g => <option key={g}>{g}</option>)}
                          </select>
                        </div>
                      </div>
                      <div><Label className="text-[10px]">Notes</Label><textarea value={editForm.notes} onChange={e => setEditForm(f => f ? { ...f, notes: e.target.value } : f)} rows={2} className="mt-0.5 w-full rounded-md border bg-background px-2 py-1 text-xs resize-none" /></div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 gradient-primary text-primary-foreground text-xs" onClick={handleSaveEdit}><Save className="h-3 w-3 mr-1" />Sauvegarder</Button>
                        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setEditMode(false)}>Annuler</Button>
                      </div>
                    </div>
                  )}

                  {/* History tab */}
                  {detailTab === "history" && (
                    <div className="space-y-3">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Historique des visites</p>
                      {selectedPatient.history.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">Aucun historique</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedPatient.history.map((h, i) => (
                            <div key={i} className="rounded-lg border p-3 hover:bg-muted/20 transition-colors">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-foreground">{h.motif}</p>
                                <span className="text-[10px] text-muted-foreground">{h.date}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                <span>{h.type}</span><span>·</span><span>{h.doctor}</span><span>·</span>
                                <span className="font-medium text-foreground">{h.amount}</span>
                                {h.paid ? (
                                  <span className="text-accent flex items-center gap-0.5"><CheckCircle className="h-2.5 w-2.5" />Payé</span>
                                ) : (
                                  <span className="text-destructive flex items-center gap-0.5"><AlertTriangle className="h-2.5 w-2.5" />Impayé</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Billing tab */}
                  {detailTab === "billing" && (
                    <div className="space-y-4">
                      <div className={`rounded-lg p-4 text-center ${selectedPatient.balance > 0 ? "bg-destructive/5 border border-destructive/20" : "bg-accent/5 border border-accent/20"}`}>
                        <p className="text-xs text-muted-foreground">Solde patient</p>
                        <p className={`text-2xl font-bold mt-1 ${selectedPatient.balance > 0 ? "text-destructive" : "text-accent"}`}>{selectedPatient.balance} DT</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{selectedPatient.balance > 0 ? "Montant dû" : "Aucun impayé"}</p>
                      </div>
                      {selectedPatient.balance > 0 && (
                        <Button size="sm" className="w-full gradient-primary text-primary-foreground text-xs">
                          <Banknote className="h-3.5 w-3.5 mr-1" />Encaisser {selectedPatient.balance} DT
                        </Button>
                      )}
                      <div className="space-y-2">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Dernières transactions</p>
                        {selectedPatient.history.map((h, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg border p-2.5">
                            <div>
                              <p className="text-[11px] font-medium text-foreground">{h.motif}</p>
                              <p className="text-[10px] text-muted-foreground">{h.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-foreground">{h.amount}</p>
                              <p className={`text-[10px] font-medium ${h.paid ? "text-accent" : "text-destructive"}`}>{h.paid ? "Payé" : "Impayé"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Sélectionnez un patient pour voir ses détails</p>
              </div>
            )}
          </div>
        </div>

        {/* New patient modal */}
        {showNewPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowNewPatient(false)}>
            <div className="bg-card rounded-2xl border shadow-elevated p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Nouveau patient</h3>
                <button onClick={() => setShowNewPatient(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <NewPatientForm onAdd={handleAddPatient} onCancel={() => setShowNewPatient(false)} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const NewPatientForm = ({ onAdd, onCancel }: { onAdd: (p: any) => void; onCancel: () => void }) => {
  const [form, setForm] = useState({ name: "", firstName: "", phone: "", email: "", dob: "", cnamId: "", assurance: "CNAM", doctor: "Dr. Bouazizi", gouvernorat: "Tunis", notes: "" });

  const handleSubmit = () => {
    if (!form.firstName || !form.name) return;
    onAdd({
      name: `${form.firstName} ${form.name}`,
      avatar: `${form.firstName[0]}${form.name[0]}`.toUpperCase(),
      phone: form.phone, email: form.email, dob: form.dob,
      cnamId: form.cnamId || "—", assurance: form.assurance,
      doctor: form.doctor, gouvernorat: form.gouvernorat,
      nextAppointment: null, lastVisit: null,
      balance: 0, notes: form.notes,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Prénom *</Label><Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="mt-1" placeholder="Prénom" /></div>
        <div><Label className="text-xs">Nom *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" placeholder="Nom" /></div>
        <div><Label className="text-xs">Date de naissance</Label><Input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} className="mt-1" /></div>
        <div><Label className="text-xs">Téléphone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" placeholder="+216 XX XXX XXX" /></div>
        <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1" placeholder="email@..." /></div>
        <div><Label className="text-xs">N° Assuré CNAM</Label><Input value={form.cnamId} onChange={e => setForm(f => ({ ...f, cnamId: e.target.value }))} className="mt-1" placeholder="XXXXXXXX" /></div>
        <div><Label className="text-xs">Assurance</Label>
          <select value={form.assurance} onChange={e => setForm(f => ({ ...f, assurance: e.target.value }))} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
            <option>CNAM</option><option>CNRPS</option><option>Assurance privée</option><option>Sans assurance</option>
          </select>
        </div>
        <div><Label className="text-xs">Gouvernorat</Label>
          <select value={form.gouvernorat} onChange={e => setForm(f => ({ ...f, gouvernorat: e.target.value }))} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
            {["Tunis", "Ariana", "Ben Arous", "Manouba", "Sousse", "Sfax", "Nabeul", "Bizerte"].map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <div><Label className="text-xs">Médecin traitant</Label>
        <select value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
          <option>Dr. Bouazizi</option><option>Dr. Gharbi</option><option>Dr. Hammami</option>
        </select>
      </div>
      <div><Label className="text-xs">Notes / Antécédents</Label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none" placeholder="Notes importantes..." /></div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>Annuler</Button>
        <Button className="flex-1 gradient-primary text-primary-foreground" onClick={handleSubmit} disabled={!form.firstName || !form.name}>Créer le patient</Button>
      </div>
    </div>
  );
};

export default SecretaryPatients;
