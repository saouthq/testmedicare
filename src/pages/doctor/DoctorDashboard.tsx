import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { 
  Calendar, Clock, CheckCircle2, Play, 
  Bell, AlertTriangle, MessageSquare, Shield, Search,
  Filter, MoreHorizontal, FileText, Video, RefreshCw, X, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockTodaySchedule, mockWaitingRoom, mockUrgentAlerts } from "@/data/mockData";

type StatusFilter = "all" | "done" | "current" | "upcoming";

const DoctorDashboard = () => {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

  const doneCount = mockTodaySchedule.filter(s => s.status === "done").length;
  const totalCount = mockTodaySchedule.length;
  const currentRdv = mockTodaySchedule.find(s => s.status === "current");
  const nextRdv = mockTodaySchedule.find(s => s.status === "upcoming");

  const filteredSchedule = mockTodaySchedule.filter(s => {
    if (filter !== "all" && s.status !== filter) return false;
    if (searchQuery && !s.patient.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout role="doctor" title="Tableau de bord">
      <div className="space-y-6">
        {/* Hero — compact overview */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl gradient-primary p-5 text-primary-foreground">
            <div className="relative z-10">
              <p className="text-primary-foreground/70 text-sm">Bonjour,</p>
              <h2 className="text-xl font-bold mt-0.5">Dr. Ahmed Bouazizi</h2>
              <p className="text-primary-foreground/80 mt-1 text-sm">{doneCount}/{totalCount} consultations · Prochain : <span className="font-semibold">{nextRdv?.time || "—"}</span></p>
              <div className="flex gap-3 mt-3">
                <Link to="/dashboard/doctor/consultation/new">
                  <Button size="sm" variant="secondary" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"><Play className="h-4 w-4 mr-1.5" />Démarrer consultation</Button>
                </Link>
                <Link to="/dashboard/doctor/schedule">
                  <Button size="sm" variant="secondary" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20">Planning complet</Button>
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          </div>

          {/* Waiting room */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Clock className="h-4 w-4 text-warning" />Salle d'attente</h3>
              <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">{mockWaitingRoom.length}</span>
            </div>
            <div className="space-y-2.5">
              {mockWaitingRoom.map((w, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3 bg-warning/5 border-warning/20">
                  <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center text-xs font-medium text-warning">{w.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{w.patient}</p>
                    <p className="text-xs text-muted-foreground">RDV {w.appointment} · Attente {w.wait}</p>
                  </div>
                  <Link to="/dashboard/doctor/consultation/new"><Button size="sm" className="h-7 text-xs gradient-primary text-primary-foreground"><Play className="h-3 w-3 mr-1" />Appeler</Button></Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {mockUrgentAlerts.length > 0 && (
          <div className="rounded-xl border bg-card shadow-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-destructive" />
              <h3 className="font-semibold text-foreground text-sm">Alertes</h3>
              <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">{mockUrgentAlerts.length}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {mockUrgentAlerts.map((a, i) => (
                <Link key={i} to={(a as any).link || "/dashboard/doctor/patients"} className={`rounded-lg border p-3 flex items-start gap-2 cursor-pointer hover:shadow-sm transition-all ${a.severity === "high" ? "border-destructive/30 bg-destructive/5 hover:bg-destructive/10" : "bg-card hover:bg-muted/30"}`}>
                  {a.severity === "high" ? <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /> : <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                  <div className="flex-1"><p className="text-xs font-medium text-foreground">{a.patient}</p><p className="text-xs text-muted-foreground mt-0.5">{a.text}</p></div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Planning du jour — main section */}
        <div className="rounded-xl border bg-card shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-5 py-4 gap-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Planning du jour<span className="text-xs text-muted-foreground font-normal ml-1">{totalCount} RDV</span></h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Rechercher patient..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs" />
              </div>
              <Link to="/dashboard/doctor/schedule" className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0">Semaine <Filter className="h-3.5 w-3.5" /></Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-1.5 px-5 py-2.5 border-b overflow-x-auto">
            {([["all", "Tous"], ["upcoming", "À venir"], ["current", "En cours"], ["done", "Terminés"]] as [StatusFilter, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all whitespace-nowrap ${filter === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Current / Next RDV highlight */}
          {currentRdv && filter === "all" && !searchQuery && (
            <div className="mx-5 mt-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">{currentRdv.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-semibold text-primary">En cours — {currentRdv.time}</span>
                  </div>
                  <p className="font-semibold text-foreground">{currentRdv.patient}</p>
                  <p className="text-xs text-muted-foreground">{currentRdv.motif} · {currentRdv.type} · {currentRdv.duration}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to={`/dashboard/doctor/patients/1`}><Button variant="outline" size="sm" className="h-8 text-xs"><FileText className="h-3.5 w-3.5 mr-1" />Dossier</Button></Link>
                  <Link to="/dashboard/doctor/consultation/new"><Button size="sm" className="h-8 text-xs gradient-primary text-primary-foreground"><Play className="h-3.5 w-3.5 mr-1" />Consultation</Button></Link>
                </div>
              </div>
            </div>
          )}

          {/* Schedule list */}
          <div className="divide-y max-h-[420px] overflow-y-auto">
            {filteredSchedule.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 px-5 py-3 transition-colors relative group ${s.status === "current" ? "bg-primary/5" : s.status === "done" ? "opacity-50" : "hover:bg-muted/30"}`}>
                <div className="w-12 text-center shrink-0">
                  <p className={`text-sm font-semibold ${s.status === "current" ? "text-primary" : "text-foreground"}`}>{s.time}</p>
                  <p className="text-[10px] text-muted-foreground">{s.duration}</p>
                </div>
                <div className={`h-2.5 w-2.5 rounded-full border-2 shrink-0 ${s.status === "done" ? "bg-accent border-accent" : s.status === "current" ? "bg-primary border-primary animate-pulse" : "bg-card border-border"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground text-sm truncate">{s.patient}</p>
                    {s.teleconsultation && <Video className="h-3.5 w-3.5 text-primary shrink-0" />}
                    {s.cnam && <Shield className="h-3 w-3 text-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{s.motif} · {s.type}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {s.status === "done" && <span className="rounded-full bg-accent/10 text-accent px-2 py-0.5 text-[11px] font-medium flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Terminé</span>}
                  {s.status === "current" && <Link to="/dashboard/doctor/consultation/new"><Button size="sm" className="h-7 text-xs gradient-primary text-primary-foreground"><Play className="h-3 w-3 mr-1" />En cours</Button></Link>}
                  {s.status === "upcoming" && (
                    <>
                      <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[11px] font-medium hidden sm:inline">À venir</span>
                      <div className="relative">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActionMenuOpen(actionMenuOpen === i ? null : i)}>
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        {actionMenuOpen === i && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActionMenuOpen(null)} />
                            <div className="absolute right-0 top-8 z-50 w-48 rounded-lg border bg-card shadow-elevated p-1 animate-fade-in">
                              <Link to={`/dashboard/doctor/patients/1`} className="flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground" onClick={() => setActionMenuOpen(null)}><FileText className="h-3.5 w-3.5 text-primary" />Ouvrir dossier</Link>
                              <Link to="/dashboard/doctor/consultation/new" className="flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground" onClick={() => setActionMenuOpen(null)}><Play className="h-3.5 w-3.5 text-accent" />Démarrer consultation</Link>
                              <button className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground" onClick={() => setActionMenuOpen(null)}><MessageSquare className="h-3.5 w-3.5 text-primary" />Message patient</button>
                              <button className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground" onClick={() => setActionMenuOpen(null)}><RefreshCw className="h-3.5 w-3.5 text-warning" />Reprogrammer</button>
                              <button className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors text-destructive" onClick={() => setActionMenuOpen(null)}><X className="h-3.5 w-3.5" />Annuler</button>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            {filteredSchedule.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">Aucun RDV trouvé</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;