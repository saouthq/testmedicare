import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Bell, Shield, Save, Globe, Trash2, Eye, FileCheck, CheckCircle2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { mockAssurances, mockPatientConsents } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { usePatientProfile, updatePatientProfile } from "@/stores/patientStore";

type Tab = "profile" | "notifications" | "security" | "privacy" | "consents";

const PatientSettings = () => {
  const [tab, setTab] = useState<Tab>("profile");
  const isMobile = useIsMobile();
  const [insurance, setInsurance] = useState("maghrebia");
  const [insuranceNumber, setInsuranceNumber] = useState("MAG-2024-001234");
  const [consents, setConsents] = useState(mockPatientConsents);

  const tabs = [
    { key: "profile" as Tab, label: "Profil", icon: User },
    { key: "notifications" as Tab, label: "Notifications", icon: Bell },
    { key: "security" as Tab, label: "Sécurité", icon: Shield },
    { key: "privacy" as Tab, label: "Confidentialité", icon: Eye },
    { key: "consents" as Tab, label: "Consentements", icon: FileCheck },
  ];

  const handleSave = () => {
    toast({ title: "Paramètres enregistrés", description: "Vos modifications ont été sauvegardées." });
  };

  return (
    <DashboardLayout role="patient" title="Paramètres">
      <div className="max-w-4xl space-y-6">
        {/* Tab selector: select on mobile, chips on desktop */}
        {isMobile ? (
          <select
            value={tab}
            onChange={e => setTab(e.target.value as Tab)}
            className="w-full rounded-xl border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-card"
          >
            {tabs.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        ) : (
          <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <t.icon className="h-4 w-4" />{t.label}
              </button>
            ))}
          </div>
        )}

        {tab === "profile" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Informations personnelles</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Prénom</Label><Input defaultValue="Amine" className="mt-1" /></div>
                <div><Label>Nom</Label><Input defaultValue="Ben Ali" className="mt-1" /></div>
                <div><Label>Email</Label><Input defaultValue="amine@email.tn" className="mt-1" /></div>
                <div><Label>Téléphone</Label><Input defaultValue="+216 22 345 678" className="mt-1" /></div>
                <div><Label>Date de naissance</Label><Input type="date" defaultValue="1991-03-15" className="mt-1" /></div>
                <div><Label>Gouvernorat</Label>
                  <select className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option>Tunis</option><option>Ariana</option><option>Ben Arous</option><option>Manouba</option><option>Sousse</option><option>Sfax</option>
                  </select>
                </div>
                <div className="sm:col-span-2"><Label>Adresse</Label><Input defaultValue="El Manar, Tunis" className="mt-1" /></div>
              </div>
            </div>
            
            <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Informations médicales</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Assurance</Label>
                  <select 
                    value={insurance} 
                    onChange={e => setInsurance(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  >
                    {mockAssurances.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>N° d'assuré <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                  <Input 
                    value={insuranceNumber} 
                    onChange={e => setInsuranceNumber(e.target.value)}
                    placeholder="Numéro d'assuré" 
                    className="mt-1"
                    disabled={insurance === "none"} 
                  />
                </div>
                <div><Label>Groupe sanguin</Label>
                  <select className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                  </select>
                </div>
                <div><Label>Allergies connues</Label><Input defaultValue="Pénicilline" className="mt-1" /></div>
                <div className="sm:col-span-2"><Label>Médecin traitant</Label><Input defaultValue="Dr. Ahmed Bouazizi" className="mt-1" /></div>
              </div>
            </div>
            <Button onClick={handleSave} className="gradient-primary text-primary-foreground shadow-primary-glow"><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {tab === "notifications" && (
          <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Préférences de notification</h3>
            <div className="space-y-4">
              {[
                { label: "Rappel de rendez-vous", desc: "Recevoir un rappel avant chaque RDV" },
                { label: "Résultats d'analyses", desc: "Notification quand vos résultats sont disponibles" },
                { label: "Nouvelles ordonnances", desc: "Alerte quand une ordonnance est émise" },
                { label: "Ordonnance prête", desc: "Notification quand une pharmacie confirme la disponibilité" },
                { label: "Feuille de soins", desc: "Notification quand une feuille de soins est disponible" },
                { label: "Messages du médecin", desc: "Notification pour chaque message reçu" },
              ].map((n, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b last:border-0">
                  <div><p className="text-sm font-medium text-foreground">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><input type="checkbox" defaultChecked className="rounded border-input" />Email</label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><input type="checkbox" defaultChecked className="rounded border-input" />SMS</label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><input type="checkbox" defaultChecked className="rounded border-input" />Push</label>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={handleSave} className="mt-6 gradient-primary text-primary-foreground shadow-primary-glow"><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Changer le mot de passe</h3>
              <div className="max-w-md space-y-4">
                <div><Label>Mot de passe actuel</Label><Input type="password" className="mt-1" /></div>
                <div><Label>Nouveau mot de passe</Label><Input type="password" className="mt-1" /></div>
                <div><Label>Confirmer</Label><Input type="password" className="mt-1" /></div>
                <Button className="gradient-primary text-primary-foreground shadow-primary-glow">Changer le mot de passe</Button>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Double authentification</h3>
              <p className="text-sm text-muted-foreground mb-4">Ajoutez une couche de sécurité à votre compte.</p>
              <Button variant="outline">Activer la 2FA</Button>
            </div>
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:p-6">
              <h3 className="font-semibold text-destructive mb-2">Zone dangereuse</h3>
              <p className="text-sm text-muted-foreground mb-4">Supprimer votre compte et toutes vos données. Cette action est irréversible.</p>
              <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-2" />Supprimer mon compte</Button>
            </div>
          </div>
        )}

        {tab === "privacy" && (
          <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Confidentialité des données</h3>
            <div className="space-y-4">
              {[
                { label: "Partage du dossier médical", desc: "Autoriser les médecins à consulter votre historique", checked: true },
                { label: "Résultats d'analyses", desc: "Partager automatiquement les résultats avec votre médecin traitant", checked: true },
                { label: "Données de localisation", desc: "Utiliser votre position pour trouver des médecins proches", checked: false },
                { label: "Statistiques anonymes", desc: "Contribuer aux statistiques de santé publique (anonymisé)", checked: true },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0 gap-3">
                  <div className="min-w-0"><p className="text-sm font-medium text-foreground">{p.label}</p><p className="text-xs text-muted-foreground">{p.desc}</p></div>
                  <input type="checkbox" defaultChecked={p.checked} className="rounded border-input h-5 w-5 shrink-0" />
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t">
              <Button variant="outline" size="sm"><Globe className="h-4 w-4 mr-2" />Télécharger mes données (RGPD)</Button>
            </div>
          </div>
        )}

        {tab === "consents" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-2">Consentements</h3>
              <p className="text-sm text-muted-foreground mb-4">Gérez vos autorisations de partage de données médicales.</p>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between py-3 border-b gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Partage d'ordonnances avec les pharmacies</p>
                    <p className="text-xs text-muted-foreground">Permet aux pharmacies de préparer vos médicaments à l'avance.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={consents.shareWithPharmacy} 
                    onChange={e => setConsents(prev => ({ ...prev, shareWithPharmacy: e.target.checked }))}
                    className="rounded border-input h-5 w-5 shrink-0 mt-1" 
                  />
                </div>

                <div className="flex items-start justify-between py-3 border-b gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Accès aux résultats de laboratoire</p>
                    <p className="text-xs text-muted-foreground">Vos résultats d'analyses seront automatiquement ajoutés à votre dossier.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={consents.shareLabResults} 
                    onChange={e => setConsents(prev => ({ ...prev, shareLabResults: e.target.checked }))}
                    className="rounded border-input h-5 w-5 shrink-0 mt-1" 
                  />
                </div>

                <div className="flex items-start justify-between py-3 border-b gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Partage du dossier médical</p>
                    <p className="text-xs text-muted-foreground">Permet aux médecins consultés d'accéder à votre historique médical complet.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={consents.shareMedicalRecord} 
                    onChange={e => setConsents(prev => ({ ...prev, shareMedicalRecord: e.target.checked }))}
                    className="rounded border-input h-5 w-5 shrink-0 mt-1" 
                  />
                </div>

                <div className="flex items-start justify-between py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Communications promotionnelles</p>
                    <p className="text-xs text-muted-foreground">Recevoir des offres et informations santé de nos partenaires.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={consents.receivePromotions} 
                    onChange={e => setConsents(prev => ({ ...prev, receivePromotions: e.target.checked }))}
                    className="rounded border-input h-5 w-5 shrink-0 mt-1" 
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-accent/5 border border-accent/20 p-4">
              <p className="text-sm font-medium text-accent flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Vos droits</p>
              <p className="text-xs text-muted-foreground mt-1">Vous pouvez à tout moment retirer votre consentement. Cela n'affectera pas les traitements de données déjà effectués.</p>
            </div>

            <Button onClick={handleSave} className="gradient-primary text-primary-foreground shadow-primary-glow"><Save className="h-4 w-4 mr-2" />Enregistrer les consentements</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientSettings;
