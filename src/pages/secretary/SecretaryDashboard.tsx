import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Calendar, Clock, CheckCircle2, Play, Bell, MapPin, RefreshCw, Plus, Timer,
  Users, Search, Phone, Shield, FileText, Banknote, Eye, X, ChevronRight,
  UserCheck, Stethoscope, Video, AlertTriangle, MessageSquare, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useState } from "react";
import { mockSecretaryWaitingRoom, mockSecretaryAppointments } from "@/data/mockData";

type DashTab = "overview" | "billing" | "patients";

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  done: { label: "Terminé", class: "bg-muted text-muted-foreground", icon: CheckCircle2 },
  in_progress: { label: "En consultation", class: "bg-primary/10 text-primary", icon: Play },
  waiting: { label: "En salle", class: "bg-warning/10 text-warning", icon: Clock },
  called: { label: "Appelé", class: "bg-accent/10 text-accent", icon: Bell },
  upcoming: { label: "À venir", class: "bg-muted/50 text-muted-foreground", icon: Clock },
};

const quickInvoiceActs = [
  { name: "Consultation générale", price: 35 },
  { name: "Suivi maladie chronique", price: 25 },
  { name: "1ère consultation", price: 50 },
  { name: "ECG", price: 40 },
  { name: "Bilan complet", price: 80 },
  { name: "Certificat médical", price: 20 },
];

const recentPatients = [
  { name: "Amine Ben Ali", avatar: "AB", phone: "+216 71 234 567", cnam: true, nextRdv: "28 Fév 14:30", balance: 0 },
  { name: "Fatma Trabelsi", avatar: "FT", phone: "+216 22 345 678", cnam: true, nextRdv: "25 Fév 10:00", balance: 60 },
  { name: "Mohamed Sfar", avatar: "MS", phone: "+216 55 456 789", cnam: false, nextRdv: null, balance: 0 },
  { name: "Nadia Jemni", avatar: "NJ", phone: "+216 98 567 890", cnam: true, nextRdv: "3 Mar 09:00", balance: 25 },
];

