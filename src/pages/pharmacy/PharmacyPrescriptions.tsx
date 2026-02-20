import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Search, CheckCircle2, Clock, Pill, Eye, Printer, Shield, AlertCircle, User, X, Package, Send, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PrescriptionItem {
  name: string;
  available: boolean;
  quantity: number;
  price: string;
}

interface Prescription {
  id: string; patient: string; doctor: string; date: string;
  items: PrescriptionItem[]; status: string; total: string;
  cnam: boolean; avatar: string; urgent: boolean;
}

const initialPrescriptions: Prescription[] = [
  { id: "ORD-2026-045", patient: "Amine Ben Ali", doctor: "Dr. Bouazizi", date: "20 Fév", items: [
    { name: "Metformine 850mg", available: true, quantity: 60, price: "12 DT" },
    { name: "Glibenclamide 5mg", available: true, quantity: 30, price: "7 DT" },
    { name: "Oméprazole 20mg", available: false, quantity: 0, price: "9.5 DT" },
  ], status: "pending", total: "28.5 DT", cnam: true, avatar: "AB", urgent: false },
  { id: "ORD-2026-044", patient: "Fatma Trabelsi", doctor: "Dr. Gharbi", date: "20 Fév", items: [
    { name: "Amlodipine 10mg", available: true, quantity: 30, price: "15 DT" },
  ], status: "pending", total: "15 DT", cnam: true, avatar: "FT", urgent: true },
  { id: "ORD-2026-043", patient: "Mohamed Sfar", doctor: "Dr. Hammami", date: "17 Fév", items: [
    { name: "Ibuprofène 400mg", available: true, quantity: 20, price: "6.8 DT" },
    { name: "Tramadol 50mg", available: true, quantity: 10, price: "11 DT" },
  ], status: "delivered", total: "17.8 DT", cnam: false, avatar: "MS", urgent: false },
  { id: "ORD-2026-042", patient: "Nadia Jemni", doctor: "Dr. Bouazizi", date: "15 Fév", items: [
    { name: "Ventoline 100µg", available: true, quantity: 1, price: "18 DT" },
  ], status: "delivered", total: "18 DT", cnam: true, avatar: "NJ", urgent: false },
  { id: "ORD-2026-041", patient: "Sami Ayari", doctor: "Dr. Bouazizi", date: "14 Fév", items: [
    { name: "Paracétamol 1g", available: true, quantity: 16, price: "3.2 DT" },
    { name: "Amoxicilline 500mg", available: true, quantity: 24, price: "8.5 DT" },
  ], status: "delivered", total: "11.7 DT", cnam: true, avatar: "SA", urgent: false },
  { id: "ORD-2026-040", patient: "Rania Meddeb", doctor: "Dr. Gharbi", date: "12 Fév", items: [
    { name: "Bisoprolol 5mg", available: true, quantity: 30, price: "11 DT" },
  ], status: "partial", total: "11 DT", cnam: true, avatar: "RM", urgent: false },
];

const PharmacyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = prescriptions.filter(p => {
    if (filter === "pending" && p.status !== "pending") return false;
    if (filter === "delivered" && p.status !== "delivered") return false;
    if (filter === "partial" && p.status !== "partial") return false;
    if (search && !p.patient.toLowerCase().includes(search.toLowerCase()) && !p.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDeliver = (id: string) => {
    setPrescriptions(prev => prev.map(p => {
      if (p.id !== id) return p;
      const allAvailable = p.items.every(i => i.available);
      return { ...p, status: allAvailable ? "delivered" : "partial" };
    }));
    setExpandedId(null);
  };

  const statusConfig: Record<string, { label: string; class: string }> = {
    pending: { label: "En attente", class: "bg-warning/10 text-warning" },
    delivered: { label: "Délivrée", class: "bg-accent/10 text-accent" },
    partial: { label: "Partielle", class: "bg-primary/10 text-primary" },
  };

  return (
    <DashboardLayout role="pharmacy" title="Ordonnances">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
              {[
                { key: "all", label: "Toutes" },
                { key: "pending", label: `En attente (${prescriptions.filter(p => p.status === "pending").length})` },
                { key: "partial", label: "Partielles" },
                { key: "delivered", label: "Délivrées" },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-9 h-9 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} ordonnance(s)</p>
        </div>

        <div className="space-y-4">
          {filtered.map((p) => {
            const isExpanded = expandedId === p.id;
            const hasUnavailable = p.items.some(i => !i.available);
            return (
              <div key={p.id} className={`rounded-xl border bg-card shadow-card transition-all ${isExpanded ? "ring-2 ring-primary/20" : "hover:shadow-card-hover"}`}>
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${
                        p.status === "pending" ? "bg-warning/10" : p.status === "partial" ? "bg-primary/10" : "bg-accent/10"
                      }`}>
                        {p.status === "pending" ? <Clock className="h-5 w-5 text-warning" /> : p.status === "partial" ? <Package className="h-5 w-5 text-primary" /> : <CheckCircle2 className="h-5 w-5 text-accent" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{p.id}</h3>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[p.status].class}`}>
                            {statusConfig[p.status].label}
                          </span>
                          {p.urgent && <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-medium flex items-center gap-1"><AlertCircle className="h-3 w-3" />Urgent</span>}
                          {p.cnam && <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"><Shield className="h-3 w-3" />CNAM</span>}
                          {hasUnavailable && p.status === "pending" && <span className="flex items-center gap-1 text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium"><AlertTriangle className="h-3 w-3" />Rupture</span>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />{p.patient} · {p.doctor} · {p.date}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{p.items.length} médicament(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-lg font-bold text-foreground">{p.total}</span>
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => setExpandedId(isExpanded ? null : p.id)}>
                        <Eye className="h-3.5 w-3.5 mr-1" />{isExpanded ? "Fermer" : "Détails"}
                      </Button>
                      {p.status === "pending" && (
                        <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => handleDeliver(p.id)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Délivrer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t px-5 py-4 bg-muted/20">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Détail des médicaments</h4>
                    <div className="space-y-2">
                      {p.items.map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 rounded-lg p-3 ${item.available ? "bg-card border" : "bg-destructive/5 border border-destructive/20"}`}>
                          <Pill className={`h-4 w-4 shrink-0 ${item.available ? "text-primary" : "text-destructive"}`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{item.name}</p>
                            <p className="text-[11px] text-muted-foreground">Qté: {item.quantity}</p>
                          </div>
                          <span className="text-sm font-semibold text-foreground">{item.price}</span>
                          {item.available ? (
                            <span className="text-[10px] text-accent font-medium bg-accent/10 px-2 py-0.5 rounded-full">En stock</span>
                          ) : (
                            <span className="text-[10px] text-destructive font-medium bg-destructive/10 px-2 py-0.5 rounded-full">Rupture</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="text-xs"><Printer className="h-3.5 w-3.5 mr-1" />Imprimer</Button>
                      {p.status !== "delivered" && (
                        <Button className="gradient-primary text-primary-foreground" size="sm" onClick={() => handleDeliver(p.id)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />{hasUnavailable ? "Délivrance partielle" : "Confirmer délivrance"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyPrescriptions;
