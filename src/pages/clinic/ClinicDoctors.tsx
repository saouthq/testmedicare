import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockClinicDoctors, type ClinicDoctor } from "@/data/mocks/clinic";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus, Phone, Clock, Users } from "lucide-react";

const ClinicDoctors = () => {
  const [doctors, setDoctors] = useState(mockClinicDoctors);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", specialty: "", phone: "", schedule: "" });

  const addDoctor = () => {
    if (!form.name.trim()) return;
    const doc: ClinicDoctor = {
      id: `cd-${Date.now()}`, name: form.name, specialty: form.specialty || "Médecine Générale",
      available: true, schedule: form.schedule || "8h-16h", phone: form.phone || "—", consultationsToday: 0,
    };
    setDoctors(prev => [...prev, doc]);
    setDialogOpen(false);
    setForm({ name: "", specialty: "", phone: "", schedule: "" });
    toast({ title: "Médecin ajouté", description: doc.name });
  };

  const toggleAvailability = (id: string) => {
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, available: !d.available } : d));
    toast({ title: "Disponibilité mise à jour" });
  };

  return (
    <DashboardLayout role="clinic" title="Médecins">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{doctors.length} médecins · {doctors.filter(d => d.available).length} disponibles</p>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map(d => (
            <Card key={d.id} className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{d.name}</h3>
                <Badge variant={d.available ? "secondary" : "outline"} className="text-[10px]">{d.available ? "Disponible" : "Absent"}</Badge>
              </div>
              <p className="text-xs text-primary">{d.specialty}</p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{d.schedule}</div>
                <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{d.phone}</div>
                <div className="flex items-center gap-1.5"><Users className="h-3 w-3" />{d.consultationsToday} consultations aujourd'hui</div>
              </div>
              <Button variant="ghost" size="sm" className="mt-3 w-full text-xs" onClick={() => toggleAvailability(d.id)}>
                {d.available ? "Marquer absent" : "Marquer disponible"}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Nouveau médecin</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label>Nom</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Dr. ..." className="mt-1" /></div>
            <div><Label>Spécialité</Label><Input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} placeholder="Cardiologie" className="mt-1" /></div>
            <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" /></div>
            <div><Label>Horaires</Label><Input value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))} placeholder="8h-16h" className="mt-1" /></div>
            <Button onClick={addDoctor} className="w-full">Ajouter</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ClinicDoctors;
