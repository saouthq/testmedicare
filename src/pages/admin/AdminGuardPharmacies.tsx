/**
 * Admin Guard Pharmacies — Manual toggle with city filter + stats
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Pill, Search, Calendar, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import { mockGuardPharmacies } from "@/data/mockData";

const AdminGuardPharmacies = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [pharmacies, setPharmacies] = useState(mockGuardPharmacies);

  const cities = useMemo(() => Array.from(new Set(pharmacies.map(p => p.city))).sort(), [pharmacies]);

  const filtered = useMemo(() => pharmacies.filter(p => {
    if (cityFilter !== "all" && p.city !== cityFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [pharmacies, cityFilter, search]);

  const toggleGuard = (id: string) => {
    setPharmacies(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newState = !p.isGuard;
      appendLog(
        newState ? "pharmacy_guard_on" : "pharmacy_guard_off",
        "pharmacy", id,
        `${p.name} — ${newState ? "Mise de garde" : "Retirée de garde"} pour le ${date}`
      );
      toast({ title: newState ? `${p.name} — De garde` : `${p.name} — Retirée de garde` });
      return { ...p, isGuard: newState };
    }));
  };

  const guardCount = pharmacies.filter(p => p.isGuard).length;
  const guardByCity = useMemo(() => {
    const map: Record<string, number> = {};
    pharmacies.filter(p => p.isGuard).forEach(p => { map[p.city] = (map[p.city] || 0) + 1; });
    return map;
  }, [pharmacies]);

  return (
    <DashboardLayout role="admin" title="Pharmacies de garde">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <Pill className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{pharmacies.length}</p>
            <p className="text-xs text-muted-foreground">Total pharmacies</p>
          </div>
          <div className="rounded-xl border bg-accent/5 p-4 shadow-card">
            <Pill className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold text-accent">{guardCount}</p>
            <p className="text-xs text-muted-foreground">De garde aujourd'hui</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <MapPin className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{cities.length}</p>
            <p className="text-xs text-muted-foreground">Villes couvertes</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <Calendar className="h-5 w-5 text-warning mb-2" />
            <p className="text-sm font-bold text-foreground">{new Date(date).toLocaleDateString("fr-TN", { day: "numeric", month: "long" })}</p>
            <p className="text-xs text-muted-foreground">Date sélectionnée</p>
          </div>
        </div>

        {/* Guard by city summary */}
        {Object.keys(guardByCity).length > 0 && (
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <p className="text-xs font-semibold text-foreground mb-2">Répartition par ville</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(guardByCity).map(([city, count]) => (
                <span key={city} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">{city}: {count}</span>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-44" />
          </div>
          <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm">
            <option value="all">Toutes les villes</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher pharmacie..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        {/* List */}
        <div className="rounded-xl border bg-card shadow-card divide-y">
          {filtered.map(p => (
            <div key={p.id} className={`flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors ${p.isGuard ? "bg-accent/5" : ""}`}>
              <div>
                <p className="font-medium text-foreground text-sm flex items-center gap-2">
                  {p.name}
                  {p.isGuard && <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-semibold">De garde</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                  <MapPin className="h-3 w-3" />{p.city} · {p.address} · {p.phone}
                </p>
              </div>
              <Switch checked={p.isGuard} onCheckedChange={() => toggleGuard(p.id)} />
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">{filtered.length} pharmacie(s) affichée(s). Les pharmacies de garde sont visibles sur l'annuaire public.</p>
      </div>
    </DashboardLayout>
  );
};

export default AdminGuardPharmacies;
