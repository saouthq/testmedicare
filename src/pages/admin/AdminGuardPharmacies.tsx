/**
 * Admin Guard Pharmacies — Manual toggle for "pharmacie de garde" per date
 * Visible on public directory
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Pill, Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import { mockGuardPharmacies } from "@/data/mockData";

const AdminGuardPharmacies = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [pharmacies, setPharmacies] = useState(mockGuardPharmacies);

  const filtered = pharmacies.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase())
  );

  const toggleGuard = (id: string) => {
    setPharmacies(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newState = !p.isGuard;
      appendLog(
        newState ? "pharmacy_guard_on" : "pharmacy_guard_off",
        "pharmacy",
        id,
        `${p.name} — ${newState ? "Mise de garde" : "Retirée de garde"} pour le ${date}`
      );
      toast({ title: newState ? `${p.name} — De garde` : `${p.name} — Retirée de garde` });
      return { ...p, isGuard: newState };
    }));
  };

  const guardCount = pharmacies.filter(p => p.isGuard).length;

  return (
    <DashboardLayout role="admin" title="Pharmacies de garde">
      <div className="space-y-6 max-w-3xl">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-44" />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher pharmacie ou ville..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Pill className="h-4 w-4 text-accent" />
          <span className="text-sm text-foreground font-medium">{guardCount} pharmacie(s) de garde pour le {new Date(date).toLocaleDateString("fr-TN", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>

        <div className="rounded-xl border bg-card shadow-card divide-y">
          {filtered.map(p => (
            <div key={p.id} className={`flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors ${p.isGuard ? "bg-accent/5" : ""}`}>
              <div>
                <p className="font-medium text-foreground text-sm flex items-center gap-2">
                  {p.name}
                  {p.isGuard && <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-semibold">De garde</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.city} · {p.address} · {p.phone}</p>
              </div>
              <Switch checked={p.isGuard} onCheckedChange={() => toggleGuard(p.id)} />
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground">Les pharmacies de garde sont visibles sur l'annuaire public.</p>
      </div>
    </DashboardLayout>
  );
};

export default AdminGuardPharmacies;
