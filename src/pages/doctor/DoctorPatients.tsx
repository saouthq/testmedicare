import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Phone, AlertTriangle, Activity, Calendar, MessageSquare, FileText, Eye, Plus, Download, X, Shield, UserPlus, Filter, SortAsc, SortDesc, Mail, Clock, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { mockPatients } from "@/data/mockData";

type PatientFilter = "all" | "recent" | "chronic" | "new";
type SortKey = "name" | "lastVisit" | "age";

const DoctorPatients = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PatientFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patients, setPatients] = useState(mockPatients);

  // New patient form
  const [newForm, setNewForm] = useState({ firstName: "", lastName: "", phone: "", email: "", dob: "", bloodType: "A+", allergies: "", conditions: "", cnamId: "" });

  const filtered = patients.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.phone.includes(search)) return false;
    if (filter === "recent") return p.lastVisit !== null;
    if (filter === "chronic") return p.chronicConditions.length > 0;
    if (filter === "new") return p.isNew;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    if (sortBy === "name") return a.name.localeCompare(b.name) * dir;
    if (sortBy === "age") return (a.age - b.age) * dir;
    return 0;
  });

  const selectedPatient = selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null;

  const handleAddPatient = () => {
    if (!newForm.firstName || !newForm.lastName) return;
    const name = `${newForm.firstName} ${newForm.lastName}`;
    const avatar = `${newForm.firstName[0]}${newForm.lastName[0]}`.toUpperCase();
    const newP: typeof patients[0] = {
      id: patients.length + 100,
      name, avatar,
      age: newForm.dob ? Math.floor((Date.now() - new Date(newForm.dob).getTime()) / 31557600000) : 0,
      gender: "", dob: newForm.dob, address: "", ssn: "", mutuelle: "",
      treatingDoctor: "", registeredSince: "Fév 2026", conditions: [],
      gouvernorat: "", balance: 0, notes: "",
      phone: newForm.phone,
      email: newForm.email,
      chronicConditions: newForm.conditions ? newForm.conditions.split(",").map(s => s.trim()) : [],
      allergies: newForm.allergies ? newForm.allergies.split(",").map(s => ({ name: s.trim(), severity: "Modéré" })) : [],
      isNew: true,
      lastVisit: null,
      nextAppointment: null,
      lastVitals: { ta: "—", glycemia: "—" },
      bloodType: newForm.bloodType,
      cnamId: newForm.cnamId,
    };
    setPatients(prev => [newP, ...prev]);
    setShowNewPatient(false);
    setNewForm({ firstName: "", lastName: "", phone: "", email: "", dob: "", bloodType: "A+", allergies: "", conditions: "", cnamId: "" });
  };

  const handleExportCSV = () => {
    const header = "Nom,Âge,Téléphone,Pathologies,Allergies,Dernière visite\n";
    const rows = sorted.map(p =>
      `"${p.name}",${p.age},"${p.phone}","${p.chronicConditions.join(";")}","${p.allergies.map(a => a.name).join(";")}","${p.lastVisit || "—"}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "patients.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else { setSortBy(key); setSortAsc(true); }
  };

  return (
    <DashboardLayout role="doctor" title="Mes patients">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un patient (nom, téléphone)..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1 rounded-lg border bg-card p-0.5">
              {([
                { key: "all" as PatientFilter, label: "Tous" },
                { key: "recent" as PatientFilter, label: "Récents" },
                { key: "chronic" as PatientFilter, label: "Chroniques" },
                { key: "new" as PatientFilter, label: "Nouveaux" },
              ]).map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f.label}</button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="text-xs" onClick={handleExportCSV}><Download className="h-3.5 w-3.5 mr-1" />Export CSV</Button>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => setShowNewPatient(true)}>
              <UserPlus className="h-4 w-4 mr-1" />Nouveau patient
            </Button>
          </div>
        </div>

        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-foreground">{patients.length}</p><p className="text-[11px] text-muted-foreground">Total patients</p></div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-primary">{patients.filter(p => p.chronicConditions.length > 0).length}</p><p className="text-[11px] text-muted-foreground">Chroniques</p></div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-accent">{patients.filter(p => p.nextAppointment).length}</p><p className="text-[11px] text-muted-foreground">RDV planifiés</p></div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-warning">{patients.filter(p => p.isNew).length}</p><p className="text-[11px] text-muted-foreground">Nouveaux</p></div>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Trier par :</span>
          {([{ key: "name" as SortKey, label: "Nom" }, { key: "age" as SortKey, label: "Âge" }]).map(s => (
            <button key={s.key} onClick={() => toggleSort(s.key)}
              className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${sortBy === s.key ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}>
              {s.label}
              {sortBy === s.key && (sortAsc ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
            </button>
          ))}
          <span className="ml-auto text-muted-foreground">{sorted.length} patient(s)</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {sorted.map((p) => (
              <div key={p.id} onClick={() => setSelectedPatientId(p.id)}
                className={`rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer group ${selectedPatientId === p.id ? "ring-2 ring-primary border-primary/30" : ""}`}>
                <div className="flex items-start gap-4">
                  <Link to={`/dashboard/doctor/patients/${p.id}`} className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 hover:opacity-80 transition-opacity ${p.isNew ? "bg-warning/10 text-warning border-2 border-warning/30" : "gradient-primary text-primary-foreground"}`}>{p.avatar}</Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link to={`/dashboard/doctor/patients/${p.id}`} className="font-semibold text-foreground text-sm hover:text-primary transition-colors">{p.name}</Link>
                          <span className="text-xs text-muted-foreground">{p.age} ans</span>
                          {p.isNew && <span className="text-[10px] font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">Nouveau</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {p.chronicConditions.map(c => <span key={c} className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{c}</span>)}
                          {p.allergies.map(a => <span key={a.name} className="flex items-center gap-0.5 text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full"><AlertTriangle className="h-2.5 w-2.5" />{a.name}</span>)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Link to="/dashboard/doctor/consultation/new"><Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Consultation"><FileText className="h-4 w-4" /></Button></Link>
                        <Link to="/dashboard/doctor/messages"><Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Message"><MessageSquare className="h-4 w-4" /></Button></Link>
                        <Link to={`/dashboard/doctor/patients/${p.id}`}><Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Voir"><Eye className="h-4 w-4" /></Button></Link>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>
                      {p.lastVisit && <span>Dernière visite : {p.lastVisit}</span>}
                      {p.nextAppointment && <span className="flex items-center gap-1 text-accent font-medium"><Calendar className="h-3 w-3" />Prochain : {p.nextAppointment}</span>}
                      {p.lastVitals.ta !== "—" && <span className="flex items-center gap-1"><Activity className="h-3 w-3" />TA {p.lastVitals.ta}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          <div className="rounded-xl border bg-card shadow-card">
            {selectedPatient ? (
              <div>
                <div className="p-5 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">{selectedPatient.avatar}</div>
                    <div>
                      <h3 className="font-bold text-foreground">{selectedPatient.name}</h3>
                      <p className="text-xs text-muted-foreground">{selectedPatient.age} ans</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-[10px] text-muted-foreground">Téléphone</p>
                      <p className="text-xs font-medium text-foreground">{selectedPatient.phone}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-[10px] text-muted-foreground">Dernière visite</p>
                      <p className="text-xs font-medium text-foreground">{selectedPatient.lastVisit || "—"}</p>
                    </div>
                  </div>

                  {/* Vitals */}
                  {selectedPatient.lastVitals.ta !== "—" && (
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                      <p className="text-[10px] text-primary font-medium mb-2">Dernières constantes</p>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div><p className="text-xs text-muted-foreground">TA</p><p className="text-sm font-bold text-foreground">{selectedPatient.lastVitals.ta}</p></div>
                        <div><p className="text-xs text-muted-foreground">Glycémie</p><p className="text-sm font-bold text-foreground">{selectedPatient.lastVitals.glycemia}</p></div>
                      </div>
                    </div>
                  )}

                  {/* Conditions */}
                  {selectedPatient.chronicConditions.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1.5">Pathologies chroniques</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPatient.chronicConditions.map(c => (
                          <span key={c} className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Allergies */}
                  {selectedPatient.allergies.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1.5">Allergies</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPatient.allergies.map(a => (
                          <span key={a.name} className="flex items-center gap-0.5 text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="h-2.5 w-2.5" />{a.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick actions */}
                  <div className="space-y-1.5 pt-2">
                    <Link to="/dashboard/doctor/consultation/new" className="block">
                      <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                        <FileText className="h-3.5 w-3.5 mr-2 text-primary" />Démarrer consultation
                      </Button>
                    </Link>
                    <Link to={`/dashboard/doctor/patients/${selectedPatient.id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                        <Eye className="h-3.5 w-3.5 mr-2 text-accent" />Voir dossier complet
                      </Button>
                    </Link>
                    <Link to="/dashboard/doctor/messages" className="block">
                      <Button variant="ghost" size="sm" className="w-full text-xs justify-start">
                        <MessageSquare className="h-3.5 w-3.5 mr-2 text-muted-foreground" />Envoyer un message
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="w-full text-xs justify-start">
                      <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />Appeler
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Eye className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Cliquez sur un patient pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New patient modal */}
      {showNewPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowNewPatient(false)}>
          <div className="bg-card rounded-2xl border shadow-elevated p-6 w-full max-w-lg mx-4 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" />Nouveau patient</h3>
              <button onClick={() => setShowNewPatient(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Prénom *</Label><Input value={newForm.firstName} onChange={e => setNewForm(f => ({ ...f, firstName: e.target.value }))} className="mt-1" placeholder="Prénom" /></div>
                <div><Label className="text-xs">Nom *</Label><Input value={newForm.lastName} onChange={e => setNewForm(f => ({ ...f, lastName: e.target.value }))} className="mt-1" placeholder="Nom" /></div>
                <div><Label className="text-xs">Date de naissance</Label><Input type="date" value={newForm.dob} onChange={e => setNewForm(f => ({ ...f, dob: e.target.value }))} className="mt-1" /></div>
                <div><Label className="text-xs">Téléphone</Label><Input value={newForm.phone} onChange={e => setNewForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" placeholder="+216 XX XXX XXX" /></div>
                <div><Label className="text-xs">Email</Label><Input type="email" value={newForm.email} onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))} className="mt-1" placeholder="email@..." /></div>
                <div><Label className="text-xs">Groupe sanguin</Label>
                  <select value={newForm.bloodType} onChange={e => setNewForm(f => ({ ...f, bloodType: e.target.value }))} className="mt-1 w-full h-9 rounded-md border bg-background px-3 text-sm">
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div><Label className="text-xs">N° CNAM</Label><Input value={newForm.cnamId} onChange={e => setNewForm(f => ({ ...f, cnamId: e.target.value }))} className="mt-1" placeholder="XXXXXXXX" /></div>
              </div>
              <div><Label className="text-xs">Allergies (séparées par des virgules)</Label><Input value={newForm.allergies} onChange={e => setNewForm(f => ({ ...f, allergies: e.target.value }))} className="mt-1" placeholder="Pénicilline, Aspirine..." /></div>
              <div><Label className="text-xs">Pathologies chroniques (séparées par des virgules)</Label><Input value={newForm.conditions} onChange={e => setNewForm(f => ({ ...f, conditions: e.target.value }))} className="mt-1" placeholder="Diabète type 2, Hypertension..." /></div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowNewPatient(false)}>Annuler</Button>
                <Button className="flex-1 gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleAddPatient} disabled={!newForm.firstName || !newForm.lastName}>
                  <UserPlus className="h-4 w-4 mr-2" />Créer le patient
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorPatients;
