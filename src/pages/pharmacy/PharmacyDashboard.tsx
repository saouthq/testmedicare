import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { 
  FileText, Pill, Clock, AlertCircle, CheckCircle2, TrendingUp,
  Package, AlertTriangle, ArrowUpRight, ChevronRight, Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { mockPharmacyStats, mockPharmacyPrescriptions, mockPharmacyDeliveries } from "@/data/mockData";

const PharmacyDashboard = () => {
  return (
    <DashboardLayout role="pharmacy" title="Tableau de bord">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {mockPharmacyStats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-[11px] text-accent mt-1 flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" />{s.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pending prescriptions */}
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-card">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Ordonnances en attente
              </h2>
              <Link to="/dashboard/pharmacy/prescriptions" className="text-sm text-primary hover:underline flex items-center gap-1">
                Tout voir <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y">
              {mockPharmacyPrescriptions.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {p.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground text-sm">{p.patient}</p>
                        {p.urgent && (
                          <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-medium">Urgent</span>
                        )}
                        {p.cnam && (
                          <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">CNAM</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Prescrit par {p.doctor} · {p.items} médicament{p.items > 1 ? "s" : ""} · {p.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-foreground">{p.total}</span>
                    <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
                      Délivrer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Stock alerts */}
            <div className="rounded-xl border border-destructive/20 bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Alertes stock
                </h3>
                <Link to="/dashboard/pharmacy/stock" className="text-xs text-primary hover:underline">
                  Gérer
                </Link>
              </div>
              <div className="divide-y">
                {[
                  { name: "Ventoline 100µg", remaining: 5, threshold: 20, status: "critical" },
                  { name: "Oméprazole 20mg", remaining: 8, threshold: 30, status: "critical" }
                ].map((s, i) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-destructive/10`}>
                      <Package className={`h-4 w-4 text-destructive`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{s.name}</p>
                      <span className="text-[10px] font-semibold text-destructive">{s.remaining}/{s.threshold}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent deliveries */}
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Pill className="h-4 w-4 text-accent" />
                Dernières délivrances
              </h3>
              <div className="space-y-3">
                {mockPharmacyDeliveries.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{d.patient}</p>
                      <p className="text-[10px] text-muted-foreground">{d.time} · {d.items.length} articles</p>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{d.amount} DT</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyDashboard;