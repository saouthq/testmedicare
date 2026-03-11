/**
 * DoctorLeaves — Gestion des congés et absences du médecin
 * Calendrier visuel, formulaire, historique, notifications patients
 * // TODO BACKEND: Persister les congés, notifier les patients, gérer les remplacements
 */
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CalendarDays, Plus, Trash2, Bell, UserCheck, Clock, Calendar, AlertTriangle } from "lucide-react";

interface Leave {
  id: number;
  startDate: string;
  endDate: string;
  motif: string;
  type: "conge" | "formation" | "maladie" | "personnel";
  replacementDoctor: string;
  notifyPatients: boolean;
  status: "upcoming" | "active" | "past";
  affectedAppointments: number;
}

const typeLabels: Record<string, string> = {
  conge: "Congé annuel",
  formation: "Formation",
  maladie: "Arrêt maladie",
  personnel: "Motif personnel",
};

const typeColors: Record<string, string> = {
  conge: "bg-primary/10 text-primary",
  formation: "bg-accent/10 text-accent-foreground",
  maladie: "bg-destructive/10 text-destructive",
  personnel: "bg-muted text-muted-foreground",
};

const initialLeaves: Leave[] = [
  { id: 1, startDate: "2026-03-15", endDate: "2026-03-22", motif: "Vacances de printemps", type: "conge", replacementDoctor: "Dr. Sonia Gharbi", notifyPatients: true, status: "upcoming", affectedAppointments: 12 },
  { id: 2, startDate: "2026-04-10", endDate: "2026-04-11", motif: "Congrès cardiologie Sousse", type: "formation", replacementDoctor: "", notifyPatients: true, status: "upcoming", affectedAppointments: 4 },
  { id: 3, startDate: "2026-02-01", endDate: "2026-02-03", motif: "Grippe", type: "maladie", replacementDoctor: "", notifyPatients: true, status: "past", affectedAppointments: 6 },
  { id: 4, startDate: "2026-01-15", endDate: "2026-01-20", motif: "Congé familial", type: "personnel", replacementDoctor: "Dr. Khaled Hammami", notifyPatients: true, status: "past", affectedAppointments: 8 },
];

const replacementDoctors = ["Dr. Sonia Gharbi", "Dr. Khaled Hammami", "Dr. Leila Chebbi", "Dr. Nabil Karray"];

const DoctorLeaves = () => {
  const [leaves, setLeaves] = useState<Leave[]>(initialLeaves);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [form, setForm] = useState({
    startDate: "", endDate: "", motif: "", type: "conge" as Leave["type"],
    replacementDoctor: "", notifyPatients: true,
  });

  const filtered = leaves.filter(l => filter === "all" || l.status === filter);
  const totalDaysThisYear = leaves.filter(l => l.startDate.startsWith("2026")).reduce((sum, l) => {
    const start = new Date(l.startDate);
    const end = new Date(l.endDate);
    return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, 0);
  const nextLeave = leaves.find(l => l.status === "upcoming");
  const upcomingCount = leaves.filter(l => l.status === "upcoming").length;

  const handleSubmit = () => {
    if (!form.startDate || !form.endDate || !form.motif) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    const newLeave: Leave = {
      id: Date.now(),
      ...form,
      status: "upcoming",
      affectedAppointments: Math.floor(Math.random() * 10) + 2,
    };
    setLeaves(prev => [newLeave, ...prev]);
    setDrawerOpen(false);
    setForm({ startDate: "", endDate: "", motif: "", type: "conge", replacementDoctor: "", notifyPatients: true });
    toast.success("Absence enregistrée", {
      description: form.notifyPatients ? "Les patients concernés seront notifiés." : undefined,
    });
  };

  const handleDelete = (id: number) => {
    setLeaves(prev => prev.filter(l => l.id !== id));
    toast.success("Absence supprimée");
  };

  const getDuration = (start: string, end: string) => {
    const d = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${d} jour${d > 1 ? "s" : ""}`;
  };

  return (
    <DashboardLayout role="doctor" title="Congés & Absences">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><CalendarDays className="h-5 w-5 text-primary" /></div>
          <div><p className="text-2xl font-bold text-foreground">{totalDaysThisYear}</p><p className="text-xs text-muted-foreground">Jours pris en 2026</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><Clock className="h-5 w-5 text-accent-foreground" /></div>
          <div><p className="text-2xl font-bold text-foreground">{upcomingCount}</p><p className="text-xs text-muted-foreground">Absences à venir</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-warning" /></div>
          <div><p className="text-2xl font-bold text-foreground">{nextLeave ? getDuration(nextLeave.startDate, nextLeave.endDate) : "—"}</p><p className="text-xs text-muted-foreground">Prochaine absence</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"><Calendar className="h-5 w-5 text-destructive" /></div>
          <div><p className="text-2xl font-bold text-foreground">{leaves.reduce((s, l) => s + l.affectedAppointments, 0)}</p><p className="text-xs text-muted-foreground">RDV impactés (total)</p></div>
        </CardContent></Card>
      </div>

      {/* Actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          {(["all", "upcoming", "past"] as const).map(f => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
              {f === "all" ? "Toutes" : f === "upcoming" ? "À venir" : "Passées"}
            </Button>
          ))}
        </div>
        <Button size="sm" onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4 mr-1" />Déclarer une absence</Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(leave => (
          <Card key={leave.id} className={leave.status === "past" ? "opacity-60" : ""}>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-sm text-foreground">{leave.motif}</span>
                  <Badge variant="outline" className={typeColors[leave.type]}>{typeLabels[leave.type]}</Badge>
                  {leave.status === "upcoming" && <Badge className="bg-primary/10 text-primary text-[10px]">À venir</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(leave.startDate).toLocaleDateString("fr-FR")} → {new Date(leave.endDate).toLocaleDateString("fr-FR")} · {getDuration(leave.startDate, leave.endDate)}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  {leave.replacementDoctor && (
                    <span className="flex items-center gap-1"><UserCheck className="h-3 w-3" />{leave.replacementDoctor}</span>
                  )}
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{leave.affectedAppointments} RDV impactés</span>
                  {leave.notifyPatients && <span className="flex items-center gap-1"><Bell className="h-3 w-3" />Patients notifiés</span>}
                </div>
              </div>
              {leave.status === "upcoming" && (
                <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => handleDelete(leave.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune absence enregistrée</p>
          </div>
        )}
      </div>

      {/* Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle>Déclarer une absence</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date de début *</Label><Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></div>
              <div><Label>Date de fin *</Label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div>
            </div>
            <div><Label>Type d'absence</Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as Leave["type"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Motif *</Label><Textarea value={form.motif} onChange={e => setForm(p => ({ ...p, motif: e.target.value }))} placeholder="Ex: Vacances, formation, etc." /></div>
            <div><Label>Médecin remplaçant (optionnel)</Label>
              <Select value={form.replacementDoctor} onValueChange={v => setForm(p => ({ ...p, replacementDoctor: v }))}>
                <SelectTrigger><SelectValue placeholder="Aucun remplaçant" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {replacementDoctors.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Notifier les patients</p>
                <p className="text-xs text-muted-foreground">Envoyer un SMS aux patients ayant un RDV</p>
              </div>
              <Switch checked={form.notifyPatients} onCheckedChange={v => setForm(p => ({ ...p, notifyPatients: v }))} />
            </div>
            <Button className="w-full" onClick={handleSubmit}>Enregistrer l'absence</Button>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default DoctorLeaves;
