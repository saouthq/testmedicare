/**
 * DoctorSecretary — Gestion des secrétaires du cabinet.
 *
 * Workflow : Invitation → Activation → Suspension/Réactivation
 * Tous les handlers sont balisés // TODO BACKEND pour intégration future.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import FeatureGate from "@/components/shared/FeatureGate";
import {
  UserPlus, Mail, Phone, Clock, Edit, Shield,
  CheckCircle2, PauseCircle, PlayCircle, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

/* ── Types ── */
type SecretaryStatus = "invited" | "active" | "suspended";

interface Secretary {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: SecretaryStatus;
  since: string;
  lastLogin: string | null;
  permissions: string[];
}

/* ── Mock initial data ── */
const initialSecretaries: Secretary[] = [
  {
    id: 1, name: "Leila Hammami", email: "leila@cabinet-bouazizi.tn",
    phone: "+216 71 234 568", status: "active", since: "Jan 2025",
    lastLogin: "Aujourd'hui 08:30",
    permissions: ["agenda", "patients", "facturation", "documents"],
  },
  {
    id: 2, name: "Sara Jelassi", email: "sara@cabinet-bouazizi.tn",
    phone: "+216 55 987 654", status: "active", since: "Mar 2025",
    lastLogin: "Hier 17:45",
    permissions: ["agenda", "patients"],
  },
];

/* ── Permissions disponibles ── */
const allPermissions = [
  { key: "agenda", label: "Gestion agenda", desc: "Voir, créer et modifier les RDV" },
  { key: "patients", label: "Fiches patients", desc: "Consulter et modifier les fiches" },
  { key: "facturation", label: "Facturation", desc: "Créer et gérer les factures" },
  { key: "documents", label: "Documents", desc: "Accéder aux documents médicaux" },
  { key: "messages", label: "Messagerie", desc: "Gérer les messages du cabinet" },
];

/* ── Status badge config ── */
const statusBadge: Record<SecretaryStatus, { label: string; className: string }> = {
  invited:   { label: "Invitée",    className: "bg-warning/10 text-warning" },
  active:    { label: "Active",     className: "bg-accent/10 text-accent" },
  suspended: { label: "Suspendue",  className: "bg-destructive/10 text-destructive" },
};

