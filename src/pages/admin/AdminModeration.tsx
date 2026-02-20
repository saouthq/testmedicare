import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { AlertTriangle, Flag, CheckCircle, XCircle, Eye, MessageSquare, User, Clock, ChevronDown, Send, Shield, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ModerationFilter = "all" | "pending" | "resolved" | "rejected";

const initialReports = [
  { id: 1, type: "profil", reporter: "Amine Ben Ali", target: "Dr. Fathi Mejri", reason: "Profil frauduleux - diplôme non vérifié", date: "20 Fév 2026", status: "pending" as string, priority: "high", details: "Le patient signale que ce médecin n'est pas référencé auprès de l'Ordre des Médecins de Tunisie. Aucun numéro d'inscription trouvé.", adminNote: "" },
  { id: 2, type: "avis", reporter: "Fatma Trabelsi", target: "Dr. Ahmed Bouazizi", reason: "Avis suspect - possible faux avis positif", date: "19 Fév 2026", status: "pending" as string, priority: "medium", details: "3 avis 5 étoiles postés le même jour avec des comptes créés le même jour. Suspicion de manipulation.", adminNote: "" },
  { id: 3, type: "comportement", reporter: "Sami Ayari", target: "Dr. Karim Bouzid", reason: "Comportement inapproprié en consultation", date: "18 Fév 2026", status: "pending" as string, priority: "high", details: "Le patient rapporte un manque de professionnalisme et un comportement irrespectueux lors de la dernière consultation le 15 Fév.", adminNote: "" },
  { id: 4, type: "profil", reporter: "Système", target: "Pharmacie Sans Nom", reason: "Inscription incomplète - documents manquants", date: "17 Fév 2026", status: "resolved" as string, priority: "low", details: "Documents de licence pharmaceutique non fournis. Relance envoyée.", adminNote: "Documents reçus et validés le 18 Fév." },
  { id: 5, type: "avis", reporter: "Nadia Jemni", target: "Labo BioSanté", reason: "Résultats d'analyses erronés", date: "15 Fév 2026", status: "rejected" as string, priority: "medium", details: "Erreur de résultat de glycémie signalée.", adminNote: "Vérification effectuée : résultat correct, pas d'erreur du labo." },
  { id: 6, type: "contenu", reporter: "Mohamed Salah", target: "Dr. Nadia Hamdi", reason: "Photo de profil inappropriée", date: "14 Fév 2026", status: "pending" as string, priority: "low", details: "La photo de profil ne correspond pas aux critères de la plateforme.", adminNote: "" },
];

const priorityColors: Record<string, string> = { high: "bg-destructive/10 text-destructive", medium: "bg-warning/10 text-warning", low: "bg-muted text-muted-foreground" };
const priorityLabels: Record<string, string> = { high: "Urgent", medium: "Moyen", low: "Faible" };
const statusColors: Record<string, string> = { pending: "bg-warning/10 text-warning", resolved: "bg-accent/10 text-accent", rejected: "bg-muted text-muted-foreground" };
const statusLabels: Record<string, string> = { pending: "En attente", resolved: "Résolu", rejected: "Rejeté" };
const typeIcons: Record<string, string> = { profil: "👤", avis: "⭐", comportement: "⚠️", contenu: "📷" };

const AdminModeration = () => {
  const [filter, setFilter] = useState<ModerationFilter>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [reports, setReports] = useState(initialReports);
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});

  const filtered = reports.filter(r => {
    if (filter === "pending") return r.status === "pending";
    if (filter === "resolved") return r.status === "resolved";
    if (filter === "rejected") return r.status === "rejected";
    return true;
  });

  const handleResolve = (id: number) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "resolved", adminNote: noteInputs[id] || r.adminNote || "Résolu par l'administrateur." } : r));
    setExpandedId(null);
  };

  const handleReject = (id: number) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "rejected", adminNote: noteInputs[id] || r.adminNote || "Signalement rejeté après vérification." } : r));
    setExpandedId(null);
  };

  const handleSuspend = (id: number) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "resolved", adminNote: (noteInputs[id] || "") + " — Compte suspendu." } : r));
    setExpandedId(null);
  };

  const pendingCount = reports.filter(r => r.status === "pending").length;
  const highPriorityCount = reports.filter(r => r.priority === "high" && r.status === "pending").length;

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
            <p className="mt-3 text-2xl font-bold text-destructive">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">En attente</p>
          </div>
          <div className="rounded-xl border bg-destructive/5 p-5 shadow-card">
            <Shield className="h-5 w-5 text-destructive" />
            <p className="mt-3 text-2xl font-bold text-destructive">{highPriorityCount}</p>
            <p className="text-xs text-muted-foreground">Urgents à traiter</p>
          </div>
          <div className="rounded-xl border bg-accent/5 p-5 shadow-card">
            <CheckCircle className="h-5 w-5 text-accent" />
            <p className="mt-3 text-2xl font-bold text-accent">{reports.filter(r => r.status === "resolved").length}</p>
            <p className="text-xs text-muted-foreground">Résolus</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 rounded-lg border bg-card p-0.5 w-fit">
          {([
            { key: "all" as ModerationFilter, label: "Tous", count: reports.length },
            { key: "pending" as ModerationFilter, label: "En attente", count: pendingCount },
            { key: "resolved" as ModerationFilter, label: "Résolus", count: reports.filter(r => r.status === "resolved").length },
            { key: "rejected" as ModerationFilter, label: "Rejetés", count: reports.filter(r => r.status === "rejected").length },
          ]).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Reports list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Flag className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun signalement dans cette catégorie</p>
            </div>
          )}
          {filtered.map(r => (
            <div key={r.id} className={`rounded-xl border bg-card shadow-card overflow-hidden ${r.status === "pending" && r.priority === "high" ? "border-destructive/30" : ""}`}>
              <div className="p-4 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-lg ${r.priority === "high" ? "bg-destructive/10" : r.priority === "medium" ? "bg-warning/10" : "bg-muted"}`}>
                    <span className="text-lg">{typeIcons[r.type] || "🚩"}</span>
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
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${expandedId === r.id ? "rotate-180" : ""}`} />
                </div>
              </div>
              {expandedId === r.id && (
                <div className="border-t px-4 py-4 bg-muted/10 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Détails du signalement</p>
                    <p className="text-sm text-foreground">{r.details}</p>
                  </div>

                  {r.adminNote && (
                    <div className="rounded-lg bg-accent/5 border border-accent/20 p-3">
                      <p className="text-xs font-medium text-accent mb-1">Note administrateur</p>
                      <p className="text-sm text-foreground">{r.adminNote}</p>
                    </div>
                  )}

                  {r.status === "pending" && (
                    <>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Ajouter une note</p>
                        <Input
                          placeholder="Note sur la décision prise..."
                          value={noteInputs[r.id] || ""}
                          onChange={e => setNoteInputs(prev => ({ ...prev, [r.id]: e.target.value }))}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => handleResolve(r.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />Résoudre
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReject(r.id)}>
                          <XCircle className="h-4 w-4 mr-1" />Rejeter le signalement
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => handleSuspend(r.id)}>
                          <Ban className="h-4 w-4 mr-1" />Suspendre le compte
                        </Button>
                      </div>
                    </>
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