const SecretaryDashboard = () => {
  const [waitingRoom, setWaitingRoom] = useState(mockSecretaryWaitingRoom);
  const [appointments, setAppointments] = useState(mockSecretaryAppointments);
  const [refreshing, setRefreshing] = useState(false);
  const [timeSlot, setTimeSlot] = useState<"morning" | "afternoon">("morning");
  const [activeTab, setActiveTab] = useState<DashTab>("overview");
  
  // Quick invoice state
  const [showQuickInvoice, setShowQuickInvoice] = useState(false);
  const [invoicePatient, setInvoicePatient] = useState("");
  const [invoiceActs, setInvoiceActs] = useState<{ name: string; price: number }[]>([]);
  const [invoicePayment, setInvoicePayment] = useState("Espèces");
  const [invoiceCnam, setInvoiceCnam] = useState(true);

  // New patient state
  const [showNewPatient, setShowNewPatient] = useState(false);

  // Detail drawer
  const [drawerApt, setDrawerApt] = useState<number | null>(null);

  // Search
  const [searchPatient, setSearchPatient] = useState("");

  const morningAppts = appointments.filter(a => parseInt(a.time) < 13);
  const afternoonAppts = appointments.filter(a => parseInt(a.time) >= 13);
  const displayedAppts = timeSlot === "morning" ? morningAppts : afternoonAppts;

  const waitingCount = waitingRoom.filter(w => w.status === "waiting" || w.status === "called").length;
  const inProgressCount = appointments.filter(a => a.status === "in_progress").length;
  const doneCount = appointments.filter(a => a.status === "done").length;
  const totalActive = appointments.filter(a => a.status !== "done").length;

  const handleCallPatient = (id: number) => {
    setWaitingRoom(prev => prev.map(w => w.id === id ? { ...w, status: "called" } : w));
  };

  const handleSendToConsult = (id: number) => {
    setWaitingRoom(prev => prev.filter(w => w.id !== id));
    setAppointments(prev => prev.map(a => {
      const wr = mockSecretaryWaitingRoom.find(w => w.id === id);
      if (wr && a.patient === wr.patient) return { ...a, status: "in_progress" };
      return a;
    }));
  };

  const handleRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); };

  const handleAddInvoiceAct = (act: typeof quickInvoiceActs[0]) => {
    setInvoiceActs(prev => [...prev, act]);
  };

  const handleCreateInvoice = () => {
    if (!invoicePatient || invoiceActs.length === 0) return;
    setShowQuickInvoice(false);
    setInvoicePatient("");
    setInvoiceActs([]);
  };

  const invoiceTotal = invoiceActs.reduce((s, a) => s + a.price, 0);

  const selectedApt = drawerApt ? appointments.find(a => a.id === drawerApt) : null;

  const filteredPatients = recentPatients.filter(p => 
    !searchPatient || p.name.toLowerCase().includes(searchPatient.toLowerCase())
  );

  return (
    <DashboardLayout role="secretary" title="Tableau de bord">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Cabinet Médical El Manar</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />Tunis · Vendredi 20 Février 2026 · <span className="font-medium text-foreground">09:30</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={handleRefresh}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} />Actualiser
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowNewPatient(true)}>
              <Users className="h-3.5 w-3.5 mr-1" />Nouveau patient
            </Button>
            <Link to="/dashboard/secretary/agenda">
              <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
                <Plus className="h-4 w-4 mr-1.5" />Nouveau RDV
              </Button>
            </Link>
          </div>
        </div>

        {/* Live counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-warning/5 border-warning/20 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><Clock className="h-5 w-5 text-warning" /></div>
            <div><p className="text-lg font-bold text-warning">{waitingCount}</p><p className="text-[10px] text-muted-foreground">En attente</p></div>
          </div>
          <div className="rounded-xl border bg-primary/5 border-primary/20 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Stethoscope className="h-5 w-5 text-primary" /></div>
            <div><p className="text-lg font-bold text-primary">{inProgressCount}</p><p className="text-[10px] text-muted-foreground">En consultation</p></div>
          </div>
          <div className="rounded-xl border bg-accent/5 border-accent/20 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-accent" /></div>
            <div><p className="text-lg font-bold text-accent">{doneCount}</p><p className="text-[10px] text-muted-foreground">Terminés</p></div>
          </div>
          <div className="rounded-xl border p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center"><Calendar className="h-5 w-5 text-muted-foreground" /></div>
            <div><p className="text-lg font-bold text-foreground">{appointments.length}</p><p className="text-[10px] text-muted-foreground">Total RDV</p></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border bg-card p-0.5 w-fit">
          {([
            { key: "overview" as DashTab, label: "Vue d'ensemble", icon: Calendar },
            { key: "billing" as DashTab, label: "Encaissement rapide", icon: Banknote },
            { key: "patients" as DashTab, label: "Patients récents", icon: Users },
          ]).map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${activeTab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-3.5 w-3.5" />{t.label}
            </button>
          ))}
        </div>

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === "overview" && (
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
              {/* Waiting Room */}
              <div className="rounded-xl border border-warning/30 bg-card shadow-card">
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" />Salle d'attente
                    <span className="bg-warning/10 text-warning text-xs font-bold px-2 py-0.5 rounded-full ml-1">{waitingCount}</span>
                  </h3>
                </div>
                {waitingRoom.length === 0 ? (
                  <div className="p-8 text-center"><Timer className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" /><p className="text-sm text-muted-foreground">Salle d'attente vide</p></div>
                ) : (
                  <div className="divide-y">
                    {waitingRoom.map((w) => (
                      <div key={w.id} className={`p-4 transition-colors ${w.status === "called" ? "bg-accent/5" : "hover:bg-muted/30"}`}>
                        <div className="flex items-center gap-4">
                          <div className={`h-11 w-11 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${w.status === "called" ? "bg-accent text-accent-foreground" : "bg-warning/10 text-warning"}`}>
                            {w.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-foreground text-sm">{w.patient}</p>
                              {w.status === "called" && <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-bold animate-pulse">APPELÉ</span>}
                              {w.cnam && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">CNAM</span>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{w.doctor} · {w.motif} · RDV {w.appointment}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Timer className="h-3 w-3 text-muted-foreground" />
                              <span className={`text-[11px] font-medium ${w.waitMin > 15 ? "text-destructive" : w.waitMin > 10 ? "text-warning" : "text-muted-foreground"}`}>
                                Arrivé à {w.arrivedAt} · {w.waitMin} min d'attente
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {w.status === "waiting" && (
                              <Button size="sm" className="h-8 text-xs gradient-primary text-primary-foreground" onClick={() => handleCallPatient(w.id)}>
                                <Bell className="h-3.5 w-3.5 mr-1" />Appeler
                              </Button>
                            )}
                            {w.status === "called" && (
                              <Button size="sm" className="h-8 text-xs bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleSendToConsult(w.id)}>
                                <Play className="h-3.5 w-3.5 mr-1" />En consultation
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Planning Timeline */}
              <div className="rounded-xl border bg-card shadow-card">
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <h2 className="font-semibold text-foreground flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Planning du jour</h2>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 rounded-lg border bg-muted/50 p-0.5">
                      <button onClick={() => setTimeSlot("morning")} className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${timeSlot === "morning" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Matin</button>
                      <button onClick={() => setTimeSlot("afternoon")} className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${timeSlot === "afternoon" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Après-midi</button>
                    </div>
                  </div>
                </div>
                <div className="divide-y max-h-[400px] overflow-y-auto">
                  {displayedAppts.map((a) => {
                    const config = statusConfig[a.status];
                    return (
                      <div key={a.id} onClick={() => setDrawerApt(a.id)}
                        className={`flex items-center gap-4 px-5 py-3 transition-colors cursor-pointer ${
                          a.status === "in_progress" ? "bg-primary/5 border-l-3 border-l-primary" :
                          a.status === "waiting" ? "bg-warning/5 border-l-3 border-l-warning" :
                          a.status === "done" ? "opacity-40" : "hover:bg-muted/30"
                        }`}>
                        <div className="w-12 text-center shrink-0">
                          <p className="text-sm font-semibold text-foreground">{a.time}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${config.class}`}>{config.label}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground text-sm">{a.patient}</p>
                            {a.cnam && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">CNAM</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{a.type} · {a.doctor}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-foreground">{a.amount}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right sidebar - Quick actions */}
            <div className="space-y-5">
              {/* Quick actions */}
              <div className="rounded-xl border bg-card shadow-card p-5">
                <h3 className="font-semibold text-foreground text-sm mb-3">Actions rapides</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full text-xs justify-start" onClick={() => { setActiveTab("billing"); setShowQuickInvoice(true); }}>
                    <Banknote className="h-3.5 w-3.5 mr-2 text-accent" />Encaisser un patient
                  </Button>
                  <Link to="/dashboard/secretary/agenda" className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-primary" />Voir l'agenda complet
                    </Button>
                  </Link>
                  <Link to="/dashboard/secretary/patients" className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      <Users className="h-3.5 w-3.5 mr-2 text-muted-foreground" />Gérer les patients
                    </Button>
                  </Link>
                  <Link to="/dashboard/secretary/documents" className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      <FileText className="h-3.5 w-3.5 mr-2 text-warning" />Documents
                    </Button>
                  </Link>
                  <Link to="/dashboard/secretary/messages" className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      <MessageSquare className="h-3.5 w-3.5 mr-2 text-primary" />Messagerie cabinet
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Unpaid alerts */}
              <div className="rounded-xl border border-destructive/20 bg-card shadow-card p-5">
                <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />Impayés
                </h3>
                <div className="space-y-2">
                  {[
                    { patient: "Fatma Trabelsi", amount: 60, date: "20 Fév" },
                    { patient: "Nadia Jemni", amount: 25, date: "10 Fév" },
                    { patient: "Rania Meddeb", amount: 60, date: "15 Fév" },
                  ].map((u, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-destructive/10 bg-destructive/5 p-2.5">
                      <div>
                        <p className="text-xs font-medium text-foreground">{u.patient}</p>
                        <p className="text-[10px] text-muted-foreground">{u.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-destructive">{u.amount} DT</span>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => { setActiveTab("billing"); setShowQuickInvoice(true); setInvoicePatient(u.patient); }}>
                          Encaisser
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctors status */}
              <div className="rounded-xl border bg-card shadow-card p-5">
                <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />Médecins
                </h3>
                <div className="space-y-2.5">
                  {[
                    { name: "Dr. Bouazizi", status: "En consultation", color: "bg-primary" },
                    { name: "Dr. Gharbi", status: "Disponible", color: "bg-accent" },
                    { name: "Dr. Hammami", status: "Absent", color: "bg-muted-foreground" },
                  ].map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-[10px] font-medium">
                          {d.name.split(". ")[1]?.[0]}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${d.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">{d.name}</p>
                        <p className="text-[10px] text-muted-foreground">{d.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ BILLING TAB ═══ */}
        {activeTab === "billing" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Encaissement rapide depuis le dashboard</p>
              <Button className="gradient-primary text-primary-foreground" size="sm" onClick={() => setShowQuickInvoice(true)}>
                <Banknote className="h-4 w-4 mr-1" />Nouvelle facture
              </Button>
            </div>

            {showQuickInvoice && (
              <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground flex items-center gap-2"><Banknote className="h-4 w-4 text-accent" />Encaissement rapide</h3>
                  <button onClick={() => { setShowQuickInvoice(false); setInvoiceActs([]); setInvoicePatient(""); }}><X className="h-4 w-4 text-muted-foreground" /></button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Patient</Label>
                    <Input value={invoicePatient} onChange={e => setInvoicePatient(e.target.value)} placeholder="Nom du patient" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Mode de paiement</Label>
                    <select value={invoicePayment} onChange={e => setInvoicePayment(e.target.value)} className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm">
                      <option>Espèces</option><option>Carte bancaire</option><option>Chèque</option><option>Virement</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Actes (cliquez pour ajouter)</Label>
                  <div className="flex flex-wrap gap-2">
                    {quickInvoiceActs.map(act => (
                      <button key={act.name} onClick={() => handleAddInvoiceAct(act)}
                        className="rounded-lg border bg-card px-3 py-2 text-xs hover:border-primary/30 hover:bg-primary/5 transition-colors">
                        {act.name} <span className="font-bold text-primary ml-1">{act.price} DT</span>
                      </button>
                    ))}
                  </div>
                </div>
                {invoiceActs.length > 0 && (
                  <div className="rounded-lg bg-card border p-3 space-y-2">
                    {invoiceActs.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-foreground">{a.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{a.price} DT</span>
                          <button onClick={() => setInvoiceActs(prev => prev.filter((_, j) => j !== i))} className="text-destructive"><X className="h-3 w-3" /></button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs">
                          <input type="checkbox" checked={invoiceCnam} onChange={e => setInvoiceCnam(e.target.checked)} className="rounded border-input" />
                          <Shield className="h-3 w-3 text-primary" />CNAM
                        </label>
                      </div>
                      <span className="text-sm font-bold text-foreground">Total : {invoiceTotal} DT</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button className="gradient-primary text-primary-foreground flex-1" onClick={handleCreateInvoice} disabled={!invoicePatient || invoiceActs.length === 0}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />Encaisser {invoiceTotal > 0 ? `${invoiceTotal} DT` : ""}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowQuickInvoice(false); setInvoiceActs([]); }}>Annuler</Button>
                </div>
              </div>
            )}

            {/* Today's transactions */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="border-b px-5 py-4">
                <h3 className="font-semibold text-foreground text-sm">Encaissements du jour</h3>
              </div>
              <div className="divide-y">
                {[
                  { patient: "Amine Ben Ali", amount: 35, method: "CNAM", time: "08:45", status: "paid" },
                  { patient: "Karim Mansour", amount: 35, method: "Espèces", time: "09:15", status: "paid" },
                  { patient: "Leila Chahed", amount: 60, method: "Carte", time: "09:30", status: "paid" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.patient}</p>
                        <p className="text-xs text-muted-foreground">{t.time} · {t.method}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-accent">{t.amount} DT</span>
                  </div>
                ))}
              </div>
              <div className="border-t px-5 py-3 bg-accent/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Total encaissé aujourd'hui</span>
                  <span className="text-sm font-bold text-accent">130 DT</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ PATIENTS TAB ═══ */}
        {activeTab === "patients" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Rechercher un patient..." value={searchPatient} onChange={e => setSearchPatient(e.target.value)} className="pl-9 h-9 text-xs" />
              </div>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowNewPatient(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" />Nouveau patient
              </Button>
            </div>

            <div className="rounded-xl border bg-card shadow-card overflow-hidden">
              <div className="divide-y">
                {filteredPatients.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">{p.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        {p.cnam && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">CNAM</span>}
                        {p.balance > 0 && <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">{p.balance} DT dû</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.phone} {p.nextRdv ? `· Prochain RDV : ${p.nextRdv}` : "· Aucun RDV"}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                      <Link to="/dashboard/secretary/agenda">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Calendar className="h-3.5 w-3.5 text-primary" /></Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setActiveTab("billing"); setShowQuickInvoice(true); setInvoicePatient(p.name); }}>
                        <Banknote className="h-3.5 w-3.5 text-accent" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t px-5 py-3">
                <Link to="/dashboard/secretary/patients" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Voir tous les patients <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── RDV detail drawer ── */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setDrawerApt(null)}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-fade-in max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{selectedApt.patient}</h3>
                <button onClick={() => setDrawerApt(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Heure</p><p className="text-sm font-medium text-foreground mt-0.5">{selectedApt.time}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Médecin</p><p className="text-sm font-medium text-foreground mt-0.5">{selectedApt.doctor}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Type</p><p className="text-sm font-medium text-foreground mt-0.5">{selectedApt.type}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Montant</p><p className="text-sm font-bold text-foreground mt-0.5">{selectedApt.amount}</p></div>
              </div>
              <div className="space-y-2">
                {selectedApt.status === "upcoming" && (
                  <Button size="sm" className="w-full text-xs" variant="outline" onClick={() => { /* accueillir */ setDrawerApt(null); }}>
                    <UserCheck className="h-3.5 w-3.5 mr-1" />Accueillir le patient
                  </Button>
                )}
                <Button size="sm" className="w-full text-xs" variant="outline" onClick={() => { setActiveTab("billing"); setShowQuickInvoice(true); setInvoicePatient(selectedApt.patient); setDrawerApt(null); }}>
                  <Banknote className="h-3.5 w-3.5 mr-1" />Encaisser
                </Button>
                <Button size="sm" className="w-full text-xs" variant="outline">
                  <Phone className="h-3.5 w-3.5 mr-1" />Appeler le patient
                </Button>
                <Button size="sm" className="w-full text-xs text-destructive border-destructive/30" variant="outline">
                  <X className="h-3.5 w-3.5 mr-1" />Annuler le RDV
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── New patient modal ── */}
      {showNewPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowNewPatient(false)}>
          <div className="bg-card rounded-2xl border shadow-elevated p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Nouveau patient</h3>
              <button onClick={() => setShowNewPatient(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Prénom</Label><Input className="mt-1" placeholder="Prénom" /></div>
                <div><Label className="text-xs">Nom</Label><Input className="mt-1" placeholder="Nom" /></div>
                <div><Label className="text-xs">Date de naissance</Label><Input type="date" className="mt-1" /></div>
                <div><Label className="text-xs">Téléphone</Label><Input className="mt-1" placeholder="+216 XX XXX XXX" /></div>
                <div><Label className="text-xs">Email</Label><Input type="email" className="mt-1" placeholder="email@..." /></div>
                <div><Label className="text-xs">N° CNAM</Label><Input className="mt-1" placeholder="XXXXXXXX" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Assurance</Label>
                  <select className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"><option>CNAM</option><option>CNRPS</option><option>Privée</option><option>Sans</option></select>
                </div>
                <div><Label className="text-xs">Médecin</Label>
                  <select className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"><option>Dr. Bouazizi</option><option>Dr. Gharbi</option><option>Dr. Hammami</option></select>
                </div>
              </div>
              <div><Label className="text-xs">Notes</Label><textarea rows={2} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none" placeholder="Notes..." /></div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowNewPatient(false)}>Annuler</Button>
                <Button className="flex-1 gradient-primary text-primary-foreground" onClick={() => setShowNewPatient(false)}>Créer le patient</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SecretaryDashboard;
