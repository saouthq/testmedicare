import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, AlertTriangle, Package, Plus, ShoppingCart, ArrowDown, ArrowUp, Pill, Edit, Save, X, Trash2, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { mockPharmacyStock, mockPharmacyCategories } from "@/data/mockData";

interface StockItem {
  id: number; name: string; category: string; quantity: number; threshold: number;
  status: string; price: string; expiry: string; supplier: string;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  ok: { label: "En stock", class: "bg-accent/10 text-accent" },
  low: { label: "Stock bas", class: "bg-warning/10 text-warning" },
  critical: { label: "Rupture", class: "bg-destructive/10 text-destructive" },
};

const PharmacyStock = () => {
  const [stock, setStock] = useState<StockItem[]>(mockPharmacyStock.map(s => ({ ...s, expiry: s.expiry || "", supplier: s.supplier || "" })));
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState<"name" | "quantity">("name");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "Antibiotiques", quantity: "0", threshold: "20", price: "", expiry: "", supplier: "" });

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

  const updateStatus = (qty: number, threshold: number) => qty <= 0 ? "critical" : qty < threshold ? "low" : "ok";

  const handleEditSave = (id: number) => {
    const qty = parseInt(editQty);
    if (isNaN(qty)) return;
    setStock(prev => prev.map(s => s.id === id ? { ...s, quantity: qty, status: updateStatus(qty, s.threshold) } : s));
    setEditingId(null);
  };

  const handleAddItem = () => {
    const qty = parseInt(newItem.quantity);
    const thresh = parseInt(newItem.threshold);
    if (!newItem.name || isNaN(qty)) return;
    const maxId = Math.max(...stock.map(s => s.id), 0);
    setStock(prev => [...prev, {
      id: maxId + 1, name: newItem.name, category: newItem.category,
      quantity: qty, threshold: thresh, status: updateStatus(qty, thresh),
      price: newItem.price, expiry: newItem.expiry, supplier: newItem.supplier,
    }]);
    setShowAdd(false);
    setNewItem({ name: "", category: "Antibiotiques", quantity: "0", threshold: "20", price: "", expiry: "", supplier: "" });
  };

  return (
    <DashboardLayout role="pharmacy" title="Gestion du stock">
      <div className="space-y-6">
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

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un médicament..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setSortBy(sortBy === "name" ? "quantity" : "name")}>
              {sortBy === "quantity" ? <ArrowUp className="h-3.5 w-3.5 mr-1" /> : <ArrowDown className="h-3.5 w-3.5 mr-1" />}
              {sortBy === "quantity" ? "Par quantité" : "Par nom"}
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowAdd(!showAdd)}>
              <Plus className="h-3.5 w-3.5 mr-1" />Ajouter
            </Button>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />Commander
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {mockPharmacyCategories.map(c => (
            <button key={c} onClick={() => setSelectedCategory(c)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${selectedCategory === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/50"}`}>
              {c}
            </button>
          ))}
        </div>

        {showAdd && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
            <h4 className="font-semibold text-foreground mb-3">Ajouter un médicament</h4>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              <div><Label className="text-xs">Nom</Label><Input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} className="mt-1 h-9" placeholder="Ex: Doliprane 500mg" /></div>
              <div><Label className="text-xs">Catégorie</Label>
                <select value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))} className="mt-1 w-full h-9 rounded-md border bg-background px-3 text-sm">
                  {mockPharmacyCategories.filter(c => c !== "Tous").map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><Label className="text-xs">Quantité</Label><Input type="number" value={newItem.quantity} onChange={e => setNewItem(p => ({ ...p, quantity: e.target.value }))} className="mt-1 h-9" /></div>
              <div><Label className="text-xs">Seuil alerte</Label><Input type="number" value={newItem.threshold} onChange={e => setNewItem(p => ({ ...p, threshold: e.target.value }))} className="mt-1 h-9" /></div>
              <div><Label className="text-xs">Prix</Label><Input value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))} className="mt-1 h-9" placeholder="Ex: 5.5 DT" /></div>
              <div><Label className="text-xs">Fournisseur</Label><Input value={newItem.supplier} onChange={e => setNewItem(p => ({ ...p, supplier: e.target.value }))} className="mt-1 h-9" /></div>
              <div><Label className="text-xs">Expiration</Label><Input value={newItem.expiry} onChange={e => setNewItem(p => ({ ...p, expiry: e.target.value }))} className="mt-1 h-9" placeholder="Ex: Mar 2027" /></div>
              <div className="flex items-end gap-2">
                <Button size="sm" className="gradient-primary text-primary-foreground" onClick={handleAddItem}><Save className="h-3.5 w-3.5 mr-1" />Ajouter</Button>
                <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}><X className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </div>
        )}

        {stock.filter(s => s.status !== "ok").length > 0 && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-5 w-5 text-warning" /><h3 className="font-medium text-foreground">Alertes de stock</h3></div>
            <div className="flex flex-wrap gap-2">
              {stock.filter(s => s.status !== "ok").map(s => (
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
                <th className="p-4 text-xs font-medium text-muted-foreground w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.status === "critical" ? "bg-destructive/10" : s.status === "low" ? "bg-warning/10" : "bg-primary/10"}`}>
                        <Pill className={`h-4 w-4 ${s.status === "critical" ? "text-destructive" : s.status === "low" ? "text-warning" : "text-primary"}`} />
                      </div>
                      <span className="font-medium text-foreground text-sm">{s.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground hidden sm:table-cell">{s.category}</td>
                  <td className="p-4">
                    {editingId === s.id ? (
                      <div className="flex items-center gap-1">
                        <Input value={editQty} onChange={e => setEditQty(e.target.value)} className="h-7 w-16 text-xs text-center" type="number" />
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditSave(s.id)}><Save className="h-3 w-3 text-accent" /></Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s.status === "critical" ? "bg-destructive" : s.status === "low" ? "bg-warning" : "bg-accent"}`}
                            style={{ width: `${Math.min((s.quantity / s.threshold) * 100, 100)}%` }} />
                        </div>
                        <span className={`text-xs font-semibold ${s.status === "critical" ? "text-destructive" : s.status === "low" ? "text-warning" : "text-foreground"}`}>{s.quantity}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-xs font-medium text-foreground hidden md:table-cell">{s.price}</td>
                  <td className="p-4 text-xs text-muted-foreground hidden lg:table-cell">{s.supplier}</td>
                  <td className="p-4 text-xs text-muted-foreground hidden lg:table-cell">{s.expiry}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusConfig[s.status].class}`}>{statusConfig[s.status].label}</span>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingId(s.id); setEditQty(String(s.quantity)); }}>
                      <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
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