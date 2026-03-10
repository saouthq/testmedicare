/**
 * AdminDoctorPerformance — Suivi performance des médecins (NPS, RDV, rétention, satisfaction)
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  Star, TrendingUp, Users, Clock, AlertTriangle, Search, Eye, ArrowUpDown,
  ThumbsUp, ThumbsDown, Calendar, BarChart3,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DoctorPerf {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  totalConsults: number;
  cancelRate: number;
  avgWaitMin: number;
  nps: number;
  complaints: number;
  revenueGenerated: number;
  activePatients: number;
  retention: number;
  lastActive: string;
}

const mockDoctorPerfs: DoctorPerf[] = [
  { id: "d1", name: "Dr. Ahmed Bouazizi", specialty: "Généraliste", rating: 4.8, totalConsults: 1247, cancelRate: 2.1, avgWaitMin: 8, nps: 72, complaints: 0, revenueGenerated: 2580, activePatients: 345, retention: 94, lastActive: "2026-03-10" },
  { id: "d2", name: "Dr. Sonia Gharbi", specialty: "Dermatologue", rating: 4.6, totalConsults: 834, cancelRate: 5.3, avgWaitMin: 15, nps: 58, complaints: 1, revenueGenerated: 1680, activePatients: 210, retention: 88, lastActive: "2026-03-10" },
  { id: "d3", name: "Dr. Karim Bouzid", specialty: "Cardiologue", rating: 4.9, totalConsults: 456, cancelRate: 1.2, avgWaitMin: 5, nps: 85, complaints: 0, revenueGenerated: 3420, activePatients: 180, retention: 97, lastActive: "2026-03-09" },
  { id: "d4", name: "Dr. Nadia Hamdi", specialty: "Dermatologue", rating: 3.8, totalConsults: 312, cancelRate: 12.4, avgWaitMin: 28, nps: 25, complaints: 3, revenueGenerated: 890, activePatients: 95, retention: 71, lastActive: "2026-03-08" },
  { id: "d5", name: "Dr. Fathi Mejri", specialty: "Psychiatre", rating: 4.2, totalConsults: 589, cancelRate: 8.1, avgWaitMin: 20, nps: 42, complaints: 2, revenueGenerated: 1950, activePatients: 165, retention: 82, lastActive: "2026-03-10" },
  { id: "d6", name: "Dr. Leila Mansouri", specialty: "Pédiatre", rating: 4.7, totalConsults: 978, cancelRate: 3.0, avgWaitMin: 10, nps: 68, complaints: 0, revenueGenerated: 2100, activePatients: 290, retention: 92, lastActive: "2026-03-10" },
];

const AdminDoctorPerformance = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "nps" | "cancelRate" | "revenue">("rating");
  const [selected, setSelected] = useState<DoctorPerf | null>(null);

  const filtered = useMemo(() => {
    let list = [...mockDoctorPerfs];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "nps") return b.nps - a.nps;
      if (sortBy === "cancelRate") return a.cancelRate - b.cancelRate;
      return b.revenueGenerated - a.revenueGenerated;
    });
    return list;
  }, [search, sortBy]);

  const avgRating = (mockDoctorPerfs.reduce((s, d) => s + d.rating, 0) / mockDoctorPerfs.length).toFixed(1);
  const avgNps = Math.round(mockDoctorPerfs.reduce((s, d) => s + d.nps, 0) / mockDoctorPerfs.length);
  const totalComplaints = mockDoctorPerfs.reduce((s, d) => s + d.complaints, 0);

  const getNpsColor = (nps: number) => nps >= 50 ? "text-accent" : nps >= 0 ? "text-warning" : "text-destructive";
  const getRatingColor = (r: number) => r >= 4.5 ? "text-accent" : r >= 3.5 ? "text-warning" : "text-destructive";

  return (
    <DashboardLayout role="admin" title="Performance Médecins">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <Star className="h-5 w-5 text-warning mb-2" />
            <p className="text-2xl font-bold text-foreground">{avgRating}</p>
            <p className="text-xs text-muted-foreground">Note moyenne</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <ThumbsUp className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold text-foreground">{avgNps}</p>
            <p className="text-xs text-muted-foreground">NPS moyen</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <Users className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{mockDoctorPerfs.length}</p>
            <p className="text-xs text-muted-foreground">Médecins actifs</p>
          </div>
          <div className="rounded-xl border bg-destructive/5 p-5 shadow-card">
            <AlertTriangle className="h-5 w-5 text-destructive mb-2" />
            <p className="text-2xl font-bold text-destructive">{totalComplaints}</p>
            <p className="text-xs text-muted-foreground">Plaintes ce mois</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un médecin..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-1 rounded-lg border bg-card p-0.5">
            {([
              { key: "rating" as const, label: "Note" },
              { key: "nps" as const, label: "NPS" },
              { key: "cancelRate" as const, label: "Annulations" },
              { key: "revenue" as const, label: "Revenus" },
            ]).map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${sortBy === s.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Médecin</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Note</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">NPS</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Consults</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">% Annul.</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Attente moy.</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Plaintes</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className={`border-b last:border-0 hover:bg-muted/20 cursor-pointer ${d.complaints >= 3 ? "bg-destructive/5" : ""}`} onClick={() => setSelected(d)}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.specialty}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${getRatingColor(d.rating)}`}>
                      <Star className="h-3 w-3 inline mr-0.5" />{d.rating}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${getNpsColor(d.nps)}`}>{d.nps}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-foreground hidden md:table-cell">{d.totalConsults}</td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <span className={`font-medium ${d.cancelRate > 10 ? "text-destructive" : d.cancelRate > 5 ? "text-warning" : "text-accent"}`}>{d.cancelRate}%</span>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground hidden md:table-cell">{d.avgWaitMin} min</td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    {d.complaints > 0 ? (
                      <span className="text-xs font-medium bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">{d.complaints}</span>
                    ) : (
                      <span className="text-xs text-accent">✓</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelected(d)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail */}
      <Sheet open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <SheetContent className="sm:max-w-md flex flex-col p-0">
          {selected && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>{selected.specialty}</SheetDescription>
              </SheetHeader>
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Note", value: `${selected.rating}/5`, icon: Star, color: getRatingColor(selected.rating) },
                      { label: "NPS", value: String(selected.nps), icon: ThumbsUp, color: getNpsColor(selected.nps) },
                      { label: "Consultations", value: String(selected.totalConsults), icon: Calendar, color: "text-primary" },
                      { label: "Patients actifs", value: String(selected.activePatients), icon: Users, color: "text-primary" },
                      { label: "Taux annulation", value: `${selected.cancelRate}%`, icon: ThumbsDown, color: selected.cancelRate > 10 ? "text-destructive" : "text-foreground" },
                      { label: "Attente moy.", value: `${selected.avgWaitMin} min`, icon: Clock, color: selected.avgWaitMin > 20 ? "text-warning" : "text-foreground" },
                      { label: "Rétention", value: `${selected.retention}%`, icon: TrendingUp, color: selected.retention > 85 ? "text-accent" : "text-warning" },
                      { label: "Revenus générés", value: `${selected.revenueGenerated} DT`, icon: BarChart3, color: "text-accent" },
                    ].map((m, i) => (
                      <div key={i} className="rounded-lg border p-3 text-center">
                        <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
                        <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                        <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  {selected.complaints > 0 && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                      <p className="text-sm font-medium text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />{selected.complaints} plainte(s) ce mois
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Vérifiez les signalements dans la section Modération.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default AdminDoctorPerformance;
