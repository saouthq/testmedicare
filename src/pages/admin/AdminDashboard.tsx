import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, Stethoscope, FlaskConical, Pill, TrendingUp, AlertTriangle, CreditCard, Activity } from "lucide-react";

const stats = [
  { label: "Utilisateurs totaux", value: "2,847", change: "+12%", icon: Users, color: "text-primary" },
  { label: "Médecins actifs", value: "342", change: "+8%", icon: Stethoscope, color: "text-accent" },
  { label: "Laboratoires", value: "45", change: "+3", icon: FlaskConical, color: "text-warning" },
  { label: "Pharmacies", value: "78", change: "+5", icon: Pill, color: "text-primary" },
];

const recentActivity = [
  { type: "inscription", desc: "Dr. Karim Bouzid - Cardiologue", time: "Il y a 2h", status: "pending" },
  { type: "abonnement", desc: "Dr. Sonia Gharbi a souscrit Pro (129 DT/mois)", time: "Il y a 3h", status: "success" },
  { type: "signalement", desc: "Signalement sur Dr. Fathi Mejri - Avis suspect", time: "Il y a 5h", status: "warning" },
  { type: "inscription", desc: "Pharmacie El Amal - Sousse", time: "Il y a 6h", status: "pending" },
  { type: "abonnement", desc: "Labo BioSanté - Renouvellement (59 DT/mois)", time: "Il y a 8h", status: "success" },
  { type: "signalement", desc: "Patient signale un profil médecin frauduleux", time: "Il y a 12h", status: "warning" },
];

const revenue = [
  { label: "Revenus ce mois", value: "48,750 DT", change: "+15%" },
  { label: "Abonnements actifs", value: "465", change: "+22" },
  { label: "Taux de rétention", value: "94%", change: "+2%" },
  { label: "Tickets support", value: "12", change: "-5" },
];

const AdminDashboard = () => {
  return (
    <DashboardLayout role="admin" title="Administration">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <span className="text-xs font-medium text-accent">{s.change}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {revenue.map((r, i) => (
            <div key={i} className="rounded-lg border bg-primary/5 p-4">
              <p className="text-xs text-muted-foreground">{r.label}</p>
              <p className="text-xl font-bold text-foreground mt-1">{r.value}</p>
              <span className="text-xs text-accent font-medium">{r.change}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />Activité récente
            </h3>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0">
                  <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${a.status === "success" ? "bg-accent" : a.status === "warning" ? "bg-warning" : "bg-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{a.desc}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                  {a.status === "pending" && <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">À valider</span>}
                  {a.status === "warning" && <span className="text-[10px] font-medium bg-warning/10 text-warning px-2 py-0.5 rounded-full">Signalement</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Subscriptions Overview */}
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />Abonnements
            </h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Médecins</span>
                  <span className="text-sm font-bold text-foreground">342 abonnés</span>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">Basic (39 DT) : 198</span>
                  <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full">Pro (129 DT) : 144</span>
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Laboratoires</span>
                  <span className="text-sm font-bold text-foreground">45 abonnés</span>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Standard (59 DT/mois)</span>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Pharmacies</span>
                  <span className="text-sm font-bold text-foreground">78 abonnés</span>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Standard (59 DT/mois)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
