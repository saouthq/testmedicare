import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { UserCircle, Mail, Phone, MapPin, Calendar, Shield, Edit, Save, CheckCircle, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PatientProfile = () => {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "Amine", lastName: "Ben Ali", email: "amine.benali@email.tn",
    phone: "+216 22 345 678", address: "El Manar, Tunis", birthdate: "15/03/1991",
    bloodType: "A+", allergies: "Pénicilline", treatingDoctor: "Dr. Ahmed Bouazizi",
    cnamId: "12345678", gender: "Homme",
  });

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout role="patient" title="Mon profil">
      <div className="max-w-3xl space-y-6">
        {saved && (
          <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-accent" />
            <span className="text-sm text-accent font-medium">Profil mis à jour avec succès</span>
          </div>
        )}

        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shrink-0">AB</div>
              {editing && (
                <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  {editing ? (
                    <div className="flex gap-2">
                      <Input value={profile.firstName} onChange={e => setProfile(p => ({...p, firstName: e.target.value}))} className="h-9 w-32" />
                      <Input value={profile.lastName} onChange={e => setProfile(p => ({...p, lastName: e.target.value}))} className="h-9 w-32" />
                    </div>
                  ) : (
                    <h2 className="text-xl font-bold text-foreground">{profile.firstName} {profile.lastName}</h2>
                  )}
                  <p className="text-muted-foreground text-sm mt-1">Patient depuis janvier 2024</p>
                </div>
                {editing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(false)}><X className="h-4 w-4 mr-1" />Annuler</Button>
                    <Button size="sm" className="gradient-primary text-primary-foreground" onClick={handleSave}><Save className="h-4 w-4 mr-1" />Sauvegarder</Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit className="h-4 w-4 mr-2" />Modifier</Button>
                )}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {editing ? (
                  <>
                    <div><Label className="text-xs">Email</Label><Input value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))} className="mt-1" /></div>
                    <div><Label className="text-xs">Téléphone</Label><Input value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))} className="mt-1" /></div>
                    <div><Label className="text-xs">Adresse</Label><Input value={profile.address} onChange={e => setProfile(p => ({...p, address: e.target.value}))} className="mt-1" /></div>
                    <div><Label className="text-xs">Date de naissance</Label><Input value={profile.birthdate} onChange={e => setProfile(p => ({...p, birthdate: e.target.value}))} className="mt-1" /></div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{profile.email}</span></div>
                    <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{profile.phone}</span></div>
                    <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{profile.address}</span></div>
                    <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">Né le {profile.birthdate}</span></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Informations médicales</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {editing ? (
              <>
                <div><Label className="text-xs">Groupe sanguin</Label><Input value={profile.bloodType} onChange={e => setProfile(p => ({...p, bloodType: e.target.value}))} className="mt-1" /></div>
                <div><Label className="text-xs">Allergies</Label><Input value={profile.allergies} onChange={e => setProfile(p => ({...p, allergies: e.target.value}))} className="mt-1" /></div>
                <div><Label className="text-xs">Médecin traitant</Label><Input value={profile.treatingDoctor} disabled className="mt-1 bg-muted/50" /></div>
                <div><Label className="text-xs">N° CNAM</Label><Input value={profile.cnamId} onChange={e => setProfile(p => ({...p, cnamId: e.target.value}))} className="mt-1" /></div>
              </>
            ) : (
              <>
                <div className="rounded-lg bg-muted/50 p-4"><p className="text-sm text-muted-foreground">Groupe sanguin</p><p className="font-medium text-foreground mt-1">{profile.bloodType}</p></div>
                <div className="rounded-lg bg-muted/50 p-4"><p className="text-sm text-muted-foreground">Allergies</p><p className="font-medium text-foreground mt-1">{profile.allergies}</p></div>
                <div className="rounded-lg bg-muted/50 p-4"><p className="text-sm text-muted-foreground">Médecin traitant</p><p className="font-medium text-foreground mt-1">{profile.treatingDoctor}</p></div>
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <p className="text-sm text-primary font-medium flex items-center gap-1"><Shield className="h-4 w-4" />Assurance CNAM</p>
                  <p className="font-medium text-foreground mt-1">N° Assuré : {profile.cnamId}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Sécurité du compte</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div><p className="font-medium text-foreground">Mot de passe</p><p className="text-sm text-muted-foreground">Dernière modification il y a 3 mois</p></div>
              <Button variant="outline" size="sm">Changer</Button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div><p className="font-medium text-foreground">Double authentification</p><p className="text-sm text-muted-foreground">Non activée</p></div>
              <Button variant="outline" size="sm">Activer</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientProfile;
