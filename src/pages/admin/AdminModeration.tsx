import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { AlertTriangle, Flag, CheckCircle, XCircle, Eye, MessageSquare, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

type ModerationFilter = "all" | "pending" | "resolved" | "rejected";

const reports = [
  { id: 1, type: "profil", reporter: "Amine Ben Ali", target: "Dr. Fathi Mejri", reason: "Profil frauduleux - diplôme non vérifié", date: "20 Fév 2026", status: "pending", priority: "high", details: "Le patient signale que ce médecin n'est pas référencé auprès de l'Ordre des Médecins de Tunisie." },
  { id: 2, type: "avis", reporter: "Fatma Trabelsi", target: "Dr. Ahmed Bouazizi", reason: "Avis suspect - possible faux avis positif", date: "19 Fév 2026", status: "pending", priority: "medium", details: "3 avis 5 étoiles postés le même jour avec des comptes récents." },
  { id: 3, type: "comportement", reporter: "Sami Ayari", target: "Dr. Karim Bouzid", reason: "Comportement inapproprié en consultation", date: "18 Fév 2026", status: "pending", priority: "high", details: "Le patient rapporte un manque de professionnalisme lors de la dernière consultation." },
  { id: 4, type: "profil", reporter: "Système", target: "Pharmacie Sans Nom", reason: "Inscription incomplète - documents manquants", date: "17 Fév 2026", status: "resolved", priority: "low", details: "Documents de licence pharmaceutique non fournis." },
  { id: 5, type: "avis", reporter: "Nadia Jemni", target: "Labo BioSanté", reason: "Résultats d'analyses erronés", date: "15 Fév 2026", status: "rejected", priority: "medium", details: "Erreur de résultat de glycémie signalée, vérification effectuée : résultat correct." },
];

const priorityColors: Record<string, string> = { high: "bg-destructive/10 text-destructive", medium: "bg-warning/10 text-warning", low: "bg-muted text-muted-foreground" };
const priorityLabels: Record<string, string> = { high: "Urgent", medium: "Moyen", low: "Faible" };
const statusColors: Record<string, string> = { pending: "bg-warning/10 text-warning", resolved: "bg-accent/10 text-accent", rejected: "bg-muted text-muted-foreground" };
const statusLabels: Record<string, string> = { pending: "En attente", resolved: "Résolu", rejected: "Rejeté" };

const AdminModeration = () => {
  const [filter, setFilter] = useState<ModerationFilter>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = reports.filter(r => {
    if (filter === "pending") return r.status === "pending";
    if (filter === "resolved") return r.status === "resolved";
    if (filter === "rejected") return r.status === "rejected";
    return true;
  });

  return (
    <DashboardLayout role="admin" title="Modération & Signalements">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <Flag className="h-5 w-5 text-warning" />
            <p className="mt-3 text-2xl font-bold text-foreground">{reports.length}</p>
            <p className="text-xs text-muted-foreground">Signalements total</p>
          </div>
          <div className="rounded-xl border bg-destructive/5 p-5 shadow-card">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="mt-3 text-2xl font-bold text-destructive">{reports.filter(r => r.status === "pending").length}</p>
            <p className="text-xs text-muted-foreground">En attente</p>
          </div>
          <div className="rounded-xl border bg-accent/5 p-5 shadow-card">
            <CheckCircle className="h-5 w-5 text-accent" />
            <p className="mt-3 text-2xl font-bold text-accent">{reports.filter(r => r.status === "resolved").length}</p>
            <p className="text-xs text-muted-foreground">Résolus</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <p className="mt-3 text-2xl font-bold text-foreground">{"< 24h"}</p>
            <p className="text-xs text-muted-foreground">Temps moyen</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 rounded-lg border bg-card p-0.5 w-fit">
          {([
            { key: "all" as ModerationFilter, label: "Tous" },
            { key: "pending" as ModerationFilter, label: "En attente" },
            { key: "resolved" as ModerationFilter, label: "Résolus" },
            { key: "rejected" as ModerationFilter, label: "Rejetés" },
          ]).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f.label}</button>
          ))}
        </div>

        {/* Reports list */}
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="rounded-xl border bg-card shadow-card overflow-hidden">
              <div className="p-4 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-lg ${r.priority === "high" ? "bg-destructive/10" : r.priority === "medium" ? "bg-warning/10" : "bg-muted"}`}>
                    <Flag className={`h-4 w-4 ${r.priority === "high" ? "text-destructive" : r.priority === "medium" ? "text-warning" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground text-sm">{r.reason}</h4>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[r.priority]}`}>{priorityLabels[r.priority]}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[r.status]}`}>{statusLabels[r.status]}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />Signalé par : {r.reporter}</span>
                      <span>→ {r.target}</span>
                      <span>{r.date}</span>
                    </div>
                  </div>
                </div>
              </div>
              {expandedId === r.id && (
                <div className="border-t px-4 py-4 bg-muted/10">
                  <p className="text-sm text-foreground mb-4">{r.details}</p>
                  {r.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" className="gradient-primary text-primary-foreground"><CheckCircle className="h-4 w-4 mr-1" />Résoudre</Button>
                      <Button size="sm" variant="outline"><XCircle className="h-4 w-4 mr-1" />Rejeter</Button>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/30"><AlertTriangle className="h-4 w-4 mr-1" />Suspendre le compte</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminModeration;
