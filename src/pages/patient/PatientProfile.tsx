import DashboardLayout from "@/components/layout/DashboardLayout";
import { UserCircle, Mail, Phone, MapPin, Calendar, Shield, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

const PatientProfile = () => {
  return (
    <DashboardLayout role="patient" title="Mon profil">
      <div className="max-w-3xl space-y-6">
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shrink-0">AB</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Amine Ben Ali</h2>
                  <p className="text-muted-foreground">Patient depuis janvier 2024</p>
                </div>
                <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-2" />Modifier</Button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">amine.benali@email.tn</span></div>
                <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">+216 71 234 567</span></div>
                <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">El Manar, Tunis</span></div>
                <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">Né le 15/03/1991</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Informations médicales</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/50 p-4"><p className="text-sm text-muted-foreground">Groupe sanguin</p><p className="font-medium text-foreground mt-1">A+</p></div>
            <div className="rounded-lg bg-muted/50 p-4"><p className="text-sm text-muted-foreground">Allergies</p><p className="font-medium text-foreground mt-1">Pénicilline</p></div>
            <div className="rounded-lg bg-muted/50 p-4"><p className="text-sm text-muted-foreground">Médecin traitant</p><p className="font-medium text-foreground mt-1">Dr. Ahmed Bouazizi</p></div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm text-primary font-medium flex items-center gap-1"><Shield className="h-4 w-4" />Assurance CNAM</p>
              <p className="font-medium text-foreground mt-1">N° Assuré : 12345678</p>
            </div>
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