const DoctorSecretary = () => {
  const [secretaries, setSecretaries] = useState<Secretary[]>(initialSecretaries);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["agenda", "patients"]);

  // ConfirmDialog state
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: "danger" | "warning" | "default";
    confirmLabel: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", variant: "default", confirmLabel: "Confirmer", onConfirm: () => {} });

  const togglePermission = (key: string) => {
    setSelectedPermissions(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  /* ── Handlers ── */

  const handleAddSecretary = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({ title: "Champs requis", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }
    // TODO BACKEND: POST /api/secretary/invite — envoyer invitation par email
    const newSecretary: Secretary = {
      id: Date.now(),
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      status: "invited",
      since: new Date().toLocaleDateString("fr-FR", { month: "short", year: "numeric" }),
      lastLogin: null,
      permissions: selectedPermissions,
    };
    setSecretaries(prev => [...prev, newSecretary]);
    setShowForm(false);
    setFormData({ firstName: "", lastName: "", email: "", phone: "" });
    setSelectedPermissions(["agenda", "patients"]);
    toast({ title: "Invitation envoyée", description: `Un email d'invitation a été envoyé à ${newSecretary.email}.` });
  };

  const handleActivate = (id: number) => {
    // TODO BACKEND: PATCH /api/secretary/{id}/activate
    setSecretaries(prev => prev.map(s => s.id === id ? { ...s, status: "active" as const } : s));
    toast({ title: "Compte activé", description: "La secrétaire peut maintenant accéder à la plateforme." });
  };

  const handleSuspend = (id: number) => {
    const sec = secretaries.find(s => s.id === id);
    setConfirmAction({
      open: true,
      title: "Suspendre le compte",
      description: `Voulez-vous suspendre le compte de ${sec?.name} ? Elle ne pourra plus accéder à la plateforme.`,
      variant: "warning",
      confirmLabel: "Suspendre",
      onConfirm: () => {
        // TODO BACKEND: PATCH /api/secretary/{id}/suspend
        setSecretaries(prev => prev.map(s => s.id === id ? { ...s, status: "suspended" as const } : s));
        toast({ title: "Compte suspendu", description: `${sec?.name} ne peut plus accéder à la plateforme.` });
        setConfirmAction(prev => ({ ...prev, open: false }));
      },
    });
  };

  const handleReactivate = (id: number) => {
    // TODO BACKEND: PATCH /api/secretary/{id}/reactivate
    setSecretaries(prev => prev.map(s => s.id === id ? { ...s, status: "active" as const } : s));
    toast({ title: "Compte réactivé", description: "La secrétaire peut à nouveau accéder à la plateforme." });
  };

  const handleDelete = (id: number) => {
    const sec = secretaries.find(s => s.id === id);
    setConfirmAction({
      open: true,
      title: "Supprimer le compte",
      description: `Supprimer définitivement le compte de ${sec?.name} ? Cette action est irréversible.`,
      variant: "danger",
      confirmLabel: "Supprimer",
      onConfirm: () => {
        // TODO BACKEND: DELETE /api/secretary/{id}
        setSecretaries(prev => prev.filter(s => s.id !== id));
        toast({ title: "Compte supprimé", description: `Le compte de ${sec?.name} a été supprimé.` });
        setConfirmAction(prev => ({ ...prev, open: false }));
      },
    });
  };

  return (
    <DashboardLayout role="doctor" title="Gestion des secrétaires">
      <FeatureGate featureId="shared_secretary">
      <div className="max-w-4xl space-y-6">
        {/* Info banner */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Gestion exclusive par le médecin</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Vous seul pouvez créer et gérer les comptes secrétaires de votre cabinet.
                Les secrétaires ne peuvent pas s'inscrire directement sur la plateforme.
              </p>
            </div>
          </div>
        </div>

        {/* Liste des secrétaires */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Mes secrétaires ({secretaries.length})</h3>
            <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setShowForm(!showForm)}>
              <UserPlus className="h-4 w-4 mr-1" />Ajouter une secrétaire
            </Button>
          </div>

          <div className="space-y-3">
            {secretaries.map(s => {
              const badge = statusBadge[s.status];
              return (
                <div key={s.id} className="rounded-xl border bg-card p-5 shadow-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {s.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{s.name}</h4>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {s.permissions.map(p => (
                            <span key={p} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{p}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Actions contextuelles */}
                    <div className="flex gap-1">
                      {s.status === "invited" && (
                        <Button variant="outline" size="sm" className="h-8 text-xs text-accent" onClick={() => handleActivate(s.id)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Activer
                        </Button>
                      )}
                      {s.status === "active" && (
                        <Button variant="outline" size="sm" className="h-8 text-xs text-warning" onClick={() => handleSuspend(s.id)}>
                          <PauseCircle className="h-3.5 w-3.5 mr-1" />Suspendre
                        </Button>
                      )}
                      {s.status === "suspended" && (
                        <Button variant="outline" size="sm" className="h-8 text-xs text-accent" onClick={() => handleReactivate(s.id)}>
                          <PlayCircle className="h-3.5 w-3.5 mr-1" />Réactiver
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground border-t pt-3">
                    <span>Depuis {s.since}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {s.lastLogin ? `Dernière connexion : ${s.lastLogin}` : "Aucune connexion"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulaire d'ajout */}
        {showForm && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Créer un compte secrétaire</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Prénom</Label>
                <Input value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="Leila" className="mt-1" />
              </div>
              <div>
                <Label>Nom</Label>
                <Input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="Hammami" className="mt-1" />
              </div>
              <div>
                <Label>Email professionnel</Label>
                <Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="leila@cabinet.tn" className="mt-1" />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+216 XX XXX XXX" className="mt-1" />
              </div>
            </div>

            <div className="mt-6">
              <Label>Permissions</Label>
              <div className="grid gap-2 sm:grid-cols-2 mt-2">
                {allPermissions.map(p => (
                  <label
                    key={p.key}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      selectedPermissions.includes(p.key) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(p.key)}
                      onChange={() => togglePermission(p.key)}
                      className="mt-0.5 rounded border-input"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button className="gradient-primary text-primary-foreground" onClick={handleAddSecretary}>
                <UserPlus className="h-4 w-4 mr-1" />Créer le compte
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Un email d'invitation sera envoyé à la secrétaire avec ses identifiants de connexion.
            </p>
          </div>
        )}
      </div>

      {/* ConfirmDialog pour actions destructives */}
      <ConfirmDialog
        open={confirmAction.open}
        onConfirm={confirmAction.onConfirm}
        onCancel={() => setConfirmAction(prev => ({ ...prev, open: false }))}
        title={confirmAction.title}
        description={confirmAction.description}
        variant={confirmAction.variant}
        confirmLabel={confirmAction.confirmLabel}
      />
    </DashboardLayout>
  );
};

export default DoctorSecretary;
