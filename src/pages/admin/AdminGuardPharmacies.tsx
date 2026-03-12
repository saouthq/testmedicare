/**
 * Admin Guard Pharmacies — Migrated to AdminDataTable
 * ~127 lines → ~90 lines
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Pill, Calendar, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import { useAdminGuardPharmacies } from "@/stores/adminStore";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import type { AdminGuardPharmacy } from "@/types/admin";

const AdminGuardPharmacies = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const { pharmacies, setPharmacies } = useAdminGuardPharmacies();

  const cities = useMemo(() => Array.from(new Set(pharmacies.map(p => p.city))).sort(), [pharmacies]);
  const guardCount = pharmacies.filter(p => p.isGuard).length;
  const guardByCity = useMemo(() => {
    const map: Record<string, number> = {};
    pharmacies.filter(p => p.isGuard).forEach(p => { map[p.city] = (map[p.city] || 0) + 1; });
    return map;
  }, [pharmacies]);

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

  return (
    <DashboardLayout role="admin" title="Pharmacies de garde">
      <div className="space-y-6">
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

        <AdminDataTable<AdminGuardPharmacy>
          data={pharmacies}
          searchPlaceholder="Rechercher pharmacie..."
          searchFn={(item, q) => item.name.toLowerCase().includes(q) || item.city.toLowerCase().includes(q)}
          emptyIcon={Pill}
          emptyTitle="Aucune pharmacie"
          emptyDescription="Aucune pharmacie enregistrée."
          stats={[
            { label: "Total pharmacies", value: pharmacies.length },
            { label: "De garde", value: guardCount, color: "text-accent" },
            { label: "Villes couvertes", value: cities.length },
            { label: new Date(date).toLocaleDateString("fr-TN", { day: "numeric", month: "long" }), value: "📅" },
          ]}
          filters={[
            { key: "city", label: "Ville", options: [
              { value: "all", label: "Toutes" },
              ...cities.map(c => ({ value: c, label: c })),
            ]},
          ]}
          headerActions={
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-44 h-8 text-xs" />
            </div>
          }
          columns={[
            { key: "name", label: "Pharmacie", render: p => (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground text-sm">{p.name}</span>
                {p.isGuard && <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-semibold">De garde</span>}
              </div>
            )},
            { key: "city", label: "Ville", render: p => <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{p.city}</span> },
            { key: "address", label: "Adresse", render: p => <span className="text-xs text-muted-foreground">{p.address}</span>, hideOnMobile: true },
            { key: "phone", label: "Téléphone", render: p => <span className="text-xs text-muted-foreground">{p.phone}</span>, hideOnMobile: true },
            { key: "toggle", label: "Garde", className: "text-right", render: p => (
              <div onClick={e => e.stopPropagation()}>
                <Switch checked={p.isGuard} onCheckedChange={() => toggleGuard(p.id)} />
              </div>
            )},
          ]}
        />
        <p className="text-[11px] text-muted-foreground">{pharmacies.length} pharmacie(s). Les pharmacies de garde sont visibles sur l'annuaire public.</p>
      </div>
    </DashboardLayout>
  );
};

export default AdminGuardPharmacies;
