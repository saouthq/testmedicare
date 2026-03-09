import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const ClinicSettings = () => {
  const [name, setName] = useState("Clinique El Manar");
  const [phone, setPhone] = useState("+216 71 960 000");
  const [onlineBooking, setOnlineBooking] = useState(true);
  const [smsReminders, setSmsReminders] = useState(true);

  return (
    <DashboardLayout role="clinic" title="Paramètres">
      <div className="max-w-2xl space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-sm">Informations clinique</h2>
          <div><Label>Nom</Label><Input value={name} onChange={e => setName(e.target.value)} className="mt-1" /></div>
          <div><Label>Téléphone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" /></div>
          <Button size="sm" onClick={() => toast({ title: "Paramètres enregistrés" })}>Enregistrer</Button>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-sm">Fonctionnalités</h2>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Réservation en ligne</p><p className="text-xs text-muted-foreground">Permettre aux patients de réserver en ligne</p></div>
            <Switch checked={onlineBooking} onCheckedChange={v => { setOnlineBooking(v); toast({ title: v ? "Réservation en ligne activée" : "Réservation en ligne désactivée" }); }} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Rappels SMS</p><p className="text-xs text-muted-foreground">Envoyer des rappels aux patients avant le RDV</p></div>
            <Switch checked={smsReminders} onCheckedChange={v => { setSmsReminders(v); toast({ title: v ? "Rappels SMS activés" : "Rappels SMS désactivés" }); }} />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClinicSettings;
