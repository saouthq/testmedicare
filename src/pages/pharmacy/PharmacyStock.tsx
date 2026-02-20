import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, AlertTriangle, Package, Plus, ShoppingCart, TrendingDown, ArrowDown, ArrowUp, Filter, Pill, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const stock = [
  { name: "Amoxicilline 500mg", category: "Antibiotiques", quantity: 245, threshold: 50, status: "ok", price: "8.5 DT", expiry: "Mar 2027", supplier: "Siphat" },
  { name: "Paracétamol 1g", category: "Antalgiques", quantity: 532, threshold: 100, status: "ok", price: "3.2 DT", expiry: "Juin 2027", supplier: "Adwya" },
  { name: "Ibuprofène 400mg", category: "Anti-inflammatoires", quantity: 12, threshold: 50, status: "low", price: "6.8 DT", expiry: "Déc 2026", supplier: "Siphat" },
  { name: "Metformine 850mg", category: "Antidiabétiques", quantity: 89, threshold: 30, status: "ok", price: "12 DT", expiry: "Sep 2027", supplier: "Sanofi" },
  { name: "Ventoline 100µg", category: "Bronchodilatateurs", quantity: 5, threshold: 20, status: "critical", price: "18 DT", expiry: "Fév 2027", supplier: "GSK" },
  { name: "Oméprazole 20mg", category: "Anti-acides", quantity: 8, threshold: 30, status: "critical", price: "9.5 DT", expiry: "Jan 2027", supplier: "Adwya" },
  { name: "Amlodipine 10mg", category: "Antihypertenseurs", quantity: 67, threshold: 25, status: "ok", price: "15 DT", expiry: "Avr 2027", supplier: "Medis" },
  { name: "Bisoprolol 5mg", category: "Bêtabloquants", quantity: 42, threshold: 20, status: "ok", price: "11 DT", expiry: "Mai 2027", supplier: "Sanofi" },
  { name: "Glibenclamide 5mg", category: "Antidiabétiques", quantity: 18, threshold: 25, status: "low", price: "7 DT", expiry: "Nov 2026", supplier: "Siphat" },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  ok: { label: "En stock", class: "bg-accent/10 text-accent" },
  low: { label: "Stock bas", class: "bg-warning/10 text-warning" },
  critical: { label: "Rupture", class: "bg-destructive/10 text-destructive" },
};

const categories = ["Tous", "Antibiotiques", "Antalgiques", "Anti-inflammatoires", "Antidiabétiques", "Antihypertenseurs", "Bronchodilatateurs"];

const PharmacyStock = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState<"name" | "quantity">("name");

  const filtered = stock
    .filter(s => {
      if (selectedCategory !== "Tous" && s.category !== selectedCategory) return false;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => sortBy === "quantity" ? a.quantity - b.quantity : a.name.localeCompare(b.name));

  const totalProducts = stock.length;
  const criticalCount = stock.filter(s => s.status === "critical").length;
  const lowCount = stock.filter(s => s.status === "low").length;

  return (
    <DashboardLayout role="pharmacy" title="Gestion du stock">
      <div className="space-y-6">
        {/* Quick stats */}
        <div className="grid gap-4 grid-cols-3">
          <div className="rounded-xl border bg-card p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
            <p className="text-xs text-muted-foreground">Produits total</p>
          </div>
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-warning">{lowCount}</p>
            <p className="text-xs text-muted-foreground">Stock bas</p>
          </div>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
            <p className="text-xs text-muted-foreground">Ruptures</p>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un médicament..." 
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setSortBy(sortBy === "name" ? "quantity" : "name")}>
              {sortBy === "quantity" ? <ArrowUp className="h-3.5 w-3.5 mr-1" /> : <ArrowDown className="h-3.5 w-3.5 mr-1" />}
              {sortBy === "quantity" ? "Par quantité" : "Par nom"}
            </Button>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Commander
            </Button>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {c}
            </button>
          ))}
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
                <th className="p-4 text-xs font-medium text-muted-foreground">Médicament</th>
                <th className="p-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Catégorie</th>
                <th className="p-4 text-xs font-medium text-muted-foreground">Quantité</th>
                <th className="p-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Prix</th>
                <th className="p-4 text-xs font-medium text-muted-foreground hidden lg:table-cell">Fournisseur</th>
                <th className="p-4 text-xs font-medium text-muted-foreground hidden lg:table-cell">Expiration</th>
                <th className="p-4 text-xs font-medium text-muted-foreground">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((s, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        s.status === "critical" ? "bg-destructive/10" : s.status === "low" ? "bg-warning/10" : "bg-primary/10"
                      }`}>
                        <Pill className={`h-4 w-4 ${
                          s.status === "critical" ? "text-destructive" : s.status === "low" ? "text-warning" : "text-primary"
                        }`} />
                      </div>
                      <span className="font-medium text-foreground text-sm">{s.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground hidden sm:table-cell">{s.category}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${
                          s.status === "critical" ? "bg-destructive" : s.status === "low" ? "bg-warning" : "bg-accent"
                        }`} style={{ width: `${Math.min((s.quantity / s.threshold) * 100, 100)}%` }} />
                      </div>
                      <span className={`text-xs font-semibold ${
                        s.status === "critical" ? "text-destructive" : s.status === "low" ? "text-warning" : "text-foreground"
                      }`}>{s.quantity}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-medium text-foreground hidden md:table-cell">{s.price}</td>
                  <td className="p-4 text-xs text-muted-foreground hidden lg:table-cell">{s.supplier}</td>
                  <td className="p-4 text-xs text-muted-foreground hidden lg:table-cell">{s.expiry}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusConfig[s.status].class}`}>
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
