import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const HospitalSettings = () => {
  const [name, setName] = useState("Hôpital Charles Nicolle");
  const [phone, setPhone] = useState("+216 71 578 000");
  const [emergencyOpen, setEmergencyOpen] = useState(true);
  const [visitsAllowed, setVisitsAllowed] = useState(true);

  return (
    <DashboardLayout role="hospital" title="Paramètres">
      <div className="max-w-2xl space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-sm">Informations générales</h2>
          <div><Label>Nom de l'établissement</Label><Input value={name} onChange={e => setName(e.target.value)} className="mt-1" /></div>
          <div><Label>Téléphone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" /></div>
          <Button size="sm" onClick={() => toast({ title: "Paramètres enregistrés" })}>Enregistrer</Button>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-sm">Opérations</h2>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Urgences ouvertes</p><p className="text-xs text-muted-foreground">Activer la réception des urgences</p></div>
            <Switch checked={emergencyOpen} onCheckedChange={v => { setEmergencyOpen(v); toast({ title: v ? "Urgences ouvertes" : "Urgences fermées" }); }} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Visites autorisées</p><p className="text-xs text-muted-foreground">Autoriser les visites aux patients hospitalisés</p></div>
            <Switch checked={visitsAllowed} onCheckedChange={v => { setVisitsAllowed(v); toast({ title: v ? "Visites autorisées" : "Visites suspendues" }); }} />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HospitalSettings;
