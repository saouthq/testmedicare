import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Clock, User, Pill, CheckCircle2, Search, Download, Calendar, Shield, Banknote, BarChart3, TrendingUp, Filter, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockPharmacyHistory } from "@/data/mockData";

const PharmacyHistory = () => {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = mockPharmacyHistory.filter(h => {
    if (search && !h.patient.toLowerCase().includes(search.toLowerCase()) && !h.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter === "cnam" && !h.cnam) return false;
    if (typeFilter === "partial" && h.type !== "partial") return false;
    if (dateFilter === "today" && h.date !== "20 Fév 2026") return false;
    if (dateFilter === "week" && !["20 Fév 2026", "19 Fév 2026", "18 Fév 2026", "17 Fév 2026", "16 Fév 2026", "15 Fév 2026", "14 Fév 2026"].includes(h.date)) return false;
    return true;
  });

  const totalAmount = filtered.reduce((sum, h) => sum + h.amount, 0);
  const cnamAmount = filtered.filter(h => h.cnam).reduce((sum, h) => sum + h.amount, 0);
  const todayAmount = mockPharmacyHistory.filter(h => h.date === "20 Fév 2026").reduce((sum, h) => sum + h.amount, 0);
  const todayCount = mockPharmacyHistory.filter(h => h.date === "20 Fév 2026").length;

  return (
    <DashboardLayout role="pharmacy" title="Historique des délivrances">
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2"><Banknote className="h-4 w-4 text-accent" /><span className="text-xs text-muted-foreground">CA aujourd'hui</span></div>
            <p className="text-xl font-bold text-foreground">{todayAmount.toFixed(1)} DT</p>
            <p className="text-[11px] text-accent flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />{todayCount} délivrances</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2"><BarChart3 className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Total période</span></div>
            <p className="text-xl font-bold text-foreground">{totalAmount.toFixed(1)} DT</p>
            <p className="text-[11px] text-muted-foreground">{filtered.length} délivrances</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2"><Shield className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Part CNAM</span></div>
            <p className="text-xl font-bold text-primary">{cnamAmount.toFixed(1)} DT</p>
            <p className="text-[11px] text-muted-foreground">{Math.round((cnamAmount / totalAmount) * 100 || 0)}% du total</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2"><Package className="h-4 w-4 text-warning" /><span className="text-xs text-muted-foreground">Moy. panier</span></div>
            <p className="text-xl font-bold text-foreground">{(totalAmount / (filtered.length || 1)).toFixed(1)} DT</p>
            <p className="text-[11px] text-muted-foreground">Par délivrance</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-9 h-9 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
              {[{ key: "all", label: "Tout" }, { key: "today", label: "Aujourd'hui" }, { key: "week", label: "Cette semaine" }].map(f => (
                <button key={f.key} onClick={() => setDateFilter(f.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${dateFilter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
              {[{ key: "all", label: "Tous" }, { key: "cnam", label: "CNAM" }, { key: "partial", label: "Partielles" }].map(f => (
                <button key={f.key} onClick={() => setTypeFilter(f.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${typeFilter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5 mr-1" />Exporter CSV</Button>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {filtered.map((h) => (
            <div key={h.id} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${h.type === "partial" ? "bg-warning/10 text-warning" : "bg-accent/10 text-accent"}`}>
                    {h.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{h.id}</h3>
                      <span className="text-xs text-muted-foreground">· {h.prescription}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 ${h.type === "partial" ? "bg-warning/10 text-warning" : "bg-accent/10 text-accent"}`}>
                        {h.type === "partial" ? <Package className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                        {h.type === "partial" ? "Partielle" : "Complète"}
                      </span>
                      {h.cnam && <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"><Shield className="h-3 w-3" />CNAM</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{h.patient}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{h.date} à {h.time}</span>
                      <span>Par {h.pharmacist}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {h.items.map((item, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded-full text-foreground flex items-center gap-1">
                          <Pill className="h-3 w-3 text-primary" />{item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-lg font-bold text-foreground flex items-center gap-1 shrink-0">
                  <Banknote className="h-4 w-4 text-accent" />{h.amount} DT
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyHistory;