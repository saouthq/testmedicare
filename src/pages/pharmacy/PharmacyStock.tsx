import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, AlertTriangle, Package, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const stock = [
  { name: "Amoxicilline 500mg", category: "Antibiotiques", quantity: 245, threshold: 50, status: "ok" },
  { name: "Paracétamol 1g", category: "Antalgiques", quantity: 532, threshold: 100, status: "ok" },
  { name: "Ibuprofène 400mg", category: "Anti-inflammatoires", quantity: 12, threshold: 50, status: "low" },
  { name: "Metformine 850mg", category: "Antidiabétiques", quantity: 89, threshold: 30, status: "ok" },
  { name: "Ventoline 100µg", category: "Bronchodilatateurs", quantity: 5, threshold: 20, status: "critical" },
  { name: "Oméprazole 20mg", category: "Anti-acides", quantity: 8, threshold: 30, status: "critical" },
  { name: "Amlodipine 10mg", category: "Antihypertenseurs", quantity: 67, threshold: 25, status: "ok" },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  ok: { label: "En stock", class: "bg-accent/10 text-accent" },
  low: { label: "Stock bas", class: "bg-warning/10 text-warning" },
  critical: { label: "Rupture", class: "bg-destructive/10 text-destructive" },
};

const PharmacyStock = () => {
  return (
    <DashboardLayout role="pharmacy" title="Gestion du stock">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un médicament..." className="pl-10" />
          </div>
          <Button className="gradient-primary text-primary-foreground" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Commander
          </Button>
        </div>

        {/* Alerts */}
        {stock.filter(s => s.status !== "ok").length > 0 && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h3 className="font-medium text-foreground">Alertes de stock</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {stock.filter(s => s.status !== "ok").map((s) => (
                <span key={s.name} className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig[s.status].class}`}>
                  {s.name}: {s.quantity} unités
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4 text-sm font-medium text-muted-foreground">Médicament</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Catégorie</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Quantité</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Seuil min.</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stock.map((s, i) => (
                <tr key={i} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{s.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{s.category}</td>
                  <td className={`p-4 text-sm font-medium ${s.status === "critical" ? "text-destructive" : s.status === "low" ? "text-warning" : "text-foreground"}`}>
                    {s.quantity}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{s.threshold}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[s.status].class}`}>
                      {statusConfig[s.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyStock;
