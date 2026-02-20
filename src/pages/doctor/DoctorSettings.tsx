import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Clock, Bell, Shield, Save } from "lucide-react";

type Tab = "profile" | "availability" | "notifications" | "security";
const weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const DoctorSettings = () => {
  const [tab, setTab] = useState<Tab>("profile");
  const [availability, setAvailability] = useState<Record<string, { active: boolean; start: string; end: string; breakStart: string; breakEnd: string }>>({
    Lundi: { active: true, start: "08:00", end: "18:00", breakStart: "12:00", breakEnd: "14:00" },
    Mardi: { active: true, start: "08:00", end: "18:00", breakStart: "12:00", breakEnd: "14:00" },
    Mercredi: { active: true, start: "08:00", end: "12:00", breakStart: "", breakEnd: "" },
    Jeudi: { active: true, start: "08:00", end: "18:00", breakStart: "12:00", breakEnd: "14:00" },
    Vendredi: { active: true, start: "08:00", end: "17:00", breakStart: "12:00", breakEnd: "14:00" },
    Samedi: { active: false, start: "08:00", end: "12:00", breakStart: "", breakEnd: "" },
  });

  const tabs = [
    { key: "profile" as Tab, label: "Profil", icon: User },
    { key: "availability" as Tab, label: "Disponibilités", icon: Clock },
    { key: "notifications" as Tab, label: "Notifications", icon: Bell },
    { key: "security" as Tab, label: "Sécurité", icon: Shield },
  ];

  return (
    <DashboardLayout role="doctor" title="Paramètres">
      <div className="max-w-4xl space-y-6">
        <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Informations personnelles</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Prénom</Label><Input defaultValue="Ahmed" className="mt-1" /></div>
                <div><Label>Nom</Label><Input defaultValue="Bouazizi" className="mt-1" /></div>
                <div><Label>Email</Label><Input defaultValue="ahmed.bouazizi@mediconnect.tn" className="mt-1" /></div>
                <div><Label>Téléphone</Label><Input defaultValue="+216 71 234 567" className="mt-1" /></div>
                <div className="sm:col-span-2"><Label>Adresse du cabinet</Label><Input defaultValue="15 Av. de la Liberté, El Manar, 2092 Tunis" className="mt-1" /></div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Informations professionnelles</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Spécialité</Label><Input defaultValue="Médecin généraliste" className="mt-1" /></div>
                <div><Label>N° Ordre des Médecins</Label><Input defaultValue="TN-10101010" className="mt-1" /></div>
                <div><Label>Convention CNAM</Label><select className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"><option>Conventionné Secteur 1</option><option>Conventionné Secteur 2</option><option>Non conventionné</option></select></div>
                <div><Label>Tarif consultation (DT)</Label><Input defaultValue="35" className="mt-1" type="number" /></div>
                <div className="sm:col-span-2"><Label>Présentation</Label><textarea defaultValue="Médecin généraliste diplômé de la Faculté de Médecine de Tunis. Conventionné CNAM." rows={3} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" /></div>
                <div><Label>Durée de consultation (min)</Label><Input defaultValue="30" className="mt-1" type="number" /></div>
                <div><Label>Langues parlées</Label><Input defaultValue="Français, Arabe" className="mt-1" /></div>
              </div>
            </div>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow"><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {tab === "availability" && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Horaires d'ouverture</h3>
            <div className="space-y-4">
              {weekDays.map(day => {
                const d = availability[day];
                return (
                  <div key={day} className={`rounded-lg border p-4 transition-colors ${d.active ? "bg-card" : "bg-muted/50"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={d.active} onChange={() => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], active: !prev[day].active } }))} className="rounded border-input" />
                        <span className={`text-sm font-medium ${d.active ? "text-foreground" : "text-muted-foreground"}`}>{day}</span>
                      </label>
                      {!d.active && <span className="text-xs text-muted-foreground">Fermé</span>}
                    </div>
                    {d.active && (
                      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                        <div><Label className="text-xs">Début</Label><Input type="time" value={d.start} onChange={e => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], start: e.target.value } }))} className="mt-1" /></div>
                        <div><Label className="text-xs">Fin</Label><Input type="time" value={d.end} onChange={e => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], end: e.target.value } }))} className="mt-1" /></div>
                        <div><Label className="text-xs">Pause début</Label><Input type="time" value={d.breakStart} onChange={e => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], breakStart: e.target.value } }))} className="mt-1" /></div>
                        <div><Label className="text-xs">Pause fin</Label><Input type="time" value={d.breakEnd} onChange={e => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], breakEnd: e.target.value } }))} className="mt-1" /></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <Button className="mt-6 gradient-primary text-primary-foreground shadow-primary-glow"><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {tab === "notifications" && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Préférences de notification</h3>
            <div className="space-y-4">
              {[
                { label: "Nouveau rendez-vous", desc: "Recevoir une notification à chaque nouveau RDV" },
                { label: "Annulation de RDV", desc: "Être notifié quand un patient annule" },
                { label: "Résultats d'analyses", desc: "Notification quand de nouveaux résultats sont disponibles" },
                { label: "Messages patients", desc: "Recevoir une alerte pour chaque nouveau message" },
                { label: "Rappel planning", desc: "Rappel quotidien du planning du jour" },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div><p className="text-sm font-medium text-foreground">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><input type="checkbox" defaultChecked className="rounded border-input" />Email</label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><input type="checkbox" defaultChecked className="rounded border-input" />SMS</label>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-6 gradient-primary text-primary-foreground shadow-primary-glow"><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Changer le mot de passe</h3>
              <div className="max-w-md space-y-4">
                <div><Label>Mot de passe actuel</Label><Input type="password" className="mt-1" /></div>
                <div><Label>Nouveau mot de passe</Label><Input type="password" className="mt-1" /></div>
                <div><Label>Confirmer le nouveau mot de passe</Label><Input type="password" className="mt-1" /></div>
                <Button className="gradient-primary text-primary-foreground shadow-primary-glow">Changer le mot de passe</Button>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Double authentification</h3>
              <p className="text-sm text-muted-foreground mb-4">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
              <Button variant="outline">Activer la 2FA</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorSettings;
