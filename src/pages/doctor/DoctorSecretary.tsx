import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { UserPlus, Users, Mail, Phone, Clock, MoreVertical, CheckCircle, XCircle, Edit, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const secretaries = [
  { id: 1, name: "Leila Hammami", email: "leila@cabinet-bouazizi.tn", phone: "+216 71 234 568", status: "active", since: "Jan 2025", lastLogin: "Aujourd'hui 08:30", permissions: ["agenda", "patients", "facturation", "documents"] },
  { id: 2, name: "Sara Jelassi", email: "sara@cabinet-bouazizi.tn", phone: "+216 55 987 654", status: "active", since: "Mar 2025", lastLogin: "Hier 17:45", permissions: ["agenda", "patients"] },
];

const DoctorSecretary = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["agenda", "patients"]);

  const allPermissions = [
    { key: "agenda", label: "Gestion agenda", desc: "Voir, créer et modifier les RDV" },
    { key: "patients", label: "Fiches patients", desc: "Consulter et modifier les fiches" },
    { key: "facturation", label: "Facturation", desc: "Créer et gérer les factures" },
    { key: "documents", label: "Documents", desc: "Accéder aux documents médicaux" },
    { key: "messages", label: "Messagerie", desc: "Gérer les messages du cabinet" },
  ];

  const togglePermission = (key: string) => {
    setSelectedPermissions(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };

  return (
    <DashboardLayout role="doctor" title="Gestion des secrétaires">
      <div className="max-w-4xl space-y-6">
        {/* Info banner */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Gestion exclusive par le médecin</p>
              <p className="text-xs text-muted-foreground mt-0.5">Vous seul pouvez créer et gérer les comptes secrétaires de votre cabinet. Les secrétaires ne peuvent pas s'inscrire directement sur la plateforme.</p>
            </div>
          </div>
        </div>

        {/* Existing secretaries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Mes secrétaires ({secretaries.length})</h3>
            <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setShowForm(!showForm)}>
              <UserPlus className="h-4 w-4 mr-1" />Ajouter une secrétaire
            </Button>
          </div>

          <div className="space-y-3">
            {secretaries.map(s => (
              <div key={s.id} className="rounded-xl border bg-card p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {s.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{s.name}</h4>
                        <span className="text-[10px] font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full">Active</span>
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
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground border-t pt-3">
                  <span>Depuis {s.since}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Dernière connexion : {s.lastLogin}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Créer un compte secrétaire</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Prénom</Label><Input value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="Leila" className="mt-1" /></div>
              <div><Label>Nom</Label><Input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="Hammami" className="mt-1" /></div>
              <div><Label>Email professionnel</Label><Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="leila@cabinet.tn" className="mt-1" /></div>
              <div><Label>Téléphone</Label><Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+216 XX XXX XXX" className="mt-1" /></div>
            </div>

            <div className="mt-6">
              <Label>Permissions</Label>
              <div className="grid gap-2 sm:grid-cols-2 mt-2">
                {allPermissions.map(p => (
                  <label key={p.key} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${selectedPermissions.includes(p.key) ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                    <input type="checkbox" checked={selectedPermissions.includes(p.key)} onChange={() => togglePermission(p.key)} className="mt-0.5 rounded border-input" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button className="gradient-primary text-primary-foreground"><UserPlus className="h-4 w-4 mr-1" />Créer le compte</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Un email d'invitation sera envoyé à la secrétaire avec ses identifiants de connexion.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorSecretary;
